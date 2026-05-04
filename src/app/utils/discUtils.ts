import { discQuestions } from "@/app/data/tests/discData";

export type DISCAnswer = {
  most: string | null;
  least: string | null;
};

export function calculateDISCResult(answers: Record<number, DISCAnswer>) {
  const summary = {
    most: { D: 0, I: 0, S: 0, C: 0 },
    least: { D: 0, I: 0, S: 0, C: 0 },
    diff: { D: 0, I: 0, S: 0, C: 0 },
  };

  Object.entries(answers).forEach(([questionId, ans]) => {
    const q = discQuestions.find((dq) => dq.id === Number(questionId));
    if (!q) return;

    // Hitung Most (Paling)
    const mostOpt = q.options.find((opt) => opt.id === ans.most);
    if (mostOpt) summary.most[mostOpt.type]++;

    // Hitung Least (Bukan)
    const leastOpt = q.options.find((opt) => opt.id === ans.least);
    if (leastOpt) summary.least[leastOpt.type]++;
  });

  // Hitung Selisih
  summary.diff.D = summary.most.D - summary.least.D;
  summary.diff.I = summary.most.I - summary.least.I;
  summary.diff.S = summary.most.S - summary.least.S;
  summary.diff.C = summary.most.C - summary.least.C;

  return summary;
}
