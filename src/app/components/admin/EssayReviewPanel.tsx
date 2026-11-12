"use client";

import React, { useEffect, useState } from "react";
import {
  AlertCircle,
  CheckCircle2,
  Clock,
  FileText,
  Info,
  Loader2,
  Save,
  UserCheck,
  XCircle,
} from "lucide-react";
import { getAuthHeaders } from "@/app/lib/adminFetch";

export interface EssayAnswerSnapshot {
  readonly question_id: string;
  readonly urutan: number;
  readonly pertanyaan: string;
  readonly panduan_penilaian?: string | null;
  readonly answer: string;
}

export interface EssayResultRecord {
  readonly id: string;
  readonly assessment_id: string;
  readonly answers: readonly EssayAnswerSnapshot[];
  readonly time_spent_seconds: number;
  readonly submitted_at: string;
  readonly review_decision: "LOLOS" | "TIDAK_LOLOS" | null;
  readonly review_notes: string | null;
  readonly question_notes: Record<string, string> | null;
  readonly reviewed_by_name: string | null;
  readonly reviewed_at: string | null;
}

interface EssayReviewPanelProps {
  readonly essayResult: EssayResultRecord | null;
  readonly essayRequired: boolean;
  readonly essayBundleName?: string | null;
  readonly canManageLowongan: boolean;
  readonly onSaved: (updatedReview: Partial<EssayResultRecord>) => void;
}

export default function EssayReviewPanel({
  essayResult,
  essayRequired,
  essayBundleName,
  canManageLowongan,
  onSaved,
}: EssayReviewPanelProps) {
  const [decision, setDecision] = useState<"LOLOS" | "TIDAK_LOLOS" | "">(
    essayResult?.review_decision ?? ""
  );
  const [reviewNotes, setReviewNotes] = useState<string>(
    essayResult?.review_notes ?? ""
  );
  const [questionNotes, setQuestionNotes] = useState<Record<string, string>>(
    essayResult?.question_notes ?? {}
  );
  const [isSaving, setIsSaving] = useState(false);
  const [feedback, setFeedback] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  useEffect(() => {
    setDecision(essayResult?.review_decision ?? "");
    setReviewNotes(essayResult?.review_notes ?? "");
    setQuestionNotes(essayResult?.question_notes ?? {});
    setFeedback(null);
  }, [essayResult]);

  if (!essayRequired && !essayResult) {
    return null;
  }

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins} menit ${secs} detik`;
  };

  const handleSaveReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!essayResult) return;

    if (!decision) {
      setFeedback({
        type: "error",
        text: "Pilih rekomendasi tes essay: Lolos atau Tidak Lolos.",
      });
      return;
    }

    if (!reviewNotes.trim()) {
      setFeedback({
        type: "error",
        text: "Mohon isi catatan kualitatif hasil pemeriksaan jawaban essay.",
      });
      return;
    }

    setIsSaving(true);
    setFeedback(null);

    try {
      const res = await fetch("/api/assessment/essay/review", {
        method: "PUT",
        headers: getAuthHeaders({ "Content-Type": "application/json" }),
        body: JSON.stringify({
          assessment_id: essayResult.assessment_id,
          review_decision: decision,
          review_notes: reviewNotes.trim(),
          question_notes: questionNotes,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Gagal menyimpan penilaian tes essay.");
      }

      setFeedback({
        type: "success",
        text: "Penilaian tes essay berhasil disimpan.",
      });
      onSaved(data.review);
    } catch (error) {
      setFeedback({
        type: "error",
        text: error instanceof Error ? error.message : "Gagal menyimpan penilaian.",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-sky-50 text-primary rounded-xl border border-sky-100">
            <FileText size={20} />
          </div>
          <div>
            <h4 className="font-extrabold text-primary-dark text-sm uppercase tracking-wider">
              Tes Essay Kompetensi {essayBundleName ? `— ${essayBundleName}` : ""}
            </h4>
            <p className="text-xs text-slate-500 mt-0.5">
              {essayResult
                ? `Dikirim pada ${new Date(essayResult.submitted_at).toLocaleString("id-ID", { dateStyle: "medium", timeStyle: "short" })} • Durasi: ${formatDuration(essayResult.time_spent_seconds)}`
                : "Kandidat belum menyelesaikan modul tes essay."}
            </p>
          </div>
        </div>

        {essayResult?.review_decision && (
          <span
            className={`px-3.5 py-1.5 rounded-full text-xs font-extrabold uppercase tracking-wider border inline-flex items-center gap-1.5 ${
              essayResult.review_decision === "LOLOS"
                ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                : "bg-rose-50 text-rose-700 border-rose-200"
            }`}
          >
            {essayResult.review_decision === "LOLOS" ? (
              <CheckCircle2 size={14} />
            ) : (
              <XCircle size={14} />
            )}
            Essay: {essayResult.review_decision === "LOLOS" ? "Lolos" : "Tidak Lolos"}
          </span>
        )}
      </div>

      {!essayResult ? (
        <div className="p-6 bg-slate-50 rounded-xl border border-dashed border-slate-200 text-center text-xs text-slate-500 font-medium flex flex-col items-center gap-2">
          <Clock size={22} className="text-slate-300" />
          <span>Jawaban tes essay belum tersedia sampai kandidat mengirimkan modul essay.</span>
        </div>
      ) : (
        <>
          {/* Daftar Jawaban Kandidat */}
          <div className="space-y-4">
            {essayResult.answers.map((item, idx) => (
              <div
                key={item.question_id || idx}
                className="p-5 rounded-xl bg-slate-50/70 border border-slate-200/80 space-y-3"
              >
                <div className="flex items-start gap-2.5">
                  <span className="w-6 h-6 rounded-lg bg-primary text-white text-xs font-mono font-bold flex items-center justify-center shrink-0 mt-0.5">
                    {item.urutan || idx + 1}
                  </span>
                  <p className="text-sm font-bold text-slate-800 leading-relaxed">
                    {item.pertanyaan}
                  </p>
                </div>

                {item.panduan_penilaian && (
                  <div className="ml-8 p-3 rounded-lg bg-amber-50/80 border border-amber-200/80 text-xs text-amber-900">
                    <span className="font-extrabold uppercase tracking-wider block text-[10px] text-amber-700 mb-1">
                      Panduan Penilaian (Internal)
                    </span>
                    <p className="whitespace-pre-line leading-relaxed">{item.panduan_penilaian}</p>
                  </div>
                )}

                <div className="ml-8 p-4 rounded-xl bg-white border border-slate-200 text-sm text-slate-700 whitespace-pre-line leading-relaxed">
                  {item.answer ? (
                    item.answer
                  ) : (
                    <span className="italic text-slate-400">
                      (Kandidat tidak mengisi jawaban untuk soal ini)
                    </span>
                  )}
                </div>

                <div className="ml-8">
                  <input
                    type="text"
                    value={questionNotes[item.question_id] ?? ""}
                    onChange={(e) =>
                      setQuestionNotes((prev) => ({
                        ...prev,
                        [item.question_id]: e.target.value,
                      }))
                    }
                    placeholder="Catatan singkat khusus butir ini (opsional)..."
                    className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-primary"
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Form Penilaian Kualitatif & Rekomendasi Essay */}
          <form
            onSubmit={handleSaveReview}
            className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-4"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <h5 className="text-xs font-extrabold uppercase tracking-wider text-primary-dark flex items-center gap-2">
                <UserCheck size={16} className="text-primary" />
                Penilaian & Rekomendasi Tes Essay
              </h5>
              {essayResult.reviewed_by_name && essayResult.reviewed_at && (
                <span className="text-[11px] font-semibold text-slate-500">
                  Terakhir dinilai oleh{" "}
                  <strong className="text-slate-700">{essayResult.reviewed_by_name}</strong>{" "}
                  ({new Date(essayResult.reviewed_at).toLocaleString("id-ID", { dateStyle: "medium", timeStyle: "short" })})
                </span>
              )}
            </div>

            {!canManageLowongan && (
              <div className="p-3 rounded-xl bg-sky-50 border border-sky-200 text-xs text-sky-900 flex items-start gap-2">
                <Info size={15} className="text-primary shrink-0 mt-0.5" />
                <span>
                  Penilaian ini bersifat rekomendasi untuk tahapan tes essay. Keputusan akhir kelulusan pelamar tetap ditetapkan oleh HC.
                </span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setDecision("LOLOS")}
                className={`p-3.5 rounded-xl border-2 text-left transition-all flex items-center gap-3 active:scale-[0.98] min-h-[44px] ${
                  decision === "LOLOS"
                    ? "border-emerald-500 bg-emerald-50 text-emerald-800 shadow-xs"
                    : "border-slate-200 bg-white text-slate-600 hover:border-emerald-300"
                }`}
              >
                <CheckCircle2
                  size={20}
                  className={decision === "LOLOS" ? "text-emerald-600" : "text-slate-300"}
                />
                <div>
                  <p className="text-xs font-extrabold uppercase tracking-wider">
                    Lolos Tes Essay
                  </p>
                  <p className="text-[11px] opacity-80">
                    Jawaban sesuai kompetensi unit
                  </p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setDecision("TIDAK_LOLOS")}
                className={`p-3.5 rounded-xl border-2 text-left transition-all flex items-center gap-3 active:scale-[0.98] min-h-[44px] ${
                  decision === "TIDAK_LOLOS"
                    ? "border-rose-500 bg-rose-50 text-rose-800 shadow-xs"
                    : "border-slate-200 bg-white text-slate-600 hover:border-rose-300"
                }`}
              >
                <XCircle
                  size={20}
                  className={decision === "TIDAK_LOLOS" ? "text-rose-600" : "text-slate-300"}
                />
                <div>
                  <p className="text-xs font-extrabold uppercase tracking-wider">
                    Tidak Lolos Tes Essay
                  </p>
                  <p className="text-[11px] opacity-80">
                    Belum memenuhi standar kompetensi unit
                  </p>
                </div>
              </button>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                Catatan Kualitatif Penilai *
              </label>
              <textarea
                rows={3}
                value={reviewNotes}
                onChange={(e) => setReviewNotes(e.target.value)}
                placeholder="Tuliskan ringkasan penilaian kompetensi, kelebihan, atau catatan pertimbangan untuk HC..."
                className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-primary"
              />
            </div>

            {feedback && (
              <div
                className={`p-3 rounded-xl text-xs font-bold flex items-center gap-2 border ${
                  feedback.type === "success"
                    ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                    : "bg-rose-50 text-rose-700 border-rose-200"
                }`}
              >
                <AlertCircle size={14} />
                <span>{feedback.text}</span>
              </div>
            )}

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={isSaving}
                className="px-6 py-2.5 bg-primary hover:bg-primary-dark text-white rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-2 disabled:opacity-50 active:scale-[0.98] transition-all min-h-[44px]"
              >
                {isSaving ? (
                  <Loader2 size={15} className="animate-spin" />
                ) : (
                  <Save size={15} />
                )}
                Simpan Penilaian Essay
              </button>
            </div>
          </form>
        </>
      )}
    </div>
  );
}

