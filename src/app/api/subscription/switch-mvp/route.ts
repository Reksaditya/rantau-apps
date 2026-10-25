import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { SwitchPlanMvpSchema } from "@/lib/validations/consultation";
import { PLAN_ENTITLEMENTS } from "@/lib/subscription/entitlements";

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

    const parsed = SwitchPlanMvpSchema.safeParse(rawBody);
    if (!parsed.success) {
      return NextResponse.json(
        {
          error: "Pilihan paket tidak valid.",
          details: parsed.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const { plan_tier } = parsed.data;
    const now = new Date();
    const periodEnd = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

    // Langkah 4: Simpan perubahan paket ke tabel subscriptions secara aman di server
    const { data: subscription, error: upsertError } = await supabase
      .from("subscriptions")
      .upsert(
        {
          user_id: user.id,
          plan_tier,
          status: "active",
          current_period_start: now.toISOString(),
          current_period_end: periodEnd.toISOString(),
          updated_at: now.toISOString(),
        },
        { onConflict: "user_id" }
      )
      .select("*")
      .single();

    if (upsertError || !subscription) {
      return NextResponse.json(
        { error: "Gagal memperbarui paket langganan di database." },
        { status: 500 }
      );
    }

    const entitlement = PLAN_ENTITLEMENTS[plan_tier];

    // Langkah 5: Kembalikan respons JSON terstruktur
    return NextResponse.json({
      message: `Paket langganan berhasil diubah ke ${entitlement.name} (Mode Simulasi MVP).`,
      subscription,
      entitlement,
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Gagal mengubah paket langganan.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

