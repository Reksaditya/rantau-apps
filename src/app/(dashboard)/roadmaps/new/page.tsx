import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getPublicEnv } from "@/lib/env";
import { getDailyUsageSummary } from "@/lib/subscription/entitlements";
import { RoadmapGeneratorForm } from "@/components/roadmap/RoadmapGeneratorForm";
import type { BusinessProfile } from "@/types/database";

export default async function NewRoadmapPage() {
  const { isSupabaseConfigured } = getPublicEnv();
  let businessProfile: BusinessProfile | null = null;
  let remainingQuota = 2;
  let dailyLimit = 2;
  let planName = "Rintis Starter";

  if (isSupabaseConfigured) {
    const supabase = await createServerSupabaseClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      const [bpRes, usage] = await Promise.all([
        supabase
          .from("business_profiles")
          .select("*")
          .eq("user_id", user.id)
          .maybeSingle(),
        getDailyUsageSummary(supabase, user.id),
      ]);
      businessProfile = (bpRes.data as BusinessProfile | null) ?? null;
      remainingQuota = usage.roadmap.remaining;
      dailyLimit = usage.roadmap.limit;
      planName = usage.entitlement.name;
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl sm:text-[30px] font-bold text-[#172B25]">
          Susun Roadmap Bisnis Berbasis AI
        </h1>
        <p className="mt-1 text-sm sm:text-base text-[#52645D]">
          Sesuaikan parameter usaha di bawah ini. AI Rintis akan menghasilkan 12
          komponen strategis beserta tahapan dan daftar tugas yang terukur.
        </p>
      </div>

      <RoadmapGeneratorForm
        initialProfile={businessProfile}
        mode="generate_roadmap"
        remainingQuota={remainingQuota}
        dailyLimit={dailyLimit}
        planName={planName}
      />
    </div>
  );
}

