// File: src/app/components/CareerFilter.tsx
"use client";

import { Search, Filter, X, CheckSquare, Square } from "lucide-react";
import { useState, useMemo } from "react";

// Tipe data minimal lowongan dari /api/job-openings
interface JobSimple {
  id: number;
  title: string;
  category: string;
  position_name?: string;
}

// Tipe data master posisi pekerjaan dari /api/jobs
export interface JobPositionItem {
  id: number;
  nama_job: string;
  jenis_job: "Medis" | "Non-Medis" | string;
}

interface FilterState {
  category: string;
  positions: string[];
}

interface CareerFilterProps {
  currentFilters: FilterState;
  onFilterChange: (filters: FilterState) => void;
  jobs: JobSimple[];
  positions?: JobPositionItem[];
  isLoading?: boolean;
}

export default function CareerFilter({
  currentFilters,
  onFilterChange,
  jobs,
  positions = [],
  isLoading = false,
}: CareerFilterProps) {
  const [searchTerm, setSearchTerm] = useState("");

  // Generate daftar posisi pekerjaan unik berdasarkan kategori yang dipilih
  // Mengutamakan master data posisi pekerjaan (/api/jobs) dan menggabungkan dengan lowongan aktif jika ada
  const availablePositions = useMemo(() => {
    const positionSet = new Set<string>();

    // 1. Masukkan dari master data posisi pekerjaan (tabel job)
    for (const pos of positions) {
      if (!pos.nama_job) continue;
      if (
        currentFilters.category === "Semua" ||
        pos.jenis_job?.toLowerCase() === currentFilters.category.toLowerCase()
      ) {
        positionSet.add(pos.nama_job.trim());
      }
    }

    // 2. Masukkan juga dari lowongan yang sedang aktif (jika ada posisi tambahan)
    for (const job of jobs) {
      const label = job.position_name || job.title;
      if (!label) continue;
      if (
        currentFilters.category === "Semua" ||
        job.category?.toLowerCase() === currentFilters.category.toLowerCase()
      ) {
        positionSet.add(label.trim());
      }
    }

    return Array.from(positionSet).sort((a, b) => a.localeCompare(b, "id"));
  }, [positions, jobs, currentFilters.category]);

  // Filter list posisi berdasarkan search bar lokal
  const displayedPositions = useMemo(() => {
    if (!searchTerm.trim()) return availablePositions;
    const q = searchTerm.toLowerCase();
    return availablePositions.filter((pos) => pos.toLowerCase().includes(q));
  }, [availablePositions, searchTerm]);

  const handleCategoryChange = (category: string) => {
    onFilterChange({ category, positions: [] });
  };

  const handlePositionToggle = (position: string) => {
    const currentPositions = currentFilters.positions;
    const newPositions = currentPositions.includes(position)
      ? currentPositions.filter((p) => p !== position)
      : [...currentPositions, position];

    onFilterChange({ ...currentFilters, positions: newPositions });
  };

  const categories = [
    { id: "Semua", label: "Semua" },
    { id: "Medis", label: "Medis" },
    { id: "Non-Medis", label: "Non-Medis" },
  ];

  return (
    <div className="space-y-6">
      {/* 1. Kategori Tabs */}
      <div>
        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
          <Filter size={12} /> Kategori
        </h4>
        <div className="flex bg-slate-100 p-1 rounded-xl">
          {categories.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => handleCategoryChange(cat.id)}
              className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all duration-200 cursor-pointer ${
                currentFilters.category === cat.id
                  ? "bg-white text-primary shadow-sm font-semibold"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* 2. Search & List Posisi Pekerjaan */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
            Posisi Pekerjaan
          </h4>
          {!isLoading && availablePositions.length > 0 && (
            <span className="text-[11px] font-mono font-semibold text-slate-400">
              {availablePositions.length} Posisi
            </span>
          )}
        </div>

        {/* Search Bar Kecil untuk filter list */}
        <div className="relative mb-3">
          <input
            type="text"
            placeholder="Cari posisi pekerjaan..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-8 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:border-primary transition-colors bg-slate-50"
          />
          <Search className="absolute left-3 top-2.5 text-slate-400" size={14} />
          {searchTerm && (
            <button
              type="button"
              onClick={() => setSearchTerm("")}
              className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              <X size={14} />
            </button>
          )}
        </div>

        {/* Scrollable Checkbox List */}
        <div className="max-h-64 overflow-y-auto pr-1 space-y-1 custom-scrollbar">
          {isLoading ? (
            <div className="text-center py-4 text-xs text-slate-400 italic">
              Memuat data posisi...
            </div>
          ) : displayedPositions.length > 0 ? (
            displayedPositions.map((pos) => {
              const isSelected = currentFilters.positions.includes(pos);
              return (
                <label
                  key={pos}
                  className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-colors text-sm ${
                    isSelected
                      ? "bg-[#EFF6FF] text-[#154C96] font-semibold"
                      : "hover:bg-slate-50 text-slate-600"
                  }`}
                >
                  <input
                    type="checkbox"
                    className="hidden"
                    checked={isSelected}
                    onChange={() => handlePositionToggle(pos)}
                  />
                  {isSelected ? (
                    <CheckSquare size={18} className="shrink-0 text-[#154C96]" />
                  ) : (
                    <Square size={18} className="shrink-0 text-slate-300" />
                  )}
                  <span className="line-clamp-2">{pos}</span>
                </label>
              );
            })
          ) : (
            <div className="text-center py-4 text-xs text-slate-400 italic">
              Tidak ada posisi pekerjaan ditemukan
            </div>
          )}
        </div>

        {/* Indikator jumlah terpilih */}
        {currentFilters.positions.length > 0 && (
          <div className="mt-3 pt-3 border-t border-slate-100 flex justify-between items-center">
            <span className="text-xs text-slate-500 font-medium">
              {currentFilters.positions.length} posisi dipilih
            </span>
            <button
              type="button"
              onClick={() => onFilterChange({ ...currentFilters, positions: [] })}
              className="text-xs text-red-500 hover:text-red-700 hover:underline cursor-pointer"
            >
              Reset
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
