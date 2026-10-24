import {
  pgTable,
  pgSequence,
  uuid,
  varchar,
  text,
  boolean,
  numeric,
  integer,
  smallint,
  date,
  timestamp,
  jsonb,
  inet,
  pgEnum,
  uniqueIndex,
  index,
} from "drizzle-orm/pg-core";
import { relations, sql } from "drizzle-orm";

// 0. Sequences
export const trainerCodeSeq = pgSequence("trainer_code_seq", { startWith: 1 });

// 1. Enums
export const userRoleEnum = pgEnum("user_role", [
  "super_admin",
  "admin",
  "coordinator",
]);

export const trainingModeEnum = pgEnum("training_mode", [
  "Offline",
  "Online",
  "Hybrid",
]);

export const trainerTypeEnum = pgEnum("trainer_type", [
  "Technical",
  "Aptitude",
  "Soft Skills",
  "Domain Expert",
]);

export const expertiseLevelEnum = pgEnum("expertise_level", [
  "Beginner",
  "Intermediate",
  "Advanced",
  "Expert",
]);

export const projectStatusEnum = pgEnum("project_status", [
  "upcoming",
  "ongoing",
  "completed",
  "cancelled",
]);

export const questionTypeEnum = pgEnum("question_type", [
  "rating",
  "text",
]);

// 2. Users Table
export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  passwordHash: varchar("password_hash", { length: 255 }).notNull(),
  fullName: varchar("full_name", { length: 128 }).notNull(),
  role: userRoleEnum("role").default("admin").notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

// 3. Skill Categories ("Select-or-Create")
export const skillCategories = pgTable(
  "skill_categories",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    name: varchar("name", { length: 64 }).notNull(),
    isCustom: boolean("is_custom").default(false).notNull(),
    createdByUserId: uuid("created_by_user_id").references(() => users.id, {
      onDelete: "set null",
    }),
    displayOrder: integer("display_order").default(0).notNull(),
    isActive: boolean("is_active").default(true).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("idx_unique_category_name_ci").on(sql`LOWER(TRIM(${table.name}))`),
  ]
);

// 4. Master Subjects ("Select-or-Create")
export const masterSubjects = pgTable(
  "master_subjects",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    categoryId: uuid("category_id")
      .notNull()
      .references(() => skillCategories.id, { onDelete: "restrict" }),
    name: varchar("name", { length: 64 }).notNull(),
    isCustom: boolean("is_custom").default(false).notNull(),
    createdByUserId: uuid("created_by_user_id").references(() => users.id, {
      onDelete: "set null",
    }),
    isActive: boolean("is_active").default(true).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("idx_unique_subject_per_category_ci").on(
      table.categoryId,
      sql`LOWER(TRIM(${table.name}))`
    ),
  ]
);

// 5. Trainers Table
export const trainers = pgTable(
  "trainers",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    trainerCode: varchar("trainer_code", { length: 16 })
      .default(sql`'TR-' || LPAD(nextval('trainer_code_seq')::TEXT, 4, '0')`)
      .notNull()
      .unique(),
    fullName: varchar("full_name", { length: 128 }).notNull(),
    photoUrl: text("photo_url"),
    phone: varchar("phone", { length: 20 }).notNull(),
    whatsapp: varchar("whatsapp", { length: 20 }).notNull(),
    email: varchar("email", { length: 255 }).notNull(),
    currentCity: varchar("current_city", { length: 64 }).notNull(),
    currentState: varchar("current_state", { length: 64 }).notNull(),
    country: varchar("country", { length: 64 }).default("India").notNull(),
    preferredLocations: text("preferred_locations")
      .array()
      .default(sql`'{}'::text[]`)
      .notNull(),
    willingToTravelAnywhere: boolean("willing_to_travel_anywhere").default(false).notNull(),
    trainingModes: varchar("training_modes", { length: 16 })
      .array()
      .default(sql`'{Offline}'::varchar[]`)
      .notNull(),
    totalExperience: numeric("total_experience", { precision: 4, scale: 1 }).default("0.0").notNull(),
    trainingExperience: numeric("training_experience", { precision: 4, scale: 1 }).default("0.0").notNull(),
    linkedinUrl: text("linkedin_url"),
    resumeUrl: text("resume_url"), // Google Docs / Drive link
    qrToken: varchar("qr_token", { length: 64 }).notNull().unique(),
    qrActive: boolean("qr_active").default(true).notNull(),
    isActive: boolean("is_active").default(true).notNull(),
    // Fast Denormalized Rating Counters
    cachedRating: numeric("cached_rating", { precision: 3, scale: 2 }).default("0.00").notNull(),
    cachedReviewsCount: integer("cached_reviews_count").default(0).notNull(),
    cachedCriteriaScores: jsonb("cached_criteria_scores").default({
      knowledge: 0.0,
      concept_clarity: 0.0,
      problem_solving: 0.0,
      doubt_clarification: 0.0,
      communication: 0.0,
      punctuality: 0.0,
      overall_satisfaction: 0.0,
    }).notNull(),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("idx_trainers_search_geo").on(table.currentCity, table.currentState),
    index("idx_trainers_rating").on(table.cachedRating),
    index("idx_trainers_qr").on(table.qrToken),
    index("idx_trainers_pref_locs").using("gin", table.preferredLocations),
  ]
);

// 6. Trainer Skills Table
export const trainerSkills = pgTable(
  "trainer_skills",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    trainerId: uuid("trainer_id")
      .notNull()
      .references(() => trainers.id, { onDelete: "cascade" }),
    subjectId: uuid("subject_id")
      .notNull()
      .references(() => masterSubjects.id, { onDelete: "restrict" }),
    trainerType: trainerTypeEnum("trainer_type").default("Technical").notNull(),
    expertiseLevel: expertiseLevelEnum("expertise_level").default("Intermediate").notNull(),
    subjectExperience: numeric("subject_experience", { precision: 4, scale: 1 }).default("0.0").notNull(),
    canHandleLargeBatches: boolean("can_handle_large_batches").default(false).notNull(),
    canConductMockInterviews: boolean("can_conduct_mock_interviews").default(false).notNull(),
    additionalSkills: text("additional_skills")
      .array()
      .default(sql`'{}'::text[]`)
      .notNull(),
    technicalSkills: text("technical_skills")
      .array()
      .default(sql`'{}'::text[]`)
      .notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("idx_unique_trainer_subject").on(table.trainerId, table.subjectId),
    index("idx_trainer_skills_subject").on(table.subjectId, table.trainerId),
  ]
);

// 7. Projects Table
export const projects = pgTable(
  "projects",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    projectName: varchar("project_name", { length: 255 }).notNull(),
    startDate: date("start_date").notNull(),
    endDate: date("end_date").notNull(),
    place: varchar("place", { length: 128 }).notNull(),
    contactPersonName: varchar("contact_person_name", { length: 128 }).notNull(),
    contactPersonPhone: varchar("contact_person_phone", { length: 20 }).notNull(),
    contactPersonEmail: varchar("contact_person_email", { length: 255 }),
    status: projectStatusEnum("status").default("upcoming").notNull(),
    statusOverride: boolean("status_override").default(false).notNull(),
    notes: text("notes"),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("idx_projects_status_dates").on(table.status, table.startDate, table.endDate),
  ]
);

// 8. Project Trainers Junction Table
export const projectTrainers = pgTable(
  "project_trainers",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    projectId: uuid("project_id")
      .notNull()
      .references(() => projects.id, { onDelete: "cascade" }),
    trainerId: uuid("trainer_id")
      .notNull()
      .references(() => trainers.id, { onDelete: "restrict" }),
    roleInProject: varchar("role_in_project", { length: 64 }).default("Trainer").notNull(),
    assignedByUserId: uuid("assigned_by_user_id").references(() => users.id, {
      onDelete: "set null",
    }),
    assignedAt: timestamp("assigned_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("idx_unique_project_trainer").on(table.projectId, table.trainerId),
    index("idx_project_trainers_trainer").on(table.trainerId),
  ]
);

// 9. Global Dynamic Feedback Questions
export const feedbackQuestions = pgTable(
  "feedback_questions",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    questionKey: varchar("question_key", { length: 64 }).notNull().unique(),
    questionText: varchar("question_text", { length: 255 }).notNull(),
    questionType: questionTypeEnum("question_type").default("rating").notNull(),
    displayOrder: integer("display_order").default(0).notNull(),
    isRequired: boolean("is_required").default(true).notNull(),
    isActive: boolean("is_active").default(true).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  }
);

// 10. Student Feedback Responses
export const feedbackResponses = pgTable(
  "feedback_responses",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    trainerId: uuid("trainer_id")
      .notNull()
      .references(() => trainers.id, { onDelete: "cascade" }),
    projectId: uuid("project_id").references(() => projects.id, {
      onDelete: "set null",
    }),
    studentName: varchar("student_name", { length: 128 }),
    studentId: varchar("student_id", { length: 64 }).notNull(), // Mandatory Roll No
    improvementAreas: text("improvement_areas"),
    additionalComments: text("additional_comments"),
    ipAddress: inet("ip_address"),
    userAgent: varchar("user_agent", { length: 255 }),
    submittedAt: timestamp("submitted_at", { withTimezone: true }).defaultNow().notNull(),
    submittedDate: date("submitted_date").default(sql`CURRENT_DATE`).notNull(),
  },
  (table) => [
    // Unique Student Roll No per Trainer per Calendar Day
    uniqueIndex("idx_unique_student_feedback_daily").on(
      table.trainerId,
      sql`LOWER(TRIM(${table.studentId}))`,
      table.submittedDate
    ),
    index("idx_feedback_trainer_date").on(table.trainerId, table.submittedAt),
  ]
);

// 11. Student Feedback Answers (Per Question)
export const feedbackAnswers = pgTable(
  "feedback_answers",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    responseId: uuid("response_id")
      .notNull()
      .references(() => feedbackResponses.id, { onDelete: "cascade" }),
    questionId: uuid("question_id")
      .notNull()
      .references(() => feedbackQuestions.id, { onDelete: "restrict" }),
    ratingValue: smallint("rating_value"),
    textValue: text("text_value"),
  },
  (table) => [
    uniqueIndex("idx_unique_response_question").on(table.responseId, table.questionId),
  ]
);

// 12. Audit Logs Table (Captures Deletion & Mutation Snapshots)
export const auditLogs = pgTable(
  "audit_logs",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id").references(() => users.id, { onDelete: "set null" }),
    action: varchar("action", { length: 64 }).notNull(),
    entityName: varchar("entity_name", { length: 64 }).notNull(),
    entityId: uuid("entity_id").notNull(),
    oldValues: jsonb("old_values"),
    newValues: jsonb("new_values"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  }
);

// 13. System Settings (QR Form & Operational Configurations)
export const systemSettings = pgTable("system_settings", {
  key: varchar("key", { length: 64 }).primaryKey(),
  value: jsonb("value").notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

// 14. Drizzle Relations
export const usersRelations = relations(users, ({ many }) => ({
  skillCategoriesCreated: many(skillCategories),
  masterSubjectsCreated: many(masterSubjects),
  projectAssignments: many(projectTrainers),
  auditLogs: many(auditLogs),
}));

export const skillCategoriesRelations = relations(skillCategories, ({ one, many }) => ({
  createdByUser: one(users, {
    fields: [skillCategories.createdByUserId],
    references: [users.id],
  }),
  subjects: many(masterSubjects),
}));

export const masterSubjectsRelations = relations(masterSubjects, ({ one, many }) => ({
  category: one(skillCategories, {
    fields: [masterSubjects.categoryId],
    references: [skillCategories.id],
  }),
  createdByUser: one(users, {
    fields: [masterSubjects.createdByUserId],
    references: [users.id],
  }),
  trainerSkills: many(trainerSkills),
}));

export const trainersRelations = relations(trainers, ({ many }) => ({
  skills: many(trainerSkills),
  projectAssignments: many(projectTrainers),
  feedbackResponses: many(feedbackResponses),
}));

export const trainerSkillsRelations = relations(trainerSkills, ({ one }) => ({
  trainer: one(trainers, {
    fields: [trainerSkills.trainerId],
    references: [trainers.id],
  }),
  subject: one(masterSubjects, {
    fields: [trainerSkills.subjectId],
    references: [masterSubjects.id],
  }),
}));

export const projectsRelations = relations(projects, ({ many }) => ({
  assignedTrainers: many(projectTrainers),
  feedbackResponses: many(feedbackResponses),
}));

export const projectTrainersRelations = relations(projectTrainers, ({ one }) => ({
  project: one(projects, {
    fields: [projectTrainers.projectId],
    references: [projects.id],
  }),
  trainer: one(trainers, {
    fields: [projectTrainers.trainerId],
    references: [trainers.id],
  }),
  assignedByUser: one(users, {
    fields: [projectTrainers.assignedByUserId],
    references: [users.id],
  }),
}));

export const feedbackQuestionsRelations = relations(feedbackQuestions, ({ many }) => ({
  answers: many(feedbackAnswers),
}));

export const feedbackResponsesRelations = relations(feedbackResponses, ({ one, many }) => ({
  trainer: one(trainers, {
    fields: [feedbackResponses.trainerId],
    references: [trainers.id],
  }),
  project: one(projects, {
    fields: [feedbackResponses.projectId],
    references: [projects.id],
  }),
  answers: many(feedbackAnswers),
}));

export const feedbackAnswersRelations = relations(feedbackAnswers, ({ one }) => ({
  response: one(feedbackResponses, {
    fields: [feedbackAnswers.responseId],
    references: [feedbackResponses.id],
  }),
  question: one(feedbackQuestions, {
    fields: [feedbackAnswers.questionId],
    references: [feedbackQuestions.id],
  }),
}));

// Export inferred types for end-to-end type safety
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Trainer = typeof trainers.$inferSelect;
export type NewTrainer = typeof trainers.$inferInsert;
export type TrainerSkill = typeof trainerSkills.$inferSelect;
export type NewTrainerSkill = typeof trainerSkills.$inferInsert;
export type Project = typeof projects.$inferSelect;
export type NewProject = typeof projects.$inferInsert;
export type ProjectTrainer = typeof projectTrainers.$inferSelect;
export type NewProjectTrainer = typeof projectTrainers.$inferInsert;
export type SkillCategory = typeof skillCategories.$inferSelect;
export type MasterSubject = typeof masterSubjects.$inferSelect;
export type FeedbackQuestion = typeof feedbackQuestions.$inferSelect;
export type FeedbackResponse = typeof feedbackResponses.$inferSelect;
export type FeedbackAnswer = typeof feedbackAnswers.$inferSelect;
export type SystemSetting = typeof systemSettings.$inferSelect;
export type NewSystemSetting = typeof systemSettings.$inferInsert;
