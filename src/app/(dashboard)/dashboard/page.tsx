import Link from "next/link";
import { Plus, Calendar, MessagesSquare, Briefcase } from "lucide-react";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getPublicEnv } from "@/lib/env";
import { getDailyUsageSummary } from "@/lib/subscription/entitlements";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/AlertBanner";
import type {
  BusinessProfile,
  ConsultationBooking,
  ForumPost,
  Roadmap,
  RoadmapStage,
  RoadmapTask,
} from "@/types/database";

const STAGE_LABELS: Record<string, string> = {
  not_started: "Belum Dimulai",
  starting: "Sedang Dirintis",
  running: "Sudah Berjalan",
};

export default async function DashboardPage() {
  const { isSupabaseConfigured } = getPublicEnv();
  if (!isSupabaseConfigured) {
    return (
      <EmptyState
        title="Ruang Kerja Siap Dihubungkan"
        description="Isi kredensial Supabase dan Gemini API pada .env.local untuk mulai membuat roadmap bisnis dan berdiskusi dengan asisten AI."
        actionLabel="Lihat Paket Langganan"
        actionHref="/pricing"
      />
    );
  }

  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const [
    profileRes,
    businessProfileRes,
    usageSummary,
    latestRoadmapRes,
    recentForumRes,
    upcomingBookingRes,
  ] = await Promise.all([
    supabase
      .from("profiles")
      .select("full_name")
      .eq("id", user.id)
      .maybeSingle(),
    supabase
      .from("business_profiles")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle(),
    getDailyUsageSummary(supabase, user.id),
    supabase
      .from("roadmaps")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
    supabase
      .from("forum_posts")
      .select(
        `
        id, title, comments_count, upvotes_count, created_at,
        category:forum_categories!forum_posts_category_id_fkey(name)
      `
      )
      .order("created_at", { ascending: false })
      .limit(3),
    supabase
      .from("consultation_bookings")
      .select(
        `
        *,
        mentor:mentors!consultation_bookings_mentor_id_fkey(full_name, role_headline, session_duration_minutes),
        availability:mentor_availability!consultation_bookings_availability_id_fkey(slot_start, slot_end)
      `
      )
      .eq("user_id", user.id)
      .eq("status", "confirmed")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
  ]);

  const firstName =
    (
      profileRes.data?.full_name ||
      (user.user_metadata?.full_name as string) ||
      "Entrepreneur"
    )
      .split(" ")[0]
      .trim() || "Entrepreneur";

  const businessProfile = businessProfileRes.data as BusinessProfile | null;
  const latestRoadmap = latestRoadmapRes.data as Roadmap | null;
  const recentPosts = (recentForumRes.data ?? []) as unknown as ForumPost[];
  const upcomingBooking =
    upcomingBookingRes.data as ConsultationBooking | null;

  let stages: RoadmapStage[] = [];
  let tasks: RoadmapTask[] = [];
  if (latestRoadmap) {
    const [stagesRes, tasksRes] = await Promise.all([
      supabase
        .from("roadmap_stages")
        .select("*")
        .eq("roadmap_id", latestRoadmap.id)
        .eq("user_id", user.id)
        .order("stage_order", { ascending: true }),
      supabase
        .from("roadmap_tasks")
        .select("*")
        .eq("roadmap_id", latestRoadmap.id)
        .eq("user_id", user.id)
        .order("task_order", { ascending: true }),
    ]);
    stages = (stagesRes.data ?? []) as RoadmapStage[];
    tasks = (tasksRes.data ?? []) as RoadmapTask[];
  }

  const completedTasksCount = tasks.filter(
    (t) => t.status === "completed"
  ).length;
  const totalTasksCount = tasks.length;

  const roadmapQuotaPercent =
    usageSummary.roadmap.limit > 0
      ? Math.min(
          100,
          Math.round(
            (usageSummary.roadmap.remaining / usageSummary.roadmap.limit) * 100
          )
        )
      : 0;

  return (
    <div className="space-y-8">
      {/* Top Greeting & Primary CTA matching Target Image */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-heading text-2xl sm:text-[30px] font-bold leading-[1.25] text-[#172B25]">
            Halo, {firstName}! Selamat datang kembali.
          </h1>
          <p className="mt-1 text-sm sm:text-base text-[#52645D]">
            Lanjutkan pembangunan bisnismu hari ini.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Badge variant="primary">{usageSummary.entitlement.name}</Badge>
          <Link
            href="/roadmaps/new"
            className="inline-flex items-center gap-2 rounded-lg bg-[#1B8366] px-4 py-2.5 text-sm font-medium text-[#FFFFFF] transition-colors hover:bg-[#166B53] active:bg-[#125642]"
          >
            <Plus className="h-4 w-4" />
            <span>Buat Roadmap Baru</span>
          </Link>
        </div>
      </div>

      {/* 3 Metric Cards Row matching Target Image */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {/* Card 1: Sisa Kuota AI Hari Ini */}
        <div className="rounded-xl border border-[#B7DCCF] bg-[#E8F4F0]/55 p-5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-[#52645D]">
              Sisa Kuota AI Hari Ini
            </span>
            <Link
              href="/settings/subscription"
              className="text-xs font-semibold text-[#1B8366] hover:underline"
            >
              Detail Kuota
            </Link>
          </div>
          <p className="font-heading text-2xl font-bold text-[#172B25]">
            {usageSummary.roadmap.remaining} / {usageSummary.roadmap.limit}{" "}
            Roadmap
          </p>
          <div className="h-2 w-full overflow-hidden rounded-full bg-[#FFFFFF] border border-[#B7DCCF]">
            <div
              className="h-full rounded-full bg-[#1B8366]"
              style={{ width: `${roadmapQuotaPercent}%` }}
            />
          </div>
          <p className="text-xs text-[#718078]">
            {usageSummary.entitlement.canAccessAssistant
              ? `Pesan AI Assistant: sisa ${usageSummary.assistant.remaining}/${usageSummary.assistant.limit} • Reset 00:00 WIB`
              : "Reset otomatis pukul 00:00 WIB"}
          </p>
        </div>

        {/* Card 2: Tugas Selesai */}
        <div className="rounded-xl border border-[#B7DCCF] bg-[#E8F4F0]/55 p-5 flex items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="text-xs font-medium text-[#52645D]">
              Tugas Selesai
            </span>
            <p className="font-heading text-2xl font-bold text-[#172B25]">
              {completedTasksCount} dari {totalTasksCount}
            </p>
            <p className="text-xs text-[#718078]">
              {latestRoadmap
                ? `Roadmap v${latestRoadmap.version}`
                : "Belum ada task aktif"}
            </p>
          </div>
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full border-4 border-[#1B8366] bg-[#FFFFFF]">
            <span className="font-heading text-sm font-bold text-[#172B25]">
              {latestRoadmap ? `${latestRoadmap.progress_percentage}%` : "0%"}
            </span>
          </div>
        </div>

        {/* Card 3: Jadwal Mentor / Status Profil Usaha */}
        <div className="rounded-xl border border-[#B7DCCF] bg-[#E8F4F0]/55 p-5 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-[#52645D]">
              {upcomingBooking ? "Jadwal Mentor" : "Profil Usaha"}
            </span>
            <Link
              href={upcomingBooking ? "/consultations" : "/onboarding"}
              className="text-xs font-semibold text-[#1B8366] hover:underline"
            >
              {upcomingBooking ? "Lihat Sesi" : "Kelola"}
            </Link>
          </div>

          {upcomingBooking && upcomingBooking.availability ? (
            <>
              <p className="font-heading text-xl font-bold text-[#172B25]">
                {new Intl.DateTimeFormat("id-ID", {
                  weekday: "short",
                  day: "numeric",
                  month: "short",
                  hour: "2-digit",
                  minute: "2-digit",
                  timeZone: "Asia/Jakarta",
                }).format(new Date(upcomingBooking.availability.slot_start))}{" "}
                WIB
              </p>
              <p className="text-xs text-[#52645D] truncate">
                {upcomingBooking.mentor?.full_name} • Sesi{" "}
                {upcomingBooking.mentor?.session_duration_minutes ?? 45} Menit
              </p>
            </>
          ) : businessProfile ? (
            <>
              <p className="font-heading text-xl font-bold text-[#172B25] truncate">
                {businessProfile.business_name}
              </p>
              <p className="text-xs text-[#52645D]">
                {businessProfile.industry_category} •{" "}
                {STAGE_LABELS[businessProfile.business_stage] ??
                  businessProfile.business_stage}
              </p>
            </>
          ) : (
            <>
              <p className="font-heading text-lg font-bold text-[#172B25]">
                Belum Diisi
              </p>
              <p className="text-xs text-[#52645D]">
                Lengkapi profil bisnis agar analisis AI lebih presisi.
              </p>
            </>
          )}
        </div>
      </div>

      {/* Main Active Roadmap Card matching Target Image */}
      {latestRoadmap ? (
        <section className="rounded-xl border border-[#E1E8E4] bg-[#FFFFFF] p-6 space-y-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-heading text-xl font-bold text-[#172B25]">
                  {latestRoadmap.title}
                </h2>
                <Badge variant="neutral">Versi {latestRoadmap.version}</Badge>
              </div>
              <p className="mt-1 text-sm text-[#52645D]">
                {latestRoadmap.business_name} •{" "}
                {latestRoadmap.operational_location}
              </p>
            </div>
            <Badge variant="primary">
              {latestRoadmap.industry_category} •{" "}
              {STAGE_LABELS[latestRoadmap.business_stage]}
            </Badge>
          </div>

          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm font-semibold text-[#172B25]">
              <span>{latestRoadmap.progress_percentage}% Selesai</span>
              <span className="text-xs font-medium text-[#718078]">
                {completedTasksCount} dari {totalTasksCount} tugas tuntas
              </span>
            </div>
            <div className="h-2.5 w-full overflow-hidden rounded-full bg-[#E8F4F0]">
              <div
                className="h-full rounded-full bg-[#1B8366] transition-all"
                style={{ width: `${latestRoadmap.progress_percentage}%` }}
              />
            </div>
          </div>

          {/* Vertical Stepper Preview of Stages */}
          <div className="space-y-3">
            {stages.slice(0, 4).map((stage, idx) => {
              const stageTasks = tasks.filter((t) => t.stage_id === stage.id);
              const allDone =
                stageTasks.length > 0 &&
                stageTasks.every((t) => t.status === "completed");
              const anyInProgress = stageTasks.some(
                (t) => t.status === "in_progress" || t.status === "completed"
              );

              return (
                <div
                  key={stage.id}
                  className="relative flex items-center justify-between gap-4 rounded-lg border border-[#E1E8E4] bg-[#F8FAF9] px-4 py-3"
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <span
                      className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                        allDone || idx === 0
                          ? "bg-[#1B8366] text-[#FFFFFF]"
                          : "bg-[#FFFFFF] border border-[#C8D4CE] text-[#172B25]"
                      }`}
                    >
                      {stage.stage_order}
                    </span>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-[#172B25]">
                        {stage.title}
                      </p>
                      <p className="truncate text-xs text-[#52645D]">
                        {stage.goal}
                      </p>
                    </div>
                  </div>

                  <div className="shrink-0">
                    {allDone ? (
                      <Badge variant="completed">Selesai</Badge>
                    ) : anyInProgress ? (
                      <Badge variant="in_progress">Sedang Dikerjakan</Badge>
                    ) : (
                      <Badge variant="neutral">Belum Dimulai</Badge>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <Link
              href={`/roadmaps/${latestRoadmap.id}`}
              className="inline-flex items-center justify-center rounded-lg bg-[#1B8366] px-4 py-2.5 text-sm font-medium text-[#FFFFFF] transition-colors hover:bg-[#166B53]"
            >
              Lanjutkan Tahapan
            </Link>
            <Link
              href={`/roadmaps/${latestRoadmap.id}#analisis-strategis`}
              className="inline-flex items-center justify-center rounded-lg border border-[#1B8366] bg-[#FFFFFF] px-4 py-2.5 text-sm font-medium text-[#1B8366] transition-colors hover:bg-[#E8F4F0]"
            >
              Lihat Dokumen Lengkap
            </Link>
            <Link
              href="/assistant"
              className="inline-flex items-center justify-center rounded-lg border border-[#C8D4CE] bg-[#FFFFFF] px-4 py-2.5 text-sm font-medium text-[#172B25] transition-colors hover:bg-[#F8FAF9]"
            >
              Diskusikan dengan AI Assistant
            </Link>
          </div>
        </section>
      ) : (
        <EmptyState
          title="Belum Ada Roadmap Bisnis yang Dibuat"
          description="Ceritakan ide usaha baru atau kondisi bisnis Anda saat ini. AI Rantau akan menyusun 12 analisis strategis beserta tahapan tugas yang siap dieksekusi."
          actionLabel="Buat Roadmap Pertama Anda"
          actionHref="/roadmaps/new"
        />
      )}

      {/* Secondary Row: Diskusi Komunitas Terbaru & Pintasan Profil/Mentor */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <section className="rounded-xl border border-[#E1E8E4] bg-[#FFFFFF] p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MessagesSquare className="h-4 w-4 text-[#1B8366]" />
              <h2 className="font-heading text-lg font-bold text-[#172B25]">
                Diskusi Forum Terbaru
              </h2>
            </div>
            <Link
              href="/forum"
              className="text-xs font-semibold text-[#1B8366] hover:underline"
            >
              Buka Forum
            </Link>
          </div>

          {recentPosts.length > 0 ? (
            <div className="divide-y divide-[#E1E8E4]">
              {recentPosts.map((post) => (
                <Link
                  key={post.id}
                  href={`/forum/${post.id}`}
                  className="block py-3 first:pt-0 last:pb-0 hover:bg-[#F8FAF9] rounded-lg px-2 -mx-2 transition-colors"
                >
                  <p className="text-sm font-semibold text-[#172B25] line-clamp-1">
                    {post.title}
                  </p>
                  <div className="mt-1 flex items-center gap-3 text-xs text-[#718078]">
                    <span>{post.category?.name ?? "Diskusi Umum"}</span>
                    <span>•</span>
                    <span>{post.comments_count} komentar</span>
                    <span>•</span>
                    <span>{post.upvotes_count} dukungan</span>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-sm text-[#52645D]">
              Belum ada topik diskusi terbaru. Jadilah yang pertama berbagi
              pengalaman usaha di Forum Komunitas.
            </p>
          )}
        </section>

        <section className="rounded-xl border border-[#E1E8E4] bg-[#FFFFFF] p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {upcomingBooking ? (
                <Calendar className="h-4 w-4 text-[#1B8366]" />
              ) : (
                <Briefcase className="h-4 w-4 text-[#1B8366]" />
              )}
              <h2 className="font-heading text-lg font-bold text-[#172B25]">
                Pendampingan & Profil Bisnis
              </h2>
            </div>
            <Link
              href="/mentors"
              className="text-xs font-semibold text-[#1B8366] hover:underline"
            >
              Direktori Mentor
            </Link>
          </div>

          <p className="text-sm text-[#52645D]">
            Perbarui konteks bisnis Anda secara berkala atau jadwalkan sesi
            konsultasi 1-on-1 bersama mentor praktisi untuk membedah strategi
            operasional dan pemasaran.
          </p>

          <div className="flex flex-wrap gap-3 pt-1">
            <Link
              href="/onboarding"
              className="rounded-lg border border-[#C8D4CE] bg-[#FFFFFF] px-3.5 py-2 text-xs font-medium text-[#172B25] hover:bg-[#F8FAF9]"
            >
              Perbarui Profil Usaha
            </Link>
            <Link
              href="/mentors"
              className="rounded-lg bg-[#E8F4F0] border border-[#B7DCCF] px-3.5 py-2 text-xs font-medium text-[#1B8366] hover:bg-[#B7DCCF]"
            >
              Lihat Jadwal Mentor
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}

