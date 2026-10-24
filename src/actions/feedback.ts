"use server";

import { db } from "@/db";
import { 
  trainers, 
  projects, 
  projectTrainers, 
  feedbackQuestions, 
  feedbackResponses, 
  feedbackAnswers,
  systemSettings 
} from "@/db/schema";
import { eq, and, isNull, asc, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { SubmitFeedbackSchema, type SubmitFeedbackInput } from "@/lib/validations/feedback";
import type { QrFormConfig } from "./settings";

/**
 * Fetch trainer and form questions for public feedback by QR token.
 */
export async function getTrainerFeedbackContext(qrToken: string) {
  // 1. Fetch trainer by QR token
  const trainer = await db.query.trainers.findFirst({
    where: and(eq(trainers.qrToken, qrToken), isNull(trainers.deletedAt)),
    with: {
      skills: {
        with: {
          subject: true,
        },
      },
    },
  });

  if (!trainer) {
    return { status: "not_found" as const };
  }

  if (!trainer.isActive || !trainer.qrActive) {
    return { 
      status: "inactive" as const, 
      trainerName: trainer.fullName,
      trainerCode: trainer.trainerCode 
    };
  }

  // 2. Fetch active questions
  const questions = await db.query.feedbackQuestions.findMany({
    where: eq(feedbackQuestions.isActive, true),
    orderBy: [asc(feedbackQuestions.displayOrder)],
  });

  // 3. Fetch recent / active projects for this trainer
  const trainerProjects = await db
    .select({
      id: projects.id,
      projectName: projects.projectName,
      place: projects.place,
      status: projects.status,
    })
    .from(projectTrainers)
    .innerJoin(projects, eq(projectTrainers.projectId, projects.id))
    .where(
      and(
        eq(projectTrainers.trainerId, trainer.id),
        isNull(projects.deletedAt)
      )
    );

  // 4. Fetch QR Form text configuration
  const settingsRecord = await db.query.systemSettings.findFirst({
    where: eq(systemSettings.key, "qr_form_config"),
  });

  const formConfig: QrFormConfig = settingsRecord?.value
    ? {
        formTitle: "Official Trainer Evaluation",
        formSubtitle: "Please take 1 minute to share your honest class experience.",
        improvementPrompt: "What could the trainer improve on?",
        appreciationPrompt: "General Feedback / Appreciation",
        thankYouHeading: "Feedback Submitted!",
        thankYouMessage: "Thank you for rating your trainer. Your honest evaluation directly empowers high-quality training standards at EdRealm.",
        ...(settingsRecord.value as unknown as Partial<QrFormConfig>),
      }
    : {
        formTitle: "Official Trainer Evaluation",
        formSubtitle: "Please take 1 minute to share your honest class experience.",
        improvementPrompt: "What could the trainer improve on?",
        appreciationPrompt: "General Feedback / Appreciation",
        thankYouHeading: "Feedback Submitted!",
        thankYouMessage: "Thank you for rating your trainer. Your honest evaluation directly empowers high-quality training standards at EdRealm.",
      };

  return {
    status: "active" as const,
    trainer,
    questions,
    projects: trainerProjects,
    formConfig,
  };
}

/**
 * Submit student feedback with anti-spam, duplicate prevention, and atomic rating recalculation.
 */
export async function submitStudentFeedback(input: SubmitFeedbackInput) {
  const validated = SubmitFeedbackSchema.parse(input);

  // Security 1: Honeypot trap
  if (validated.faxNumberHoneypot) {
    throw new Error("Invalid request detected.");
  }

  // Security 2: Velocity check (must take at least 2.5 seconds to fill form)
  if (validated.renderedAt && Date.now() - validated.renderedAt < 2500) {
    throw new Error("Submission was too fast. Please take your time to review.");
  }

  // Verify trainer status
  const trainer = await db.query.trainers.findFirst({
    where: and(
      eq(trainers.id, validated.trainerId),
      eq(trainers.qrToken, validated.qrToken),
      isNull(trainers.deletedAt)
    ),
  });

  if (!trainer || !trainer.isActive || !trainer.qrActive) {
    throw new Error("This trainer feedback link is currently inactive or invalid.");
  }

  // Check unique student feedback per trainer per day
  const todayStr = new Date().toISOString().split("T")[0];
  const existingToday = await db.query.feedbackResponses.findFirst({
    where: and(
      eq(feedbackResponses.trainerId, validated.trainerId),
      sql`LOWER(TRIM(${feedbackResponses.studentId})) = LOWER(TRIM(${validated.studentId}))`,
      eq(feedbackResponses.submittedDate, todayStr)
    ),
  });

  if (existingToday) {
    throw new Error(
      "You have already submitted feedback for this faculty member today. Thank you for your review!"
    );
  }

  // Insert response record
  const [newResponse] = await db
    .insert(feedbackResponses)
    .values({
      trainerId: validated.trainerId,
      projectId: validated.projectId || null,
      studentName: validated.studentName || null,
      studentId: validated.studentId.trim().toUpperCase(),
      improvementAreas: validated.improvementAreas || null,
      additionalComments: validated.additionalComments || null,
      submittedDate: todayStr,
    })
    .returning();

  // Insert question answers
  const answersToInsert = Object.entries(validated.ratings).map(([questionId, rating]) => ({
    responseId: newResponse.id,
    questionId,
    ratingValue: rating,
  }));

  if (answersToInsert.length > 0) {
    await db.insert(feedbackAnswers).values(answersToInsert);
  }

  // Atomic aggregate recalculation
  // 1. Total Reviews
  const [countRes] = await db
    .select({ total: sql<number>`count(*)::int` })
    .from(feedbackResponses)
    .where(eq(feedbackResponses.trainerId, validated.trainerId));
  const totalReviews = countRes?.total || 0;

  // 2. Overall Arithmetic Mean Rating
  const [avgRes] = await db
    .select({
      avgRating: sql<string>`coalesce(round(avg(${feedbackAnswers.ratingValue})::numeric, 2), 0)::text`,
    })
    .from(feedbackAnswers)
    .innerJoin(feedbackResponses, eq(feedbackAnswers.responseId, feedbackResponses.id))
    .where(eq(feedbackResponses.trainerId, validated.trainerId));
  const newAvgRating = avgRes?.avgRating || "0.0";

  // 3. Criteria Breakdown
  const criteriaScores = await db
    .select({
      key: feedbackQuestions.questionKey,
      score: sql<string>`coalesce(round(avg(${feedbackAnswers.ratingValue})::numeric, 2), 0)::text`,
      count: sql<number>`count(*)::int`,
    })
    .from(feedbackAnswers)
    .innerJoin(feedbackResponses, eq(feedbackAnswers.responseId, feedbackResponses.id))
    .innerJoin(feedbackQuestions, eq(feedbackAnswers.questionId, feedbackQuestions.id))
    .where(eq(feedbackResponses.trainerId, validated.trainerId))
    .groupBy(feedbackQuestions.questionKey);

  const criteriaMap: Record<string, { score: number; count: number }> = {};
  for (const c of criteriaScores) {
    criteriaMap[c.key] = {
      score: parseFloat(c.score),
      count: c.count,
    };
  }

  // Update trainer cached ratings
  await db
    .update(trainers)
    .set({
      cachedRating: newAvgRating,
      cachedCriteriaScores: criteriaMap,
      cachedReviewsCount: totalReviews,
      updatedAt: new Date(),
    })
    .where(eq(trainers.id, validated.trainerId));

  // Revalidate views safely
  try {
    revalidatePath(`/trainers/${validated.trainerId}`);
    revalidatePath("/trainers");
  } catch {
    // Graceful fallback for standalone invocations
  }

  return { success: true };
}
