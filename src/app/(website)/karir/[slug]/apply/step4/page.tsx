"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { useApply } from "../ApplyContext";

export default function Step4Page() {
  const router = useRouter();
  const { state, addExperience, updateExperience, removeExperience } = useApply();
  const slug = typeof window !== "undefined" ? new URL(window.location.href).pathname.split("/")[2] : "";

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Pengalaman Kerja</h2>

      <div className="mb-4">
        <button onClick={addExperience} className="px-3 py-1 rounded-xl bg-primary text-white">+ Tambah Pengalaman</button>
      </div>

      <div className="space-y-4">
        {state.experiences.length === 0 && <div className="text-slate-500">Belum ada pengalaman kerja.</div>}
        {state.experiences.map((exp) => (
          <div key={exp.id} className="p-4 border rounded-xl grid grid-cols-1 md:grid-cols-3 gap-3">
            <input placeholder="Nama Institusi" value={exp.company} onChange={(e)=> updateExperience(exp.id, { company: e.target.value })} className="p-2 rounded-xl border" />
            <input placeholder="Jabatan" value={exp.position} onChange={(e)=> updateExperience(exp.id, { position: e.target.value })} className="p-2 rounded-xl border" />
            <input placeholder="Tempat" value={exp.place} onChange={(e)=> updateExperience(exp.id, { place: e.target.value })} className="p-2 rounded-xl border" />
            <input placeholder="Lama (misal: 2 tahun)" value={exp.duration} onChange={(e)=> updateExperience(exp.id, { duration: e.target.value })} className="p-2 rounded-xl border" />
            <input placeholder="Dari Tahun" value={exp.fromYear} onChange={(e)=> updateExperience(exp.id, { fromYear: e.target.value })} className="p-2 rounded-xl border" />
            <input placeholder="Sampai Tahun" value={exp.toYear} onChange={(e)=> updateExperience(exp.id, { toYear: e.target.value })} className="p-2 rounded-xl border" />
            <textarea placeholder="Alasan Resign" value={exp.reasonLeave} onChange={(e)=> updateExperience(exp.id, { reasonLeave: e.target.value })} className="p-2 rounded-xl border md:col-span-3" />
            <div className="md:col-span-3 flex justify-end">
              <button onClick={() => removeExperience(exp.id)} className="px-3 py-1 rounded-xl border text-red-600">Hapus</button>
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-between mt-6">
        <button onClick={() => router.push(`/karir/${slug}/apply/step3`)} className="px-5 py-2 rounded-xl border">Kembali</button>
        <button onClick={() => router.push(`/karir/${slug}/apply/step5`)} className="px-6 py-2 rounded-xl bg-primary text-white">Lanjut ke Dokumen</button>
      </div>
    </div>
  );
}
