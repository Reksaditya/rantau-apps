import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getPublicEnv } from "@/lib/env";
import { getDailyUsageSummary } from "@/lib/subscription/entitlements";
import { SubscriptionManagerClient } from "@/components/settings/SubscriptionManagerClient";

export default async function SubscriptionSettingsPage() {
  const { isSupabaseConfigured } = getPublicEnv();
  if (!isSupabaseConfigured) {
    return (
      <SubscriptionManagerClient
        currentPlanTier="starter"
        usageDate="-"
        roadmapUsed={0}
        roadmapLimit={2}
        assistantUsed={0}
        assistantLimit={0}
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

  const usage = await getDailyUsageSummary(supabase, user.id);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl sm:text-[30px] font-bold text-[#172B25]">
          Langganan & Kuota Harian
        </h1>
        <p className="mt-1 text-sm sm:text-base text-[#52645D]">
          Kelola paket langganan Rintis Anda dan pantau sisa kuota harian fitur
          AI.
        </p>
      </div>

      <SubscriptionManagerClient
        currentPlanTier={usage.planTier}
        usageDate={usage.usageDate}
        roadmapUsed={usage.roadmap.used}
        roadmapLimit={usage.roadmap.limit}
        assistantUsed={usage.assistant.used}
        assistantLimit={usage.assistant.limit}
      />
    </div>
  );
}

