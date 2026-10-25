# AGENTS.md — Panduan Kerja & Arsitektur AI Coding Agent

## Rantau — Full-Stack AI Business Companion

| Informasi | Keterangan |
| --- | --- |
| Nama proyek | Rantau |
| Tagline | Temukan arah, bangun usahamu. |
| Tujuan dokumen | Panduan arsitektur, konvensi kode, keamanan, dan alur kerja untuk AI Coding Agent |
| Stack utama | Next.js (App Router), TypeScript, Tailwind CSS, Supabase (PostgreSQL, Auth, RLS), Google Gemini API, Zod |
| Bahasa antarmuka | Bahasa Indonesia (UI & Copywriting), Bahasa Inggris (Kode, Variabel, & Skema Database) |
| Versi dokumen | 1.0 — Full-Stack MVP |

---

## 1. Project Overview & Peran Agent

Anda bertugas sebagai **Senior Full-Stack Developer, Product Designer, UI/UX Designer, dan AI Engineer** untuk membangun aplikasi web **Rantau**.

Prioritas utama Anda adalah membangun produk MVP *full-stack* yang benar-benar berfungsi, terhubung ke database PostgreSQL di Supabase, terintegrasi dengan Google Gemini API di sisi server, menerapkan pemeriksaan hak akses paket langganan (*entitlements*), serta mematuhi sistem desain pada `DESIGN.md` dan kebutuhan produk pada `PRD.md`.

Sebelum mengubah atau menambah file:
1. Periksa kondisi aktual repositori, `package.json`, dan struktur folder yang sudah ada.
2. Baca `PRD.md` untuk memahami aturan bisnis dan kriteria penerimaan.
3. Baca `DESIGN.md` untuk memastikan penggunaan kode warna HEX dan tipografi yang konsisten.

---

## 2. Tech Stack & Dependency Conventions

- **Framework Utama:** Next.js menggunakan App Router.
- **Bahasa Pemrograman:** TypeScript dengan mode `strict: true`.
- **Styling:** Tailwind CSS dan CSS Variables sesuai token HEX di `DESIGN.md`.
- **Komponen UI:** Gunakan komponen reusable di `src/components/ui/` (atau komponen berbasis Radix UI / `shadcn/ui` apabila sudah terpasang di repositori).
- **Database & Autentikasi:** Supabase (`@supabase/supabase-js` dan `@supabase/ssr`) untuk akses PostgreSQL dan manajemen sesi berbasis *cookies*.
- **Integrasi AI:** SDK resmi Google Gemini (`@google/genai`) yang hanya dijalankan di lingkungan server.
- **Validasi Skema:** `zod` untuk memvalidasi seluruh *request payload* dari client maupun *structured output* dari Gemini API.

**Aturan Dependency:**
- Periksa `package.json` sebelum memasang paket baru.
- Jangan memasang *state management library* eksternal (seperti Redux/MobX), *animation library* berat, atau *ORM* tambahan apabila Supabase client dan React hooks standar sudah mencukupi kebutuhan MVP.

---

## 3. Struktur Folder Proyek

Pertahankan struktur direktori yang bersih dan modular berikut (sesuaikan apabila repositori menggunakan root `app/` tanpa `src/`):

```text
rantau/
├── PRD.md
├── AGENTS.md
├── DESIGN.md
├── README.md
├── .env.example
├── supabase/
│   └── migrations/
│       └── 001_initial_schema.sql
├── src/
│   ├── app/
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   ├── globals.css
│   │   ├── pricing/
│   │   │   └── page.tsx
│   │   ├── (auth)/
│   │   │   ├── login/page.tsx
│   │   │   └── register/page.tsx
│   │   ├── (dashboard)/
│   │   │   ├── layout.tsx
│   │   │   ├── dashboard/page.tsx
│   │   │   ├── onboarding/page.tsx
│   │   │   ├── roadmaps/
│   │   │   │   ├── page.tsx
│   │   │   │   ├── new/page.tsx
│   │   │   │   └── [id]/page.tsx
│   │   │   ├── assistant/page.tsx
│   │   │   ├── forum/
│   │   │   │   ├── page.tsx
│   │   │   │   ├── new/page.tsx
│   │   │   │   └── [id]/page.tsx
│   │   │   ├── mentors/
│   │   │   │   ├── page.tsx
│   │   │   │   └── [id]/page.tsx
│   │   │   ├── consultations/
│   │   │   │   ├── page.tsx
│   │   │   │   └── [id]/page.tsx
│   │   │   └── settings/
│   │   │       ├── profile/page.tsx
│   │   │       └── subscription/page.tsx
│   │   └── api/
│   │       ├── roadmaps/
│   │       │   ├── generate/route.ts
│   │       │   └── tasks/[taskId]/route.ts
│   │       ├── assistant/
│   │       │   └── chat/route.ts
│   │       ├── forum/
│   │       │   └── posts/
│   │       │       ├── route.ts
│   │       │       └── [postId]/route.ts
│   │       ├── consultations/
│   │       │   └── book/route.ts
│   │       └── subscription/
│   │           └── switch-mvp/route.ts
│   ├── components/
│   │   ├── ui/
│   │   ├── layout/
│   │   ├── roadmap/
│   │   ├── assistant/
│   │   ├── forum/
│   │   └── mentors/
│   ├── lib/
│   │   ├── env.ts
│   │   ├── supabase/
│   │   │   ├── client.ts
│   │   │   ├── server.ts
│   │   │   └── middleware.ts
│   │   ├── ai/
│   │   │   ├── gemini.ts
│   │   │   └── prompts.ts
│   │   ├── subscription/
│   │   │   └── entitlements.ts
│   │   └── validations/
│   │       ├── roadmap.ts
│   │       ├── assistant.ts
│   │       ├── forum.ts
│   │       └── consultation.ts
│   └── types/
│       └── database.ts
└── package.json
```

---

## 4. Separation of Concerns & Batas Server-Client

### 4.1 Pemisahan Tanggung Jawab Modul
- **UI Components (`src/components/`):** Hanya menangani presentasi visual, *state* interaksi lokal (input form, *loading state*, dialog), dan memanggil endpoint internal. Dilarang menulis logika kuota atau kueri database sensitif di dalam komponen UI.
- **Validation Schemas (`src/lib/validations/`):** Satu-satunya sumber aturan validasi struktur data yang digunakan bersama oleh form dan API Route Handlers.
- **Subscription & Entitlements (`src/lib/subscription/`):** Menyimpan definisi paket (`starter`, `growth`, `max`), batas kuota harian, dan fungsi pengecekan izin akses fitur di server.
- **AI Module (`src/lib/ai/`):** Mengenkapsulasi konfigurasi klien Gemini, penyusunan *system prompt*, serta validasi *structured output*.

### 4.2 Server-Side vs Client-Side Boundaries
- Gunakan **React Server Components (RSC)** secara default untuk seluruh halaman (`page.tsx` dan `layout.tsx`) guna mengambil data awal secara aman di server.
- Tambahkan direktif `'use client'` **hanya** pada komponen daun (*leaf components*) yang membutuhkan interaksi browser seperti `useState`, `useEffect`, *event handler* form, atau pembaruan status *task* secara dinamis.
- Modul `src/lib/ai/gemini.ts` dan variabel `GEMINI_API_KEY` maupun `SUPABASE_SERVICE_ROLE_KEY` **tidak boleh** diimpor oleh file mana pun yang memiliki `'use client'`.

---

## 5. Konvensi Database, Supabase Auth, dan Gemini API

### 5.1 Database Access & RLS Conventions
- Gunakan `createServerSupabaseClient()` (berbasis `@supabase/ssr` dan `cookies()`) untuk seluruh operasi baca/tulis atas nama pengguna yang sedang login, sehingga kebijakan **Row Level Security (RLS)** tetap dieksekusi oleh PostgreSQL.
- Setiap tabel yang menyimpan data pengguna wajib memiliki kebijakan RLS (`SELECT`, `INSERT`, `UPDATE`, `DELETE`) yang memverifikasi `auth.uid() = user_id` (atau `author_id`).
- Gunakan fungsi RPC PostgreSQL `check_and_increment_quota` untuk memeriksa dan menambah pemakaian kuota harian secara atomik di database.

### 5.2 Supabase Authentication Conventions
- Selalu verifikasi identitas pengguna di sisi server menggunakan `const { data: { user }, error } = await supabase.auth.getUser()`.
- **Jangan pernah** menggunakan `getSession()` saja di sisi server untuk otorisasi tanpa memvalidasi token pengguna melalui `getUser()`.
- **Jangan pernah** mempercayai `userId`, `planTier`, atau `authorId` yang dikirim melalui *body* JSON atau *query params* dari browser.

### 5.3 Gemini API Integration Conventions
- Selalu gunakan `responseMimeType: "application/json"` saat membuat roadmap bisnis agar model menghasilkan struktur JSON yang konsisten.
- Validasi setiap respons teks dari Gemini menggunakan `RoadmapAIResponseSchema.parse(JSON.parse(rawText))`.
- Tangani kemungkinan kegagalan pemanggilan AI (*rate limit*, *timeout*, atau kegagalan parsing JSON) menggunakan blok `try/catch` yang mengembalikan kode status HTTP yang tepat (`429`, `502`, atau `500`) beserta pesan yang jelas kepada pengguna.

---

## 6. Konvensi API Route, Validasi, dan Keamanan

1. **Urutan Eksekusi pada Setiap Route Handler / Server Action:**
   - Langkah 1: Verifikasi autentikasi pengguna (`supabase.auth.getUser()`). Kembalikan `401 Unauthorized` jika sesi tidak valid.
   - Langkah 2: Validasi *request body* menggunakan skema Zod (`schema.safeParse(body)`). Kembalikan `400 Bad Request` beserta rincian field jika tidak valid.
   - Langkah 3: Verifikasi *entitlement* paket langganan (`subscriptions`) dan kuota harian (`usage_records`) di server. Kembalikan `403 Forbidden` (jika fitur tidak termasuk dalam paket) atau `429 Too Many Requests` (jika kuota harian habis).
   - Langkah 4: Jalankan logika bisnis utama (pemanggilan Gemini API / transaksi database).
   - Langkah 5: Kembalikan respons JSON terstruktur dengan status HTTP yang akurat.
2. **Pencegahan IDOR (Insecure Direct Object Reference):**
   - Saat mengubah status *task* (`/api/roadmaps/tasks/[taskId]`), mengedit postingan forum (`/api/forum/posts/[postId]`), atau membatalkan konsultasi, sertakan klausa `.eq('user_id', user.id)` atau `.eq('author_id', user.id)` pada kueri Supabase selain mengandalkan RLS.

---

## 7. Standar Komponen UI, Penamaan, dan TypeScript

### 7.1 UI Component & Styling Conventions
- Patuhi **100% palet warna HEX eksak** yang didefinisikan pada `DESIGN.md` (contoh: `#1B8366` untuk Primary, `#F8FAF9` untuk App Background, `#FFFFFF` untuk Surface, `#172B25` untuk Primary Text).
- Jangan menggunakan kelas warna generik Tailwind seperti `bg-green-600`, `text-gray-500`, atau `bg-slate-50`. Gunakan nilai warna eksplisit atau CSS variables yang mengacu pada kode HEX resmi Rantau.
- Setiap halaman dan komponen interaktif wajib menangani 4 kondisi tampilan: **Loading State** (Skeleton `#EEF2F0`), **Empty State**, **Error State** (`#FDECEC` / `#C62828`), dan **Success State** (`#E8F5EC` / `#18794E`).

### 7.2 Naming & TypeScript Standards
- **Komponen React:** `PascalCase` (contoh: `RoadmapTimeline.tsx`, `MentorBookingForm.tsx`).
- **Fungsi, Variabel & Hooks:** `camelCase` (contoh: `generateBusinessRoadmap`, `useQuotaStatus`).
- **Tabel & Kolom Database:** `snake_case` (contoh: `business_profiles`, `progress_percentage`).
- **TypeScript:** Hindari penggunaan tipe `any`. Gunakan tipe yang diturunkan dari skema Zod (`z.infer<typeof Schema>`) dan definisi antarmuka tabel pada `src/types/database.ts`.

---

## 8. Konfigurasi Environment Variables

Seluruh variabel environment wajib didokumentasikan pada `.env.example` tanpa menyertakan nilai kunci rahasia asli:

- `NEXT_PUBLIC_APP_URL` — URL dasar aplikasi (contoh: `http://localhost:3000`).
- `NEXT_PUBLIC_SUPABASE_URL` — URL project Supabase.
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` — Kunci publik (*anon/publishable key*) Supabase.
- `SUPABASE_SERVICE_ROLE_KEY` — Kunci khusus server untuk operasi administratif terbatas (tidak boleh diekspos ke browser).
- `GEMINI_API_KEY` — Kunci API Google Gemini (hanya diakses di server).
- `GEMINI_MODEL` — Nama model Gemini yang digunakan (default: `gemini-2.5-flash`).

Gunakan modul helper `src/lib/env.ts` untuk memeriksa keberadaan variabel wajib dan memberikan pesan error konfigurasi yang jelas apabila pengguna belum mengisi `.env.local`.

---

## 9. Larangan Keras (Anti-Patterns Rules)

1. **No Mock Implementations for Core Features:** Dilarang mengganti fitur pembuatan roadmap, perubahan status *task*, percakapan AI Assistant, forum, atau *booking* mentor dengan data statis palsu di frontend. Semua fitur inti harus terhubung ke tabel Supabase. (Data demo hanya diizinkan sebagai *seed data* awal di database untuk direktori mentor dan wajib diberi label `Data Demo MVP`).
2. **No Hardcoded User Data:** Dilarang menulis nama pengguna, paket langganan, atau sisa kuota secara *hardcoded* di komponen UI.
3. **No Fake Success States:** Jangan menampilkan pesan berhasil apabila operasi penyimpanan ke database atau pemanggilan API belum selesai dengan sukses.
4. **No Duplicated Code:** Gunakan ulang skema validasi Zod, konfigurasi `PLAN_ENTITLEMENTS`, dan komponen kartu/tombol di seluruh halaman.

---

## 10. Alur Pengujian, Verifikasi, dan Pengembangan Lanjutan

### 10.1 Alur Verifikasi Kualitas
Setelah menyelesaikan implementasi atau perubahan kode:
1. Jalankan pemeriksaan tipe TypeScript (`npm run typecheck` atau `npx tsc --noEmit`).
2. Jalankan pemeriksaan linter (`npm run lint`).
3. Jalankan proses kompilasi produksi (`npm run build`).
4. Uji alur utama secara berurutan: Autentikasi -> Buat Roadmap -> Ubah Status Task -> Cek Batas Paket & Kuota -> Chat AI Assistant -> Buat/Edit Postingan Forum -> Booking Jadwal Mentor.
5. **Prinsip Transparansi:** Jangan pernah mengklaim suatu pengujian atau *build* berhasil dijalankan apabila perintah tersebut belum benar-benar dieksekusi di lingkungan terminal. Jika pengujian terkendala karena menunggu kredensial `.env.local` dari pengguna, jelaskan secara spesifik.

### 10.2 Panduan Menambahkan Fitur Baru (Extending Existing Features)
Saat menambahkan fitur baru di masa mendatang:
1. Periksa apakah fitur tersebut memerlukan tabel atau kolom baru di `supabase/migrations/` beserta kebijakan RLS-nya.
2. Tambahkan aturan *entitlement* fitur tersebut pada `PLAN_ENTITLEMENTS` di `src/lib/subscription/entitlements.ts`.
3. Buat skema validasi input di `src/lib/validations/`.
4. Implementasikan Route Handler/Server Action dengan urutan: **Auth Check -> Input Validation -> Entitlement/Quota Check -> Database/AI Execution**.
5. Bangun antarmuka pengguna dengan mematuhi komponen dan token warna HEX pada `DESIGN.md`.