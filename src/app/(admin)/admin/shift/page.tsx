"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import {
  PlusCircle,
  Edit,
  Trash2,
  Loader2,
  AlertTriangle,
  Clock,
  Search,
  X,
  RotateCcw,
  CheckCircle2,
  Moon,
  Sun,
  Layers,
  Sparkles,
  Info,
} from "lucide-react";
import Swal from "sweetalert2";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";

if (typeof window !== "undefined") {
  gsap.registerPlugin(useGSAP);
}

import Modal from "@/app/components/modal";
import Pagination from "@/app/components/admin/Pagination";
import { showSuccessToast, showErrorToast } from "@/app/components/admin/Alert";

interface Shift {
  id: number;
  nama_shift: string;
  jam_masuk: string;
  jam_keluar: string;
  is_cross_day: boolean;
}

export default function MasterShiftPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const tableContainerRef = useRef<HTMLDivElement>(null);

  const [shifts, setShifts] = useState<Shift[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [crossDayFilter, setCrossDayFilter] = useState<"ALL" | "CROSS" | "SAME">("ALL");

  const [selectedShift, setSelectedShift] = useState<Shift | null>(null);
  const [formData, setFormData] = useState({
    nama_shift: "",
    jam_masuk: "",
    jam_keluar: "",
    is_cross_day: false,
  });

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const fetchShifts = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/shift");
      if (!response.ok) throw new Error("Gagal memuat master shift.");
      const data: Shift[] = await response.json();
      setShifts(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      showErrorToast("Terjadi kendala saat memuat data master shift.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchShifts();
  }, []);

  const handleCloseModals = () => {
    setIsAddModalOpen(false);
    setIsEditModalOpen(false);
    setSelectedShift(null);
  };

  const handleOpenAddModal = () => {
    setFormData({ nama_shift: "", jam_masuk: "", jam_keluar: "", is_cross_day: false });
    setIsAddModalOpen(true);
  };

  const handleAddSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!formData.nama_shift || !formData.jam_masuk || !formData.jam_keluar) {
      showErrorToast("Mohon lengkapi seluruh field nama shift dan jam operasional.");
      return;
    }

    try {
      setIsSubmitting(true);
      const response = await fetch("/api/shift", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errJson = await response.json().catch(() => ({}));
        throw new Error(errJson.message || "Gagal menambahkan master shift.");
      }

      showSuccessToast(`Shift "${formData.nama_shift}" berhasil ditambahkan.`);
      handleCloseModals();
      fetchShifts();
    } catch (err) {
      showErrorToast(err instanceof Error ? err.message : "Terjadi kesalahan.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenEditModal = (shift: Shift) => {
    setSelectedShift(shift);
    setFormData({
      nama_shift: shift.nama_shift,
      jam_masuk: shift.jam_masuk ? shift.jam_masuk.substring(0, 5) : "",
      jam_keluar: shift.jam_keluar ? shift.jam_keluar.substring(0, 5) : "",
      is_cross_day: Boolean(shift.is_cross_day),
    });
    setIsEditModalOpen(true);
  };

  const handleUpdateSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedShift) return;

    try {
      setIsSubmitting(true);
      const response = await fetch(`/api/shift/${selectedShift.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errJson = await response.json().catch(() => ({}));
        throw new Error(errJson.message || "Gagal memperbarui shift.");
      }

      showSuccessToast(`Shift "${formData.nama_shift}" berhasil diperbarui.`);
      handleCloseModals();
      fetchShifts();
    } catch (err) {
      showErrorToast(err instanceof Error ? err.message : "Terjadi kesalahan.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteWithConfirmation = async (shift: Shift) => {
    const result = await Swal.fire({
      title: "Hapus Master Shift?",
      text: `Apakah Anda yakin ingin menghapus shift "${shift.nama_shift}" (${shift.jam_masuk} - ${shift.jam_keluar})?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#e11d48",
      cancelButtonColor: "#64748b",
      confirmButtonText: "Ya, Hapus Shift",
      cancelButtonText: "Batal",
      customClass: {
        popup: "rounded-2xl font-sans",
        confirmButton: "rounded-xl font-bold px-4 py-2 text-xs uppercase tracking-wider",
        cancelButton: "rounded-xl font-bold px-4 py-2 text-xs uppercase tracking-wider",
      },
    });

    if (!result.isConfirmed) return;

    try {
      const response = await fetch(`/api/shift/${shift.id}`, { method: "DELETE" });
      if (!response.ok) {
        const errJson = await response.json().catch(() => ({}));
        throw new Error(errJson.message || "Gagal menghapus shift.");
      }
      showSuccessToast(`Shift "${shift.nama_shift}" berhasil dihapus.`);
      fetchShifts();
    } catch (err) {
      showErrorToast(err instanceof Error ? err.message : "Terjadi kesalahan.");
    }
  };

  // Filter shifts
  const filteredShifts = useMemo(() => {
    return shifts.filter((s) => {
      const matchSearch =
        !searchQuery.trim() ||
        s.nama_shift.toLowerCase().includes(searchQuery.toLowerCase());
      const matchCross =
        crossDayFilter === "ALL"
          ? true
          : crossDayFilter === "CROSS"
          ? s.is_cross_day
          : !s.is_cross_day;
      return matchSearch && matchCross;
    });
  }, [shifts, searchQuery, crossDayFilter]);

  // Pagination calculation
  const totalPages = Math.ceil(filteredShifts.length / itemsPerPage);
  const currentShifts = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredShifts.slice(start, start + itemsPerPage);
  }, [filteredShifts, currentPage, itemsPerPage]);

  // Reset page when filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, crossDayFilter]);

  // Aggregate stats
  const totalCrossDay = useMemo(() => shifts.filter((s) => s.is_cross_day).length, [shifts]);
  const totalSameDay = useMemo(() => shifts.filter((s) => !s.is_cross_day).length, [shifts]);

  // GSAP: Entrance animation
  useGSAP(
    () => {
      const tl = gsap.timeline({ defaults: { ease: "power2.out" } });

      tl.from(".shift-header", {
        y: -12,
        opacity: 0,
        duration: 0.45,
        clearProps: "all",
      })
        .from(
          ".shift-kpi-card",
          {
            y: 14,
            opacity: 0,
            duration: 0.35,
            stagger: 0.05,
            clearProps: "all",
          },
          "-=0.2"
        )
        .from(
          ".shift-filter",
          {
            y: 12,
            opacity: 0,
            duration: 0.35,
            clearProps: "all",
          },
          "-=0.15"
        )
        .from(
          ".shift-table-container",
          {
            y: 16,
            opacity: 0,
            duration: 0.4,
            clearProps: "all",
          },
          "-=0.15"
        );
    },
    { scope: containerRef, dependencies: [] }
  );

  // GSAP: Row micro-stagger
  useGSAP(
    () => {
      if (!tableContainerRef.current) return;
      const rows = tableContainerRef.current.querySelectorAll(".shift-row");
      if (rows.length > 0) {
        gsap.fromTo(
          rows,
          { opacity: 0, y: 6 },
          { opacity: 1, y: 0, duration: 0.25, stagger: 0.03, ease: "power2.out", clearProps: "all" }
        );
      }
    },
    { scope: containerRef, dependencies: [currentShifts] }
  );

  return (
    <div ref={containerRef} className="p-8 font-sans min-h-screen space-y-6">
      {/* LAYER 1: HEADER HALAMAN */}
      <div className="shift-header flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-4 border-b border-slate-200/80">
        <div>
          <div className="flex items-center gap-2 mb-1 text-[#0173b6] font-bold uppercase tracking-wider text-xs">
            <Clock size={16} />
            <span>Konfigurasi Waktu &amp; Presensi</span>
          </div>
          <h1 className="text-3xl font-bold text-[#05445e] tracking-tight">
            Master Shift Kerja
          </h1>
          <p className="text-slate-500 font-medium text-sm mt-1 max-w-2xl">
            Atur batas jam masuk, jam keluar, dan konfigurasi shift lintas hari (cross-day) untuk jadwal dinas RSU Avisena.
          </p>
        </div>

        <button
          onClick={handleOpenAddModal}
          className="btn btn-sm min-h-[42px] bg-[#0173b6] hover:bg-[#005f98] text-white font-bold px-5 rounded-xl shadow-xs transition-all active:scale-[0.98] border-0 text-xs uppercase tracking-wider gap-2 shrink-0"
        >
          <PlusCircle size={16} />
          <span>Tambah Shift Baru</span>
        </button>
      </div>

      {/* LAYER 2: KPI / SUMMARY RIBBON (4 METRICS) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="shift-kpi-card bg-white border border-slate-200/90 rounded-2xl p-4 shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Shift</p>
            <p className="text-2xl font-black text-slate-800 font-mono tabular-nums mt-0.5">
              {shifts.length} <span className="text-xs font-semibold text-slate-400 font-sans">Jadwal</span>
            </p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-blue-50 text-[#0173b6] flex items-center justify-center font-bold">
            <Layers size={22} />
          </div>
        </div>

        <div className="shift-kpi-card bg-white border border-slate-200/90 rounded-2xl p-4 shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Reguler (Sama Hari)</p>
            <p className="text-2xl font-black text-emerald-600 font-mono tabular-nums mt-0.5">
              {totalSameDay} <span className="text-xs font-semibold text-slate-400 font-sans">Shift</span>
            </p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            <Sun size={22} />
          </div>
        </div>

        <div className="shift-kpi-card bg-white border border-slate-200/90 rounded-2xl p-4 shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Lintas Hari (Malam)</p>
            <p className="text-2xl font-black text-indigo-600 font-mono tabular-nums mt-0.5">
              {totalCrossDay} <span className="text-xs font-semibold text-slate-400 font-sans">Shift</span>
            </p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
            <Moon size={22} />
          </div>
        </div>

        <div className="shift-kpi-card bg-white border border-slate-200/90 rounded-2xl p-4 shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Layanan Rumah Sakit</p>
            <p className="text-2xl font-black text-[#0173b6] font-mono tabular-nums mt-0.5">
              24 <span className="text-xs font-semibold text-slate-400 font-sans">Jam Nonstop</span>
            </p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-blue-50 text-[#0173b6] flex items-center justify-center font-bold">
            <Sparkles size={22} />
          </div>
        </div>
      </div>

      {/* LAYER 3: KONTROL FILTER & PENCARIAN */}
      <div className="shift-filter bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
          <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
            Filter &amp; Pencarian Shift
          </span>
          {(searchQuery || crossDayFilter !== "ALL") && (
            <button
              onClick={() => {
                setSearchQuery("");
                setCrossDayFilter("ALL");
              }}
              className="btn btn-xs btn-ghost text-xs font-bold text-[#0173b6] hover:bg-blue-50 rounded-lg gap-1.5"
            >
              <RotateCcw size={12} />
              <span>Reset Filter</span>
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {/* Input Pencarian */}
          <div className="relative md:col-span-2">
            <input
              type="text"
              placeholder="Cari nama shift kerja (cth: Pagi, Siang, Malam, IGD)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-8 py-2.5 bg-slate-50/80 border border-slate-200/90 rounded-xl text-xs font-semibold text-slate-800 focus:bg-white focus:border-[#0173b6] focus:ring-2 focus:ring-[#0173b6]/20 outline-none transition-all placeholder:text-slate-400"
            />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* Filter Tipe Lintas Hari */}
          <div className="flex w-full bg-slate-100/90 p-1 rounded-xl border border-slate-200/80 gap-1 items-center">
            <button
              type="button"
              onClick={() => setCrossDayFilter("ALL")}
              className={`flex-1 py-1.5 px-3 rounded-lg font-bold text-[11px] transition-all text-center ${
                crossDayFilter === "ALL"
                  ? "bg-[#0173b6] text-white shadow-xs"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/60"
              }`}
            >
              Semua
            </button>
            <button
              type="button"
              onClick={() => setCrossDayFilter("SAME")}
              className={`flex-1 py-1.5 px-3 rounded-lg font-bold text-[11px] transition-all text-center ${
                crossDayFilter === "SAME"
                  ? "bg-[#0173b6] text-white shadow-xs"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/60"
              }`}
            >
              Sama Hari
            </button>
            <button
              type="button"
              onClick={() => setCrossDayFilter("CROSS")}
              className={`flex-1 py-1.5 px-3 rounded-lg font-bold text-[11px] transition-all text-center ${
                crossDayFilter === "CROSS"
                  ? "bg-[#0173b6] text-white shadow-xs"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/60"
              }`}
            >
              Lintas Hari
            </button>
          </div>
        </div>
      </div>

      {/* LAYER 4: BARIS JUDUL & COUNTER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-1">
        <div className="flex items-center gap-2.5">
          <h2 className="text-xl font-bold text-[#05445e] tracking-tight">
            Daftar Master Shift Operasional
          </h2>
          <span className="badge badge-sm badge-neutral font-mono tabular-nums text-xs">
            {filteredShifts.length} Shift
          </span>
        </div>

        <div className="text-xs text-slate-500 font-medium flex items-center gap-1.5">
          <Info size={14} className="text-[#0173b6]" />
          <span>Shift lintas hari (+1) otomatis mengakomodasi pergantian hari saat checkout</span>
        </div>
      </div>

      {/* LAYER 5: TABEL DATA EKSEKUTIF */}
      <div
        ref={tableContainerRef}
        className="shift-table-container bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden"
      >
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-[#05445e] text-white uppercase tracking-wider font-semibold">
                <th className="py-3.5 px-6">Nama Shift</th>
                <th className="py-3.5 px-4 text-center">Jam Masuk</th>
                <th className="py-3.5 px-4 text-center">Jam Keluar</th>
                <th className="py-3.5 px-4 text-center">Kategori Hari</th>
                <th className="py-3.5 px-6 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="py-20 text-center">
                    <Loader2 className="w-8 h-8 text-[#0173b6] animate-spin mx-auto mb-2" />
                    <p className="text-xs font-bold text-slate-500">Memuat konfigurasi shift...</p>
                  </td>
                </tr>
              ) : currentShifts.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-16 text-center">
                    <div className="w-12 h-12 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-center mx-auto mb-2 text-slate-400">
                      <AlertTriangle size={20} />
                    </div>
                    <p className="text-xs font-bold text-slate-700">Tidak ada data shift ditemukan</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">Coba ubah kata kunci pencarian atau reset filter.</p>
                  </td>
                </tr>
              ) : (
                currentShifts.map((shift, idx) => {
                  const isCross = Boolean(shift.is_cross_day);
                  return (
                    <tr
                      key={shift.id}
                      className={`shift-row hover:bg-blue-50/40 transition-colors ${
                        idx % 2 === 0 ? "bg-white" : "bg-slate-50/30"
                      }`}
                    >
                      <td className="py-3.5 px-6">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-9 h-9 rounded-xl flex items-center justify-center font-black text-xs shrink-0 border ${
                              isCross
                                ? "bg-indigo-50 text-indigo-700 border-indigo-200/80"
                                : "bg-blue-50 text-[#0173b6] border-blue-200/80"
                            }`}
                          >
                            {isCross ? <Moon size={16} /> : <Sun size={16} />}
                          </div>
                          <div>
                            <p className="font-bold text-slate-900 text-xs">{shift.nama_shift}</p>
                            <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                              ID #{shift.id}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 text-center font-mono tabular-nums font-bold text-slate-800 text-xs">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200/60">
                          {shift.jam_masuk ? shift.jam_masuk.substring(0, 5) : "-"}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-center font-mono tabular-nums font-bold text-slate-800 text-xs">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-rose-50 text-rose-700 border border-rose-200/60">
                          {shift.jam_keluar ? shift.jam_keluar.substring(0, 5) : "-"}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        <span
                          className={`badge badge-sm font-bold text-[10px] uppercase tracking-wider ${
                            isCross
                              ? "badge-primary text-white border-indigo-400"
                              : "badge-ghost text-slate-600"
                          }`}
                        >
                          {isCross ? "Lintas Hari (+1)" : "Hari yang Sama"}
                        </span>
                      </td>

                      <td className="py-3.5 px-6 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleOpenEditModal(shift)}
                            className="btn btn-xs btn-ghost text-blue-600 hover:bg-blue-50 rounded-lg p-1"
                            title="Edit Shift"
                          >
                            <Edit size={15} />
                          </button>
                          <button
                            onClick={() => handleDeleteWithConfirmation(shift)}
                            className="btn btn-xs btn-ghost text-rose-600 hover:bg-rose-50 rounded-lg p-1"
                            title="Hapus Shift"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Footer Pagination */}
        <div className="p-3 border-t border-slate-100 bg-slate-50/50">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </div>
      </div>

      {/* MODAL TAMBAH SHIFT */}
      <Modal isOpen={isAddModalOpen} onClose={handleCloseModals} title="Tambah Master Shift Baru">
        <form onSubmit={handleAddSubmit} className="space-y-4 p-1">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Nama Shift Kerja
            </label>
            <input
              type="text"
              placeholder="Contoh: Shift Pagi IGD, Shift Malam Rawat Inap"
              value={formData.nama_shift}
              onChange={(e) => setFormData({ ...formData, nama_shift: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-slate-50/80 border border-slate-200/90 rounded-xl text-xs font-semibold text-slate-800 focus:bg-white focus:border-[#0173b6] focus:ring-2 focus:ring-[#0173b6]/20 outline-none transition-all"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Jam Masuk (HH:mm)
              </label>
              <input
                type="time"
                value={formData.jam_masuk}
                onChange={(e) => setFormData({ ...formData, jam_masuk: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50/80 border border-slate-200/90 rounded-xl text-xs font-bold text-slate-800 font-mono tabular-nums focus:bg-white focus:border-[#0173b6] outline-none transition-all"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Jam Keluar (HH:mm)
              </label>
              <input
                type="time"
                value={formData.jam_keluar}
                onChange={(e) => setFormData({ ...formData, jam_keluar: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50/80 border border-slate-200/90 rounded-xl text-xs font-bold text-slate-800 font-mono tabular-nums focus:bg-white focus:border-[#0173b6] outline-none transition-all"
                required
              />
            </div>
          </div>

          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80 flex items-center justify-between gap-3">
            <div>
              <span className="text-xs font-bold text-slate-800 block">Shift Lintas Hari (Cross-Day)</span>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Aktifkan jika shift berakhir di keesokan harinya (seperti shift malam 21:00 - 07:00).
              </p>
            </div>
            <input
              type="checkbox"
              checked={formData.is_cross_day}
              onChange={(e) => setFormData({ ...formData, is_cross_day: e.target.checked })}
              className="toggle toggle-primary toggle-sm"
            />
          </div>

          <div className="flex justify-end gap-2.5 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={handleCloseModals}
              className="btn btn-sm btn-ghost text-xs font-bold text-slate-600 rounded-xl px-4"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn btn-sm bg-[#0173b6] hover:bg-[#005f98] text-white font-bold rounded-xl px-5 border-0 text-xs uppercase tracking-wider shadow-xs"
            >
              {isSubmitting ? <Loader2 size={15} className="animate-spin" /> : "Simpan Shift"}
            </button>
          </div>
        </form>
      </Modal>

      {/* MODAL EDIT SHIFT */}
      <Modal isOpen={isEditModalOpen} onClose={handleCloseModals} title="Edit Master Shift">
        <form onSubmit={handleUpdateSubmit} className="space-y-4 p-1">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Nama Shift Kerja
            </label>
            <input
              type="text"
              value={formData.nama_shift}
              onChange={(e) => setFormData({ ...formData, nama_shift: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-slate-50/80 border border-slate-200/90 rounded-xl text-xs font-semibold text-slate-800 focus:bg-white focus:border-[#0173b6] focus:ring-2 focus:ring-[#0173b6]/20 outline-none transition-all"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Jam Masuk (HH:mm)
              </label>
              <input
                type="time"
                value={formData.jam_masuk}
                onChange={(e) => setFormData({ ...formData, jam_masuk: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50/80 border border-slate-200/90 rounded-xl text-xs font-bold text-slate-800 font-mono tabular-nums focus:bg-white focus:border-[#0173b6] outline-none transition-all"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Jam Keluar (HH:mm)
              </label>
              <input
                type="time"
                value={formData.jam_keluar}
                onChange={(e) => setFormData({ ...formData, jam_keluar: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50/80 border border-slate-200/90 rounded-xl text-xs font-bold text-slate-800 font-mono tabular-nums focus:bg-white focus:border-[#0173b6] outline-none transition-all"
                required
              />
            </div>
          </div>

          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80 flex items-center justify-between gap-3">
            <div>
              <span className="text-xs font-bold text-slate-800 block">Shift Lintas Hari (Cross-Day)</span>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Aktifkan jika shift berakhir di keesokan harinya (seperti shift malam 21:00 - 07:00).
              </p>
            </div>
            <input
              type="checkbox"
              checked={formData.is_cross_day}
              onChange={(e) => setFormData({ ...formData, is_cross_day: e.target.checked })}
              className="toggle toggle-primary toggle-sm"
            />
          </div>

          <div className="flex justify-end gap-2.5 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={handleCloseModals}
              className="btn btn-sm btn-ghost text-xs font-bold text-slate-600 rounded-xl px-4"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn btn-sm bg-[#0173b6] hover:bg-[#005f98] text-white font-bold rounded-xl px-5 border-0 text-xs uppercase tracking-wider shadow-xs"
            >
              {isSubmitting ? <Loader2 size={15} className="animate-spin" /> : "Simpan Perubahan"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
