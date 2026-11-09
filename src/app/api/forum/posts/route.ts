import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { CreateForumPostSchema } from "@/lib/validations/forum";
import {
  getUserPlanTier,
  PLAN_ENTITLEMENTS,
} from "@/lib/subscription/entitlements";

export async function GET(request: Request) {
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

    const { searchParams } = new URL(request.url);
    const categoryId = searchParams.get("categoryId");
    const query = searchParams.get("q")?.trim();

    let dbQuery = supabase
      .from("forum_posts")
      .select(
        `
        *,
        author:profiles!forum_posts_author_id_fkey(id, full_name),
        category:forum_categories!forum_posts_category_id_fkey(id, slug, name)
      `
      )
      .order("created_at", { ascending: false })
      .limit(50);

    if (categoryId && categoryId !== "all") {
      dbQuery = dbQuery.eq("category_id", categoryId);
    }

    if (query) {
      dbQuery = dbQuery.or(`title.ilike.%${query}%,content.ilike.%${query}%`);
    }

    const { data: posts, error } = await dbQuery;

    if (error) {
      return NextResponse.json(
        { error: "Gagal memuat daftar diskusi forum." },
        { status: 500 }
      );
    }

    return NextResponse.json({ posts: posts ?? [] });
  } catch {
    return NextResponse.json(
      { error: "Terjadi kesalahan saat mengambil daftar diskusi." },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
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

    // Langkah 2: Validasi request body menggunakan skema Zod
    let rawBody: unknown;
    try {
      rawBody = await request.json();
    } catch {
      return NextResponse.json(
        { error: "Format permintaan JSON tidak valid." },
        { status: 400 }
      );
    }

    const parsed = CreateForumPostSchema.safeParse(rawBody);
    if (!parsed.success) {
      return NextResponse.json(
        {
          error: "Data diskusi belum lengkap atau tidak sesuai format.",
          details: parsed.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    // Langkah 3: Verifikasi entitlement paket langganan di server
    const planTier = await getUserPlanTier(supabase, user.id);
    const entitlement = PLAN_ENTITLEMENTS[planTier];

    if (!entitlement.canWriteForum) {
      return NextResponse.json(
        {
          error:
            "Paket Rintis Starter memiliki akses baca (Read-only) di Community Forum. Tingkatkan ke Rintis Growth atau Max untuk membuat diskusi dan memberikan komentar.",
        },
        { status: 403 }
      );
    }

    // Langkah 4: Simpan postingan ke database
    const { data: post, error: insertError } = await supabase
      .from("forum_posts")
      .insert({
        author_id: user.id,
        category_id: parsed.data.category_id,
        title: parsed.data.title,
        content: parsed.data.content,
      })
      .select("*")
      .single();

    if (insertError || !post) {
      return NextResponse.json(
        { error: "Gagal menyimpan diskusi baru ke database." },
        { status: 500 }
      );
    }

    // Langkah 5: Kembalikan respons JSON terstruktur
    return NextResponse.json(
      {
        message: "Diskusi berhasil dipublikasikan.",
        post,
      },
      { status: 201 }
    );
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Gagal membuat diskusi baru.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

