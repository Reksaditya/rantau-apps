"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Search,
  Plus,
  MessageSquare,
  ThumbsUp,
  Lock,
} from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/AlertBanner";
import type { ForumCategory, ForumPost, PlanTier } from "@/types/database";
import { PLAN_ENTITLEMENTS } from "@/lib/subscription/entitlements";

interface ForumFeedClientProps {
  categories: ForumCategory[];
  initialPosts: ForumPost[];
  currentUserId: string;
  planTier: PlanTier;
}

export function ForumFeedClient({
  categories,
  initialPosts,
  currentUserId,
  planTier,
}: ForumFeedClientProps) {
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [visibleCount, setVisibleCount] = useState<number>(10);

  const entitlement = PLAN_ENTITLEMENTS[planTier];

  const filteredPosts = initialPosts.filter((post) => {
    const matchCategory =
      selectedCategoryId === "all" || post.category_id === selectedCategoryId;
    const q = searchQuery.trim().toLowerCase();
    const matchSearch =
      !q ||
      post.title.toLowerCase().includes(q) ||
      post.content.toLowerCase().includes(q);
    return matchCategory && matchSearch;
  });

  const displayedPosts = filteredPosts.slice(0, visibleCount);

  return (
    <div className="space-y-6">
      {/* Header Forum */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-heading text-2xl sm:text-[30px] font-bold text-[#172B25]">
            Forum Komunitas Rintis
          </h1>
          <p className="mt-1 text-sm sm:text-base text-[#52645D]">
            Diskusi terstruktur antar perintis bisnis dan pelaku UMKM di
            Indonesia.
          </p>
        </div>

        {entitlement.canWriteForum ? (
          <Link
            href="/forum/new"
            className="inline-flex items-center gap-2 rounded-lg bg-[#1B8366] px-4 py-2.5 text-sm font-medium text-[#FFFFFF] transition-colors hover:bg-[#166B53] self-start sm:self-auto"
          >
            <Plus className="h-4 w-4" />
            <span>Buat Diskusi Baru</span>
          </Link>
        ) : (
          <Link
            href="/settings/subscription"
            className="inline-flex items-center gap-2 rounded-lg bg-[#E8F4F0] border border-[#B7DCCF] px-4 py-2.5 text-xs sm:text-sm font-semibold text-[#1B8366] hover:bg-[#B7DCCF] self-start sm:self-auto"
          >
            <Lock className="h-4 w-4" />
            <span>Mode Baca (Upgrade untuk Posting)</span>
          </Link>
        )}
      </div>

      {/* Tata Letak 2 Kolom sesuai DESIGN.md Section 6.4 */}
      <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
        {/* Kolom Kiri (240px): Filter Kategori Diskusi */}
        <aside className="w-full lg:w-[240px] lg:shrink-0 rounded-xl border border-[#E1E8E4] bg-[#FFFFFF] p-4 space-y-2">
          <h2 className="px-2 pb-1 font-heading text-sm font-bold text-[#172B25]">
            Kategori Diskusi
          </h2>

          <button
            type="button"
            onClick={() => setSelectedCategoryId("all")}
            className={`w-full rounded-lg px-3 py-2 text-left text-xs sm:text-sm transition-colors cursor-pointer ${
              selectedCategoryId === "all"
                ? "bg-[#E8F4F0] font-semibold text-[#1B8366]"
                : "font-medium text-[#52645D] hover:bg-[#F8FAF9] hover:text-[#172B25]"
            }`}
          >
            Semua Kategori ({initialPosts.length})
          </button>

          {categories.map((cat) => {
            const count = initialPosts.filter(
              (p) => p.category_id === cat.id
            ).length;
            const isSelected = selectedCategoryId === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategoryId(cat.id)}
                className={`w-full rounded-lg px-3 py-2 text-left text-xs sm:text-sm transition-colors cursor-pointer flex items-center justify-between gap-2 ${
                  isSelected
                    ? "bg-[#E8F4F0] font-semibold text-[#1B8366]"
                    : "font-medium text-[#52645D] hover:bg-[#F8FAF9] hover:text-[#172B25]"
                }`}
              >
                <span className="truncate">{cat.name}</span>
                <span className="text-xs text-[#718078]">{count}</span>
              </button>
            );
          })}
        </aside>

        {/* Kolom Utama: Pencarian & Daftar Diskusi */}
        <div className="flex-1 min-w-0 space-y-4">
          {/* Bilah Pencarian */}
          <div className="rounded-xl border border-[#E1E8E4] bg-[#FFFFFF] p-3">
            <div className="relative flex items-center">
              <Search className="absolute left-3.5 h-4 w-4 text-[#718078]" />
              <label htmlFor="forum-search" className="sr-only">
                Cari topik diskusi
              </label>
              <input
                id="forum-search"
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari diskusi berdasarkan judul, masalah, atau kata kunci..."
                className="w-full rounded-lg border border-[#C8D4CE] bg-[#FFFFFF] pl-10 pr-4 py-2 text-sm text-[#172B25] placeholder:text-[#718078]"
              />
            </div>
          </div>

          {/* Daftar Kartu Diskusi */}
          {displayedPosts.length === 0 ? (
            <EmptyState
              title="Belum Ada Diskusi pada Kategori Ini"
              description={
                entitlement.canWriteForum
                  ? "Jadilah anggota pertama yang membuka diskusi atau menanyakan pengalaman usaha pada topik ini."
                  : "Belum ada diskusi yang sesuai dengan filter pencarian Anda."
              }
              actionLabel={
                entitlement.canWriteForum ? "Mulai Diskusi Baru" : undefined
              }
              actionHref={entitlement.canWriteForum ? "/forum/new" : undefined}
            />
          ) : (
            <div className="space-y-4">
              {displayedPosts.map((post) => {
                const isOwner = post.author_id === currentUserId;
                return (
                  <article
                    key={post.id}
                    className="rounded-xl border border-[#E1E8E4] bg-[#FFFFFF] p-6 space-y-3"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <Badge variant="primary">
                        {post.category?.name ?? "Diskusi Bisnis"}
                      </Badge>
                      {isOwner && (
                        <div className="flex items-center gap-2">
                          <Link
                            href={`/forum/${post.id}/edit`}
                            className="rounded-md border border-[#C8D4CE] bg-[#FFFFFF] px-2.5 py-1 text-xs font-medium text-[#172B25] hover:bg-[#F8FAF9]"
                          >
                            Edit
                          </Link>
                        </div>
                      )}
                    </div>

                    <div>
                      <Link
                        href={`/forum/${post.id}`}
                        className="font-heading text-lg font-bold text-[#172B25] hover:text-[#1B8366] transition-colors"
                      >
                        {post.title}
                      </Link>
                      <p className="mt-1.5 text-sm text-[#52645D] line-clamp-2">
                        {post.content}
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-[#E1E8E4] text-xs text-[#718078]">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-[#172B25]">
                          {post.author?.full_name || "Anggota Rintis"}
                        </span>
                        <span>•</span>
                        <span>
                          {new Intl.DateTimeFormat("id-ID", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          }).format(new Date(post.created_at))}
                        </span>
                      </div>

                      <div className="flex items-center gap-4">
                        <Link
                          href={`/forum/${post.id}`}
                          className="inline-flex items-center gap-1.5 font-medium text-[#52645D] hover:text-[#172B25]"
                        >
                          <ThumbsUp className="h-3.5 w-3.5 text-[#1B8366]" />
                          <span>{post.upvotes_count} dukungan</span>
                        </Link>
                        <Link
                          href={`/forum/${post.id}`}
                          className="inline-flex items-center gap-1.5 font-medium text-[#52645D] hover:text-[#172B25]"
                        >
                          <MessageSquare className="h-3.5 w-3.5 text-[#1B8366]" />
                          <span>{post.comments_count} komentar</span>
                        </Link>
                      </div>
                    </div>
                  </article>
                );
              })}

              {filteredPosts.length > visibleCount && (
                <div className="pt-2 text-center">
                  <button
                    type="button"
                    onClick={() => setVisibleCount((prev) => prev + 10)}
                    className="rounded-lg border border-[#C8D4CE] bg-[#FFFFFF] px-4 py-2 text-xs font-semibold text-[#172B25] hover:bg-[#F8FAF9] cursor-pointer"
                  >
                    Muat Lebih Banyak Diskusi
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

