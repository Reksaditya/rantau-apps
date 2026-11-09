# DESIGN.md — Design System & Panduan UI/UX Rintis

## Rintis — Temukan arah, bangun usahamu.

| Informasi | Keterangan |
| --- | --- |
| Nama produk | Rintis |
| Karakter visual | Simple, minimal, modern, clean, professional SaaS |
| Heading Font | DM Sans (Bold / 700) |
| Body & UI Font | Inter (Regular 400, Medium 500, SemiBold 600) |
| Bahasa antarmuka | Bahasa Indonesia yang ringkas, terarah, dan mudah dipahami |
| Versi dokumen | 1.0 — Full-Stack MVP |

---

## 1. Brand Identity & Design Principles

### 1.1 Kepribadian Merek (Brand Personality)
Rintis hadir sebagai pendamping bisnis yang:
- **Mendukung Entrepreneur Pemula:** Ramah dan memandu langkah demi langkah tanpa istilah teknis yang mengintimidasi.
- **Profesional namun Tidak Kaku:** Tata letak bersih layaknya produk produktivitas SaaS modern, namun tetap hangat dan relevan bagi pelaku UMKM maupun anak muda.
- **Optimistis dan Jujur:** Memberikan semangat membangun usaha tanpa menjanjikan kesuksesan instan yang berlebihan.
- **Praktis dan Terarah:** Mengutamakan kejelasan daftar tindakan (*action items*) dan indikator progres.

### 1.2 Prinsip Desain Utama
1. **Action-Oriented Clarity:** Pengguna harus langsung memahami tindakan apa yang perlu dilakukan selanjutnya pada setiap layar.
2. **Generous White Space:** Hindari menumpuk terlalu banyak kartu atau grafik dekoratif dalam satu layar; berikan ruang kosong yang cukup agar informasi strategis mudah dipindai (*scannable*).
3. **Strict HEX Color Consistency:** Seluruh halaman dan komponen wajib menggunakan nilai warna HEX eksak yang ditetapkan pada dokumen ini tanpa menambahkan gradien acak atau warna di luar palet.
4. **Distinct Layout per Context:** Jangan membuat semua halaman terlihat seperti dashboard admin. *Landing page*, *Pricing*, *Forum*, dan *Mentor Directory* harus memiliki komposisi tata letak yang sesuai dengan fungsi masing-masing.

---

## 2. Color Palette (Exact HEX Values Only)

Seluruh spesifikasi warna dalam kode CSS maupun kelas Tailwind wajib mengacu pada nilai HEX eksplisit di bawah ini:

### 2.1 Brand & Primary Palette
| Nama Token | Nilai HEX | Aturan Penggunaan |
| --- | --- | --- |
| `primary` | `#1B8366` | Tombol CTA utama, status navigasi aktif, bilah progres roadmap, indikator tahap aktif, dan state terpilih |
| `primary-hover` | `#166B53` | State `:hover` pada tombol utama dan elemen interaktif primer |
| `primary-active` | `#125642` | State `:active` (saat ditekan) pada tombol utama |
| `primary-subtle` | `#E8F4F0` | Latar belakang lembut untuk item navigasi aktif, badge utama, latar track progress bar, dan highlight kartu |
| `primary-border` | `#B7DCCF` | Garis tepi pada callout informasi paket, badge primer, atau kartu yang sedang dipilih |
| `primary-foreground` | `#FFFFFF` | Warna teks dan ikon di atas latar `#1B8366`, `#166B53`, dan `#125642` |

### 2.2 Base Surfaces & Text
| Nama Token | Nilai HEX | Aturan Penggunaan |
| --- | --- | --- |
| `app-background` | `#F8FAF9` | Latar belakang utama aplikasi dan halaman |
| `surface` | `#FFFFFF` | Latar belakang kartu (*cards*), panel konten utama, sidebar, dan topbar |
| `elevated-surface` | `#FFFFFF` | Latar belakang dialog modal, menu dropdown, dan popover |
| `text-primary` | `#172B25` | Seluruh judul (`h1`–`h4`), nama tugas, label form, dan teks isi utama |
| `text-secondary` | `#52645D` | Subjudul, paragraf deskripsi penjelasan, dan teks sekunder |
| `text-muted` | `#718078` | Metadata, *timestamp*, keterangan kuota kecil, dan *placeholder* input |
| `border` | `#E1E8E4` | Garis batas standar untuk kartu, pemisah seksi, header, dan baris daftar |
| `border-strong` | `#C8D4CE` | Garis batas untuk kontrol input form, tombol sekunder, dan kartu yang membutuhkan penekanan batas |
| `disabled-bg` | `#EEF2F0` | Latar belakang tombol dinonaktifkan (*disabled*) dan elemen *skeleton loading* |
| `disabled-text` | `#98A59E` | Warna teks dan ikon pada kontrol yang dinonaktifkan |

### 2.3 Semantic Colors & Overlay
| Nama Token | Nilai HEX | Aturan Penggunaan |
| --- | --- | --- |
| `success` | `#18794E` | Teks dan ikon untuk status selesai (`completed`), *booking* terkonfirmasi, dan notifikasi berhasil |
| `success-bg` | `#E8F5EC` | Latar belakang badge/banner sukses dan status `completed` |
| `warning` | `#9A6700` | Teks dan ikon untuk peringatan kuota hampir habis, prioritas `medium`, dan status `pending` |
| `warning-bg` | `#FFF4D6` | Latar belakang badge/banner peringatan |
| `error` | `#C62828` | Teks dan ikon untuk pesan validasi gagal, error API, prioritas `high`, dan aksi hapus |
| `error-bg` | `#FDECEC` | Latar belakang banner error dan tombol hapus sekunder |
| `info` | `#175CD3` | Teks dan ikon untuk status `in_progress`, prioritas `low`, dan petunjuk pengisian form |
| `info-bg` | `#EAF2FF` | Latar belakang badge informasi dan status `in_progress` |
| `modal-overlay` | `#172B2566` | Overlay latar belakang modal (`#172B25` dengan opasitas $40\%$, atau `rgba(23, 43, 37, 0.4)`) |

---

## 3. Tipografi (Typography)

### 3.1 Pasangan Font
- **Heading Font:** **DM Sans** dengan ketebalan **Bold (`700`)** untuk seluruh elemen judul (`h1`, `h2`, `h3`, `h4`) dan angka metrik utama.
- **Body & UI Font:** **Inter** dengan ketebalan **Regular (`400`)**, **Medium (`500`)**, dan **SemiBold (`600`)** untuk paragraf, label form, tombol, tabel, metadata, dan ruang percakapan.
- Kedua font dimuat secara optimal menggunakan `next/font/google` dengan `display: 'swap'`.

### 3.2 Skala Tipografi
| Elemen | Font & Berat | Ukuran Desktop | Ukuran Mobile | Line Height | Warna Default |
| --- | --- | --- | --- | --- | --- |
| **Hero Display (`h1`)** | DM Sans Bold (700) | `48px` (`3rem`) | `36px` (`2.25rem`) | `1.15` | `#172B25` |
| **Page Title (`h1`)** | DM Sans Bold (700) | `30px` (`1.875rem`) | `24px` (`1.5rem`) | `1.25` | `#172B25` |
| **Section Heading (`h2`)** | DM Sans Bold (700) | `24px` (`1.5rem`) | `20px` (`1.25rem`) | `1.30` | `#172B25` |
| **Card / Stage Title (`h3`)** | DM Sans Bold (700) | `18px` (`1.125rem`) | `18px` (`1.125rem`) | `1.40` | `#172B25` |
| **Body Large** | Inter Regular (400) | `18px` (`1.125rem`) | `16px` (`1rem`) | `1.60` | `#52645D` |
| **Body Regular** | Inter Regular (400) | `16px` (`1rem`) | `16px` (`1rem`) | `1.60` | `#172B25` |
| **UI Control / Label / Button** | Inter Medium/SemiBold | `14px` (`0.875rem`) | `14px` (`0.875rem`) | `1.50` | `#172B25` |
| **Caption / Metadata / Badge** | Inter Medium (500) | `12px` (`0.75rem`) | `12px` (`0.75rem`) | `1.40` | `#718078` |

---

## 4. Spacing, Radius, Borders, dan Grid System

### 4.1 Skala Jarak (Spacing Scale)
Gunakan kelipatan konsisten berbasis `4px`:
- `4px` (`gap-1`), `8px` (`gap-2`), `12px` (`gap-3`), `16px` (`p-4` / `gap-4`), `24px` (`p-6` / `gap-6`), `32px` (`p-8` / `gap-8`), `48px` (`py-12`), `64px` (`py-16`), dan `80px` (`py-20`).

### 4.2 Border Radius
- **Badge / Pill / Tag:** `6px` (`rounded-md`).
- **Button / Input / Select / Textarea:** `8px` (`rounded-lg`).
- **Card / Panel / Modal Dialog:** `12px` (`rounded-xl`).

### 4.3 Borders & Shadows
- Utamakan penggunaan border tipis `1px solid #E1E8E4` di atas permukaan `#FFFFFF` untuk memisahkan kartu dari latar aplikasi `#F8FAF9`.
- Gunakan `1px solid #C8D4CE` untuk elemen form input dan tombol sekunder.
- Gunakan bayangan (*shadow*) yang sangat halus hanya pada komponen melayang seperti *dropdown*, *toast*, dan *modal dialog*.

### 4.4 Container & Responsive Breakpoints
- **Breakpoints:**
  - **Mobile:** `< 640px` (uji utama pada lebar `375px`) — susunan 1 kolom vertikal, navigasi bawah/drawer.
  - **Tablet:** `640px – 1023px` (uji utama pada lebar `768px`) — grid 2 kolom untuk kartu fitur/mentor.
  - **Desktop:** `1024px+` (uji utama pada lebar `1280px` dan `1440px`) — sidebar penuh dan grid hingga 3–4 kolom.
- **Container Lebar Maksimum:**
  - Halaman Publik (`/` dan `/pricing`): `max-w-6xl` (`1152px`) terpusat dengan padding horizontal `16px` (mobile), `24px` (tablet), dan `32px` (desktop).
  - Halaman Kerja Aplikasi: Area konten di sebelah kanan sidebar memiliki lebar bacaan optimal (`max-w-5xl`) agar baris teks tidak terlalu panjang.

---

## 5. Spesifikasi Komponen UI (Component Specifications)

### 5.1 Button Variants
1. **Primary Button:** Latar `#1B8366`, teks `#FFFFFF`, hover `#166B53`, active `#125642`, padding `10px 16px` (`px-4 py-2.5`), `rounded-lg`.
2. **Secondary / Outline Button:** Latar `#FFFFFF`, border `1px solid #C8D4CE`, teks `#172B25`, hover latar `#F8FAF9`.
3. **Subtle / Tonal Button:** Latar `#E8F4F0`, border `1px solid #B7DCCF`, teks `#1B8366`, hover latar `#B7DCCF`.
4. **Destructive Button:** Latar `#FDECEC`, border `1px solid #C62828`, teks `#C62828`, hover latar `#C62828` dengan teks `#FFFFFF`.
5. **Disabled State:** Latar `#EEF2F0`, teks `#98A59E`, tanpa efek hover, `cursor-not-allowed`.

### 5.2 Form Elements
- **Input, Select, & Textarea:** Latar `#FFFFFF`, border `1px solid #C8D4CE`, teks `#172B25`, placeholder `#718078`, radius `8px` (`rounded-lg`), padding `10px 12px`.
- **Focus State:** Garis tepi berubah menjadi `#1B8366` dengan `outline: 2px solid #1B8366` (`outline-offset: 1px`).
- **Validation Error State:** Garis tepi `#C62828` disertai pesan penjelasan di bawah field dengan warna `#C62828` ukuran `12px`.
- **Helper / Example Text:** Teks panduan di bawah label berwarna `#52645D` atau kotak contoh pengisian berlatar `#F8FAF9` dengan border `#E1E8E4`.

### 5.3 Cards & Containers
- Latar `#FFFFFF`, border `1px solid #E1E8E4`, radius `12px` (`rounded-xl`), padding `24px` (`p-6`).
- Kartu interaktif yang dapat dipilih (seperti pilihan kondisi bisnis pada form roadmap atau slot jadwal mentor) menggunakan border `2px solid #1B8366` dan latar `#E8F4F0` saat berstatus *selected*.

### 5.4 Navigation (Public & App Shell)
- **Public Navbar:** Tinggi `64px`, latar `#FFFFFF`, border bawah `#E1E8E4`, logo Rintis di kiri, tautan navigasi di tengah (`#52645D`, hover `#172B25`), serta tombol **Masuk** dan **Mulai Gratis** di kanan.
- **Dashboard Sidebar (Desktop):** Lebar tetap `260px`, latar `#FFFFFF`, border kanan `#E1E8E4`. Item navigasi aktif menggunakan latar `#E8F4F0`, teks `#1B8366` SemiBold, dan indikator garis vertikal `#1B8366`.
- **Mobile Navigation:** Topbar ringkas dengan tombol pembuka menu samping (*drawer*) berlatar `#FFFFFF` dan overlay `#172B2566`.

### 5.5 Badges & Status Indicators
- **Completed / Active / Confirmed:** Latar `#E8F5EC`, teks `#18794E`.
- **In Progress / Info:** Latar `#EAF2FF`, teks `#175CD3`.
- **Pending / Medium Priority / Quota Warning:** Latar `#FFF4D6`, teks `#9A6700`.
- **High Priority / Cancelled / Error:** Latar `#FDECEC`, teks `#C62828`.
- **Not Started / Neutral / Demo Data Badge:** Latar `#EEF2F0`, teks `#52645D`.

### 5.6 Dialogs, Dropdowns, dan Toast Notifications
- **Modal Dialog:** Muncul di tengah layar di atas overlay `#172B2566`, latar `#FFFFFF`, border `#E1E8E4`, `rounded-xl`, memiliki tombol tutup yang dapat diakses dengan tombol `Escape`.
- **Toast Notification:** Muncul di sudut kanan bawah/atas untuk mengonfirmasi aksi yang benar-benar telah tersimpan di server (contoh: *"Status tugas berhasil diperbarui"* dengan latar `#E8F5EC`, border `#18794E`, dan teks `#18794E`).

### 5.7 Skeleton Loading & Empty States
- **Skeleton Loading:** Gunakan blok beranimasi `animate-pulse` dengan warna `#EEF2F0` yang menyerupai struktur kartu roadmap atau baris diskusi saat data sedang dimuat.
- **Empty State:** Kontainer berlatar `#FFFFFF` dengan border putus-putus `1px dashed #C8D4CE`, judul singkat `#172B25`, deskripsi panduan `#52645D`, dan satu tombol CTA `#1B8366`.

---

## 6. Panduan Desain Halaman & Fitur Khusus

### 6.1 Dashboard Layout
- Bagian atas menampilkan sapaan pengguna, badge paket langganan aktif (`Rintis Starter` / `Growth` / `Max`), dan ringkasan sisa kuota harian dalam kartu metrik ringkas.
- Bagian utama menampilkan kartu **Roadmap Aktif Terakhir** lengkap dengan bilah progres `#1B8366` dan 3 tugas prioritas berikutnya agar pengguna dapat langsung melanjutkan pekerjaan.

### 6.2 Roadmap Visualization & Stepper
- **Bagian Strategis (12 Komponen):** Ditampilkan dalam tata letak grid kartu 2 kolom yang rapi (Ringkasan & Diagnosis, Target Pasar, Validasi, Value Proposition, Model Pendapatan, Estimasi Modal, Strategi Pemasaran, Operasional, serta Risiko & Mitigasi) disertai *banner disclaimer* berlatar `#FFF4D6` dan teks `#9A6700`.
- **Bagian Timeline & Tasks:** Menggunakan *vertical stepper* bernomor urut (`1`, `2`, `3`...) dengan lingkaran indikator `#1B8366` dan teks `#FFFFFF`. Setiap tahap menampilkan daftar *task* dengan pemilih status (`Belum Dimulai`, `Sedang Dikerjakan`, `Selesai`) yang langsung memperbarui *progress bar* utama.
- **Locked Stage Callout (Khusus Paket Starter):** Tahapan di atas batas paket Starter ditampilkan dengan kartu terkunci berlatar `#E8F4F0`, border `#B7DCCF`, dan tombol CTA untuk melihat halaman *upgrade* paket.

### 6.3 Pricing Cards
- Menampilkan 3 kartu sejajar pada layar desktop (`Starter`, `Growth`, `Max`).
- Kartu **Rintis Growth** ditonjolkan dengan border `2px solid #1B8366` dan badge `"Paling Populer"` (`#E8F4F0` / `#1B8366`).
- Menyertakan keterangan jujur berwarna `#718078` bahwa harga yang tercantum adalah placeholder MVP dan belum menarik biaya pembayaran online.

### 6.4 Community Forum Components
- Menggunakan tata letak 2 kolom pada desktop: kolom kiri (`240px`) untuk filter **Kategori Diskusi**, dan kolom utama untuk bilah pencarian serta daftar kartu diskusi.
- Setiap kartu diskusi menampilkan badge kategori (`#E8F4F0` / `#1B8366`), judul diskusi (`#172B25`), cuplikan isi (`#52645D`), nama penulis, waktu publikasi (`#718078`), jumlah komentar, dan tombol *upvote*.
- Tombol **Edit** dan **Hapus** hanya dirender apabila pengguna yang sedang login adalah pemilik postingan tersebut.

### 6.5 Mentor Profile & Consultation Components
- Kartu mentor pada direktori menampilkan nama lengkap, peran/headline, badge **Data Demo MVP** (`#FFF4D6` / `#9A6700` apabila `is_demo_data = true`), tag bidang keahlian (`#E8F4F0` / `#1B8366`), bahasa, dan durasi sesi (`45 Menit`).
- Halaman detail mentor menampilkan pemilih **Slot Jadwal Tersedia** berupa tombol waktu interaktif. Slot yang sudah dipesan pengguna lain ditampilkan dengan latar `#EEF2F0` dan teks `#98A59E` (*disabled*) sehingga tidak dapat diklik.

---

## 7. Standar Aksesibilitas & State Interaksi

1. **Rasio Kontras:** Pasangan teks utama `#172B25` dan teks sekunder `#52645D` di atas latar `#FFFFFF` maupun `#F8FAF9`, serta teks `#FFFFFF` di atas tombol `#1B8366`, telah dipilih agar memenuhi standar keterbacaan WCAG AA.
2. **Navigasi Keyboard:** Seluruh tautan, tombol, pemilih status *task*, dan slot jadwal mentor wajib dapat diakses menggunakan tombol `Tab` dengan indikator `:focus-visible` berupa `outline: 2px solid #1B8366`.
3. **Semantik HTML & Label Form:** Gunakan elemen semantik (`header`, `nav`, `main`, `section`, `article`, `aside`, `footer`) dan pastikan setiap input form memiliki elemen `<label>` yang terhubung melalui atribut `htmlFor`.
4. **State Interaksi Lengkap:** Setiap elemen yang dapat diklik harus memiliki perbedaan visual yang jelas antara state *default*, *hover*, *active*, *focus-visible*, *loading/submitting*, dan *disabled*.