"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import {
  Layers,
  ChevronDown,
  Check,
  Search,
  Calendar,
  Users,
  CheckCircle2,
  Clock,
  X,
  Filter,
} from "lucide-react";

export interface BatchFilterItem {
  id: string;
  batch_name: string;
  scheduled_date?: string;
  total_karyawan: number;
  total_completed: number;
  total_ongoing: number;
  total_invited: number;
}

interface BatchFilterDropdownProps {
  batches: BatchFilterItem[];
  selectedBatchFilter: string;
  onSelectBatch: (batchId: string) => void;
  totalParticipants: number;
}

export default function BatchFilterDropdown({
  batches,
  selectedBatchFilter,
  onSelectBatch,
  totalParticipants,
}: BatchFilterDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleKeyDown);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  // Focus search input when dropdown opens
  useEffect(() => {
    if (isOpen && batches.length > 4) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 50);
    }
    if (!isOpen) {
      setSearchQuery("");
    }
  }, [isOpen, batches.length]);

  // Find currently selected batch object
  const activeBatch = useMemo(() => {
    if (selectedBatchFilter === "all") return null;
    return batches.find(
      (b) => b.id === selectedBatchFilter || b.batch_name === selectedBatchFilter
    );
  }, [batches, selectedBatchFilter]);

  // Filter batches list based on search inside dropdown
  const filteredBatches = useMemo(() => {
    if (!searchQuery.trim()) return batches;
    const q = searchQuery.toLowerCase();
    return batches.filter((b) => b.batch_name.toLowerCase().includes(q));
  }, [batches, searchQuery]);

  // Format date nicely
  const formatBatchDate = (dateString?: string) => {
    if (!dateString) return "-";
    try {
      const d = new Date(dateString);
      if (isNaN(d.getTime())) return "-";
      return d.toLocaleDateString("id-ID", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });
    } catch {
      return "-";
    }
  };

  const isFiltered = selectedBatchFilter !== "all";

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className={`group flex items-center justify-between gap-2.5 px-3 py-1.5 h-9 rounded-xl text-xs font-semibold border transition-all duration-150 active:scale-[0.98] cursor-pointer shadow-2xs select-none ${
          isFiltered
            ? "bg-blue-50/90 hover:bg-blue-100/80 text-[#0173b6] border-blue-300/80 ring-2 ring-[#0173b6]/15"
            : "bg-slate-50 hover:bg-slate-100/90 text-slate-700 border-slate-200/90 hover:border-slate-300"
        }`}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <div className="flex items-center gap-2 min-w-0">
          {/* Icon Container */}
          <div
            className={`w-5 h-5 rounded-md flex items-center justify-center shrink-0 transition-colors ${
              isFiltered
                ? "bg-[#0173b6] text-white shadow-2xs"
                : "bg-blue-100/80 text-[#0173b6] group-hover:bg-blue-200/70"
            }`}
          >
            {isFiltered ? <Filter size={11} /> : <Layers size={11} />}
          </div>

          {/* Label text */}
          <span className="truncate max-w-[130px] sm:max-w-[190px] font-medium text-left">
            {isFiltered && activeBatch ? (
              <span className="font-bold text-[#0173b6]">{activeBatch.batch_name}</span>
            ) : (
              <span>Semua Batch</span>
            )}
          </span>

          {/* Badge count */}
          <span
            className={`px-1.5 py-0.5 rounded-md text-[10px] font-mono tabular-nums font-bold shrink-0 ${
              isFiltered
                ? "bg-[#0173b6] text-white"
                : "bg-slate-200/80 text-slate-600"
            }`}
          >
            {isFiltered && activeBatch ? activeBatch.total_karyawan : batches.length}
          </span>
        </div>

        {/* Right Action: Clear or Caret */}
        <div className="flex items-center gap-1 shrink-0 ml-0.5">
          {isFiltered && (
            <span
              role="button"
              tabIndex={0}
              onClick={(e) => {
                e.stopPropagation();
                onSelectBatch("all");
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.stopPropagation();
                  onSelectBatch("all");
                }
              }}
              title="Reset ke Semua Batch"
              className="p-1 rounded-md text-blue-600 hover:text-white hover:bg-blue-600 transition-colors cursor-pointer"
            >
              <X size={12} />
            </span>
          )}
          <ChevronDown
            size={13}
            className={`transition-transform duration-200 text-slate-400 group-hover:text-slate-600 ${
              isFiltered ? "text-blue-500 group-hover:text-blue-700" : ""
            } ${isOpen ? "rotate-180" : ""}`}
          />
        </div>
      </button>

      {/* Dropdown Menu Popover */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-[calc(100vw-2.5rem)] sm:w-[380px] bg-white rounded-2xl shadow-xl border border-slate-200/90 z-50 overflow-hidden animate-in fade-in-50 zoom-in-95 duration-150">
          {/* Popover Header */}
          <div className="bg-slate-50/90 border-b border-slate-100 px-3.5 py-2.5 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-blue-100 text-[#0173b6] flex items-center justify-center">
                <Layers size={13} />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-800">Filter Batch Ujian</p>
                <p className="text-[10px] text-slate-500">Pilih gelombang untuk menyaring peserta</p>
              </div>
            </div>
            <span className="text-[10px] font-mono tabular-nums font-bold text-slate-500 bg-white px-2 py-0.5 rounded-full border border-slate-200">
              {batches.length} Batch
            </span>
          </div>

          {/* Search Box if batches > 4 */}
          {batches.length > 4 && (
            <div className="p-2 border-b border-slate-100 bg-white">
              <div className="relative">
                <input
                  ref={searchInputRef}
                  type="text"
                  placeholder="Cari nama batch..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full text-xs pl-8 pr-7 py-1.5 bg-slate-50 border border-slate-200 rounded-xl focus:border-[#0173b6] focus:bg-white focus:outline-none transition-all placeholder:text-slate-400 text-slate-800 font-medium"
                />
                <Search
                  size={12}
                  className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery("")}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
                  >
                    <X size={12} />
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Dropdown Options List */}
          <div className="max-h-72 overflow-y-auto divide-y divide-slate-100/90">
            {/* Option: Semua Batch */}
            <div
              role="option"
              aria-selected={!isFiltered}
              onClick={() => {
                onSelectBatch("all");
                setIsOpen(false);
              }}
              className={`px-3.5 py-2.5 flex items-center justify-between gap-3 cursor-pointer transition-colors ${
                !isFiltered
                  ? "bg-blue-50/80 border-l-4 border-[#0173b6]"
                  : "hover:bg-slate-50 border-l-4 border-transparent"
              }`}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div
                  className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                    !isFiltered
                      ? "bg-blue-100 text-[#0173b6]"
                      : "bg-slate-100 text-slate-600"
                  }`}
                >
                  <Layers size={14} />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-slate-800">Semua Batch</p>
                  <p className="text-[10px] text-slate-500">
                    Tampilkan seluruh {totalParticipants} peserta tes
                  </p>
                </div>
              </div>

              {!isFiltered ? (
                <div className="w-5 h-5 rounded-full bg-[#0173b6] text-white flex items-center justify-center shrink-0 shadow-2xs">
                  <Check size={12} className="stroke-[2.5]" />
                </div>
              ) : (
                <span className="text-[10px] font-mono tabular-nums font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md shrink-0">
                  {totalParticipants} Peserta
                </span>
              )}
            </div>

            {/* Section Divider */}
            {filteredBatches.length > 0 && (
              <div className="px-3.5 py-1 bg-slate-50/80 text-[10px] font-black uppercase tracking-wider text-slate-400">
                Daftar Gelombang Batch
              </div>
            )}

            {/* Individual Batches */}
            {filteredBatches.length === 0 ? (
              <div className="py-6 text-center text-xs text-slate-400 font-medium">
                Tidak ada batch yang cocok dengan &quot;{searchQuery}&quot;
              </div>
            ) : (
              filteredBatches.map((batch) => {
                const isSelected =
                  selectedBatchFilter === batch.id ||
                  selectedBatchFilter === batch.batch_name;
                const formattedDate = formatBatchDate(batch.scheduled_date);
                const isAllCompleted =
                  batch.total_karyawan > 0 &&
                  batch.total_completed === batch.total_karyawan;

                return (
                  <div
                    key={batch.id}
                    role="option"
                    aria-selected={isSelected}
                    onClick={() => {
                      onSelectBatch(batch.id);
                      setIsOpen(false);
                    }}
                    className={`px-3.5 py-2.5 flex items-start justify-between gap-3 cursor-pointer transition-colors ${
                      isSelected
                        ? "bg-blue-50/80 border-l-4 border-[#0173b6]"
                        : "hover:bg-slate-50 border-l-4 border-transparent"
                    }`}
                  >
                    <div className="flex items-start gap-2.5 min-w-0 flex-1">
                      <div
                        className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                          isSelected
                            ? "bg-[#0173b6] text-white shadow-2xs"
                            : "bg-blue-50 text-[#0173b6]"
                        }`}
                      >
                        <Calendar size={14} />
                      </div>

                      <div className="min-w-0 flex-1">
                        <p
                          className={`text-xs font-bold leading-snug line-clamp-1 ${
                            isSelected ? "text-[#0173b6]" : "text-slate-800"
                          }`}
                          title={batch.batch_name}
                        >
                          {batch.batch_name}
                        </p>

                        {/* Meta information row */}
                        <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 mt-1 text-[10px] text-slate-500 font-mono tabular-nums">
                          <span className="flex items-center gap-1">
                            <Calendar size={10} className="text-slate-400" />
                            {formattedDate}
                          </span>
                          <span className="text-slate-300">•</span>
                          <span className="flex items-center gap-1 font-semibold text-slate-700">
                            <Users size={10} className="text-slate-400" />
                            {batch.total_karyawan} Peserta
                          </span>
                        </div>

                        {/* Progress mini tags */}
                        <div className="flex items-center gap-1.5 mt-1.5">
                          {isAllCompleted ? (
                            <span className="inline-flex items-center gap-1 text-[9px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200/60 px-1.5 py-0.5 rounded-md font-mono tabular-nums">
                              <CheckCircle2 size={9} /> Selesai Semua ({batch.total_completed})
                            </span>
                          ) : (
                            <>
                              {batch.total_completed > 0 && (
                                <span className="inline-flex items-center gap-1 text-[9px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200/60 px-1.5 py-0.5 rounded-md font-mono tabular-nums">
                                  <CheckCircle2 size={9} /> {batch.total_completed} selesai
                                </span>
                              )}
                              {batch.total_invited + batch.total_ongoing > 0 && (
                                <span className="inline-flex items-center gap-1 text-[9px] font-bold text-amber-700 bg-amber-50 border border-amber-200/60 px-1.5 py-0.5 rounded-md font-mono tabular-nums">
                                  <Clock size={9} /> {batch.total_invited + batch.total_ongoing} menunggu
                                </span>
                              )}
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Right checkmark */}
                    {isSelected && (
                      <div className="w-5 h-5 rounded-full bg-[#0173b6] text-white flex items-center justify-center shrink-0 mt-1 shadow-2xs">
                        <Check size={12} className="stroke-[2.5]" />
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>

          {/* Popover Footer */}
          <div className="px-3.5 py-2 bg-slate-50/90 border-t border-slate-100 flex items-center justify-between text-[11px]">
            <span className="text-slate-500 font-mono tabular-nums">
              {filteredBatches.length} dari {batches.length} batch
            </span>
            {isFiltered && (
              <button
                type="button"
                onClick={() => {
                  onSelectBatch("all");
                  setIsOpen(false);
                }}
                className="text-[#0173b6] hover:text-[#05445e] hover:underline font-bold transition-colors cursor-pointer"
              >
                Reset ke Semua Batch
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
