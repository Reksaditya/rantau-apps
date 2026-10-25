import Link from "next/link";
import { Calendar, Clock, Users } from "lucide-react";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getPublicEnv } from "@/lib/env";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/AlertBanner";
import type { ConsultationBooking } from "@/types/database";

const STATUS_BADGE: Record<
  ConsultationBooking["status"],
  { label: string; variant: "completed" | "in_progress" | "error" }
> = {
  confirmed: { label: "Terkonfirmasi", variant: "completed" },
  completed: { label: "Selesai", variant: "in_progress" },
  cancelled: { label: "Dibatalkan", variant: "error" },
};

export default async function ConsultationsListPage() {
  const { isSupabaseConfigured } = getPublicEnv();
  let bookings: ConsultationBooking[] = [];

  if (isSupabaseConfigured) {
    const supabase = await createServerSupabaseClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      const { data } = await supabase
        .from("consultation_bookings")
        .select(
          `
          *,
          mentor:mentors!consultation_bookings_mentor_id_fkey(*),
          availability:mentor_availability!consultation_bookings_availability_id_fkey(*)
        `
        )
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      bookings = (data ?? []) as unknown as ConsultationBooking[];
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-heading text-2xl sm:text-[30px] font-bold text-[#172B25]">
            Jadwal & Riwayat Konsultasi Saya
          </h1>
          <p className="mt-1 text-sm sm:text-base text-[#52645D]">
            Pantau jadwal sesi konsultasi 1-on-1 bersama mentor praktisi dan
            catat hasil tindak lanjutnya.
          </p>
        </div>

        <Link
          href="/mentors"
          className="inline-flex items-center gap-2 rounded-lg bg-[#1B8366] px-4 py-2.5 text-sm font-medium text-[#FFFFFF] hover:bg-[#166B53] self-start sm:self-auto"
        >
          <Users className="h-4 w-4" />
          <span>Cari Mentor & Jadwal</span>
        </Link>
      </div>

      {bookings.length === 0 ? (
        <EmptyState
          title="Belum Ada Jadwal Konsultasi Mentor"
          description="Pilih mentor sesuai bidang industri usaha Anda pada Direktori Mentor dan pesan slot waktu yang tersedia (Khusus pelanggan Rantau Max)."
          actionLabel="Buka Direktori Mentor"
          actionHref="/mentors"
        />
      ) : (
        <div className="space-y-4">
          {bookings.map((booking) => {
            const statusMeta = STATUS_BADGE[booking.status];
            const slotStart = booking.availability?.slot_start;
            return (
              <div
                key={booking.id}
                className="rounded-xl border border-[#E1E8E4] bg-[#FFFFFF] p-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant={statusMeta.variant}>
                      {statusMeta.label}
                    </Badge>
                    {booking.mentor?.is_demo_data && (
                      <Badge variant="warning">Data Demo MVP</Badge>
                    )}
                  </div>

                  <h2 className="font-heading text-lg font-bold text-[#172B25]">
                    {booking.business_topic}
                  </h2>
                  <p className="text-sm font-medium text-[#52645D]">
                    Mentor: {booking.mentor?.full_name} (
                    {booking.mentor?.role_headline})
                  </p>

                  {slotStart && (
                    <div className="flex flex-wrap items-center gap-4 text-xs text-[#718078] pt-1">
                      <span className="inline-flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5 text-[#1B8366]" />
                        {new Intl.DateTimeFormat("id-ID", {
                          weekday: "long",
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                          timeZone: "Asia/Jakarta",
                        }).format(new Date(slotStart))}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5 text-[#1B8366]" />
                        Pukul{" "}
                        {new Intl.DateTimeFormat("id-ID", {
                          hour: "2-digit",
                          minute: "2-digit",
                          timeZone: "Asia/Jakarta",
                        }).format(new Date(slotStart))}{" "}
                        WIB ({booking.mentor?.session_duration_minutes ?? 45}{" "}
                        Menit)
                      </span>
                    </div>
                  )}
                </div>

                <Link
                  href={`/consultations/${booking.id}`}
                  className="inline-flex items-center justify-center rounded-lg border border-[#C8D4CE] bg-[#FFFFFF] px-4 py-2 text-xs sm:text-sm font-medium text-[#172B25] hover:bg-[#F8FAF9] shrink-0 self-start sm:self-center"
                >
                  Detail & Catatan Sesi
                </Link>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

