"use client";

import React, { useState, useMemo } from "react";
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

function getPerformanceGrade(val: number) {
  if (val >= 41) {
    return {
      code: "BS",
      label: "Baik Sekali",
      badgeClass: "bg-emerald-50 text-emerald-700 border-emerald-200",
      barColor: "bg-emerald-500",
      percent: Math.min(100, Math.round((val / 50) * 100)),
    };
  }
  if (val >= 31) {
    return {
      code: "B",
      label: "Baik",
      badgeClass: "bg-blue-50 text-[#0173b6] border-blue-200",
      barColor: "bg-[#0173b6]",
      percent: Math.min(100, Math.round((val / 50) * 100)),
    };
  }
  if (val >= 21) {
    return {
      code: "C",
      label: "Cukup",
      badgeClass: "bg-amber-50 text-amber-700 border-amber-200",
      barColor: "bg-amber-500",
      percent: Math.min(100, Math.round((val / 50) * 100)),
    };
  }
  if (val >= 11) {
    return {
      code: "K",
      label: "Kurang",
      badgeClass: "bg-orange-50 text-orange-700 border-orange-200",
      barColor: "bg-orange-500",
      percent: Math.min(100, Math.round((val / 50) * 100)),
    };
  }
  return {
    code: "KS",
    label: "Kurang Sekali",
    badgeClass: "bg-rose-50 text-rose-700 border-rose-200",
    barColor: "bg-rose-500",
    percent: Math.min(100, Math.round((val / 50) * 100)),
  };
}

const SCORE_PRESETS = [
  { value: 10, label: "KS", title: "Kurang Sekali (10)" },
  { value: 20, label: "K", title: "Kurang (20)" },
  { value: 30, label: "C", title: "Cukup (30)" },
  { value: 40, label: "B", title: "Baik (40)" },
  { value: 50, label: "BS", title: "Baik Sekali (50)" },
] as const;

export default function FormPenilaianKinerjaView({
  karyawan,
  readOnly = false,
  onSave,
  onCancel,
}: FormPenilaianKinerjaViewProps) {
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

  return (
    <div className="w-full max-w-6xl mx-auto font-sans text-slate-800 pb-16">
      {/* 2-Column Responsive Layout: Sidebar & Assessment Content */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* ============================================================== */}
        {/* KOLOM KIRI: STICKY SIDEBAR (PROFIL, SKOR REKAP & NAVIGASI)     */}
        {/* ============================================================== */}
        <div className="lg:col-span-4 space-y-5 lg:sticky lg:top-4 z-20">
          {/* Card 1: Identitas Pegawai & Penilai */}
          <div className="bg-white rounded-xl border border-slate-200/90 shadow-sm p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Profil Pegawai
              </span>
              <span className="px-2 py-0.5 rounded-full bg-blue-50 text-[#0173b6] text-[10px] font-mono font-bold tabular-nums">
                NIP: {karyawan.nip}
              </span>
            </div>

            <div className="space-y-1">
              <h2 className="text-base font-bold text-slate-900 leading-tight">
                {karyawan.gelar_depan ? `${karyawan.gelar_depan} ` : ""}
                {karyawan.nama_lengkap}
                {karyawan.gelar_belakang ? `, ${karyawan.gelar_belakang}` : ""}
              </h2>
              <p className="text-xs font-semibold text-[#0173b6]">
                {karyawan.jabatan}
              </p>
              <p className="text-xs text-slate-500">
                {karyawan.unit} &bull; {karyawan.departemen}
              </p>
            </div>

            <div className="pt-3 border-t border-slate-100 text-xs space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                Pimpinan Penilai:
              </span>
              <p className="font-semibold text-slate-800">{karyawan.penilai.nama}</p>
              <p className="text-[11px] text-slate-500">{karyawan.penilai.jabatan}</p>
            </div>

            {/* Aspek Manajerial Toggle */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
              <div>
                <p className="font-semibold text-slate-800 text-[11px]">
                  Aspek Manajerial (Ke-10)
                </p>
                <p className="text-[10px] text-slate-400">
                  Pembagi: <b className="font-mono text-slate-700">{calculation.indeksPrestasi}</b>
                </p>
              </div>

              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeManagerial}
                  onChange={(e) => setIncludeManagerial(e.target.checked)}
                  disabled={readOnly}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#0173b6]" />
              </label>
            </div>
          </div>

          {/* Card 2: Live Norma Scorecard (High Contrast Enterprise Grade) */}
          <div className="bg-gradient-to-br from-[#05445e] via-[#0173b6] to-sky-700 text-white rounded-xl shadow-md p-5 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-blue-100">
                Kalkulasi Nilai Norma
              </span>
              <span className="px-2.5 py-1 rounded-md bg-white text-[#0173b6] text-xs font-black uppercase tracking-wider shadow-xs">
                {calculation.kategori}
              </span>
            </div>

            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-black font-mono tabular-nums leading-none">
                {calculation.norma.toFixed(2)}
              </span>
              <span className="text-sm font-mono text-blue-200">/ 4.00</span>
            </div>

            <div className="pt-3 border-t border-white/20 text-xs space-y-1.5 font-medium">
              <div className="flex justify-between text-blue-100">
                <span>Total Skor Tertimbang:</span>
                <span className="font-mono font-bold text-white tabular-nums">
                  {calculation.totalScore}
                </span>
              </div>
              <div className="flex justify-between text-blue-100">
                <span>Pembagi Indeks:</span>
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

          {/* Action Buttons Cetak & Batal */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="flex-1 inline-flex items-center justify-center gap-1.5 py-2.5 px-3 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-semibold rounded-lg text-xs transition-colors shadow-2xs"
            >
              <Printer size={14} className="text-slate-500" />
              <span>Cetak Form</span>
            </button>

            {onCancel && (
              <button
                type="button"
                onClick={onCancel}
                className="py-2.5 px-4 bg-white hover:bg-slate-50 border border-slate-200 text-slate-600 font-semibold rounded-lg text-xs transition-colors shadow-2xs"
              >
                Tutup
              </button>
            )}
          </div>
        </div>

        {/* ============================================================== */}
        {/* KOLOM KANAN: FORM EVALUASI, INDIKATOR, KUALITATIF & REKOMENDASI*/}
        {/* ============================================================== */}
        <div className="lg:col-span-8 space-y-6">
          {/* Panduan Skala Nilai */}
          <div className="bg-white rounded-xl border border-slate-200/90 shadow-sm p-4 sm:p-5 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                Panduan Skala Penilaian Kinerja (Skala 0 - 50)
              </h3>
              <span className="text-[10px] font-bold uppercase text-slate-400">
                Form/HRD/XI/REV.1
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-center text-xs">
              <div className="p-2 rounded-lg border border-rose-200 bg-rose-50/50">
                <span className="font-mono font-bold text-rose-700 text-xs block">0 - 10</span>
                <span className="text-[10px] font-semibold text-rose-800">KS (Kurang Sekali)</span>
              </div>
              <div className="p-2 rounded-lg border border-orange-200 bg-orange-50/50">
                <span className="font-mono font-bold text-orange-700 text-xs block">11 - 20</span>
                <span className="text-[10px] font-semibold text-orange-800">K (Kurang)</span>
              </div>
              <div className="p-2 rounded-lg border border-amber-200 bg-amber-50/50">
                <span className="font-mono font-bold text-amber-700 text-xs block">21 - 30</span>
                <span className="text-[10px] font-semibold text-amber-800">C (Cukup)</span>
              </div>
              <div className="p-2 rounded-lg border border-blue-200 bg-blue-50/50">
                <span className="font-mono font-bold text-[#0173b6] text-xs block">31 - 40</span>
                <span className="text-[10px] font-semibold text-blue-800">B (Baik)</span>
              </div>
              <div className="p-2 rounded-lg border border-emerald-200 bg-emerald-50/50 col-span-2 sm:col-span-1">
                <span className="font-mono font-bold text-emerald-700 text-xs block">41 - 50</span>
                <span className="text-[10px] font-semibold text-emerald-800">BS (Baik Sekali)</span>
              </div>
            </div>
          </div>

          {/* Form Evaluasi Utama */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Loop Aspek & Indikator */}
            {groupedAspek.map((aspek) => (
              <div
                key={aspek.aspekNo}
                className="bg-white rounded-xl border border-slate-200/90 shadow-sm overflow-hidden"
              >
                {/* Header Aspek */}
                <div className="bg-slate-50/80 border-b border-slate-200/80 px-4 sm:px-6 py-3.5 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="h-4 w-1 bg-[#0173b6] rounded-full" />
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                      Aspek {aspek.aspekNo}: {aspek.aspekNama}
                    </h3>
                  </div>
                  <span className="text-[11px] font-medium text-slate-500">
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
                      <div key={ind.id} className="p-4 sm:p-5 space-y-3 hover:bg-slate-50/30 transition-colors">
                        {/* Judul & Penjelasan Indikator */}
                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                          <div className="space-y-1 flex-1">
                            <h4 className="text-xs sm:text-sm font-bold text-slate-900 leading-snug">
                              {ind.nama}
                            </h4>
                            {ind.keterangan && (
                              <p className="text-xs text-slate-500 leading-relaxed">
                                {ind.keterangan}
                              </p>
                            )}
                          </div>

                          {/* Bobot & Subtotal */}
                          <div className="flex items-center gap-2 self-start sm:self-auto shrink-0 text-xs text-slate-600 bg-slate-50 px-2.5 py-1 rounded-md border border-slate-200">
                            <span>
                              Bobot: <b className="font-mono text-slate-800">{ind.bobot}</b>
                            </span>
                            <span className="text-slate-300">&bull;</span>
                            <span>
                              Hasil: <b className="font-mono text-[#0173b6] font-bold">{subtotal}</b>
                            </span>
                          </div>
                        </div>

                        {/* Kontrol Input Nilai: Quick Preset Buttons & Precision Stepper */}
                        <div className="pt-1 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          {/* Quick Score Presets (Satu Klik Mengisi Nilai Standar) */}
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="text-[11px] font-medium text-slate-400 mr-1">
                              Pilih Cepat:
                            </span>
                            {SCORE_PRESETS.map((preset) => (
                              <button
                                key={preset.value}
                                type="button"
                                disabled={readOnly}
                                onClick={() => handleScoreChange(ind.id, preset.value)}
                                title={preset.title}
                                className={`px-2 py-1 text-xs font-semibold rounded border transition-all ${
                                  val === preset.value
                                    ? "bg-[#0173b6] text-white border-[#0173b6] shadow-xs"
                                    : "bg-white hover:bg-slate-50 text-slate-600 border-slate-200"
                                }`}
                              >
                                {preset.value}
                              </button>
                            ))}
                          </div>

                          {/* Precision Input / Stepper Control */}
                          <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
                            <button
                              type="button"
                              disabled={readOnly || val <= 0}
                              onClick={() => handleAdjustScore(ind.id, -5)}
                              className="p-1.5 rounded border border-slate-200 hover:bg-slate-50 text-slate-600 disabled:opacity-40"
                              title="Kurangi 5 poin"
                            >
                              <Minus size={13} />
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
                                className="w-16 h-8 text-center font-mono font-bold text-xs text-slate-900 bg-white border border-slate-300 rounded-md focus:border-[#0173b6] focus:ring-1 focus:ring-[#0173b6] outline-none"
                              />
                              <span className="text-[11px] font-mono text-slate-400">/ 50</span>
                            </div>

                            <button
                              type="button"
                              disabled={readOnly || val >= 50}
                              onClick={() => handleAdjustScore(ind.id, 5)}
                              className="p-1.5 rounded border border-slate-200 hover:bg-slate-50 text-slate-600 disabled:opacity-40"
                              title="Tambah 5 poin"
                            >
                              <Plus size={13} />
                            </button>

                            {/* Badge Kategori */}
                            <span
                              className={`px-2 py-0.5 rounded text-xs font-bold border ml-1 whitespace-nowrap ${grade.badgeClass}`}
                            >
                              {grade.code} &bull; {grade.label}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}

            {/* Evaluasi Kualitatif Section */}
            <div className="bg-white rounded-xl border border-slate-200/90 shadow-sm p-5 sm:p-6 space-y-4">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                <div className="h-4 w-1 bg-[#0173b6] rounded-full" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                  Evaluasi Kualitatif Atasan Penilai
                </h3>
              </div>

              <div className="space-y-4 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Kelebihan & Keunggulan Karyawan:
                  </label>
                  <textarea
                    value={kelebihan}
                    onChange={(e) => setKelebihan(e.target.value)}
                    disabled={readOnly}
                    rows={2}
                    className="w-full text-xs p-3 rounded-lg border border-slate-200 bg-slate-50/50 focus:bg-white focus:border-[#0173b6] focus:ring-1 focus:ring-[#0173b6] outline-none transition-all leading-relaxed"
                    placeholder="Tuliskan keunggulan dan prestasi kerja pegawai..."
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Kekurangan / Hal yang Perlu Diperbaiki:
                  </label>
                  <textarea
                    value={kekurangan}
                    onChange={(e) => setKekurangan(e.target.value)}
                    disabled={readOnly}
                    rows={2}
                    className="w-full text-xs p-3 rounded-lg border border-slate-200 bg-slate-50/50 focus:bg-white focus:border-[#0173b6] focus:ring-1 focus:ring-[#0173b6] outline-none transition-all leading-relaxed"
                    placeholder="Tuliskan aspek yang perlu perbaikan atau bimbingan..."
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Pelatihan yang Disarankan:
                  </label>
                  <textarea
                    value={pelatihan}
                    onChange={(e) => setPelatihan(e.target.value)}
                    disabled={readOnly}
                    rows={2}
                    className="w-full text-xs p-3 rounded-lg border border-slate-200 bg-slate-50/50 focus:bg-white focus:border-[#0173b6] focus:ring-1 focus:ring-[#0173b6] outline-none transition-all leading-relaxed"
                    placeholder="Rekomendasi workshop, seminar, atau pelatihan kompetensi..."
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Kesimpulan & Saran Penilai:
                  </label>
                  <textarea
                    value={catatanSaran}
                    onChange={(e) => setCatatanSaran(e.target.value)}
                    disabled={readOnly}
                    rows={2}
                    className="w-full text-xs p-3 rounded-lg border border-slate-200 bg-slate-50/50 focus:bg-white focus:border-[#0173b6] focus:ring-1 focus:ring-[#0173b6] outline-none transition-all leading-relaxed"
                    placeholder="Catatan penutup mengenai kelayakan pegawai..."
                  />
                </div>
              </div>
            </div>

            {/* Rekomendasi Tindak Lanjut Section (Kartu Radio Terstruktur) */}
            <div className="bg-white rounded-xl border border-slate-200/90 shadow-sm p-5 sm:p-6 space-y-4">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                <div className="h-4 w-1 bg-[#0173b6] rounded-full" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                  Rekomendasi Tindak Lanjut
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                {/* Opsi 1: Perpanjang Kontrak */}
                <label
                  className={`p-3.5 border rounded-lg transition-all cursor-pointer flex flex-col justify-between gap-2 ${
                    rekomendasiUtama === "KONTRAK"
                      ? "border-[#0173b6] bg-blue-50/30 ring-1 ring-[#0173b6]"
                      : "border-slate-200 hover:border-slate-300 bg-white"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <input
                      type="radio"
                      name="rekomendasi"
                      checked={rekomendasiUtama === "KONTRAK"}
                      onChange={() => setRekomendasiUtama("KONTRAK")}
                      disabled={readOnly}
                      className="text-[#0173b6] focus:ring-[#0173b6]"
                    />
                    <span className="font-bold text-slate-900">Perpanjang Kontrak Kerja</span>
                  </div>

                  <div
                    className="flex items-center gap-2 pl-6"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <span className="text-slate-500 text-[11px]">Durasi Kontrak:</span>
                    <select
                      value={kontrakTahun}
                      onChange={(e) => setKontrakTahun(Number(e.target.value))}
                      disabled={readOnly || rekomendasiUtama !== "KONTRAK"}
                      className="border border-slate-300 rounded px-2 py-1 text-xs bg-white text-slate-800 font-bold"
                    >
                      <option value={1}>1 Tahun</option>
                      <option value={2}>2 Tahun</option>
                      <option value={3}>3 Tahun</option>
                    </select>
                  </div>
                </label>

                {/* Opsi 2: Karyawan Tetap */}
                <label
                  className={`p-3.5 border rounded-lg transition-all cursor-pointer flex items-center gap-2.5 ${
                    rekomendasiUtama === "TETAP"
                      ? "border-emerald-600 bg-emerald-50/30 ring-1 ring-emerald-600"
                      : "border-slate-200 hover:border-slate-300 bg-white"
                  }`}
                >
                  <input
                    type="radio"
                    name="rekomendasi"
                    checked={rekomendasiUtama === "TETAP"}
                    onChange={() => setRekomendasiUtama("TETAP")}
                    disabled={readOnly}
                    className="text-emerald-600 focus:ring-emerald-500"
                  />
                  <div>
                    <span className="font-bold text-slate-900 block">
                      Pengangkatan Karyawan Tetap
                    </span>
                    <span className="text-[11px] text-slate-500">
                      Direkomendasikan untuk penetapan PKWTT
                    </span>
                  </div>
                </label>

                {/* Opsi 3: Promosi */}
                <label
                  className={`p-3.5 border rounded-lg transition-all cursor-pointer flex items-center gap-2.5 ${
                    rekomendasiUtama === "PROMOSI"
                      ? "border-indigo-600 bg-indigo-50/30 ring-1 ring-indigo-600"
                      : "border-slate-200 hover:border-slate-300 bg-white"
                  }`}
                >
                  <input
                    type="radio"
                    name="rekomendasi"
                    checked={rekomendasiUtama === "PROMOSI"}
                    onChange={() => setRekomendasiUtama("PROMOSI")}
                    disabled={readOnly}
                    className="text-indigo-600 focus:ring-indigo-500"
                  />
                  <span className="font-bold text-slate-900">Promosi Tingkat Jabatan</span>
                </label>

                {/* Opsi 4: Mutasi */}
                <label
                  className={`p-3.5 border rounded-lg transition-all cursor-pointer flex items-center gap-2.5 ${
                    rekomendasiUtama === "MUTASI"
                      ? "border-purple-600 bg-purple-50/30 ring-1 ring-purple-600"
                      : "border-slate-200 hover:border-slate-300 bg-white"
                  }`}
                >
                  <input
                    type="radio"
                    name="rekomendasi"
                    checked={rekomendasiUtama === "MUTASI"}
                    onChange={() => setRekomendasiUtama("MUTASI")}
                    disabled={readOnly}
                    className="text-purple-600 focus:ring-purple-500"
                  />
                  <span className="font-bold text-slate-900">Mutasi / Rotasi ke Unit Lain</span>
                </label>

                {/* Opsi 5: Tidak Diperpanjang */}
                <label
                  className={`p-3.5 border rounded-lg transition-all cursor-pointer flex items-center gap-2.5 sm:col-span-2 ${
                    rekomendasiUtama === "TIDAK_LANJUT"
                      ? "border-rose-600 bg-rose-50/30 ring-1 ring-rose-600"
                      : "border-slate-200 hover:border-slate-300 bg-white"
                  }`}
                >
                  <input
                    type="radio"
                    name="rekomendasi"
                    checked={rekomendasiUtama === "TIDAK_LANJUT"}
                    onChange={() => setRekomendasiUtama("TIDAK_LANJUT")}
                    disabled={readOnly}
                    className="text-rose-600 focus:ring-rose-500"
                  />
                  <div>
                    <span className="font-bold text-rose-700 block">
                      Selesai Kontrak (Tidak Diperpanjang)
                    </span>
                    <span className="text-[11px] text-slate-500">
                      Masa kerja berakhir tanpa perpanjangan PKWT
                    </span>
                  </div>
                </label>
              </div>
            </div>

            {/* Submit Bar */}
            <div className="bg-white rounded-xl border border-slate-200/90 shadow-sm p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-center sm:text-left text-xs">
                <p className="font-bold text-slate-800">
                  Verifikasi Penilai: {karyawan.penilai.nama}
                </p>
                <p className="text-[11px] text-slate-400">
                  Dokumen Evaluasi Resmi &bull; Human Capital RSU Avisena
                </p>
              </div>

              {!readOnly && (
                <div className="flex items-center gap-2.5 w-full sm:w-auto">
                  {onCancel && (
                    <button
                      type="button"
                      onClick={onCancel}
                      className="flex-1 sm:flex-none px-4 py-2 border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-lg text-xs font-semibold transition-colors"
                    >
                      Batal
                    </button>
                  )}
                  <button
                    type="submit"
                    className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-[#0173b6] hover:bg-[#015f96] text-white rounded-lg text-xs font-bold shadow-sm transition-all active:scale-[0.98]"
                  >
                    <span>Simpan & Kirim Evaluasi</span>
                    <ArrowRight size={14} />
                  </button>
                </div>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
