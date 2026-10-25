import { z } from "zod";

export const BookConsultationSchema = z.object({
  mentor_id: z.string().uuid("ID mentor tidak valid"),
  availability_id: z.string().uuid("Pilih slot jadwal yang tersedia"),
  business_topic: z
    .string()
    .trim()
    .min(5, "Topik konsultasi minimal 5 karakter")
    .max(150, "Topik konsultasi maksimal 150 karakter"),
  question_notes: z
    .string()
    .trim()
    .min(15, "Tuliskan konteks dan pertanyaan utama minimal 15 karakter")
    .max(1500, "Catatan pertanyaan maksimal 1500 karakter"),
});

export const UpdateConsultationStatusSchema = z.object({
  status: z.enum(["completed", "cancelled"]),
  meeting_notes: z.string().trim().max(2000).optional(),
});

export const SwitchPlanMvpSchema = z.object({
  plan_tier: z.enum(["starter", "growth", "max"]),
});

export type BookConsultationInput = z.infer<typeof BookConsultationSchema>;
export type UpdateConsultationStatusInput = z.infer<
  typeof UpdateConsultationStatusSchema
>;

