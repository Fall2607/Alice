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
    questionImage: "/img/cfit/contoh_1/Contoh-Soal.png",
    options: [
      { label: "A", image: "/img/cfit/contoh_1/A.png" },
      { label: "B", image: "/img/cfit/contoh_1/B.png" },
      { label: "C", image: "/img/cfit/contoh_1/C.png" },
      { label: "D", image: "/img/cfit/contoh_1/D.png" },
      { label: "E", image: "/img/cfit/contoh_1/E.png" },
      { label: "F", image: "/img/cfit/contoh_1/F.png" },
    ],
    correctAnswer: "C",
    explanation:
      "Pada kotak 1 ranting berdiri tegak lurus ke atas. Pada kotak 2, ranting condong ke arah kanan. Pada kotak 3, ranting semakin condong ke kanan (berputar bertahap searah jarum jam). Oleh karena itu, pada kotak 4 yang kosong, ranting harus meneruskan putarannya ke arah kanan bawah. Gambar C merupakan jawaban yang paling tepat.",
  },
];
