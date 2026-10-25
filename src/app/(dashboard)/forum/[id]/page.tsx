import { notFound } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getPublicEnv } from "@/lib/env";
import { getUserPlanTier } from "@/lib/subscription/entitlements";
import { ForumDetailClient } from "@/components/forum/ForumDetailClient";
import type { ForumComment, ForumPost } from "@/types/database";

export default async function ForumPostDetailPage({
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

  const [postRes, commentsRes, voteRes, planTier] = await Promise.all([
    supabase
      .from("forum_posts")
      .select(
        `
        *,
        author:profiles!forum_posts_author_id_fkey(id, full_name),
        category:forum_categories!forum_posts_category_id_fkey(id, slug, name)
      `
      )
      .eq("id", id)
      .maybeSingle(),
    supabase
      .from("forum_comments")
      .select(
        `
        *,
        author:profiles!forum_comments_author_id_fkey(id, full_name)
      `
      )
      .eq("post_id", id)
      .order("created_at", { ascending: true }),
    supabase
      .from("forum_votes")
      .select("id")
      .eq("post_id", id)
      .eq("user_id", user.id)
      .maybeSingle(),
    getUserPlanTier(supabase, user.id),
  ]);

  if (!postRes.data) {
    notFound();
  }

  return (
    <ForumDetailClient
      post={postRes.data as unknown as ForumPost}
      initialComments={(commentsRes.data ?? []) as unknown as ForumComment[]}
      currentUserId={user.id}
      planTier={planTier}
      initialHasUpvoted={Boolean(voteRes.data)}
    />
  );
}

