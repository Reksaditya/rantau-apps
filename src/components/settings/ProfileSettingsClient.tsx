"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { AlertBanner } from "@/components/ui/AlertBanner";
import type { BusinessProfile, BusinessStage } from "@/types/database";

interface ProfileSettingsClientProps {
  initialFullName: string;
  email: string;
  initialBusiness: BusinessProfile | null;
}

export function ProfileSettingsClient({
  initialFullName,
  email,
  initialBusiness,
}: ProfileSettingsClientProps) {
  const router = useRouter();
  const [fullName, setFullName] = useState(initialFullName);
  const [businessName, setBusinessName] = useState(
    initialBusiness?.business_name ?? ""
  );
  const [businessStage, setBusinessStage] = useState<BusinessStage>(
    initialBusiness?.business_stage ?? "not_started"
  );
  const [industryCategory, setIndustryCategory] = useState(
    initialBusiness?.industry_category ?? "Kuliner, Makanan & Minuman (F&B)"
  );
  const [productDescription, setProductDescription] = useState(
    initialBusiness?.product_description ?? ""
  );
  const [targetCustomer, setTargetCustomer] = useState(
    initialBusiness?.target_customer ?? ""
  );
  const [operationalLocation, setOperationalLocation] = useState(
    initialBusiness?.operational_location ?? ""
  );
  const [estimatedCapital, setEstimatedCapital] = useState(
    initialBusiness?.estimated_capital ?? "Rp2.000.000 – Rp5.000.000"
  );
  const [businessGoals, setBusinessGoals] = useState(
    initialBusiness?.business_goals ?? ""
  );
  const [mainChallenges, setMainChallenges] = useState(
    initialBusiness?.main_challenges ?? ""
  );
  const [priorExperience, setPriorExperience] = useState(
    initialBusiness?.prior_experience ??
      "Belum memiliki pengalaman bisnis sebelumnya"
  );

  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      setSaving(true);
      const res = await fetch("/api/profile/business", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          full_name: fullName.trim(),
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
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(
          data.error || "Data profil belum lengkap. Periksa kembali isian Anda."
        );
        setSaving(false);
        return;
      }

      setSuccessMsg(
        "Pengaturan profil akun dan konteks usaha berhasil diperbarui."
      );
      setSaving(false);
      router.refresh();
    } catch {
      setErrorMsg("Terjadi kendala jaringan saat menyimpan profil.");
      setSaving(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-xl border border-[#E1E8E4] bg-[#FFFFFF] p-6 space-y-6"
      noValidate
    >
      {errorMsg && <AlertBanner variant="error" message={errorMsg} />}
      {successMsg && <AlertBanner variant="success" message={successMsg} />}

      <div className="space-y-4 border-b border-[#E1E8E4] pb-6">
        <h2 className="font-heading text-lg font-bold text-[#172B25]">
          Informasi Akun Pengguna
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label
              htmlFor="settings-fullname"
              className="block text-sm font-medium text-[#172B25]"
            >
              Nama Lengkap
            </label>
            <input
              id="settings-fullname"
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="mt-1.5 w-full rounded-lg border border-[#C8D4CE] bg-[#FFFFFF] px-3 py-2.5 text-sm text-[#172B25]"
            />
          </div>
          <div>
            <label
              htmlFor="settings-email"
              className="block text-sm font-medium text-[#172B25]"
            >
              Alamat Email Terdaftar
            </label>
            <input
              id="settings-email"
              type="email"
              disabled
              value={email}
              className="mt-1.5 w-full rounded-lg border border-[#E1E8E4] bg-[#EEF2F0] px-3 py-2.5 text-sm text-[#98A59E] cursor-not-allowed"
            />
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="font-heading text-lg font-bold text-[#172B25]">
          Profil & Konteks Usaha
        </h2>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div>
            <label
              htmlFor="settings-bname"
              className="block text-sm font-medium text-[#172B25]"
            >
              Nama / Ide Bisnis
            </label>
            <input
              id="settings-bname"
              type="text"
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
              placeholder="Nama usaha Anda"
              className="mt-1.5 w-full rounded-lg border border-[#C8D4CE] bg-[#FFFFFF] px-3 py-2.5 text-sm text-[#172B25]"
            />
          </div>

          <div>
            <label
              htmlFor="settings-bstage"
              className="block text-sm font-medium text-[#172B25]"
            >
              Tahap Usaha
            </label>
            <select
              id="settings-bstage"
              value={businessStage}
              onChange={(e) =>
                setBusinessStage(e.target.value as BusinessStage)
              }
              className="mt-1.5 w-full rounded-lg border border-[#C8D4CE] bg-[#FFFFFF] px-3 py-2.5 text-sm text-[#172B25]"
            >
              <option value="not_started">Belum Dimulai</option>
              <option value="starting">Sedang Dirintis</option>
              <option value="running">Sudah Berjalan</option>
            </select>
          </div>

          <div>
            <label
              htmlFor="settings-industry"
              className="block text-sm font-medium text-[#172B25]"
            >
              Kategori Industri
            </label>
            <input
              id="settings-industry"
              type="text"
              value={industryCategory}
              onChange={(e) => setIndustryCategory(e.target.value)}
              className="mt-1.5 w-full rounded-lg border border-[#C8D4CE] bg-[#FFFFFF] px-3 py-2.5 text-sm text-[#172B25]"
            />
          </div>
        </div>

        <div>
          <label
            htmlFor="settings-desc"
            className="block text-sm font-medium text-[#172B25]"
          >
            Deskripsi Produk / Jasa (Minimal 15 karakter)
          </label>
          <textarea
            id="settings-desc"
            rows={3}
            value={productDescription}
            onChange={(e) => setProductDescription(e.target.value)}
            className="mt-1.5 w-full rounded-lg border border-[#C8D4CE] bg-[#FFFFFF] px-3 py-2.5 text-sm text-[#172B25]"
          />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div>
            <label
              htmlFor="settings-customer"
              className="block text-sm font-medium text-[#172B25]"
            >
              Target Pelanggan
            </label>
            <input
              id="settings-customer"
              type="text"
              value={targetCustomer}
              onChange={(e) => setTargetCustomer(e.target.value)}
              className="mt-1.5 w-full rounded-lg border border-[#C8D4CE] bg-[#FFFFFF] px-3 py-2.5 text-sm text-[#172B25]"
            />
          </div>
          <div>
            <label
              htmlFor="settings-location"
              className="block text-sm font-medium text-[#172B25]"
            >
              Lokasi Operasional
            </label>
            <input
              id="settings-location"
              type="text"
              value={operationalLocation}
              onChange={(e) => setOperationalLocation(e.target.value)}
              className="mt-1.5 w-full rounded-lg border border-[#C8D4CE] bg-[#FFFFFF] px-3 py-2.5 text-sm text-[#172B25]"
            />
          </div>
          <div>
            <label
              htmlFor="settings-capital"
              className="block text-sm font-medium text-[#172B25]"
            >
              Estimasi Modal
            </label>
            <input
              id="settings-capital"
              type="text"
              value={estimatedCapital}
              onChange={(e) => setEstimatedCapital(e.target.value)}
              className="mt-1.5 w-full rounded-lg border border-[#C8D4CE] bg-[#FFFFFF] px-3 py-2.5 text-sm text-[#172B25]"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label
              htmlFor="settings-goals"
              className="block text-sm font-medium text-[#172B25]"
            >
              Tujuan Bisnis (Minimal 10 karakter)
            </label>
            <textarea
              id="settings-goals"
              rows={2}
              value={businessGoals}
              onChange={(e) => setBusinessGoals(e.target.value)}
              className="mt-1.5 w-full rounded-lg border border-[#C8D4CE] bg-[#FFFFFF] px-3 py-2.5 text-sm text-[#172B25]"
            />
          </div>
          <div>
            <label
              htmlFor="settings-challenges"
              className="block text-sm font-medium text-[#172B25]"
            >
              Kendala Utama (Minimal 10 karakter)
            </label>
            <textarea
              id="settings-challenges"
              rows={2}
              value={mainChallenges}
              onChange={(e) => setMainChallenges(e.target.value)}
              className="mt-1.5 w-full rounded-lg border border-[#C8D4CE] bg-[#FFFFFF] px-3 py-2.5 text-sm text-[#172B25]"
            />
          </div>
        </div>

        <div>
          <label
            htmlFor="settings-exp"
            className="block text-sm font-medium text-[#172B25]"
          >
            Pengalaman Bisnis Sebelumnya
          </label>
          <input
            id="settings-exp"
            type="text"
            value={priorExperience}
            onChange={(e) => setPriorExperience(e.target.value)}
            className="mt-1.5 w-full rounded-lg border border-[#C8D4CE] bg-[#FFFFFF] px-3 py-2.5 text-sm text-[#172B25]"
          />
        </div>
      </div>

      <div className="flex justify-end pt-2 border-t border-[#E1E8E4]">
        <Button type="submit" variant="primary" isLoading={saving}>
          Simpan Perubahan Profil
        </Button>
      </div>
    </form>
  );
}

