import { notFound, redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getPublicEnv } from "@/lib/env";
import { ForumPostForm } from "@/components/forum/ForumPostForm";
import type { ForumCategory, ForumPost } from "@/types/database";

export default async function EditForumPostPage({
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
    redirect("/login");
  }

  const [postRes, categoriesRes] = await Promise.all([
    supabase
      .from("forum_posts")
      .select("*")
      .eq("id", id)
      .eq("author_id", user.id)
      .maybeSingle(),
    supabase
      .from("forum_categories")
      .select("*")
      .order("sort_order", { ascending: true }),
  ]);

  if (!postRes.data) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl sm:text-[30px] font-bold text-[#172B25]">
          Perbarui Topik Diskusi
        </h1>
        <p className="mt-1 text-sm text-[#52645D]">
          Edit judul, kategori, atau isi diskusi milik Anda.
        </p>
      </div>

      <ForumPostForm
        categories={(categoriesRes.data ?? []) as ForumCategory[]}
        mode="edit"
        initialPost={postRes.data as ForumPost}
      />
    </div>
  );
}

