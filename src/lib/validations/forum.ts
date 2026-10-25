import { z } from "zod";

export const CreateForumPostSchema = z.object({
  category_id: z.string().uuid("Pilih kategori diskusi yang valid"),
  title: z
    .string()
    .trim()
    .min(8, "Judul diskusi minimal 8 karakter")
    .max(160, "Judul diskusi maksimal 160 karakter"),
  content: z
    .string()
    .trim()
    .min(20, "Isi diskusi minimal 20 karakter agar jelas bagi anggota lain")
    .max(5000, "Isi diskusi maksimal 5000 karakter"),
});

export const UpdateForumPostSchema = CreateForumPostSchema;

export const CreateForumCommentSchema = z.object({
  content: z
    .string()
    .trim()
    .min(3, "Komentar minimal 3 karakter")
    .max(2000, "Komentar maksimal 2000 karakter"),
});

export type CreateForumPostInput = z.infer<typeof CreateForumPostSchema>;
export type UpdateForumPostInput = z.infer<typeof UpdateForumPostSchema>;
export type CreateForumCommentInput = z.infer<typeof CreateForumCommentSchema>;

