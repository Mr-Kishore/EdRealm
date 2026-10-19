import { z } from "zod";

export const SubmitFeedbackSchema = z.object({
  qrToken: z.string().min(1, "QR Token is required"),
  trainerId: z.string().uuid("Invalid Trainer ID"),
  projectId: z.string().uuid().optional().or(z.literal("")),
  studentName: z.string().max(128).optional().or(z.literal("")),
  studentId: z
    .string()
    .min(2, "Roll Number / Student ID is required")
    .max(64, "Roll Number too long")
    .regex(/^[a-zA-Z0-9\-_/]+$/, "Roll Number should contain only alphanumeric characters or hyphens"),
  improvementAreas: z.string().max(1000).optional().or(z.literal("")),
  additionalComments: z.string().max(2000).optional().or(z.literal("")),
  ratings: z.record(z.string(), z.number().int().min(1).max(5)),
  // Security honeypot trap
  faxNumberHoneypot: z.string().max(0, "Bot detected").optional().or(z.literal("")),
  renderedAt: z.number().optional(),
});

export type SubmitFeedbackInput = z.infer<typeof SubmitFeedbackSchema>;
