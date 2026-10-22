"use client";

import React from "react";
import {
  Brain,
  Sparkles,
  Award,
  Layers,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  TrendingUp,
  Activity,
} from "lucide-react";

export interface CFITResultData {
  subtest_1_score?: number | string;
  subtest_2_score?: number | string;
  subtest_3_score?: number | string;
  subtest_4_score?: number | string;
  total_score?: number | string;
  iq_score?: number | string;
  category?: string;
  time_spent_seconds?: Record<string, number> | string;
}

interface CFITResultViewProps {
  result: CFITResultData;
  className?: string;
}

export default function CFITResultView({
  result,
  className = "",
}: CFITResultViewProps) {
  const s1 = Number(result?.subtest_1_score || 0);
  const s2 = Number(result?.subtest_2_score || 0);
  const s3 = Number(result?.subtest_3_score || 0);
  const s4 = Number(result?.subtest_4_score || 0);
  const total = Number(result?.total_score || s1 + s2 + s3 + s4);
  const iq = Number(result?.iq_score || 0);
  const category = result?.category || "Average (Rata-rata)";

  const pct1 = Math.round((s1 / 13) * 100);
  const pct2 = Math.round((s2 / 14) * 100);
  const pct3 = Math.round((s3 / 13) * 100);
  const pct4 = Math.round((s4 / 10) * 100);
  const totalPct = Math.round((total / 50) * 100);

  // Klasifikasi warna & styling berdasarkan IQ
  const getIQTheme = (iqScore: number) => {
    if (iqScore >= 170) {
      return {
        badgeBg: "bg-amber-100 text-amber-900 border-amber-300",
        iqBadge: "bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-950",
        accent: "text-amber-500",
        desc: "Kapasitas intelektual jenius dengan daya penalaran abstrak dan sintesis solusi tingkat sangat luar biasa.",
      };
    }
    if (iqScore >= 140) {
      return {
        badgeBg: "bg-purple-100 text-purple-900 border-purple-300",
        iqBadge: "bg-gradient-to-r from-purple-500 to-indigo-600 text-white",
        accent: "text-purple-600",
        desc: "Daya tangkap sangat cepat, kemampuan penalaran logis serta pemecahan masalah non-verbal yang sangat superior.",
      };
    }
    if (iqScore >= 120) {
      return {
        badgeBg: "bg-indigo-100 text-indigo-900 border-indigo-300",
        iqBadge: "bg-gradient-to-r from-indigo-500 to-blue-600 text-white",
        accent: "text-indigo-600",
        desc: "Kemampuan berpikir analitis dan pemahaman hubungan pola yang berada di atas rata-rata populasi umum.",
      };
    }
    if (iqScore >= 110) {
      return {
        badgeBg: "bg-sky-100 text-sky-900 border-sky-300",
        iqBadge: "bg-gradient-to-r from-sky-500 to-blue-600 text-white",
        accent: "text-sky-600",
        desc: "Memiliki daya nalar yang baik, adaptif dalam memahami alur kerja terstruktur dan instruksi baru.",
      };
    }
    if (iqScore >= 90) {
      return {
        badgeBg: "bg-emerald-100 text-emerald-900 border-emerald-300",
        iqBadge: "bg-gradient-to-r from-emerald-500 to-teal-600 text-white",
        accent: "text-emerald-600",
        desc: "Kapasitas intelektual rata-rata (normal) dengan kemampuan nalar fungsional yang stabil dalam aktivitas operasional.",
      };
    }
    if (iqScore >= 80) {
      return {
        badgeBg: "bg-orange-100 text-orange-900 border-orange-300",
        iqBadge: "bg-gradient-to-r from-orange-400 to-amber-500 text-slate-950",
        accent: "text-orange-500",
        desc: "Memerlukan waktu lebih dalam memproses materi visual kompleks atau masalah yang membutuhkan abstraksi tinggi.",
      };
    }
    return {
      badgeBg: "bg-rose-100 text-rose-900 border-rose-300",
      iqBadge: "bg-gradient-to-r from-rose-500 to-red-600 text-white",
      accent: "text-rose-600",
      desc: "Kapasitas penalaran logika abstrak berada pada batas bawah atau membutuhkan pendampingan kerja intensif.",
    };
  };

  const theme = getIQTheme(iq);

  return (
    <div className={`space-y-6 ${className}`}>
      {/* HERO BANNER REKAP IQ & NILAI */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-purple-950 to-indigo-950 text-white p-6 md:p-8 border border-purple-800/40 shadow-xl">
        <div className="absolute top-0 right-0 p-6 opacity-10 pointer-events-none">
          <Brain size={180} />
        </div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-black tracking-wider uppercase">
              <Sparkles size={14} className="text-amber-300" />
              <span>CFIT Skala 3 Form A (Adults 17+)</span>
            </div>

            <h3 className="text-xl md:text-2xl font-black tracking-tight uppercase">
              Culture Fair Intelligence Test
            </h3>

            <p className="text-xs text-purple-200/90 max-w-xl leading-relaxed">
              {theme.desc}
            </p>
          </div>

          {/* IQ SCORE BADGE DISPLAY */}
          <div className="flex flex-col sm:flex-row items-center gap-4 bg-white/10 backdrop-blur-md p-4 rounded-xl border border-white/15 shrink-0 text-center sm:text-left">
            <div className={`w-20 h-20 rounded-2xl flex flex-col items-center justify-center shadow-lg ${theme.iqBadge}`}>
              <span className="text-[10px] font-black uppercase tracking-wider opacity-85 leading-none">
                CFIT IQ
              </span>
              <span className="text-3xl font-black font-mono tracking-tight leading-none mt-1">
                {iq}
              </span>
            </div>

            <div className="space-y-1">
              <span className={`inline-block px-2.5 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider border shadow-xs ${theme.badgeBg}`}>
                {category}
              </span>
              <div className="text-xs text-purple-100 font-medium">
                Skor Mentah: <strong className="text-white font-mono text-sm">{total}</strong> / 50 Poin
              </div>
              <div className="text-[10px] text-purple-300 font-mono">
                Tingkat Akurasi: {totalPct}%
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 4 SUBTEST DETAILED BREAKDOWN GRID */}
      <div>
        <div className="flex items-center justify-between mb-3 border-b border-slate-100 pb-2">
          <h4 className="text-xs font-black uppercase tracking-wider text-slate-800 flex items-center gap-2">
            <Layers size={14} className="text-purple-600" />
            Rincian 4 Dimensi Subtes CFIT
          </h4>
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
            Total 50 Soal Non-Verbal
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Subtest 1: Pola Seri */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between space-y-3 hover:border-purple-300 transition-all">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[10px] font-black uppercase tracking-wider text-purple-700 bg-purple-50 px-2 py-0.5 rounded">
                  Bagian 1
                </span>
                <span className="font-mono text-xs font-black text-slate-800">
                  {s1} / 13
                </span>
              </div>
              <h5 className="font-bold text-xs text-slate-800 leading-tight">
                Pola Seri Gambar (Series)
              </h5>
              <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                Logika sekuensial dan kemampuan memprediksi pola kelanjutan urutan gambar.
              </p>
            </div>

            <div>
              <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden mb-1">
                <div
                  className="bg-purple-600 h-full rounded-full transition-all duration-500"
                  style={{ width: `${pct1}%` }}
                ></div>
              </div>
              <span className="text-[10px] font-bold text-slate-400 font-mono">
                Akurasi: {pct1}%
              </span>
            </div>
          </div>

          {/* Subtest 2: Klasifikasi */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between space-y-3 hover:border-purple-300 transition-all">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[10px] font-black uppercase tracking-wider text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded">
                  Bagian 2
                </span>
                <span className="font-mono text-xs font-black text-slate-800">
                  {s2} / 14
                </span>
              </div>
              <h5 className="font-bold text-xs text-slate-800 leading-tight">
                Klasifikasi Gambar (Classification)
              </h5>
              <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                Diskriminasi visual dan kemampuan menemukan 2 karakteristik serupa yang konsisten.
              </p>
            </div>

            <div>
              <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden mb-1">
                <div
                  className="bg-indigo-600 h-full rounded-full transition-all duration-500"
                  style={{ width: `${pct2}%` }}
                ></div>
              </div>
              <span className="text-[10px] font-bold text-slate-400 font-mono">
                Akurasi: {pct2}%
              </span>
            </div>
          </div>

          {/* Subtest 3: Matriks */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between space-y-3 hover:border-purple-300 transition-all">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[10px] font-black uppercase tracking-wider text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
                  Bagian 3
                </span>
                <span className="font-mono text-xs font-black text-slate-800">
                  {s3} / 13
                </span>
              </div>
              <h5 className="font-bold text-xs text-slate-800 leading-tight">
                Matriks Hubungan (Matrices)
              </h5>
              <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                Penalaran analogis 2 arah dan melengkapi relasi gambar secara logis.
              </p>
            </div>

            <div>
              <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden mb-1">
                <div
                  className="bg-blue-600 h-full rounded-full transition-all duration-500"
                  style={{ width: `${pct3}%` }}
                ></div>
              </div>
              <span className="text-[10px] font-bold text-slate-400 font-mono">
                Akurasi: {pct3}%
              </span>
            </div>
          </div>

          {/* Subtest 4: Topologis */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between space-y-3 hover:border-purple-300 transition-all">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[10px] font-black uppercase tracking-wider text-fuchsia-700 bg-fuchsia-50 px-2 py-0.5 rounded">
                  Bagian 4
                </span>
                <span className="font-mono text-xs font-black text-slate-800">
                  {s4} / 10
                </span>
              </div>
              <h5 className="font-bold text-xs text-slate-800 leading-tight">
                Persyaratan Topologis (Conditions)
              </h5>
              <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                Analisis keterikatan kondisional titik dan fleksibilitas spasial abstrak.
              </p>
            </div>

            <div>
              <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden mb-1">
                <div
                  className="bg-fuchsia-600 h-full rounded-full transition-all duration-500"
                  style={{ width: `${pct4}%` }}
                ></div>
              </div>
              <span className="text-[10px] font-bold text-slate-400 font-mono">
                Akurasi: {pct4}%
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* HR INSIGHT & NORMA CLASSIFICATION TABLE */}
      <div className="bg-slate-50/70 p-4 md:p-5 rounded-xl border border-slate-200 space-y-3">
        <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-slate-700">
          <Activity size={15} className="text-[#0173b6]" />
          Catatan Evaluasi Psikolog / Human Capital:
        </div>
        <p className="text-xs text-slate-600 leading-relaxed">
          Tes CFIT (Culture Fair Intelligence Test) mengukur <em>Fluid Intelligence</em> (kemampuan kognitif murni yang bebas dari pengaruh latar belakang budaya, pendidikan formal, atau bahasa verbal). Skor IQ <strong>{iq} ({category})</strong> menunjukkan kapasitas peserta dalam mengolah informasi baru, memecahkan masalah kompleks yang tidak terduga, dan kecepatan belajar (*learning agility*) dalam tugas profesional.
        </p>
      </div>
    </div>
  );
}
