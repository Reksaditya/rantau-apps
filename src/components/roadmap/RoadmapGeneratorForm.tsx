"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Sparkles, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { AlertBanner } from "@/components/ui/AlertBanner";
import { Badge } from "@/components/ui/Badge";
import type { BusinessProfile, BusinessStage } from "@/types/database";

interface RoadmapGeneratorFormProps {
  initialProfile?: BusinessProfile | null;
  mode: "onboarding" | "generate_roadmap";
  remainingQuota?: number;
  dailyLimit?: number;
  planName?: string;
}

const INDUSTRY_OPTIONS = [
  "Kuliner, Makanan & Minuman (F&B)",
  "Fesyen, Pakaian & Tekstil",
  "Jasa Layanan & Kebersihan",
  "Kreatif, Desain & Agensi Digital",
  "Retail, Sembako & Toko Kelontong",
  "Kecantikan & Perawatan Diri",
  "Pertanian, Perikanan & Olahan Pangan",
  "Pendidikan, Kursus & Pelatihan",
  "Lainnya",
];

const CAPITAL_OPTIONS = [
  "Di bawah Rp2.000.000 (Modal Mikro)",
  "Rp2.000.000 – Rp5.000.000",
  "Rp5.000.000 – Rp15.000.000",
  "Rp15.000.000 – Rp50.000.000",
  "Di atas Rp50.000.000",
];

const STAGE_CARDS: {
  value: BusinessStage;
  title: string;
  subtitle: string;
  adaptiveHint: string;
}[] = [
  {
    value: "not_started",
    title: "Belum Dimulai",
    subtitle: "Baru memiliki ide atau sedang mempersiapkan peluncuran awal.",
    adaptiveHint:
      "AI akan berfokus pada validasi ide hemat biaya, perhitungan HPP/modal awal, dan cara meraih 10 pembeli pertama.",
  },
  {
    value: "starting",
    title: "Sedang Dirintis",
    subtitle: "Usaha sudah berjalan < 6 bulan dan sedang mencari pola pasar.",
    adaptiveHint:
      "AI akan berfokus pada konsistensi kualitas produk, strategi promosi rutin, dan pengelolaan arus kas dasar.",
  },
  {
    value: "running",
    title: "Sudah Berjalan",
    subtitle:
      "Usaha berjalan > 6 bulan namun omzet stagnan atau ingin ekspansi.",
    adaptiveHint:
      "AI akan berfokus pada diagnosis akar stagnasi penjualan, retensi pelanggan, efisiensi SOP tim, dan ekspansi.",
  },
];

export function RoadmapGeneratorForm({
  initialProfile,
  mode,
  remainingQuota = 2,
  dailyLimit = 2,
  planName = "Rantau Starter",
}: RoadmapGeneratorFormProps) {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2 | 3>(1);

  const [businessStage, setBusinessStage] = useState<BusinessStage>(
    initialProfile?.business_stage ?? "not_started"
  );
  const [businessName, setBusinessName] = useState(
    initialProfile?.business_name ?? ""
  );
  const [industryCategory, setIndustryCategory] = useState(
    initialProfile?.industry_category ?? INDUSTRY_OPTIONS[0]
  );
  const [productDescription, setProductDescription] = useState(
    initialProfile?.product_description ?? ""
  );
  const [targetCustomer, setTargetCustomer] = useState(
    initialProfile?.target_customer ?? ""
  );
  const [operationalLocation, setOperationalLocation] = useState(
    initialProfile?.operational_location ?? ""
  );
  const [estimatedCapital, setEstimatedCapital] = useState(
    initialProfile?.estimated_capital ?? CAPITAL_OPTIONS[1]
  );
  const [businessGoals, setBusinessGoals] = useState(
    initialProfile?.business_goals ?? ""
  );
  const [mainChallenges, setMainChallenges] = useState(
    initialProfile?.main_challenges ?? ""
  );
  const [priorExperience, setPriorExperience] = useState(
    initialProfile?.prior_experience ??
      "Belum memiliki pengalaman bisnis sebelumnya"
  );

  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  function validateStep(currentStep: 1 | 2 | 3): boolean {
    setErrorMsg(null);
    if (currentStep === 1) {
      if (businessName.trim().length < 2) {
        setErrorMsg("Harap isi nama atau ide bisnis Anda (minimal 2 karakter).");
        return false;
      }
      if (productDescription.trim().length < 15) {
        setErrorMsg(
          "Jelaskan produk atau layanan Anda sedikit lebih detail (minimal 15 karakter)."
        );
        return false;
      }
      return true;
    }

    if (currentStep === 2) {
      if (targetCustomer.trim().length < 5) {
        setErrorMsg("Sebutkan siapa target pembeli utama Anda.");
        return false;
      }
      if (operationalLocation.trim().length < 3) {
        setErrorMsg("Sebutkan kota atau lokasi operasional usaha Anda.");
        return false;
      }
      return true;
    }

    if (businessGoals.trim().length < 10) {
      setErrorMsg(
        "Tuliskan target atau tujuan bisnis yang ingin dicapai (minimal 10 karakter)."
      );
      return false;
    }
    if (mainChallenges.trim().length < 10) {
      setErrorMsg(
        "Tuliskan kendala atau kebingungan utama yang sedang Anda hadapi (minimal 10 karakter)."
      );
      return false;
    }
    return true;
  }

  async function handleSaveOrGenerate(action: "save_only" | "generate") {
    if (!validateStep(3)) return;

    try {
      setSubmitting(true);
      setErrorMsg(null);
      setSuccessMsg(null);

      const payload = {
        business_name: businessName.trim(),
        business_stage: businessStage,
        industry_category: industryCategory.trim(),
        product_description: productDescription.trim(),
        target_customer: targetCustomer.trim(),
        operational_location: operationalLocation.trim(),
        estimated_capital: estimatedCapital.trim(),
        business_goals: businessGoals.trim(),
        main_challenges: mainChallenges.trim(),
        prior_experience: priorExperience.trim(),
        save_to_business_profile: true,
      };

      if (action === "save_only") {
        const res = await fetch("/api/profile/business", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const data = await res.json();
        if (!res.ok) {
          setErrorMsg(data.error || "Gagal menyimpan profil bisnis.");
          setSubmitting(false);
          return;
        }
        setSuccessMsg(
          "Profil bisnis Anda berhasil disimpan ke database. Anda dapat langsung menyusun Roadmap AI kapan saja."
        );
        setSubmitting(false);
        router.refresh();
        return;
      }

      const res = await fetch("/api/roadmaps/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();

      if (!res.ok) {
        setErrorMsg(
          data.error || "Terjadi kendala saat menyusun roadmap bisnis."
        );
        setSubmitting(false);
        return;
      }

      router.push(`/roadmaps/${data.roadmapId}`);
      router.refresh();
    } catch (err) {
      setErrorMsg(
        err instanceof Error
          ? err.message
          : "Terjadi kesalahan jaringan. Silakan coba kembali."
      );
      setSubmitting(false);
    }
  }

  const activeStageMeta =
    STAGE_CARDS.find((s) => s.value === businessStage) ?? STAGE_CARDS[0];

  return (
    <div className="space-y-6">
      {/* Stepper Header */}
      <div className="rounded-xl border border-[#E1E8E4] bg-[#FFFFFF] p-5 sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3 sm:gap-6">
            {[
              { num: 1, label: "Kondisi & Ide Produk" },
              { num: 2, label: "Pasar, Lokasi & Modal" },
              { num: 3, label: "Tujuan & Kendala" },
            ].map((item) => {
              const isCurrent = step === item.num;
              const isDone = step > item.num;
              return (
                <button
                  key={item.num}
                  type="button"
                  onClick={() => {
                    if (item.num < step) setStep(item.num as 1 | 2 | 3);
                  }}
                  className="flex items-center gap-2 text-left cursor-pointer"
                >
                  <span
                    className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ${
                      isCurrent || isDone
                        ? "bg-[#1B8366] text-[#FFFFFF]"
                        : "bg-[#EEF2F0] text-[#52645D]"
                    }`}
                  >
                    {isDone ? (
                      <CheckCircle2 className="h-4 w-4" />
                    ) : (
                      item.num
                    )}
                  </span>
                  <span
                    className={`text-xs sm:text-sm font-medium ${
                      isCurrent
                        ? "font-semibold text-[#172B25]"
                        : "text-[#52645D]"
                    }`}
                  >
                    {item.label}
                  </span>
                </button>
              );
            })}
          </div>

          {mode === "generate_roadmap" && (
            <Badge
              variant={remainingQuota > 0 ? "primary" : "warning"}
              className="self-start sm:self-auto"
            >
              Sisa Kuota Hari Ini: {remainingQuota}/{dailyLimit} ({planName})
            </Badge>
          )}
        </div>
      </div>

      {errorMsg && <AlertBanner variant="error" message={errorMsg} />}
      {successMsg && (
        <AlertBanner
          variant="success"
          message={successMsg}
          actionHref="/roadmaps/new"
          actionLabel="Generate Roadmap Sekarang"
        />
      )}

      {/* Loading Indicator during AI Generation */}
      {submitting && (
        <div className="rounded-xl border border-[#B7DCCF] bg-[#E8F4F0] p-6 space-y-3">
          <div className="flex items-center gap-3">
            <span className="h-5 w-5 animate-spin rounded-full border-2 border-[#1B8366] border-t-transparent" />
            <h3 className="font-heading text-base font-bold text-[#172B25]">
              AI Rantau sedang menyusun 12 analisis strategis & tahapan tugas...
            </h3>
          </div>
          <p className="text-xs sm:text-sm text-[#52645D]">
            Proses ini memakan waktu sekitar 10–25 detik karena AI memvalidasi
            struktur tahapan, estimasi alokasi modal, dan indikator keberhasilan
            tiap tugas untuk usaha{" "}
            <strong className="font-semibold text-[#172B25]">
              {businessName}
            </strong>
            .
          </p>
        </div>
      )}

      {/* Form Card */}
      <div className="rounded-xl border border-[#E1E8E4] bg-[#FFFFFF] p-6 space-y-6">
        {step === 1 && (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-[#172B25]">
                1. Pilih Kondisi Usaha Anda Saat Ini
              </label>
              <p className="mt-1 text-xs text-[#52645D]">
                Pertanyaan berikutnya dan strategi AI akan menyesuaikan dengan
                fase yang Anda pilih.
              </p>

              <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-3">
                {STAGE_CARDS.map((card) => {
                  const selected = businessStage === card.value;
                  return (
                    <button
                      key={card.value}
                      type="button"
                      onClick={() => setBusinessStage(card.value)}
                      className={`rounded-xl p-4 text-left transition-colors cursor-pointer ${
                        selected
                          ? "border-2 border-[#1B8366] bg-[#E8F4F0]"
                          : "border border-[#E1E8E4] bg-[#FFFFFF] hover:bg-[#F8FAF9]"
                      }`}
                    >
                      <p className="font-heading text-base font-bold text-[#172B25]">
                        {card.title}
                      </p>
                      <p className="mt-1 text-xs text-[#52645D]">
                        {card.subtitle}
                      </p>
                    </button>
                  );
                })}
              </div>

              <div className="mt-3 rounded-lg border border-[#E1E8E4] bg-[#F8FAF9] px-3.5 py-2.5 text-xs text-[#52645D]">
                <strong className="font-semibold text-[#172B25]">
                  Fokus Analisis AI:{" "}
                </strong>
                {activeStageMeta.adaptiveHint}
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="business-name"
                  className="block text-sm font-medium text-[#172B25]"
                >
                  {businessStage === "not_started"
                    ? "Nama Rencana / Ide Bisnis"
                    : "Nama Usaha Anda"}
                </label>
                <input
                  id="business-name"
                  type="text"
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  placeholder="Contoh: Kopi Rantau Literan / Jasa Cuci Sepatu Bersih"
                  className="mt-1.5 w-full rounded-lg border border-[#C8D4CE] bg-[#FFFFFF] px-3 py-2.5 text-sm text-[#172B25] placeholder:text-[#718078]"
                />
                <p className="mt-1 text-xs text-[#718078]">
                  Jika belum punya nama resmi, tuliskan nama ide produknya.
                </p>
              </div>

              <div>
                <label
                  htmlFor="industry-category"
                  className="block text-sm font-medium text-[#172B25]"
                >
                  Kategori Industri
                </label>
                <select
                  id="industry-category"
                  value={industryCategory}
                  onChange={(e) => setIndustryCategory(e.target.value)}
                  className="mt-1.5 w-full rounded-lg border border-[#C8D4CE] bg-[#FFFFFF] px-3 py-2.5 text-sm text-[#172B25]"
                >
                  {INDUSTRY_OPTIONS.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label
                htmlFor="product-description"
                className="block text-sm font-medium text-[#172B25]"
              >
                {businessStage === "not_started"
                  ? "Deskripsi Ide Produk / Jasa yang Ingin Dijual"
                  : "Deskripsi Produk Utama & Cara Penjualan Saat Ini"}
              </label>
              <textarea
                id="product-description"
                rows={4}
                value={productDescription}
                onChange={(e) => setProductDescription(e.target.value)}
                placeholder={
                  businessStage === "not_started"
                    ? "Contoh: Saya ingin menjual kopi susu gula aren kemasan botol 1 liter dan 250ml dengan sistem pre-order dari dapur rumah untuk pekerja kantor dan mahasiswa."
                    : "Contoh: Kami menjual paket katering sehat harian lewat WhatsApp dan Instagram, rata-rata 15 porsi per hari dengan harga Rp35.000/porsi."
                }
                className="mt-1.5 w-full rounded-lg border border-[#C8D4CE] bg-[#FFFFFF] px-3 py-2.5 text-sm text-[#172B25] placeholder:text-[#718078]"
              />
              <p className="mt-1 text-xs text-[#52645D]">
                Panduan pemula: Sebutkan jenis barang/jasa, kisaran harga jika
                ada, dan bagaimana pelanggan memesannya.
              </p>
            </div>

            <div className="flex justify-end pt-2">
              <Button
                type="button"
                variant="primary"
                onClick={() => {
                  if (validateStep(1)) setStep(2);
                }}
              >
                Lanjut ke Pasar & Modal
              </Button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6">
            <div>
              <label
                htmlFor="target-customer"
                className="block text-sm font-medium text-[#172B25]"
              >
                Siapa Target Pelanggan Utama Anda?
              </label>
              <textarea
                id="target-customer"
                rows={3}
                value={targetCustomer}
                onChange={(e) => setTargetCustomer(e.target.value)}
                placeholder="Contoh: Mahasiswa indekos dan pekerja kantoran usia 20–32 tahun yang butuh sarapan/minuman praktis dengan harga terjangkau."
                className="mt-1.5 w-full rounded-lg border border-[#C8D4CE] bg-[#FFFFFF] px-3 py-2.5 text-sm text-[#172B25] placeholder:text-[#718078]"
              />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="operational-location"
                  className="block text-sm font-medium text-[#172B25]"
                >
                  Lokasi Operasional / Target Area
                </label>
                <input
                  id="operational-location"
                  type="text"
                  value={operationalLocation}
                  onChange={(e) => setOperationalLocation(e.target.value)}
                  placeholder="Contoh: Bandung (Area Kampus Dipatiukur & Online)"
                  className="mt-1.5 w-full rounded-lg border border-[#C8D4CE] bg-[#FFFFFF] px-3 py-2.5 text-sm text-[#172B25] placeholder:text-[#718078]"
                />
                <p className="mt-1 text-xs text-[#718078]">
                  Sebutkan kota dan apakah berjualan dari rumah, ruko, atau
                  online.
                </p>
              </div>

              <div>
                <label
                  htmlFor="estimated-capital"
                  className="block text-sm font-medium text-[#172B25]"
                >
                  {businessStage === "running"
                    ? "Anggaran Pengembangan / Modal Kerja Tersedia"
                    : "Estimasi Modal Awal yang Tersedia"}
                </label>
                <select
                  id="estimated-capital"
                  value={estimatedCapital}
                  onChange={(e) => setEstimatedCapital(e.target.value)}
                  className="mt-1.5 w-full rounded-lg border border-[#C8D4CE] bg-[#FFFFFF] px-3 py-2.5 text-sm text-[#172B25]"
                >
                  {CAPITAL_OPTIONS.map((cap) => (
                    <option key={cap} value={cap}>
                      {cap}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label
                htmlFor="prior-experience"
                className="block text-sm font-medium text-[#172B25]"
              >
                Pengalaman Bisnis Sebelumnya
              </label>
              <input
                id="prior-experience"
                type="text"
                value={priorExperience}
                onChange={(e) => setPriorExperience(e.target.value)}
                placeholder="Contoh: Belum pernah berbisnis, baru pernah ikut bazar kampus"
                className="mt-1.5 w-full rounded-lg border border-[#C8D4CE] bg-[#FFFFFF] px-3 py-2.5 text-sm text-[#172B25] placeholder:text-[#718078]"
              />
            </div>

            <div className="flex items-center justify-between pt-2">
              <Button
                type="button"
                variant="secondary"
                onClick={() => setStep(1)}
              >
                Kembali
              </Button>
              <Button
                type="button"
                variant="primary"
                onClick={() => {
                  if (validateStep(2)) setStep(3);
                }}
              >
                Lanjut ke Tujuan & Kendala
              </Button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6">
            <div>
              <label
                htmlFor="business-goals"
                className="block text-sm font-medium text-[#172B25]"
              >
                Tujuan Utama dalam 3–6 Bulan ke Depan
              </label>
              <textarea
                id="business-goals"
                rows={3}
                value={businessGoals}
                onChange={(e) => setBusinessGoals(e.target.value)}
                placeholder={
                  businessStage === "not_started"
                    ? "Contoh: Meluncurkan produk pertama, balik modal peralatan awal, dan mendapatkan 50 pelanggan berulang."
                    : "Contoh: Meningkatkan omzet bulanan sebesar 40%, merapikan pencatatan keuangan, dan menambah 1 staf produksi."
                }
                className="mt-1.5 w-full rounded-lg border border-[#C8D4CE] bg-[#FFFFFF] px-3 py-2.5 text-sm text-[#172B25] placeholder:text-[#718078]"
              />
            </div>

            <div>
              <label
                htmlFor="main-challenges"
                className="block text-sm font-medium text-[#172B25]"
              >
                {businessStage === "not_started"
                  ? "Kekhawatiran atau Kebingungan Terbesar Saat Ini"
                  : "Kendala Utama / Penyebab Stagnasi yang Dirasakan"}
              </label>
              <textarea
                id="main-challenges"
                rows={3}
                value={mainChallenges}
                onChange={(e) => setMainChallenges(e.target.value)}
                placeholder={
                  businessStage === "not_started"
                    ? "Contoh: Bingung menghitung HPP agar tidak rugi, belum punya supplier tetap, dan ragu bagaimana cara promosi awal."
                    : "Contoh: Pembeli hanya ramai di awal bulan, biaya iklan kurang efektif, dan kewalahan mengatur waktu produksi sendiri."
                }
                className="mt-1.5 w-full rounded-lg border border-[#C8D4CE] bg-[#FFFFFF] px-3 py-2.5 text-sm text-[#172B25] placeholder:text-[#718078]"
              />
            </div>

            <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between pt-3 border-t border-[#E1E8E4]">
              <Button
                type="button"
                variant="secondary"
                disabled={submitting}
                onClick={() => setStep(2)}
              >
                Kembali
              </Button>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                {mode === "onboarding" && (
                  <Button
                    type="button"
                    variant="subtle"
                    isLoading={submitting}
                    onClick={() => handleSaveOrGenerate("save_only")}
                  >
                    Simpan Profil Usaha Saja
                  </Button>
                )}

                <Button
                  type="button"
                  variant="primary"
                  isLoading={submitting}
                  onClick={() => handleSaveOrGenerate("generate")}
                >
                  <Sparkles className="h-4 w-4" />
                  <span>Generate AI Business Roadmap</span>
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

