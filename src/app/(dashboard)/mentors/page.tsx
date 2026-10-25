import Link from "next/link";
import { Clock, Globe, CalendarCheck } from "lucide-react";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getPublicEnv } from "@/lib/env";
import {
  getUserPlanTier,
  PLAN_ENTITLEMENTS,
} from "@/lib/subscription/entitlements";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/AlertBanner";
import type { Mentor, MentorAvailability } from "@/types/database";

export default async function MentorsDirectoryPage() {
  const { isSupabaseConfigured } = getPublicEnv();
  let mentors: Mentor[] = [];
  let availabilities: MentorAvailability[] = [];
  let planName = "Rantau Starter";

  if (isSupabaseConfigured) {
    const supabase = await createServerSupabaseClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      const [mentorsRes, availRes, planTier] = await Promise.all([
        supabase
          .from("mentors")
          .select("*")
          .order("years_of_experience", { ascending: false }),
        supabase
          .from("mentor_availability")
          .select("*")
          .eq("is_booked", false)
          .order("slot_start", { ascending: true }),
        getUserPlanTier(supabase, user.id),
      ]);

      mentors = (mentorsRes.data ?? []) as Mentor[];
      availabilities = (availRes.data ?? []) as MentorAvailability[];
      planName = PLAN_ENTITLEMENTS[planTier].name;
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-heading text-2xl sm:text-[30px] font-bold text-[#172B25]">
            Direktori Mentor Praktisi
          </h1>
          <p className="mt-1 text-sm sm:text-base text-[#52645D]">
            Konsultasikan validasi produk, perhitungan keuangan, dan strategi
            ekspansi secara 1-on-1 bersama praktisi berpengalaman.
          </p>
        </div>

        <Link
          href="/consultations"
          className="inline-flex items-center gap-2 rounded-lg border border-[#C8D4CE] bg-[#FFFFFF] px-4 py-2.5 text-sm font-medium text-[#172B25] hover:bg-[#F8FAF9] self-start sm:self-auto"
        >
          <CalendarCheck className="h-4 w-4 text-[#1B8366]" />
          <span>Lihat Konsultasi Saya ({planName})</span>
        </Link>
      </div>

      {mentors.length === 0 ? (
        <EmptyState
          title="Data Direktori Mentor Belum Tersedia"
          description="Pastikan skema SQL 001_initial_schema.sql telah dijalankan pada database Supabase untuk memuat data direktori mentor."
        />
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {mentors.map((mentor) => {
            const openSlotsCount = availabilities.filter(
              (a) =>
                a.mentor_id === mentor.id &&
                !a.is_booked &&
                new Date(a.slot_start) > new Date()
            ).length;

            return (
              <div
                key={mentor.id}
                className="flex flex-col justify-between rounded-xl border border-[#E1E8E4] bg-[#FFFFFF] p-6 space-y-5"
              >
                <div className="space-y-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3.5">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#E8F4F0] border border-[#B7DCCF] font-heading text-base font-bold text-[#1B8366]">
                        {mentor.initials}
                      </div>
                      <div>
                        <h2 className="font-heading text-lg font-bold text-[#172B25]">
                          {mentor.full_name}
                        </h2>
                        <p className="text-xs sm:text-sm font-medium text-[#52645D]">
                          {mentor.role_headline}
                        </p>
                      </div>
                    </div>

                    {mentor.is_demo_data && (
                      <Badge variant="warning">Data Demo MVP</Badge>
                    )}
                  </div>

                  <p className="text-sm text-[#52645D]">
                    {mentor.experience_summary}
                  </p>

                  <div className="flex flex-wrap gap-1.5">
                    {mentor.expertise_tags.map((tag) => (
                      <Badge key={tag} variant="primary">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t border-[#E1E8E4] flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex flex-wrap items-center gap-3 text-xs text-[#718078]">
                    <span className="inline-flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5 text-[#1B8366]" />
                      {mentor.session_duration_minutes} Menit
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <Globe className="h-3.5 w-3.5 text-[#1B8366]" />
                      {mentor.consultation_language}
                    </span>
                    <span className="font-semibold text-[#1B8366]">
                      {openSlotsCount} slot tersedia
                    </span>
                  </div>

                  <Link
                    href={`/mentors/${mentor.id}`}
                    className="inline-flex items-center justify-center rounded-lg bg-[#1B8366] px-4 py-2 text-xs sm:text-sm font-medium text-[#FFFFFF] hover:bg-[#166B53]"
                  >
                    Lihat Profil & Jadwal
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

