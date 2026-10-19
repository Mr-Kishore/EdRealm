"use server";

import { db } from "@/db";
import {
  trainers,
  trainerSkills,
  masterSubjects,
  skillCategories,
  auditLogs,
  feedbackResponses,
  feedbackAnswers,
  feedbackQuestions,
} from "@/db/schema";
import { eq, and, isNull, desc, sql, ilike, or } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { nanoid } from "nanoid";
import {
  CreateTrainerSchema,
  UpdateTrainerSchema,
  type CreateTrainerInput,
  type UpdateTrainerInput,
  type SkillInput,
} from "@/lib/validations/trainer";
import { resolveCategory, resolveSubject } from "./catalog";

export interface TrainerFilterOptions {
  q?: string;
  city?: string;
  state?: string;
  subjectId?: string;
  categoryId?: string;
  trainingMode?: string;
  minExperience?: number;
  minRating?: number;
  willingToTravel?: boolean;
  status?: "active" | "inactive" | "all";
  page?: number;
  limit?: number;
}

export async function getTrainers(filters: TrainerFilterOptions = {}) {
  const page = filters.page || 1;
  const limit = filters.limit || 12;
  const offset = (page - 1) * limit;

  const conditions = [isNull(trainers.deletedAt)];

  // Active status filter
  if (filters.status === "active" || !filters.status) {
    conditions.push(eq(trainers.isActive, true));
  } else if (filters.status === "inactive") {
    conditions.push(eq(trainers.isActive, false));
  }

  // Keyword search (Name, Code, Email, Phone)
  if (filters.q && filters.q.trim()) {
    const term = `%${filters.q.trim()}%`;
    conditions.push(
      or(
        ilike(trainers.fullName, term),
        ilike(trainers.trainerCode, term),
        ilike(trainers.email, term),
        ilike(trainers.phone, term),
        ilike(trainers.currentCity, term)
      )!
    );
  }

  // State filter
  if (filters.state && filters.state.trim()) {
    conditions.push(ilike(trainers.currentState, `%${filters.state.trim()}%`));
  }

  // Training mode filter
  if (filters.trainingMode && filters.trainingMode !== "ALL") {
    conditions.push(
      sql`${filters.trainingMode} = ANY(${trainers.trainingModes})`
    );
  }

  // Minimum total experience
  if (filters.minExperience && filters.minExperience > 0) {
    conditions.push(
      sql`${trainers.totalExperience} >= ${filters.minExperience}`
    );
  }

  // Minimum rating
  if (filters.minRating && filters.minRating > 0) {
    conditions.push(
      sql`${trainers.cachedRating} >= ${filters.minRating}`
    );
  }

  // Willing to travel toggle
  if (filters.willingToTravel) {
    conditions.push(eq(trainers.willingToTravelAnywhere, true));
  }

  // Subject / Category filter
  if (filters.subjectId) {
    conditions.push(
      sql`EXISTS (
        SELECT 1 FROM ${trainerSkills} ts 
        WHERE ts.trainer_id = ${trainers.id} 
          AND ts.subject_id = ${filters.subjectId}
      )`
    );
  } else if (filters.categoryId) {
    conditions.push(
      sql`EXISTS (
        SELECT 1 FROM ${trainerSkills} ts 
        JOIN ${masterSubjects} ms ON ts.subject_id = ms.id
        WHERE ts.trainer_id = ${trainers.id} 
          AND ms.category_id = ${filters.categoryId}
      )`
    );
  }

  const whereClause = and(...conditions);

  // Geo-Prioritization Ranking Logic
  const searchCity = filters.city ? filters.city.trim().toLowerCase() : null;
  const geoOrder = searchCity
    ? sql`
        CASE 
          WHEN LOWER(${trainers.currentCity}) = ${searchCity} THEN 1
          WHEN ${filters.city} = ANY(${trainers.preferredLocations}) THEN 2
          WHEN ${trainers.willingToTravelAnywhere} = TRUE THEN 3
          ELSE 4
        END ASC,
        ${trainers.cachedRating} DESC,
        ${trainers.totalExperience} DESC
      `
    : sql`${trainers.cachedRating} DESC, ${trainers.totalExperience} DESC, ${trainers.createdAt} DESC`;

  const results = await db.query.trainers.findMany({
    where: whereClause,
    orderBy: geoOrder,
    limit,
    offset,
    with: {
      skills: {
        with: {
          subject: {
            with: {
              category: true,
            },
          },
        },
      },
    },
  });

  const [totalCountResult] = await db
    .select({ count: sql<number>`count(*)` })
    .from(trainers)
    .where(whereClause);

  const total = Number(totalCountResult?.count || 0);

  return {
    trainers: results,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
}

export async function getTrainerById(id: string) {
  const trainer = await db.query.trainers.findFirst({
    where: and(eq(trainers.id, id), isNull(trainers.deletedAt)),
    with: {
      skills: {
        with: {
          subject: {
            with: {
              category: true,
            },
          },
        },
      },
      projectAssignments: {
        with: {
          project: true,
        },
      },
      feedbackResponses: {
        orderBy: desc(feedbackResponses.submittedAt),
        limit: 50,
        with: {
          answers: {
            with: {
              question: true,
            },
          },
        },
      },
    },
  });

  return trainer;
}

export async function createTrainer(input: CreateTrainerInput) {
  const validated = CreateTrainerSchema.parse(input);

  // Generate unique URL-safe 32-character nanoid for QR code
  const qrToken = nanoid(32);

  // Insert Trainer Record
  const [createdTrainer] = await db
    .insert(trainers)
    .values({
      fullName: validated.fullName,
      photoUrl: validated.photoUrl || null,
      phone: validated.phone,
      whatsapp: validated.whatsapp,
      email: validated.email,
      currentCity: validated.currentCity,
      currentState: validated.currentState,
      country: validated.country || "India",
      preferredLocations: validated.preferredLocations,
      willingToTravelAnywhere: validated.willingToTravelAnywhere,
      trainingModes: validated.trainingModes,
      totalExperience: validated.totalExperience.toString(),
      trainingExperience: validated.trainingExperience.toString(),
      linkedinUrl: validated.linkedinUrl || null,
      resumeUrl: validated.resumeUrl || null,
      qrToken,
      qrActive: true,
      isActive: true,
    })
    .returning();

  // Insert Skills with dynamic "Select-or-Create"
  if (validated.skills && validated.skills.length > 0) {
    for (const skill of validated.skills) {
      try {
        const resolvedCategoryId = await resolveCategory(
          skill.categoryId,
          skill.newCategoryName
        );
        const resolvedSubjectId = await resolveSubject(
          resolvedCategoryId,
          skill.subjectId,
          skill.newSubjectName
        );

        await db.insert(trainerSkills).values({
          trainerId: createdTrainer.id,
          subjectId: resolvedSubjectId,
          trainerType: skill.trainerType,
          expertiseLevel: skill.expertiseLevel,
          subjectExperience: skill.subjectExperience.toString(),
          canHandleLargeBatches: skill.canHandleLargeBatches,
          canConductMockInterviews: skill.canConductMockInterviews,
          additionalSkills: skill.additionalSkills,
          technicalSkills: skill.technicalSkills,
        });
      } catch (err) {
        console.error("Failed to insert skill:", err);
      }
    }
  }

  // Audit Log
  await db.insert(auditLogs).values({
    action: "TRAINER_CREATE",
    entityName: "trainers",
    entityId: createdTrainer.id,
    newValues: createdTrainer,
  });

  revalidatePath("/trainers");
  return { success: true, trainerId: createdTrainer.id };
}

export async function updateTrainer(id: string, input: UpdateTrainerInput) {
  const validated = UpdateTrainerSchema.parse(input);

  const existing = await db.query.trainers.findFirst({
    where: and(eq(trainers.id, id), isNull(trainers.deletedAt)),
  });

  if (!existing) {
    throw new Error("Trainer not found");
  }

  const [updated] = await db
    .update(trainers)
    .set({
      fullName: validated.fullName,
      photoUrl: validated.photoUrl || null,
      phone: validated.phone,
      whatsapp: validated.whatsapp,
      email: validated.email,
      currentCity: validated.currentCity,
      currentState: validated.currentState,
      country: validated.country,
      preferredLocations: validated.preferredLocations,
      willingToTravelAnywhere: validated.willingToTravelAnywhere,
      trainingModes: validated.trainingModes,
      totalExperience: validated.totalExperience.toString(),
      trainingExperience: validated.trainingExperience.toString(),
      linkedinUrl: validated.linkedinUrl || null,
      resumeUrl: validated.resumeUrl || null,
      updatedAt: new Date(),
    })
    .where(eq(trainers.id, id))
    .returning();

  // Audit Log
  await db.insert(auditLogs).values({
    action: "TRAINER_UPDATE",
    entityName: "trainers",
    entityId: id,
    oldValues: existing,
    newValues: updated,
  });

  revalidatePath("/trainers");
  revalidatePath(`/trainers/${id}`);
  return { success: true, trainer: updated };
}

export async function deleteTrainer(id: string, confirmationPhrase: string) {
  const existing = await db.query.trainers.findFirst({
    where: and(eq(trainers.id, id), isNull(trainers.deletedAt)),
  });

  if (!existing) {
    throw new Error("Trainer not found");
  }

  const expectedPhrase = `DELETE ${existing.trainerCode}/${existing.fullName}`;
  if (confirmationPhrase.trim() !== expectedPhrase) {
    throw new Error(
      `Confirmation mismatch. Please type exactly: "${expectedPhrase}"`
    );
  }

  // Soft delete and deactivate
  await db
    .update(trainers)
    .set({
      deletedAt: new Date(),
      isActive: false,
      qrActive: false,
      updatedAt: new Date(),
    })
    .where(eq(trainers.id, id));

  // Save full snapshot in audit log
  await db.insert(auditLogs).values({
    action: "TRAINER_DELETE",
    entityName: "trainers",
    entityId: id,
    oldValues: existing,
  });

  revalidatePath("/trainers");
  return { success: true };
}

export async function toggleTrainerStatus(id: string, isActive: boolean) {
  await db
    .update(trainers)
    .set({ isActive, updatedAt: new Date() })
    .where(eq(trainers.id, id));

  revalidatePath("/trainers");
  revalidatePath(`/trainers/${id}`);
  return { success: true };
}

export async function toggleQrActive(id: string, qrActive: boolean) {
  await db
    .update(trainers)
    .set({ qrActive, updatedAt: new Date() })
    .where(eq(trainers.id, id));

  revalidatePath(`/trainers/${id}`);
  return { success: true };
}

export async function regenerateQrToken(id: string) {
  const newQrToken = nanoid(32);
  await db
    .update(trainers)
    .set({ qrToken: newQrToken, updatedAt: new Date() })
    .where(eq(trainers.id, id));

  revalidatePath(`/trainers/${id}`);
  return { success: true, qrToken: newQrToken };
}

export async function addTrainerSkill(trainerId: string, skill: SkillInput) {
  const resolvedCategoryId = await resolveCategory(
    skill.categoryId,
    skill.newCategoryName
  );
  const resolvedSubjectId = await resolveSubject(
    resolvedCategoryId,
    skill.subjectId,
    skill.newSubjectName
  );

  const [createdSkill] = await db
    .insert(trainerSkills)
    .values({
      trainerId,
      subjectId: resolvedSubjectId,
      trainerType: skill.trainerType,
      expertiseLevel: skill.expertiseLevel,
      subjectExperience: skill.subjectExperience.toString(),
      canHandleLargeBatches: skill.canHandleLargeBatches,
      canConductMockInterviews: skill.canConductMockInterviews,
      additionalSkills: skill.additionalSkills,
      technicalSkills: skill.technicalSkills,
    })
    .returning();

  revalidatePath(`/trainers/${trainerId}`);
  return { success: true, skill: createdSkill };
}

export async function deleteTrainerSkill(skillId: string, trainerId: string) {
  await db.delete(trainerSkills).where(eq(trainerSkills.id, skillId));
  revalidatePath(`/trainers/${trainerId}`);
  return { success: true };
}
