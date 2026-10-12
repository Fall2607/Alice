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
  questionImage: string;
  options: CFITOption[];
  correctAnswer: CFITOptionLetter;
  explanation: string;
}

export const cfitQuestions: CFITQuestion[] = [
  {
    id: "contoh_1",
    subtest: 1,
    subtestTitle: "Subtes 1: Pola Seri Gambar (Series)",
    title: "Contoh Soal 1",
    isExample: true,
    instruction:
      "Perhatikan deretan 3 kotak pertama dari kiri ke kanan yang memiliki pola berurutan. Pilihlah salah satu dari 6 pilihan (A, B, C, D, E, F) yang paling tepat untuk mengisi kotak ke-4 (garis putus-putus).",
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
    explanation:
      "Pada kotak 1 ranting berdiri tegak lurus ke atas. Pada kotak 2, ranting condong ke arah kanan. Pada kotak 3, ranting semakin condong ke kanan (berputar bertahap searah jarum jam). Oleh karena itu, pada kotak 4 yang kosong, ranting harus meneruskan putarannya ke arah kanan bawah. Gambar C merupakan jawaban yang paling tepat.",
  },
  {
    id: "contoh_2",
    subtest: 1,
    subtestTitle: "Subtes 1: Pola Seri Gambar (Series)",
    title: "Contoh Soal 2",
    isExample: true,
    instruction:
      "Perhatikan deretan 3 kotak pertama dari kiri ke kanan yang memiliki pola berurutan. Pilihlah salah satu dari 6 pilihan (A, B, C, D, E, F) yang paling tepat untuk mengisi kotak ke-4 (garis putus-putus).",
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
    explanation:
      "Pada kotak 1 bidang hitam di bagian atas memiliki ketebalan sekitar 1/4 kotak. Pada kotak 2 bidang hitam bertambah tebal ke bawah. Pada kotak 3 bidang hitam semakin meluas hingga menutupi separuh kotak. Pola ini menunjukkan pertambahan bidang hitam dari atas ke bawah secara konsisten bertahap. Maka pada kotak ke-4, bidang hitam bertambah tebal hingga menutupi sekitar 3/4 kotak. Gambar E merupakan jawaban yang paling tepat.",
  },
  {
    id: "contoh_3",
    subtest: 1,
    subtestTitle: "Subtes 1: Pola Seri Gambar (Series)",
    title: "Contoh Soal 3",
    isExample: true,
    instruction:
      "Perhatikan deretan 3 kotak pertama dari kiri ke kanan yang memiliki pola berurutan. Pilihlah salah satu dari 6 pilihan (A, B, C, D, E, F) yang paling tepat untuk mengisi kotak ke-4 (garis putus-putus).",
    questionImage: "/img/cfit/subtest_1/contoh_3/Contoh_Soal.png",
    options: [
      { label: "A", image: "/img/cfit/subtest_1/contoh_3/A.png" },
      { label: "B", image: "/img/cfit/subtest_1/contoh_3/B.png" },
      { label: "C", image: "/img/cfit/subtest_1/contoh_3/C.png" },
      { label: "D", image: "/img/cfit/subtest_1/contoh_3/D.png" },
      { label: "E", image: "/img/cfit/subtest_1/contoh_3/E.png" },
      { label: "F", image: "/img/cfit/subtest_1/contoh_3/F.png" },
    ],
    correctAnswer: "E",
    explanation:
      "Pada kotak 1 terdapat 1 butir pola di posisi paling atas (arah jam 12). Pada kotak 2 butir bertambah 1 searah jarum jam menjadi 2 butir. Pada kotak 3 butir bertambah 1 lagi searah jarum jam menjadi 3 butir yang melengkung ke kanan. Maka pada kotak ke-4, jumlah butir bertambah menjadi 4 butir yang melanjutkan lengkungan lingkaran searah putaran jarum jam ke kanan bawah. Gambar E merupakan jawaban yang paling tepat.",
  },
];
