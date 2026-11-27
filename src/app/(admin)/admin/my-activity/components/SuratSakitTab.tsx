"use client";

import React, { useState, useRef, useMemo } from "react";
import {
  FileHeart,
  Send,
  AlertCircle,
  CheckCircle2,
  Calendar,
  History,
  Loader2,
  UploadCloud,
  FileText,
  Stethoscope,
  Building2,
  Trash2,
  Eye,
  X,
  ShieldCheck,
  Clock,
} from "lucide-react";
import Select, { type StylesConfig } from "react-select";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

if (typeof window !== "undefined") {
  gsap.registerPlugin(useGSAP);
}

interface SelectOption {
  readonly value: string;
  readonly label: string;
}

interface SuratSakitItem {
  readonly id: string;
  readonly tanggal_mulai: string;
  readonly tanggal_selesai: string;
  readonly jumlah_hari: number;
  readonly jenis_faskes: string;
  readonly nama_faskes: string;
  readonly nama_dokter: string;
  readonly diagnosa: string;
  readonly nama_file: string;
  readonly ukuran_file: string;
  readonly status: "Disetujui" | "Menunggu Verifikasi HC" | "Ditolak";
  readonly tanggal_lapor: string;
}

const FASKES_OPTIONS: readonly SelectOption[] = [
  { value: "Internal RSU Avisena", label: "Poliklinik / IGD Internal RSU Avisena" },
  { value: "RS Rujukan", label: "Rumah Sakit Rujukan / Faskes Lanjutan" },
  { value: "Klinik / Puskesmas", label: "Klinik Pratama / Puskesmas BPJS" },
  { value: "Dokter Praktik Mandiri", label: "Dokter Praktik Mandiri Resmi (SIP)" },
];

const INITIAL_SURAT_SAKIT_HISTORY: readonly SuratSakitItem[] = [
  {
    id: "SKD-2026-001",
    tanggal_mulai: "2026-11-12",
    tanggal_selesai: "2026-11-13",
    jumlah_hari: 2,
    jenis_faskes: "Internal RSU Avisena",
    nama_faskes: "IGD RSU Avisena Cimahi",
    nama_dokter: "dr. Hendra Wijaya",
    diagnosa: "Febris Akut & Observasi Gastritis (Istirahat Medis 2 Hari)",
    nama_file: "SKD_RSU_Avisena_12Nov2026.pdf",
    ukuran_file: "420 KB",
    status: "Disetujui",
    tanggal_lapor: "2026-11-12",
  },
];

const selectStyles: StylesConfig<SelectOption, false> = {
  control: (base, state) => ({
    ...base,
    minHeight: "44px",
    backgroundColor: state.isFocused ? "#ffffff" : "#f8fafc",
    borderColor: state.isFocused ? "#0173b6" : "#e2e8f0",
    borderRadius: "0.75rem",
    boxShadow: state.isFocused ? "0 0 0 2px rgba(1, 115, 182, 0.18)" : "none",
    fontSize: "0.8125rem",
    fontWeight: 700,
    "&:hover": {
      borderColor: "#0173b6",
    },
  }),
  option: (base, state) => ({
    ...base,
    fontSize: "0.8125rem",
    fontWeight: state.isSelected ? 700 : 500,
    backgroundColor: state.isSelected
      ? "#0173b6"
      : state.isFocused
      ? "#eff6ff"
      : "#ffffff",
    color: state.isSelected ? "#ffffff" : "#1e293b",
    cursor: "pointer",
  }),
  menu: (base) => ({
    ...base,
    borderRadius: "0.75rem",
    overflow: "hidden",
    zIndex: 30,
  }),
};

export default function SuratSakitTab() {
  const [historyList, setHistoryList] = useState<readonly SuratSakitItem[]>(
    INITIAL_SURAT_SAKIT_HISTORY
  );
  const [statusFilter, setStatusFilter] = useState<string>("Semua");
  const [previewItem, setPreviewItem] = useState<SuratSakitItem | null>(null);

  const [formState, setFormState] = useState({
    jenis_faskes: FASKES_OPTIONS[0].value,
    nama_faskes: "",
    nama_dokter: "",
    tanggal_mulai: "",
    tanggal_selesai: "",
    diagnosa: "",
  });

  const [uploadedFile, setUploadedFile] = useState<{
    readonly name: string;
    readonly sizeLabel: string;
  } | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState<{
    readonly type: "error" | "success";
    readonly text: string;
  } | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useGSAP(
    () => {
      gsap.fromTo(
        ".gsap-skd-form",
        { opacity: 0, y: 12 },
        { opacity: 1, y: 0, duration: 0.35, ease: "power2.out", clearProps: "all" }
      );
      gsap.fromTo(
        ".gsap-skd-side",
        { opacity: 0, x: 12 },
        { opacity: 1, x: 0, duration: 0.35, ease: "power2.out", delay: 0.08, clearProps: "all" }
      );
    },
    { scope: containerRef, dependencies: [] }
  );

  const durasiHari = useMemo(() => {
    if (!formState.tanggal_mulai || !formState.tanggal_selesai) return null;
    const start = new Date(formState.tanggal_mulai);
    const end = new Date(formState.tanggal_selesai);
    if (isNaN(start.getTime()) || isNaN(end.getTime()) || end < start) return null;
    const diffDays = Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    return diffDays;
  }, [formState.tanggal_mulai, formState.tanggal_selesai]);

  const totalHariDisetujui = useMemo(() => {
    return historyList
      .filter((item) => item.status === "Disetujui")
      .reduce((acc, item) => acc + item.jumlah_hari, 0);
  }, [historyList]);

  const filteredHistory = useMemo(() => {
    if (statusFilter === "Semua") return historyList;
    return historyList.filter((item) =>
      item.status.toLowerCase().includes(statusFilter.toLowerCase())
    );
  }, [historyList, statusFilter]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const sizeKB = Math.max(1, Math.round(file.size / 1024));
    const sizeLabel =
      sizeKB >= 1024 ? `${(sizeKB / 1024).toFixed(1)} MB` : `${sizeKB} KB`;
    setUploadedFile({
      name: file.name,
      sizeLabel,
    });
    setFeedbackMsg(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFeedbackMsg(null);

    if (!durasiHari || durasiHari <= 0) {
      setFeedbackMsg({
        type: "error",
        text: "Tanggal selesai istirahat harus sama atau setelah tanggal mulai sakit.",
      });
      return;
    }

    if (!uploadedFile) {
      setFeedbackMsg({
        type: "error",
        text: "Mohon unggah lampiran foto atau PDF Surat Keterangan Dokter (SKD).",
      });
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      const todayIso = new Date().toISOString().split("T")[0];
      const newEntry: SuratSakitItem = {
        id: `SKD-2026-00${historyList.length + 1}`,
        tanggal_mulai: formState.tanggal_mulai,
        tanggal_selesai: formState.tanggal_selesai,
        jumlah_hari: durasiHari,
        jenis_faskes: formState.jenis_faskes,
        nama_faskes: formState.nama_faskes.trim() || "RSU Avisena Cimahi",
        nama_dokter: formState.nama_dokter.trim() || "Dokter Pemeriksa",
        diagnosa: formState.diagnosa.trim(),
        nama_file: uploadedFile.name,
        ukuran_file: uploadedFile.sizeLabel,
        status: "Menunggu Verifikasi HC",
        tanggal_lapor: todayIso,
      };

      setHistoryList((prev) => [newEntry, ...prev]);
      setFormState({
        jenis_faskes: FASKES_OPTIONS[0].value,
        nama_faskes: "",
        nama_dokter: "",
        tanggal_mulai: "",
        tanggal_selesai: "",
        diagnosa: "",
      });
      setUploadedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      setIsSubmitting(false);
      setFeedbackMsg({
        type: "success",
        text: "Laporan surat sakit berhasil ditambahkan ke daftar pengajuan (Simulasi UI).",
      });
    }, 450);
  };

  return (
    <div ref={containerRef} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      {/* Sisi Kiri: Formulir Pelaporan Surat Sakit */}
      <div className="lg:col-span-8">
        <div className="gsap-skd-form bg-white rounded-2xl shadow-xs border border-slate-200/80 p-6 sm:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-xl font-bold text-primary-dark tracking-tight flex items-center gap-2.5">
                <FileHeart className="text-primary" size={21} />
                <span>Pelaporan &amp; Unggah Surat Keterangan Sakit</span>
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
                Lampirkan Surat Keterangan Dokter (SKD) resmi agar status kehadiran tercatat sebagai Izin Sakit Resmi dan tidak memotong kuota Cuti Tahunan.
              </p>
            </div>
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-50 text-primary border border-blue-200/70 text-[11px] font-bold shrink-0 self-start sm:self-center">
              <ShieldCheck size={14} />
              <span>Tidak Memotong Kuota Cuti</span>
            </span>
          </div>

          <form className="space-y-5" onSubmit={handleSubmit}>
            {feedbackMsg && (
              <div
                className={`p-4 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-3 ${
                  feedbackMsg.type === "error"
                    ? "bg-rose-50 text-rose-700 border border-rose-200"
                    : "bg-emerald-50 text-emerald-700 border border-emerald-200"
                }`}
              >
                {feedbackMsg.type === "error" ? (
                  <AlertCircle size={18} className="shrink-0" />
                ) : (
                  <CheckCircle2 size={18} className="shrink-0" />
                )}
                <span>{feedbackMsg.text}</span>
              </div>
            )}

            {/* Baris 1: Jenis Faskes & Nama Faskes */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <Building2 size={13} className="text-primary" />
                  <span>Kategori Faskes Penerbit</span>
                  <span className="text-rose-500">*</span>
                </label>
                <Select<SelectOption, false>
                  instanceId="faskes-type-select"
                  options={FASKES_OPTIONS}
                  value={
                    FASKES_OPTIONS.find((opt) => opt.value === formState.jenis_faskes) ||
                    FASKES_OPTIONS[0]
                  }
                  onChange={(opt) =>
                    opt && setFormState({ ...formState, jenis_faskes: opt.value })
                  }
                  styles={selectStyles}
                  isSearchable={false}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <Building2 size={13} className="text-primary" />
                  <span>Nama Rumah Sakit / Klinik</span>
                  <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formState.nama_faskes}
                  onChange={(e) =>
                    setFormState({ ...formState, nama_faskes: e.target.value })
                  }
                  placeholder="Contoh: IGD RSU Avisena Cimahi"
                  className="w-full px-4 py-2.5 min-h-[44px] bg-slate-50/80 border border-slate-200/90 rounded-xl font-bold text-slate-800 text-xs sm:text-sm focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                />
              </div>
            </div>

            {/* Baris 2: Nama Dokter Pemeriksa */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <Stethoscope size={13} className="text-primary" />
                <span>Nama Dokter Pemeriksa</span>
                <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formState.nama_dokter}
                onChange={(e) =>
                  setFormState({ ...formState, nama_dokter: e.target.value })
                }
                placeholder="Contoh: dr. Hendra Wijaya, Sp.PD"
                className="w-full px-4 py-2.5 min-h-[44px] bg-slate-50/80 border border-slate-200/90 rounded-xl font-bold text-slate-800 text-xs sm:text-sm focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
              />
            </div>

            {/* Baris 3: Tanggal Mulai & Tanggal Selesai */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <Calendar size={13} className="text-primary" />
                  <span>Tanggal Mulai Istirahat</span>
                  <span className="text-rose-500">*</span>
                </label>
                <input
                  type="date"
                  required
                  value={formState.tanggal_mulai}
                  onChange={(e) =>
                    setFormState({ ...formState, tanggal_mulai: e.target.value })
                  }
                  className="w-full px-4 py-2.5 min-h-[44px] bg-slate-50/80 border border-slate-200/90 rounded-xl font-bold text-slate-800 text-xs sm:text-sm focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all font-mono tabular-nums"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <Calendar size={13} className="text-primary" />
                  <span>Tanggal Selesai Istirahat</span>
                  <span className="text-rose-500">*</span>
                </label>
                <input
                  type="date"
                  required
                  value={formState.tanggal_selesai}
                  onChange={(e) =>
                    setFormState({ ...formState, tanggal_selesai: e.target.value })
                  }
                  className="w-full px-4 py-2.5 min-h-[44px] bg-slate-50/80 border border-slate-200/90 rounded-xl font-bold text-slate-800 text-xs sm:text-sm focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all font-mono tabular-nums"
                />
              </div>
            </div>

            {/* Preview Durasi Istirahat Medis */}
            {durasiHari !== null && (
              <div className="flex items-center justify-between gap-3 bg-blue-50/70 p-3.5 rounded-xl border border-blue-100 text-xs">
                <div className="flex items-center gap-2 text-primary font-bold">
                  <Clock size={16} />
                  <span>Total Durasi Rekomendasi Istirahat Medis:</span>
                </div>
                <span className="font-mono font-bold text-primary text-sm tabular-nums">
                  {durasiHari} Hari Kalender
                </span>
              </div>
            )}

            {/* Baris 4: Diagnosa / Keterangan Medis */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">
                Diagnosa Ringkas / Keterangan Medis <span className="text-rose-500">*</span>
              </label>
              <textarea
                rows={3}
                required
                value={formState.diagnosa}
                onChange={(e) =>
                  setFormState({ ...formState, diagnosa: e.target.value })
                }
                placeholder="Tuliskan keterangan keluhan medis atau diagnosa sesuai surat dokter..."
                className="w-full px-4 py-3 bg-slate-50/80 border border-slate-200/90 rounded-xl font-medium text-slate-700 text-xs sm:text-sm focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all resize-none"
              />
            </div>

            {/* Baris 5: Unggah Dokumen Surat Keterangan Dokter */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
                <span>
                  Lampiran Foto / Scan Surat Keterangan Dokter <span className="text-rose-500">*</span>
                </span>
                <span className="text-[11px] font-medium text-slate-400">
                  Format JPG, PNG, atau PDF (Maks. 5 MB)
                </span>
              </label>

              <input
                ref={fileInputRef}
                type="file"
                accept=".jpg,.jpeg,.png,.pdf"
                onChange={handleFileChange}
                className="hidden"
                id="upload-surat-sakit"
              />

              {!uploadedFile ? (
                <label
                  htmlFor="upload-surat-sakit"
                  className="flex flex-col items-center justify-center gap-2 p-6 border-2 border-dashed border-slate-200 hover:border-primary/60 bg-slate-50/60 hover:bg-blue-50/30 rounded-2xl cursor-pointer transition-all text-center"
                >
                  <div className="w-11 h-11 rounded-xl bg-blue-50 text-primary flex items-center justify-center">
                    <UploadCloud size={22} />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-700">
                      Klik untuk memilih berkas Surat Sakit
                    </p>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Pastikan tanggal istirahat, tanda tangan dokter, dan stempel faskes terlihat jelas
                    </p>
                  </div>
                </label>
              ) : (
                <div className="flex items-center justify-between gap-3 p-3.5 rounded-xl bg-emerald-50/60 border border-emerald-200">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                      <FileText size={18} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-slate-800 truncate">
                        {uploadedFile.name}
                      </p>
                      <p className="text-[11px] font-mono tabular-nums text-emerald-700 font-semibold">
                        Siap dilampirkan • {uploadedFile.sizeLabel}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setUploadedFile(null);
                      if (fileInputRef.current) fileInputRef.current.value = "";
                    }}
                    className="p-2 rounded-lg text-rose-600 hover:bg-rose-100/70 transition-colors"
                    title="Hapus Berkas"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex items-center justify-center gap-3 bg-primary hover:bg-primary-dark text-white font-bold py-3.5 rounded-xl transition-all shadow-xs active:scale-[0.98] text-xs uppercase tracking-wider disabled:opacity-50 min-h-[44px]"
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  <span>Mengunggah Laporan Surat Sakit...</span>
                </>
              ) : (
                <>
                  <Send size={16} />
                  <span>Kirim Laporan &amp; Lampiran Surat Sakit</span>
                </>
              )}
            </button>
          </form>
        </div>
      </div>

      {/* Sisi Kanan: Summary Card & Riwayat Surat Sakit */}
      <div className="gsap-skd-side lg:col-span-4 space-y-6">
        {/* Hospital Navy Summary Card */}
        <div className="rounded-2xl p-6 text-white shadow-xs relative overflow-hidden bg-primary-dark border border-slate-700/50">
          <div className="flex items-center gap-2 mb-4">
            <div className="p-2 bg-white/10 rounded-xl text-blue-200">
              <FileHeart size={16} />
            </div>
            <h3 className="text-xs font-bold text-blue-100 uppercase tracking-wider">
              Akumulasi Izin Sakit (Cut-Off 26–25)
            </h3>
          </div>

          <div className="flex items-baseline gap-2">
            <span className="text-5xl font-bold font-mono leading-none tracking-tight tabular-nums text-white">
              {totalHariDisetujui < 10 ? `0${totalHariDisetujui}` : totalHariDisetujui}
            </span>
            <span className="text-sm font-bold text-blue-200 uppercase tracking-wider">
              Hari Disetujui
            </span>
          </div>

          <p className="text-xs text-blue-100/90 mt-4 font-medium leading-relaxed">
            Izin sakit dengan lampiran SKD terverifikasi dihitung dalam komponen kehadiran resmi dan tidak mengurangi jatah cuti tahunan.
          </p>
        </div>

        {/* Riwayat Surat Sakit Card */}
        <div className="bg-white rounded-2xl shadow-xs border border-slate-200/80 p-6 space-y-4">
          <div className="flex items-center justify-between gap-2">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <History size={14} className="text-primary" />
              <span>Riwayat Surat Sakit</span>
            </h3>
            <div className="flex items-center gap-1">
              {["Semua", "Menunggu", "Disetujui"].map((st) => (
                <button
                  key={st}
                  type="button"
                  onClick={() => setStatusFilter(st)}
                  className={`px-2 py-1 rounded-lg text-[10px] font-bold transition-colors ${
                    statusFilter === st
                      ? "bg-primary text-white"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3.5 max-h-[460px] overflow-y-auto pr-1">
            {filteredHistory.length === 0 ? (
              <div className="text-center py-10 bg-slate-50/70 rounded-xl border border-dashed border-slate-200">
                <FileHeart size={28} className="text-slate-300 mx-auto mb-2" />
                <p className="text-xs font-bold text-slate-400">
                  Belum ada riwayat surat sakit
                </p>
              </div>
            ) : (
              filteredHistory.map((item) => (
                <div
                  key={item.id}
                  className="p-4 rounded-xl border border-slate-200/80 hover:border-primary/40 hover:shadow-xs transition-all bg-white space-y-2.5"
                >
                  <div className="flex justify-between items-start gap-2">
                    <div>
                      <span className="text-[10px] font-mono font-bold text-slate-400 tabular-nums">
                        {item.id}
                      </span>
                      <p className="text-xs font-bold text-slate-900 font-mono tabular-nums">
                        {new Date(item.tanggal_mulai).toLocaleDateString("id-ID", {
                          day: "numeric",
                          month: "short",
                        })}{" "}
                        –{" "}
                        {new Date(item.tanggal_selesai).toLocaleDateString("id-ID", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}{" "}
                        ({item.jumlah_hari} Hari)
                      </p>
                    </div>
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                        item.status === "Disetujui"
                          ? "bg-emerald-100 text-emerald-800 border-emerald-200"
                          : item.status === "Ditolak"
                          ? "bg-rose-100 text-rose-800 border-rose-200"
                          : "bg-amber-100 text-amber-800 border-amber-200"
                      }`}
                    >
                      {item.status}
                    </span>
                  </div>

                  <div className="text-[11px] text-slate-600 space-y-0.5">
                    <p className="font-bold text-primary flex items-center gap-1.5">
                      <Stethoscope size={12} />
                      <span>
                        {item.nama_dokter} • {item.nama_faskes}
                      </span>
                    </p>
                    <p className="text-slate-600 line-clamp-2 bg-slate-50 p-2 rounded-lg border border-slate-100 mt-1">
                      &quot;{item.diagnosa}&quot;
                    </p>
                  </div>

                  <div className="pt-1 flex items-center justify-between gap-2 border-t border-slate-100">
                    <span className="text-[10px] font-mono text-slate-400 truncate">
                      📎 {item.nama_file}
                    </span>
                    <button
                      type="button"
                      onClick={() => setPreviewItem(item)}
                      className="inline-flex items-center gap-1 text-[11px] font-bold text-primary hover:underline shrink-0"
                    >
                      <Eye size={12} />
                      <span>Detail SKD</span>
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Modal Preview Detail Surat Keterangan Dokter */}
      {previewItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-blue-50 text-primary flex items-center justify-center">
                  <FileHeart size={18} />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">
                    Detail Surat Keterangan Dokter
                  </h4>
                  <p className="text-[11px] font-mono text-slate-400 tabular-nums">
                    {previewItem.id} • Dilaporkan {previewItem.tanggal_lapor}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setPreviewItem(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X size={16} />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200/70">
                <div>
                  <span className="text-[10px] font-bold uppercase text-slate-400">
                    Faskes Penerbit
                  </span>
                  <p className="font-bold text-slate-800 mt-0.5">
                    {previewItem.nama_faskes}
                  </p>
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase text-slate-400">
                    Dokter Pemeriksa
                  </span>
                  <p className="font-bold text-slate-800 mt-0.5">
                    {previewItem.nama_dokter}
                  </p>
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase text-slate-400">
                    Periode Istirahat
                  </span>
                  <p className="font-bold font-mono tabular-nums text-primary mt-0.5">
                    {previewItem.tanggal_mulai} s/d {previewItem.tanggal_selesai}
                  </p>
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase text-slate-400">
                    Durasi Hari
                  </span>
                  <p className="font-bold font-mono tabular-nums text-slate-800 mt-0.5">
                    {previewItem.jumlah_hari} Hari Kalender
                  </p>
                </div>
              </div>

              <div>
                <span className="text-[10px] font-bold uppercase text-slate-400">
                  Diagnosa / Catatan Medis
                </span>
                <p className="p-3 rounded-xl bg-slate-50 border border-slate-200/70 text-slate-700 font-medium mt-1">
                  {previewItem.diagnosa}
                </p>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-blue-50/60 border border-blue-200/70">
                <div className="flex items-center gap-2.5 min-w-0">
                  <FileText size={18} className="text-primary shrink-0" />
                  <div className="min-w-0">
                    <p className="font-bold text-slate-800 truncate">
                      {previewItem.nama_file}
                    </p>
                    <p className="text-[10px] font-mono text-slate-500">
                      Ukuran berkas: {previewItem.ukuran_file}
                    </p>
                  </div>
                </div>
                <span className="badge badge-sm bg-primary text-white border-0 font-bold text-[10px]">
                  Lampiran Tersimpan
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setPreviewItem(null)}
              className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition-colors"
            >
              Tutup Pratinjau
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
