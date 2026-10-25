import Link from "next/link";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getPublicEnv } from "@/lib/env";
import {
  getUserPlanTier,
  PLAN_ENTITLEMENTS,
} from "@/lib/subscription/entitlements";
import { ForumPostForm } from "@/components/forum/ForumPostForm";
import { AlertBanner } from "@/components/ui/AlertBanner";
import type { ForumCategory } from "@/types/database";

export default async function NewForumPostPage() {
  const { isSupabaseConfigured } = getPublicEnv();
  if (!isSupabaseConfigured) {
    return null;
  }

  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const [categoriesRes, planTier] = await Promise.all([
    supabase
      .from("forum_categories")
      .select("*")
      .order("sort_order", { ascending: true }),
    getUserPlanTier(supabase, user.id),
  ]);

  const canWrite = PLAN_ENTITLEMENTS[planTier].canWriteForum;
  const categories = (categoriesRes.data ?? []) as ForumCategory[];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl sm:text-[30px] font-bold text-[#172B25]">
            Buat Topik Diskusi Baru
          </h1>
          <p className="mt-1 text-sm text-[#52645D]">
            Bagikan pertanyaan atau pengalaman praktis bisnis Anda kepada
            komunitas Rantau.
          </p>
        </div>
        <Link
          href="/forum"
          className="text-sm font-semibold text-[#1B8366] hover:underline"
        >
          Kembali ke Forum
        </Link>
      </div>

      {!canWrite ? (
        <AlertBanner
          variant="warning"
          title="Akses Baca (Read-only) pada Paket Rantau Starter"
          message="Untuk membuat topik diskusi baru dan memberi komentar di komunitas, silakan tingkatkan paket Anda ke Rantau Growth atau Rantau Max."
          actionHref="/settings/subscription"
          actionLabel="Upgrade Paket"
        />
      ) : (
        <ForumPostForm categories={categories} mode="create" />
      )}
    </div>
  );
}

