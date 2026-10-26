"use client";

import React, { useState, useMemo } from "react";
import Image from "next/image";
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
} from "lucide-react";

interface FormPenilaianKinerjaViewProps {
  karyawan: KaryawanKontrakItem;
  readOnly?: boolean;
  onSave?: (data: any) => void;
  onCancel?: () => void;
}

// Helper untuk status performa per nilai (0 - 50)
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

export default function FormPenilaianKinerjaView({
  karyawan,
  readOnly = false,
  onSave,
  onCancel,
}: FormPenilaianKinerjaViewProps) {
  // Cek apakah level jabatan di atas staff
  const isHigherLevel =
    karyawan.level === "Koordinator" ||
    karyawan.level === "SPV" ||
    karyawan.level === "Kanit" ||
    karyawan.level === "Manager";

  // Sakelar aspek ke-10 (Managerial):
  // Staff biasa = default false (pembagi 580)
  // Koordinator / Kanit ke atas = default true (pembagi 700)
  const [includeManagerial, setIncludeManagerial] = useState<boolean>(
    Boolean(karyawan.hasSubordinates && isHigherLevel)
  );

  // Nilai tiap indikator (skala 0 - 50)
  const [scores, setScores] = useState<Record<string, number>>(() => {
    const initial: Record<string, number> = {};
    INDIKATOR_PENILAIAN_LIST.forEach((ind) => {
      initial[ind.id] = 35;
    });
    return initial;
  });

  // Evaluasi Kualitatif
  const [kelebihan, setKelebihan] = useState(
    "Disiplin, teliti dalam bekerja, dan mampu berkomunikasi dengan baik kepada rekan kerja maupun pasien."
  );
  const [kekurangan, setKekurangan] = useState(
    "Perlu peningkatan manajemen waktu dalam menangani beban kerja saat situasi padat."
  );
  const [pelatihan, setPelatihan] = useState(
    "Pelatihan Service Excellence dan Komunikasi Efektif Rumah Sakit."
  );
  const [catatanSaran, setCatatanSaran] = useState(
    "Kinerja secara umum memenuhi standar operasional dan direkomendasikan untuk dipertahankan."
  );

  // Rekomendasi
  const [rekomendasiUtama, setRekomendasiUtama] = useState<
    "KONTRAK" | "TETAP" | "MUTASI" | "PROMOSI" | "DEMOSI" | "TIDAK_LANJUT"
  >("KONTRAK");
  const [kontrakTahun, setKontrakTahun] = useState<number>(1);

  // Indikator aktif (9 atau 10 aspek)
  const activeIndikators = useMemo(() => {
    return INDIKATOR_PENILAIAN_LIST.filter((ind) => {
      if (ind.isManagerial) return includeManagerial;
      return true;
    });
  }, [includeManagerial]);

  // Kelompokkan indikator per aspek
  const groupedAspek = useMemo(() => {
    const groups: { aspekNo: number; aspekNama: string; items: IndikatorPenilaian[] }[] = [];
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

  // Perhitungan skor
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
    <div className="w-full max-w-3xl mx-auto space-y-5 pb-20 font-sans text-slate-800">
      {/* ============================================================== */}
      {/* 1. HEADER PROFIL KARYAWAN (RESPONSIF MOBILE-FIRST)             */}
      {/* ============================================================== */}
      <div className="bg-white p-4 sm:p-7 rounded-xl border border-slate-200 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 left-0 w-1.5 h-full bg-[#0173b6]"></div>

        {/* Top Header: Identitas & Aksi */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div className="flex items-start gap-3 w-full sm:w-auto">
            <div className="w-11 h-11 sm:w-13 sm:h-13 bg-blue-50 rounded-xl flex items-center justify-center text-[#0173b6] border border-blue-100 shrink-0 shadow-xs">
              <User size={22} />
            </div>
            <div className="min-w-0 flex-1">
              <div className="inline-flex items-center gap-1.5 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-100 mb-1">
                <ShieldCheck size={11} className="text-[#0173b6]" />
                <span className="text-[10px] text-[#0173b6] font-mono font-bold tracking-widest uppercase">
                  NIP: {karyawan.nip}
                </span>
              </div>
              <h1 className="text-base sm:text-lg font-black text-slate-800 uppercase tracking-tight leading-tight break-words">
                {karyawan.gelar_depan ? `${karyawan.gelar_depan} ` : ""}
                {karyawan.nama_lengkap}
                {karyawan.gelar_belakang ? `, ${karyawan.gelar_belakang}` : ""}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
            <button
              type="button"
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-slate-600 bg-slate-50 border border-slate-200 rounded-md hover:bg-slate-100 transition-colors"
            >
              <Printer size={13} /> Cetak
            </button>
            {onCancel && (
              <button
                type="button"
                onClick={onCancel}
                className="px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-slate-500 bg-slate-50 border border-slate-200 rounded-md hover:bg-slate-100 transition-colors"
              >
                Tutup
              </button>
            )}
          </div>
        </div>

        {/* Jabatan & Unit Kerja (Tidak Sempit di Mobile) */}
        <div className="mt-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-slate-800 font-semibold">
              <Briefcase size={14} className="text-[#0173b6] shrink-0" />
              <span>{karyawan.jabatan}</span>
            </div>
            <div className="flex items-center gap-1.5 text-slate-500">
              <Building2 size={14} className="text-slate-400 shrink-0" />
              <span>{karyawan.unit} &bull; {karyawan.departemen}</span>
            </div>
          </div>

          <div className="space-y-0.5 sm:text-right pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
            <span className="text-[10px] text-slate-400 uppercase font-semibold block">Penilai:</span>
            <span className="font-bold text-slate-800 block text-xs">{karyawan.penilai.nama}</span>
            <span className="text-[11px] text-slate-500 block">{karyawan.penilai.jabatan}</span>
          </div>
        </div>

        {/* Informasi Pembagi Indeks & Sakelar Aspek Managerial */}
        <div className="mt-3.5 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2.5 text-xs">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[10px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-blue-50 text-[#0173b6] border border-blue-100">
              {includeManagerial ? "Level Kanit+ (10 Aspek)" : "Level Staff Biasa (9 Aspek)"}
            </span>
            <span className="text-slate-500 text-xs font-medium">
              Pembagi Indeks: <b className="font-mono text-slate-800">{calculation.indeksPrestasi}</b>
            </span>
          </div>

          <label className="inline-flex items-center gap-2 cursor-pointer text-slate-600 text-xs shrink-0">
            <span className="font-medium text-[11px]">Aspek Managerial:</span>
            <input
              type="checkbox"
              checked={includeManagerial}
              onChange={(e) => setIncludeManagerial(e.target.checked)}
              disabled={readOnly}
              className="rounded border-slate-300 text-[#0173b6] focus:ring-[#0173b6]"
            />
          </label>
        </div>
      </div>

      {/* ============================================================== */}
      {/* 2. PANDUAN RANGE NILAI (RESPONSIF MOBILE MENGALIR NYAMAN)       */}
      {/* ============================================================== */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-5 shadow-sm space-y-3">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
          <div className="flex items-center gap-2">
            <div className="h-4 w-1 bg-[#0173b6] rounded-full"></div>
            <h2 className="text-xs font-black uppercase tracking-wider text-slate-800">
              Panduan Skala Penilaian Kinerja (Skala 0 - 50)
            </h2>
          </div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 hidden sm:inline">
            Standar RSU Avisena
          </span>
        </div>

        {/* Baris Kapsul Legend Skala Nilai */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-xs">
          <div className="p-2 rounded-lg border border-rose-200 bg-rose-50/60 text-center">
            <span className="block font-mono font-black text-rose-700 text-xs sm:text-sm">0 - 10</span>
            <span className="block text-[10px] sm:text-[11px] font-bold text-rose-900 mt-0.5 truncate">
              KS (Kurang Sekali)
            </span>
          </div>

          <div className="p-2 rounded-lg border border-orange-200 bg-orange-50/60 text-center">
            <span className="block font-mono font-black text-orange-700 text-xs sm:text-sm">11 - 20</span>
            <span className="block text-[10px] sm:text-[11px] font-bold text-orange-900 mt-0.5 truncate">
              K (Kurang)
            </span>
          </div>

          <div className="p-2 rounded-lg border border-amber-200 bg-amber-50/60 text-center">
            <span className="block font-mono font-black text-amber-700 text-xs sm:text-sm">21 - 30</span>
            <span className="block text-[10px] sm:text-[11px] font-bold text-amber-900 mt-0.5 truncate">
              C (Cukup)
            </span>
          </div>

          <div className="p-2 rounded-lg border border-blue-200 bg-blue-50/60 text-center">
            <span className="block font-mono font-black text-[#0173b6] text-xs sm:text-sm">31 - 40</span>
            <span className="block text-[10px] sm:text-[11px] font-bold text-[#0173b6] mt-0.5 truncate">
              B (Baik)
            </span>
          </div>

          <div className="p-2 rounded-lg border border-emerald-200 bg-emerald-50/60 text-center col-span-2 sm:col-span-1">
            <span className="block font-mono font-black text-emerald-700 text-xs sm:text-sm">41 - 50</span>
            <span className="block text-[10px] sm:text-[11px] font-bold text-emerald-900 mt-0.5 truncate">
              BS (Baik Sekali)
            </span>
          </div>
        </div>

        <p className="text-[11px] text-slate-500 leading-relaxed">
          Ketik angka nilai (0 - 50) pada text box setiap indikator. Kategori performa dan hasil $N \times B$ akan terhitung otomatis.
        </p>
      </div>

      {/* ============================================================== */}
      {/* 3. REKAP SKOR BERJALAN (STICKY & RINGKAS DI MOBILE)            */}
      {/* ============================================================== */}
      <div className="sticky top-2 sm:top-4 z-30 bg-gradient-to-r from-[#0173b6] to-[#015a8f] text-white p-3.5 sm:p-5 rounded-xl border border-blue-900/10 shadow-md flex items-center justify-between gap-3">
        <div className="space-y-0.5">
          <div className="text-[10px] font-black uppercase tracking-wider text-blue-200">
            Skor Norma Sementara
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black font-mono text-white leading-none">
              {calculation.norma.toFixed(2)}
            </span>
            <span className="text-xs text-blue-200 font-mono">/ 4.00</span>
            <span className="text-[10px] sm:text-[11px] font-black uppercase px-2 py-0.5 rounded bg-white text-[#0173b6] shadow-xs">
              {calculation.kategori}
            </span>
          </div>
        </div>

        <div className="text-right text-xs text-blue-100 shrink-0">
          <div className="font-mono text-xs sm:text-sm font-bold text-white">
            {calculation.totalScore} <span className="text-blue-200 text-xs font-normal">/ {calculation.indeksPrestasi}</span>
          </div>
          <div className="text-[10px] text-blue-200 mt-0.5">
            {activeIndikators.length} Indikator Terisi
          </div>
        </div>
      </div>

      {/* ============================================================== */}
      {/* 4. DAFTAR ASPEK & INDIKATOR PENILAIAN (LEGA DI MOBILE)         */}
      {/* ============================================================== */}
      <form onSubmit={handleSubmit} className="space-y-5">
        {groupedAspek.map((aspek) => (
          <div
            key={aspek.aspekNo}
            className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden"
          >
            {/* Header Aspek Rapi */}
            <div className="bg-slate-50 border-b border-slate-200 px-4 sm:px-5 py-3 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <div className="h-4 w-1 bg-[#0173b6] rounded-full shrink-0"></div>
                <h2 className="text-xs font-black uppercase tracking-wider text-slate-800 truncate">
                  Aspek {aspek.aspekNo}: {aspek.aspekNama}
                </h2>
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 shrink-0">
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
                  <div key={ind.id} className="p-4 sm:p-5 space-y-3">
                    {/* Baris 1: Judul Indikator & Metadata Nilai */}
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                      <div className="space-y-0.5 flex-1 min-w-0">
                        <h3 className="text-xs sm:text-sm font-black text-slate-800 leading-snug">
                          {ind.nama}
                        </h3>
                        {ind.keterangan && (
                          <p className="text-xs text-slate-500 leading-relaxed mt-0.5">
                            {ind.keterangan}
                          </p>
                        )}
                      </div>

                      {/* Bobot & Hasil Subtotal */}
                      <div className="flex items-center gap-2 self-start sm:self-auto shrink-0 text-xs text-slate-500 bg-slate-50 px-2.5 py-1 rounded-md border border-slate-200">
                        <span>
                          Bobot: <b className="font-mono text-slate-800">{ind.bobot}</b>
                        </span>
                        <span>&bull;</span>
                        <span>
                          Hasil: <b className="font-mono text-[#0173b6] font-black">{subtotal}</b>
                        </span>
                      </div>
                    </div>

                    {/* Baris 2: Input Text Box & Status Performa (Responsif di Layar HP) */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pt-1">
                      {/* Text Box Input Nilai */}
                      <div className="flex items-center gap-2.5">
                        <label className="text-xs font-bold text-slate-700 shrink-0">
                          Nilai:
                        </label>
                        <div className="flex items-center gap-1.5">
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
                            className="w-18 h-9 text-center font-mono font-bold text-sm text-slate-900 bg-white border border-slate-300 rounded-lg focus:border-[#0173b6] focus:ring-2 focus:ring-[#0173b6]/15 outline-none shadow-2xs transition-all"
                            placeholder="0-50"
                          />
                          <span className="text-[11px] font-mono text-slate-400">/ 50</span>
                        </div>
                      </div>

                      {/* Indikator Status Performa (Muncul Otomatis Saat Nilai Diketik) */}
                      <div className="flex items-center gap-2.5 w-full sm:w-auto justify-between sm:justify-end">
                        {/* Mini Meter Visual */}
                        <div className="flex-1 sm:w-28 h-2 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                          <div
                            className={`h-full ${grade.barColor} transition-all duration-300`}
                            style={{ width: `${grade.percent}%` }}
                          ></div>
                        </div>

                        {/* Badge Kategori Terhitung */}
                        <div className={`px-2.5 py-1 rounded-md border text-xs font-bold flex items-center gap-1.5 shrink-0 ${grade.badgeClass}`}>
                          <span className="font-mono font-black">{grade.code}</span>
                          <span>&bull;</span>
                          <span className="whitespace-nowrap">{grade.label}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}

        {/* ============================================================== */}
        {/* 5. EVALUASI KUALITATIF                                         */}
        {/* ============================================================== */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3">
            <div className="h-4 w-1 bg-[#0173b6] rounded-full shrink-0"></div>
            <h2 className="text-xs font-black uppercase tracking-wider text-slate-800">
              Evaluasi Kualitatif Penilai
            </h2>
          </div>

          <div className="space-y-3.5 text-xs">
            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider text-[10px] mb-1">
                Kelebihan Karyawan:
              </label>
              <textarea
                value={kelebihan}
                onChange={(e) => setKelebihan(e.target.value)}
                disabled={readOnly}
                rows={2}
                className="w-full text-xs p-3 rounded-md border border-slate-200 bg-slate-50/60 focus:bg-white focus:border-[#0173b6] outline-none transition-all leading-relaxed"
                placeholder="Tuliskan kelebihan karyawan..."
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider text-[10px] mb-1">
                Kekurangan / Hal yang Perlu Diperbaiki:
              </label>
              <textarea
                value={kekurangan}
                onChange={(e) => setKekurangan(e.target.value)}
                disabled={readOnly}
                rows={2}
                className="w-full text-xs p-3 rounded-md border border-slate-200 bg-slate-50/60 focus:bg-white focus:border-[#0173b6] outline-none transition-all leading-relaxed"
                placeholder="Tuliskan area yang perlu perbaikan..."
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider text-[10px] mb-1">
                Pelatihan yang Disarankan:
              </label>
              <textarea
                value={pelatihan}
                onChange={(e) => setPelatihan(e.target.value)}
                disabled={readOnly}
                rows={2}
                className="w-full text-xs p-3 rounded-md border border-slate-200 bg-slate-50/60 focus:bg-white focus:border-[#0173b6] outline-none transition-all leading-relaxed"
                placeholder="Rekomendasi pelatihan..."
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider text-[10px] mb-1">
                Kesimpulan / Saran Penilai:
              </label>
              <textarea
                value={catatanSaran}
                onChange={(e) => setCatatanSaran(e.target.value)}
                disabled={readOnly}
                rows={2}
                className="w-full text-xs p-3 rounded-md border border-slate-200 bg-slate-50/60 focus:bg-white focus:border-[#0173b6] outline-none transition-all leading-relaxed"
                placeholder="Kesimpulan rekomendasi..."
              />
            </div>
          </div>
        </div>

        {/* ============================================================== */}
        {/* 6. REKOMENDASI TINDAK LANJUT                                   */}
        {/* ============================================================== */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3">
            <div className="h-4 w-1 bg-[#0173b6] rounded-full shrink-0"></div>
            <h2 className="text-xs font-black uppercase tracking-wider text-slate-800">
              Rekomendasi Tindak Lanjut
            </h2>
          </div>

          <div className="space-y-2 text-xs">
            {/* Opsi 1: Kontrak */}
            <label className={`flex flex-col sm:flex-row sm:items-center justify-between p-3 border rounded-md transition-all cursor-pointer gap-2.5 ${
              rekomendasiUtama === "KONTRAK"
                ? "border-[#0173b6] bg-blue-50/30"
                : "border-slate-200 hover:border-slate-300 bg-white"
            }`}>
              <div className="flex items-center gap-3">
                <input
                  type="radio"
                  name="rekomendasi"
                  checked={rekomendasiUtama === "KONTRAK"}
                  onChange={() => setRekomendasiUtama("KONTRAK")}
                  disabled={readOnly}
                  className="text-[#0173b6] focus:ring-[#0173b6] shrink-0"
                />
                <span className="font-bold text-slate-800">Perpanjang Kontrak Kerja</span>
              </div>
              <div className="flex items-center gap-2 pl-7 sm:pl-0" onClick={(e) => e.stopPropagation()}>
                <span className="text-slate-500 text-[11px]">Durasi:</span>
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

            {/* Opsi 2 */}
            <label className={`flex items-center p-3 border rounded-md transition-all cursor-pointer gap-3 ${
              rekomendasiUtama === "TETAP"
                ? "border-emerald-600 bg-emerald-50/30"
                : "border-slate-200 hover:border-slate-300 bg-white"
            }`}>
              <input
                type="radio"
                name="rekomendasi"
                checked={rekomendasiUtama === "TETAP"}
                onChange={() => setRekomendasiUtama("TETAP")}
                disabled={readOnly}
                className="text-emerald-600 focus:ring-emerald-500 shrink-0"
              />
              <span className="font-bold text-slate-800">Pengangkatan Menjadi Karyawan Tetap</span>
            </label>

            {/* Opsi 3 */}
            <label className={`flex items-center p-3 border rounded-md transition-all cursor-pointer gap-3 ${
              rekomendasiUtama === "PROMOSI"
                ? "border-indigo-600 bg-indigo-50/30"
                : "border-slate-200 hover:border-slate-300 bg-white"
            }`}>
              <input
                type="radio"
                name="rekomendasi"
                checked={rekomendasiUtama === "PROMOSI"}
                onChange={() => setRekomendasiUtama("PROMOSI")}
                disabled={readOnly}
                className="text-indigo-600 focus:ring-indigo-500 shrink-0"
              />
              <span className="font-bold text-slate-800">Promosi Jabatan</span>
            </label>

            {/* Opsi 4 */}
            <label className={`flex items-center p-3 border rounded-md transition-all cursor-pointer gap-3 ${
              rekomendasiUtama === "MUTASI"
                ? "border-purple-600 bg-purple-50/30"
                : "border-slate-200 hover:border-slate-300 bg-white"
            }`}>
              <input
                type="radio"
                name="rekomendasi"
                checked={rekomendasiUtama === "MUTASI"}
                onChange={() => setRekomendasiUtama("MUTASI")}
                disabled={readOnly}
                className="text-purple-600 focus:ring-purple-500 shrink-0"
              />
              <span className="font-bold text-slate-800">Mutasi ke Unit Kerja Lain</span>
            </label>

            {/* Opsi 5 */}
            <label className={`flex items-center p-3 border rounded-md transition-all cursor-pointer gap-3 ${
              rekomendasiUtama === "TIDAK_LANJUT"
                ? "border-rose-600 bg-rose-50/30"
                : "border-slate-200 hover:border-slate-300 bg-white"
            }`}>
              <input
                type="radio"
                name="rekomendasi"
                checked={rekomendasiUtama === "TIDAK_LANJUT"}
                onChange={() => setRekomendasiUtama("TIDAK_LANJUT")}
                disabled={readOnly}
                className="text-rose-600 focus:ring-rose-500 shrink-0"
              />
              <span className="font-bold text-slate-800">Selesai Kontrak (Tidak Diperpanjang)</span>
            </label>
          </div>
        </div>

        {/* ============================================================== */}
        {/* 7. TOMBOL FINALISASI (RESPONSIF MOBILE-FIRST)                  */}
        {/* ============================================================== */}
        <div className="p-4 sm:p-6 bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          <div className="space-y-0.5 text-center sm:text-left">
            <p className="text-xs font-black text-slate-800 uppercase tracking-tight">
              Penilai: {karyawan.penilai.nama}
            </p>
            <p className="text-slate-400 text-[10px] font-medium uppercase tracking-wider">
              RSU Avisena Cimahi &bull; Dokumen Evaluasi Resmi
            </p>
          </div>

          {!readOnly && (
            <div className="flex flex-col sm:flex-row items-center gap-2.5 w-full sm:w-auto">
              {onCancel && (
                <button
                  type="button"
                  onClick={onCancel}
                  className="w-full sm:w-auto px-5 py-3 border border-slate-200 text-slate-600 rounded-md text-[10px] font-black uppercase tracking-widest hover:bg-slate-50 transition-all cursor-pointer"
                >
                  Batal
                </button>
              )}
              <button
                type="submit"
                className="w-full sm:w-auto px-7 py-3 bg-[#0173b6] text-white font-black rounded-md hover:bg-[#015a8f] transition-all shadow-md shadow-blue-100 flex items-center justify-center gap-2 uppercase text-[10px] tracking-widest active:scale-95 cursor-pointer"
              >
                <span>Kirim Penilaian Kinerja</span>
                <ArrowRight size={14} />
              </button>
            </div>
          )}
        </div>
      </form>
    </div>
  );
}
