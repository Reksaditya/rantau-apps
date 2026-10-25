import Link from "next/link";
import {
  CheckCircle2,
  Map,
  Sparkles,
  MessagesSquare,
  Users,
  ShieldCheck,
  Clock,
  Layers,
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
        {/* Hero Section */}
        <section className="border-b border-[#E1E8E4] bg-[#FFFFFF] py-16 lg:py-20">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:items-center">
              <div className="lg:col-span-6 space-y-6">
                <Badge variant="primary">
                  Pendamping Bisnis AI, Komunitas & Mentor UMKM
                </Badge>

                <h1 className="font-heading text-[36px] sm:text-[48px] font-bold leading-[1.15] text-[#172B25]">
                  Ubah ide bisnis menjadi langkah kerja yang terarah.
                </h1>

                <p className="text-base sm:text-lg leading-[1.6] text-[#52645D] max-w-xl">
                  Rantau membantu calon entrepreneur memulai usaha dari nol dan
                  mendampingi pemilik UMKM mengatasi stagnasi penjualan melalui
                  roadmap bertahap, asisten AI kontekstual, forum diskusi, dan
                  konsultasi mentor.
                </p>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
                  <Link
                    href={isAuthenticated ? "/roadmaps/new" : "/register"}
                    className="inline-flex items-center justify-center rounded-lg bg-[#1B8366] px-5 py-3 text-sm font-semibold text-[#FFFFFF] transition-colors hover:bg-[#166B53] active:bg-[#125642]"
                  >
                    {isAuthenticated
                      ? "Buat Roadmap Bisnis"
                      : "Buat Roadmap Gratis"}
                  </Link>
                  <Link
                    href="/pricing"
                    className="inline-flex items-center justify-center rounded-lg border border-[#C8D4CE] bg-[#FFFFFF] px-5 py-3 text-sm font-semibold text-[#172B25] transition-colors hover:bg-[#F8FAF9]"
                  >
                    Lihat Paket Langganan
                  </Link>
                </div>

                <div className="grid grid-cols-3 gap-4 pt-4 border-t border-[#E1E8E4]">
                  <div>
                    <p className="font-heading text-lg font-bold text-[#172B25]">
                      12 Komponen
                    </p>
                    <p className="text-xs text-[#718078]">
                      Analisis strategis & modal
                    </p>
                  </div>
                  <div>
                    <p className="font-heading text-lg font-bold text-[#172B25]">
                      Adaptif 3 Fase
                    </p>
                    <p className="text-xs text-[#718078]">
                      Ide baru, rintisan, atau berjalan
                    </p>
                  </div>
                  <div>
                    <p className="font-heading text-lg font-bold text-[#172B25]">
                      Terukur
                    </p>
                    <p className="text-xs text-[#718078]">
                      Pelacakan status tiap tugas
                    </p>
                  </div>
                </div>
              </div>

              {/* Interactive-style Preview Card matching Approved Target */}
              <div className="lg:col-span-6">
                <div className="rounded-xl border border-[#E1E8E4] bg-[#F8FAF9] p-5 sm:p-6">
                  <div className="rounded-xl border border-[#E1E8E4] bg-[#FFFFFF] p-6 space-y-5">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <span className="text-xs font-medium text-[#718078]">
                          Contoh Hasil Roadmap Rantau
                        </span>
                        <h2 className="font-heading text-lg font-bold text-[#172B25]">
                          Roadmap Bisnis: Kedai Kopi Susu Literan
                        </h2>
                      </div>
                      <Badge variant="primary">F&B • Target 3 Bulan</Badge>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs font-semibold text-[#172B25]">
                        <span>Progres Eksekusi Tahapan</span>
                        <span className="text-[#1B8366]">65% Selesai</span>
                      </div>
                      <div className="h-2.5 w-full overflow-hidden rounded-full bg-[#E8F4F0]">
                        <div
                          className="h-full rounded-full bg-[#1B8366]"
                          style={{ width: "65%" }}
                        />
                      </div>
                    </div>

                    <div className="space-y-3 pt-1">
                      <div className="flex items-center justify-between gap-3 rounded-lg border border-[#E1E8E4] bg-[#FFFFFF] p-3">
                        <div className="flex items-center gap-3 min-w-0">
                          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#1B8366] text-xs font-bold text-[#FFFFFF]">
                            1
                          </span>
                          <span className="truncate text-sm font-medium text-[#172B25]">
                            Validasi Pasar & Uji Rasa 5 Resep Kopi
                          </span>
                        </div>
                        <Badge variant="completed">Selesai</Badge>
                      </div>

                      <div className="flex items-center justify-between gap-3 rounded-lg border border-[#E1E8E4] bg-[#FFFFFF] p-3">
                        <div className="flex items-center gap-3 min-w-0">
                          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#1B8366] text-xs font-bold text-[#FFFFFF]">
                            2
                          </span>
                          <span className="truncate text-sm font-medium text-[#172B25]">
                            Hitung HPP, Margin & Harga Jual Botol 1 Liter
                          </span>
                        </div>
                        <Badge variant="completed">Selesai</Badge>
                      </div>

                      <div className="flex items-center justify-between gap-3 rounded-lg border border-[#B7DCCF] bg-[#E8F4F0] p-3">
                        <div className="flex items-center gap-3 min-w-0">
                          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#1B8366] text-xs font-bold text-[#FFFFFF]">
                            3
                          </span>
                          <span className="truncate text-sm font-semibold text-[#172B25]">
                            Desain Kemasan Botol 1L & Standar Penyimpanan
                          </span>
                        </div>
                        <Badge variant="in_progress">Sedang Dikerjakan</Badge>
                      </div>

                      <div className="flex items-center justify-between gap-3 rounded-lg border border-[#E1E8E4] bg-[#FFFFFF] p-3">
                        <div className="flex items-center gap-3 min-w-0">
                          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#EEF2F0] text-xs font-bold text-[#52645D]">
                            4
                          </span>
                          <span className="truncate text-sm font-medium text-[#52645D]">
                            Kampanye Pre-Order Batch Pertama (Target 20 Botol)
                          </span>
                        </div>
                        <Badge variant="neutral">Belum Dimulai</Badge>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Masalah yang Diselesaikan */}
        <section className="py-16 lg:py-20">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl space-y-3">
              <h2 className="font-heading text-2xl sm:text-3xl font-bold text-[#172B25]">
                Mengapa banyak rencana usaha berhenti di tengah jalan?
              </h2>
              <p className="text-base text-[#52645D]">
                Baik saat baru memulai dari nol maupun ketika usaha mulai
                stagnan, kendala utamanya bukan kurangnya semangat, melainkan
                ketiadaan urutan langkah yang jelas.
              </p>
            </div>

            <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-3">
              <div className="rounded-xl border border-[#E1E8E4] bg-[#FFFFFF] p-6 space-y-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#E8F4F0] text-[#1B8366]">
                  <Clock className="h-5 w-5" />
                </div>
                <h3 className="font-heading text-lg font-bold text-[#172B25]">
                  Bingung Langkah Pertama dari Nol
                </h3>
                <p className="text-sm text-[#52645D]">
                  Punya ide kuliner, jasa, atau produk kreatif dengan tabungan
                  terbatas, tetapi belum tahu cara menguji pasar, menghitung
                  modal awal, dan mendapatkan 10 pembeli pertama.
                </p>
              </div>

              <div className="rounded-xl border border-[#E1E8E4] bg-[#FFFFFF] p-6 space-y-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#E8F4F0] text-[#1B8366]">
                  <Layers className="h-5 w-5" />
                </div>
                <h3 className="font-heading text-lg font-bold text-[#172B25]">
                  Penjualan Stagnan pada Usaha Berjalan
                </h3>
                <p className="text-sm text-[#52645D]">
                  Usaha sudah berjalan berbulan-bulan namun hanya mengandalkan
                  pembeli dari lingkaran pertemanan, tanpa kerangka diagnosis
                  untuk memperbaiki retensi dan promosi.
                </p>
              </div>

              <div className="rounded-xl border border-[#E1E8E4] bg-[#FFFFFF] p-6 space-y-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#E8F4F0] text-[#1B8366]">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <h3 className="font-heading text-lg font-bold text-[#172B25]">
                  Saran AI Umum yang Sulit Dieksekusi
                </h3>
                <p className="text-sm text-[#52645D]">
                  Chat AI biasa hanya menghasilkan paragraf teks panjang tanpa
                  daftar tugas terukur, tanpa pelacakan progres, dan tanpa ruang
                  diskusi bersama praktisi nyata.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Cara Kerja 4 Langkah */}
        <section
          id="cara-kerja"
          className="border-y border-[#E1E8E4] bg-[#FFFFFF] py-16 lg:py-20"
        >
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl space-y-3">
              <h2 className="font-heading text-2xl sm:text-3xl font-bold text-[#172B25]">
                Cara kerja Rantau dalam 4 tahap berurutan
              </h2>
              <p className="text-base text-[#52645D]">
                Dari pemetaan kondisi usaha hingga pendampingan eksekusi
                mingguan.
              </p>
            </div>

            <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {[
                {
                  step: 1,
                  title: "Isi Kondisi Usaha",
                  desc: "Pilih apakah usaha Anda belum dimulai, sedang dirintis, atau sudah berjalan beserta estimasi modal dan lokasi.",
                },
                {
                  step: 2,
                  title: "Terima 12 Analisis & Roadmap",
                  desc: "AI menyusun analisis pasar, model pendapatan, estimasi biaya, risiko, dan tahapan kerja yang tervalidasi.",
                },
                {
                  step: 3,
                  title: "Eksekusi & Pantau Task",
                  desc: "Kerjakan daftar tugas pada tiap tahap, perbarui status pengerjaan, dan pantau persentase progres bisnis Anda.",
                },
                {
                  step: 4,
                  title: "Diskusi AI, Komunitas & Mentor",
                  desc: "Tanyakan kendala harian ke AI Assistant yang memahami roadmap Anda, berdiskusi di forum, atau jadwalkan mentor.",
                },
              ].map((item) => (
                <div
                  key={item.step}
                  className="rounded-xl border border-[#E1E8E4] bg-[#F8FAF9] p-6 space-y-3"
                >
                  <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-[#1B8366] text-sm font-bold text-[#FFFFFF]">
                    {item.step}
                  </span>
                  <h3 className="font-heading text-lg font-bold text-[#172B25]">
                    {item.title}
                  </h3>
                  <p className="text-sm text-[#52645D]">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Fitur Utama */}
        <section id="fitur" className="py-16 lg:py-20">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl space-y-3">
              <h2 className="font-heading text-2xl sm:text-3xl font-bold text-[#172B25]">
                Empat pilar pendamping di dalam satu ruang kerja
              </h2>
              <p className="text-base text-[#52645D]">
                Dirancang khusus agar ramah bagi pemula namun cukup mendalam
                untuk evaluasi operasional UMKM.
              </p>
            </div>

            <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-2">
              <div className="rounded-xl border border-[#E1E8E4] bg-[#FFFFFF] p-6 space-y-3">
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#E8F4F0] text-[#1B8366]">
                    <Map className="h-5 w-5" />
                  </span>
                  <h3 className="font-heading text-lg font-bold text-[#172B25]">
                    AI Business Roadmap Generator
                  </h3>
                </div>
                <p className="text-sm text-[#52645D]">
                  Menghasilkan 12 bagian strategis mulai dari validasi pasar,
                  estimasi alokasi modal, strategi akuisisi pelanggan, hingga
                  timeline implementasi dengan indikator keberhasilan tiap tugas.
                </p>
              </div>

              <div className="rounded-xl border border-[#E1E8E4] bg-[#FFFFFF] p-6 space-y-3">
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#E8F4F0] text-[#1B8366]">
                    <Sparkles className="h-5 w-5" />
                  </span>
                  <h3 className="font-heading text-lg font-bold text-[#172B25]">
                    AI Business Assistant Kontekstual
                  </h3>
                </div>
                <p className="text-sm text-[#52645D]">
                  Tautkan percakapan langsung dengan dokumen roadmap usaha Anda.
                  Asisten AI menjawab pertanyaan harga jual, promosi, dan
                  operasional sesuai modal serta tahap bisnis Anda.
                </p>
              </div>

              <div className="rounded-xl border border-[#E1E8E4] bg-[#FFFFFF] p-6 space-y-3">
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#E8F4F0] text-[#1B8366]">
                    <MessagesSquare className="h-5 w-5" />
                  </span>
                  <h3 className="font-heading text-lg font-bold text-[#172B25]">
                    Community Forum Terkurasi
                  </h3>
                </div>
                <p className="text-sm text-[#52645D]">
                  Ruang bertukar pengalaman antar perintis usaha berdasarkan 5
                  kategori kunci: Validasi Ide, Pemasaran, Modal & Keuangan,
                  Operasional, dan Pengembangan Usaha.
                </p>
              </div>

              <div className="rounded-xl border border-[#E1E8E4] bg-[#FFFFFF] p-6 space-y-3">
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#E8F4F0] text-[#1B8366]">
                    <Users className="h-5 w-5" />
                  </span>
                  <h3 className="font-heading text-lg font-bold text-[#172B25]">
                    Konsultasi Mentor 1-on-1
                  </h3>
                </div>
                <p className="text-sm text-[#52645D]">
                  Telusuri direktori mentor praktisi berbagai bidang industri dan
                  pesan slot jadwal konsultasi 45 menit untuk membedah kendala
                  usaha Anda secara mendalam.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Ringkasan Paket Langganan */}
        <section className="border-t border-[#E1E8E4] bg-[#FFFFFF] py-16 lg:py-20">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
              <div className="max-w-2xl space-y-2">
                <h2 className="font-heading text-2xl sm:text-3xl font-bold text-[#172B25]">
                  Pilih paket pendampingan sesuai fase usaha Anda
                </h2>
                <p className="text-sm text-[#718078]">
                  Catatan transparan MVP: Harga di bawah merupakan placeholder
                  simulasi produk dan belum menarik tagihan pembayaran online.
                </p>
              </div>
              <Link
                href="/pricing"
                className="text-sm font-semibold text-[#1B8366] hover:text-[#166B53]"
              >
                Lihat tabel perbandingan lengkap
              </Link>
            </div>

            <div className="mt-10 grid grid-cols-1 gap-6 lg:grid-cols-3">
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
                      <h3 className="font-heading text-lg font-bold text-[#172B25]">
                        {plan.name}
                      </h3>
                      {plan.isPopular && (
                        <Badge variant="primary">Paling Populer</Badge>
                      )}
                    </div>
                    <p className="text-sm text-[#52645D]">{plan.tagline}</p>

                    <div className="pt-2 border-t border-[#E1E8E4]">
                      <span className="font-heading text-3xl font-bold text-[#172B25]">
                        {plan.priceLabel}
                      </span>
                      <span className="block text-xs text-[#718078] mt-1">
                        {plan.priceNote}
                      </span>
                    </div>

                    <ul className="space-y-2.5 pt-2 text-sm text-[#172B25]">
                      {plan.features.map((feat) => (
                        <li key={feat} className="flex items-start gap-2.5">
                          <CheckCircle2 className="h-4 w-4 shrink-0 text-[#1B8366] mt-0.5" />
                          <span>{feat}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="mt-6 pt-4 border-t border-[#E1E8E4]">
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
                        ? "Kelola Paket Ini"
                        : `Mulai dengan ${plan.name}`}
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <PublicFooter />
    </div>
  );
}
