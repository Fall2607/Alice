// File: app/data/careers.ts

export interface JobOpening {
  title: string;
  department: string;
  type: "Penuh Waktu" | "Paruh Waktu" | "Kontrak";
  location: string;
  category: "Medis" | "Non-Medis";
  position: string;
  link: string;
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
    title: "Perawat Senior (ICU)",
    department: "Keperawatan",
    type: "Penuh Waktu",
    location: "Bandung, Jawa Barat",
    category: "Medis",
    position: "Perawat",
    link: "/karir/perawat-senior-icu",
  },
  {
    title: "Apoteker Klinis",
    department: "Farmasi",
    type: "Penuh Waktu",
    location: "Bandung, Jawa Barat",
    category: "Medis",
    position: "Apoteker",
    link: "/karir/apoteker-klinis",
  },
  {
    title: "Staf Administrasi Medis",
    department: "Administrasi",
    type: "Penuh Waktu",
    location: "Bandung, Jawa Barat",
    category: "Non-Medis",
    position: "Administrasi",
    link: "/karir/staf-administrasi-medis",
  },
  {
    title: "Dokter Spesialis Jantung",
    department: "Kardiologi",
    type: "Penuh Waktu",
    location: "Bandung, Jawa Barat",
    category: "Medis",
    position: "Dokter Spesialis",
    link: "/karir/dokter-spesialis-jantung",
  },
  {
    title: "IT Support Staff",
    department: "Teknologi Informasi",
    type: "Kontrak",
    location: "Bandung, Jawa Barat",
    category: "Non-Medis",
    position: "IT",
    link: "/karir/it-support-staff",
  },
  {
    title: "Ahli Gizi",
    department: "Gizi",
    type: "Paruh Waktu",
    location: "Bandung, Jawa Barat",
    category: "Medis",
    position: "Ahli Gizi",
    link: "/karir/ahli-gizi",
  },
];
