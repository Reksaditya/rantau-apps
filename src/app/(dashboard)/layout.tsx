import React from "react";
import { redirect } from "next/navigation";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getPublicEnv } from "@/lib/env";
import { getUserPlanTier } from "@/lib/subscription/entitlements";
import { AlertBanner } from "@/components/ui/AlertBanner";

export default async function AuthenticatedDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isSupabaseConfigured } = getPublicEnv();

  if (!isSupabaseConfigured) {
    return (
      <DashboardShell
        userFullName="Pengguna Rintis"
        userEmail="konfigurasi@rintis.id"
        planTier="starter"
      >
        <div className="mb-6">
          <AlertBanner
            variant="warning"
            title="Konfigurasi Database Supabase Belum Diisi"
            message="Harap lengkapi NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, dan GEMINI_API_KEY pada file .env.local sesuai panduan .env.example."
          />
        </div>
        {children}
      </DashboardShell>
    );
  }

  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, email")
    .eq("id", user.id)
    .maybeSingle();

  const planTier = await getUserPlanTier(supabase, user.id);

  const userFullName =
    profile?.full_name ||
    (user.user_metadata?.full_name as string) ||
    user.email?.split("@")[0] ||
    "Entrepreneur";
  const userEmail = profile?.email || user.email || "";

  return (
    <DashboardShell
      userFullName={userFullName}
      userEmail={userEmail}
      planTier={planTier}
    >
      {children}
    </DashboardShell>
  );
}

