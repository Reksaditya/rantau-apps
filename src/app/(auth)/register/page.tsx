"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Compass } from "lucide-react";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";
import { AlertBanner } from "@/components/ui/AlertBanner";
import { getPublicEnv } from "@/lib/env";

export default function RegisterPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const { isSupabaseConfigured } = getPublicEnv();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (fullName.trim().length < 2) {
      setErrorMsg("Nama lengkap minimal 2 karakter.");
      return;
    }
    if (!email.trim().includes("@")) {
      setErrorMsg("Masukkan alamat email yang valid.");
      return;
    }
    if (password.length < 6) {
      setErrorMsg("Kata sandi minimal 6 karakter.");
      return;
    }

    try {
      setLoading(true);
      const supabase = createBrowserSupabaseClient();
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: {
            full_name: fullName.trim(),
          },
        },
      });

      if (error) {
        setErrorMsg(error.message);
        setLoading(false);
        return;
      }

      if (data.user && data.session) {
        // Pastikan baris profiles dan subscriptions ('starter') tersedia jika trigger belum aktif
        await supabase.from("profiles").upsert(
          {
            id: data.user.id,
            full_name: fullName.trim(),
            email: email.trim(),
          },
          { onConflict: "id" }
        );

        await supabase.from("subscriptions").upsert(
          {
            user_id: data.user.id,
            plan_tier: "starter",
            status: "active",
          },
          { onConflict: "user_id" }
        );

        router.push("/onboarding");
        router.refresh();
        return;
      }

      setSuccessMsg(
        "Pendaftaran berhasil. Silakan periksa kotak masuk email Anda apabila verifikasi email diaktifkan di Supabase, atau langsung masuk ke akun."
      );
      setLoading(false);
    } catch (err) {
      setErrorMsg(
        err instanceof Error
          ? err.message
          : "Terjadi kesalahan saat mendaftarkan akun."
      );
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col justify-between bg-[#F8FAF9] px-4 py-8">
      <div className="mx-auto w-full max-w-6xl">
        <Link href="/" className="inline-flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#1B8366] text-[#FFFFFF]">
            <Compass className="h-5 w-5" />
          </span>
          <div>
            <span className="block font-heading text-lg font-bold leading-none text-[#172B25]">
              Rintis
            </span>
            <span className="text-[11px] font-medium text-[#718078]">
              Temukan arah, bangun usahamu
            </span>
          </div>
        </Link>
      </div>

      <main className="flex flex-1 items-center justify-center py-8">
        <div className="w-full max-w-md rounded-xl border border-[#E1E8E4] bg-[#FFFFFF] p-6 sm:p-8 space-y-6">
          <div className="space-y-2">
            <h1 className="font-heading text-2xl font-bold text-[#172B25]">
              Mulai Perjalanan Usaha Anda
            </h1>
            <p className="text-sm text-[#52645D]">
              Buat akun gratis (Rintis Starter) dan susun roadmap bisnis pertama
              Anda dalam hitungan detik.
            </p>
          </div>

          {!isSupabaseConfigured && (
            <AlertBanner
              variant="warning"
              title="Konfigurasi .env.local Diperlukan"
              message="Variabel NEXT_PUBLIC_SUPABASE_URL dan NEXT_PUBLIC_SUPABASE_ANON_KEY belum diatur pada .env.local."
            />
          )}

          {errorMsg && <AlertBanner variant="error" message={errorMsg} />}
          {successMsg && (
            <AlertBanner
              variant="success"
              message={successMsg}
              actionHref="/login"
              actionLabel="Halaman Masuk"
            />
          )}

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            <div>
              <label
                htmlFor="register-name"
                className="block text-sm font-medium text-[#172B25]"
              >
                Nama Lengkap
              </label>
              <input
                id="register-name"
                type="text"
                required
                autoComplete="name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Contoh: Raka Pratama"
                className="mt-1.5 w-full rounded-lg border border-[#C8D4CE] bg-[#FFFFFF] px-3 py-2.5 text-sm text-[#172B25] placeholder:text-[#718078]"
              />
            </div>

            <div>
              <label
                htmlFor="register-email"
                className="block text-sm font-medium text-[#172B25]"
              >
                Alamat Email
              </label>
              <input
                id="register-email"
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nama@email.com"
                className="mt-1.5 w-full rounded-lg border border-[#C8D4CE] bg-[#FFFFFF] px-3 py-2.5 text-sm text-[#172B25] placeholder:text-[#718078]"
              />
            </div>

            <div>
              <label
                htmlFor="register-password"
                className="block text-sm font-medium text-[#172B25]"
              >
                Kata Sandi
              </label>
              <input
                id="register-password"
                type="password"
                required
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Minimal 6 karakter"
                className="mt-1.5 w-full rounded-lg border border-[#C8D4CE] bg-[#FFFFFF] px-3 py-2.5 text-sm text-[#172B25] placeholder:text-[#718078]"
              />
              <p className="mt-1 text-xs text-[#718078]">
                Akun baru otomatis mendapatkan paket Rintis Starter aktif.
              </p>
            </div>

            <Button
              type="submit"
              variant="primary"
              isLoading={loading}
              className="w-full"
            >
              Daftar & Buat Profil Usaha
            </Button>
          </form>

          <p className="border-t border-[#E1E8E4] pt-4 text-center text-sm text-[#52645D]">
            Sudah punya akun Rintis?{" "}
            <Link
              href="/login"
              className="font-semibold text-[#1B8366] hover:text-[#166B53]"
            >
              Masuk di sini
            </Link>
          </p>
        </div>
      </main>

      <footer className="text-center text-xs text-[#718078]">
        © {new Date().getFullYear()} Rintis — Pendamping Bisnis Berbasis AI
      </footer>
    </div>
  );
}

