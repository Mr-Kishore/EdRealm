import { z } from "zod";

export const ProjectBaseSchema = z.object({
  projectName: z
    .string()
    .min(2, "Project name must be at least 2 characters")
    .max(255, "Project name must not exceed 255 characters"),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Start date must be in YYYY-MM-DD format"),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "End date must be in YYYY-MM-DD format"),
  place: z
    .string()
    .min(2, "Location/Place must be at least 2 characters")
    .max(128, "Place must not exceed 128 characters"),
  contactPersonName: z
    .string()
    .min(2, "Contact person name is required")
    .max(128),
  contactPersonPhone: z
    .string()
    .min(7, "Valid phone number is required")
    .max(20),
  contactPersonEmail: z
    .string()
    .email("Invalid email address")
    .optional()
    .or(z.literal("")),
  notes: z.string().optional().or(z.literal("")),
  statusOverride: z.boolean().default(false),
  status: z.enum(["upcoming", "ongoing", "completed"]).default("upcoming"),
});

export const CreateProjectSchema = ProjectBaseSchema.refine(
  (data) => new Date(data.endDate) >= new Date(data.startDate),
  {
    message: "End date must be on or after start date",
    path: ["endDate"],
  }
);

export const UpdateProjectSchema = ProjectBaseSchema.partial().refine(
  (data) => {
    if (data.startDate && data.endDate) {
      return new Date(data.endDate) >= new Date(data.startDate);
    }
    return true;
  },
  {
    message: "End date must be on or after start date",
    path: ["endDate"],
  }
);

export const AssignTrainerSchema = z.object({
  projectId: z.string().uuid("Invalid project ID"),
  trainerId: z.string().uuid("Invalid trainer ID"),
  roleInProject: z.string().default("Trainer"),
  force: z.boolean().default(false),
});

export type CreateProjectInput = z.infer<typeof CreateProjectSchema>;
export type UpdateProjectInput = z.infer<typeof UpdateProjectSchema>;
export type AssignTrainerInput = z.infer<typeof AssignTrainerSchema>;
