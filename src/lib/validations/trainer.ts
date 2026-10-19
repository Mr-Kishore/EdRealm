import { z } from "zod";

export const SkillInputSchema = z.object({
  categoryId: z.string().optional(),
  newCategoryName: z.string().optional(),
  subjectId: z.string().optional(),
  newSubjectName: z.string().optional(),
  trainerType: z.enum(["Technical", "Aptitude", "Soft Skills", "Domain Expert"]).default("Technical"),
  expertiseLevel: z.enum(["Beginner", "Intermediate", "Advanced", "Expert"]).default("Intermediate"),
  subjectExperience: z.coerce.number().min(0, "Experience cannot be negative").default(0),
  canHandleLargeBatches: z.boolean().default(false),
  canConductMockInterviews: z.boolean().default(false),
  additionalSkills: z.array(z.string()).default([]),
  technicalSkills: z.array(z.string()).default([]),
});

export const CreateTrainerSchema = z.object({
  fullName: z.string().min(2, "Full name must be at least 2 characters").max(128),
  photoUrl: z.string().url("Must be a valid URL").or(z.literal("")).optional(),
  phone: z.string().min(10, "Phone number must be at least 10 digits").max(20),
  whatsapp: z.string().min(10, "WhatsApp number must be at least 10 digits").max(20),
  email: z.string().email("Invalid email address"),
  currentCity: z.string().min(2, "City is required"),
  currentState: z.string().min(2, "State is required"),
  country: z.string().default("India"),
  preferredLocations: z.array(z.string()).default([]),
  willingToTravelAnywhere: z.boolean().default(false),
  trainingModes: z.array(z.enum(["Offline", "Online", "Hybrid"])).min(1, "Select at least one mode"),
  totalExperience: z.coerce.number().min(0).default(0),
  trainingExperience: z.coerce.number().min(0).default(0),
  linkedinUrl: z.string().url("Must be a valid URL").or(z.literal("")).optional(),
  resumeUrl: z.string().url("Must be a valid Google Docs / Drive URL").or(z.literal("")).optional(),
  skills: z.array(SkillInputSchema).default([]),
});

export const UpdateTrainerSchema = CreateTrainerSchema.omit({ skills: true });

export type CreateTrainerInput = z.infer<typeof CreateTrainerSchema>;
export type UpdateTrainerInput = z.infer<typeof UpdateTrainerSchema>;
export type SkillInput = z.infer<typeof SkillInputSchema>;
