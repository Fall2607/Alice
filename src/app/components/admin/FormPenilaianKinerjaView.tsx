"use client";

import React, { useState, useMemo, useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";

if (typeof window !== "undefined") {
  gsap.registerPlugin(useGSAP);
}

import {
  INDIKATOR_PENILAIAN_LIST,
  IndikatorPenilaian,
  getKategoriNorma,
  KaryawanKontrakItem,
} from "@/app/data/penilaianKinerjaData";
import {
  ShieldCheck,
  CheckCircle2,
  Printer,
  User,
  ArrowRight,
  Briefcase,
  Building2,
  Award,
  Clock,
  Sparkles,
  ChevronRight,
  HelpCircle,
  Trophy,
  Minus,
  Plus,
  FileText,
  Target,
  Calendar,
  AlertCircle,
  ThumbsUp,
  RotateCcw,
  BookOpen,
} from "lucide-react";

export interface FormAssessmentData {
  readonly karyawanId: string;
  readonly scores: Record<string, number>;
  readonly totalSkor: number;
  readonly indeksPrestasi: number;
  readonly norma: number;
  readonly kategoriNorma: "KURANG" | "CUKUP" | "BAIK" | "EXCELENT";
  readonly rekomendasiUtama:
    | "KONTRAK"
    | "TETAP"
    | "MUTASI"
    | "PROMOSI"
    | "DEMOSI"
    | "TIDAK_LANJUT";
  readonly kontrakTahun: number;
  readonly kelebihan: string;
  readonly kekurangan: string;
  readonly pelatihan: string;
  readonly catatanSaran: string;
}

interface FormPenilaianKinerjaViewProps {
  readonly karyawan: KaryawanKontrakItem;
  readonly readOnly?: boolean;
  readonly onSave?: (data: FormAssessmentData) => void;
  readonly onCancel?: () => void;
}

interface PerformanceGrade {
  readonly code: string;
  readonly label: string;
  readonly badgeClass: string;
  readonly barClass: string;
  readonly percent: number;
}

function getPerformanceGrade(val: number): PerformanceGrade {
  if (val >= 41) {
    return {
      code: "BS",
      label: "Baik Sekali",
      badgeClass: "badge-success text-white",
      barClass: "progress-success",
      percent: Math.min(100, Math.round((val / 50) * 100)),
    };
  }
  if (val >= 31) {
    return {
      code: "B",
      label: "Baik",
      badgeClass: "badge-primary text-white",
      barClass: "progress-primary",
      percent: Math.min(100, Math.round((val / 50) * 100)),
    };
  }
  if (val >= 21) {
    return {
      code: "C",
      label: "Cukup",
      badgeClass: "badge-warning text-slate-900 font-bold",
      barClass: "progress-warning",
      percent: Math.min(100, Math.round((val / 50) * 100)),
    };
  }
  if (val >= 11) {
    return {
      code: "K",
      label: "Kurang",
      badgeClass: "badge-error badge-outline text-orange-700 font-bold",
      barClass: "progress-error",
      percent: Math.min(100, Math.round((val / 50) * 100)),
    };
  }
  return {
    code: "KS",
    label: "Kurang Sekali",
    badgeClass: "badge-error text-white font-bold",
    barClass: "progress-error",
    percent: Math.min(100, Math.round((val / 50) * 100)),
  };
}

const SCORE_PRESETS = [
  { value: 10, label: "10", title: "Kurang Sekali (10)" },
  { value: 20, label: "20", title: "Kurang (20)" },
  { value: 30, label: "30", title: "Cukup (30)" },
  { value: 40, label: "40", title: "Baik (40)" },
  { value: 50, label: "50", title: "Baik Sekali (50)" },
] as const;

export default function FormPenilaianKinerjaView({
  karyawan,
  readOnly = false,
  onSave,
  onCancel,
}: FormPenilaianKinerjaViewProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  const isHigherLevel =
    karyawan.level === "Koordinator" ||
    karyawan.level === "SPV" ||
    karyawan.level === "Kanit" ||
    karyawan.level === "Manager";

  const [includeManagerial, setIncludeManagerial] = useState<boolean>(
    Boolean(karyawan.hasSubordinates && isHigherLevel),
  );

  const [scores, setScores] = useState<Record<string, number>>(() => {
    const initial: Record<string, number> = {};
    INDIKATOR_PENILAIAN_LIST.forEach((ind) => {
      initial[ind.id] = 35;
    });
    return initial;
  });

  const [kelebihan, setKelebihan] = useState(
    "Disiplin, teliti dalam bekerja, dan mampu berkomunikasi dengan baik kepada rekan kerja maupun pasien.",
  );
  const [kekurangan, setKekurangan] = useState(
    "Perlu peningkatan manajemen waktu dalam menangani beban kerja saat situasi padat.",
  );
  const [pelatihan, setPelatihan] = useState(
    "Pelatihan Service Excellence dan Komunikasi Efektif Rumah Sakit.",
  );
  const [catatanSaran, setCatatanSaran] = useState(
    "Kinerja secara umum memenuhi standar operasional dan direkomendasikan untuk dipertahankan.",
  );

  const [rekomendasiUtama, setRekomendasiUtama] = useState<
    "KONTRAK" | "TETAP" | "MUTASI" | "PROMOSI" | "DEMOSI" | "TIDAK_LANJUT"
  >("KONTRAK");
  const [kontrakTahun, setKontrakTahun] = useState<number>(1);

  const activeIndikators = useMemo(() => {
    return INDIKATOR_PENILAIAN_LIST.filter((ind) => {
      if (ind.isManagerial) return includeManagerial;
      return true;
    });
  }, [includeManagerial]);

  const groupedAspek = useMemo(() => {
    const groups: {
      aspekNo: number;
      aspekNama: string;
      items: IndikatorPenilaian[];
    }[] = [];
    activeIndikators.forEach((ind) => {
      let g = groups.find((item) => item.aspekNo === ind.aspekNo);
      if (!g) {
        g = { aspekNo: ind.aspekNo, aspekNama: ind.aspekNama, items: [] };
        groups.push(g);
      }
      g.items.push(ind);
    });
    return groups;
  }, [activeIndikators]);

  const calculation = useMemo(() => {
    let totalScore = 0;
    activeIndikators.forEach((ind) => {
      const val = scores[ind.id] || 0;
      totalScore += val * ind.bobot;
    });

    const indeksPrestasi = includeManagerial ? 700 : 580;
    const rawNorma = totalScore / indeksPrestasi;
    const norma = Math.min(4.0, Math.max(1.0, Number(rawNorma.toFixed(2))));
    const kategori = getKategoriNorma(norma);

    return {
      totalScore,
      indeksPrestasi,
      norma,
      kategori,
    };
  }, [scores, activeIndikators, includeManagerial]);

  // GSAP: Entrance animation for the entire form workspace
  useGSAP(
    () => {
      const tl = gsap.timeline({ defaults: { ease: "power2.out" } });

      tl.from(".eval-sidebar", {
        x: -16,
        opacity: 0,
        duration: 0.45,
        clearProps: "all",
      })
        .from(
          ".eval-guide-card",
          {
            y: 12,
            opacity: 0,
            duration: 0.35,
            clearProps: "all",
          },
          "-=0.25"
        )
        .from(
          ".eval-aspek-card",
          {
            y: 16,
            opacity: 0,
            duration: 0.35,
            stagger: 0.05,
            clearProps: "all",
          },
          "-=0.2"
        )
        .from(
          [".eval-kualitatif-card", ".eval-rekomendasi-card", ".eval-submit-bar"],
          {
            y: 16,
            opacity: 0,
            duration: 0.35,
            stagger: 0.06,
            clearProps: "all",
          },
          "-=0.2"
        );
    },
    { scope: containerRef }
  );

  const handleScoreChange = (id: string, val: number) => {
    if (readOnly) return;
    const clamped = Math.max(0, Math.min(50, val));
    setScores((prev) => ({ ...prev, [id]: clamped }));
  };

  const handleAdjustScore = (id: string, delta: number) => {
    if (readOnly) return;
    const current = scores[id] || 0;
    handleScoreChange(id, current + delta);
  };

  const handlePrint = () => {
    if (typeof window !== "undefined") window.print();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSave) {
      onSave({
        karyawanId: karyawan.id,
        scores,
        totalSkor: calculation.totalScore,
        indeksPrestasi: calculation.indeksPrestasi,
        norma: calculation.norma,
        kategoriNorma: calculation.kategori,
        rekomendasiUtama,
        kontrakTahun,
        kelebihan,
        kekurangan,
        pelatihan,
        catatanSaran,
      });
    }
  };

  const scrollToAspek = (aspekNo: number) => {
    const el = document.getElementById(`aspek-section-${aspekNo}`);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const initials = useMemo(() => {
    const parts = karyawan.nama_lengkap.trim().split(" ").filter(Boolean);
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }, [karyawan.nama_lengkap]);

  return (
    <div ref={containerRef} className="w-full max-w-6xl mx-auto font-sans text-slate-800 pb-16">
      {/* 2-Column Responsive Layout: Sidebar & Assessment Content */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* ============================================================== */}
        {/* KOLOM KIRI: STICKY SIDEBAR (PROFIL, SKOR REKAP & NAVIGASI)     */}
        {/* ============================================================== */}
        <aside className="eval-sidebar lg:col-span-4 space-y-4 lg:sticky lg:top-4 z-20">
          {/* Card 1: Identitas Pegawai & Penilai */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                Profil Pegawai Dievaluasi
              </span>
              <span className="badge badge-sm badge-outline font-mono tabular-nums font-bold text-[#0173b6] border-blue-200">
                NIP: {karyawan.nip}
              </span>
            </div>

            {/* Avatar & Identitas */}
            <div className="flex items-start gap-3.5">
              <div className="w-12 h-12 rounded-xl bg-[#05445e] text-white flex items-center justify-center font-bold text-sm shrink-0 shadow-sm">
                {initials}
              </div>
              <div className="min-w-0 flex-1 space-y-0.5">
                <h2 className="text-sm font-black text-slate-900 leading-snug truncate" title={karyawan.nama_lengkap}>
                  {karyawan.gelar_depan ? `${karyawan.gelar_depan} ` : ""}
                  {karyawan.nama_lengkap}
                  {karyawan.gelar_belakang ? `, ${karyawan.gelar_belakang}` : ""}
                </h2>
                <p className="text-xs font-semibold text-[#0173b6] truncate">
                  {karyawan.jabatan}
                </p>
                <div className="flex items-center gap-1.5 text-[11px] text-slate-500 font-medium">
                  <Building2 size={11} className="text-slate-400 shrink-0" />
                  <span className="truncate">{karyawan.unit}</span>
                </div>
              </div>
            </div>

            {/* Sisa Masa Kontrak Card */}
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 flex items-center justify-between text-xs font-mono tabular-nums">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 font-sans block">
                  Sisa Masa PKWT
                </span>
                <span className={`font-black text-xs ${karyawan.sisa_hari <= 30 ? "text-rose-600" : "text-amber-600"}`}>
                  {karyawan.sisa_hari} Hari Lagi
                </span>
              </div>
              <span className="badge badge-sm font-sans font-bold bg-white text-slate-700 border border-slate-200">
                {karyawan.level}
              </span>
            </div>

            {/* Pimpinan Penilai */}
            <div className="pt-2 border-t border-slate-100 text-xs space-y-1">
              <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-slate-400">
                <span>Pimpinan Penilai</span>
                <span className="badge badge-xs badge-ghost font-bold">{karyawan.penilai.level}</span>
              </div>
              <p className="font-bold text-slate-800 leading-snug">{karyawan.penilai.nama}</p>
              <p className="text-[11px] text-slate-500 font-medium">{karyawan.penilai.jabatan}</p>
            </div>

            {/* Aspek Manajerial Toggle (DaisyUI Toggle) */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
              <div>
                <p className="font-bold text-slate-800 text-[11px]">
                  Aspek Manajerial (Ke-10)
                </p>
                <p className="text-[10px] text-slate-400">
                  Pembagi: <b className="font-mono text-slate-700">{calculation.indeksPrestasi}</b> (
                  {includeManagerial ? "Pimpinan" : "Staf"})
                </p>
              </div>

              <input
                type="checkbox"
                checked={includeManagerial}
                onChange={(e) => setIncludeManagerial(e.target.checked)}
                disabled={readOnly}
                className="toggle toggle-primary toggle-sm cursor-pointer"
                title="Aktifkan aspek kepemimpinan & manajerial"
              />
            </div>
          </div>

          {/* Card 2: Live Norma Scorecard (Medical Hospital Palette) */}
          <div className="bg-gradient-to-br from-[#05445e] via-[#0173b6] to-sky-700 text-white rounded-2xl shadow-md p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-blue-100 text-xs font-bold uppercase tracking-wider">
                <Trophy size={14} className="text-amber-300" />
                <span>Kalkulasi Nilai Norma</span>
              </div>
              <span className={`badge badge-sm font-black uppercase tracking-wider shadow-xs ${
                calculation.kategori === "EXCELENT"
                  ? "bg-emerald-400 text-emerald-950"
                  : calculation.kategori === "BAIK"
                  ? "bg-white text-[#0173b6]"
                  : calculation.kategori === "CUKUP"
                  ? "bg-amber-300 text-amber-950"
                  : "bg-rose-400 text-rose-950"
              }`}>
                {calculation.kategori}
              </span>
            </div>

            {/* Large Prominent Score */}
            <div className="space-y-1">
              <div className="flex items-baseline gap-2">
                <span className="text-4xl sm:text-5xl font-black font-mono tabular-nums tracking-tight leading-none">
                  {calculation.norma.toFixed(2)}
                </span>
                <span className="text-sm font-mono text-blue-200">/ 4.00 Max</span>
              </div>
              <p className="text-[11px] text-blue-100 font-medium">
                Rumus: Total Skor Tertimbang ÷ Indeks Pembagi
              </p>
            </div>

            {/* DaisyUI Progress Gauge */}
            <div className="space-y-1">
              <progress
                className="progress progress-warning w-full h-2 rounded-full bg-white/20"
                value={(calculation.norma / 4.0) * 100}
                max="100"
              ></progress>
              <div className="flex justify-between text-[10px] font-mono tabular-nums text-blue-200">
                <span>1.00 (Kurang)</span>
                <span>2.76 (Baik)</span>
                <span>3.50+ (Excelent)</span>
              </div>
            </div>

            {/* Metrics Breakdown */}
            <div className="pt-3 border-t border-white/20 text-xs space-y-1.5 font-medium">
              <div className="flex justify-between text-blue-100">
                <span>Total Skor Tertimbang:</span>
                <span className="font-mono font-bold text-white tabular-nums">
                  {calculation.totalScore}
                </span>
              </div>
              <div className="flex justify-between text-blue-100">
                <span>Pembagi Indeks Prestasi:</span>
                <span className="font-mono font-bold text-white tabular-nums">
                  {calculation.indeksPrestasi}
                </span>
              </div>
              <div className="flex justify-between text-blue-100">
                <span>Indikator Terisi:</span>
                <span className="font-mono font-bold text-white tabular-nums">
                  {activeIndikators.length} Indikator
                </span>
              </div>
            </div>
          </div>

          {/* Card 3: Quick Jump Navigation */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-4 space-y-2.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              Navigasi Cepat Aspek ({groupedAspek.length} Bagian)
            </span>
            <div className="flex flex-wrap gap-1.5">
              {groupedAspek.map((g) => (
                <button
                  key={g.aspekNo}
                  type="button"
                  onClick={() => scrollToAspek(g.aspekNo)}
                  className="btn btn-xs btn-outline border-slate-200 hover:bg-slate-100 text-slate-700 font-bold rounded-lg font-mono tabular-nums"
                  title={g.aspekNama}
                >
                  A{g.aspekNo}
                </button>
              ))}
            </div>
          </div>

          {/* Action Buttons Cetak & Batal */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="flex-1 btn btn-sm btn-outline border-slate-200 hover:bg-slate-100 text-slate-700 font-bold rounded-xl gap-2 active:scale-[0.98] transition-all"
            >
              <Printer size={14} className="text-slate-500" />
              <span>Cetak Form</span>
            </button>

            {onCancel && (
              <button
                type="button"
                onClick={onCancel}
                className="btn btn-sm btn-ghost text-slate-600 hover:bg-slate-100 font-bold rounded-xl active:scale-[0.98] transition-all"
              >
                Tutup
              </button>
            )}
          </div>
        </aside>

        {/* ============================================================== */}
        {/* KOLOM KANAN: FORM EVALUASI, INDIKATOR, KUALITATIF & REKOMENDASI*/}
        {/* ============================================================== */}
        <main className="lg:col-span-8 space-y-5">
          {/* Panduan Skala Nilai (DaisyUI Cards) */}
          <div className="eval-guide-card bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-4 sm:p-5 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#0173b6]"></span>
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-800">
                  Panduan Skala Penilaian Kinerja (Skala 0 - 50)
                </h3>
              </div>
              <span className="badge badge-sm font-mono tabular-nums font-bold bg-slate-100 text-slate-600">
                Form/HRD/XI/REV.1
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-center text-xs">
              <div className="p-2.5 rounded-xl border border-rose-200 bg-rose-50/60">
                <span className="font-mono font-black text-rose-700 text-xs block tabular-nums">0 - 10</span>
                <span className="text-[10px] font-bold text-rose-800">KS (Kurang Sekali)</span>
              </div>
              <div className="p-2.5 rounded-xl border border-orange-200 bg-orange-50/60">
                <span className="font-mono font-black text-orange-700 text-xs block tabular-nums">11 - 20</span>
                <span className="text-[10px] font-bold text-orange-800">K (Kurang)</span>
              </div>
              <div className="p-2.5 rounded-xl border border-amber-200 bg-amber-50/60">
                <span className="font-mono font-black text-amber-700 text-xs block tabular-nums">21 - 30</span>
                <span className="text-[10px] font-bold text-amber-800">C (Cukup)</span>
              </div>
              <div className="p-2.5 rounded-xl border border-blue-200 bg-blue-50/60">
                <span className="font-mono font-black text-[#0173b6] text-xs block tabular-nums">31 - 40</span>
                <span className="text-[10px] font-bold text-blue-800">B (Baik)</span>
              </div>
              <div className="p-2.5 rounded-xl border border-emerald-200 bg-emerald-50/60 col-span-2 sm:col-span-1">
                <span className="font-mono font-black text-emerald-700 text-xs block tabular-nums">41 - 50</span>
                <span className="text-[10px] font-bold text-emerald-800">BS (Baik Sekali)</span>
              </div>
            </div>
          </div>

          {/* Form Evaluasi Utama */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Loop Aspek & Indikator */}
            {groupedAspek.map((aspek) => (
              <div
                id={`aspek-section-${aspek.aspekNo}`}
                key={aspek.aspekNo}
                className="eval-aspek-card bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden scroll-mt-20"
              >
                {/* Header Aspek */}
                <div className="bg-slate-50/90 border-b border-slate-200/80 px-4 sm:px-6 py-3.5 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className="w-6 h-6 rounded-lg bg-[#0173b6] text-white font-bold flex items-center justify-center text-xs shrink-0 shadow-2xs font-mono">
                      {aspek.aspekNo}
                    </span>
                    <h3 className="text-xs sm:text-sm font-black uppercase tracking-wider text-slate-800">
                      Aspek {aspek.aspekNo}: {aspek.aspekNama}
                    </h3>
                  </div>
                  <span className="badge badge-sm font-mono tabular-nums font-bold bg-white text-slate-700 border border-slate-200">
                    {aspek.items.length} Indikator
                  </span>
                </div>

                {/* List Indikator */}
                <div className="divide-y divide-slate-100">
                  {aspek.items.map((ind) => {
                    const val = scores[ind.id] || 0;
                    const subtotal = val * ind.bobot;
                    const grade = getPerformanceGrade(val);

                    return (
                      <div
                        key={ind.id}
                        className="p-4 sm:p-5 space-y-3 hover:bg-slate-50/40 transition-colors"
                      >
                        {/* Judul & Penjelasan Indikator */}
                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                          <div className="space-y-1 flex-1">
                            <h4 className="text-xs sm:text-sm font-black text-slate-900 leading-snug">
                              {ind.nama}
                            </h4>
                            {ind.keterangan && (
                              <p className="text-xs text-slate-500 leading-relaxed font-medium">
                                {ind.keterangan}
                              </p>
                            )}
                          </div>

                          {/* Bobot & Subtotal Badges */}
                          <div className="flex items-center gap-2 self-start sm:self-auto shrink-0 text-xs font-mono tabular-nums bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200">
                            <span className="text-slate-600">
                              Bobot: <b className="text-slate-900">{ind.bobot}</b>
                            </span>
                            <span className="text-slate-300">•</span>
                            <span className="text-slate-600">
                              Hasil: <b className="text-[#0173b6] font-bold">{subtotal.toFixed(1)}</b>
                            </span>
                          </div>
                        </div>

                        {/* Kontrol Input Nilai: Quick Preset Buttons & Precision Stepper */}
                        <div className="pt-1 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          {/* Quick Score Presets (DaisyUI Join Group) */}
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-[11px] font-bold text-slate-400">
                              Pilih Cepat:
                            </span>
                            <div className="join border border-slate-200 rounded-xl overflow-hidden bg-slate-50">
                              {SCORE_PRESETS.map((preset) => (
                                <button
                                  key={preset.value}
                                  type="button"
                                  disabled={readOnly}
                                  onClick={() => handleScoreChange(ind.id, preset.value)}
                                  title={preset.title}
                                  className={`btn btn-xs join-item font-mono tabular-nums font-bold border-none ${
                                    val === preset.value
                                      ? "bg-[#0173b6] text-white shadow-xs"
                                      : "bg-transparent text-slate-600 hover:text-slate-900"
                                  }`}
                                >
                                  {preset.label}
                                </button>
                              ))}
                            </div>
                          </div>

                          {/* Precision Input / Stepper Control */}
                          <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
                            <button
                              type="button"
                              disabled={readOnly || val <= 0}
                              onClick={() => handleAdjustScore(ind.id, -5)}
                              className="btn btn-xs btn-square btn-outline border-slate-200 text-slate-600 hover:bg-slate-100 disabled:opacity-40 rounded-lg"
                              title="Kurangi 5 poin"
                            >
                              <Minus size={12} />
                            </button>

                            <div className="flex items-center gap-1">
                              <input
                                type="number"
                                min={0}
                                max={50}
                                value={val}
                                disabled={readOnly}
                                onChange={(e) => {
                                  const parsed = parseInt(e.target.value, 10);
                                  handleScoreChange(ind.id, isNaN(parsed) ? 0 : parsed);
                                }}
                                className="w-14 h-8 text-center font-mono font-black text-xs text-slate-900 bg-slate-50/80 border border-slate-200/90 rounded-xl focus:bg-white focus:border-[#0173b6] focus:ring-2 focus:ring-[#0173b6]/20 outline-none tabular-nums"
                              />
                              <span className="text-[11px] font-mono text-slate-400">/ 50</span>
                            </div>

                            <button
                              type="button"
                              disabled={readOnly || val >= 50}
                              onClick={() => handleAdjustScore(ind.id, 5)}
                              className="btn btn-xs btn-square btn-outline border-slate-200 text-slate-600 hover:bg-slate-100 disabled:opacity-40 rounded-lg"
                              title="Tambah 5 poin"
                            >
                              <Plus size={12} />
                            </button>

                            {/* Badge Kategori Status */}
                            <span
                              className={`badge badge-sm font-bold ml-1.5 ${grade.badgeClass}`}
                            >
                              {grade.code} • {grade.label}
                            </span>
                          </div>
                        </div>

                        {/* Mini Visual Fill Gauge */}
                        <div className="pt-1">
                          <progress
                            className={`progress ${grade.barClass} w-full h-1.5 rounded-full bg-slate-100`}
                            value={grade.percent}
                            max="100"
                          ></progress>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}

            {/* Evaluasi Kualitatif Section */}
            <div className="eval-kualitatif-card bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-5 sm:p-6 space-y-4">
              <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3">
                <span className="w-6 h-6 rounded-lg bg-[#05445e] text-white font-bold flex items-center justify-center text-xs shrink-0">
                  <FileText size={13} />
                </span>
                <h3 className="text-xs sm:text-sm font-black uppercase tracking-wider text-slate-800">
                  Evaluasi Kualitatif Atasan Penilai
                </h3>
              </div>

              <div className="space-y-4 text-xs">
                <div>
                  <label className="flex items-center gap-1.5 font-bold text-slate-700 mb-1.5">
                    <Trophy size={13} className="text-amber-500" />
                    <span>Kelebihan &amp; Keunggulan Karyawan:</span>
                  </label>
                  <textarea
                    value={kelebihan}
                    onChange={(e) => setKelebihan(e.target.value)}
                    disabled={readOnly}
                    rows={2}
                    className="w-full text-xs p-3 rounded-xl border border-slate-200/90 bg-slate-50/80 focus:bg-white focus:border-[#0173b6] focus:ring-2 focus:ring-[#0173b6]/20 outline-none transition-all font-medium leading-relaxed"
                    placeholder="Tuliskan keunggulan, pencapaian, dan sikap kerja positif pegawai..."
                  />
                </div>

                <div>
                  <label className="flex items-center gap-1.5 font-bold text-slate-700 mb-1.5">
                    <Target size={13} className="text-rose-500" />
                    <span>Kekurangan / Hal yang Perlu Diperbaiki:</span>
                  </label>
                  <textarea
                    value={kekurangan}
                    onChange={(e) => setKekurangan(e.target.value)}
                    disabled={readOnly}
                    rows={2}
                    className="w-full text-xs p-3 rounded-xl border border-slate-200/90 bg-slate-50/80 focus:bg-white focus:border-[#0173b6] focus:ring-2 focus:ring-[#0173b6]/20 outline-none transition-all font-medium leading-relaxed"
                    placeholder="Tuliskan aspek yang perlu peningkatan atau pembinaan lebih lanjut..."
                  />
                </div>

                <div>
                  <label className="flex items-center gap-1.5 font-bold text-slate-700 mb-1.5">
                    <BookOpen size={13} className="text-[#0173b6]" />
                    <span>Pelatihan yang Disarankan:</span>
                  </label>
                  <textarea
                    value={pelatihan}
                    onChange={(e) => setPelatihan(e.target.value)}
                    disabled={readOnly}
                    rows={2}
                    className="w-full text-xs p-3 rounded-xl border border-slate-200/90 bg-slate-50/80 focus:bg-white focus:border-[#0173b6] focus:ring-2 focus:ring-[#0173b6]/20 outline-none transition-all font-medium leading-relaxed"
                    placeholder="Rekomendasi workshop, seminar klinis, atau pelatihan teknis..."
                  />
                </div>

                <div>
                  <label className="flex items-center gap-1.5 font-bold text-slate-700 mb-1.5">
                    <ThumbsUp size={13} className="text-teal-600" />
                    <span>Kesimpulan &amp; Catatan Khusus Pimpinan:</span>
                  </label>
                  <textarea
                    value={catatanSaran}
                    onChange={(e) => setCatatanSaran(e.target.value)}
                    disabled={readOnly}
                    rows={2}
                    className="w-full text-xs p-3 rounded-xl border border-slate-200/90 bg-slate-50/80 focus:bg-white focus:border-[#0173b6] focus:ring-2 focus:ring-[#0173b6]/20 outline-none transition-all font-medium leading-relaxed"
                    placeholder="Catatan penutup mengenai kelayakan dan integritas kerja pegawai..."
                  />
                </div>
              </div>
            </div>

            {/* Rekomendasi Tindak Lanjut Section (Kartu Radio Terstruktur) */}
            <div className="eval-rekomendasi-card bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-5 sm:p-6 space-y-4">
              <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3">
                <span className="w-6 h-6 rounded-lg bg-[#0173b6] text-white font-bold flex items-center justify-center text-xs shrink-0">
                  <CheckCircle2 size={13} />
                </span>
                <h3 className="text-xs sm:text-sm font-black uppercase tracking-wider text-slate-800">
                  Rekomendasi Tindak Lanjut Kepegawaian
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                {/* Opsi 1: Perpanjang Kontrak */}
                <label
                  className={`p-4 border-2 rounded-2xl transition-all cursor-pointer flex flex-col justify-between gap-3 ${
                    rekomendasiUtama === "KONTRAK"
                      ? "border-[#0173b6] bg-blue-50/40 shadow-xs"
                      : "border-slate-200 hover:border-slate-300 bg-white"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="rekomendasi"
                      checked={rekomendasiUtama === "KONTRAK"}
                      onChange={() => setRekomendasiUtama("KONTRAK")}
                      disabled={readOnly}
                      className="radio radio-primary radio-sm cursor-pointer"
                    />
                    <div>
                      <span className="font-black text-slate-900 block text-xs">
                        Perpanjang Kontrak PKWT
                      </span>
                      <span className="text-[11px] text-slate-500 font-medium">
                        Melanjutkan masa pengabdian perjanjian kerja waktu tertentu
                      </span>
                    </div>
                  </div>

                  <div
                    className="flex items-center gap-2 pl-7"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <span className="text-slate-500 text-[11px] font-bold">Durasi:</span>
                    <select
                      value={kontrakTahun}
                      onChange={(e) => setKontrakTahun(Number(e.target.value))}
                      disabled={readOnly || rekomendasiUtama !== "KONTRAK"}
                      className="select select-bordered select-xs rounded-lg font-bold text-slate-800 bg-white"
                    >
                      <option value={1}>1 Tahun</option>
                      <option value={2}>2 Tahun</option>
                      <option value={3}>3 Tahun</option>
                    </select>
                  </div>
                </label>

                {/* Opsi 2: Karyawan Tetap */}
                <label
                  className={`p-4 border-2 rounded-2xl transition-all cursor-pointer flex items-start gap-3 ${
                    rekomendasiUtama === "TETAP"
                      ? "border-emerald-600 bg-emerald-50/40 shadow-xs"
                      : "border-slate-200 hover:border-slate-300 bg-white"
                  }`}
                >
                  <input
                    type="radio"
                    name="rekomendasi"
                    checked={rekomendasiUtama === "TETAP"}
                    onChange={() => setRekomendasiUtama("TETAP")}
                    disabled={readOnly}
                    className="radio radio-success radio-sm cursor-pointer mt-0.5"
                  />
                  <div>
                    <span className="font-black text-slate-900 block text-xs">
                      Pengangkatan Karyawan Tetap (PKWTT)
                    </span>
                    <span className="text-[11px] text-slate-500 font-medium">
                      Direkomendasikan untuk pengangkatan staf permanen rumah sakit
                    </span>
                  </div>
                </label>

                {/* Opsi 3: Promosi */}
                <label
                  className={`p-4 border-2 rounded-2xl transition-all cursor-pointer flex items-start gap-3 ${
                    rekomendasiUtama === "PROMOSI"
                      ? "border-indigo-600 bg-indigo-50/40 shadow-xs"
                      : "border-slate-200 hover:border-slate-300 bg-white"
                  }`}
                >
                  <input
                    type="radio"
                    name="rekomendasi"
                    checked={rekomendasiUtama === "PROMOSI"}
                    onChange={() => setRekomendasiUtama("PROMOSI")}
                    disabled={readOnly}
                    className="radio radio-primary radio-sm cursor-pointer mt-0.5"
                  />
                  <div>
                    <span className="font-black text-slate-900 block text-xs">
                      Promosi Tingkat Jabatan
                    </span>
                    <span className="text-[11px] text-slate-500 font-medium">
                      Kenaikan jenjang karir ke posisi atau level yang lebih tinggi
                    </span>
                  </div>
                </label>

                {/* Opsi 4: Mutasi */}
                <label
                  className={`p-4 border-2 rounded-2xl transition-all cursor-pointer flex items-start gap-3 ${
                    rekomendasiUtama === "MUTASI"
                      ? "border-teal-600 bg-teal-50/40 shadow-xs"
                      : "border-slate-200 hover:border-slate-300 bg-white"
                  }`}
                >
                  <input
                    type="radio"
                    name="rekomendasi"
                    checked={rekomendasiUtama === "MUTASI"}
                    onChange={() => setRekomendasiUtama("MUTASI")}
                    disabled={readOnly}
                    className="radio radio-primary radio-sm cursor-pointer mt-0.5"
                  />
                  <div>
                    <span className="font-black text-slate-900 block text-xs">
                      Mutasi / Rotasi Unit Kerja
                    </span>
                    <span className="text-[11px] text-slate-500 font-medium">
                      Penempatan ke unit atau instalasi rumah sakit yang lain
                    </span>
                  </div>
                </label>

                {/* Opsi 5: Tidak Diperpanjang */}
                <label
                  className={`p-4 border-2 rounded-2xl transition-all cursor-pointer flex items-start gap-3 sm:col-span-2 ${
                    rekomendasiUtama === "TIDAK_LANJUT"
                      ? "border-rose-600 bg-rose-50/40 shadow-xs"
                      : "border-slate-200 hover:border-slate-300 bg-white"
                  }`}
                >
                  <input
                    type="radio"
                    name="rekomendasi"
                    checked={rekomendasiUtama === "TIDAK_LANJUT"}
                    onChange={() => setRekomendasiUtama("TIDAK_LANJUT")}
                    disabled={readOnly}
                    className="radio radio-error radio-sm cursor-pointer mt-0.5"
                  />
                  <div>
                    <span className="font-black text-rose-700 block text-xs">
                      Selesai Kontrak (Tidak Diperpanjang)
                    </span>
                    <span className="text-[11px] text-slate-500 font-medium">
                      Masa kerja berakhir tanpa perpanjangan PKWT sesuai ketentuan rumah sakit
                    </span>
                  </div>
                </label>
              </div>
            </div>

            {/* Submit Bar */}
            <div className="eval-submit-bar bg-white rounded-2xl border border-slate-200/90 shadow-xs p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-center sm:text-left text-xs">
                <p className="font-bold text-slate-800">
                  Verifikasi Penilai: {karyawan.penilai.nama}
                </p>
                <p className="text-[11px] text-slate-400 font-medium">
                  Dokumen Evaluasi Resmi &bull; Human Capital RSU Avisena
                </p>
              </div>

              {!readOnly && (
                <div className="flex items-center gap-2.5 w-full sm:w-auto">
                  {onCancel && (
                    <button
                      type="button"
                      onClick={onCancel}
                      className="btn btn-sm btn-outline border-slate-200 hover:bg-slate-100 text-slate-700 font-bold rounded-xl active:scale-[0.98] transition-all flex-1 sm:flex-none"
                    >
                      Batal
                    </button>
                  )}
                  <button
                    type="submit"
                    className="btn btn-sm bg-[#0173b6] hover:bg-[#05445e] text-white font-bold rounded-xl gap-2 active:scale-[0.98] transition-all shadow-xs flex-1 sm:flex-none"
                  >
                    <span>Simpan &amp; Kirim Evaluasi</span>
                    <ArrowRight size={14} />
                  </button>
                </div>
              )}
            </div>
          </form>
        </main>
      </div>
    </div>
  );
}
