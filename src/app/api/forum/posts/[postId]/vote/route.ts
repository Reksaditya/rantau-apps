import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import {
  getUserPlanTier,
  PLAN_ENTITLEMENTS,
} from "@/lib/subscription/entitlements";

export async function POST(
  _request: Request,
  context: { params: Promise<{ postId: string }> }
) {
  try {
    const supabase = await createServerSupabaseClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: "Sesi tidak valid. Silakan masuk kembali." },
        { status: 401 }
      );
    }

    const planTier = await getUserPlanTier(supabase, user.id);
    if (!PLAN_ENTITLEMENTS[planTier].canWriteForum) {
      return NextResponse.json(
        {
          error:
            "Fitur upvote tersedia pada paket Rantau Growth dan Rantau Max.",
        },
        { status: 403 }
      );
    }

    const { postId } = await context.params;

    const { data: existingVote } = await supabase
      .from("forum_votes")
      .select("id")
      .eq("post_id", postId)
      .eq("user_id", user.id)
      .maybeSingle();

    let upvoted = false;
    if (existingVote) {
      await supabase
        .from("forum_votes")
        .delete()
        .eq("id", existingVote.id)
        .eq("user_id", user.id);
      upvoted = false;
    } else {
      await supabase.from("forum_votes").insert({
        post_id: postId,
        user_id: user.id,
      });
      upvoted = true;
    }

    const { data: updatedPost } = await supabase
      .from("forum_posts")
      .select("upvotes_count")
      .eq("id", postId)
      .maybeSingle();

    return NextResponse.json({
      upvoted,
      upvotesCount: updatedPost?.upvotes_count ?? 0,
    });
  } catch {
    return NextResponse.json(
      { error: "Gagal memperbarui dukungan (upvote)." },
      { status: 500 }
    );
  }
}

