// File: app/data/doctors.ts

// Tipe data untuk setiap dokter agar konsisten
export interface Doctor {
  name: string;
  specialty: string;
  poli: string;
  image: string;
  schedule?: { day: string; time: string }[]; // Placeholder untuk jadwal
}

// Daftar lengkap dokter
export const doctors: Doctor[] = [
  {
    name: "dr. H. Aries Wiganda, Sp.A.",
    poli: "Anak",
    specialty: "Spesialis Anak",
    image: "https://placehold.co/400x400/b0e7e1/05445e?text=Dokter",
  },
  {
    name: "dr. Riyadi, Sp.A(K), M.Kes",
    poli: "Anak",
    specialty: "Spesialis Anak",
    image: "https://placehold.co/400x400/c5d8c9/05445e?text=Dokter",
  },
  {
    name: "dr. Oktova Ardianto, Sp.B",
    poli: "Bedah",
    specialty: "Spesialis Bedah",
    image: "https://placehold.co/400x400/84c1ba/05445e?text=Dokter",
  },
  {
    name: "dr. Wahyu Priatmoko,Sp.B",
    poli: "Bedah",
    specialty: "Spesialis Bedah",
    image: "https://placehold.co/400x400/55929a/f2f2f2?text=Dokter",
  },
  {
    name: "dr. Imam Rachman Hakim, Sp.B",
    poli: "Bedah",
    specialty: "Spesialis Bedah",
    image: "https://placehold.co/400x400/b0e7e1/05445e?text=Dokter",
  },
  {
    name: "dr. Karya Ginting, Sp. BM",
    poli: "Bedah Mulut",
    specialty: "Spesialis Bedah Mulut",
    image: "https://placehold.co/400x400/c5d8c9/05445e?text=Dokter",
  },
  {
    name: "dr. Raden Beni Benardi, Sp.PD",
    poli: "Dalam",
    specialty: "Spesialis Penyakit Dalam",
    image: "https://placehold.co/400x400/84c1ba/05445e?text=Dokter",
  },
  {
    name: "dr. Ahmad Baruna, Sp.PD",
    poli: "Dalam",
    specialty: "Spesialis Penyakit Dalam",
    image: "https://placehold.co/400x400/55929a/f2f2f2?text=Dokter",
  },
  {
    name: "dr. Raden Desy Nurhayati, Sp.PD.",
    poli: "Dalam",
    specialty: "Spesialis Penyakit Dalam",
    image: "https://placehold.co/400x400/b0e7e1/05445e?text=Dokter",
  },
  {
    name: "dr. Prihardi Estu Widodo, Sp.J.P.",
    poli: "Jantung",
    specialty: "Spesialis Jantung",
    image: "https://placehold.co/400x400/c5d8c9/05445e?text=Dokter",
  },
  {
    name: "dr. Paramitha Kusuma, Sp.K.J",
    poli: "Psikiatri",
    specialty: "Spesialis Kesehatan Jiwa",
    image: "https://placehold.co/400x400/84c1ba/05445e?text=Dokter",
  },
  {
    name: "dr. Pati Aji Achdiat, Sp.KK.",
    poli: "Kulit & Kelamin",
    specialty: "Spesialis Kulit & Kelamin",
    image: "https://placehold.co/400x400/55929a/f2f2f2?text=Dokter",
  },
  {
    name: "dr. Syumarti, Sp. M",
    poli: "Mata",
    specialty: "Spesialis Mata",
    image: "https://placehold.co/400x400/b0e7e1/05445e?text=Dokter",
  },
  {
    name: "dr. Nina Ratnaningsih, Sp. M(K), MSc",
    poli: "Mata",
    specialty: "Spesialis Mata",
    image: "https://placehold.co/400x400/c5d8c9/05445e?text=Dokter",
  },
  {
    name: "dr. Fatolosa Pardomuan Panjaitan,Sp.OG",
    poli: "Obgyn",
    specialty: "Spesialis Kandungan",
    image: "https://placehold.co/400x400/84c1ba/05445e?text=Dokter",
  },
  {
    name: "dr. Frenki Pieter Hetharia, Sp.OG.",
    poli: "Obgyn",
    specialty: "Spesialis Kandungan",
    image: "https://placehold.co/400x400/55929a/f2f2f2?text=Dokter",
  },
  {
    name: "dr. Ivan, Sp.OG",
    poli: "Obgyn",
    specialty: "Spesialis Kandungan",
    image: "https://placehold.co/400x400/b0e7e1/05445e?text=Dokter",
  },
  {
    name: "dr. Herry Herman, Sp.OT",
    poli: "Ortopedi",
    specialty: "Spesialis Ortopedi",
    image: "https://placehold.co/400x400/c5d8c9/05445e?text=Dokter",
  },
  {
    name: "dr. Megi Virgiabanon Otafirda, Sp.KFR",
    poli: "Rehabilitasi Medis",
    specialty: "Spesialis Rehabilitasi Medis",
    image: "https://placehold.co/400x400/84c1ba/05445e?text=Dokter",
  },
  {
    name: "dr. Farida Arisanti, Sp.KFR.",
    poli: "Rehabilitasi Medis",
    specialty: "Spesialis Rehabilitasi Medis",
    image: "https://placehold.co/400x400/55929a/f2f2f2?text=Dokter",
  },
  {
    name: "dr. Ade Purnama,Sp.S.",
    poli: "Saraf",
    specialty: "Spesialis Saraf",
    image: "https://placehold.co/400x400/b0e7e1/05445e?text=Dokter",
  },
  {
    name: "dr. Asep Nugraha Hermawan, Sp.S.",
    poli: "Saraf",
    specialty: "Spesialis Saraf",
    image: "https://placehold.co/400x400/c5d8c9/05445e?text=Dokter",
  },
  {
    name: "dr. Jipie Iman Satriyo, Sp.THT-KL.",
    poli: "THT",
    specialty: "Spesialis THT",
    image: "https://placehold.co/400x400/84c1ba/05445e?text=Dokter",
  },
  {
    name: "dr. Anton Himan, Sp.T.H.T.K.L",
    poli: "THT",
    specialty: "Spesialis THT",
    image: "https://placehold.co/400x400/55929a/f2f2f2?text=Dokter",
  },
  {
    name: "dr. Muhammad Ilhamul Karim, Sp.U",
    poli: "Urologi",
    specialty: "Spesialis Urologi",
    image: "https://placehold.co/400x400/b0e7e1/05445e?text=Dokter",
  },
];

// Mendapatkan daftar poli unik secara otomatis dari data dokter
export const poliFilters = [
  "Semua",
  ...Array.from(new Set(doctors.map((doc) => doc.poli))),
];
