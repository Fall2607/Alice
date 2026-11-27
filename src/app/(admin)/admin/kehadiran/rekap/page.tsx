"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import {
  Search,
  Download,
  CalendarDays,
  Users,
  Clock,
  AlertTriangle,
  TableProperties,
  Grid,
  Loader2,
  Calendar,
  X,
  RotateCcw,
  CheckCircle2,
  ChevronRight,
  Sparkles,
  Info,
  ArrowUpDown,
  ArrowUpNarrowWide,
  ArrowDownWideNarrow,
  Palmtree,
  Coffee,
}/*  */ from "lucide-react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";

if (typeof window !== "undefined") {
  gsap.registerPlugin(useGSAP);
}

import SearchableSelect from "@/app/components/admin/SearchableSelect";
import { showSuccessToast, showErrorToast, showInfoToast } from "@/app/components/admin/Alert";

interface KaryawanRekap {
  id: string;
  nama: string;
  jabatan: string;
  rekap: { hadir: number; telat: number; alpha: number; libur?: number; cuti?: number; izin: number };
  rates?: { kehadiranFisik: number; cutiRate: number; izinRate: number };
  harian: Record<
    string,
    {
      status: string;
      jam_masuk?: string;
      jam_keluar?: string;
      is_late?: boolean;
      menit_terlambat?: number;
      is_pulang_cepat?: boolean;
      menit_pulang_cepat?: number;
      shift?: { nama_shift: string; jam_masuk: string; jam_keluar: string };
    }
  >;
}

type FormOption = { value: string | number; label: string };

const SORT_OPTIONS: FormOption[] = [
  { value: "rate_desc", label: "Tingkat Kehadiran: Tertinggi (100% – 0%)" },
  { value: "rate_asc", label: "Tingkat Kehadiran: Terendah (0% – 100%)" },
];

/**
 * Rumus Baku Tingkat Kehadiran:
 * ((Hadir Tepat Waktu + Terlambat + Cuti + Izin) * 100) / (Total Hari Evaluasi s/d Hari Ini - Libur/Day Off)
 */
const getPersonalAttendanceRate = (kar: KaryawanRekap): number => {
  if (kar.rates?.kehadiranFisik !== undefined) {
    return kar.rates.kehadiranFisik;
  }
  const hadirPlusCutiIzin =
    (kar.rekap.hadir || 0) + (kar.rekap.cuti || 0) + (kar.rekap.izin || 0);
  const totalHariWajibNonLibur = hadirPlusCutiIzin + (kar.rekap.alpha || 0);
  if (totalHariWajibNonLibur > 0) {
    return Math.min(Number(((hadirPlusCutiIzin * 100) / totalHariWajibNonLibur).toFixed(1)), 100);
  }
  return (kar.rekap.libur || 0) > 0 ? 100 : 0;
};

const getPersonalCutiRate = (kar: KaryawanRekap): number => {
  if (kar.rates?.cutiRate !== undefined) {
    return kar.rates.cutiRate;
  }
  const totalHariWajibNonLibur =
    (kar.rekap.hadir || 0) + (kar.rekap.alpha || 0) + (kar.rekap.cuti || 0) + (kar.rekap.izin || 0);
  if (totalHariWajibNonLibur > 0) {
    return Number((((kar.rekap.cuti || 0) * 100) / totalHariWajibNonLibur).toFixed(1));
  }
  return 0;
};

const getPersonalIzinRate = (kar: KaryawanRekap): number => {
  if (kar.rates?.izinRate !== undefined) {
    return kar.rates.izinRate;
  }
  const totalHariWajibNonLibur =
    (kar.rekap.hadir || 0) + (kar.rekap.alpha || 0) + (kar.rekap.cuti || 0) + (kar.rekap.izin || 0);
  if (totalHariWajibNonLibur > 0) {
    return Number((((kar.rekap.izin || 0) * 100) / totalHariWajibNonLibur).toFixed(1));
  }
  return 0;
};

/**
 * Menghitung rentang tanggal cut-off 26 - 25 baku RSU Avisena
 * @param refDate Tanggal acuan
 * @param monthOffset 0 = Periode Cut-Off Bulan Berjalan (26 - 25), -1 = Periode Cut-Off Bulan Lalu (26 - 25)
 */
const getCutOffPeriod = (refDate = new Date(), monthOffset = 0): [Date, Date] => {
  const year = refDate.getFullYear();
  const month = refDate.getMonth();
  const day = refDate.getDate();

  if (day >= 26) {
    const start = new Date(year, month + monthOffset, 26);
    const end = new Date(year, month + 1 + monthOffset, 25);
    return [start, end];
  } else {
    const start = new Date(year, month - 1 + monthOffset, 26);
    const end = new Date(year, month + monthOffset, 25);
    return [start, end];
  }
};

export default function RekapAbsensiPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const tableContainerRef = useRef<HTMLDivElement>(null);

  const [selectedUnit, setSelectedUnit] = useState<FormOption | null>({
    value: "all",
    label: "Semua Unit (Seluruh Karyawan)",
  });
  const [selectedSort, setSelectedSort] = useState<FormOption | null>(null);
  const [dateRange, setDateRange] = useState<[Date | null, Date | null]>([null, null]);
  const [startDateObj, endDateObj] = dateRange;
  const [searchQuery, setSearchQuery] = useState("");
  const [viewType, setViewType] = useState<"table" | "heatmap">("table");

  const [departemenList, setDepartemenList] = useState<{ id: string; nama_departemen: string }[]>([]);
  const [data, setData] = useState<KaryawanRekap[]>([]);
  const [dates, setDates] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const [selectedUserDetail, setSelectedUserDetail] = useState<KaryawanRekap | null>(null);

  // Inisialisasi periode cut-off 26 - 25 & Departemen
  useEffect(() => {
    const [cutOffStart, cutOffEnd] = getCutOffPeriod();
    setDateRange([cutOffStart, cutOffEnd]);

    fetch("/api/departemen")
      .then((res) => res.json())
      .then((depData) => setDepartemenList(Array.isArray(depData) ? depData : []))
      .catch((err) => {
        console.error(err);
        showErrorToast("Gagal memuat daftar unit departemen.");
      });
  }, []);

  // Fetch data rekap presensi
  useEffect(() => {
    if (!startDateObj || !endDateObj) return;

    const formatYMD = (date: Date) => {
      const d = new Date(date);
      d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
      return d.toISOString().split("T")[0];
    };

    const startStr = formatYMD(startDateObj);
    const endStr = formatYMD(endDateObj);

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
    fetch(`/api/absensi/rekap?startDate=${startStr}&endDate=${endStr}&unit=${unitVal}${superiorParam}`)
      .then((res) => res.json())
      .then((resData) => {
        if (resData.data) {
          setData(resData.data);
          setDates(resData.dates || []);
        } else {
          setData([]);
          setDates([]);
        }
      })
      .catch((err) => {
        console.error(err);
        showErrorToast("Gagal memuat data rekapitulasi absensi.");
      })
      .finally(() => setIsLoading(false));
  }, [startDateObj, endDateObj, selectedUnit]);

  // Hitung metrik agregat
  const totalKaryawan = data.length;
  const totalHadirAll = useMemo(() => data.reduce((acc, curr) => acc + curr.rekap.hadir, 0), [data]);
  const totalTelat = useMemo(() => data.reduce((acc, curr) => acc + curr.rekap.telat, 0), [data]);
  const totalTepatWaktuAll = useMemo(() => Math.max(0, totalHadirAll - totalTelat), [totalHadirAll, totalTelat]);
  const totalAlpha = useMemo(() => data.reduce((acc, curr) => acc + curr.rekap.alpha, 0), [data]);

  // Jumlah User Tepat Waktu vs User Terlambat vs User Alpha
  const totalUserTepatWaktu = useMemo(
    () => data.filter((curr) => Math.max(0, (curr.rekap.hadir || 0) - (curr.rekap.telat || 0)) > 0).length,
    [data]
  );
  const totalUserTelat = useMemo(
    () => data.filter((curr) => (curr.rekap.telat || 0) > 0).length,
    [data]
  );
  const totalUserAlpha = useMemo(
    () => data.filter((curr) => (curr.rekap.alpha || 0) > 0).length,
    [data]
  );

  // Rasio Tepat Waktu vs Terlambat dari total kehadiran fisik
  const tepatWaktuPct = useMemo(
    () => (totalHadirAll > 0 ? Math.round((totalTepatWaktuAll / totalHadirAll) * 100) : 0),
    [totalTepatWaktuAll, totalHadirAll]
  );
  const telatPct = useMemo(
    () => (totalHadirAll > 0 ? 100 - tepatWaktuPct : 0),
    [totalHadirAll, tepatWaktuPct]
  );

  // Metrik Cuti, Libur & Izin
  const totalUserCuti = useMemo(() => data.filter((curr) => (curr.rekap.cuti || 0) > 0).length, [data]);
  const totalHariCutiAll = useMemo(() => data.reduce((acc, curr) => acc + (curr.rekap.cuti || 0), 0), [data]);

  const totalUserLibur = useMemo(() => data.filter((curr) => (curr.rekap.libur || 0) > 0).length, [data]);
  const totalHariLiburAll = useMemo(() => data.reduce((acc, curr) => acc + (curr.rekap.libur || 0), 0), [data]);

  const totalUserIzin = useMemo(() => data.filter((curr) => (curr.rekap.izin || 0) > 0).length, [data]);
  const totalHariIzinAll = useMemo(() => data.reduce((acc, curr) => acc + (curr.rekap.izin || 0), 0), [data]);

  // Rumus Baku: ((Tepat Waktu + Terlambat + Cuti + Izin) * 100) / (Total Hari Evaluasi - Libur/Day Off)
  const totalHadirPlusCutiIzinAll = useMemo(
    () => totalHadirAll + totalHariCutiAll + totalHariIzinAll,
    [totalHadirAll, totalHariCutiAll, totalHariIzinAll]
  );
  const totalPlottingAll = useMemo(
    () => totalHadirPlusCutiIzinAll + totalAlpha,
    [totalHadirPlusCutiIzinAll, totalAlpha]
  );

  const avgKehadiran = useMemo(() => {
    if (totalPlottingAll > 0) {
      return Math.min(Number(((totalHadirPlusCutiIzinAll * 100) / totalPlottingAll).toFixed(1)), 100).toFixed(1);
    }
    return totalHariLiburAll > 0 ? "100.0" : "0.0";
  }, [totalHadirPlusCutiIzinAll, totalPlottingAll, totalHariLiburAll]);

  const avgCutiRate = useMemo(() => {
    if (totalPlottingAll > 0) {
      return ((totalHariCutiAll * 100) / totalPlottingAll).toFixed(1);
    }
    return "0.0";
  }, [totalHariCutiAll, totalPlottingAll]);

  const avgIzinRate = useMemo(() => {
    if (totalPlottingAll > 0) {
      return ((totalHariIzinAll * 100) / totalPlottingAll).toFixed(1);
    }
    return "0.0";
  }, [totalHariIzinAll, totalPlottingAll]);

  // Filter & urutkan data berdasarkan query pencarian dan tingkat kehadiran
  const filteredData = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    const baseList = q
      ? data.filter(
        (k) => k.nama.toLowerCase().includes(q) || k.jabatan.toLowerCase().includes(q)
      )
      : [...data];

    const sortVal = selectedSort?.value || "default";
    if (sortVal === "rate_desc") {
      return [...baseList].sort((a, b) => {
        const rateDiff = getPersonalAttendanceRate(b) - getPersonalAttendanceRate(a);
        if (rateDiff !== 0) return rateDiff;
        const hadirDiff = b.rekap.hadir - a.rekap.hadir;
        if (hadirDiff !== 0) return hadirDiff;
        return a.nama.localeCompare(b.nama);
      });
    }
    if (sortVal === "rate_asc") {
      return [...baseList].sort((a, b) => {
        const rateDiff = getPersonalAttendanceRate(a) - getPersonalAttendanceRate(b);
        if (rateDiff !== 0) return rateDiff;
        const alphaDiff = b.rekap.alpha - a.rekap.alpha;
        if (alphaDiff !== 0) return alphaDiff;
        return a.nama.localeCompare(b.nama);
      });
    }
    return baseList;
  }, [data, searchQuery, selectedSort]);

  const handleToggleRateSort = () => {
    const current = selectedSort?.value;
    if (!current) {
      setSelectedSort(SORT_OPTIONS[0]); // Tingkat Kehadiran: Tertinggi (100% - 0%)
    } else if (current === "rate_desc") {
      setSelectedSort(SORT_OPTIONS[1]); // Tingkat Kehadiran: Terendah (0% - 100%)
    } else {
      setSelectedSort(null);
    }
  };

  // Options unit departemen
  const unitOptions: FormOption[] = useMemo(() => {
    return [
      { value: "all", label: "Semua Unit (Seluruh Karyawan)" },
      ...departemenList.map((dep) => ({ value: dep.id, label: dep.nama_departemen })),
    ];
  }, [departemenList]);

  // Preset filter tanggal cepat (Seluruhnya mengikuti standar Cut-Off 26 – 25)
  const applyPresetCutOff = () => {
    const [start, end] = getCutOffPeriod(new Date(), 0);
    setDateRange([start, end]);
  };

  const applyPresetCurrentMonth = () => {
    const [start, end] = getCutOffPeriod(new Date(), 0);
    setDateRange([start, end]);
  };

  const applyPresetPreviousMonth = () => {
    const [start, end] = getCutOffPeriod(new Date(), -1);
    setDateRange([start, end]);
  };

  const isSameDay = (a: Date | null, b: Date | null): boolean => {
    if (!a || !b) return false;
    return (
      a.getFullYear() === b.getFullYear() &&
      a.getMonth() === b.getMonth() &&
      a.getDate() === b.getDate()
    );
  };

  const [currCutOffStart, currCutOffEnd] = getCutOffPeriod(new Date(), 0);
  const [prevCutOffStart, prevCutOffEnd] = getCutOffPeriod(new Date(), -1);
  const isCurrentPresetActive =
    isSameDay(startDateObj, currCutOffStart) && isSameDay(endDateObj, currCutOffEnd);
  const isPreviousPresetActive =
    isSameDay(startDateObj, prevCutOffStart) && isSameDay(endDateObj, prevCutOffEnd);

  const handleResetFilter = () => {
    setSearchQuery("");
    setSelectedUnit({ value: "all", label: "Semua Unit (Seluruh Karyawan)" });
    setSelectedSort(null);
    applyPresetCutOff();
    showInfoToast("Filter telah direset ke pengaturan standar cut-off 26–25.");
  };

  const hasActiveFilters = Boolean(
    searchQuery ||
    (selectedUnit && selectedUnit.value !== "all") ||
    Boolean(selectedSort) ||
    !isCurrentPresetActive
  );

  // Export Excel menggunakan ExcelJS
  const handleExport = async () => {
    if (filteredData.length === 0) {
      showErrorToast("Tidak ada data untuk diekspor ke Excel.");
      return;
    }

    try {
      setIsExporting(true);
      const ExcelJS = (await import("exceljs")).default;
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet("Rekap Absensi");

      worksheet.mergeCells("A1:I1");
      const titleCell = worksheet.getCell("A1");
      titleCell.value = "LAPORAN REKAPITULASI ABSENSI - RSU AVISENA";
      titleCell.font = { size: 16, bold: true, color: { argb: "FF05445E" } };
      titleCell.alignment = { horizontal: "center", vertical: "middle" };

      worksheet.mergeCells("A2:I2");
      const subtitleCell = worksheet.getCell("A2");
      const startStr = startDateObj ? startDateObj.toLocaleDateString("id-ID") : "-";
      const endStr = endDateObj ? endDateObj.toLocaleDateString("id-ID") : "-";
      subtitleCell.value = `Periode Evaluasi: ${startStr} s/d ${endStr} (Unit: ${selectedUnit?.label || "Semua Unit"})`;
      subtitleCell.font = { size: 11, italic: true };
      subtitleCell.alignment = { horizontal: "center", vertical: "middle" };

      worksheet.addRow([]);

      const headerRow = worksheet.addRow([
        "Nama Karyawan",
        "Jabatan / Unit",
        "Tanggal",
        "Jadwal Shift",
        "Check In",
        "Check Out",
        "Terlambat (Mnt)",
        "Pulang Cepat (Mnt)",
        "Status Kehadiran",
      ]);

      headerRow.font = { bold: true, color: { argb: "FFFFFFFF" } };
      headerRow.eachCell((cell) => {
        cell.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "FF05445E" },
        };
        cell.alignment = { vertical: "middle", horizontal: "center" };
        cell.border = {
          top: { style: "thin" },
          left: { style: "thin" },
          bottom: { style: "thin" },
          right: { style: "thin" },
        };
      });

      filteredData.forEach((kar) => {
        dates.forEach((dateStr) => {
          const harian = kar.harian[dateStr] || { status: "Libur" };
          const shiftText = harian.shift ? harian.shift.nama_shift : "-";

          const formatTime = (timeStr?: string) => {
            if (!timeStr) return "-";
            if (timeStr.includes("T")) {
              const d = new Date(timeStr);
              return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
            }
            return timeStr.substring(0, 5);
          };

          const row = worksheet.addRow([
            kar.nama,
            kar.jabatan,
            dateStr,
            shiftText,
            formatTime(harian.jam_masuk),
            formatTime(harian.jam_keluar),
            harian.menit_terlambat || 0,
            harian.menit_pulang_cepat || 0,
            harian.status.toUpperCase(),
          ]);

          row.eachCell((cell) => {
            cell.border = {
              top: { style: "thin" },
              left: { style: "thin" },
              bottom: { style: "thin" },
              right: { style: "thin" },
            };
          });
        });
      });

      worksheet.columns = [
        { width: 28 },
        { width: 24 },
        { width: 14 },
        { width: 28 },
        { width: 12 },
        { width: 12 },
        { width: 16 },
        { width: 18 },
        { width: 18 },
      ];

      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      const url = window.URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = `Rekap_Absensi_${startStr}_sd_${endStr}.xlsx`.replace(/\//g, "-");
      anchor.click();
      window.URL.revokeObjectURL(url);

      showSuccessToast("Laporan rekap absensi berhasil diunduh.");
    } catch (e) {
      console.error(e);
      showErrorToast("Gagal melakukan ekspor berkas Excel.");
    } finally {
      setIsExporting(false);
    }
  };

  // GSAP: Animasi masuk halaman
  useGSAP(
    () => {
      const tl = gsap.timeline({ defaults: { ease: "power2.out" } });

      tl.from(".rekap-header", {
        y: -12,
        opacity: 0,
        duration: 0.45,
        clearProps: "all",
      })
        .from(
          ".rekap-kpi-card",
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
          ".rekap-filter",
          {
            y: 12,
            opacity: 0,
            duration: 0.35,
            clearProps: "all",
          },
          "-=0.15"
        )
        .from(
          ".rekap-content",
          {
            y: 16,
            opacity: 0,
            duration: 0.4,
            clearProps: "all",
          },
          "-=0.15"
        );
    },
    { scope: containerRef, dependencies: [] }
  );

  // GSAP: Animasi transisi pergantian mode tampilan
  useGSAP(
    () => {
      if (!tableContainerRef.current) return;
      gsap.fromTo(
        tableContainerRef.current,
        { opacity: 0, y: 10 },
        { opacity: 1, y: 0, duration: 0.3, ease: "power2.out", clearProps: "all" }
      );
    },
    { scope: containerRef, dependencies: [viewType] }
  );

  // GSAP: Micro-stagger baris data saat filteredData berganti
  useGSAP(
    () => {
      if (!tableContainerRef.current) return;
      const rows = tableContainerRef.current.querySelectorAll(".rekap-row");
      if (rows.length > 0) {
        gsap.fromTo(
          rows,
          { opacity: 0, y: 6 },
          { opacity: 1, y: 0, duration: 0.25, stagger: 0.02, ease: "power2.out", clearProps: "all" }
        );
      }
    },
    { scope: containerRef, dependencies: [filteredData, viewType] }
  );

  return (
    <div ref={containerRef} className="p-8 font-sans min-h-screen space-y-6">
      {/* LAYER 1: HEADER HALAMAN */}
      <div className="rekap-header flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-4 border-b border-slate-200/80">
        <div>
          <div className="flex items-center gap-2 mb-1 text-[#0173b6] font-bold uppercase tracking-wider text-xs">
            <CalendarDays size={16} />
            <span>Manajemen Absensi &amp; Presensi</span>
          </div>
          <h1 className="text-3xl font-bold text-[#05445e] tracking-tight">
            Rekapitulasi Kehadiran
          </h1>
          <p className="text-slate-500 font-medium text-sm mt-1 max-w-2xl">
            Pantau matriks kedisiplinan, jam kerja, keterlambatan, dan riwayat presensi karyawan per unit kerja.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* DaisyUI Join: Table vs Heatmap Switcher */}
          <div className="join border border-slate-200 bg-white shadow-2xs rounded-xl p-0.5">
            <button
              onClick={() => setViewType("table")}
              className={`join-item btn btn-sm border-0 font-bold text-xs gap-1.5 transition-all ${viewType === "table"
                  ? "bg-[#0173b6] text-white hover:bg-[#005f98] shadow-xs"
                  : "bg-transparent text-slate-500 hover:text-slate-800"
                }`}
            >
              <TableProperties size={15} />
              <span>Tabel Ringkas</span>
            </button>
            <button
              onClick={() => setViewType("heatmap")}
              className={`join-item btn btn-sm border-0 font-bold text-xs gap-1.5 transition-all ${viewType === "heatmap"
                  ? "bg-[#0173b6] text-white hover:bg-[#005f98] shadow-xs"
                  : "bg-transparent text-slate-500 hover:text-slate-800"
                }`}
            >
              <Grid size={15} />
              <span>Heatmap Matriks</span>
            </button>
          </div>

          {/* Export Button */}
          <button
            onClick={handleExport}
            disabled={isExporting || isLoading || filteredData.length === 0}
            className="btn btn-sm min-h-[38px] bg-[#0173b6] hover:bg-[#005f98] text-white font-bold px-4 rounded-xl shadow-xs transition-all active:scale-[0.98] border-0 disabled:bg-slate-200 disabled:text-slate-400 gap-2"
          >
            {isExporting ? (
              <Loader2 size={15} className="animate-spin" />
            ) : (
              <Download size={15} />
            )}
            <span>Export Excel</span>
          </button>
        </div>
      </div>

      {/* LAYER 2: KPI / SUMMARY RIBBON (6 METRICS: Karyawan, Rate Kehadiran, Tepat Waktu vs Telat, Alpha, Cuti, Libur) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3.5">
        {/* CARD 1: TOTAL KARYAWAN */}
        <div className="rekap-kpi-card bg-white border border-slate-200/90 rounded-2xl p-4 shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Karyawan</p>
            <p className="text-2xl font-black text-slate-800 font-mono tabular-nums mt-0.5">
              {totalKaryawan} <span className="text-xs font-semibold text-slate-400 font-sans">Pegawai</span>
            </p>
            <p className="text-[10px] font-mono tabular-nums text-slate-400 font-semibold mt-0.5">
              {totalHadirAll} Hari Hadir Fisik
            </p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-blue-50 text-[#0173b6] flex items-center justify-center font-bold shrink-0">
            <Users size={22} />
          </div>
        </div>

        {/* CARD 2: PERSENTASE KEHADIRAN ((Tepat + Telat + Cuti + Izin) * 100 / (Hari Kerja - Libur)) */}
        <div className="rekap-kpi-card bg-white border border-slate-200/90 rounded-2xl p-4 shadow-2xs flex items-center justify-between">
          <div>
            <div className="flex items-center gap-1.5">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Rata-Rata Kehadiran</p>
              <span className="badge badge-xs badge-success text-[9px] font-bold text-white">Rate</span>
            </div>
            <p className="text-2xl font-black text-emerald-600 font-mono tabular-nums mt-0.5">
              {Math.min(Number(avgKehadiran), 100)}%
            </p>
            <p className="text-[10px] font-mono tabular-nums text-slate-400 font-semibold mt-0.5">
              {totalHadirPlusCutiIzinAll} / {totalPlottingAll} Hari Wajib
            </p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold shrink-0">
            <CalendarDays size={22} />
          </div>
        </div>

        {/* CARD 3: PERBANDINGAN USER TEPAT WAKTU VS TERLAMBAT */}
        <div className="rekap-kpi-card bg-white border border-slate-200/90 rounded-2xl p-4 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between gap-2">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Tepat Waktu vs Telat
            </p>
            <Clock size={14} className="text-slate-400 shrink-0" />
          </div>

          <div className="grid grid-cols-2 gap-2 my-1.5 items-center">
            <div className="bg-emerald-50/70 border border-emerald-200/60 rounded-xl px-2.5 py-1.5">
              <div className="flex items-baseline justify-between gap-1">
                <span className="text-base font-black text-emerald-600 font-mono tabular-nums leading-none">
                  {totalUserTepatWaktu}
                </span>
                <span className="text-[9px] font-bold uppercase text-emerald-700">User</span>
              </div>
              <p className="text-[10px] font-mono tabular-nums text-emerald-700/80 font-semibold mt-0.5 truncate">
                {totalTepatWaktuAll}x Tepat
              </p>
            </div>

            <div className="bg-amber-50/70 border border-amber-200/60 rounded-xl px-2.5 py-1.5">
              <div className="flex items-baseline justify-between gap-1">
                <span className="text-base font-black text-amber-600 font-mono tabular-nums leading-none">
                  {totalUserTelat}
                </span>
                <span className="text-[9px] font-bold uppercase text-amber-700">User</span>
              </div>
              <p className="text-[10px] font-mono tabular-nums text-amber-700/80 font-semibold mt-0.5 truncate">
                {totalTelat}x Telat
              </p>
            </div>
          </div>

          {/* Mini Bar Pembanding Tepat Waktu vs Terlambat */}
          <div className="space-y-1">
            <div className="w-full h-1.5 rounded-full bg-slate-100 overflow-hidden flex">
              <div
                style={{ width: `${tepatWaktuPct}%` }}
                className="bg-emerald-500 h-full transition-all duration-500"
                title={`Tepat Waktu: ${tepatWaktuPct}%`}
              />
              <div
                style={{ width: `${telatPct}%` }}
                className="bg-amber-400 h-full transition-all duration-500"
                title={`Terlambat: ${telatPct}%`}
              />
            </div>
          </div>
        </div>

        {/* CARD 4: TOTAL ALPHA & IZIN */}
        <div className="rekap-kpi-card bg-white border border-slate-200/90 rounded-2xl p-4 shadow-2xs flex items-center justify-between">
          <div>
            <div className="flex items-center gap-1.5">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Alpha</p>
              {totalHariIzinAll > 0 && (
                <span className="badge badge-xs bg-sky-100 text-sky-700 font-bold font-mono text-[9px]">
                  Izin: {avgIzinRate}%
                </span>
              )}
            </div>
            <p className="text-2xl font-black text-rose-600 font-mono tabular-nums mt-0.5">
              {totalAlpha} <span className="text-xs font-semibold text-slate-400 font-sans">Hari</span>
            </p>
            <p className="text-[10px] font-mono tabular-nums text-slate-400 font-semibold mt-0.5">
              {totalUserAlpha} User • Izin: {totalHariIzinAll} Hr
            </p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold shrink-0">
            <AlertTriangle size={22} />
          </div>
        </div>

        {/* CARD 5: KARYAWAN CUTI */}
        <div className="rekap-kpi-card bg-white border border-slate-200/90 rounded-2xl p-4 shadow-2xs flex items-center justify-between">
          <div>
            <div className="flex items-center gap-1.5">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Pegawai Cuti</p>
              <span className="badge badge-xs bg-indigo-100 text-indigo-700 font-bold font-mono text-[9px]">{avgCutiRate}%</span>
            </div>
            <p className="text-2xl font-black text-indigo-600 font-mono tabular-nums mt-0.5">
              {totalUserCuti} <span className="text-xs font-semibold text-slate-400 font-sans">User</span>
            </p>
            <p className="text-[10px] font-mono tabular-nums text-slate-400 font-semibold mt-0.5">
              {totalHariCutiAll} Hari Terpakai
            </p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold shrink-0">
            <Palmtree size={22} />
          </div>
        </div>

        {/* CARD 6: KARYAWAN LIBUR */}
        <div className="rekap-kpi-card bg-white border border-slate-200/90 rounded-2xl p-4 shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Pegawai Libur</p>
            <p className="text-2xl font-black text-cyan-600 font-mono tabular-nums mt-0.5">
              {totalUserLibur} <span className="text-xs font-semibold text-slate-400 font-sans">User</span>
            </p>
            <p className="text-[10px] font-mono tabular-nums text-slate-400 font-semibold mt-0.5">
              {totalHariLiburAll} Hari Plot Libur
            </p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-cyan-50 text-cyan-600 flex items-center justify-center font-bold shrink-0">
            <Coffee size={22} />
          </div>
        </div>
      </div>

      {/* LAYER 3: KONTROL FILTER & PENCARIAN */}
      <div className="rekap-filter bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Filter &amp; Parameter Periode
            </span>
            <span className="badge badge-sm badge-outline text-[10px] font-mono font-bold text-[#0173b6] border-[#0173b6]/30">
              Cut-off 26–25
            </span>
          </div>

          {/* Quick preset buttons (Seluruhnya berbasis Cut-Off 26–25) */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <button
              type="button"
              onClick={applyPresetCurrentMonth}
              className={`btn btn-xs text-[11px] font-bold rounded-lg px-3 transition-all ${
                isCurrentPresetActive
                  ? "bg-[#0173b6] text-white hover:bg-[#005f98] border-0 shadow-2xs"
                  : "btn-ghost text-slate-600 hover:text-[#0173b6] hover:bg-blue-50"
              }`}
            >
              Bulan Berjalan (26–25)
            </button>
            <button
              type="button"
              onClick={applyPresetPreviousMonth}
              className={`btn btn-xs text-[11px] font-bold rounded-lg px-3 transition-all ${
                isPreviousPresetActive
                  ? "bg-[#0173b6] text-white hover:bg-[#005f98] border-0 shadow-2xs"
                  : "btn-ghost text-slate-600 hover:text-[#0173b6] hover:bg-blue-50"
              }`}
            >
              Bulan Lalu (26–25)
            </button>
            {hasActiveFilters && (
              <button
                type="button"
                onClick={handleResetFilter}
                className="btn btn-xs btn-ghost text-[11px] font-bold text-rose-600 hover:bg-rose-50 rounded-lg px-2 gap-1 ml-1"
              >
                <RotateCcw size={12} />
                <span>Reset</span>
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Pencarian Nama / Jabatan */}
          <div className="relative">
            <input
              type="text"
              placeholder="Cari nama atau jabatan..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-[38px] pl-9 pr-8 bg-slate-50/80 border border-slate-200/90 rounded-xl text-xs font-semibold text-slate-800 focus:bg-white focus:border-[#0173b6] focus:ring-2 focus:ring-[#0173b6]/20 outline-none transition-all placeholder:text-slate-400"
            />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* Unit / Departemen Dropdown */}
          <div>
            <SearchableSelect
              options={unitOptions}
              value={selectedUnit}
              onChange={(opt) => setSelectedUnit(opt)}
              placeholder="Pilih Unit / Departemen..."
              isClearable={false}
            />
          </div>

          {/* Date Picker Rentang Tanggal */}
          <div className="relative">
            <div className="relative w-full">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 z-10 pointer-events-none">
                <Calendar size={15} />
              </div>
              <DatePicker
                selectsRange={true}
                startDate={startDateObj || undefined}
                endDate={endDateObj || undefined}
                onChange={(update) => setDateRange(update)}
                dateFormat="dd MMM yyyy"
                placeholderText="Pilih Rentang Tanggal Mulai s/d Selesai"
                className="w-full h-[38px] bg-slate-50/80 border border-slate-200/90 text-slate-800 pl-9 pr-4 rounded-xl text-xs font-semibold focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0173b6]/20 focus:border-[#0173b6] transition-all font-mono tabular-nums"
                wrapperClassName="w-full"
              />
            </div>
          </div>

          {/* Urutan Tingkat Kehadiran Dropdown */}
          <div>
            <SearchableSelect
              options={SORT_OPTIONS}
              value={selectedSort}
              onChange={(opt) => setSelectedSort(opt)}
              placeholder="Urutkan Tingkat Kehadiran..."
              isClearable={true}
            />
          </div>
        </div>
      </div>

      {/* LAYER 4: BARIS JUDUL DATA & STATUS COUNTER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-1">
        <div className="flex items-center gap-2.5">
          <h2 className="text-xl font-bold text-[#05445e] tracking-tight">
            {viewType === "table" ? "Matriks Ringkas Presensi" : "Peta Sebaran Kehadiran (Heatmap)"}
          </h2>
          <span className="badge badge-sm badge-neutral font-mono tabular-nums text-xs">
            {filteredData.length} Karyawan
          </span>
        </div>

        <div className="text-xs text-slate-500 font-medium flex items-center gap-1.5">
          <Info size={14} className="text-[#0173b6]" />
          <span>Klik nama karyawan untuk melihat rincian jam presensi harian</span>
        </div>
      </div>

      {/* LAYER 5: MAIN CONTENT AREA (TABEL vs HEATMAP) */}
      <div
        ref={tableContainerRef}
        className="rekap-content bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden min-h-[420px]"
      >
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-32 space-y-3">
            <Loader2 className="w-9 h-9 text-[#0173b6] animate-spin" />
            <p className="text-sm font-bold text-slate-600">Menghitung kalkulasi presensi per unit...</p>
            <p className="text-xs text-slate-400">Sinkronisasi data jadwal shift dan cut-off 26–25</p>
          </div>
        ) : filteredData.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-28 text-center px-4">
            <div className="w-16 h-16 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-center mb-3 text-slate-400">
              <AlertTriangle size={28} />
            </div>
            <h3 className="text-base font-bold text-slate-700">Tidak Ada Data Presensi</h3>
            <p className="text-xs text-slate-500 max-w-sm mt-1">
              Tidak ditemukan data absensi untuk parameter unit atau rentang tanggal yang dipilih.
            </p>
            {hasActiveFilters && (
              <button
                onClick={handleResetFilter}
                className="mt-4 btn btn-sm btn-ghost text-xs font-bold text-[#0173b6] hover:bg-blue-50"
              >
                Reset Filter
              </button>
            )}
          </div>
        ) : viewType === "table" ? (
          /* TABEL VIEW EKSEKUTIF */
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#05445e] text-white text-xs uppercase tracking-wider font-semibold">
                  <th className="py-3.5 px-6">Karyawan</th>
                  <th className="py-3.5 px-4 text-center">Hadir</th>
                  <th className="py-3.5 px-4 text-center">Terlambat</th>
                  <th className="py-3.5 px-4 text-center">Alpha</th>
                  <th className="py-3.5 px-4 text-center">Libur</th>
                  <th className="py-3.5 px-4 text-center">Izin</th>
                  <th className="py-3.5 px-4 text-center">Cuti</th>
                  <th className="py-3.5 px-6 text-center w-64">
                    <button
                      type="button"
                      onClick={handleToggleRateSort}
                      className="inline-flex items-center justify-center gap-1.5 uppercase tracking-wider font-semibold text-white hover:text-sky-200 transition-colors cursor-pointer select-none"
                      title="Klik untuk mengurutkan Tingkat Kehadiran"
                    >
                      <span>Tingkat Kehadiran</span>
                      {selectedSort?.value === "rate_desc" ? (
                        <ArrowDownWideNarrow size={14} className="text-sky-300" />
                      ) : selectedSort?.value === "rate_asc" ? (
                        <ArrowUpNarrowWide size={14} className="text-amber-300" />
                      ) : (
                        <ArrowUpDown size={13} className="opacity-60" />
                      )}
                    </button>
                  </th>
                  <th className="py-3.5 px-4 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {filteredData.map((kar, idx) => {
                  const rateNum = getPersonalAttendanceRate(kar);
                  const cutiRateNum = getPersonalCutiRate(kar);
                  const izinRateNum = getPersonalIzinRate(kar);

                  return (
                    <tr
                      key={kar.id}
                      className={`rekap-row hover:bg-blue-50/40 transition-colors ${idx % 2 === 0 ? "bg-white" : "bg-slate-50/30"
                        }`}
                    >
                      <td className="py-3.5 px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-blue-50 text-[#0173b6] border border-blue-100 flex items-center justify-center font-black text-xs shrink-0">
                            {kar.nama.charAt(0)}
                          </div>
                          <div
                            className="cursor-pointer group"
                            onClick={() => setSelectedUserDetail(kar)}
                          >
                            <p className="text-xs font-bold text-slate-800 group-hover:text-[#0173b6] transition-colors">
                              {kar.nama}
                            </p>
                            <p className="text-[11px] font-medium text-slate-400 mt-0.5">{kar.jabatan}</p>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        <span className="inline-flex items-center justify-center min-w-[28px] h-7 px-2 rounded-lg bg-emerald-50 text-emerald-700 font-bold font-mono tabular-nums border border-emerald-200/60">
                          {kar.rekap.hadir}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        <span
                          className={`inline-flex items-center justify-center min-w-[28px] h-7 px-2 rounded-lg font-bold font-mono tabular-nums border ${kar.rekap.telat > 0
                              ? "bg-amber-50 text-amber-700 border-amber-200/60"
                              : "bg-slate-50 text-slate-400 border-slate-200/50"
                            }`}
                        >
                          {kar.rekap.telat}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        <span
                          className={`inline-flex items-center justify-center min-w-[28px] h-7 px-2 rounded-lg font-bold font-mono tabular-nums border ${kar.rekap.alpha > 0
                              ? "bg-rose-50 text-rose-700 border-rose-200/60"
                              : "bg-slate-50 text-slate-400 border-slate-200/50"
                            }`}
                        >
                          {kar.rekap.alpha}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        <span className="inline-flex items-center justify-center min-w-[28px] h-7 px-2 rounded-lg bg-slate-100 text-slate-700 font-bold font-mono tabular-nums border border-slate-200/80">
                          {kar.rekap.libur ?? 0}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        <span
                          className={`inline-flex items-center justify-center min-w-[28px] h-7 px-2 rounded-lg font-bold font-mono tabular-nums border ${kar.rekap.izin > 0
                              ? "bg-sky-50 text-sky-700 border-sky-200/60"
                              : "bg-slate-50 text-slate-400 border-slate-200/50"
                            }`}
                        >
                          {kar.rekap.izin}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        <span
                          className={`inline-flex items-center justify-center min-w-[28px] h-7 px-2 rounded-lg font-bold font-mono tabular-nums border ${(kar.rekap.cuti || 0) > 0
                              ? "bg-indigo-50 text-indigo-700 border-indigo-200/60"
                              : "bg-slate-50 text-slate-400 border-slate-200/50"
                            }`}
                        >
                          {kar.rekap.cuti ?? 0}
                        </span>
                      </td>

                      <td className="py-3.5 px-6">
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-3">
                            <progress
                              className={`progress h-2 w-full ${rateNum >= 85
                                  ? "progress-success"
                                  : rateNum >= 60
                                    ? "progress-warning"
                                    : "progress-error"
                                }`}
                              value={Math.min(rateNum, 100)}
                              max="100"
                            ></progress>
                            <span
                              className={`text-xs font-mono tabular-nums font-bold w-12 text-right ${rateNum >= 85
                                  ? "text-emerald-600"
                                  : rateNum >= 60
                                    ? "text-amber-600"
                                    : "text-rose-600"
                                }`}
                            >
                              {Math.min(rateNum, 100)}%
                            </span>
                          </div>
                          {(cutiRateNum > 0 || izinRateNum > 0) && (
                            <div className="flex items-center justify-between text-[10px] font-mono tabular-nums text-slate-400 px-0.5">
                              {cutiRateNum > 0 ? (
                                <span className="text-indigo-600 font-semibold">Cuti: {cutiRateNum}%</span>
                              ) : <span />}
                              {izinRateNum > 0 ? (
                                <span className="text-sky-600 font-semibold">Izin: {izinRateNum}%</span>
                              ) : <span />}
                            </div>
                          )}
                        </div>
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        <button
                          onClick={() => setSelectedUserDetail(kar)}
                          className="btn btn-xs btn-ghost text-slate-500 hover:text-[#0173b6] hover:bg-blue-50 rounded-lg font-bold text-[11px]"
                        >
                          Detail
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          /* HEATMAP MATRIKS */
          <div className="p-6 overflow-x-auto">
            {/* Legend Status Heatmap */}
            <div className="flex flex-wrap items-center gap-5 mb-5 pb-4 border-b border-slate-100 text-xs">
              <span className="font-bold text-slate-700 uppercase tracking-wider text-[11px]">
                Keterangan Warna:
              </span>
              <div className="flex items-center gap-1.5">
                <div className="w-3.5 h-3.5 rounded bg-emerald-500 shadow-2xs"></div>
                <span className="font-semibold text-slate-600">Hadir Tepat</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3.5 h-3.5 rounded bg-amber-400 shadow-2xs"></div>
                <span className="font-semibold text-slate-600">Terlambat</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3.5 h-3.5 rounded bg-rose-500 shadow-2xs"></div>
                <span className="font-semibold text-slate-600">Alpha</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3.5 h-3.5 rounded bg-sky-500 shadow-2xs"></div>
                <span className="font-semibold text-slate-600">Izin</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3.5 h-3.5 rounded bg-indigo-500 shadow-2xs"></div>
                <span className="font-semibold text-slate-600">Cuti</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3.5 h-3.5 rounded bg-slate-200"></div>
                <span className="font-semibold text-slate-500">Libur / Off</span>
              </div>
            </div>

            {/* Matrix View */}
            <div className="inline-block min-w-full">
              {/* Header Tanggal */}
              <div className="flex items-center mb-2 pb-2 border-b border-slate-100">
                <div className="w-64 shrink-0 px-3 text-xs font-bold text-slate-600 uppercase tracking-wider">
                  Karyawan &amp; Jabatan
                </div>
                <div className="flex flex-1 gap-1">
                  {dates.map((dateStr) => {
                    const dayNum = parseInt(dateStr.split("-")[2], 10);
                    return (
                      <div
                        key={dateStr}
                        className="w-8 shrink-0 text-center text-[10px] font-mono tabular-nums font-bold text-slate-500"
                        title={dateStr}
                      >
                        {dayNum}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Baris Karyawan Heatmap */}
              {filteredData.map((kar) => (
                <div
                  key={kar.id}
                  className="rekap-row flex items-center mb-1 hover:bg-slate-50/70 py-1.5 px-1 rounded-xl transition-colors"
                >
                  <div
                    className="w-64 shrink-0 px-2 truncate cursor-pointer group"
                    onClick={() => setSelectedUserDetail(kar)}
                  >
                    <p className="text-xs font-bold text-slate-800 truncate group-hover:text-[#0173b6] transition-colors">
                      {kar.nama}
                    </p>
                    <p className="text-[10px] text-slate-400 truncate">{kar.jabatan}</p>
                  </div>

                  <div className="flex flex-1 gap-1">
                    {dates.map((dateStr) => {
                      const statusObj = kar.harian[dateStr];
                      let bgColor = "bg-slate-100";
                      let tooltip = `${dateStr}: Belum ada data`;

                      if (statusObj) {
                        if (statusObj.status === "hadir") {
                          bgColor = "bg-emerald-500 hover:bg-emerald-600";
                          tooltip = `${dateStr}: Hadir (${statusObj.jam_masuk || "-"})`;
                        } else if (statusObj.status === "telat") {
                          bgColor = "bg-amber-400 hover:bg-amber-500";
                          tooltip = `${dateStr}: Terlambat ${statusObj.menit_terlambat || 0} mnt (${statusObj.jam_masuk || "-"})`;
                        } else if (statusObj.status === "alpha") {
                          bgColor = "bg-rose-500 hover:bg-rose-600";
                          tooltip = `${dateStr}: Alpha / Tanpa Keterangan`;
                        } else if (statusObj.status === "izin") {
                          bgColor = "bg-sky-500 hover:bg-sky-600";
                          tooltip = `${dateStr}: Izin / Sakit`;
                        } else if (statusObj.status === "cuti") {
                          bgColor = "bg-indigo-500 hover:bg-indigo-600";
                          tooltip = `${dateStr}: Cuti Kerja Terjadwal`;
                        } else if (statusObj.status === "libur") {
                          bgColor = "bg-slate-200 hover:bg-slate-300";
                          tooltip = `${dateStr}: Libur Jadwal Shift`;
                        } else if (statusObj.status === "belum") {
                          bgColor = "bg-slate-100";
                          tooltip = `${dateStr}: Belum Waktunya`;
                        }
                      }

                      return (
                        <div
                          key={dateStr}
                          title={tooltip}
                          className={`w-8 h-7 rounded-md shrink-0 cursor-pointer transition-all hover:scale-110 shadow-2xs ${bgColor}`}
                        />
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* DETAIL MODAL PRESIENSI HARIAN PEGAWAI */}
      {selectedUserDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-5xl max-h-[90vh] flex flex-col overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-slate-200 bg-slate-50/60">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-blue-50 text-[#0173b6] border border-blue-100 flex items-center justify-center font-black text-sm">
                  {selectedUserDetail.nama.charAt(0)}
                </div>
                <div>
                  <h2 className="text-xl font-bold text-[#05445e] tracking-tight">
                    Detail Presensi Harian
                  </h2>
                  <p className="text-xs font-semibold text-slate-500 mt-0.5">
                    {selectedUserDetail.nama} • {selectedUserDetail.jabatan}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedUserDetail(null)}
                className="btn btn-sm btn-circle btn-ghost text-slate-400 hover:text-slate-600"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Sub-Ribbon Quick Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-6 gap-3 p-4 bg-slate-50 border-b border-slate-200 text-xs">
              <div className="bg-white p-3 rounded-xl border border-slate-200/80 text-center">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Hadir</p>
                <p className="text-lg font-black text-emerald-600 font-mono tabular-nums mt-0.5">
                  {selectedUserDetail.rekap.hadir} Hari
                </p>
              </div>
              <div className="bg-white p-3 rounded-xl border border-slate-200/80 text-center">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Terlambat</p>
                <p className="text-lg font-black text-amber-600 font-mono tabular-nums mt-0.5">
                  {selectedUserDetail.rekap.telat} Kali
                </p>
              </div>
              <div className="bg-white p-3 rounded-xl border border-slate-200/80 text-center">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Alpha</p>
                <p className="text-lg font-black text-rose-600 font-mono tabular-nums mt-0.5">
                  {selectedUserDetail.rekap.alpha} Hari
                </p>
              </div>
              <div className="bg-white p-3 rounded-xl border border-slate-200/80 text-center">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Libur</p>
                <p className="text-lg font-black text-cyan-600 font-mono tabular-nums mt-0.5">
                  {selectedUserDetail.rekap.libur ?? 0} Hari
                </p>
              </div>
              <div className="bg-white p-3 rounded-xl border border-slate-200/80 text-center">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Cuti</p>
                <p className="text-lg font-black text-indigo-600 font-mono tabular-nums mt-0.5">
                  {selectedUserDetail.rekap.cuti ?? 0} Hari
                </p>
              </div>
              <div className="bg-white p-3 rounded-xl border border-slate-200/80 text-center">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Izin</p>
                <p className="text-lg font-black text-sky-600 font-mono tabular-nums mt-0.5">
                  {selectedUserDetail.rekap.izin} Hari
                </p>
              </div>
            </div>

            {/* Modal Body: Daily List */}
            <div className="flex-1 overflow-y-auto p-6 bg-slate-50/30">
              <div className="overflow-x-auto bg-white rounded-xl border border-slate-200 shadow-2xs">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-[#05445e] text-white uppercase tracking-wider font-semibold">
                      <th className="py-3 px-4">Tanggal &amp; Hari</th>
                      <th className="py-3 px-4">Jadwal Shift</th>
                      <th className="py-3 px-4 text-center">Check In</th>
                      <th className="py-3 px-4 text-center">Check Out</th>
                      <th className="py-3 px-4 text-center">Keterlambatan</th>
                      <th className="py-3 px-4 text-center">Pulang Cepat</th>
                      <th className="py-3 px-4 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-mono tabular-nums">
                    {dates.map((dateStr, idx) => {
                      const dayData = selectedUserDetail.harian[dateStr];
                      const shift = dayData?.shift;

                      const formatTime = (timeStr?: string) => {
                        if (!timeStr) return "-";
                        if (timeStr.includes("T")) {
                          const d = new Date(timeStr);
                          return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
                        }
                        return timeStr.substring(0, 5);
                      };

                      const checkIn = formatTime(dayData?.jam_masuk);
                      const checkOut = formatTime(dayData?.jam_keluar);
                      const shiftIn = shift ? formatTime(shift.jam_masuk) : "-";
                      const shiftOut = shift ? formatTime(shift.jam_keluar) : "-";
                      const shiftName = shift?.nama_shift || (dayData?.status === "libur" ? "Libur" : "-");

                      const lateness = dayData?.menit_terlambat || 0;
                      const earlyLeave = dayData?.menit_pulang_cepat || 0;

                      return (
                        <tr
                          key={dateStr}
                          className={`hover:bg-slate-50 transition-colors ${idx % 2 === 0 ? "bg-white" : "bg-slate-50/40"
                            }`}
                        >
                          <td className="py-3 px-4 font-sans font-semibold text-slate-700 whitespace-nowrap">
                            {new Date(dateStr).toLocaleDateString("id-ID", {
                              weekday: "short",
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })}
                          </td>
                          <td className="py-3 px-4 font-sans">
                            <span
                              className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-bold ${shiftName.toLowerCase().includes("libur")
                                  ? "bg-slate-100 text-slate-600"
                                  : shiftName.toLowerCase().includes("cuti")
                                    ? "bg-blue-100 text-[#0173b6]"
                                    : "bg-blue-50 text-[#0173b6]"
                                }`}
                            >
                              {shiftName} {shiftIn !== "-" && shiftOut !== "-" ? `(${shiftIn} - ${shiftOut})` : ""}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-center">
                            <span
                              className={`font-bold ${checkIn !== "-" ? "text-emerald-600" : "text-slate-400"
                                }`}
                            >
                              {checkIn}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-center">
                            <span
                              className={`font-bold ${checkOut !== "-" ? "text-emerald-600" : "text-slate-400"
                                }`}
                            >
                              {checkOut}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-center">
                            {lateness > 0 ? (
                              <span className="inline-flex items-center gap-1 font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200/50">
                                <Clock size={11} /> {lateness} mnt
                              </span>
                            ) : (
                              <span className="text-slate-400">-</span>
                            )}
                          </td>
                          <td className="py-3 px-4 text-center">
                            {earlyLeave > 0 ? (
                              <span className="inline-flex items-center gap-1 font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-md border border-rose-200/50">
                                <Clock size={11} /> {earlyLeave} mnt
                              </span>
                            ) : (
                              <span className="text-slate-400">-</span>
                            )}
                          </td>
                          <td className="py-3 px-4 text-center font-sans">
                            <span
                              className={`badge badge-sm font-bold uppercase text-[10px] ${dayData?.status === "hadir"
                                  ? "badge-success text-white"
                                  : dayData?.status === "telat"
                                    ? "badge-warning text-slate-900"
                                    : dayData?.status === "alpha"
                                      ? "badge-error text-white"
                                      : dayData?.status === "izin"
                                        ? "badge-info text-white"
                                        : "badge-ghost text-slate-500"
                                }`}
                            >
                              {dayData?.status || "Libur"}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-200 bg-slate-50/50 flex justify-end">
              <button
                onClick={() => setSelectedUserDetail(null)}
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
