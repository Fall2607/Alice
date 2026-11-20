"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import {
  CheckCircle2,
  XCircle,
  Clock,
  Search,
  Briefcase,
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Grid,
  Users,
  AlertTriangle,
  RotateCcw,
  X,
  Loader2,
  Layers,
  FileText,
  UserCheck,
  CalendarDays,
  Info,
} from "lucide-react";
import Swal from "sweetalert2";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";

if (typeof window !== "undefined") {
  gsap.registerPlugin(useGSAP);
}

import SearchableSelect from "@/app/components/admin/SearchableSelect";
import { showSuccessToast, showErrorToast, showInfoToast } from "@/app/components/admin/Alert";

interface CutiRecord {
  id: string;
  karyawan_id: string;
  nama_lengkap: string;
  nama_jabatan?: string;
  nama_departemen?: string;
  jenis_cuti: string;
  jumlah_hari: number;
  tanggal_mulai: string;
  tanggal_selesai: string;
  status: string;
  alasan?: string;
  keterangan?: string;
  atasan_id?: string;
  spv_id?: string;
  created_at?: string;
}

interface KaryawanCuti {
  id: string;
  nip?: string;
  nama_lengkap: string;
  nama_departemen: string;
  nama_jabatan?: string;
  sisa_cuti?: number;
  cuti_terpakai?: number;
}

type FormOption = { value: string | number; label: string };

/**
 * Format nama pegawai untuk kalender agar rapi dan tidak berdempetan
 * Contoh: "MUCHAMMAD IRFAN" -> "Muchammad I.", "GINA" -> "Gina"
 */
const formatCalendarName = (name: string): string => {
  if (!name) return "";
  const clean = name.replace(/\(.*?\)/g, "").trim();
  const parts = clean.split(/\s+/).filter(Boolean);
  if (parts.length === 0) return name;
  if (parts.length === 1) {
    return parts[0].charAt(0).toUpperCase() + parts[0].slice(1).toLowerCase();
  }
  const first = parts[0].charAt(0).toUpperCase() + parts[0].slice(1).toLowerCase();
  const secondInitial = parts[1].charAt(0).toUpperCase();
  return `${first} ${secondInitial}.`;
};

export default function ApprovalCutiPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const tabContentRef = useRef<HTMLDivElement>(null);

  const [pendingLeaves, setPendingLeaves] = useState<CutiRecord[]>([]);
  const [approvedLeaves, setApprovedLeaves] = useState<CutiRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCalendarLoading, setIsCalendarLoading] = useState(false);
  const [userInfo, setUserInfo] = useState<{ karyawan_id?: string; role?: string } | null>(null);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [isHCAdminUser, setIsHCAdminUser] = useState(false);
  const [filterPending, setFilterPending] = useState<"All" | "Atasan" | "SPV" | "HC">("All");
  const [activeTab, setActiveTab] = useState<"DASHBOARD" | "HISTORY">("DASHBOARD");

  // History Tab states
  const [karyawans, setKaryawans] = useState<KaryawanCuti[]>([]);
  const [karyawanLoading, setKaryawanLoading] = useState(false);
  const [searchKar, setSearchKar] = useState("");
  const [unitFilter, setUnitFilter] = useState<FormOption | null>({ value: "all", label: "Semua Unit" });
  const [isModalHistoryOpen, setIsModalHistoryOpen] = useState(false);
  const [selectedKaryawan, setSelectedKaryawan] = useState<KaryawanCuti | null>(null);
  const [historyLeaves, setHistoryLeaves] = useState<CutiRecord[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  // Modal preview detail cuti kalender
  const [selectedCalendarCuti, setSelectedCalendarCuti] = useState<CutiRecord | null>(null);
  // Modal daftar seluruh cuti pada tanggal tertentu di kalender
  const [selectedDayLeaves, setSelectedDayLeaves] = useState<{
    day: number;
    dateStr: string;
    leaves: CutiRecord[];
  } | null>(null);

  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "/api";

  const fetchData = async (date: Date) => {
    try {
      setIsLoading(true);
      setIsCalendarLoading(true);

      const userStr = localStorage.getItem("user");
      if (!userStr) return;
      const user = JSON.parse(userStr);
      setUserInfo(user);

      const userRole = (user.role || "").toLowerCase();
      const isHC =
        userRole === "hc" ||
        userRole === "human capital" ||
        userRole.includes("hrd") ||
        userRole === "admin";
      setIsHCAdminUser(isHC);

      // Fetch Pending Leaves
      let urlPending = "";
      if (isHC) {
        urlPending = `${baseUrl}/cuti?status=Menunggu`;
      } else {
        urlPending = `${baseUrl}/cuti?atasan_id=${user.karyawan_id}&status=Menunggu Atasan,Menunggu SPV`;
      }

      const resPending = await fetch(urlPending, { cache: "no-store" });
      if (resPending.ok) {
        const pendingData = await resPending.json();
        setPendingLeaves(Array.isArray(pendingData) ? pendingData : []);
      }

      // Fetch Calendar Leaves
      const year = date.getFullYear();
      const month = date.getMonth() + 1;
      let urlCal = `${baseUrl}/cuti?year=${year}&month=${month}&status=Disetujui,Menunggu Atasan,Menunggu SPV,Menunggu HC`;
      if (!isHC && user.karyawan_id) {
        urlCal += `&atasan_id=${user.karyawan_id}`;
      }

      const resCal = await fetch(urlCal, { cache: "no-store" });
      if (resCal.ok) {
        const calData = await resCal.json();
        setApprovedLeaves(Array.isArray(calData) ? calData : []);
      }
    } catch (err) {
      console.error(err);
      showErrorToast("Gagal memuat data persetujuan cuti.");
    } finally {
      setIsLoading(false);
      setIsCalendarLoading(false);
    }
  };

  useEffect(() => {
    fetchData(currentDate);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentDate]);

  const fetchKaryawanList = async () => {
    if (karyawans.length > 0) return;
    setKaryawanLoading(true);
    try {
      let fetchUrl = `${baseUrl}/karyawan`;
      if (!isHCAdminUser && userInfo?.karyawan_id) {
        fetchUrl += `?superior_id=${userInfo.karyawan_id}`;
      }
      const res = await fetch(fetchUrl);
      if (res.ok) {
        const data = await res.json();
        setKaryawans(Array.isArray(data) ? data : []);
      }
    } catch (e) {
      console.error(e);
      showErrorToast("Gagal memuat daftar saldo cuti karyawan.");
    } finally {
      setKaryawanLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === "HISTORY") {
      fetchKaryawanList();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  const fetchHistoryLeaves = async (kar: KaryawanCuti) => {
    setSelectedKaryawan(kar);
    setIsModalHistoryOpen(true);
    setHistoryLoading(true);
    setHistoryLeaves([]);
    try {
      const res = await fetch(`${baseUrl}/cuti?karyawan_id=${kar.id}&status=Disetujui`);
      if (res.ok) {
        const data = await res.json();
        setHistoryLeaves(Array.isArray(data) ? data : []);
      }
    } catch (e) {
      console.error(e);
      showErrorToast("Gagal memuat riwayat cuti karyawan.");
    } finally {
      setHistoryLoading(false);
    }
  };

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const handleCurrentMonth = () => {
    setCurrentDate(new Date());
  };

  // Konfirmasi dan proses Approve / Reject via SweetAlert2
  const handleApproveReject = async (cuti: CutiRecord, action: "approve" | "reject") => {
    const isApprove = action === "approve";
    const result = await Swal.fire({
      title: isApprove ? "Setujui Pengajuan Cuti?" : "Tolak Pengajuan Cuti?",
      text: `Apakah Anda yakin ingin ${isApprove ? "menyetujui" : "menolak"} pengajuan cuti atas nama ${cuti.nama_lengkap}?`,
      icon: isApprove ? "question" : "warning",
      showCancelButton: true,
      confirmButtonColor: isApprove ? "#059669" : "#e11d48",
      cancelButtonColor: "#64748b",
      confirmButtonText: isApprove ? "Ya, Setujui" : "Ya, Tolak",
      cancelButtonText: "Batal",
      customClass: {
        popup: "rounded-2xl font-sans",
        confirmButton: "rounded-xl font-bold px-4 py-2 text-xs uppercase tracking-wider",
        cancelButton: "rounded-xl font-bold px-4 py-2 text-xs uppercase tracking-wider",
      },
    });

    if (!result.isConfirmed) return;

    try {
      const userRole = (userInfo?.role || "").toLowerCase();
      const isHC =
        userRole === "hc" ||
        userRole === "human capital" ||
        userRole.includes("hrd") ||
        userRole === "admin";

      const res = await fetch(`${baseUrl}/cuti/approve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cuti_id: cuti.id,
          action,
          approver_id: userInfo?.karyawan_id,
          is_hc: isHC,
        }),
      });

      const resData = await res.json();
      if (res.ok) {
        showSuccessToast(resData.message || `Pengajuan berhasil di${isApprove ? "setujui" : "tolak"}.`);
        fetchData(currentDate);
      } else {
        showErrorToast(resData.message || "Gagal memproses persetujuan cuti.");
      }
    } catch (err) {
      console.error(err);
      showErrorToast("Terjadi kesalahan jaringan saat memproses tindakan.");
    }
  };

  // Logika Kalender
  const getDaysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

  const daysInMonth = getDaysInMonth(currentDate.getFullYear(), currentDate.getMonth());
  const firstDay = getFirstDayOfMonth(currentDate.getFullYear(), currentDate.getMonth());

  const monthName = currentDate.toLocaleDateString("id-ID", { month: "long", year: "numeric" });
  const weekDays = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];

  const getCutiForDate = (day: number) => {
    const yearStr = currentDate.getFullYear();
    const monthStr = String(currentDate.getMonth() + 1).padStart(2, "0");
    const dayStr = String(day).padStart(2, "0");
    const targetDateStr = `${yearStr}-${monthStr}-${dayStr}`;
    const dateObj = new Date(yearStr, currentDate.getMonth(), day, 0, 0, 0);

    return approvedLeaves.filter((cuti) => {
      const alasan = cuti.alasan || cuti.keterangan || "";
      const datesMatch = alasan.match(/\[DATES:\s*(.*?)\]/);

      if (datesMatch) {
        const datesArr = datesMatch[1].split(",").map((d: string) => d.trim());
        return datesArr.includes(targetDateStr);
      }

      const start = new Date(cuti.tanggal_mulai);
      const end = new Date(cuti.tanggal_selesai);
      start.setHours(0, 0, 0, 0);
      end.setHours(0, 0, 0, 0);
      return dateObj.getTime() >= start.getTime() && dateObj.getTime() <= end.getTime();
    });
  };

  // Hitung jumlah pengajuan per status
  const countAtasan = useMemo(() => pendingLeaves.filter((c) => c.status === "Menunggu Atasan").length, [pendingLeaves]);
  const countSpv = useMemo(() => pendingLeaves.filter((c) => c.status === "Menunggu SPV").length, [pendingLeaves]);
  const countHc = useMemo(() => pendingLeaves.filter((c) => c.status === "Menunggu HC").length, [pendingLeaves]);

  const displayPendingLeaves = useMemo(() => {
    return pendingLeaves.filter((c) => {
      if (filterPending === "All") return true;
      if (filterPending === "Atasan") return c.status === "Menunggu Atasan";
      if (filterPending === "SPV") return c.status === "Menunggu SPV";
      if (filterPending === "HC") return c.status === "Menunggu HC";
      return true;
    });
  }, [pendingLeaves, filterPending]);

  // Options unit departemen untuk History
  const unitOptions: FormOption[] = useMemo(() => {
    const units = Array.from(new Set(karyawans.map((k) => k.nama_departemen).filter(Boolean)));
    return [
      { value: "all", label: "Semua Unit" },
      ...units.map((u) => ({ value: u, label: u })),
    ];
  }, [karyawans]);

  const filteredKaryawans = useMemo(() => {
    return karyawans.filter((k) => {
      const matchesUnit =
        !unitFilter || unitFilter.value === "all" || k.nama_departemen === unitFilter.value;
      const matchesSearch =
        !searchKar.trim() ||
        k.nama_lengkap.toLowerCase().includes(searchKar.toLowerCase()) ||
        (k.nip && k.nip.toLowerCase().includes(searchKar.toLowerCase()));
      return matchesUnit && matchesSearch;
    });
  }, [karyawans, unitFilter, searchKar]);

  // GSAP: Entrance animation
  useGSAP(
    () => {
      const tl = gsap.timeline({ defaults: { ease: "power2.out" } });

      tl.from(".cuti-header", {
        y: -12,
        opacity: 0,
        duration: 0.45,
        clearProps: "all",
      })
        .from(
          ".cuti-kpi-card",
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
          ".cuti-tab-container",
          {
            y: 12,
            opacity: 0,
            duration: 0.35,
            clearProps: "all",
          },
          "-=0.15"
        );
    },
    { scope: containerRef, dependencies: [] }
  );

  // GSAP: Animasi transisi tab
  useGSAP(
    () => {
      if (!tabContentRef.current) return;
      gsap.fromTo(
        tabContentRef.current,
        { opacity: 0, y: 10 },
        { opacity: 1, y: 0, duration: 0.3, ease: "power2.out", clearProps: "all" }
      );
    },
    { scope: containerRef, dependencies: [activeTab] }
  );

  return (
    <div ref={containerRef} className="p-8 font-sans min-h-screen space-y-6">
      {/* LAYER 1: HEADER HALAMAN */}
      <div className="cuti-header flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-4 border-b border-slate-200/80">
        <div>
          <div className="flex items-center gap-2 mb-1 text-[#0173b6] font-bold uppercase tracking-wider text-xs">
            <Briefcase size={16} />
            <span>Layanan Cuti &amp; Perizinan</span>
          </div>
          <h1 className="text-3xl font-bold text-[#05445e] tracking-tight">
            Persetujuan Izin &amp; Cuti
          </h1>
          <p className="text-slate-500 font-medium text-sm mt-1 max-w-2xl">
            Kelola alur persetujuan cuti berjenjang (Atasan, SPV, HC) dan pantau kuota saldo cuti karyawan RSU Avisena.
          </p>
        </div>

        {/* DaisyUI Tabs Box Switcher */}
        <div className="tabs tabs-box bg-slate-100 p-1 rounded-2xl border border-slate-200/80 shrink-0">
          <button
            onClick={() => setActiveTab("DASHBOARD")}
            className={`tab font-bold text-xs rounded-xl transition-all gap-1.5 ${
              activeTab === "DASHBOARD"
                ? "tab-active bg-[#0173b6] text-white shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Grid size={15} />
            <span>Kalender &amp; Persetujuan</span>
          </button>
          <button
            onClick={() => setActiveTab("HISTORY")}
            className={`tab font-bold text-xs rounded-xl transition-all gap-1.5 ${
              activeTab === "HISTORY"
                ? "tab-active bg-[#0173b6] text-white shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Users size={15} />
            <span>Direktori Saldo &amp; Riwayat</span>
          </button>
        </div>
      </div>

      {/* LAYER 2: KPI / SUMMARY RIBBON (4 METRICS) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="cuti-kpi-card bg-white border border-slate-200/90 rounded-2xl p-4 shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Menunggu</p>
            <p className="text-2xl font-black text-amber-600 font-mono tabular-nums mt-0.5">
              {pendingLeaves.length} <span className="text-xs font-semibold text-slate-400 font-sans">Pengajuan</span>
            </p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
            <Clock size={22} />
          </div>
        </div>

        <div className="cuti-kpi-card bg-white border border-slate-200/90 rounded-2xl p-4 shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Tunggu Atasan</p>
            <p className="text-2xl font-black text-slate-800 font-mono tabular-nums mt-0.5">
              {countAtasan} <span className="text-xs font-semibold text-slate-400 font-sans">Karyawan</span>
            </p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-blue-50 text-[#0173b6] flex items-center justify-center font-bold">
            <UserCheck size={22} />
          </div>
        </div>

        <div className="cuti-kpi-card bg-white border border-slate-200/90 rounded-2xl p-4 shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Tunggu SPV / Koord</p>
            <p className="text-2xl font-black text-slate-800 font-mono tabular-nums mt-0.5">
              {countSpv} <span className="text-xs font-semibold text-slate-400 font-sans">Karyawan</span>
            </p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
            <Layers size={22} />
          </div>
        </div>

        <div className="cuti-kpi-card bg-white border border-slate-200/90 rounded-2xl p-4 shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Tunggu HC / HRD</p>
            <p className="text-2xl font-black text-emerald-600 font-mono tabular-nums mt-0.5">
              {countHc} <span className="text-xs font-semibold text-slate-400 font-sans">Karyawan</span>
            </p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            <CheckCircle2 size={22} />
          </div>
        </div>
      </div>

      {/* LAYER 3, 4, 5: KONTEN UTAMA BERDASARKAN TAB */}
      <div ref={tabContentRef} className="cuti-tab-container space-y-6">
        {activeTab === "DASHBOARD" && (
          <>
            {/* SUB-SECTION 1: KALENDER CUTI KARYAWAN */}
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs p-6 space-y-5">
              {/* Calendar Toolbar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
                <div>
                  <h2 className="text-xl font-bold text-[#05445e] tracking-tight flex items-center gap-2">
                    <CalendarDays size={20} className="text-[#0173b6]" />
                    <span>Kalender Sebaran Cuti Karyawan</span>
                  </h2>
                  <div className="flex items-center gap-4 mt-1 text-xs text-slate-500">
                    <span className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                      <strong className="text-emerald-700">Disetujui</strong>
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-amber-400"></span>
                      <strong className="text-amber-700">Menunggu Verifikasi</strong>
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleCurrentMonth}
                    className="btn btn-xs btn-ghost text-[11px] font-bold text-slate-600 hover:text-[#0173b6] hover:bg-blue-50 rounded-lg px-2.5"
                  >
                    Bulan Ini
                  </button>
                  <div className="join border border-slate-200 bg-white shadow-2xs rounded-xl p-0.5 items-center">
                    <button
                      onClick={handlePrevMonth}
                      className="join-item btn btn-xs btn-ghost text-slate-500 hover:text-slate-800"
                      title="Bulan Sebelumnya"
                    >
                      <ChevronLeft size={16} />
                    </button>
                    <span className="join-item px-3 text-xs font-bold text-slate-800 min-w-[130px] text-center font-mono">
                      {monthName}
                    </span>
                    <button
                      onClick={handleNextMonth}
                      className="join-item btn btn-xs btn-ghost text-slate-500 hover:text-slate-800"
                      title="Bulan Berikutnya"
                    >
                      <ChevronRight size={16} />
                    </button>
                  </div>
                </div>
              </div>

              {/* Calendar Grid */}
              {isCalendarLoading ? (
                <div className="h-72 flex flex-col items-center justify-center space-y-2">
                  <Loader2 className="w-8 h-8 text-[#0173b6] animate-spin" />
                  <p className="text-xs font-bold text-slate-500">Memuat data kalender cuti...</p>
                </div>
              ) : (
                <div className="grid grid-cols-7 gap-2">
                  {/* Weekday Headers */}
                  {weekDays.map((day, idx) => (
                    <div
                      key={day}
                      className={`text-center text-xs font-bold uppercase tracking-wider py-1.5 rounded-lg ${
                        idx === 0 || idx === 6
                          ? "text-rose-500 bg-rose-50/50"
                          : "text-slate-500 bg-slate-50"
                      }`}
                    >
                      {day}
                    </div>
                  ))}

                  {/* Empty Days Offset */}
                  {Array.from({ length: firstDay }).map((_, i) => (
                    <div
                      key={`empty-${i}`}
                      className="min-h-[145px] lg:min-h-[160px] p-2 bg-slate-50/40 rounded-2xl border border-slate-100/60 opacity-40"
                    ></div>
                  ))}

                  {/* Days in Month */}
                  {Array.from({ length: daysInMonth }).map((_, i) => {
                    const day = i + 1;
                    const isToday =
                      new Date().getDate() === day &&
                      new Date().getMonth() === currentDate.getMonth() &&
                      new Date().getFullYear() === currentDate.getFullYear();
                    const cutiHariIni = getCutiForDate(day);
                    const hasMore = cutiHariIni.length > 3;
                    const visibleLeaves = hasMore ? cutiHariIni.slice(0, 2) : cutiHariIni;

                    return (
                      <div
                        key={day}
                        onClick={() => {
                          if (cutiHariIni.length > 0) {
                            const yearStr = currentDate.getFullYear();
                            const monthStr = String(currentDate.getMonth() + 1).padStart(2, "0");
                            const dayStr = String(day).padStart(2, "0");
                            setSelectedDayLeaves({
                              day,
                              dateStr: `${yearStr}-${monthStr}-${dayStr}`,
                              leaves: cutiHariIni,
                            });
                          }
                        }}
                        className={`min-h-[145px] lg:min-h-[160px] p-2.5 rounded-2xl border transition-all flex flex-col justify-between ${
                          isToday
                            ? "bg-blue-50/50 border-[#0173b6] shadow-xs"
                            : "bg-white border-slate-200/80 hover:border-[#0173b6]/50 hover:shadow-xs"
                        } ${cutiHariIni.length > 0 ? "cursor-pointer" : ""}`}
                      >
                        {/* Day Header */}
                        <div className="flex items-center justify-between mb-2">
                          <span
                            className={`text-xs font-mono tabular-nums font-bold inline-flex items-center justify-center ${
                              isToday
                                ? "w-6 h-6 rounded-full bg-[#0173b6] text-white shadow-2xs"
                                : "text-slate-700"
                            }`}
                          >
                            {day}
                          </span>
                          {cutiHariIni.length > 0 && (
                            <span className="badge badge-sm badge-ghost font-mono tabular-nums text-[10px] font-bold text-slate-500">
                              {cutiHariIni.length} Cuti
                            </span>
                          )}
                        </div>

                        {/* List Cuti Chips */}
                        <div className="flex flex-col gap-1.5 flex-1 justify-start">
                          {visibleLeaves.map((c, idx) => {
                            const isApproved = c.status === "Disetujui";
                            return (
                              <button
                                key={idx}
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedCalendarCuti(c);
                                }}
                                title={`${c.nama_lengkap} - ${c.jenis_cuti} (${c.status.replace("_", " ")})`}
                                className={`w-full py-1 px-2 rounded-xl text-left transition-all active:scale-[0.98] border shadow-2xs flex items-center justify-between gap-1.5 ${
                                  isApproved
                                    ? "bg-emerald-50/80 hover:bg-emerald-100/90 text-emerald-950 border-emerald-200/80"
                                    : "bg-amber-50/80 hover:bg-amber-100/90 text-amber-950 border-amber-200/80"
                                }`}
                              >
                                <div className="flex items-center gap-1.5 min-w-0">
                                  <span
                                    className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                                      isApproved ? "bg-emerald-500" : "bg-amber-500"
                                    }`}
                                  />
                                  <span className="font-bold text-[11px] truncate text-slate-800">
                                    {formatCalendarName(c.nama_lengkap)}
                                  </span>
                                </div>
                                <span
                                  className={`text-[9px] font-semibold px-1.5 py-0.5 rounded shrink-0 font-sans ${
                                    isApproved
                                      ? "bg-emerald-100 text-emerald-800"
                                      : "bg-amber-100 text-amber-900"
                                  }`}
                                >
                                  {c.jenis_cuti.replace("Cuti ", "").split(" ")[0]}
                                </span>
                              </button>
                            );
                          })}

                          {/* Tombol Lihat Cuti Lainnya bila > 3 */}
                          {hasMore && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                const yearStr = currentDate.getFullYear();
                                const monthStr = String(currentDate.getMonth() + 1).padStart(2, "0");
                                const dayStr = String(day).padStart(2, "0");
                                setSelectedDayLeaves({
                                  day,
                                  dateStr: `${yearStr}-${monthStr}-${dayStr}`,
                                  leaves: cutiHariIni,
                                });
                              }}
                              className="w-full py-1 px-2 rounded-lg text-center font-bold text-[10px] text-[#0173b6] bg-blue-50/80 hover:bg-blue-100 hover:border-blue-200 border border-blue-200/60 transition-all shadow-2xs active:scale-[0.98] mt-auto"
                            >
                              +{cutiHariIni.length - 2} Cuti Lainnya
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* SUB-SECTION 2: DAFTAR MENUNGGU PERSETUJUAN */}
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs p-6 space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
                <div>
                  <h2 className="text-xl font-bold text-[#05445e] tracking-tight flex items-center gap-2">
                    <Clock size={20} className="text-amber-500" />
                    <span>Antrean Pengajuan Menunggu Tindak Lanjut</span>
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Tinjau rincian alasan cuti, durasi, dan tentukan persetujuan atau penolakan.
                  </p>
                </div>

                {/* Filter Status Pills */}
                {pendingLeaves.length > 0 && (
                  <div className="flex flex-wrap items-center gap-1.5">
                    <button
                      onClick={() => setFilterPending("All")}
                      className={`btn btn-xs rounded-xl font-bold text-[11px] transition-all ${
                        filterPending === "All"
                          ? "bg-slate-800 text-white shadow-xs"
                          : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                      }`}
                    >
                      Semua [{pendingLeaves.length}]
                    </button>
                    <button
                      onClick={() => setFilterPending("Atasan")}
                      className={`btn btn-xs rounded-xl font-bold text-[11px] transition-all ${
                        filterPending === "Atasan"
                          ? "bg-blue-600 text-white shadow-xs"
                          : "bg-slate-100 text-slate-600 hover:bg-blue-50 hover:text-blue-700"
                      }`}
                    >
                      Tunggu Atasan [{countAtasan}]
                    </button>
                    <button
                      onClick={() => setFilterPending("SPV")}
                      className={`btn btn-xs rounded-xl font-bold text-[11px] transition-all ${
                        filterPending === "SPV"
                          ? "bg-indigo-600 text-white shadow-xs"
                          : "bg-slate-100 text-slate-600 hover:bg-indigo-50 hover:text-indigo-700"
                      }`}
                    >
                      Tunggu SPV [{countSpv}]
                    </button>
                    <button
                      onClick={() => setFilterPending("HC")}
                      className={`btn btn-xs rounded-xl font-bold text-[11px] transition-all ${
                        filterPending === "HC"
                          ? "bg-emerald-600 text-white shadow-xs"
                          : "bg-slate-100 text-slate-600 hover:bg-emerald-50 hover:text-emerald-700"
                      }`}
                    >
                      Tunggu HC [{countHc}]
                    </button>
                  </div>
                )}
              </div>

              {/* Pending List Cards */}
              {isLoading ? (
                <div className="flex items-center justify-center py-20">
                  <Loader2 className="w-8 h-8 text-[#0173b6] animate-spin" />
                </div>
              ) : pendingLeaves.length === 0 ? (
                <div className="text-center py-16 flex flex-col items-center">
                  <div className="w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center mb-3 text-emerald-600 border border-emerald-100">
                    <CheckCircle2 size={32} />
                  </div>
                  <h3 className="text-base font-bold text-slate-800">Semua Beres!</h3>
                  <p className="text-slate-500 text-xs mt-0.5 max-w-sm">
                    Tidak ada pengajuan cuti yang tertunda atau membutuhkan persetujuan Anda saat ini.
                  </p>
                </div>
              ) : displayPendingLeaves.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-xs font-bold text-slate-400">
                    Tidak ada pengajuan cuti pada filter status yang dipilih.
                  </p>
                </div>
              ) : (
                <div className="grid gap-4">
                  {displayPendingLeaves.map((cuti) => {
                    const canApproveThis = !isHCAdminUser || cuti.status === "Menunggu HC";

                    return (
                      <div
                        key={cuti.id}
                        className="p-5 rounded-2xl border border-slate-200/90 bg-white hover:border-[#0173b6]/40 shadow-2xs hover:shadow-xs transition-all flex flex-col lg:flex-row lg:items-center justify-between gap-5"
                      >
                        <div className="flex-1 space-y-3">
                          {/* Top Badges */}
                          <div className="flex items-center gap-2">
                            <span className="badge badge-sm badge-warning font-bold text-[10px] uppercase tracking-wider text-slate-900 border-amber-300">
                              {cuti.status.replace("_", " ")}
                            </span>
                            <span className="text-[11px] font-mono tabular-nums text-slate-400 font-bold">
                              ID: {cuti.id.substring(0, 8)}
                            </span>
                          </div>

                          {/* Employee Header */}
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#0173b6] border border-blue-100 flex items-center justify-center font-black text-sm shrink-0">
                              {cuti.nama_lengkap.charAt(0)}
                            </div>
                            <div>
                              <h3 className="text-base font-bold text-slate-900 leading-snug">
                                {cuti.nama_lengkap}
                              </h3>
                              <p className="text-xs font-medium text-slate-400 flex items-center gap-1.5 mt-0.5">
                                <Briefcase size={13} className="text-slate-400" />
                                <span>{cuti.nama_jabatan || "Karyawan"}</span>
                                {cuti.nama_departemen && <span>• {cuti.nama_departemen}</span>}
                              </p>
                            </div>
                          </div>

                          {/* Detail Grid */}
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 bg-slate-50/80 p-3.5 rounded-xl border border-slate-200/70 text-xs">
                            <div>
                              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                                Jenis Cuti
                              </p>
                              <p className="text-xs font-bold text-slate-800 mt-0.5">{cuti.jenis_cuti}</p>
                            </div>
                            <div>
                              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                                Durasi
                              </p>
                              <p className="text-xs font-black text-[#0173b6] font-mono tabular-nums mt-0.5">
                                {cuti.jumlah_hari} Hari
                              </p>
                            </div>
                            <div className="col-span-2">
                              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                                Rentang Tanggal
                              </p>
                              <p className="text-xs font-bold text-slate-800 flex items-center gap-1.5 mt-0.5 font-mono tabular-nums">
                                <CalendarIcon size={13} className="text-[#0173b6]" />
                                {new Date(cuti.tanggal_mulai).toLocaleDateString("id-ID")} s/d{" "}
                                {new Date(cuti.tanggal_selesai).toLocaleDateString("id-ID")}
                              </p>
                            </div>
                          </div>

                          {/* Quoted Reason */}
                          {cuti.alasan && (
                            <div className="text-xs text-slate-600 bg-white p-2.5 rounded-xl border border-slate-100 flex items-start gap-2">
                              <span className="text-[10px] font-bold uppercase text-slate-400 shrink-0 mt-0.5">
                                Alasan:
                              </span>
                              <span className="italic">"{cuti.alasan}"</span>
                            </div>
                          )}
                        </div>

                        {/* Action Buttons */}
                        <div className="flex lg:flex-col gap-2.5 min-w-[190px] shrink-0 pt-2 lg:pt-0 border-t lg:border-t-0 border-slate-100">
                          {canApproveThis ? (
                            <>
                              <button
                                onClick={() => handleApproveReject(cuti, "approve")}
                                className="btn btn-sm flex-1 lg:flex-none min-h-[42px] bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-xs transition-all active:scale-[0.98] border-0 text-xs uppercase tracking-wider gap-1.5"
                              >
                                <CheckCircle2 size={16} />
                                <span>Setujui</span>
                              </button>
                              <button
                                onClick={() => handleApproveReject(cuti, "reject")}
                                className="btn btn-sm flex-1 lg:flex-none min-h-[42px] bg-white hover:bg-rose-50 text-rose-600 font-bold rounded-xl border border-rose-200 shadow-2xs transition-all active:scale-[0.98] text-xs uppercase tracking-wider gap-1.5"
                              >
                                <XCircle size={16} />
                                <span>Tolak</span>
                              </button>
                            </>
                          ) : (
                            <div className="flex-1 flex flex-col items-center justify-center p-3 bg-slate-50 text-slate-500 rounded-xl border border-slate-200 text-xs font-semibold text-center gap-1">
                              <Clock size={16} className="text-amber-500" />
                              <span className="text-[11px] font-bold">
                                Tertahan di {cuti.status.replace("Menunggu ", "")}
                              </span>
                              <span className="text-[10px] text-slate-400">Menunggu persetujuan tingkat sebelumnya</span>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </>
        )}

        {activeTab === "HISTORY" && (
          <div className="space-y-6">
            {/* Filter & Pencarian Direktori Karyawan */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs space-y-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Filter Kuota &amp; Riwayat Pegawai
                </span>
                <span className="text-xs text-slate-400 font-medium">
                  Menampilkan {filteredKaryawans.length} dari {karyawans.length} Karyawan
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {/* Search Input */}
                <div className="relative lg:col-span-2">
                  <input
                    type="text"
                    placeholder="Cari nama karyawan atau NIP..."
                    value={searchKar}
                    onChange={(e) => setSearchKar(e.target.value)}
                    className="w-full h-[38px] pl-9 pr-8 bg-slate-50/80 border border-slate-200/90 rounded-xl text-xs font-semibold text-slate-800 focus:bg-white focus:border-[#0173b6] focus:ring-2 focus:ring-[#0173b6]/20 outline-none transition-all placeholder:text-slate-400"
                  />
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
                  {searchKar && (
                    <button
                      onClick={() => setSearchKar("")}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>

                {/* Unit Filter */}
                <div>
                  <SearchableSelect
                    options={unitOptions}
                    value={unitFilter}
                    onChange={(opt) => setUnitFilter(opt)}
                    placeholder="Filter Berdasarkan Unit..."
                    isClearable={false}
                  />
                </div>
              </div>
            </div>

            {/* Tabel Saldo & Kuota Karyawan */}
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-[#05445e] text-white uppercase tracking-wider font-semibold">
                      <th className="py-3.5 px-6">Nama Karyawan</th>
                      <th className="py-3.5 px-4">Unit / Departemen</th>
                      <th className="py-3.5 px-4 text-center">Sisa Saldo Cuti</th>
                      <th className="py-3.5 px-4 text-center">Cuti Terpakai</th>
                      <th className="py-3.5 px-4 text-center">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {karyawanLoading ? (
                      <tr>
                        <td colSpan={5} className="py-20 text-center">
                          <Loader2 className="w-8 h-8 text-[#0173b6] animate-spin mx-auto mb-2" />
                          <p className="text-xs font-bold text-slate-500">Memuat saldo cuti pegawai...</p>
                        </td>
                      </tr>
                    ) : filteredKaryawans.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="py-16 text-center text-slate-400 font-bold">
                          Tidak ditemukan data karyawan sesuai pencarian.
                        </td>
                      </tr>
                    ) : (
                      filteredKaryawans.map((k, idx) => (
                        <tr
                          key={k.id}
                          className={`hover:bg-blue-50/40 transition-colors ${
                            idx % 2 === 0 ? "bg-white" : "bg-slate-50/30"
                          }`}
                        >
                          <td className="py-3.5 px-6">
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-xl bg-blue-50 text-[#0173b6] border border-blue-100 flex items-center justify-center font-black text-xs shrink-0">
                                {k.nama_lengkap.charAt(0)}
                              </div>
                              <div>
                                <p className="font-bold text-slate-800">{k.nama_lengkap}</p>
                                {k.nip && (
                                  <p className="text-[11px] font-mono text-slate-400 mt-0.5">NIP: {k.nip}</p>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="py-3.5 px-4 font-medium text-slate-600">{k.nama_departemen}</td>
                          <td className="py-3.5 px-4 text-center">
                            <span className="inline-flex items-center justify-center min-w-[70px] py-1 px-2.5 rounded-lg bg-emerald-50 text-emerald-700 font-bold font-mono tabular-nums border border-emerald-200/60">
                              {k.sisa_cuti || 0} Hari
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-center">
                            <span className="inline-flex items-center justify-center min-w-[70px] py-1 px-2.5 rounded-lg bg-rose-50 text-rose-700 font-bold font-mono tabular-nums border border-rose-200/60">
                              {k.cuti_terpakai || 0} Hari
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-center">
                            <button
                              onClick={() => fetchHistoryLeaves(k)}
                              className="btn btn-xs btn-ghost text-[#0173b6] hover:bg-blue-50 font-bold rounded-lg text-[11px]"
                            >
                              Lihat Riwayat
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* MODAL RIWAYAT CUTI PEGAWAI */}
      {isModalHistoryOpen && selectedKaryawan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[85vh] flex flex-col overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-200 bg-slate-50/60 flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-[#05445e] tracking-tight">
                  Riwayat Cuti Disetujui
                </h3>
                <p className="text-xs font-semibold text-slate-500 mt-0.5">
                  {selectedKaryawan.nama_lengkap} • {selectedKaryawan.nama_departemen}
                </p>
              </div>
              <button
                onClick={() => setIsModalHistoryOpen(false)}
                className="btn btn-sm btn-circle btn-ghost text-slate-400 hover:text-slate-600"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-3 bg-slate-50/30 flex-1">
              {historyLoading ? (
                <div className="py-16 flex flex-col items-center justify-center space-y-2">
                  <Loader2 className="w-8 h-8 text-[#0173b6] animate-spin" />
                  <p className="text-xs font-bold text-slate-500">Memuat berkas riwayat cuti...</p>
                </div>
              ) : historyLeaves.length === 0 ? (
                <div className="py-14 text-center text-slate-400 text-xs font-bold">
                  Belum ada riwayat cuti yang disetujui untuk pegawai ini.
                </div>
              ) : (
                <div className="grid gap-3">
                  {historyLeaves.map((cuti) => (
                    <div
                      key={cuti.id}
                      className="p-4 bg-white border border-slate-200 rounded-xl shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="badge badge-sm badge-success text-[10px] font-bold text-white">
                            {cuti.jenis_cuti}
                          </span>
                          <span className="text-[11px] font-mono text-slate-400">
                            ID: {cuti.id.substring(0, 8)}
                          </span>
                        </div>
                        <p className="text-xs font-bold text-slate-700 font-mono tabular-nums">
                          {new Date(cuti.tanggal_mulai).toLocaleDateString("id-ID")} s/d{" "}
                          {new Date(cuti.tanggal_selesai).toLocaleDateString("id-ID")}
                        </p>
                        {cuti.alasan && (
                          <p className="text-xs text-slate-500 italic">"{cuti.alasan}"</p>
                        )}
                      </div>

                      <div className="px-4 py-2 bg-blue-50 border border-blue-100 rounded-xl text-center min-w-[80px] shrink-0">
                        <p className="text-lg font-black text-[#0173b6] font-mono tabular-nums leading-none">
                          {cuti.jumlah_hari}
                        </p>
                        <p className="text-[9px] font-bold text-[#0173b6] uppercase tracking-wider mt-1">
                          Hari Cuti
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-200 bg-slate-50/50 flex justify-end">
              <button
                onClick={() => setIsModalHistoryOpen(false)}
                className="btn btn-sm btn-ghost text-xs font-bold text-slate-600 hover:bg-slate-200 rounded-xl px-5"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL PREVIEW DETAIL CUTI KALENDER */}
      {selectedCalendarCuti && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 border border-slate-200 animate-in fade-in zoom-in-95 duration-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span
                  className={`badge badge-sm font-bold text-[10px] uppercase tracking-wider ${
                    selectedCalendarCuti.status === "Disetujui"
                      ? "badge-success text-white"
                      : "badge-warning text-slate-900"
                  }`}
                >
                  {selectedCalendarCuti.status.replace("_", " ")}
                </span>
                <span className="text-[11px] font-mono text-slate-400 font-bold">
                  ID: {selectedCalendarCuti.id.substring(0, 8)}
                </span>
              </div>
              <button
                onClick={() => setSelectedCalendarCuti(null)}
                className="btn btn-xs btn-circle btn-ghost text-slate-400 hover:text-slate-600"
              >
                <X size={16} />
              </button>
            </div>

            <div>
              <h3 className="text-lg font-bold text-[#05445e]">
                {selectedCalendarCuti.nama_lengkap}
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                {selectedCalendarCuti.nama_jabatan || "Karyawan"} •{" "}
                {selectedCalendarCuti.nama_departemen || "Unit"}
              </p>
            </div>

            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/80 text-xs space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-500 font-medium">Jenis Cuti:</span>
                <span className="font-bold text-slate-800">{selectedCalendarCuti.jenis_cuti}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-medium">Durasi:</span>
                <span className="font-bold text-[#0173b6] font-mono tabular-nums">
                  {selectedCalendarCuti.jumlah_hari} Hari
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-medium">Rentang:</span>
                <span className="font-bold text-slate-800 font-mono tabular-nums">
                  {new Date(selectedCalendarCuti.tanggal_mulai).toLocaleDateString("id-ID")} s/d{" "}
                  {new Date(selectedCalendarCuti.tanggal_selesai).toLocaleDateString("id-ID")}
                </span>
              </div>
              {selectedCalendarCuti.alasan && (
                <div className="pt-2 border-t border-slate-200">
                  <span className="text-slate-400 text-[10px] uppercase font-bold block mb-0.5">
                    Alasan:
                  </span>
                  <p className="italic text-slate-700">"{selectedCalendarCuti.alasan}"</p>
                </div>
              )}
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setSelectedCalendarCuti(null)}
                className="btn btn-sm btn-ghost text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl px-4"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL DAFTAR CUTI HARIAN PADA TANGGAL TERTENTU */}
      {selectedDayLeaves && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full max-h-[85vh] flex flex-col overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="p-5 border-b border-slate-200 bg-slate-50/70 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#0173b6] border border-blue-100 flex items-center justify-center font-bold">
                  <CalendarDays size={20} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#05445e]">
                    Daftar Pegawai Cuti
                  </h3>
                  <p className="text-xs text-slate-500 font-medium">
                    {new Date(selectedDayLeaves.dateStr).toLocaleDateString("id-ID", {
                      weekday: "long",
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedDayLeaves(null)}
                className="btn btn-xs btn-circle btn-ghost text-slate-400 hover:text-slate-600"
              >
                <X size={16} />
              </button>
            </div>

            {/* Sub-header Counter */}
            <div className="px-5 py-2.5 bg-slate-100/60 border-b border-slate-200/80 flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-600">Total Pegawai Izin / Cuti</span>
              <span className="badge badge-sm badge-neutral font-mono tabular-nums text-xs font-bold">
                {selectedDayLeaves.leaves.length} Karyawan
              </span>
            </div>

            {/* Body: List of leaves */}
            <div className="p-5 overflow-y-auto space-y-3 bg-slate-50/30 flex-1 custom-scrollbar">
              {selectedDayLeaves.leaves.map((cuti) => {
                const isApproved = cuti.status === "Disetujui";
                return (
                  <div
                    key={cuti.id}
                    className="p-3.5 bg-white border border-slate-200/90 rounded-xl shadow-2xs space-y-2.5 hover:border-[#0173b6]/40 transition-all"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-blue-50 text-[#0173b6] border border-blue-100 flex items-center justify-center font-bold text-xs shrink-0">
                          {cuti.nama_lengkap.charAt(0)}
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-slate-900 leading-tight">
                            {cuti.nama_lengkap}
                          </h4>
                          <p className="text-[11px] text-slate-400 mt-0.5">
                            {cuti.nama_jabatan || "Karyawan"} {cuti.nama_departemen && `• ${cuti.nama_departemen}`}
                          </p>
                        </div>
                      </div>
                      <span
                        className={`badge badge-sm font-bold text-[10px] uppercase tracking-wider shrink-0 ${
                          isApproved ? "badge-success text-white" : "badge-warning text-slate-900"
                        }`}
                      >
                        {cuti.status.replace("_", " ")}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 bg-slate-50 p-2.5 rounded-lg border border-slate-100 text-[11px]">
                      <div>
                        <span className="text-slate-400 text-[10px] uppercase font-bold block">
                          Jenis Cuti:
                        </span>
                        <span className="font-semibold text-slate-800">{cuti.jenis_cuti}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 text-[10px] uppercase font-bold block">
                          Durasi:
                        </span>
                        <span className="font-bold text-[#0173b6] font-mono tabular-nums">
                          {cuti.jumlah_hari} Hari
                        </span>
                      </div>
                    </div>

                    {cuti.alasan && (
                      <p className="text-xs text-slate-600 italic bg-slate-50/50 p-2 rounded-lg border border-slate-100">
                        "{cuti.alasan}"
                      </p>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-slate-200 bg-slate-50/50 flex justify-end">
              <button
                onClick={() => setSelectedDayLeaves(null)}
                className="btn btn-sm btn-ghost text-xs font-bold text-slate-600 hover:bg-slate-200 rounded-xl px-5"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
