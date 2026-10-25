import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getPublicEnv } from "@/lib/env";
import { getUserPlanTier } from "@/lib/subscription/entitlements";
import { ForumFeedClient } from "@/components/forum/ForumFeedClient";
import type { ForumCategory, ForumPost } from "@/types/database";

export default async function ForumPage() {
  const { isSupabaseConfigured } = getPublicEnv();
  if (!isSupabaseConfigured) {
    return (
      <ForumFeedClient
        categories={[]}
        initialPosts={[]}
        currentUserId=""
        planTier="starter"
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

  const [categoriesRes, postsRes, planTier] = await Promise.all([
    supabase
      .from("forum_categories")
      .select("*")
      .order("sort_order", { ascending: true }),
    supabase
      .from("forum_posts")
      .select(
        `
        *,
        author:profiles!forum_posts_author_id_fkey(id, full_name),
        category:forum_categories!forum_posts_category_id_fkey(id, slug, name)
      `
      )
      .order("created_at", { ascending: false })
      .limit(50),
    getUserPlanTier(supabase, user.id),
  ]);

  return (
    <ForumFeedClient
      categories={(categoriesRes.data ?? []) as ForumCategory[]}
      initialPosts={(postsRes.data ?? []) as unknown as ForumPost[]}
      currentUserId={user.id}
      planTier={planTier}
    />
  );
}

