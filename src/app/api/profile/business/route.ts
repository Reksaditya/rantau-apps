import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { BusinessProfileInputSchema } from "@/lib/validations/roadmap";
import { z } from "zod";

const ProfileAndBusinessSchema = BusinessProfileInputSchema.extend({
  full_name: z
    .string()
    .trim()
    .min(2, "Nama lengkap minimal 2 karakter")
    .max(100, "Nama lengkap maksimal 100 karakter")
    .optional(),
});

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
        { error: "Sesi tidak valid. Silakan masuk kembali." },
        { status: 401 }
      );
    }

    // Langkah 2: Validasi request body menggunakan skema Zod
    let rawBody: unknown;
    try {
      rawBody = await request.json();
    } catch {
      return NextResponse.json(
        { error: "Format permintaan JSON tidak valid." },
        { status: 400 }
      );
    }

    const parsed = ProfileAndBusinessSchema.safeParse(rawBody);
    if (!parsed.success) {
      return NextResponse.json(
        {
          error: "Data profil usaha belum lengkap atau tidak sesuai format.",
          details: parsed.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const input = parsed.data;
    const nowIso = new Date().toISOString();

    // Pastikan baris profiles tersedia
    await supabase.from("profiles").upsert(
      {
        id: user.id,
        full_name:
          input.full_name ||
          (user.user_metadata?.full_name as string) ||
          user.email?.split("@")[0] ||
          "Entrepreneur Rantau",
        email: user.email || "",
        onboarding_completed: true,
        updated_at: nowIso,
      },
      { onConflict: "id" }
    );

    const { data: businessProfile, error: upsertError } = await supabase
      .from("business_profiles")
      .upsert(
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
          updated_at: nowIso,
        },
        { onConflict: "user_id" }
      )
      .select("*")
      .single();

    if (upsertError || !businessProfile) {
      return NextResponse.json(
        { error: "Gagal menyimpan profil bisnis ke database." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: "Profil bisnis berhasil disimpan.",
      businessProfile,
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Gagal menyimpan profil bisnis.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

