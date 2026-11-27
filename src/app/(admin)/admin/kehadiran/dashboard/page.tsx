"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import Link from "next/link";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";

if (typeof window !== "undefined") {
  gsap.registerPlugin(useGSAP);
}

import {
  Users,
  Clock,
  AlertTriangle,
  CalendarDays,
  Loader2,
  ArrowRight,
  RotateCcw,
  CheckCircle2,
  Building2,
  Calendar,
  Layers,
  FileText,
  Briefcase,
  TrendingUp,
} from "lucide-react";
import SearchableSelect from "@/app/components/admin/SearchableSelect";

type FormOption = { value: string; label: string };

export default function DashboardAbsensiPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [selectedUnit, setSelectedUnit] = useState<FormOption | null>({
    value: "all",
    label: "Semua Unit (Seluruh Karyawan)",
  });
  const [departemenList, setDepartemenList] = useState<{ id: string; nama_departemen: string }[]>([]);
  const [stats, setStats] = useState({
    totalKaryawan: 0,
    hadirHariIni: 0,
    tepatWaktuHariIni: 0,
    terlambatHariIni: 0,
    cutiHariIni: 0,
    izinHariIni: 0,
    liburHariIni: 0,
    alphaHariIni: 0,
    kehadiranHariIniRate: 0,
    kehadiranBulanIni: 0,
    cutiRateBulanIni: 0,
    izinRateBulanIni: 0,
    totalDinasAktif: 0,
    totalHadirCutOff: 0,
    totalTepatWaktuCutOff: 0,
    totalTelatCutOff: 0,
    totalAlphaCutOff: 0,
    totalCutiCutOff: 0,
    totalIzinCutOff: 0,
    totalLiburCutOff: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    fetch("/api/departemen")
      .then((res) => res.json())
      .then((data) => setDepartemenList(Array.isArray(data) ? data : []))
      .catch(console.error);
  }, []);

  const fetchStats = () => {
    let superiorParam = "";
    try {
      const userStr = localStorage.getItem("user");
      if (userStr) {
        const userObj = JSON.parse(userStr);
        const role = userObj.role?.toLowerCase() || "";
        if (role === "spv" || role === "supervisor" || role === "koordinator") {
          superiorParam = `&superiorId=${userObj.karyawan_id}`;
        }
      }
    } catch (e) {
      console.error(e);
    }

    setIsLoading(true);
    const unitVal = selectedUnit?.value || "all";
    fetch(`/api/absensi/dashboard?unit=${unitVal}${superiorParam}`)
      .then((res) => res.json())
      .then((data) => {
        setStats({
          totalKaryawan: data.totalKaryawan || 0,
          hadirHariIni: data.hadirHariIni || 0,
          tepatWaktuHariIni:
            data.tepatWaktuHariIni ?? Math.max(0, (data.hadirHariIni || 0) - (data.terlambatHariIni || 0)),
          terlambatHariIni: data.terlambatHariIni || 0,
          cutiHariIni: data.cutiHariIni || 0,
          izinHariIni: data.izinHariIni || 0,
          liburHariIni: data.liburHariIni || 0,
          alphaHariIni: data.alphaHariIni || 0,
          kehadiranHariIniRate: data.kehadiranHariIniRate ?? 0,
          kehadiranBulanIni: data.kehadiranBulanIni || 0,
          cutiRateBulanIni: data.cutiRateBulanIni || 0,
          izinRateBulanIni: data.izinRateBulanIni || 0,
          totalDinasAktif: data.totalDinasAktif || 0,
          totalHadirCutOff: data.totalHadirCutOff || 0,
          totalTepatWaktuCutOff: data.totalTepatWaktuCutOff || 0,
          totalTelatCutOff: data.totalTelatCutOff || 0,
          totalAlphaCutOff: data.totalAlphaCutOff || 0,
          totalCutiCutOff: data.totalCutiCutOff || 0,
          totalIzinCutOff: data.totalIzinCutOff || 0,
          totalLiburCutOff: data.totalLiburCutOff || 0,
        });
      })
      .catch(console.error)
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    fetchStats();
  }, [selectedUnit]);

  // Format options for SearchableSelect
  const unitOptions: FormOption[] = useMemo(() => {
    return [
      { value: "all", label: "Semua Unit (Seluruh Karyawan)" },
      ...departemenList.map((dep) => ({ value: dep.id, label: dep.nama_departemen })),
    ];
  }, [departemenList]);

  // GSAP: Entrance animation for the dashboard
  useGSAP(
    () => {
      const tl = gsap.timeline({ defaults: { ease: "power2.out" } });

      tl.from(".dash-header", {
        y: -12,
        opacity: 0,
        duration: 0.45,
        clearProps: "all",
      })
        .from(
          ".dash-filter",
          {
            y: 12,
            opacity: 0,
            duration: 0.35,
            clearProps: "all",
          },
          "-=0.2"
        )
        .from(
          ".dash-kpi-card",
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
          ".dash-analytic-card",
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
    { scope: containerRef, dependencies: [isLoading] }
  );

  const dateStr = useMemo(() => {
    return new Date().toLocaleDateString("id-ID", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  }, []);

  // Rumus Harian: ((Tepat Waktu + Terlambat + Cuti + Izin) * 100) / (Total Karyawan - Libur Hari Ini)
  const wajibHadirHariIni = Math.max(0, stats.totalKaryawan - stats.liburHariIni);
  const hadirPercent =
    stats.kehadiranHariIniRate > 0
      ? stats.kehadiranHariIniRate
      : wajibHadirHariIni > 0
      ? Math.min(
          Number(
            (
              ((stats.hadirHariIni + stats.cutiHariIni + stats.izinHariIni) * 100) /
              wajibHadirHariIni
            ).toFixed(1)
          ),
          100
        )
      : 0;

  return (
    <div ref={containerRef} className="p-8 font-sans min-h-screen space-y-6">
      {/* 1. Header Halaman (Identik dengan Standar Halaman Admin) */}
      <div className="dash-header flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-2 border-b border-slate-200/80">
        <div>
          <div className="flex items-center gap-2 mb-1 text-primary font-bold uppercase tracking-wider text-xs">
            <Users size={15} />
            <span>Sistem Manajemen Presensi &amp; Kehadiran</span>
          </div>
          <h1 className="text-3xl font-bold text-primary-dark tracking-tight">
            Dashboard Kehadiran
          </h1>
          <p className="text-slate-500 font-medium text-sm mt-1 max-w-2xl">
            Ringkasan kehadiran harian real-time, tingkat keterlambatan, dan monitoring absensi per unit kerja RSU Avisena.
          </p>
        </div>

        <div className="flex items-center gap-2.5 w-full md:w-auto">
          <button
            type="button"
            onClick={fetchStats}
            className="btn btn-sm btn-outline border-slate-200 hover:bg-slate-100 text-slate-700 font-bold rounded-xl gap-2 active:scale-[0.98] transition-all"
            title="Segarkan Data Presensi"
          >
            <RotateCcw size={14} className={isLoading ? "animate-spin" : ""} />
            <span>Segarkan</span>
          </button>
          <Link
            href="/admin/kehadiran/rekap"
            className="btn btn-sm bg-[#0173b6] hover:bg-[#05445e] text-white font-bold rounded-xl gap-2 active:scale-[0.98] transition-all shadow-xs"
          >
            <span>Rekapitulasi Bulanan</span>
            <ArrowRight size={14} />
          </Link>
        </div>
      </div>

      {/* 2. Filter & Unit Context Bar */}
      <div className="dash-filter bg-white p-4 md:p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#0173b6] flex items-center justify-center font-bold shrink-0">
              <Building2 size={20} />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Pilih Unit / Departemen
              </p>
              <p className="text-[11px] text-slate-400 font-medium">
                Penyaringan data kehadiran sesuai struktur instalasi rumah sakit
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="w-full md:w-80">
              {isClient ? (
                <SearchableSelect
                  options={unitOptions}
                  value={selectedUnit}
                  onChange={(val) => setSelectedUnit(val as FormOption | null)}
                  placeholder="Pilih Unit / Departemen..."
                  isClearable={false}
                />
              ) : (
                <div className="w-full h-[38px] bg-slate-100 rounded-xl animate-pulse" />
              )}
            </div>

            <div className="hidden lg:flex items-center gap-2 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold tabular-nums text-slate-600 shrink-0">
              <Calendar size={14} className="text-[#0173b6]" />
              <span>{dateStr} (WIB)</span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. KPI Summary Ribbon (4 Grid Cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {/* Card 1: Total Karyawan */}
        <div className="dash-kpi-card bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Total Personil Terjadwal
            </p>
            <p className="text-2xl font-black text-slate-800 mt-0.5 font-mono tabular-nums">
              {stats.totalKaryawan}
              <span className="text-xs font-semibold text-slate-500 ml-1.5 font-sans">Orang</span>
            </p>
            <p className="text-[11px] text-slate-400 mt-1">Staf dalam unit kerja</p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-blue-50 text-[#0173b6] flex items-center justify-center font-bold">
            <Users size={20} />
          </div>
        </div>

        {/* Card 2: Hadir Hari Ini */}
        <div className="dash-kpi-card bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Hadir Hari Ini
            </p>
            <div className="flex items-baseline gap-2 mt-0.5">
              <span className="text-2xl font-black text-emerald-600 font-mono tabular-nums">
                {stats.hadirHariIni}
              </span>
              <span className="badge badge-success badge-sm font-bold text-white font-mono tabular-nums">
                {hadirPercent}%
              </span>
            </div>
            <p className="text-[11px] text-emerald-600 font-semibold mt-1 font-mono tabular-nums">
              {stats.tepatWaktuHariIni} Tepat • {stats.terlambatHariIni} Telat • {stats.cutiHariIni + stats.izinHariIni} Cuti/Izin
            </p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            <CalendarDays size={20} />
          </div>
        </div>

        {/* Card 3: Tepat Waktu vs Terlambat Masuk */}
        <div className="dash-kpi-card bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Tepat Waktu vs Telat
            </p>
            <p className="text-2xl font-black text-amber-600 mt-0.5 font-mono tabular-nums">
              <span className="text-emerald-600">{stats.tepatWaktuHariIni}</span>
              <span className="text-slate-300 mx-1.5">/</span>
              <span>{stats.terlambatHariIni}</span>
              <span className="text-xs font-semibold text-slate-500 ml-1.5 font-sans">Staf</span>
            </p>
            <p className="text-[11px] text-slate-400 mt-1 font-mono tabular-nums">
              Hijau: Tepat • Kuning: Terlambat
            </p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
            <Clock size={20} />
          </div>
        </div>

        {/* Card 4: Belum Absen / Alpha */}
        <div className="dash-kpi-card bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Alpha / Belum Presensi
            </p>
            <p className="text-2xl font-black text-rose-600 mt-0.5 font-mono tabular-nums">
              {stats.alphaHariIni}
              <span className="text-xs font-semibold text-slate-500 ml-1.5 font-sans">Orang</span>
            </p>
            <p className="text-[11px] text-slate-400 mt-1 font-mono tabular-nums">
              Libur Hari Ini: {stats.liburHariIni} Staf
            </p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold">
            <AlertTriangle size={20} />
          </div>
        </div>
      </div>

      {/* 4. Analytics & Insight Hub (2 Grids) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left Card: Rata-rata Kehadiran Bulan Ini (Gauge & Insight) */}
        <div className="dash-analytic-card lg:col-span-6 bg-white p-6 rounded-2xl border border-slate-200/90 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900 tracking-tight">
                  Kedisiplinan Kehadiran Bulan Ini
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Rumus: (Tepat Waktu + Terlambat + Cuti + Izin) × 100 / (Hari Kerja - Libur)
                </p>
              </div>
              <span className="badge badge-sm font-bold bg-blue-50 text-[#0173b6] border-blue-200">
                Cut-Off 26–25
              </span>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-6 pt-5">
              {/* Circular SVG Gauge */}
              <div className="relative w-32 h-32 flex items-center justify-center shrink-0">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                  <path
                    className="text-slate-100"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3.2"
                  />
                  <path
                    className="text-[#0173b6] transition-all duration-700 ease-out"
                    strokeDasharray={`${stats.kehadiranBulanIni}, 100`}
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3.6"
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute flex flex-col items-center justify-center text-center">
                  <span className="text-2xl font-black text-slate-800 font-mono tabular-nums leading-none">
                    {stats.kehadiranBulanIni}%
                  </span>
                  <span className="text-[10px] text-slate-400 font-bold uppercase mt-1">
                    Tingkat Hadir
                  </span>
                </div>
              </div>

              {/* Textual Insight */}
              <div className="space-y-2.5 flex-1 w-full">
                <span className="badge badge-sm font-bold uppercase tracking-wider bg-slate-100 text-slate-700">
                  Status Evaluasi Unit (Cut-Off 26–25)
                </span>
                <p className="text-xs font-semibold text-slate-700 leading-relaxed">
                  {Number(stats.kehadiranBulanIni) >= 90
                    ? "Sangat Baik: Rasio kepatuhan presensi di unit ini sangat prima dan melampaui target standar rumah sakit."
                    : Number(stats.kehadiranBulanIni) >= 75
                    ? "Cukup Baik: Tingkat kehadiran operasional terpenuhi, namun perhatikan toleransi menit keterlambatan."
                    : "Peringatan: Tingkat kehadiran berada di bawah ambang minimum operasional. Diperlukan pembinaan kedisiplinan."}
                </p>

                {/* Rincian Angka Komponen Rumus Cut-Off */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 font-mono tabular-nums text-[11px]">
                  <div className="bg-emerald-50/70 border border-emerald-200/60 rounded-lg px-2.5 py-1.5">
                    <span className="block text-[9px] font-sans font-bold uppercase text-emerald-700">Tepat Waktu</span>
                    <strong className="text-emerald-800">{stats.totalTepatWaktuCutOff} Hr</strong>
                  </div>
                  <div className="bg-amber-50/70 border border-amber-200/60 rounded-lg px-2.5 py-1.5">
                    <span className="block text-[9px] font-sans font-bold uppercase text-amber-700">Terlambat</span>
                    <strong className="text-amber-800">{stats.totalTelatCutOff} Hr</strong>
                  </div>
                  <div className="bg-indigo-50/70 border border-indigo-200/60 rounded-lg px-2.5 py-1.5">
                    <span className="block text-[9px] font-sans font-bold uppercase text-indigo-700">Cuti &amp; Izin</span>
                    <strong className="text-indigo-800">{stats.totalCutiCutOff + stats.totalIzinCutOff} Hr</strong>
                  </div>
                  <div className="bg-rose-50/70 border border-rose-200/60 rounded-lg px-2.5 py-1.5">
                    <span className="block text-[9px] font-sans font-bold uppercase text-rose-700">Alpha</span>
                    <strong className="text-rose-800">{stats.totalAlphaCutOff} Hr</strong>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Card: Quick Action Hub & Direct Navigation */}
        <div className="dash-analytic-card lg:col-span-6 bg-white p-6 rounded-2xl border border-slate-200/90 shadow-xs flex flex-col justify-between space-y-4">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="text-base font-bold text-slate-900 tracking-tight">
              Pusat Tindak Lanjut &amp; Navigasi Kehadiran
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Akses cepat laporan bulanan, persetujuan izin/cuti, dan jadwal kerja tim
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Link 1: Rekapitulasi */}
            <Link
              href="/admin/kehadiran/rekap"
              className="p-3.5 rounded-xl border border-slate-200/90 hover:border-[#0173b6] hover:bg-blue-50/40 transition-all flex items-start gap-3 group"
            >
              <div className="w-9 h-9 rounded-lg bg-blue-50 text-[#0173b6] flex items-center justify-center font-bold shrink-0 group-hover:scale-105 transition-transform">
                <FileText size={18} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-slate-900 group-hover:text-[#0173b6] transition-colors truncate">
                  Laporan Rekapitulasi
                </p>
                <p className="text-[11px] text-slate-400 leading-snug mt-0.5">
                  Tabel absensi detail &amp; heatmap bulanan cut-off 26–25
                </p>
              </div>
            </Link>

            {/* Link 2: Persetujuan Cuti */}
            <Link
              href="/admin/kehadiran/cuti"
              className="p-3.5 rounded-xl border border-slate-200/90 hover:border-emerald-500 hover:bg-emerald-50/40 transition-all flex items-start gap-3 group"
            >
              <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold shrink-0 group-hover:scale-105 transition-transform">
                <Briefcase size={18} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-slate-900 group-hover:text-emerald-700 transition-colors truncate">
                  Persetujuan Izin / Cuti
                </p>
                <p className="text-[11px] text-slate-400 leading-snug mt-0.5">
                  Verifikasi pengajuan cuti dan kalender izin staf
                </p>
              </div>
            </Link>

            {/* Link 3: Jadwal Kerja */}
            <Link
              href="/admin/jadwal-kerja"
              className="p-3.5 rounded-xl border border-slate-200/90 hover:border-indigo-500 hover:bg-indigo-50/40 transition-all flex items-start gap-3 group"
            >
              <div className="w-9 h-9 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold shrink-0 group-hover:scale-105 transition-transform">
                <Calendar size={18} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-slate-900 group-hover:text-indigo-700 transition-colors truncate">
                  Manajemen Shift &amp; Jadwal
                </p>
                <p className="text-[11px] text-slate-400 leading-snug mt-0.5">
                  Rotasi jadwal jaga medis dan non-medis
                </p>
              </div>
            </Link>

            {/* Link 4: Aktivitas Harian */}
            <Link
              href="/admin/my-activity"
              className="p-3.5 rounded-xl border border-slate-200/90 hover:border-teal-500 hover:bg-teal-50/40 transition-all flex items-start gap-3 group"
            >
              <div className="w-9 h-9 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center font-bold shrink-0 group-hover:scale-105 transition-transform">
                <TrendingUp size={18} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-slate-900 group-hover:text-teal-700 transition-colors truncate">
                  Aktivitas &amp; Log Mandiri
                </p>
                <p className="text-[11px] text-slate-400 leading-snug mt-0.5">
                  Riwayat check-in/out personal dan izin dinas
                </p>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
