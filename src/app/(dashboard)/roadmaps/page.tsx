import Link from "next/link";
import { Plus, MapPin, Calendar } from "lucide-react";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getPublicEnv } from "@/lib/env";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/AlertBanner";
import type { Roadmap } from "@/types/database";

const STAGE_LABELS: Record<string, string> = {
  not_started: "Belum Dimulai",
  starting: "Sedang Dirintis",
  running: "Sudah Berjalan",
};

export default async function RoadmapsListPage() {
  const { isSupabaseConfigured } = getPublicEnv();
  let roadmaps: Roadmap[] = [];

  if (isSupabaseConfigured) {
    const supabase = await createServerSupabaseClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      const { data } = await supabase
        .from("roadmaps")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      roadmaps = (data ?? []) as Roadmap[];
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-heading text-2xl sm:text-[30px] font-bold text-[#172B25]">
            Katalog Roadmap Bisnis Saya
          </h1>
          <p className="mt-1 text-sm sm:text-base text-[#52645D]">
            Setiap pembuatan roadmap disimpan sebagai versi baru tanpa menimpa
            dokumen sebelumnya.
          </p>
        </div>

        <Link
          href="/roadmaps/new"
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#1B8366] px-4 py-2.5 text-sm font-medium text-[#FFFFFF] transition-colors hover:bg-[#166B53] self-start sm:self-auto"
        >
          <Plus className="h-4 w-4" />
          <span>Buat Roadmap Baru</span>
        </Link>
      </div>

      {roadmaps.length === 0 ? (
        <EmptyState
          title="Belum Ada Dokumen Roadmap"
          description="Mulai petakan langkah bisnis Anda dari validasi pasar hingga strategi operasional melalui generator AI Rintis."
          actionLabel="Susun Roadmap Pertama"
          actionHref="/roadmaps/new"
        />
      ) : (
        <div className="grid grid-cols-1 gap-5">
          {roadmaps.map((roadmap) => (
            <div
              key={roadmap.id}
              className="rounded-xl border border-[#E1E8E4] bg-[#FFFFFF] p-6 space-y-4"
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="primary">Versi {roadmap.version}</Badge>
                    <Badge variant="neutral">
                      {STAGE_LABELS[roadmap.business_stage] ??
                        roadmap.business_stage}
                    </Badge>
                    <Badge variant="neutral">{roadmap.industry_category}</Badge>
                  </div>
                  <h2 className="font-heading text-xl font-bold text-[#172B25] pt-1">
                    {roadmap.title}
                  </h2>
                  <p className="text-sm font-medium text-[#52645D]">
                    {roadmap.business_name}
                  </p>
                </div>

                <Link
                  href={`/roadmaps/${roadmap.id}`}
                  className="inline-flex items-center justify-center rounded-lg bg-[#1B8366] px-4 py-2 text-sm font-medium text-[#FFFFFF] hover:bg-[#166B53] shrink-0 self-start"
                >
                  Buka Roadmap & Task
                </Link>
              </div>

              <p className="text-sm text-[#52645D] line-clamp-2">
                {roadmap.business_summary}
              </p>

              <div className="space-y-1.5 pt-1">
                <div className="flex items-center justify-between text-xs font-semibold text-[#172B25]">
                  <span>Progres Eksekusi Tugas</span>
                  <span className="text-[#1B8366]">
                    {roadmap.progress_percentage}% Selesai
                  </span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-[#E8F4F0]">
                  <div
                    className="h-full rounded-full bg-[#1B8366]"
                    style={{ width: `${roadmap.progress_percentage}%` }}
                  />
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-4 pt-2 border-t border-[#E1E8E4] text-xs text-[#718078]">
                <span className="inline-flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5" />
                  {roadmap.operational_location}
                </span>
                <span>Modal: {roadmap.estimated_capital}</span>
                <span className="inline-flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5" />
                  Dibuat{" "}
                  {new Intl.DateTimeFormat("id-ID", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  }).format(new Date(roadmap.created_at))}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

