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
            Pilih deskripsi yang Paling (P) & Bukan (B)
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

      {/* DESKTOP VIEW: TABLE */}
      <div className="hidden md:block bg-white border border-slate-100 rounded-md shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse table-fixed">
          <thead>
            <tr className="bg-slate-50/50 border-b border-slate-100">
              <th className="p-5 text-[10px] font-black text-slate-400 uppercase tracking-widest border-r border-slate-100">
                Pernyataan Karakteristik
              </th>
              <th className="p-5 text-[10px] font-black text-slate-400 uppercase tracking-widest border-r border-slate-100 w-24 text-center">
                Paling (P)
              </th>
              <th className="p-5 text-[10px] font-black text-slate-400 uppercase tracking-widest w-24 text-center">
                Bukan (B)
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {currentSet.options.map((opt) => (
              <tr
                key={opt.id}
                className="hover:bg-slate-50/30 transition-colors"
              >
                <td className="p-5 border-r border-slate-100">
                  <span
                    className={`text-sm font-medium transition-colors ${currentAnswer.most === opt.id ? "text-blue-600" : currentAnswer.least === opt.id ? "text-red-500" : "text-slate-600"}`}
                  >
                    {opt.text}
                  </span>
                </td>
                <td
                  onClick={() => handleToggle(opt.id, "most")}
                  className={`p-3 md:p-4 border-r border-slate-100 cursor-pointer text-center transition-all ${currentAnswer.most === opt.id ? "bg-blue-50/30" : ""}`}
                >
                  <div
                    className={`mx-auto h-8 w-8 rounded-full border flex items-center justify-center transition-all ${currentAnswer.most === opt.id ? "border-blue-600 bg-blue-600 text-white shadow-md" : "border-slate-200 text-slate-200"}`}
                  >
                    <span className="text-xs font-black">P</span>
                  </div>
                </td>
                <td
                  onClick={() => handleToggle(opt.id, "least")}
                  className={`p-3 md:p-4 cursor-pointer text-center transition-all ${currentAnswer.least === opt.id ? "bg-red-50/30" : ""}`}
                >
                  <div
                    className={`mx-auto h-8 w-8 rounded-full border flex items-center justify-center transition-all ${currentAnswer.least === opt.id ? "border-red-500 bg-red-500 text-white shadow-md" : "border-slate-200 text-slate-200"}`}
                  >
                    <span className="text-xs font-black">B</span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* MOBILE VIEW: CARDS */}
      <div className="md:hidden space-y-4">
        {currentSet.options.map((opt) => (
          <div
            key={opt.id}
            className={`bg-white border rounded-md p-5 transition-all shadow-sm ${currentAnswer.most === opt.id ? "border-blue-200 ring-1 ring-blue-50" : currentAnswer.least === opt.id ? "border-red-200 ring-1 ring-red-50" : "border-slate-100"}`}
          >
            <p
              className={`text-sm font-bold leading-snug mb-5 ${currentAnswer.most === opt.id ? "text-blue-600" : currentAnswer.least === opt.id ? "text-red-500" : "text-slate-700"}`}
            >
              {opt.text}
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => handleToggle(opt.id, "most")}
                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-md border font-black text-[10px] uppercase tracking-widest transition-all active:scale-95 ${currentAnswer.most === opt.id ? "bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-100" : "bg-white border-slate-200 text-slate-400"}`}
              >
                {currentAnswer.most === opt.id && <Check size={14} />} Paling
                (P)
              </button>
              <button
                onClick={() => handleToggle(opt.id, "least")}
                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-md border font-black text-[10px] uppercase tracking-widest transition-all active:scale-95 ${currentAnswer.least === opt.id ? "bg-red-600 border-red-600 text-white shadow-lg shadow-red-100" : "bg-white border-slate-200 text-slate-400"}`}
              >
                {currentAnswer.least === opt.id && <Check size={14} />} Bukan
                (B)
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-10 flex justify-between items-center px-1">
        <button
          onClick={onBack}
          disabled={questionIdx === 0}
          className="flex items-center gap-2 px-6 py-3 bg-white border border-slate-200 text-slate-400 font-bold rounded-md text-[10px] uppercase tracking-widest disabled:opacity-20 hover:bg-slate-50 transition-all"
        >
          <ChevronLeft size={16} /> Sebelumnya
        </button>
        <button
          onClick={onNext}
          disabled={!isReady}
          className="flex items-center gap-2 px-10 py-3 bg-slate-900 text-white font-bold rounded-md text-[10px] uppercase tracking-widest shadow-lg active:scale-95 disabled:bg-slate-100 disabled:text-slate-300 transition-all"
        >
          {questionIdx === 23 ? "Selesaikan DISC" : "Selanjutnya"}{" "}
          <ChevronRight size={16} />
        </button>
      </div>

      <div className="mt-12 bg-blue-50 border border-blue-100 rounded-md p-4 flex items-start gap-4">
        <Info size={18} className="text-blue-500 shrink-0 mt-0.5" />
        <p className="text-[10px] text-blue-700 font-medium leading-relaxed italic uppercase tracking-wider">
          Kandidat wajib memilih satu karakteristik yang paling menggambarkan
          dirinya (P) dan satu yang paling tidak menggambarkan dirinya (B) pada
          setiap set pertanyaan.
        </p>
      </div>
    </div>
  );
}
