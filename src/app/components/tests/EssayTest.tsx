"use client";

import React from "react";
import { AlertCircle, CheckCircle2, FileText, Loader2, Send } from "lucide-react";

export interface CandidateEssayQuestion {
  readonly id: string;
  readonly urutan: number;
  readonly pertanyaan: string;
}

interface EssayTestProps {
  readonly bundleName: string;
  readonly durationMinutes: number;
  readonly questions: readonly CandidateEssayQuestion[];
  readonly answers: Record<string, string>;
  readonly setAnswers: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  readonly isSubmitting: boolean;
  readonly onSubmit: () => void;
}

export default function EssayTestContent({
  bundleName,
  durationMinutes,
  questions,
  answers,
  setAnswers,
  isSubmitting,
  onSubmit,
}: EssayTestProps) {
  const answeredCount = questions.filter(
    (q) => (answers[q.id] ?? "").trim().length > 0
  ).length;
  const allAnswered = questions.length > 0 && answeredCount === questions.length;

  const handleAnswerChange = (questionId: string, value: string) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: value,
    }));
  };

  return (
    <div className="max-w-3xl mx-auto w-full space-y-6 pb-12">
      {/* Header Status */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="p-2.5 bg-blue-50 text-[#0173b6] rounded-xl border border-blue-100 shrink-0">
            <FileText size={22} />
          </div>
          <div>
            <h2 className="text-base font-extrabold text-slate-800 uppercase tracking-tight">
              Tes Essay Kompetensi — {bundleName}
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Jawablah seluruh pertanyaan studi kasus dengan jelas dan terstruktur dalam batas waktu {durationMinutes} menit.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0 bg-slate-50 px-4 py-2 rounded-xl border border-slate-200">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
            Progres:
          </span>
          <span className="font-mono tabular-nums text-sm font-black text-[#0173b6]">
            {answeredCount}/{questions.length}
          </span>
        </div>
      </div>

      {/* Daftar Soal Essay */}
      <div className="space-y-6">
        {questions.map((question, idx) => {
          const val = answers[question.id] ?? "";
          const hasContent = val.trim().length > 0;
          return (
            <div
              key={question.id}
              className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <span className="w-7 h-7 rounded-lg bg-[#0173b6] text-white font-mono text-xs font-extrabold flex items-center justify-center shrink-0 mt-0.5">
                    {question.urutan || idx + 1}
                  </span>
                  <p className="text-sm md:text-base font-bold text-slate-800 leading-relaxed whitespace-pre-line">
                    {question.pertanyaan}
                  </p>
                </div>
                {hasContent && (
                  <CheckCircle2 size={18} className="text-emerald-500 shrink-0 mt-1" />
                )}
              </div>

              <div className="space-y-2">
                <textarea
                  rows={6}
                  value={val}
                  onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                  placeholder="Tuliskan jawaban atau analisis Anda secara jelas di sini..."
                  className="w-full px-4 py-3.5 bg-slate-50/80 border border-slate-200/90 rounded-xl text-sm text-slate-800 leading-relaxed focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-[#0173b6] transition-all"
                />
                <div className="flex justify-between items-center text-[11px] text-slate-400 font-medium">
                  <span>Gunakan poin atau paragraf agar mudah dibaca tim penilai.</span>
                  <span className="font-mono tabular-nums">{val.length} karakter</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer Submit */}
      <div className="bg-white p-6 rounded-2xl border-2 border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2.5 text-xs text-slate-600">
          {!allAnswered ? (
            <>
              <AlertCircle size={18} className="text-amber-500 shrink-0" />
              <span>
                Masih ada{" "}
                <strong className="text-slate-800">
                  {questions.length - answeredCount} soal
                </strong>{" "}
                yang belum diisi. Lengkapi seluruh soal sebelum mengirim.
              </span>
            </>
          ) : (
            <>
              <CheckCircle2 size={18} className="text-emerald-600 shrink-0" />
              <span className="font-semibold text-emerald-700">
                Seluruh soal sudah terjawab dan siap dikirim.
              </span>
            </>
          )}
        </div>

        <button
          type="button"
          disabled={isSubmitting || !allAnswered}
          onClick={onSubmit}
          className="w-full sm:w-auto px-8 py-3.5 bg-[#0173b6] hover:bg-[#015a8f] disabled:opacity-50 disabled:cursor-not-allowed text-white font-extrabold text-xs uppercase tracking-wider rounded-xl flex items-center justify-center gap-2 transition-all active:scale-[0.98] min-h-[44px]"
        >
          {isSubmitting ? (
            <>
              <Loader2 size={16} className="animate-spin" /> Menyimpan Jawaban...
            </>
          ) : (
            <>
              <Send size={16} /> Kirim Jawaban Essay
            </>
          )}
        </button>
      </div>
    </div>
  );
}

