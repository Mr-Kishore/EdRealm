CREATE TYPE "public"."expertise_level" AS ENUM('Beginner', 'Intermediate', 'Advanced', 'Expert');--> statement-breakpoint
CREATE TYPE "public"."project_status" AS ENUM('upcoming', 'ongoing', 'completed', 'cancelled');--> statement-breakpoint
CREATE TYPE "public"."question_type" AS ENUM('rating', 'text');--> statement-breakpoint
CREATE TYPE "public"."trainer_type" AS ENUM('Technical', 'Aptitude', 'Soft Skills', 'Domain Expert');--> statement-breakpoint
CREATE TYPE "public"."training_mode" AS ENUM('Offline', 'Online', 'Hybrid');--> statement-breakpoint
CREATE TYPE "public"."user_role" AS ENUM('super_admin', 'admin', 'coordinator');--> statement-breakpoint
CREATE SEQUENCE IF NOT EXISTS "public"."trainer_code_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1;--> statement-breakpoint
CREATE TABLE "audit_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid,
	"action" varchar(64) NOT NULL,
	"entity_name" varchar(64) NOT NULL,
	"entity_id" uuid NOT NULL,
	"old_values" jsonb,
	"new_values" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "feedback_answers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"response_id" uuid NOT NULL,
	"question_id" uuid NOT NULL,
	"rating_value" smallint,
	"text_value" text
);
--> statement-breakpoint
CREATE TABLE "feedback_questions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"question_key" varchar(64) NOT NULL,
	"question_text" varchar(255) NOT NULL,
	"question_type" "question_type" DEFAULT 'rating' NOT NULL,
	"display_order" integer DEFAULT 0 NOT NULL,
	"is_required" boolean DEFAULT true NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "feedback_questions_question_key_unique" UNIQUE("question_key")
);
--> statement-breakpoint
CREATE TABLE "feedback_responses" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"trainer_id" uuid NOT NULL,
	"project_id" uuid,
	"student_name" varchar(128),
	"student_id" varchar(64) NOT NULL,
	"improvement_areas" text,
	"additional_comments" text,
	"ip_address" "inet",
	"user_agent" varchar(255),
	"submitted_at" timestamp with time zone DEFAULT now() NOT NULL,
	"submitted_date" date DEFAULT CURRENT_DATE NOT NULL
);
--> statement-breakpoint
CREATE TABLE "master_subjects" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"category_id" uuid NOT NULL,
	"name" varchar(64) NOT NULL,
	"is_custom" boolean DEFAULT false NOT NULL,
	"created_by_user_id" uuid,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "project_trainers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"project_id" uuid NOT NULL,
	"trainer_id" uuid NOT NULL,
	"role_in_project" varchar(64) DEFAULT 'Trainer' NOT NULL,
	"assigned_by_user_id" uuid,
	"assigned_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "projects" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"project_name" varchar(255) NOT NULL,
	"start_date" date NOT NULL,
	"end_date" date NOT NULL,
	"place" varchar(128) NOT NULL,
	"contact_person_name" varchar(128) NOT NULL,
	"contact_person_phone" varchar(20) NOT NULL,
	"contact_person_email" varchar(255),
	"status" "project_status" DEFAULT 'upcoming' NOT NULL,
	"status_override" boolean DEFAULT false NOT NULL,
	"notes" text,
	"deleted_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "skill_categories" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(64) NOT NULL,
	"is_custom" boolean DEFAULT false NOT NULL,
	"created_by_user_id" uuid,
	"display_order" integer DEFAULT 0 NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "system_settings" (
	"key" varchar(64) PRIMARY KEY NOT NULL,
	"value" jsonb NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "trainer_skills" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"trainer_id" uuid NOT NULL,
	"subject_id" uuid NOT NULL,
	"trainer_type" "trainer_type" DEFAULT 'Technical' NOT NULL,
	"expertise_level" "expertise_level" DEFAULT 'Intermediate' NOT NULL,
	"subject_experience" numeric(4, 1) DEFAULT '0.0' NOT NULL,
	"can_handle_large_batches" boolean DEFAULT false NOT NULL,
	"can_conduct_mock_interviews" boolean DEFAULT false NOT NULL,
	"additional_skills" text[] DEFAULT '{}'::text[] NOT NULL,
	"technical_skills" text[] DEFAULT '{}'::text[] NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "trainers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"trainer_code" varchar(16) DEFAULT 'TR-' || LPAD(nextval('trainer_code_seq')::TEXT, 4, '0') NOT NULL,
	"full_name" varchar(128) NOT NULL,
	"photo_url" text,
	"phone" varchar(20) NOT NULL,
	"whatsapp" varchar(20) NOT NULL,
	"email" varchar(255) NOT NULL,
	"current_city" varchar(64) NOT NULL,
	"current_state" varchar(64) NOT NULL,
	"country" varchar(64) DEFAULT 'India' NOT NULL,
	"preferred_locations" text[] DEFAULT '{}'::text[] NOT NULL,
	"willing_to_travel_anywhere" boolean DEFAULT false NOT NULL,
	"training_modes" varchar(16)[] DEFAULT '{Offline}'::varchar[] NOT NULL,
	"total_experience" numeric(4, 1) DEFAULT '0.0' NOT NULL,
	"training_experience" numeric(4, 1) DEFAULT '0.0' NOT NULL,
	"linkedin_url" text,
	"resume_url" text,
	"qr_token" varchar(64) NOT NULL,
	"qr_active" boolean DEFAULT true NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"cached_rating" numeric(3, 2) DEFAULT '0.00' NOT NULL,
	"cached_reviews_count" integer DEFAULT 0 NOT NULL,
	"cached_criteria_scores" jsonb DEFAULT '{"knowledge":0,"concept_clarity":0,"problem_solving":0,"doubt_clarification":0,"communication":0,"punctuality":0,"overall_satisfaction":0}'::jsonb NOT NULL,
	"deleted_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "trainers_trainer_code_unique" UNIQUE("trainer_code"),
	CONSTRAINT "trainers_qr_token_unique" UNIQUE("qr_token")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" varchar(255) NOT NULL,
	"password_hash" varchar(255) NOT NULL,
	"full_name" varchar(128) NOT NULL,
	"role" "user_role" DEFAULT 'admin' NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "feedback_answers" ADD CONSTRAINT "feedback_answers_response_id_feedback_responses_id_fk" FOREIGN KEY ("response_id") REFERENCES "public"."feedback_responses"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "feedback_answers" ADD CONSTRAINT "feedback_answers_question_id_feedback_questions_id_fk" FOREIGN KEY ("question_id") REFERENCES "public"."feedback_questions"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "feedback_responses" ADD CONSTRAINT "feedback_responses_trainer_id_trainers_id_fk" FOREIGN KEY ("trainer_id") REFERENCES "public"."trainers"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "feedback_responses" ADD CONSTRAINT "feedback_responses_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "master_subjects" ADD CONSTRAINT "master_subjects_category_id_skill_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."skill_categories"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "master_subjects" ADD CONSTRAINT "master_subjects_created_by_user_id_users_id_fk" FOREIGN KEY ("created_by_user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_trainers" ADD CONSTRAINT "project_trainers_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_trainers" ADD CONSTRAINT "project_trainers_trainer_id_trainers_id_fk" FOREIGN KEY ("trainer_id") REFERENCES "public"."trainers"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_trainers" ADD CONSTRAINT "project_trainers_assigned_by_user_id_users_id_fk" FOREIGN KEY ("assigned_by_user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "skill_categories" ADD CONSTRAINT "skill_categories_created_by_user_id_users_id_fk" FOREIGN KEY ("created_by_user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "trainer_skills" ADD CONSTRAINT "trainer_skills_trainer_id_trainers_id_fk" FOREIGN KEY ("trainer_id") REFERENCES "public"."trainers"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "trainer_skills" ADD CONSTRAINT "trainer_skills_subject_id_master_subjects_id_fk" FOREIGN KEY ("subject_id") REFERENCES "public"."master_subjects"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "idx_unique_response_question" ON "feedback_answers" USING btree ("response_id","question_id");--> statement-breakpoint
CREATE UNIQUE INDEX "idx_unique_student_feedback_daily" ON "feedback_responses" USING btree ("trainer_id",LOWER(TRIM("student_id")),"submitted_date");--> statement-breakpoint
CREATE INDEX "idx_feedback_trainer_date" ON "feedback_responses" USING btree ("trainer_id","submitted_at");--> statement-breakpoint
CREATE UNIQUE INDEX "idx_unique_subject_per_category_ci" ON "master_subjects" USING btree ("category_id",LOWER(TRIM("name")));--> statement-breakpoint
CREATE UNIQUE INDEX "idx_unique_project_trainer" ON "project_trainers" USING btree ("project_id","trainer_id");--> statement-breakpoint
CREATE INDEX "idx_project_trainers_trainer" ON "project_trainers" USING btree ("trainer_id");--> statement-breakpoint
CREATE INDEX "idx_projects_status_dates" ON "projects" USING btree ("status","start_date","end_date");--> statement-breakpoint
CREATE UNIQUE INDEX "idx_unique_category_name_ci" ON "skill_categories" USING btree (LOWER(TRIM("name")));--> statement-breakpoint
CREATE UNIQUE INDEX "idx_unique_trainer_subject" ON "trainer_skills" USING btree ("trainer_id","subject_id");--> statement-breakpoint
CREATE INDEX "idx_trainer_skills_subject" ON "trainer_skills" USING btree ("subject_id","trainer_id");--> statement-breakpoint
CREATE INDEX "idx_trainers_search_geo" ON "trainers" USING btree ("current_city","current_state");--> statement-breakpoint
CREATE INDEX "idx_trainers_rating" ON "trainers" USING btree ("cached_rating");--> statement-breakpoint
CREATE INDEX "idx_trainers_qr" ON "trainers" USING btree ("qr_token");--> statement-breakpoint
CREATE INDEX "idx_trainers_pref_locs" ON "trainers" USING gin ("preferred_locations");