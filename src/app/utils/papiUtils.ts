import { papiQuestions } from "@/app/data/tests/papiData";

export type PAPITrait =
  | "G"
  | "L"
  | "I"
  | "T"
  | "V"
  | "S"
  | "R"
  | "D"
  | "C"
  | "E" // Roles
  | "N"
  | "A"
  | "P"
  | "X"
  | "B"
  | "O"
  | "K"
  | "Z"
  | "F"
  | "W"; // Needs

export interface PAPIScore {
  [key: string]: number;
}

/**
 * Fungsi hitung skor PAPI Kostik
 * @param answers Objek jawaban dengan format { soalId: 'A' | 'B' }
 */
export function calculatePAPIResult(
  answers: Record<number, "A" | "B">,
): PAPIScore {
  const scores: PAPIScore = {
    G: 0,
    L: 0,
    I: 0,
    T: 0,
    V: 0,
    S: 0,
    R: 0,
    D: 0,
    C: 0,
    E: 0,
    N: 0,
    A: 0,
    P: 0,
    X: 0,
    B: 0,
    O: 0,
    K: 0,
    Z: 0,
    F: 0,
    W: 0,
  };

  papiQuestions.forEach((q) => {
    const userAns = answers[q.id];
    if (userAns === "A" && q.valA) {
      scores[q.valA] = (scores[q.valA] || 0) + 1;
    } else if (userAns === "B" && q.valB) {
      scores[q.valB] = (scores[q.valB] || 0) + 1;
    }
  });

  return scores;
}

/**
 * Deskripsi singkat setiap dimensi untuk kebutuhan report (Opsional)
 */
export const papiTraitDescriptions: Record<PAPITrait, string> = {
  G: "Pekerja Keras",
  L: "Peran Kepemimpinan",
  I: "Kemampuan Mengambil Keputusan",
  T: "Kecepatan Kerja",
  V: "Energi & Vitalitas",
  S: "Interaksi Sosial",
  R: "Berpikir Teoritis",
  D: "Minat pada Detail",
  C: "Keteraturan",
  E: "Pengendalian Emosi",
  N: "Kebutuhan Menyelesaikan Tugas",
  A: "Kebutuhan Berprestasi",
  P: "Kebutuhan Mengontrol Orang Lain",
  X: "Kebutuhan Diperhatikan",
  B: "Kebutuhan Kelompok",
  O: "Kebutuhan Kedekatan & Kasih Sayang",
  K: "Kebutuhan Agresif / Memaksa",
  Z: "Kebutuhan Perubahan",
  F: "Kebutuhan Mengikuti Atasan",
  W: "Kebutuhan Arahan",
};
