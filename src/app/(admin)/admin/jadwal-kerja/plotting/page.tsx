"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import {
  Loader2,
  UserCheck,
  CalendarRange,
  Search,
  Plus,
  ShieldCheck,
  Download,
  Upload,
  FileSpreadsheet,
  CheckSquare,
  Square,
  AlertCircle,
  CheckCircle2,
  Info,
  Filter,
  X,
  RotateCcw,
  CalendarDays,
  Layers,
  Users,
  Sparkles,
} from "lucide-react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";

if (typeof window !== "undefined") {
  gsap.registerPlugin(useGSAP);
}

import Modal from "@/app/components/modal";
import Pagination from "@/app/components/admin/Pagination";
import SearchableSelect from "@/app/components/admin/SearchableSelect";
import { showSuccessToast, showErrorToast } from "@/app/components/admin/Alert";

interface Karyawan {
  id: string;
  nama_lengkap: string;
  nip: string;
  nik: string;
  nama_jadwal?: string;
  jadwal_kerja_id?: number;
  nama_departemen?: string;
}

interface Shift {
  id: number;
  nama_shift: string;
  jam_masuk?: string;
  jam_keluar?: string;
}

interface JadwalKerja {
  id: number;
  nama_jadwal: string;
  tipe?: string;
}

interface BoardData {
  tanggal: string;
  shift_id: number;
  karyawan_id: string;
  nama_lengkap: string;
}

type FormOption = { value: string | number; label: string };

export default function ManajemenJadwalKaryawanPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const tabContentRef = useRef<HTMLDivElement>(null);

  const [karyawans, setKaryawans] = useState<Karyawan[]>([]);
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [jadwals, setJadwals] = useState<JadwalKerja[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [activeTab, setActiveTab] = useState<"DEFAULT" | "BOARD_SHIFT" | "BOARD_PIKET">("DEFAULT");
  const [isAdminOrHRD, setIsAdminOrHRD] = useState(false);
  const [selectedUnit, setSelectedUnit] = useState<FormOption | null>({ value: "all", label: "Semua Unit" });
  const [searchDefaultQuery, setSearchDefaultQuery] = useState("");

  // --- TAB 1: DEFAULT STATE ---
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [selectedKaryawan, setSelectedKaryawan] = useState<Karyawan | null>(null);
  const [assignFormData, setAssignFormData] = useState({ jadwal_kerja_id: "" });
  const [isAssigning, setIsAssigning] = useState(false);

  // --- TAB 2 & 3: BOARD STATE ---
  const [plotMonth, setPlotMonth] = useState("");
  const [boardData, setBoardData] = useState<BoardData[]>([]);
  const [isFetchingBoard, setIsFetchingBoard] = useState(false);

  // Board Modal
  const [isBoardModalOpen, setIsBoardModalOpen] = useState(false);
  const [activeCell, setActiveCell] = useState<{ tanggal: string; shift_id: number; shift_name: string } | null>(null);
  const [activeCatCell, setActiveCatCell] = useState<{ tanggal: string; category: string } | null>(null);
  const [selectedShiftVariant, setSelectedShiftVariant] = useState<number | null>(null);
  const [selectedKaryawanIds, setSelectedKaryawanIds] = useState<string[]>([]);
  const [searchKaryawan, setSearchKaryawan] = useState("");
  const [isSubmittingBoard, setIsSubmittingBoard] = useState(false);

  // Download Template Modal State
  const [isDownloadModalOpen, setIsDownloadModalOpen] = useState(false);
  const [downloadMonth, setDownloadMonth] = useState("");
  const [downloadUnit, setDownloadUnit] = useState("");
  const [downloadSelectedKarIds, setDownloadSelectedKarIds] = useState<string[]>([]);
  const [downloadSearchKar, setDownloadSearchKar] = useState("");
  const [downloadMode, setDownloadMode] = useState<"schedule" | "blank">("schedule");
  const [downloadIncludeExisting, setDownloadIncludeExisting] = useState(true);
  const [isDownloading, setIsDownloading] = useState(false);

  // Import Modal State
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [importFile, setImportFile] = useState<File | null>(null);
  const [isImporting, setIsImporting] = useState(false);

  // Import Result Modal State
  const [importResult, setImportResult] = useState<{
    success: boolean;
    message: string;
    successCount: number;
    deletedCount?: number;
    failedCount: number;
    failedRows: string[];
  } | null>(null);
  const [isResultModalOpen, setIsResultModalOpen] = useState(false);

  const getShiftCategory = (nama_shift: string): string => {
    const name = nama_shift.toLowerCase();
    if (name.includes("cuti") || name.includes("izin")) return "Cuti";
    if (name.includes("libur") || name.includes("lepas")) return "Libur";
    if (name.includes("malam")) return "Malam";
    if (name.includes("siang")) return "Siang";
    if (name.includes("middle")) return "Middle";
    return "Pagi";
  };
  const categories = ["Pagi", "Middle", "Siang", "Malam", "Libur", "Cuti"];

  const fetchData = async () => {
    try {
      setIsLoading(true);

      let fetchKaryawanUrl = "/api/karyawan";
      try {
        const userStr = localStorage.getItem("user");
        if (userStr) {
          const user = JSON.parse(userStr);
          if (user.role && (user.role.toLowerCase().includes("admin") || user.role.toLowerCase().includes("hrd"))) {
            setIsAdminOrHRD(true);
          } else if (
            user.role &&
            !user.role.toLowerCase().includes("admin") &&
            !user.role.toLowerCase().includes("hrd") &&
            user.karyawan_id
          ) {
            fetchKaryawanUrl = `/api/karyawan?superior_id=${user.karyawan_id}`;
          }
        }
      } catch (e) { }

      const [resKar, resShift, resJadwal] = await Promise.all([
        fetch(fetchKaryawanUrl),
        fetch("/api/shift"),
        fetch("/api/jadwal-kerja"),
      ]);
      if (resKar.ok) setKaryawans(await resKar.json());
      if (resShift.ok) setShifts(await resShift.json());
      if (resJadwal.ok) setJadwals(await resJadwal.json());

      const today = new Date();
      const localMonthStr = new Date(today.getTime() - today.getTimezoneOffset() * 60000)
        .toISOString()
        .substring(0, 7);
      setPlotMonth(localMonthStr);
    } catch (err) {
      console.error(err);
      showErrorToast("Gagal memuat data master.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Fetch Board Data
  const fetchBoardData = async (quiet = false) => {
    if (!plotMonth) return;
    if (!quiet) setIsFetchingBoard(true);
    try {
      let fetchBoardUrl = `/api/karyawan-shift/board?month=${plotMonth}`;
      try {
        const userStr = localStorage.getItem("user");
        if (userStr) {
          const user = JSON.parse(userStr);
          if (
            user.role &&
            !user.role.toLowerCase().includes("admin") &&
            !user.role.toLowerCase().includes("hrd") &&
            user.karyawan_id
          ) {
            fetchBoardUrl += `&superior_id=${user.karyawan_id}`;
          }
        }
      } catch (e) { }

      const res = await fetch(fetchBoardUrl);
      if (res.ok) {
        setBoardData(await res.json());
      }
    } catch (err) {
      console.error(err);
    } finally {
      if (!quiet) setIsFetchingBoard(false);
    }
  };

  useEffect(() => {
    if (activeTab === "BOARD_SHIFT" || activeTab === "BOARD_PIKET") {
      fetchBoardData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [plotMonth, activeTab]);

  // --- ACTIONS TAB 1 ---
  const handleOpenAssignModal = (kar: Karyawan) => {
    setSelectedKaryawan(kar);
    setAssignFormData({ jadwal_kerja_id: kar.jadwal_kerja_id ? kar.jadwal_kerja_id.toString() : "" });
    setIsAssignModalOpen(true);
  };

  const handleAssignSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedKaryawan) return;
    try {
      setIsAssigning(true);
      const response = await fetch(`/api/karyawan/${selectedKaryawan.id}/jadwal`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jadwal_kerja_id: assignFormData.jadwal_kerja_id ? parseInt(assignFormData.jadwal_kerja_id) : null,
        }),
      });
      if (!response.ok) throw new Error("Gagal assign jadwal default.");
      showSuccessToast("Jadwal default berhasil diatur.");
      setIsAssignModalOpen(false);
      fetchData();
    } catch (err) {
      showErrorToast(err instanceof Error ? err.message : "Terjadi kesalahan.");
    } finally {
      setIsAssigning(false);
    }
  };

  // --- ACTIONS TAB 2 & 3 ---
  const getDaysInMonth = (onlySaturdays = false) => {
    if (!plotMonth) return [];
    const [yearStr, monthStr] = plotMonth.split("-");
    const year = parseInt(yearStr, 10);
    const monthNum = parseInt(monthStr, 10);
    const pad2 = (n: number) => String(n).padStart(2, "0");

    // Periode cut-off: 26 bulan sebelumnya s/d 25 bulan terpilih
    const startDate = new Date(year, monthNum - 2, 26);
    const endDate = new Date(year, monthNum - 1, 25);

    const days: string[] = [];
    const cur = new Date(startDate.getTime());
    while (cur <= endDate) {
      const y = cur.getFullYear();
      const m = pad2(cur.getMonth() + 1);
      const d = pad2(cur.getDate());
      const dateStr = `${y}-${m}-${d}`;
      if (onlySaturdays) {
        if (cur.getDay() === 6) days.push(dateStr);
      } else {
        days.push(dateStr);
      }
      cur.setDate(cur.getDate() + 1);
    }
    return days;
  };

  const getDayName = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("id-ID", { weekday: "short" });
  };

  const handleCellClick = (tanggal: string, shift: Shift) => {
    setActiveCell({ tanggal, shift_id: shift.id, shift_name: shift.nama_shift });
    setActiveCatCell(null);
    const assigned = boardData.filter((b) => b.tanggal === tanggal && b.shift_id === shift.id).map((b) => b.karyawan_id);
    setSelectedKaryawanIds(assigned);
    setSearchKaryawan("");
    setIsBoardModalOpen(true);
  };

  const handleCellClickCat = (tanggal: string, category: string) => {
    setActiveCatCell({ tanggal, category });
    setActiveCell(null);

    const variants = shifts.filter((s) => getShiftCategory(s.nama_shift) === category);
    if (variants.length > 0) {
      const firstVariantId = variants[0].id;
      setSelectedShiftVariant(firstVariantId);
      const assigned = boardData
        .filter((b) => b.tanggal === tanggal && b.shift_id === firstVariantId)
        .map((b) => b.karyawan_id);
      setSelectedKaryawanIds(assigned);
    } else {
      setSelectedShiftVariant(null);
      setSelectedKaryawanIds([]);
    }

    setSearchKaryawan("");
    setIsBoardModalOpen(true);
  };

  const handleVariantChange = (shiftIdStr: string) => {
    const shiftId = parseInt(shiftIdStr);
    setSelectedShiftVariant(shiftId);
    if (activeCatCell) {
      const assigned = boardData
        .filter((b) => b.tanggal === activeCatCell.tanggal && b.shift_id === shiftId)
        .map((b) => b.karyawan_id);
      setSelectedKaryawanIds(assigned);
    }
  };

  const toggleKaryawanSelection = (id: string) => {
    if (selectedKaryawanIds.includes(id)) {
      setSelectedKaryawanIds(selectedKaryawanIds.filter((v) => v !== id));
    } else {
      setSelectedKaryawanIds([...selectedKaryawanIds, id]);
    }
  };

  const handleBoardSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    let submitTanggal = "";
    let submitShiftId = 0;

    if (activeCell) {
      submitTanggal = activeCell.tanggal;
      submitShiftId = activeCell.shift_id;
    } else if (activeCatCell && selectedShiftVariant) {
      submitTanggal = activeCatCell.tanggal;
      submitShiftId = selectedShiftVariant;
    } else {
      return;
    }

    try {
      setIsSubmittingBoard(true);
      let superior_id = null;
      try {
        const userStr = localStorage.getItem("user");
        if (userStr) {
          const user = JSON.parse(userStr);
          if (
            user.role &&
            !user.role.toLowerCase().includes("admin") &&
            !user.role.toLowerCase().includes("hrd") &&
            user.karyawan_id
          ) {
            superior_id = user.karyawan_id;
          }
        }
      } catch (e) { }

      const res = await fetch("/api/karyawan-shift/board", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tanggal: submitTanggal,
          shift_id: submitShiftId,
          karyawan_ids: selectedKaryawanIds,
          superior_id: superior_id,
        }),
      });
      if (!res.ok) throw new Error("Gagal menyimpan plotting board.");
      showSuccessToast("Berhasil menyimpan assignment shift.");
      setIsBoardModalOpen(false);
      fetchBoardData(true);
    } catch (err) {
      showErrorToast(err instanceof Error ? err.message : "Terjadi kesalahan.");
    } finally {
      setIsSubmittingBoard(false);
    }
  };

  const handleOpenDownloadModal = () => {
    const currentM = plotMonth || new Date().toISOString().substring(0, 7);
    setDownloadMonth(currentM);
    const activeUnitVal = selectedUnit && selectedUnit.value !== "all" ? String(selectedUnit.value) : "";
    setDownloadUnit(activeUnitVal);
    setDownloadSearchKar("");
    setDownloadMode("schedule");
    setDownloadIncludeExisting(true);

    const targetList = activeUnitVal ? karyawans.filter((k) => k.nama_departemen === activeUnitVal) : karyawans;
    setDownloadSelectedKarIds(targetList.map((k) => k.id));
    setIsDownloadModalOpen(true);
  };

  const handleSelectAllDownload = () => {
    const filtered = karyawans.filter((k) => {
      const matchUnit = !downloadUnit || k.nama_departemen === downloadUnit;
      const searchLower = downloadSearchKar.toLowerCase();
      const matchSearch =
        !downloadSearchKar ||
        k.nama_lengkap.toLowerCase().includes(searchLower) ||
        (k.nip && k.nip.toLowerCase().includes(searchLower));
      return matchUnit && matchSearch;
    });
    const ids = filtered.map((k) => k.id);
    setDownloadSelectedKarIds(Array.from(new Set([...downloadSelectedKarIds, ...ids])));
  };

  const handleDeselectAllDownload = () => {
    const filtered = karyawans.filter((k) => {
      const matchUnit = !downloadUnit || k.nama_departemen === downloadUnit;
      const searchLower = downloadSearchKar.toLowerCase();
      const matchSearch =
        !downloadSearchKar ||
        k.nama_lengkap.toLowerCase().includes(searchLower) ||
        (k.nip && k.nip.toLowerCase().includes(searchLower));
      return matchUnit && matchSearch;
    });
    const idsToRemove = new Set(filtered.map((k) => k.id));
    setDownloadSelectedKarIds(downloadSelectedKarIds.filter((id) => !idsToRemove.has(id)));
  };

  const toggleDownloadKaryawan = (id: string) => {
    if (downloadSelectedKarIds.includes(id)) {
      setDownloadSelectedKarIds(downloadSelectedKarIds.filter((v) => v !== id));
    } else {
      setDownloadSelectedKarIds([...downloadSelectedKarIds, id]);
    }
  };

  const handleExecuteDownloadTemplate = async () => {
    if (downloadMode === "schedule" && downloadSelectedKarIds.length === 0) {
      showErrorToast("Pilih minimal 1 karyawan untuk mendownload template jadwal.");
      return;
    }

    try {
      setIsDownloading(true);
      let superior_id = null;
      try {
        const userStr = localStorage.getItem("user");
        if (userStr) {
          const user = JSON.parse(userStr);
          if (
            user.role &&
            !user.role.toLowerCase().includes("admin") &&
            !user.role.toLowerCase().includes("hrd") &&
            user.karyawan_id
          ) {
            superior_id = user.karyawan_id;
          }
        }
      } catch (e) { }

      const res = await fetch("/api/karyawan-shift/template", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          karyawan_ids: downloadSelectedKarIds,
          month: downloadMonth,
          mode: downloadMode,
          include_existing: downloadIncludeExisting,
          superior_id: superior_id,
        }),
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.message || "Gagal mengunduh template");
      }

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `Template_Plotting_Shift_${downloadMonth}.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      a.remove();

      showSuccessToast("Template Excel berhasil diunduh.");
      setIsDownloadModalOpen(false);
    } catch (err) {
      showErrorToast(err instanceof Error ? err.message : "Terjadi kesalahan saat mengunduh.");
    } finally {
      setIsDownloading(false);
    }
  };

  const handleImportSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!importFile) return;

    setIsImporting(true);
    const formData = new FormData();
    formData.append("file", importFile);

    try {
      const userStr = localStorage.getItem("user");
      if (userStr) {
        const user = JSON.parse(userStr);
        if (
          user.role &&
          !user.role.toLowerCase().includes("admin") &&
          !user.role.toLowerCase().includes("hrd") &&
          user.karyawan_id
        ) {
          formData.append("superior_id", user.karyawan_id);
        }
      }
    } catch (e) { }

    try {
      const res = await fetch("/api/karyawan-shift/import", {
        method: "POST",
        body: formData,
      });
      const result = await res.json();
      if (res.ok) {
        showSuccessToast(result.message);
        setIsImportModalOpen(false);
        setImportFile(null);
        fetchBoardData();

        if (result.failedRows && result.failedRows.length > 0) {
          setImportResult(result);
          setIsResultModalOpen(true);
        }
      } else {
        showErrorToast(result.message || "Gagal mengimpor berkas.");
        if (result.failedRows && result.failedRows.length > 0) {
          setImportResult(result);
          setIsResultModalOpen(true);
        }
      }
    } catch (err) {
      showErrorToast(err instanceof Error ? err.message : "Terjadi kesalahan koneksi.");
    } finally {
      setIsImporting(false);
    }
  };

  // Filtering for Default List
  const uniqueUnits = useMemo(() => {
    return Array.from(new Set(karyawans.map((k) => k.nama_departemen).filter(Boolean))) as string[];
  }, [karyawans]);

  const unitOptions: FormOption[] = useMemo(() => {
    return [
      { value: "all", label: "Semua Unit" },
      ...uniqueUnits.map((u) => ({ value: u, label: u })),
    ];
  }, [uniqueUnits]);

  const filteredKaryawans = useMemo(() => {
    return karyawans.filter((k) => {
      const matchUnit = !selectedUnit || selectedUnit.value === "all" || k.nama_departemen === selectedUnit.value;
      const matchSearch =
        !searchDefaultQuery.trim() ||
        k.nama_lengkap.toLowerCase().includes(searchDefaultQuery.toLowerCase()) ||
        (k.nip && k.nip.toLowerCase().includes(searchDefaultQuery.toLowerCase()));
      return matchUnit && matchSearch;
    });
  }, [karyawans, selectedUnit, searchDefaultQuery]);

  const totalPages = Math.ceil(filteredKaryawans.length / itemsPerPage);
  const currentKaryawans = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredKaryawans.slice(start, start + itemsPerPage);
  }, [filteredKaryawans, currentPage, itemsPerPage]);

  const filteredKaryawanForModal = useMemo(() => {
    return karyawans.filter((k) => {
      const matchUnit = !selectedUnit || selectedUnit.value === "all" || k.nama_departemen === selectedUnit.value;
      const searchLower = searchKaryawan.toLowerCase();
      const matchSearch =
        !searchKaryawan.trim() ||
        k.nama_lengkap.toLowerCase().includes(searchLower) ||
        (k.nip && k.nip.toLowerCase().includes(searchLower));
      return matchUnit && matchSearch;
    });
  }, [karyawans, selectedUnit, searchKaryawan]);

  const filteredBoardData = useMemo(() => {
    return boardData.filter((b) => {
      if (!selectedUnit || selectedUnit.value === "all") return true;
      const k = karyawans.find((kar) => kar.id === b.karyawan_id);
      return k && k.nama_departemen === selectedUnit.value;
    });
  }, [boardData, selectedUnit, karyawans]);

  const filteredKaryawanForDownload = useMemo(() => {
    return karyawans.filter((k) => {
      const matchUnit = !downloadUnit || k.nama_departemen === downloadUnit;
      const searchLower = downloadSearchKar.toLowerCase();
      const matchSearch =
        !downloadSearchKar ||
        k.nama_lengkap.toLowerCase().includes(searchLower) ||
        (k.nip && k.nip.toLowerCase().includes(searchLower));
      return matchUnit && matchSearch;
    });
  }, [karyawans, downloadUnit, downloadSearchKar]);

  const piketCols = useMemo(() => {
    return shifts.filter((s) => s.nama_shift.includes("8-4 (Sabtu)"));
  }, [shifts]);

  // Aggregate stats
  const totalAssignedDefault = useMemo(() => karyawans.filter((k) => k.jadwal_kerja_id).length, [karyawans]);

  // GSAP: Entrance animation
  useGSAP(
    () => {
      const tl = gsap.timeline({ defaults: { ease: "power2.out" } });

      tl.from(".plot-header", {
        y: -12,
        opacity: 0,
        duration: 0.45,
        clearProps: "all",
      })
        .from(
          ".plot-kpi-card",
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
          ".plot-tab-container",
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

  // GSAP: Tab transition
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
      <div className="plot-header flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-4 border-b border-slate-200/80">
        <div>
          <div className="flex items-center gap-2 mb-1 text-[#0173b6] font-bold uppercase tracking-wider text-xs">
            <CalendarRange size={16} />
            <span>Manajemen Shift &amp; Plotting Dinas</span>
          </div>
          <h1 className="text-3xl font-bold text-[#05445e] tracking-tight">
            Manajemen Plotting Jadwal Pegawai
          </h1>
          <p className="text-slate-500 font-medium text-sm mt-1 max-w-2xl">
            Atur template jadwal default rutin, matriks board shifting 24/7 harian, dan penugasan piket koordinasi RSU Avisena.
          </p>
        </div>

        {/* DaisyUI Tabs Box Switcher */}
        <div className="tabs tabs-box bg-slate-100 p-1 rounded-2xl border border-slate-200/80 shrink-0">
          <button
            onClick={() => setActiveTab("DEFAULT")}
            className={`tab font-bold text-xs rounded-xl transition-all gap-1.5 ${activeTab === "DEFAULT"
                ? "tab-active bg-[#0173b6] text-white shadow-xs"
                : "text-slate-600 hover:text-slate-900"
              }`}
          >
            <UserCheck size={15} />
            <span>Jadwal Default Rutin</span>
          </button>
          <button
            onClick={() => setActiveTab("BOARD_SHIFT")}
            className={`tab font-bold text-xs rounded-xl transition-all gap-1.5 ${activeTab === "BOARD_SHIFT"
                ? "tab-active bg-[#0173b6] text-white shadow-xs"
                : "text-slate-600 hover:text-slate-900"
              }`}
          >
            <CalendarRange size={15} />
            <span>Board Shifting (24/7)</span>
          </button>
          <button
            onClick={() => setActiveTab("BOARD_PIKET")}
            className={`tab font-bold text-xs rounded-xl transition-all gap-1.5 ${activeTab === "BOARD_PIKET"
                ? "tab-active bg-[#0173b6] text-white shadow-xs"
                : "text-slate-600 hover:text-slate-900"
              }`}
          >
            <ShieldCheck size={15} />
            <span>Piket Sabtu (SPV)</span>
          </button>
        </div>
      </div>

      {/* LAYER 2: KPI / SUMMARY RIBBON (4 METRICS) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="plot-kpi-card bg-white border border-slate-200/90 rounded-2xl p-4 shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Pegawai</p>
            <p className="text-2xl font-black text-slate-800 font-mono tabular-nums mt-0.5">
              {karyawans.length} <span className="text-xs font-semibold text-slate-400 font-sans">Orang</span>
            </p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-blue-50 text-[#0173b6] flex items-center justify-center font-bold">
            <Users size={22} />
          </div>
        </div>

        <div className="plot-kpi-card bg-white border border-slate-200/90 rounded-2xl p-4 shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Jadwal Default Terisi</p>
            <p className="text-2xl font-black text-emerald-600 font-mono tabular-nums mt-0.5">
              {totalAssignedDefault} <span className="text-xs font-semibold text-slate-400 font-sans">Pegawai</span>
            </p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            <CheckCircle2 size={22} />
          </div>
        </div>

        <div className="plot-kpi-card bg-white border border-slate-200/90 rounded-2xl p-4 shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Plotting Shift Bulan Ini</p>
            <p className="text-2xl font-black text-indigo-600 font-mono tabular-nums mt-0.5">
              {boardData.length} <span className="text-xs font-semibold text-slate-400 font-sans">Record</span>
            </p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
            <Layers size={22} />
          </div>
        </div>

        <div className="plot-kpi-card bg-white border border-slate-200/90 rounded-2xl p-4 shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Unit / Departemen</p>
            <p className="text-2xl font-black text-[#0173b6] font-mono tabular-nums mt-0.5">
              {uniqueUnits.length} <span className="text-xs font-semibold text-slate-400 font-sans">Unit</span>
            </p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-blue-50 text-[#0173b6] flex items-center justify-center font-bold">
            <Sparkles size={22} />
          </div>
        </div>
      </div>

      {/* LAYER 3: KONTROL FILTER & TOOLBAR */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs space-y-4 relative z-20">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Parameter &amp; Filter Data
            </span>
            {activeTab !== "DEFAULT" && (
              <span className="badge badge-sm badge-outline text-[10px] font-mono font-bold text-[#0173b6] border-[#0173b6]/30">
                Cut-Off 26–25
              </span>
            )}
          </div>

          {/* Quick Actions (Export / Import Excel) for Board Tabs */}
          {activeTab !== "DEFAULT" && (
            <div className="flex items-center gap-2">
              <button
                onClick={handleOpenDownloadModal}
                className="btn btn-xs min-h-[34px] bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl px-3 border-0 gap-1.5"
              >
                <Download size={14} />
                <span>Template Excel</span>
              </button>
              <button
                onClick={() => setIsImportModalOpen(true)}
                className="btn btn-xs min-h-[34px] bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl px-3 border-0 gap-1.5 shadow-2xs"
              >
                <Upload size={14} />
                <span>Import Excel</span>
              </button>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {/* Unit Dropdown */}
          <div className="relative z-30">
            <SearchableSelect
              options={unitOptions}
              value={selectedUnit}
              onChange={(opt) => setSelectedUnit(opt)}
              placeholder="Filter Unit / Departemen..."
              isClearable={false}
            />
          </div>

          {/* If DEFAULT: Search input */}
          {activeTab === "DEFAULT" && (
            <div className="relative md:col-span-2">
              <input
                type="text"
                placeholder="Cari nama atau NIP pegawai..."
                value={searchDefaultQuery}
                onChange={(e) => setSearchDefaultQuery(e.target.value)}
                className="w-full h-[38px] pl-9 pr-8 bg-slate-50/80 border border-slate-200/90 rounded-xl text-xs font-semibold text-slate-800 focus:bg-white focus:border-[#0173b6] focus:ring-2 focus:ring-[#0173b6]/20 outline-none transition-all placeholder:text-slate-400"
              />
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
              {searchDefaultQuery && (
                <button
                  onClick={() => setSearchDefaultQuery("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
                >
                  <X size={14} />
                </button>
              )}
            </div>
          )}

          {/* If BOARD: Month picker */}
          {activeTab !== "DEFAULT" && (
            <div className="relative md:col-span-2 flex items-center gap-3">
              <div className="relative flex-1">
                <input
                  type="month"
                  value={plotMonth}
                  onChange={(e) => setPlotMonth(e.target.value)}
                  className="w-full h-[38px] px-3.5 bg-slate-50/80 border border-slate-200/90 rounded-xl text-xs font-bold text-slate-800 font-mono focus:bg-white focus:border-[#0173b6] outline-none transition-all"
                />
              </div>
              {plotMonth && (
                <div className="hidden lg:flex items-center gap-1.5 px-3 py-2 bg-blue-50 border border-blue-200/70 rounded-xl text-xs text-[#0173b6] font-mono tabular-nums shrink-0">
                  <CalendarDays size={14} />
                  <span>
                    Cut-Off:{" "}
                    {(() => {
                      const [y, m] = plotMonth.split("-").map(Number);
                      if (!y || !m) return "";
                      const start = new Date(y, m - 2, 26);
                      const end = new Date(y, m - 1, 25);
                      const opt: Intl.DateTimeFormatOptions = { day: "numeric", month: "short" };
                      return `${start.toLocaleDateString("id-ID", opt)} s/d ${end.toLocaleDateString("id-ID", opt)}`;
                    })()}
                  </span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* LAYER 4, 5: KONTEN UTAMA BERDASARKAN TAB */}
      <div ref={tabContentRef} className="plot-tab-container space-y-6">
        {/* TAB 1: DEFAULT JADWAL */}
        {activeTab === "DEFAULT" && (
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-[#05445e] text-white uppercase tracking-wider font-semibold">
                    <th className="py-3.5 px-6">Nama Pegawai</th>
                    <th className="py-3.5 px-4 font-mono">NIP Pegawai</th>
                    <th className="py-3.5 px-4">Unit / Departemen</th>
                    <th className="py-3.5 px-4 text-center">Template Jadwal Default</th>
                    <th className="py-3.5 px-6 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {isLoading ? (
                    <tr>
                      <td colSpan={5} className="py-20 text-center">
                        <Loader2 className="w-8 h-8 text-[#0173b6] animate-spin mx-auto mb-2" />
                        <p className="text-xs font-bold text-slate-500">Memuat penugasan jadwal pegawai...</p>
                      </td>
                    </tr>
                  ) : currentKaryawans.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-16 text-center">
                        <p className="text-xs font-bold text-slate-400">Tidak ada pegawai ditemukan.</p>
                      </td>
                    </tr>
                  ) : (
                    currentKaryawans.map((kar, idx) => (
                      <tr
                        key={kar.id}
                        className={`hover:bg-blue-50/40 transition-colors ${idx % 2 === 0 ? "bg-white" : "bg-slate-50/30"
                          }`}
                      >
                        <td className="py-3.5 px-6">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-blue-50 text-[#0173b6] border border-blue-100 flex items-center justify-center font-black text-xs shrink-0">
                              {kar.nama_lengkap.charAt(0)}
                            </div>
                            <span className="font-bold text-slate-900 text-xs">{kar.nama_lengkap}</span>
                          </div>
                        </td>

                        <td className="py-3.5 px-4 font-mono tabular-nums text-slate-600 font-semibold">
                          {kar.nip || "-"}
                        </td>

                        <td className="py-3.5 px-4 font-medium text-slate-600">
                          {kar.nama_departemen || "-"}
                        </td>

                        <td className="py-3.5 px-4 text-center">
                          {kar.nama_jadwal ? (
                            <span className="badge badge-sm badge-info text-white bg-blue-600 border-blue-700 font-bold text-[10px]">
                              {kar.nama_jadwal}
                            </span>
                          ) : (
                            <span className="badge badge-sm badge-ghost text-slate-400 font-medium text-[10px] italic">
                              Belum Ditetapkan
                            </span>
                          )}
                        </td>

                        <td className="py-3.5 px-6 text-center">
                          <button
                            onClick={() => handleOpenAssignModal(kar)}
                            className="btn btn-xs min-h-[30px] bg-blue-50 hover:bg-[#0173b6] text-[#0173b6] hover:text-white font-bold rounded-lg px-3 border border-blue-200/60 transition-all gap-1 text-[11px]"
                          >
                            <UserCheck size={13} />
                            <span>Atur Template</span>
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Footer Pagination */}
            <div className="p-3 border-t border-slate-100 bg-slate-50/50">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
              />
            </div>
          </div>
        )}

        {/* TAB 2 & 3: BOARD SHIFTING & BOARD PIKET */}
        {(activeTab === "BOARD_SHIFT" || activeTab === "BOARD_PIKET") && (
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
            <div className="overflow-x-auto max-h-[72vh] custom-scrollbar">
              <table className="w-full text-left border-collapse text-xs">
                <thead className="bg-[#05445e] text-white uppercase tracking-wider font-semibold sticky top-0 z-10 shadow-xs">
                  <tr>
                    <th className="py-3.5 px-4 w-28 text-center border-r border-slate-600/50">Tanggal</th>
                    {activeTab === "BOARD_SHIFT"
                      ? categories.map((cat) => (
                        <th
                          key={cat}
                          className="py-3.5 px-4 min-w-[200px] text-center border-r border-slate-600/50 font-bold"
                        >
                          {cat}
                        </th>
                      ))
                      : piketCols.map((s) => (
                        <th
                          key={s.id}
                          className="py-3.5 px-4 min-w-[220px] text-center border-r border-slate-600/50 font-bold"
                        >
                          {s.nama_shift}
                          {s.jam_masuk && (
                            <span className="text-[10px] opacity-75 block font-mono font-normal">
                              {s.jam_masuk.slice(0, 5)} - {s.jam_keluar?.slice(0, 5)}
                            </span>
                          )}
                        </th>
                      ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {isFetchingBoard ? (
                    <tr>
                      <td colSpan={10} className="p-20 text-center">
                        <Loader2 className="animate-spin mx-auto text-[#0173b6] mb-2" size={32} />
                        <p className="text-xs font-bold text-slate-500">Memuat matriks penugasan dinas...</p>
                      </td>
                    </tr>
                  ) : (
                    getDaysInMonth(activeTab === "BOARD_PIKET").map((dateStr) => {
                      const dateObj = new Date(dateStr);
                      const isSunday = dateObj.getDay() === 0;
                      const isSaturday = dateObj.getDay() === 6;

                      return (
                        <tr
                          key={dateStr}
                          className={`transition-colors ${isSunday
                              ? "bg-rose-50/40 hover:bg-rose-50/70"
                              : isSaturday
                                ? "bg-blue-50/20 hover:bg-blue-50/50"
                                : "hover:bg-slate-50/80"
                            }`}
                        >
                          {/* Kolom Tanggal */}
                          <td
                            className={`py-3 px-3 text-center border-r border-slate-200/80 font-mono tabular-nums ${isSunday ? "text-rose-600 font-bold" : "text-slate-800"
                              }`}
                          >
                            <span className="text-base font-black block leading-none">{dateObj.getDate()}</span>
                            <span className="text-[10px] text-slate-400 font-sans uppercase font-bold block mt-0.5">
                              {dateObj.toLocaleDateString("id-ID", { month: "short" })}
                            </span>
                            <span
                              className={`text-[10px] font-sans font-semibold block ${isSunday ? "text-rose-500" : "text-slate-500"
                                }`}
                            >
                              {getDayName(dateStr)}
                            </span>
                          </td>

                          {/* Kolom Shift Cells */}
                          {(activeTab === "BOARD_SHIFT" ? categories : piketCols).map((catOrShift) => {
                            if (activeTab === "BOARD_SHIFT") {
                              const cat = catOrShift as string;
                              const assignedInCat = filteredBoardData.filter((b) => {
                                const shiftInfo = shifts.find((s) => s.id === b.shift_id);
                                return (
                                  b.tanggal === dateStr && shiftInfo && getShiftCategory(shiftInfo.nama_shift) === cat
                                );
                              });

                              const isCutiCol = cat === "Cuti";

                              return (
                                <td
                                  key={cat}
                                  onClick={() => !isCutiCol && handleCellClickCat(dateStr, cat)}
                                  className={`p-2 border-r border-slate-200/80 align-top group transition-colors ${!isCutiCol ? "cursor-pointer hover:bg-blue-50/60" : "bg-slate-50/40"
                                    }`}
                                >
                                  <div className="flex flex-wrap gap-1.5 min-h-[46px] items-start content-start">
                                    {assignedInCat.length > 0 ? (
                                      assignedInCat.map((a, i) => {
                                        const shiftInfo = shifts.find((s) => s.id === a.shift_id);
                                        const shiftName = shiftInfo?.nama_shift || "";

                                        let bgClass = "bg-white text-slate-800 border-slate-200/90 shadow-2xs";
                                        if (cat === "Libur") bgClass = "bg-amber-50 text-amber-800 border-amber-200/70";
                                        if (cat === "Cuti") bgClass = "bg-blue-50 text-[#0173b6] border-blue-200/70 font-bold";

                                        return (
                                          <span
                                            key={i}
                                            title={shiftName}
                                            className={`text-[11px] px-2 py-0.5 rounded-lg border font-medium ${bgClass}`}
                                          >
                                            {a.nama_lengkap.split(" ")[0]}
                                            <span className="opacity-60 ml-1 text-[10px]">({shiftName})</span>
                                          </span>
                                        );
                                      })
                                    ) : !isCutiCol ? (
                                      <div className="w-full h-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-[#0173b6] bg-blue-50 px-2.5 py-1 rounded-md border border-blue-200/60">
                                          <Plus size={12} /> Assign {cat}
                                        </span>
                                      </div>
                                    ) : null}
                                  </div>
                                </td>
                              );
                            } else {
                              const s = catOrShift as Shift;
                              const assigned = filteredBoardData.filter(
                                (b) => b.tanggal === dateStr && b.shift_id === s.id
                              );
                              return (
                                <td
                                  key={s.id}
                                  onClick={() => handleCellClick(dateStr, s)}
                                  className="p-2 border-r border-slate-200/80 cursor-pointer align-top group hover:bg-blue-50/60 transition-colors"
                                >
                                  <div className="flex flex-wrap gap-1.5 min-h-[46px] items-start content-start">
                                    {assigned.length > 0 ? (
                                      assigned.map((a, i) => (
                                        <span
                                          key={i}
                                          className="text-[11px] px-2 py-0.5 rounded-lg border bg-white text-slate-800 border-slate-200/90 shadow-2xs font-medium"
                                        >
                                          {a.nama_lengkap.split(" ")[0]}
                                        </span>
                                      ))
                                    ) : (
                                      <div className="w-full h-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-[#0173b6] bg-blue-50 px-2.5 py-1 rounded-md border border-blue-200/60">
                                          <Plus size={12} /> Assign Piket
                                        </span>
                                      </div>
                                    )}
                                  </div>
                                </td>
                              );
                            }
                          })}
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* MODAL 1: ASSIGN DEFAULT JADWAL */}
      <Modal
        isOpen={isAssignModalOpen}
        onClose={() => setIsAssignModalOpen(false)}
        title={`Assign Jadwal: ${selectedKaryawan?.nama_lengkap || "Pegawai"}`}
      >
        <form onSubmit={handleAssignSubmit} className="space-y-4 p-1">
          <p className="text-xs text-slate-500 leading-relaxed">
            Jadwal default ini akan selalu diterapkan ke pegawai setiap minggunya secara otomatis.
          </p>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Pilih Template Jadwal Kerja
            </label>
            <select
              value={assignFormData.jadwal_kerja_id}
              onChange={(e) => setAssignFormData({ jadwal_kerja_id: e.target.value })}
              className="select select-sm select-bordered w-full h-[42px] rounded-xl text-xs font-semibold bg-slate-50/80 focus:bg-white"
            >
              <option value="">-- Tidak Ada Jadwal (Bebas / Dihapus) --</option>
              {jadwals.map((j) => (
                <option key={j.id} value={j.id}>
                  {j.nama_jadwal} {j.tipe ? `(${j.tipe})` : ""}
                </option>
              ))}
            </select>
          </div>

          <div className="flex justify-end gap-2.5 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsAssignModalOpen(false)}
              className="btn btn-sm btn-ghost text-xs font-bold text-slate-600 rounded-xl px-4"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isAssigning}
              className="btn btn-sm bg-[#0173b6] hover:bg-[#005f98] text-white font-bold rounded-xl px-5 border-0 text-xs uppercase tracking-wider shadow-xs"
            >
              {isAssigning ? <Loader2 size={15} className="animate-spin" /> : "Simpan Jadwal"}
            </button>
          </div>
        </form>
      </Modal>

      {/* MODAL 2: ASSIGN CELL BOARD */}
      <Modal isOpen={isBoardModalOpen} onClose={() => setIsBoardModalOpen(false)} title="Penugasan Shift Pegawai" size="2xl">
        {(activeCell || activeCatCell) && (
          <form onSubmit={handleBoardSubmit} className="space-y-4 p-1">
            <div className="bg-slate-50 p-4 rounded-xl flex justify-between items-center border border-slate-200">
              <div>
                <p className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">Tanggal Dinas</p>
                <p className="text-sm font-bold text-slate-800">
                  {new Date((activeCell?.tanggal || activeCatCell?.tanggal) as string).toLocaleDateString("id-ID", {
                    weekday: "long",
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </p>
              </div>
              <div className="text-right">
                <p className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">
                  {activeCatCell ? `Kategori: ${activeCatCell.category}` : "Shift"}
                </p>
                <p className="text-sm font-bold text-[#0173b6]">
                  {activeCatCell ? activeCatCell.category : activeCell?.shift_name}
                </p>
              </div>
            </div>

            {activeCatCell && (
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Pilih Varian Shift Kerja
                </label>
                <select
                  className="select select-sm select-bordered w-full h-[40px] rounded-xl text-xs font-semibold bg-white"
                  value={selectedShiftVariant || ""}
                  onChange={(e) => handleVariantChange(e.target.value)}
                  required
                >
                  {shifts
                    .filter((s) => getShiftCategory(s.nama_shift) === activeCatCell.category)
                    .map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.nama_shift} {s.jam_masuk ? `(${s.jam_masuk.slice(0, 5)} - ${s.jam_keluar?.slice(0, 5)})` : ""}
                      </option>
                    ))}
                </select>
              </div>
            )}

            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
              <input
                type="text"
                placeholder="Cari nama atau NIP pegawai..."
                value={searchKaryawan}
                onChange={(e) => setSearchKaryawan(e.target.value)}
                className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-[#0173b6]"
              />
            </div>

            <div className="border border-slate-200 rounded-xl overflow-hidden h-[260px] overflow-y-auto bg-white custom-scrollbar divide-y divide-slate-100">
              {filteredKaryawanForModal.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-400 font-bold">Pegawai tidak ditemukan.</div>
              ) : (
                filteredKaryawanForModal.map((kar) => (
                  <label
                    key={kar.id}
                    className="flex items-center gap-3 p-2.5 hover:bg-slate-50 cursor-pointer transition-colors"
                  >
                    <input
                      type="checkbox"
                      checked={selectedKaryawanIds.includes(kar.id)}
                      onChange={() => toggleKaryawanSelection(kar.id)}
                      className="checkbox checkbox-primary checkbox-sm rounded-md"
                    />
                    <div>
                      <span className="font-bold text-xs text-slate-800">{kar.nama_lengkap}</span>
                      <p className="text-[11px] font-mono text-slate-400">NIP: {kar.nip || "-"}</p>
                    </div>
                  </label>
                ))
              )}
            </div>

            <div className="flex justify-between items-center pt-3 border-t border-slate-100">
              <span className="text-xs text-slate-500 font-mono">
                <strong className="text-slate-800">{selectedKaryawanIds.length}</strong> pegawai terpilih
              </span>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsBoardModalOpen(false)}
                  className="btn btn-sm btn-ghost text-xs font-bold text-slate-600 rounded-xl px-4"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingBoard}
                  className="btn btn-sm bg-[#0173b6] hover:bg-[#005f98] text-white font-bold rounded-xl px-5 border-0 text-xs uppercase tracking-wider shadow-xs"
                >
                  {isSubmittingBoard ? <Loader2 size={15} className="animate-spin" /> : "Simpan Pegawai"}
                </button>
              </div>
            </div>
          </form>
        )}
      </Modal>

      {/* MODAL 3: DOWNLOAD TEMPLATE EXCEL */}
      <Modal
        isOpen={isDownloadModalOpen}
        onClose={() => setIsDownloadModalOpen(false)}
        title="Download Template Plotting Shift"
        size="2xl"
      >
        <div className="space-y-4 p-1">
          <div className="bg-blue-50 border border-blue-200/80 rounded-xl p-3.5 text-xs text-blue-900 flex items-start gap-2.5">
            <Info className="text-[#0173b6] mt-0.5 shrink-0" size={16} />
            <div>
              <p className="font-bold">Konfigurasi Template Plotting Shift</p>
              <p className="text-blue-800/90 text-[11px] mt-0.5 leading-relaxed">
                Template Excel memuat ID Pegawai unik dan daftar pilihan shift resmi RS Avisena.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Periode Bulan &amp; Tahun
              </label>
              <input
                type="month"
                value={downloadMonth}
                onChange={(e) => setDownloadMonth(e.target.value)}
                className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold bg-slate-50 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Format Template
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setDownloadMode("schedule")}
                  className={`p-2 rounded-xl border text-left text-xs transition-all ${downloadMode === "schedule"
                      ? "border-[#0173b6] bg-blue-50/70 text-[#0173b6] font-bold"
                      : "border-slate-200 text-slate-600 hover:bg-slate-50"
                    }`}
                >
                  <p className="font-bold">Jadwal Harian</p>
                  <p className="text-[10px] opacity-75 font-normal">Baris tanggal terisi</p>
                </button>
                <button
                  type="button"
                  onClick={() => setDownloadMode("blank")}
                  className={`p-2 rounded-xl border text-left text-xs transition-all ${downloadMode === "blank"
                      ? "border-[#0173b6] bg-blue-50/70 text-[#0173b6] font-bold"
                      : "border-slate-200 text-slate-600 hover:bg-slate-50"
                    }`}
                >
                  <p className="font-bold">Format Bebas</p>
                  <p className="text-[10px] opacity-75 font-normal">Baris dropdown kosong</p>
                </button>
              </div>
            </div>
          </div>

          {downloadMode === "schedule" && (
            <label className="flex items-center gap-2.5 p-3 bg-slate-50 rounded-xl border border-slate-200 cursor-pointer text-xs text-slate-700">
              <input
                type="checkbox"
                checked={downloadIncludeExisting}
                onChange={(e) => setDownloadIncludeExisting(e.target.checked)}
                className="checkbox checkbox-primary checkbox-sm rounded-md"
              />
              <div>
                <span className="font-bold text-slate-800">Sertakan jadwal yang sudah tersimpan saat ini</span>
                <p className="text-[11px] text-slate-400">Memudahkan revisi tanpa mengisi ulang dari nol.</p>
              </div>
            </label>
          )}

          {/* List Pegawai */}
          <div className="space-y-2 pt-2 border-t border-slate-100">
            <div className="flex justify-between items-center">
              <span className="text-xs font-bold text-slate-700">
                Pilih Pegawai ({downloadSelectedKarIds.length} dari {karyawans.length})
              </span>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleSelectAllDownload}
                  className="btn btn-xs btn-ghost text-xs font-bold text-[#0173b6]"
                >
                  Pilih Semua
                </button>
                <button
                  type="button"
                  onClick={handleDeselectAllDownload}
                  className="btn btn-xs btn-ghost text-xs font-bold text-slate-500"
                >
                  Batal Semua
                </button>
              </div>
            </div>

            <div className="border border-slate-200 rounded-xl overflow-hidden max-h-48 overflow-y-auto bg-white divide-y divide-slate-100 custom-scrollbar">
              {filteredKaryawanForDownload.map((kar) => {
                const isChecked = downloadSelectedKarIds.includes(kar.id);
                return (
                  <label
                    key={kar.id}
                    className={`flex items-center justify-between px-3 py-2 cursor-pointer text-xs ${isChecked ? "bg-blue-50/40" : ""
                      }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => toggleDownloadKaryawan(kar.id)}
                        className="checkbox checkbox-primary checkbox-xs rounded"
                      />
                      <span className="font-bold text-slate-800">{kar.nama_lengkap}</span>
                    </div>
                    {kar.nama_departemen && (
                      <span className="text-[10px] text-slate-400 font-medium">{kar.nama_departemen}</span>
                    )}
                  </label>
                );
              })}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsDownloadModalOpen(false)}
              className="btn btn-sm btn-ghost text-xs font-bold text-slate-600 rounded-xl px-4"
            >
              Batal
            </button>
            <button
              type="button"
              onClick={handleExecuteDownloadTemplate}
              disabled={isDownloading || (downloadMode === "schedule" && downloadSelectedKarIds.length === 0)}
              className="btn btn-sm bg-[#0173b6] hover:bg-[#005f98] text-white font-bold rounded-xl px-5 border-0 text-xs uppercase tracking-wider shadow-xs gap-1.5"
            >
              {isDownloading ? <Loader2 className="animate-spin" size={15} /> : <Download size={15} />}
              <span>Download Excel</span>
            </button>
          </div>
        </div>
      </Modal>

      {/* MODAL 4: IMPORT EXCEL */}
      <Modal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        title="Import Jadwal Plotting Shift"
        size="lg"
      >
        <form onSubmit={handleImportSubmit} className="space-y-4 p-1">
          <div className="text-center p-6 border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50 hover:bg-slate-100/50 transition-colors">
            <FileSpreadsheet className="mx-auto text-emerald-600 mb-2" size={36} />
            <p className="text-xs font-bold text-slate-700">Pilih berkas template Excel (.xlsx / .csv)</p>
            <input
              type="file"
              accept=".xlsx, .xls, .csv"
              onChange={(e) => setImportFile(e.target.files?.[0] || null)}
              className="mt-3 file-input file-input-sm file-input-bordered w-full max-w-xs text-xs"
              required
            />
            {importFile && (
              <p className="text-xs font-bold text-emerald-700 mt-2">
                Berkas: {importFile.name} ({(importFile.size / 1024).toFixed(1)} KB)
              </p>
            )}
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsImportModalOpen(false)}
              className="btn btn-sm btn-ghost text-xs font-bold text-slate-600 rounded-xl px-4"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={!importFile || isImporting}
              className="btn btn-sm bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl px-5 border-0 text-xs uppercase tracking-wider shadow-xs gap-1.5"
            >
              {isImporting ? <Loader2 size={15} className="animate-spin" /> : <Upload size={15} />}
              <span>Upload &amp; Simpan</span>
            </button>
          </div>
        </form>
      </Modal>

      {/* MODAL 5: LAPORAN HASIL IMPORT */}
      <Modal
        isOpen={isResultModalOpen}
        onClose={() => setIsResultModalOpen(false)}
        title="Laporan Hasil Import Jadwal"
        size="lg"
      >
        {importResult && (
          <div className="space-y-4 p-1">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-center">
              <div className="bg-emerald-50 border border-emerald-200/80 rounded-xl p-3">
                <p className="text-[10px] text-emerald-700 font-bold uppercase tracking-wider">Berhasil</p>
                <p className="text-2xl font-black text-emerald-800 font-mono tabular-nums">{importResult.successCount}</p>
              </div>
              {importResult.deletedCount !== undefined && importResult.deletedCount > 0 && (
                <div className="bg-blue-50 border border-blue-200/80 rounded-xl p-3">
                  <p className="text-[10px] text-blue-700 font-bold uppercase tracking-wider">Dikosongkan</p>
                  <p className="text-2xl font-black text-blue-800 font-mono tabular-nums">{importResult.deletedCount}</p>
                </div>
              )}
              <div className="bg-amber-50 border border-amber-200/80 rounded-xl p-3">
                <p className="text-[10px] text-amber-700 font-bold uppercase tracking-wider">Catatan</p>
                <p className="text-2xl font-black text-amber-800 font-mono tabular-nums">{importResult.failedCount}</p>
              </div>
            </div>

            {importResult.failedRows && importResult.failedRows.length > 0 && (
              <div>
                <p className="text-xs font-bold text-slate-700 mb-1.5">Rincian Baris Catatan:</p>
                <div className="max-h-48 overflow-y-auto bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-mono custom-scrollbar divide-y divide-slate-100">
                  {importResult.failedRows.map((err, idx) => (
                    <div key={idx} className="py-1 text-amber-900 first:pt-0 last:pb-0">
                      • {err}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex justify-end pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsResultModalOpen(false)}
                className="btn btn-sm btn-ghost text-xs font-bold text-slate-600 rounded-xl px-5"
              >
                Tutup
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
