"use client";

import React, { useCallback, useEffect, useState } from "react";
import {
  AlertCircle,
  ArrowDown,
  ArrowUp,
  Check,
  Clock,
  Edit2,
  FileText,
  Loader2,
  Plus,
  Save,
  Trash2,
} from "lucide-react";
import { getAuthHeaders } from "@/app/lib/adminFetch";

interface EssayQuestionDraft {
  readonly id?: string;
  readonly pertanyaan: string;
  readonly panduan_penilaian: string;
}

interface EssayBundleDraft {
  readonly id?: string;
  readonly nama_bundle: string;
  readonly durasi_menit: number;
  readonly is_active: boolean;
  readonly isEditingName?: boolean;
  readonly questions: readonly EssayQuestionDraft[];
}

interface EssayBundleBuilderProps {
  readonly jobId: string;
}

const DURATION_PRESETS = [15, 20, 30] as const;

export default function EssayBundleBuilder({ jobId }: EssayBundleBuilderProps) {
  const [bundles, setBundles] = useState<EssayBundleDraft[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [feedback, setFeedback] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const fetchBundles = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/job-essay-bundles/${jobId}`, {
        headers: getAuthHeaders(),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || "Gagal memuat bank soal essay.");
      }
      const data = await res.json();
      const normalized: EssayBundleDraft[] = (Array.isArray(data) ? data : []).map(
        (b: {
          id?: string;
          nama_bundle: string;
          durasi_menit?: number;
          is_active?: boolean;
          questions?: { id?: string; pertanyaan: string; panduan_penilaian?: string | null }[];
        }) => ({
          id: b.id,
          nama_bundle: b.nama_bundle,
          durasi_menit: Math.min(30, Math.max(1, Number(b.durasi_menit) || 30)),
          is_active: b.is_active !== false,
          isEditingName: false,
          questions: (b.questions ?? []).map((q) => ({
            id: q.id,
            pertanyaan: q.pertanyaan || "",
            panduan_penilaian: q.panduan_penilaian || "",
          })),
        })
      );
      setBundles(normalized);
    } catch (error) {
      setFeedback({
        type: "error",
        text: error instanceof Error ? error.message : "Gagal memuat data soal essay.",
      });
    } finally {
      setIsLoading(false);
    }
  }, [jobId]);

  useEffect(() => {
    fetchBundles();
  }, [fetchBundles]);

  const addBundle = () => {
    setBundles((prev) => [
      ...prev,
      {
        nama_bundle: `Paket Essay ${prev.length + 1}`,
        durasi_menit: 30,
        is_active: true,
        isEditingName: true,
        questions: [{ pertanyaan: "", panduan_penilaian: "" }],
      },
    ]);
  };

  const removeBundle = (bIndex: number) => {
    if (!confirm("Hapus paket soal essay beserta seluruh pertanyaannya?")) return;
    setBundles((prev) => prev.filter((_, idx) => idx !== bIndex));
  };

  const updateBundleField = <K extends keyof EssayBundleDraft>(
    bIndex: number,
    field: K,
    value: EssayBundleDraft[K]
  ) => {
    setBundles((prev) =>
      prev.map((bundle, idx) =>
        idx === bIndex ? { ...bundle, [field]: value } : bundle
      )
    );
  };

  const addQuestion = (bIndex: number) => {
    setBundles((prev) =>
      prev.map((bundle, idx) =>
        idx === bIndex
          ? {
              ...bundle,
              questions: [
                ...bundle.questions,
                { pertanyaan: "", panduan_penilaian: "" },
              ],
            }
          : bundle
      )
    );
  };

  const removeQuestion = (bIndex: number, qIndex: number) => {
    setBundles((prev) =>
      prev.map((bundle, idx) =>
        idx === bIndex
          ? {
              ...bundle,
              questions: bundle.questions.filter((_, i) => i !== qIndex),
            }
          : bundle
      )
    );
  };

  const moveQuestion = (bIndex: number, qIndex: number, direction: -1 | 1) => {
    setBundles((prev) =>
      prev.map((bundle, idx) => {
        if (idx !== bIndex) return bundle;
        const target = qIndex + direction;
        if (target < 0 || target >= bundle.questions.length) return bundle;
        const reordered = [...bundle.questions];
        const [moved] = reordered.splice(qIndex, 1);
        reordered.splice(target, 0, moved);
        return { ...bundle, questions: reordered };
      })
    );
  };

  const updateQuestionField = (
    bIndex: number,
    qIndex: number,
    field: keyof EssayQuestionDraft,
    value: string
  ) => {
    setBundles((prev) =>
      prev.map((bundle, idx) =>
        idx === bIndex
          ? {
              ...bundle,
              questions: bundle.questions.map((q, qi) =>
                qi === qIndex ? { ...q, [field]: value } : q
              ),
            }
          : bundle
      )
    );
  };

  const handleSave = async () => {
    setIsSaving(true);
    setFeedback(null);
    try {
      const payload = bundles.map((bundle) => ({
        id: bundle.id,
        nama_bundle: bundle.nama_bundle.trim(),
        durasi_menit: Math.min(30, Math.max(1, Number(bundle.durasi_menit) || 30)),
        is_active: bundle.is_active,
        questions: bundle.questions.map((q) => ({
          id: q.id,
          pertanyaan: q.pertanyaan.trim(),
          panduan_penilaian: q.panduan_penilaian.trim() || null,
        })),
      }));

      const res = await fetch(`/api/job-essay-bundles/${jobId}`, {
        method: "PUT",
        headers: getAuthHeaders({ "Content-Type": "application/json" }),
        body: JSON.stringify({ bundles: payload }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Gagal menyimpan bank soal essay.");
      }

      setFeedback({
        type: "success",
        text: "Bank soal essay berhasil disimpan. Paket siap dipilih pada lowongan.",
      });
      await fetchBundles();
    } catch (error) {
      setFeedback({
        type: "error",
        text: error instanceof Error ? error.message : "Terjadi kesalahan saat menyimpan.",
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="p-10 text-center">
        <Loader2 className="animate-spin mx-auto text-primary" size={28} />
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6 md:p-8 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-100 pb-5">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <FileText size={20} className="text-primary" />
            Bank Soal Tes Essay Kompetensi
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Susun paket soal essay per spesialisasi (maksimal durasi 30 menit). Jawaban pelamar dinilai oleh user pengaju / atasannya.
          </p>
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            type="button"
            onClick={addBundle}
            className="flex-1 sm:flex-none px-4 py-2.5 border border-slate-200 text-slate-700 rounded-xl text-xs font-bold hover:bg-slate-50 flex items-center justify-center gap-2 active:scale-[0.98] transition-all min-h-[44px]"
          >
            <Plus size={15} /> Paket Baru
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            className="flex-1 sm:flex-none px-5 py-2.5 bg-primary text-white rounded-xl text-xs font-bold hover:bg-primary-dark transition-all flex items-center justify-center gap-2 disabled:opacity-50 active:scale-[0.98] min-h-[44px]"
          >
            {isSaving ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
            Simpan Soal Essay
          </button>
        </div>
      </div>

      {feedback && (
        <div
          className={`p-3.5 rounded-xl text-xs font-bold flex items-center gap-2 border ${
            feedback.type === "success"
              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
              : "bg-rose-50 text-rose-700 border-rose-200"
          }`}
        >
          <AlertCircle size={15} className="shrink-0" />
          <span>{feedback.text}</span>
        </div>
      )}

      {bundles.length === 0 ? (
        <div className="text-center py-12 px-6 bg-slate-50/70 border border-dashed border-slate-200 rounded-2xl space-y-3">
          <FileText size={32} className="mx-auto text-slate-300" />
          <p className="text-sm font-bold text-slate-700">
            Belum ada paket soal essay untuk posisi ini
          </p>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Jika posisi ini belum membutuhkan tes essay, biarkan kosong sehingga pelamar hanya mengerjakan modul psikometri standar.
          </p>
          <button
            type="button"
            onClick={addBundle}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-primary text-white rounded-xl text-xs font-bold hover:bg-primary-dark transition-all active:scale-[0.98] min-h-[44px]"
          >
            <Plus size={15} /> Buat Paket Soal Pertama
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {bundles.map((bundle, bIdx) => (
            <div
              key={bundle.id || `draft-${bIdx}`}
              className="border border-slate-200 rounded-2xl overflow-hidden bg-white shadow-xs"
            >
              {/* Header Bundle */}
              <div className="bg-slate-50/90 px-5 py-4 border-b border-slate-200 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="flex items-center gap-3 flex-1">
                  {bundle.isEditingName ? (
                    <div className="flex items-center gap-2 w-full max-w-md">
                      <input
                        type="text"
                        value={bundle.nama_bundle}
                        onChange={(e) =>
                          updateBundleField(bIdx, "nama_bundle", e.target.value)
                        }
                        placeholder="Nama Paket (misal: Studi Kasus Perawat IGD)"
                        className="px-3.5 py-2 border border-primary rounded-xl text-sm font-bold text-slate-900 bg-white w-full focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                        autoFocus
                      />
                      <button
                        type="button"
                        onClick={() => updateBundleField(bIdx, "isEditingName", false)}
                        className="p-2 bg-primary text-white rounded-xl hover:bg-primary-dark transition-colors min-h-[38px] min-w-[38px] flex items-center justify-center"
                        title="Selesai ubah nama"
                      >
                        <Check size={16} />
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2.5">
                      <h3 className="text-sm font-extrabold text-slate-800 uppercase tracking-wide">
                        Paket: <span className="text-primary">{bundle.nama_bundle}</span>
                      </h3>
                      <button
                        type="button"
                        onClick={() => updateBundleField(bIdx, "isEditingName", true)}
                        className="p-1.5 text-slate-400 hover:text-primary rounded-lg transition-colors"
                        title="Ubah nama paket"
                      >
                        <Edit2 size={14} />
                      </button>
                    </div>
                  )}
                </div>

                {/* Durasi (Max 30 Menit) & Status Aktif */}
                <div className="flex flex-wrap items-center gap-3">
                  <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-xl border border-slate-200">
                    <Clock size={14} className="text-primary" />
                    <span className="text-[11px] font-bold text-slate-600">Durasi:</span>
                    <div className="flex items-center gap-1">
                      {DURATION_PRESETS.map((preset) => (
                        <button
                          key={preset}
                          type="button"
                          onClick={() => updateBundleField(bIdx, "durasi_menit", preset)}
                          className={`px-2 py-0.5 rounded-lg text-[11px] font-bold tabular-nums transition-colors ${
                            bundle.durasi_menit === preset
                              ? "bg-primary text-white"
                              : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                          }`}
                        >
                          {preset}m
                        </button>
                      ))}
                    </div>
                    <input
                      type="number"
                      min={1}
                      max={30}
                      value={bundle.durasi_menit}
                      onChange={(e) => {
                        const raw = parseInt(e.target.value, 10);
                        const clamped = Number.isNaN(raw) ? 1 : Math.min(30, Math.max(1, raw));
                        updateBundleField(bIdx, "durasi_menit", clamped);
                      }}
                      className="w-14 px-2 py-1 text-xs font-mono font-bold text-center border border-slate-200 rounded-lg bg-slate-50 focus:bg-white focus:outline-none focus:border-primary"
                    />
                    <span className="text-[11px] text-slate-400 font-semibold">mnt</span>
                  </div>

                  <label className="flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-200 rounded-xl cursor-pointer text-xs font-bold text-slate-700">
                    <input
                      type="checkbox"
                      checked={bundle.is_active}
                      onChange={(e) =>
                        updateBundleField(bIdx, "is_active", e.target.checked)
                      }
                      className="rounded border-slate-300 text-primary focus:ring-primary accent-primary"
                    />
                    Aktif
                  </label>

                  <button
                    type="button"
                    onClick={() => removeBundle(bIdx)}
                    className="text-xs font-bold text-rose-600 hover:bg-rose-50 px-3 py-2 rounded-xl flex items-center gap-1.5 transition-colors"
                  >
                    <Trash2 size={14} /> Hapus Paket
                  </button>
                </div>
              </div>

              {/* Daftar Soal */}
              <div className="p-5 space-y-4 divide-y divide-slate-100">
                {bundle.questions.length === 0 ? (
                  <p className="text-center text-xs text-slate-400 py-4">
                    Paket ini belum memiliki pertanyaan essay.
                  </p>
                ) : (
                  bundle.questions.map((question, qIdx) => (
                    <div key={qIdx} className="pt-4 first:pt-0 space-y-3">
                      <div className="flex items-center justify-between gap-2">
                        <span className="inline-flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-slate-600">
                          <span className="w-6 h-6 rounded-lg bg-primary/10 text-primary font-mono flex items-center justify-center">
                            {qIdx + 1}
                          </span>
                          Pertanyaan Essay #{qIdx + 1}
                        </span>
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => moveQuestion(bIdx, qIdx, -1)}
                            disabled={qIdx === 0}
                            className="p-1.5 text-slate-400 hover:text-slate-700 disabled:opacity-30 rounded-lg"
                            title="Pindah ke atas"
                          >
                            <ArrowUp size={14} />
                          </button>
                          <button
                            type="button"
                            onClick={() => moveQuestion(bIdx, qIdx, 1)}
                            disabled={qIdx === bundle.questions.length - 1}
                            className="p-1.5 text-slate-400 hover:text-slate-700 disabled:opacity-30 rounded-lg"
                            title="Pindah ke bawah"
                          >
                            <ArrowDown size={14} />
                          </button>
                          <button
                            type="button"
                            onClick={() => removeQuestion(bIdx, qIdx)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                            title="Hapus pertanyaan"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                            Pertanyaan / Studi Kasus (Tampil ke Pelamar)
                          </label>
                          <textarea
                            rows={3}
                            value={question.pertanyaan}
                            onChange={(e) =>
                              updateQuestionField(
                                bIdx,
                                qIdx,
                                "pertanyaan",
                                e.target.value
                              )
                            }
                            placeholder="Contoh: Jelaskan langkah triase awal saat menerima dua pasien gawat darurat secara bersamaan..."
                            className="w-full px-3.5 py-2.5 bg-slate-50/80 border border-slate-200/90 rounded-xl text-sm text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-primary transition-all"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                            Panduan / Poin Penilaian (Opsional • Hanya Tampil ke Penilai)
                          </label>
                          <textarea
                            rows={3}
                            value={question.panduan_penilaian}
                            onChange={(e) =>
                              updateQuestionField(
                                bIdx,
                                qIdx,
                                "panduan_penilaian",
                                e.target.value
                              )
                            }
                            placeholder="Contoh: Kandidat menyebutkan prioritas ABC (Airway, Breathing, Circulation), komunikasi efektif dengan tim, dan ketenangan pengambilan keputusan."
                            className="w-full px-3.5 py-2.5 bg-amber-50/40 border border-amber-200/70 rounded-xl text-sm text-slate-700 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-400 transition-all"
                          />
                        </div>
                      </div>
                    </div>
                  ))
                )}

                <div className="pt-4">
                  <button
                    type="button"
                    onClick={() => addQuestion(bIdx)}
                    className="w-full py-2.5 border border-dashed border-slate-300 rounded-xl text-xs font-bold text-slate-600 hover:border-primary hover:text-primary hover:bg-primary/5 flex items-center justify-center gap-2 transition-all min-h-[44px]"
                  >
                    <Plus size={15} /> Tambah Pertanyaan Essay ke Paket Ini
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

