"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ThumbsUp, MessageSquare, Trash2, Edit3, Lock } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { AlertBanner } from "@/components/ui/AlertBanner";
import type { ForumComment, ForumPost, PlanTier } from "@/types/database";
import { PLAN_ENTITLEMENTS } from "@/lib/subscription/entitlements";

interface ForumDetailClientProps {
  post: ForumPost;
  initialComments: ForumComment[];
  currentUserId: string;
  planTier: PlanTier;
  initialHasUpvoted: boolean;
}

export function ForumDetailClient({
  post,
  initialComments,
  currentUserId,
  planTier,
  initialHasUpvoted,
}: ForumDetailClientProps) {
  const router = useRouter();
  const entitlement = PLAN_ENTITLEMENTS[planTier];
  const isPostOwner = post.author_id === currentUserId;

  const [upvotesCount, setUpvotesCount] = useState(post.upvotes_count);
  const [hasUpvoted, setHasUpvoted] = useState(initialHasUpvoted);
  const [voting, setVoting] = useState(false);

  const [comments, setComments] = useState<ForumComment[]>(initialComments);
  const [commentText, setCommentText] = useState("");
  const [submittingComment, setSubmittingComment] = useState(false);
  const [deletingPost, setDeletingPost] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  async function handleToggleVote() {
    if (!entitlement.canWriteForum) {
      setErrorMsg(
        "Fitur upvote tersedia pada paket Rantau Growth dan Rantau Max."
      );
      return;
    }

    try {
      setVoting(true);
      setErrorMsg(null);
      const res = await fetch(`/api/forum/posts/${post.id}/vote`, {
        method: "POST",
      });
      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data.error || "Gagal memperbarui dukungan.");
        setVoting(false);
        return;
      }
      setHasUpvoted(data.upvoted);
      setUpvotesCount(data.upvotesCount);
      setVoting(false);
    } catch {
      setErrorMsg("Terjadi kesalahan saat memberikan dukungan.");
      setVoting(false);
    }
  }

  async function handleAddComment(e: React.FormEvent) {
    e.preventDefault();
    if (!commentText.trim() || submittingComment) return;

    try {
      setSubmittingComment(true);
      setErrorMsg(null);
      setSuccessMsg(null);

      const res = await fetch(`/api/forum/posts/${post.id}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: commentText.trim() }),
      });

      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data.error || "Gagal mengirim komentar.");
        setSubmittingComment(false);
        return;
      }

      if (data.comment) {
        setComments((prev) => [...prev, data.comment as ForumComment]);
      }
      setCommentText("");
      setSuccessMsg("Komentar berhasil ditambahkan.");
      setSubmittingComment(false);
      router.refresh();
    } catch {
      setErrorMsg("Terjadi kendala jaringan saat mengirim komentar.");
      setSubmittingComment(false);
    }
  }

  async function handleDeleteComment(commentId: string) {
    try {
      setErrorMsg(null);
      const res = await fetch(
        `/api/forum/posts/${post.id}/comments?commentId=${commentId}`,
        { method: "DELETE" }
      );
      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data.error || "Gagal menghapus komentar.");
        return;
      }
      setComments((prev) => prev.filter((c) => c.id !== commentId));
      setSuccessMsg("Komentar berhasil dihapus.");
      router.refresh();
    } catch {
      setErrorMsg("Gagal menghapus komentar.");
    }
  }

  async function handleDeletePost() {
    try {
      setDeletingPost(true);
      setErrorMsg(null);
      const res = await fetch(`/api/forum/posts/${post.id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data.error || "Gagal menghapus diskusi.");
        setDeletingPost(false);
        return;
      }
      router.push("/forum");
      router.refresh();
    } catch {
      setErrorMsg("Gagal menghapus diskusi.");
      setDeletingPost(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Link
          href="/forum"
          className="text-sm font-semibold text-[#1B8366] hover:underline"
        >
          Kembali ke Daftar Forum
        </Link>
      </div>

      {errorMsg && <AlertBanner variant="error" message={errorMsg} />}
      {successMsg && <AlertBanner variant="success" message={successMsg} />}

      {/* Kartu Postingan Utama */}
      <article className="rounded-xl border border-[#E1E8E4] bg-[#FFFFFF] p-6 space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Badge variant="primary">
            {post.category?.name ?? "Diskusi Bisnis"}
          </Badge>

          {/* Tombol Edit & Hapus HANYA dirender untuk pemilik postingan */}
          {isPostOwner && (
            <div className="flex items-center gap-2">
              <Link
                href={`/forum/${post.id}/edit`}
                className="inline-flex items-center gap-1.5 rounded-lg border border-[#C8D4CE] bg-[#FFFFFF] px-3 py-1.5 text-xs font-medium text-[#172B25] hover:bg-[#F8FAF9]"
              >
                <Edit3 className="h-3.5 w-3.5" />
                <span>Edit</span>
              </Link>
              <Button
                type="button"
                variant="destructive"
                isLoading={deletingPost}
                onClick={handleDeletePost}
                className="px-3 py-1.5 text-xs"
              >
                <Trash2 className="h-3.5 w-3.5" />
                <span>Hapus</span>
              </Button>
            </div>
          )}
        </div>

        <div className="space-y-2">
          <h1 className="font-heading text-2xl font-bold text-[#172B25]">
            {post.title}
          </h1>
          <div className="flex items-center gap-2 text-xs text-[#718078]">
            <span className="font-semibold text-[#172B25]">
              {post.author?.full_name || "Anggota Rantau"}
            </span>
            <span>•</span>
            <span>
              Dipublikasikan{" "}
              {new Intl.DateTimeFormat("id-ID", {
                day: "numeric",
                month: "long",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              }).format(new Date(post.created_at))}
            </span>
          </div>
        </div>

        <div className="text-sm sm:text-base leading-[1.7] text-[#172B25] whitespace-pre-line border-t border-[#E1E8E4] pt-4">
          {post.content}
        </div>

        <div className="flex items-center gap-4 pt-3 border-t border-[#E1E8E4]">
          <button
            type="button"
            disabled={voting}
            onClick={handleToggleVote}
            className={`inline-flex items-center gap-2 rounded-lg px-3.5 py-2 text-xs font-semibold transition-colors cursor-pointer ${
              hasUpvoted
                ? "bg-[#1B8366] text-[#FFFFFF]"
                : "border border-[#C8D4CE] bg-[#FFFFFF] text-[#172B25] hover:bg-[#F8FAF9]"
            }`}
          >
            <ThumbsUp className="h-4 w-4" />
            <span>
              {hasUpvoted ? "Didukung" : "Beri Dukungan"} ({upvotesCount})
            </span>
          </button>

          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-[#52645D]">
            <MessageSquare className="h-4 w-4 text-[#1B8366]" />
            <span>{comments.length} Komentar</span>
          </span>
        </div>
      </article>

      {/* Bagian Komentar */}
      <section className="rounded-xl border border-[#E1E8E4] bg-[#FFFFFF] p-6 space-y-5">
        <h2 className="font-heading text-lg font-bold text-[#172B25]">
          Balasan & Masukan Komunitas ({comments.length})
        </h2>

        {entitlement.canWriteForum ? (
          <form onSubmit={handleAddComment} className="space-y-3">
            <label
              htmlFor="comment-input"
              className="block text-xs font-semibold text-[#52645D]"
            >
              Tulis Tanggapan atau Saran Praktis Anda
            </label>
            <textarea
              id="comment-input"
              rows={3}
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Bagikan pengalaman atau saran yang dapat membantu penulis diskusi ini..."
              className="w-full rounded-lg border border-[#C8D4CE] bg-[#FFFFFF] px-3 py-2 text-sm text-[#172B25] placeholder:text-[#718078]"
            />
            <div className="flex justify-end">
              <Button
                type="submit"
                variant="primary"
                isLoading={submittingComment}
                disabled={!commentText.trim()}
              >
                Kirim Komentar
              </Button>
            </div>
          </form>
        ) : (
          <div className="rounded-xl border border-[#B7DCCF] bg-[#E8F4F0] p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex items-center gap-2.5 text-xs sm:text-sm text-[#172B25]">
              <Lock className="h-4 w-4 text-[#1B8366] shrink-0" />
              <span>
                Paket Rantau Starter memiliki akses baca (Read-only). Upgrade ke
                Growth atau Max untuk ikut berkomentar.
              </span>
            </div>
            <Link
              href="/settings/subscription"
              className="rounded-lg bg-[#1B8366] px-3.5 py-2 text-xs font-semibold text-[#FFFFFF] hover:bg-[#166B53] shrink-0 self-start sm:self-auto"
            >
              Upgrade Paket
            </Link>
          </div>
        )}

        {comments.length === 0 ? (
          <p className="py-4 text-center text-sm text-[#718078]">
            Belum ada komentar pada diskusi ini.
          </p>
        ) : (
          <div className="divide-y divide-[#E1E8E4]">
            {comments.map((comment) => {
              const isCommentOwner = comment.author_id === currentUserId;
              return (
                <div key={comment.id} className="py-4 first:pt-2 last:pb-0">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 text-xs text-[#718078]">
                      <span className="font-semibold text-[#172B25]">
                        {comment.author?.full_name || "Anggota Rantau"}
                      </span>
                      <span>•</span>
                      <span>
                        {new Intl.DateTimeFormat("id-ID", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        }).format(new Date(comment.created_at))}
                      </span>
                    </div>

                    {isCommentOwner && (
                      <button
                        type="button"
                        onClick={() => handleDeleteComment(comment.id)}
                        className="text-xs font-medium text-[#C62828] hover:underline cursor-pointer"
                      >
                        Hapus Komentar
                      </button>
                    )}
                  </div>
                  <p className="mt-2 text-sm text-[#172B25] whitespace-pre-line">
                    {comment.content}
                  </p>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}

