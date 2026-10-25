import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getPublicEnv } from "@/lib/env";
import { getDailyUsageSummary } from "@/lib/subscription/entitlements";
import { AssistantWorkspace } from "@/components/assistant/AssistantWorkspace";
import type { AIConversation, AIMessage, Roadmap } from "@/types/database";

export default async function AssistantPage({
  searchParams,
}: {
  searchParams: Promise<{ conversationId?: string; roadmapId?: string }>;
}) {
  const { conversationId, roadmapId } = await searchParams;
  const { isSupabaseConfigured } = getPublicEnv();

  if (!isSupabaseConfigured) {
    return (
      <AssistantWorkspace
        planTier="starter"
        remainingQuota={0}
        dailyLimit={0}
        conversations={[]}
        activeConversation={null}
        initialMessages={[]}
        roadmaps={[]}
        defaultRoadmapId={null}
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

  const [usageSummary, convsRes, roadmapsRes] = await Promise.all([
    getDailyUsageSummary(supabase, user.id),
    supabase
      .from("ai_conversations")
      .select("*")
      .eq("user_id", user.id)
      .order("updated_at", { ascending: false }),
    supabase
      .from("roadmaps")
      .select("id, title, version, business_name")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false }),
  ]);

  const conversations = (convsRes.data ?? []) as AIConversation[];
  const roadmaps = (roadmapsRes.data ?? []) as Pick<
    Roadmap,
    "id" | "title" | "version" | "business_name"
  >[];

  const activeConversation = conversationId
    ? conversations.find((c) => c.id === conversationId) ?? null
    : null;

  let initialMessages: AIMessage[] = [];
  if (activeConversation) {
    const { data: msgs } = await supabase
      .from("ai_messages")
      .select("*")
      .eq("conversation_id", activeConversation.id)
      .eq("user_id", user.id)
      .order("created_at", { ascending: true });
    initialMessages = (msgs ?? []) as AIMessage[];
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl sm:text-[30px] font-bold text-[#172B25]">
          AI Business Assistant
        </h1>
        <p className="mt-1 text-sm sm:text-base text-[#52645D]">
          Ruang konsultasi interaktif yang terhubung dengan konteks roadmap dan
          tahap usaha Anda.
        </p>
      </div>

      <AssistantWorkspace
        planTier={usageSummary.planTier}
        remainingQuota={usageSummary.assistant.remaining}
        dailyLimit={usageSummary.assistant.limit}
        conversations={conversations}
        activeConversation={activeConversation}
        initialMessages={initialMessages}
        roadmaps={roadmaps}
        defaultRoadmapId={roadmapId ?? roadmaps[0]?.id ?? null}
      />
    </div>
  );
}

