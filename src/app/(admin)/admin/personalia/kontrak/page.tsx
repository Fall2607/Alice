"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import {
  MOCK_KARYAWAN_KONTRAK,
  KaryawanKontrakItem,
  getNormaColorBadge,
} from "@/app/data/penilaianKinerjaData";
import FormPenilaianKinerjaView from "@/app/components/admin/FormPenilaianKinerjaView";
import { showSuccessToast, showInfoToast } from "@/app/components/admin/Alert";
import {
  FileSignature,
  Search,
  Filter,
  Send,
  Mail,
  Copy,
  ExternalLink,
  CheckCircle2,
  Clock,
  AlertTriangle,
  UserCheck,
  ChevronRight,
  ShieldCheck,
  Eye,
  Calendar,
  Building2,
  Briefcase,
  X,
  Sparkles,
  Layers,
  ArrowRight,
  Users,
  Check,
} from "lucide-react";

export default function KontrakPegawaiPage() {
  // State data karyawan kontrak (bisa diupdate interaktif pada sesi ini)
  const [karyawanList, setKaryawanList] = useState<KaryawanKontrakItem[]>(MOCK_KARYAWAN_KONTRAK);

  // Filter & Search
  const [searchTerm, setSearchTerm] = useState("");
  const [filterLevel, setFilterLevel] = useState<string>("ALL");
  const [filterStatus, setFilterStatus] = useState<string>("ALL");
  const [filterUrgency, setFilterUrgency] = useState<string>("ALL");

  // Selection untuk blast massal
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Modal State
  const [activeKaryawanForm, setActiveKaryawanForm] = useState<KaryawanKontrakItem | null>(null);
  const [blastModalData, setBlastModalData] = useState<{
    items: KaryawanKontrakItem[];
    isOpen: boolean;
  }>({
    items: [],
    isOpen: false,
  });

  // State copy feedback
  const [copiedToken, setCopiedToken] = useState<string | null>(null);

  // Perhitungan ringkasan statistik
  const stats = useMemo(() => {
    const total = karyawanList.length;
    const urgent = karyawanList.filter((k) => k.sisa_hari <= 30).length;
    const menunggu = karyawanList.filter((k) => k.statusPenilaian === "MENUNGGU_PENILAIAN").length;
    const selesai = karyawanList.filter((k) => k.statusPenilaian === "SELESAI").length;
    const belum = karyawanList.filter((k) => k.statusPenilaian === "BELUM_DIKIRIM").length;

    return { total, urgent, menunggu, selesai, belum };
  }, [karyawanList]);

  // Filter data karyawan
  const filteredList = useMemo(() => {
    return karyawanList.filter((k) => {
      // Search
      const searchMatch =
        k.nama_lengkap.toLowerCase().includes(searchTerm.toLowerCase()) ||
        k.nip.toLowerCase().includes(searchTerm.toLowerCase()) ||
        k.unit.toLowerCase().includes(searchTerm.toLowerCase()) ||
        k.jabatan.toLowerCase().includes(searchTerm.toLowerCase()) ||
        k.penilai.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
        k.penilai.jabatan.toLowerCase().includes(searchTerm.toLowerCase());

      if (!searchMatch) return false;

      // Filter Level
      if (filterLevel !== "ALL" && k.level !== filterLevel) return false;

      // Filter Status
      if (filterStatus !== "ALL" && k.statusPenilaian !== filterStatus) return false;

      // Filter Urgensi
      if (filterUrgency === "LE_30" && k.sisa_hari > 30) return false;
      if (filterUrgency === "LE_60" && k.sisa_hari > 60) return false;

      return true;
    });
  }, [karyawanList, searchTerm, filterLevel, filterStatus, filterUrgency]);

  // Handler Select All
  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds(filteredList.map((k) => k.id));
    } else {
      setSelectedIds([]);
    }
  };

  // Handler Select Single
  const handleToggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // Salin Magic Link ke Clipboard
  const handleCopyMagicLink = (token: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const url = `${window.location.origin}/penilaian-kinerja/${token}`;
    navigator.clipboard.writeText(url);
    setCopiedToken(token);
    showSuccessToast("Tautan Magic Link Penilaian berhasil disalin!");
    setTimeout(() => {
      setCopiedToken(null);
    }, 2500);
  };

  // Trigger Blast Modal untuk 1 orang
  const handleOpenSingleBlast = (k: KaryawanKontrakItem) => {
    setBlastModalData({
      items: [k],
      isOpen: true,
    });
  };

  // Trigger Blast Modal untuk multiple terpilih
  const handleOpenBulkBlast = () => {
    const selectedItems = karyawanList.filter((k) => selectedIds.includes(k.id));
    if (selectedItems.length === 0) {
      showInfoToast("Pilih minimal 1 karyawan untuk dikirimkan link penilaian.");
      return;
    }
    setBlastModalData({
      items: selectedItems,
      isOpen: true,
    });
  };

  // Eksekusi Blast Email (Simulasi Frontend)
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
      `Berhasil melakukan blast Magic Link ke ${blastModalData.items.length} pimpinan penilai!`
    );
    setBlastModalData({ items: [], isOpen: false });
    setSelectedIds([]);
  };

  // Callback saat form penilaian disimpan dari modal
  const handleSaveForm = (resultData: any) => {
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
                detail: resultData.catatanSaran || "Penilaian telah diverifikasi pimpinan.",
              },
            },
          };
        }
        return k;
      })
    );

    showSuccessToast(
      `Hasil penilaian kinerja ${activeKaryawanForm.nama_lengkap} berhasil disimpan!`
    );
    setActiveKaryawanForm(null);
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Header Halaman */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-gradient-to-r from-slate-900 via-[#014e7a] to-[#0173b6] p-6 lg:p-8 rounded-2xl text-white shadow-xl shadow-blue-950/10">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-cyan-200 text-xs font-bold uppercase tracking-wider backdrop-blur-md mb-3 border border-white/15">
            <Sparkles size={14} className="text-cyan-300" />
            Personalia &bullet; Evaluasi Masa Kontrak
          </div>
          <h1 className="text-2xl lg:text-3xl font-black tracking-tight text-white">
            Monitoring Habis Kontrak & Blast Penilaian
          </h1>
          <p className="text-sm font-medium text-slate-200 mt-2 max-w-2xl leading-relaxed">
            Daftar karyawan yang akan mengakhiri masa kontrak dalam 3 bulan ke depan. Kirimkan email
            magic link ke pimpinan langsung (Staff &rarr; Koordinator, Koordinator &rarr; SPV, SPV
            &rarr; Direktur) untuk pengisian formulir evaluasi resmi RSU Avisena.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={handleOpenBulkBlast}
            disabled={selectedIds.length === 0}
            className={`flex items-center gap-2.5 px-5 py-3 rounded-xl font-bold text-sm shadow-lg transition-all ${
              selectedIds.length > 0
                ? "bg-emerald-500 hover:bg-emerald-400 text-white shadow-emerald-600/30 active:scale-95"
                : "bg-white/10 text-slate-300 border border-white/10 cursor-not-allowed opacity-60"
            }`}
          >
            <Send size={16} />
            <span>Blast Link Terpilih ({selectedIds.length})</span>
          </button>
        </div>
      </div>

      {/* Metric Cards Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Total Kontrak <= 3 Bulan */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Habis &le; 3 Bulan
            </span>
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-[#0173b6] flex items-center justify-center font-black">
              <Users size={18} />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl lg:text-3xl font-black text-slate-800">{stats.total}</span>
            <span className="text-xs font-semibold text-slate-400">Pegawai</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Seluruh unit kerja RSU Avisena</p>
        </div>

        {/* Urgensi Tinggi <= 30 Hari */}
        <div className="bg-white p-5 rounded-2xl border border-rose-200/80 bg-gradient-to-br from-white to-rose-50/30 shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-rose-600 uppercase tracking-wider">
              Kritis (&le; 30 Hari)
            </span>
            <div className="w-9 h-9 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center font-black">
              <AlertTriangle size={18} />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl lg:text-3xl font-black text-rose-600">{stats.urgent}</span>
            <span className="text-xs font-semibold text-rose-400">Harus Segera Dinilai</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Perlu prioritas blast pimpinan</p>
        </div>

        {/* Menunggu Penilaian */}
        <div className="bg-white p-5 rounded-2xl border border-amber-200/80 bg-gradient-to-br from-white to-amber-50/30 shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-600 uppercase tracking-wider">
              Menunggu Pimpinan
            </span>
            <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-black">
              <Clock size={18} />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl lg:text-3xl font-black text-amber-600">{stats.menunggu}</span>
            <span className="text-xs font-semibold text-amber-500">Link Aktif</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Email magic link telah terkirim</p>
        </div>

        {/* Selesai Dinilai */}
        <div className="bg-white p-5 rounded-2xl border border-emerald-200/80 bg-gradient-to-br from-white to-emerald-50/30 shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider">
              Evaluasi Selesai
            </span>
            <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-black">
              <CheckCircle2 size={18} />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl lg:text-3xl font-black text-emerald-600">{stats.selesai}</span>
            <span className="text-xs font-semibold text-emerald-500">Rekomendasi Siap</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Siap diproses SK Perpanjangan/Tetap</p>
        </div>
      </div>

      {/* Hierarki Penilaian Info Banner */}
      <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs text-slate-600 font-medium">
        <div className="flex items-center gap-2 text-slate-800 font-bold">
          <Layers size={16} className="text-[#0173b6]" />
          <span>Aturan Hierarki Penilai Otomatis:</span>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white border border-slate-200 text-slate-700">
            <span className="w-2 h-2 rounded-full bg-blue-500"></span>
            <b>Staff</b> &rarr; dinilai <b>Koordinator</b>
          </span>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white border border-slate-200 text-slate-700">
            <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
            <b>Koordinator</b> &rarr; dinilai <b>SPV</b>
          </span>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white border border-slate-200 text-slate-700">
            <span className="w-2 h-2 rounded-full bg-purple-500"></span>
            <b>SPV</b> &rarr; dinilai <b>Direktur</b>
          </span>
        </div>
      </div>

      {/* Toolbar Filter & Search */}
      <div className="bg-white p-4 lg:p-5 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col lg:flex-row gap-4 items-stretch lg:items-center justify-between">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Cari nama karyawan, NIP, unit, atau penilai..."
            className="w-full bg-slate-50 border border-slate-200 text-slate-800 py-2.5 pl-10 pr-4 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#0173b6]/20 focus:border-[#0173b6] transition-all"
          />
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X size={14} />
            </button>
          )}
        </div>

        {/* Dropdown Filters */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Level Filter */}
          <div className="relative">
            <select
              value={filterLevel}
              onChange={(e) => setFilterLevel(e.target.value)}
              className="bg-slate-50 border border-slate-200 text-slate-700 text-xs font-bold py-2.5 px-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0173b6]/20"
            >
              <option value="ALL">Semua Level</option>
              <option value="Staff">Level Staff (dinilai Koordinator)</option>
              <option value="Koordinator">Level Koordinator (dinilai SPV)</option>
              <option value="SPV">Level SPV (dinilai Direktur)</option>
            </select>
          </div>

          {/* Status Penilaian Filter */}
          <div className="relative">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="bg-slate-50 border border-slate-200 text-slate-700 text-xs font-bold py-2.5 px-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0173b6]/20"
            >
              <option value="ALL">Semua Status</option>
              <option value="BELUM_DIKIRIM">Belum Dikirim</option>
              <option value="MENUNGGU_PENILAIAN">Menunggu Penilaian</option>
              <option value="SELESAI">Selesai</option>
            </select>
          </div>

          {/* Sisa Waktu Filter */}
          <div className="relative">
            <select
              value={filterUrgency}
              onChange={(e) => setFilterUrgency(e.target.value)}
              className="bg-slate-50 border border-slate-200 text-slate-700 text-xs font-bold py-2.5 px-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0173b6]/20"
            >
              <option value="ALL">Semua Sisa Waktu</option>
              <option value="LE_30">&le; 30 Hari (Kritis)</option>
              <option value="LE_60">&le; 60 Hari</option>
            </select>
          </div>

          {(searchTerm || filterLevel !== "ALL" || filterStatus !== "ALL" || filterUrgency !== "ALL") && (
            <button
              onClick={() => {
                setSearchTerm("");
                setFilterLevel("ALL");
                setFilterStatus("ALL");
                setFilterUrgency("ALL");
              }}
              className="text-xs text-rose-600 hover:text-rose-700 font-bold px-2.5 py-2 hover:bg-rose-50 rounded-lg transition-colors"
            >
              Reset
            </button>
          )}
        </div>
      </div>

      {/* Tabel Karyawan Kontrak */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200/80 text-[11px] font-black uppercase tracking-wider text-slate-500">
                <th className="py-4 px-4 w-12 text-center">
                  <input
                    type="checkbox"
                    checked={
                      filteredList.length > 0 && selectedIds.length === filteredList.length
                    }
                    onChange={handleSelectAll}
                    className="w-4 h-4 rounded text-[#0173b6] focus:ring-[#0173b6] border-slate-300 cursor-pointer"
                  />
                </th>
                <th className="py-4 px-4">Karyawan / Pegawai</th>
                <th className="py-4 px-4">Level & Jabatan</th>
                <th className="py-4 px-4">Sisa Masa Kontrak</th>
                <th className="py-4 px-4">Pimpinan Penilai</th>
                <th className="py-4 px-4 text-center">Status Evaluasi</th>
                <th className="py-4 px-4 text-right">Aksi Penilaian</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {filteredList.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <FileSignature size={36} className="mx-auto mb-2 text-slate-300" />
                    <p className="font-bold text-slate-600">Tidak ada data karyawan yang cocok</p>
                    <p className="text-xs text-slate-400 mt-1">Coba sesuaikan kata kunci atau filter Anda</p>
                  </td>
                </tr>
              ) : (
                filteredList.map((k) => {
                  const isSelected = selectedIds.includes(k.id);
                  const isUrgent = k.sisa_hari <= 30;

                  return (
                    <tr
                      key={k.id}
                      className={`hover:bg-slate-50/70 transition-colors ${
                        isSelected ? "bg-blue-50/40" : ""
                      }`}
                    >
                      {/* Checkbox */}
                      <td className="py-4 px-4 text-center">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleToggleSelect(k.id)}
                          className="w-4 h-4 rounded text-[#0173b6] focus:ring-[#0173b6] border-slate-300 cursor-pointer"
                        />
                      </td>

                      {/* Info Karyawan */}
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#0173b6]/10 to-cyan-500/10 text-[#0173b6] font-black flex items-center justify-center shrink-0 border border-[#0173b6]/20">
                            {k.nama_lengkap.charAt(0)}
                          </div>
                          <div>
                            <div className="font-bold text-slate-900 hover:text-[#0173b6] cursor-pointer">
                              {k.gelar_depan ? `${k.gelar_depan} ` : ""}
                              {k.nama_lengkap}
                              {k.gelar_belakang ? `, ${k.gelar_belakang}` : ""}
                            </div>
                            <div className="text-xs text-slate-400 flex items-center gap-1.5 mt-0.5">
                              <span className="font-mono text-slate-500">{k.nip}</span>
                              <span>&bull;</span>
                              <span>{k.unit}</span>
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Level & Jabatan */}
                      <td className="py-4 px-4">
                        <div>
                          <span
                            className={`inline-block text-[11px] font-black px-2.5 py-0.5 rounded-full border mb-1 ${
                              k.level === "SPV"
                                ? "bg-purple-100 text-purple-800 border-purple-200"
                                : k.level === "Koordinator"
                                ? "bg-indigo-100 text-indigo-800 border-indigo-200"
                                : "bg-blue-100 text-blue-800 border-blue-200"
                            }`}
                          >
                            {k.level}
                          </span>
                          <p className="text-xs font-semibold text-slate-700 leading-tight">
                            {k.jabatan}
                          </p>
                          {k.hasSubordinates && (
                            <span className="inline-block text-[10px] text-amber-700 font-bold bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200 mt-1">
                              + Aspek Managerial
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Sisa Masa Kontrak */}
                      <td className="py-4 px-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-1.5">
                            <span
                              className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-black border ${
                                isUrgent
                                  ? "bg-rose-100 text-rose-700 border-rose-300 animate-pulse"
                                  : "bg-slate-100 text-slate-700 border-slate-200"
                              }`}
                            >
                              <Clock size={12} />
                              {k.sisa_hari} Hari Lagi
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-400">
                            Berakhir:{" "}
                            <span className="font-bold text-slate-600">
                              {k.tgl_selesai_kontrak}
                            </span>
                          </p>
                        </div>
                      </td>

                      {/* Pimpinan Penilai (Hierarki) */}
                      <td className="py-4 px-4">
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                            <span className="text-xs font-bold text-slate-900">
                              {k.penilai.nama}
                            </span>
                          </div>
                          <p className="text-[11px] font-medium text-slate-500">
                            {k.penilai.jabatan}
                          </p>
                          <p className="text-[11px] font-mono text-slate-400">{k.penilai.email}</p>
                        </div>
                      </td>

                      {/* Status Evaluasi */}
                      <td className="py-4 px-4 text-center">
                        {k.statusPenilaian === "SELESAI" && k.hasil ? (
                          <div className="inline-flex flex-col items-center">
                            <span
                              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-black border ${getNormaColorBadge(
                                k.hasil.kategoriNorma
                              )}`}
                            >
                              <CheckCircle2 size={13} />
                              Selesai: {k.hasil.norma.toFixed(2)} ({k.hasil.kategoriNorma})
                            </span>
                            <span className="text-[10px] text-slate-500 font-semibold mt-1">
                              Rekomendasi: {k.hasil.rekomendasi.tipe}
                            </span>
                          </div>
                        ) : k.statusPenilaian === "MENUNGGU_PENILAIAN" ? (
                          <div className="inline-flex flex-col items-center">
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-300">
                              <Clock size={13} className="text-amber-600" />
                              Menunggu Pimpinan
                            </span>
                            <span className="text-[10px] text-slate-400 mt-1">Link Terkirim</span>
                          </div>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-600 border border-slate-200">
                            Belum Dikirim
                          </span>
                        )}
                      </td>

                      {/* Aksi */}
                      <td className="py-4 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Tombol Buka Form Penilaian (Modal Direct Testing) */}
                          <button
                            onClick={() => setActiveKaryawanForm(k)}
                            className="inline-flex items-center gap-1 px-3 py-1.5 bg-[#0173b6] hover:bg-[#015d94] text-white rounded-lg text-xs font-bold shadow-sm transition-all"
                            title="Buka Form Penilaian Kinerja Karyawan"
                          >
                            <FileSignature size={13} />
                            <span>Form Nilai</span>
                          </button>

                          {/* Tombol Blast Email Modal */}
                          <button
                            onClick={() => handleOpenSingleBlast(k)}
                            className="p-1.5 text-slate-600 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors border border-slate-200"
                            title="Pratinjau & Kirim Blast Email ke Pimpinan"
                          >
                            <Mail size={15} />
                          </button>

                          {/* Tombol Copy Magic Link */}
                          <button
                            onClick={(e) => handleCopyMagicLink(k.magicLinkToken, e)}
                            className={`p-1.5 rounded-lg transition-colors border ${
                              copiedToken === k.magicLinkToken
                                ? "bg-emerald-50 text-emerald-600 border-emerald-300"
                                : "text-slate-600 hover:text-[#0173b6] hover:bg-blue-50 border-slate-200"
                            }`}
                            title="Salin Magic Link Penilaian"
                          >
                            {copiedToken === k.magicLinkToken ? (
                              <Check size={15} />
                            ) : (
                              <Copy size={15} />
                            )}
                          </button>

                          {/* Tombol Buka di Tab Baru (Halaman Publik Magic Link) */}
                          <Link
                            href={`/penilaian-kinerja/${k.magicLinkToken}`}
                            target="_blank"
                            className="p-1.5 text-slate-600 hover:text-[#0173b6] hover:bg-blue-50 rounded-lg transition-colors border border-slate-200"
                            title="Buka Halaman Magic Link di Tab Baru"
                          >
                            <ExternalLink size={15} />
                          </Link>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Footer info */}
        <div className="p-4 border-t border-slate-200 bg-slate-50/50 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-2">
          <div>
            Menampilkan <span className="font-bold text-slate-700">{filteredList.length}</span> dari{" "}
            <span className="font-bold text-slate-700">{karyawanList.length}</span> karyawan habis
            kontrak (&le; 3 bulan)
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-block w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
            <span>Simulasi Mode Frontend Aktif (Siap Ditest Manual)</span>
          </div>
        </div>
      </div>

      {/* ================= MODAL BLAST EMAIL MAGIC LINK ================= */}
      {blastModalData.isOpen && blastModalData.items.length > 0 && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-100 overflow-hidden">
            {/* Header Modal */}
            <div className="p-5 bg-gradient-to-r from-slate-900 to-[#0173b6] text-white flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                  <Send size={20} className="text-cyan-300" />
                </div>
                <div>
                  <h3 className="font-black text-lg leading-tight">
                    Blast Email Otorisasi Magic Link
                  </h3>
                  <p className="text-xs text-slate-200 mt-0.5">
                    Mengirimkan undangan evaluasi kepada {blastModalData.items.length} pimpinan
                    penilai
                  </p>
                </div>
              </div>
              <button
                onClick={() => setBlastModalData({ items: [], isOpen: false })}
                className="p-2 text-white/70 hover:text-white rounded-lg hover:bg-white/10"
              >
                <X size={20} />
              </button>
            </div>

            {/* Email Preview Body */}
            <div className="p-6 overflow-y-auto space-y-5 text-sm">
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs space-y-1.5 font-medium text-slate-600">
                <div className="flex items-center gap-2">
                  <span className="text-slate-400 w-16">Pengirim:</span>
                  <span className="font-bold text-slate-800">
                    HRD RSU Avisena &lt;hrd@avisena.co.id&gt;
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-slate-400 w-16">Penerima:</span>
                  <span className="font-bold text-slate-800">
                    {blastModalData.items.map((it) => it.penilai.email).join(", ")}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-slate-400 w-16">Perihal:</span>
                  <span className="font-bold text-[#0173b6]">
                    [RSU Avisena] Permohonan Penilaian Kinerja Karyawan Habis Masa Kontrak
                  </span>
                </div>
              </div>

              {/* Template Email Preview Box */}
              <div className="border border-slate-200 rounded-xl p-6 bg-white space-y-4 shadow-inner">
                <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-400 tracking-wider uppercase">
                    Pratinjau Konten Email Pimpinan
                  </span>
                  <span className="text-[10px] font-mono text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    Magic Link Secured
                  </span>
                </div>

                <div className="text-slate-700 space-y-3 leading-relaxed text-xs">
                  <p>
                    Kepada Yth.{" "}
                    <b>
                      {blastModalData.items.length === 1
                        ? `${blastModalData.items[0].penilai.nama} (${blastModalData.items[0].penilai.jabatan})`
                        : "Bapak / Ibu Pimpinan Penilai"}
                    </b>
                    ,
                  </p>
                  <p>
                    Sehubungan dengan akan berakhirnya masa perjanjian kerja (PKWT) karyawan di bawah
                    satuan kerja Anda dalam 3 (tiga) bulan ke depan, kami memohon kesediaan Bapak/Ibu
                    untuk mengisi <b>Formulir Penilaian Kinerja Karyawan (Form/HRD/XI/REV.1)</b>.
                  </p>

                  <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                    <p className="font-bold text-slate-800 mb-2">Daftar Karyawan yang Dinilai:</p>
                    <ul className="space-y-1 list-disc list-inside">
                      {blastModalData.items.map((it) => (
                        <li key={it.id} className="text-slate-700">
                          <b>{it.nama_lengkap}</b> &mdash; {it.jabatan} ({it.unit}) | Sisa:{" "}
                          <span className="text-rose-600 font-bold">{it.sisa_hari} Hari</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <p>
                    Penilaian dapat dilakukan secara langsung melalui tombol aman (Magic Link) di
                    bawah ini tanpa perlu login password:
                  </p>

                  <div className="py-2 text-center">
                    <div className="inline-block bg-[#0173b6] text-white px-6 py-2.5 rounded-xl font-bold text-xs shadow-md shadow-blue-500/20">
                      Buka Formulir Penilaian Kinerja
                    </div>
                    <p className="text-[10px] text-slate-400 mt-2">
                      *Tautan ini bersifat rahasia dan hanya diperuntukkan bagi pimpinan penilai.
                    </p>
                  </div>

                  <p className="text-slate-500 text-[11px] pt-2 border-t border-slate-100">
                    Hormat Kami,
                    <br />
                    <b>Bagian Sumber Daya Manusia (HRD)</b>
                    <br />
                    RSU Avisena Cimahi
                  </p>
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between shrink-0">
              <button
                onClick={() => setBlastModalData({ items: [], isOpen: false })}
                className="px-4 py-2 text-slate-600 hover:text-slate-800 text-xs font-bold"
              >
                Batal
              </button>
              <button
                onClick={handleExecuteBlast}
                className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-black shadow-md shadow-emerald-600/20 transition-all active:scale-95"
              >
                <Send size={14} />
                <span>Kirim Blast Email Sekarang</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL FULL FORM PENILAIAN KINERJA ================= */}
      {activeKaryawanForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-1 sm:p-3 md:p-6 bg-black/70 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-2xl w-full max-w-5xl h-[96vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
            {/* Modal Title Bar */}
            <div className="px-4 sm:px-6 py-3.5 bg-slate-900 text-white flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-[#0173b6] flex items-center justify-center font-bold shrink-0">
                  <FileSignature size={16} className="text-white" />
                </div>
                <div className="min-w-0">
                  <h2 className="text-sm sm:text-base font-black leading-tight truncate">
                    Evaluasi: {activeKaryawanForm.nama_lengkap}
                  </h2>
                  <p className="text-[11px] text-slate-300 truncate">
                    {activeKaryawanForm.jabatan} &bull; Penilai:{" "}
                    <span className="text-cyan-300 font-bold">
                      {activeKaryawanForm.penilai.nama}
                    </span>
                  </p>
                </div>
              </div>
              <button
                onClick={() => setActiveKaryawanForm(null)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors shrink-0"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Scrollable Content Container */}
            <div className="flex-1 overflow-y-auto p-2 sm:p-4 md:p-6 bg-slate-50">
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
