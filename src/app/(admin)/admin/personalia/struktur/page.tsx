"use client";

import React from "react";
import { Network, PlusCircle, Search } from "lucide-react";

export default function StrukturOrganisasiPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight">Struktur Organisasi</h1>
          <p className="text-sm font-medium text-slate-500 mt-1">
            Bagan struktur hierarki perusahaan dari eksekutif hingga staff.
          </p>
        </div>
        <button className="flex items-center gap-2 bg-[#0173b6] hover:bg-[#005f98] text-white px-4 py-2.5 rounded-lg text-sm font-bold transition-all shadow-md shadow-blue-100 shrink-0">
          <PlusCircle size={16} />
          <span>Tambah Posisi</span>
        </button>
      </div>

      {/* Empty State */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-12 flex flex-col items-center justify-center text-center mt-8">
        <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mb-4">
          <Network size={32} className="text-emerald-500" />
        </div>
        <h2 className="text-lg font-bold text-slate-800 mb-2">Bagan Organisasi Belum Tersedia</h2>
        <p className="text-slate-500 text-sm max-w-md">
          Fitur ini akan segera hadir. Anda nantinya dapat melihat visualisasi hierarki antar jabatan dan divisi secara otomatis berdasarkan data master.
        </p>
      </div>
    </div>
  );
}
