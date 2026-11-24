/**
 * Path: src/app/(admin)/admin/lowongan/page.tsx
 * Deskripsi: Halaman Manajemen Lowongan Pekerjaan RS Avisena (List View).
 * Standar: UI/UX Pro Max, DaisyUI, GSAP Motion, Alice Design System & Impeccable Craft.
 */

"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import Link from "next/link";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import {
  Briefcase,
  PlusCircle,
  Edit,
  Trash2,
  Loader2,
  AlertTriangle,
  Eye,
  Users,
  Calendar,
  Search,
  X,
  RotateCcw,
  FileText,
  Building2,
  CheckCircle2,
  Clock,
  Archive,
  Layers,
  Sparkles,
  ExternalLink,
} from "lucide-react";
import SearchableSelect from "@/app/components/admin/SearchableSelect";
import Pagination from "@/app/components/admin/Pagination";
import { showSuccessToast, showErrorToast } from "@/app/components/admin/Alert";
import { getAuthHeaders } from "@/app/lib/adminFetch";
import Swal from "sweetalert2";

if (typeof window !== "undefined") {
  gsap.registerPlugin(useGSAP);
}

// --- INTERFACES & TYPES ---

type FormOption = { value: string | number; label: string };

interface JobOpening {
  id: string; // UUID
  title: string;
  category: "Medis" | "Non-Medis";
  status: "Draft" | "Published" | "Closed" | "Archived";
  posted_date: string | null;
  closing_date?: string | null;
  applicant_count: number;
  position_name?: string | null;
  requester_name?: string | null;
  requester_jabatan?: string | null;
  requester_department?: string | null;
  unit_name?: string | null;
  essay_bundle_name?: string | null;
  essay_duration_minutes?: number | null;
}

const STATUS_FILTER_OPTIONS: FormOption[] = [
  { value: "ALL", label: "Semua Status" },
  { value: "Published", label: "Tayang (Published)" },
  { value: "Draft", label: "Draft" },
  { value: "Closed", label: "Ditutup (Closed)" },
  { value: "Archived", label: "Arsip (Archived)" },
];

const CATEGORY_FILTER_OPTIONS: FormOption[] = [
  { value: "ALL", label: "Semua Kategori" },
  { value: "Medis", label: "Tenaga Medis" },
  { value: "Non-Medis", label: "Tenaga Non-Medis" },
];

// Helper inisial untuk avatar
const getInitials = (name?: string): string => {
  if (!name) return "LW";
  const parts = name.trim().split(" ").filter(Boolean);
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

// Helper format tanggal Indonesia
const formatDateIndonesia = (dateStr?: string | null): string => {
  if (!dateStr) return "-";
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return "-";
  return d.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

// --- KOMPONEN STANDAR MODAL ---
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  size?: "sm" | "md" | "lg" | "xl";
}

const StandardModal = ({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  size = "md",
}: ModalProps) => {
  if (!isOpen) return null;

  const sizeClasses: Record<string, string> = {
    sm: "max-w-sm",
    md: "max-w-lg",
    lg: "max-w-2xl",
    xl: "max-w-3xl",
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className={`bg-white rounded-2xl shadow-2xl w-full ${sizeClasses[size]} border border-slate-200 overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]`}
      >
        {/* Sticky Header Navy */}
        <div className="px-6 py-4 bg-primary-dark text-white flex justify-between items-center shrink-0">
          <div>
            <h2 className="text-base font-bold tracking-tight text-white leading-snug">
              {title}
            </h2>
            {subtitle && (
              <p className="text-xs text-blue-100/80 font-medium mt-0.5">
                {subtitle}
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto flex-1">{children}</div>
      </div>
    </div>
  );
};

export default function JobManagementPage() {
  const containerRef = useRef<HTMLDivElement>(null);

  // Data states
  const [jobs, setJobs] = useState<JobOpening[]>([]);
  const [canManageLowongan, setCanManageLowongan] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<FormOption | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<FormOption | null>(null);
  const [departmentFilter, setDepartmentFilter] = useState<FormOption | null>(null);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Modal edit states
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedJob, setSelectedJob] = useState<JobOpening | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [editForm, setEditForm] = useState({
    title: "",
    status: "Draft" as JobOpening["status"],
    closing_date: "",
  });

  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "/api";

  // --- FETCH DATA ---
  const fetchData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch(`${baseUrl}/job-openings?scope=admin`, {
        headers: getAuthHeaders(),
        cache: "no-store",
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || data.message || "Gagal memuat data lowongan.");
      }
      if (Array.isArray(data)) {
        setJobs(data);
        setCanManageLowongan(false);
      } else {
        setJobs(data.jobs || []);
        setCanManageLowongan(Boolean(data.can_manage_lowongan));
      }
    } catch (err: unknown) {
      console.error("Fetch Error:", err);
      const message =
        err instanceof Error ? err.message : "Gagal memuat data lowongan.";
      setError(message);
      setJobs([]);
      showErrorToast(message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Departemen unik untuk opsi filter
  const departmentOptions = useMemo<FormOption[]>(() => {
    const setDept = new Set<string>();
    jobs.forEach((j) => {
      const dept = j.requester_department || j.unit_name;
      if (dept) setDept.add(dept);
    });
    const opts: FormOption[] = [{ value: "ALL", label: "Semua Departemen" }];
    Array.from(setDept)
      .sort()
      .forEach((d) => opts.push({ value: d, label: d }));
    return opts;
  }, [jobs]);

  // --- STATS KPI ---
  const stats = useMemo(() => {
    const total = jobs.length;
    const published = jobs.filter((j) => j.status === "Published").length;
    const draft = jobs.filter((j) => j.status === "Draft").length;
    const closed = jobs.filter((j) => j.status === "Closed" || j.status === "Archived").length;
    const totalApplicants = jobs.reduce((acc, curr) => acc + (Number(curr.applicant_count) || 0), 0);
    return { total, published, draft, closed, totalApplicants };
  }, [jobs]);

  // --- FILTER & SEARCH ---
  const filteredJobs = useMemo(() => {
    return jobs.filter((job) => {
      // Search term
      if (searchTerm) {
        const query = searchTerm.toLowerCase();
        const titleMatch = job.title?.toLowerCase().includes(query);
        const posMatch = job.position_name?.toLowerCase().includes(query);
        const reqMatch = job.requester_name?.toLowerCase().includes(query);
        const deptMatch = (job.requester_department || job.unit_name)?.toLowerCase().includes(query);
        if (!titleMatch && !posMatch && !reqMatch && !deptMatch) {
          return false;
        }
      }

      // Status filter
      if (statusFilter && statusFilter.value !== "ALL") {
        if (job.status !== statusFilter.value) return false;
      }

      // Category filter
      if (categoryFilter && categoryFilter.value !== "ALL") {
        if (job.category !== categoryFilter.value) return false;
      }

      // Department filter
      if (departmentFilter && departmentFilter.value !== "ALL") {
        const dept = job.requester_department || job.unit_name;
        if (dept !== departmentFilter.value) return false;
      }

      return true;
    });
  }, [jobs, searchTerm, statusFilter, categoryFilter, departmentFilter]);

  // Reset pagination saat filter berubah
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter, categoryFilter, departmentFilter]);

  const hasActiveFilters = Boolean(
    searchTerm ||
    (statusFilter && statusFilter.value !== "ALL") ||
    (categoryFilter && categoryFilter.value !== "ALL") ||
    (departmentFilter && departmentFilter.value !== "ALL")
  );

  const handleResetFilters = () => {
    setSearchTerm("");
    setStatusFilter(null);
    setCategoryFilter(null);
    setDepartmentFilter(null);
  };

  // Pagination slice
  const totalPages = Math.max(1, Math.ceil(filteredJobs.length / itemsPerPage));
  const currentJobs = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredJobs.slice(start, start + itemsPerPage);
  }, [filteredJobs, currentPage, itemsPerPage]);

  // --- GSAP MOTION ---
  useGSAP(
    () => {
      const tl = gsap.timeline({ defaults: { ease: "power2.out" } });

      tl.from(".lowongan-header", {
        y: -10,
        opacity: 0,
        duration: 0.35,
        clearProps: "all",
      })
        .from(
          ".lowongan-kpi-card",
          {
            y: 14,
            opacity: 0,
            duration: 0.3,
            stagger: 0.05,
            clearProps: "all",
          },
          "-=0.15"
        )
        .from(
          ".lowongan-filter-box",
          {
            y: 10,
            opacity: 0,
            duration: 0.25,
            clearProps: "all",
          },
          "-=0.1"
        )
        .from(
          ".lowongan-table-box",
          {
            y: 12,
            opacity: 0,
            duration: 0.3,
            clearProps: "all",
          },
          "-=0.1"
        );
    },
    { scope: containerRef }
  );

  // --- HANDLER MODAL EDIT ---
  const handleOpenEditModal = (job: JobOpening) => {
    setSelectedJob(job);
    setEditForm({
      title: job.title,
      status: job.status,
      closing_date: job.closing_date ? new Date(job.closing_date).toISOString().split("T")[0] : "",
    });
    setIsEditModalOpen(true);
  };

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
    setSelectedJob(null);
    setEditForm({ title: "", status: "Draft", closing_date: "" });
  };

  const handleUpdateJob = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedJob) return;

    if (!editForm.title.trim()) {
      showErrorToast("Judul posting lowongan wajib diisi");
      return;
    }

    setIsUpdating(true);
    try {
      const body = {
        title: editForm.title.trim(),
        status: editForm.status,
        closing_date: editForm.closing_date || null,
      };

      const res = await fetch(`${baseUrl}/job-openings/${selectedJob.id}`, {
        method: "PATCH",
        headers: getAuthHeaders({ "Content-Type": "application/json" }),
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || "Gagal memperbarui konfigurasi lowongan.");
      }

      showSuccessToast("Konfigurasi lowongan berhasil diperbarui.");
      handleCloseEditModal();
      fetchData();
    } catch (err: unknown) {
      console.error(err);
      const msg = err instanceof Error ? err.message : "Gagal memperbarui lowongan.";
      showErrorToast(msg);
    } finally {
      setIsUpdating(false);
    }
  };

  // --- HANDLER HAPUS LOWONGAN (SWEETALERT2) ---
  const handlePromptDelete = (job: JobOpening) => {
    Swal.fire({
      title: "Hapus Lowongan Pekerjaan?",
      html: `Apakah Anda yakin ingin menghapus lowongan untuk posisi <br/><strong class="text-slate-800">${job.title}</strong>?<br/><span class="text-xs text-rose-500 font-semibold mt-2 block">* Tindakan ini permanen. Pastikan tidak ada data pelamar aktif yang terikat.</span>`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#e11d48",
      cancelButtonColor: "#64748b",
      confirmButtonText: "Ya, Hapus Lowongan",
      cancelButtonText: "Batal",
      reverseButtons: true,
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const res = await fetch(`${baseUrl}/job-openings/${job.id}`, {
            method: "DELETE",
            headers: getAuthHeaders(),
          });
          if (!res.ok) {
            const data = await res.json().catch(() => ({}));
            throw new Error(data.message || "Gagal menghapus lowongan.");
          }
          showSuccessToast("Lowongan pekerjaan berhasil dihapus.");
          fetchData();
        } catch (err: unknown) {
          console.error(err);
          const msg = err instanceof Error ? err.message : "Gagal menghapus lowongan.";
          showErrorToast(msg);
        }
      }
    });
  };

  return (
    <div ref={containerRef} className="p-8 font-sans min-h-screen space-y-6 max-w-full mx-auto">
      {/* Layer 1: Header Halaman */}
      <div className="lowongan-header flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-2 border-b border-slate-200/80">
        <div>
          <div className="flex items-center gap-2 mb-1 text-primary font-bold uppercase tracking-wider text-xs">
            <Briefcase size={15} />
            <span>Portal Rekrutmen &amp; Bursa Lowongan RS Avisena</span>
          </div>
          <h1 className="text-3xl font-bold text-primary-dark tracking-tight">
            Manajemen Lowongan Kerja
          </h1>
          <p className="text-slate-500 font-medium text-sm mt-1 max-w-2xl">
            {canManageLowongan
              ? "Kelola publikasi posisi, status penerimaan berkas, bundel evaluasi essay, dan monitoring pelamar secara real-time."
              : "Pantau lowongan dari unit kerja Anda beserta berkas lamaran, hasil psikotes, dan evaluasi essay kandidat."}
          </p>
        </div>

        {canManageLowongan && (
          <div className="flex items-center gap-3">
            <Link
              href="/admin/request-pegawai"
              className="inline-flex items-center gap-2 bg-primary hover:bg-primary-dark text-white font-bold py-2.5 px-5 rounded-xl shadow-xs transition-all active:scale-[0.98] text-xs uppercase tracking-wider min-h-[44px] cursor-pointer"
            >
              <PlusCircle size={16} />
              <span>Buka Dari Request SDM</span>
            </Link>
          </div>
        )}
      </div>

      {/* Notifikasi Error jika gagal memuat */}
      {error && (
        <div className="flex items-center gap-3 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold">
          <AlertTriangle size={18} className="shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Layer 2: KPI / Summary Ribbon (Horizontal 5-Grid) */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
        {/* Total Lowongan */}
        <div className="lowongan-kpi-card bg-white border border-slate-200/90 rounded-xl p-3.5 shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Total Lowongan
            </p>
            <p className="text-xl font-black text-slate-800 font-mono tabular-nums mt-0.5">
              {stats.total}{" "}
              <span className="text-xs font-semibold text-slate-400 font-sans">Posisi</span>
            </p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#0173b6] flex items-center justify-center font-bold">
            <Briefcase size={20} />
          </div>
        </div>

        {/* Tayang / Published */}
        <div className="lowongan-kpi-card bg-white border border-slate-200/90 rounded-xl p-3.5 shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-600">
              Aktif Tayang
            </p>
            <p className="text-xl font-black text-emerald-600 font-mono tabular-nums mt-0.5">
              {stats.published}{" "}
              <span className="text-xs font-semibold text-slate-400 font-sans">Dibuka</span>
            </p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            <CheckCircle2 size={20} />
          </div>
        </div>

        {/* Draft */}
        <div className="lowongan-kpi-card bg-white border border-slate-200/90 rounded-xl p-3.5 shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-amber-500">
              Draft Persiapan
            </p>
            <p className="text-xl font-black text-amber-600 font-mono tabular-nums mt-0.5">
              {stats.draft}{" "}
              <span className="text-xs font-semibold text-slate-400 font-sans">Draft</span>
            </p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
            <FileText size={20} />
          </div>
        </div>

        {/* Ditutup / Selesai */}
        <div className="lowongan-kpi-card bg-white border border-slate-200/90 rounded-xl p-3.5 shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Ditutup / Arsip
            </p>
            <p className="text-xl font-black text-slate-600 font-mono tabular-nums mt-0.5">
              {stats.closed}{" "}
              <span className="text-xs font-semibold text-slate-400 font-sans">Selesai</span>
            </p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center font-bold">
            <Clock size={20} />
          </div>
        </div>

        {/* Total Pelamar Masuk */}
        <div className="lowongan-kpi-card bg-white border border-slate-200/90 rounded-xl p-3.5 shadow-2xs flex items-center justify-between col-span-2 md:col-span-1">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-indigo-600">
              Total Berkas
            </p>
            <p className="text-xl font-black text-indigo-700 font-mono tabular-nums mt-0.5">
              {stats.totalApplicants}{" "}
              <span className="text-xs font-semibold text-slate-400 font-sans">Kandidat</span>
            </p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
            <Users size={20} />
          </div>
        </div>
      </div>

      {/* Layer 3: Kontainer Filter & Pencarian */}
      <div className="lowongan-filter-box bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
            Filter &amp; Pencarian
          </span>
          {hasActiveFilters && (
            <button
              onClick={handleResetFilters}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-primary hover:text-primary-dark transition-colors cursor-pointer"
            >
              <RotateCcw size={13} />
              <span>Reset Filter</span>
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* Input Pencarian */}
          <div className="relative lg:col-span-2">
            <input
              type="text"
              placeholder="Cari judul lowongan, jabatan, atau pemohon..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full h-[38px] pl-9 pr-8 bg-slate-50/80 border border-slate-200/90 rounded-xl text-xs font-semibold text-slate-800 focus:bg-white focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
            />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* Filter Status */}
          <div>
            <SearchableSelect
              options={STATUS_FILTER_OPTIONS}
              value={statusFilter}
              onChange={(val) => setStatusFilter(val as FormOption | null)}
              placeholder="Semua Status"
            />
          </div>

          {/* Filter Kategori */}
          <div>
            <SearchableSelect
              options={CATEGORY_FILTER_OPTIONS}
              value={categoryFilter}
              onChange={(val) => setCategoryFilter(val as FormOption | null)}
              placeholder="Semua Kategori"
            />
          </div>

          {/* Filter Departemen */}
          <div>
            <SearchableSelect
              options={departmentOptions}
              value={departmentFilter}
              onChange={(val) => setDepartmentFilter(val as FormOption | null)}
              placeholder="Semua Departemen"
            />
          </div>
        </div>
      </div>

      {/* Layer 4: Baris Judul Tabel */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-primary-dark">
          Daftar Lowongan Pekerjaan
        </h2>
        <span className="text-xs font-semibold text-slate-500">
          Total <strong className="font-mono tabular-nums text-slate-800">{filteredJobs.length}</strong> lowongan
        </span>
      </div>

      {/* Layer 5: Tabel Data Eksekutif */}
      <div className="lowongan-table-box overflow-hidden rounded-2xl border border-slate-200/80 shadow-xs bg-white">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs whitespace-nowrap">
            <thead className="text-xs text-white uppercase bg-primary-dark font-semibold">
              <tr>
                <th scope="col" className="px-6 py-3.5 text-white">Posisi Lowongan</th>
                <th scope="col" className="px-6 py-3.5 text-white">Bidang</th>
                <th scope="col" className="px-6 py-3.5 text-white">Status Publikasi</th>
                <th scope="col" className="px-6 py-3.5 text-center text-white">Pelamar</th>
                <th scope="col" className="px-6 py-3.5 text-white">Jadwal &amp; Batas Akhir</th>
                <th scope="col" className="px-6 py-3.5 text-center text-white">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-16 text-center">
                    <Loader2 className="animate-spin text-primary mx-auto mb-2" size={28} />
                    <p className="text-xs font-semibold text-slate-500">Memuat data lowongan pekerjaan...</p>
                  </td>
                </tr>
              ) : currentJobs.length > 0 ? (
                currentJobs.map((job) => {
                  const isClosedOrExpired =
                    job.status === "Closed" ||
                    job.status === "Archived" ||
                    (job.closing_date ? new Date(job.closing_date) < new Date() : false);

                  return (
                    <tr key={job.id} className="hover:bg-slate-50/80 transition-colors">
                      {/* Posisi & Judul */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-blue-50 text-primary font-bold text-xs border border-blue-200/60 flex items-center justify-center shrink-0 shadow-xs">
                            {getInitials(job.title)}
                          </div>
                          <div className="min-w-0 max-w-sm">
                            <Link
                              href={`/admin/lowongan/${job.id}`}
                              className="font-bold text-slate-900 text-sm hover:text-primary transition-colors block truncate"
                              title={job.title}
                            >
                              {job.title}
                            </Link>
                            <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-500 font-medium mt-0.5">
                              {(job.requester_department || job.unit_name) && (
                                <span className="inline-flex items-center gap-1 font-semibold text-slate-600">
                                  <Building2 size={12} className="text-slate-400" />
                                  {job.requester_department || job.unit_name}
                                </span>
                              )}
                              {job.essay_bundle_name && (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-blue-50 text-primary border border-blue-200/60 font-semibold text-[10px]">
                                  <FileText size={10} />
                                  Essay: {job.essay_bundle_name}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Kategori Bidang */}
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-1 text-[11px] font-bold rounded-lg border uppercase tracking-wider ${
                            job.category === "Medis"
                              ? "bg-blue-50 text-blue-800 border-blue-200"
                              : "bg-emerald-50 text-emerald-800 border-emerald-200"
                          }`}
                        >
                          {job.category || "Umum"}
                        </span>
                      </td>

                      {/* Status Publikasi */}
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-1 text-xs font-semibold rounded-full ${
                            job.status === "Published"
                              ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                              : job.status === "Draft"
                              ? "bg-amber-100 text-amber-800 border border-amber-200"
                              : job.status === "Closed"
                              ? "bg-slate-100 text-slate-600 border border-slate-200"
                              : "bg-slate-100 text-slate-400 border border-slate-200"
                          }`}
                        >
                          {job.status}
                        </span>
                      </td>

                      {/* Pelamar Masuk */}
                      <td className="px-6 py-4 text-center">
                        <Link
                          href={`/admin/lowongan/${job.id}`}
                          className="inline-flex flex-col items-center group cursor-pointer"
                          title="Klik untuk membuka daftar pelamar"
                        >
                          <div className="flex items-center gap-1.5 text-primary-dark font-black text-base font-mono tabular-nums group-hover:text-primary transition-colors">
                            <Users size={15} className="text-blue-300 group-hover:text-primary" />
                            {job.applicant_count || 0}
                          </div>
                          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 group-hover:text-primary mt-0.5">
                            Kandidat
                          </span>
                        </Link>
                      </td>

                      {/* Jadwal Posting & Deadline */}
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          <p className="text-xs text-slate-700 font-medium">
                            Tayang:{" "}
                            <strong className="font-mono tabular-nums text-slate-800 font-semibold">
                              {job.posted_date ? formatDateIndonesia(job.posted_date) : "Draft"}
                            </strong>
                          </p>
                          <p
                            className={`text-[11px] font-mono tabular-nums font-semibold flex items-center gap-1 ${
                              isClosedOrExpired && job.closing_date
                                ? "text-rose-600"
                                : "text-slate-500"
                            }`}
                          >
                            <Calendar size={12} className="text-slate-400" />
                            Batas: {job.closing_date ? formatDateIndonesia(job.closing_date) : "Tanpa Batas"}
                          </p>
                        </div>
                      </td>

                      {/* Aksi */}
                      <td className="px-6 py-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          {/* Tombol Detail & Pelamar */}
                          <Link
                            href={`/admin/lowongan/${job.id}`}
                            className="p-1.5 rounded-lg text-slate-600 hover:text-primary hover:bg-slate-100 transition-colors inline-flex items-center justify-center"
                            title="Detail & Antrean Pelamar"
                          >
                            <Eye size={16} />
                          </Link>

                          {/* Tombol Khusus HC */}
                          {canManageLowongan && (
                            <>
                              <button
                                onClick={() => handleOpenEditModal(job)}
                                className="p-1.5 rounded-lg text-blue-600 hover:text-blue-700 hover:bg-blue-50 transition-colors cursor-pointer"
                                title="Edit Konfigurasi Lowongan"
                              >
                                <Edit size={16} />
                              </button>
                              <button
                                onClick={() => handlePromptDelete(job)}
                                className="p-1.5 rounded-lg text-rose-600 hover:text-rose-700 hover:bg-rose-50 transition-colors cursor-pointer"
                                title="Hapus Lowongan"
                              >
                                <Trash2 size={16} />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-14 text-center text-slate-400">
                    <Briefcase size={32} className="mx-auto mb-2 opacity-50" />
                    <p className="text-sm font-semibold">Tidak ada data lowongan pekerjaan</p>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {hasActiveFilters
                        ? "Coba sesuaikan kata kunci pencarian atau reset filter."
                        : "Lowongan yang disetujui dari pengajuan kebutuhan pegawai akan otomatis tampil di sini."}
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Terintegrasi */}
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      </div>

      {/* ======================================================== */}
      {/* MODAL: EDIT KONFIGURASI LOWONGAN */}
      {/* ======================================================== */}
      <StandardModal
        isOpen={isEditModalOpen}
        onClose={() => !isUpdating && handleCloseEditModal()}
        title="Edit Konfigurasi Lowongan Kerja"
        subtitle={`ID: ${selectedJob?.id || "-"}`}
        size="md"
      >
        <form onSubmit={handleUpdateJob} className="space-y-5">
          {/* Posisi Terkait */}
          <div className="bg-blue-50/70 p-3.5 rounded-xl border border-blue-200/60 text-xs space-y-1">
            <p className="text-slate-500 font-semibold">Posisi Jabatan Master:</p>
            <p className="text-primary-dark font-bold text-sm">
              {selectedJob?.position_name || selectedJob?.title}
            </p>
            <p className="text-slate-500">
              Kategori: <strong className="text-slate-700">{selectedJob?.category}</strong> &bull;
              Departemen:{" "}
              <strong className="text-slate-700">
                {selectedJob?.requester_department || selectedJob?.unit_name || "-"}
              </strong>
            </p>
          </div>

          {/* Input Judul Posting Lowongan */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Judul Posting Lowongan <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <input
                type="text"
                value={editForm.title}
                onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                required
                placeholder="Misal: Perawat Pelaksana Rawat Inap"
                className="w-full h-[40px] pl-9 pr-3 bg-slate-50/80 border border-slate-200/90 rounded-xl text-xs font-semibold text-slate-800 focus:bg-white focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
              />
              <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
            </div>
          </div>

          {/* Status & Batas Akhir Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Status Publikasi */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Status Lowongan
              </label>
              <select
                value={editForm.status}
                onChange={(e) =>
                  setEditForm({ ...editForm, status: e.target.value as JobOpening["status"] })
                }
                className="w-full h-[40px] px-3 bg-slate-50/80 border border-slate-200/90 rounded-xl text-xs font-semibold text-slate-800 focus:bg-white focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all cursor-pointer"
              >
                <option value="Published">Published (Tayang)</option>
                <option value="Draft">Draft (Persiapan)</option>
                <option value="Closed">Closed (Ditutup)</option>
                <option value="Archived">Archived (Diarsipkan)</option>
              </select>
            </div>

            {/* Batas Akhir Lamaran */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Batas Akhir Berkas
              </label>
              <div className="relative">
                <input
                  type="date"
                  value={editForm.closing_date}
                  onChange={(e) => setEditForm({ ...editForm, closing_date: e.target.value })}
                  className="w-full h-[40px] pl-9 pr-3 bg-slate-50/80 border border-slate-200/90 rounded-xl text-xs font-semibold font-mono tabular-nums text-slate-800 focus:bg-white focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                />
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
              </div>
            </div>
          </div>

          <p className="text-[11px] text-slate-400">
            * Kosongkan batas akhir jika lowongan dibuka permanen hingga kuota posisi terpenuhi.
          </p>

          {/* Footer Submit */}
          <div className="pt-4 border-t border-slate-200 flex justify-end gap-2.5">
            <button
              type="button"
              disabled={isUpdating}
              onClick={handleCloseEditModal}
              className="px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isUpdating}
              className="inline-flex items-center gap-2 bg-primary hover:bg-primary-dark text-white font-bold py-2.5 px-6 rounded-xl shadow-xs transition-all active:scale-[0.98] text-xs uppercase tracking-wider cursor-pointer"
            >
              {isUpdating ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  <span>Menyimpan...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 size={16} />
                  <span>Simpan Perubahan</span>
                </>
              )}
            </button>
          </div>
        </form>
      </StandardModal>
    </div>
  );
}
