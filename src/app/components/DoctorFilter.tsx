"use client";

import { poliFilters } from "@/app/data/doctor";
import { Search, Stethoscope, Filter } from "lucide-react";

interface DoctorFilterProps {
  selectedPoli: string;
  onPoliChange: (poli: string) => void;
  searchTerm: string;
  onSearchChange: (term: string) => void;
}

export default function DoctorFilter({
  selectedPoli,
  onPoliChange,
  searchTerm,
  onSearchChange,
}: DoctorFilterProps) {
  return (
    <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 h-fit sticky top-36">
      {/* Header Filter */}
      <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-100">
        <div className="w-8 h-8 rounded-xl bg-blue-50 text-[#154C96] flex items-center justify-center font-bold">
          <Filter size={16} />
        </div>
        <div>
          <h3 className="text-base font-bold text-[#10162C]">Cari Dokter</h3>
          <p className="text-[11px] text-slate-400">Filter nama &amp; poliklinik</p>
        </div>
      </div>

      {/* Kolom Pencarian */}
      <div className="relative mb-6">
        <input
          type="text"
          placeholder="Ketik nama dokter..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 text-xs rounded-xl border border-slate-200 bg-slate-50 text-slate-800 placeholder-slate-400 focus:bg-white focus:border-[#00A79C] focus:ring-2 focus:ring-[#00A79C]/20 transition-all outline-none"
        />
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
      </div>

      {/* Header Poli */}
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
          <Stethoscope size={13} className="text-[#00A79C]" />
          <span>Poliklinik Spesialis</span>
        </h4>
        <span className="text-[10px] font-mono font-bold text-slate-400">{poliFilters.length} Poli</span>
      </div>

      {/* Daftar Tombol Filter Poli */}
      <div className="space-y-1.5 max-h-[380px] overflow-y-auto pr-1 scrollbar-thin">
        {poliFilters.map((poli) => {
          const isActive = selectedPoli === poli;
          return (
            <button
              key={poli}
              onClick={() => onPoliChange(poli)}
              className={`w-full text-left px-3.5 py-2.5 rounded-xl transition-all text-xs font-semibold flex items-center justify-between cursor-pointer ${
                isActive
                  ? "bg-[#154C96] text-white shadow-xs font-bold"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
              }`}
            >
              <span>{poli === "Semua" ? "Semua Poliklinik" : `Poli ${poli}`}</span>
              {isActive && <span className="w-1.5 h-1.5 rounded-full bg-[#00A79C]"></span>}
            </button>
          );
        })}
      </div>
    </div>
  );
}
