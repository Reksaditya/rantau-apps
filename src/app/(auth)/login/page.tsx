"use client";

import React, { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Compass } from "lucide-react";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";
import { AlertBanner } from "@/components/ui/AlertBanner";
import { getPublicEnv } from "@/lib/env";

function LoginFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirectTo") || "/dashboard";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const { isSupabaseConfigured } = getPublicEnv();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrorMsg(null);

    if (!email.trim() || !password) {
      setErrorMsg("Harap isi alamat email dan kata sandi Anda.");
      return;
    }

    try {
      setLoading(true);
      const supabase = createBrowserSupabaseClient();
      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) {
        setErrorMsg(
          error.message === "Invalid login credentials"
            ? "Email atau kata sandi yang Anda masukkan belum sesuai."
            : error.message
        );
        setLoading(false);
        return;
      }

      router.push(redirectTo);
      router.refresh();
    } catch (err) {
      setErrorMsg(
        err instanceof Error
          ? err.message
          : "Terjadi kesalahan saat masuk ke akun."
      );
      setLoading(false);
    }
  }

  return (
    <div className="w-full max-w-md rounded-xl border border-[#E1E8E4] bg-[#FFFFFF] p-6 sm:p-8 space-y-6">
      <div className="space-y-2">
        <h1 className="font-heading text-2xl font-bold text-[#172B25]">
          Masuk ke Ruang Kerja Rintis
        </h1>
        <p className="text-sm text-[#52645D]">
          Lanjutkan eksekusi roadmap bisnis dan diskusi Anda.
        </p>
      </div>

      {!isSupabaseConfigured && (
        <AlertBanner
          variant="warning"
          title="Konfigurasi .env.local Diperlukan"
          message="Variabel NEXT_PUBLIC_SUPABASE_URL dan NEXT_PUBLIC_SUPABASE_ANON_KEY belum diatur pada .env.local. Silakan salin dari .env.example."
        />
      )}

      {errorMsg && <AlertBanner variant="error" message={errorMsg} />}

      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <div>
          <label
            htmlFor="login-email"
            className="block text-sm font-medium text-[#172B25]"
          >
            Alamat Email
          </label>
          <input
            id="login-email"
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
            htmlFor="login-password"
            className="block text-sm font-medium text-[#172B25]"
          >
            Kata Sandi
          </label>
          <input
            id="login-password"
            type="password"
            required
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Masukkan kata sandi"
            className="mt-1.5 w-full rounded-lg border border-[#C8D4CE] bg-[#FFFFFF] px-3 py-2.5 text-sm text-[#172B25] placeholder:text-[#718078]"
          />
        </div>

        <Button
          type="submit"
          variant="primary"
          isLoading={loading}
          className="w-full"
        >
          Masuk ke Akun
        </Button>
      </form>

      <p className="border-t border-[#E1E8E4] pt-4 text-center text-sm text-[#52645D]">
        Belum memiliki akun Rintis?{" "}
        <Link
          href="/register"
          className="font-semibold text-[#1B8366] hover:text-[#166B53]"
        >
          Daftar gratis sekarang
        </Link>
      </p>
    </div>
  );
}

export default function LoginPage() {
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
        <Suspense
          fallback={
            <div className="w-full max-w-md rounded-xl border border-[#E1E8E4] bg-[#FFFFFF] p-8 text-sm text-[#52645D]">
              Memuat formulir masuk...
            </div>
          }
        >
          <LoginFormContent />
        </Suspense>
      </main>

      <footer className="text-center text-xs text-[#718078]">
        © {new Date().getFullYear()} Rintis — Pendamping Bisnis Berbasis AI
      </footer>
    </div>
  );
}

