"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { useApply } from "../ApplyContext";

export default function Step2Page() {
  const router = useRouter();
  const { state, addSibling, updateSibling, removeSibling, setIdentityField } = useApply();

  const slug = typeof window !== "undefined" ? new URL(window.location.href).pathname.split("/")[2] : "";

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Data Keluarga</h2>

      <div className="mb-6">
        <h4 className="font-semibold mb-2">Orang Tua</h4>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label className="text-sm mb-1 block">Nama Ayah</label>
            <input value={state.identity.fatherName} onChange={(e)=> setIdentityField("fatherName", e.target.value)} className="w-full p-3 rounded-xl border" />
          </div>
          <div>
            <label className="text-sm mb-1 block">Pekerjaan Ayah</label>
            <input value={state.identity.fatherJob} onChange={(e)=> setIdentityField("fatherJob", e.target.value)} className="w-full p-3 rounded-xl border" />
          </div>
          <div>
            <label className="text-sm mb-1 block">No. HP Ayah</label>
            <input value={state.identity.fatherPhone} onChange={(e)=> setIdentityField("fatherPhone", e.target.value)} className="w-full p-3 rounded-xl border" />
          </div>

          <div>
            <label className="text-sm mb-1 block">Nama Ibu</label>
            <input value={state.identity.motherName} onChange={(e)=> setIdentityField("motherName", e.target.value)} className="w-full p-3 rounded-xl border" />
          </div>
          <div>
            <label className="text-sm mb-1 block">Pekerjaan Ibu</label>
            <input value={state.identity.motherJob} onChange={(e)=> setIdentityField("motherJob", e.target.value)} className="w-full p-3 rounded-xl border" />
          </div>
          <div>
            <label className="text-sm mb-1 block">No. HP Ibu</label>
            <input value={state.identity.motherPhone} onChange={(e)=> setIdentityField("motherPhone", e.target.value)} className="w-full p-3 rounded-xl border" />
          </div>
        </div>
      </div>

      <div>
        <h4 className="font-semibold mb-2">Saudara Kandung</h4>
        <div className="mb-3">
          <button onClick={addSibling} className="px-3 py-1 rounded-xl bg-primary text-white">+ Tambah Saudara</button>
        </div>

        <div className="space-y-4">
          {state.siblings.length === 0 && <div className="text-slate-500">Belum ada data saudara.</div>}
          {state.siblings.map((s) => (
            <div key={s.id} className="p-4 border rounded-xl">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <input placeholder="Nama" value={s.name} onChange={(e)=> updateSibling(s.id, { name: e.target.value })} className="p-2 rounded-xl border" />
                <select value={s.gender} onChange={(e)=> updateSibling(s.id, { gender: e.target.value })} className="p-2 rounded-xl border">
                  <option value="">Jenis Kelamin</option>
                  <option value="Laki-laki">Laki-laki</option>
                  <option value="Perempuan">Perempuan</option>
                </select>
                <input placeholder="Umur" value={s.age} onChange={(e)=> updateSibling(s.id, { age: e.target.value })} className="p-2 rounded-xl border" />
                <input placeholder="Hubungan" value={s.relation} onChange={(e)=> updateSibling(s.id, { relation: e.target.value })} className="p-2 rounded-xl border" />
                <input placeholder="Pekerjaan" value={s.job} onChange={(e)=> updateSibling(s.id, { job: e.target.value })} className="p-2 rounded-xl border" />
              </div>
              <div className="mt-3 flex justify-end">
                <button onClick={() => removeSibling(s.id)} className="px-3 py-1 rounded-xl border text-red-600">Hapus</button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-between mt-6">
        <button onClick={() => router.push(`/karir/${slug}/apply`)} className="px-5 py-2 rounded-xl border">Kembali</button>
        <button onClick={() => router.push(`/karir/${slug}/apply/step3`)} className="px-6 py-2 rounded-xl bg-primary text-white">Lanjut ke Pendidikan</button>
      </div>
    </div>
  );
}
