---
name: alice-taste
description: Alice HRIS Design System & Taste Guidelines. Enforces bespoke medical UI craftsmanship, rich distinctive shapes, library-styled form controls, hospital ergonomics (RSU Avisena), and zero AI-slop.
---

# Alice HRIS - Design Taste & Component Craft Guidelines

Pedoman ini mendefinisikan cita rasa desain (*design taste*), komponen UI, dan hierarki visual yang menjadi standar resmi untuk **Alice HRIS (RSU Avisena)**.

---

## 1. Filosofi Desain: Karakter & Kehangatan Medis (Bukan Monokrom Datar)

Pengguna Alice HRIS secara eksplisit menyukai tampilan yang **kaya, berkarakter, dan berkelas**:
- **Anti-Monokrom Membosankan**: Desain bersih (*clean*) **bukan** berarti menghapus warna, mengganti semua kartu dengan wireframe hitam-putih, atau membuat form polosan.
- **Karakter Medis RSU Avisena**: Menggunakan palet biru laut (*Avisena Ocean Blue*), navy rumah sakit yang solid, aksen emerald kesehatan, dan kontras yang tegas.
- **Bentuk Berkarakter (*Distinctive Shapes*)**: Radius kontainer yang lembut namun tegas (`rounded-2xl`, `rounded-[28px]`, `rounded-[32px]`), bingkai avatar tebal berbayang (`border-[6px] border-white shadow-2xl`), dan badge status yang jelas.

---

## 2. Palet Warna Resmi Alice HRIS

| Token / Warna | Kode Hex / Tailwind | Penggunaan |
| :--- | :--- | :--- |
| **Primary Blue** | `#0173b6` / `text-[#0173b6]` | Tombol utama, link aktif, ikon sorotan, border fokus |
| **Deep Medical Navy** | `#05445e` / `bg-[#05445e]` | Hero banner, kartu eksekutif, status kepegawaian |
| **Dark Slate Ground** | `#0f172a` / `bg-slate-900` | Kartu sekunder, biometrik wajah, panel kredensial |
| **Success Emerald** | `#009879` / `text-emerald-600` | Status hadir tepat waktu, biometrik terdaftar, pegawai aktif |
| **Warning Amber** | `text-amber-600` / `bg-amber-50` | Terlambat, pengajuan cuti menunggu, status peringatan |
| **Danger Rose** | `text-rose-600` / `bg-rose-50` | Alpa, biometrik belum terdaftar, cut-off lewat |
| **Surface Neutral** | `bg-slate-50` / `border-slate-200/80` | Latar textbox, kartu data atribut, container sekunder |

---

## 3. Form Controls & Dropdown Craft (No Plain Inputs)

1. **Gunakan Library Dropdown (`react-select`)**:
   - Selalu utamakan `react-select` dengan styling khusus untuk dropdown pilihan shift, pegawai, kategori cuti, atau departemen.
   - Jangan gunakan `<select>` bawaan browser yang kaku tanpa styling.
2. **Textbox & Input Bergaya (*Styled Inputs*)**:
   - Berikan ikon pembantu (`User`, `Mail`, `Phone`, `Calendar`, `IdCard`) di sisi kiri input dengan container ikon (`w-9 h-9 rounded-xl bg-blue-50 text-[#0173b6]`).
   - Gunakan latar `bg-slate-50/80` dengan `border border-slate-200/90 hover:border-slate-300`.
   - Ring fokus jelas: `focus:ring-2 focus:ring-[#0173b6]/20 focus:border-[#0173b6] focus:bg-white transition-all`.
   - Tombol aksi dengan umpan balik fisik: `active:scale-[0.98] transition-all min-h-[44px]`.

---

## 4. Tipografi & Tata Letak Angka

- **Angka Tabular (*Tabular Numbers*)**: Wajib tambahkan `tabular-nums font-mono` untuk semua angka NIP, NIK, tanggal, jam absensi WIB, sisa kuota cuti, nomor telepon, dan nomor rekening.
- **Skala Font Terkendali**: Maksimal 3-4 variasi skala ukuran font per layar.
- **Label Elegan**: Label field menggunakan `text-[10px]` atau `text-xs font-black uppercase tracking-wider text-slate-400`.

---

## 5. Domain Realistis Rumah Sakit & Anti-Slop

1. **Hapus Elemen Dummy yang Tidak Dipakai**:
   - Jangan pasang QR Code Scanner atau QR Absensi palsu jika operasional menggunakan face recognition Kiosk atau absensi GPS mobile.
   - Gantikan dengan komponen bernilai nyata: **ID Card Digital Pegawai Rumah Sakit**, Ringkasan Kehadiran Cut-Off 26–25, atau Kuota Cuti & Rekening Payroll.
2. **Konteks Medis & Tenaga Kesehatan**:
   - Dukung atribut SIP (Surat Izin Praktik) & masa berlaku SIP untuk profesi dokter/perawat/bidan/farmasi.
   - Tampilkan atasan langsung, departemen, dan level jabatan dengan jelas.
3. **Waktu Selalu Asia/Jakarta (WIB)**:
   - Sesuaikan offset +7 jam saat membaca tanggal/jam absensi dari database PostgreSQL.

