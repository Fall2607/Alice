"use client";

import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";

if (typeof window !== "undefined") {
  gsap.registerPlugin(useGSAP);
}
import {
  UserX,
  Search,
  Building2,
  Calendar,
  Clock,
  Eye,
  RotateCcw,
  X,
  Loader2,
  AlertTriangle,
  Download,
  Briefcase,
  Phone,
  Mail,
  MapPin,
  FileText,
} from "lucide-react";
import SearchableSelect from "@/app/components/admin/SearchableSelect";
import Pagination from "@/app/components/admin/Pagination";
import Modal from "@/app/components/modal";

interface KaryawanResign {
  id: string;
  nip: string;
  nama_lengkap: string;
  nik?: string;
  profesi?: string | null;
  nama_departemen?: string | null;
  nama_level?: string | null;
  nama_atasan?: string | null;
  tanggal_masuk?: string | null;
  tanggal_keluar?: string | null;
  alasan_resign?: string | null;
  handphone?: string | null;
  email?: string | null;
  alamat?: string | null;
  jenis_kelamin?: string | null;
  status_kepegawaian?: string | null;
}

interface Departemen {
  id: string | number;
  nama_departemen: string;
}

type FormOption = { value: string; label: string };

const SORT_OPTIONS: FormOption[] = [
  { value: "date_desc", label: "Tanggal Keluar (Terbaru)" },
  { value: "date_asc", label: "Tanggal Keluar (Terlama)" },
  { value: "name_asc", label: "Nama Pegawai (A - Z)" },
  { value: "tenure_desc", label: "Masa Kerja (Terpanjang)" },
];

export default function PegawaiResignPage() {
  const [employees, setEmployees] = useState<KaryawanResign[]>([]);
  const [departments, setDepartments] = useState<Departemen[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isClient, setIsClient] = useState(false);

  // Filters & Search state
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDept, setSelectedDept] = useState<FormOption | null>(null);
  const [selectedYear, setSelectedYear] = useState<FormOption | null>(null);
  const [selectedSort, setSelectedSort] = useState<FormOption | null>(SORT_OPTIONS[0]);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Modal detail state
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [activeEmployee, setActiveEmployee] = useState<KaryawanResign | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);

  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "";

  useEffect(() => {
    setIsClient(true);
  }, []);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [resKaryawan, resDept] = await Promise.all([
        fetch(`${baseUrl}/karyawan?resign_only=true`),
        fetch(`${baseUrl}/departments`),
      ]);

      if (!resKaryawan.ok) {
        throw new Error("Gagal memuat data pegawai resign.");
      }

      const karyawanData: KaryawanResign[] = await resKaryawan.json();
      setEmployees(karyawanData);

      if (resDept.ok) {
        const deptData: Departemen[] = await resDept.json();
        setDepartments(deptData);
      }
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : "Terjadi kesalahan saat memuat data."
      );
    } finally {
      setIsLoading(false);
    }
  }, [baseUrl]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Calculate Tenure (Masa Kerja)
  const calculateTenure = (
    tanggalMasuk?: string | null,
    tanggalKeluar?: string | null
  ) => {
    if (!tanggalMasuk || !tanggalKeluar) return "-";
    try {
      const start = new Date(tanggalMasuk);
      const end = new Date(tanggalKeluar);
      if (isNaN(start.getTime()) || isNaN(end.getTime()) || end < start) return "-";

      let years = end.getFullYear() - start.getFullYear();
      let months = end.getMonth() - start.getMonth();

      if (months < 0) {
        years--;
        months += 12;
      }

      const parts: string[] = [];
      if (years > 0) parts.push(`${years} thn`);
      if (months > 0 || years === 0) parts.push(`${months} bln`);
      return parts.join(" ");
    } catch {
      return "-";
    }
  };

  // Calculate Tenure in raw days for sorting
  const getTenureDays = (
    tanggalMasuk?: string | null,
    tanggalKeluar?: string | null
  ) => {
    if (!tanggalMasuk || !tanggalKeluar) return 0;
    const start = new Date(tanggalMasuk).getTime();
    const end = new Date(tanggalKeluar).getTime();
    if (isNaN(start) || isNaN(end) || end < start) return 0;
    return (end - start) / (1000 * 60 * 60 * 24);
  };

  // Format date helper
  const formatDate = (dateString?: string | null) => {
    if (!dateString) return "-";
    try {
      const d = new Date(dateString);
      if (isNaN(d.getTime())) return "-";
      return d.toLocaleDateString("id-ID", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });
    } catch {
      return "-";
    }
  };

  // Available unique years from resigned employees
  const availableYears = useMemo(() => {
    const yearsSet = new Set<string>();
    employees.forEach((e) => {
      if (e.tanggal_keluar) {
        const year = new Date(e.tanggal_keluar).getFullYear();
        if (!isNaN(year)) yearsSet.add(year.toString());
      }
    });
    return Array.from(yearsSet).sort((a, b) => b.localeCompare(a));
  }, [employees]);

  // Year options for SearchableSelect
  const yearOptions: FormOption[] = useMemo(() => {
    return [
      { value: "all", label: "Semua Tahun Keluar" },
      ...availableYears.map((yr) => ({
        value: yr,
        label: `Tahun ${yr}`,
      })),
    ];
  }, [availableYears]);

  // Combined Department Options (from API + existing data)
  const departmentOptions: FormOption[] = useMemo(() => {
    const deptNames = new Set<string>();
    departments.forEach((d) => {
      if (d.nama_departemen) deptNames.add(d.nama_departemen);
    });
    employees.forEach((e) => {
      if (e.nama_departemen) deptNames.add(e.nama_departemen);
    });

    const sortedNames = Array.from(deptNames).sort((a, b) => a.localeCompare(b));
    return [
      { value: "all", label: "Semua Unit / Departemen" },
      ...sortedNames.map((name) => ({ value: name, label: name })),
    ];
  }, [departments, employees]);

  // KPI Metrics Calculation
  const stats = useMemo(() => {
    const totalAlumni = employees.length;
    const currentYear = new Date().getFullYear().toString();

    const resignThisYear = employees.filter((e) => {
      if (!e.tanggal_keluar) return false;
      const yr = new Date(e.tanggal_keluar).getFullYear().toString();
      return yr === currentYear;
    }).length;

    // Unit with highest resignation count
    const deptCounts: Record<string, number> = {};
    employees.forEach((e) => {
      const dept = e.nama_departemen || "Lainnya";
      deptCounts[dept] = (deptCounts[dept] || 0) + 1;
    });

    let topDept = "-";
    let maxCount = 0;
    Object.entries(deptCounts).forEach(([dept, count]) => {
      if (count > maxCount) {
        maxCount = count;
        topDept = dept;
      }
    });

    // Average tenure in months
    let totalMonths = 0;
    let validTenureCount = 0;
    employees.forEach((e) => {
      if (e.tanggal_masuk && e.tanggal_keluar) {
        const start = new Date(e.tanggal_masuk);
        const end = new Date(e.tanggal_keluar);
        if (!isNaN(start.getTime()) && !isNaN(end.getTime()) && end >= start) {
          const diffMonths =
            (end.getFullYear() - start.getFullYear()) * 12 +
            (end.getMonth() - start.getMonth());
          totalMonths += diffMonths;
          validTenureCount++;
        }
      }
    });

    const avgTenure =
      validTenureCount > 0
        ? `${(totalMonths / validTenureCount / 12).toFixed(1)} Thn`
        : "-";

    return {
      totalAlumni,
      resignThisYear,
      topDept,
      topDeptCount: maxCount,
      avgTenure,
    };
  }, [employees]);

  // Filtering & Sorting
  const filteredEmployees = useMemo(() => {
    return employees
      .filter((emp) => {
        // Search filter
        const term = searchTerm.toLowerCase().trim();
        const matchesSearch =
          !term ||
          emp.nama_lengkap.toLowerCase().includes(term) ||
          emp.nip.toLowerCase().includes(term) ||
          (emp.profesi && emp.profesi.toLowerCase().includes(term)) ||
          (emp.nama_departemen && emp.nama_departemen.toLowerCase().includes(term)) ||
          (emp.alasan_resign && emp.alasan_resign.toLowerCase().includes(term));

        if (!matchesSearch) return false;

        // Department filter
        if (selectedDept && selectedDept.value !== "all") {
          if (emp.nama_departemen !== selectedDept.value) return false;
        }

        // Year filter
        if (selectedYear && selectedYear.value !== "all") {
          if (!emp.tanggal_keluar) return false;
          const year = new Date(emp.tanggal_keluar).getFullYear().toString();
          if (year !== selectedYear.value) return false;
        }

        return true;
      })
      .sort((a, b) => {
        const activeSort = selectedSort?.value || "date_desc";
        if (activeSort === "date_desc") {
          const dateA = a.tanggal_keluar ? new Date(a.tanggal_keluar).getTime() : 0;
          const dateB = b.tanggal_keluar ? new Date(b.tanggal_keluar).getTime() : 0;
          return dateB - dateA;
        }
        if (activeSort === "date_asc") {
          const dateA = a.tanggal_keluar ? new Date(a.tanggal_keluar).getTime() : 0;
          const dateB = b.tanggal_keluar ? new Date(b.tanggal_keluar).getTime() : 0;
          return dateA - dateB;
        }
        if (activeSort === "name_asc") {
          return a.nama_lengkap.localeCompare(b.nama_lengkap);
        }
        if (activeSort === "tenure_desc") {
          const tenureA = getTenureDays(a.tanggal_masuk, a.tanggal_keluar);
          const tenureB = getTenureDays(b.tanggal_masuk, b.tanggal_keluar);
          return tenureB - tenureA;
        }
        return 0;
      });
  }, [employees, searchTerm, selectedDept, selectedYear, selectedSort]);

  // Reset page on filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedDept, selectedYear, selectedSort]);

  // Pagination calculations
  const totalPages = Math.ceil(filteredEmployees.length / itemsPerPage);
  const paginatedEmployees = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredEmployees.slice(start, start + itemsPerPage);
  }, [filteredEmployees, currentPage, itemsPerPage]);

  const hasActiveFilters =
    Boolean(searchTerm) ||
    (selectedDept !== null && selectedDept.value !== "all") ||
    (selectedYear !== null && selectedYear.value !== "all") ||
    (selectedSort !== null && selectedSort.value !== "date_desc");

  const handleResetFilters = () => {
    setSearchTerm("");
    setSelectedDept(null);
    setSelectedYear(null);
    setSelectedSort(SORT_OPTIONS[0]);
  };

  // CSV Export for HR records
  const handleExportCSV = () => {
    if (filteredEmployees.length === 0) return;

    const headers = [
      "NIP",
      "Nama Lengkap",
      "Profesi / Jabatan",
      "Departemen / Unit",
      "Tanggal Masuk",
      "Tanggal Keluar",
      "Masa Kerja",
      "Alasan Resign",
    ];

    const rows = filteredEmployees.map((e) => [
      `"${e.nip || ""}"`,
      `"${e.nama_lengkap || ""}"`,
      `"${e.profesi || e.nama_level || ""}"`,
      `"${e.nama_departemen || ""}"`,
      `"${e.tanggal_masuk ? formatDate(e.tanggal_masuk) : ""}"`,
      `"${e.tanggal_keluar ? formatDate(e.tanggal_keluar) : ""}"`,
      `"${calculateTenure(e.tanggal_masuk, e.tanggal_keluar)}"`,
      `"${(e.alasan_resign || "").replace(/"/g, '""')}"`,
    ]);

    const csvContent =
      "\uFEFF" + [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `Pegawai_Resign_RSU_Avisena_${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleOpenDetail = (emp: KaryawanResign) => {
    setActiveEmployee(emp);
    setIsDetailModalOpen(true);
  };

  useGSAP(
    () => {
      const tl = gsap.timeline({ defaults: { ease: "power2.out" } });

      tl.from(".resign-header", {
        y: -12,
        opacity: 0,
        duration: 0.45,
        clearProps: "all",
      })
        .from(
          ".resign-kpi-card",
          {
            y: 16,
            opacity: 0,
            duration: 0.35,
            stagger: 0.05,
            clearProps: "all",
          },
          "-=0.25"
        )
        .from(
          ".resign-filter",
          {
            y: 12,
            opacity: 0,
            duration: 0.35,
            clearProps: "all",
          },
          "-=0.2"
        )
        .from(
          ".resign-table-wrap",
          {
            y: 16,
            opacity: 0,
            duration: 0.4,
            clearProps: "all",
          },
          "-=0.2"
        );
    },
    { scope: containerRef }
  );

  useGSAP(
    () => {
      if (paginatedEmployees.length > 0) {
        gsap.from(".resign-row-item", {
          y: 8,
          opacity: 0,
          duration: 0.28,
          stagger: 0.025,
          ease: "power2.out",
          clearProps: "all",
        });
      }
    },
    { scope: containerRef, dependencies: [currentPage, paginatedEmployees] }
  );

  return (
    <div ref={containerRef} className="p-8 font-sans min-h-screen space-y-6">
      {/* 1. Header Section */}
      <div className="resign-header flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-2 border-b border-slate-200/80">
        <div>
          <div className="flex items-center gap-2 mb-1 text-rose-600 font-bold uppercase tracking-wider text-xs">
            <UserX size={15} />
            <span>Arsip Kepegawaian & Alumni SDM</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-black text-slate-800 tracking-tight">
            Data Pegawai Resign
          </h1>
          <p className="text-slate-500 font-medium text-xs md:text-sm mt-1">
            Direktori arsip pegawai non-aktif dan riwayat pengunduran diri tenaga kesehatan serta staf RSU Avisena.
          </p>
        </div>

        <div className="flex items-center gap-2.5 w-full md:w-auto">
          <button
            type="button"
            onClick={handleExportCSV}
            disabled={filteredEmployees.length === 0}
            className="btn btn-sm btn-outline border-slate-200 hover:bg-slate-100 text-slate-700 font-bold rounded-xl gap-2 active:scale-[0.98] transition-all disabled:opacity-50"
            title="Ekspor CSV Arsip Alumni"
          >
            <Download size={14} />
            <span>Ekspor CSV</span>
          </button>
          <button
            type="button"
            onClick={fetchData}
            className="btn btn-sm bg-[#0173b6] hover:bg-[#05445e] text-white font-bold rounded-xl gap-2 active:scale-[0.98] transition-all shadow-xs"
          >
            <RotateCcw size={14} className={isLoading ? "animate-spin" : ""} />
            <span>Muat Ulang</span>
          </button>
        </div>
      </div>

      {/* 2. KPI Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {/* Card 1: Total Alumni */}
        <div className="resign-kpi-card bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Total Pegawai Resign
            </p>
            <p className="text-2xl font-black text-slate-800 mt-0.5 font-mono tabular-nums">
              {stats.totalAlumni}
              <span className="text-xs font-semibold text-slate-500 ml-1.5">Orang</span>
            </p>
            <p className="text-[11px] text-slate-400 mt-1">Arsip kumulatif alumni</p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold">
            <UserX size={20} />
          </div>
        </div>

        {/* Card 2: Resign Tahun Ini */}
        <div className="resign-kpi-card bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Resign Tahun Ini ({new Date().getFullYear()})
            </p>
            <p className="text-2xl font-black text-amber-600 mt-0.5 font-mono tabular-nums">
              {stats.resignThisYear}
              <span className="text-xs font-semibold text-slate-500 ml-1.5">Orang</span>
            </p>
            <p className="text-[11px] text-slate-400 mt-1">Tahun berjalan</p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
            <Calendar size={20} />
          </div>
        </div>

        {/* Card 3: Unit Terbanyak */}
        <div className="resign-kpi-card bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Unit Resign Terbanyak
            </p>
            <p className="text-base font-bold text-slate-800 mt-0.5 truncate max-w-[150px]" title={stats.topDept}>
              {stats.topDept}
            </p>
            <p className="text-[11px] text-slate-400 mt-1 font-mono tabular-nums">
              {stats.topDeptCount > 0 ? `${stats.topDeptCount} mantan pegawai` : "-"}
            </p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-blue-50 text-[#0173b6] flex items-center justify-center font-bold">
            <Building2 size={20} />
          </div>
        </div>

        {/* Card 4: Rata-rata Masa Kerja */}
        <div className="resign-kpi-card bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Rata-rata Masa Kerja
            </p>
            <p className="text-2xl font-black text-emerald-600 mt-0.5 font-mono tabular-nums">
              {stats.avgTenure}
            </p>
            <p className="text-[11px] text-slate-400 mt-1">Durasi pengabdian alumni</p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            <Clock size={20} />
          </div>
        </div>
      </div>

      {/* 3. Filter Toolbar Section */}
      <div className="resign-filter bg-white p-4 md:p-5 rounded-2xl border border-slate-200/90 shadow-xs space-y-3.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs font-black uppercase tracking-wider text-slate-700">
              Filter & Pencarian Alumni
            </span>
            <span className="badge badge-sm font-mono tabular-nums font-bold bg-slate-100 text-slate-600">
              {filteredEmployees.length} Hasil
            </span>
          </div>

          {hasActiveFilters && (
            <button
              type="button"
              onClick={handleResetFilters}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-[#0173b6] hover:text-[#05445e] transition-colors cursor-pointer"
            >
              <RotateCcw size={12} />
              <span>Reset Filter</span>
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Input Search NIP / Nama / Alasan */}
          <div className="relative">
            <input
              type="text"
              placeholder="Cari Nama, NIP, Profesi, Alasan..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-8 py-2 bg-slate-50/80 border border-slate-200/90 rounded-xl text-xs font-semibold text-slate-800 placeholder:text-slate-400 focus:bg-white focus:border-[#0173b6] focus:ring-2 focus:ring-[#0173b6]/20 outline-none transition-all h-[38px]"
            />
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              size={14}
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
                title="Hapus pencarian"
              >
                <X size={13} />
              </button>
            )}
          </div>

          {/* Filter Unit / Departemen */}
          <div>
            {isClient ? (
              <SearchableSelect
                options={departmentOptions}
                value={selectedDept}
                onChange={(val) => setSelectedDept(val as FormOption | null)}
                placeholder="Semua Unit / Departemen"
              />
            ) : (
              <div className="w-full h-[38px] bg-slate-100 rounded-xl animate-pulse" />
            )}
          </div>

          {/* Filter Tahun Resign */}
          <div>
            {isClient ? (
              <SearchableSelect
                options={yearOptions}
                value={selectedYear}
                onChange={(val) => setSelectedYear(val as FormOption | null)}
                placeholder="Semua Tahun Keluar"
              />
            ) : (
              <div className="w-full h-[38px] bg-slate-100 rounded-xl animate-pulse" />
            )}
          </div>

          {/* Urutan Data (Sorting) */}
          <div>
            {isClient ? (
              <SearchableSelect
                options={SORT_OPTIONS}
                value={selectedSort}
                onChange={(val) => setSelectedSort(val as FormOption | null || SORT_OPTIONS[0])}
                placeholder="Pilih Urutan Data"
                isClearable={false}
              />
            ) : (
              <div className="w-full h-[38px] bg-slate-100 rounded-xl animate-pulse" />
            )}
          </div>
        </div>

        {/* Active Filter Badges */}
        {hasActiveFilters && (
          <div className="flex flex-wrap items-center gap-1.5 pt-1 text-xs text-slate-500">
            <span className="font-semibold text-slate-400">Filter Aktif:</span>
            {searchTerm && (
              <span className="badge badge-sm bg-blue-50 text-[#0173b6] border border-blue-200 gap-1 font-semibold">
                Kata kunci: &quot;{searchTerm}&quot;
                <X
                  size={11}
                  className="cursor-pointer hover:text-blue-900"
                  onClick={() => setSearchTerm("")}
                />
              </span>
            )}
            {selectedDept && selectedDept.value !== "all" && (
              <span className="badge badge-sm bg-blue-50 text-[#0173b6] border border-blue-200 gap-1 font-semibold">
                Unit: {selectedDept.label}
                <X
                  size={11}
                  className="cursor-pointer hover:text-blue-900"
                  onClick={() => setSelectedDept(null)}
                />
              </span>
            )}
            {selectedYear && selectedYear.value !== "all" && (
              <span className="badge badge-sm bg-blue-50 text-[#0173b6] border border-blue-200 gap-1 font-semibold">
                Tahun: {selectedYear.label}
                <X
                  size={11}
                  className="cursor-pointer hover:text-blue-900"
                  onClick={() => setSelectedYear(null)}
                />
              </span>
            )}
            {selectedSort && selectedSort.value !== "date_desc" && (
              <span className="badge badge-sm bg-blue-50 text-[#0173b6] border border-blue-200 gap-1 font-semibold">
                Urutan: {selectedSort.label}
                <X
                  size={11}
                  className="cursor-pointer hover:text-blue-900"
                  onClick={() => setSelectedSort(SORT_OPTIONS[0])}
                />
              </span>
            )}
          </div>
        )}
      </div>

      {/* 4. Table Section */}
      <div className="resign-table-wrap bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="table table-zebra table-sm md:table-md w-full">
            <thead>
              <tr className="bg-[#05445e] text-white uppercase text-[11px] tracking-wider font-bold">
                <th className="py-3.5 px-4 text-white">Pegawai &amp; NIP</th>
                <th className="py-3.5 px-4 text-white">Departemen / Unit</th>
                <th className="py-3.5 px-4 text-white">Masa Pengabdian</th>
                <th className="py-3.5 px-4 text-white">Tanggal Keluar</th>
                <th className="py-3.5 px-4 text-white">Alasan Resign</th>
                <th className="py-3.5 px-4 text-center text-white">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="text-center py-16">
                    <Loader2 className="animate-spin h-8 w-8 text-[#0173b6] mx-auto" />
                    <p className="text-xs font-bold text-slate-500 mt-2">
                      Memuat direktori data pegawai resign...
                    </p>
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan={6} className="text-center py-16 text-rose-500">
                    <AlertTriangle className="inline-block h-8 w-8 text-rose-500 mb-2" />
                    <p className="font-bold text-sm">{error}</p>
                    <button
                      type="button"
                      onClick={fetchData}
                      className="btn btn-sm btn-outline border-rose-300 text-rose-600 mt-3 rounded-lg"
                    >
                      Coba Lagi
                    </button>
                  </td>
                </tr>
              ) : paginatedEmployees.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-16">
                    <UserX className="mx-auto mb-2 text-slate-300 h-12 w-12" />
                    <p className="text-sm font-bold text-slate-700">
                      {hasActiveFilters
                        ? "Tidak ada data pegawai resign yang sesuai filter"
                        : "Belum ada arsip pegawai resign terdaftar"}
                    </p>
                    <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                      {hasActiveFilters
                        ? "Silakan sesuaikan kata kunci pencarian atau bersihkan filter unit/tahun."
                        : "Pegawai yang diberhentikan atau dinonaktifkan akan otomatis tercatat di halaman ini."}
                    </p>
                    {hasActiveFilters && (
                      <button
                        type="button"
                        onClick={handleResetFilters}
                        className="btn btn-sm bg-[#0173b6] text-white rounded-xl mt-3 font-bold"
                      >
                        Reset Semua Filter
                      </button>
                    )}
                  </td>
                </tr>
              ) : (
                paginatedEmployees.map((emp) => {
                  const tenure = calculateTenure(emp.tanggal_masuk, emp.tanggal_keluar);
                  const formattedKeluar = formatDate(emp.tanggal_keluar);
                  const formattedMasuk = formatDate(emp.tanggal_masuk);

                  return (
                    <tr key={emp.id} className="resign-row-item hover:bg-slate-50/80 transition-colors">
                      {/* Pegawai & NIP */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center font-bold text-xs shrink-0 border border-slate-200">
                            {emp.nama_lengkap.slice(0, 2).toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <p className="font-bold text-slate-900 leading-snug truncate max-w-[200px]">
                              {emp.nama_lengkap}
                            </p>
                            <div className="flex items-center gap-1.5 text-[11px] text-slate-500 font-mono tabular-nums mt-0.5">
                              <span>NIP: {emp.nip}</span>
                              {emp.profesi && (
                                <>
                                  <span className="text-slate-300">•</span>
                                  <span className="truncate max-w-[120px] font-sans">
                                    {emp.profesi}
                                  </span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Departemen / Unit */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1.5">
                          <Building2 size={13} className="text-slate-400 shrink-0" />
                          <span className="font-semibold text-slate-800">
                            {emp.nama_departemen || "-"}
                          </span>
                        </div>
                        {emp.nama_level && (
                          <span className="text-[10px] text-slate-400 font-medium mt-0.5 block">
                            {emp.nama_level}
                          </span>
                        )}
                      </td>

                      {/* Masa Pengabdian */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1.5">
                          <Clock size={13} className="text-emerald-600 shrink-0" />
                          <span className="font-bold text-slate-800 font-mono tabular-nums">
                            {tenure}
                          </span>
                        </div>
                        <span className="text-[10px] text-slate-400 font-mono tabular-nums block mt-0.5">
                          Masuk: {formattedMasuk}
                        </span>
                      </td>

                      {/* Tanggal Keluar */}
                      <td className="py-3 px-4 font-mono tabular-nums">
                        <span className="inline-flex items-center gap-1 text-xs font-bold text-rose-700 bg-rose-50 border border-rose-200/60 px-2 py-0.5 rounded-lg">
                          <Calendar size={11} />
                          {formattedKeluar}
                        </span>
                      </td>

                      {/* Alasan Resign */}
                      <td className="py-3 px-4 max-w-xs">
                        <p
                          className="text-xs text-slate-700 line-clamp-2 leading-relaxed"
                          title={emp.alasan_resign || "-"}
                        >
                          {emp.alasan_resign || (
                            <span className="text-slate-400 italic">Tidak ada catatan</span>
                          )}
                        </p>
                      </td>

                      {/* Aksi Button */}
                      <td className="py-3 px-4 text-center">
                        <button
                          type="button"
                          onClick={() => handleOpenDetail(emp)}
                          className="btn btn-xs btn-ghost text-[#0173b6] hover:bg-blue-50 border border-blue-200/60 rounded-lg font-bold gap-1 active:scale-[0.98] transition-all"
                          title="Lihat detail arsip pegawai"
                        >
                          <Eye size={13} />
                          <span>Detail</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {!isLoading && !error && filteredEmployees.length > 0 && (
          <div className="border-t border-slate-100">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={(page) => setCurrentPage(page)}
            />
          </div>
        )}
      </div>

      {/* 5. Modal Detail Arsip Pegawai Resign */}
      <Modal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        title="Detail Arsip Alumni Pegawai"
        size="2xl"
      >
        {activeEmployee && (
          <div className="space-y-5 p-1">
            {/* Header Profile Card */}
            <div className="bg-slate-50/90 border border-slate-200/90 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <div className="w-13 h-13 rounded-2xl bg-[#05445e] text-white flex items-center justify-center font-black text-lg shadow-sm">
                  {activeEmployee.nama_lengkap.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-black text-slate-900 leading-snug">
                      {activeEmployee.nama_lengkap}
                    </h3>
                    <span className="badge badge-sm badge-error text-white font-bold text-[10px]">
                      Non-Aktif (Resign)
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 font-mono tabular-nums mt-1">
                    <span>NIP: {activeEmployee.nip}</span>
                    {activeEmployee.nik && (
                      <>
                        <span className="text-slate-300">•</span>
                        <span>NIK: {activeEmployee.nik}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              <div className="text-left sm:text-right shrink-0">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">
                  Status Terakhir
                </span>
                <span className="badge badge-outline border-slate-300 font-semibold text-xs mt-0.5">
                  {activeEmployee.status_kepegawaian || "Karyawan"}
                </span>
              </div>
            </div>

            {/* Grid Informasi Kepegawaian */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {/* Unit & Jabatan */}
              <div className="p-3.5 bg-white border border-slate-200 rounded-xl space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <Building2 size={12} className="text-[#0173b6]" />
                  Departemen &amp; Jabatan
                </span>
                <p className="text-xs font-bold text-slate-800">
                  {activeEmployee.nama_departemen || "-"}
                </p>
                <p className="text-[11px] text-slate-500">
                  Profesi: {activeEmployee.profesi || activeEmployee.nama_level || "-"}
                </p>
              </div>

              {/* Masa Pengabdian (Tenure) */}
              <div className="p-3.5 bg-white border border-slate-200 rounded-xl space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <Clock size={12} className="text-emerald-600" />
                  Masa Pengabdian (Tenure)
                </span>
                <p className="text-xs font-bold text-emerald-700 font-mono tabular-nums">
                  {calculateTenure(activeEmployee.tanggal_masuk, activeEmployee.tanggal_keluar)}
                </p>
                <p className="text-[11px] text-slate-500 font-mono tabular-nums">
                  {formatDate(activeEmployee.tanggal_masuk)} s/d {formatDate(activeEmployee.tanggal_keluar)}
                </p>
              </div>

              {/* Tanggal Keluar Resmi */}
              <div className="p-3.5 bg-rose-50/50 border border-rose-200/80 rounded-xl space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-rose-600 flex items-center gap-1.5">
                  <Calendar size={12} />
                  Tanggal Keluar Resmi
                </span>
                <p className="text-xs font-bold text-rose-800 font-mono tabular-nums">
                  {formatDate(activeEmployee.tanggal_keluar)}
                </p>
                <p className="text-[11px] text-rose-600/80">
                  Resmi dinonaktifkan dari sistem SDM RSU Avisena
                </p>
              </div>

              {/* Atasan Langsung Terakhir */}
              <div className="p-3.5 bg-white border border-slate-200 rounded-xl space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <Briefcase size={12} className="text-amber-600" />
                  Atasan Terakhir
                </span>
                <p className="text-xs font-bold text-slate-800">
                  {activeEmployee.nama_atasan || "-"}
                </p>
                <p className="text-[11px] text-slate-500">Pimpinan penanggung jawab unit</p>
              </div>
            </div>

            {/* Kontak Terakhir */}
            <div className="p-3.5 bg-slate-50/80 border border-slate-200 rounded-xl space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Phone size={12} className="text-slate-500" />
                Kontak Terakhir Alumni
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                <div className="flex items-center gap-2 text-slate-700 font-mono tabular-nums">
                  <Phone size={12} className="text-slate-400" />
                  <span>{activeEmployee.handphone || "Tidak ada nomor handphone"}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-700 truncate">
                  <Mail size={12} className="text-slate-400" />
                  <span className="truncate">{activeEmployee.email || "Tidak ada email"}</span>
                </div>
              </div>
              {activeEmployee.alamat && (
                <div className="flex items-start gap-2 text-xs text-slate-600 pt-1 border-t border-slate-200/60">
                  <MapPin size={12} className="text-slate-400 shrink-0 mt-0.5" />
                  <span>{activeEmployee.alamat}</span>
                </div>
              )}
            </div>

            {/* Alasan Resign Lengkap */}
            <div className="p-4 bg-amber-50/60 border border-amber-200/80 rounded-2xl space-y-1.5">
              <span className="text-[10px] font-black uppercase tracking-wider text-amber-800 flex items-center gap-1.5">
                <FileText size={13} />
                Alasan Pengunduran Diri (Resign)
              </span>
              <div className="bg-white p-3 rounded-xl border border-amber-200/60 text-xs font-medium text-slate-800 leading-relaxed whitespace-pre-line">
                {activeEmployee.alasan_resign || "Tidak ada alasan spesifik yang tercatat pada sistem."}
              </div>
            </div>

            {/* Footer Modal */}
            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setIsDetailModalOpen(false)}
                className="btn btn-sm bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl px-5"
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
