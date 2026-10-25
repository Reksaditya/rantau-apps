import { notFound } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getPublicEnv } from "@/lib/env";
import { getUserPlanTier } from "@/lib/subscription/entitlements";
import { MentorBookingClient } from "@/components/mentors/MentorBookingClient";
import type { Mentor, MentorAvailability } from "@/types/database";

export default async function MentorDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { isSupabaseConfigured } = getPublicEnv();
  if (!isSupabaseConfigured) {
    notFound();
  }

  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    notFound();
  }

  const [mentorRes, availRes, planTier] = await Promise.all([
    supabase.from("mentors").select("*").eq("id", id).maybeSingle(),
    supabase
      .from("mentor_availability")
      .select("*")
      .eq("mentor_id", id)
      .order("slot_start", { ascending: true }),
    getUserPlanTier(supabase, user.id),
  ]);

  if (!mentorRes.data) {
    notFound();
  }

  return (
    <MentorBookingClient
      mentor={mentorRes.data as Mentor}
      availabilities={(availRes.data ?? []) as MentorAvailability[]}
      planTier={planTier}
    />
  );
}

