# Alice HRIS - Agent Instructions & Coding Standards

Dokumen aturan ini mengadaptasikan best practices dari:
- **Clean Code TypeScript** (`labs42io/clean-code-typescript`)
- **Next.js & React Cursor Rules** (`pontusab/cursorrules`, `midudev/cursor-rules`)
- **Awesome Cursor Rules** (`PatrickJS/awesome-cursorrules`)
- **UI Design Taste & Craft** (`leonxlnx/taste-skill`)
- **Impeccable Design Guidance** (`pbakaus/impeccable`)
- **Anti-Slop Guardrails** (`miqdadbadjuber/anti-slop`)
- **Stop-Slop Human Copywriting** (`hardikpandya/stop-slop`)
- **UI/UX Pro Max Intelligence** (`nextlevelbuilder/ui-ux-pro-max-skill`)

---

## 1. Project Overview & Tech Stack
- **Framework**: Next.js 15 (App Router, Turbopack)
- **Library**: React 19 (Server Components first, Client Components when required)
- **Language**: TypeScript 5 (Strict mode)
- **Database**: PostgreSQL dengan `pg` Connection Pool (Serverless-optimized)
- **Styling**: Tailwind CSS v4 + Lucide React
- **Date/Time**: Asia/Jakarta (WIB) untuk semua pencatatan absensi & tanggal jadwal
- **Cut-Off Kehadiran & Jadwal**: Tanggal 26 bulan sebelumnya s/d 25 bulan terpilih

---

## 2. Clean Code TypeScript (labs42io Guidelines)

### Naming Conventions
- **Variabel & Fungsi**: Gunakan nama yang bermakna, mudah dicari, dan eksplisit (*intention-revealing*). Hindari singkatan ambigu (misal: gunakan `karyawan` bukan `k`, `absensiRecord` bukan `rec`).
- **Boolean**: Selalu gunakan prefix pembantu seperti `is`, `has`, `should`, `can` (contoh: `isLoading`, `hasFaceDescriptor`, `isEarlyOut`, `canApprove`).
- **Fungsi**: Gunakan kata kerja aktif (contoh: `fetchKaryawanList`, `calculateOvertimeMinutes`, `verifyFaceBiometric`).
- **Konstanta**: Gunakan `UPPER_SNAKE_CASE` hanya untuk konstanta global sejati (contoh: `ABSENSI_GEOFENCE`, `MATCH_THRESHOLD`).
- **Tipe & Interface**: Gunakan `PascalCase` (contoh: `KaryawanProfile`, `ShiftSchedule`). Hindari prefix `I` (misal jangan `IKaryawan`).

### Functions & Methods
- **Single Responsibility Principle (SRP)**: Satu fungsi hanya melakukan satu hal dengan tuntas.
- **Batasi Argumen**: Idealnya 1–2 argumen. Jika membutuhkan > 2 parameter, gunakan object destructured parameter (`options: { id, date, type }`).
- **Hindari Flag Arguments**: Jangan lewatkan parameter boolean yang menyebabkan fungsi bercabang mengerjakan 2 hal berbeda. Pecah menjadi 2 fungsi terpisah jika perilakunya berbeda drastis.
- **Guard Clauses & Early Returns**: Tangani validasi error dan edge cases di awal fungsi untuk menghindari nesting `if/else` yang bertumpuk. Letakkan *happy path* di bagian akhir fungsi.
- **Hindari Side Effects**: Jangan memodifikasi parameter objek/array secara langsung (*mutate in-place*). Gunakan salinan immutability (`[...items]`, `{ ...user }`).

### Types & Data Structures
- **Hindari `any`**: Selalu tentukan tipe yang jelas. Gunakan `unknown` bila tipe belum diketahui dan lakukan *type narrowing* / *type guards*.
- **Prefer Interface over Type** untuk mendefinisikan bentuk data objek.
- **Hindari TypeScript `enum`**: Gunakan `const object` dengan union type (`as const`) untuk kompatibilitas JavaScript dan performa bundle yang lebih baik:
  ```ts
  export const SHIFT_TYPE = {
    PAGI: "pagi",
    SIANG: "siang",
    MALAM: "malam",
  } as const;
  export type ShiftType = typeof SHIFT_TYPE[keyof typeof SHIFT_TYPE];
  ```
- **Readonly & Immutability**: Gunakan `readonly` pada properti yang tidak boleh diubah setelah inisialisasi.

### Error Handling
- **Jangan Sembunyikan Error**: Hindari blok `catch (e) {}` yang kosong. Selalu log error atau return respon terstruktur.
- **Pesan Error Informatif**: Sertakan konteks penyebab error (misal: "Gagal memverifikasi lokasi: izin GPS ditolak").

---

## 3. Next.js 15 & React 19 Architecture (pontusab & midudev Rules)

### Server vs. Client Components
- **Server Components by Default**: Semua file halaman (`page.tsx`) dan komponen adalah React Server Components (RSC) secara default.
- **`'use client'` hanya saat dibutuhkan**: Tambahkan `'use client'` hanya jika komponen membutuhkan state (`useState`, `useReducer`), lifecycle (`useEffect`, `useRef`), event browser (`onClick`, `onChange`), atau API browser (`navigator.geolocation`, camera).
- **Komposisi Komponen**: Pisahkan bagian interaktif ke dalam Client Component kecil, dan bungkus di dalam Server Component yang memuat data.

### Next.js 15 Async Params
- Pada Next.js 15, `params` dan `searchParams` pada `page.tsx` dan Route Handlers berbentuk `Promise`:
  ```ts
  export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
  ) {
    const { id } = await params;
    // ...
  }
  ```

### Route Handlers (`src/app/api/**/route.ts`)
- Selalu return `NextResponse.json(data, { status })` dengan status HTTP yang tepat (200, 201, 400, 401, 403, 404, 500).
- Gunakan `try...catch` di setiap Route Handler untuk mencegah *unhandled rejection* yang membuat Vercel/Node crash diam-diam.
- Tambahkan `export const dynamic = 'force-dynamic'` pada endpoint yang membaca request cookies/headers atau memuat data dinamis real-time.

---

## 4. Database & PostgreSQL Standards (`pg`)

### Keamanan & Anti-SQL Injection
- **Wajib Gunakan Parameterized Queries**: Jangan pernah menggunakan konkatenasi string SQL (`SELECT * FROM table WHERE id = '` + id + `'`). Selalu gunakan placeholder `$1, $2, ...`:
  ```ts
  await pool.query('SELECT * FROM karyawan WHERE id = $1', [karyawanId]);
  ```
- **UUID & Cast Tipe**: Jika mencocokkan array UUID, gunakan `WHERE id = ANY($1::uuid[])`.

### Connection Pool Optimization
- Gunakan shared pool dari `@/app/lib/db`.
- Jangan membuat instance `new Pool()` baru di dalam fungsi route handler agar koneksi tidak habis (*connection leak*).
- Jika menggunakan transaksi multi-query (`BEGIN` ... `COMMIT`), gunakan client dari pool dan pastikan dipanggil `client.release()` di blok `finally`.

---

## 5. UI & Styling Rules (Tailwind CSS & UX)
- **Mobile-First & Responsive**: Pastikan layout rapi di tampilan mobile (kiosk/HP) maupun desktop dashboard admin (`sm:`, `md:`, `lg:`).
- **Konsistensi Feedback User**: Gunakan indikator visual saat loading (`Loader2` spin), notifikasi toast (`react-hot-toast` / `sonner`), dan status warna yang intuitif:
  - Sukses / Hadir: Emerald / Green
  - Terlambat / Peringatan: Amber / Orange
  - Error / Ditolak / Libur: Rose / Red
  - Informasi / Shift Normal: Blue / Slate
- **Aksesibilitas & Feedback Loading**: Nonaktifkan tombol (`disabled`) saat proses async berlangsung untuk mencegah *double submit*.

---

## 6. UI Design Taste & Impeccable Craft (leonxlnx/taste-skill & pbakaus/impeccable)
- **Hindari "Card-Soup"**: Jangan membungkus setiap elemen ke dalam kotak kartu (`card`) terpisah dengan border abu-abu. Gunakan whitespace, pengelompokan alami, atau divider tipis (`divide-y divide-slate-100`).
- **Skema Warna Disiplin**: Gunakan warna primer Alice HRIS (`#0173b6`), slate neutral, dan status semantik. Jangan gunakan gradien ungu/violet yang generik.
- **Tipografi dengan Karakter**:
  - Gunakan `tabular-nums` untuk angka, jam absensi, tanggal, dan koordinat GPS agar tampilan tidak goyang/jitter.
  - Batasi skala ukuran font maksimal 3–4 variasi dalam satu tampilan layar.
  - Header tabel harus ringkas, semi-bold, uppercase dengan tracking wider (`text-xs font-semibold uppercase tracking-wider text-slate-500`).
- **Mikro-Interaksi**: Setiap tombol interaktif wajib memiliki feedback fisik (`active:scale-[0.98] transition-all`) dan ring fokus yang rapi (`focus-visible:ring-2 focus-visible:ring-blue-500/40`).
- **Loading & Empty State Elegan**: Hindari placeholder kosong tanpa konteks. Sediakan tombol aksi atau instruksi pemandu saat data belum tersedia.

---

## 7. Anti-Slop Guardrails & Human Copywriting (miqdadbadjuber/anti-slop & hardikpandya/stop-slop)
- **Hard Gate - Larangan Komentar Kode Robotik**: Hapus komentar yang hanya mengulang sintaks (misal: `// Render component`, `// Import react`, `// Handle click`). Pertahankan hanya komentar logika bisnis riil (seperti kalkulasi geofence atau cut-off 26-25).
- **Hard Gate - Larangan AI Buzzwords**: Dilarang menggunakan kata-kata klise AI pada teks UI, modal, toast, dan dokumentasi:
  - Hindari: *seamless, elevate, leverage, delve, robust, game-changer, streamline, revolusioner, tanpa hambatan*.
  - Gunakan bahasa yang lugas, manusiawi, dan to the point.
- **Tanpa Pembuka Bertele-Tele (*No Throat-Clearing*)**: Jangan awali pesan dengan pengantar dramatis atau filosofis. Langsung sampaikan status atau aksi yang perlu diambil.
- **Pesan Error Informatif & Solutif**: Jelaskan apa yang terjadi dan bagaimana mengatasinya (misal: "Gagal menyimpan absensi: GPS terdeteksi berada di luar radius 2 km dari RSU Avisena").
- **Delivery Gate Mobile**: Pastikan target sentuh tombol di perangkat mobile minimal 44×44px (`min-h-[44px]` atau padding ikon yang cukup) serta tidak ada horizontal overflow (`overflow-x: hidden` / flex wrapping).

---

## 8. Alice HRIS Design Taste & Component Craft (Anti-Monochrome, Styled Controls)
- **Anti-Monokrom Membosankan**: Desain bersih (*clean*) bukan berarti menghapus warna atau mengganti komponen menjadi kaku/polosan. Pertahankan identitas medis RSU Avisena: `#0173b6` (Avisena Blue), `#05445e` (Navy Hospital), `#0f172a` (Slate-900), emerald hadir, amber izin, dan rose alpa.
- **Form Controls & Dropdown Menggunakan Library**:
  - Utamakan penggunaan library dropdown seperti `react-select` dengan border rounded-xl, soft hover, dan badge status daripada `<select>` bawaan HTML.
  - Textbox harus bergaya: memiliki ikon penjelas di sisi kiri, latar belakang lembut (`bg-slate-50/80`), border terdefinisi (`border-slate-200/90`), serta ring fokus yang jelas.
- **Bentuk Kontainer Berkarakter**:
  - Gunakan radius kontainer tegas dan anggun (`rounded-2xl`, `rounded-[28px]`, `rounded-[32px]`), bingkai avatar tebal (`border-[6px] border-white shadow-2xl`), dan shadow ambient yang lembut.
- **Hapus Fitur Dummy Tanpa Fungsi Riil**:
  - Ganti elemen dummy (seperti QR scanner/QR absensi jika tidak digunakan) dengan modul fungsional riil (seperti Kartu Tanda Pengenal Digital Pegawai Rumah Sakit, status biometrik wajah, atau ringkasan kehadiran cut-off 26-25).
- **Angka Selalu Tabular**: Wajib `tabular-nums font-mono` untuk semua angka NIP, NIK, tanggal, jam absensi WIB, dan rekening.

