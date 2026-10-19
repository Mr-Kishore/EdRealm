"use server";

import { db } from "@/db";
import { feedbackQuestions, feedbackAnswers, systemSettings } from "@/db/schema";
import { asc, desc, eq, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export interface QrFormConfig {
  formTitle: string;
  formSubtitle: string;
  improvementPrompt: string;
  appreciationPrompt: string;
  thankYouHeading: string;
  thankYouMessage: string;
}

const DEFAULT_QR_FORM_CONFIG: QrFormConfig = {
  formTitle: "Official Trainer Evaluation",
  formSubtitle: "Please take 1 minute to share your honest class experience.",
  improvementPrompt: "What could the trainer improve on?",
  appreciationPrompt: "General Feedback / Appreciation",
  thankYouHeading: "Feedback Submitted!",
  thankYouMessage: "Thank you for rating your trainer. Your honest evaluation directly empowers high-quality training standards at EdRealm.",
};

/**
 * Fetch all questions and QR Form header configurations.
 */
export async function getQrFormSettings() {
  const [questions, settingsRecord] = await Promise.all([
    db.query.feedbackQuestions.findMany({
      orderBy: [asc(feedbackQuestions.displayOrder), asc(feedbackQuestions.createdAt)],
    }),
    db.query.systemSettings.findFirst({
      where: eq(systemSettings.key, "qr_form_config"),
    }),
  ]);

  const config: QrFormConfig = settingsRecord?.value 
    ? { ...DEFAULT_QR_FORM_CONFIG, ...(settingsRecord.value as any) }
    : DEFAULT_QR_FORM_CONFIG;

  return {
    questions,
    config,
  };
}

/**
 * Update the QR Form text and guidance settings.
 */
export async function updateQrFormConfig(input: Partial<QrFormConfig>) {
  const current = await db.query.systemSettings.findFirst({
    where: eq(systemSettings.key, "qr_form_config"),
  });

  const merged = {
    ...DEFAULT_QR_FORM_CONFIG,
    ...(current?.value ? (current.value as any) : {}),
    ...input,
  };

  await db
    .insert(systemSettings)
    .values({
      key: "qr_form_config",
      value: merged,
      updatedAt: new Date(),
    })
    .onConflictDoUpdate({
      target: systemSettings.key,
      set: {
        value: merged,
        updatedAt: new Date(),
      },
    });

  try {
    revalidatePath("/settings");
    revalidatePath("/feedback/[qr_token]", "page");
  } catch {}

  return { success: true, config: merged };
}

/**
 * Create a new feedback question.
 */
export async function createFeedbackQuestion(input: {
  questionText: string;
  isRequired?: boolean;
}) {
  if (!input.questionText.trim()) {
    throw new Error("Question text cannot be empty");
  }

  // Generate a key from questionText: e.g. "Practical Knowledge" -> "PRACTICAL_KNOWLEDGE"
  let baseKey = input.questionText
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9\s]/g, "")
    .replace(/\s+/g, "_")
    .substring(0, 32);

  if (!baseKey) {
    baseKey = `QUESTION_${Date.now()}`;
  }

  // Ensure uniqueness
  const existingWithKey = await db.query.feedbackQuestions.findFirst({
    where: eq(feedbackQuestions.questionKey, baseKey),
  });

  const finalKey = existingWithKey ? `${baseKey}_${Date.now().toString().slice(-4)}` : baseKey;

  // Get max display order
  const [maxOrderRes] = await db
    .select({ maxOrder: sql<number>`coalesce(max(${feedbackQuestions.displayOrder}), 0)::int` })
    .from(feedbackQuestions);

  const newOrder = (maxOrderRes?.maxOrder || 0) + 1;

  const [created] = await db
    .insert(feedbackQuestions)
    .values({
      questionKey: finalKey,
      questionText: input.questionText.trim(),
      displayOrder: newOrder,
      isRequired: input.isRequired ?? true,
      isActive: true,
    })
    .returning();

  try {
    revalidatePath("/settings");
    revalidatePath("/feedback/[qr_token]", "page");
  } catch {}

  return { success: true, question: created };
}

/**
 * Update an existing question.
 */
export async function updateFeedbackQuestion(
  id: string,
  input: {
    questionText?: string;
    isRequired?: boolean;
    isActive?: boolean;
  }
) {
  const [updated] = await db
    .update(feedbackQuestions)
    .set({
      ...(input.questionText !== undefined && { questionText: input.questionText.trim() }),
      ...(input.isRequired !== undefined && { isRequired: input.isRequired }),
      ...(input.isActive !== undefined && { isActive: input.isActive }),
      updatedAt: new Date(),
    })
    .where(eq(feedbackQuestions.id, id))
    .returning();

  try {
    revalidatePath("/settings");
    revalidatePath("/feedback/[qr_token]", "page");
  } catch {}

  return { success: true, question: updated };
}

/**
 * Toggle a question's active/inactive status.
 */
export async function toggleFeedbackQuestion(id: string, isActive: boolean) {
  const [updated] = await db
    .update(feedbackQuestions)
    .set({
      isActive,
      updatedAt: new Date(),
    })
    .where(eq(feedbackQuestions.id, id))
    .returning();

  try {
    revalidatePath("/settings");
    revalidatePath("/feedback/[qr_token]", "page");
  } catch {}

  return { success: true, question: updated };
}

/**
 * Reorder feedback questions.
 */
export async function reorderFeedbackQuestions(orderedIds: string[]) {
  for (let i = 0; i < orderedIds.length; i++) {
    await db
      .update(feedbackQuestions)
      .set({ displayOrder: i + 1, updatedAt: new Date() })
      .where(eq(feedbackQuestions.id, orderedIds[i]));
  }

  try {
    revalidatePath("/settings");
    revalidatePath("/feedback/[qr_token]", "page");
  } catch {}

  return { success: true };
}

/**
 * Delete a question if not referenced by responses, or deactivate it if answers exist.
 */
export async function deleteFeedbackQuestion(id: string) {
  const [answersCountRes] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(feedbackAnswers)
    .where(eq(feedbackAnswers.questionId, id));

  const hasAnswers = (answersCountRes?.count || 0) > 0;

  if (hasAnswers) {
    // Soft deactivate to preserve historic student rating integrity
    await db
      .update(feedbackQuestions)
      .set({ isActive: false, updatedAt: new Date() })
      .where(eq(feedbackQuestions.id, id));

    try {
      revalidatePath("/settings");
      revalidatePath("/feedback/[qr_token]", "page");
    } catch {}

    return { 
      success: true, 
      deactivated: true, 
      message: "Question has past student ratings recorded, so it has been deactivated instead of deleted to protect historic records." 
    };
  } else {
    // Hard delete
    await db.delete(feedbackQuestions).where(eq(feedbackQuestions.id, id));

    try {
      revalidatePath("/settings");
      revalidatePath("/feedback/[qr_token]", "page");
    } catch {}

    return { success: true, deactivated: false };
  }
}
