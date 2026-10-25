"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Sparkles,
  Send,
  Plus,
  MessageSquare,
  Lock,
  Map,
} from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { AlertBanner } from "@/components/ui/AlertBanner";
import type {
  AIConversation,
  AIMessage,
  PlanTier,
  Roadmap,
} from "@/types/database";
import { PLAN_ENTITLEMENTS } from "@/lib/subscription/entitlements";

interface AssistantWorkspaceProps {
  planTier: PlanTier;
  remainingQuota: number;
  dailyLimit: number;
  conversations: AIConversation[];
  activeConversation: AIConversation | null;
  initialMessages: AIMessage[];
  roadmaps: Pick<Roadmap, "id" | "title" | "version" | "business_name">[];
  defaultRoadmapId: string | null;
}

const STARTER_PROMPTS = [
  "Bagaimana cara menghitung harga jual agar margin minimal 30%?",
  "Susun 5 ide konten promosi organik minggu pertama untuk usaha saya.",
  "Langkah praktis mendapatkan 10 pembeli pertama tanpa biaya iklan besar.",
  "Evaluasi risiko utama pada tahap awal roadmap saya dan cara mencegahnya.",
];

export function AssistantWorkspace({
  planTier,
  remainingQuota: initialRemainingQuota,
  dailyLimit,
  conversations,
  activeConversation,
  initialMessages,
  roadmaps,
  defaultRoadmapId,
}: AssistantWorkspaceProps) {
  const router = useRouter();
  const entitlement = PLAN_ENTITLEMENTS[planTier];

  const [messages, setMessages] = useState<AIMessage[]>(initialMessages);
  const [conversationId, setConversationId] = useState<string | null>(
    activeConversation?.id ?? null
  );
  const [selectedRoadmapId, setSelectedRoadmapId] = useState<string>(
    activeConversation?.roadmap_id ?? defaultRoadmapId ?? ""
  );
  const [inputText, setInputText] = useState("");
  const [lastFailedPrompt, setLastFailedPrompt] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [remainingQuota, setRemainingQuota] = useState(initialRemainingQuota);

  if (!entitlement.canAccessAssistant) {
    return (
      <div className="rounded-xl border border-[#B7DCCF] bg-[#E8F4F0] p-8 space-y-5">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#1B8366] text-[#FFFFFF]">
            <Lock className="h-5 w-5" />
          </span>
          <div>
            <Badge variant="primary">Fitur Paket Growth & Max</Badge>
            <h2 className="mt-1 font-heading text-2xl font-bold text-[#172B25]">
              Diskusikan Kendala Usaha Anda bersama AI Business Assistant
            </h2>
          </div>
        </div>

        <p className="max-w-2xl text-sm sm:text-base text-[#52645D]">
          AI Business Assistant terhubung langsung dengan dokumen Roadmap Bisnis
          Anda. Tanyakan strategi harga, ide promosi harian, perhitungan HPP,
          maupun diagnosis operasional kapan saja dengan kuota hingga 100 pesan
          per hari.
        </p>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 max-w-2xl text-sm text-[#172B25]">
          <div className="rounded-lg border border-[#B7DCCF] bg-[#FFFFFF] p-3.5">
            <strong className="block font-semibold text-[#1B8366]">
              Rantau Growth
            </strong>
            <span>30 pesan kontekstual per hari + 12 komponen roadmap</span>
          </div>
          <div className="rounded-lg border border-[#B7DCCF] bg-[#FFFFFF] p-3.5">
            <strong className="block font-semibold text-[#1B8366]">
              Rantau Max
            </strong>
            <span>100 pesan per hari + Booking Konsultasi Mentor 1-on-1</span>
          </div>
        </div>

        <div className="pt-2">
          <Link
            href="/settings/subscription"
            className="inline-flex items-center justify-center rounded-lg bg-[#1B8366] px-5 py-2.5 text-sm font-semibold text-[#FFFFFF] transition-colors hover:bg-[#166B53]"
          >
            Upgrade Paket di Pengaturan Langganan
          </Link>
        </div>
      </div>
    );
  }

  async function sendMessage(textToSend: string) {
    const trimmed = textToSend.trim();
    if (!trimmed || sending) return;

    try {
      setSending(true);
      setErrorMsg(null);
      setLastFailedPrompt(null);

      const res = await fetch("/api/assistant/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          conversation_id: conversationId,
          roadmap_id: selectedRoadmapId || null,
          message: trimmed,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data.error || "Gagal menghubungi AI Business Assistant.");
        setLastFailedPrompt(trimmed);
        setSending(false);
        return;
      }

      if (data.userMessage && data.assistantMessage) {
        setMessages((prev) => [
          ...prev,
          data.userMessage as AIMessage,
          data.assistantMessage as AIMessage,
        ]);
      }
      if (data.conversationId && !conversationId) {
        setConversationId(data.conversationId);
        router.replace(
          `/assistant?conversationId=${data.conversationId}${
            selectedRoadmapId ? `&roadmapId=${selectedRoadmapId}` : ""
          }`
        );
      }
      if (data.quota?.remaining !== undefined) {
        setRemainingQuota(data.quota.remaining);
      }

      setInputText("");
      setSending(false);
      router.refresh();
    } catch {
      setErrorMsg(
        "Terjadi gangguan jaringan saat mengirim pesan ke AI Assistant."
      );
      setLastFailedPrompt(trimmed);
      setSending(false);
    }
  }

  function handleFormSubmit(e: React.FormEvent) {
    e.preventDefault();
    void sendMessage(inputText);
  }

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
      {/* Sidebar Riwayat Diskusi (Kolom Kiri) */}
      <aside className="lg:col-span-4 space-y-4">
        <div className="rounded-xl border border-[#E1E8E4] bg-[#FFFFFF] p-4 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-heading text-base font-bold text-[#172B25]">
              Riwayat Diskusi AI
            </h2>
            <Link
              href="/assistant"
              onClick={() => {
                setConversationId(null);
                setMessages([]);
                setErrorMsg(null);
              }}
              className="inline-flex items-center gap-1.5 rounded-lg bg-[#E8F4F0] border border-[#B7DCCF] px-2.5 py-1.5 text-xs font-semibold text-[#1B8366] hover:bg-[#B7DCCF]"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Percakapan Baru</span>
            </Link>
          </div>

          <div className="rounded-lg border border-[#E1E8E4] bg-[#F8FAF9] p-3 space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-medium text-[#52645D]">
                Sisa Kuota Pesan Hari Ini
              </span>
              <span className="font-bold text-[#1B8366]">
                {remainingQuota} / {dailyLimit}
              </span>
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-[#E8F4F0]">
              <div
                className="h-full rounded-full bg-[#1B8366]"
                style={{
                  width: `${
                    dailyLimit > 0
                      ? Math.min(
                          100,
                          Math.round((remainingQuota / dailyLimit) * 100)
                        )
                      : 0
                  }%`,
                }}
              />
            </div>
          </div>

          {conversations.length === 0 ? (
            <p className="py-4 text-center text-xs text-[#718078]">
              Belum ada riwayat percakapan yang tersimpan.
            </p>
          ) : (
            <div className="space-y-1.5 max-h-[380px] overflow-y-auto pr-1">
              {conversations.map((conv) => {
                const isSelected = conv.id === conversationId;
                return (
                  <Link
                    key={conv.id}
                    href={`/assistant?conversationId=${conv.id}`}
                    className={`flex items-start gap-2.5 rounded-lg p-2.5 text-left text-xs transition-colors ${
                      isSelected
                        ? "bg-[#E8F4F0] font-semibold text-[#1B8366] border border-[#B7DCCF]"
                        : "text-[#52645D] hover:bg-[#F8FAF9] hover:text-[#172B25]"
                    }`}
                  >
                    <MessageSquare className="h-4 w-4 shrink-0 mt-0.5" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate">{conv.title}</p>
                      <span className="text-[11px] text-[#718078]">
                        {new Intl.DateTimeFormat("id-ID", {
                          day: "numeric",
                          month: "short",
                          hour: "2-digit",
                          minute: "2-digit",
                        }).format(new Date(conv.updated_at))}
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </aside>

      {/* Panel Ruang Chat Utama (Kolom Kanan) */}
      <section className="lg:col-span-8 flex flex-col rounded-xl border border-[#E1E8E4] bg-[#FFFFFF] overflow-hidden min-h-[560px]">
        {/* Header Pemilih Konteks Roadmap */}
        <div className="border-b border-[#E1E8E4] bg-[#F8FAF9] p-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-[#1B8366]" />
            <span className="text-sm font-semibold text-[#172B25]">
              Konteks Roadmap Bisnis:
            </span>
          </div>

          <div className="flex items-center gap-2 flex-1 sm:max-w-xs">
            <Map className="h-4 w-4 text-[#718078] shrink-0" />
            <select
              aria-label="Pilih Roadmap sebagai konteks"
              value={selectedRoadmapId}
              onChange={(e) => setSelectedRoadmapId(e.target.value)}
              className="w-full rounded-lg border border-[#C8D4CE] bg-[#FFFFFF] px-3 py-1.5 text-xs font-medium text-[#172B25]"
            >
              <option value="">Tanpa tautan roadmap spesifik</option>
              {roadmaps.map((rm) => (
                <option key={rm.id} value={rm.id}>
                  v{rm.version} — {rm.business_name} ({rm.title})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Area Pesan */}
        <div className="flex-1 p-5 space-y-4 overflow-y-auto max-h-[460px]">
          {messages.length === 0 ? (
            <div className="py-8 text-center space-y-4">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-[#E8F4F0] text-[#1B8366]">
                <Sparkles className="h-6 w-6" />
              </div>
              <div className="space-y-1 max-w-md mx-auto">
                <h3 className="font-heading text-lg font-bold text-[#172B25]">
                  Mulai Diskusi Strategi Usaha Anda
                </h3>
                <p className="text-xs sm:text-sm text-[#52645D]">
                  Pilih salah satu topik di bawah ini atau ketik kendala
                  spesifik yang sedang Anda hadapi hari ini.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 text-left pt-2">
                {STARTER_PROMPTS.map((prompt) => (
                  <button
                    key={prompt}
                    type="button"
                    disabled={sending}
                    onClick={() => void sendMessage(prompt)}
                    className="rounded-xl border border-[#E1E8E4] bg-[#F8FAF9] p-3 text-xs font-medium text-[#172B25] hover:border-[#1B8366] hover:bg-[#E8F4F0] transition-colors text-left cursor-pointer"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${
                  msg.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[85%] rounded-xl px-4 py-3 text-sm leading-[1.6] whitespace-pre-line ${
                    msg.role === "user"
                      ? "bg-[#1B8366] text-[#FFFFFF]"
                      : "border border-[#E1E8E4] bg-[#F8FAF9] text-[#172B25]"
                  }`}
                >
                  <p className="text-[11px] font-semibold mb-1 opacity-80">
                    {msg.role === "user" ? "Anda" : "AI Business Assistant"}
                  </p>
                  <div>{msg.content}</div>
                </div>
              </div>
            ))
          )}

          {sending && (
            <div className="flex justify-start">
              <div className="rounded-xl border border-[#B7DCCF] bg-[#E8F4F0] px-4 py-3 text-xs font-medium text-[#1B8366] flex items-center gap-2.5">
                <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-[#1B8366] border-t-transparent" />
                <span>
                  AI Assistant sedang menganalisis konteks usaha Anda...
                </span>
              </div>
            </div>
          )}

          {errorMsg && (
            <AlertBanner
              variant="error"
              message={errorMsg}
              onRetry={
                lastFailedPrompt
                  ? () => void sendMessage(lastFailedPrompt)
                  : undefined
              }
            />
          )}
        </div>

        {/* Form Input Pesan */}
        <form
          onSubmit={handleFormSubmit}
          className="border-t border-[#E1E8E4] bg-[#FFFFFF] p-4 flex items-end gap-3"
        >
          <div className="flex-1">
            <label htmlFor="assistant-message-input" className="sr-only">
              Ketik pertanyaan bisnis Anda
            </label>
            <textarea
              id="assistant-message-input"
              rows={2}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Tanyakan strategi harga, pemasaran, operasional, atau tugas roadmap Anda..."
              className="w-full rounded-lg border border-[#C8D4CE] bg-[#FFFFFF] px-3 py-2 text-sm text-[#172B25] placeholder:text-[#718078]"
            />
          </div>
          <Button
            type="submit"
            variant="primary"
            isLoading={sending}
            disabled={!inputText.trim()}
          >
            <Send className="h-4 w-4" />
            <span>Kirim</span>
          </Button>
        </form>
      </section>
    </div>
  );
}

