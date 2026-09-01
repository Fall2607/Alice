const discAnswerKey = [
  {
    question_number: 1,
    most: { "1": "S", "2": "I", "3": "X", "4": "C" },
    least: { "1": "S", "2": "I", "3": "D", "4": "C" }
  },
  {
    question_number: 2,
    most: { "1": "D", "2": "C", "3": "X", "4": "X" },
    least: { "1": "D", "2": "C", "3": "I", "4": "S" }
  },
  {
    question_number: 3,
    most: { "1": "X", "2": "D", "3": "S", "4": "I" },
    least: { "1": "C", "2": "D", "3": "S", "4": "X" }
  },
  {
    question_number: 4,
    most: { "1": "C", "2": "D", "3": "X", "4": "S" },
    least: { "1": "X", "2": "D", "3": "I", "4": "S" }
  },
  {
    question_number: 5,
    most: { "1": "X", "2": "D", "3": "S", "4": "I" },
    least: { "1": "C", "2": "D", "3": "S", "4": "X" }
  },
  {
    question_number: 6,
    most: { "1": "D", "2": "X", "3": "X", "4": "C" },
    least: { "1": "D", "2": "I", "3": "S", "4": "X" }
  },
  {
    question_number: 7,
    most: { "1": "I", "2": "X", "3": "X", "4": "D" },
    least: { "1": "I", "2": "C", "3": "S", "4": "X" }
  },
  {
    question_number: 8,
    most: { "1": "S", "2": "X", "3": "D", "4": "C" },
    least: { "1": "X", "2": "I", "3": "D", "4": "C" }
  },
  {
    question_number: 9,
    most: { "1": "D", "2": "S", "3": "I", "4": "X" },
    least: { "1": "D", "2": "X", "3": "I", "4": "C" }
  },
  {
    question_number: 10,
    most: { "1": "C", "2": "S", "3": "X", "4": "D" },
    least: { "1": "C", "2": "S", "3": "I", "4": "D" }
  },
  {
    question_number: 11,
    most: { "1": "X", "2": "C", "3": "I", "4": "D" },
    least: { "1": "S", "2": "X", "3": "I", "4": "D" }
  },
  {
    question_number: 12,
    most: { "1": "D", "2": "S", "3": "I", "4": "C" },
    least: { "1": "X", "2": "S", "3": "I", "4": "X" }
  },
  {
    question_number: 13,
    most: { "1": "I", "2": "D", "3": "S", "4": "X" },
    least: { "1": "X", "2": "D", "3": "S", "4": "C" }
  },
  {
    question_number: 14,
    most: { "1": "D", "2": "S", "3": "I", "4": "X" },
    least: { "1": "D", "2": "X", "3": "X", "4": "C" }
  },
  {
    question_number: 15,
    most: { "1": "S", "2": "D", "3": "I", "4": "X" },
    least: { "1": "S", "2": "D", "3": "I", "4": "C" }
  },
  {
    question_number: 16,
    most: { "1": "C", "2": "D", "3": "I", "4": "S" },
    least: { "1": "X", "2": "D", "3": "I", "4": "S" }
  },
  {
    question_number: 17,
    most: { "1": "C", "2": "I", "3": "S", "4": "D" },
    least: { "1": "C", "2": "I", "3": "X", "4": "D" }
  },
  {
    question_number: 18,
    most: { "1": "S", "2": "X", "3": "D", "4": "C" },
    least: { "1": "S", "2": "I", "3": "D", "4": "C" }
  },
  {
    question_number: 19,
    most: { "1": "S", "2": "I", "3": "X", "4": "X" },
    least: { "1": "X", "2": "I", "3": "C", "4": "S" }
  },
  {
    question_number: 20,
    most: { "1": "S", "2": "C", "3": "I", "4": "D" },
    least: { "1": "S", "2": "X", "3": "I", "4": "D" }
  },
  {
    question_number: 21,
    most: { "1": "X", "2": "I", "3": "S", "4": "X" },
    least: { "1": "D", "2": "X", "3": "S", "4": "C" }
  },
  {
    question_number: 22,
    most: { "1": "I", "2": "S", "3": "C", "4": "D" },
    least: { "1": "I", "2": "S", "3": "C", "4": "D" }
  },
  {
    question_number: 23,
    most: { "1": "X", "2": "C", "3": "I", "4": "S" },
    least: { "1": "D", "2": "X", "3": "I", "4": "S" }
  },
  {
    question_number: 24,
    most: { "1": "X", "2": "I", "3": "D", "4": "C" },
    least: { "1": "S", "2": "I", "3": "X", "4": "X" }
  }
];

interface DISCAnswerInput {
  most: string | null;  // "1", "2", "3", "4"
  least: string | null; // "1", "2", "3", "4"
}

export function calculateDISCResultNew(answers: Record<number, DISCAnswerInput>) {
  const mostCount = { D: 0, I: 0, S: 0, C: 0, X: 0 };
  const leastCount = { D: 0, I: 0, S: 0, C: 0, X: 0 };

  discAnswerKey.forEach((keyItem) => {
    const qNum = keyItem.question_number;
    const userAns = answers[qNum];

    if (userAns) {
      if (userAns.most && (keyItem.most as any)[userAns.most]) {
        const dim = (keyItem.most as any)[userAns.most] as "D" | "I" | "S" | "C" | "X";
        mostCount[dim]++;
      }
      if (userAns.least && (keyItem.least as any)[userAns.least]) {
        const dim = (keyItem.least as any)[userAns.least] as "D" | "I" | "S" | "C" | "X";
        leastCount[dim]++;
      }
    }
  });

  const diff = {
    D: mostCount.D - leastCount.D,
    I: mostCount.I - leastCount.I,
    S: mostCount.S - leastCount.S,
    C: mostCount.C - leastCount.C,
  };

  // Pengelompokan & Pemeringkatan (Midline split at 0)
  const dims: Array<"D" | "I" | "S" | "C"> = ["D", "I", "S", "C"];

  const positive = dims
    .filter((d) => diff[d] >= 0)
    .sort((a, b) => diff[b] - diff[a]);

  const negative = dims
    .filter((d) => diff[d] < 0)
    .sort((a, b) => diff[b] - diff[a]);

  const posString = positive.join("");
  const negString = negative.join("");
  const pattern = `${posString}/${negString}`;

  return {
    most: { D: mostCount.D, I: mostCount.I, S: mostCount.S, C: mostCount.C },
    least: { D: leastCount.D, I: leastCount.I, S: leastCount.S, C: leastCount.C },
    diff,
    pattern,
    positive,
    negative
  };
}

// Uji coba sampel
const sampleAnswers: Record<number, DISCAnswerInput> = {};
for (let i = 1; i <= 24; i++) {
  // simulasi jawaban
  sampleAnswers[i] = {
    most: String((i % 4) + 1),
    least: String(((i + 1) % 4) + 1),
  };
}

const res = calculateDISCResultNew(sampleAnswers);
console.log("Sample Result Calculation:", res);
