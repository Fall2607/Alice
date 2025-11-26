"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { useApply } from "../ApplyContext";

export default function Step3Page() {
  const router = useRouter();
  const { state, addEducationFormal, updateEducationFormal, removeEducationFormal, addEducationNonFormal, updateEducationNonFormal, removeEducationNonFormal } = useApply();
  const slug = typeof window !== "undefined" ? new URL(window.location.href).pathname.split("/")[2] : "";

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Pendidikan</h2>

      <div className="mb-6">
        <h4 className="font-semibold mb-2">Pendidikan Formal</h4>
        <div className="mb-3">
          <button onClick={addEducationFormal} className="px-3 py-1 rounded-xl bg-primary text-white">+ Tambah</button>
        </div>

        <div className="space-y-4">
          {state.educationFormal.length === 0 && <div className="text-slate-500">Belum ada data pendidikan formal.</div>}
          {state.educationFormal.map((f) => (
            <div key={f.id} className="p-4 border rounded-xl grid grid-cols-1 md:grid-cols-4 gap-3">
              <input placeholder="Sekolah / Univ" value={f.school} onChange={(e)=> updateEducationFormal(f.id, { school: e.target.value })} className="p-2 rounded-xl border" />
              <input placeholder="Tahun Masuk" value={f.yearFrom} onChange={(e)=> updateEducationFormal(f.id, { yearFrom: e.target.value })} className="p-2 rounded-xl border" />
              <input placeholder="Tahun Keluar" value={f.yearTo} onChange={(e)=> updateEducationFormal(f.id, { yearTo: e.target.value })} className="p-2 rounded-xl border" />
              <input placeholder="No Ijazah" value={f.certificateNo} onChange={(e)=> updateEducationFormal(f.id, { certificateNo: e.target.value })} className="p-2 rounded-xl border" />
              <div className="md:col-span-4 flex justify-end">
                <button onClick={() => removeEducationFormal(f.id)} className="px-3 py-1 rounded-xl border text-red-600">Hapus</button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mb-6">
        <h4 className="font-semibold mb-2">Pendidikan Non-Formal</h4>
        <div className="mb-3">
          <button onClick={addEducationNonFormal} className="px-3 py-1 rounded-xl bg-primary text-white">+ Tambah</button>
        </div>

        <div className="space-y-4">
          {state.educationNonFormal.length === 0 && <div className="text-slate-500">Belum ada data pendidikan non-formal.</div>}
          {state.educationNonFormal.map((f) => (
            <div key={f.id} className="p-4 border rounded-xl grid grid-cols-1 md:grid-cols-4 gap-3">
              <input placeholder="Instansi" value={f.school} onChange={(e)=> updateEducationNonFormal(f.id, { school: e.target.value })} className="p-2 rounded-xl border" />
              <input placeholder="Tahun Masuk" value={f.yearFrom} onChange={(e)=> updateEducationNonFormal(f.id, { yearFrom: e.target.value })} className="p-2 rounded-xl border" />
              <input placeholder="Tahun Keluar" value={f.yearTo} onChange={(e)=> updateEducationNonFormal(f.id, { yearTo: e.target.value })} className="p-2 rounded-xl border" />
              <input placeholder="No Ijazah / Sertifikat" value={f.certificateNo} onChange={(e)=> updateEducationNonFormal(f.id, { certificateNo: e.target.value })} className="p-2 rounded-xl border" />
              <div className="md:col-span-4 flex justify-end">
                <button onClick={() => removeEducationNonFormal(f.id)} className="px-3 py-1 rounded-xl border text-red-600">Hapus</button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-between mt-6">
        <button onClick={() => router.push(`/karir/${slug}/apply/step2`)} className="px-5 py-2 rounded-xl border">Kembali</button>
        <button onClick={() => router.push(`/karir/${slug}/apply/step4`)} className="px-6 py-2 rounded-xl bg-primary text-white">Lanjut ke Pengalaman</button>
      </div>
    </div>
  );
}
