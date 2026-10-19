"use server";

import { db } from "@/db";
import { 
  projects, 
  projectTrainers, 
  trainers, 
  trainerSkills, 
  masterSubjects, 
  skillCategories, 
  auditLogs,
  type Project,
  type ProjectTrainer
} from "@/db/schema";
import { 
  eq, 
  and, 
  isNull, 
  desc, 
  asc, 
  sql, 
  ilike, 
  or, 
  lte, 
  gte, 
  ne 
} from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { 
  CreateProjectSchema, 
  UpdateProjectSchema, 
  type CreateProjectInput, 
  type UpdateProjectInput 
} from "@/lib/validations/project";

export interface ProjectFilters {
  status?: "all" | "upcoming" | "ongoing" | "completed";
  q?: string;
  place?: string;
  page?: number;
  limit?: number;
}

/**
 * Computes the temporal status of a project unless manually overridden.
 */
export async function computeAutoStatus(
  startDate: string,
  endDate: string,
  statusOverride: boolean,
  currentStatus: "upcoming" | "ongoing" | "completed"
): Promise<"upcoming" | "ongoing" | "completed"> {
  if (statusOverride) return currentStatus;
  const today = new Date().toISOString().split("T")[0];
  if (today < startDate) return "upcoming";
  if (today > endDate) return "completed";
  return "ongoing";
}

/**
 * Fetch projects with filter, search, pagination, and assigned trainers count.
 */
export async function getProjects(filters: ProjectFilters = {}) {
  const { status, q, place, page = 1, limit = 20 } = filters;
  const offset = (page - 1) * limit;

  const conditions = [isNull(projects.deletedAt)];

  if (status && status !== "all") {
    conditions.push(eq(projects.status, status));
  }

  if (place && place.trim()) {
    conditions.push(ilike(projects.place, `%${place.trim()}%`));
  }

  if (q && q.trim()) {
    const term = `%${q.trim()}%`;
    conditions.push(
      or(
        ilike(projects.projectName, term),
        ilike(projects.place, term),
        ilike(projects.contactPersonName, term),
        ilike(projects.contactPersonPhone, term)
      )!
    );
  }

  const whereClause = and(...conditions);

  // Fetch projects
  const items = await db.query.projects.findMany({
    where: whereClause,
    orderBy: [asc(projects.startDate), desc(projects.createdAt)],
    limit,
    offset,
    with: {
      assignedTrainers: {
        with: {
          trainer: {
            columns: {
              id: true,
              trainerCode: true,
              fullName: true,
              photoUrl: true,
              cachedRating: true,
              phone: true,
            },
          },
        },
      },
    },
  });

  // Count total for pagination
  const [totalCountResult] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(projects)
    .where(whereClause);

  const total = totalCountResult?.count || 0;

  // Stats across all projects
  const [statsResult] = await db
    .select({
      total: sql<number>`count(*)::int`,
      upcoming: sql<number>`count(*) filter (where ${projects.status} = 'upcoming')::int`,
      ongoing: sql<number>`count(*) filter (where ${projects.status} = 'ongoing')::int`,
      completed: sql<number>`count(*) filter (where ${projects.status} = 'completed')::int`,
    })
    .from(projects)
    .where(isNull(projects.deletedAt));

  return {
    projects: items,
    total,
    totalPages: Math.ceil(total / limit),
    currentPage: page,
    stats: statsResult || { total: 0, upcoming: 0, ongoing: 0, completed: 0 },
  };
}

/**
 * Fetch a single project with all assigned trainers, trainer skills, and ratings.
 */
export async function getProjectById(id: string) {
  const project = await db.query.projects.findFirst({
    where: and(eq(projects.id, id), isNull(projects.deletedAt)),
    with: {
      assignedTrainers: {
        with: {
          trainer: {
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
          },
        },
      },
    },
  });

  return project;
}

/**
 * Check if a trainer has conflicting project assignments during a date window.
 */
export async function checkTrainerAvailability(
  trainerId: string,
  startDate: string,
  endDate: string,
  excludeProjectId?: string
) {
  const conflictingAssignments = await db
    .select({
      projectId: projects.id,
      projectName: projects.projectName,
      place: projects.place,
      startDate: projects.startDate,
      endDate: projects.endDate,
      status: projects.status,
    })
    .from(projectTrainers)
    .innerJoin(projects, eq(projectTrainers.projectId, projects.id))
    .where(
      and(
        eq(projectTrainers.trainerId, trainerId),
        isNull(projects.deletedAt),
        excludeProjectId ? ne(projects.id, excludeProjectId) : undefined,
        // Date overlap condition: S2 <= E1 AND E2 >= S1
        lte(projects.startDate, endDate),
        gte(projects.endDate, startDate)
      )
    );

  return {
    hasConflict: conflictingAssignments.length > 0,
    conflicts: conflictingAssignments,
  };
}

/**
 * Create a new project.
 */
export async function createProject(input: CreateProjectInput) {
  const validated = CreateProjectSchema.parse(input);

  // Determine initial status based on dates
  const initialStatus = await computeAutoStatus(
    validated.startDate,
    validated.endDate,
    validated.statusOverride,
    validated.status
  );

  const [created] = await db
    .insert(projects)
    .values({
      projectName: validated.projectName,
      startDate: validated.startDate,
      endDate: validated.endDate,
      place: validated.place,
      contactPersonName: validated.contactPersonName,
      contactPersonPhone: validated.contactPersonPhone,
      contactPersonEmail: validated.contactPersonEmail || null,
      notes: validated.notes || null,
      status: initialStatus,
      statusOverride: validated.statusOverride,
    })
    .returning();

  revalidatePath("/projects");
  return { success: true, project: created };
}

/**
 * Update an existing project.
 */
export async function updateProject(id: string, input: UpdateProjectInput) {
  const validated = UpdateProjectSchema.parse(input);

  const existing = await db.query.projects.findFirst({
    where: and(eq(projects.id, id), isNull(projects.deletedAt)),
  });

  if (!existing) {
    throw new Error("Project not found");
  }

  const finalStartDate = validated.startDate || existing.startDate;
  const finalEndDate = validated.endDate || existing.endDate;
  const finalStatusOverride = validated.statusOverride !== undefined ? validated.statusOverride : existing.statusOverride;

  const finalStatus = await computeAutoStatus(
    finalStartDate,
    finalEndDate,
    finalStatusOverride,
    (validated.status || existing.status) as any
  );

  const [updated] = await db
    .update(projects)
    .set({
      ...(validated.projectName && { projectName: validated.projectName }),
      ...(validated.startDate && { startDate: validated.startDate }),
      ...(validated.endDate && { endDate: validated.endDate }),
      ...(validated.place && { place: validated.place }),
      ...(validated.contactPersonName && { contactPersonName: validated.contactPersonName }),
      ...(validated.contactPersonPhone && { contactPersonPhone: validated.contactPersonPhone }),
      ...(validated.contactPersonEmail !== undefined && { contactPersonEmail: validated.contactPersonEmail || null }),
      ...(validated.notes !== undefined && { notes: validated.notes || null }),
      status: finalStatus,
      statusOverride: finalStatusOverride,
      updatedAt: new Date(),
    })
    .where(eq(projects.id, id))
    .returning();

  revalidatePath("/projects");
  revalidatePath(`/projects/${id}`);
  return { success: true, project: updated };
}

/**
 * Delete a project (Soft-delete).
 */
export async function deleteProject(id: string) {
  const existing = await db.query.projects.findFirst({
    where: and(eq(projects.id, id), isNull(projects.deletedAt)),
  });

  if (!existing) {
    throw new Error("Project not found");
  }

  await db
    .update(projects)
    .set({
      deletedAt: new Date(),
      updatedAt: new Date(),
    })
    .where(eq(projects.id, id));

  revalidatePath("/projects");
  return { success: true };
}

/**
 * Override project status manually.
 */
export async function overrideProjectStatus(
  id: string,
  newStatus: "upcoming" | "ongoing" | "completed",
  forceOverride: boolean
) {
  const [updated] = await db
    .update(projects)
    .set({
      status: newStatus,
      statusOverride: forceOverride,
      updatedAt: new Date(),
    })
    .where(eq(projects.id, id))
    .returning();

  revalidatePath("/projects");
  revalidatePath(`/projects/${id}`);
  return { success: true, project: updated };
}

/**
 * Assign a trainer to a project with overlap check.
 */
export async function assignTrainerToProject(params: {
  projectId: string;
  trainerId: string;
  roleInProject?: string;
  force?: boolean;
}) {
  const { projectId, trainerId, roleInProject = "Trainer", force = false } = params;

  // 1. Fetch project dates
  const project = await db.query.projects.findFirst({
    where: and(eq(projects.id, projectId), isNull(projects.deletedAt)),
  });

  if (!project) {
    throw new Error("Project not found");
  }

  // 2. Check if already assigned
  const existingAssignment = await db.query.projectTrainers.findFirst({
    where: and(
      eq(projectTrainers.projectId, projectId),
      eq(projectTrainers.trainerId, trainerId)
    ),
  });

  if (existingAssignment) {
    throw new Error("This trainer is already assigned to this project");
  }

  // 3. Check for date overlap across other projects
  const { hasConflict, conflicts } = await checkTrainerAvailability(
    trainerId,
    project.startDate,
    project.endDate,
    projectId
  );

  if (hasConflict && !force) {
    return {
      success: false,
      conflict: true,
      conflicts,
      message: `Trainer has ${conflicts.length} conflicting project assignment(s) during this period.`,
    };
  }

  // 4. Insert assignment
  const [assignment] = await db
    .insert(projectTrainers)
    .values({
      projectId,
      trainerId,
      roleInProject,
    })
    .returning();

  revalidatePath(`/projects/${projectId}`);
  revalidatePath(`/trainers/${trainerId}`);
  revalidatePath("/projects");

  return {
    success: true,
    conflict: false,
    assignment,
  };
}

/**
 * Remove a trainer from a project.
 */
export async function removeTrainerFromProject(projectId: string, trainerId: string) {
  await db
    .delete(projectTrainers)
    .where(
      and(
        eq(projectTrainers.projectId, projectId),
        eq(projectTrainers.trainerId, trainerId)
      )
    );

  revalidatePath(`/projects/${projectId}`);
  revalidatePath(`/trainers/${trainerId}`);
  revalidatePath("/projects");
  return { success: true };
}

/**
 * Get trainers available to assign to a given project, with search and overlap warning info.
 */
export async function getTrainersForProjectAssignment(projectId: string, query?: string) {
  const project = await db.query.projects.findFirst({
    where: and(eq(projects.id, projectId), isNull(projects.deletedAt)),
  });

  if (!project) {
    throw new Error("Project not found");
  }

  // Already assigned trainer IDs
  const currentAssigned = await db
    .select({ trainerId: projectTrainers.trainerId })
    .from(projectTrainers)
    .where(eq(projectTrainers.projectId, projectId));

  const assignedIds = currentAssigned.map((a) => a.trainerId);

  // Fetch active trainers not in assignedIds
  const conditions = [
    isNull(trainers.deletedAt),
    eq(trainers.isActive, true),
  ];

  if (assignedIds.length > 0) {
    conditions.push(sql`${trainers.id} NOT IN (${sql.join(assignedIds.map(id => sql`${id}`), sql`, `)})`);
  }

  if (query && query.trim()) {
    const term = `%${query.trim()}%`;
    conditions.push(
      or(
        ilike(trainers.fullName, term),
        ilike(trainers.trainerCode, term),
        ilike(trainers.currentCity, term)
      )!
    );
  }

  const candidates = await db.query.trainers.findMany({
    where: and(...conditions),
    orderBy: [desc(trainers.cachedRating), asc(trainers.fullName)],
    limit: 25,
    with: {
      skills: {
        with: {
          subject: true,
        },
      },
    },
  });

  // Evaluate overlap for each candidate
  const candidateResults = await Promise.all(
    candidates.map(async (t) => {
      const { hasConflict, conflicts } = await checkTrainerAvailability(
        t.id,
        project.startDate,
        project.endDate,
        projectId
      );
      return {
        ...t,
        hasConflict,
        conflicts,
      };
    })
  );

  return candidateResults;
}
