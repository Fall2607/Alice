# Standar Desain & Keseragaman Halaman Admin (Alice HRIS)

Dokumen ini merupakan panduan arsitektur antarmuka (*UI/UX Layout Standard*) untuk seluruh halaman di dalam panel admin Alice HRIS RSU Avisena. Seluruh halaman admin wajib mengikuti struktur dan konvensi visual ini agar tercipta keseragaman (*uniformity*), kenyamanan penggunaan (*ergonomics*), dan standar bebas dari inkonsistensi (*zero card-soup*).

Acuan baku utama halaman adalah modul **Manajemen Pegawai** (`src/app/(admin)/admin/pegawai/page.tsx`).

---

## 1. Prinsip & Konvensi Visual Utama

1. **Warna Primer & Identitas Medis**:
   - `primary`: `#0173b6` (Avisena Blue - tombol utama, tautan aktif, aksen)
   - `primary-dark`: `#05445e` (Navy Hospital - judul H1/H2, header tabel eksekutif)
   - `neutral`: Slate shades (`slate-900` untuk teks primer, `slate-500` untuk subteks, `slate-200/80` untuk border tipis)
   - `semantik`:
     - Sukses / Selesai: Emerald (`bg-emerald-100 text-emerald-800 border-emerald-200`)
     - Peringatan / Menunggu / Kontrak: Amber (`bg-amber-100 text-amber-800 border-amber-200`)
     - Bahaya / Kritis / Kedaluwarsa: Rose/Red (`bg-red-100 text-red-800 border-red-200`)
     - Info / Staf: Blue / Cyan (`bg-blue-100 text-blue-800 border-blue-200`)

2. **Tipografi & Angka Tabular**:
   - Wajib menggunakan `font-mono tabular-nums` untuk semua angka NIP, NIK, tanggal, sisa hari, skor evaluasi, jam presensi, dan persentase agar tata letak tidak goyang (*zero jitter*).
   - Skala font: H1 (`text-3xl font-bold tracking-tight text-primary-dark`), H2 (`text-xl font-bold text-primary-dark`), Label (`text-xs font-bold uppercase tracking-wider`).

3. **Bentuk Kontainer & Radius**:
   - Kontainer besar (Kartu Filter, Kotak Tabel, Modal): `rounded-2xl border border-slate-200/80 shadow-xs bg-white`.
   - Kontrol kecil (Input, Select, Avatar, Tombol): `rounded-xl`.
   - Hindari *card-soup*: Jangan membungkus setiap field ke kartu terpisah. Satukan dalam satu kontainer filter yang kohesif.

---

## 2. Anatomi Baku Halaman Admin (Urutan Top-to-Bottom)

Setiap halaman admin memiliki 5 layer komponen terstandar (tanpa floating/pop-up section tambahan yang mengganggu layout):

```
┌────────────────────────────────────────────────────────────────────────┐
│ 1. HEADER HALAMAN (Tag Kategori + H1 Judul + Deskripsi + CTA Utama)   │
│    * Aksi masal (cth: Blast WA/Email) langsung menyatu di CTA atas     │
├────────────────────────────────────────────────────────────────────────┤
│ 2. KPI / SUMMARY RIBBON (Opsional: 4 Kotak Ringkasan Metrik Cepat)     │
├────────────────────────────────────────────────────────────────────────┤
│ 3. FILTER & PENCARIAN (Kontainer rounded-2xl, Grid 4-5 Kolom)          │
├────────────────────────────────────────────────────────────────────────┤
│ 4. BARIS JUDUL TABEL (H2 Judul Tabel + Total Counter Pegawai)          │
├────────────────────────────────────────────────────────────────────────┤
│ 5. TABEL DATA EKSEKUTIF (Header Gelap #05445e + Avatar Inisial + Aksi)│
│    + PAGINATION (Komponen Pagination terintegrasi di footer tabel)    │
└────────────────────────────────────────────────────────────────────────┘
```

> **Aturan Khusus Aksi Masal**: Dilarang memunculkan section baru/floating bar yang tiba-tiba muncul saat baris dicentang. Jumlah item terpilih cukup ditampilkan langsung pada badge counter tombol CTA di header atas (misal: `Blast Magic Link (3)`).

---

## 3. Rincian Teknis Tiap Layer

### Layer 1: Header Halaman
Header diletakkan di bagian paling atas dengan divider tipis di bawahnya:
```tsx
<div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-2 border-b border-slate-200/80">
  <div>
    <div className="flex items-center gap-2 mb-1 text-primary font-bold uppercase tracking-wider text-xs">
      <Users size={15} />
      <span>Direktori Kepegawaian &amp; SDM</span>
    </div>
    <h1 className="text-3xl font-bold text-primary-dark tracking-tight">
      Nama Modul Halaman
    </h1>
    <p className="text-slate-500 font-medium text-sm mt-1 max-w-2xl">
      Deskripsi fungsi halaman yang lugas dan informatif bagi admin.
    </p>
  </div>

  <Link
    href="/admin/.../tambah"
    className="inline-flex items-center gap-2 bg-primary hover:bg-primary-dark text-white font-bold py-2.5 px-5 rounded-xl shadow-xs transition-all active:scale-[0.98] text-xs uppercase tracking-wider min-h-[44px]"
  >
    <PlusCircle size={16} />
    <span>Aksi Utama Halaman</span>
  </Link>
</div>
```

---

### Layer 2: KPI / Summary Ribbon (Horizontal 4-Grid)
Memberikan gambaran angka kunci tanpa memakan ruang vertikal:
```tsx
<div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
  <div className="bg-white border border-slate-200/90 rounded-xl p-3.5 shadow-2xs flex items-center justify-between">
    <div>
      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Dimonitor</p>
      <p className="text-xl font-black text-slate-800 font-mono tabular-nums mt-0.5">
        {stats.total} <span className="text-xs font-semibold text-slate-400 font-sans">Pegawai</span>
      </p>
    </div>
    <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#0173b6] flex items-center justify-center font-bold">
      <Users size={20} />
    </div>
  </div>
  {/* Ulangi untuk status Kritis, Berjalan, dan Selesai */}
</div>
```

---

### Layer 3: Kontainer Filter & Pencarian
Kontainer filter menggunakan border `rounded-2xl` dengan input pencarian di sisi kiri dan dropdown `SearchableSelect` (`react-select`) di sisi kanan:
```tsx
<div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
  <div className="flex items-center justify-between">
    <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
      Filter &amp; Pencarian
    </span>
    {hasActiveFilters && (
      <button
        onClick={handleResetFilters}
        className="inline-flex items-center gap-1.5 text-xs font-bold text-primary hover:text-primary-dark transition-colors"
      >
        <RotateCcw size={13} />
        <span>Reset Filter</span>
      </button>
    )}
  </div>

  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
    {/* Input Pencarian */}
    <div className="relative lg:col-span-2">
      <input
        type="text"
        placeholder="Cari NIP atau Nama..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="w-full h-[38px] pl-9 pr-8 bg-slate-50/80 border border-slate-200/90 rounded-xl text-xs font-semibold text-slate-800 focus:bg-white focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
      />
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
      {searchTerm && (
        <button
          onClick={() => setSearchTerm("")}
          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
        >
          <X size={14} />
        </button>
      )}
    </div>

    {/* Dropdown Menggunakan SearchableSelect (react-select) */}
    <div>
      <SearchableSelect
        options={DEPARTMENT_OPTIONS}
        value={selectedDept}
        onChange={(val) => setSelectedDept(val as FormOption | null)}
        placeholder="Semua Departemen"
      />
    </div>
  </div>
</div>
```

---

### Layer 4: Baris Judul Tabel
Diletakkan tepat di atas kotak tabel:
```tsx
<div className="flex items-center justify-between">
  <h2 className="text-xl font-bold text-primary-dark">
    Daftar Data Pegawai
  </h2>
  <span className="text-xs font-semibold text-slate-500">
    Total <strong className="font-mono tabular-nums text-slate-800">{items.length}</strong> pegawai
  </span>
</div>
```

---

### Layer 5: Tabel Data Eksekutif
Wajib menggunakan header gelap `#05445e` (`bg-primary-dark`), sel dengan padding `px-6 py-3.5`, avatar box inisial, serta angka tabular:
```tsx
<div className="overflow-hidden rounded-2xl border border-slate-200/80 shadow-xs bg-white">
  <div className="overflow-x-auto">
    <table className="w-full text-left text-xs whitespace-nowrap">
      <thead className="text-xs text-white uppercase bg-primary-dark font-semibold">
        <tr>
          <th scope="col" className="px-6 py-3.5 w-12 text-center text-white">
            <input type="checkbox" className="checkbox checkbox-primary checkbox-sm rounded-md" />
          </th>
          <th scope="col" className="px-6 py-3.5 text-white">Nama Pegawai</th>
          <th scope="col" className="px-6 py-3.5 text-white">Jabatan &amp; Unit</th>
          <th scope="col" className="px-6 py-3.5 text-white">Status</th>
          <th scope="col" className="px-6 py-3.5 text-center text-white">Aksi</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-slate-100">
        {currentItems.map((emp) => (
          <tr key={emp.id} className="hover:bg-slate-50/80 transition-colors">
            {/* Checkbox */}
            <td className="px-6 py-4 text-center">
              <input type="checkbox" className="checkbox checkbox-primary checkbox-sm rounded-md" />
            </td>

            {/* Nama & Avatar */}
            <td className="px-6 py-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-primary font-bold text-xs border border-blue-200/60 flex items-center justify-center shrink-0 shadow-xs">
                  {getInitials(emp.nama_lengkap)}
                </div>
                <div className="min-w-0">
                  <p className="font-bold text-slate-900 text-sm">{emp.nama_lengkap}</p>
                  <p className="text-xs font-mono tabular-nums text-slate-500 mt-0.5">
                    NIP: {emp.nip} &bull; {emp.unit}
                  </p>
                </div>
              </div>
            </td>

            {/* Kolom Data Lain */}
            <td className="px-6 py-4 font-semibold text-slate-800">{emp.jabatan}</td>

            {/* Status Badge */}
            <td className="px-6 py-4">
              <span className="inline-flex items-center px-2.5 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800 border border-blue-200/60">
                {emp.status}
              </span>
            </td>

            {/* Aksi Cepat Ber-Tooltip */}
            <td className="px-6 py-4 text-center">
              <div className="flex items-center justify-center gap-1.5">
                <button className="p-1.5 rounded-lg text-slate-600 hover:text-primary hover:bg-slate-50 transition-colors">
                  <Eye size={16} />
                </button>
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>

  {/* Pagination Terintegrasi */}
  <Pagination
    currentPage={currentPage}
    totalPages={totalPages}
    onPageChange={setCurrentPage}
  />
</div>
```

---

## 4. Standar Desain Modal Dialog

Setiap modal pop-up wajib menggunakan:
1. Backdrop `bg-black/60 backdrop-blur-xs`.
2. Kontainer `rounded-2xl bg-white shadow-2xl border border-slate-200 overflow-hidden`.
3. Sticky Header dengan latar belakang `bg-[#05445e]` (`bg-primary-dark`) dan teks putih.
4. Tombol aksi footer di `bg-slate-50 border-t border-slate-200`.

---

## 5. Standar Form Evaluasi Kinerja (Penilaian Kinerja / Assessment)

Untuk halaman evaluasi klinis dan kinerja pegawai (seperti `FormPenilaianKinerjaView` dan portal magic link `/penilaian-kinerja/[token]`):
1. **Layout 2-Kolom Responsive**:
   - **Sidebar Kiri Sticky (4 Kolom)**: Profil identitas pegawai & penilai, status PKWT, toggle aspek manajerial (DaisyUI `toggle toggle-primary toggle-sm`), Live Scorecard Nilai Norma (gradient `#05445e` s/d `#0173b6`, skor besar `tabular-nums font-mono`, DaisyUI `progress`, badge klasifikasi), dan navigasi cepat aspek.
   - **Konten Kanan (8 Kolom)**: Panduan skala nilai 0–50 (DaisyUI alert/card), 10 Aspek Penilaian, Evaluasi Kualitatif 4 kuadran, Rekomendasi Tindak Lanjut (DaisyUI `radio radio-primary` cards), dan Submit bar resmi.
2. **DaisyUI Form Controls**:
   - Quick score preset: `join` button group `[ 10 | 20 | 30 | 40 | 50 ]`.
   - Precision stepper: input `tabular-nums font-mono` dengan tombol `btn-square btn-xs`.
   - Mini visual gauge: `progress progress-primary` / `progress-success` per indikator.
3. **GSAP Motion**:
   - `useGSAP` dengan scoped `containerRef`.
   - Stagger entrance pada sidebar, panduan skala, kartu per aspek penilaian, dan bar rekomendasi.

---

## 7. Standar Modul Kehadiran & Presensi (Dashboard, Rekap, Cuti)

Modul absensi dan perizinan (`src/app/(admin)/admin/kehadiran/`) memiliki aturan spesifik terkait siklus penggajian dan penataan matriks:
1. **Siklus Cut-Off Baku 26–25**:
   - Periode presensi RSU Avisena adalah tanggal 26 bulan sebelumnya s/d 25 bulan berjalan.
   - Halaman rekapitulasi presensi wajib menyertakan tombol cepat preset: `Cut-off 26–25`, `Bulan Berjalan`, dan `Bulan Lalu`.
2. **Dual-View Switcher (Tabel Ringkas vs Heatmap Matriks)**:
   - Menggunakan DaisyUI `join` untuk beralih antara tabel baris konvensional dan matriks heatmap harian.
   - Heatmap menggunakan palet semantik medis yang tegas: Hadir (Emerald-500), Terlambat (Amber-400), Alpha (Rose-500), Izin/Cuti (Sky-500), Libur (Slate-200).
   - Sel heatmap dilengkapi title tooltip dan interaksi klik menuju modal detail harian per pegawai.
3. **Persetujuan Cuti Berjenjang (Atasan, SPV, HC)**:
   - Tab navigasi menggunakan DaisyUI `tabs tabs-box` untuk memisahkan `Kalender & Persetujuan` dengan `Direktori Saldo & Riwayat`.
   - Kalender cuti menampilkan sebaran cuti bulanan dengan chip status (Disetujui: Emerald, Menunggu: Amber) yang dapat diklik untuk pratinjau instan.
   - Konfirmasi tindakan `Setujui` dan `Tolak` wajib menggunakan dialog interaktif `Swal.fire` (SweetAlert2) dengan tema warna RS Avisena dan notifikasi responsif `showSuccessToast` / `showErrorToast`.
4. **GSAP Micro-Interactions**:
   - `useGSAP` dengan scoped `containerRef` untuk transisi halaman masuk, perpindahan tab, dan micro-stagger baris data/kartu pending.

---

## 8. Standar Modul Manajemen Shift & Jadwal Kerja (Shift, Template, Plotting, Delegasi)

Modul penjadwalan (`src/app/(admin)/admin/shift/` dan `src/app/(admin)/admin/jadwal-kerja/`) menerapkan aturan ergonomi dinas medis:
1. **Lebar Margin Seragam**:
   - Wajib menggunakan format *full-width padding* `className="p-8 font-sans min-h-screen space-y-6"` tanpa `max-w-7xl mx-auto`.
2. **Master Shift & Lintas Hari (Cross-Day)**:
   - Tipe hari wajib dibedakan dengan DaisyUI badge: `Lintas Hari (+1)` (Indigo) vs `Hari yang Sama` (Ghost/Slate).
   - Form penambahan/edit shift menyediakan toggle `is_cross_day` (DaisyUI `toggle toggle-primary toggle-sm`).
3. **Template Jadwal Kerja**:
   - Membedakan jadwal `FIXED` (tetap berulang mingguan) dan `SHIFT` (pola dinamis).
   - Pada tipe `FIXED`, grid pengaturan mingguan (Senin–Minggu) menggunakan selector shift per hari yang jelas.
4. **Matriks Board Shifting & Board Piket**:
   - Menggunakan DaisyUI `tabs tabs-box` untuk membagi 3 mode: `Jadwal Default Rutin`, `Board Shifting (24/7)`, dan `Piket Sabtu (SPV)`.
   - Periode dinas bulanan wajib mengacu pada rentang cut-off baku 26 s/d 25.
   - Penugasan shift harian per cell dilengkapi interaksi klik modal, pencarian staff, checkbox pemilihan, serta aksi masal ekspor/impor Excel.
5. **Delegasi Akses Jadwal**:
   - Memungkinkan koordinator/admin mendelegasikan wewenang edit jadwal per unit kerja ke staff non-koordinator tanpa mengubah role sistem.
   - Konfirmasi pencabutan akses wewenang menggunakan dialog interaktif `Swal.fire` (SweetAlert2).

---

## 9. Standardisasi Dashboard Utama Admin (`/admin`)

Dashboard utama admin (`src/app/(admin)/admin/page.tsx`) berfungsi sebagai pusat komando operasional rumah sakit dan HRIS terpadu:
1. **Lebar Margin & Ergonomi**:
   - Menggunakan format *full-width padding* `className="p-8 font-sans min-h-screen space-y-6"` konsisten dengan seluruh halaman admin.
2. **Anatomi 5-Layer**:
   - **Layer 1: Header Halaman**: Ucapan selamat datang personal, ringkasan operasional, pemilih bulan periode cut-off dinamis, dan tombol pintasan *Plotting Shift*.
   - **Layer 2: KPI Ribbon (4 Kartu Eksekutif)**: Total Pegawai Aktif, Presensi Hari Ini (dengan badge status real-time), Terlambat Hari Ini, dan Pengajuan Cuti Menunggu Persetujuan.
   - **Layer 3: Kontrol Switcher Segmented**: Tab solid Avisena Blue (`Ikhtisar Operasional`, `Jadwal Dinas Saya`, dan `Peringatan & Kontrak`) beserta badge rentang cut-off baku 26 s/d 25.
   - **Layer 4 & 5: Konten Komprehensif**:
     - *Monitoring Kehadiran Real-time*: Multi-segment progress bar (Tepat Waktu, Terlambat, Belum Hadir) dengan indikator geofence 2 KM & verifikasi biometrik wajah.
     - *Daftar Pengajuan Cuti Menunggu*: Kartu interaktif daftar izin/cuti tertunda dengan aksi cepat peninjauan langsung.
     - *Peringatan Masa Kontrak Kritis*: Notifikasi staff dengan sisa kontrak ≤ 30 hari untuk segera dievaluasi atau dikirimkan blast.
     - *Hub Pintasan Cepat (Quick Actions)*: Akses instan ke 4 modul esensial (Data Pegawai, Plotting Dinas 24/7, Master Shift, dan Rekap Absensi).
     - *Kalender Dinas Interaktif*: Kalender bulanan berpotongan cut-off dengan kartu dinas bertema warna (Pagi, Siang, Malam, Libur) dan penanda hari ini.

---

## 10. Checklist Verifikasi Sebelum Menyelesaikan Halaman

- [ ] Header menggunakan Tag Kategori, Judul H1 `text-primary-dark`, dan Tombol Tambah `rounded-xl min-h-[44px]`.
- [ ] Kontainer Filter menggunakan `rounded-2xl border-slate-200/80` dengan reset filter `RotateCcw`.
- [ ] Dropdown menggunakan `SearchableSelect` (`react-select`) dengan border `rounded-xl` dan tinggi presisi `h-[38px]`.
- [ ] Header tabel menggunakan `bg-primary-dark` (`#05445e`) dengan teks putih uppercase tracking-wider.
- [ ] Avatar menggunakan inisial kotak bulat `rounded-xl bg-blue-50 border-blue-200/60`.
- [ ] Semua NIP, NIK, tanggal, sisa hari, dan skor menggunakan `font-mono tabular-nums`.
- [ ] Pagination terintegrasi rapi di dalam kontainer tabel bagian bawah.
- [ ] Bebas dari komentar robotik sintaks dan AI buzzwords (*seamless, elevate, leverage, robust*).
- [ ] Lulus uji kompilasi TypeScript (`npx tsc --noEmit` exit code 0).

