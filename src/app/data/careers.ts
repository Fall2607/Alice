// File: app/data/careers.ts

export interface JobOpening {
  id: number;
  title: string;
  department: string;
  type: "Penuh Waktu" | "Paruh Waktu" | "Kontrak";
  location: string;
  category: "Medis" | "Non-Medis";
  position: string;
  link: string;
  postedDate: string; // format ISO date string, contoh: "2025-08-25"
  description: string;
  qualifications: string[];
}


// Daftar posisi unik untuk filter
export const jobPositions = {
  Medis: [
    "Dokter Spesialis",
    "Dokter Umum",
    "Dokter Gigi",
    "Perawat",
    "Bidan",
    "Apoteker",
    "Asisten Apoteker",
    "Analis Lab",
    "Radiografer",
    "Fisioterapis",
    "Rekam Medis",
    "Ahli Gizi",
    "Penata Anestesi",
    "Kesehatan Lingkungan",
    "Asisten Perawat",
  ],
  "Non-Medis": [
    "Administrasi",
    "HC & Legal",
    "Keuangan",
    "Billing",
    "IT",
    "Marketing",
    "General Affair",
    "Teknisi",
    "Driver",
    "Laundry",
    "Pantry",
  ],
};

export const jobOpenings: JobOpening[] = [
  {
    id: 1,
    title: "Perawat Senior (ICU)",
    department: "Keperawatan",
    type: "Penuh Waktu",
    location: "Bandung, Jawa Barat",
    category: "Medis",
    position: "Perawat",
    link: "/karir/perawat-senior-icu",
    postedDate: "2025-08-25",
    description: "Bertanggung jawab dalam memberikan perawatan intensif kepada pasien di ICU, memastikan standar keselamatan pasien terpenuhi, serta membimbing perawat junior.",
    qualifications: [
      "Pendidikan minimal D3/S1 Keperawatan",
      "Memiliki STR aktif",
      "Pengalaman minimal 3 tahun di ICU",
      "Mampu bekerja dalam tim multidisiplin"
    ]
  },
  {
    id: 2,
    title: "Apoteker Klinis",
    department: "Farmasi",
    type: "Penuh Waktu",
    location: "Bandung, Jawa Barat",
    category: "Medis",
    position: "Apoteker",
    link: "/karir/apoteker-klinis",
    postedDate: "2025-08-28",
    description: "Bertanggung jawab untuk memantau terapi obat pasien, memastikan penggunaan obat yang tepat, serta memberikan edukasi kepada pasien dan tenaga medis.",
    qualifications: [
      "Pendidikan Profesi Apoteker",
      "Memiliki STRA aktif",
      "Pengalaman kerja di rumah sakit lebih disukai",
      "Komunikasi yang baik dan teliti"
    ]
  },
  {
    id: 3,
    title: "Staf Administrasi Medis",
    department: "Administrasi",
    type: "Penuh Waktu",
    location: "Bandung, Jawa Barat",
    category: "Non-Medis",
    position: "Administrasi",
    link: "/karir/staf-administrasi-medis",
    postedDate: "2025-08-20",
    description: "Mengelola dokumen medis, mendukung kegiatan administratif rumah sakit, serta membantu kelancaran operasional unit medis.",
    qualifications: [
      "Minimal D3 Administrasi atau bidang terkait",
      "Terampil dalam penggunaan Microsoft Office",
      "Rapi, teliti, dan mampu bekerja dalam tekanan",
      "Pengalaman kerja di rumah sakit menjadi nilai tambah"
    ]
  },
  {
    id: 4,
    title: "Dokter Spesialis Jantung",
    department: "Kardiologi",
    type: "Penuh Waktu",
    location: "Bandung, Jawa Barat",
    category: "Medis",
    position: "Dokter Spesialis",
    link: "/karir/dokter-spesialis-jantung",
    postedDate: "2025-08-30",
    description: "Menangani pasien dengan penyakit jantung, melakukan pemeriksaan, diagnosis, dan tindakan medis sesuai standar kardiologi.",
    qualifications: [
      "Lulusan Spesialis Kardiologi",
      "Memiliki STR aktif",
      "Berpengalaman praktik minimal 2 tahun",
      "Mampu bekerja dengan tim multidisiplin"
    ]
  },
  {
    id: 5,
    title: "IT Support Staff",
    department: "Teknologi Informasi",
    type: "Kontrak",
    location: "Bandung, Jawa Barat",
    category: "Non-Medis",
    position: "IT",
    link: "/karir/it-support-staff",
    postedDate: "2025-08-22",
    description: "Memberikan dukungan teknis terkait perangkat keras dan perangkat lunak, memastikan sistem IT rumah sakit berjalan optimal.",
    qualifications: [
      "Minimal D3/S1 Teknik Informatika atau setara",
      "Pengalaman di bidang IT support minimal 1 tahun",
      "Menguasai troubleshooting jaringan dan hardware",
      "Komunikasi yang baik dan siap bekerja shift"
    ]
  },
  {
    id: 6,
    title: "Ahli Gizi",
    department: "Gizi",
    type: "Paruh Waktu",
    location: "Bandung, Jawa Barat",
    category: "Medis",
    position: "Ahli Gizi",
    link: "/karir/ahli-gizi",
    postedDate: "2025-08-18",
    description: "Menyusun rencana diet pasien sesuai kebutuhan medis, memberikan konsultasi gizi, serta mendukung program kesehatan rumah sakit.",
    qualifications: [
      "Minimal S1 Gizi",
      "Memiliki STR aktif",
      "Pengalaman di rumah sakit lebih disukai",
      "Mampu memberikan edukasi dengan baik"
    ]
  }
];

export interface Applicant {
  id: number;
  jobId: number;
  name: string;
  email: string;
  phone: string;
  status: "Baru" | "Ditinjau" | "Wawancara" | "Ditolak";
  appliedDate: string;
}

export const applicants: Applicant[] = [
  { id: 101, jobId: 1, name: "Budi Santoso", email: "budi.s@example.com", phone: "081234567890", status: "Ditinjau", appliedDate: "2025-08-26" },
  { id: 102, jobId: 1, name: "Citra Lestari", email: "citra.l@example.com", phone: "081234567891", status: "Baru", appliedDate: "2025-08-27" },
  { id: 103, jobId: 2, name: "Doni Firmansyah", email: "doni.f@example.com", phone: "081234567892", status: "Wawancara", appliedDate: "2025-08-29" },
  { id: 104, jobId: 3, name: "Eka Putri", email: "eka.p@example.com", phone: "081234567893", status: "Baru", appliedDate: "2025-08-21" },
  { id: 105, jobId: 1, name: "Farhan Maulana", email: "farhan.m@example.com", phone: "081234567894", status: "Ditolak", appliedDate: "2025-08-26" },
];
