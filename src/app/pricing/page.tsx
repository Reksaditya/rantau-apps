import Link from "next/link";
import { CheckCircle2, Minus, Sparkles } from "lucide-react";
import { PublicNavbar, PublicFooter } from "@/components/layout/PublicNavbar";
import { Badge } from "@/components/ui/Badge";
import { FaqAccordionGrid, type FaqItem } from "@/components/ui/FaqAccordionGrid";
import { PLAN_ENTITLEMENTS } from "@/lib/subscription/entitlements";
import { getPublicEnv } from "@/lib/env";
import { createServerSupabaseClient } from "@/lib/supabase/server";

const PRICING_FAQS: FaqItem[] = [
  {
    question: "Bagaimana cara mencoba paket Rintis Growth atau Rintis Max di tahap MVP?",
    answer:
      "Setelah masuk ke akun Anda, buka menu Langganan & Kuota pada sidebar. Anda dapat langsung memilih dan mengaktifkan paket Starter, Growth, atau Max tanpa kartu kredit untuk menguji kuota server.",
  },
  {
    question: "Apa yang terjadi pada tahap roadmap ke-4 dan seterusnya jika saya menggunakan Starter?",
    answer:
      "Pada paket Rintis Starter, ringkasan bisnis dan 3 tahapan implementasi awal terbuka penuh. Tahap ke-4 dan seterusnya disimpan aman di database dan langsung terbuka begitu Anda beralih ke paket Growth atau Max.",
  },
  {
    question: "Apakah kuota harian yang tidak terpakai akan diakumulasikan ke hari berikutnya?",
    answer:
      "Kuota bersifat harian dan di-reset otomatis setiap pukul 00:00 WIB (Asia/Jakarta) kembali ke batas maksimal paket Anda.",
  },
  {
    question: "Apakah pengguna Starter tetap bisa membaca diskusi di Forum Komunitas?",
    answer:
      "Ya, pengguna Rintis Starter memiliki akses baca (Read-only) penuh terhadap seluruh topik dan komentar di Forum Komunitas serta dapat melihat profil mentor di Direktori Mentor.",
  },
];

export default async function PricingPage() {
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

  const comparisonRows = [
    {
      label: "Target Pengguna Utama",
      starter: "Eksplorasi ide bisnis awal",
      growth: "Perencanaan & pengembangan usaha mendalam",
      max: "Pendampingan komprehensif bersama AI & Mentor",
    },
    {
      label: "Kuota Generate Roadmap Harian",
      starter: "2x per hari",
      growth: "10x per hari",
      max: "25x per hari",
    },
    {
      label: "Cakupan Tampilan Tahap Roadmap",
      starter: "Ringkasan + 3 tahap awal terbuka penuh",
      growth: "Seluruh tahapan & 12 komponen terbuka penuh",
      max: "Seluruh tahapan & 12 komponen terbuka penuh",
    },
    {
      label: "Penyimpanan & Manajemen Status Task",
      starter: "Tersedia",
      growth: "Tersedia",
      max: "Tersedia",
    },
    {
      label: "Akses AI Business Assistant",
      starter: "Tidak tersedia",
      growth: "Tersedia (Kontekstual dengan Roadmap)",
      max: "Tersedia (Kontekstual dengan Roadmap)",
    },
    {
      label: "Kuota Pesan AI Assistant Harian",
      starter: "0 pesan / hari",
      growth: "30 pesan / hari",
      max: "100 pesan / hari",
    },
    {
      label: "Hak Akses Community Forum",
      starter: "Baca diskusi (Read-only)",
      growth: "Baca, buat diskusi, komentar, & upvote",
      max: "Baca, buat diskusi, komentar, & upvote",
    },
    {
      label: "Booking Konsultasi Mentor 1-on-1",
      starter: "Tidak tersedia",
      growth: "Tidak tersedia",
      max: "Tersedia (Akses penuh booking slot)",
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAF9]">
      <PublicNavbar isAuthenticated={isAuthenticated} />

      <main className="flex-1 py-12 lg:py-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 space-y-16">
          {/* Header Section */}
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <Badge variant="primary">Paket Langganan & Hak Akses</Badge>
            <h1 className="font-heading text-3xl sm:text-4xl font-bold text-[#172B25]">
              Pilih Paket Pendamping Sesuai Fase Usaha Anda
            </h1>
            <p className="text-base text-[#52645D]">
              Mulai gratis dengan Rintis Starter untuk memvalidasi ide awal,
              atau beralih ke Growth dan Max untuk membuka seluruh 12 komponen
              strategis, AI Assistant harian, dan sesi konsultasi mentor.
            </p>
            <p className="text-xs font-medium text-[#718078]">
              Keterangan jujur MVP: Harga di bawah merupakan placeholder
              simulasi MVP dan belum menarik biaya pembayaran online.
            </p>
          </div>

          {/* 3 Kartu Paket Sejajar (Center Card Filled #1B8366 per Reference Image 2 & DESIGN.md) */}
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
                      <h2
                        className={`font-heading text-xl font-bold ${
                          isFeatured ? "text-[#FFFFFF]" : "text-[#172B25]"
                        }`}
                      >
                        {plan.name}
                      </h2>
                      {isFeatured && (
                        <span className="rounded-md bg-[#FFFFFF] px-2.5 py-1 text-xs font-semibold text-[#1B8366]">
                          Paling Populer
                        </span>
                      )}
                    </div>
                    <p
                      className={`text-sm ${
                        isFeatured ? "text-[#E8F4F0]" : "text-[#52645D]"
                      }`}
                    >
                      {plan.tagline}
                    </p>

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

                    <ul className="space-y-3 pt-2 text-sm">
                      {plan.features.map((feature) => (
                        <li key={feature} className="flex items-start gap-2.5">
                          <CheckCircle2
                            className={`h-4 w-4 shrink-0 mt-0.5 ${
                              isFeatured ? "text-[#E8F4F0]" : "text-[#1B8366]"
                            }`}
                          />
                          <span>{feature}</span>
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
                        isAuthenticated ? "/settings/subscription" : "/register"
                      }
                      className={`flex w-full items-center justify-center rounded-lg px-4 py-2.5 text-sm font-semibold transition-colors ${
                        isFeatured
                          ? "bg-[#FFFFFF] text-[#1B8366] hover:bg-[#E8F4F0]"
                          : "border border-[#C8D4CE] bg-[#FFFFFF] text-[#172B25] hover:bg-[#F8FAF9]"
                      }`}
                    >
                      {isAuthenticated
                        ? `Pilih ${plan.name}`
                        : `Daftar ${plan.name}`}
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Tabel Perbandingan Hak Akses (Entitlement Matrix) */}
          <section className="rounded-xl border border-[#E1E8E4] bg-[#FFFFFF] overflow-hidden">
            <div className="border-b border-[#E1E8E4] bg-[#172B25] p-6 text-[#FFFFFF] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <h2 className="font-heading text-xl font-bold text-[#FFFFFF]">
                  Matriks Perbandingan Hak Akses & Kuota Harian
                </h2>
                <p className="mt-1 text-xs sm:text-sm text-[#E8F4F0]">
                  Seluruh kuota harian ditegakkan di sisi server dan di-reset
                  otomatis pukul 00:00 WIB.
                </p>
              </div>
              <span className="inline-flex items-center gap-1.5 rounded-md bg-[#125642] border border-[#1B8366] px-3 py-1.5 text-xs font-medium text-[#E8F4F0] self-start sm:self-auto">
                <Sparkles className="h-3.5 w-3.5 text-[#B7DCCF]" />
                <span>Zona Waktu Asia/Jakarta</span>
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-[#E1E8E4] bg-[#F8FAF9] text-xs font-semibold text-[#52645D]">
                    <th className="p-4 min-w-[220px]">Atribut / Hak Akses</th>
                    <th className="p-4 min-w-[180px]">Rintis Starter</th>
                    <th className="p-4 min-w-[200px] text-[#1B8366]">
                      Rintis Growth
                    </th>
                    <th className="p-4 min-w-[200px]">Rintis Max</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E1E8E4] text-sm">
                  {comparisonRows.map((row) => (
                    <tr key={row.label} className="hover:bg-[#F8FAF9]">
                      <td className="p-4 font-medium text-[#172B25]">
                        {row.label}
                      </td>
                      <td className="p-4 text-[#52645D]">
                        {row.starter === "Tidak tersedia" ? (
                          <span className="inline-flex items-center gap-1 text-[#718078]">
                            <Minus className="h-4 w-4" /> Tidak tersedia
                          </span>
                        ) : (
                          row.starter
                        )}
                      </td>
                      <td className="p-4 font-medium text-[#172B25] bg-[#E8F4F0]/40">
                        {row.growth === "Tidak tersedia" ? (
                          <span className="inline-flex items-center gap-1 text-[#718078]">
                            <Minus className="h-4 w-4" /> Tidak tersedia
                          </span>
                        ) : (
                          row.growth
                        )}
                      </td>
                      <td className="p-4 text-[#172B25]">{row.max}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* 2-Column FAQ Accordion */}
          <section className="space-y-6">
            <div className="text-center max-w-2xl mx-auto space-y-2">
              <h2 className="font-heading text-2xl font-bold text-[#172B25]">
                Pertanyaan Seputar Paket & Kuota
              </h2>
              <p className="text-sm text-[#52645D]">
                Penjelasan mengenai mekanisme simulasi paket MVP dan aturan
                kuota harian.
              </p>
            </div>
            <FaqAccordionGrid items={PRICING_FAQS} />
          </section>
        </div>
      </main>

      <PublicFooter />
    </div>
  );
}
