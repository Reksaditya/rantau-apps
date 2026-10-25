# Rantau — AI-Powered Business Companion Platform

> **"Temukan arah, bangun usahamu."**

**Rantau** adalah aplikasi web *full-stack* SaaS pendamping bisnis berbasis AI yang membantu anak muda dan calon entrepreneur memulai usaha dari nol, sekaligus membantu pemilik UMKM yang sudah berjalan mengatasi stagnasi penjualan melalui kombinasi **AI Business Roadmap**, **AI Business Assistant**, **Community Forum**, dan **Mentor Consultation**.

---

## Fitur Utama MVP

1. **Autentikasi & Profil Bisnis (`Supabase Auth` & `PostgreSQL`):**
   - Registrasi, login, logout, dan proteksi rute menggunakan middleware `@supabase/ssr`.
   - Trigger otomatis pembuatan `profiles` dan `subscriptions` (`Rantau Starter`).
   - Pengelolaan konteks usaha (`not_started`, `starting`, `running`).
2. **AI Business Roadmap Generator (`Google Gemini API` + `Zod`):**
   - Formulir *multi-step* adaptif sesuai kondisi bisnis.
   - Menghasilkan 12 komponen strategis + *timeline* tahapan (`stages`) dan daftar tugas (`tasks`) tervalidasi skema JSON ketat.
   - Menyimpan setiap hasil generate sebagai versi baru (`version`) tanpa menimpa roadmap lama.
3. **Visualisasi Roadmap & Manajemen Task:**
   - Komponen *vertical stepper* bernomor urut dan pemilih status tugas (`not_started`, `in_progress`, `completed`) yang menghitung ulang persentase progres di server.
4. **Sistem 3 Paket Langganan & Kuota Harian Atomik (`Starter`, `Growth`, `Max`):**
   - Penegakan *entitlement* dan kuota harian berbasis zona waktu `Asia/Jakarta (WIB)` menggunakan fungsi RPC PostgreSQL atomik `check_and_increment_quota`.
5. **AI Business Assistant Kontekstual:**
   - Tersedia untuk paket **Growth** (30 pesan/hari) dan **Max** (100 pesan/hari), dapat ditautkan langsung ke dokumen roadmap milik pengguna.
6. **Community Forum:**
   - Diskusi terkurasi dalam 5 kategori bisnis, pencarian kata kunci, komentar, *upvote*, serta proteksi kepemilikan konten (IDOR & RLS).
7. **Direktori Mentor & Booking Konsultasi 1-on-1:**
   - Direktori mentor dengan penanda `Data Demo MVP`, pemilihan slot jadwal tersedia, dan pencegahan *double booking* (`409 Conflict`) khusus pelanggan **Rantau Max**.

---

## Tech Stack

- **Framework:** Next.js (App Router) & TypeScript (`strict: true`)
- **Styling & UI:** Tailwind CSS v4, CSS Variables sesuai spesifikasi HEX eksak `DESIGN.md`, `DM Sans` Bold (700) & `Inter` (400/500/600)
- **Database & Auth:** Supabase (`@supabase/supabase-js`, `@supabase/ssr`) dengan Row Level Security (RLS) penuh di seluruh 16 tabel
- **AI Engine:** Google Gemini SDK (`@google/genai`) di sisi server
- **Validasi:** `zod`

---

## Panduan Instalasi & Konfigurasi Lokal

### 1. Pasang Dependency
```bash
npm install
```

### 2. Konfigurasi Environment Variables (`.env.local`)
Salin file `.env.example` menjadi `.env.local` dan lengkapi nilainya:
```bash
cp .env.example .env.local
```

Isi variabel berikut pada `.env.local`:
```env
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key
GEMINI_API_KEY=your-gemini-api-key
GEMINI_MODEL=gemini-2.5-flash
```

### 3. Jalankan Migrasi Database Supabase
Buka **SQL Editor** pada dashboard project Supabase Anda, lalu salin dan jalankan seluruh isi file:
- [`supabase/migrations/001_initial_schema.sql`](supabase/migrations/001_initial_schema.sql)

Skrip tersebut akan membuat 16 tabel, kebijakan RLS, trigger otomatis pengguna baru, fungsi atomik `check_and_increment_quota`, serta *seed data* kategori forum dan mentor demo (`Data Demo MVP`).

### 4. Jalankan Server Pengembangan
```bash
npm run dev
```
Buka `http://localhost:3000` di browser Anda.

---

## Perintah Verifikasi Kualitas
- Pemeriksaan Tipe TypeScript: `npx tsc --noEmit`
- Pemeriksaan Linter: `npm run lint`
- Build Produksi: `npm run build`
