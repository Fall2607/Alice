// File: src/app/karir/[slug]/apply/step5/page.tsx
"use client";

import React from "react";
import { useRouter, useParams } from "next/navigation";
import {
  FileText, Upload, Trash2, ArrowRight, ArrowLeft,
  CheckCircle, AlertCircle, File, Image as ImageIcon, FileBadge
} from "lucide-react";
import { useApply } from "../ApplyContext";

// Helper untuk format ukuran file
const formatFileSize = (bytes: number) => {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
};

export default function Step5Page() {
  const router = useRouter();
  const { state, setDocumentFile } = useApply();
  const params = useParams();
  const slug = params?.slug as string;

  const fields: {
    key: keyof typeof state.documents;
    label: string;
    desc: string;
    icon: any;
    required?: boolean;
  }[] = [
      { key: "cv", label: "Curriculum Vitae (CV)", desc: "Format PDF, Maks 2MB", icon: FileText, required: true },
      { key: "photo", label: "Pas Foto Terbaru", desc: "Format JPG/PNG, Ratio 3:4", icon: ImageIcon, required: true },
      { key: "ktp", label: "Scan KTP", desc: "KTP Asli, jelas terbaca", icon: FileBadge, required: true },
      { key: "ijazah", label: "Ijazah Terakhir", desc: "Scan asli / legalisir", icon: FileText, required: true },
      { key: "transkrip", label: "Transkrip Nilai", desc: "Scan asli / legalisir", icon: FileText, required: true },
      { key: "kk", label: "Kartu Keluarga", desc: "Scan KK terbaru", icon: FileText },
      { key: "str", label: "STR (Tenaga Medis)", desc: "Jika ada / Wajib bagi Medis", icon: FileBadge },
    ];

  const handleFileChange = (k: keyof typeof state.documents, f?: FileList | null) => {
    const file = f && f[0] ? f[0] : null;

    // Validasi sederhana (bisa diperluas)
    if (file && file.size > 2 * 1024 * 1024) {
      alert(`Ukuran file ${file.name} terlalu besar (Maks 2MB)`);
      return;
    }

    setDocumentFile(k, file);
  };

  const handleRemoveFile = (k: keyof typeof state.documents) => {
    setDocumentFile(k, null);
  };

  return (
    <div className="animate-in fade-in slide-in-from-right-8 duration-500">

      {/* Header */}
      <div className="mb-8 border-b border-slate-100 pb-6">
        <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
          <Upload className="text-primary" size={28} /> Upload Dokumen
        </h2>
        <p className="text-slate-500 text-sm mt-2">
          Unggah dokumen pendukung lamaran Anda. Pastikan file jelas dan tidak melebihi 2MB.
        </p>
      </div>

      <div className="space-y-6">

        {/* Info Banner */}
        <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 flex items-start gap-3">
          <AlertCircle className="text-blue-600 shrink-0 mt-0.5" size={20} />
          <div className="text-sm text-blue-800">
            <p className="font-semibold mb-1">Panduan Upload:</p>
            <ul className="list-disc list-inside space-y-1 opacity-80 text-xs sm:text-sm">
              <li>Format yang disarankan: <strong>PDF</strong> (dokumen) dan <strong>JPG/PNG</strong> (foto).</li>
              <li>Ukuran maksimal setiap file adalah <strong>2 MB</strong>.</li>
              <li>Pastikan dokumen hasil scan tidak buram/terpotong.</li>
            </ul>
          </div>
        </div>

        {/* Grid Dokumen */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {fields.map((f) => {
            const file = state.documents[f.key];
            const isUploaded = !!file;

            return (
              <div
                key={f.key}
                className={`relative rounded-2xl border-2 transition-all duration-300 p-4 flex items-center gap-4 group ${isUploaded
                    ? "bg-green-50/50 border-green-200 hover:border-green-300"
                    : "bg-white border-slate-200 hover:border-primary/50 hover:bg-slate-50"
                  }`}
              >
                {/* Icon Area */}
                <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 transition-colors ${isUploaded ? "bg-green-100 text-green-600" : "bg-slate-100 text-slate-400 group-hover:bg-white group-hover:text-primary"
                  }`}>
                  {isUploaded ? <CheckCircle size={24} /> : <f.icon size={24} />}
                </div>

                {/* Text Area */}
                <div className="flex-1 min-w-0">
                  <p className={`font-bold text-sm truncate ${isUploaded ? "text-green-800" : "text-slate-700"}`}>
                    {f.label} {f.required && <span className="text-red-500">*</span>}
                  </p>

                  {isUploaded ? (
                    <div className="flex flex-col">
                      <p className="text-xs text-green-600 truncate font-medium">
                        {file.name}
                      </p>
                      <p className="text-[10px] text-green-500/80">
                        {formatFileSize(file.size)}
                      </p>
                    </div>
                  ) : (
                    <p className="text-xs text-slate-400">{f.desc}</p>
                  )}
                </div>

                {/* Action Area */}
                <div className="shrink-0">
                  {isUploaded ? (
                    <button
                      onClick={() => handleRemoveFile(f.key)}
                      className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"
                      title="Hapus file"
                    >
                      <Trash2 size={18} />
                    </button>
                  ) : (
                    <label className="cursor-pointer bg-slate-800 text-white text-xs font-bold px-3 py-2 rounded-lg hover:bg-primary transition-colors shadow-sm active:scale-95 flex items-center gap-1">
                      Upload
                      <input
                        type="file"
                        className="hidden"
                        accept={f.key === 'photo' ? "image/*" : ".pdf,image/*"}
                        onChange={(e) => handleFileChange(f.key, e.target.files)}
                      />
                    </label>
                  )}
                </div>
              </div>
            );
          })}
        </div>

      </div>

      {/* Footer Navigation */}
      <div className="flex justify-between pt-8 border-t border-slate-100 mt-12">
        <button
          onClick={() => router.push(`/karir/${slug}/apply/step4`)}
          className="px-6 py-3 rounded-xl text-slate-500 font-bold hover:bg-slate-100 hover:text-slate-800 transition-colors flex items-center gap-2 group text-sm"
        >
          <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" /> Kembali
        </button>
        <button
          onClick={() => router.push(`/karir/${slug}/apply/step6`)}
          className="px-8 py-3 rounded-xl bg-primary text-white font-bold hover:bg-primary-dark shadow-lg shadow-primary/25 active:scale-95 transition-all flex items-center gap-2 group text-sm"
        >
          Review Lamaran <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
        </button>
      </div>

    </div>
  );
}