"use client";

import React, { useState } from "react";
import {
  PAPI_CATEGORIES,
  getPAPIData,
  getPAPIScoreLevel,
  PAPICategoryGroup,
} from "@/app/data/tests/papiInterpretations";
import PAPIRadarChart from "./PAPIRadarChart";
import { Filter, Search, Award, Sparkles, Layers } from "lucide-react";

interface PAPIResultViewProps {
  scores: Record<string, number | string>;
  title?: string;
  className?: string;
}

export default function PAPIResultView({
  scores,
  title = "PAPI Kostick (Roles & Needs Profile)",
  className = "",
}: PAPIResultViewProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [highlightedTrait, setHighlightedTrait] = useState<string | null>(null);

  // Convert raw score values to number
  const normalizedScores: Record<string, number> = {};
  Object.keys(scores || {}).forEach((key) => {
    normalizedScores[key] = Number(scores[key] || 0);
  });

  // Calculate statistics
  let maxScoreTrait = { code: "", score: -1, desc: "" };
  let minScoreTrait = { code: "", score: 999, desc: "" };

  PAPI_CATEGORIES.forEach((cat) => {
    cat.traits.forEach((t) => {
      const val = Number(normalizedScores[t.key] ?? normalizedScores[t.code] ?? normalizedScores[t.code.toLowerCase()] ?? 0);
      if (val > maxScoreTrait.score) {
        maxScoreTrait = { code: t.code, score: val, desc: t.label };
      }
      if (val < minScoreTrait.score) {
        minScoreTrait = { code: t.code, score: val, desc: t.label };
      }
    });
  });

  const filteredCategories = PAPI_CATEGORIES.filter((cat) => {
    if (selectedCategory !== "ALL" && cat.id !== selectedCategory) {
      return false;
    }
    return true;
  }).map((cat) => {
    if (!searchQuery.trim()) return cat;
    const q = searchQuery.toLowerCase().trim();
    const matchingTraits = cat.traits.filter((t) => {
      const codeMatch = t.code.toLowerCase().includes(q);
      const labelMatch = t.label.toLowerCase().includes(q);
      const descMatch = t.description.toLowerCase().includes(q);
      return codeMatch || labelMatch || descMatch;
    });
    return { ...cat, traits: matchingTraits };
  }).filter((cat) => cat.traits.length > 0);

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Quick Summary Highlights */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-slate-50 border border-slate-200/70 p-3.5 rounded-xl flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
            <Layers size={18} />
          </div>
          <div>
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
              Total Dimensi
            </span>
            <span className="text-sm font-bold text-slate-800">
              20 Skala Trait (7 Aspek)
            </span>
          </div>
        </div>

        {maxScoreTrait.score >= 0 && (
          <div className="bg-emerald-50/50 border border-emerald-100 p-3.5 rounded-xl flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
              <Award size={18} />
            </div>
            <div>
              <span className="text-[11px] font-semibold text-emerald-600 uppercase tracking-wider block">
                Skor Tertinggi
              </span>
              <span className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                <span className="px-1.5 py-0.2 bg-emerald-600 text-white rounded text-xs font-mono font-bold">
                  {maxScoreTrait.code}
                </span>
                {maxScoreTrait.desc} ({maxScoreTrait.score}/9)
              </span>
            </div>
          </div>
        )}

        {minScoreTrait.score <= 9 && (
          <div className="bg-slate-50 border border-slate-200/70 p-3.5 rounded-xl flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-slate-200 text-slate-600 flex items-center justify-center shrink-0">
              <Sparkles size={18} />
            </div>
            <div>
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                Skor Terendah
              </span>
              <span className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                <span className="px-1.5 py-0.2 bg-slate-700 text-white rounded text-xs font-mono font-bold">
                  {minScoreTrait.code}
                </span>
                {minScoreTrait.desc} ({minScoreTrait.score}/9)
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Main Content Grid: Radar + Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Radar Diagram */}
        <div className="lg:col-span-5 flex flex-col items-center bg-slate-50/60 p-4 rounded-2xl border border-slate-200/80 sticky top-4">
          <div className="flex items-center justify-between w-full border-b border-slate-200 pb-2.5 mb-2">
            <span className="text-xs font-black text-slate-700 uppercase tracking-wider">
              Diagram Radar Profil
            </span>
            <span className="text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-bold border border-emerald-200">
              20 Trait Aktif
            </span>
          </div>

          <PAPIRadarChart
            scores={normalizedScores}
            selectedTrait={highlightedTrait}
            onSelectTrait={(code) => {
              const newHighlighted = code === highlightedTrait ? null : code;
              setHighlightedTrait(newHighlighted);
              if (newHighlighted) {
                const targetCat = PAPI_CATEGORIES.find((c) =>
                  c.traits.some((t) => t.code === newHighlighted)
                );
                if (targetCat && selectedCategory !== "ALL" && selectedCategory !== targetCat.id) {
                  setSelectedCategory("ALL");
                }
                setTimeout(() => {
                  const el = document.getElementById(`papi-trait-${newHighlighted}`);
                  if (el) {
                    el.scrollIntoView({ behavior: "smooth", block: "nearest" });
                  }
                }, 60);
              }
            }}
          />

          <p className="text-[11px] text-slate-400 text-center mt-2">
            Klik huruf / titik pada radar chart untuk memfokuskan interpretasi.
          </p>
        </div>

        {/* Right Column: Detailed Categories & Interpretations */}
        <div className="lg:col-span-7 space-y-4">
          {/* Controls: Category Filter Tabs & Search */}
          <div className="space-y-2.5 bg-slate-50/80 p-3 rounded-xl border border-slate-200">
            {/* Category Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 custom-scrollbar text-xs">
              <button
                type="button"
                onClick={() => setSelectedCategory("ALL")}
                className={`px-3 py-1 rounded-lg font-bold transition-all text-xs whitespace-nowrap cursor-pointer ${
                  selectedCategory === "ALL"
                    ? "bg-slate-900 text-white shadow-xs"
                    : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-100"
                }`}
              >
                Semua (7 Kategori)
              </button>
              {PAPI_CATEGORIES.map((cat) => {
                const isActive = selectedCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`px-3 py-1 rounded-lg font-semibold transition-all text-xs whitespace-nowrap cursor-pointer ${
                      isActive
                        ? "bg-emerald-600 text-white shadow-xs font-bold"
                        : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-100"
                    }`}
                  >
                    {cat.title.split("(")[0].trim()}
                  </button>
                );
              })}
            </div>

            {/* Search trait input */}
            <div className="relative">
              <Search
                size={14}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                type="text"
                placeholder="Cari trait (contoh: Kepemimpinan, Kecepatan, T, L)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-slate-800 placeholder:text-slate-400"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600"
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          {/* Categories List */}
          <div className="space-y-4 max-h-[620px] overflow-y-auto pr-1 custom-scrollbar">
            {filteredCategories.length === 0 ? (
              <div className="text-center py-8 bg-slate-50 rounded-xl border border-slate-200 text-slate-400 text-xs">
                Tidak ada trait yang cocok dengan kata kunci &ldquo;{searchQuery}&rdquo;.
              </div>
            ) : (
              filteredCategories.map((cat) => (
                <div
                  key={cat.id}
                  className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-3.5"
                >
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                    <span
                      className={`text-[11px] font-black uppercase tracking-wider px-2.5 py-1 rounded-md border ${cat.color}`}
                    >
                      {cat.title}
                    </span>
                    <span className="text-[10px] font-bold text-slate-400">
                      {cat.traits.length} Trait
                    </span>
                  </div>

                  <div className="space-y-4 pt-1">
                    {cat.traits.map((trait) => {
                      const val = Number(
                        normalizedScores[trait.key] ??
                          normalizedScores[trait.code] ??
                          normalizedScores[trait.code.toLowerCase()] ??
                          0
                      );
                      const pct = Math.min(Math.round((val / 9) * 100), 100);
                      const papiInfo = getPAPIData(trait.code, val);
                      const levelInfo = getPAPIScoreLevel(val);
                      const isHighlighted = highlightedTrait === trait.code;

                      return (
                        <div
                          key={trait.code}
                          id={`papi-trait-${trait.code}`}
                          onClick={() => setHighlightedTrait(trait.code === highlightedTrait ? null : trait.code)}
                          className={`p-3 rounded-xl transition-all cursor-pointer border ${
                            isHighlighted
                              ? "bg-emerald-50/50 border-emerald-300 ring-2 ring-emerald-400/20 shadow-xs"
                              : "bg-slate-50/50 border-slate-100 hover:border-slate-200 hover:bg-slate-50"
                          }`}
                        >
                          {/* Trait Header */}
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-2">
                            <div className="flex items-center gap-2">
                              <span className="w-6 h-6 rounded-lg bg-slate-900 text-white flex items-center justify-center text-xs font-mono font-black shadow-xs shrink-0">
                                {trait.code}
                              </span>
                              <div>
                                <span className="font-bold text-slate-800 text-xs block leading-tight">
                                  {trait.label}
                                </span>
                                <span className="text-[10px] text-slate-500 font-medium">
                                  {trait.description}
                                </span>
                              </div>
                            </div>

                            <div className="flex items-center gap-2 self-end sm:self-auto">
                              <span
                                className={`text-[10px] font-bold px-2 py-0.5 rounded border ${levelInfo.badgeColor}`}
                              >
                                {levelInfo.label}
                              </span>
                              <span className="font-mono font-black text-slate-900 bg-white px-2.5 py-0.5 rounded-md border border-slate-200 text-xs shadow-2xs">
                                {val} / 9
                              </span>
                            </div>
                          </div>

                          {/* Progress Bar */}
                          <div className="w-full bg-slate-200/80 rounded-full h-2 overflow-hidden mb-2.5">
                            <div
                              className={`h-full rounded-full transition-all duration-500 ${cat.barColor}`}
                              style={{ width: `${pct}%` }}
                            ></div>
                          </div>

                          {/* Qualitative Interpretation Box */}
                          <div className="bg-white p-3 rounded-lg border border-slate-200/70 shadow-2xs">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                              Interpretasi Kualitatif ({papiInfo.category}):
                            </span>
                            <p className="text-[11px] text-slate-700 leading-relaxed font-medium">
                              {papiInfo.text}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
