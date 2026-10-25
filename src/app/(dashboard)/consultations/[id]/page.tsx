import { notFound } from "next/navigation";
import Link from "next/link";
import { Calendar, Clock } from "lucide-react";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getPublicEnv } from "@/lib/env";
import { Badge } from "@/components/ui/Badge";
import { ConsultationActionsClient } from "@/components/mentors/ConsultationActionsClient";
import type { ConsultationBooking } from "@/types/database";

export default async function ConsultationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { isSupabaseConfigured } = getPublicEnv();
  if (!isSupabaseConfigured) {
    notFound();
  }

  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    notFound();
  }

  const { data } = await supabase
    .from("consultation_bookings")
    .select(
      `
      *,
      mentor:mentors!consultation_bookings_mentor_id_fkey(*),
      availability:mentor_availability!consultation_bookings_availability_id_fkey(*)
    `
    )
    .eq("id", id)
    .eq("user_id", user.id)
    .maybeSingle();

  if (!data) {
    notFound();
  }

  const booking = data as unknown as ConsultationBooking;
  const slotStart = booking.availability?.slot_start;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Link
          href="/consultations"
          className="text-sm font-semibold text-[#1B8366] hover:underline"
        >
          Kembali ke Konsultasi Saya
        </Link>
      </div>

      <section className="rounded-xl border border-[#E1E8E4] bg-[#FFFFFF] p-6 space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Badge
              variant={
                booking.status === "confirmed"
                  ? "completed"
                  : booking.status === "completed"
                  ? "in_progress"
                  : "error"
              }
            >
              {booking.status === "confirmed"
                ? "Jadwal Terkonfirmasi"
                : booking.status === "completed"
                ? "Sesi Selesai"
                : "Jadwal Dibatalkan"}
            </Badge>
            {booking.mentor?.is_demo_data && (
              <Badge variant="warning">Data Demo MVP</Badge>
            )}
          </div>
        </div>

        <div>
          <h1 className="font-heading text-2xl font-bold text-[#172B25]">
            {booking.business_topic}
          </h1>
          <p className="mt-1 text-sm text-[#52645D]">
            Bersama Mentor:{" "}
            <strong className="font-semibold text-[#172B25]">
              {booking.mentor?.full_name}
            </strong>{" "}
            — {booking.mentor?.role_headline}
          </p>
        </div>

        {slotStart && (
          <div className="rounded-xl border border-[#E1E8E4] bg-[#F8FAF9] p-4 flex flex-wrap items-center gap-6 text-xs sm:text-sm text-[#172B25]">
            <span className="inline-flex items-center gap-2 font-medium">
              <Calendar className="h-4 w-4 text-[#1B8366]" />
              {new Intl.DateTimeFormat("id-ID", {
                weekday: "long",
                day: "numeric",
                month: "long",
                year: "numeric",
                timeZone: "Asia/Jakarta",
              }).format(new Date(slotStart))}
            </span>
            <span className="inline-flex items-center gap-2 font-medium">
              <Clock className="h-4 w-4 text-[#1B8366]" />
              Pukul{" "}
              {new Intl.DateTimeFormat("id-ID", {
                hour: "2-digit",
                minute: "2-digit",
                timeZone: "Asia/Jakarta",
              }).format(new Date(slotStart))}{" "}
              WIB ({booking.mentor?.session_duration_minutes ?? 45} Menit)
            </span>
          </div>
        )}

        <div className="space-y-1.5 border-t border-[#E1E8E4] pt-4">
          <h2 className="text-xs font-semibold text-[#52645D]">
            Pertanyaan & Konteks Usaha yang Diajukan:
          </h2>
          <p className="text-sm text-[#172B25] whitespace-pre-line">
            {booking.question_notes}
          </p>
        </div>
      </section>

      <ConsultationActionsClient booking={booking} />
    </div>
  );
}

