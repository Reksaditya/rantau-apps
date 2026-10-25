import { z } from "zod";

export const BusinessStageSchema = z.enum(["not_started", "starting", "running"]);

export const BusinessProfileInputSchema = z.object({
  business_name: z
    .string()
    .trim()
    .min(2, "Nama atau ide bisnis minimal 2 karakter")
    .max(120, "Nama bisnis maksimal 120 karakter"),
  business_stage: BusinessStageSchema,
  industry_category: z
    .string()
    .trim()
    .min(2, "Pilih atau isi kategori industri")
    .max(80, "Kategori industri maksimal 80 karakter"),
  product_description: z
    .string()
    .trim()
    .min(15, "Jelaskan produk atau jasa Anda minimal 15 karakter")
    .max(1500, "Deskripsi produk maksimal 1500 karakter"),
  target_customer: z
    .string()
    .trim()
    .min(5, "Sebutkan target pelanggan minimal 5 karakter")
    .max(500, "Target pelanggan maksimal 500 karakter"),
  operational_location: z
    .string()
    .trim()
    .min(3, "Sebutkan lokasi operasional minimal 3 karakter")
    .max(150, "Lokasi operasional maksimal 150 karakter"),
  estimated_capital: z
    .string()
    .trim()
    .min(2, "Pilih atau tuliskan estimasi modal usaha")
    .max(120, "Estimasi modal maksimal 120 karakter"),
  business_goals: z
    .string()
    .trim()
    .min(10, "Jelaskan tujuan bisnis Anda minimal 10 karakter")
    .max(1000, "Tujuan bisnis maksimal 1000 karakter"),
  main_challenges: z
    .string()
    .trim()
    .min(10, "Jelaskan kendala utama yang dihadapi minimal 10 karakter")
    .max(1000, "Kendala utama maksimal 1000 karakter"),
  prior_experience: z
    .string()
    .trim()
    .min(2, "Tuliskan pengalaman bisnis sebelumnya")
    .max(500, "Pengalaman bisnis maksimal 500 karakter"),
});

export type BusinessProfileInput = z.infer<typeof BusinessProfileInputSchema>;

export const GenerateRoadmapRequestSchema = BusinessProfileInputSchema.extend({
  save_to_business_profile: z.boolean().optional().default(true),
});

export type GenerateRoadmapRequest = z.infer<typeof GenerateRoadmapRequestSchema>;

export const TaskPrioritySchema = z.enum(["low", "medium", "high"]);
export const TaskStatusSchema = z.enum(["not_started", "in_progress", "completed"]);

export const UpdateTaskStatusSchema = z.object({
  status: TaskStatusSchema,
});

export const RoadmapTaskAISchema = z.object({
  title: z.string().min(3),
  description: z.string().min(5),
  priority: TaskPrioritySchema,
  estimated_duration: z.string().min(2),
  expected_output: z.string().min(3),
  success_indicator: z.string().min(3),
  dependency: z.string().default("Tidak ada"),
});

export const RoadmapStageAISchema = z.object({
  stage_order: z.number().int().min(1),
  title: z.string().min(3),
  goal: z.string().min(5),
  description: z.string().min(10),
  estimated_duration: z.string().min(2),
  tasks: z.array(RoadmapTaskAISchema).min(2).max(8),
});

export const RiskMitigationAISchema = z.object({
  risk: z.string().min(3),
  impact: z.enum(["low", "medium", "high"]),
  mitigation: z.string().min(5),
});

export const RoadmapAIResponseSchema = z.object({
  title: z.string().min(5),
  business_summary: z.string().min(20),
  problem_opportunity_analysis: z.string().min(20),
  target_market_analysis: z.string().min(20),
  validation_or_evaluation: z.string().min(20),
  value_proposition: z.string().min(20),
  business_model_revenue: z.string().min(20),
  capital_cost_estimation: z.string().min(20),
  marketing_acquisition_strategy: z.string().min(20),
  operational_plan: z.string().min(20),
  stages: z.array(RoadmapStageAISchema).min(4).max(7),
  risks_and_mitigation: z.array(RiskMitigationAISchema).min(2).max(6),
  next_priority_actions: z.array(z.string().min(5)).min(3).max(6),
  disclaimer_note: z.string().min(15),
});

export type RoadmapAIResponse = z.infer<typeof RoadmapAIResponseSchema>;

