import { notFound } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getPublicEnv } from "@/lib/env";
import { getUserPlanTier } from "@/lib/subscription/entitlements";
import { RoadmapDetailView } from "@/components/roadmap/RoadmapDetailView";
import type { Roadmap, RoadmapStage, RoadmapTask } from "@/types/database";

export default async function RoadmapDetailPage({
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

  const [roadmapRes, stagesRes, tasksRes, planTier] = await Promise.all([
    supabase
      .from("roadmaps")
      .select("*")
      .eq("id", id)
      .eq("user_id", user.id)
      .maybeSingle(),
    supabase
      .from("roadmap_stages")
      .select("*")
      .eq("roadmap_id", id)
      .eq("user_id", user.id)
      .order("stage_order", { ascending: true }),
    supabase
      .from("roadmap_tasks")
      .select("*")
      .eq("roadmap_id", id)
      .eq("user_id", user.id)
      .order("task_order", { ascending: true }),
    getUserPlanTier(supabase, user.id),
  ]);

  if (!roadmapRes.data) {
    notFound();
  }

  return (
    <RoadmapDetailView
      roadmap={roadmapRes.data as Roadmap}
      stages={(stagesRes.data ?? []) as RoadmapStage[]}
      initialTasks={(tasksRes.data ?? []) as RoadmapTask[]}
      planTier={planTier}
    />
  );
}

