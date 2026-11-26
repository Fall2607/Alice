# Website Design Guideline — RSU Avisena Cimahi

Dokumen ini merupakan panduan desain antarmuka (*UI/UX*) dan implementasi visual khusus untuk pengembangan website **RSU Avisena Cimahi**. Panduan ini diturunkan dari *Visual Identity Guidelines 2026 Avisena Healthcare Group* dengan penekanan pada kedekatan lokal masyarakat Cimahi.

## 1. Fondasi & Karakter Brand (Konteks Cimahi)

Sebagai unit rumah sakit pertama dan tempat lahirnya Avisena, website RSU Avisena Cimahi harus membawa kehangatan sejarah sekaligus profesionalisme layanan medis modern:

* **Tema Utama (*Big Idea*):** **"Avisena, Tetangga Sehatmu"** — Menghadirkan pengalaman digital rumah sakit yang ramah, familiar, dan selalu siap membantu warga Cimahi tanpa kesan kaku atau berjarak.

* **Akar Sejarah Lokal:** RSU Avisena lahir dari rumah pribadi dr. Lia di Cimahi, tumbuh organik dari kepedulian terhadap warga dan pekerja sekitar. Cerita ini menjadi jiwa utama pada halaman *Tentang Kami*.

* **Motto:** *"Melayani dengan sepenuh hati"*

* **Visi:** Menjadi Rumah Sakit Swasta Pilihan Utama Masyarakat Jawa Barat dalam Pelayanan dan Informasi Kesehatan.

* **Nilai Utama (*Core Values*):**

  1. **Berintegritas**

  2. **Bertanggung Jawab**

  3. **Berkolaboratif**

  4. **Bertumbuh**

* **Brand DNA:** *Trust* (kepercayaan), *Komunitas* (kedekatan dengan warga Cimahi), *Humanity* (pasien adalah Tamu Mulia), *Pengabdian*, dan *Empati*.

## 2. Prinsip Desain Website RSU Avisena Cimahi

1. **Hangat & Menenangkan (*Approachable*):** Gunakan *whitespace* yang lega, sudut membulat (*rounded*), dan kombinasi warna identitas yang lembut agar pasien dan keluarga merasa nyaman saat mencari informasi kesehatan.

2. **Akses Cepat Layanan 24 Jam:** Informasi paling krusial bagi pasien Cimahi—seperti **Nomor IGD/Ambulance (`022-6000830`)**, **Jadwal Dokter Spesialis**, **Pendaftaran Online (JKN Mobile & Umum/Asuransi)**, dan **WhatsApp Care (`0812-2020-0170`)**—harus langsung terlihat tanpa perlu banyak klik.

3. **Fokus Identitas Lokal dalam Naungan Grup:** Seluruh halaman utama menggunakan identitas **RSU Avisena Cimahi** (*Branch Logo*). Identitas induk (*Avisena Healthcare Group*) cukup ditampilkan secara proporsional sebagai penanda jaringan (*endorsement*) pada bagian *Footer* atau halaman *Tentang Kami*.

4. **Mobile-First & Ramah Segala Usia:** Pastikan teks jadwal dokter mudah dibaca di layar ponsel, kontras warna tinggi, dan ukuran tombol (*touch target*) minimal `44×44px`.

## 3. Sistem Logo Khusus RSU Avisena Cimahi

Logo Avisena mengusung konsep **"Simpul Kepedulian Avisena"** (perpaduan stilasi huruf "L" sebagai penghormatan kepada dr. Lia, simbol DNA & *infinity*, serta elemen tali ikatan).

### 3.1 Varian Logo & Penempatannya di Website

| Varian Logo | Format File | Penggunaan di Website RSU Avisena Cimahi | 
| ----- | ----- | ----- | 
| **Branch Logo Cimahi (Horizontal)** | `.SVG` (utama), `.PNG` | **Logo Utama** pada Header/Navbar Desktop dan Footer website. | 
| **Branch Logo Cimahi (Vertikal)** | `.SVG` | Halaman *About*, *loading screen*, atau kartu profil kontak/lokasi. | 
| **Secondary Logo (Simbol + `avisena`)** | `.SVG` | Header *mobile* saat ruang layar sempit atau pada *sticky navbar*. | 
| **Avatar / Badge `avisena Cimahi`** | `.SVG`, `.PNG` | Ikon profil *chat widget*, *social share preview*, dan *badge* cabang. | 
| **Logogram (Simbol Saja)** | `.SVG`, `.ICO`, `.PNG` | *Favicon* browser (`32×32px`) dan *Apple Touch Icon* (`180×180px`). | 

### 3.2 Ukuran Minimum & Ruang Aman (*Clear Space*)

* **Clear Space:** Sisakan ruang kosong di sekeliling logo minimal sebesar proporsi satu kelopak simbol Avisena. Pastikan menu navigasi atau tombol CTA tidak menempel terlalu dekat dengan logo.

* **Ukuran Minimum Digital (Khusus Branch Logo Cimahi):**

  * **Branch Logo Cimahi Horizontal:** lebar minimal **`115px – 120px`** (tinggi ± `42px`, mengacu standar 3 cm × 1,1 cm).

  * **Branch Logo Cimahi Vertikal:** lebar minimal **`58px – 60px`** (tinggi ± `68px`, mengacu standar 1,5 cm × 1,8 cm).

  * **Avatar / Social Badge Cimahi:** minimal **`30px × 38px`**.

  * **Secondary Logo / Favicon:** minimal **`20px × 20px`**.

### 3.3 Aturan Warna Logo terhadap Latar Belakang (*Background*)

| Latar Belakang (*Background*) | Full Color | White (Putih) | Avisena Blue | Avisena Tosca | Avisena Orange | Black | 
| ----- | ----- | ----- | ----- | ----- | ----- | ----- | 
| **Putih (`#FFFFFF`)** | ✅ Utama | ❌ | ✅ | ✅ | ✅ | ✅ | 
| **Avisena Blue (`#154C96`)** | ❌ | ✅ Utama | ❌ | ✅ | ✅ | ❌ | 
| **Avisena Tosca (`#00A79C`)** | ❌ | ✅ Utama | ✅ | ❌ | ❌ | ✅ | 
| **Avisena Orange (`#F69320`)** | ❌ | ✅ Utama | ✅ | ❌ | ❌ | ✅ | 
| **Hitam / Dark (`#10162C`)** | ❌ | ✅ Utama | ❌ | ✅ | ✅ | ❌ | 
| **Foto / Banner Gambar** | ✅ *(area terang & bersih)* | ✅ *(area gelap/overlay)* | ❌ | ❌ | ❌ | ✅ *(area sangat terang)* | 

### 3.4 Larangan Penggunaan Logo (*Don'ts*)

* ❌ Jangan menggunakan logo *Avisena Healthcare Group* sebagai logo utama di Header website cabang Cimahi (wajib gunakan **Branch Logo `avisena Cimahi`**).

* ❌ Jangan mengubah teks "Cimahi" dengan font lain, mengubah ukuran, atau memindahkan posisinya.

* ❌ Jangan mendistorsi proporsi, memutar, atau membalik (*flip*) simbol.

* ❌ Jangan mengubah susunan warna simbol atau menambahkan efek CSS (*drop shadow*, *outline/stroke*, *glow*).

## 4. Sistem Warna (*Color System*)

### 4.1 Palet Warna Utama (*Primary Colors*)

| Nama Warna | HEX | RGB | Makna & Peran di Website Cimahi | 
| ----- | ----- | ----- | ----- | 
| **Avisena Tosca** | `#00A79C` | `0, 167, 156` | *Tenang & Menyembuhkan.* Warna aksen layanan medis, *badge* poliklinik, ikon fasilitas, tab aktif, dan elemen pendukung. | 
| **Avisena Blue** | `#154C96` | `21, 76, 150` | *Profesional & Terpercaya.* Warna dominan untuk *heading* utama, *top bar*, *footer*, dan blok informasi terpercaya. | 
| **Avisena Orange** | `#F69320` | `246, 147, 32` | *Hangat & Optimis.* Warna khusus tombol *Call-to-Action* (CTA) prioritas (misal: *"Daftar Online"*, *"Cari Jadwal Dokter"*), *highlight* promo, dan pengumuman penting. | 

### 4.2 Palet Warna Sekunder & Netral

| Nama Warna | HEX | RGB | Peran di Website | 
| ----- | ----- | ----- | ----- | 
| **Avisena Dark Navy** | `#10162C` | `16, 22, 44` | Warna teks utama (*body text* dan judul gelap). | 
| **Avisena Grey** | `#B2B5B3` | `178, 181, 179` | Teks sekunder, *placeholder* form, dan ikon non-aktif. | 
| **Avisena Light Grey** | `#E0E4E9` | `224, 228, 233` | *Border* kartu, garis pemisah (*divider*), dan latar *section* alternatif. | 
| **Pure White** | `#FFFFFF` | `255, 255, 255` | Latar belakang utama halaman dan *card*. | 

> **Tints (Opasitas):** Gunakan turunan opasitas **80%**, **50%**, dan **15%** dari warna utama untuk latar *tag*, *alert box*, atau *hover state* (misalnya Tosca 15% untuk latar *badge* nama poliklinik).

### 4.3 CSS Design Tokens (Siap Pakai)

```
:root {
  /* Primary Brand Colors */
  --color-tosca: #00A79C;
  --color-tosca-80: rgba(0, 167, 156, 0.8);
  --color-tosca-50: rgba(0, 167, 156, 0.5);
  --color-tosca-15: rgba(0, 167, 156, 0.15);

  --color-blue: #154C96;
  --color-blue-80: rgba(21, 76, 150, 0.8);
  --color-blue-50: rgba(21, 76, 150, 0.5);
  --color-blue-15: rgba(21, 76, 150, 0.15);

  --color-orange: #F69320;
  --color-orange-80: rgba(246, 147, 32, 0.8);
  --color-orange-50: rgba(246, 147, 32, 0.5);
  --color-orange-15: rgba(246, 147, 32, 0.15);

  /* Neutral & Surface Colors */
  --color-dark-navy: #10162C;
  --color-grey: #B2B5B3;
  --color-light-grey: #E0E4E9;
  --color-white: #FFFFFF;
  --color-bg-subtle: #F7F9FB;

  /* Semantic / Status Colors */
  --color-emergency: #D92D20; /* Khusus label IGD 24 Jam / Ambulance / Alert Darurat */
}

```

## 5. Tipografi (*Typography*)

Typeface resmi adalah **Kanit** (Google Fonts). Gunakan kombinasi ketebalan secara konsisten untuk menjaga hierarki informasi.

### 5.1 Import Font

```
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Kanit:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">

```

### 5.2 Skala Tipografi Website (*Type Scale*)

| Elemen | Weight | Desktop Size | Mobile Size | Line Height | Penggunaan | 
| ----- | ----- | ----- | ----- | ----- | ----- | 
| **Display / Hero H1** | Bold (`700`) / SemiBold (`600`) | `48px` (`3rem`) | `32px` (`2rem`) | `1.15` | Judul utama *Hero Banner* RSU Avisena Cimahi. | 
| **Section Title (H2)** | SemiBold (`600`) | `36px` (`2.25rem`) | `26px` (`1.625rem`) | `1.25` | Judul bagian (misal: *"Layanan Unggulan"*, *"Jadwal Dokter"*). | 
| **Sub-Heading (H3)** | Medium (`500`) / SemiBold (`600`) | `24px` (`1.5rem`) | `20px` (`1.25rem`) | `1.3` | Nama Poliklinik, nama dokter, judul *card* layanan. | 
| **Card Title (H4)** | Medium (`500`) | `18px` (`1.125rem`) | `16px` (`1rem`) | `1.4` | Sub-judul konten, kategori fasilitas. | 
| **Body Large** | Regular (`400`) | `18px` (`1.125rem`) | `16px` (`1rem`) | `1.6` | Paragraf pembuka (*lead text*). | 
| **Body Regular** | Regular (`400`) / Light (`300`) | `16px` (`1rem`) | `14px` (`0.875rem`) | `1.6` | Deskripsi layanan, syarat pendaftaran, artikel edukasi. | 
| **Button / Nav Link** | Medium (`500`) | `15px – 16px` | `14px – 15px` | `1.2` | Tombol aksi dan menu navigasi. | 
| **Caption / Label** | Regular (`400`) | `12px – 13px` | `12px` | `1.4` | Jam praktik kecil, catatan kaki, *copyright*. | 

## 6. Supergraphics, Bentuk & Fotografi

### 6.1 Supergraphics

1. **Pattern Simpul / DNA (*Outline + Fill*):** Aplikasikan sebagai *background accent* pada *Hero Section*, *Banner Pendaftaran*, atau *Footer* dengan opasitas rendah (`8% – 15%`).

2. **Geometric Ribbon Strip (Tosca, Blue, Orange):** Aplikasikan sebagai *accent bar* tipis di tepi *card* atau garis pemisah antar *section*.

### 6.2 Karakter Bentuk (*Border Radius*)

* **Tombol (*Buttons*) & *Badges*:** Bentuk pil (`border-radius: 9999px`) atau *rounded* lembut (`border-radius: 12px`).

* **Kartu (*Cards*) & Modal:** `border-radius: 16px – 24px`.

* **Framing Foto:** Sudut membulat besar (`border-radius: 24px – 40px`) atau sudut lengkung asimetris (mengikuti bentuk kelopak logo Avisena).

### 6.3 Arahan Fotografi Khusus RSU Avisena Cimahi

* **Autentik & Lokal:** Prioritaskan foto asli gedung **RSU Avisena Cimahi (Jl. Melong No. 170)**, ruang **Rawat Inap VIP (New Look)**, fasilitas Rehabilitasi Medik, serta tim dokter dan tenaga kesehatan Cimahi dengan seragam resmi Avisena.

* **Nuansa *Homey* & Hangat:** Tampilkan ekspresi senyum tulus, pencahayaan terang alami, dan interaksi ramah antara dokter dengan pasien/keluarga.

* **Optimasi Web:** Gunakan format `.WebP` dengan resolusi tajam namun ukuran file ringan.

## 7. Panduan Komponen & Struktur Halaman RSU Avisena Cimahi

### 7.1 Header & Navigasi

* **Top Utility Bar (Latar `#154C96`, Teks `#FFFFFF`, Minimalis):**

  * Kiri: Alamat singkat (`Jl. Melong No. 170, Cimahi Selatan, Kota Cimahi`).

  * Kanan: Tautan telepon sederhana **IGD: `(022) 6000830`** dengan teks putih bersih (tanpa badge merah mencolok agar tidak memecah fokus visual dari navigasi utama).

* **Main Navbar (Latar `#FFFFFF`, *sticky*):**

  * Kiri: **Branch Logo `avisena Cimahi` (Horizontal)**.

  * Tengah: Menu ringkas: *Beranda*, *Jadwal Dokter*, *Layanan & Fasilitas*, *Informasi Pasien*, *Artikel Kesehatan*, *Tentang Kami*.

  * Kanan: Tombol CTA utama **Avisena Orange (`#F69320`)** — misal: *"Daftar Online"*.

### 7.2 Modul Fitur Utama Website Cimahi

1. **Quick Search Bar (Di bawah/dalam Hero):** Kolom pencarian instan untuk mencari **Nama Dokter** atau **Poliklinik** (Contoh: *Spesialis Anak, Kandungan & Kebidanan, Penyakit Dalam, Bedah Umum, Rehabilitasi Medik*).

2. **Kartu Jadwal Dokter (*Doctor Schedule Card*):**

   * Foto dokter (berlatar bersih/supergraphics halus), Nama & Gelar, *Badge* Poliklinik (`--color-tosca-15`), Tabel/Chip Jam Praktik (Senin–Sabtu), dan indikator status (*Tersedia* / *Sedang Cuti/OFF*).

3. **Panduan Alur Pendaftaran (2 Jalur Jelas):**

   * **Pasien BPJS Kesehatan:** Arahkan jelas ke pendaftaran melalui aplikasi **Mobile JKN** (H-30 s/d H-1 jadwal kunjungan).

   * **Pasien Umum & Asuransi:** Sediakan tombol langsung menuju **WhatsApp Customer Service (`0812-2020-0170`)** atau formulir reservasi online.

4. **Showcase Instalasi & Fasilitas Rumah Sakit (Terpisah dari Direktori Poliklinik agar Tidak Redundan):**

   * **Banner Utama IGD 24 Jam & Ambulance Cepat:** Menampilkan nomor hotline `(022) 6000830` dan 3 pilar kesiagaan darurat.
   * **Showcase Besar Rawat Inap *New Look* (12 Kolom):** Menampilkan foto kamar berukuran besar (`800×550px`) bersanding dengan tab interaktif 4 kelas kamar (**Suite VIP**, **Kelas 1**, **Kelas 2**, dan **Kelas 3** — tanpa melabeli Kelas 3 khusus BPJS).
   * **4 Unit Instalasi Medis & Penunjang (Grid 2×2):**
     1. *Kamar Bersalin (VK), Operasi (OK) & Perinatologi*
     2. *Rehabilitasi Medik, Fisioterapi & Hemodialisa*
     3. *Laboratorium Klinik, Radiologi Digital (USG 4D/Rontgen) & MCU*
     4. *Instalasi Farmasi & Apotek Siaga 24 Jam*
   * *Catatan UX:* Daftar Poliklinik Rawat Jalan tidak diulang di section ini, melainkan terpusat seluruhnya pada section **Jadwal Dokter & Filter Poliklinik** tepat di bawahnya.

### 7.3 Floating Action Button

* Tombol bulat ringkas (`48×48px`) di pojok kanan bawah dengan **ikon resmi WhatsApp** untuk menghubungi **RSU Avisena Cimahi (`0812-2020-0170`)** tanpa teks memanjang agar tidak menutupi konten halaman.

### 7.4 Footer (Informasi Resmi RSU Avisena Cimahi)

Menggunakan latar belakang **Avisena Blue (`#154C96`)** atau **Dark Navy (`#10162C`)** dengan logo **`avisena Cimahi` versi Putih**:

* **Alamat:** Jl. Melong No. 170, Kel. Melong, Kec. Cimahi Selatan, Kota Cimahi, Jawa Barat (disertai tombol *"Buka di Google Maps"*).

* **Telepon / IGD:** `022-6000830`

* **WhatsApp Layanan:** `0812-2020-0170`

* **Email:** `rsavisena@gmail.com` / `cs@rsavisena.co.id`

* **Website:** `www.rsavisena.co.id`

* **Media Sosial:** Instagram `@rsu_avisena` | Facebook `RSU Avisena` | YouTube `RSU Avisena`.

* **Penanda Jaringan (*Endorsement*):** Teks kecil di baris paling bawah: *"Bagian dari Avisena Healthcare Group — Melayani juga di Pangalengan, Kuningan, Subang, dan Cikampek."*

## 8. Gaya Bahasa & UX Writing (*Tone of Voice*)

Seluruh copywriting website RSU Avisena Cimahi harus mencerminkan karakter **Penuh Empati, Ramah, Hangat, dan Sederhana**:

* Gunakan sapaan akrab seperti **"Sahabat Avisena"** atau **"Warga Cimahi"**.

* Hindari istilah medis yang membingungkan; gunakan bahasa sehari-hari yang mudah dipahami.

* Hindari pesan sistem yang kaku atau terasa seperti bot.

| Konteks UI | ❌ Hindari (Kaku) | ✅ Gunakan (Hangat & Lokal Cimahi) | 
| ----- | ----- | ----- | 
| **Hero Headline** | *"Rumah Sakit Umum Swasta Tipe C di Kota Cimahi."* | *"Lebih Peduli, Lebih Dekat. Tetangga Sehat Keluarga Anda di Cimahi."* | 
| **Search Placeholder** | *"Cari dokter/poliklinik"* | *"Cari dokter spesialis atau layanan yang Anda butuhkan..."* | 
| **Info Jadwal Cuti** | *"Dokter tidak tersedia."* | *"Mohon maaf, dr. \[Nama\] sedang tidak praktik pada tanggal ini. Yuk cek jadwal hari lain atau tanya admin via WhatsApp."* | 
| **Tombol Kontak** | *"Hubungi CS"* | *"Tanya Admin via WhatsApp"* | 

## 9. Aset Brand & Referensi Teknis

* **Format Aset Web:** Logo & Supergraphics wajib **`.SVG`**, Foto wajib **`.WebP`** (dengan *fallback* `.JPG`/`.PNG`), Font **`.WOFF2`** / Google Fonts (`Kanit`).

* **Pustaka Aset Resmi (Logo Cabang Cimahi, Supergraphics, dll.):**

  * [Google Drive Brand Assets RSU Avisena Cimahi](https://drive.google.com/drive/folders/1BXpOMHr14etRLL5pJV93ITvREELRZdq_?usp=sharing)

* **Kontak Dukungan Desain & Persetujuan Brand:**

  * **Design Lead:** Pikirmikir Design Studio (`@Pikirmikir`)

  * **Email:** `pikirmikir.designstudio@gmail.com`

  * **Telepon:** `+622 204 555 25` | `+62 8221 918 6650`