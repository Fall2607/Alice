"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { useApply } from "../ApplyContext";

export default function Step6Page() {
  const router = useRouter();
  const { state, resetAll } = useApply();
  const slug = typeof window !== "undefined" ? new URL(window.location.href).pathname.split("/")[2] : "";

  const compiled = {
    identity: state.identity,
    family: { siblings: state.siblings },
    education: { formal: state.educationFormal, nonFormal: state.educationNonFormal },
    experiences: state.experiences,
    documents: Object.fromEntries(
      Object.entries(state.documents).map(([k, v]) => [k, v ? { name: v.name, size: v.size, type: v.type } : null])
    ),
    meta: { jobSlug: slug, appliedAt: new Date().toISOString() },
  };

  const downloadJSON = () => {
    const blob = new Blob([JSON.stringify(compiled, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${slug || "application"}-preview.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleSubmit = async () => {
    // placeholder: create FormData if you want to upload files
    // For now we just console.log and alert
    console.log("Submit payload (simulate):", compiled);
    alert("Simulasi submit: data telah dicetak di console. Ganti fungsi ini dengan POST ke API.");
    // optionally reset
    // resetAll();
  };

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Review & Submit</h2>

      <div className="bg-slate-50 p-4 rounded-xl border mb-4">
        <h4 className="font-semibold mb-2">Preview JSON</h4>
        <pre className="max-h-96 overflow-auto text-xs p-3 bg-white rounded">{JSON.stringify(compiled, null, 2)}</pre>
      </div>

      <div className="flex gap-3">
        <button onClick={downloadJSON} className="px-4 py-2 rounded-xl bg-slate-800 text-white">Download JSON</button>
        <button onClick={handleSubmit} className="px-4 py-2 rounded-xl bg-primary text-white">Kirim Lamaran (Simulasi)</button>
        <button onClick={() => router.push(`/karir/${slug}/apply/step5`)} className="px-4 py-2 rounded-xl border">Kembali</button>
      </div>
    </div>
  );
}
