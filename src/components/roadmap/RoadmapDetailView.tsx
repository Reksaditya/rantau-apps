"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Lock,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Target,
} from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { AlertBanner } from "@/components/ui/AlertBanner";
import type {
  PlanTier,
  Roadmap,
  RoadmapStage,
  RoadmapTask,
  TaskPriority,
  TaskStatus,
} from "@/types/database";
import { PLAN_ENTITLEMENTS } from "@/lib/subscription/entitlements";

interface RoadmapDetailViewProps {
  roadmap: Roadmap;
  stages: RoadmapStage[];
  initialTasks: RoadmapTask[];
  planTier: PlanTier;
}

const PRIORITY_BADGE_MAP: Record<
  TaskPriority,
  { label: string; variant: "info" | "warning" | "error" }
> = {
  low: { label: "Prioritas Rendah", variant: "info" },
  medium: { label: "Prioritas Sedang", variant: "warning" },
  high: { label: "Prioritas Tinggi", variant: "error" },
};

const STATUS_BADGE_MAP: Record<
  TaskStatus,
  { label: string; variant: "neutral" | "in_progress" | "completed" }
> = {
  not_started: { label: "Belum Dimulai", variant: "neutral" },
  in_progress: { label: "Sedang Dikerjakan", variant: "in_progress" },
  completed: { label: "Selesai", variant: "completed" },
};

const STAGE_LABELS: Record<string, string> = {
  not_started: "Belum Dimulai",
  starting: "Sedang Dirintis",
  running: "Sudah Berjalan",
};

export function RoadmapDetailView({
  roadmap,
  stages,
  initialTasks,
  planTier,
}: RoadmapDetailViewProps) {
  const [tasks, setTasks] = useState<RoadmapTask[]>(initialTasks);
  const [progressPercentage, setProgressPercentage] = useState(
    roadmap.progress_percentage
  );
  const [updatingTaskId, setUpdatingTaskId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const entitlement = PLAN_ENTITLEMENTS[planTier];
  const maxUnlockedStages = entitlement.maxUnlockedStages;
  const isStarterLimited = planTier === "starter";

  const completedCount = tasks.filter((t) => t.status === "completed").length;
  const totalCount = tasks.length;

  async function handleStatusChange(taskId: string, newStatus: TaskStatus) {
    try {
      setUpdatingTaskId(taskId);
      setErrorMessage(null);
      setToastMessage(null);

      const res = await fetch(`/api/roadmaps/tasks/${taskId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      const data = await res.json();
      if (!res.ok) {
        setErrorMessage(data.error || "Gagal memperbarui status tugas.");
        setUpdatingTaskId(null);
        return;
      }

      setTasks((prev) =>
        prev.map((t) => (t.id === taskId ? { ...t, status: newStatus } : t))
      );
      setProgressPercentage(data.progressPercentage);
      setToastMessage(
        "Status tugas berhasil diperbarui dan progres tersimpan di database."
      );
      setUpdatingTaskId(null);
    } catch {
      setErrorMessage("Terjadi kendala jaringan saat menyimpan status tugas.");
      setUpdatingTaskId(null);
    }
  }

  const strategicSections = [
    {
      num: "01",
      title: "Ringkasan & Pemahaman Bisnis",
      content: roadmap.business_summary,
      unlockedOnStarter: true,
    },
    {
      num: "02",
      title: "Analisis Masalah & Peluang Pasar",
      content: roadmap.problem_opportunity_analysis,
      unlockedOnStarter: true,
    },
    {
      num: "03",
      title: "Target Pasar & Karakteristik Pelanggan",
      content: roadmap.target_market_analysis,
      unlockedOnStarter: true,
    },
    {
      num: "04",
      title:
        roadmap.business_stage === "running"
          ? "Evaluasi & Diagnosis Bisnis Berjalan"
          : "Strategi Validasi Ide Awal",
      content: roadmap.validation_or_evaluation,
      unlockedOnStarter: true,
    },
    {
      num: "05",
      title: "Value Proposition & Diferensiasi",
      content: roadmap.value_proposition,
      unlockedOnStarter: !isStarterLimited,
    },
    {
      num: "06",
      title: "Model Bisnis & Sumber Pendapatan",
      content: roadmap.business_model_revenue,
      unlockedOnStarter: !isStarterLimited,
    },
    {
      num: "07",
      title: "Estimasi Kebutuhan Modal & Biaya Awal",
      content: roadmap.capital_cost_estimation,
      unlockedOnStarter: !isStarterLimited,
    },
    {
      num: "08",
      title: "Strategi Pemasaran & Akuisisi Pelanggan",
      content: roadmap.marketing_acquisition_strategy,
      unlockedOnStarter: !isStarterLimited,
    },
    {
      num: "09",
      title: "Rencana Operasional Harian",
      content: roadmap.operational_plan,
      unlockedOnStarter: !isStarterLimited,
    },
  ];

  return (
    <div className="space-y-8">
      {/* Toast / Confirmation Banner */}
      {toastMessage && (
        <div className="rounded-xl border border-[#18794E] bg-[#E8F5EC] px-4 py-3 text-sm font-medium text-[#18794E] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            <span>{toastMessage}</span>
          </div>
          <button
            type="button"
            onClick={() => setToastMessage(null)}
            className="text-xs font-semibold underline cursor-pointer"
          >
            Tutup
          </button>
        </div>
      )}

      {errorMessage && (
        <AlertBanner
          variant="error"
          message={errorMessage}
          onRetry={() => setErrorMessage(null)}
        />
      )}

      {/* Header Dokumen Roadmap */}
      <section className="rounded-xl border border-[#E1E8E4] bg-[#FFFFFF] p-6 space-y-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="primary">Versi {roadmap.version}</Badge>
              <Badge variant="neutral">
                {STAGE_LABELS[roadmap.business_stage] ?? roadmap.business_stage}
              </Badge>
              <Badge variant="neutral">{roadmap.industry_category}</Badge>
            </div>
            <h1 className="font-heading text-2xl sm:text-[30px] font-bold text-[#172B25]">
              {roadmap.title}
            </h1>
            <p className="text-sm text-[#52645D]">
              {roadmap.business_name} • Lokasi: {roadmap.operational_location} •
              Modal: {roadmap.estimated_capital}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <Link
              href={`/assistant?roadmapId=${roadmap.id}`}
              className="inline-flex items-center gap-2 rounded-lg bg-[#E8F4F0] border border-[#B7DCCF] px-3.5 py-2 text-xs sm:text-sm font-medium text-[#1B8366] hover:bg-[#B7DCCF]"
            >
              <Sparkles className="h-4 w-4" />
              <span>Tanya AI tentang Roadmap Ini</span>
            </Link>
            <Link
              href="/roadmaps/new"
              className="inline-flex items-center gap-2 rounded-lg border border-[#C8D4CE] bg-[#FFFFFF] px-3.5 py-2 text-xs sm:text-sm font-medium text-[#172B25] hover:bg-[#F8FAF9]"
            >
              Buat Versi Baru
            </Link>
          </div>
        </div>

        {/* Main Progress Bar */}
        <div className="rounded-xl border border-[#E1E8E4] bg-[#F8FAF9] p-4 space-y-2">
          <div className="flex items-center justify-between text-sm font-semibold text-[#172B25]">
            <span>Progres Implementasi Keseluruhan</span>
            <span className="text-[#1B8366]">
              {progressPercentage}% Selesai ({completedCount}/{totalCount}{" "}
              Tugas)
            </span>
          </div>
          <div className="h-3 w-full overflow-hidden rounded-full bg-[#E8F4F0]">
            <div
              className="h-full rounded-full bg-[#1B8366] transition-all duration-300"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>

        {/* Disclaimer Banner per PRD FR-03 & DESIGN.md Section 6.2 */}
        <div className="rounded-xl border border-[#9A6700]/30 bg-[#FFF4D6] p-4 text-xs sm:text-sm text-[#9A6700] flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold">Catatan & Disclaimer Estimasi AI</p>
            <p className="mt-0.5 leading-[1.5]">{roadmap.disclaimer_note}</p>
          </div>
        </div>
      </section>

      {/* Komponen 12: Prioritas Tindakan Selanjutnya */}
      <section className="rounded-xl border border-[#B7DCCF] bg-[#E8F4F0]/60 p-6 space-y-3">
        <div className="flex items-center gap-2">
          <Target className="h-5 w-5 text-[#1B8366]" />
          <h2 className="font-heading text-lg font-bold text-[#172B25]">
            Prioritas Tindakan Minggu Ini (Komponen #12)
          </h2>
        </div>
        <ul className="grid grid-cols-1 gap-2.5 md:grid-cols-3">
          {(roadmap.next_priority_actions ?? []).map((action, index) => (
            <li
              key={index}
              className="rounded-lg border border-[#B7DCCF] bg-[#FFFFFF] p-3.5 text-sm text-[#172B25] flex items-start gap-2.5"
            >
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#1B8366] text-[11px] font-bold text-[#FFFFFF] mt-0.5">
                {index + 1}
              </span>
              <span>{action}</span>
            </li>
          ))}
        </ul>
      </section>

      {/* Komponen 10: Timeline Implementasi & Manajemen Task (Vertical Stepper) */}
      <section className="space-y-4">
        <div>
          <h2 className="font-heading text-xl sm:text-2xl font-bold text-[#172B25]">
            Timeline Implementasi & Daftar Tugas (Komponen #10)
          </h2>
          <p className="mt-1 text-sm text-[#52645D]">
            Ubah status setiap tugas seiring berjalannya eksekusi usaha Anda.
            Persentase progres akan dihitung otomatis di server.
          </p>
        </div>

        <div className="space-y-6">
          {stages.map((stage) => {
            const isLocked = stage.stage_order > maxUnlockedStages;
            const stageTasks = tasks.filter((t) => t.stage_id === stage.id);

            if (isLocked) {
              return (
                <div
                  key={stage.id}
                  className="rounded-xl border border-[#B7DCCF] bg-[#E8F4F0] p-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="flex items-start gap-3.5">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#1B8366] text-xs font-bold text-[#FFFFFF]">
                      <Lock className="h-4 w-4" />
                    </span>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-heading text-lg font-bold text-[#172B25]">
                          Tahap {stage.stage_order}: {stage.title}
                        </h3>
                        <Badge variant="primary">Terkunci di Starter</Badge>
                      </div>
                      <p className="mt-1 text-sm text-[#52645D]">
                        Paket Rintis Starter menampilkan 3 tahap awal secara
                        penuh. Tingkatkan ke paket Rintis Growth atau Max untuk
                        membuka rincian tugas pada Tahap {stage.stage_order}{" "}
                        beserta seluruh analisis mendalam.
                      </p>
                    </div>
                  </div>

                  <Link
                    href="/settings/subscription"
                    className="inline-flex items-center justify-center rounded-lg bg-[#1B8366] px-4 py-2.5 text-sm font-medium text-[#FFFFFF] hover:bg-[#166B53] shrink-0 self-start sm:self-center"
                  >
                    Upgrade Paket
                  </Link>
                </div>
              );
            }

            return (
              <div
                key={stage.id}
                className="rounded-xl border border-[#E1E8E4] bg-[#FFFFFF] p-6 space-y-5"
              >
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between border-b border-[#E1E8E4] pb-4">
                  <div className="flex items-start gap-3.5">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#1B8366] text-sm font-bold text-[#FFFFFF]">
                      {stage.stage_order}
                    </span>
                    <div>
                      <h3 className="font-heading text-lg font-bold text-[#172B25]">
                        Tahap {stage.stage_order}: {stage.title}
                      </h3>
                      <p className="text-xs sm:text-sm font-medium text-[#1B8366]">
                        Tujuan: {stage.goal}
                      </p>
                      <p className="mt-1 text-sm text-[#52645D]">
                        {stage.description}
                      </p>
                    </div>
                  </div>

                  <Badge variant="neutral" className="self-start sm:self-auto">
                    <Clock className="h-3.5 w-3.5" />
                    <span>{stage.estimated_duration}</span>
                  </Badge>
                </div>

                {/* Daftar Task di dalam Tahap */}
                <div className="space-y-4">
                  {stageTasks.map((task) => {
                    const priorityMeta =
                      PRIORITY_BADGE_MAP[task.priority] ??
                      PRIORITY_BADGE_MAP.medium;
                    const statusMeta =
                      STATUS_BADGE_MAP[task.status] ??
                      STATUS_BADGE_MAP.not_started;
                    const isUpdating = updatingTaskId === task.id;

                    return (
                      <div
                        key={task.id}
                        className={`rounded-xl border p-4 transition-colors ${
                          task.status === "completed"
                            ? "border-[#B7DCCF] bg-[#E8F4F0]/35"
                            : "border-[#E1E8E4] bg-[#F8FAF9]"
                        }`}
                      >
                        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                          <div className="space-y-2 flex-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <Badge variant={statusMeta.variant}>
                                {statusMeta.label}
                              </Badge>
                              <Badge
                                variant={
                                  priorityMeta.variant === "info"
                                    ? "in_progress"
                                    : priorityMeta.variant
                                }
                              >
                                {priorityMeta.label}
                              </Badge>
                              <span className="text-xs font-medium text-[#718078]">
                                Estimasi: {task.estimated_duration}
                              </span>
                            </div>

                            <h4 className="font-heading text-base font-bold text-[#172B25]">
                              {task.title}
                            </h4>
                            <p className="text-sm text-[#52645D]">
                              {task.description}
                            </p>

                            <div className="grid grid-cols-1 gap-2 pt-2 sm:grid-cols-3 text-xs">
                              <div className="rounded-lg border border-[#E1E8E4] bg-[#FFFFFF] p-2.5">
                                <span className="block font-semibold text-[#172B25]">
                                  Output yang Diharapkan:
                                </span>
                                <span className="text-[#52645D]">
                                  {task.expected_output}
                                </span>
                              </div>
                              <div className="rounded-lg border border-[#E1E8E4] bg-[#FFFFFF] p-2.5">
                                <span className="block font-semibold text-[#172B25]">
                                  Indikator Keberhasilan:
                                </span>
                                <span className="text-[#52645D]">
                                  {task.success_indicator}
                                </span>
                              </div>
                              <div className="rounded-lg border border-[#E1E8E4] bg-[#FFFFFF] p-2.5">
                                <span className="block font-semibold text-[#172B25]">
                                  Prasyarat / Dependensi:
                                </span>
                                <span className="text-[#52645D]">
                                  {task.dependency}
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Pemilih Status Tugas */}
                          <div className="shrink-0 lg:w-48">
                            <label
                              htmlFor={`status-${task.id}`}
                              className="block text-xs font-semibold text-[#52645D] mb-1"
                            >
                              Ubah Status Tugas
                            </label>
                            <select
                              id={`status-${task.id}`}
                              disabled={isUpdating}
                              value={task.status}
                              onChange={(e) =>
                                handleStatusChange(
                                  task.id,
                                  e.target.value as TaskStatus
                                )
                              }
                              className="w-full rounded-lg border border-[#C8D4CE] bg-[#FFFFFF] px-3 py-2 text-xs font-medium text-[#172B25] disabled:bg-[#EEF2F0] disabled:text-[#98A59E] cursor-pointer"
                            >
                              <option value="not_started">Belum Dimulai</option>
                              <option value="in_progress">
                                Sedang Dikerjakan
                              </option>
                              <option value="completed">Selesai</option>
                            </select>
                            {isUpdating && (
                              <span className="mt-1 block text-[11px] text-[#1B8366]">
                                Menyimpan ke server...
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Komponen 1 s/d 9: Analisis Strategis (2 Kolom) */}
      <section id="analisis-strategis" className="space-y-4">
        <div>
          <h2 className="font-heading text-xl sm:text-2xl font-bold text-[#172B25]">
            Dokumen Analisis Strategis Bisnis (Komponen #1 – #9)
          </h2>
          <p className="mt-1 text-sm text-[#52645D]">
            Fondasi perencanaan pasar, nilai jual, model pendapatan, kebutuhan
            modal, pemasaran, dan operasional usaha.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          {strategicSections.map((sec) => {
            if (!sec.unlockedOnStarter) {
              return (
                <div
                  key={sec.num}
                  className="rounded-xl border border-[#B7DCCF] bg-[#E8F4F0] p-6 flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-[#1B8366]">
                        Komponen #{sec.num}
                      </span>
                      <Badge variant="primary">Paket Growth / Max</Badge>
                    </div>
                    <h3 className="font-heading text-lg font-bold text-[#172B25]">
                      {sec.title}
                    </h3>
                    <p className="text-sm text-[#52645D]">
                      Bagian analisis mendalam ini terkunci pada paket Rintis
                      Starter. Beralih ke Rintis Growth atau Max untuk membaca
                      seluruh 12 komponen strategis secara lengkap.
                    </p>
                  </div>
                  <Link
                    href="/settings/subscription"
                    className="inline-flex items-center justify-center rounded-lg bg-[#1B8366] px-4 py-2 text-xs font-semibold text-[#FFFFFF] hover:bg-[#166B53] self-start"
                  >
                    Buka Seluruh Komponen
                  </Link>
                </div>
              );
            }

            return (
              <div
                key={sec.num}
                className="rounded-xl border border-[#E1E8E4] bg-[#FFFFFF] p-6 space-y-2.5"
              >
                <span className="text-xs font-semibold text-[#1B8366]">
                  Komponen #{sec.num}
                </span>
                <h3 className="font-heading text-lg font-bold text-[#172B25]">
                  {sec.title}
                </h3>
                <p className="text-sm leading-[1.65] text-[#52645D] whitespace-pre-line">
                  {sec.content}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Komponen 11: Risiko & Mitigasi */}
      <section className="rounded-xl border border-[#E1E8E4] bg-[#FFFFFF] p-6 space-y-4">
        <div>
          <span className="text-xs font-semibold text-[#1B8366]">
            Komponen #11
          </span>
          <h2 className="font-heading text-xl font-bold text-[#172B25]">
            Identifikasi Risiko & Rencana Mitigasi
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {(roadmap.risks_and_mitigation ?? []).map((item, idx) => (
            <div
              key={idx}
              className="rounded-xl border border-[#E1E8E4] bg-[#F8FAF9] p-4 space-y-2"
            >
              <div className="flex items-center justify-between gap-2">
                <p className="font-heading text-sm font-bold text-[#172B25]">
                  {item.risk}
                </p>
                <Badge
                  variant={
                    item.impact === "high"
                      ? "error"
                      : item.impact === "medium"
                      ? "warning"
                      : "in_progress"
                  }
                >
                  Dampak{" "}
                  {item.impact === "high"
                    ? "Tinggi"
                    : item.impact === "medium"
                    ? "Sedang"
                    : "Rendah"}
                </Badge>
              </div>
              <p className="text-xs sm:text-sm text-[#52645D]">
                <strong className="font-semibold text-[#172B25]">
                  Langkah Mitigasi:{" "}
                </strong>
                {item.mitigation}
              </p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

