/**
 * Path: src/app/(admin)/admin/request-pegawai/page.tsx
 * Deskripsi: Manajemen Request Pegawai & Rekrutmen Kebutuhan SDM RSU Avisena.
 * Standar: UI/UX Pro Max, DaisyUI, GSAP Motion, Alice Design System & Impeccable Craft.
 */

"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import {
  PlusCircle,
  Search,
  RotateCcw,
  CheckCircle2,
  Clock,
  Ban,
  Users,
  Check,
  X,
  ChevronLeft,
  Send,
  Eye,
  Briefcase,
  Calendar,
  Building2,
  Sparkles,
  Trophy,
  Medal,
  Target,
  Info,
  Layers,
  FileText,
  UserCheck,
  AlertCircle,
  Plus,
  Minus,
  Loader2,
} from "lucide-react";
import SearchableSelect from "@/app/components/admin/SearchableSelect";
import Pagination from "@/app/components/admin/Pagination";
import { showSuccessToast, showErrorToast } from "@/app/components/admin/Alert";
import Swal from "sweetalert2";

if (typeof window !== "undefined") {
  gsap.registerPlugin(useGSAP);
}

// --- INTERFACES & TYPES ---

type FormOption = { value: string | number; label: string };

interface EmployeeRequest {
  id: string;
  request_date: string;
  quantity: number;
  type: "penambahan" | "pergantian";
  urgency: "Rendah" | "Sedang" | "Tinggi";
  status: "Menunggu Persetujuan" | "Disetujui" | "Ditolak";
  mbti_results?: string[];
  position?: string;
  requester?: string;
  department?: string;
  level?: string;
  job_id?: string | number;
}

interface JobItem {
  id: number;
  nama_job: string;
  jenis_job?: string;
}

interface MbtiTraitOption {
  value: string;
  label: string;
  type: "E" | "I" | "S" | "N" | "T" | "F" | "J" | "P";
}

// --- DATA REFERENSI MBTI ---

const MBTI_CATEGORIZED_OPTIONS: Record<string, { title: string; subtitle: string; options: MbtiTraitOption[] }> = {
  interaction: {
    title: "Orientasi Interaksi",
    subtitle: "Extrovert (E) vs Introvert (I)",
    options: [
      { value: "e1", label: "Supel, mudah bergaul", type: "E" },
      { value: "e2", label: "Energik dan antusias", type: "E" },
      { value: "e3", label: "Senang bekerja dalam tim", type: "E" },
      { value: "e4", label: "Mudah mengutarakan pendapat", type: "E" },
      { value: "i1", label: "Fokus, tenang, dan observatif", type: "I" },
      { value: "i2", label: "Mandiri dalam menuntaskan tugas", type: "I" },
      { value: "i3", label: "Berpikir matang sebelum bertindak", type: "I" },
    ],
  },
  information: {
    title: "Pemrosesan Informasi",
    subtitle: "Sensing (S) vs Intuition (N)",
    options: [
      { value: "s1", label: "Detail-oriented dan teliti", type: "S" },
      { value: "s2", label: "Praktis dan realistis", type: "S" },
      { value: "s3", label: "Fokus pada data dan fakta nyata", type: "S" },
      { value: "n1", label: "Visioner & kaya inovasi", type: "N" },
      { value: "n2", label: "Kreatif & adaptif solusi baru", type: "N" },
      { value: "n3", label: "Berpikir kerangka konsep luas", type: "N" },
    ],
  },
  decision: {
    title: "Pengambilan Keputusan",
    subtitle: "Thinking (T) vs Feeling (F)",
    options: [
      { value: "t1", label: "Logis & analitis berbasis SOP", type: "T" },
      { value: "t2", label: "Objektif dalam evaluasi masalah", type: "T" },
      { value: "t3", label: "Tegas dalam menegakkan aturan", type: "T" },
      { value: "f1", label: "Empatik & berorientasi pelayanan", type: "F" },
      { value: "f2", label: "Mendukung keharmonisan tim", type: "F" },
      { value: "f3", label: "Sensitif terhadap kebutuhan pasien", type: "F" },
    ],
  },
  workStyle: {
    title: "Pola & Ritme Kerja",
    subtitle: "Judging (J) vs Perceiving (P)",
    options: [
      { value: "j1", label: "Teratur, rapi & terstruktur", type: "J" },
      { value: "j2", label: "Disiplin tinggi & tepat waktu", type: "J" },
      { value: "j3", label: "Menyukai jadwal & rencana jelas", type: "J" },
      { value: "p1", label: "Fleksibel saat kondisi mendadak", type: "P" },
      { value: "p2", label: "Responsif & dinamis di lapangan", type: "P" },
      { value: "p3", label: "Terbuka pada perubahan tak terduga", type: "P" },
    ],
  },
};

const ALL_MBTI_TYPES = [
  "ISTJ", "ISFJ", "INFJ", "INTJ",
  "ISTP", "ISFP", "INFP", "INTP",
  "ESTP", "ESFP", "ENFP", "ENTP",
  "ESTJ", "ESFJ", "ENFJ", "ENTJ",
];

const STATUS_FILTER_OPTIONS: FormOption[] = [
  { value: "ALL", label: "Semua Status" },
  { value: "Menunggu Persetujuan", label: "Menunggu Persetujuan" },
  { value: "Disetujui", label: "Disetujui" },
  { value: "Ditolak", label: "Ditolak" },
];

const TYPE_FILTER_OPTIONS: FormOption[] = [
  { value: "ALL", label: "Semua Kategori" },
  { value: "penambahan", label: "Penambahan Formasi" },
  { value: "pergantian", label: "Pergantian Pegawai" },
];

const URGENCY_FILTER_OPTIONS: FormOption[] = [
  { value: "ALL", label: "Semua Prioritas" },
  { value: "Tinggi", label: "Prioritas Tinggi" },
  { value: "Sedang", label: "Prioritas Sedang" },
  { value: "Rendah", label: "Prioritas Rendah" },
];

// Helper inisial untuk avatar
const getInitials = (name?: string): string => {
  if (!name) return "SD";
  const parts = name.trim().split(" ").filter(Boolean);
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

// Helper format tanggal Indonesia
const formatDateIndonesia = (dateStr?: string): string => {
  if (!dateStr) return "-";
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return "-";
  return d.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
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
  size?: "sm" | "md" | "lg" | "xl" | "2xl";
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
    "2xl": "max-w-4xl",
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

export default function RequestPegawaiPage() {
  const containerRef = useRef<HTMLDivElement>(null);

  // View mode
  const [view, setView] = useState<"list" | "add">("list");

  // Data states
  const [requests, setRequests] = useState<EmployeeRequest[]>([]);
  const [jobList, setJobList] = useState<JobItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<FormOption | null>(null);
  const [typeFilter, setTypeFilter] = useState<FormOption | null>(null);
  const [urgencyFilter, setUrgencyFilter] = useState<FormOption | null>(null);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Modal states
  const [selectedRequest, setSelectedRequest] = useState<EmployeeRequest | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isApproveModalOpen, setIsApproveModalOpen] = useState(false);
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [isActionLoading, setIsActionLoading] = useState(false);

  // Form Approval HC State
  const [lowonganTitle, setLowonganTitle] = useState("");
  const [lowonganClosingDate, setLowonganClosingDate] = useState("");
  const [lowonganStatus, setLowonganStatus] = useState<"Published" | "Draft">("Published");

  // Form Add Request State
  const [requestType, setRequestType] = useState<"penambahan" | "pergantian">("penambahan");
  const [selectedPosition, setSelectedPosition] = useState<FormOption | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [urgency, setUrgency] = useState<"Rendah" | "Sedang" | "Tinggi">("Sedang");
  const [selectedTraits, setSelectedTraits] = useState<MbtiTraitOption[]>([]);

  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "/api";

  // --- FETCH DATA ---
  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [reqRes, jobsRes] = await Promise.all([
        fetch(`${baseUrl}/employee-requests`, { cache: "no-store" }),
        fetch(`${baseUrl}/jobs`, { cache: "no-store" }),
      ]);
      if (reqRes.ok) {
        const data = await reqRes.json();
        setRequests(Array.isArray(data) ? data : []);
      }
      if (jobsRes.ok) {
        const jobs = await jobsRes.json();
        setJobList(Array.isArray(jobs) ? jobs : []);
      }
    } catch (e) {
      console.error("Gagal memuat data request pegawai:", e);
      showErrorToast("Gagal memuat data permintaan pegawai dari server");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // --- BENCHMARK MBTI ENGINE ---
  const topMbtiResults = useMemo(() => {
    if (selectedTraits.length === 0) return [];
    const counts: Record<string, number> = {
      E: 0, I: 0, S: 0, N: 0, T: 0, F: 0, J: 0, P: 0,
    };
    selectedTraits.forEach((t) => {
      if (counts[t.type] !== undefined) {
        counts[t.type]++;
      }
    });

    const scored = ALL_MBTI_TYPES.map((type) => {
      const score = type
        .split("")
        .reduce((acc, letter) => acc + (counts[letter] || 0), 0);
      return { type, score };
    });

    const sorted = scored
      .sort((a, b) => b.score - a.score)
      .filter((x) => x.score > 0);

    const maxScore = sorted[0]?.score || 1;
    return sorted.slice(0, 3).map((item) => ({
      ...item,
      percentage: Math.min(100, Math.round((item.score / maxScore) * 100)),
    }));
  }, [selectedTraits]);

  // Toggle trait chip
  const handleToggleTrait = (trait: MbtiTraitOption) => {
    const exists = selectedTraits.some((t) => t.value === trait.value);
    if (exists) {
      setSelectedTraits(selectedTraits.filter((t) => t.value !== trait.value));
    } else {
      setSelectedTraits([...selectedTraits, trait]);
    }
  };

  // --- STATS KPI ---
  const stats = useMemo(() => {
    const total = requests.length;
    const pending = requests.filter((r) => r.status === "Menunggu Persetujuan").length;
    const approved = requests.filter((r) => r.status === "Disetujui").length;
    const rejected = requests.filter((r) => r.status === "Ditolak").length;
    return { total, pending, approved, rejected };
  }, [requests]);

  // --- FILTER & SEARCH ---
  const filteredRequests = useMemo(() => {
    return requests.filter((req) => {
      // Search term
      if (searchTerm) {
        const query = searchTerm.toLowerCase();
        const pos = req.position?.toLowerCase() || "";
        const dept = req.department?.toLowerCase() || "";
        const reqName = req.requester?.toLowerCase() || "";
        if (!pos.includes(query) && !dept.includes(query) && !reqName.includes(query)) {
          return false;
        }
      }

      // Status filter
      if (statusFilter && statusFilter.value !== "ALL") {
        if (req.status !== statusFilter.value) return false;
      }

      // Type filter
      if (typeFilter && typeFilter.value !== "ALL") {
        if (req.type !== typeFilter.value) return false;
      }

      // Urgency filter
      if (urgencyFilter && urgencyFilter.value !== "ALL") {
        if (req.urgency !== urgencyFilter.value) return false;
      }

      return true;
    });
  }, [requests, searchTerm, statusFilter, typeFilter, urgencyFilter]);

  // Reset pagination saat filter berubah
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter, typeFilter, urgencyFilter]);

  const hasActiveFilters = Boolean(
    searchTerm ||
    (statusFilter && statusFilter.value !== "ALL") ||
    (typeFilter && typeFilter.value !== "ALL") ||
    (urgencyFilter && urgencyFilter.value !== "ALL")
  );

  const handleResetFilters = () => {
    setSearchTerm("");
    setStatusFilter(null);
    setTypeFilter(null);
    setUrgencyFilter(null);
  };

  // Pagination slice
  const totalPages = Math.max(1, Math.ceil(filteredRequests.length / itemsPerPage));
  const currentRequests = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredRequests.slice(start, start + itemsPerPage);
  }, [filteredRequests, currentPage, itemsPerPage]);

  // --- GSAP MOTION TRANSITION ---
  useGSAP(
    () => {
      const tl = gsap.timeline({ defaults: { ease: "power2.out" } });

      if (view === "list") {
        tl.from(".req-header", {
          y: -10,
          opacity: 0,
          duration: 0.35,
          clearProps: "all",
        })
          .from(
            ".req-kpi-card",
            {
              y: 14,
              opacity: 0,
              duration: 0.3,
              stagger: 0.06,
              clearProps: "all",
            },
            "-=0.15"
          )
          .from(
            ".req-filter-box",
            {
              y: 10,
              opacity: 0,
              duration: 0.25,
              clearProps: "all",
            },
            "-=0.1"
          )
          .from(
            ".req-table-box",
            {
              y: 12,
              opacity: 0,
              duration: 0.3,
              clearProps: "all",
            },
            "-=0.1"
          );
      } else {
        tl.from(".req-add-header", {
          y: -10,
          opacity: 0,
          duration: 0.35,
          clearProps: "all",
        })
          .from(
            ".req-form-left",
            {
              x: -16,
              opacity: 0,
              duration: 0.35,
              clearProps: "all",
            },
            "-=0.15"
          )
          .from(
            ".req-form-right",
            {
              x: 16,
              opacity: 0,
              duration: 0.35,
              clearProps: "all",
            },
            "-=0.25"
          );
      }
    },
    { dependencies: [view], scope: containerRef, revertOnUpdate: true }
  );

  // --- HANDLER SUBMIT REQUEST BARU ---
  const handleSubmitRequest = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedPosition) {
      showErrorToast("Silakan pilih posisi jabatan yang diajukan");
      return;
    }

    const userStr = localStorage.getItem("user");
    const user = userStr ? JSON.parse(userStr) : {};
    const requesterId = user.karyawan_id || user.id;

    if (!requesterId) {
      showErrorToast("Sesi akun tidak valid: data identitas karyawan tidak ditemukan");
      return;
    }

    setIsSubmitting(true);
    const body = {
      requester_id: requesterId,
      job_id: selectedPosition.value,
      quantity: Math.max(1, quantity),
      type: requestType,
      urgency,
      mbti_results: topMbtiResults.map((r) => r.type),
    };

    try {
      const res = await fetch(`${baseUrl}/employee-requests`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || "Gagal menyimpan pengajuan kebutuhan pegawai");
      }

      showSuccessToast("Pengajuan kebutuhan pegawai berhasil dikirim ke Human Capital");
      setView("list");
      setSelectedPosition(null);
      setQuantity(1);
      setUrgency("Sedang");
      setSelectedTraits([]);
      fetchData();
    } catch (err: unknown) {
      console.error(err);
      const msg = err instanceof Error ? err.message : "Terjadi kesalahan sistem";
      showErrorToast(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- HANDLER AKSI APPROVE / REJECT HC ---
  const handleActionHC = async (status: "Disetujui" | "Ditolak") => {
    if (!selectedRequest) return;

    if (status === "Disetujui" && !lowonganTitle.trim()) {
      showErrorToast("Judul posting lowongan wajib diisi");
      return;
    }

    setIsActionLoading(true);
    const body: Record<string, unknown> = { status };

    if (status === "Disetujui") {
      body.title = lowonganTitle.trim();
      body.closing_date = lowonganClosingDate || null;
      body.opening_status = lowonganStatus;
    }

    try {
      const res = await fetch(`${baseUrl}/employee-requests/${selectedRequest.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.message || `Gagal ${status.toLowerCase()} pengajuan`);
      }

      setIsApproveModalOpen(false);
      setIsRejectModalOpen(false);
      setIsDetailModalOpen(false);

      if (status === "Disetujui") {
        showSuccessToast("Pengajuan disetujui & lowongan kerja berhasil diterbitkan");
      } else {
        showSuccessToast("Pengajuan kebutuhan pegawai telah ditolak");
      }

      fetchData();
    } catch (err: unknown) {
      console.error(err);
      const msg = err instanceof Error ? err.message : "Gagal memproses aksi";
      showErrorToast(msg);
    } finally {
      setIsActionLoading(false);
    }
  };

  // Buka dialog setujui
  const handleOpenApproveModal = (req: EmployeeRequest) => {
    setSelectedRequest(req);
    setLowonganTitle(req.position || "");
    setLowonganClosingDate("");
    setLowonganStatus("Published");
    setIsApproveModalOpen(true);
  };

  // Buka dialog tolak dengan konfirmasi SweetAlert2
  const handlePromptReject = (req: EmployeeRequest) => {
    setSelectedRequest(req);
    Swal.fire({
      title: "Tolak Pengajuan Pegawai?",
      text: `Apakah Anda yakin ingin menolak pengajuan untuk posisi ${req.position || "ini"}?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#e11d48",
      cancelButtonColor: "#64748b",
      confirmButtonText: "Ya, Tolak Pengajuan",
      cancelButtonText: "Batal",
      reverseButtons: true,
    }).then((result) => {
      if (result.isConfirmed) {
        handleActionHC("Ditolak");
      }
    });
  };

  // ==========================================
  // RENDER: VIEW FORM TAMBAH REQUEST
  // ==========================================
  if (view === "add") {
    return (
      <div ref={containerRef} className="p-8 font-sans min-h-screen space-y-6 max-w-full mx-auto">
        {/* Layer 1: Header Halaman */}
        <div className="req-add-header flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-2 border-b border-slate-200/80">
          <div>
            <button
              onClick={() => setView("list")}
              className="inline-flex items-center gap-1.5 text-slate-500 hover:text-primary font-bold text-xs uppercase tracking-wider mb-2 transition-colors cursor-pointer"
            >
              <ChevronLeft size={16} />
              <span>Kembali ke Direktori Request</span>
            </button>
            <div className="flex items-center gap-2 mb-1 text-primary font-bold uppercase tracking-wider text-xs">
              <Sparkles size={15} />
              <span>Formulir Kebutuhan Tenaga Kerja Unit</span>
            </div>
            <h1 className="text-3xl font-bold text-primary-dark tracking-tight">
              Buat Request Pegawai Baru
            </h1>
            <p className="text-slate-500 font-medium text-sm mt-1 max-w-2xl">
              Tentukan formasi kebutuhan pegawai unit kerja beserta profil kepribadian MBTI yang ideal untuk posisi terkait.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setView("list")}
              disabled={isSubmitting}
              className="inline-flex items-center justify-center px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 font-bold text-xs uppercase tracking-wider min-h-[44px] transition-all"
            >
              Batal
            </button>
            <button
              type="button"
              onClick={handleSubmitRequest}
              disabled={isSubmitting || !selectedPosition}
              className="inline-flex items-center gap-2 bg-primary hover:bg-primary-dark disabled:opacity-50 text-white font-bold py-2.5 px-6 rounded-xl shadow-xs transition-all active:scale-[0.98] text-xs uppercase tracking-wider min-h-[44px] cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  <span>Menyimpan...</span>
                </>
              ) : (
                <>
                  <Send size={16} />
                  <span>Kirim Pengajuan</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* 2-Kolom Responsive: Spesifikasi SDM vs MBTI Intelligence */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Kolom Kiri: Form Spesifikasi Kebutuhan (5 Kolom) */}
          <div className="lg:col-span-5 space-y-6 req-form-left">
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2 text-primary font-bold uppercase tracking-wider text-xs">
                  <Briefcase size={16} />
                  <span>Spesifikasi Formasi Jabatan</span>
                </div>
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Bagian 1/2
                </span>
              </div>

              {/* Kategori Request */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Kategori Pengajuan <span className="text-rose-500">*</span>
                </label>
                <div className="grid grid-cols-2 gap-2 bg-slate-100/80 p-1.5 rounded-xl border border-slate-200/80">
                  <button
                    type="button"
                    onClick={() => setRequestType("penambahan")}
                    className={`py-2 px-3 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
                      requestType === "penambahan"
                        ? "bg-white text-primary shadow-xs font-black"
                        : "text-slate-500 hover:text-slate-800"
                    }`}
                  >
                    Penambahan Formasi
                  </button>
                  <button
                    type="button"
                    onClick={() => setRequestType("pergantian")}
                    className={`py-2 px-3 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
                      requestType === "pergantian"
                        ? "bg-white text-primary shadow-xs font-black"
                        : "text-slate-500 hover:text-slate-800"
                    }`}
                  >
                    Pergantian Pegawai
                  </button>
                </div>
                <p className="text-[11px] text-slate-400 font-medium">
                  {requestType === "penambahan"
                    ? "Formasi baru untuk perluasan kapasitas layanan unit."
                    : "Mengisi kekosongan staf karena mutasi, promosi, atau resign."}
                </p>
              </div>

              {/* Posisi Jabatan */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Posisi yang Dibutuhkan <span className="text-rose-500">*</span>
                </label>
                <SearchableSelect
                  options={jobList.map((j) => ({
                    value: j.id,
                    label: j.nama_job,
                  }))}
                  value={selectedPosition}
                  onChange={(val) => setSelectedPosition(val as FormOption | null)}
                  placeholder="Pilih master jabatan RS Avisena..."
                />
              </div>

              {/* Kuantitas & Prioritas Grid */}
              <div className="grid grid-cols-2 gap-4">
                {/* Stepper Kuantitas */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Jumlah Orang <span className="text-rose-500">*</span>
                  </label>
                  <div className="flex items-center bg-slate-50/80 border border-slate-200/90 rounded-xl overflow-hidden h-[38px] px-1">
                    <button
                      type="button"
                      onClick={() => setQuantity((prev) => Math.max(1, prev - 1))}
                      disabled={quantity <= 1}
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-600 hover:bg-slate-200/60 disabled:opacity-40 transition-colors"
                    >
                      <Minus size={14} />
                    </button>
                    <input
                      type="text"
                      readOnly
                      value={quantity}
                      className="w-full text-center bg-transparent font-mono tabular-nums font-bold text-sm text-slate-800 outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setQuantity((prev) => prev + 1)}
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-600 hover:bg-slate-200/60 transition-colors"
                    >
                      <Plus size={14} />
                    </button>
                  </div>
                </div>

                {/* Prioritas / Urgensi */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Tingkat Urgensi
                  </label>
                  <div className="grid grid-cols-3 gap-1 bg-slate-100/80 p-1 rounded-xl border border-slate-200/80 h-[38px] items-center">
                    {(["Rendah", "Sedang", "Tinggi"] as const).map((lvl) => (
                      <button
                        key={lvl}
                        type="button"
                        onClick={() => setUrgency(lvl)}
                        className={`h-7 rounded-lg text-[10px] font-bold uppercase transition-all flex items-center justify-center ${
                          urgency === lvl
                            ? lvl === "Tinggi"
                              ? "bg-rose-600 text-white shadow-2xs"
                              : lvl === "Sedang"
                              ? "bg-amber-500 text-white shadow-2xs"
                              : "bg-primary text-white shadow-2xs"
                            : "text-slate-500 hover:text-slate-800"
                        }`}
                      >
                        {lvl}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Live Card MBTI Benchmark Top 3 */}
            <div className="rounded-2xl border border-primary-dark/20 bg-gradient-to-br from-primary-dark via-[#0a3854] to-primary p-6 text-white shadow-xs relative overflow-hidden">
              <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-4">
                <div className="flex items-center gap-2">
                  <Trophy size={18} className="text-amber-300" />
                  <h3 className="text-xs font-bold uppercase tracking-wider text-white">
                    Rekomendasi MBTI Top 3
                  </h3>
                </div>
                <span className="text-[10px] font-mono tabular-nums font-bold px-2 py-0.5 rounded-full bg-white/15 text-white">
                  {selectedTraits.length} Karakteristik
                </span>
              </div>

              {topMbtiResults.length > 0 ? (
                <div className="space-y-3">
                  {topMbtiResults.map((item, idx) => (
                    <div
                      key={item.type}
                      className={`p-3 rounded-xl border transition-all ${
                        idx === 0
                          ? "bg-white/15 border-white/30 shadow-xs"
                          : "bg-white/5 border-white/10"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-2.5">
                          <div
                            className={`w-6 h-6 rounded-lg flex items-center justify-center font-bold text-xs ${
                              idx === 0
                                ? "bg-amber-400 text-slate-900"
                                : "bg-white/10 text-white/80"
                            }`}
                          >
                            {idx === 0 ? <Medal size={14} /> : idx + 1}
                          </div>
                          <span className="font-mono tabular-nums font-black text-sm tracking-wide text-white">
                            {item.type}
                          </span>
                        </div>
                        <span className="font-mono tabular-nums font-bold text-xs text-amber-300">
                          {item.percentage}% Cocok
                        </span>
                      </div>
                      {/* DaisyUI Progress */}
                      <progress
                        className="progress progress-primary w-full h-1.5 bg-white/20"
                        value={item.percentage}
                        max="100"
                      ></progress>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-6 text-center text-white/50 space-y-2">
                  <Target size={24} className="mx-auto opacity-50" />
                  <p className="text-xs font-medium max-w-xs mx-auto">
                    Pilih karakteristik perilaku di samping untuk mengkalkulasi benchmark kepribadian ideal secara real-time.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Kolom Kanan: Karakteristik Perilaku Psikometri MBTI (7 Kolom) */}
          <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 space-y-6 req-form-right">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <div className="flex items-center gap-2 text-primary font-bold uppercase tracking-wider text-xs">
                  <Target size={16} />
                  <span>Karakteristik &amp; Perilaku Kerja Ideal</span>
                </div>
                <p className="text-xs text-slate-500 font-medium mt-0.5">
                  Centang sifat kerja yang paling relevan dengan tuntutan operasional unit.
                </p>
              </div>
              {selectedTraits.length > 0 && (
                <button
                  type="button"
                  onClick={() => setSelectedTraits([])}
                  className="text-xs font-bold text-rose-500 hover:text-rose-700 transition-colors"
                >
                  Reset Pilihan
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {Object.entries(MBTI_CATEGORIZED_OPTIONS).map(([categoryKey, category]) => (
                <div
                  key={categoryKey}
                  className="p-4 rounded-xl border border-slate-200/90 bg-slate-50/50 space-y-3"
                >
                  <div>
                    <h4 className="text-xs font-bold text-primary-dark uppercase tracking-wider">
                      {category.title}
                    </h4>
                    <p className="text-[11px] font-semibold text-slate-400 mt-0.5">
                      {category.subtitle}
                    </p>
                  </div>

                  <div className="space-y-1.5">
                    {category.options.map((opt) => {
                      const isSelected = selectedTraits.some((t) => t.value === opt.value);
                      return (
                        <div
                          key={opt.value}
                          onClick={() => handleToggleTrait(opt)}
                          className={`flex items-center gap-2.5 p-2 rounded-lg cursor-pointer border text-xs font-semibold transition-all ${
                            isSelected
                              ? "bg-white border-primary text-primary shadow-xs"
                              : "bg-white/60 border-slate-200/70 text-slate-600 hover:bg-white hover:border-slate-300"
                          }`}
                        >
                          <div
                            className={`w-4 h-4 rounded flex items-center justify-center shrink-0 border transition-all ${
                              isSelected
                                ? "bg-primary border-primary text-white"
                                : "border-slate-300 bg-white"
                            }`}
                          >
                            {isSelected && <Check size={12} strokeWidth={3} />}
                          </div>
                          <span className="flex-1 select-none">{opt.label}</span>
                          <span
                            className={`text-[9px] font-mono tabular-nums font-bold px-1.5 py-0.5 rounded ${
                              isSelected
                                ? "bg-primary/10 text-primary"
                                : "bg-slate-100 text-slate-400"
                            }`}
                          >
                            {opt.type}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            <div className="p-4 rounded-xl bg-blue-50/70 border border-blue-200/60 flex items-start gap-3">
              <Info size={18} className="text-primary shrink-0 mt-0.5" />
              <p className="text-xs text-slate-600 leading-relaxed font-medium">
                Hasil MBTI Benchmark dihitung berdasarkan pembobotan 4 dimensi psikometri standar RSU Avisena. Data ini akan menjadi acuan bagi tim Human Capital saat menguji kandidat dalam proses rekrutmen.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // RENDER: VIEW LIST DIREKTORI REQUEST
  // ==========================================
  return (
    <div ref={containerRef} className="p-8 font-sans min-h-screen space-y-6 max-w-full mx-auto">
      {/* Layer 1: Header Halaman */}
      <div className="req-header flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-2 border-b border-slate-200/80">
        <div>
          <div className="flex items-center gap-2 mb-1 text-primary font-bold uppercase tracking-wider text-xs">
            <Users size={15} />
            <span>Perencanaan SDM &amp; Rekrutmen Tenaga Kerja</span>
          </div>
          <h1 className="text-3xl font-bold text-primary-dark tracking-tight">
            Manajemen Request Pegawai
          </h1>
          <p className="text-slate-500 font-medium text-sm mt-1 max-w-2xl">
            Kelola pengajuan formasi tenaga kerja unit kerja, verifikasi kebutuhan jabatan, dan sinkronisasi penerbitan lowongan resmi RSU Avisena.
          </p>
        </div>

        <button
          onClick={() => {
            setSelectedPosition(null);
            setQuantity(1);
            setUrgency("Sedang");
            setSelectedTraits([]);
            setView("add");
          }}
          className="inline-flex items-center gap-2 bg-primary hover:bg-primary-dark text-white font-bold py-2.5 px-5 rounded-xl shadow-xs transition-all active:scale-[0.98] text-xs uppercase tracking-wider min-h-[44px] cursor-pointer"
        >
          <PlusCircle size={16} />
          <span>Buat Request Baru</span>
        </button>
      </div>

      {/* Layer 2: KPI / Summary Ribbon (Horizontal 4-Grid) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Total Pengajuan */}
        <div className="req-kpi-card bg-white border border-slate-200/90 rounded-xl p-3.5 shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Total Pengajuan
            </p>
            <p className="text-xl font-black text-slate-800 font-mono tabular-nums mt-0.5">
              {stats.total}{" "}
              <span className="text-xs font-semibold text-slate-400 font-sans">Permintaan</span>
            </p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#0173b6] flex items-center justify-center font-bold">
            <Layers size={20} />
          </div>
        </div>

        {/* Menunggu Persetujuan */}
        <div className="req-kpi-card bg-white border border-slate-200/90 rounded-xl p-3.5 shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-amber-500">
              Menunggu Review
            </p>
            <p className="text-xl font-black text-amber-600 font-mono tabular-nums mt-0.5">
              {stats.pending}{" "}
              <span className="text-xs font-semibold text-slate-400 font-sans">Menunggu</span>
            </p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
            <Clock size={20} />
          </div>
        </div>

        {/* Disetujui / Terbit */}
        <div className="req-kpi-card bg-white border border-slate-200/90 rounded-xl p-3.5 shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-600">
              Disetujui / Terbit
            </p>
            <p className="text-xl font-black text-emerald-600 font-mono tabular-nums mt-0.5">
              {stats.approved}{" "}
              <span className="text-xs font-semibold text-slate-400 font-sans">Lowongan</span>
            </p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            <CheckCircle2 size={20} />
          </div>
        </div>

        {/* Ditolak */}
        <div className="req-kpi-card bg-white border border-slate-200/90 rounded-xl p-3.5 shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-rose-500">
              Ditolak
            </p>
            <p className="text-xl font-black text-rose-600 font-mono tabular-nums mt-0.5">
              {stats.rejected}{" "}
              <span className="text-xs font-semibold text-slate-400 font-sans">Ditolak</span>
            </p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold">
            <Ban size={20} />
          </div>
        </div>
      </div>

      {/* Layer 3: Kontainer Filter & Pencarian */}
      <div className="req-filter-box bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
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
              placeholder="Cari posisi, departemen, atau pemohon..."
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
              options={TYPE_FILTER_OPTIONS}
              value={typeFilter}
              onChange={(val) => setTypeFilter(val as FormOption | null)}
              placeholder="Semua Kategori"
            />
          </div>

          {/* Filter Urgensi */}
          <div>
            <SearchableSelect
              options={URGENCY_FILTER_OPTIONS}
              value={urgencyFilter}
              onChange={(val) => setUrgencyFilter(val as FormOption | null)}
              placeholder="Semua Prioritas"
            />
          </div>
        </div>
      </div>

      {/* Layer 4: Baris Judul Tabel */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-primary-dark">
          Daftar Pengajuan Kebutuhan Pegawai
        </h2>
        <span className="text-xs font-semibold text-slate-500">
          Total <strong className="font-mono tabular-nums text-slate-800">{filteredRequests.length}</strong> pengajuan
        </span>
      </div>

      {/* Layer 5: Tabel Data Eksekutif */}
      <div className="req-table-box overflow-hidden rounded-2xl border border-slate-200/80 shadow-xs bg-white">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs whitespace-nowrap">
            <thead className="text-xs text-white uppercase bg-primary-dark font-semibold">
              <tr>
                <th scope="col" className="px-6 py-3.5 text-white">Posisi Jabatan</th>
                <th scope="col" className="px-6 py-3.5 text-white">Unit &amp; Pemohon</th>
                <th scope="col" className="px-6 py-3.5 text-white">Kategori &amp; Kuota</th>
                <th scope="col" className="px-6 py-3.5 text-white">Prioritas</th>
                <th scope="col" className="px-6 py-3.5 text-white">Tanggal Pengajuan</th>
                <th scope="col" className="px-6 py-3.5 text-white">Status</th>
                <th scope="col" className="px-6 py-3.5 text-center text-white">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-16 text-center">
                    <Loader2 className="animate-spin text-primary mx-auto mb-2" size={28} />
                    <p className="text-xs font-semibold text-slate-500">Memuat data permintaan pegawai...</p>
                  </td>
                </tr>
              ) : currentRequests.length > 0 ? (
                currentRequests.map((req) => (
                  <tr key={req.id} className="hover:bg-slate-50/80 transition-colors">
                    {/* Posisi & Avatar */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-blue-50 text-primary font-bold text-xs border border-blue-200/60 flex items-center justify-center shrink-0 shadow-xs">
                          {getInitials(req.position)}
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold text-slate-900 text-sm">{req.position || "Belum Ditentukan"}</p>
                          <p className="text-xs text-slate-500 font-medium mt-0.5">
                            Level: {req.level || "-"}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Unit & Pemohon */}
                    <td className="px-6 py-4">
                      <p className="font-semibold text-slate-800">{req.department || "-"}</p>
                      <p className="text-xs text-slate-500 font-medium mt-0.5">
                        Pemohon: <span className="font-semibold text-slate-700">{req.requester || "-"}</span>
                      </p>
                    </td>

                    {/* Kategori & Kuota */}
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 text-[10px] font-bold uppercase rounded-md ${
                            req.type === "penambahan"
                              ? "bg-blue-100 text-blue-800 border border-blue-200"
                              : "bg-purple-100 text-purple-800 border border-purple-200"
                          }`}
                        >
                          {req.type === "penambahan" ? "Penambahan" : "Pergantian"}
                        </span>
                        <p className="text-xs font-mono tabular-nums font-bold text-slate-700">
                          {req.quantity} <span className="font-sans font-medium text-slate-500">Orang</span>
                        </p>
                      </div>
                    </td>

                    {/* Prioritas / Urgensi */}
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-1 text-xs font-bold rounded-full ${
                          req.urgency === "Tinggi"
                            ? "bg-rose-100 text-rose-800 border border-rose-200"
                            : req.urgency === "Sedang"
                            ? "bg-amber-100 text-amber-800 border border-amber-200"
                            : "bg-blue-100 text-blue-800 border border-blue-200"
                        }`}
                      >
                        {req.urgency}
                      </span>
                    </td>

                    {/* Tanggal Request */}
                    <td className="px-6 py-4">
                      <span className="font-mono tabular-nums text-xs font-semibold text-slate-700">
                        {formatDateIndonesia(req.request_date)}
                      </span>
                    </td>

                    {/* Status */}
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-1 text-xs font-semibold rounded-full ${
                          req.status === "Disetujui"
                            ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                            : req.status === "Ditolak"
                            ? "bg-rose-100 text-rose-800 border border-rose-200"
                            : "bg-amber-100 text-amber-800 border border-amber-200"
                        }`}
                      >
                        {req.status}
                      </span>
                    </td>

                    {/* Aksi Cepat */}
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        {/* Tombol Detail Preview */}
                        <button
                          onClick={() => {
                            setSelectedRequest(req);
                            setIsDetailModalOpen(true);
                          }}
                          className="p-1.5 rounded-lg text-slate-600 hover:text-primary hover:bg-slate-100 transition-colors"
                          title="Lihat Detail & Benchmark MBTI"
                        >
                          <Eye size={16} />
                        </button>

                        {/* Jika Menunggu Persetujuan, tampilkan tombol Setujui & Tolak */}
                        {req.status === "Menunggu Persetujuan" && (
                          <>
                            <button
                              onClick={() => handleOpenApproveModal(req)}
                              className="p-1.5 rounded-lg text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 transition-colors"
                              title="Setujui & Terbitkan Lowongan"
                            >
                              <Check size={16} />
                            </button>
                            <button
                              onClick={() => handlePromptReject(req)}
                              className="p-1.5 rounded-lg text-rose-600 hover:text-rose-700 hover:bg-rose-50 transition-colors"
                              title="Tolak Pengajuan"
                            >
                              <Ban size={16} />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="px-6 py-14 text-center text-slate-400">
                    <FileText size={32} className="mx-auto mb-2 opacity-50" />
                    <p className="text-sm font-semibold">Tidak ada data permintaan pegawai</p>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {hasActiveFilters
                        ? "Coba sesuaikan kata kunci pencarian atau reset filter."
                        : "Klik tombol 'Buat Request Baru' di atas untuk mengajukan kebutuhan tenaga kerja."}
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
      {/* MODAL 1: DETAIL PENGUSAHAAN & BENCHMARK MBTI */}
      {/* ======================================================== */}
      <StandardModal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        title="Detail Pengajuan Kebutuhan Pegawai"
        subtitle={`ID: ${selectedRequest?.id || "-"}`}
        size="lg"
      >
        {selectedRequest && (
          <div className="space-y-6">
            {/* Kartu Profil Jabatan */}
            <div className="bg-slate-50/80 rounded-xl p-4 border border-slate-200/80 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-primary text-white font-bold flex items-center justify-center text-sm shadow-xs shrink-0">
                  {getInitials(selectedRequest.position)}
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base">{selectedRequest.position}</h3>
                  <p className="text-xs font-medium text-slate-500 mt-0.5">
                    {selectedRequest.department} &bull; Level {selectedRequest.level}
                  </p>
                </div>
              </div>
              <span
                className={`inline-flex items-center px-3 py-1 text-xs font-semibold rounded-full ${
                  selectedRequest.status === "Disetujui"
                    ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                    : selectedRequest.status === "Ditolak"
                    ? "bg-rose-100 text-rose-800 border border-rose-200"
                    : "bg-amber-100 text-amber-800 border border-amber-200"
                }`}
              >
                {selectedRequest.status}
              </span>
            </div>

            {/* Grid Atribut Kunci */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-white p-3 rounded-xl border border-slate-200/80">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Kategori</p>
                <p className="text-xs font-bold text-slate-800 mt-1 capitalize">
                  {selectedRequest.type === "penambahan" ? "Penambahan Formasi" : "Pergantian Pegawai"}
                </p>
              </div>
              <div className="bg-white p-3 rounded-xl border border-slate-200/80">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Kuantitas</p>
                <p className="text-xs font-bold text-slate-800 font-mono tabular-nums mt-1">
                  {selectedRequest.quantity} Orang
                </p>
              </div>
              <div className="bg-white p-3 rounded-xl border border-slate-200/80">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Urgensi</p>
                <p className="text-xs font-bold text-slate-800 mt-1">
                  {selectedRequest.urgency}
                </p>
              </div>
              <div className="bg-white p-3 rounded-xl border border-slate-200/80">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Diajukan</p>
                <p className="text-xs font-bold text-slate-800 font-mono tabular-nums mt-1">
                  {formatDateIndonesia(selectedRequest.request_date)}
                </p>
              </div>
            </div>

            {/* Pemohon */}
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/70 flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-500">Diajukan Oleh:</span>
              <span className="font-bold text-slate-800">{selectedRequest.requester || "-"}</span>
            </div>

            {/* Benchmark MBTI Results */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-primary font-bold uppercase tracking-wider text-xs">
                <Trophy size={16} />
                <span>Rekomendasi Karakter MBTI Ideal</span>
              </div>

              {selectedRequest.mbti_results && selectedRequest.mbti_results.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {selectedRequest.mbti_results.map((type, idx) => (
                    <div
                      key={type}
                      className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-blue-50 border border-blue-200/80 text-primary font-mono tabular-nums text-xs font-bold shadow-2xs"
                    >
                      <span className="w-5 h-5 rounded-md bg-primary text-white text-[10px] flex items-center justify-center font-bold">
                        #{idx + 1}
                      </span>
                      <span>{type}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-400 italic">
                  Tidak ada data benchmark MBTI khusus yang tersimpan pada pengajuan ini.
                </p>
              )}
            </div>

            {/* Footer Aksi */}
            <div className="pt-4 border-t border-slate-200 flex justify-end gap-2.5">
              <button
                onClick={() => setIsDetailModalOpen(false)}
                className="px-4 py-2 rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 font-bold text-xs uppercase tracking-wider transition-colors"
              >
                Tutup
              </button>
              {selectedRequest.status === "Menunggu Persetujuan" && (
                <>
                  <button
                    onClick={() => {
                      setIsDetailModalOpen(false);
                      handlePromptReject(selectedRequest);
                    }}
                    className="px-4 py-2 rounded-xl bg-rose-50 text-rose-600 hover:bg-rose-100 font-bold text-xs uppercase tracking-wider transition-colors"
                  >
                    Tolak
                  </button>
                  <button
                    onClick={() => {
                      setIsDetailModalOpen(false);
                      handleOpenApproveModal(selectedRequest);
                    }}
                    className="px-5 py-2 rounded-xl bg-primary hover:bg-primary-dark text-white font-bold text-xs uppercase tracking-wider shadow-xs transition-colors"
                  >
                    Setujui &amp; Terbitkan
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </StandardModal>

      {/* ======================================================== */}
      {/* MODAL 2: PERSETUJUAN HC & PENERBITAN LOWONGAN */}
      {/* ======================================================== */}
      <StandardModal
        isOpen={isApproveModalOpen}
        onClose={() => !isActionLoading && setIsApproveModalOpen(false)}
        title="Persetujuan HC & Penerbitan Lowongan"
        subtitle="Verifikasi formasi dan tentukan jadwal tayang lowongan kerja"
        size="md"
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleActionHC("Disetujui");
          }}
          className="space-y-5"
        >
          {/* Ringkasan Permintaan */}
          <div className="bg-blue-50/70 p-3.5 rounded-xl border border-blue-200/60 text-xs space-y-1">
            <p className="text-slate-500 font-semibold">Posisi yang Disetujui:</p>
            <p className="text-primary-dark font-bold text-sm">{selectedRequest?.position}</p>
            <p className="text-slate-500">
              Unit: <strong className="text-slate-700">{selectedRequest?.department}</strong> &bull; Kuota:{" "}
              <strong className="text-slate-700 font-mono tabular-nums">{selectedRequest?.quantity} Orang</strong>
            </p>
          </div>

          {/* Judul Lowongan */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Judul Posting Lowongan <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <input
                type="text"
                value={lowonganTitle}
                onChange={(e) => setLowonganTitle(e.target.value)}
                required
                placeholder="Misal: Perawat Pelaksana Rawat Inap"
                className="w-full h-[40px] pl-9 pr-3 bg-slate-50/80 border border-slate-200/90 rounded-xl text-xs font-semibold text-slate-800 focus:bg-white focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
              />
              <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
            </div>
          </div>

          {/* Batas Akhir Lamaran */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Batas Akhir Penerimaan Berkas
            </label>
            <div className="relative">
              <input
                type="date"
                value={lowonganClosingDate}
                onChange={(e) => setLowonganClosingDate(e.target.value)}
                className="w-full h-[40px] pl-9 pr-3 bg-slate-50/80 border border-slate-200/90 rounded-xl text-xs font-semibold font-mono tabular-nums text-slate-800 focus:bg-white focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
              />
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
            </div>
            <p className="text-[11px] text-slate-400">Kosongkan jika lowongan dibuka hingga kuota terpenuhi.</p>
          </div>

          {/* Status Lowongan */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Status Publikasi Lowongan
            </label>
            <div className="grid grid-cols-2 gap-2 bg-slate-100/80 p-1 rounded-xl border border-slate-200/80">
              <button
                type="button"
                onClick={() => setLowonganStatus("Published")}
                className={`py-2 px-3 rounded-lg text-xs font-bold uppercase transition-all ${
                  lowonganStatus === "Published"
                    ? "bg-emerald-600 text-white shadow-2xs font-black"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                Tayang Langsung (Published)
              </button>
              <button
                type="button"
                onClick={() => setLowonganStatus("Draft")}
                className={`py-2 px-3 rounded-lg text-xs font-bold uppercase transition-all ${
                  lowonganStatus === "Draft"
                    ? "bg-slate-700 text-white shadow-2xs font-black"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                Simpan Draft
              </button>
            </div>
          </div>

          {/* Footer Submit */}
          <div className="pt-4 border-t border-slate-200 flex justify-end gap-2.5">
            <button
              type="button"
              disabled={isActionLoading}
              onClick={() => setIsApproveModalOpen(false)}
              className="px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 font-bold text-xs uppercase tracking-wider transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isActionLoading}
              className="inline-flex items-center gap-2 bg-primary hover:bg-primary-dark text-white font-bold py-2.5 px-6 rounded-xl shadow-xs transition-all active:scale-[0.98] text-xs uppercase tracking-wider cursor-pointer"
            >
              {isActionLoading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  <span>Memproses...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 size={16} />
                  <span>Setujui &amp; Terbitkan</span>
                </>
              )}
            </button>
          </div>
        </form>
      </StandardModal>
    </div>
  );
}
