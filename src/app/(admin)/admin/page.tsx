"use client";

import React, { useEffect, useState, useMemo, useRef } from "react";
import Link from "next/link";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import {
  Users,
  UserCheck,
  Clock,
  AlertTriangle,
  Calendar as CalendarIcon,
  CalendarDays,
  CalendarCheck,
  Sunrise,
  Sunset,
  Moon,
  Coffee,
  Loader2,
  ArrowRight,
  ShieldCheck,
  Building2,
  FileSignature,
  Layers,
  Sparkles,
  CheckCircle2,
  Activity,
  UserX,
  ExternalLink,
  RotateCcw,
  Plus,
} from "lucide-react";

if (typeof window !== "undefined") {
  gsap.registerPlugin(useGSAP);
}

interface ScheduleItem {
  date: string;
  dayOfWeek: number;
  shift: {
    id: number;
    nama_shift: string;
    jam_masuk: string;
    jam_keluar: string;
  } | null;
  shifts?: Array<{
    id: number;
    nama_shift: string;
    jam_masuk: string;
    jam_keluar: string;
  }>;
}

interface AbsensiDashboardStats {
  totalKaryawan: number;
  hadirHariIni: number;
  terlambatHariIni: number;
  alphaHariIni: number;
  kehadiranBulanIni: number;
}

interface PendingCutiItem {
  id: number;
  karyawan_id: string;
  nama_lengkap: string;
  nama_jabatan?: string;
  jenis_cuti: string;
  tanggal_mulai: string;
  tanggal_selesai: string;
  jumlah_hari: number;
  alasan: string;
  status: string;
  tanggal_pengajuan: string;
}

interface KaryawanProfile {
  nama_lengkap: string;
  nip: string;
  nama_departemen?: string;
  nama_level?: string;
  sisa_cuti?: number;
}

type TabType = "OVERVIEW" | "SCHEDULE" | "ALERTS";

export default function DashboardAdminPage() {
  const [user, setUser] = useState<{
    id?: string;
    name?: string;
    role?: string;
    karyawan_id?: string;
    email?: string;
  } | null>(null);

  const [karyawanProfile, setKaryawanProfile] = useState<KaryawanProfile | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>("OVERVIEW");
  const [month, setMonth] = useState("");
  const [schedule, setSchedule] = useState<ScheduleItem[]>([]);
  const [isLoadingSchedule, setIsLoadingSchedule] = useState(false);

  // Real-time Dashboard Stats
  const [stats, setStats] = useState<AbsensiDashboardStats>({
    totalKaryawan: 0,
    hadirHariIni: 0,
    terlambatHariIni: 0,
    alphaHariIni: 0,
    kehadiranBulanIni: 0,
  });
  const [isLoadingStats, setIsLoadingStats] = useState(true);

  // Pending Leave Requests
  const [pendingLeaves, setPendingLeaves] = useState<PendingCutiItem[]>([]);
  const [isLoadingLeaves, setIsLoadingLeaves] = useState(true);

  const containerRef = useRef<HTMLDivElement>(null);

  // Deteksi role HC/Admin
  const isHCAdmin = useMemo(() => {
    const userRole = (user?.role || "").toLowerCase();
    return (
      userRole === "admin" ||
      userRole === "superadmin" ||
      userRole.includes("admin") ||
      userRole.includes("hrd") ||
      userRole === "hc" ||
      userRole === "human capital"
    );
  }, [user?.role]);

  // Load User & Default Month
  useEffect(() => {
    const userStr = localStorage.getItem("user");
    if (userStr) {
      try {
        setUser(JSON.parse(userStr));
      } catch (e) {
        console.error("Gagal membaca user dari localStorage", e);
      }
    }

    const today = new Date();
    const localMonthStr = new Date(
      today.getTime() - today.getTimezoneOffset() * 60000
    )
      .toISOString()
      .substring(0, 7);
    setMonth(localMonthStr);
  }, []);

  // Fetch Karyawan Profile (Departemen, Level, Sisa Cuti)
  useEffect(() => {
    const fetchProfile = async () => {
      if (!user?.karyawan_id) return;
      try {
        const res = await fetch(`/api/karyawan/${user.karyawan_id}`);
        if (res.ok) {
          const data = await res.json();
          setKaryawanProfile(data);
        }
      } catch (e) {
        console.error("Gagal memuat profil karyawan:", e);
      }
    };

    fetchProfile();
  }, [user?.karyawan_id]);

  // Fetch Absensi Dashboard Stats (Scoped sesuai akun login)
  useEffect(() => {
    if (!user) return;
    const fetchStats = async () => {
      setIsLoadingStats(true);
      try {
        let statsUrl = `/api/absensi/dashboard?month=${month || ""}`;
        if (!isHCAdmin && user.karyawan_id) {
          statsUrl += `&superior_id=${user.karyawan_id}`;
        }
        const res = await fetch(statsUrl);
        if (res.ok) {
          const data = await res.json();
          setStats(data);
        }
      } catch (err) {
        console.error("Gagal memuat statistik absensi:", err);
      } finally {
        setIsLoadingStats(false);
      }
    };

    fetchStats();
  }, [user, month, isHCAdmin]);

  // Fetch Pending Cuti (Scoped sesuai wewenang atasan atau HC)
  useEffect(() => {
    if (!user) return;
    const fetchLeaves = async () => {
      setIsLoadingLeaves(true);
      try {
        let leavesUrl = "";
        if (isHCAdmin) {
          leavesUrl = `/api/cuti?status=Menunggu`;
        } else if (user.karyawan_id) {
          leavesUrl = `/api/cuti?atasan_id=${user.karyawan_id}&status=Menunggu Atasan,Menunggu SPV`;
        } else {
          setPendingLeaves([]);
          setIsLoadingLeaves(false);
          return;
        }

        const res = await fetch(leavesUrl);
        if (res.ok) {
          const data = await res.json();
          setPendingLeaves(Array.isArray(data) ? data.slice(0, 5) : []);
        }
      } catch (err) {
        console.error("Gagal memuat daftar pengajuan cuti:", err);
      } finally {
        setIsLoadingLeaves(false);
      }
    };

    fetchLeaves();
  }, [user, isHCAdmin]);

  // Fetch Monthly Schedule
  useEffect(() => {
    const fetchSchedule = async () => {
      if (!user?.karyawan_id || !month) return;
      setIsLoadingSchedule(true);
      try {
        const res = await fetch(
          `/api/karyawan/${user.karyawan_id}/jadwal-bulanan?month=${month}`
        );
        if (res.ok) {
          const data = await res.json();
          setSchedule(data.schedule || []);
        }
      } catch (err) {
        console.error("Gagal memuat jadwal bulanan:", err);
      } finally {
        setIsLoadingSchedule(false);
      }
    };

    fetchSchedule();
  }, [user, month]);

  // Cut-off period description (26 previous month - 25 current month)
  const cutOffDescription = useMemo(() => {
    if (!month) return "Periode Cut-Off Aktif (26 - 25)";
    const [y, m] = month.split("-").map(Number);
    const start = new Date(y, m - 2, 26);
    const end = new Date(y, m - 1, 25);
    const options: Intl.DateTimeFormatOptions = {
      day: "numeric",
      month: "short",
      year: "numeric",
    };
    return `${start.toLocaleDateString("id-ID", options)} s/d ${end.toLocaleDateString("id-ID", options)}`;
  }, [month]);

  // GSAP: Entrance animation
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
          ".dash-kpi-card",
          {
            y: 16,
            opacity: 0,
            duration: 0.35,
            stagger: 0.08,
            clearProps: "all",
          },
          "-=0.2"
        )
        .from(
          ".dash-section",
          {
            y: 18,
            opacity: 0,
            duration: 0.4,
            clearProps: "all",
          },
          "-=0.15"
        );
    },
    { scope: containerRef, dependencies: [activeTab] }
  );

  const getShiftTheme = (shiftName: string) => {
    const name = shiftName.toLowerCase();
    if (
      name.includes("libur") ||
      name.includes("lepas") ||
      name.includes("off")
    ) {
      return {
        bg: "bg-slate-100",
        text: "text-slate-600",
        border: "border-slate-200",
        icon: Coffee,
      };
    }
    if (name.includes("malam")) {
      return {
        bg: "bg-indigo-50",
        text: "text-indigo-700",
        border: "border-indigo-200",
        icon: Moon,
      };
    }
    if (name.includes("siang")) {
      return {
        bg: "bg-orange-50",
        text: "text-orange-700",
        border: "border-orange-200",
        icon: Sunset,
      };
    }
    return {
      bg: "bg-blue-50",
      text: "text-blue-700",
      border: "border-blue-200",
      icon: Sunrise,
    };
  };

  const daysOfWeek = ["Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu", "Minggu"];

  return (
    <div ref={containerRef} className="p-8 font-sans min-h-screen space-y-6">
      {/* LAYER 1: HEADER HALAMAN */}
      <div className="dash-header flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-4 border-b border-slate-200/80">
        <div>
          <div className="flex items-center gap-2 mb-1 text-[#0173b6] font-bold uppercase tracking-wider text-xs">
            <Activity size={16} />
            <span>
              {isHCAdmin
                ? "Pusat Komando Operasional & HRIS RS"
                : `Portal Operasional • ${karyawanProfile?.nama_departemen || user?.role || "Unit Kerja"}`}
            </span>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-3xl font-bold text-[#05445e] tracking-tight">
              Halo, {user?.name?.split(" ")[0] || "Administrator"}!
            </h1>
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="badge badge-sm bg-[#0173b6]/10 text-[#0173b6] font-bold border-0">
                {user?.role || "Staff"}
              </span>
              {karyawanProfile?.nama_departemen && (
                <span className="badge badge-sm badge-outline text-slate-600 font-semibold">
                  {karyawanProfile.nama_departemen}
                </span>
              )}
              {karyawanProfile?.sisa_cuti !== undefined && (
                <span className="badge badge-sm bg-emerald-50 text-emerald-700 font-mono font-bold border-0">
                  Sisa Cuti: {karyawanProfile.sisa_cuti} Hari
                </span>
              )}
            </div>
          </div>
          <p className="text-slate-500 font-medium text-sm mt-1 max-w-2xl">
            {isHCAdmin
              ? "Ikhtisar operasional harian seluruh unit RSU Avisena: monitoring presensi real-time, persetujuan cuti berjenjang, jadwal dinas, dan evaluasi berkala pegawai."
              : `Ikhtisar operasional dan kehadiran tim kerja Anda di ${karyawanProfile?.nama_departemen || "RSU Avisena"}: pantau absensi harian dan tindak lanjuti persetujuan bawahan.`}
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          {/* Month selector widget */}
          <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-xl border border-slate-200/90 shadow-2xs">
            <CalendarIcon size={16} className="text-[#0173b6]" />
            <span className="text-[11px] font-bold uppercase text-slate-400">Periode:</span>
            <input
              type="month"
              value={month}
              onChange={(e) => setMonth(e.target.value)}
              className="bg-transparent border-none text-xs font-bold text-slate-800 font-mono outline-none cursor-pointer"
            />
          </div>

          <Link
            href="/admin/jadwal-kerja/plotting"
            className="btn btn-sm min-h-[38px] bg-[#0173b6] hover:bg-[#005f98] text-white font-bold px-4 rounded-xl shadow-xs transition-all active:scale-[0.98] border-0 text-xs uppercase tracking-wider gap-1.5"
          >
            <CalendarDays size={15} />
            <span>Plotting Shift</span>
          </Link>
        </div>
      </div>

      {/* LAYER 2: KPI / SUMMARY RIBBON (4 METRICS EKSEKUTIF) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        {/* KPI 1: Total Karyawan */}
        <div className="dash-kpi-card bg-white border border-slate-200/90 rounded-2xl p-4 shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              {isHCAdmin ? "Total Pegawai RS" : "Anggota Tim Bawahan"}
            </p>
            <p className="text-2xl font-black text-slate-800 font-mono tabular-nums mt-0.5">
              {isLoadingStats ? (
                <span className="inline-block w-12 h-6 bg-slate-100 rounded-md animate-pulse"></span>
              ) : (
                stats.totalKaryawan
              )}{" "}
              <span className="text-xs font-semibold text-slate-400 font-sans">Orang</span>
            </p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-blue-50 text-[#0173b6] flex items-center justify-center font-bold">
            <Users size={22} />
          </div>
        </div>

        {/* KPI 2: Presensi Hari Ini */}
        <div className="dash-kpi-card bg-white border border-slate-200/90 rounded-2xl p-4 shadow-2xs flex items-center justify-between">
          <div>
            <div className="flex items-center gap-1.5">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                {isHCAdmin ? "Presensi Hari Ini" : "Presensi Tim Hari Ini"}
              </p>
              <span className="badge badge-xs badge-success text-[9px] font-bold text-white">
                Aktif
              </span>
            </div>
            <p className="text-2xl font-black text-emerald-600 font-mono tabular-nums mt-0.5">
              {isLoadingStats ? (
                <span className="inline-block w-12 h-6 bg-slate-100 rounded-md animate-pulse"></span>
              ) : (
                stats.hadirHariIni
              )}{" "}
              <span className="text-xs font-semibold text-slate-400 font-sans">
                / {stats.totalKaryawan}
              </span>
            </p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            <UserCheck size={22} />
          </div>
        </div>

        {/* KPI 3: Terlambat / Alpha Hari Ini */}
        <div className="dash-kpi-card bg-white border border-slate-200/90 rounded-2xl p-4 shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              {isHCAdmin ? "Terlambat Hari Ini" : "Terlambat (Tim)"}
            </p>
            <p className="text-2xl font-black text-amber-600 font-mono tabular-nums mt-0.5">
              {isLoadingStats ? (
                <span className="inline-block w-12 h-6 bg-slate-100 rounded-md animate-pulse"></span>
              ) : (
                stats.terlambatHariIni
              )}{" "}
              <span className="text-xs font-semibold text-slate-400 font-sans">Staf</span>
            </p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
            <Clock size={22} />
          </div>
        </div>

        {/* KPI 4: Pending Cuti & Izin */}
        <div className="dash-kpi-card bg-white border border-slate-200/90 rounded-2xl p-4 shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              {isHCAdmin ? "Persetujuan Cuti RS" : "Persetujuan Cuti Tim"}
            </p>
            <p className="text-2xl font-black text-[#0173b6] font-mono tabular-nums mt-0.5">
              {isLoadingLeaves ? (
                <span className="inline-block w-12 h-6 bg-slate-100 rounded-md animate-pulse"></span>
              ) : (
                pendingLeaves.length
              )}{" "}
              <span className="text-xs font-semibold text-slate-400 font-sans">Menunggu</span>
            </p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-blue-50 text-[#0173b6] flex items-center justify-center font-bold">
            <CalendarCheck size={22} />
          </div>
        </div>
      </div>

      {/* LAYER 3: KONTROL TAB & PERIODE CUT-OFF */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-2xs">
        {/* Solid Segmented Switcher */}
        <div className="inline-flex p-1 bg-slate-100 rounded-xl border border-slate-200/80 gap-1">
          <button
            onClick={() => setActiveTab("OVERVIEW")}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${activeTab === "OVERVIEW"
                ? "bg-[#0173b6] text-white shadow-xs"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/50"
              }`}
          >
            <Activity size={14} />
            <span>Ikhtisar Operasional</span>
          </button>

          <button
            onClick={() => setActiveTab("SCHEDULE")}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${activeTab === "SCHEDULE"
                ? "bg-[#0173b6] text-white shadow-xs"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/50"
              }`}
          >
            <CalendarDays size={14} />
            <span>Jadwal Dinas Saya</span>
          </button>

          <button
            onClick={() => setActiveTab("ALERTS")}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${activeTab === "ALERTS"
                ? "bg-[#0173b6] text-white shadow-xs"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/50"
              }`}
          >
            <AlertTriangle size={14} />
            <span>Peringatan &amp; Kontrak</span>
          </button>
        </div>

        {/* Cut-off info badge */}
        <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 border border-slate-200/90 rounded-xl text-xs text-slate-600">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Cut-Off:
          </span>
          <span className="font-mono font-bold text-slate-800 tabular-nums">
            {cutOffDescription}
          </span>
        </div>
      </div>

      {/* LAYER 4 & 5: KONTEN UTAMA SESUAI TAB AKTIF */}

      {/* TAB 1: OVERVIEW OPERASIONAL */}
      {activeTab === "OVERVIEW" && (
        <div className="dash-section space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Kolom Kiri: Real-time Attendance & Disiplin (2 Kolom) */}
            <div className="lg:col-span-2 space-y-6">
              {/* Progress Presensi Hari Ini */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div>
                    <h3 className="text-base font-bold text-[#05445e]">
                      {isHCAdmin
                        ? "Monitoring Kehadiran Seluruh RS Hari Ini"
                        : `Monitoring Kehadiran Tim ${karyawanProfile?.nama_departemen || "Unit"} Hari Ini`}
                    </h3>
                    <p className="text-xs text-slate-500 font-medium mt-0.5">
                      {isHCAdmin
                        ? "Tingkat kedisiplinan dan absensi cut-off 26–25 bulan terpilih"
                        : "Tingkat kedisiplinan dan absensi anggota tim bawahan Anda periode cut-off 26–25"}
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-slate-700 font-mono tabular-nums">
                      {stats.kehadiranBulanIni}%
                    </span>
                    <span className="badge badge-xs badge-info text-[9px] font-bold text-white">
                      Rata-Rata
                    </span>
                  </div>
                </div>

                {/* Multi-segment progress bar */}
                <div className="space-y-2">
                  <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden flex">
                    <div
                      style={{
                        width: `${stats.totalKaryawan > 0
                            ? ((stats.hadirHariIni - stats.terlambatHariIni) /
                              stats.totalKaryawan) *
                            100
                            : 0
                          }%`,
                      }}
                      className="bg-emerald-500 h-full transition-all duration-500"
                      title="Hadir Tepat Waktu"
                    ></div>
                    <div
                      style={{
                        width: `${stats.totalKaryawan > 0
                            ? (stats.terlambatHariIni / stats.totalKaryawan) * 100
                            : 0
                          }%`,
                      }}
                      className="bg-amber-500 h-full transition-all duration-500"
                      title="Terlambat"
                    ></div>
                    <div
                      style={{
                        width: `${stats.totalKaryawan > 0
                            ? (stats.alphaHariIni / stats.totalKaryawan) * 100
                            : 0
                          }%`,
                      }}
                      className="bg-slate-200 h-full transition-all duration-500"
                      title="Belum Presensi / Off"
                    ></div>
                  </div>

                  <div className="grid grid-cols-3 gap-2 pt-1 text-center">
                    <div className="p-2.5 rounded-xl bg-emerald-50/70 border border-emerald-200/50">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-700">
                        Tepat Waktu
                      </p>
                      <p className="text-lg font-black text-emerald-800 font-mono tabular-nums mt-0.5">
                        {Math.max(0, stats.hadirHariIni - stats.terlambatHariIni)}
                      </p>
                    </div>

                    <div className="p-2.5 rounded-xl bg-amber-50/70 border border-amber-200/50">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-amber-700">
                        Terlambat
                      </p>
                      <p className="text-lg font-black text-amber-800 font-mono tabular-nums mt-0.5">
                        {stats.terlambatHariIni}
                      </p>
                    </div>

                    <div className="p-2.5 rounded-xl bg-slate-100/70 border border-slate-200/60">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-600">
                        Belum Hadir / Libur
                      </p>
                      <p className="text-lg font-black text-slate-700 font-mono tabular-nums mt-0.5">
                        {Math.max(0, stats.alphaHariIni)}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
                  <div className="flex items-center gap-1.5 text-[#0173b6] font-semibold">
                    <ShieldCheck size={14} />
                    <span>Verifikasi Biometrik Wajah &amp; Radius Geofence 2 KM Aktif</span>
                  </div>
                  <Link
                    href="/admin/kehadiran/dashboard"
                    className="font-bold text-[#0173b6] hover:underline inline-flex items-center gap-1"
                  >
                    <span>Detail Presensi</span>
                    <ArrowRight size={12} />
                  </Link>
                </div>
              </div>

              {/* Pengajuan Cuti Menunggu Verifikasi */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div>
                    <h3 className="text-base font-bold text-[#05445e]">
                      {isHCAdmin
                        ? "Pengajuan Cuti & Izin Menunggu Persetujuan RS"
                        : "Pengajuan Cuti Bawahan Menunggu Persetujuan Anda"}
                    </h3>
                    <p className="text-xs text-slate-500 font-medium mt-0.5">
                      {isHCAdmin
                        ? "Verifikasi berjenjang oleh Atasan, SPV/Koordinator, dan HC RSU Avisena"
                        : "Tindak lanjuti permohonan izin/cuti staf di bawah wewenang koordinasi Anda"}
                    </p>
                  </div>
                  <Link
                    href="/admin/kehadiran/cuti"
                    className="text-xs font-bold text-[#0173b6] hover:underline inline-flex items-center gap-1"
                  >
                    <span>Lihat Semua ({pendingLeaves.length})</span>
                    <ArrowRight size={12} />
                  </Link>
                </div>

                {isLoadingLeaves ? (
                  <div className="py-8 flex flex-col items-center justify-center text-slate-400">
                    <Loader2 size={24} className="animate-spin mb-2" />
                    <span className="text-xs font-semibold">Memuat pengajuan cuti...</span>
                  </div>
                ) : pendingLeaves.length === 0 ? (
                  <div className="py-8 text-center text-slate-400">
                    <CheckCircle2 size={32} className="mx-auto mb-2 text-emerald-500 opacity-80" />
                    <p className="text-xs font-bold text-slate-700">Tidak ada pengajuan tertunda</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Seluruh permohonan cuti telah ditinjau dan diverifikasi.
                    </p>
                  </div>
                ) : (
                  <div className="divide-y divide-slate-100">
                    {pendingLeaves.map((item) => (
                      <div
                        key={item.id}
                        className="py-3 flex items-center justify-between gap-3 hover:bg-slate-50/50 rounded-xl px-2 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-blue-50 text-[#0173b6] font-bold flex items-center justify-center text-xs">
                            {item.nama_lengkap.substring(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <p className="text-xs font-bold text-slate-800">
                              {item.nama_lengkap}
                            </p>
                            <div className="flex items-center gap-2 mt-0.5 text-[11px] text-slate-500">
                              <span className="font-semibold text-slate-700">
                                {item.jenis_cuti}
                              </span>
                              <span>•</span>
                              <span className="font-mono tabular-nums">
                                {item.jumlah_hari} Hari
                              </span>
                              <span>•</span>
                              <span className="font-mono tabular-nums text-slate-400">
                                {new Date(item.tanggal_mulai).toLocaleDateString("id-ID", {
                                  day: "numeric",
                                  month: "short",
                                })}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="badge badge-warning text-[10px] font-bold text-amber-900 border-0">
                            {item.status}
                          </span>
                          <Link
                            href="/admin/kehadiran/cuti"
                            className="btn btn-xs btn-outline border-slate-200 text-slate-600 hover:bg-[#0173b6] hover:border-[#0173b6] hover:text-white rounded-lg text-[10px] font-bold"
                          >
                            Tinjau
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Kolom Kanan: Peringatan Kontrak & Pintasan Cepat (1 Kolom) */}
            <div className="space-y-6">
              {/* Card Peringatan Kontrak Tempo */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
                      <AlertTriangle size={15} />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-800">
                        Kontrak Habis Segera
                      </h3>
                      <p className="text-[11px] text-slate-500">≤ 30 Hari Kritis</p>
                    </div>
                  </div>
                  <Link
                    href="/admin/personalia/kontrak"
                    className="text-xs font-bold text-[#0173b6] hover:underline"
                  >
                    Kelola
                  </Link>
                </div>

                <div className="py-6 px-4 text-center rounded-xl bg-slate-50/80 border border-slate-200/70 space-y-1.5">
                  <CheckCircle2 size={24} className="mx-auto text-emerald-500 opacity-80" />
                  <p className="text-xs font-bold text-slate-700">Belum Ada Data Kontrak</p>
                  <p className="text-[11px] text-slate-400">
                    Informasi masa berlaku kontrak kerja pegawai akan ditampilkan di sini saat data tersedia.
                  </p>
                </div>

                <Link
                  href="/admin/personalia/kontrak"
                  className="btn btn-sm w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl border-0 gap-1.5"
                >
                  <FileSignature size={14} />
                  <span>Buka Modul Kontrak Pegawai</span>
                </Link>
              </div>

              {/* Card Hub Pintasan Operasional (Quick Actions) */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Pintasan Modul Utama
                </h3>

                <div className="grid grid-cols-2 gap-2">
                  {isHCAdmin ? (
                    <>
                      <Link
                        href="/admin/pegawai"
                        className="p-3 rounded-xl border border-slate-200/80 hover:border-[#0173b6] hover:bg-blue-50/30 transition-all flex flex-col gap-1 text-slate-700 hover:text-[#0173b6]"
                      >
                        <Users size={18} className="text-[#0173b6]" />
                        <span className="text-xs font-bold">Data Pegawai</span>
                        <span className="text-[10px] text-slate-400">Profil &amp; NIP RS</span>
                      </Link>

                      <Link
                        href="/admin/jadwal-kerja/plotting"
                        className="p-3 rounded-xl border border-slate-200/80 hover:border-[#0173b6] hover:bg-blue-50/30 transition-all flex flex-col gap-1 text-slate-700 hover:text-[#0173b6]"
                      >
                        <CalendarDays size={18} className="text-indigo-600" />
                        <span className="text-xs font-bold">Plotting Dinas</span>
                        <span className="text-[10px] text-slate-400">Board 24/7 RS</span>
                      </Link>

                      <Link
                        href="/admin/shift"
                        className="p-3 rounded-xl border border-slate-200/80 hover:border-[#0173b6] hover:bg-blue-50/30 transition-all flex flex-col gap-1 text-slate-700 hover:text-[#0173b6]"
                      >
                        <Clock size={18} className="text-emerald-600" />
                        <span className="text-xs font-bold">Master Shift</span>
                        <span className="text-[10px] text-slate-400">Jam Dinas</span>
                      </Link>

                      <Link
                        href="/admin/kehadiran/rekap"
                        className="p-3 rounded-xl border border-slate-200/80 hover:border-[#0173b6] hover:bg-blue-50/30 transition-all flex flex-col gap-1 text-slate-700 hover:text-[#0173b6]"
                      >
                        <Activity size={18} className="text-amber-600" />
                        <span className="text-xs font-bold">Rekap Absensi</span>
                        <span className="text-[10px] text-slate-400">Cut-off 26–25</span>
                      </Link>
                    </>
                  ) : (
                    <>
                      <Link
                        href="/admin/jadwal-kerja/plotting"
                        className="p-3 rounded-xl border border-slate-200/80 hover:border-[#0173b6] hover:bg-blue-50/30 transition-all flex flex-col gap-1 text-slate-700 hover:text-[#0173b6]"
                      >
                        <CalendarDays size={18} className="text-indigo-600" />
                        <span className="text-xs font-bold">Plotting Unit</span>
                        <span className="text-[10px] text-slate-400">Jadwal Tim</span>
                      </Link>

                      <Link
                        href="/admin/kehadiran/cuti"
                        className="p-3 rounded-xl border border-slate-200/80 hover:border-[#0173b6] hover:bg-blue-50/30 transition-all flex flex-col gap-1 text-slate-700 hover:text-[#0173b6]"
                      >
                        <CalendarCheck size={18} className="text-[#0173b6]" />
                        <span className="text-xs font-bold">Persetujuan Cuti</span>
                        <span className="text-[10px] text-slate-400">Verifikasi Tim</span>
                      </Link>

                      <Link
                        href="/admin/kehadiran/rekap"
                        className="p-3 rounded-xl border border-slate-200/80 hover:border-[#0173b6] hover:bg-blue-50/30 transition-all flex flex-col gap-1 text-slate-700 hover:text-[#0173b6]"
                      >
                        <Activity size={18} className="text-amber-600" />
                        <span className="text-xs font-bold">Presensi Tim</span>
                        <span className="text-[10px] text-slate-400">Rekap Bulanan</span>
                      </Link>

                      <button
                        onClick={() => setActiveTab("SCHEDULE")}
                        className="p-3 rounded-xl border border-slate-200/80 hover:border-[#0173b6] hover:bg-blue-50/30 transition-all flex flex-col gap-1 text-left text-slate-700 hover:text-[#0173b6]"
                      >
                        <Clock size={18} className="text-emerald-600" />
                        <span className="text-xs font-bold">Jadwal Saya</span>
                        <span className="text-[10px] text-slate-400">Kalender Dinas</span>
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: JADWAL KERJA & KALENDER DINAS */}
      {activeTab === "SCHEDULE" && (
        <div className="dash-section space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden">
            {/* Header Kalender */}
            <div className="p-4 border-b border-slate-200 bg-slate-50/80 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-[#05445e]">
                  Kalender Dinas Bulanan (Cut-Off 26–25)
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Jadwal penugasan dinas, jam dinas masuk &amp; pulang, serta hari libur Anda.
                </p>
              </div>
              <span className="text-xs font-mono font-bold text-[#0173b6] bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-200">
                {cutOffDescription}
              </span>
            </div>

            {/* Desktop Calendar Days Header */}
            <div className="hidden sm:grid grid-cols-7 border-b border-slate-200 bg-slate-50/60">
              {daysOfWeek.map((day, i) => (
                <div
                  key={day}
                  className={`py-3 text-center text-xs font-bold uppercase tracking-wider ${i >= 5 ? "text-rose-500" : "text-slate-600"
                    }`}
                >
                  {day}
                </div>
              ))}
            </div>

            {isLoadingSchedule ? (
              <div className="flex flex-col items-center justify-center py-28 text-slate-400">
                <Loader2 className="animate-spin mb-3 text-[#0173b6]" size={30} />
                <p className="text-xs font-semibold animate-pulse text-slate-600">
                  Memuat matriks jadwal dinas...
                </p>
              </div>
            ) : schedule.length === 0 ? (
              <div className="py-24 text-center text-slate-400">
                <CalendarDays size={36} className="mx-auto mb-2 opacity-60 text-slate-300" />
                <p className="text-xs font-bold text-slate-700">Belum ada jadwal terplotting</p>
                <p className="text-[11px] text-slate-400 mt-0.5 max-w-sm mx-auto">
                  Jadwal dinas untuk periode bulan ini belum diplotting atau akun Anda belum memiliki relasi karyawan.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-7 sm:auto-rows-[minmax(115px,auto)]">
                {/* Empty padding days for the first week to align dates correctly */}
                {schedule.length > 0 &&
                  Array.from({
                    length: schedule[0].dayOfWeek === 0 ? 6 : schedule[0].dayOfWeek - 1,
                  }).map((_, i) => (
                    <div
                      key={`empty-${i}`}
                      className="hidden sm:block border-b border-r border-slate-100 bg-slate-50/30 p-2"
                    ></div>
                  ))}

                {schedule.map((item) => {
                  const dateObj = new Date(item.date);
                  const isToday =
                    new Date().toISOString().split("T")[0] === item.date;
                  const isWeekend = item.dayOfWeek === 0 || item.dayOfWeek === 6;
                  const shiftsToRender =
                    item.shifts && item.shifts.length > 0
                      ? item.shifts
                      : item.shift
                        ? [item.shift]
                        : [];

                  return (
                    <div
                      key={item.date}
                      className={`relative p-3 border-b sm:border-r border-slate-100 transition-all hover:bg-slate-50/80 group ${isToday ? "bg-blue-50/40" : ""
                        }`}
                    >
                      <div className="flex sm:flex-col justify-between items-start h-full gap-2">
                        <div className="flex items-center gap-2">
                          <span
                            className={`flex flex-col items-center justify-center w-8 h-8 rounded-xl font-bold leading-tight font-mono tabular-nums ${isToday
                                ? "bg-[#0173b6] text-white shadow-xs"
                                : isWeekend
                                  ? "text-rose-600 bg-rose-50"
                                  : "text-slate-700 bg-slate-100"
                              }`}
                          >
                            <span className="text-xs">{dateObj.getDate()}</span>
                          </span>
                          <span className="sm:hidden text-xs font-bold text-slate-600">
                            {daysOfWeek[item.dayOfWeek === 0 ? 6 : item.dayOfWeek - 1]}
                          </span>
                        </div>

                        <div className="flex-1 w-full flex flex-col justify-end sm:justify-start gap-1">
                          {shiftsToRender.length > 0 ? (
                            shiftsToRender.map((shiftInfo, sIdx) => {
                              const theme = getShiftTheme(shiftInfo.nama_shift);
                              const Icon = theme.icon;

                              if (
                                shiftInfo.nama_shift.toLowerCase().includes("libur") ||
                                shiftInfo.nama_shift.toLowerCase().includes("lepas")
                              ) {
                                return (
                                  <div
                                    key={sIdx}
                                    className={`w-full flex items-center gap-1.5 p-1.5 rounded-lg border ${theme.bg} ${theme.border}`}
                                  >
                                    <Coffee size={12} className="text-slate-500 shrink-0" />
                                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-600">
                                      LIBUR / OFF
                                    </span>
                                  </div>
                                );
                              }

                              return (
                                <div
                                  key={sIdx}
                                  className={`w-full flex flex-col gap-0.5 p-1.5 rounded-lg border ${theme.bg} ${theme.border}`}
                                >
                                  <div className="flex items-center gap-1">
                                    <Icon size={12} className={theme.text} />
                                    <span
                                      className={`text-[10px] font-bold uppercase tracking-wide truncate ${theme.text}`}
                                    >
                                      {shiftInfo.nama_shift}
                                    </span>
                                  </div>
                                  {shiftInfo.jam_masuk && shiftInfo.jam_keluar && (
                                    <div className="flex items-center gap-1 text-[10px] font-mono font-semibold text-slate-500 opacity-90 tabular-nums">
                                      <Clock size={10} />
                                      {shiftInfo.jam_masuk.slice(0, 5)} -{" "}
                                      {shiftInfo.jam_keluar.slice(0, 5)}
                                    </div>
                                  )}
                                </div>
                              );
                            })
                          ) : (
                            <div className="w-full flex items-center gap-1.5 p-1.5 rounded-lg border bg-slate-50 border-slate-200">
                              <Coffee size={12} className="text-slate-400 shrink-0" />
                              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                                OFF / LIBUR
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: PERINGATAN & EVALUASI KONTRAK */}
      {activeTab === "ALERTS" && (
        <div className="dash-section space-y-6">
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-[#05445e]">
                  Evaluasi Masa Kerja &amp; Kontrak Karyawan
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Daftar pegawai dengan masa kontrak yang mendekati batas waktu evaluasi berkala RSU Avisena.
                </p>
              </div>

              <Link
                href="/admin/personalia/kontrak"
                className="btn btn-sm min-h-[38px] bg-[#0173b6] hover:bg-[#005f98] text-white font-bold rounded-xl text-xs gap-1.5 border-0 shadow-xs"
              >
                <FileSignature size={14} />
                <span>Buka Modul Evaluasi Kontrak</span>
              </Link>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-[#05445e] text-white uppercase tracking-wider font-semibold">
                    <th className="py-3 px-4 rounded-l-xl">Nama Pegawai &amp; NIP</th>
                    <th className="py-3 px-4">Departemen</th>
                    <th className="py-3 px-4">Level Jabatan</th>
                    <th className="py-3 px-4">Sisa Masa Kontrak</th>
                    <th className="py-3 px-4">Status Evaluasi</th>
                    <th className="py-3 px-4 text-center rounded-r-xl">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-slate-400">
                      <FileSignature size={28} className="mx-auto mb-2 opacity-50 text-slate-300" />
                      <p className="text-xs font-bold text-slate-700">Belum Ada Data Peringatan Kontrak</p>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        Data pegawai dengan masa kontrak mendekati evaluasi akan tampil di sini saat data tersedia.
                      </p>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}