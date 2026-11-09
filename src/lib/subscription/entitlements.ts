import type { SupabaseClient } from "@supabase/supabase-js";
import type { PlanTier, UsageFeatureKey } from "@/types/database";

export interface PlanEntitlement {
  tier: PlanTier;
  name: string;
  tagline: string;
  priceLabel: string;
  priceNote: string;
  isPopular?: boolean;
  dailyRoadmapLimit: number;
  maxUnlockedStages: number;
  canAccessAssistant: boolean;
  dailyAssistantMessageLimit: number;
  canWriteForum: boolean;
  canBookMentor: boolean;
  features: string[];
}

export const PLAN_ENTITLEMENTS: Record<PlanTier, PlanEntitlement> = {
  starter: {
    tier: "starter",
    name: "Rintis Starter",
    tagline: "Eksplorasi ide bisnis awal dan uji kelayakan usaha pertama Anda.",
    priceLabel: "Rp0",
    priceNote: "per bulan • Gratis selamanya",
    dailyRoadmapLimit: 2,
    maxUnlockedStages: 3,
    canAccessAssistant: false,
    dailyAssistantMessageLimit: 0,
    canWriteForum: false,
    canBookMentor: false,
    features: [
      "Generate AI Business Roadmap hingga 2x per hari",
      "Ringkasan bisnis & 3 tahap implementasi awal terbuka penuh",
      "Manajemen status task & pelacakan persentase progres",
      "Akses baca diskusi di Community Forum (Read-only)",
      "Direktori profil mentor praktisi UMKM",
    ],
  },
  growth: {
    tier: "growth",
    name: "Rintis Growth",
    tagline: "Perencanaan strategis penuh & pendampingan AI harian untuk merintis usaha.",
    priceLabel: "Rp99.000",
    priceNote: "per bulan • Harga Placeholder MVP",
    isPopular: true,
    dailyRoadmapLimit: 10,
    maxUnlockedStages: 99,
    canAccessAssistant: true,
    dailyAssistantMessageLimit: 30,
    canWriteForum: true,
    canBookMentor: false,
    features: [
      "Generate AI Business Roadmap hingga 10x per hari",
      "Seluruh tahapan implementasi & 12 komponen strategis terbuka penuh",
      "Akses AI Business Assistant kontekstual (30 pesan/hari)",
      "Akses penuh Community Forum (buat diskusi, komentar, & upvote)",
      "Penyimpanan riwayat versi roadmap tanpa batas",
    ],
  },
  max: {
    tier: "max",
    name: "Rintis Max",
    tagline: "Pendampingan komprehensif bersama AI kapasitas penuh dan mentor 1-on-1.",
    priceLabel: "Rp299.000",
    priceNote: "per bulan • Harga Placeholder MVP",
    dailyRoadmapLimit: 25,
    maxUnlockedStages: 99,
    canAccessAssistant: true,
    dailyAssistantMessageLimit: 100,
    canWriteForum: true,
    canBookMentor: true,
    features: [
      "Generate AI Business Roadmap hingga 25x per hari",
      "Seluruh tahapan implementasi & 12 komponen strategis terbuka penuh",
      "Akses AI Business Assistant prioritas (100 pesan/hari)",
      "Akses penuh Community Forum (buat diskusi, komentar, & upvote)",
      "Booking sesi konsultasi 1-on-1 bersama Mentor Praktisi",
    ],
  },
};

export function getJakartaDateString(): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Jakarta",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

export async function getUserPlanTier(
  supabase: SupabaseClient,
  userId: string
): Promise<PlanTier> {
  const { data } = await supabase
    .from("subscriptions")
    .select("plan_tier, status")
    .eq("user_id", userId)
    .maybeSingle();

  if (!data || data.status !== "active") {
    return "starter";
  }

  if (
    data.plan_tier === "starter" ||
    data.plan_tier === "growth" ||
    data.plan_tier === "max"
  ) {
    return data.plan_tier;
  }

  return "starter";
}

export interface QuotaCheckResult {
  allowed: boolean;
  currentUsed: number;
  dailyLimit: number;
  remaining: number;
  planTier: PlanTier;
}

export async function checkAndIncrementDailyQuota(
  supabase: SupabaseClient,
  userId: string,
  featureKey: UsageFeatureKey
): Promise<QuotaCheckResult> {
  const planTier = await getUserPlanTier(supabase, userId);
  const entitlement = PLAN_ENTITLEMENTS[planTier];

  const dailyLimit =
    featureKey === "roadmap_generation"
      ? entitlement.dailyRoadmapLimit
      : entitlement.dailyAssistantMessageLimit;

  if (dailyLimit <= 0) {
    return {
      allowed: false,
      currentUsed: 0,
      dailyLimit: 0,
      remaining: 0,
      planTier,
    };
  }

  const { data, error } = await supabase.rpc("check_and_increment_quota", {
    p_user_id: userId,
    p_feature_key: featureKey,
    p_daily_limit: dailyLimit,
  });

  if (error || !data || !Array.isArray(data) || data.length === 0) {
    // Fallback atomis jika RPC belum dieksekusi di DB
    const today = getJakartaDateString();
    const { data: existing } = await supabase
      .from("usage_records")
      .select("id, used_count")
      .eq("user_id", userId)
      .eq("feature_key", featureKey)
      .eq("usage_date", today)
      .maybeSingle();

    const currentUsed = existing?.used_count ?? 0;
    if (currentUsed >= dailyLimit) {
      return {
        allowed: false,
        currentUsed,
        dailyLimit,
        remaining: 0,
        planTier,
      };
    }

    const nextUsed = currentUsed + 1;
    await supabase.from("usage_records").upsert(
      {
        user_id: userId,
        feature_key: featureKey,
        usage_date: today,
        used_count: nextUsed,
      },
      { onConflict: "user_id,feature_key,usage_date" }
    );

    return {
      allowed: true,
      currentUsed: nextUsed,
      dailyLimit,
      remaining: Math.max(0, dailyLimit - nextUsed),
      planTier,
    };
  }

  const row = data[0] as {
    allowed: boolean;
    current_used: number;
    daily_limit: number;
    remaining: number;
  };

  return {
    allowed: row.allowed,
    currentUsed: row.current_used,
    dailyLimit: row.daily_limit,
    remaining: row.remaining,
    planTier,
  };
}

export async function getDailyUsageSummary(
  supabase: SupabaseClient,
  userId: string
) {
  const planTier = await getUserPlanTier(supabase, userId);
  const entitlement = PLAN_ENTITLEMENTS[planTier];
  const today = getJakartaDateString();

  const { data: records } = await supabase
    .from("usage_records")
    .select("feature_key, used_count")
    .eq("user_id", userId)
    .eq("usage_date", today);

  const roadmapUsed =
    records?.find((r) => r.feature_key === "roadmap_generation")?.used_count ??
    0;
  const assistantUsed =
    records?.find((r) => r.feature_key === "ai_assistant_message")
      ?.used_count ?? 0;

  return {
    planTier,
    entitlement,
    usageDate: today,
    roadmap: {
      used: roadmapUsed,
      limit: entitlement.dailyRoadmapLimit,
      remaining: Math.max(0, entitlement.dailyRoadmapLimit - roadmapUsed),
    },
    assistant: {
      used: assistantUsed,
      limit: entitlement.dailyAssistantMessageLimit,
      remaining: Math.max(
        0,
        entitlement.dailyAssistantMessageLimit - assistantUsed
      ),
    },
  };
}

