"use client";

import React, { useMemo } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { mbtiPairs } from "@/app/data/tests/mbtiData";

interface MBTIProps {
  stage: number;
  answers: Record<number, "A" | "B">;
  setAnswers: (val: Record<number, "A" | "B">) => void;
  onNext: () => void;
  onBack: () => void;
}

export default function MBTITestContent({
  stage,
  answers,
  setAnswers,
  onNext,
  onBack,
}: MBTIProps) {
  const currentPairs = useMemo(
    () => mbtiPairs.filter((p) => p.stage === stage),
    [stage],
  );
  const labels: Record<number, string> = { 1: "Satu", 2: "Dua", 3: "Tiga", 4: "Empat" };

  const handleSelect = (id: number, val: "A" | "B") => {
    setAnswers({ ...answers, [id]: val });
  };

  const isComplete = currentPairs.every((p) => !!answers[p.id]);

  return (
    <div className="animate-in fade-in duration-700 w-full max-w-5xl mx-auto pb-20">
      <div className="mb-6 px-1">
        <h2 className="text-xl font-black text-slate-800 uppercase tracking-tight">
          Tahap {labels[stage]} :
        </h2>
        <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1 italic">
          Pilihlah yang paling sesuai dengan diri Anda
        </p>
      </div>

      {/* DESKTOP VIEW */}
      <div className="hidden md:block bg-white border border-slate-100 rounded-md shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse table-fixed">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-100">
              <th className="p-4 text-[10px] font-black text-slate-400 uppercase tracking-widest w-16 text-center border-r border-slate-100">
                No
              </th>
              <th className="p-4 text-[10px] font-black text-slate-400 uppercase tracking-widest border-r border-slate-100 text-center">
                Pilihan A
              </th>
              <th className="p-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">
                Pilihan B
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {currentPairs.map((p, i) => (
              <tr
                key={p.id}
                className="hover:bg-slate-50/50 transition-colors group"
              >
                <td className="p-4 text-center border-r border-slate-100 text-xs font-bold text-slate-300">
                  {(stage - 1) * 7 + i + 1}
                </td>
                <td
                  onClick={() => handleSelect(p.id, "A")}
                  className={`p-4 border-r border-slate-100 cursor-pointer transition-all ${answers[p.id] === "A" ? "bg-blue-50/30" : ""}`}
                >
                  <div className="flex items-start gap-4">
                    <div
                      className={`mt-0.5 h-4 w-4 rounded-full border flex items-center justify-center shrink-0 transition-all ${answers[p.id] === "A" ? "border-[#0173b6] bg-[#0173b6]" : "border-slate-200 group-hover:border-slate-300"}`}
                    >
                      {answers[p.id] === "A" && (
                        <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                      )}
                    </div>
                    <span
                      className={`text-sm font-medium leading-relaxed transition-colors ${answers[p.id] === "A" ? "text-[#0173b6]" : "text-slate-500"}`}
                    >
                      {p.a}
                    </span>
                  </div>
                </td>
                <td
                  onClick={() => handleSelect(p.id, "B")}
                  className={`p-4 cursor-pointer transition-all ${answers[p.id] === "B" ? "bg-blue-50/30" : ""}`}
                >
                  <div className="flex items-start gap-4">
                    <div
                      className={`mt-0.5 h-4 w-4 rounded-full border flex items-center justify-center shrink-0 transition-all ${answers[p.id] === "B" ? "border-[#0173b6] bg-[#0173b6]" : "border-slate-200 group-hover:border-slate-300"}`}
                    >
                      {answers[p.id] === "B" && (
                        <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                      )}
                    </div>
                    <span
                      className={`text-sm font-medium leading-relaxed transition-colors ${answers[p.id] === "B" ? "text-[#0173b6]" : "text-slate-500"}`}
                    >
                      {p.b}
                    </span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* MOBILE VIEW */}
      <div className="md:hidden space-y-4">
        {currentPairs.map((p, i) => (
          <div
            key={p.id}
            className="bg-white border border-slate-100 rounded-md p-5 shadow-sm"
          >
            <div className="flex items-center gap-2 mb-4 pb-2 border-b border-slate-50">
              <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">
                Soal #{(stage - 1) * 7 + i + 1}
              </span>
            </div>
            <div className="space-y-3">
              <button
                onClick={() => handleSelect(p.id, "A")}
                className={`w-full text-left p-4 rounded-md border transition-all flex items-start gap-3 ${answers[p.id] === "A" ? "border-[#0173b6] bg-blue-50/30 text-[#0173b6]" : "border-slate-50 text-slate-500 bg-slate-50/50"}`}
              >
                <div
                  className={`mt-1 h-4 w-4 rounded-full border flex items-center justify-center shrink-0 ${answers[p.id] === "A" ? "border-[#0173b6] bg-[#0173b6]" : "border-slate-300"}`}
                >
                  {answers[p.id] === "A" && (
                    <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                  )}
                </div>
                <span className="text-sm font-medium leading-snug">{p.a}</span>
              </button>
              <button
                onClick={() => handleSelect(p.id, "B")}
                className={`w-full text-left p-4 rounded-md border transition-all flex items-start gap-3 ${answers[p.id] === "B" ? "border-[#0173b6] bg-blue-50/30 text-[#0173b6]" : "border-slate-50 text-slate-500 bg-slate-50/50"}`}
              >
                <div
                  className={`mt-1 h-4 w-4 rounded-full border flex items-center justify-center shrink-0 ${answers[p.id] === "B" ? "border-[#0173b6] bg-[#0173b6]" : "border-slate-300"}`}
                >
                  {answers[p.id] === "B" && (
                    <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                  )}
                </div>
                <span className="text-sm font-medium leading-snug">{p.b}</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-10 flex justify-between items-center px-1">
        <button
          onClick={onBack}
          disabled={stage === 1}
          className="flex items-center gap-2 px-6 py-3 bg-white border border-slate-200 text-slate-400 font-bold rounded-md text-[10px] uppercase tracking-widest disabled:opacity-20 hover:bg-slate-50 transition-all"
        >
          <ChevronLeft size={16} /> Sebelumnya
        </button>
        <button
          onClick={onNext}
          disabled={!isComplete}
          className="flex items-center gap-2 px-10 py-3 bg-[#0173b6] text-white font-bold rounded-md text-[10px] uppercase tracking-widest shadow-lg shadow-blue-100 active:scale-95 disabled:bg-slate-100 disabled:text-slate-300"
        >
          {stage === 4 ? "Simpan" : "Tahap Berikutnya"}{" "}
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}
