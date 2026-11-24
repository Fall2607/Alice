/**
 * Path: src/app/(admin)/admin/lowongan/[slug]/page.tsx
 * Deskripsi: Detail Lowongan Kerja, Antrean Berkas Pelamar, dan Hasil Psikometri/Essay RS Avisena.
 * Standar: UI/UX Pro Max, DaisyUI, GSAP Motion, Alice Design System & Impeccable Craft.
 */

"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import {
  ChevronLeft,
  Briefcase,
  Clock,
  Eye,
  Loader2,
  AlertTriangle,
  User,
  Phone,
  Mail,
  Calendar,
  FileText,
  CheckCircle2,
  X,
  XCircle,
  GraduationCap,
  Heart,
  Users,
  Download,
  Paperclip,
  ClipboardList,
  Target,
  Info,
  FileSpreadsheet,
  Zap,
  Sparkles,
  Building2,
  Brain,
  Search,
  RotateCcw,
  Send,
  Check,
  CheckSquare,
  Square,
  BadgeCheck,
} from "lucide-react";

import AssessmentSelector from "@/app/components/admin/AssessmentSelector";
import EssayBundleSelector from "@/app/components/admin/EssayBundleSelector";
import EssayReviewPanel, { type EssayResultRecord } from "@/app/components/admin/EssayReviewPanel";
import PAPIResultView from "@/app/components/admin/PAPIResultView";
import CFITResultView from "@/app/components/admin/CFITResultView";
import SearchableSelect from "@/app/components/admin/SearchableSelect";
import Pagination from "@/app/components/admin/Pagination";
import { showSuccessToast, showErrorToast } from "@/app/components/admin/Alert";
import { getAuthHeaders } from "@/app/lib/adminFetch";
import { getDISCProfileDetail } from "@/app/utils/discUtils";
import { getMBTIProfileDetail } from "@/app/utils/mbtiUtils";
import Swal from "sweetalert2";

if (typeof window !== "undefined") {
  gsap.registerPlugin(useGSAP);
}

// --- INTERFACES & TYPES ---

type FormOption = { value: string | number; label: string };

interface JobDetail {
  id: string;
  job_id: string;
  title: string;
  status: string;
  posted_date: string | null;
  closing_date: string | null;
  nama_job: string;
  category: string;
  deskripsi_job: string[];
  kualifikasi_job: string[];
  requester_name?: string | null;
  requester_jabatan?: string | null;
  unit_name?: string | null;
  can_manage_lowongan?: boolean;
}

interface ApplicantSummary {
  id: string;
  nama: string;
  email: string;
  no_whatsapp: string;
  created_at: string;
  status: string;
  job_opening_id: string;
  suitability_match?: string | number;
  application_status_id?: string;
  assessment_session_status?: string | null;
  essay_submitted?: boolean;
  essay_review_decision?: string | null;
  essay_reviewed_by_name?: string | null;
  essay_required?: boolean;
}

interface ScoreDetailItem {
  question: string;
  answer_value: string;
  fuzzy_score: number;
}

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  size?: "sm" | "md" | "lg" | "xl" | "2xl" | "5xl";
}

// Standard Modal Component
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
    xl: "max-w-4xl",
    "2xl": "max-w-5xl",
    "5xl": "max-w-6xl",
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className={`bg-white rounded-2xl shadow-2xl w-full ${sizeClasses[size] || sizeClasses.md} border border-slate-200 overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[92vh]`}
      >
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
        <div className="p-6 overflow-y-auto flex-1">{children}</div>
      </div>
    </div>
  );
};

// Helper format inisial
const getInitials = (name?: string): string => {
  if (!name) return "PL";
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

const PIPELINE_FILTER_OPTIONS: FormOption[] = [
  { value: "ALL", label: "Semua Status Pipeline" },
  { value: "PENDING", label: "Menunggu Seleksi Berkas" },
  { value: "ASSESSMENT", label: "Tahap Assessment / Ujian" },
  { value: "COMPLETED", label: "Tes Selesai" },
  { value: "ACCEPTED", label: "Diterima / Lolos" },
  { value: "REJECTED", label: "Ditolak / Gugur" },
];

const ESSAY_FILTER_OPTIONS: FormOption[] = [
  { value: "ALL", label: "Semua Status Essay" },
  { value: "PERLU_REVIEW", label: "Perlu Review" },
  { value: "LOLOS", label: "Essay: Lolos" },
  { value: "TIDAK_LOLOS", label: "Essay: Tidak Lolos" },
  { value: "MENUNGGU", label: "Menunggu Jawaban" },
];

export default function DetailLowonganPage() {
  const params = useParams();
  const slug = params?.slug as string;
  const containerRef = useRef<HTMLDivElement>(null);

  // Data states
  const [job, setJob] = useState<JobDetail | null>(null);
  const [canManageLowongan, setCanManageLowongan] = useState(false);
  const [applicants, setApplicants] = useState<ApplicantSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Tab mode
  const [activeTab, setActiveTab] = useState<"detail" | "assessment">("detail");

  // Selection states
  const [selectedCandidates, setSelectedCandidates] = useState<string[]>([]);
  const [invitingId, setInvitingId] = useState<string | null>(null);
  const [isBulkInviting, setIsBulkInviting] = useState(false);

  // Filter & Search states
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<FormOption | null>(null);
  const [essayFilter, setEssayFilter] = useState<FormOption | null>(null);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Detail Modal states
  const [selectedCandidateId, setSelectedCandidateId] = useState<string | null>(null);
  const [selectedAssessmentId, setSelectedAssessmentId] = useState<string | null>(null);
  const [candidateDetail, setCandidateDetail] = useState<any>(null);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);

  // Score details modal
  const [scoreModal, setScoreModal] = useState<{
    isOpen: boolean;
    applicantName: string;
    details: ScoreDetailItem[];
    isLoading: boolean;
  }>({ isOpen: false, applicantName: "", details: [], isLoading: false });

  // Invite modal
  const [inviteModal, setInviteModal] = useState<{
    isOpen: boolean;
    type: "single" | "bulk";
    candidateId?: string;
    scheduledDate: string;
  }>({ isOpen: false, type: "single", scheduledDate: "" });

  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "/api";

  // --- FETCH DETAIL DATA ---
  const fetchData = async () => {
    if (!slug) return;
    setIsLoading(true);
    setError(null);
    try {
      const headers = getAuthHeaders();
      const [jobRes, applicantsRes] = await Promise.all([
        fetch(`${baseUrl}/job-openings/${slug}?scope=admin`, { headers, cache: "no-store" }),
        fetch(`${baseUrl}/apply?scope=admin&job_opening_id=${slug}`, { headers, cache: "no-store" }),
      ]);

      const jobPayload = await jobRes.json();
      if (!jobRes.ok) {
        throw new Error(jobPayload.error || jobPayload.message || "Anda tidak memiliki akses ke lowongan ini.");
      }

      setJob(jobPayload);
      setCanManageLowongan(Boolean(jobPayload.can_manage_lowongan));

      if (applicantsRes.ok) {
        const filtered = await applicantsRes.json();
        setApplicants(Array.isArray(filtered) ? filtered : []);
      }
    } catch (err: unknown) {
      console.error(err);
      const msg = err instanceof Error ? err.message : "Gagal memuat detail lowongan.";
      setError(msg);
      showErrorToast(msg);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [slug]);

  // --- STATS KPI PELAMAR ---
  const stats = useMemo(() => {
    const total = applicants.length;
    const pending = applicants.filter((a) => {
      const s = (a.status || "").toUpperCase();
      return !s || ["SUBMITTED", "APPLIED", "PENDING"].includes(s);
    }).length;
    const assessment = applicants.filter((a) => (a.status || "").toUpperCase() === "ASSESSMENT").length;
    const accepted = applicants.filter((a) => ["ACCEPTED", "COMPLETED"].includes((a.status || "").toUpperCase())).length;
    return { total, pending, assessment, accepted };
  }, [applicants]);

  // --- FILTER & SEARCH APPLICANTS ---
  const filteredApplicants = useMemo(() => {
    return applicants.filter((applicant) => {
      // Search
      if (searchTerm) {
        const query = searchTerm.toLowerCase();
        const namaMatch = applicant.nama?.toLowerCase().includes(query);
        const emailMatch = applicant.email?.toLowerCase().includes(query);
        const waMatch = applicant.no_whatsapp?.includes(query);
        if (!namaMatch && !emailMatch && !waMatch) return false;
      }

      // Status Pipeline Filter
      if (statusFilter && statusFilter.value !== "ALL") {
        const s = (applicant.status || "PENDING").toUpperCase();
        if (statusFilter.value === "PENDING") {
          if (!["SUBMITTED", "APPLIED", "PENDING"].includes(s)) return false;
        } else if (s !== statusFilter.value) {
          return false;
        }
      }

      // Essay Filter
      if (essayFilter && essayFilter.value !== "ALL") {
        if (essayFilter.value === "PERLU_REVIEW" && !applicant.essay_submitted) return false;
        if (essayFilter.value === "LOLOS" && applicant.essay_review_decision !== "LOLOS") return false;
        if (essayFilter.value === "TIDAK_LOLOS" && applicant.essay_review_decision !== "TIDAK_LOLOS") return false;
        if (essayFilter.value === "MENUNGGU" && (!applicant.essay_required || applicant.essay_submitted)) return false;
      }

      return true;
    });
  }, [applicants, searchTerm, statusFilter, essayFilter]);

  // Reset pagination saat filter berubah
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter, essayFilter]);

  const hasActiveFilters = Boolean(
    searchTerm ||
    (statusFilter && statusFilter.value !== "ALL") ||
    (essayFilter && essayFilter.value !== "ALL")
  );

  const handleResetFilters = () => {
    setSearchTerm("");
    setStatusFilter(null);
    setEssayFilter(null);
  };

  // Pagination slice
  const totalPages = Math.max(1, Math.ceil(filteredApplicants.length / itemsPerPage));
  const currentApplicants = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredApplicants.slice(start, start + itemsPerPage);
  }, [filteredApplicants, currentPage, itemsPerPage]);

  // --- GSAP MOTION ---
  useGSAP(
    () => {
      const tl = gsap.timeline({ defaults: { ease: "power2.out" } });

      tl.from(".detail-hero", {
        y: -12,
        opacity: 0,
        duration: 0.35,
        clearProps: "all",
      })
        .from(
          ".detail-kpi-card",
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
          ".detail-desc-card",
          {
            y: 10,
            opacity: 0,
            duration: 0.25,
            clearProps: "all",
          },
          "-=0.1"
        )
        .from(
          ".detail-tab-container",
          {
            y: 10,
            opacity: 0,
            duration: 0.25,
            clearProps: "all",
          },
          "-=0.1"
        );
    },
    { dependencies: [activeTab], scope: containerRef, revertOnUpdate: true }
  );

  // --- SELECTION BULK ---
  const processableCandidates = useMemo(() => {
    return applicants.filter(
      (a) =>
        !a.status ||
        ["SUBMITTED", "APPLIED", "PENDING"].includes(a.status.toUpperCase())
    );
  }, [applicants]);

  const toggleSelectAll = () => {
    if (
      selectedCandidates.length === processableCandidates.length &&
      processableCandidates.length > 0
    ) {
      setSelectedCandidates([]);
    } else {
      setSelectedCandidates(processableCandidates.map((a) => a.id));
    }
  };

  const toggleSelect = (candidateId: string) => {
    if (selectedCandidates.includes(candidateId)) {
      setSelectedCandidates((prev) => prev.filter((id) => id !== candidateId));
    } else {
      setSelectedCandidates((prev) => [...prev, candidateId]);
    }
  };

  // --- PROCESS INVITE TES ---
  const processInvite = async (applicant: ApplicantSummary, scheduledDate: string, quiet = false) => {
    setInvitingId(applicant.id);
    try {
      const response = await fetch(`/api/assessment/invite`, {
        method: "POST",
        headers: getAuthHeaders({ "Content-Type": "application/json" }),
        body: JSON.stringify({
          candidate_id: applicant.id,
          job_opening_id: slug,
          email: applicant.email,
          candidate_name: applicant.nama,
          job_title: job?.title,
          scheduled_date: scheduledDate,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Gagal mengirim undangan tes psikometri.");
      }

      if (!quiet) {
        showSuccessToast(`Undangan tes berhasil dikirim ke ${applicant.nama}!`);
      }

      setApplicants((prev) =>
        prev.map((a) => (a.id === applicant.id ? { ...a, status: "ASSESSMENT" } : a))
      );
      return true;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Terjadi kesalahan";
      if (!quiet) showErrorToast(msg);
      return false;
    } finally {
      setInvitingId(null);
    }
  };

  // --- REJECT CANDIDATE ---
  const handleRejectCandidate = (candidateId: string) => {
    const applicant = applicants.find((a) => a.id === candidateId);
    if (!applicant) return;

    Swal.fire({
      title: "Tolak Berkas Pelamar?",
      html: `Apakah Anda yakin ingin menolak kandidat <strong class="text-slate-800">${applicant.nama}</strong>?<br/><span class="text-xs text-rose-500 font-semibold mt-2 block">* Status akan diubah menjadi REJECTED (Gugur Administrasi).</span>`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#e11d48",
      cancelButtonColor: "#64748b",
      confirmButtonText: "Ya, Tolak Kandidat",
      cancelButtonText: "Batal",
      reverseButtons: true,
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const response = await fetch(`/api/apply/${candidateId}`, {
            method: "PATCH",
            headers: getAuthHeaders({ "Content-Type": "application/json" }),
            body: JSON.stringify({ status: "REJECTED", job_opening_id: slug }),
          });
          const data = await response.json();
          if (!response.ok) {
            throw new Error(data.message || "Gagal mengubah status pelamar.");
          }

          setApplicants((prev) =>
            prev.map((a) => (a.id === candidateId ? { ...a, status: "REJECTED" } : a))
          );
          showSuccessToast(`Kandidat ${applicant.nama} telah ditolak.`);
        } catch (err: unknown) {
          const msg = err instanceof Error ? err.message : "Gagal memproses penolakan.";
          showErrorToast(msg);
        }
      }
    });
  };

  // --- VIEW CANDIDATE PROFILE ---
  const handleViewCandidate = async (candidateId: string) => {
    setSelectedCandidateId(candidateId);
    setIsLoadingDetail(true);
    try {
      const res = await fetch(
        `${baseUrl}/apply/${candidateId}?scope=admin&job_opening_id=${slug}`,
        { headers: getAuthHeaders() }
      );
      if (!res.ok) throw new Error("Gagal memuat profil kandidat.");
      setCandidateDetail(await res.json());
    } catch (err: unknown) {
      console.error(err);
      setCandidateDetail(null);
      showErrorToast("Gagal memuat berkas profil pelamar.");
    } finally {
      setIsLoadingDetail(false);
    }
  };

  // --- VIEW ASSESSMENT RESULTS ---
  const handleViewAssessment = async (candidateId: string) => {
    setSelectedAssessmentId(candidateId);
    setIsLoadingDetail(true);
    try {
      const res = await fetch(
        `${baseUrl}/apply/${candidateId}?scope=admin&job_opening_id=${slug}`,
        { headers: getAuthHeaders() }
      );
      if (!res.ok) throw new Error("Gagal memuat laporan hasil assessment.");
      setCandidateDetail(await res.json());
    } catch (err: unknown) {
      console.error(err);
      setCandidateDetail(null);
      showErrorToast("Gagal memuat laporan hasil psikometri kandidat.");
    } finally {
      setIsLoadingDetail(false);
    }
  };

  // --- VIEW SCORE DETAILS ---
  const handleViewScores = async (applicationStatusId: string, applicantName: string) => {
    setScoreModal({
      isOpen: true,
      applicantName,
      details: [],
      isLoading: true,
    });
    try {
      const res = await fetch(`/api/job-assessments/scores/${applicationStatusId}`);
      if (!res.ok) throw new Error("Gagal mengambil rincian skor kecocokan.");
      const data = await res.json();
      setScoreModal((prev) => ({ ...prev, details: data, isLoading: false }));
    } catch (err: unknown) {
      setScoreModal((prev) => ({ ...prev, isLoading: false }));
      showErrorToast("Gagal memuat rincian skor kecocokan.");
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <div className="text-center">
          <Loader2 className="animate-spin text-primary mx-auto mb-3" size={36} />
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Memuat Berkas Lowongan &amp; Antrean Pelamar...
          </p>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !job) {
    return (
      <div className="p-12 text-center max-w-lg mx-auto">
        <div className="w-16 h-16 rounded-2xl bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center mx-auto mb-4">
          <AlertTriangle size={32} />
        </div>
        <h1 className="text-xl font-bold text-slate-800">
          {error || "Lowongan Pekerjaan Tidak Ditemukan"}
        </h1>
        <p className="text-xs text-slate-500 mt-1 mb-6">
          Pastikan ID lowongan benar atau hubungi administrator Human Capital untuk wewenang akses unit.
        </p>
        <Link
          href="/admin/lowongan"
          className="inline-flex items-center gap-2 bg-primary text-white px-6 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider hover:bg-primary-dark transition-all"
        >
          <ChevronLeft size={16} />
          <span>Kembali ke Direktori Lowongan</span>
        </Link>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="p-8 font-sans min-h-screen space-y-6 max-w-full mx-auto">
      {/* Tombol Navigasi Kembali */}
      <div className="flex items-center justify-between">
        <Link
          href="/admin/lowongan"
          className="inline-flex items-center gap-1.5 text-slate-500 hover:text-primary font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer group"
        >
          <ChevronLeft
            size={16}
            className="group-hover:-translate-x-1 transition-transform"
          />
          <span>Kembali ke Manajemen Lowongan</span>
        </Link>

        {!canManageLowongan && (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-50 text-amber-800 border border-amber-200">
            <Building2 size={12} /> Mode Penilai / Evaluator Unit
          </span>
        )}
      </div>

      {/* Layer 1: Hero Banner Informasi Lowongan */}
      <div className="detail-hero bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 relative overflow-hidden space-y-5">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 pb-5 border-b border-slate-100">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span
                className={`inline-flex items-center px-2.5 py-0.5 text-[10px] font-bold uppercase rounded-md border ${
                  job.category === "Medis"
                    ? "bg-blue-50 text-blue-800 border-blue-200"
                    : "bg-emerald-50 text-emerald-800 border-emerald-200"
                }`}
              >
                {job.category}
              </span>
              <span
                className={`inline-flex items-center px-2.5 py-0.5 text-[10px] font-semibold rounded-full ${
                  job.status === "Published"
                    ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                    : job.status === "Draft"
                    ? "bg-amber-100 text-amber-800 border border-amber-200"
                    : "bg-slate-100 text-slate-600 border border-slate-200"
                }`}
              >
                {job.status}
              </span>
              {(job.unit_name || job.requester_name) && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-blue-50/80 text-primary border border-blue-200/60 font-semibold text-xs">
                  <Building2 size={13} />
                  <span>{job.unit_name || "Unit Terkait"}</span>
                  {job.requester_name && <span className="text-slate-400">&bull; {job.requester_name}</span>}
                </span>
              )}
            </div>

            <h1 className="text-3xl font-bold text-primary-dark tracking-tight">
              {job.title}
            </h1>

            <div className="flex flex-wrap items-center gap-x-6 gap-y-1 text-xs text-slate-500 font-medium">
              <span className="flex items-center gap-1.5">
                <Calendar size={14} className="text-primary" />
                Diposting:{" "}
                <strong className="font-mono tabular-nums text-slate-700">
                  {formatDateIndonesia(job.posted_date)}
                </strong>
              </span>
              <span className="flex items-center gap-1.5">
                <Clock size={14} className="text-primary" />
                Batas Akhir:{" "}
                <strong className="font-mono tabular-nums text-slate-700">
                  {job.closing_date ? formatDateIndonesia(job.closing_date) : "Tanpa Batas"}
                </strong>
              </span>
            </div>
          </div>

          {/* Quick Counter Box */}
          <div className="w-full lg:w-auto bg-gradient-to-br from-primary-dark to-primary text-white p-5 rounded-2xl flex items-center justify-between lg:justify-center gap-6 shadow-xs shrink-0">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-blue-200">
                Total Berkas Masuk
              </p>
              <p className="text-3xl font-black font-mono tabular-nums mt-0.5">
                {applicants.length}{" "}
                <span className="text-xs font-semibold text-blue-200 font-sans">Kandidat</span>
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center text-white font-bold">
              <Users size={22} />
            </div>
          </div>
        </div>

        {/* 2-Kolom Deskripsi & Kualifikasi */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 detail-desc-card pt-1">
          {/* Deskripsi */}
          <div className="p-4 rounded-xl bg-slate-50/70 border border-slate-200/80 space-y-2.5">
            <h3 className="text-xs font-bold text-primary-dark uppercase tracking-wider flex items-center gap-2">
              <div className="w-1.5 h-4 bg-primary rounded-full"></div>
              <span>Deskripsi Tugas &amp; Tanggung Jawab</span>
            </h3>
            <div className="space-y-1.5 text-xs text-slate-600 leading-relaxed font-medium">
              {Array.isArray(job.deskripsi_job) && job.deskripsi_job.length > 0 ? (
                job.deskripsi_job.map((desc, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <span className="text-primary font-bold mt-0.5">•</span>
                    <span>{desc}</span>
                  </div>
                ))
              ) : (
                <p className="italic text-slate-400">Deskripsi pekerjaan umum operasional rumah sakit.</p>
              )}
            </div>
          </div>

          {/* Kualifikasi */}
          <div className="p-4 rounded-xl bg-slate-50/70 border border-slate-200/80 space-y-2.5">
            <h3 className="text-xs font-bold text-primary-dark uppercase tracking-wider flex items-center gap-2">
              <div className="w-1.5 h-4 bg-emerald-600 rounded-full"></div>
              <span>Kualifikasi &amp; Persyaratan Formasi</span>
            </h3>
            <div className="space-y-1.5 text-xs text-slate-600 leading-relaxed font-medium">
              {Array.isArray(job.kualifikasi_job) && job.kualifikasi_job.length > 0 ? (
                job.kualifikasi_job.map((qual, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <span className="text-emerald-600 font-bold mt-0.5">•</span>
                    <span>{qual}</span>
                  </div>
                ))
              ) : (
                <p className="italic text-slate-400">Kualifikasi sesuai standar kompetensi posisi.</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Layer 2: KPI Ribbon Pelamar (Horizontal 4-Grid) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="detail-kpi-card bg-white border border-slate-200/90 rounded-xl p-3.5 shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Total Pelamar
            </p>
            <p className="text-xl font-black text-slate-800 font-mono tabular-nums mt-0.5">
              {stats.total}{" "}
              <span className="text-xs font-semibold text-slate-400 font-sans">Berkas</span>
            </p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#0173b6] flex items-center justify-center font-bold">
            <Users size={20} />
          </div>
        </div>

        <div className="detail-kpi-card bg-white border border-slate-200/90 rounded-xl p-3.5 shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-amber-500">
              Menunggu Seleksi
            </p>
            <p className="text-xl font-black text-amber-600 font-mono tabular-nums mt-0.5">
              {stats.pending}{" "}
              <span className="text-xs font-semibold text-slate-400 font-sans">Pending</span>
            </p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
            <Clock size={20} />
          </div>
        </div>

        <div className="detail-kpi-card bg-white border border-slate-200/90 rounded-xl p-3.5 shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-indigo-600">
              Tahap Assessment
            </p>
            <p className="text-xl font-black text-indigo-700 font-mono tabular-nums mt-0.5">
              {stats.assessment}{" "}
              <span className="text-xs font-semibold text-slate-400 font-sans">Kandidat</span>
            </p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
            <ClipboardList size={20} />
          </div>
        </div>

        <div className="detail-kpi-card bg-white border border-slate-200/90 rounded-xl p-3.5 shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-600">
              Lolos / Diterima
            </p>
            <p className="text-xl font-black text-emerald-600 font-mono tabular-nums mt-0.5">
              {stats.accepted}{" "}
              <span className="text-xs font-semibold text-slate-400 font-sans">Lolos</span>
            </p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            <CheckCircle2 size={20} />
          </div>
        </div>
      </div>

      {/* Layer 3: Navigasi Segmented Control (DaisyUI Tab Box) */}
      <div className="detail-tab-container flex items-center gap-2 border-b border-slate-200/80 pb-3">
        <button
          onClick={() => setActiveTab("detail")}
          className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all cursor-pointer ${
            activeTab === "detail"
              ? "bg-primary text-white shadow-xs"
              : "bg-white text-slate-600 hover:bg-slate-50 border border-slate-200/80"
          }`}
        >
          <Users size={15} />
          <span>Antrean Berkas &amp; Seleksi Pelamar</span>
          <span
            className={`font-mono tabular-nums text-[10px] px-2 py-0.5 rounded-full ${
              activeTab === "detail" ? "bg-white/20 text-white" : "bg-slate-100 text-slate-600"
            }`}
          >
            {applicants.length}
          </span>
        </button>

        {canManageLowongan && (
          <button
            onClick={() => setActiveTab("assessment")}
            className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all cursor-pointer ${
              activeTab === "assessment"
                ? "bg-primary text-white shadow-xs"
                : "bg-white text-slate-600 hover:bg-slate-50 border border-slate-200/80"
            }`}
          >
            <FileSpreadsheet size={15} />
            <span>Konfigurasi Ujian &amp; Bundel Essay</span>
          </button>
        )}
      </div>

      {/* ======================================================== */}
      {/* KONTEN TAB 1: DAFTAR PELAMAR */}
      {/* ======================================================== */}
      {activeTab === "detail" || !canManageLowongan ? (
        <div className="space-y-5">
          {/* Filter Bar Pelamar */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Filter &amp; Pencarian Pelamar
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

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3 items-center">
              {/* Input Cari */}
              <div className="relative lg:col-span-2">
                <input
                  type="text"
                  placeholder="Cari nama kandidat, email, atau no wa..."
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

              {/* Filter Status Pipeline */}
              <div>
                <SearchableSelect
                  options={PIPELINE_FILTER_OPTIONS}
                  value={statusFilter}
                  onChange={(val) => setStatusFilter(val as FormOption | null)}
                  placeholder="Semua Status"
                />
              </div>

              {/* Filter Evaluasi Essay */}
              <div>
                <SearchableSelect
                  options={ESSAY_FILTER_OPTIONS}
                  value={essayFilter}
                  onChange={(val) => setEssayFilter(val as FormOption | null)}
                  placeholder="Semua Status Essay"
                />
              </div>

              {/* Tombol Aksi Massal */}
              {canManageLowongan && (
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => {
                      if (selectedCandidates.length === 0) {
                        showErrorToast("Centang minimal 1 kandidat untuk kirim undangan massal");
                        return;
                      }
                      setInviteModal({
                        isOpen: true,
                        type: "bulk",
                        scheduledDate: new Date().toISOString().split("T")[0],
                      });
                    }}
                    disabled={selectedCandidates.length === 0 || isBulkInviting}
                    className="w-full inline-flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold py-2 px-3 rounded-xl shadow-xs transition-all text-xs uppercase tracking-wider min-h-[38px] cursor-pointer"
                  >
                    {isBulkInviting ? (
                      <Loader2 size={14} className="animate-spin" />
                    ) : (
                      <Send size={14} />
                    )}
                    <span>Undang Massal ({selectedCandidates.length})</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Baris Judul Tabel */}
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-primary-dark">
              Daftar Antrean Berkas Kandidat
            </h2>
            <span className="text-xs font-semibold text-slate-500">
              Total <strong className="font-mono tabular-nums text-slate-800">{filteredApplicants.length}</strong> pelamar
            </span>
          </div>

          {/* Tabel Data Eksekutif */}
          <div className="overflow-hidden rounded-2xl border border-slate-200/80 shadow-xs bg-white">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs whitespace-nowrap">
                <thead className="text-xs text-white uppercase bg-primary-dark font-semibold">
                  <tr>
                    {canManageLowongan && (
                      <th scope="col" className="px-4 py-3.5 w-12 text-center text-white">
                        <button
                          type="button"
                          onClick={toggleSelectAll}
                          className="text-white/80 hover:text-white transition-colors"
                          title="Pilih Semua yang Belum Tes"
                        >
                          {applicants.length > 0 && selectedCandidates.length === processableCandidates.length && processableCandidates.length > 0 ? (
                            <CheckSquare size={16} />
                          ) : (
                            <Square size={16} />
                          )}
                        </button>
                      </th>
                    )}
                    <th scope="col" className="px-6 py-3.5 text-white">Nama Pelamar</th>
                    <th scope="col" className="px-6 py-3.5 text-white">Kontak (Email / WA)</th>
                    <th scope="col" className="px-6 py-3.5 text-white">Tanggal Melamar</th>
                    <th scope="col" className="px-6 py-3.5 text-white">Status Pipeline</th>
                    <th scope="col" className="px-6 py-3.5 text-white">Evaluasi Essay</th>
                    <th scope="col" className="px-6 py-3.5 text-center text-white">Kecocokan</th>
                    <th scope="col" className="px-6 py-3.5 text-center text-white">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {currentApplicants.length > 0 ? (
                    currentApplicants.map((applicant) => {
                      const isProcessable =
                        !applicant.status ||
                        ["SUBMITTED", "APPLIED", "PENDING"].includes(applicant.status.toUpperCase());
                      const isSelected = selectedCandidates.includes(applicant.id);

                      return (
                        <tr
                          key={applicant.id}
                          className={`hover:bg-slate-50/80 transition-colors ${
                            isSelected ? "bg-blue-50/40" : ""
                          }`}
                        >
                          {/* Checkbox */}
                          {canManageLowongan && (
                            <td className="px-4 py-4 text-center">
                              {isProcessable ? (
                                <button
                                  type="button"
                                  onClick={() => toggleSelect(applicant.id)}
                                  className="text-slate-400 hover:text-primary transition-colors cursor-pointer"
                                >
                                  {isSelected ? (
                                    <CheckSquare size={16} className="text-primary" />
                                  ) : (
                                    <Square size={16} />
                                  )}
                                </button>
                              ) : (
                                <span className="text-slate-300 font-bold">-</span>
                              )}
                            </td>
                          )}

                          {/* Nama & Avatar */}
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-xl bg-blue-50 text-primary font-bold text-xs border border-blue-200/60 flex items-center justify-center shrink-0 shadow-xs">
                                {getInitials(applicant.nama)}
                              </div>
                              <div className="min-w-0">
                                <p className="font-bold text-slate-900 text-sm">{applicant.nama}</p>
                                <p className="text-[11px] text-slate-400 font-mono tabular-nums mt-0.5">
                                  ID: {applicant.id.substring(0, 8)}...
                                </p>
                              </div>
                            </div>
                          </td>

                          {/* Kontak */}
                          <td className="px-6 py-4">
                            <p className="font-medium text-slate-800">{applicant.email}</p>
                            <a
                              href={`https://wa.me/${applicant.no_whatsapp?.replace(/[^0-9]/g, "")}`}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 hover:underline mt-0.5 font-mono tabular-nums"
                            >
                              <Phone size={11} />
                              <span>{applicant.no_whatsapp}</span>
                            </a>
                          </td>

                          {/* Tanggal Melamar */}
                          <td className="px-6 py-4">
                            <span className="font-mono tabular-nums text-xs font-semibold text-slate-700">
                              {formatDateIndonesia(applicant.created_at)}
                            </span>
                          </td>

                          {/* Status Pipeline */}
                          <td className="px-6 py-4">
                            <span
                              className={`inline-flex items-center px-2.5 py-1 text-xs font-semibold rounded-full ${
                                applicant.status?.toUpperCase() === "ACCEPTED"
                                  ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                                  : applicant.status?.toUpperCase() === "REJECTED"
                                  ? "bg-rose-100 text-rose-800 border border-rose-200"
                                  : applicant.status?.toUpperCase() === "ASSESSMENT"
                                  ? "bg-indigo-100 text-indigo-800 border border-indigo-200"
                                  : "bg-amber-100 text-amber-800 border border-amber-200"
                              }`}
                            >
                              {applicant.status || "SUBMITTED"}
                            </span>
                          </td>

                          {/* Evaluasi Essay */}
                          <td className="px-6 py-4">
                            {applicant.essay_review_decision === "LOLOS" ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200">
                                <Check size={11} strokeWidth={3} /> Lolos Essay
                              </span>
                            ) : applicant.essay_review_decision === "TIDAK_LOLOS" ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-rose-50 text-rose-700 border border-rose-200">
                                <X size={11} strokeWidth={3} /> Tidak Lolos
                              </span>
                            ) : applicant.essay_submitted ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-50 text-amber-700 border border-amber-200">
                                <Clock size={11} /> Perlu Review
                              </span>
                            ) : applicant.essay_required ? (
                              <span className="text-[11px] font-medium text-slate-400">
                                Menunggu Jawaban
                              </span>
                            ) : (
                              <span className="text-slate-300 font-bold">-</span>
                            )}
                          </td>

                          {/* Kecocokan Skor */}
                          <td className="px-6 py-4 text-center">
                            {applicant.suitability_match !== null &&
                            applicant.suitability_match !== undefined ? (
                              <div
                                onClick={() =>
                                  applicant.application_status_id &&
                                  handleViewScores(applicant.application_status_id, applicant.nama)
                                }
                                className="inline-flex flex-col items-center gap-1 p-1.5 rounded-lg hover:bg-slate-100 cursor-pointer transition-colors"
                                title="Klik untuk melihat rincian skor"
                              >
                                <div className="w-16 bg-slate-200/80 rounded-full h-1.5 overflow-hidden">
                                  <div
                                    className={`h-full ${
                                      Number(applicant.suitability_match) >= 80
                                        ? "bg-emerald-500"
                                        : Number(applicant.suitability_match) >= 50
                                        ? "bg-amber-500"
                                        : "bg-rose-500"
                                    }`}
                                    style={{
                                      width: `${Math.round(Number(applicant.suitability_match))}%`,
                                    }}
                                  ></div>
                                </div>
                                <span
                                  className={`font-mono tabular-nums text-xs font-bold ${
                                    Number(applicant.suitability_match) >= 80
                                      ? "text-emerald-700"
                                      : Number(applicant.suitability_match) >= 50
                                      ? "text-amber-700"
                                      : "text-rose-700"
                                  }`}
                                >
                                  {Math.round(Number(applicant.suitability_match))}%
                                </span>
                              </div>
                            ) : (
                              <span className="text-slate-300 font-bold">-</span>
                            )}
                          </td>

                          {/* Aksi Cepat */}
                          <td className="px-6 py-4 text-center">
                            <div className="flex items-center justify-center gap-1.5">
                              {/* Lihat Profil Lengkap */}
                              <button
                                onClick={() => handleViewCandidate(applicant.id)}
                                className="p-1.5 rounded-lg text-slate-600 hover:text-primary hover:bg-slate-100 transition-colors cursor-pointer"
                                title="Lihat Profil & Dokumen Lamaran"
                              >
                                <Eye size={16} />
                              </button>

                              {/* Aksi Khusus HC (Kirim Undangan / Tolak) */}
                              {canManageLowongan && isProcessable && (
                                <>
                                  <button
                                    onClick={() => {
                                      setInviteModal({
                                        isOpen: true,
                                        type: "single",
                                        candidateId: applicant.id,
                                        scheduledDate: new Date().toISOString().split("T")[0],
                                      });
                                    }}
                                    disabled={invitingId === applicant.id}
                                    className="p-1.5 rounded-lg text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 transition-colors cursor-pointer"
                                    title="Loloskan Berkas & Kirim Undangan Tes"
                                  >
                                    {invitingId === applicant.id ? (
                                      <Loader2 size={16} className="animate-spin" />
                                    ) : (
                                      <Send size={16} />
                                    )}
                                  </button>
                                  <button
                                    onClick={() => handleRejectCandidate(applicant.id)}
                                    className="p-1.5 rounded-lg text-rose-600 hover:text-rose-700 hover:bg-rose-50 transition-colors cursor-pointer"
                                    title="Tolak Kandidat (Gagal Berkas)"
                                  >
                                    <XCircle size={16} />
                                  </button>
                                </>
                              )}

                              {/* Tombol Laporan Psikometri / Essay jika sudah ada */}
                              {(applicant.status?.toUpperCase() === "ASSESSMENT" ||
                                applicant.status?.toUpperCase() === "COMPLETED" ||
                                applicant.status?.toUpperCase() === "ACCEPTED" ||
                                applicant.status?.toUpperCase() === "REJECTED" ||
                                applicant.essay_submitted ||
                                Boolean(applicant.assessment_session_status)) && (
                                <button
                                  onClick={() => handleViewAssessment(applicant.id)}
                                  className="p-1.5 rounded-lg text-blue-600 hover:text-blue-700 hover:bg-blue-50 transition-colors cursor-pointer"
                                  title="Lihat Laporan Psikometri & Evaluasi Essay"
                                >
                                  <ClipboardList size={16} />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={canManageLowongan ? 8 : 7} className="px-6 py-14 text-center text-slate-400">
                        <Users size={32} className="mx-auto mb-2 opacity-50" />
                        <p className="text-sm font-semibold">Tidak ada data pelamar yang sesuai</p>
                        <p className="text-xs text-slate-400 mt-0.5">
                          {hasActiveFilters
                            ? "Coba sesuaikan kata kunci pencarian atau reset filter."
                            : "Belum ada berkas pelamar yang mendaftar pada lowongan ini."}
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
        </div>
      ) : (
        /* KONTEN TAB 2: KONFIGURASI ASSESSMENT & ESSAY */
        <div className="space-y-6">
          <AssessmentSelector jobOpeningId={slug} jobId={job.job_id} />
          <EssayBundleSelector jobOpeningId={slug} />
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 1: PROFIL KANDIDAT LENGKAP */}
      {/* ======================================================== */}
      <StandardModal
        isOpen={!!selectedCandidateId}
        onClose={() => setSelectedCandidateId(null)}
        title="Berkas Profil Pelamar Kerja"
        subtitle="Verifikasi riwayat pendidikan, pengalaman kerja, dan berkas persyaratan"
        size="5xl"
      >
        {isLoadingDetail ? (
          <div className="p-16 text-center">
            <Loader2 className="animate-spin text-primary mx-auto mb-3" size={32} />
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Menyinkronkan Berkas Identitas...
            </p>
          </div>
        ) : candidateDetail ? (
          <div className="space-y-6">
            {/* Header Profil Singkat */}
            <div className="bg-slate-50/80 rounded-2xl p-5 border border-slate-200/80 flex flex-col sm:flex-row items-center sm:items-start gap-5">
              <div className="w-20 h-20 bg-white rounded-2xl border-2 border-slate-200 shadow-xs flex items-center justify-center shrink-0 overflow-hidden relative">
                {candidateDetail.documents?.pas_foto_url ? (
                  <Image
                    src={candidateDetail.documents.pas_foto_url}
                    alt="Foto Profil"
                    fill
                    className="object-cover"
                  />
                ) : (
                  <User size={36} className="text-slate-300" />
                )}
              </div>

              <div className="flex-1 text-center sm:text-left space-y-1">
                <h3 className="text-xl font-bold text-slate-900 tracking-tight">
                  {candidateDetail.nama}
                </h3>
                <div className="flex flex-wrap justify-center sm:justify-start gap-x-5 gap-y-1 text-xs text-slate-600 font-medium">
                  <span className="flex items-center gap-1.5">
                    <Mail size={13} className="text-primary" /> {candidateDetail.email}
                  </span>
                  <span className="flex items-center gap-1.5 font-mono tabular-nums">
                    <Phone size={13} className="text-emerald-600" /> {candidateDetail.no_whatsapp}
                  </span>
                </div>
                <div className="flex flex-wrap justify-center sm:justify-start gap-2 pt-1">
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-white border border-slate-200 text-slate-700">
                    <Heart size={11} className="text-rose-500" /> {candidateDetail.status_pernikahan || "Lajang"}
                  </span>
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-white border border-slate-200 text-slate-700">
                    <Target size={11} className="text-primary" /> {candidateDetail.agama || "-"}
                  </span>
                  {candidateDetail.tanggal_lahir && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-blue-50 text-primary border border-blue-200/60 font-mono tabular-nums">
                      {new Date().getFullYear() - new Date(candidateDetail.tanggal_lahir).getFullYear()} Tahun
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Grid Detail Riwayat */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              {/* Pengalaman Kerja */}
              <div className="bg-white p-5 rounded-xl border border-slate-200/90 shadow-2xs space-y-3">
                <h4 className="text-xs font-bold text-primary-dark uppercase tracking-wider flex items-center gap-2 pb-2 border-b border-slate-100">
                  <Briefcase size={14} className="text-primary" />
                  <span>Riwayat Pengalaman Kerja</span>
                </h4>
                <div className="space-y-3">
                  {candidateDetail.experience?.length > 0 ? (
                    candidateDetail.experience.map((exp: any, i: number) => (
                      <div key={i} className="p-3 bg-slate-50/70 rounded-xl border border-slate-100">
                        <p className="font-bold text-slate-800 text-xs">{exp.jabatan_terakhir}</p>
                        <p className="text-primary font-semibold text-[11px] mt-0.5">{exp.nama_instansi}</p>
                        <p className="text-[10px] font-mono tabular-nums text-slate-400 mt-1">
                          {exp.tahun_mulai} — {exp.tahun_selesai}
                        </p>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs italic text-slate-400 py-3">Belum ada riwayat pengalaman kerja.</p>
                  )}
                </div>
              </div>

              {/* Pendidikan Terakhir */}
              <div className="bg-white p-5 rounded-xl border border-slate-200/90 shadow-2xs space-y-3">
                <h4 className="text-xs font-bold text-primary-dark uppercase tracking-wider flex items-center gap-2 pb-2 border-b border-slate-100">
                  <GraduationCap size={15} className="text-emerald-600" />
                  <span>Pendidikan Terakhir</span>
                </h4>
                <div className="space-y-3">
                  {candidateDetail.education?.formal?.length > 0 ? (
                    candidateDetail.education.formal.map((edu: any, i: number) => (
                      <div key={i} className="p-3 bg-slate-50/70 rounded-xl border border-slate-100">
                        <p className="font-bold text-slate-800 text-xs">{edu.nama_sekolah}</p>
                        <div className="flex items-center gap-3 mt-1 text-[11px]">
                          <span className="text-emerald-700 font-semibold font-mono tabular-nums">
                            Lulus {edu.tahun_lulus}
                          </span>
                          {edu.ipk && (
                            <span className="font-mono tabular-nums font-bold px-1.5 py-0.5 bg-white border border-slate-200 rounded text-slate-700">
                              IPK: {edu.ipk}
                            </span>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs italic text-slate-400 py-3">Belum ada data pendidikan.</p>
                  )}
                </div>
              </div>

              {/* Data Keluarga */}
              <div className="bg-white p-5 rounded-xl border border-slate-200/90 shadow-2xs space-y-3">
                <h4 className="text-xs font-bold text-primary-dark uppercase tracking-wider flex items-center gap-2 pb-2 border-b border-slate-100">
                  <Users size={14} className="text-purple-600" />
                  <span>Keluarga Inti</span>
                </h4>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Ayah</p>
                    <p className="font-semibold text-slate-800 mt-0.5">{candidateDetail.parents?.nama_ayah || "-"}</p>
                  </div>
                  <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Ibu</p>
                    <p className="font-semibold text-slate-800 mt-0.5">{candidateDetail.parents?.nama_ibu || "-"}</p>
                  </div>
                </div>
              </div>

              {/* Dokumen & Berkas Pendukung */}
              <div className="bg-white p-5 rounded-xl border border-slate-200/90 shadow-2xs space-y-3">
                <h4 className="text-xs font-bold text-primary-dark uppercase tracking-wider flex items-center gap-2 pb-2 border-b border-slate-100">
                  <Paperclip size={14} className="text-amber-600" />
                  <span>Berkas &amp; Lampiran Lamaran</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {candidateDetail.documents &&
                  Object.entries(candidateDetail.documents).some(
                    ([k, v]) => v && !k.includes("id") && !k.includes("candidate")
                  ) ? (
                    Object.entries(candidateDetail.documents).map(([k, v]) => {
                      if (!v || k.includes("id") || k.includes("candidate")) return null;
                      const label = k.replace("_url", "").replace(/_/g, " ").toUpperCase();
                      return (
                        <a
                          key={k}
                          href={v as string}
                          target="_blank"
                          rel="noreferrer"
                          className="p-2.5 bg-slate-50 hover:bg-primary hover:text-white border border-slate-200/70 rounded-xl flex items-center justify-between text-xs font-semibold text-slate-700 transition-colors group"
                        >
                          <span className="truncate pr-2">{label}</span>
                          <Download size={13} className="shrink-0 text-slate-400 group-hover:text-white" />
                        </a>
                      );
                    })
                  ) : (
                    <p className="text-xs italic text-slate-400 py-3 col-span-2">Belum ada dokumen yang diunggah.</p>
                  )}
                </div>
              </div>
            </div>

            {/* Footer Aksi */}
            <div className="pt-4 border-t border-slate-200 flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedCandidateId(null)}
                className="px-5 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer"
              >
                Tutup Berkas
              </button>
            </div>
          </div>
        ) : null}
      </StandardModal>

      {/* ======================================================== */}
      {/* MODAL 2: LAPORAN HASIL ASSESSMENT PSIKOMETRI & ESSAY */}
      {/* ======================================================== */}
      <StandardModal
        isOpen={!!selectedAssessmentId}
        onClose={() => setSelectedAssessmentId(null)}
        title="Laporan Psikometri & Evaluasi Essay Kandidat"
        subtitle="Analisis psikologi kerja: MBTI, DISC, PAPI Kostick, CFIT, dan Uji Essay"
        size="5xl"
      >
        {isLoadingDetail ? (
          <div className="p-16 text-center">
            <Loader2 className="animate-spin text-primary mx-auto mb-3" size={32} />
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Menghitung Hasil Evaluasi Psikometri...
            </p>
          </div>
        ) : candidateDetail && candidateDetail.assessment_results ? (
          <div className="space-y-6">
            {/* Header Sesi */}
            <div className="bg-slate-50/90 p-4 rounded-xl border border-slate-200/80 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-slate-900">{candidateDetail.nama}</h3>
                <p className="text-xs font-mono tabular-nums text-slate-500 mt-0.5">
                  Token: {candidateDetail.assessment_results.session?.token || "-"}
                </p>
              </div>
              <span
                className={`inline-flex items-center px-3 py-1 text-xs font-semibold rounded-full ${
                  candidateDetail.assessment_results.session?.status === "COMPLETED"
                    ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                    : "bg-blue-100 text-blue-800 border border-blue-200"
                }`}
              >
                {candidateDetail.assessment_results.session?.status || "IN_PROGRESS"}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* MBTI Card */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <h4 className="text-xs font-bold text-primary-dark uppercase tracking-wider flex items-center gap-2">
                    <Sparkles size={15} className="text-primary" />
                    <span>MBTI Personality Type</span>
                  </h4>
                  {candidateDetail.assessment_results.mbti && (
                    <span className="font-mono tabular-nums font-black text-lg text-primary">
                      {candidateDetail.assessment_results.mbti.final_result}
                    </span>
                  )}
                </div>

                {candidateDetail.assessment_results.mbti ? (() => {
                  const mbti = candidateDetail.assessment_results.mbti;
                  const scoreE = Number(mbti.score_e || 0);
                  const scoreI = Number(mbti.score_i || 0);
                  const scoreS = Number(mbti.score_s || 0);
                  const scoreN = Number(mbti.score_n || 0);
                  const scoreT = Number(mbti.score_t || 0);
                  const scoreF = Number(mbti.score_f || 0);
                  const scoreJ = Number(mbti.score_j || 0);
                  const scoreP = Number(mbti.score_p || 0);

                  const totalEI = scoreE + scoreI || 1;
                  const totalSN = scoreS + scoreN || 1;
                  const totalTF = scoreT + scoreF || 1;
                  const totalJP = scoreJ + scoreP || 1;

                  const ePct = Math.round((scoreE / totalEI) * 100);
                  const iPct = 100 - ePct;
                  const sPct = Math.round((scoreS / totalSN) * 100);
                  const nPct = 100 - sPct;
                  const tPct = Math.round((scoreT / totalTF) * 100);
                  const fPct = 100 - tPct;
                  const jPct = Math.round((scoreJ / totalJP) * 100);
                  const pPct = 100 - jPct;

                  const profile = getMBTIProfileDetail(mbti.final_result);

                  return (
                    <div className="space-y-3 text-xs">
                      {/* E vs I */}
                      <div>
                        <div className="flex justify-between items-center text-[11px] mb-1 font-semibold">
                          <span className={scoreE >= scoreI ? "text-primary font-bold" : "text-slate-400"}>
                            E ({ePct}%)
                          </span>
                          <span className={scoreI > scoreE ? "text-primary font-bold" : "text-slate-400"}>
                            ({iPct}%) I
                          </span>
                        </div>
                        <progress className="progress progress-primary w-full h-1.5" value={ePct} max="100"></progress>
                      </div>

                      {/* S vs N */}
                      <div>
                        <div className="flex justify-between items-center text-[11px] mb-1 font-semibold">
                          <span className={scoreS >= scoreN ? "text-emerald-700 font-bold" : "text-slate-400"}>
                            S ({sPct}%)
                          </span>
                          <span className={scoreN > scoreS ? "text-emerald-700 font-bold" : "text-slate-400"}>
                            ({nPct}%) N
                          </span>
                        </div>
                        <progress className="progress progress-success w-full h-1.5" value={sPct} max="100"></progress>
                      </div>

                      {/* T vs F */}
                      <div>
                        <div className="flex justify-between items-center text-[11px] mb-1 font-semibold">
                          <span className={scoreT >= scoreF ? "text-amber-700 font-bold" : "text-slate-400"}>
                            T ({tPct}%)
                          </span>
                          <span className={scoreF > scoreT ? "text-amber-700 font-bold" : "text-slate-400"}>
                            ({fPct}%) F
                          </span>
                        </div>
                        <progress className="progress progress-warning w-full h-1.5" value={tPct} max="100"></progress>
                      </div>

                      {/* J vs P */}
                      <div>
                        <div className="flex justify-between items-center text-[11px] mb-1 font-semibold">
                          <span className={scoreJ >= scoreP ? "text-indigo-700 font-bold" : "text-slate-400"}>
                            J ({jPct}%)
                          </span>
                          <span className={scoreP > scoreJ ? "text-indigo-700 font-bold" : "text-slate-400"}>
                            ({pPct}%) P
                          </span>
                        </div>
                        <progress className="progress progress-info w-full h-1.5" value={jPct} max="100"></progress>
                      </div>

                      {profile && (
                        <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 mt-3 space-y-1">
                          <p className="font-bold text-primary-dark text-xs">{profile.julukan}</p>
                          <p className="text-[11px] text-slate-600 leading-relaxed">{profile.ciri_ciri_umum}</p>
                        </div>
                      )}
                    </div>
                  );
                })() : (
                  <p className="text-xs italic text-slate-400 py-3">Belum menyelesaikan ujian MBTI.</p>
                )}
              </div>

              {/* DISC Card */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <h4 className="text-xs font-bold text-primary-dark uppercase tracking-wider flex items-center gap-2">
                    <Zap size={15} className="text-amber-500" />
                    <span>DISC Profile Pattern</span>
                  </h4>
                </div>

                {candidateDetail.assessment_results.disc ? (() => {
                  const disc = candidateDetail.assessment_results.disc;
                  const diffD = Number(disc.diff_d || 0);
                  const diffI = Number(disc.diff_i || 0);
                  const diffS = Number(disc.diff_s || 0);
                  const diffC = Number(disc.diff_c || 0);

                  const diffMap: Record<string, number> = { D: diffD, I: diffI, S: diffS, C: diffC };
                  const dims: Array<"D" | "I" | "S" | "C"> = ["D", "I", "S", "C"];
                  const positive = dims.filter((d) => diffMap[d] >= 0).sort((a, b) => diffMap[b] - diffMap[a]).join("");
                  const negative = dims.filter((d) => diffMap[d] < 0).sort((a, b) => diffMap[b] - diffMap[a]).join("");
                  const pattern = `${positive}/${negative}`;
                  const profile = getDISCProfileDetail({ positive, negative, pattern });

                  return (
                    <div className="space-y-3 text-xs">
                      <div className="p-3 bg-amber-50/70 border border-amber-200/70 rounded-xl flex items-center justify-between">
                        <div>
                          <p className="text-[10px] font-bold uppercase tracking-wider text-amber-800">Pola DISC</p>
                          <p className="font-mono tabular-nums text-lg font-black text-amber-900 mt-0.5">{pattern}</p>
                        </div>
                        {profile?.karakter_utama && (
                          <span className="font-bold text-xs bg-white px-2.5 py-1 rounded-lg border border-amber-200 text-amber-800">
                            {profile.karakter_utama}
                          </span>
                        )}
                      </div>

                      <div className="grid grid-cols-4 gap-2 text-center font-mono tabular-nums">
                        <div className="p-2 bg-slate-50 rounded-lg border border-slate-100">
                          <p className="text-[10px] font-bold text-slate-400">D</p>
                          <p className="font-bold text-slate-800">{diffD}</p>
                        </div>
                        <div className="p-2 bg-slate-50 rounded-lg border border-slate-100">
                          <p className="text-[10px] font-bold text-slate-400">I</p>
                          <p className="font-bold text-slate-800">{diffI}</p>
                        </div>
                        <div className="p-2 bg-slate-50 rounded-lg border border-slate-100">
                          <p className="text-[10px] font-bold text-slate-400">S</p>
                          <p className="font-bold text-slate-800">{diffS}</p>
                        </div>
                        <div className="p-2 bg-slate-50 rounded-lg border border-slate-100">
                          <p className="text-[10px] font-bold text-slate-400">C</p>
                          <p className="font-bold text-slate-800">{diffC}</p>
                        </div>
                      </div>

                      {profile?.deskripsi && (
                        <p className="text-[11px] text-slate-600 leading-relaxed bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                          {profile.deskripsi}
                        </p>
                      )}
                    </div>
                  );
                })() : (
                  <p className="text-xs italic text-slate-400 py-3">Belum menyelesaikan ujian DISC.</p>
                )}
              </div>

              {/* PAPI Card (Full Width) */}
              <div className="col-span-1 md:col-span-2 bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-3">
                <h4 className="text-xs font-bold text-primary-dark uppercase tracking-wider flex items-center gap-2 pb-2 border-b border-slate-100">
                  <ClipboardList size={15} className="text-emerald-600" />
                  <span>PAPI Kostick (Roles &amp; Needs Profile)</span>
                </h4>
                {candidateDetail.assessment_results.papi ? (
                  <PAPIResultView scores={candidateDetail.assessment_results.papi} />
                ) : (
                  <p className="text-xs italic text-slate-400 py-3">Belum menyelesaikan ujian PAPI Kostick.</p>
                )}
              </div>

              {/* CFIT Card (Full Width) */}
              <div className="col-span-1 md:col-span-2 bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-3">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <h4 className="text-xs font-bold text-primary-dark uppercase tracking-wider flex items-center gap-2">
                    <Brain size={15} className="text-purple-600" />
                    <span>Culture Fair Intelligence Test (CFIT Skala 3)</span>
                  </h4>
                  {candidateDetail.assessment_results.cfit && (
                    <span className="font-mono tabular-nums text-xs font-bold px-2.5 py-0.5 rounded-full bg-purple-50 text-purple-800 border border-purple-200">
                      IQ: {candidateDetail.assessment_results.cfit.iq_score} &bull; {candidateDetail.assessment_results.cfit.category}
                    </span>
                  )}
                </div>
                {candidateDetail.assessment_results.cfit ? (
                  <CFITResultView result={candidateDetail.assessment_results.cfit} />
                ) : (
                  <p className="text-xs italic text-slate-400 py-3">Belum menyelesaikan ujian CFIT.</p>
                )}
              </div>

              {/* Evaluasi Essay Panel (Full Width) */}
              <div className="col-span-1 md:col-span-2">
                <EssayReviewPanel
                  essayResult={(candidateDetail.assessment_results.essay as EssayResultRecord | null) ?? null}
                  essayRequired={Boolean(candidateDetail.assessment_results.essay_required)}
                  essayBundleName={candidateDetail.assessment_results.essay_bundle_name ?? null}
                  canManageLowongan={canManageLowongan}
                  onSaved={(updated: Partial<EssayResultRecord>) => {
                    setCandidateDetail((prev: any) =>
                      prev
                        ? {
                            ...prev,
                            assessment_results: {
                              ...prev.assessment_results,
                              essay: {
                                ...(prev.assessment_results?.essay ?? {}),
                                ...updated,
                              },
                            },
                          }
                        : prev
                    );
                    setApplicants((prev) =>
                      prev.map((app) =>
                        app.id === selectedAssessmentId
                          ? {
                              ...app,
                              essay_submitted: true,
                              essay_review_decision: updated.review_decision ?? app.essay_review_decision ?? null,
                              essay_reviewed_by_name: updated.reviewed_by_name ?? app.essay_reviewed_by_name ?? null,
                            }
                          : app
                      )
                    );
                  }}
                />
              </div>
            </div>

            {/* Footer Tutup */}
            <div className="pt-4 border-t border-slate-200 flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedAssessmentId(null)}
                className="px-5 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer"
              >
                Tutup Laporan
              </button>
            </div>
          </div>
        ) : (
          <div className="p-10 text-center text-slate-400">
            <ClipboardList size={32} className="mx-auto mb-2 opacity-50" />
            <p className="text-sm font-semibold">Belum ada sesi tes psikometri untuk kandidat ini.</p>
          </div>
        )}
      </StandardModal>

      {/* ======================================================== */}
      {/* MODAL 3: DETAIL SKOR ASSESSMENT */}
      {/* ======================================================== */}
      <StandardModal
        isOpen={scoreModal.isOpen}
        onClose={() => setScoreModal((prev) => ({ ...prev, isOpen: false }))}
        title={`Rincian Skor Kecocokan - ${scoreModal.applicantName}`}
        subtitle="Analisis pembobotan per butir pertanyaan dan jawaban pelamar"
        size="lg"
      >
        <div className="space-y-4">
          {scoreModal.isLoading ? (
            <div className="p-10 text-center">
              <Loader2 className="animate-spin text-primary mx-auto mb-2" size={28} />
              <p className="text-xs font-semibold text-slate-500">Memuat rincian skor kecocokan...</p>
            </div>
          ) : scoreModal.details.length === 0 ? (
            <p className="text-xs text-slate-400 italic text-center py-6">
              Tidak ada data butir skor khusus untuk kandidat ini.
            </p>
          ) : (
            <div className="space-y-2.5">
              {scoreModal.details.map((item, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-xl bg-slate-50/80 border border-slate-200/80 flex items-center justify-between gap-4 text-xs"
                >
                  <div className="flex-1 space-y-1">
                    <p className="font-semibold text-slate-800">{item.question}</p>
                    <p className="text-slate-500 font-medium">
                      Jawaban:{" "}
                      <span className="font-bold text-primary bg-blue-50 px-2 py-0.5 rounded border border-blue-200/60">
                        {item.answer_value}
                      </span>
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Skor</span>
                    <span
                      className={`font-mono tabular-nums text-base font-black ${
                        item.fuzzy_score >= 80
                          ? "text-emerald-600"
                          : item.fuzzy_score >= 50
                          ? "text-amber-600"
                          : "text-rose-600"
                      }`}
                    >
                      {Math.round(item.fuzzy_score)}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="pt-4 border-t border-slate-200 flex justify-end">
            <button
              type="button"
              onClick={() => setScoreModal((prev) => ({ ...prev, isOpen: false }))}
              className="px-5 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer"
            >
              Tutup
            </button>
          </div>
        </div>
      </StandardModal>

      {/* ======================================================== */}
      {/* MODAL 4: PENJADWALAN UNDANGAN TES PSIKOMETRI */}
      {/* ======================================================== */}
      <StandardModal
        isOpen={inviteModal.isOpen}
        onClose={() => setInviteModal((prev) => ({ ...prev, isOpen: false }))}
        title={inviteModal.type === "single" ? "Jadwalkan & Kirim Undangan Ujian" : "Kirim Undangan Ujian Massal"}
        subtitle="Undangan tes psikometri beserta Token & Kode Akses akan dikirimkan otomatis"
        size="md"
      >
        <div className="space-y-5">
          <p className="text-xs text-slate-600 font-medium leading-relaxed">
            {inviteModal.type === "single"
              ? "Tentukan tanggal aktif ujian psikometri untuk kandidat terpilih. Kode akses hanya berlaku pada tanggal tersebut."
              : `Tentukan tanggal aktif ujian psikometri untuk ${selectedCandidates.length} kandidat terpilih.`}
          </p>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Tanggal Pelaksanaan Ujian <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <input
                type="date"
                min={new Date().toISOString().split("T")[0]}
                value={inviteModal.scheduledDate}
                onChange={(e) => setInviteModal({ ...inviteModal, scheduledDate: e.target.value })}
                className="w-full h-[40px] pl-9 pr-3 bg-slate-50/80 border border-slate-200/90 rounded-xl text-xs font-semibold font-mono tabular-nums text-slate-800 focus:bg-white focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                required
              />
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
            </div>
          </div>

          <div className="pt-4 border-t border-slate-200 flex justify-end gap-2.5">
            <button
              type="button"
              onClick={() => setInviteModal((prev) => ({ ...prev, isOpen: false }))}
              className="px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer"
            >
              Batal
            </button>
            <button
              type="button"
              onClick={async () => {
                if (!inviteModal.scheduledDate) {
                  showErrorToast("Tanggal ujian psikometri wajib ditentukan");
                  return;
                }
                const schedDate = inviteModal.scheduledDate;
                setInviteModal((prev) => ({ ...prev, isOpen: false }));

                if (inviteModal.type === "single" && inviteModal.candidateId) {
                  const applicant = applicants.find((a) => a.id === inviteModal.candidateId);
                  if (applicant) processInvite(applicant, schedDate);
                } else if (inviteModal.type === "bulk") {
                  setIsBulkInviting(true);
                  let successCount = 0;
                  for (const candidateId of selectedCandidates) {
                    const applicant = applicants.find((a) => a.id === candidateId);
                    if (applicant) {
                      const success = await processInvite(applicant, schedDate, true);
                      if (success) successCount++;
                    }
                  }
                  setIsBulkInviting(false);
                  setSelectedCandidates([]);
                  showSuccessToast(
                    `Berhasil mengirim ${successCount} dari ${selectedCandidates.length} undangan tes!`
                  );
                }
              }}
              className="inline-flex items-center gap-2 bg-primary hover:bg-primary-dark text-white font-bold py-2.5 px-6 rounded-xl shadow-xs transition-all active:scale-[0.98] text-xs uppercase tracking-wider cursor-pointer"
            >
              <Send size={15} />
              <span>Kirim Undangan Sekarang</span>
            </button>
          </div>
        </div>
      </StandardModal>
    </div>
  );
}
