// File: src/app/components/CareerFilter.tsx
"use client";

import { Search, Filter, X, CheckSquare, Square } from "lucide-react";
import { useState, useMemo } from "react";

// Tipe data minimal yang dibutuhkan filter
interface JobSimple {
  id: number;
  title: string;
  category: string;
}

interface FilterState {
  category: string;
  positions: string[];
}

interface CareerFilterProps {
  currentFilters: FilterState;
  onFilterChange: (filters: FilterState) => void;
  jobs: JobSimple[]; // Data lowongan dari API untuk generate list posisi
}

export default function CareerFilter({ currentFilters, onFilterChange, jobs }: CareerFilterProps) {
  const [searchTerm, setSearchTerm] = useState("");

  // Generate daftar posisi unik berdasarkan kategori yang dipilih
  const availablePositions = useMemo(() => {
    // 1. Filter jobs berdasarkan kategori aktif
    const filteredByCategory = currentFilters.category === "Semua"
      ? jobs
      : jobs.filter(job => job.category === currentFilters.category);

    // 2. Ambil judul unik saja
    const uniqueTitles = Array.from(new Set(filteredByCategory.map(job => job.title)));

    // 3. Urutkan abjad
    return uniqueTitles.sort();
  }, [jobs, currentFilters.category]);

  // Filter list posisi berdasarkan search bar (pencarian lokal di dalam list)
  const displayedPositions = availablePositions.filter(pos =>
    pos.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCategoryChange = (category: string) => {
    // Reset pilihan posisi saat kategori berubah agar tidak rancu
    onFilterChange({ category, positions: [] });
  };

  const handlePositionToggle = (position: string) => {
    const currentPositions = currentFilters.positions;
    const newPositions = currentPositions.includes(position)
      ? currentPositions.filter(p => p !== position)
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
              onClick={() => handleCategoryChange(cat.id)}
              className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${currentFilters.category === cat.id
                  ? "bg-white text-primary shadow-sm"
                  : "text-slate-500 hover:text-slate-700"
                }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* 2. Search & List Posisi */}
      <div>
        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
          List Lowongan
        </h4>

        {/* Search Bar Kecil untuk filter list */}
        <div className="relative mb-3">
          <input
            type="text"
            placeholder="Cari di list..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:border-primary transition-colors bg-slate-50"
          />
          <Search className="absolute left-3 top-2.5 text-slate-400" size={14} />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm("")}
              className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
            >
              <X size={14} />
            </button>
          )}
        </div>

        {/* Scrollable Checkbox List */}
        <div className="max-h-64 overflow-y-auto pr-1 space-y-1 custom-scrollbar">
          {displayedPositions.length > 0 ? (
            displayedPositions.map((pos) => {
              const isSelected = currentFilters.positions.includes(pos);
              return (
                <label
                  key={pos}
                  className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-colors text-sm ${isSelected ? "bg-blue-50 text-primary font-medium" : "hover:bg-slate-50 text-slate-600"
                    }`}
                >
                  <input
                    type="checkbox"
                    className="hidden"
                    checked={isSelected}
                    onChange={() => handlePositionToggle(pos)}
                  />
                  {/* Custom Checkbox UI */}
                  {isSelected ? (
                    <CheckSquare size={18} className="shrink-0 text-primary" />
                  ) : (
                    <Square size={18} className="shrink-0 text-slate-300" />
                  )}
                  <span className="line-clamp-2">{pos}</span>
                </label>
              );
            })
          ) : (
            <div className="text-center py-4 text-xs text-slate-400 italic">
              {jobs.length === 0 ? "Memuat data..." : "Tidak ada posisi ditemukan"}
            </div>
          )}
        </div>

        {/* Indikator jumlah terpilih */}
        {currentFilters.positions.length > 0 && (
          <div className="mt-3 pt-3 border-t border-slate-100 flex justify-between items-center">
            <span className="text-xs text-slate-500 font-medium">
              {currentFilters.positions.length} dipilih
            </span>
            <button
              onClick={() => onFilterChange({ ...currentFilters, positions: [] })}
              className="text-xs text-red-500 hover:text-red-700 hover:underline"
            >
              Reset
            </button>
          </div>
        )}
      </div>
    </div>
  );
}