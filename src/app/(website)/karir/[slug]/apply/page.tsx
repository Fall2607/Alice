"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { useApply } from "./ApplyContext";

export default function Step1Page() {
  const router = useRouter();
  const { state, setIdentityField } = useApply();

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Identitas Diri</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="md:col-span-2">
          <label className="block text-sm font-medium mb-1">Nama Lengkap</label>
          <input value={state.identity.fullName} onChange={(e) => setIdentityField("fullName", e.target.value)} className="w-full p-3 rounded-xl border border-slate-300" />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Email</label>
          <input value={state.identity.email} onChange={(e) => setIdentityField("email", e.target.value)} className="w-full p-3 rounded-xl border border-slate-300" />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">No. WhatsApp</label>
          <input value={state.identity.whatsapp} onChange={(e) => setIdentityField("whatsapp", e.target.value)} className="w-full p-3 rounded-xl border border-slate-300" />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Tempat Lahir</label>
          <input value={state.identity.birthPlace} onChange={(e) => setIdentityField("birthPlace", e.target.value)} className="w-full p-3 rounded-xl border border-slate-300" />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Tanggal Lahir</label>
          <input type="date" value={state.identity.birthDate || ""} onChange={(e) => setIdentityField("birthDate", e.target.value)} className="w-full p-3 rounded-xl border border-slate-300" />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Suku</label>
          <input value={state.identity.ethnicity} onChange={(e) => setIdentityField("ethnicity", e.target.value)} className="w-full p-3 rounded-xl border border-slate-300" />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Agama</label>
          <input value={state.identity.religion} onChange={(e) => setIdentityField("religion", e.target.value)} className="w-full p-3 rounded-xl border border-slate-300" />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">No. KTP</label>
          <input value={state.identity.ktp} onChange={(e) => setIdentityField("ktp", e.target.value)} className="w-full p-3 rounded-xl border border-slate-300" />
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium mb-1">Alamat</label>
          <textarea value={state.identity.address} onChange={(e) => setIdentityField("address", e.target.value)} className="w-full p-3 rounded-xl border border-slate-300" rows={3} />
        </div>

        <div className="md:col-span-2 flex justify-between gap-3 mt-2">
          <button onClick={() => router.push(`/karir`)} className="px-5 py-2 rounded-xl border border-slate-300">Batal</button>
          <button onClick={() => router.push(`/karir/${(typeof window !== 'undefined' ? new URL(window.location.href).pathname.split('/')[2] : '')}/apply/step2`)} className="px-6 py-2 rounded-xl bg-primary text-white">
            Lanjut ke Keluarga
          </button>
        </div>
      </div>
    </div>
  );
}
