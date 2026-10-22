export type CFITOptionLetter = "A" | "B" | "C" | "D" | "E" | "F";

export interface CFITOption {
  label: CFITOptionLetter;
  image: string;
}

export interface CFITQuestion {
  id: string;
  subtest: number;
  subtestTitle: string;
  title: string;
  isExample?: boolean;
  instruction: string;
  questionImage?: string;
  options: CFITOption[];
  correctAnswer?: CFITOptionLetter;
  correctAnswers?: CFITOptionLetter[];
  explanation?: string;
}

// ==========================================
// INSTRUKSI RESMI CFIT
// ==========================================

export const CFIT_SUBTEST_1_INSTRUCTION =
  "Pada halaman tersebut, kalian akan melihat beberapa gambar yang membentuk sebuah urutan atau pola. Namun, pada gambar terakhir masih kosong atau belum terisi.\n\nTugas kalian:\nPilih satu gambar dari pilihan jawaban A, B, C, D, E, atau F yang paling sesuai untuk melengkapi gambar terakhir.\n\nPerlu teman-teman ketahui bahwa gambar-gambar ini memiliki pola tertentu. Jadi, Anda perlu teliti dan fokus untuk menemukan pola tersebut dan menentukan gambar yang paling tepat.";

export const CFIT_SUBTEST_2_INSTRUCTION =
  "Pada bagian ini, kalian akan melihat 5 kotak gambar yang tersusun secara berdampingan dalam setiap soal.\n\nTugas kalian:\nTemukan 2 kotak gambar yang memiliki bentuk atau pola yang serupa satu sama lain.\n\nPerhatikan baik-baik, karena kotak-kotak lainnya akan terlihat mirip tapi sebenarnya berbeda. Jadi, hati-hati karena bisa saja mengecoh. Pastikan pada subtest ini terdapat 2 jawaban.";

export const CFIT_SUBTEST_3_INSTRUCTION =
  "Pada bagian ini, kalian akan melihat sebuah kotak besar yang terdiri dari 4 bagian gambar. Tiga bagian sudah terisi gambar, dan satu bagian di kanan bawah masih kosong.\n\nTugas kalian:\nTemukan pola hubungan dari gambar-gambar yang sudah ada, lalu pilih satu gambar dari pilihan yang tersedia untuk mengisi bagian yang kosong, sehingga pola menjadi lengkap dan logis.";

export const CFIT_SUBTEST_4_INSTRUCTION =
  "Pada bagian ini, kalian akan melihat satu gambar di sebelah kiri, dan di sebelah kanannya terdapat lima pilihan gambar (A sampai E).\n\nTugas kalian:\nPilih satu gambar dari lima pilihan yang tersedia, yang memiliki kondisi atau karakteristik yang serupa dengan gambar yang ada di sebelah kiri.\n\nJadi, kalian perlu mencermati bagaimana bentuk-bentuk di dalam gambar tersebut berinteraksi atau saling melengkapi, lalu mencari gambar lain yang juga menunjukkan hubungan serupa.";

// ==========================================
// SUBTES 1: CONTOH SOAL (LATIHAN)
// ==========================================

export const cfitSubtest1Examples: CFITQuestion[] = [
  {
    id: "contoh_1",
    subtest: 1,
    subtestTitle: "Pola Seri Gambar (Series)",
    title: "Contoh Soal 1",
    isExample: true,
    instruction: CFIT_SUBTEST_1_INSTRUCTION,
    questionImage: "/img/cfit/subtest_1/contoh_1/Contoh-Soal.png",
    options: [
      { label: "A", image: "/img/cfit/subtest_1/contoh_1/A.png" },
      { label: "B", image: "/img/cfit/subtest_1/contoh_1/B.png" },
      { label: "C", image: "/img/cfit/subtest_1/contoh_1/C.png" },
      { label: "D", image: "/img/cfit/subtest_1/contoh_1/D.png" },
      { label: "E", image: "/img/cfit/subtest_1/contoh_1/E.png" },
      { label: "F", image: "/img/cfit/subtest_1/contoh_1/F.png" },
    ],
    correctAnswer: "C",
    correctAnswers: ["C"],
    explanation:
      "Pada kotak 1 ranting berdiri tegak lurus ke atas. Pada kotak 2, ranting condong ke arah kanan. Pada kotak 3, ranting semakin condong ke kanan (berputar bertahap searah jarum jam). Oleh karena itu, pada kotak 4 yang kosong, ranting harus meneruskan putarannya ke arah kanan bawah. Gambar C merupakan jawaban yang paling tepat.",
  },
  {
    id: "contoh_2",
    subtest: 1,
    subtestTitle: "Pola Seri Gambar (Series)",
    title: "Contoh Soal 2",
    isExample: true,
    instruction: CFIT_SUBTEST_1_INSTRUCTION,
    questionImage: "/img/cfit/subtest_1/contoh_2/Contoh-Soal.png",
    options: [
      { label: "A", image: "/img/cfit/subtest_1/contoh_2/A.png" },
      { label: "B", image: "/img/cfit/subtest_1/contoh_2/B.png" },
      { label: "C", image: "/img/cfit/subtest_1/contoh_2/C.png" },
      { label: "D", image: "/img/cfit/subtest_1/contoh_2/D.png" },
      { label: "E", image: "/img/cfit/subtest_1/contoh_2/E.png" },
      { label: "F", image: "/img/cfit/subtest_1/contoh_2/F.png" },
    ],
    correctAnswer: "E",
    correctAnswers: ["E"],
    explanation:
      "Pada kotak 1 bidang hitam di bagian atas memiliki ketebalan sekitar 1/4 kotak. Pada kotak 2 bidang hitam bertambah tebal ke bawah. Pada kotak 3 bidang hitam semakin meluas hingga menutupi separuh kotak. Pola ini menunjukkan pertambahan bidang hitam dari atas ke bawah secara konsisten bertahap. Maka pada kotak ke-4, bidang hitam bertambah tebal hingga menutupi sekitar 3/4 kotak. Gambar E merupakan jawaban yang paling tepat.",
  },
  {
    id: "contoh_3",
    subtest: 1,
    subtestTitle: "Pola Seri Gambar (Series)",
    title: "Contoh Soal 3",
    isExample: true,
    instruction: CFIT_SUBTEST_1_INSTRUCTION,
    questionImage: "/img/cfit/subtest_1/contoh_3/Contoh-Soal.png",
    options: [
      { label: "A", image: "/img/cfit/subtest_1/contoh_3/A.png" },
      { label: "B", image: "/img/cfit/subtest_1/contoh_3/B.png" },
      { label: "C", image: "/img/cfit/subtest_1/contoh_3/C.png" },
      { label: "D", image: "/img/cfit/subtest_1/contoh_3/D.png" },
      { label: "E", image: "/img/cfit/subtest_1/contoh_3/E.png" },
      { label: "F", image: "/img/cfit/subtest_1/contoh_3/F.png" },
    ],
    correctAnswer: "E",
    correctAnswers: ["E"],
    explanation:
      "Pada kotak 1 terdapat 1 butir pola di posisi paling atas (arah jam 12). Pada kotak 2 butir bertambah 1 searah jarum jam menjadi 2 butir. Pada kotak 3 butir bertambah 1 lagi searah jarum jam menjadi 3 butir yang melengkung ke kanan. Maka pada kotak ke-4, jumlah butir bertambah menjadi 4 butir yang melanjutkan lengkungan lingkaran searah putaran jarum jam ke kanan bawah. Gambar E merupakan jawaban yang paling tepat.",
  },
];

// Alias untuk kompatibilitas ke belakang
export const cfitExampleQuestions = cfitSubtest1Examples;

// ==========================================
// SUBTES 1: SOAL RESMI (NOMOR 1 - 13)
// ==========================================

export const cfitSubtest1Questions: CFITQuestion[] = [
  {
    id: "soal_1",
    subtest: 1,
    subtestTitle: "Pola Seri Gambar (Series)",
    title: "Soal 1",
    isExample: false,
    instruction: CFIT_SUBTEST_1_INSTRUCTION,
    questionImage: "/img/cfit/subtest_1/soal_1/Soal-1.png",
    options: [
      { label: "A", image: "/img/cfit/subtest_1/soal_1/A.png" },
      { label: "B", image: "/img/cfit/subtest_1/soal_1/B.png" },
      { label: "C", image: "/img/cfit/subtest_1/soal_1/C.png" },
      { label: "D", image: "/img/cfit/subtest_1/soal_1/D.png" },
      { label: "E", image: "/img/cfit/subtest_1/soal_1/E.png" },
      { label: "F", image: "/img/cfit/subtest_1/soal_1/F.png" },
    ],
    correctAnswer: "B",
    correctAnswers: ["B"],
  },
  {
    id: "soal_2",
    subtest: 1,
    subtestTitle: "Pola Seri Gambar (Series)",
    title: "Soal 2",
    isExample: false,
    instruction: CFIT_SUBTEST_1_INSTRUCTION,
    questionImage: "/img/cfit/subtest_1/soal_2/Soal-2.png",
    options: [
      { label: "A", image: "/img/cfit/subtest_1/soal_2/A.png" },
      { label: "B", image: "/img/cfit/subtest_1/soal_2/B.png" },
      { label: "C", image: "/img/cfit/subtest_1/soal_2/C.png" },
      { label: "D", image: "/img/cfit/subtest_1/soal_2/D.png" },
      { label: "E", image: "/img/cfit/subtest_1/soal_2/E.png" },
      { label: "F", image: "/img/cfit/subtest_1/soal_2/F.png" },
    ],
    correctAnswer: "C",
    correctAnswers: ["C"],
  },
  {
    id: "soal_3",
    subtest: 1,
    subtestTitle: "Pola Seri Gambar (Series)",
    title: "Soal 3",
    isExample: false,
    instruction: CFIT_SUBTEST_1_INSTRUCTION,
    questionImage: "/img/cfit/subtest_1/soal_3/Soal-3.png",
    options: [
      { label: "A", image: "/img/cfit/subtest_1/soal_3/A.png" },
      { label: "B", image: "/img/cfit/subtest_1/soal_3/B.png" },
      { label: "C", image: "/img/cfit/subtest_1/soal_3/C.png" },
      { label: "D", image: "/img/cfit/subtest_1/soal_3/D.png" },
      { label: "E", image: "/img/cfit/subtest_1/soal_3/E.png" },
      { label: "F", image: "/img/cfit/subtest_1/soal_3/F.png" },
    ],
    correctAnswer: "B",
    correctAnswers: ["B"],
  },
  {
    id: "soal_4",
    subtest: 1,
    subtestTitle: "Pola Seri Gambar (Series)",
    title: "Soal 4",
    isExample: false,
    instruction: CFIT_SUBTEST_1_INSTRUCTION,
    questionImage: "/img/cfit/subtest_1/soal_4/Soal-4.png",
    options: [
      { label: "A", image: "/img/cfit/subtest_1/soal_4/A.png" },
      { label: "B", image: "/img/cfit/subtest_1/soal_4/B.jpg" },
      { label: "C", image: "/img/cfit/subtest_1/soal_4/C.jpg" },
      { label: "D", image: "/img/cfit/subtest_1/soal_4/D.jpg" },
      { label: "E", image: "/img/cfit/subtest_1/soal_4/E.jpg" },
      { label: "F", image: "/img/cfit/subtest_1/soal_4/F.jpg" },
    ],
    correctAnswer: "D",
    correctAnswers: ["D"],
  },
  {
    id: "soal_5",
    subtest: 1,
    subtestTitle: "Pola Seri Gambar (Series)",
    title: "Soal 5",
    isExample: false,
    instruction: CFIT_SUBTEST_1_INSTRUCTION,
    questionImage: "/img/cfit/subtest_1/soal_5/Soal-5.png",
    options: [
      { label: "A", image: "/img/cfit/subtest_1/soal_5/A.png" },
      { label: "B", image: "/img/cfit/subtest_1/soal_5/B.png" },
      { label: "C", image: "/img/cfit/subtest_1/soal_5/C.png" },
      { label: "D", image: "/img/cfit/subtest_1/soal_5/D.png" },
      { label: "E", image: "/img/cfit/subtest_1/soal_5/E.png" },
      { label: "F", image: "/img/cfit/subtest_1/soal_5/F.png" },
    ],
    correctAnswer: "E",
    correctAnswers: ["E"],
  },
  {
    id: "soal_6",
    subtest: 1,
    subtestTitle: "Pola Seri Gambar (Series)",
    title: "Soal 6",
    isExample: false,
    instruction: CFIT_SUBTEST_1_INSTRUCTION,
    questionImage: "/img/cfit/subtest_1/soal_6/Soal-6.png",
    options: [
      { label: "A", image: "/img/cfit/subtest_1/soal_6/A.png" },
      { label: "B", image: "/img/cfit/subtest_1/soal_6/B.png" },
      { label: "C", image: "/img/cfit/subtest_1/soal_6/C.png" },
      { label: "D", image: "/img/cfit/subtest_1/soal_6/D.png" },
      { label: "E", image: "/img/cfit/subtest_1/soal_6/E.png" },
      { label: "F", image: "/img/cfit/subtest_1/soal_6/F.png" },
    ],
    correctAnswer: "D",
    correctAnswers: ["D"],
  },
  {
    id: "soal_7",
    subtest: 1,
    subtestTitle: "Pola Seri Gambar (Series)",
    title: "Soal 7",
    isExample: false,
    instruction: CFIT_SUBTEST_1_INSTRUCTION,
    questionImage: "/img/cfit/subtest_1/soal_7/Soal-7.png",
    options: [
      { label: "A", image: "/img/cfit/subtest_1/soal_7/A.png" },
      { label: "B", image: "/img/cfit/subtest_1/soal_7/B.png" },
      { label: "C", image: "/img/cfit/subtest_1/soal_7/C.png" },
      { label: "D", image: "/img/cfit/subtest_1/soal_7/D.png" },
      { label: "E", image: "/img/cfit/subtest_1/soal_7/E.png" },
      { label: "F", image: "/img/cfit/subtest_1/soal_7/F.png" },
    ],
    correctAnswer: "D",
    correctAnswers: ["D"],
  },
  {
    id: "soal_8",
    subtest: 1,
    subtestTitle: "Pola Seri Gambar (Series)",
    title: "Soal 8",
    isExample: false,
    instruction: CFIT_SUBTEST_1_INSTRUCTION,
    questionImage: "/img/cfit/subtest_1/soal_8/Soal-8.png",
    options: [
      { label: "A", image: "/img/cfit/subtest_1/soal_8/A.png" },
      { label: "B", image: "/img/cfit/subtest_1/soal_8/B.png" },
      { label: "C", image: "/img/cfit/subtest_1/soal_8/C.png" },
      { label: "D", image: "/img/cfit/subtest_1/soal_8/D.png" },
      { label: "E", image: "/img/cfit/subtest_1/soal_8/E.png" },
      { label: "F", image: "/img/cfit/subtest_1/soal_8/F.png" },
    ],
    correctAnswer: "D",
    correctAnswers: ["D"],
  },
  {
    id: "soal_9",
    subtest: 1,
    subtestTitle: "Pola Seri Gambar (Series)",
    title: "Soal 9",
    isExample: false,
    instruction: CFIT_SUBTEST_1_INSTRUCTION,
    questionImage: "/img/cfit/subtest_1/soal_9/Soal-9.png",
    options: [
      { label: "A", image: "/img/cfit/subtest_1/soal_9/A.png" },
      { label: "B", image: "/img/cfit/subtest_1/soal_9/B.png" },
      { label: "C", image: "/img/cfit/subtest_1/soal_9/C.png" },
      { label: "D", image: "/img/cfit/subtest_1/soal_9/D.png" },
      { label: "E", image: "/img/cfit/subtest_1/soal_9/E.png" },
      { label: "F", image: "/img/cfit/subtest_1/soal_9/F.png" },
    ],
    correctAnswer: "F",
    correctAnswers: ["F"],
  },
  {
    id: "soal_10",
    subtest: 1,
    subtestTitle: "Pola Seri Gambar (Series)",
    title: "Soal 10",
    isExample: false,
    instruction: CFIT_SUBTEST_1_INSTRUCTION,
    questionImage: "/img/cfit/subtest_1/soal_10/Soal-10.png",
    options: [
      { label: "A", image: "/img/cfit/subtest_1/soal_10/A.png" },
      { label: "B", image: "/img/cfit/subtest_1/soal_10/B.png" },
      { label: "C", image: "/img/cfit/subtest_1/soal_10/C.png" },
      { label: "D", image: "/img/cfit/subtest_1/soal_10/D.png" },
      { label: "E", image: "/img/cfit/subtest_1/soal_10/E.png" },
      { label: "F", image: "/img/cfit/subtest_1/soal_10/F.png" },
    ],
    correctAnswer: "C",
    correctAnswers: ["C"],
  },
  {
    id: "soal_11",
    subtest: 1,
    subtestTitle: "Pola Seri Gambar (Series)",
    title: "Soal 11",
    isExample: false,
    instruction: CFIT_SUBTEST_1_INSTRUCTION,
    questionImage: "/img/cfit/subtest_1/soal_11/Soal-11.png",
    options: [
      { label: "A", image: "/img/cfit/subtest_1/soal_11/A.png" },
      { label: "B", image: "/img/cfit/subtest_1/soal_11/B.png" },
      { label: "C", image: "/img/cfit/subtest_1/soal_11/C.png" },
      { label: "D", image: "/img/cfit/subtest_1/soal_11/D.png" },
      { label: "E", image: "/img/cfit/subtest_1/soal_11/E.png" },
      { label: "F", image: "/img/cfit/subtest_1/soal_11/F.png" },
    ],
    correctAnswer: "B",
    correctAnswers: ["B"],
  },
  {
    id: "soal_12",
    subtest: 1,
    subtestTitle: "Pola Seri Gambar (Series)",
    title: "Soal 12",
    isExample: false,
    instruction: CFIT_SUBTEST_1_INSTRUCTION,
    questionImage: "/img/cfit/subtest_1/soal_12/Soal-12.png",
    options: [
      { label: "A", image: "/img/cfit/subtest_1/soal_12/A.png" },
      { label: "B", image: "/img/cfit/subtest_1/soal_12/B.png" },
      { label: "C", image: "/img/cfit/subtest_1/soal_12/C.png" },
      { label: "D", image: "/img/cfit/subtest_1/soal_12/D.png" },
      { label: "E", image: "/img/cfit/subtest_1/soal_12/E.png" },
      { label: "F", image: "/img/cfit/subtest_1/soal_12/F.png" },
    ],
    correctAnswer: "B",
    correctAnswers: ["B"],
  },
  {
    id: "soal_13",
    subtest: 1,
    subtestTitle: "Pola Seri Gambar (Series)",
    title: "Soal 13",
    isExample: false,
    instruction: CFIT_SUBTEST_1_INSTRUCTION,
    questionImage: "/img/cfit/subtest_1/soal_13/Soal-13.png",
    options: [
      { label: "A", image: "/img/cfit/subtest_1/soal_13/A.png" },
      { label: "B", image: "/img/cfit/subtest_1/soal_13/B.png" },
      { label: "C", image: "/img/cfit/subtest_1/soal_13/C.png" },
      { label: "D", image: "/img/cfit/subtest_1/soal_13/D.png" },
      { label: "E", image: "/img/cfit/subtest_1/soal_13/E.png" },
      { label: "F", image: "/img/cfit/subtest_1/soal_13/F.png" },
    ],
    correctAnswer: "E",
    correctAnswers: ["E"],
  },
];

// Alias untuk kompatibilitas ke belakang
export const cfitQuestions = cfitSubtest1Questions;

// ==========================================
// SUBTES 2: CONTOH SOAL (LATIHAN)
// ==========================================

export const cfitSubtest2Examples: CFITQuestion[] = [
  {
    id: "subtest_2_contoh_1",
    subtest: 2,
    subtestTitle: "Klasifikasi Gambar (Classification)",
    title: "Contoh Soal 1",
    isExample: true,
    instruction: CFIT_SUBTEST_2_INSTRUCTION,
    options: [
      { label: "A", image: "/img/cfit/subtest_2/contoh_1/A.png" },
      { label: "B", image: "/img/cfit/subtest_2/contoh_1/B.png" },
      { label: "C", image: "/img/cfit/subtest_2/contoh_1/C.png" },
      { label: "D", image: "/img/cfit/subtest_2/contoh_1/D.png" },
      { label: "E", image: "/img/cfit/subtest_2/contoh_1/E.png" },
    ],
    correctAnswers: ["B", "D"],
    explanation:
      "Kotak B dan Kotak D memiliki bentuk atau pola dasar yang serupa satu sama lain, sementara ketiga kotak lainnya memiliki karakteristik yang berbeda. Oleh karena itu, jawaban yang benar adalah B & D.",
  },
  {
    id: "subtest_2_contoh_2",
    subtest: 2,
    subtestTitle: "Klasifikasi Gambar (Classification)",
    title: "Contoh Soal 2",
    isExample: true,
    instruction: CFIT_SUBTEST_2_INSTRUCTION,
    options: [
      { label: "A", image: "/img/cfit/subtest_2/contoh_2/A.png" },
      { label: "B", image: "/img/cfit/subtest_2/contoh_2/B.png" },
      { label: "C", image: "/img/cfit/subtest_2/contoh_2/C.png" },
      { label: "D", image: "/img/cfit/subtest_2/contoh_2/D.png" },
      { label: "E", image: "/img/cfit/subtest_2/contoh_2/E.png" },
    ],
    correctAnswers: ["C", "E"],
    explanation:
      "Kotak C dan Kotak E memiliki kesesuaian bentuk atau pola yang sama satu sama lain yang membedakannya dari kotak A, B, dan D. Oleh karena itu, jawaban yang tepat adalah C & E.",
  },
];

// ==========================================
// SUBTES 2: SOAL RESMI (NOMOR 1 - 14)
// Kunci Jawaban Resmi:
// 1. B & E | 2. A & E | 3. A & D | 4. C & E | 5. A & C | 6. A & D | 7. B & E
// 8. B & E | 9. A & D | 10. B & D | 11. A & C | 12. C & D | 13. B & C | 14. A & B
// ==========================================

export const cfitSubtest2Questions: CFITQuestion[] = [
  {
    id: "subtest_2_soal_1",
    subtest: 2,
    subtestTitle: "Klasifikasi Gambar (Classification)",
    title: "Soal 1",
    isExample: false,
    instruction: CFIT_SUBTEST_2_INSTRUCTION,
    options: [
      { label: "A", image: "/img/cfit/subtest_2/soal_1/A.png" },
      { label: "B", image: "/img/cfit/subtest_2/soal_1/B.png" },
      { label: "C", image: "/img/cfit/subtest_2/soal_1/C.png" },
      { label: "D", image: "/img/cfit/subtest_2/soal_1/D.png" },
      { label: "E", image: "/img/cfit/subtest_2/soal_1/E.png" },
    ],
    correctAnswers: ["B", "E"],
  },
  {
    id: "subtest_2_soal_2",
    subtest: 2,
    subtestTitle: "Klasifikasi Gambar (Classification)",
    title: "Soal 2",
    isExample: false,
    instruction: CFIT_SUBTEST_2_INSTRUCTION,
    options: [
      { label: "A", image: "/img/cfit/subtest_2/soal_2/A.png" },
      { label: "B", image: "/img/cfit/subtest_2/soal_2/B.png" },
      { label: "C", image: "/img/cfit/subtest_2/soal_2/C.png" },
      { label: "D", image: "/img/cfit/subtest_2/soal_2/D.png" },
      { label: "E", image: "/img/cfit/subtest_2/soal_2/E.png" },
    ],
    correctAnswers: ["A", "E"],
  },
  {
    id: "subtest_2_soal_3",
    subtest: 2,
    subtestTitle: "Klasifikasi Gambar (Classification)",
    title: "Soal 3",
    isExample: false,
    instruction: CFIT_SUBTEST_2_INSTRUCTION,
    options: [
      { label: "A", image: "/img/cfit/subtest_2/soal_3/A.png" },
      { label: "B", image: "/img/cfit/subtest_2/soal_3/B.png" },
      { label: "C", image: "/img/cfit/subtest_2/soal_3/C.png" },
      { label: "D", image: "/img/cfit/subtest_2/soal_3/D.png" },
      { label: "E", image: "/img/cfit/subtest_2/soal_3/E.png" },
    ],
    correctAnswers: ["A", "D"],
  },
  {
    id: "subtest_2_soal_4",
    subtest: 2,
    subtestTitle: "Klasifikasi Gambar (Classification)",
    title: "Soal 4",
    isExample: false,
    instruction: CFIT_SUBTEST_2_INSTRUCTION,
    options: [
      { label: "A", image: "/img/cfit/subtest_2/soal_4/A.png" },
      { label: "B", image: "/img/cfit/subtest_2/soal_4/B.png" },
      { label: "C", image: "/img/cfit/subtest_2/soal_4/C.png" },
      { label: "D", image: "/img/cfit/subtest_2/soal_4/D.png" },
      { label: "E", image: "/img/cfit/subtest_2/soal_4/E.png" },
    ],
    correctAnswers: ["C", "E"],
  },
  {
    id: "subtest_2_soal_5",
    subtest: 2,
    subtestTitle: "Klasifikasi Gambar (Classification)",
    title: "Soal 5",
    isExample: false,
    instruction: CFIT_SUBTEST_2_INSTRUCTION,
    options: [
      { label: "A", image: "/img/cfit/subtest_2/soal_5/A.png" },
      { label: "B", image: "/img/cfit/subtest_2/soal_5/B.png" },
      { label: "C", image: "/img/cfit/subtest_2/soal_5/C.png" },
      { label: "D", image: "/img/cfit/subtest_2/soal_5/D.png" },
      { label: "E", image: "/img/cfit/subtest_2/soal_5/E.png" },
    ],
    correctAnswers: ["A", "C"],
  },
  {
    id: "subtest_2_soal_6",
    subtest: 2,
    subtestTitle: "Klasifikasi Gambar (Classification)",
    title: "Soal 6",
    isExample: false,
    instruction: CFIT_SUBTEST_2_INSTRUCTION,
    options: [
      { label: "A", image: "/img/cfit/subtest_2/soal_6/A.png" },
      { label: "B", image: "/img/cfit/subtest_2/soal_6/B.png" },
      { label: "C", image: "/img/cfit/subtest_2/soal_6/C.png" },
      { label: "D", image: "/img/cfit/subtest_2/soal_6/D.png" },
      { label: "E", image: "/img/cfit/subtest_2/soal_6/E.png" },
    ],
    correctAnswers: ["A", "D"],
  },
  {
    id: "subtest_2_soal_7",
    subtest: 2,
    subtestTitle: "Klasifikasi Gambar (Classification)",
    title: "Soal 7",
    isExample: false,
    instruction: CFIT_SUBTEST_2_INSTRUCTION,
    options: [
      { label: "A", image: "/img/cfit/subtest_2/soal_7/A.png" },
      { label: "B", image: "/img/cfit/subtest_2/soal_7/B.png" },
      { label: "C", image: "/img/cfit/subtest_2/soal_7/C.png" },
      { label: "D", image: "/img/cfit/subtest_2/soal_7/D.png" },
      { label: "E", image: "/img/cfit/subtest_2/soal_7/E.png" },
    ],
    correctAnswers: ["B", "E"],
  },
  {
    id: "subtest_2_soal_8",
    subtest: 2,
    subtestTitle: "Klasifikasi Gambar (Classification)",
    title: "Soal 8",
    isExample: false,
    instruction: CFIT_SUBTEST_2_INSTRUCTION,
    options: [
      { label: "A", image: "/img/cfit/subtest_2/soal_8/A.png" },
      { label: "B", image: "/img/cfit/subtest_2/soal_8/B.png" },
      { label: "C", image: "/img/cfit/subtest_2/soal_8/C.png" },
      { label: "D", image: "/img/cfit/subtest_2/soal_8/D.png" },
      { label: "E", image: "/img/cfit/subtest_2/soal_8/E.png" },
    ],
    correctAnswers: ["B", "E"],
  },
  {
    id: "subtest_2_soal_9",
    subtest: 2,
    subtestTitle: "Klasifikasi Gambar (Classification)",
    title: "Soal 9",
    isExample: false,
    instruction: CFIT_SUBTEST_2_INSTRUCTION,
    options: [
      { label: "A", image: "/img/cfit/subtest_2/soal_9/A.png" },
      { label: "B", image: "/img/cfit/subtest_2/soal_9/B.png" },
      { label: "C", image: "/img/cfit/subtest_2/soal_9/C.png" },
      { label: "D", image: "/img/cfit/subtest_2/soal_9/D.png" },
      { label: "E", image: "/img/cfit/subtest_2/soal_9/E.png" },
    ],
    correctAnswers: ["A", "D"],
  },
  {
    id: "subtest_2_soal_10",
    subtest: 2,
    subtestTitle: "Klasifikasi Gambar (Classification)",
    title: "Soal 10",
    isExample: false,
    instruction: CFIT_SUBTEST_2_INSTRUCTION,
    options: [
      { label: "A", image: "/img/cfit/subtest_2/soal_10/A.png" },
      { label: "B", image: "/img/cfit/subtest_2/soal_10/B.png" },
      { label: "C", image: "/img/cfit/subtest_2/soal_10/C.png" },
      { label: "D", image: "/img/cfit/subtest_2/soal_10/D.png" },
      { label: "E", image: "/img/cfit/subtest_2/soal_10/E.png" },
    ],
    correctAnswers: ["B", "D"],
  },
  {
    id: "subtest_2_soal_11",
    subtest: 2,
    subtestTitle: "Klasifikasi Gambar (Classification)",
    title: "Soal 11",
    isExample: false,
    instruction: CFIT_SUBTEST_2_INSTRUCTION,
    options: [
      { label: "A", image: "/img/cfit/subtest_2/soal_11/A.png" },
      { label: "B", image: "/img/cfit/subtest_2/soal_11/B.png" },
      { label: "C", image: "/img/cfit/subtest_2/soal_11/C.png" },
      { label: "D", image: "/img/cfit/subtest_2/soal_11/D.png" },
      { label: "E", image: "/img/cfit/subtest_2/soal_11/E.png" },
    ],
    correctAnswers: ["A", "C"],
  },
  {
    id: "subtest_2_soal_12",
    subtest: 2,
    subtestTitle: "Klasifikasi Gambar (Classification)",
    title: "Soal 12",
    isExample: false,
    instruction: CFIT_SUBTEST_2_INSTRUCTION,
    options: [
      { label: "A", image: "/img/cfit/subtest_2/soal_12/A.png" },
      { label: "B", image: "/img/cfit/subtest_2/soal_12/B.png" },
      { label: "C", image: "/img/cfit/subtest_2/soal_12/C.png" },
      { label: "D", image: "/img/cfit/subtest_2/soal_12/D.png" },
      { label: "E", image: "/img/cfit/subtest_2/soal_12/E.png" },
    ],
    correctAnswers: ["C", "D"],
  },
  {
    id: "subtest_2_soal_13",
    subtest: 2,
    subtestTitle: "Klasifikasi Gambar (Classification)",
    title: "Soal 13",
    isExample: false,
    instruction: CFIT_SUBTEST_2_INSTRUCTION,
    options: [
      { label: "A", image: "/img/cfit/subtest_2/soal_13/A.png" },
      { label: "B", image: "/img/cfit/subtest_2/soal_13/B.png" },
      { label: "C", image: "/img/cfit/subtest_2/soal_13/C.png" },
      { label: "D", image: "/img/cfit/subtest_2/soal_13/D.png" },
      { label: "E", image: "/img/cfit/subtest_2/soal_13/E.png" },
    ],
    correctAnswers: ["B", "C"],
  },
  {
    id: "subtest_2_soal_14",
    subtest: 2,
    subtestTitle: "Klasifikasi Gambar (Classification)",
    title: "Soal 14",
    isExample: false,
    instruction: CFIT_SUBTEST_2_INSTRUCTION,
    options: [
      { label: "A", image: "/img/cfit/subtest_2/soal_14/A.png" },
      { label: "B", image: "/img/cfit/subtest_2/soal_14/B.png" },
      { label: "C", image: "/img/cfit/subtest_2/soal_14/C.png" },
      { label: "D", image: "/img/cfit/subtest_2/soal_14/D.png" },
      { label: "E", image: "/img/cfit/subtest_2/soal_14/E.png" },
    ],
    correctAnswers: ["A", "B"],
  },
];

// ==========================================
// SUBTES 3: CONTOH SOAL (LATIHAN)
// Kunci Jawaban Contoh: 1. B | 2. C | 3. F
// ==========================================

export const cfitSubtest3Examples: CFITQuestion[] = [
  {
    id: "subtest_3_contoh_1",
    subtest: 3,
    subtestTitle: "Matriks Pola Gambar (Matrices)",
    title: "Contoh Soal 1",
    isExample: true,
    instruction: CFIT_SUBTEST_3_INSTRUCTION,
    questionImage: "/img/cfit/subtest_3/contoh_1/Contoh-Soal.png",
    options: [
      { label: "A", image: "/img/cfit/subtest_3/contoh_1/A.png" },
      { label: "B", image: "/img/cfit/subtest_3/contoh_1/B.png" },
      { label: "C", image: "/img/cfit/subtest_3/contoh_1/C.png" },
      { label: "D", image: "/img/cfit/subtest_3/contoh_1/D.png" },
      { label: "E", image: "/img/cfit/subtest_3/contoh_1/E.png" },
      { label: "F", image: "/img/cfit/subtest_3/contoh_1/F.png" },
    ],
    correctAnswer: "B",
    correctAnswers: ["B"],
    explanation:
      "Memperhatikan pola hubungan gambar yang ada, gambar B merupakan pilihan yang paling tepat untuk melengkapi kotak kanan bawah yang kosong.",
  },
  {
    id: "subtest_3_contoh_2",
    subtest: 3,
    subtestTitle: "Matriks Pola Gambar (Matrices)",
    title: "Contoh Soal 2",
    isExample: true,
    instruction: CFIT_SUBTEST_3_INSTRUCTION,
    questionImage: "/img/cfit/subtest_3/contoh_2/Contoh-Soal.png",
    options: [
      { label: "A", image: "/img/cfit/subtest_3/contoh_2/A.png" },
      { label: "B", image: "/img/cfit/subtest_3/contoh_2/B.png" },
      { label: "C", image: "/img/cfit/subtest_3/contoh_2/C.png" },
      { label: "D", image: "/img/cfit/subtest_3/contoh_2/D.png" },
      { label: "E", image: "/img/cfit/subtest_3/contoh_2/E.png" },
      { label: "F", image: "/img/cfit/subtest_3/contoh_2/F.png" },
    ],
    correctAnswer: "C",
    correctAnswers: ["C"],
    explanation:
      "Berdasarkan pola hubungan antara gambar di bagian atas dan bawah, pilihan C adalah gambar yang tepat untuk melengkapi bagian kanan bawah yang kosong.",
  },
  {
    id: "subtest_3_contoh_3",
    subtest: 3,
    subtestTitle: "Matriks Pola Gambar (Matrices)",
    title: "Contoh Soal 3",
    isExample: true,
    instruction: CFIT_SUBTEST_3_INSTRUCTION,
    questionImage: "/img/cfit/subtest_3/contoh_3/Contoh-Soal.png",
    options: [
      { label: "A", image: "/img/cfit/subtest_3/contoh_3/A.png" },
      { label: "B", image: "/img/cfit/subtest_3/contoh_3/B.png" },
      { label: "C", image: "/img/cfit/subtest_3/contoh_3/C.png" },
      { label: "D", image: "/img/cfit/subtest_3/contoh_3/D.png" },
      { label: "E", image: "/img/cfit/subtest_3/contoh_3/E.png" },
      { label: "F", image: "/img/cfit/subtest_3/contoh_3/F.png" },
    ],
    correctAnswer: "F",
    correctAnswers: ["F"],
    explanation:
      "Memperhatikan pola dan hubungan bentuk pada gambar yang tersedia, pilihan F adalah pilihan yang paling logis untuk mengisi bagian yang kosong.",
  },
];

// ==========================================
// SUBTES 3: SOAL RESMI (NOMOR 1 - 13)
// Kunci Jawaban Resmi:
// 1. E | 2. E | 3. E | 4. B | 5. C | 6. D | 7. E
// 8. E | 9. A | 10. A | 11. C | 12. E | 13. A
// ==========================================

export const cfitSubtest3Questions: CFITQuestion[] = [
  {
    id: "subtest_3_soal_1",
    subtest: 3,
    subtestTitle: "Matriks Pola Gambar (Matrices)",
    title: "Soal 1",
    isExample: false,
    instruction: CFIT_SUBTEST_3_INSTRUCTION,
    questionImage: "/img/cfit/subtest_3/soal_1/Soal-1.png",
    options: [
      { label: "A", image: "/img/cfit/subtest_3/soal_1/A.png" },
      { label: "B", image: "/img/cfit/subtest_3/soal_1/B.png" },
      { label: "C", image: "/img/cfit/subtest_3/soal_1/C.png" },
      { label: "D", image: "/img/cfit/subtest_3/soal_1/D.png" },
      { label: "E", image: "/img/cfit/subtest_3/soal_1/E.png" },
      { label: "F", image: "/img/cfit/subtest_3/soal_1/F.png" },
    ],
    correctAnswer: "E",
    correctAnswers: ["E"],
  },
  {
    id: "subtest_3_soal_2",
    subtest: 3,
    subtestTitle: "Matriks Pola Gambar (Matrices)",
    title: "Soal 2",
    isExample: false,
    instruction: CFIT_SUBTEST_3_INSTRUCTION,
    questionImage: "/img/cfit/subtest_3/soal_2/Soal-2.png",
    options: [
      { label: "A", image: "/img/cfit/subtest_3/soal_2/A.png" },
      { label: "B", image: "/img/cfit/subtest_3/soal_2/B.png" },
      { label: "C", image: "/img/cfit/subtest_3/soal_2/C.png" },
      { label: "D", image: "/img/cfit/subtest_3/soal_2/D.png" },
      { label: "E", image: "/img/cfit/subtest_3/soal_2/E.png" },
      { label: "F", image: "/img/cfit/subtest_3/soal_2/F.png" },
    ],
    correctAnswer: "E",
    correctAnswers: ["E"],
  },
  {
    id: "subtest_3_soal_3",
    subtest: 3,
    subtestTitle: "Matriks Pola Gambar (Matrices)",
    title: "Soal 3",
    isExample: false,
    instruction: CFIT_SUBTEST_3_INSTRUCTION,
    questionImage: "/img/cfit/subtest_3/soal_3/Soal-3.png",
    options: [
      { label: "A", image: "/img/cfit/subtest_3/soal_3/A.png" },
      { label: "B", image: "/img/cfit/subtest_3/soal_3/B.png" },
      { label: "C", image: "/img/cfit/subtest_3/soal_3/C.png" },
      { label: "D", image: "/img/cfit/subtest_3/soal_3/D.png" },
      { label: "E", image: "/img/cfit/subtest_3/soal_3/E.png" },
      { label: "F", image: "/img/cfit/subtest_3/soal_3/F.png" },
    ],
    correctAnswer: "E",
    correctAnswers: ["E"],
  },
  {
    id: "subtest_3_soal_4",
    subtest: 3,
    subtestTitle: "Matriks Pola Gambar (Matrices)",
    title: "Soal 4",
    isExample: false,
    instruction: CFIT_SUBTEST_3_INSTRUCTION,
    questionImage: "/img/cfit/subtest_3/soal_4/Soal-4.png",
    options: [
      { label: "A", image: "/img/cfit/subtest_3/soal_4/A.png" },
      { label: "B", image: "/img/cfit/subtest_3/soal_4/B.png" },
      { label: "C", image: "/img/cfit/subtest_3/soal_4/C.png" },
      { label: "D", image: "/img/cfit/subtest_3/soal_4/D.png" },
      { label: "E", image: "/img/cfit/subtest_3/soal_4/E.png" },
      { label: "F", image: "/img/cfit/subtest_3/soal_4/F.png" },
    ],
    correctAnswer: "B",
    correctAnswers: ["B"],
  },
  {
    id: "subtest_3_soal_5",
    subtest: 3,
    subtestTitle: "Matriks Pola Gambar (Matrices)",
    title: "Soal 5",
    isExample: false,
    instruction: CFIT_SUBTEST_3_INSTRUCTION,
    questionImage: "/img/cfit/subtest_3/soal_5/Soal-5.png",
    options: [
      { label: "A", image: "/img/cfit/subtest_3/soal_5/A.png" },
      { label: "B", image: "/img/cfit/subtest_3/soal_5/B.png" },
      { label: "C", image: "/img/cfit/subtest_3/soal_5/C.png" },
      { label: "D", image: "/img/cfit/subtest_3/soal_5/D.png" },
      { label: "E", image: "/img/cfit/subtest_3/soal_5/E.png" },
      { label: "F", image: "/img/cfit/subtest_3/soal_5/F.png" },
    ],
    correctAnswer: "C",
    correctAnswers: ["C"],
  },
  {
    id: "subtest_3_soal_6",
    subtest: 3,
    subtestTitle: "Matriks Pola Gambar (Matrices)",
    title: "Soal 6",
    isExample: false,
    instruction: CFIT_SUBTEST_3_INSTRUCTION,
    questionImage: "/img/cfit/subtest_3/soal_6/Soal-6.png",
    options: [
      { label: "A", image: "/img/cfit/subtest_3/soal_6/A.png" },
      { label: "B", image: "/img/cfit/subtest_3/soal_6/B.png" },
      { label: "C", image: "/img/cfit/subtest_3/soal_6/C.png" },
      { label: "D", image: "/img/cfit/subtest_3/soal_6/D.png" },
      { label: "E", image: "/img/cfit/subtest_3/soal_6/E.png" },
      { label: "F", image: "/img/cfit/subtest_3/soal_6/F.png" },
    ],
    correctAnswer: "D",
    correctAnswers: ["D"],
  },
  {
    id: "subtest_3_soal_7",
    subtest: 3,
    subtestTitle: "Matriks Pola Gambar (Matrices)",
    title: "Soal 7",
    isExample: false,
    instruction: CFIT_SUBTEST_3_INSTRUCTION,
    questionImage: "/img/cfit/subtest_3/soal_7/Soal-7.png",
    options: [
      { label: "A", image: "/img/cfit/subtest_3/soal_7/A.png" },
      { label: "B", image: "/img/cfit/subtest_3/soal_7/B.png" },
      { label: "C", image: "/img/cfit/subtest_3/soal_7/C.png" },
      { label: "D", image: "/img/cfit/subtest_3/soal_7/D.png" },
      { label: "E", image: "/img/cfit/subtest_3/soal_7/E.png" },
      { label: "F", image: "/img/cfit/subtest_3/soal_7/F.png" },
    ],
    correctAnswer: "E",
    correctAnswers: ["E"],
  },
  {
    id: "subtest_3_soal_8",
    subtest: 3,
    subtestTitle: "Matriks Pola Gambar (Matrices)",
    title: "Soal 8",
    isExample: false,
    instruction: CFIT_SUBTEST_3_INSTRUCTION,
    questionImage: "/img/cfit/subtest_3/soal_8/Soal-8.png",
    options: [
      { label: "A", image: "/img/cfit/subtest_3/soal_8/A.png" },
      { label: "B", image: "/img/cfit/subtest_3/soal_8/B.png" },
      { label: "C", image: "/img/cfit/subtest_3/soal_8/C.png" },
      { label: "D", image: "/img/cfit/subtest_3/soal_8/D.png" },
      { label: "E", image: "/img/cfit/subtest_3/soal_8/E.png" },
      { label: "F", image: "/img/cfit/subtest_3/soal_8/F.png" },
    ],
    correctAnswer: "E",
    correctAnswers: ["E"],
  },
  {
    id: "subtest_3_soal_9",
    subtest: 3,
    subtestTitle: "Matriks Pola Gambar (Matrices)",
    title: "Soal 9",
    isExample: false,
    instruction: CFIT_SUBTEST_3_INSTRUCTION,
    questionImage: "/img/cfit/subtest_3/soal_9/Soal-9.png",
    options: [
      { label: "A", image: "/img/cfit/subtest_3/soal_9/A.png" },
      { label: "B", image: "/img/cfit/subtest_3/soal_9/B.png" },
      { label: "C", image: "/img/cfit/subtest_3/soal_9/C.png" },
      { label: "D", image: "/img/cfit/subtest_3/soal_9/D.png" },
      { label: "E", image: "/img/cfit/subtest_3/soal_9/E.png" },
      { label: "F", image: "/img/cfit/subtest_3/soal_9/F.png" },
    ],
    correctAnswer: "A",
    correctAnswers: ["A"],
  },
  {
    id: "subtest_3_soal_10",
    subtest: 3,
    subtestTitle: "Matriks Pola Gambar (Matrices)",
    title: "Soal 10",
    isExample: false,
    instruction: CFIT_SUBTEST_3_INSTRUCTION,
    questionImage: "/img/cfit/subtest_3/soal_10/Soal-10.png",
    options: [
      { label: "A", image: "/img/cfit/subtest_3/soal_10/A.png" },
      { label: "B", image: "/img/cfit/subtest_3/soal_10/B.png" },
      { label: "C", image: "/img/cfit/subtest_3/soal_10/C.png" },
      { label: "D", image: "/img/cfit/subtest_3/soal_10/D.png" },
      { label: "E", image: "/img/cfit/subtest_3/soal_10/E.png" },
      { label: "F", image: "/img/cfit/subtest_3/soal_10/F.png" },
    ],
    correctAnswer: "A",
    correctAnswers: ["A"],
  },
  {
    id: "subtest_3_soal_11",
    subtest: 3,
    subtestTitle: "Matriks Pola Gambar (Matrices)",
    title: "Soal 11",
    isExample: false,
    instruction: CFIT_SUBTEST_3_INSTRUCTION,
    questionImage: "/img/cfit/subtest_3/soal_11/Soal-11.png",
    options: [
      { label: "A", image: "/img/cfit/subtest_3/soal_11/A.png" },
      { label: "B", image: "/img/cfit/subtest_3/soal_11/B.png" },
      { label: "C", image: "/img/cfit/subtest_3/soal_11/C.png" },
      { label: "D", image: "/img/cfit/subtest_3/soal_11/D.png" },
      { label: "E", image: "/img/cfit/subtest_3/soal_11/E.png" },
      { label: "F", image: "/img/cfit/subtest_3/soal_11/F.png" },
    ],
    correctAnswer: "C",
    correctAnswers: ["C"],
  },
  {
    id: "subtest_3_soal_12",
    subtest: 3,
    subtestTitle: "Matriks Pola Gambar (Matrices)",
    title: "Soal 12",
    isExample: false,
    instruction: CFIT_SUBTEST_3_INSTRUCTION,
    questionImage: "/img/cfit/subtest_3/soal_12/Soal-12.png",
    options: [
      { label: "A", image: "/img/cfit/subtest_3/soal_12/A.png" },
      { label: "B", image: "/img/cfit/subtest_3/soal_12/B.png" },
      { label: "C", image: "/img/cfit/subtest_3/soal_12/C.png" },
      { label: "D", image: "/img/cfit/subtest_3/soal_12/D.png" },
      { label: "E", image: "/img/cfit/subtest_3/soal_12/E.png" },
      { label: "F", image: "/img/cfit/subtest_3/soal_12/F.png" },
    ],
    correctAnswer: "E",
    correctAnswers: ["E"],
  },
  {
    id: "subtest_3_soal_13",
    subtest: 3,
    subtestTitle: "Matriks Pola Gambar (Matrices)",
    title: "Soal 13",
    isExample: false,
    instruction: CFIT_SUBTEST_3_INSTRUCTION,
    questionImage: "/img/cfit/subtest_3/soal_13/Soal-13.png",
    options: [
      { label: "A", image: "/img/cfit/subtest_3/soal_13/A.png" },
      { label: "B", image: "/img/cfit/subtest_3/soal_13/B.png" },
      { label: "C", image: "/img/cfit/subtest_3/soal_13/C.png" },
      { label: "D", image: "/img/cfit/subtest_3/soal_13/D.png" },
      { label: "E", image: "/img/cfit/subtest_3/soal_13/E.png" },
      { label: "F", image: "/img/cfit/subtest_3/soal_13/F.png" },
    ],
    correctAnswer: "A",
    correctAnswers: ["A"],
  },
];

// ==========================================
// SUBTES 4: CONTOH SOAL (LATIHAN)
// Kunci Jawaban Contoh: 1. C | 2. D | 3. B
// ==========================================

export const cfitSubtest4Examples: CFITQuestion[] = [
  {
    id: "subtest_4_contoh_1",
    subtest: 4,
    subtestTitle: "Karakteristik & Kondisi Serupa (Topology)",
    title: "Contoh Soal 1",
    isExample: true,
    instruction: CFIT_SUBTEST_4_INSTRUCTION,
    questionImage: "/img/cfit/subtest_4/contoh_1/Contoh-Soal.png",
    options: [
      { label: "A", image: "/img/cfit/subtest_4/contoh_1/A.png" },
      { label: "B", image: "/img/cfit/subtest_4/contoh_1/B.png" },
      { label: "C", image: "/img/cfit/subtest_4/contoh_1/C.png" },
      { label: "D", image: "/img/cfit/subtest_4/contoh_1/D.png" },
      { label: "E", image: "/img/cfit/subtest_4/contoh_1/E.png" },
    ],
    correctAnswer: "C",
    correctAnswers: ["C"],
    explanation:
      "Perhatikan posisi titik dan keterkaitannya dengan bentuk-bentuk pada gambar di sebelah kiri. Di antara pilihan A sampai E, hanya gambar C yang memungkinkan penempatan titik pada kondisi atau karakteristik hubungan yang serupa.",
  },
  {
    id: "subtest_4_contoh_2",
    subtest: 4,
    subtestTitle: "Karakteristik & Kondisi Serupa (Topology)",
    title: "Contoh Soal 2",
    isExample: true,
    instruction: CFIT_SUBTEST_4_INSTRUCTION,
    questionImage: "/img/cfit/subtest_4/contoh_2/Contoh-Soal.png",
    options: [
      { label: "A", image: "/img/cfit/subtest_4/contoh_2/A.png" },
      { label: "B", image: "/img/cfit/subtest_4/contoh_2/B.png" },
      { label: "C", image: "/img/cfit/subtest_4/contoh_2/C.png" },
      { label: "D", image: "/img/cfit/subtest_4/contoh_2/D.png" },
      { label: "E", image: "/img/cfit/subtest_4/contoh_2/E.png" },
    ],
    correctAnswer: "D",
    correctAnswers: ["D"],
    explanation:
      "Memperhatikan interaksi dan posisi titik di antara bentuk-bentuk pada gambar sebelah kiri, gambar D merupakan pilihan yang menunjukkan kondisi hubungan serupa.",
  },
  {
    id: "subtest_4_contoh_3",
    subtest: 4,
    subtestTitle: "Karakteristik & Kondisi Serupa (Topology)",
    title: "Contoh Soal 3",
    isExample: true,
    instruction: CFIT_SUBTEST_4_INSTRUCTION,
    questionImage: "/img/cfit/subtest_4/contoh_3/Contoh-Soal.png",
    options: [
      { label: "A", image: "/img/cfit/subtest_4/contoh_3/A.png" },
      { label: "B", image: "/img/cfit/subtest_4/contoh_3/B.png" },
      { label: "C", image: "/img/cfit/subtest_4/contoh_3/C.png" },
      { label: "D", image: "/img/cfit/subtest_4/contoh_3/D.png" },
      { label: "E", image: "/img/cfit/subtest_4/contoh_3/E.png" },
    ],
    correctAnswer: "B",
    correctAnswers: ["B"],
    explanation:
      "Berdasarkan keterkaitan bentuk geometris dan penempatan titik pada gambar acuan sebelah kiri, pilihan B adalah gambar yang memiliki karakteristik hubungan serupa.",
  },
];

// ==========================================
// SUBTES 4: SOAL RESMI (NOMOR 1 - 10)
// Kunci Jawaban Resmi:
// 1. B | 2. A | 3. D | 4. D | 5. A | 6. B | 7. C | 8. D | 9. A | 10. A
// ==========================================

export const cfitSubtest4Questions: CFITQuestion[] = [
  {
    id: "subtest_4_soal_1",
    subtest: 4,
    subtestTitle: "Karakteristik & Kondisi Serupa (Topology)",
    title: "Soal 1",
    isExample: false,
    instruction: CFIT_SUBTEST_4_INSTRUCTION,
    questionImage: "/img/cfit/subtest_4/soal_1/Soal-1.png",
    options: [
      { label: "A", image: "/img/cfit/subtest_4/soal_1/A.png" },
      { label: "B", image: "/img/cfit/subtest_4/soal_1/B.png" },
      { label: "C", image: "/img/cfit/subtest_4/soal_1/C.png" },
      { label: "D", image: "/img/cfit/subtest_4/soal_1/D.png" },
      { label: "E", image: "/img/cfit/subtest_4/soal_1/E.png" },
    ],
    correctAnswer: "B",
    correctAnswers: ["B"],
  },
  {
    id: "subtest_4_soal_2",
    subtest: 4,
    subtestTitle: "Karakteristik & Kondisi Serupa (Topology)",
    title: "Soal 2",
    isExample: false,
    instruction: CFIT_SUBTEST_4_INSTRUCTION,
    questionImage: "/img/cfit/subtest_4/soal_2/Soal-2.png",
    options: [
      { label: "A", image: "/img/cfit/subtest_4/soal_2/A.png" },
      { label: "B", image: "/img/cfit/subtest_4/soal_2/B.png" },
      { label: "C", image: "/img/cfit/subtest_4/soal_2/C.png" },
      { label: "D", image: "/img/cfit/subtest_4/soal_2/D.png" },
      { label: "E", image: "/img/cfit/subtest_4/soal_2/E.png" },
    ],
    correctAnswer: "A",
    correctAnswers: ["A"],
  },
  {
    id: "subtest_4_soal_3",
    subtest: 4,
    subtestTitle: "Karakteristik & Kondisi Serupa (Topology)",
    title: "Soal 3",
    isExample: false,
    instruction: CFIT_SUBTEST_4_INSTRUCTION,
    questionImage: "/img/cfit/subtest_4/soal_3/Soal-3.png",
    options: [
      { label: "A", image: "/img/cfit/subtest_4/soal_3/A.png" },
      { label: "B", image: "/img/cfit/subtest_4/soal_3/B.png" },
      { label: "C", image: "/img/cfit/subtest_4/soal_3/C.png" },
      { label: "D", image: "/img/cfit/subtest_4/soal_3/D.png" },
      { label: "E", image: "/img/cfit/subtest_4/soal_3/E.png" },
    ],
    correctAnswer: "D",
    correctAnswers: ["D"],
  },
  {
    id: "subtest_4_soal_4",
    subtest: 4,
    subtestTitle: "Karakteristik & Kondisi Serupa (Topology)",
    title: "Soal 4",
    isExample: false,
    instruction: CFIT_SUBTEST_4_INSTRUCTION,
    questionImage: "/img/cfit/subtest_4/soal_4/Soal-4.png",
    options: [
      { label: "A", image: "/img/cfit/subtest_4/soal_4/A.png" },
      { label: "B", image: "/img/cfit/subtest_4/soal_4/B.png" },
      { label: "C", image: "/img/cfit/subtest_4/soal_4/C.png" },
      { label: "D", image: "/img/cfit/subtest_4/soal_4/D.png" },
      { label: "E", image: "/img/cfit/subtest_4/soal_4/E.png" },
    ],
    correctAnswer: "D",
    correctAnswers: ["D"],
  },
  {
    id: "subtest_4_soal_5",
    subtest: 4,
    subtestTitle: "Karakteristik & Kondisi Serupa (Topology)",
    title: "Soal 5",
    isExample: false,
    instruction: CFIT_SUBTEST_4_INSTRUCTION,
    questionImage: "/img/cfit/subtest_4/soal_5/Soal-5.png",
    options: [
      { label: "A", image: "/img/cfit/subtest_4/soal_5/A.png" },
      { label: "B", image: "/img/cfit/subtest_4/soal_5/B.png" },
      { label: "C", image: "/img/cfit/subtest_4/soal_5/C.png" },
      { label: "D", image: "/img/cfit/subtest_4/soal_5/D.png" },
      { label: "E", image: "/img/cfit/subtest_4/soal_5/E.png" },
    ],
    correctAnswer: "A",
    correctAnswers: ["A"],
  },
  {
    id: "subtest_4_soal_6",
    subtest: 4,
    subtestTitle: "Karakteristik & Kondisi Serupa (Topology)",
    title: "Soal 6",
    isExample: false,
    instruction: CFIT_SUBTEST_4_INSTRUCTION,
    questionImage: "/img/cfit/subtest_4/soal_6/Soal-6.png",
    options: [
      { label: "A", image: "/img/cfit/subtest_4/soal_6/A.png" },
      { label: "B", image: "/img/cfit/subtest_4/soal_6/B.png" },
      { label: "C", image: "/img/cfit/subtest_4/soal_6/C.png" },
      { label: "D", image: "/img/cfit/subtest_4/soal_6/D.png" },
      { label: "E", image: "/img/cfit/subtest_4/soal_6/E.png" },
    ],
    correctAnswer: "B",
    correctAnswers: ["B"],
  },
  {
    id: "subtest_4_soal_7",
    subtest: 4,
    subtestTitle: "Karakteristik & Kondisi Serupa (Topology)",
    title: "Soal 7",
    isExample: false,
    instruction: CFIT_SUBTEST_4_INSTRUCTION,
    questionImage: "/img/cfit/subtest_4/soal_7/Soal-7.png",
    options: [
      { label: "A", image: "/img/cfit/subtest_4/soal_7/A.png" },
      { label: "B", image: "/img/cfit/subtest_4/soal_7/B.png" },
      { label: "C", image: "/img/cfit/subtest_4/soal_7/C.png" },
      { label: "D", image: "/img/cfit/subtest_4/soal_7/D.png" },
      { label: "E", image: "/img/cfit/subtest_4/soal_7/E.png" },
    ],
    correctAnswer: "C",
    correctAnswers: ["C"],
  },
  {
    id: "subtest_4_soal_8",
    subtest: 4,
    subtestTitle: "Karakteristik & Kondisi Serupa (Topology)",
    title: "Soal 8",
    isExample: false,
    instruction: CFIT_SUBTEST_4_INSTRUCTION,
    questionImage: "/img/cfit/subtest_4/soal_8/Soal-8.png",
    options: [
      { label: "A", image: "/img/cfit/subtest_4/soal_8/A.png" },
      { label: "B", image: "/img/cfit/subtest_4/soal_8/B.png" },
      { label: "C", image: "/img/cfit/subtest_4/soal_8/C.png" },
      { label: "D", image: "/img/cfit/subtest_4/soal_8/D.png" },
      { label: "E", image: "/img/cfit/subtest_4/soal_8/E.png" },
    ],
    correctAnswer: "D",
    correctAnswers: ["D"],
  },
  {
    id: "subtest_4_soal_9",
    subtest: 4,
    subtestTitle: "Karakteristik & Kondisi Serupa (Topology)",
    title: "Soal 9",
    isExample: false,
    instruction: CFIT_SUBTEST_4_INSTRUCTION,
    questionImage: "/img/cfit/subtest_4/soal_9/Soal-9.png",
    options: [
      { label: "A", image: "/img/cfit/subtest_4/soal_9/A.png" },
      { label: "B", image: "/img/cfit/subtest_4/soal_9/B.png" },
      { label: "C", image: "/img/cfit/subtest_4/soal_9/C.png" },
      { label: "D", image: "/img/cfit/subtest_4/soal_9/D.png" },
      { label: "E", image: "/img/cfit/subtest_4/soal_9/E.png" },
    ],
    correctAnswer: "A",
    correctAnswers: ["A"],
  },
  {
    id: "subtest_4_soal_10",
    subtest: 4,
    subtestTitle: "Karakteristik & Kondisi Serupa (Topology)",
    title: "Soal 10",
    isExample: false,
    instruction: CFIT_SUBTEST_4_INSTRUCTION,
    questionImage: "/img/cfit/subtest_4/soal_10/Soal-10.png",
    options: [
      { label: "A", image: "/img/cfit/subtest_4/soal_10/A.png" },
      { label: "B", image: "/img/cfit/subtest_4/soal_10/B.png" },
      { label: "C", image: "/img/cfit/subtest_4/soal_10/C.png" },
      { label: "D", image: "/img/cfit/subtest_4/soal_10/D.png" },
      { label: "E", image: "/img/cfit/subtest_4/soal_10/E.png" },
    ],
    correctAnswer: "A",
    correctAnswers: ["A"],
  },
];

// Gabungan semua soal CFIT (Subtes 1, Subtes 2, Subtes 3, & Subtes 4)
export const cfitAllQuestions: CFITQuestion[] = [
  ...cfitSubtest1Questions,
  ...cfitSubtest2Questions,
  ...cfitSubtest3Questions,
  ...cfitSubtest4Questions,
];

// ==========================================
// NORMA & SISTEM SKORING CFIT SKALA 3 FORM A
// ==========================================

export const CFIT_RAW_TO_IQ: Record<number, number> = {
  0: 38,
  1: 40,
  2: 43,
  3: 45,
  4: 48,
  5: 51,
  6: 53,
  7: 56,
  8: 59,
  9: 62,
  10: 65,
  11: 68,
  12: 71,
  13: 74,
  14: 77,
  15: 80,
  16: 83,
  17: 86,
  18: 89,
  19: 92,
  20: 95,
  21: 98,
  22: 101,
  23: 104,
  24: 107,
  25: 110,
  26: 113,
  27: 116,
  28: 119,
  29: 121,
  30: 124,
  31: 127,
  32: 130,
  33: 133,
  34: 137,
  35: 140,
  36: 143,
  37: 147,
  38: 151,
  39: 154,
  40: 157,
  41: 160,
  42: 163,
  43: 166,
  44: 169,
  45: 173,
  46: 176,
  47: 178,
  48: 180,
  49: 182,
  50: 183,
};

export function getCFITCategory(iq: number): string {
  if (iq >= 170) return "Genius";
  if (iq >= 140) return "Very Superior (Sangat Unggul)";
  if (iq >= 120) return "Superior (Unggul)";
  if (iq >= 110) return "High Average (Di Atas Rata-rata)";
  if (iq >= 90) return "Average (Rata-rata)";
  if (iq >= 80) return "Low Average (Di Bawah Rata-rata)";
  if (iq >= 70) return "Borderline (Garis Batas)";
  return "Mentally Defective (Kurang Sekali)";
}

export interface CFITResult {
  subtest_1_score: number;
  subtest_2_score: number;
  subtest_3_score: number;
  subtest_4_score: number;
  total_score: number;
  iq_score: number;
  category: string;
  time_spent_seconds?: Record<string, number>;
}

export function calculateCFITResult(
  answers: Record<string, any>,
  timeSpentSeconds?: Record<string, number>
): CFITResult {
  let subtest_1_score = 0;
  let subtest_2_score = 0;
  let subtest_3_score = 0;
  let subtest_4_score = 0;

  // Subtest 1 (Single option)
  cfitSubtest1Questions.forEach((q) => {
    const userAns = answers[q.id];
    if (
      typeof userAns === "string" &&
      q.correctAnswer &&
      userAns.toUpperCase() === q.correctAnswer.toUpperCase()
    ) {
      subtest_1_score += 1;
    }
  });

  // Subtest 2 (Two options - harus kedua-duanya benar)
  cfitSubtest2Questions.forEach((q) => {
    const userAns = answers[q.id];
    if (Array.isArray(userAns) && q.correctAnswers && q.correctAnswers.length === 2) {
      const userSorted = [...userAns].map((x) => String(x).toUpperCase()).sort();
      const correctSorted = [...q.correctAnswers].map((x) => String(x).toUpperCase()).sort();
      if (
        userSorted.length === 2 &&
        userSorted[0] === correctSorted[0] &&
        userSorted[1] === correctSorted[1]
      ) {
        subtest_2_score += 1;
      }
    }
  });

  // Subtest 3 (Single option)
  cfitSubtest3Questions.forEach((q) => {
    const userAns = answers[q.id];
    if (
      typeof userAns === "string" &&
      q.correctAnswer &&
      userAns.toUpperCase() === q.correctAnswer.toUpperCase()
    ) {
      subtest_3_score += 1;
    }
  });

  // Subtest 4 (Single option)
  cfitSubtest4Questions.forEach((q) => {
    const userAns = answers[q.id];
    if (
      typeof userAns === "string" &&
      q.correctAnswer &&
      userAns.toUpperCase() === q.correctAnswer.toUpperCase()
    ) {
      subtest_4_score += 1;
    }
  });

  const total_score = subtest_1_score + subtest_2_score + subtest_3_score + subtest_4_score;
  const clampedTotal = Math.max(0, Math.min(50, total_score));
  const iq_score = CFIT_RAW_TO_IQ[clampedTotal] ?? 100;
  const category = getCFITCategory(iq_score);

  return {
    subtest_1_score,
    subtest_2_score,
    subtest_3_score,
    subtest_4_score,
    total_score,
    iq_score,
    category,
    time_spent_seconds: timeSpentSeconds || {},
  };
}

