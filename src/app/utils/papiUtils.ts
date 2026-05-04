/**
 * Path: src/app/(public)/assessment/papiUtils.ts
 * Deskripsi: Logika perhitungan skor PAPI Kostik (90 Soal).
 * Memetakan jawaban A/B ke 20 Dimensi (G, L, I, T, V, S, R, D, C, E, N, A, P, X, B, O, K, Z, F, W).
 */

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

  // Mapping Standard PAPI Kostik Scoring Grid (90 Items)
  // Format: [SoalID, Dimensi_Jika_A, Dimensi_Jika_B]
  const mapping: [number, PAPITrait, PAPITrait][] = [
    [1, "G", "E"],
    [2, "A", "G"],
    [3, "P", "A"],
    [4, "X", "P"],
    [5, "B", "X"],
    [6, "O", "B"],
    [7, "K", "O"],
    [8, "Z", "K"],
    [9, "F", "Z"],
    [10, "W", "F"],
    [11, "G", "C"],
    [12, "L", "G"],
    [13, "I", "L"],
    [14, "T", "I"],
    [15, "V", "T"],
    [16, "S", "V"],
    [17, "R", "S"],
    [18, "D", "R"],
    [19, "C", "D"],
    [20, "E", "C"],
    [21, "G", "N"],
    [22, "L", "A"],
    [23, "I", "P"],
    [24, "T", "X"],
    [25, "V", "B"],
    [26, "S", "O"],
    [27, "R", "K"],
    [28, "D", "Z"],
    [29, "C", "F"],
    [30, "E", "W"],
    [31, "G", "G"],
    [32, "L", "G"],
    [33, "I", "L"],
    [34, "T", "I"],
    [35, "V", "T"],
    [36, "S", "V"],
    [37, "R", "S"],
    [38, "D", "R"],
    [39, "C", "D"],
    [40, "E", "C"],
    [41, "G", "A"],
    [42, "L", "P"],
    [43, "I", "X"],
    [44, "T", "B"],
    [45, "V", "O"],
    [46, "S", "K"],
    [47, "R", "Z"],
    [48, "D", "F"],
    [49, "C", "W"],
    [50, "E", "N"],
    [51, "G", "L"],
    [52, "L", "I"],
    [53, "I", "T"],
    [54, "T", "V"],
    [55, "V", "S"],
    [56, "S", "R"],
    [57, "R", "D"],
    [58, "D", "C"],
    [59, "C", "E"],
    [60, "E", "G"],
    [61, "G", "P"],
    [62, "L", "X"],
    [63, "I", "B"],
    [64, "T", "O"],
    [65, "V", "K"],
    [66, "S", "Z"],
    [67, "R", "F"],
    [68, "D", "W"],
    [69, "C", "N"],
    [70, "E", "A"],
    [71, "G", "I"],
    [72, "L", "T"],
    [73, "I", "V"],
    [74, "T", "S"],
    [75, "V", "R"],
    [76, "S", "D"],
    [77, "R", "C"],
    [78, "D", "E"],
    [79, "C", "G"],
    [80, "E", "L"],
    [81, "G", "X"],
    [82, "L", "B"],
    [83, "I", "O"],
    [84, "T", "K"],
    [85, "V", "Z"],
    [86, "S", "F"],
    [87, "R", "W"],
    [88, "D", "N"],
    [89, "C", "A"],
    [90, "E", "P"],
  ];

  mapping.forEach(([id, traitA, traitB]) => {
    const userAns = answers[id];
    if (userAns === "A") {
      scores[traitA]++;
    } else if (userAns === "B") {
      scores[traitB]++;
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
  K: "Kebutuhan Perubahan",
  Z: "Kebutuhan Struktur",
  F: "Kebutuhan Mengikuti Atasan",
  W: "Kebutuhan Arahan",
};
