"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Info } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { AlertBanner } from "@/components/ui/AlertBanner";
import { PLAN_ENTITLEMENTS } from "@/lib/subscription/entitlements";
import type { PlanTier } from "@/types/database";

interface SubscriptionManagerClientProps {
  currentPlanTier: PlanTier;
  usageDate: string;
  roadmapUsed: number;
  roadmapLimit: number;
  assistantUsed: number;
  assistantLimit: number;
}

export function SubscriptionManagerClient({
  currentPlanTier,
  usageDate,
  roadmapUsed,
  roadmapLimit,
  assistantUsed,
  assistantLimit,
}: SubscriptionManagerClientProps) {
  const router = useRouter();
  const [activeTier, setActiveTier] = useState<PlanTier>(currentPlanTier);
  const [switchingTier, setSwitchingTier] = useState<PlanTier | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const plans = [
    PLAN_ENTITLEMENTS.starter,
    PLAN_ENTITLEMENTS.growth,
    PLAN_ENTITLEMENTS.max,
  ];

  async function handleSwitchPlan(targetTier: PlanTier) {
    if (targetTier === activeTier || switchingTier) return;

    try {
      setSwitchingTier(targetTier);
      setErrorMsg(null);
      setSuccessMsg(null);

      const res = await fetch("/api/subscription/switch-mvp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan_tier: targetTier }),
      });

      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data.error || "Gagal memperbarui paket langganan.");
        setSwitchingTier(null);
        return;
      }

      setActiveTier(targetTier);
      setSuccessMsg(data.message);
      setSwitchingTier(null);
      router.refresh();
    } catch {
      setErrorMsg("Terjadi gangguan jaringan saat mengubah paket langganan.");
      setSwitchingTier(null);
    }
  }

  const roadmapPercent =
    roadmapLimit > 0
      ? Math.min(100, Math.round((roadmapUsed / roadmapLimit) * 100))
      : 0;
  const assistantPercent =
    assistantLimit > 0
      ? Math.min(100, Math.round((assistantUsed / assistantLimit) * 100))
      : 0;

  return (
    <div className="space-y-8">
      {errorMsg && <AlertBanner variant="error" message={errorMsg} />}
      {successMsg && <AlertBanner variant="success" message={successMsg} />}

      {/* Ringkasan Paket Aktif & Kuota Harian */}
      <section className="rounded-xl border border-[#E1E8E4] bg-[#FFFFFF] p-6 space-y-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-[#E1E8E4] pb-4">
          <div>
            <span className="text-xs font-medium text-[#718078]">
              Paket Aktif Anda Saat Ini
            </span>
            <div className="mt-1 flex items-center gap-2.5">
              <h2 className="font-heading text-2xl font-bold text-[#172B25]">
                {PLAN_ENTITLEMENTS[activeTier].name}
              </h2>
              <Badge variant="completed">Aktif</Badge>
            </div>
          </div>

          <span className="text-xs text-[#718078]">
            Periode Kuota Harian: {usageDate} (Reset 00:00 WIB)
          </span>
        </div>

        {/* Bar Pemakaian Kuota Harian */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div className="rounded-xl border border-[#E1E8E4] bg-[#F8FAF9] p-4 space-y-2.5">
            <div className="flex items-center justify-between text-sm">
              <span className="font-semibold text-[#172B25]">
                Pemakaian Generate Roadmap Hari Ini
              </span>
              <span className="font-bold text-[#1B8366]">
                {roadmapUsed} / {roadmapLimit}x
              </span>
            </div>
            <div className="h-2.5 w-full overflow-hidden rounded-full bg-[#E8F4F0]">
              <div
                className="h-full rounded-full bg-[#1B8366]"
                style={{ width: `${roadmapPercent}%` }}
              />
            </div>
            <p className="text-xs text-[#718078]">
              Sisa kuota hari ini: {Math.max(0, roadmapLimit - roadmapUsed)}x
              pembuatan roadmap baru.
            </p>
          </div>

          <div className="rounded-xl border border-[#E1E8E4] bg-[#F8FAF9] p-4 space-y-2.5">
            <div className="flex items-center justify-between text-sm">
              <span className="font-semibold text-[#172B25]">
                Pemakaian Pesan AI Assistant Hari Ini
              </span>
              <span className="font-bold text-[#1B8366]">
                {assistantUsed} / {assistantLimit} pesan
              </span>
            </div>
            <div className="h-2.5 w-full overflow-hidden rounded-full bg-[#E8F4F0]">
              <div
                className="h-full rounded-full bg-[#1B8366]"
                style={{ width: `${assistantPercent}%` }}
              />
            </div>
            <p className="text-xs text-[#718078]">
              {assistantLimit > 0
                ? `Sisa kuota hari ini: ${Math.max(
                    0,
                    assistantLimit - assistantUsed
                  )} pesan.`
                : "Tidak tersedia pada paket Rintis Starter."}
            </p>
          </div>
        </div>

        {/* Keterangan Jujur Simulasi Pembayaran MVP */}
        <div className="rounded-xl border border-[#B7DCCF] bg-[#E8F4F0] p-4 flex items-start gap-3 text-xs sm:text-sm text-[#172B25]">
          <Info className="h-5 w-5 text-[#1B8366] shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-[#1B8366]">
              Mekanisme Simulasi Paket MVP (Tanpa Pembayaran Online)
            </p>
            <p className="mt-0.5 text-[#52645D]">
              Pada tahap MVP ini, integrasi payment gateway otomatis belum
              diaktifkan. Anda dapat langsung memilih paket di bawah ini untuk
              memperbarui status langganan di database server dan menguji
              perbedaan hak akses (entitlement) serta batas kuota harian.
            </p>
          </div>
        </div>
      </section>

      {/* Kartu Pilihan Paket — Paket yang sedang aktif berubah menjadi hijau (#1B8366) dengan teks putih (#FFFFFF) */}
      <section className="grid grid-cols-1 gap-6 lg:grid-cols-3 lg:items-stretch">
        {plans.map((plan) => {
          const isCurrent = plan.tier === activeTier;
          const isSwitching = switchingTier === plan.tier;

          return (
            <div
              key={plan.tier}
              className={`flex flex-col justify-between rounded-xl p-6 transition-colors ${
                isCurrent
                  ? "bg-[#1B8366] text-[#FFFFFF] border-2 border-[#125642]"
                  : "border border-[#E1E8E4] bg-[#FFFFFF] text-[#172B25]"
              }`}
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between gap-2">
                  <h3
                    className={`font-heading text-lg font-bold ${
                      isCurrent ? "text-[#FFFFFF]" : "text-[#172B25]"
                    }`}
                  >
                    {plan.name}
                  </h3>
                  <div className="flex items-center gap-1.5">
                    {plan.isPopular && !isCurrent && (
                      <span className="rounded-md border border-[#B7DCCF] bg-[#E8F4F0] px-2.5 py-1 text-xs font-semibold text-[#1B8366]">
                        Paling Populer
                      </span>
                    )}
                    {isCurrent && (
                      <span className="rounded-md bg-[#FFFFFF] px-2.5 py-1 text-xs font-semibold text-[#1B8366]">
                        Paket Aktif
                      </span>
                    )}
                  </div>
                </div>

                <p
                  className={`text-xs sm:text-sm ${
                    isCurrent ? "text-[#E8F4F0]" : "text-[#52645D]"
                  }`}
                >
                  {plan.tagline}
                </p>

                <div
                  className={`pt-2 border-t ${
                    isCurrent ? "border-[#166B53]" : "border-[#E1E8E4]"
                  }`}
                >
                  <span
                    className={`font-heading text-2xl font-bold ${
                      isCurrent ? "text-[#FFFFFF]" : "text-[#172B25]"
                    }`}
                  >
                    {plan.priceLabel}
                  </span>
                  <span
                    className={`block text-xs mt-0.5 ${
                      isCurrent ? "text-[#E8F4F0]" : "text-[#718078]"
                    }`}
                  >
                    {plan.priceNote}
                  </span>
                </div>

                <ul
                  className={`space-y-2.5 pt-2 text-xs sm:text-sm ${
                    isCurrent ? "text-[#FFFFFF]" : "text-[#172B25]"
                  }`}
                >
                  {plan.features.map((feat) => (
                    <li key={feat} className="flex items-start gap-2">
                      <CheckCircle2
                        className={`h-4 w-4 shrink-0 mt-0.5 ${
                          isCurrent ? "text-[#E8F4F0]" : "text-[#1B8366]"
                        }`}
                      />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div
                className={`mt-6 pt-4 border-t ${
                  isCurrent ? "border-[#166B53]" : "border-[#E1E8E4]"
                }`}
              >
                {isCurrent ? (
                  <button
                    type="button"
                    disabled
                    className="w-full rounded-lg bg-[#FFFFFF] px-4 py-2.5 text-sm font-semibold text-[#1B8366] cursor-default"
                  >
                    Sedang Digunakan
                  </button>
                ) : (
                  <Button
                    type="button"
                    variant="primary"
                    isLoading={isSwitching}
                    onClick={() => handleSwitchPlan(plan.tier)}
                    className="w-full"
                  >
                    {`Aktifkan ${plan.name} (MVP)`}
                  </Button>
                )}
              </div>
            </div>
          );
        })}
      </section>
    </div>
  );
}
