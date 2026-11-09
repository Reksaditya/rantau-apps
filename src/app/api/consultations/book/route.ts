import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { BookConsultationSchema } from "@/lib/validations/consultation";
import {
  getUserPlanTier,
  PLAN_ENTITLEMENTS,
} from "@/lib/subscription/entitlements";

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

    const parsed = BookConsultationSchema.safeParse(rawBody);
    if (!parsed.success) {
      return NextResponse.json(
        {
          error: "Formulir pemesanan konsultasi belum lengkap.",
          details: parsed.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    // Langkah 3: Verifikasi entitlement paket langganan (Hanya Rintis Max)
    const planTier = await getUserPlanTier(supabase, user.id);
    const entitlement = PLAN_ENTITLEMENTS[planTier];

    if (!entitlement.canBookMentor) {
      return NextResponse.json(
        {
          error:
            "Pemesanan sesi konsultasi 1-on-1 bersama Mentor tersedia khusus untuk pelanggan paket Rintis Max. Silakan tingkatkan paket Anda pada menu Langganan.",
        },
        { status: 403 }
      );
    }

    // Langkah 4: Periksa ketersediaan slot & cegah double booking
    const { mentor_id, availability_id, business_topic, question_notes } =
      parsed.data;

    const { data: slot } = await supabase
      .from("mentor_availability")
      .select("id, mentor_id, slot_start, slot_end, is_booked")
      .eq("id", availability_id)
      .eq("mentor_id", mentor_id)
      .maybeSingle();

    if (!slot) {
      return NextResponse.json(
        { error: "Slot jadwal tidak ditemukan pada mentor ini." },
        { status: 404 }
      );
    }

    if (slot.is_booked || new Date(slot.slot_start) <= new Date()) {
      return NextResponse.json(
        {
          error:
            "Slot jadwal ini sudah dipesan oleh pengguna lain atau waktu sesi telah lewat. Silakan pilih slot waktu lainnya.",
        },
        { status: 409 }
      );
    }

    // Tandai slot secara kondisional hanya jika is_booked masih false
    const { data: claimedSlot, error: claimError } = await supabase
      .from("mentor_availability")
      .update({ is_booked: true })
      .eq("id", availability_id)
      .eq("is_booked", false)
      .select("id")
      .maybeSingle();

    if (claimError || !claimedSlot) {
      return NextResponse.json(
        {
          error:
            "Slot jadwal baru saja dipesan oleh pengguna lain. Silakan pilih jadwal lainnya.",
        },
        { status: 409 }
      );
    }

    const { data: booking, error: bookingError } = await supabase
      .from("consultation_bookings")
      .insert({
        user_id: user.id,
        mentor_id,
        availability_id,
        business_topic,
        question_notes,
        status: "confirmed",
      })
      .select("*")
      .single();

    if (bookingError || !booking) {
      // Kembalikan status slot jika insert gagal karena unique constraint (409)
      await supabase
        .from("mentor_availability")
        .update({ is_booked: false })
        .eq("id", availability_id);

      return NextResponse.json(
        {
          error:
            "Gagal mengonfirmasi jadwal karena slot sudah terisi. Silakan pilih slot waktu lain.",
        },
        { status: 409 }
      );
    }

    // Langkah 5: Kembalikan respons JSON terstruktur
    return NextResponse.json(
      {
        message: "Jadwal konsultasi 1-on-1 berhasil dikonfirmasi.",
        booking,
      },
      { status: 201 }
    );
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Gagal memproses pemesanan konsultasi.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

