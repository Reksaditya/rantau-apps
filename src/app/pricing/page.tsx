import Link from "next/link";
import { CheckCircle2, Minus } from "lucide-react";
import { PublicNavbar, PublicFooter } from "@/components/layout/PublicNavbar";
import { Badge } from "@/components/ui/Badge";
import { PLAN_ENTITLEMENTS } from "@/lib/subscription/entitlements";
import { getPublicEnv } from "@/lib/env";
import { createServerSupabaseClient } from "@/lib/supabase/server";

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
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 space-y-14">
          <div className="max-w-3xl space-y-3">
            <Badge variant="primary">Paket Langganan Rantau</Badge>
            <h1 className="font-heading text-3xl sm:text-4xl font-bold text-[#172B25]">
              Investasi terukur untuk setiap tahap perjalanan usaha Anda
            </h1>
            <p className="text-base text-[#52645D]">
              Mulai gratis dengan Rantau Starter untuk memvalidasi ide awal,
              atau beralih ke Growth dan Max untuk membuka seluruh analisis 12
              komponen, AI Assistant harian, dan sesi konsultasi mentor.
            </p>
            <p className="text-xs font-medium text-[#718078]">
              Keterangan MVP: Harga tercantum merupakan placeholder simulasi
              MVP. Anda dapat mencoba berpindah paket secara langsung di menu
              Langganan setelah masuk akun tanpa biaya kartu kredit.
            </p>
          </div>

          {/* 3 Kartu Paket Sejajar */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            {plans.map((plan) => (
              <div
                key={plan.tier}
                className={`flex flex-col justify-between rounded-xl bg-[#FFFFFF] p-6 ${
                  plan.isPopular
                    ? "border-2 border-[#1B8366]"
                    : "border border-[#E1E8E4]"
                }`}
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between gap-2">
                    <h2 className="font-heading text-xl font-bold text-[#172B25]">
                      {plan.name}
                    </h2>
                    {plan.isPopular && (
                      <Badge variant="primary">Paling Populer</Badge>
                    )}
                  </div>
                  <p className="text-sm text-[#52645D]">{plan.tagline}</p>

                  <div className="pt-3 border-t border-[#E1E8E4]">
                    <span className="font-heading text-3xl font-bold text-[#172B25]">
                      {plan.priceLabel}
                    </span>
                    <span className="block text-xs text-[#718078] mt-1">
                      {plan.priceNote}
                    </span>
                  </div>

                  <ul className="space-y-3 pt-2 text-sm text-[#172B25]">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-2.5">
                        <CheckCircle2 className="h-4 w-4 shrink-0 text-[#1B8366] mt-0.5" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-8 pt-4 border-t border-[#E1E8E4]">
                  <Link
                    href={
                      isAuthenticated ? "/settings/subscription" : "/register"
                    }
                    className={`flex w-full items-center justify-center rounded-lg px-4 py-2.5 text-sm font-medium transition-colors ${
                      plan.isPopular
                        ? "bg-[#1B8366] text-[#FFFFFF] hover:bg-[#166B53]"
                        : "border border-[#C8D4CE] bg-[#FFFFFF] text-[#172B25] hover:bg-[#F8FAF9]"
                    }`}
                  >
                    {isAuthenticated
                      ? `Pilih ${plan.name}`
                      : `Daftar ${plan.name}`}
                  </Link>
                </div>
              </div>
            ))}
          </div>

          {/* Tabel Perbandingan Hak Akses (Entitlement Matrix) */}
          <section className="rounded-xl border border-[#E1E8E4] bg-[#FFFFFF] overflow-hidden">
            <div className="border-b border-[#E1E8E4] p-6">
              <h2 className="font-heading text-xl font-bold text-[#172B25]">
                Perbandingan Detail Fitur & Kuota Harian
              </h2>
              <p className="mt-1 text-sm text-[#52645D]">
                Seluruh kuota harian di-reset otomatis setiap pukul 00:00 WIB
                (Asia/Jakarta).
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-[#E1E8E4] bg-[#F8FAF9] text-xs font-semibold text-[#52645D]">
                    <th className="p-4 min-w-[220px]">Atribut / Hak Akses</th>
                    <th className="p-4 min-w-[180px]">Rantau Starter</th>
                    <th className="p-4 min-w-[200px] text-[#1B8366]">
                      Rantau Growth
                    </th>
                    <th className="p-4 min-w-[200px]">Rantau Max</th>
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

          {/* FAQ Singkat */}
          <section className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="rounded-xl border border-[#E1E8E4] bg-[#FFFFFF] p-6 space-y-2">
              <h3 className="font-heading text-base font-bold text-[#172B25]">
                Apakah roadmap lama saya hilang jika saya membuat roadmap baru?
              </h3>
              <p className="text-sm text-[#52645D]">
                Tidak. Setiap kali Anda menekan Generate Roadmap, sistem
                menyimpan dokumen tersebut sebagai versi baru (Versi 1, Versi 2,
                dst.) sehingga riwayat rencana dan progres tugas lama tetap
                tersimpan utuh.
              </p>
            </div>
            <div className="rounded-xl border border-[#E1E8E4] bg-[#FFFFFF] p-6 space-y-2">
              <h3 className="font-heading text-base font-bold text-[#172B25]">
                Bagaimana cara menguji paket Growth atau Max pada tahap MVP ini?
              </h3>
              <p className="text-sm text-[#52645D]">
                Setelah masuk ke akun Anda, buka menu{" "}
                <strong className="font-semibold text-[#172B25]">
                  Langganan & Kuota
                </strong>{" "}
                di panel samping. Anda dapat beralih antar paket Starter,
                Growth, dan Max secara instan untuk menguji seluruh fitur dan
                validasi kuota server.
              </p>
            </div>
          </section>
        </div>
      </main>

      <PublicFooter />
    </div>
  );
}

