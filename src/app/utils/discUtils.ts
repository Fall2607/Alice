import { discAnswerKey } from "@/app/data/tests/discData";
import { getDISCProfileDetail, DISCProfileDetail, discProfileList } from "@/app/data/tests/discProfiles";

export type { DISCProfileDetail };
export { getDISCProfileDetail, discProfileList };

export type DISCAnswer = {
  most: string | null;  // Opsi "1", "2", "3", atau "4"
  least: string | null; // Opsi "1", "2", "3", atau "4"
};

export function calculateDISCResult(answers: Record<number, DISCAnswer>) {
  const mostCount = { D: 0, I: 0, S: 0, C: 0, X: 0 };
  const leastCount = { D: 0, I: 0, S: 0, C: 0, X: 0 };

  // 1. Pemetaan Jawaban & Perhitungan Most / Least (24 Pertanyaan)
  discAnswerKey.forEach((keyItem) => {
    const qNum = keyItem.question_number;
    const userAns = answers[qNum];

    if (userAns) {
      // Pemetaan Most
      if (userAns.most && (keyItem.most as any)[userAns.most]) {
        const dimMost = (keyItem.most as any)[userAns.most] as "D" | "I" | "S" | "C" | "X";
        mostCount[dimMost]++;
      }
      // Pemetaan Least
      if (userAns.least && (keyItem.least as any)[userAns.least]) {
        const dimLeast = (keyItem.least as any)[userAns.least] as "D" | "I" | "S" | "C" | "X";
        leastCount[dimLeast]++;
      }
    }
  });

  // 2. Hitung Skor Change / Selisih (Most - Least)
  const diff = {
    D: mostCount.D - leastCount.D,
    I: mostCount.I - leastCount.I,
    S: mostCount.S - leastCount.S,
    C: mostCount.C - leastCount.C,
  };

  // 3. Pengelompokan & Pemeringkatan (Midline split at 0)
  const dims: Array<"D" | "I" | "S" | "C"> = ["D", "I", "S", "C"];

  // Kelompok Positif (Garis Tengah >= 0) diurutkan dari terbesar ke terkecil
  const positive = dims
    .filter((d) => diff[d] >= 0)
    .sort((a, b) => diff[b] - diff[a]);

  // Kelompok Negatif (Garis Tengah < 0) diurutkan dari terbesar ke terkecil
  const negative = dims
    .filter((d) => diff[d] < 0)
    .sort((a, b) => diff[b] - diff[a]);

  // Format Pola DISC (Contoh: SI/CD)
  const posString = positive.join("");
  const negString = negative.join("");
  const pattern = `${posString}/${negString}`;
  const profile = getDISCProfileDetail({ positive: posString, negative: negString, pattern });

  return {
    most: { D: mostCount.D, I: mostCount.I, S: mostCount.S, C: mostCount.C },
    least: { D: leastCount.D, I: leastCount.I, S: leastCount.S, C: leastCount.C },
    diff,
    pattern,
    positive,
    negative,
    profile
  };
}
