"use client";

import React from "react";
import { UserMinus, Search, Filter } from "lucide-react";

export default function PegawaiResignPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight">Pegawai Resign / Non-Aktif</h1>
          <p className="text-sm font-medium text-slate-500 mt-1">
            Data alumni dan riwayat karyawan yang sudah tidak aktif bekerja.
          </p>
        </div>
      </div>

      {/* Toolbar */}
      <div className="bg-white p-4 rounded-xl border border-slate-100 flex flex-col md:flex-row gap-4 items-center justify-between shadow-sm">
        <div className="relative w-full md:w-80">
          <input 
            type="text" 
            placeholder="Cari nama atau NIP..." 
            className="w-full bg-slate-50 border border-slate-200 text-slate-700 py-2.5 pl-10 pr-4 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#0173b6]/20 focus:border-[#0173b6] transition-all"
          />
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
        </div>
        <button className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-600 px-4 py-2.5 rounded-lg text-sm font-bold transition-all">
          <Filter size={16} />
          <span>Filter Tahun</span>
        </button>
      </div>

      {/* Empty State */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-12 flex flex-col items-center justify-center text-center">
        <div className="w-20 h-20 bg-rose-50 rounded-full flex items-center justify-center mb-4">
          <UserMinus size={32} className="text-rose-500" />
        </div>
        <h2 className="text-lg font-bold text-slate-800 mb-2">Modul Sedang Dikembangkan</h2>
        <p className="text-slate-500 text-sm max-w-md">
          Halaman ini nantinya akan menampung seluruh daftar mantan karyawan beserta tanggal keluar dan alasan pengunduran dirinya.
        </p>
      </div>
    </div>
  );
}
