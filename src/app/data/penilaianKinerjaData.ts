// Path: src/app/data/penilaianKinerjaData.ts

export interface IndikatorPenilaian {
  id: string;
  aspekNo: number;
  aspekNama: string;
  nama: string;
  keterangan?: string;
  bobot: number;
  isManagerial?: boolean;
}

export interface KaryawanKontrakItem {
  id: string;
  nip: string;
  nama_lengkap: string;
  gelar_depan?: string;
  gelar_belakang?: string;
  departemen: string;
  unit: string;
  jabatan: string;
  level: "Staff" | "Koordinator" | "SPV" | "Kanit" | "Manager";
  hasSubordinates: boolean; // Jika true, mengisi Aspek 10 (Managerial)
  tgl_mulai_kontrak: string;
  tgl_selesai_kontrak: string;
  sisa_hari: number;
  
  // Hierarki Penilai:
  // Staff dinilai Koordinator
  // Koordinator dinilai SPV
  // SPV dinilai Direktur / Manager
  penilai: {
    nama: string;
    jabatan: string;
    email: string;
    level: string;
  };

  // Status evaluasi magic link
  statusPenilaian: "BELUM_DIKIRIM" | "MENUNGGU_PENILAIAN" | "SELESAI";
  magicLinkToken: string;
  tgl_kirim_link?: string;
  tgl_dinilai?: string;

  // Hasil penilaian jika sudah selesai
  hasil?: {
    totalSkor: number;
    indeksPrestasi: number;
    norma: number;
    kategoriNorma: "KURANG" | "CUKUP" | "BAIK" | "EXCELENT";
    rekomendasi: {
      tipe: "KONTRAK" | "TETAP" | "MUTASI" | "PROMOSI" | "DEMOSI";
      detail: string;
    };
  };
}

// 10 Aspek & Indikator Penilaian Kinerja Karyawan Resmi RSU Avisena
// Form Penilaian/ HRD/XI/ REV.1
export const INDIKATOR_PENILAIAN_LIST: IndikatorPenilaian[] = [
  // 1. Prestasi Kerja
  {
    id: "pk_1",
    aspekNo: 1,
    aspekNama: "Prestasi Kerja",
    nama: "Kualitas Kerja",
    keterangan: "Tingkat ketelitian, kerapihan, dan kesesuaian hasil kerja terhadap standar SOP.",
    bobot: 5,
  },
  {
    id: "pk_2",
    aspekNo: 1,
    aspekNama: "Prestasi Kerja",
    nama: "Kuantitas Kerja",
    keterangan: "Volume atau jumlah hasil kerja yang diselesaikan sesuai target beban kerja.",
    bobot: 3,
  },
  {
    id: "pk_3",
    aspekNo: 1,
    aspekNama: "Prestasi Kerja",
    nama: "Kecepatan Kerja",
    keterangan: "Ketepatan waktu dan efisiensi durasi penyelesaian tugas kerja harian.",
    bobot: 3,
  },
  {
    id: "pk_4",
    aspekNo: 1,
    aspekNama: "Prestasi Kerja",
    nama: "Inisiatif",
    keterangan: "Kemauan proaktif memulai tindakan tanpa harus menunggu instruksi berulang.",
    bobot: 4,
  },
  {
    id: "pk_5",
    aspekNo: 1,
    aspekNama: "Prestasi Kerja",
    nama: "Penguasaan Bidang Pekerjaan",
    keterangan: "Keahlian teknis, pemahaman tugas pokok, dan keterampilan spesifik unit kerja.",
    bobot: 5,
  },

  // 2. Sikap Kerja
  {
    id: "sk_1",
    aspekNo: 2,
    aspekNama: "Sikap Kerja",
    nama: "SMART (Senyum, Sapa, Salam, Menarik, Antusias, Responsif, Terima Kasih)",
    keterangan: "Penerapan budaya pelayanan ramah dan etika komunikasi kepada pasien & rekan kerja.",
    bobot: 4,
  },

  // 3. Kejujuran
  {
    id: "kj_1",
    aspekNo: 3,
    aspekNama: "Kejujuran",
    nama: "Kejujuran & Integritas Kerja",
    keterangan: "Kejujuran dalam pelaporan, transparansi kerja, dan menjaga kepercayaan instansi.",
    bobot: 5,
  },

  // 4. Kerjasama & Koordinasi
  {
    id: "kk_1",
    aspekNo: 4,
    aspekNama: "Kerjasama & Koordinasi",
    nama: "Komunikasi",
    keterangan: "Kemampuan berkoordinasi, menyampaikan pesan jelas, dan bekerja sama dalam tim.",
    bobot: 4,
  },

  // 5. Kematangan/Kedewasaan
  {
    id: "km_1",
    aspekNo: 5,
    aspekNama: "Kematangan/Kedewasaan",
    nama: "Pendekatan Terhadap Masalah / Obyektifitas",
    keterangan: "Sikap tenang, tidak emosional, dan objektif dalam mencari jalan keluar kendala kerja.",
    bobot: 4,
  },

  // 6. Disiplin
  {
    id: "ds_1",
    aspekNo: 6,
    aspekNama: "Disiplin",
    nama: "Teguran Lisan & Surat Peringatan",
    keterangan: "Kepatuhan terhadap tata tertib rumah sakit, rekam jejak teguran/peringatan.",
    bobot: 4,
  },

  // 7. Kehadiran
  {
    id: "kh_1",
    aspekNo: 7,
    aspekNama: "Kehadiran",
    nama: "Keterlambatan",
    keterangan: "Disiplin jam kedatangan dan kepatuhan waktu pergantian shift.",
    bobot: 3,
  },
  {
    id: "kh_2",
    aspekNo: 7,
    aspekNama: "Kehadiran",
    nama: "Kehandalan",
    keterangan: "Tingkat absensi, pemenuhan jadwal tugas, dan ketersediaan saat dibutuhkan.",
    bobot: 3,
  },

  // 8. Loyalitas
  {
    id: "ly_1",
    aspekNo: 8,
    aspekNama: "Loyalitas",
    nama: "Loyalitas & Dedikasi",
    keterangan: "Komitmen terhadap visi misi rumah sakit dan kesediaan mendukung target bersama.",
    bobot: 5,
  },

  // 9. Inovasi/Kreatifitas
  {
    id: "in_1",
    aspekNo: 9,
    aspekNama: "Inovasi/Kreatifitas",
    nama: "Ide/Gagasan Baru, Kemampuan Berinisiatif, Mandiri Tanpa Pengawasan",
    keterangan: "Kemampuan memberikan usulan perbaikan alur kerja dan mandiri memecahkan masalah.",
    bobot: 4,
  },

  // 10. Kemampuan Managerial (Khusus Level Kanit ke atas yang memiliki bawahan)
  {
    id: "mg_1",
    aspekNo: 10,
    aspekNama: "Kemampuan Managerial",
    nama: "Perencanaan",
    keterangan: "Kemampuan merancang rencana kerja, alokasi sumber daya, dan mitigasi kendala unit.",
    bobot: 4,
    isManagerial: true,
  },
  {
    id: "mg_2",
    aspekNo: 10,
    aspekNama: "Kemampuan Managerial",
    nama: "Kontrol",
    keterangan: "Pengawasan berkala terhadap proses kerja bawahan dan kepatuhan standar pelayanan.",
    bobot: 4,
    isManagerial: true,
  },
  {
    id: "mg_3",
    aspekNo: 10,
    aspekNama: "Kemampuan Managerial",
    nama: "Kepemimpinan",
    keterangan: "Kemampuan memotivasi tim, ketegasan mengambil keputusan, dan menjadi teladan.",
    bobot: 4,
    isManagerial: true,
  },
  {
    id: "mg_4",
    aspekNo: 10,
    aspekNama: "Kemampuan Managerial",
    nama: "Bimbingan & Arahan",
    keterangan: "Membimbing staf bawahan, melakukan transfer ilmu, dan memfasilitasi solusi kerja.",
    bobot: 4,
    isManagerial: true,
  },
];

// Tabel Klasifikasi Norma Resmi
export function getKategoriNorma(normaScore: number): "KURANG" | "CUKUP" | "BAIK" | "EXCELENT" {
  if (normaScore >= 3.50) return "EXCELENT";
  if (normaScore >= 2.76) return "BAIK";
  if (normaScore >= 2.00) return "CUKUP";
  return "KURANG";
}

export function getNormaColorBadge(kategori: "KURANG" | "CUKUP" | "BAIK" | "EXCELENT") {
  switch (kategori) {
    case "EXCELENT":
      return "bg-emerald-100 text-emerald-800 border-emerald-300";
    case "BAIK":
      return "bg-blue-100 text-blue-800 border-blue-300";
    case "CUKUP":
      return "bg-amber-100 text-amber-800 border-amber-300";
    case "KURANG":
      return "bg-rose-100 text-rose-800 border-rose-300";
  }
}

// Mock Data Karyawan yang Akan Habis Kontrak Dalam 3 Bulan Kedepan
// Disertai hierarki penilai sesuai instruksi:
// Staff -> dinilai Koordinator
// Koordinator -> dinilai SPV
// SPV -> dinilai Direktur
export const MOCK_KARYAWAN_KONTRAK: KaryawanKontrakItem[] = [
  {
    id: "emp-ktr-001",
    nip: "AVS-2023-0412",
    nama_lengkap: "Nuraeni Tri Wahyuni",
    gelar_depan: "Ns.",
    gelar_belakang: "S.Kep",
    departemen: "Keperawatan",
    unit: "Rawat Inap Marwah",
    jabatan: "Perawat Pelaksana",
    level: "Staff",
    hasSubordinates: false,
    tgl_mulai_kontrak: "2025-12-01",
    tgl_selesai_kontrak: "2026-11-30",
    sisa_hari: 38,
    penilai: {
      nama: "Ns. Siti Rahmawati, S.Kep",
      jabatan: "Koordinator Rawat Inap Marwah",
      email: "siti.rahma@avisena.co.id",
      level: "Koordinator",
    },
    statusPenilaian: "MENUNGGU_PENILAIAN",
    magicLinkToken: "AVS-EVAL-7A9B1C3D",
    tgl_kirim_link: "2026-10-20T08:30:00Z",
  },
  {
    id: "emp-ktr-002",
    nip: "AVS-2024-0105",
    nama_lengkap: "Dimas Arya Pratama",
    gelar_depan: "Amd.",
    gelar_belakang: "Farm",
    departemen: "Penunjang Medis",
    unit: "Instalasi Farmasi",
    jabatan: "Tenaga Teknis Kefarmasian",
    level: "Staff",
    hasSubordinates: false,
    tgl_mulai_kontrak: "2026-01-01",
    tgl_selesai_kontrak: "2026-12-31",
    sisa_hari: 69,
    penilai: {
      nama: "apt. Hendra Setiawan, S.Farm",
      jabatan: "Koordinator Pelayanan Farmasi",
      email: "hendra.farmasi@avisena.co.id",
      level: "Koordinator",
    },
    statusPenilaian: "BELUM_DIKIRIM",
    magicLinkToken: "AVS-EVAL-3F4E5D6C",
  },
  {
    id: "emp-ktr-003",
    nip: "AVS-2022-0881",
    nama_lengkap: "apt. Hendra Setiawan",
    gelar_depan: "apt.",
    gelar_belakang: "S.Farm",
    departemen: "Penunjang Medis",
    unit: "Instalasi Farmasi",
    jabatan: "Koordinator Pelayanan Farmasi",
    level: "Koordinator",
    hasSubordinates: true,
    tgl_mulai_kontrak: "2025-11-15",
    tgl_selesai_kontrak: "2026-11-15",
    sisa_hari: 23,
    penilai: {
      nama: "dr. Maya Anggraini, Sp.PK",
      jabatan: "Supervisor Penunjang Medis",
      email: "maya.spvmedis@avisena.co.id",
      level: "SPV",
    },
    statusPenilaian: "SELESAI",
    magicLinkToken: "AVS-EVAL-9X8Y7Z6W",
    tgl_kirim_link: "2026-10-15T09:00:00Z",
    tgl_dinilai: "2026-10-18T14:20:00Z",
    hasil: {
      totalSkor: 2394,
      indeksPrestasi: 700,
      norma: 3.42,
      kategoriNorma: "EXCELENT",
      rekomendasi: {
        tipe: "TETAP",
        detail: "Dapat diangkat sebagai karyawan tetap sesuai dengan fungsinya.",
      },
    },
  },
  {
    id: "emp-ktr-004",
    nip: "AVS-2023-0914",
    nama_lengkap: "dr. Maya Anggraini",
    gelar_depan: "dr.",
    gelar_belakang: "Sp.PK",
    departemen: "Pelayanan Medis",
    unit: "Komite Medis",
    jabatan: "Supervisor Penunjang Medis",
    level: "SPV",
    hasSubordinates: true,
    tgl_mulai_kontrak: "2025-12-10",
    tgl_selesai_kontrak: "2026-12-10",
    sisa_hari: 48,
    penilai: {
      nama: "dr. H. Riza Avisena, M.M.",
      jabatan: "Direktur Pelayanan Medis & Keperawatan",
      email: "direktur.medis@avisena.co.id",
      level: "Direktur",
    },
    statusPenilaian: "MENUNGGU_PENILAIAN",
    magicLinkToken: "AVS-EVAL-5K4L3M2N",
    tgl_kirim_link: "2026-10-21T10:15:00Z",
  },
  {
    id: "emp-ktr-005",
    nip: "AVS-2024-0320",
    nama_lengkap: "Rian Hidayat",
    gelar_depan: "",
    gelar_belakang: "A.Md.RMIK",
    departemen: "Rekam Medis",
    unit: "Pendaftaran & Rekam Medis",
    jabatan: "Staff Registrasi Pasien",
    level: "Staff",
    hasSubordinates: false,
    tgl_mulai_kontrak: "2026-01-15",
    tgl_selesai_kontrak: "2027-01-14",
    sisa_hari: 83,
    penilai: {
      nama: "Fajar Nugraha, S.ST",
      jabatan: "Koordinator Rekam Medis",
      email: "fajar.rekammedis@avisena.co.id",
      level: "Koordinator",
    },
    statusPenilaian: "BELUM_DIKIRIM",
    magicLinkToken: "AVS-EVAL-1Q2W3E4R",
  },
  {
    id: "emp-ktr-006",
    nip: "AVS-2023-1102",
    nama_lengkap: "Budi Santoso",
    gelar_depan: "",
    gelar_belakang: "S.Kom",
    departemen: "Teknologi Informasi",
    unit: "IT Support & Jaringan",
    jabatan: "Staff IT Programmer",
    level: "Staff",
    hasSubordinates: false,
    tgl_mulai_kontrak: "2025-11-01",
    tgl_selesai_kontrak: "2026-11-01",
    sisa_hari: 9,
    penilai: {
      nama: "Ahmad Fauzi, M.T.",
      jabatan: "Koordinator Sistem Informasi & IT",
      email: "ahmad.fauzi@avisena.co.id",
      level: "Koordinator",
    },
    statusPenilaian: "SELESAI",
    magicLinkToken: "AVS-EVAL-8H7J6K5L",
    tgl_kirim_link: "2026-10-10T08:00:00Z",
    tgl_dinilai: "2026-10-14T11:45:00Z",
    hasil: {
      totalSkor: 1792,
      indeksPrestasi: 580,
      norma: 3.09,
      kategoriNorma: "BAIK",
      rekomendasi: {
        tipe: "KONTRAK",
        detail: "Dapat diperpanjang kontrak 1 (satu) tahun.",
      },
    },
  },
];
