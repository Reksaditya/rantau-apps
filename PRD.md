# Product Requirements Document (PRD)

## Rantau — AI-Powered Business Companion Platform

| Informasi | Keterangan |
| --- | --- |
| Nama proyek | Rantau |
| Tagline | Temukan arah, bangun usahamu. |
| Jenis proyek | Aplikasi web full-stack SaaS pendamping bisnis berbasis AI, komunitas, dan konsultasi mentor |
| Platform | Browser Desktop, Tablet, dan Mobile (Responsif) |
| Teknologi utama | Next.js (App Router), TypeScript, Tailwind CSS, Supabase (PostgreSQL, Auth, RLS), Google Gemini API, Zod |
| Bahasa antarmuka | Bahasa Indonesia |
| Versi dokumen | 1.0 — Full-Stack MVP |
| Status | Siap digunakan sebagai acuan implementasi MVP |

---

## 1. Product Overview & Problem Statement

### 1.1 Konsep Produk
**Rantau** adalah platform pendamping bisnis berbasis AI yang membantu anak muda dan calon entrepreneur memulai bisnis dari nol, sekaligus membantu pemilik bisnis yang sudah berjalan tetapi mengalami kesulitan dalam mendapatkan pelanggan, meningkatkan penjualan, atau mengembangkan usahanya.

**Core Value Proposition:**
> *"Ubah ide bisnis menjadi langkah nyata, dari perencanaan hingga pengembangan."*

Rantau bukan sekadar generator ide bisnis. Platform ini dirancang untuk membantu pengguna memahami **apa** yang perlu dilakukan, **mengapa** langkah tersebut penting, dan **bagaimana** memulainya secara bertahap melalui kombinasi roadmap bisnis terstruktur, asisten AI kontekstual, forum diskusi komunitas, dan konsultasi bersama mentor.

### 1.2 Pernyataan Masalah (Problem Statement)
1. **Kebingungan Memulai dari Nol:** Banyak calon entrepreneur memiliki ide bisnis, namun tidak mengetahui langkah konkret pertama yang harus diambil terkait validasi pasar, perhitungan modal awal, operasional dasar, dan akuisisi pelanggan pertama.
2. **Stagnasi pada Usaha yang Sudah Berjalan:** Pemilik UMKM yang sudah menjalankan usaha sering kali mengalami stagnasi penjualan atau kesulitan menjangkau pelanggan baru, tetapi tidak memiliki kerangka evaluasi untuk mendiagnosis akar masalah bisnisnya.
3. **Rekomendasi AI Generik yang Sulit Dieksekusi:** Alat berbasis AI konvensional umumnya hanya menghasilkan paragraf teks panjang tanpa struktur tahapan kerja, tanpa pelacakan progres tugas (*task tracking*), dan tanpa ekosistem diskusi lanjutan bersama praktisi atau komunitas.

### 1.3 Prinsip Produk (Product Principles)
- **Actionable:** Setiap rekomendasi AI wajib diterjemahkan menjadi tindakan konkret (*action items* / *tasks*).
- **Beginner-friendly:** Mudah digunakan oleh pengguna tanpa latar belakang pendidikan atau pengalaman bisnis.
- **Structured:** Hasil AI tersusun sistematis dalam tahapan (*stages*) dan daftar tugas (*tasks*), bukan sekadar blok teks panjang.
- **Realistic:** Rekomendasi mempertimbangkan estimasi modal, lokasi operasional, target pasar, dan keterbatasan pengguna.
- **Progressive:** Pengguna dapat berkembang secara bertahap dari fase eksplorasi ide hingga implementasi dan pengembangan usaha.
- **Trustworthy:** AI tidak mengarang data pasar fiktif dan tidak menjanjikan kepastian kesuksesan finansial.

---

## 2. Target Users & User Personas

### 2.1 Kelompok Target Pengguna
1. Calon entrepreneur yang belum memiliki bisnis dan membutuhkan panduan langkah demi langkah untuk memulai usaha.
2. Anak muda yang memiliki ide bisnis tetapi belum memahami validasi pasar, pengelolaan modal, pemasaran, atau operasional.
3. Pemilik UMKM yang ingin meningkatkan penjualan, menjangkau pelanggan baru, atau memperbaiki strategi bisnis yang stagnan.
4. Entrepreneur pemula yang membutuhkan kombinasi bimbingan instan dari AI maupun arahan langsung dari mentor manusia.

### 2.2 User Personas

| Persona | Profil & Latar Belakang | Tujuan (Goals) | Kendala Utama (Pain Points) | Paket yang Sesuai |
| --- | --- | --- | --- | --- |
| **Raka (21 Tahun, Mahasiswa / Calon Entrepreneur)** | Ingin memulai usaha kuliner/minuman dengan modal tabungan terbatas, belum pernah berbisnis sebelumnya. | Memvalidasi apakah idenya layak dijual dan mengetahui rincian langkah persiapan hingga peluncuran. | Bingung cara menghitung modal awal, takut rugi di awal, dan tidak tahu cara mencari 10 pembeli pertama. | **Rantau Starter** / **Rantau Growth** |
| **Nadya (25 Tahun, Pekerja Muda / Perintis Brand)** | Sedang merintis usaha produk kreatif secara sampingan selama 3 bulan terakhir. | Menyusun strategi promosi yang konsisten dan menanyakan kendala harga jual ke asisten AI kapan saja. | Penjualan masih mengandalkan teman dekat, bingung menyusun prioritas kerja mingguan dan strategi konten. | **Rantau Growth** |
| **Hendra (32 Tahun, Pemilik UMKM Berjalan)** | Memiliki usaha jasa/retail lokal yang sudah berjalan lebih dari 1 tahun dengan 2 staf. | Mengatasi omzet yang stagnan, memperbaiki retensi pelanggan, dan berkonsultasi langsung dengan mentor. | Sulit mendiagnosis mengapa pelanggan jarang membeli ulang dan butuh teman diskusi berpengalaman. | **Rantau Max** |

---

## 3. Goals, Non-Goals, dan MVP Scope

### 3.1 Goals (Tujuan Utama MVP)
1. Menyediakan alur autentikasi dan penyimpanan profil bisnis pengguna secara aman menggunakan Supabase Auth dan PostgreSQL.
2. Menghasilkan **AI Business Roadmap** yang adaptif (menyesuaikan kondisi bisnis: *belum dimulai*, *sedang dirintis*, atau *sudah berjalan*) menggunakan Google Gemini API dengan validasi skema JSON ketat.
3. Menyediakan visualisasi roadmap dalam bentuk tahapan (*stepper/timeline*) dan manajemen status *task* yang menyimpan persentase progres ke database.
4. Menerapkan sistem tiga paket langganan (**Rantau Starter**, **Rantau Growth**, **Rantau Max**) dengan pembatasan hak akses (*entitlement*) dan kuota harian di sisi server.
5. Menyediakan **AI Business Assistant** yang terhubung dengan konteks roadmap pengguna beserta penyimpanan riwayat percakapan.
6. Menyediakan **Community Forum** untuk berdiskusi berdasarkan kategori bisnis dengan proteksi kepemilikan konten.
7. Menyediakan fitur **Mentor Consultation** untuk melihat direktori mentor dan memesan jadwal sesi 1-on-1 dengan pencegahan *double booking*.

### 3.2 Non-Goals (Di Luar Ruang Lingkup MVP / Future Scope)
- **Payment Gateway Otomatis (Future Scope):** MVP tidak mengintegrasikan pembayaran kartu kredit/e-wallet otomatis. Aktivasi paket dikelola melalui mekanisme server-side MVP yang aman.
- **Built-in Video Call & Kalender Eksternal (Future Scope):** MVP tidak menyediakan ruang panggilan video di dalam browser atau sinkronisasi dua arah otomatis ke Google Calendar/Zoom API.
- **Real-time Chat Antar Pengguna & Gamifikasi Forum (Future Scope):** Forum fokus pada diskusi terstruktur (postingan, komentar, *upvote*, kategori) tanpa *direct message* *real-time* atau sistem lencana reputasi kompleks.
- **Integrasi Pembukuan Akuntansi / POS (Future Scope):** Rantau fokus pada perencanaan strategis, pemasaran, operasional dasar, dan pendampingan eksekusi.

---

## 4. User Stories & Acceptance Criteria

| ID | User Story | Kriteria Penerimaan (Acceptance Criteria) |
| --- | --- | --- |
| **US-01** | Sebagai pengunjung, saya ingin memahami manfaat Rantau dan perbedaan paket langganannya sebelum mendaftar. | 1. Landing page menampilkan masalah, solusi, cara kerja, fitur utama, dan paket langganan.<br>2. Halaman `/pricing` menampilkan perbandingan jelas antara Starter, Growth, dan Max beserta keterangan harga placeholder MVP. |
| **US-02** | Sebagai pengguna baru, saya ingin membuat akun, masuk, dan mengisi profil kondisi bisnis saya. | 1. Registrasi dan login via Supabase Auth berhasil membuat sesi serta profil default (`starter`).<br>2. Pengguna dapat menyimpan dan memperbarui data profil bisnis di database. |
| **US-03** | Sebagai entrepreneur, saya ingin memasukkan ide atau kondisi usaha saya agar AI membuatkan roadmap bisnis yang terstruktur. | 1. Form input menyesuaikan pertanyaan dengan tahap bisnis (`not_started`, `starting`, `running`).<br>2. Server memeriksa sisa kuota harian sebelum memanggil Gemini API.<br>3. Output AI tervalidasi mencakup 12 komponen wajib dan disimpan sebagai versi roadmap baru tanpa menimpa roadmap lama. |
| **US-04** | Sebagai pengguna, saya ingin menandai status setiap tugas pada roadmap agar saya mengetahui progres eksekusi bisnis saya. | 1. Pengguna dapat mengubah status task menjadi `not_started`, `in_progress`, atau `completed`.<br>2. Persentase progres roadmap dihitung ulang di server dan disimpan ke database. |
| **US-05** | Sebagai pengguna Growth/Max, saya ingin berdiskusi dengan AI Business Assistant yang memahami roadmap bisnis saya. | 1. Pengguna Starter melihat informasi *upgrade* saat mengakses halaman Assistant.<br>2. Pengguna Growth/Max dapat memilih roadmap sebagai konteks, mengirim pertanyaan, melihat riwayat pesan, dan kuota hariannya tercatat di database. |
| **US-06** | Sebagai anggota komunitas, saya ingin membaca, mencari, membuat, serta mengomentari diskusi bisnis di forum. | 1. Daftar diskusi dapat difilter berdasarkan kategori dan kata kunci pencarian.<br>2. Pengguna hanya dapat mengedit atau menghapus postingan/komentar miliknya sendiri (ditegakkan di server dan RLS). |
| **US-07** | Sebagai pengguna Rantau Max, saya ingin memilih mentor dan memesan jadwal konsultasi 1-on-1 yang tersedia. | 1. Direktori mentor menampilkan keahlian, pengalaman, durasi sesi, dan label jelas apabila merupakan data demo.<br>2. Hanya pengguna Max yang dapat melakukan *booking*.<br>3. Server dan database menolak *double booking* pada slot jadwal yang sama. |

---

## 5. Kebutuhan Fungsional (Functional Requirements)

### FR-01 — Autentikasi & Manajemen Profil
- Mendukung registrasi dengan nama lengkap, email, dan kata sandi melalui Supabase Auth.
- Saat pengguna baru terdaftar, sistem otomatis membuat baris pada tabel `profiles` dan `subscriptions` dengan paket default `starter` (`active`).
- Mendukung login, logout, dan proteksi rute aplikasi menggunakan *middleware* sesi Supabase.

### FR-02 — Onboarding & Profil Bisnis (`business_profiles`)
- Pengguna dapat mengisi dan memperbarui informasi bisnis: nama/ide bisnis, kondisi bisnis (`not_started`, `starting`, `running`), kategori industri, deskripsi produk/jasa, target pelanggan, lokasi operasional, estimasi modal, tujuan bisnis, kendala utama, dan pengalaman bisnis sebelumnya.
- Setiap field menyediakan teks panduan/contoh pengisian agar ramah bagi pemula.

### FR-03 — AI Business Roadmap Generator
- Menggunakan formulir bertahap (*multi-step form*) yang adaptif terhadap kondisi bisnis pengguna.
- Menghasilkan 12 bagian analisis terstruktur:
  1. Ringkasan dan pemahaman bisnis.
  2. Analisis awal masalah dan peluang.
  3. Target pasar dan calon pelanggan.
  4. Validasi ide (untuk bisnis baru) atau evaluasi bisnis (untuk usaha berjalan).
  5. *Value proposition* dan diferensiasi.
  6. Model bisnis dan sumber pendapatan.
  7. Estimasi kebutuhan modal dan biaya awal.
  8. Strategi pemasaran dan akuisisi pelanggan.
  9. Rencana operasional.
  10. *Timeline* implementasi (terdiri atas tahapan/stages dan *tasks*).
  11. Risiko dan mitigasi.
  12. Prioritas tindakan selanjutnya.
- Menyertakan *disclaimer* eksplisit bahwa estimasi pasar, biaya, dan pendapatan merupakan perkiraan awal yang belum diverifikasi dengan data eksternal.
- Menyimpan setiap hasil generate sebagai roadmap baru dengan nomor versi (`version`) yang bertambah, sehingga riwayat roadmap lama tetap tersimpan utuh.

### FR-04 — Visualisasi Roadmap & Manajemen Task
- Menampilkan tahapan roadmap dalam komponen *stepper/timeline* yang memuat judul tahap, tujuan, deskripsi singkat, daftar *task*, prioritas (`low`, `medium`, `high`), estimasi durasi, *expected output*, indikator keberhasilan, dan dependensi.
- Pengguna dapat mengubah status setiap *task* (`not_started`, `in_progress`, `completed`) dan melihat pembaruan bilah progres (*progress bar*) secara langsung.

### FR-05 — Sistem Langganan & Kuota Harian
- Menyediakan halaman informasi paket (`/pricing`) dan halaman pengelolaan langganan di dalam aplikasi (`/settings/subscription`).
- Memeriksa hak akses fitur (*entitlement*) dan sisa kuota harian di sisi server sebelum mengeksekusi permintaan AI atau pemesanan mentor.
- Menyediakan mekanisme perubahan paket MVP yang divalidasi di sisi server (dengan keterangan transparan bahwa pembayaran online belum diaktifkan pada tahap MVP).

### FR-06 — AI Business Assistant
- Tersedia khusus untuk paket **Rantau Growth** dan **Rantau Max**.
- Mendukung penautan percakapan ke salah satu roadmap milik pengguna agar jawaban AI relevan dengan tahap bisnis, modal, dan kendala pengguna.
- Menyimpan daftar sesi percakapan (`ai_conversations`) dan riwayat pesan (`ai_messages`) di database.
- Menyediakan indikator *loading*, *error state*, dan tombol *retry* apabila pemanggilan AI mengalami kendala.

### FR-07 — Community Forum
- Menampilkan daftar diskusi dengan filter kategori (*Ide Bisnis & Validasi*, *Pemasaran & Penjualan*, *Modal & Keuangan*, *Operasional & Tim*, *Pengembangan Usaha*), kolom pencarian kata kunci, dan *pagination*/pemuatan bertahap.
- Mendukung pembuatan postingan, detail postingan, penambahan komentar, pemberian *upvote*, serta pengeditan dan penghapusan konten milik sendiri.

### FR-08 — Direktori Mentor & Booking Konsultasi
- Menampilkan direktori mentor beserta foto/inisial, bidang keahlian, ringkasan pengalaman, bahasa konsultasi, durasi sesi, dan daftar slot jadwal yang tersedia.
- Memberikan badge penanda yang jelas (`Data Demo MVP`) pada profil mentor simulasi.
- Mengizinkan pengguna **Rantau Max** memesan jadwal yang tersedia, melihat daftar *booking* miliknya (`/consultations`), serta memperbarui status *booking* (`completed` atau `cancelled`) sesuai aturan.

---

## 6. Kebutuhan Non-Fungsional (Non-Functional Requirements)

- **Keamanan (Security):** Seluruh pemanggilan Gemini API dilakukan dari server. Kunci rahasia tidak pernah dikirim ke browser. Row Level Security (RLS) aktif pada seluruh tabel Supabase.
- **Keandalan Validasi AI (Reliability):** Output Gemini wajib divalidasi dengan skema Zod. Jika format JSON tidak sesuai atau terjadi *timeout*, server mengembalikan pesan error yang aman tanpa menyimpan data korup ke database.
- **Responsivitas & Aksesibilitas:** Antarmuka berfungsi dengan rapi pada viewport mobile (`375px`), tablet (`768px`), dan desktop (`1280px+`), memiliki kontras warna yang memadai sesuai spesifikasi HEX, serta mendukung navigasi keyboard (`focus-visible`).
- **Performa:** Menggunakan pemuatan font teroptimasi melalui `next/font/google` (`DM Sans` dan `Inter`) serta indeks database pada kolom kunci pencarian dan filter.

---

## 7. Arsitektur Informasi & Daftar Halaman

### 7.1 Halaman Publik (Public Pages)
1. `/` — **Landing Page:** Hero, masalah yang diselesaikan, cara kerja 4 langkah, sorotan fitur utama, ringkasan paket langganan, dan CTA.
2. `/pricing` — **Pricing Page:** Tabel dan kartu perbandingan detail paket Rantau Starter, Growth, dan Max beserta FAQ singkat.
3. `/login` — **Login Page:** Formulir masuk dengan email & kata sandi.
4. `/register` — **Register Page:** Formulir pendaftaran akun baru.

### 7.2 Halaman Aplikasi Terautentikasi (Authenticated Pages)
1. `/dashboard` — **Dashboard Utama:** Ringkasan profil bisnis, progres roadmap terakhir, sisa kuota AI hari ini, diskusi forum terbaru, dan jadwal konsultasi mendatang.
2. `/onboarding` — **Onboarding / Profil Bisnis:** Formulir pengisian konteks bisnis awal setelah registrasi.
3. `/roadmaps` — **Daftar Roadmap:** Katalog seluruh roadmap yang pernah dibuat pengguna beserta indikator progres dan versi.
4. `/roadmaps/new` — **Create Roadmap:** Formulir bertahap pembuatan roadmap bisnis berbasis AI.
5. `/roadmaps/[id]` — **Detail Roadmap & Task Management:** Tampilan lengkap 12 komponen strategis, visualisasi *stepper* tahapan, dan pengelolaan status tugas.
6. `/assistant` — **AI Business Assistant:** Ruang percakapan AI dengan pemilih konteks roadmap dan daftar riwayat diskusi di panel samping.
7. `/forum` — **Community Forum:** Daftar diskusi komunitas, filter kategori, pencarian, dan tombol buat postingan.
8. `/forum/new` & `/forum/[id]/edit` — **Buat / Edit Diskusi:** Formulir pembuatan dan pembaruan topik diskusi.
9. `/forum/[id]` — **Detail Diskusi:** Isi lengkap postingan, tombol *upvote*, dan daftar komentar.
10. `/mentors` — **Direktori Mentor:** Daftar mentor berdasarkan keahlian.
11. `/mentors/[id]` — **Profil Mentor & Pemilihan Slot:** Detail pengalaman mentor dan formulir pemesanan slot jadwal.
12. `/consultations` & `/consultations/[id]` — **Konsultasi Saya:** Daftar riwayat *booking* konsultasi dan halaman detail sesi/catatan.
13. `/settings/subscription` — **Langganan & Kuota:** Informasi paket aktif, bar pemakaian kuota harian, dan pengelolaan upgrade paket MVP.
14. `/settings/profile` — **Pengaturan Akun & Usaha:** Pembaruan nama pengguna dan profil bisnis.

---

## 8. User Journeys & Alur Autentikasi

### 8.1 Alur Autentikasi & Onboarding
1. Pengunjung membuka `/register` dan mendaftarkan akun.
2. Trigger database otomatis membuat entri `profiles` dan `subscriptions` (`starter`).
3. Pengguna diarahkan ke `/onboarding` untuk melengkapi konteks bisnis awal (atau dapat langsung menuju `/roadmaps/new`).
4. Middleware Next.js memeriksa sesi pada setiap rute terproteksi; jika belum masuk, pengguna diarahkan ke `/login`.

### 8.2 Alur Utama Pengguna Baru (Dari Ide ke Eksekusi Roadmap)
1. Pengguna masuk ke `/dashboard` lalu menekan tombol **Buat Roadmap Baru** (`/roadmaps/new`).
2. Pengguna memilih kondisi usaha (misalnya: *Belum dimulai*), mengisi ide, modal, lokasi, dan target pelanggan, lalu menekan **Generate Roadmap**.
3. Server memvalidasi kuota harian, memanggil Gemini API, memvalidasi skema JSON, dan menyimpan data ke database.
4. Pengguna diarahkan ke `/roadmaps/[id]`, membaca analisis 12 poin, dan mulai mencentang *task* pada Tahap 1 seiring berjalannya eksekusi usaha.

---

## 9. Aturan Bisnis, Paket Langganan, Kuota & Entitlement

### 9.1 Matriks Entitlement Paket Langganan

| Atribut / Hak Akses | Rantau Starter (`starter`) | Rantau Growth (`growth`) | Rantau Max (`max`) |
| --- | --- | --- | --- |
| **Target Pengguna** | Eksplorasi ide bisnis awal | Perencanaan & pengembangan usaha mendalam | Pendampingan bisnis komprehensif bersama AI & Mentor |
| **Harga (Placeholder MVP)** | Rp0 / bulan | Rp99.000 / bulan *(Placeholder)* | Rp299.000 / bulan *(Placeholder)* |
| **Kuota Generate Roadmap Harian** | 2x per hari | 10x per hari | 25x per hari |
| **Cakupan Tampilan Tahap Roadmap** | Ringkasan + 3 tahap awal terbuka penuh (tahap lanjutan terkunci) | Seluruh tahapan & 12 komponen terbuka penuh | Seluruh tahapan & 12 komponen terbuka penuh |
| **Penyimpanan & Manajemen Task** | Tersedia | Tersedia | Tersedia |
| **Akses AI Business Assistant** | Tidak tersedia | Tersedia | Tersedia |
| **Kuota Pesan AI Assistant Harian** | 0 pesan / hari | 30 pesan / hari | 100 pesan / hari |
| **Akses Community Forum** | Baca diskusi (*Read-only*) | Baca, buat postingan, komentar, & *upvote* | Baca, buat postingan, komentar, & *upvote* |
| **Booking Konsultasi Mentor 1-on-1** | Tidak tersedia | Tidak tersedia | Tersedia (akses penuh booking slot tersedia) |

### 9.2 Aturan Perhitungan & Reset Kuota Harian
- Kuota dihitung berdasarkan tanggal hari berjalan pada zona waktu **Asia/Jakarta (WIB)** menggunakan kolom `usage_date` di tabel `usage_records`.
- Kuota otomatis ter-reset setiap pergantian hari (`00:00 WIB`) karena pencatatan menggunakan kunci komposit unik `(user_id, feature_key, usage_date)`.
- Pemeriksaan dan penambahan jumlah pemakaian (`used_count`) dilakukan di dalam satu fungsi transaksi PostgreSQL atomik (`FOR UPDATE` row lock) agar pengguna tidak dapat melewati batas kuota dengan mengirimkan beberapa permintaan secara bersamaan (*concurrent requests*).

---

## 10. Spesifikasi Alur Kerja Fitur Inti (Core Workflows)

### 10.1 AI Roadmap Generation Workflow
1. **Input Adaptif:** Jika pengguna memilih `not_started`, form menekankan pada ide produk, estimasi modal awal, dan target pasar yang ingin dicoba. Jika memilih `running`, form menekankan pada omzet/kondisi saat ini, produk utama, dan kendala stagnasi yang dihadapi.
2. **Validasi Server & Kuota:** Route Handler memvalidasi input dengan Zod dan memanggil RPC `check_and_increment_quota`.
3. **Pemanggilan Gemini Terstruktur:** Server mengirimkan *system instruction* adaptif ke Gemini API dengan `responseMimeType: "application/json"`.
4. **Penyimpanan Transaksional:** Setelah lolos validasi `RoadmapAIResponseSchema`, server menyimpan dokumen ke tabel `roadmaps`, mengiterasi penyimpanan tahapan ke `roadmap_stages`, dan menyimpan setiap *action item* ke `roadmap_tasks`.

### 10.2 AI Assistant Workflow
1. Pengguna memilih percakapan yang ada atau memulai percakapan baru (opsional memilih salah satu roadmap miliknya sebagai konteks).
2. Server memeriksa bahwa `plan_tier` pengguna adalah `growth` atau `max` serta memeriksa sisa kuota `ai_assistant_message`.
3. Server mengambil ringkasan roadmap yang ditautkan dan 10 pesan terakhir dari `ai_messages`, lalu meminta respons kontekstual dari Gemini API.
4. Pesan pengguna dan balasan asisten disimpan secara persisten ke database dan dikembalikan ke antarmuka pengguna.

### 10.3 Forum & Mentor Consultation Workflow
- **Forum:** Pengguna terautentikasi mengambil daftar postingan berdasarkan kategori/pencarian. Operasi pembuatan postingan/komentar divalidasi panjang karakternya di server. Operasi edit dan hapus memeriksa kecocokan `author_id === user.id`.
- **Mentor Consultation:** Pengguna memilih mentor di `/mentors/[id]`, memilih slot jadwal dari `mentor_availability` yang memiliki `is_booked = false` dan waktu `slot_start` di masa depan. Server memverifikasi paket `max`, menyimpan baris ke `consultation_bookings`, dan memperbarui `is_booked = true`. Jika terjadi tabrakan permintaan pada milidetik yang sama, constraint *unique index* database akan menolak permintaan kedua dengan status HTTP `409 Conflict`.

---

## 11. Entitas Database & Hubungan Antardata

Database PostgreSQL di Supabase terdiri atas 16 tabel terintegrasi:
1. `profiles` — Profil pengguna yang berelasi `1:1` dengan `auth.users`.
2. `business_profiles` — Data konteks usaha pengguna (`1:1` dengan `profiles`).
3. `subscriptions` — Status paket aktif pengguna (`starter`, `growth`, `max`) (`1:1` dengan `profiles`).
4. `usage_records` — Pencatatan konsumsi kuota harian per fitur (`N:1` dengan `profiles`).
5. `roadmaps` — Dokumen utama hasil generate AI beserta 12 komponen strategis (`N:1` dengan `profiles`).
6. `roadmap_stages` — Tahapan implementasi di dalam sebuah roadmap (`N:1` dengan `roadmaps`).
7. `roadmap_tasks` — Daftar tugas/tindakan konkret di dalam setiap tahap (`N:1` dengan `roadmap_stages` dan `roadmaps`).
8. `ai_conversations` — Sesi ruang diskusi AI Assistant (`N:1` dengan `profiles`, opsional `N:1` dengan `roadmaps`).
9. `ai_messages` — Butir pesan pengguna dan balasan AI di dalam percakapan (`N:1` dengan `ai_conversations`).
10. `forum_categories` — Master kategori diskusi komunitas.
11. `forum_posts` — Topik diskusi yang dibuat pengguna (`N:1` dengan `profiles` dan `forum_categories`).
12. `forum_comments` — Balasan/komentar pada diskusi (`N:1` dengan `forum_posts` dan `profiles`).
13. `forum_votes` — Catatan *upvote* pengguna pada diskusi dengan constraint `UNIQUE(post_id, user_id)`.
14. `mentors` — Profil mentor beserta keahlian dan penanda `is_demo_data`.
15. `mentor_availability` — Slot jadwal ketersediaan mentor (`N:1` dengan `mentors`).
16. `consultation_bookings` — Data pemesanan jadwal konsultasi oleh pengguna paket Max (`N:1` dengan `profiles`, `mentors`, dan `mentor_availability`).

---

## 12. Keamanan, Privasi, dan State Antarmuka (UI States)

### 12.1 Keamanan & Privasi
- Tidak ada *API key* atau *service role key* yang terekspos ke bundle browser.
- Seluruh input teks bebas dibersihkan dan dibatasi ukurannya menggunakan Zod.
- Pesan error ke client disusun ramah pengguna dalam Bahasa Indonesia tanpa membocorkan *stack trace* internal atau struktur SQL.

### 12.2 Loading, Empty, Success, dan Error States
- **Loading State:** Menggunakan *skeleton loader* saat memuat daftar roadmap, diskusi forum, dan riwayat percakapan, serta indikator *spinner* dan penjelasan tahapan saat Gemini sedang menyusun roadmap.
- **Empty State:** Setiap halaman daftar (Roadmap, Assistant, Forum, Konsultasi) wajib menampilkan komponen *empty state* yang menjelaskan langkah pertama beserta tombol CTA apabila data masih kosong.
- **Success State:** Menampilkan notifikasi *toast* atau *banner* sukses berwarna `#18794E` di atas latar `#E8F5EC` hanya setelah penyimpanan database dikonfirmasi oleh server.
- **Error State:** Menampilkan pesan yang jelas berwarna `#C62828` di atas latar `#FDECEC` disertai tombol **Coba Lagi** (*Retry*) jika terjadi kegagalan jaringan atau batas kuota terlampaui.

---

## 13. Metrik Keberhasilan MVP, Pengujian & Definition of Done

### 13.1 MVP Success Metrics
1. **Tingkat Penyelesaian Pembuatan Roadmap:** Pengguna berhasil menyelesaikan formulir multi-step dan menerima roadmap terstruktur dalam waktu kurang dari 30 detik.
2. **Akurasi Penegakan Entitlement & Kuota:** $100\%$ permintaan yang melebihi batas kuota harian atau di luar hak akses paket ditolak secara konsisten oleh server.
3. **Kestabilan Persistensi Data:** Seluruh perubahan status *task*, riwayat chat AI, postingan forum, dan *booking* konsultasi tersimpan permanen di Supabase tanpa bergantung pada `localStorage`.

### 13.2 Definition of Done (DoD)
- [ ] Dokumen `PRD.md`, `AGENTS.md`, dan `DESIGN.md` tersedia lengkap dan selaras dengan implementasi kode.
- [ ] Seluruh halaman menggunakan sistem warna HEX eksak dan tipografi `DM Sans` Bold serta `Inter`.
- [ ] Registrasi, login, logout, dan pengisian profil bisnis berfungsi dengan Supabase.
- [ ] AI Business Roadmap Generator berhasil menghasilkan 12 komponen strategis, menyimpannya ke database, dan mendukung manajemen status *task* beserta kalkulasi progres.
- [ ] Paket Starter, Growth, dan Max memiliki *entitlement* dan kuota harian yang ditegakkan di sisi server.
- [ ] AI Business Assistant berfungsi untuk paket Growth/Max dan menyimpan riwayat percakapan.
- [ ] Community Forum mendukung pembuatan diskusi, komentar, filter kategori, dan proteksi kepemilikan konten.
- [ ] Mentor Consultation mendukung direktori mentor, penandaan data demo, dan *booking* jadwal bagi pengguna Max tanpa *double booking*.
- [ ] Supabase RLS aktif di seluruh tabel dan konfigurasi `.env.example` serta `README.md` terdokumentasi dengan jelas.