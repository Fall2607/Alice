"use client";

import React from "react";
import { ChevronLeft, Check, Info } from "lucide-react";
import { papiQuestions } from "@/app/data/tests/papiData";

interface PAPIProps {
  questionIdx: number;
  answers: Record<number, "A" | "B">;
  setAnswers: (val: Record<number, "A" | "B">) => void;
  onNext: () => void;
  onBack: () => void;
}

export default function PAPITestContent({
  questionIdx,
  answers,
  setAnswers,
  onNext,
  onBack,
}: PAPIProps) {
  // Guard untuk mencegah error jika index di luar jangkauan
  const currentSet = papiQuestions[questionIdx] || papiQuestions[0];

  const handleChoice = (choice: "A" | "B") => {
    setAnswers({ ...answers, [currentSet.id]: choice });
    // Auto-Next dengan delay visual singkat untuk memberikan feedback pengerjaan yang cepat
    setTimeout(() => {
      onNext();
    }, 200);
  };

  const progress = Math.round(((questionIdx + 1) / 90) * 100);

  return (
    <div className="animate-in fade-in duration-500 w-full max-w-4xl mx-auto pb-24 px-4 md:px-0">
      <div className="mb-10 px-1 flex flex-col md:flex-row md:justify-between md:items-end gap-3 border-b border-slate-100 pb-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="h-6 w-1 bg-emerald-500 rounded-full"></div>
            <h2 className="text-xl font-black text-slate-800 uppercase tracking-tight leading-none">
              PAPI Kostik — No. {questionIdx + 1}
            </h2>
          </div>
          <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1 italic font-sans">
            Pilih satu pernyataan yang paling sesuai dengan diri Anda
          </p>
        </div>
        <div className="flex items-center gap-3 bg-slate-50 px-3 py-1.5 rounded-md border border-slate-100 shadow-inner">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
            Progress
          </span>
          <div className="h-1.5 w-32 bg-slate-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-emerald-500 transition-all duration-500"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          <span className="text-[10px] font-black text-emerald-600">
            {progress}%
          </span>
        </div>
      </div>

      <div className="space-y-4">
        {/* OPSI A */}
        <button
          onClick={() => handleChoice("A")}
          className={`w-full text-left p-6 md:p-10 rounded-md border-2 transition-all group relative overflow-hidden active:scale-[0.98] ${
            answers[currentSet.id] === "A"
              ? "border-blue-600 bg-blue-50/30 shadow-lg shadow-blue-900/5"
              : "border-slate-100 bg-white hover:border-blue-200 shadow-sm"
          }`}
        >
          <div className="flex items-center gap-6 relative z-10">
            <div
              className={`h-12 w-12 rounded-full border-2 flex items-center justify-center font-black text-lg transition-all shrink-0 ${
                answers[currentSet.id] === "A"
                  ? "bg-blue-600 border-blue-600 text-white shadow-md"
                  : "bg-slate-50 border-slate-200 text-slate-400"
              }`}
            >
              A
            </div>
            <span
              className={`text-base md:text-xl font-medium leading-relaxed ${answers[currentSet.id] === "A" ? "text-blue-700 font-bold" : "text-slate-600"}`}
            >
              {currentSet.a}
            </span>
          </div>
          {answers[currentSet.id] === "A" && (
            <div className="absolute top-0 right-0 p-3">
              <Check className="text-blue-600" size={24} strokeWidth={4} />
            </div>
          )}
        </button>

        {/* OPSI B */}
        <button
          onClick={() => handleChoice("B")}
          className={`w-full text-left p-6 md:p-10 rounded-md border-2 transition-all group relative overflow-hidden active:scale-[0.98] ${
            answers[currentSet.id] === "B"
              ? "border-blue-600 bg-blue-50/30 shadow-lg shadow-blue-900/5"
              : "border-slate-100 bg-white hover:border-blue-200 shadow-sm"
          }`}
        >
          <div className="flex items-center gap-6 relative z-10">
            <div
              className={`h-12 w-12 rounded-full border-2 flex items-center justify-center font-black text-lg transition-all shrink-0 ${
                answers[currentSet.id] === "B"
                  ? "bg-blue-600 border-blue-600 text-white shadow-md"
                  : "bg-slate-50 border-slate-200 text-slate-400"
              }`}
            >
              B
            </div>
            <span
              className={`text-base md:text-xl font-medium leading-relaxed ${answers[currentSet.id] === "B" ? "text-blue-700 font-bold" : "text-slate-600"}`}
            >
              {currentSet.b}
            </span>
          </div>
          {answers[currentSet.id] === "B" && (
            <div className="absolute top-0 right-0 p-3">
              <Check className="text-blue-600" size={24} strokeWidth={4} />
            </div>
          )}
        </button>
      </div>

      <div className="mt-12 flex justify-between items-center px-1">
        <button
          onClick={onBack}
          disabled={questionIdx === 0}
          className="flex items-center gap-2 px-8 py-4 bg-white border border-slate-200 text-slate-400 font-black rounded-md text-[10px] uppercase tracking-widest disabled:opacity-20 hover:bg-slate-50 transition-all shadow-sm"
        >
          <ChevronLeft size={16} /> Sebelumnya
        </button>
        <div className="flex items-center gap-2 text-slate-300 font-bold text-[9px] uppercase tracking-widest font-sans">
          <Info size={14} /> Pilih satu opsi untuk lanjut otomatis
        </div>
      </div>
    </div>
  );
}
