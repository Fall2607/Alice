"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { useApply } from "../ApplyContext";

export default function Step5Page() {
  const router = useRouter();
  const { state, setDocumentFile } = useApply();
  const slug = typeof window !== "undefined" ? new URL(window.location.href).pathname.split("/")[2] : "";

  const fields: { key: keyof typeof state.documents; label: string }[] = [
    { key: "cv", label: "CV" },
    { key: "photo", label: "Foto 3x4" },
    { key: "ktp", label: "KTP" },
    { key: "ijazah", label: "Ijazah" },
    { key: "kk", label: "KK" },
    { key: "str", label: "STR" },
    { key: "transkrip", label: "Transkrip Nilai" },
  ];

  const handleFileChange = (k: keyof typeof state.documents, f?: FileList | null) => {
    setDocumentFile(k, f && f[0] ? f[0] : null);
  };

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Upload Dokumen</h2>

      <div className="space-y-4">
        {fields.map((f) => (
          <div key={f.key} className="flex items-center gap-4">
            <div className="w-40">{f.label}</div>
            <div className="flex-1 flex items-center gap-3">
              <input type="file" onChange={(e) => handleFileChange(f.key, e.target.files)} />
              {state.documents[f.key] && (
                <div className="text-sm text-slate-600">
                  {state.documents[f.key]!.name} — {(state.documents[f.key]!.size / 1024).toFixed(1)} KB
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-between mt-6">
        <button onClick={() => router.push(`/karir/${slug}/apply/step4`)} className="px-5 py-2 rounded-xl border">Kembali</button>
        <button onClick={() => router.push(`/karir/${slug}/apply/step6`)} className="px-6 py-2 rounded-xl bg-primary text-white">Lanjut ke Review</button>
      </div>
    </div>
  );
}
