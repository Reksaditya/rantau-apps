import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { UpdateForumPostSchema } from "@/lib/validations/forum";
import {
  getUserPlanTier,
  PLAN_ENTITLEMENTS,
} from "@/lib/subscription/entitlements";

export async function PATCH(
  request: Request,
  context: { params: Promise<{ postId: string }> }
) {
  try {
    // Langkah 1: Verifikasi autentikasi pengguna
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

    // Langkah 2: Validasi request body menggunakan skema Zod
    let rawBody: unknown;
    try {
      rawBody = await request.json();
    } catch {
      return NextResponse.json(
        { error: "Format JSON tidak valid." },
        { status: 400 }
      );
    }

    const parsed = UpdateForumPostSchema.safeParse(rawBody);
    if (!parsed.success) {
      return NextResponse.json(
        {
          error: "Data pembaruan diskusi tidak valid.",
          details: parsed.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    // Langkah 3: Verifikasi entitlement & kepemilikan
    const planTier = await getUserPlanTier(supabase, user.id);
    if (!PLAN_ENTITLEMENTS[planTier].canWriteForum) {
      return NextResponse.json(
        {
          error:
            "Paket Anda saat ini hanya mendukung akses baca (Read-only) pada forum.",
        },
        { status: 403 }
      );
    }

    // Langkah 4: Pencegahan IDOR (.eq('author_id', user.id))
    const { data: updatedPost, error: updateError } = await supabase
      .from("forum_posts")
      .update({
        category_id: parsed.data.category_id,
        title: parsed.data.title,
        content: parsed.data.content,
        updated_at: new Date().toISOString(),
      })
      .eq("id", postId)
      .eq("author_id", user.id)
      .select("*")
      .maybeSingle();

    if (updateError || !updatedPost) {
      return NextResponse.json(
        {
          error:
            "Diskusi tidak ditemukan atau Anda bukan pemilik postingan ini.",
        },
        { status: 403 }
      );
    }

    // Langkah 5: Kembalikan respons JSON
    return NextResponse.json({
      message: "Diskusi berhasil diperbarui.",
      post: updatedPost,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Gagal memperbarui diskusi.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(
  _request: Request,
  context: { params: Promise<{ postId: string }> }
) {
  try {
    // Langkah 1: Verifikasi autentikasi pengguna
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

    // Langkah 4: Pencegahan IDOR (.eq('author_id', user.id)) saat menghapus
    const { data: deletedPost, error: deleteError } = await supabase
      .from("forum_posts")
      .delete()
      .eq("id", postId)
      .eq("author_id", user.id)
      .select("id")
      .maybeSingle();

    if (deleteError || !deletedPost) {
      return NextResponse.json(
        {
          error:
            "Diskusi tidak ditemukan atau Anda tidak berhak menghapus postingan ini.",
        },
        { status: 403 }
      );
    }

    return NextResponse.json({
      message: "Diskusi berhasil dihapus.",
      deletedId: deletedPost.id,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Gagal menghapus diskusi.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

