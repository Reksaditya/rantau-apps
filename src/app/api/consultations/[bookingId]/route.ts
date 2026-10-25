import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { UpdateConsultationStatusSchema } from "@/lib/validations/consultation";

export async function PATCH(
  request: Request,
  context: { params: Promise<{ bookingId: string }> }
) {
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

    const { bookingId } = await context.params;

    // Langkah 2: Validasi request body menggunakan Zod
    let rawBody: unknown;
    try {
      rawBody = await request.json();
    } catch {
      return NextResponse.json(
        { error: "Format JSON tidak valid." },
        { status: 400 }
      );
    }

    const parsed = UpdateConsultationStatusSchema.safeParse(rawBody);
    if (!parsed.success) {
      return NextResponse.json(
        {
          error: "Data pembaruan status konsultasi tidak valid.",
          details: parsed.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    // Langkah 4: Pencegahan IDOR (.eq('user_id', user.id))
    const { data: existingBooking } = await supabase
      .from("consultation_bookings")
      .select("id, availability_id, status")
      .eq("id", bookingId)
      .eq("user_id", user.id)
      .maybeSingle();

    if (!existingBooking) {
      return NextResponse.json(
        { error: "Jadwal konsultasi tidak ditemukan." },
        { status: 404 }
      );
    }

    const updatePayload: {
      status: "completed" | "cancelled";
      updated_at: string;
      meeting_notes?: string;
    } = {
      status: parsed.data.status,
      updated_at: new Date().toISOString(),
    };

    if (parsed.data.meeting_notes !== undefined) {
      updatePayload.meeting_notes = parsed.data.meeting_notes;
    }

    const { data: updatedBooking, error: updateError } = await supabase
      .from("consultation_bookings")
      .update(updatePayload)
      .eq("id", bookingId)
      .eq("user_id", user.id)
      .select("*")
      .single();

    if (updateError || !updatedBooking) {
      return NextResponse.json(
        { error: "Gagal memperbarui status konsultasi." },
        { status: 500 }
      );
    }

    // Jika dibatalkan, bebaskan kembali slot jadwal mentor agar dapat dipesan kembali
    if (parsed.data.status === "cancelled") {
      await supabase
        .from("mentor_availability")
        .update({ is_booked: false })
        .eq("id", existingBooking.availability_id);
    }

    return NextResponse.json({
      message:
        parsed.data.status === "cancelled"
          ? "Jadwal konsultasi telah dibatalkan."
          : "Sesi konsultasi ditandai selesai.",
      booking: updatedBooking,
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Gagal memperbarui status konsultasi.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

