import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { CreateForumCommentSchema } from "@/lib/validations/forum";
import {
  getUserPlanTier,
  PLAN_ENTITLEMENTS,
} from "@/lib/subscription/entitlements";

export async function POST(
  request: Request,
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

    const { postId } = await context.params;

    let rawBody: unknown;
    try {
      rawBody = await request.json();
    } catch {
      return NextResponse.json(
        { error: "Format JSON tidak valid." },
        { status: 400 }
      );
    }

    const parsed = CreateForumCommentSchema.safeParse(rawBody);
    if (!parsed.success) {
      return NextResponse.json(
        {
          error: "Isi komentar belum sesuai ketentuan.",
          details: parsed.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const planTier = await getUserPlanTier(supabase, user.id);
    if (!PLAN_ENTITLEMENTS[planTier].canWriteForum) {
      return NextResponse.json(
        {
          error:
            "Paket Rintis Starter memiliki akses Read-only pada forum. Tingkatkan ke Rintis Growth atau Max untuk berdiskusi dan mengirim komentar.",
        },
        { status: 403 }
      );
    }

    const { data: comment, error: insertError } = await supabase
      .from("forum_comments")
      .insert({
        post_id: postId,
        author_id: user.id,
        content: parsed.data.content,
      })
      .select(
        `
        *,
        author:profiles!forum_comments_author_id_fkey(id, full_name)
      `
      )
      .single();

    if (insertError || !comment) {
      return NextResponse.json(
        { error: "Gagal mengirim komentar." },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        message: "Komentar berhasil ditambahkan.",
        comment,
      },
      { status: 201 }
    );
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Gagal menambahkan komentar.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
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
        { error: "Sesi tidak valid." },
        { status: 401 }
      );
    }

    const { postId } = await context.params;
    const { searchParams } = new URL(request.url);
    const commentId = searchParams.get("commentId");

    if (!commentId) {
      return NextResponse.json(
        { error: "ID komentar diperlukan." },
        { status: 400 }
      );
    }

    const { data: deleted, error: deleteError } = await supabase
      .from("forum_comments")
      .delete()
      .eq("id", commentId)
      .eq("post_id", postId)
      .eq("author_id", user.id)
      .select("id")
      .maybeSingle();

    if (deleteError || !deleted) {
      return NextResponse.json(
        { error: "Komentar tidak ditemukan atau Anda bukan penulisnya." },
        { status: 403 }
      );
    }

    return NextResponse.json({
      message: "Komentar berhasil dihapus.",
      deletedId: deleted.id,
    });
  } catch {
    return NextResponse.json(
      { error: "Gagal menghapus komentar." },
      { status: 500 }
    );
  }
}

