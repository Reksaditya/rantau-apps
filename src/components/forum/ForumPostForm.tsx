"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { AlertBanner } from "@/components/ui/AlertBanner";
import type { ForumCategory, ForumPost } from "@/types/database";

interface ForumPostFormProps {
  categories: ForumCategory[];
  mode: "create" | "edit";
  initialPost?: ForumPost;
}

export function ForumPostForm({
  categories,
  mode,
  initialPost,
}: ForumPostFormProps) {
  const router = useRouter();
  const [categoryId, setCategoryId] = useState(
    initialPost?.category_id ?? categories[0]?.id ?? ""
  );
  const [title, setTitle] = useState(initialPost?.title ?? "");
  const [content, setContent] = useState(initialPost?.content ?? "");
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrorMsg(null);

    if (title.trim().length < 8) {
      setErrorMsg("Judul diskusi minimal 8 karakter.");
      return;
    }
    if (content.trim().length < 20) {
      setErrorMsg("Isi diskusi minimal 20 karakter agar jelas.");
      return;
    }

    try {
      setSubmitting(true);
      const endpoint =
        mode === "edit" && initialPost
          ? `/api/forum/posts/${initialPost.id}`
          : "/api/forum/posts";
      const method = mode === "edit" ? "PATCH" : "POST";

      const res = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          category_id: categoryId,
          title: title.trim(),
          content: content.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data.error || "Gagal menyimpan diskusi.");
        setSubmitting(false);
        return;
      }

      const targetId = data.post?.id ?? initialPost?.id;
      router.push(targetId ? `/forum/${targetId}` : "/forum");
      router.refresh();
    } catch {
      setErrorMsg("Terjadi kendala jaringan saat menyimpan diskusi.");
      setSubmitting(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-xl border border-[#E1E8E4] bg-[#FFFFFF] p-6 space-y-5"
      noValidate
    >
      {errorMsg && <AlertBanner variant="error" message={errorMsg} />}

      <div>
        <label
          htmlFor="post-category"
          className="block text-sm font-medium text-[#172B25]"
        >
          Kategori Topik Diskusi
        </label>
        <select
          id="post-category"
          value={categoryId}
          onChange={(e) => setCategoryId(e.target.value)}
          className="mt-1.5 w-full rounded-lg border border-[#C8D4CE] bg-[#FFFFFF] px-3 py-2.5 text-sm text-[#172B25]"
        >
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.name} — {cat.description}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label
          htmlFor="post-title"
          className="block text-sm font-medium text-[#172B25]"
        >
          Judul Diskusi
        </label>
        <input
          id="post-title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Contoh: Cara menentukan margin keuntungan katering harian untuk mahasiswa?"
          className="mt-1.5 w-full rounded-lg border border-[#C8D4CE] bg-[#FFFFFF] px-3 py-2.5 text-sm text-[#172B25] placeholder:text-[#718078]"
        />
      </div>

      <div>
        <label
          htmlFor="post-content"
          className="block text-sm font-medium text-[#172B25]"
        >
          Uraian Masalah / Pengalaman Usaha
        </label>
        <textarea
          id="post-content"
          rows={6}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Ceritakan konteks usaha Anda, langkah yang sudah dicoba, dan pertanyaan spesifik yang ingin didiskusikan bersama komunitas..."
          className="mt-1.5 w-full rounded-lg border border-[#C8D4CE] bg-[#FFFFFF] px-3 py-2.5 text-sm text-[#172B25] placeholder:text-[#718078]"
        />
      </div>

      <div className="flex items-center justify-end gap-3 pt-2 border-t border-[#E1E8E4]">
        <Link
          href={
            mode === "edit" && initialPost
              ? `/forum/${initialPost.id}`
              : "/forum"
          }
          className="rounded-lg border border-[#C8D4CE] bg-[#FFFFFF] px-4 py-2.5 text-sm font-medium text-[#172B25] hover:bg-[#F8FAF9]"
        >
          Batal
        </Link>
        <Button type="submit" variant="primary" isLoading={submitting}>
          {mode === "edit" ? "Simpan Perubahan" : "Publikasikan Diskusi"}
        </Button>
      </div>
    </form>
  );
}

