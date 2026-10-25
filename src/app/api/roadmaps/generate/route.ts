import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { GenerateRoadmapRequestSchema } from "@/lib/validations/roadmap";
import { checkAndIncrementDailyQuota } from "@/lib/subscription/entitlements";
import {
  generateBusinessRoadmapWithAI,
  GeminiServiceError,
} from "@/lib/ai/gemini";

export async function POST(request: Request) {
  try {
    // Langkah 1: Verifikasi autentikasi pengguna
    const supabase = await createServerSupabaseClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: "Sesi Anda telah berakhir. Silakan masuk kembali." },
        { status: 401 }
      );
    }

    // Langkah 2: Validasi request body menggunakan Zod
    let rawBody: unknown;
    try {
      rawBody = await request.json();
    } catch {
      return NextResponse.json(
        { error: "Format permintaan JSON tidak valid." },
        { status: 400 }
      );
    }

    const parsed = GenerateRoadmapRequestSchema.safeParse(rawBody);
    if (!parsed.success) {
      return NextResponse.json(
        {
          error: "Data formulir belum lengkap atau belum sesuai format.",
          details: parsed.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const input = parsed.data;

    // Langkah 3: Verifikasi entitlement paket langganan & kuota harian di server
    const quota = await checkAndIncrementDailyQuota(
      supabase,
      user.id,
      "roadmap_generation"
    );

    if (!quota.allowed) {
      return NextResponse.json(
        {
          error: `Kuota pembuatan roadmap harian Anda (${quota.dailyLimit}x/hari pada paket ${quota.planTier.toUpperCase()}) telah habis untuk hari ini. Kuota akan di-reset otomatis pukul 00:00 WIB atau tingkatkan paket Anda.`,
          quota,
        },
        { status: 429 }
      );
    }

    // Langkah 4: Jalankan logika bisnis utama (Simpan profil bisnis + panggil Gemini API + simpan roadmap ber-versi)
    if (input.save_to_business_profile) {
      await supabase.from("business_profiles").upsert(
        {
          user_id: user.id,
          business_name: input.business_name,
          business_stage: input.business_stage,
          industry_category: input.industry_category,
          product_description: input.product_description,
          target_customer: input.target_customer,
          operational_location: input.operational_location,
          estimated_capital: input.estimated_capital,
          business_goals: input.business_goals,
          main_challenges: input.main_challenges,
          prior_experience: input.prior_experience,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "user_id" }
      );

      await supabase
        .from("profiles")
        .update({
          onboarding_completed: true,
          updated_at: new Date().toISOString(),
        })
        .eq("id", user.id);
    }

    const aiRoadmap = await generateBusinessRoadmapWithAI(input);

    // Hitung versi roadmap berikutnya untuk pengguna ini (tanpa menimpa roadmap lama)
    const { data: latestRoadmap } = await supabase
      .from("roadmaps")
      .select("version")
      .eq("user_id", user.id)
      .order("version", { ascending: false })
      .limit(1)
      .maybeSingle();

    const nextVersion = (latestRoadmap?.version ?? 0) + 1;

    const { data: insertedRoadmap, error: roadmapInsertError } = await supabase
      .from("roadmaps")
      .insert({
        user_id: user.id,
        version: nextVersion,
        title: aiRoadmap.title,
        business_name: input.business_name,
        business_stage: input.business_stage,
        industry_category: input.industry_category,
        target_customer: input.target_customer,
        operational_location: input.operational_location,
        estimated_capital: input.estimated_capital,
        input_payload: input,
        business_summary: aiRoadmap.business_summary,
        problem_opportunity_analysis: aiRoadmap.problem_opportunity_analysis,
        target_market_analysis: aiRoadmap.target_market_analysis,
        validation_or_evaluation: aiRoadmap.validation_or_evaluation,
        value_proposition: aiRoadmap.value_proposition,
        business_model_revenue: aiRoadmap.business_model_revenue,
        capital_cost_estimation: aiRoadmap.capital_cost_estimation,
        marketing_acquisition_strategy:
          aiRoadmap.marketing_acquisition_strategy,
        operational_plan: aiRoadmap.operational_plan,
        risks_and_mitigation: aiRoadmap.risks_and_mitigation,
        next_priority_actions: aiRoadmap.next_priority_actions,
        disclaimer_note: aiRoadmap.disclaimer_note,
        progress_percentage: 0,
      })
      .select("*")
      .single();

    if (roadmapInsertError || !insertedRoadmap) {
      return NextResponse.json(
        {
          error:
            "Gagal menyimpan dokumen roadmap ke database. Pastikan skema migrasi Supabase telah dijalankan.",
        },
        { status: 500 }
      );
    }

    // Simpan setiap tahap (stages) dan daftar tindakan (tasks)
    const sortedStages = [...aiRoadmap.stages].sort(
      (a, b) => a.stage_order - b.stage_order
    );

    for (let i = 0; i < sortedStages.length; i++) {
      const stageData = sortedStages[i];
      const { data: insertedStage, error: stageError } = await supabase
        .from("roadmap_stages")
        .insert({
          roadmap_id: insertedRoadmap.id,
          user_id: user.id,
          stage_order: i + 1,
          title: stageData.title,
          goal: stageData.goal,
          description: stageData.description,
          estimated_duration: stageData.estimated_duration,
        })
        .select("id")
        .single();

      if (!stageError && insertedStage && stageData.tasks.length > 0) {
        const tasksToInsert = stageData.tasks.map((task, idx) => ({
          roadmap_id: insertedRoadmap.id,
          stage_id: insertedStage.id,
          user_id: user.id,
          task_order: idx + 1,
          title: task.title,
          description: task.description,
          priority: task.priority,
          estimated_duration: task.estimated_duration,
          expected_output: task.expected_output,
          success_indicator: task.success_indicator,
          dependency: task.dependency || "Tidak ada",
          status: "not_started" as const,
        }));

        await supabase.from("roadmap_tasks").insert(tasksToInsert);
      }
    }

    // Langkah 5: Kembalikan respons JSON terstruktur
    return NextResponse.json(
      {
        message: "Roadmap bisnis berhasil disusun dan disimpan.",
        roadmapId: insertedRoadmap.id,
        version: nextVersion,
        quota,
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof GeminiServiceError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.statusCode }
      );
    }

    const message =
      error instanceof Error
        ? error.message
        : "Terjadi kesalahan internal saat menyusun roadmap.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

