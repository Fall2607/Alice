"use client";

import React from "react";
import { ChevronLeft, ChevronRight, Info, Check } from "lucide-react";
import { discQuestions } from "@/app/data/tests/discData";

interface DISCProps {
  questionIdx: number;
  answers: Record<number, { most: string | null; least: string | null }>;
  setAnswers: (
    val: Record<number, { most: string | null; least: string | null }>,
  ) => void;
  onNext: () => void;
  onBack: () => void;
}

export default function DISCTestContent({
  questionIdx,
  answers,
  setAnswers,
  onNext,
  onBack,
}: DISCProps) {
  const currentSet = discQuestions[questionIdx];
  const currentAnswer = answers[currentSet.id] || { most: null, least: null };

  const handleToggle = (optId: string, type: "most" | "least") => {
    const updated = { ...currentAnswer };

    if (type === "most") {
      updated.most = updated.most === optId ? null : optId;
      if (updated.least === optId) updated.least = null;
    } else {
      updated.least = updated.least === optId ? null : optId;
      if (updated.most === optId) updated.most = null;
    }

    setAnswers({ ...answers, [currentSet.id]: updated });
  };

  const isReady = currentAnswer.most && currentAnswer.least;

  return (
    <div className="animate-in fade-in duration-500 w-full max-w-4xl mx-auto pb-24 px-4 md:px-0">
      <div className="mb-8 px-1 flex flex-col md:flex-row md:justify-between md:items-end gap-3">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="h-6 w-1 bg-orange-500 rounded-full"></div>
            <h2 className="text-xl font-black text-slate-800 uppercase tracking-tight leading-none">
              Set Pertanyaan {questionIdx + 1}
            </h2>
          </div>
          <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">
            Pilih 1 di kolom M (Paling) & 1 di kolom L (Paling Tidak)
          </p>
        </div>
        <div className="flex items-center gap-3 bg-slate-50 px-3 py-1.5 rounded-md border border-slate-100">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
            Progress
          </span>
          <div className="h-1 w-20 bg-slate-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-orange-500 transition-all duration-500"
              style={{ width: `${((questionIdx + 1) / 24) * 100}%` }}
            ></div>
          </div>
          <span className="text-[10px] font-black text-orange-600">
            {Math.round(((questionIdx + 1) / 24) * 100)}%
          </span>
        </div>
      </div>

      {/* RESPONSIVE DISC SET CONTAINER (M DI KIRI, PERNYATAAN DI TENGAH, L DI KANAN) */}
      <div className="bg-white border border-slate-200 rounded-2xl p-3 md:p-5 shadow-sm space-y-2.5 md:space-y-3">
        {currentSet.options.map((opt) => {
          const isMost = currentAnswer.most === opt.id;
          const isLeast = currentAnswer.least === opt.id;

          return (
            <div
              key={opt.id}
              className={`p-2.5 sm:p-3.5 md:p-4 rounded-xl border-2 transition-all flex items-center gap-3 sm:gap-4 ${
                isMost
                  ? "border-blue-500 bg-blue-50/40 shadow-sm"
                  : isLeast
                  ? "border-red-500 bg-red-50/40 shadow-sm"
                  : "border-slate-100 bg-white hover:border-slate-200"
              }`}
            >
              {/* TOMBOL M (KIRI) */}
              <button
                type="button"
                onClick={() => handleToggle(opt.id, "most")}
                className={`h-11 w-11 sm:h-12 sm:w-12 rounded-xl flex items-center justify-center shrink-0 border-2 transition-all active:scale-90 select-none ${
                  isMost
                    ? "bg-blue-600 border-blue-600 text-white shadow-md shadow-blue-500/30 font-black text-sm sm:text-base"
                    : "bg-slate-50 border-slate-200 text-slate-400 hover:border-blue-400 hover:text-blue-600 font-bold text-sm"
                }`}
              >
                M
              </button>

              {/* TEKS PERNYATAAN (TENGAH) */}
              <div className="flex-1 min-w-0 text-left px-1">
                <p
                  className={`text-xs sm:text-sm leading-snug transition-colors ${
                    isMost
                      ? "text-blue-900 font-bold"
                      : isLeast
                      ? "text-red-900 font-bold"
                      : "text-slate-700 font-medium"
                  }`}
                >
                  {opt.text}
                </p>
              </div>

              {/* TOMBOL L (KANAN) */}
              <button
                type="button"
                onClick={() => handleToggle(opt.id, "least")}
                className={`h-11 w-11 sm:h-12 sm:w-12 rounded-xl flex items-center justify-center shrink-0 border-2 transition-all active:scale-90 select-none ${
                  isLeast
                    ? "bg-red-600 border-red-600 text-white shadow-md shadow-red-500/30 font-black text-sm sm:text-base"
                    : "bg-slate-50 border-slate-200 text-slate-400 hover:border-red-400 hover:text-red-600 font-bold text-sm"
                }`}
              >
                L
              </button>
            </div>
          );
        })}
      </div>

      {/* TOMBOL NAVIGASI MOBILE-FRIENDLY */}
      <div className="mt-6 sm:mt-8 grid grid-cols-2 gap-3 sm:flex sm:justify-between sm:items-center">
        <button
          onClick={onBack}
          disabled={questionIdx === 0}
          className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 sm:px-6 py-3.5 sm:py-3.5 bg-white border-2 border-slate-200 text-slate-700 font-black rounded-xl text-xs uppercase tracking-wider disabled:opacity-30 disabled:border-slate-200 disabled:text-slate-300 disabled:cursor-not-allowed hover:bg-slate-50 active:scale-95 transition-all shadow-sm"
        >
          <ChevronLeft size={18} />
          <span>Sebelumnya</span>
        </button>
        <button
          onClick={onNext}
          disabled={!isReady}
          className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 sm:px-8 py-3.5 sm:py-3.5 bg-slate-900 text-white font-black rounded-xl text-xs uppercase tracking-wider shadow-lg shadow-slate-900/10 active:scale-95 disabled:bg-slate-100 disabled:border-2 disabled:border-slate-200 disabled:text-slate-300 disabled:shadow-none disabled:cursor-not-allowed transition-all"
        >
          <span>{questionIdx === 23 ? "Selesai" : "Selanjutnya"}</span>
          <ChevronRight size={18} />
        </button>
      </div>
    </div>
  );
}
