import { mbtiPairs } from "@/app/data/tests/mbtiData";
import { getMBTIProfileDetail, MBTIProfileDetail, mbtiProfileList, mbtiProfileMap } from "@/app/data/tests/mbtiProfiles";

export type { MBTIProfileDetail };
export { getMBTIProfileDetail, mbtiProfileList, mbtiProfileMap };

export function getMbtiResult(answers: Record<number, 'A' | 'B'>) {
  const score = { E: 0, I: 0, S: 0, N: 0, T: 0, F: 0, J: 0, P: 0 };

  mbtiPairs.forEach((p) => {
    const ans = answers[p.id];
    if (!ans) return;

    // Karakter pertama dimensi (E, S, T, J) ada di posisi indeks 0 string dim
    // Karakter kedua dimensi (I, N, F, P) ada di posisi indeks 1 string dim
    const charA = p.dim[0];
    const charB = p.dim[1];

    if (ans === 'A') {
      (score as Record<string, number>)[charA]++;
    } else {
      (score as Record<string, number>)[charB]++;
    }
  });

  const type =
    (score.E >= score.I ? 'E' : 'I') +
    (score.S >= score.N ? 'S' : 'N') +
    (score.T >= score.F ? 'T' : 'F') +
    (score.J >= score.P ? 'J' : 'P');

  const profile = getMBTIProfileDetail(type);

  return { type, score, profile };
}