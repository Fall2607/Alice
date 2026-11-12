"use client";

import React, { useCallback, useEffect, useState } from "react";
import {
  AlertCircle,
  CheckCircle2,
  Clock,
  FileText,
  Loader2,
  Save,
  XCircle,
} from "lucide-react";
import { getAuthHeaders } from "@/app/lib/adminFetch";

interface EssayBundleOption {
  readonly id: string;
  readonly nama_bundle: string;
  readonly durasi_menit: number;
  readonly question_count: number;
}

interface EssayBundleSelectorProps {
  readonly jobOpeningId: string;
}

export default function EssayBundleSelector({
  jobOpeningId,
}: EssayBundleSelectorProps) {
  const [bundles, setBundles] = useState<EssayBundleOption[]>([]);
  const [selectedBundleId, setSelectedBundleId] = useState<string | null>(null);
  const [initialBundleId, setInitialBundleId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [feedback, setFeedback] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/job-opening-essay/${jobOpeningId}`, {
        headers: getAuthHeaders(),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || "Gagal memuat konfigurasi paket essay.");
      }
      const data = await res.json();
      setBundles(Array.isArray(data.bundles) ? data.bundles : []);
      setSelectedBundleId(data.selectedBundleId ?? null);
      setInitialBundleId(data.selectedBundleId ?? null);
    } catch (error) {
      setFeedback({
        type: "error",
        text: error instanceof Error ? error.message : "Gagal memuat data essay.",
      });
    } finally {
      setIsLoading(false);
    }
  }, [jobOpeningId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSave = async () => {
    setIsSaving(true);
    setFeedback(null);
    try {
      const res = await fetch(`/api/job-opening-essay/${jobOpeningId}`, {
        method: "PUT",
        headers: getAuthHeaders({ "Content-Type": "application/json" }),
        body: JSON.stringify({ bundleId: selectedBundleId }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Gagal menyimpan pilihan paket essay.");
      }
      setInitialBundleId(selectedBundleId);
      setFeedback({
        type: "success",
        text: data.message || "Paket tes essay lowongan berhasil diperbarui.",
      });
    } catch (error) {
      setFeedback({
        type: "error",
        text: error instanceof Error ? error.message : "Gagal menyimpan.",
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="p-8 text-center">
        <Loader2 className="animate-spin mx-auto text-primary" size={24} />
      </div>
    );
  }

  const hasChanges = selectedBundleId !== initialBundleId;

  return (
    <div className="bg-white rounded-md shadow-sm border border-slate-200 p-8 mt-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 border-b border-slate-100 pb-4">
        <div>
          <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <FileText size={20} className="text-primary" /> Pilih Paket Soal Essay (Tahap Tes)
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Jika dipilih, pelamar yang diundang tes wajib mengerjakan modul essay ini setelah atau bersama psikometri. Jika tanpa paket, hanya psikotest yang diberlakukan.
          </p>
        </div>
        <button
          type="button"
          onClick={handleSave}
          disabled={isSaving || !hasChanges}
          className="px-6 py-2.5 bg-primary text-white rounded-lg text-xs font-bold hover:bg-primary-dark transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98] min-h-[44px]"
        >
          {isSaving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
          Simpan Paket Essay
        </button>
      </div>

      {feedback && (
        <div
          className={`mb-6 p-3.5 rounded-lg text-xs font-bold flex items-center gap-2 border ${
            feedback.type === "success"
              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
              : "bg-rose-50 text-rose-700 border-rose-200"
          }`}
        >
          <AlertCircle size={14} />
          <span>{feedback.text}</span>
        </div>
      )}

      {bundles.length === 0 ? (
        <div className="text-center py-8 bg-slate-50 border border-dashed border-slate-200 rounded-xl">
          <p className="text-slate-600 text-sm font-semibold">
            Posisi pekerjaan ini belum memiliki paket soal essay aktif.
          </p>
          <p className="text-xs text-slate-400 mt-1">
            Tambahkan paket soal essay melalui menu Posisi Pekerjaan (Job Positions), atau biarkan nonaktif agar kandidat hanya mengikuti psikotest.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Opsi Tanpa Tes Essay */}
          <div
            onClick={() => setSelectedBundleId(null)}
            className={`p-4 rounded-xl border-2 cursor-pointer transition-all relative ${
              selectedBundleId === null
                ? "border-slate-700 bg-slate-50 shadow-xs"
                : "border-slate-200 hover:border-slate-300 bg-white"
            }`}
          >
            {selectedBundleId === null && (
              <div className="absolute top-3 right-3 text-slate-700">
                <XCircle size={18} />
              </div>
            )}
            <h3 className="font-bold text-sm text-slate-800 pr-6">
              Tanpa Tes Essay
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Kandidat hanya mengerjakan 4 modul psikotest standar.
            </p>
            {initialBundleId === null && (
              <span className="mt-3 inline-block px-2 py-0.5 bg-slate-200 text-slate-700 text-[10px] font-bold rounded">
                Konfigurasi Aktif Saat Ini
              </span>
            )}
          </div>

          {bundles.map((bundle) => {
            const isSelected = selectedBundleId === bundle.id;
            const isCurrentActive = initialBundleId === bundle.id;
            const hasQuestions = bundle.question_count > 0;
            return (
              <div
                key={bundle.id}
                onClick={() => hasQuestions && setSelectedBundleId(bundle.id)}
                className={`p-4 rounded-xl border-2 transition-all relative ${
                  !hasQuestions
                    ? "border-slate-100 bg-slate-50 opacity-60 cursor-not-allowed"
                    : isSelected
                      ? "border-primary bg-primary/5 shadow-xs cursor-pointer"
                      : "border-slate-200 hover:border-slate-300 bg-white cursor-pointer"
                }`}
              >
                {isSelected && (
                  <div className="absolute top-3 right-3 text-primary">
                    <CheckCircle2 size={20} />
                  </div>
                )}
                <h3
                  className={`font-extrabold uppercase tracking-wide text-sm pr-6 ${
                    isSelected ? "text-primary" : "text-slate-800"
                  }`}
                >
                  {bundle.nama_bundle}
                </h3>
                <div className="flex items-center gap-3 mt-2 text-xs text-slate-500 font-semibold">
                  <span>{bundle.question_count} Soal</span>
                  <span className="inline-flex items-center gap-1 font-mono tabular-nums">
                    <Clock size={12} /> {bundle.durasi_menit} Menit
                  </span>
                </div>
                {isCurrentActive && (
                  <span className="mt-3 inline-block px-2 py-0.5 bg-primary/10 text-primary text-[10px] font-bold rounded">
                    Paket Aktif Saat Ini
                  </span>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

