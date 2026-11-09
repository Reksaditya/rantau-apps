import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { AssistantChatRequestSchema } from "@/lib/validations/assistant";
import {
  checkAndIncrementDailyQuota,
  getUserPlanTier,
  PLAN_ENTITLEMENTS,
} from "@/lib/subscription/entitlements";
import {
  generateAssistantReplyWithAI,
  GeminiServiceError,
} from "@/lib/ai/gemini";
import type { AIMessage, Roadmap } from "@/types/database";

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

    const parsed = AssistantChatRequestSchema.safeParse(rawBody);
    if (!parsed.success) {
      return NextResponse.json(
        {
          error: "Pesan tidak valid.",
          details: parsed.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    // Langkah 3: Verifikasi entitlement paket langganan & kuota harian di server
    const planTier = await getUserPlanTier(supabase, user.id);
    const entitlement = PLAN_ENTITLEMENTS[planTier];

    if (!entitlement.canAccessAssistant) {
      return NextResponse.json(
        {
          error:
            "Fitur AI Business Assistant tersedia khusus untuk pelanggan paket Rintis Growth dan Rintis Max. Silakan tingkatkan paket Anda.",
        },
        { status: 403 }
      );
    }

    const quota = await checkAndIncrementDailyQuota(
      supabase,
      user.id,
      "ai_assistant_message"
    );

    if (!quota.allowed) {
      return NextResponse.json(
        {
          error: `Kuota pesan AI Assistant harian Anda (${quota.dailyLimit} pesan/hari) telah habis untuk hari ini. Kuota akan di-reset pukul 00:00 WIB.`,
          quota,
        },
        { status: 429 }
      );
    }

    // Langkah 4: Ambil konteks roadmap & percakapan, panggil Gemini API, dan simpan pesan
    const { conversation_id, roadmap_id, message } = parsed.data;
    let activeConversationId = conversation_id ?? null;
    let activeRoadmapId = roadmap_id ?? null;

    if (activeConversationId) {
      const { data: existingConv } = await supabase
        .from("ai_conversations")
        .select("id, roadmap_id")
        .eq("id", activeConversationId)
        .eq("user_id", user.id)
        .maybeSingle();

      if (!existingConv) {
        return NextResponse.json(
          { error: "Sesi percakapan tidak ditemukan." },
          { status: 404 }
        );
      }
      if (!activeRoadmapId && existingConv.roadmap_id) {
        activeRoadmapId = existingConv.roadmap_id;
      }
    } else {
      const shortTitle =
        message.length > 52 ? `${message.slice(0, 52)}...` : message;
      const { data: newConv, error: convError } = await supabase
        .from("ai_conversations")
        .insert({
          user_id: user.id,
          roadmap_id: activeRoadmapId,
          title: shortTitle,
        })
        .select("id")
        .single();

      if (convError || !newConv) {
        return NextResponse.json(
          { error: "Gagal membuat sesi percakapan baru." },
          { status: 500 }
        );
      }
      activeConversationId = newConv.id;
    }

    let linkedRoadmap: Roadmap | null = null;
    if (activeRoadmapId) {
      const { data: rData } = await supabase
        .from("roadmaps")
        .select("*")
        .eq("id", activeRoadmapId)
        .eq("user_id", user.id)
        .maybeSingle();
      linkedRoadmap = (rData as Roadmap | null) ?? null;
    }

    const { data: recentMessages } = await supabase
      .from("ai_messages")
      .select("role, content")
      .eq("conversation_id", activeConversationId)
      .eq("user_id", user.id)
      .order("created_at", { ascending: true })
      .limit(10);

    const history = (recentMessages ?? []) as Pick<
      AIMessage,
      "role" | "content"
    >[];

    // Simpan pesan pengguna
    const { data: savedUserMessage } = await supabase
      .from("ai_messages")
      .insert({
        conversation_id: activeConversationId,
        user_id: user.id,
        role: "user",
        content: message,
      })
      .select("*")
      .single();

    // Panggil Gemini API
    const aiReplyText = await generateAssistantReplyWithAI({
      userMessage: message,
      history,
      linkedRoadmap,
    });

    // Simpan balasan AI
    const { data: savedAssistantMessage } = await supabase
      .from("ai_messages")
      .insert({
        conversation_id: activeConversationId,
        user_id: user.id,
        role: "assistant",
        content: aiReplyText,
      })
      .select("*")
      .single();

    await supabase
      .from("ai_conversations")
      .update({
        roadmap_id: activeRoadmapId,
        updated_at: new Date().toISOString(),
      })
      .eq("id", activeConversationId)
      .eq("user_id", user.id);

    // Langkah 5: Kembalikan respons JSON terstruktur
    return NextResponse.json({
      conversationId: activeConversationId,
      userMessage: savedUserMessage,
      assistantMessage: savedAssistantMessage,
      quota,
    });
  } catch (error) {
    if (error instanceof GeminiServiceError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.statusCode }
      );
    }

    const message =
      error instanceof Error
        ? error.message
        : "Gagal memproses pesan AI Assistant.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

