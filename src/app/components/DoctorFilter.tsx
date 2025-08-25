// File: app/components/DoctorFilter.tsx
"use client";

import { poliFilters } from "@/app/data/doctor"; // Path diubah menjadi relatif
import { Search } from "lucide-react";

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
    <div className="bg-white rounded-lg shadow-lg p-6 h-fit sticky top-36">
      <h3 className="text-xl font-bold text-primary-dark mb-4">Cari Dokter</h3>

      {/* Kolom Pencarian */}
      <div className="relative mb-6">
        <input
          type="text"
          placeholder="Ketik nama dokter..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-full focus:outline-none focus:ring-2 focus:ring-primary"
        />
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
      </div>

      <h3 className="text-xl font-bold text-primary-dark mb-4">Filter Poli</h3>
      <div className="space-y-2">
        {poliFilters.map((poli) => (
          <button
            key={poli}
            onClick={() => onPoliChange(poli)}
            className={`w-full text-left px-4 py-2 rounded-md transition-colors text-sm font-medium ${
              selectedPoli === poli
                ? "bg-primary text-white"
                : "text-slate-600 hover:bg-background"
            }`}
          >
            {poli}
          </button>
        ))}
      </div>
    </div>
  );
}
