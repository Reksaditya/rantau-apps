import { z } from "zod";

export const AssistantChatRequestSchema = z.object({
  conversation_id: z.string().uuid().nullable().optional(),
  roadmap_id: z.string().uuid().nullable().optional(),
  message: z
    .string()
    .trim()
    .min(2, "Pesan pertanyaan tidak boleh kosong")
    .max(2000, "Pesan maksimal 2000 karakter"),
});

export type AssistantChatRequest = z.infer<typeof AssistantChatRequestSchema>;

