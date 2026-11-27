# Standar Perhitungan Presensi & Rekapitulasi Kehadiran — Alice HRIS (RSU Avisena)

Dokumen ini mendefinisikan aturan bisnis, formula matematis, klasifikasi status kehadiran harian, serta arsitektur *Single Source of Truth* untuk seluruh perhitungan presensi kehadiran pegawai pada sistem **Alice HRIS RSU Avisena**.

---

## 1. Arsitektur *Single Source of Truth*

Seluruh perhitungan presensi dan persentase kehadiran terpusat pada satu modul kalkulasi utama agar angka yang tampil di seluruh halaman **100% konsisten dan tidak pernah berselisih**:

- **Core Calculation Engine**: `src/app/lib/absensiRekap.ts` (`calculateAbsensiRekap`)
- **Endpoint API Pengguna**:
  1. `GET /api/absensi/rekap` — Melayani halaman **Rekapitulasi Kehadiran** (`/admin/kehadiran/rekap`).
  2. `GET /api/absensi/dashboard` — Melayani **Dashboard Utama Awal Login** (`/admin` untuk HC Admin, Leader/Atasan, maupun Staf Mandiri) serta **Dashboard Kehadiran** (`/admin/kehadiran/dashboard`).

---

## 2. Aturan Periode Cut-Off Baku (26 – 25)

1. **Siklus Bulanan Cut-Off**:
   - Setiap periode evaluasi kehadiran bulanan RSU Avisena dimulai dari **tanggal 26 bulan sebelumnya** hingga **tanggal 25 bulan berjalan/terpilih** (Zona Waktu: `Asia/Jakarta` / WIB).
2. **Penentuan Periode Aktif Otomatis (`getCutOffPeriod`)**:
   - **Jika tanggal hari ini `< 26`** (misal: 15 November 2026):
     - *Bulan Berjalan (26–25)*: `26 Oktober 2026` s/d `25 November 2026`.
     - *Bulan Lalu (26–25)*: `26 September 2026` s/d `25 Oktober 2026`.
   - **Jika tanggal hari ini `>= 26`** (misal: 27 November 2026):
     - *Bulan Berjalan (26–25)*: `26 November 2026` s/d `25 Desember 2026`.
     - *Bulan Lalu (26–25)*: `26 Oktober 2026` s/d `25 November 2026`.
3. **Batas Evaluasi Hari Berjalan (`dateStr <= todayStr`)**:
   - Perhitungan akumulasi hari kerja dan Alpha hanya mengevaluasi tanggal yang **telah berjalan hingga hari ini (`tanggal <= hari ini`)**.
   - Tanggal masa depan (`tanggal > hari ini`) yang belum memiliki plot Cuti/Izin/Libur diberi status `"belum"` (*Belum Waktunya*) dan **tidak dimasukkan ke dalam penyebut** agar persentase kehadiran di awal periode cut-off tidak anjlok karena hari esok yang belum dijalani.

---

## 3. Klasifikasi Status Kehadiran Harian

Untuk setiap pegawai aktif (`is_active = true AND tanggal_keluar IS NULL`) dan setiap tanggal dalam rentang evaluasi:

1. **Cuti (`cuti`)**:
   - Pegawai memiliki plot jadwal/shift yang mengandung kata `"cuti"` (misal: *Cuti Tahunan*, *Cuti Melahirkan*).
2. **Izin / Sakit (`izin`)**:
   - Pegawai memiliki plot jadwal/shift yang mengandung kata `"izin"` atau `"sakit"`.
3. **Hadir Tepat Waktu (`hadir`)**:
   - Terdapat catatan check-in pada tabel `absensi` di tanggal tersebut dengan `is_late = false`.
4. **Hadir Terlambat (`telat`)**:
   - Terdapat catatan check-in pada tabel `absensi` di tanggal tersebut dengan `is_late = true`.
   - *Catatan:* Dalam variabel agregat `totalHadir`, nilai `totalHadir` merupakan gabungan **`Hadir Tepat Waktu + Hadir Terlambat`**, sedangkan `totalTepatWaktu = totalHadir - totalTelat`.
5. **Libur / Day Off (`libur`)**:
   - Pegawai memiliki plot shift yang mengandung kata `"libur"`, `"off"`, `"lepas"`, atau shift tanpa `jam_masuk`; **ATAU**
   - Pegawai memiliki **Jadwal Tetap (*Non-Shift*)** yang terdaftar di `jadwal_kerja_detail` pada hari Sabtu/Minggu (`isWeekend`) dan tidak sedang dijadwalkan piket Sabtu.
6. **Alpha / Tanpa Keterangan (`alpha`)**:
   - Berlaku pada tanggal yang sudah berjalan (`tanggal <= hari ini`) apabila pegawai tidak sedang Cuti, tidak Izin/Sakit, tidak Libur resmi, dan tidak memiliki log presensi hadir:
     - **Kasus 1 (Terplotting Shift tetapi Tidak Hadir)**: Pegawai memiliki jadwal shift aktif pada hari tersebut namun tidak melakukan presensi.
     - **Kasus 2 (Tidak Terplotting Shift / `!adaShift`)**: Pegawai yang **belum/tidak terplotting jadwal shiftnya** pada tanggal `<= hari ini` dan tidak hadir **wajib dihitung sebagai Alpha** (`"Belum Diplot (Alpha)"`). Pegawai tanpa konfigurasi jadwal tetap maupun tanpa plotting shift tidak mendapatkan libur akhir pekan otomatis.

---

## 4. Formula Matematis Persentase Kehadiran

### 4.1. Rumus Harian (1 Hari / Real-Time Hari Ini)
Digunakan untuk menghitung rasio kehadiran harian pada kartu *Hadir Hari Ini* di `/admin/kehadiran/dashboard`:

$$\text{Persentase Kehadiran Hari Ini (\%)} = \frac{(\text{Hadir Tepat Waktu} + \text{Hadir Terlambat} + \text{Cuti} + \text{Izin}) \times 100}{\text{Total Karyawan} - \text{Pegawai Libur / Day Off Hari Ini}}$$

### 4.2. Rumus Periode Cut-Off / Multi-Hari (Per Individu & Rata-Rata RS/Unit)
Digunakan pada **Rekapitulasi Kehadiran (`/admin/kehadiran/rekap`)**, **Dashboard Utama Awal Login (`/admin`)**, dan **Gauge Kedisiplinan Bulanan (`/admin/kehadiran/dashboard`)** untuk seluruh hari yang telah dievaluasi (`tanggal <= hari ini`):

$$\text{Persentase Kehadiran (\%)} = \frac{(\text{Hadir Tepat Waktu} + \text{Hadir Terlambat} + \text{Cuti} + \text{Izin}) \times 100}{\text{Total Hari Evaluasi} - \text{Total Hari Libur / Day Off}}$$

Karena pada seluruh hari yang telah dievaluasi (`non-belum`), setiap hari pasti terklasifikasi ke dalam `{Tepat Waktu, Terlambat, Cuti, Izin, Alpha, Libur}`, maka:

- **Pembilang (Kehadiran Positif)**:
  $$\text{Pembilang} = \text{Hadir Tepat Waktu} + \text{Hadir Terlambat} + \text{Cuti} + \text{Izin}$$
- **Penyebut (Total Hari Kerja Wajib Non-Libur)**:
  $$\text{Penyebut} = \text{Total Hari Evaluasi} - \text{Libur / Day Off} = \text{Hadir Tepat Waktu} + \text{Hadir Terlambat} + \text{Cuti} + \text{Izin} + \text{Alpha}$$

### 4.3. Rumus Persentase Cuti & Persentase Izin

$$\text{Persentase Cuti (\%)} = \frac{\text{Total Hari Cuti} \times 100}{\text{Total Hari Evaluasi} - \text{Total Hari Libur / Day Off}}$$

$$\text{Persentase Izin (\%)} = \frac{\text{Total Hari Izin} \times 100}{\text{Total Hari Evaluasi} - \text{Total Hari Libur / Day Off}}$$

---

## 5. Standar Tampilan Kartu KPI Rekapitulasi Kehadiran (`/admin/kehadiran/rekap`)

Baris KPI Summary Ribbon pada halaman Rekapitulasi Kehadiran menampilkan **6 Card Sejajar** dengan tipografi angka `font-mono tabular-nums`:

1. **Card 1 — Total Karyawan**: Jumlah total pegawai aktif dalam cakupan filter beserta total akumulasi hari hadir fisik.
2. **Card 2 — Rata-Rata Kehadiran (Rate %)**: Persentase kehadiran hasil formula bagian 4.2 beserta rasio `Pembilang / Penyebut Hari Wajib`.
3. **Card 3 — Tepat Waktu vs Telat (Pembanding Disiplin)**:
   - Menampilkan 2 kotak pembanding berdampingan:
     - **Hijau Emerald**: Jumlah **`User`** yang memiliki kehadiran tepat waktu beserta total frekuensi **`Xx Tepat`**.
     - **Kuning Amber**: Jumlah **`User`** yang pernah terlambat beserta total frekuensi **`Yx Telat`**.
   - Dilengkapi **Mini Progress Bar 2 Segmen** (Emerald vs Amber) untuk memperlihatkan perbandingan visual proporsi tepat waktu terhadap keterlambatan.
4. **Card 4 — Total Alpha & Izin**: Total akumulasi hari Alpha, jumlah user yang memiliki Alpha, serta badge persentase dan jumlah hari Izin/Sakit.
5. **Card 5 — Pegawai Cuti**: Jumlah user yang mengambil cuti, total hari cuti terpakai, serta badge persentase cuti.
6. **Card 6 — Pegawai Libur**: Jumlah user yang memiliki jadwal libur serta total akumulasi hari plot libur/off.
