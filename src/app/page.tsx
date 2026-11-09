import Link from "next/link";
import {
  CheckCircle2,
  Map,
  Sparkles,
  Users,
  ClipboardCheck,
} from "lucide-react";
import { PublicNavbar, PublicFooter } from "@/components/layout/PublicNavbar";
import { Badge } from "@/components/ui/Badge";
import { PLAN_ENTITLEMENTS } from "@/lib/subscription/entitlements";
import { getPublicEnv } from "@/lib/env";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export default async function LandingPage() {
  let isAuthenticated = false;
  const { isSupabaseConfigured } = getPublicEnv();

  if (isSupabaseConfigured) {
    try {
      const supabase = await createServerSupabaseClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      isAuthenticated = Boolean(user);
    } catch {
      isAuthenticated = false;
    }
  }

  const plans = [
    PLAN_ENTITLEMENTS.starter,
    PLAN_ENTITLEMENTS.growth,
    PLAN_ENTITLEMENTS.max,
  ];

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAF9]">
      <PublicNavbar isAuthenticated={isAuthenticated} />

      <main className="flex-1">
        {/* 1. HERO SECTION — Centered, Minimal, No Images or Clutter */}
        <section className="bg-[#FFFFFF] border-b border-[#E1E8E4] py-20 sm:py-28">
          <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 text-center space-y-6">
            <div>
              <Badge variant="primary">Pendamping Bisnis Berbasis AI</Badge>
            </div>

            <h1 className="font-heading text-[36px] sm:text-[48px] font-bold leading-[1.15] text-[#172B25]">
              Temukan Arah,{" "}
              <span className="text-[#1B8366]">Bangun Usahamu.</span>
            </h1>

            <p className="mx-auto max-w-2xl text-base sm:text-lg leading-[1.6] text-[#52645D]">
              Susun rencana usaha yang terstruktur, pantau langkah eksekusi
              harian, dan diskusikan strategi bisnismu bersama AI maupun mentor
              praktisi.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 pt-2">
              <Link
                href={isAuthenticated ? "/roadmaps/new" : "/register"}
                className="w-full sm:w-auto inline-flex items-center justify-center rounded-lg bg-[#1B8366] px-6 py-3 text-sm font-semibold text-[#FFFFFF] transition-colors hover:bg-[#166B53] active:bg-[#125642]"
              >
                {isAuthenticated ? "Buat Roadmap Bisnis" : "Mulai Gratis"}
              </Link>
              <Link
                href="/#fitur"
                className="w-full sm:w-auto inline-flex items-center justify-center rounded-lg border border-[#C8D4CE] bg-[#FFFFFF] px-6 py-3 text-sm font-semibold text-[#172B25] transition-colors hover:bg-[#F8FAF9]"
              >
                Lihat Fitur
              </Link>
            </div>
          </div>
        </section>

        {/* 2. FITUR UTAMA — 4 Clean Cards */}
        <section id="fitur" className="py-16 sm:py-20">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 space-y-12">
            <div className="text-center max-w-xl mx-auto space-y-2.5">
              <h2 className="font-heading text-2xl sm:text-3xl font-bold text-[#172B25]">
                Semua yang Kamu Butuhkan untuk Memulai
              </h2>
              <p className="text-sm sm:text-base text-[#52645D]">
                Empat fitur inti yang dirancang ringkas agar kamu fokus pada
                eksekusi usaha.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {[
                {
                  icon: Map,
                  title: "AI Business Roadmap",
                  desc: "Rencana bisnis terstruktur sesuai fase, modal, dan target usahamu.",
                },
                {
                  icon: ClipboardCheck,
                  title: "Manajemen Task",
                  desc: "Daftar tugas bertahap yang jelas dan mudah dipantau progresnya.",
                },
                {
                  icon: Sparkles,
                  title: "AI Assistant",
                  desc: "Tanya jawab strategi harga, promosi, dan operasional kapan saja.",
                },
                {
                  icon: Users,
                  title: "Komunitas & Mentor",
                  desc: "Diskusi bersama sesama perintis dan sesi konsultasi 1-on-1.",
                },
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <div
                    key={item.title}
                    className="rounded-xl border border-[#E1E8E4] bg-[#FFFFFF] p-6 space-y-3.5 transition-colors hover:border-[#B7DCCF]"
                  >
                    <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-[#E8F4F0] text-[#1B8366]">
                      <Icon className="h-5 w-5" />
                    </div>
                    <h3 className="font-heading text-lg font-bold text-[#172B25]">
                      {item.title}
                    </h3>
                    <p className="text-sm text-[#52645D] leading-relaxed">
                      {item.desc}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* 3. CARA KERJA — 3 Simple Steps */}
        <section
          id="cara-kerja"
          className="border-y border-[#E1E8E4] bg-[#FFFFFF] py-16 sm:py-20"
        >
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 space-y-12">
            <div className="text-center max-w-xl mx-auto space-y-2.5">
              <h2 className="font-heading text-2xl sm:text-3xl font-bold text-[#172B25]">
                Cara Kerja yang Simpel
              </h2>
              <p className="text-sm sm:text-base text-[#52645D]">
                Tiga langkah praktis dari ide menjadi tindakan nyata.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              {[
                {
                  step: "1",
                  title: "Isi Profil Usaha",
                  desc: "Masukkan ide, fase bisnis, dan kisaran modal yang kamu miliki saat ini.",
                },
                {
                  step: "2",
                  title: "Dapatkan Roadmap AI",
                  desc: "Sistem menyusun tahapan kerja prioritas dan daftar tugas dalam hitungan detik.",
                },
                {
                  step: "3",
                  title: "Jalankan & Pantau",
                  desc: "Tandai tugas yang selesai dan konsultasikan kendalamu bersama AI atau mentor.",
                },
              ].map((item) => (
                <div
                  key={item.step}
                  className="rounded-xl border border-[#E1E8E4] bg-[#F8FAF9] p-6 space-y-3"
                >
                  <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-[#1B8366] font-heading text-sm font-bold text-[#FFFFFF]">
                    {item.step}
                  </span>
                  <h3 className="font-heading text-lg font-bold text-[#172B25]">
                    {item.title}
                  </h3>
                  <p className="text-sm text-[#52645D] leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 4. PILIHAN PAKET — Clean 3-Card Pricing */}
        <section className="py-16 sm:py-20">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 space-y-12">
            <div className="text-center max-w-xl mx-auto space-y-2.5">
              <h2 className="font-heading text-2xl sm:text-3xl font-bold text-[#172B25]">
                Pilihan Paket Langganan
              </h2>
              <p className="text-sm text-[#52645D]">
                Mulai gratis dan tingkatkan kapasitas pendampingan kapan saja.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3 lg:items-stretch">
              {plans.map((plan) => {
                const isFeatured = Boolean(plan.isPopular);
                return (
                  <div
                    key={plan.tier}
                    className={`flex flex-col justify-between rounded-xl p-6 sm:p-7 ${
                      isFeatured
                        ? "bg-[#1B8366] text-[#FFFFFF] border-2 border-[#125642]"
                        : "bg-[#FFFFFF] text-[#172B25] border border-[#E1E8E4]"
                    }`}
                  >
                    <div className="space-y-4">
                      <div className="flex items-center justify-between gap-2">
                        <h3
                          className={`font-heading text-xl font-bold ${
                            isFeatured ? "text-[#FFFFFF]" : "text-[#172B25]"
                          }`}
                        >
                          {plan.name}
                        </h3>
                        {isFeatured && (
                          <span className="rounded-md bg-[#FFFFFF] px-2.5 py-1 text-xs font-semibold text-[#1B8366]">
                            Populer
                          </span>
                        )}
                      </div>

                      <div
                        className={`pt-3 border-t ${
                          isFeatured ? "border-[#166B53]" : "border-[#E1E8E4]"
                        }`}
                      >
                        <span
                          className={`font-heading text-3xl font-bold ${
                            isFeatured ? "text-[#FFFFFF]" : "text-[#172B25]"
                          }`}
                        >
                          {plan.priceLabel}
                        </span>
                        <span
                          className={`block text-xs mt-1 ${
                            isFeatured ? "text-[#E8F4F0]" : "text-[#718078]"
                          }`}
                        >
                          {plan.priceNote}
                        </span>
                      </div>

                      <ul className="space-y-2.5 pt-2 text-sm">
                        {plan.features.map((feat) => (
                          <li key={feat} className="flex items-start gap-2.5">
                            <CheckCircle2
                              className={`h-4 w-4 shrink-0 mt-0.5 ${
                                isFeatured ? "text-[#E8F4F0]" : "text-[#1B8366]"
                              }`}
                            />
                            <span>{feat}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div
                      className={`mt-8 pt-4 border-t ${
                        isFeatured ? "border-[#166B53]" : "border-[#E1E8E4]"
                      }`}
                    >
                      <Link
                        href={
                          isAuthenticated
                            ? "/settings/subscription"
                            : "/register"
                        }
                        className={`flex w-full items-center justify-center rounded-lg px-4 py-2.5 text-sm font-semibold transition-colors ${
                          isFeatured
                            ? "bg-[#FFFFFF] text-[#1B8366] hover:bg-[#E8F4F0]"
                            : "border border-[#C8D4CE] bg-[#FFFFFF] text-[#172B25] hover:bg-[#F8FAF9]"
                        }`}
                      >
                        {isAuthenticated
                          ? `Kelola ${plan.name}`
                          : `Pilih ${plan.name}`}
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      </main>

      <PublicFooter />
    </div>
  );
}
