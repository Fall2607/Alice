"use client";

import React, { useState, useMemo, useEffect, useRef } from "react";
import Link from "next/link";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";

if (typeof window !== "undefined") {
  gsap.registerPlugin(useGSAP);
}
import {
  MOCK_KARYAWAN_KONTRAK,
  KaryawanKontrakItem,
  getNormaColorBadge,
} from "@/app/data/penilaianKinerjaData";
import FormPenilaianKinerjaView, {
  FormAssessmentData,
} from "@/app/components/admin/FormPenilaianKinerjaView";
import SearchableSelect from "@/app/components/admin/SearchableSelect";
import Pagination from "@/app/components/admin/Pagination";
import { showSuccessToast, showInfoToast } from "@/app/components/admin/Alert";
import {
  FileSignature,
  Search,
  Send,
  Mail,
  Copy,
  ExternalLink,
  CheckCircle2,
  Clock,
  X,
  Check,
  AlertTriangle,
  RotateCcw,
  Calendar,
  Layers,
  Sparkles,
  Users,
  Building2,
  FileText,
} from "lucide-react";

type FormOption = { value: string; label: string };

const LEVEL_OPTIONS: FormOption[] = [
  { value: "all", label: "Semua Level" },
  { value: "Staff", label: "Staff (Penilai: Koordinator)" },
  { value: "Koordinator", label: "Koordinator (Penilai: SPV)" },
  { value: "SPV", label: "SPV (Penilai: Direktur)" },
];

const STATUS_OPTIONS: FormOption[] = [
  { value: "all", label: "Semua Status" },
  { value: "BELUM_DIKIRIM", label: "Belum Dikirim" },
  { value: "MENUNGGU_PENILAIAN", label: "Menunggu Penilaian" },
  { value: "SELESAI", label: "Evaluasi Selesai" },
];

const URGENCY_OPTIONS: FormOption[] = [
  { value: "all", label: "Semua Sisa Waktu" },
  { value: "LE_30", label: "≤ 30 Hari (Kritis)" },
  { value: "LE_60", label: "≤ 60 Hari" },
];

const getInitials = (name: string): string => {
  if (!name) return "??";
  const parts = name.trim().split(" ").filter(Boolean);
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

export default function KontrakPegawaiPage() {
  const [karyawanList, setKaryawanList] =
    useState<readonly KaryawanKontrakItem[]>(MOCK_KARYAWAN_KONTRAK);

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedLevel, setSelectedLevel] = useState<FormOption | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<FormOption | null>(null);
  const [selectedUrgency, setSelectedUrgency] = useState<FormOption | null>(null);

  const [selectedIds, setSelectedIds] = useState<readonly string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const [activeKaryawanForm, setActiveKaryawanForm] =
    useState<KaryawanKontrakItem | null>(null);

  const [blastModalData, setBlastModalData] = useState<{
    readonly items: readonly KaryawanKontrakItem[];
    readonly isOpen: boolean;
  }>({
    items: [],
    isOpen: false,
  });

  const [copiedToken, setCopiedToken] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // GSAP: Animasi entrance halus saat halaman pertama kali dimuat
  useGSAP(
    () => {
      const tl = gsap.timeline({ defaults: { ease: "power2.out" } });

      tl.from(".kontrak-header", {
        y: -16,
        opacity: 0,
        duration: 0.45,
        clearProps: "all",
      })
        .from(
          ".kontrak-kpi-card",
          {
            y: 14,
            opacity: 0,
            duration: 0.4,
            stagger: 0.05,
            clearProps: "all",
          },
          "-=0.25"
        )
        .from(
          ".kontrak-filter",
          {
            y: 12,
            opacity: 0,
            duration: 0.35,
            clearProps: "all",
          },
          "-=0.2"
        )
        .from(
          [".kontrak-title-bar", ".kontrak-table-wrap"],
          {
            y: 16,
            opacity: 0,
            duration: 0.4,
            stagger: 0.08,
            clearProps: "all",
          },
          "-=0.2"
        );
    },
    { scope: containerRef }
  );

  // Overall Statistics for KPI Ribbon
  const stats = useMemo(() => {
    const total = karyawanList.length;
    const criticalCount = karyawanList.filter((k) => k.sisa_hari <= 30).length;
    const waitingCount = karyawanList.filter(
      (k) => k.statusPenilaian === "MENUNGGU_PENILAIAN"
    ).length;
    const doneCount = karyawanList.filter((k) => k.statusPenilaian === "SELESAI").length;
    const unassignedCount = karyawanList.filter(
      (k) => k.statusPenilaian === "BELUM_DIKIRIM"
    ).length;

    return {
      total,
      criticalCount,
      waitingCount,
      doneCount,
      unassignedCount,
    };
  }, [karyawanList]);

  // Filter dan sort dari sisa kontrak paling dekat ke paling lama (ascending)
  const sortedAndFilteredList = useMemo(() => {
    return karyawanList
      .filter((k) => {
        const term = searchTerm.toLowerCase();
        const searchMatch =
          k.nama_lengkap.toLowerCase().includes(term) ||
          k.nip.toLowerCase().includes(term) ||
          k.unit.toLowerCase().includes(term) ||
          k.jabatan.toLowerCase().includes(term) ||
          k.penilai.nama.toLowerCase().includes(term) ||
          k.penilai.jabatan.toLowerCase().includes(term);

        if (!searchMatch) return false;

        if (selectedLevel && selectedLevel.value !== "all" && k.level !== selectedLevel.value) {
          return false;
        }

        if (
          selectedStatus &&
          selectedStatus.value !== "all" &&
          k.statusPenilaian !== selectedStatus.value
        ) {
          return false;
        }

        if (selectedUrgency && selectedUrgency.value === "LE_30" && k.sisa_hari > 30) {
          return false;
        }
        if (selectedUrgency && selectedUrgency.value === "LE_60" && k.sisa_hari > 60) {
          return false;
        }

        return true;
      })
      .sort((a, b) => a.sisa_hari - b.sisa_hari);
  }, [karyawanList, searchTerm, selectedLevel, selectedStatus, selectedUrgency]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedLevel, selectedStatus, selectedUrgency]);

  const itemOffset = (currentPage - 1) * itemsPerPage;
  const currentItems = sortedAndFilteredList.slice(itemOffset, itemOffset + itemsPerPage);
  const totalPages = Math.ceil(sortedAndFilteredList.length / itemsPerPage);

  // GSAP: Animasi mikro-transisi halus untuk baris tabel saat data/halaman berganti
  useGSAP(
    () => {
      gsap.from(".kontrak-row-item", {
        y: 8,
        opacity: 0,
        duration: 0.28,
        stagger: 0.025,
        ease: "power2.out",
        clearProps: "all",
      });
    },
    { scope: containerRef, dependencies: [currentPage, currentItems] }
  );

  const handleToggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleCopyMagicLink = (token: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const url = `${window.location.origin}/penilaian-kinerja/${token}`;
    navigator.clipboard.writeText(url);
    setCopiedToken(token);
    showSuccessToast("Tautan Magic Link Penilaian berhasil disalin.");
    setTimeout(() => {
      setCopiedToken(null);
    }, 2500);
  };

  const handleOpenSingleBlast = (k: KaryawanKontrakItem) => {
    setBlastModalData({
      items: [k],
      isOpen: true,
    });
  };

  const handleOpenBulkBlast = () => {
    const selectedItems = karyawanList.filter((k) => selectedIds.includes(k.id));
    if (selectedItems.length === 0) {
      showInfoToast("Pilih minimal 1 karyawan untuk dikirimkan link evaluasi.");
      return;
    }
    setBlastModalData({
      items: selectedItems,
      isOpen: true,
    });
  };

  const handleExecuteBlast = () => {
    const idsToUpdate = blastModalData.items.map((k) => k.id);
    const nowIso = new Date().toISOString();

    setKaryawanList((prev) =>
      prev.map((k) => {
        if (idsToUpdate.includes(k.id)) {
          return {
            ...k,
            statusPenilaian: "MENUNGGU_PENILAIAN",
            tgl_kirim_link: nowIso,
          };
        }
        return k;
      })
    );

    showSuccessToast(
      `Magic link berhasil dikirimkan ke ${blastModalData.items.length} pimpinan penilai.`
    );
    setBlastModalData({ items: [], isOpen: false });
    setSelectedIds([]);
  };

  const handleSaveForm = (resultData: FormAssessmentData) => {
    if (!activeKaryawanForm) return;

    setKaryawanList((prev) =>
      prev.map((k) => {
        if (k.id === activeKaryawanForm.id) {
          return {
            ...k,
            statusPenilaian: "SELESAI",
            tgl_dinilai: new Date().toISOString(),
            hasil: {
              totalSkor: resultData.totalSkor,
              indeksPrestasi: resultData.indeksPrestasi,
              norma: resultData.norma,
              kategoriNorma: resultData.kategoriNorma,
              rekomendasi: {
                tipe: resultData.rekomendasiUtama,
                detail:
                  resultData.catatanSaran ||
                  "Penilaian kinerja telah diverifikasi resmi oleh pimpinan.",
              },
            },
          };
        }
        return k;
      })
    );

    showSuccessToast(
      `Hasil penilaian kinerja ${activeKaryawanForm.nama_lengkap} berhasil disimpan.`
    );
    setActiveKaryawanForm(null);
  };

  const hasActiveFilters = Boolean(
    searchTerm ||
      (selectedLevel && selectedLevel.value !== "all") ||
      (selectedStatus && selectedStatus.value !== "all") ||
      (selectedUrgency && selectedUrgency.value !== "all")
  );

  const handleResetFilters = () => {
    setSearchTerm("");
    setSelectedLevel(null);
    setSelectedStatus(null);
    setSelectedUrgency(null);
  };

  return (
    <div ref={containerRef} className="p-8 font-sans min-h-screen space-y-6">
      {/* 1. Header Halaman (Identik dengan Manajemen Pegawai) */}
      <div className="kontrak-header flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-2 border-b border-slate-200/80">
        <div>
          <div className="flex items-center gap-2 mb-1 text-primary font-bold uppercase tracking-wider text-xs">
            <FileSignature size={15} />
            <span>Direktori SDM &amp; Personalia</span>
          </div>
          <h1 className="text-3xl font-bold text-primary-dark tracking-tight">
            Monitoring Masa Kontrak Pegawai (PKWT)
          </h1>
          <p className="text-slate-500 font-medium text-sm mt-1 max-w-2xl">
            Daftar pegawai dengan masa kontrak yang berakhir dalam 90 hari ke depan, diurutkan dari sisa masa kontrak terdekat.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleOpenBulkBlast}
            disabled={selectedIds.length === 0}
            className={`inline-flex items-center gap-2 font-bold py-2.5 px-5 rounded-xl shadow-xs transition-all active:scale-[0.98] text-xs uppercase tracking-wider min-h-[44px] ${
              selectedIds.length > 0
                ? "bg-primary hover:bg-primary-dark text-white cursor-pointer"
                : "bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed"
            }`}
          >
            <Send size={16} />
            <span>Blast Magic Link</span>
            {selectedIds.length > 0 && (
              <span className="badge badge-sm bg-white text-[#0173b6] font-mono tabular-nums font-bold">
                {selectedIds.length}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* 2. Compact Inline KPI Ribbon */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="kontrak-kpi-card bg-white border border-slate-200/90 rounded-xl p-3.5 shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total PKWT Dimonitor</p>
            <p className="text-xl font-black text-slate-800 font-mono tabular-nums mt-0.5">
              {stats.total} <span className="text-xs font-semibold text-slate-400 font-sans">Pegawai</span>
            </p>
            <p className="text-[10px] text-slate-500 mt-0.5">Sisa ≤ 90 hari ke depan</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#0173b6] flex items-center justify-center font-bold">
            <Calendar size={20} />
          </div>
        </div>

        <div className="kontrak-kpi-card bg-white border border-slate-200/90 rounded-xl p-3.5 shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-rose-500">Kritis (≤ 30 Hari)</p>
            <p className="text-xl font-black text-rose-600 font-mono tabular-nums mt-0.5">
              {stats.criticalCount} <span className="text-xs font-semibold text-rose-400 font-sans">Pegawai</span>
            </p>
            <p className="text-[10px] text-rose-600 font-medium mt-0.5">Prioritas evaluasi mendesak</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold">
            <AlertTriangle size={20} />
          </div>
        </div>

        <div className="kontrak-kpi-card bg-white border border-slate-200/90 rounded-xl p-3.5 shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-amber-500">Menunggu Penilaian</p>
            <p className="text-xl font-black text-amber-600 font-mono tabular-nums mt-0.5">
              {stats.waitingCount} <span className="text-xs font-semibold text-amber-400 font-sans">Pegawai</span>
            </p>
            <p className="text-[10px] text-amber-700 font-medium mt-0.5">Link evaluasi telah dikirim</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
            <Clock size={20} />
          </div>
        </div>

        <div className="kontrak-kpi-card bg-white border border-slate-200/90 rounded-xl p-3.5 shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-600">Evaluasi Selesai</p>
            <p className="text-xl font-black text-emerald-600 font-mono tabular-nums mt-0.5">
              {stats.doneCount} <span className="text-xs font-semibold text-emerald-500 font-sans">Pegawai</span>
            </p>
            <p className="text-[10px] text-emerald-700 font-medium mt-0.5">Form nilai terverifikasi</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            <CheckCircle2 size={20} />
          </div>
        </div>
      </div>

      {/* 3. Filter Section (Identik dengan Manajemen Pegawai) */}
      <div className="kontrak-filter bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
            Filter &amp; Pencarian Pegawai
          </span>
          {hasActiveFilters && (
            <button
              onClick={handleResetFilters}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-primary hover:text-primary-dark transition-colors"
            >
              <RotateCcw size={13} />
              <span>Reset Filter</span>
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* Input Search NIP / Nama */}
          <div className="relative lg:col-span-2">
            <input
              type="text"
              placeholder="Cari NIP, nama pegawai, unit kerja, atau atasan..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-8 py-2.5 bg-slate-50/80 border border-slate-200/90 rounded-xl text-xs font-semibold text-slate-800 focus:bg-white focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
            />
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              size={15}
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* Filter Level */}
          <div>
            <SearchableSelect
              options={LEVEL_OPTIONS}
              value={selectedLevel}
              onChange={(val) => setSelectedLevel(val as FormOption | null)}
              placeholder="Semua Level"
            />
          </div>

          {/* Filter Status */}
          <div>
            <SearchableSelect
              options={STATUS_OPTIONS}
              value={selectedStatus}
              onChange={(val) => setSelectedStatus(val as FormOption | null)}
              placeholder="Semua Status"
            />
          </div>

          {/* Filter Sisa Waktu */}
          <div>
            <SearchableSelect
              options={URGENCY_OPTIONS}
              value={selectedUrgency}
              onChange={(val) => setSelectedUrgency(val as FormOption | null)}
              placeholder="Semua Sisa Waktu"
            />
          </div>
        </div>
      </div>



      {/* 4. Baris Judul Tabel (Identik dengan Manajemen Pegawai) */}
      <div className="kontrak-title-bar flex items-center justify-between">
        <h2 className="text-xl font-bold text-primary-dark">
          Daftar Kontrak Pegawai
        </h2>
        <span className="text-xs font-semibold text-slate-500">
          Total <strong className="font-mono tabular-nums text-slate-800">{sortedAndFilteredList.length}</strong> pegawai
        </span>
      </div>

      {/* 5. Tabel Utama Eksekutif (Identik dengan Manajemen Pegawai) */}
      <div className="kontrak-table-wrap overflow-hidden rounded-2xl border border-slate-200/80 shadow-xs bg-white">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs whitespace-nowrap">
            <thead className="text-xs text-white uppercase bg-primary-dark font-semibold">
              <tr>
                <th scope="col" className="px-6 py-3.5 w-12 text-center text-white">
                  <input
                    type="checkbox"
                    checked={
                      currentItems.length > 0 &&
                      currentItems.every((k) => selectedIds.includes(k.id))
                    }
                    onChange={(e) => {
                      if (e.target.checked) {
                        const newIds = Array.from(
                          new Set([...selectedIds, ...currentItems.map((k) => k.id)])
                        );
                        setSelectedIds(newIds);
                      } else {
                        setSelectedIds(
                          selectedIds.filter((id) => !currentItems.some((k) => k.id === id))
                        );
                      }
                    }}
                    className="checkbox checkbox-primary checkbox-sm rounded-md border-white/40"
                  />
                </th>
                <th scope="col" className="px-6 py-3.5 text-white">Nama Pegawai</th>
                <th scope="col" className="px-6 py-3.5 text-white">Level &amp; Jabatan</th>
                <th scope="col" className="px-6 py-3.5 text-white">Sisa Masa Kontrak</th>
                <th scope="col" className="px-6 py-3.5 text-white">Atasan Penilai</th>
                <th scope="col" className="px-6 py-3.5 text-center text-white">Status Evaluasi</th>
                <th scope="col" className="px-6 py-3.5 text-center text-white">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {currentItems.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-16 text-slate-400 space-y-2">
                    <FileText size={36} className="mx-auto text-slate-300" />
                    <p className="font-bold text-slate-700">Tidak ada data pegawai yang sesuai</p>
                    <p className="text-xs text-slate-400">
                      Ubah kata kunci pencarian atau sesuaikan filter di atas.
                    </p>
                  </td>
                </tr>
              ) : (
                currentItems.map((employee) => {
                  const isSelected = selectedIds.includes(employee.id);
                  const isUrgent = employee.sisa_hari <= 30;
                  const initials = getInitials(employee.nama_lengkap);

                  return (
                    <tr
                      key={employee.id}
                      className={`kontrak-row-item hover:bg-slate-50/80 transition-colors border-b border-slate-100 last:border-b-0 ${
                        isSelected ? "bg-blue-50/70" : ""
                      }`}
                    >
                      {/* Checkbox */}
                      <td className="px-6 py-4 text-center">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleToggleSelect(employee.id)}
                          className="checkbox checkbox-primary checkbox-sm rounded-md"
                        />
                      </td>

                      {/* Kolom Pegawai (Avatar Inisial + Nama + NIP) */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-blue-50 text-primary font-bold text-xs border border-blue-200/60 flex items-center justify-center shrink-0 shadow-xs">
                            {initials}
                          </div>
                          <div className="min-w-0">
                            <p className="font-bold text-slate-900 text-sm leading-snug">
                              {employee.gelar_depan ? `${employee.gelar_depan} ` : ""}
                              {employee.nama_lengkap}
                              {employee.gelar_belakang ? `, ${employee.gelar_belakang}` : ""}
                            </p>
                            <p className="text-xs font-mono tabular-nums text-slate-500 mt-0.5">
                              NIP: {employee.nip} &bull; {employee.unit}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Level & Jabatan */}
                      <td className="px-6 py-4">
                        <p className="font-semibold text-slate-800">{employee.jabatan}</p>
                        <div className="flex items-center gap-1.5 mt-1">
                          <span
                            className={`badge badge-sm font-bold uppercase text-[9px] ${
                              employee.level === "SPV"
                                ? "bg-purple-100 text-purple-800 border-purple-200"
                                : employee.level === "Koordinator"
                                ? "bg-indigo-100 text-indigo-800 border-indigo-200"
                                : "bg-blue-100 text-[#0173b6] border-blue-200"
                            }`}
                          >
                            {employee.level}
                          </span>
                          {employee.hasSubordinates && (
                            <span className="badge badge-warning badge-xs font-semibold text-[9px]">
                              + Manajerial
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Sisa Masa Kontrak */}
                      <td className="px-6 py-4 font-mono tabular-nums">
                        <div className="flex items-center gap-2">
                          {isUrgent ? (
                            <span className="badge badge-error badge-sm text-white font-black font-mono tabular-nums shadow-2xs gap-1">
                              <AlertTriangle size={11} />
                              {employee.sisa_hari} Hari Lagi
                            </span>
                          ) : employee.sisa_hari <= 60 ? (
                            <span className="badge badge-warning badge-sm text-slate-900 font-bold font-mono tabular-nums shadow-2xs">
                              {employee.sisa_hari} Hari Lagi
                            </span>
                          ) : (
                            <span className="badge badge-ghost badge-sm text-slate-700 font-bold font-mono tabular-nums">
                              {employee.sisa_hari} Hari Lagi
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-500 font-mono tabular-nums mt-1">
                          s/d {employee.tgl_selesai_kontrak}
                        </p>
                      </td>

                      {/* Atasan Penilai */}
                      <td className="px-6 py-4">
                        <p className="font-semibold text-slate-800">{employee.penilai.nama}</p>
                        <p className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                          <Mail size={11} className="text-slate-400" />
                          <span>{employee.penilai.jabatan}</span>
                        </p>
                      </td>

                      {/* Status Penilaian */}
                      <td className="px-6 py-4 text-center">
                        {employee.statusPenilaian === "SELESAI" && employee.hasil ? (
                          <div className="inline-flex flex-col items-center gap-1">
                            <span
                              className={`badge badge-sm font-bold text-white shadow-2xs ${
                                employee.hasil.kategoriNorma === "EXCELENT"
                                  ? "badge-success"
                                  : employee.hasil.kategoriNorma === "BAIK"
                                  ? "badge-info"
                                  : employee.hasil.kategoriNorma === "CUKUP"
                                  ? "badge-warning text-slate-900"
                                  : "badge-error"
                              }`}
                            >
                              Norma {employee.hasil.norma.toFixed(2)} ({employee.hasil.kategoriNorma})
                            </span>
                            <span className="text-[10px] text-slate-500 font-medium font-mono tabular-nums">
                              Rekomendasi: <strong>{employee.hasil.rekomendasi.tipe}</strong>
                            </span>
                          </div>
                        ) : employee.statusPenilaian === "MENUNGGU_PENILAIAN" ? (
                          <span className="badge badge-warning badge-sm text-slate-900 font-bold gap-1 shadow-2xs">
                            <Clock size={12} className="animate-spin" />
                            Menunggu Penilaian
                          </span>
                        ) : (
                          <span className="badge badge-ghost badge-sm text-slate-500 font-bold">
                            Belum Dikirim
                          </span>
                        )}
                      </td>

                      {/* Aksi */}
                      <td className="px-6 py-4 text-center">
                        <div className="inline-flex items-center justify-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => setActiveKaryawanForm(employee)}
                            className="btn btn-primary btn-xs gap-1 font-bold uppercase tracking-wider rounded-lg shadow-2xs active:scale-[0.98]"
                            title="Buka Form Penilaian Kinerja"
                          >
                            <FileSignature size={13} />
                            <span>Form Nilai</span>
                          </button>

                          <div className="tooltip tooltip-top" data-tip="Kirim Link ke Penilai">
                            <button
                              type="button"
                              onClick={() => handleOpenSingleBlast(employee)}
                              className="p-1.5 rounded-lg text-emerald-600 hover:bg-emerald-50 transition-colors"
                            >
                              <Mail size={16} />
                            </button>
                          </div>

                          <div className="tooltip tooltip-top" data-tip="Salin Magic Link">
                            <button
                              type="button"
                              onClick={(e) => handleCopyMagicLink(employee.magicLinkToken, e)}
                              className={`p-1.5 rounded-lg transition-colors ${
                                copiedToken === employee.magicLinkToken
                                  ? "text-emerald-600 bg-emerald-50"
                                  : "text-slate-500 hover:text-primary hover:bg-slate-50"
                              }`}
                            >
                              {copiedToken === employee.magicLinkToken ? (
                                <Check size={16} />
                              ) : (
                                <Copy size={16} />
                              )}
                            </button>
                          </div>

                          <div className="tooltip tooltip-top" data-tip="Buka di Tab Baru">
                            <Link
                              href={`/penilaian-kinerja/${employee.magicLinkToken}`}
                              target="_blank"
                              className="p-1.5 rounded-lg text-blue-600 hover:text-blue-800 hover:bg-blue-50 transition-colors"
                            >
                              <ExternalLink size={16} />
                            </Link>
                          </div>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Identik dengan Halaman Manajemen Pegawai */}
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      </div>

      {/* ================= MODAL BLAST EMAIL MAGIC LINK ================= */}
      {blastModalData.isOpen && blastModalData.items.length > 0 && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
            {/* Header Modal */}
            <div className="px-5 py-4 bg-primary-dark text-white flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2.5">
                <Send size={18} className="text-cyan-300" />
                <h3 className="font-bold text-sm">
                  Pengiriman Magic Link Evaluasi Kinerja
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setBlastModalData({ items: [], isOpen: false })}
                className="text-slate-300 hover:text-white p-1"
              >
                <X size={18} />
              </button>
            </div>

            {/* Email Preview Body */}
            <div className="p-5 overflow-y-auto space-y-4 text-xs">
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-1.5 text-slate-600 font-medium">
                <div>
                  <span className="text-slate-400 w-16 inline-block">Pengirim:</span>
                  <span className="font-semibold text-slate-800">
                    Human Capital RSU Avisena &lt;hrd@avisena.co.id&gt;
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 w-16 inline-block">Penerima:</span>
                  <span className="font-semibold text-slate-800">
                    {blastModalData.items.map((it) => it.penilai.email).join(", ")}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 w-16 inline-block">Perihal:</span>
                  <span className="font-semibold text-primary">
                    [RSU Avisena] Permohonan Penilaian Kinerja Karyawan Habis Kontrak
                  </span>
                </div>
              </div>

              <div className="border border-slate-200 rounded-xl p-4 bg-white space-y-3 text-slate-700 leading-relaxed">
                <p>
                  Yth.{" "}
                  <strong>
                    {blastModalData.items.length === 1
                      ? `${blastModalData.items[0].penilai.nama}`
                      : "Bapak / Ibu Pimpinan Penilai"}
                  </strong>
                  ,
                </p>
                <p>
                  Sehubungan dengan akan berakhirnya masa perjanjian kerja pegawai di unit Anda, kami
                  memohon kesediaan Bapak/Ibu untuk mengisi formulir evaluasi kinerja resmi RSU Avisena.
                </p>

                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-1.5">
                  <p className="font-bold text-slate-800">Daftar Pegawai yang Perlu Dinilai:</p>
                  <ul className="list-disc list-inside space-y-1 text-slate-600">
                    {blastModalData.items.map((it) => (
                      <li key={it.id}>
                        <strong>{it.nama_lengkap}</strong> ({it.jabatan} - {it.unit}) &mdash; Sisa:{" "}
                        <span className="text-rose-600 font-bold font-mono tabular-nums">
                          {it.sisa_hari} hari
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>

                <p className="text-slate-500 text-[11px] pt-2 border-t border-slate-100">
                  Tautan evaluasi bersifat rahasia dan dapat diakses langsung oleh atasan tanpa kata sandi melalui Magic Link.
                </p>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-2.5 shrink-0">
              <button
                type="button"
                onClick={() => setBlastModalData({ items: [], isOpen: false })}
                className="px-4 py-2 text-slate-600 hover:text-slate-800 text-xs font-semibold rounded-xl"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleExecuteBlast}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-primary hover:bg-primary-dark text-white text-xs font-bold rounded-xl shadow-xs transition-colors"
              >
                <Send size={14} />
                <span>Kirimkan Sekarang</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL FULL FORM PENILAIAN KINERJA ================= */}
      {activeKaryawanForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl w-full max-w-6xl h-[94vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
            {/* Modal Header */}
            <div className="px-5 py-3.5 bg-primary-dark text-white flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2.5">
                <FileSignature size={18} className="text-white" />
                <div>
                  <h2 className="text-sm font-bold truncate">
                    Evaluasi Kinerja: {activeKaryawanForm.nama_lengkap}
                  </h2>
                  <p className="text-[11px] text-slate-300">
                    {activeKaryawanForm.jabatan} &bull; Penilai:{" "}
                    <span className="text-white font-semibold">
                      {activeKaryawanForm.penilai.nama}
                    </span>
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setActiveKaryawanForm(null)}
                className="text-slate-300 hover:text-white p-1"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Content */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-50">
              <FormPenilaianKinerjaView
                karyawan={activeKaryawanForm}
                onSave={handleSaveForm}
                onCancel={() => setActiveKaryawanForm(null)}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
