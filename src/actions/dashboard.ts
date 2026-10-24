"use server";

import { db } from "@/db";
import { 
  trainers, 
  projects, 
  masterSubjects, 
  feedbackResponses
} from "@/db/schema";
import { eq, and, isNull, desc, asc, sql } from "drizzle-orm";

export async function getDashboardData() {
  // 1. Metric Counts
  const [trainerStats] = await db
    .select({
      total: sql<number>`count(*)::int`,
      active: sql<number>`count(*) filter (where ${trainers.isActive} = true)::int`,
      qrActive: sql<number>`count(*) filter (where ${trainers.qrActive} = true and ${trainers.isActive} = true)::int`,
      avgRating: sql<string>`coalesce(round(avg(${trainers.cachedRating}::numeric) filter (where ${trainers.cachedReviewsCount} > 0), 2), 0)::text`,
    })
    .from(trainers)
    .where(isNull(trainers.deletedAt));

  const [projectStats] = await db
    .select({
      total: sql<number>`count(*)::int`,
      upcoming: sql<number>`count(*) filter (where ${projects.status} = 'upcoming')::int`,
      ongoing: sql<number>`count(*) filter (where ${projects.status} = 'ongoing')::int`,
      completed: sql<number>`count(*) filter (where ${projects.status} = 'completed')::int`,
    })
    .from(projects)
    .where(isNull(projects.deletedAt));

  const [feedbackStats] = await db
    .select({
      totalReviews: sql<number>`count(*)::int`,
    })
    .from(feedbackResponses);

  const [catalogStats] = await db
    .select({
      totalSubjects: sql<number>`count(*)::int`,
    })
    .from(masterSubjects);

  // 2. Ongoing & Upcoming Projects
  const activeProjects = await db.query.projects.findMany({
    where: and(
      isNull(projects.deletedAt),
      sql`${projects.status} in ('ongoing', 'upcoming')`
    ),
    orderBy: [asc(projects.startDate)],
    limit: 5,
    with: {
      assignedTrainers: {
        with: {
          trainer: {
            columns: {
              id: true,
              trainerCode: true,
              fullName: true,
              photoUrl: true,
            },
          },
        },
      },
    },
  });

  // 3. Top Rated Trainers
  const topTrainers = await db.query.trainers.findMany({
    where: and(isNull(trainers.deletedAt), eq(trainers.isActive, true)),
    orderBy: [desc(trainers.cachedRating), desc(trainers.cachedReviewsCount)],
    limit: 5,
    with: {
      skills: {
        with: {
          subject: true,
        },
      },
    },
  });

  // 4. Recent Student Feedback
  const recentFeedback = await db.query.feedbackResponses.findMany({
    orderBy: [desc(feedbackResponses.submittedAt)],
    limit: 5,
    with: {
      trainer: {
        columns: {
          id: true,
          trainerCode: true,
          fullName: true,
        },
      },
      answers: {
        with: {
          question: true,
        },
      },
    },
  });

  return {
    metrics: {
      totalTrainers: trainerStats?.total || 0,
      activeTrainers: trainerStats?.active || 0,
      qrActiveTrainers: trainerStats?.qrActive || 0,
      platformAvgRating: trainerStats?.avgRating || "0.0",
      totalProjects: projectStats?.total || 0,
      upcomingProjects: projectStats?.upcoming || 0,
      ongoingProjects: projectStats?.ongoing || 0,
      completedProjects: projectStats?.completed || 0,
      totalReviews: feedbackStats?.totalReviews || 0,
      totalSubjects: catalogStats?.totalSubjects || 0,
    },
    activeProjects,
    topTrainers,
    recentFeedback,
  };
}
