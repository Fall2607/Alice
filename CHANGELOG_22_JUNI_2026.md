# Changelog Pembaruan Sistem (22 Juni 2026)

Dokumen ini berisi daftar lengkap pembaruan sistem absensi (Alice) terkait fitur Manajemen Jadwal dan Kiosk Face Recognition yang diselesaikan pada sesi ini.

## 1. Perbaikan Bug Skema Database & Timezone
- **Konteks:** Sebelumnya, ketika user menyimpan tanggal *shift* tertentu (misalnya 2 Juni), PostgreSQL memproses zona waktunya sehingga tanggal bergeser mundur menjadi 1 Juni di backend.
- **Penyelesaian:** Tipe data pada kolom `tanggal` di tabel `karyawan_shift` diubah dari `DATE` menjadi `VARCHAR(10)`. Sistem sekarang merekam dan membaca tanggal secara eksplisit dalam format teks "YYYY-MM-DD" tanpa manipulasi zona waktu otomatis.
- **Dampak:** *Plotting* hari ini sudah dipastikan akurat dan tidak akan tumpang-tindih beda hari.

## 2. Inklusi Fitur "Libur / Off" Explicit
- **Konteks:** Sulit melacak user yang sengaja diliburkan (karena tidak ada rekam jejak di database).
- **Penyelesaian:**
  - *Database:* Skema tabel `shift` diubah agar field `jam_masuk` dan `jam_keluar` boleh tidak diisi (`NULL`).
  - Menambahkan *template* shift baru bernama **"Libur / Off"** ke dalam tabel `shift`.
  - *Frontend:* Menambahkan instruksi `force-dynamic` di API (`/api/shift`) agar Next.js tidak lagi menyajikan data "usang" (cache) ke halaman UI.
- **Dampak:** HRD kini bisa secara eksplisit menceklis hari *Libur* bagi pegawai.

## 3. Rombakan Antarmuka "Roster Board" (UI)
- **Konteks:** Menata jadwal untuk 1 bulan penuh harus dilakukan satu-persatu per pegawai (melelahkan).
- **Penyelesaian:** Halaman **Manajemen Jadwal > Plotting Shift** (`/admin/jadwal-kerja/plotting`) direkonstruksi menjadi matriks *Board* bulanan. Baris mewakili tanggal, dan kolom mewakili shift.
- **Pemisahan Logis:**
  - **Tab Board Shifting (24/7):** Menampilkan semua tanggal, namun kolom difilter HANYA menampilkan *Shift Pagi*, *Siang*, *Malam*, dan *Libur/Off*.
  - **Tab Board Piket Sabtu (SPV):** Memfilter baris agar HANYA memunculkan **Hari Sabtu** saja selama bulan tersebut. Kolom difilter hanya menampilkan *Normal 8-4 (Sabtu)*.
- **Fitur Mass-Assign:** Menambahkan fitur Modal *checkbox* dengan fungsionalitas **Pencarian Nama/NIK** yang dapat memasukkan banyak pegawai sekaligus ke dalam 1 slot *Shift* dengan sekali *Simpan*.

## 4. Logika Mesin Absensi Kiosk (`verify-face`)
- **Konteks:** Automasi jam kerja antara `8-4` (jika dapat piket) dan `8-5` (jika tidak) untuk jajaran Manajerial/Supervisor.
- **Penyelesaian:** API utama absensi Kiosk (`/api/absensi/verify-face`) ditambahkan kecerdasan mendeteksi posisi *Manager*, *Director*, *Supervisor*, atau *Koordinator*:
  1. Jika jabatan *user* mengandung keyword tersebut dan dia absen pada hari **Senin s/d Jumat**, Kiosk akan melakukan pengecekan data di *database*.
  2. Kiosk menanyakan: *"Apakah pada Hari Sabtu minggu ini dia punya jadwal Shift?"*
  3. Jika **ADA**, jam kerja otomatis diubah menjadi `8-4`.
  4. Jika **TIDAK**, jam kerja otomatis diubah menjadi `8-5`.
- **Fitur Blokir Check-In Libur:** Jika user terdeteksi tidak memiliki jadwal (berstatus Libur/Off), layar Kiosk otomatis mengunci tombol Absen Masuk dan menolak akses (*Reject*) demi menertibkan data.

---
**Branch Saat Ini:** `development`
**Disusun Oleh:** Antigravity (AI Assistant)
