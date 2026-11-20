"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import {
  PlusCircle,
  Edit,
  Trash2,
  Loader2,
  AlertTriangle,
  CalendarDays,
  Search,
  X,
  RotateCcw,
  Calendar,
  Layers,
  Clock,
  Sparkles,
  Info,
  CheckCircle2,
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
  jam_masuk?: string;
  jam_keluar?: string;
}

interface JadwalDetail {
  hari: number;
  shift_id: number | null;
}

interface JadwalKerja {
  id: number;
  nama_jadwal: string;
  tipe: string;
  keterangan: string;
  details?: JadwalDetail[];
}

const HARI_NAMES = [
  { index: 1, name: "Senin" },
  { index: 2, name: "Selasa" },
  { index: 3, name: "Rabu" },
  { index: 4, name: "Kamis" },
  { index: 5, name: "Jumat" },
  { index: 6, name: "Sabtu" },
  { index: 0, name: "Minggu" },
];

export default function TemplateJadwalPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const tableContainerRef = useRef<HTMLDivElement>(null);

  const [jadwals, setJadwals] = useState<JadwalKerja[]>([]);
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [tipeFilter, setTipeFilter] = useState<"ALL" | "FIXED" | "SHIFT">("ALL");

  const [selectedJadwal, setSelectedJadwal] = useState<JadwalKerja | null>(null);
  const [formData, setFormData] = useState({
    nama_jadwal: "",
    tipe: "FIXED",
    keterangan: "",
    details: Array.from({ length: 7 }, (_, i) => ({ hari: i, shift_id: null as number | null })),
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [resJadwal, resShift] = await Promise.all([
        fetch("/api/jadwal-kerja"),
        fetch("/api/shift"),
      ]);
      if (!resJadwal.ok || !resShift.ok) throw new Error("Gagal memuat template jadwal.");
      const jData = await resJadwal.json();
      const sData = await resShift.json();
      setJadwals(Array.isArray(jData) ? jData : []);
      setShifts(Array.isArray(sData) ? sData : []);
    } catch (err) {
      console.error(err);
      showErrorToast("Terjadi kendala saat memuat data jadwal.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCloseModals = () => {
    setIsModalOpen(false);
    setSelectedJadwal(null);
  };

  const handleOpenAddModal = () => {
    setFormData({
      nama_jadwal: "",
      tipe: "FIXED",
      keterangan: "",
      details: Array.from({ length: 7 }, (_, i) => ({ hari: i, shift_id: null })),
    });
    setSelectedJadwal(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = async (jadwal: JadwalKerja) => {
    setSelectedJadwal(jadwal);
    try {
      const res = await fetch(`/api/jadwal-kerja/${jadwal.id}`);
      const data = await res.json();
      const details = Array.from({ length: 7 }, (_, i) => {
        const found = data.details?.find((d: any) => d.hari === i);
        return { hari: i, shift_id: found ? found.shift_id : null };
      });
      setFormData({
        nama_jadwal: data.nama_jadwal,
        tipe: data.tipe,
        keterangan: data.keterangan || "",
        details,
      });
      setIsModalOpen(true);
    } catch (err) {
      showErrorToast("Gagal mengambil detail jadwal.");
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!formData.nama_jadwal.trim()) {
      showErrorToast("Nama jadwal wajib diisi.");
      return;
    }

    try {
      setIsSubmitting(true);
      const url = selectedJadwal ? `/api/jadwal-kerja/${selectedJadwal.id}` : "/api/jadwal-kerja";
      const method = selectedJadwal ? "PUT" : "POST";
      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errJson = await response.json().catch(() => ({}));
        throw new Error(errJson.message || "Gagal menyimpan jadwal.");
      }

      showSuccessToast(
        selectedJadwal
          ? `Template jadwal "${formData.nama_jadwal}" berhasil diperbarui.`
          : `Template jadwal "${formData.nama_jadwal}" berhasil ditambahkan.`
      );
      handleCloseModals();
      fetchData();
    } catch (err) {
      showErrorToast(err instanceof Error ? err.message : "Terjadi kesalahan.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteWithConfirmation = async (jadwal: JadwalKerja) => {
    const result = await Swal.fire({
      title: "Hapus Template Jadwal?",
      text: `Apakah Anda yakin ingin menghapus jadwal "${jadwal.nama_jadwal}"? Pastikan tidak ada karyawan yang sedang menggunakan jadwal ini.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#e11d48",
      cancelButtonColor: "#64748b",
      confirmButtonText: "Ya, Hapus Jadwal",
      cancelButtonText: "Batal",
      customClass: {
        popup: "rounded-2xl font-sans",
        confirmButton: "rounded-xl font-bold px-4 py-2 text-xs uppercase tracking-wider",
        cancelButton: "rounded-xl font-bold px-4 py-2 text-xs uppercase tracking-wider",
      },
    });

    if (!result.isConfirmed) return;

    try {
      const response = await fetch(`/api/jadwal-kerja/${jadwal.id}`, { method: "DELETE" });
      if (!response.ok) {
        const errJson = await response.json().catch(() => ({}));
        throw new Error(errJson.message || "Gagal menghapus jadwal.");
      }
      showSuccessToast(`Template jadwal "${jadwal.nama_jadwal}" berhasil dihapus.`);
      fetchData();
    } catch (err) {
      showErrorToast(err instanceof Error ? err.message : "Terjadi kesalahan.");
    }
  };

  // Filter jadwals
  const filteredJadwals = useMemo(() => {
    return jadwals.filter((j) => {
      const matchSearch =
        !searchQuery.trim() ||
        j.nama_jadwal.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (j.keterangan && j.keterangan.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchTipe =
        tipeFilter === "ALL" ? true : j.tipe === tipeFilter;
      return matchSearch && matchTipe;
    });
  }, [jadwals, searchQuery, tipeFilter]);

  // Pagination calculation
  const totalPages = Math.ceil(filteredJadwals.length / itemsPerPage);
  const currentJadwals = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredJadwals.slice(start, start + itemsPerPage);
  }, [filteredJadwals, currentPage, itemsPerPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, tipeFilter]);

  // Aggregate stats
  const totalFixed = useMemo(() => jadwals.filter((j) => j.tipe === "FIXED").length, [jadwals]);
  const totalShift = useMemo(() => jadwals.filter((j) => j.tipe === "SHIFT").length, [jadwals]);

  // GSAP: Entrance animation
  useGSAP(
    () => {
      const tl = gsap.timeline({ defaults: { ease: "power2.out" } });

      tl.from(".jadwal-header", {
        y: -12,
        opacity: 0,
        duration: 0.45,
        clearProps: "all",
      })
        .from(
          ".jadwal-kpi-card",
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
          ".jadwal-filter",
          {
            y: 12,
            opacity: 0,
            duration: 0.35,
            clearProps: "all",
          },
          "-=0.15"
        )
        .from(
          ".jadwal-table-container",
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
      const rows = tableContainerRef.current.querySelectorAll(".jadwal-row");
      if (rows.length > 0) {
        gsap.fromTo(
          rows,
          { opacity: 0, y: 6 },
          { opacity: 1, y: 0, duration: 0.25, stagger: 0.03, ease: "power2.out", clearProps: "all" }
        );
      }
    },
    { scope: containerRef, dependencies: [currentJadwals] }
  );

  return (
    <div ref={containerRef} className="p-8 font-sans min-h-screen space-y-6">
      {/* LAYER 1: HEADER HALAMAN */}
      <div className="jadwal-header flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-4 border-b border-slate-200/80">
        <div>
          <div className="flex items-center gap-2 mb-1 text-[#0173b6] font-bold uppercase tracking-wider text-xs">
            <CalendarDays size={16} />
            <span>Manajemen Jadwal &amp; Shift</span>
          </div>
          <h1 className="text-3xl font-bold text-[#05445e] tracking-tight">
            Template Jadwal Kerja
          </h1>
          <p className="text-slate-500 font-medium text-sm mt-1 max-w-2xl">
            Kelola template jadwal kerja mingguan (Fixed jam reguler atau Pola Berputar/Shift dinamis) untuk penugasan pegawai RSU Avisena.
          </p>
        </div>

        <button
          onClick={handleOpenAddModal}
          className="btn btn-sm min-h-[42px] bg-[#0173b6] hover:bg-[#005f98] text-white font-bold px-5 rounded-xl shadow-xs transition-all active:scale-[0.98] border-0 text-xs uppercase tracking-wider gap-2 shrink-0"
        >
          <PlusCircle size={16} />
          <span>Tambah Template Baru</span>
        </button>
      </div>

      {/* LAYER 2: KPI / SUMMARY RIBBON (4 METRICS) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="jadwal-kpi-card bg-white border border-slate-200/90 rounded-2xl p-4 shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Template</p>
            <p className="text-2xl font-black text-slate-800 font-mono tabular-nums mt-0.5">
              {jadwals.length} <span className="text-xs font-semibold text-slate-400 font-sans">Pola</span>
            </p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-blue-50 text-[#0173b6] flex items-center justify-center font-bold">
            <CalendarDays size={22} />
          </div>
        </div>

        <div className="jadwal-kpi-card bg-white border border-slate-200/90 rounded-2xl p-4 shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Pola Tetap (FIXED)</p>
            <p className="text-2xl font-black text-blue-600 font-mono tabular-nums mt-0.5">
              {totalFixed} <span className="text-xs font-semibold text-slate-400 font-sans">Jadwal</span>
            </p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
            <Clock size={22} />
          </div>
        </div>

        <div className="jadwal-kpi-card bg-white border border-slate-200/90 rounded-2xl p-4 shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Pola Shift (Dinamis)</p>
            <p className="text-2xl font-black text-amber-600 font-mono tabular-nums mt-0.5">
              {totalShift} <span className="text-xs font-semibold text-slate-400 font-sans">Jadwal</span>
            </p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
            <Layers size={22} />
          </div>
        </div>

        <div className="jadwal-kpi-card bg-white border border-slate-200/90 rounded-2xl p-4 shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Master Shift Aktif</p>
            <p className="text-2xl font-black text-emerald-600 font-mono tabular-nums mt-0.5">
              {shifts.length} <span className="text-xs font-semibold text-slate-400 font-sans">Varian</span>
            </p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            <Sparkles size={22} />
          </div>
        </div>
      </div>

      {/* LAYER 3: KONTROL FILTER & PENCARIAN */}
      <div className="jadwal-filter bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
          <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
            Filter &amp; Pencarian Template Jadwal
          </span>
          {(searchQuery || tipeFilter !== "ALL") && (
            <button
              onClick={() => {
                setSearchQuery("");
                setTipeFilter("ALL");
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
              placeholder="Cari nama template jadwal atau keterangan..."
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

          {/* Tipe Filter Switcher */}
          <div className="flex w-full bg-slate-100/90 p-1 rounded-xl border border-slate-200/80 gap-1 items-center">
            <button
              type="button"
              onClick={() => setTipeFilter("ALL")}
              className={`flex-1 py-1.5 px-3 rounded-lg font-bold text-[11px] transition-all text-center ${
                tipeFilter === "ALL"
                  ? "bg-[#0173b6] text-white shadow-xs"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/60"
              }`}
            >
              Semua
            </button>
            <button
              type="button"
              onClick={() => setTipeFilter("FIXED")}
              className={`flex-1 py-1.5 px-3 rounded-lg font-bold text-[11px] transition-all text-center ${
                tipeFilter === "FIXED"
                  ? "bg-[#0173b6] text-white shadow-xs"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/60"
              }`}
            >
              FIXED (Tetap)
            </button>
            <button
              type="button"
              onClick={() => setTipeFilter("SHIFT")}
              className={`flex-1 py-1.5 px-3 rounded-lg font-bold text-[11px] transition-all text-center ${
                tipeFilter === "SHIFT"
                  ? "bg-[#0173b6] text-white shadow-xs"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/60"
              }`}
            >
              SHIFT (Dinamis)
            </button>
          </div>
        </div>
      </div>

      {/* LAYER 4: BARIS JUDUL & COUNTER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-1">
        <div className="flex items-center gap-2.5">
          <h2 className="text-xl font-bold text-[#05445e] tracking-tight">
            Daftar Template Pola Kerja
          </h2>
          <span className="badge badge-sm badge-neutral font-mono tabular-nums text-xs">
            {filteredJadwals.length} Template
          </span>
        </div>

        <div className="text-xs text-slate-500 font-medium flex items-center gap-1.5">
          <Info size={14} className="text-[#0173b6]" />
          <span>Jadwal FIXED berulang mingguan otomatis; Jadwal SHIFT diplot bulanan</span>
        </div>
      </div>

      {/* LAYER 5: TABEL DATA EKSEKUTIF */}
      <div
        ref={tableContainerRef}
        className="jadwal-table-container bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden"
      >
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-[#05445e] text-white uppercase tracking-wider font-semibold">
                <th className="py-3.5 px-6">Nama Template Jadwal</th>
                <th className="py-3.5 px-4 text-center">Tipe Pola</th>
                <th className="py-3.5 px-6">Keterangan / Pola Jam Kerja</th>
                <th className="py-3.5 px-6 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td colSpan={4} className="py-20 text-center">
                    <Loader2 className="w-8 h-8 text-[#0173b6] animate-spin mx-auto mb-2" />
                    <p className="text-xs font-bold text-slate-500">Memuat template jadwal kerja...</p>
                  </td>
                </tr>
              ) : currentJadwals.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-16 text-center">
                    <div className="w-12 h-12 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-center mx-auto mb-2 text-slate-400">
                      <AlertTriangle size={20} />
                    </div>
                    <p className="text-xs font-bold text-slate-700">Tidak ada template jadwal ditemukan</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">Silakan tambahkan template baru atau reset filter.</p>
                  </td>
                </tr>
              ) : (
                currentJadwals.map((j, idx) => {
                  const isFixed = j.tipe === "FIXED";
                  return (
                    <tr
                      key={j.id}
                      className={`jadwal-row hover:bg-blue-50/40 transition-colors ${
                        idx % 2 === 0 ? "bg-white" : "bg-slate-50/30"
                      }`}
                    >
                      <td className="py-3.5 px-6">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-9 h-9 rounded-xl flex items-center justify-center font-black text-xs shrink-0 border ${
                              isFixed
                                ? "bg-blue-50 text-[#0173b6] border-blue-200/80"
                                : "bg-amber-50 text-amber-700 border-amber-200/80"
                            }`}
                          >
                            <Calendar size={16} />
                          </div>
                          <div>
                            <p className="font-bold text-slate-900 text-xs">{j.nama_jadwal}</p>
                            <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                              ID #{j.id}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        <span
                          className={`badge badge-sm font-bold text-[10px] uppercase tracking-wider ${
                            isFixed
                              ? "badge-info text-white bg-blue-600 border-blue-700"
                              : "badge-warning text-slate-900 bg-amber-400 border-amber-500"
                          }`}
                        >
                          {isFixed ? "FIXED (Tetap)" : "SHIFT (Dinamis)"}
                        </span>
                      </td>

                      <td className="py-3.5 px-6 text-slate-600">
                        <p className="font-medium text-xs leading-relaxed">
                          {j.keterangan || (isFixed ? "Jadwal tetap teratur tiap minggu" : "Jadwal shift dinamis per bulan")}
                        </p>
                      </td>

                      <td className="py-3.5 px-6 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleOpenEditModal(j)}
                            className="btn btn-xs btn-ghost text-blue-600 hover:bg-blue-50 rounded-lg p-1"
                            title="Edit Jadwal"
                          >
                            <Edit size={15} />
                          </button>
                          <button
                            onClick={() => handleDeleteWithConfirmation(j)}
                            className="btn btn-xs btn-ghost text-rose-600 hover:bg-rose-50 rounded-lg p-1"
                            title="Hapus Jadwal"
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

      {/* FORM MODAL (TAMBAH / EDIT) */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModals}
        title={selectedJadwal ? "Edit Template Jadwal Kerja" : "Tambah Template Jadwal Kerja"}
      >
        <form onSubmit={handleSubmit} className="space-y-4 p-1">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Nama Jadwal Kerja
              </label>
              <input
                type="text"
                placeholder="Contoh: Non-Shift Medis (5 Hari), Shift ICU"
                value={formData.nama_jadwal}
                onChange={(e) => setFormData({ ...formData, nama_jadwal: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50/80 border border-slate-200/90 rounded-xl text-xs font-semibold text-slate-800 focus:bg-white focus:border-[#0173b6] focus:ring-2 focus:ring-[#0173b6]/20 outline-none transition-all"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Tipe Jadwal Kerja
              </label>
              <select
                value={formData.tipe}
                onChange={(e) => setFormData({ ...formData, tipe: e.target.value })}
                className="select select-sm select-bordered w-full h-[42px] rounded-xl text-xs font-semibold bg-slate-50/80 focus:bg-white"
              >
                <option value="FIXED">FIXED (Tetap Tiap Minggu)</option>
                <option value="SHIFT">SHIFT (Dinamis / Pola Berputar)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Keterangan / Catatan
            </label>
            <input
              type="text"
              placeholder="Catatan peruntukan unit atau aturan jadwal..."
              value={formData.keterangan}
              onChange={(e) => setFormData({ ...formData, keterangan: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-slate-50/80 border border-slate-200/90 rounded-xl text-xs font-semibold text-slate-800 focus:bg-white focus:border-[#0173b6] outline-none transition-all"
            />
          </div>

          {/* Pengaturan Jam Kerja per Hari bila tipe FIXED */}
          {formData.tipe === "FIXED" && (
            <div className="mt-4 pt-4 border-t border-slate-200 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-800">
                  Pengaturan Shift Mingguan
                </span>
                <span className="text-[11px] text-slate-500">Pilih shift kerja harian atau kosongkan untuk Libur/Off</span>
              </div>

              <div className="space-y-2 bg-slate-50/80 p-3 rounded-xl border border-slate-200/80">
                {HARI_NAMES.map(({ index, name }) => {
                  const detailItem = formData.details.find((d) => d.hari === index) || {
                    hari: index,
                    shift_id: null,
                  };
                  return (
                    <div key={index} className="flex items-center gap-3">
                      <div className="w-24 shrink-0 text-xs font-bold text-slate-700">
                        {name}
                      </div>
                      <select
                        value={detailItem.shift_id || ""}
                        onChange={(e) => {
                          const val = e.target.value ? parseInt(e.target.value) : null;
                          const newDetails = formData.details.map((d) =>
                            d.hari === index ? { ...d, shift_id: val } : d
                          );
                          setFormData({ ...formData, details: newDetails });
                        }}
                        className={`select select-xs select-bordered flex-1 h-8 rounded-lg text-xs font-semibold ${
                          detailItem.shift_id ? "bg-white text-slate-800" : "bg-slate-100 text-slate-400"
                        }`}
                      >
                        <option value="">-- Libur / Off --</option>
                        {shifts.map((s) => (
                          <option key={s.id} value={s.id}>
                            {s.nama_shift} ({s.jam_masuk?.substring(0, 5)} - {s.jam_keluar?.substring(0, 5)})
                          </option>
                        ))}
                      </select>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

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
              {isSubmitting ? <Loader2 size={15} className="animate-spin" /> : "Simpan Template"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
