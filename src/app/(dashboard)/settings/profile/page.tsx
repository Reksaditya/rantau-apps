import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getPublicEnv } from "@/lib/env";
import { ProfileSettingsClient } from "@/components/settings/ProfileSettingsClient";
import type { BusinessProfile } from "@/types/database";

export default async function ProfileSettingsPage() {
  const { isSupabaseConfigured } = getPublicEnv();
  if (!isSupabaseConfigured) {
    return (
      <ProfileSettingsClient
        initialFullName="Entrepreneur Rantau"
        email="konfigurasi@rantau.id"
        initialBusiness={null}
      />
    );
  }

  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const [profileRes, businessRes] = await Promise.all([
    supabase
      .from("profiles")
      .select("full_name, email")
      .eq("id", user.id)
      .maybeSingle(),
    supabase
      .from("business_profiles")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle(),
  ]);

  const fullName =
    profileRes.data?.full_name ||
    (user.user_metadata?.full_name as string) ||
    "";
  const email = profileRes.data?.email || user.email || "";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl sm:text-[30px] font-bold text-[#172B25]">
          Pengaturan Akun & Usaha
        </h1>
        <p className="mt-1 text-sm sm:text-base text-[#52645D]">
          Perbarui nama lengkap dan data usaha default Anda.
        </p>
      </div>

      <ProfileSettingsClient
        initialFullName={fullName}
        email={email}
        initialBusiness={(businessRes.data as BusinessProfile | null) ?? null}
      />
    </div>
  );
}

