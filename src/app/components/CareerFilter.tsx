// File: app/components/CareerFilter.tsx
"use client";

import { jobPositions } from "@/app/data/careers"; // Path diubah menjadi relatif
import { useState } from "react";
import { ChevronDown } from "lucide-react";

interface CareerFilterProps {
  onFilterChange: (filters: { category: string; positions: string[] }) => void;
}

export default function CareerFilter({ onFilterChange }: CareerFilterProps) {
  const [selectedCategory, setSelectedCategory] = useState("Medis");
  const [selectedPositions, setSelectedPositions] = useState<string[]>([]);

  const handlePositionChange = (position: string) => {
    const newPositions = selectedPositions.includes(position)
      ? selectedPositions.filter((p) => p !== position)
      : [...selectedPositions, position];
    setSelectedPositions(newPositions);
    onFilterChange({ category: selectedCategory, positions: newPositions });
  };

  const handleCategoryChange = (category: "Medis" | "Non-Medis") => {
    setSelectedCategory(category);
    setSelectedPositions([]); // Reset pilihan posisi saat kategori berubah
    onFilterChange({ category, positions: [] });
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 h-fit">
      <h3 className="text-xl font-bold text-primary-dark mb-4">
        Filter Lowongan
      </h3>

      {/* Filter Kategori */}
      <div className="mb-6">
        <label className="block text-sm font-semibold text-slate-700 mb-2">
          Jenis Pekerjaan
        </label>
        <div className="flex rounded-md shadow-sm">
          <button
            onClick={() => handleCategoryChange("Medis")}
            className={`flex-1 px-4 py-2 text-sm rounded-l-md transition-colors ${
              selectedCategory === "Medis"
                ? "bg-primary text-white"
                : "bg-slate-200 hover:bg-slate-300"
            }`}
          >
            Medis
          </button>
          <button
            onClick={() => handleCategoryChange("Non-Medis")}
            className={`flex-1 px-4 py-2 text-sm rounded-r-md transition-colors ${
              selectedCategory === "Non-Medis"
                ? "bg-primary text-white"
                : "bg-slate-200 hover:bg-slate-300"
            }`}
          >
            Non-Medis
          </button>
        </div>
      </div>

      {/* Filter Posisi */}
      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-2">
          List Pekerjaan
        </label>
        <div className="space-y-2 max-h-96 overflow-y-auto pr-2">
          {(
            jobPositions[selectedCategory as keyof typeof jobPositions] || []
          ).map((position) => (
            <label
              key={position}
              className="flex items-center space-x-3 cursor-pointer"
            >
              <input
                type="checkbox"
                checked={selectedPositions.includes(position)}
                onChange={() => handlePositionChange(position)}
                className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
              />
              <span className="text-slate-600">{position}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}
