"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";

if (typeof window !== "undefined") {
  gsap.registerPlugin(useGSAP);
}
import {
  ClipboardCheck,
  PlusCircle,
  Search,
  Loader2,
  CheckCircle2,
  Clock,
  Send,
  Building2,
  Calendar,
  Eye,
  ChevronRight,
  Sparkles,
  Users,
  AlertTriangle,
  Target,
  Pencil,
  Trash2,
  UserPlus,
  UserMinus,
  X,
  Brain,
  ShieldCheck,
  RotateCcw,
  LayoutGrid,
  Table as TableIcon,
  Layers,
  ArrowRight,
  UserCheck,
} from "lucide-react";
import Swal from "sweetalert2";
import Modal from "@/app/components/modal";
import { showSuccessToast, showErrorToast } from "@/app/components/admin/Alert";
import PAPIResultView from "@/app/components/admin/PAPIResultView";
import CFITResultView from "@/app/components/admin/CFITResultView";
import { getDISCProfileDetail } from "@/app/utils/discUtils";
import { getMBTIProfileDetail } from "@/app/utils/mbtiUtils";
import BatchFilterDropdown from "./components/BatchFilterDropdown";

interface Karyawan {
  id: string;
  nip: string;
  nama_lengkap: string;
  email: string;
  status_kepegawaian: string;
  nama_departemen?: string;
  nama_jabatan?: string;
}

interface AssessmentItem {
  id: string;
  batch_id?: string;
  karyawan_id: string;
  nip: string;
  nama_lengkap: string;
  email: string;
  status_kepegawaian: string;
  nama_departemen?: string;
  nama_jabatan?: string;
  batch_name: string;
  token: string;
  access_code: string;
  status: string;
  scheduled_date: string;
  valid_from?: string;
  expires_at?: string;
  created_at: string;
  has_mbti: boolean;
  has_disc: boolean;
  has_papi: boolean;
  has_cfit?: boolean;
}

interface BatchSummary {
  id: string;
  batch_name: string;
  description?: string;
  created_at: string;
  updated_at?: string;
  scheduled_date: string;
  valid_from?: string;
  expires_at?: string;
  total_karyawan: number;
  total_completed: number;
  total_ongoing: number;
  total_invited: number;
  karyawan_list: AssessmentItem[];
}

export default function KaryawanTestPage() {
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [assessmentData, setAssessmentData] = useState<AssessmentItem[]>([]);
  const [batches, setBatches] = useState<BatchSummary[]>([]);
  const [employees, setEmployees] = useState<Karyawan[]>([]);

  // View & Filtering states
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedBatchFilter, setSelectedBatchFilter] = useState("all");
  const [activeTab, setActiveTab] = useState<"batches" | "assessments">("batches");
  const [batchViewMode, setBatchViewMode] = useState<"table" | "grid">("table");

  const containerRef = useRef<HTMLDivElement>(null);

  // Modal State: Create Batch
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [batchNameInput, setBatchNameInput] = useState("");
  const [scheduledDateInput, setScheduledDateInput] = useState(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split("T")[0];
  });
  const [selectedEmployeeIds, setSelectedEmployeeIds] = useState<string[]>([]);
  const [employeeSearch, setEmployeeSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Modal State: Edit Batch
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingBatch, setEditingBatch] = useState<BatchSummary | null>(null);
  const [editBatchName, setEditBatchName] = useState("");
  const [editScheduledDate, setEditScheduledDate] = useState("");
  const [karyawanToRemove, setKaryawanToRemove] = useState<string[]>([]);
  const [karyawanToAdd, setKaryawanToAdd] = useState<string[]>([]);
  const [editEmployeeSearch, setEditEmployeeSearch] = useState("");
  const [editStatusFilter, setEditStatusFilter] = useState("all");
  const [editSubTab, setEditSubTab] = useState<"info" | "participants" | "add">("info");
  const [participantSearch, setParticipantSearch] = useState("");

  // Modal State: Detail Result
  const [isResultModalOpen, setIsResultModalOpen] = useState(false);
  const [loadingResult, setLoadingResult] = useState(false);
  const [selectedResultData, setSelectedResultData] = useState<any>(null);

  // Load Data
  const fetchData = async () => {
    setLoading(true);
    try {
      const [batchRes, empRes] = await Promise.all([
        fetch("/api/karyawan-test/batch?t=" + Date.now(), {
          cache: "no-store",
          headers: { "Cache-Control": "no-cache" },
        }),
        fetch("/api/karyawan?t=" + Date.now(), {
          cache: "no-store",
          headers: { "Cache-Control": "no-cache" },
        }),
      ]);

      if (batchRes.ok) {
        const bJson = await batchRes.json();
        if (bJson.success) {
          setAssessmentData(bJson.data || []);
          setBatches(bJson.batches || []);
        }
      }

      if (empRes.ok) {
        const eJson = await empRes.json();
        setEmployees(Array.isArray(eJson) ? eJson : []);
      }
    } catch (err) {
      console.error("Gagal memuat data tes karyawan:", err);
      showErrorToast("Gagal memuat data dari server.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Filtered Karyawan untuk Modal Buat Batch
  const filteredEmployeesForModal = useMemo(() => {
    return employees.filter((emp) => {
      const matchesSearch =
        emp.nama_lengkap.toLowerCase().includes(employeeSearch.toLowerCase()) ||
        emp.nip.toLowerCase().includes(employeeSearch.toLowerCase()) ||
        (emp.email && emp.email.toLowerCase().includes(employeeSearch.toLowerCase()));

      const matchesStatus =
        statusFilter === "all" ||
        (emp.status_kepegawaian &&
          emp.status_kepegawaian.toLowerCase().includes(statusFilter.toLowerCase()));

      return matchesSearch && matchesStatus;
    });
  }, [employees, employeeSearch, statusFilter]);

  // Toggle Selection Karyawan
  const handleToggleSelectEmployee = (id: string) => {
    setSelectedEmployeeIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleSelectAllFiltered = () => {
    const filteredIds = filteredEmployeesForModal.map((e) => e.id);
    const allSelected = filteredIds.every((id) => selectedEmployeeIds.includes(id));
    if (allSelected) {
      setSelectedEmployeeIds((prev) => prev.filter((id) => !filteredIds.includes(id)));
    } else {
      setSelectedEmployeeIds((prev) => Array.from(new Set([...prev, ...filteredIds])));
    }
  };

  // Submit Create Batch
  const handleCreateBatch = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!batchNameInput.trim()) {
      showErrorToast("Nama Batch Ujian wajib diisi.");
      return;
    }
    if (selectedEmployeeIds.length === 0) {
      showErrorToast("Pilih minimal 1 karyawan untuk diikutsertakan dalam batch.");
      return;
    }
    if (!scheduledDateInput) {
      showErrorToast("Tanggal pelaksanaan tes wajib diisi.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/karyawan-test/batch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          batch_name: batchNameInput.trim(),
          karyawan_ids: selectedEmployeeIds,
          scheduled_date: scheduledDateInput,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        showSuccessToast(data.message || "Batch tes karyawan berhasil dibuat!");
        setIsCreateModalOpen(false);
        setBatchNameInput("");
        setSelectedEmployeeIds([]);
        fetchData();
      } else {
        showErrorToast(data.message || "Gagal membuat batch tes.");
      }
    } catch (err: any) {
      console.error("Submit Batch Error:", err);
      showErrorToast("Terjadi kesalahan koneksi server.");
    } finally {
      setSubmitting(false);
    }
  };

  // Open Edit Batch Modal
  const handleOpenEditModal = (batch: BatchSummary) => {
    setEditingBatch(batch);
    setEditBatchName(batch.batch_name);
    try {
      const d = new Date(batch.scheduled_date);
      setEditScheduledDate(d.toISOString().split("T")[0]);
    } catch {
      setEditScheduledDate("");
    }
    setKaryawanToRemove([]);
    setKaryawanToAdd([]);
    setEditEmployeeSearch("");
    setEditStatusFilter("all");
    setParticipantSearch("");
    setEditSubTab("info");
    setIsEditModalOpen(true);
  };

  // Submit Update Batch
  const handleUpdateBatch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBatch) return;

    if (!editBatchName.trim()) {
      showErrorToast("Nama Batch Ujian wajib diisi.");
      return;
    }
    if (!editScheduledDate) {
      showErrorToast("Tanggal pelaksanaan tes wajib diisi.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/karyawan-test/batch", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          batch_id: editingBatch.id,
          batch_name: editBatchName.trim(),
          scheduled_date: editScheduledDate,
          remove_karyawan_ids: karyawanToRemove,
          add_karyawan_ids: karyawanToAdd,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        showSuccessToast(data.message || "Batch berhasil diperbarui!");
        setIsEditModalOpen(false);
        setEditingBatch(null);
        fetchData();
      } else {
        showErrorToast(data.message || "Gagal memperbarui batch.");
      }
    } catch (err: any) {
      console.error("Update Batch Error:", err);
      showErrorToast("Terjadi kesalahan koneksi server.");
    } finally {
      setSubmitting(false);
    }
  };

  // Delete Entire Batch
  const handleDeleteBatch = async (batch: BatchSummary) => {
    const res = await Swal.fire({
      title: "Hapus Batch?",
      html: `Apakah Anda yakin ingin menghapus batch <b>"${batch.batch_name}"</b>?<br/><br/><span style="color: #ef4444; font-size: 12px;">Seluruh jadwal tes dan hasil psikometri (${batch.total_karyawan} karyawan) dalam batch ini akan ikut dihapus permanen.</span>`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#64748b",
      confirmButtonText: "Ya, Hapus Batch",
      cancelButtonText: "Batal",
    });

    if (res.isConfirmed) {
      try {
        const delRes = await fetch(`/api/karyawan-test/batch?batch_id=${batch.id}`, {
          method: "DELETE",
        });
        const data = await delRes.json();
        if (delRes.ok && data.success) {
          showSuccessToast(data.message || "Batch berhasil dihapus!");
          if (selectedBatchFilter === batch.id) {
            setSelectedBatchFilter("all");
          }
          fetchData();
        } else {
          showErrorToast(data.message || "Gagal menghapus batch.");
        }
      } catch (err: any) {
        console.error("Delete Batch Error:", err);
        showErrorToast("Terjadi kesalahan koneksi server.");
      }
    }
  };

  // Delete Individual Participant from Batch
  const handleDeleteParticipant = async (item: AssessmentItem) => {
    const res = await Swal.fire({
      title: "Keluarkan Peserta?",
      html: `Keluarkan <b>${item.nama_lengkap}</b> (${item.nip}) dari batch <b>"${item.batch_name}"</b>?<br/><br/><span style="color: #ef4444; font-size: 12px;">Data penugasan dan hasil tes peserta ini akan dihapus.</span>`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#64748b",
      confirmButtonText: "Ya, Keluarkan",
      cancelButtonText: "Batal",
    });

    if (res.isConfirmed) {
      try {
        const delRes = await fetch(`/api/karyawan-test/batch?assessment_id=${item.id}`, {
          method: "DELETE",
        });
        const data = await delRes.json();
        if (delRes.ok && data.success) {
          showSuccessToast(data.message || "Peserta berhasil dikeluarkan!");
          fetchData();
        } else {
          showErrorToast(data.message || "Gagal mengeluarkan peserta.");
        }
      } catch (err: any) {
        console.error("Delete Participant Error:", err);
        showErrorToast("Terjadi kesalahan koneksi server.");
      }
    }
  };

  // Toggle remove participant in edit modal
  const handleToggleRemoveKaryawan = (karyawanId: string) => {
    setKaryawanToRemove((prev) =>
      prev.includes(karyawanId)
        ? prev.filter((id) => id !== karyawanId)
        : [...prev, karyawanId]
    );
  };

  // Toggle add new participant in edit modal
  const handleToggleAddKaryawan = (id: string) => {
    setKaryawanToAdd((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // Current batch participant IDs
  const currentBatchEmployeeIds = useMemo(() => {
    if (!editingBatch) return new Set<string>();
    return new Set(editingBatch.karyawan_list.map((k) => k.karyawan_id));
  }, [editingBatch]);

  // Available employees to add to the edited batch
  const availableEmployeesForEdit = useMemo(() => {
    return employees.filter((emp) => {
      const isInBatch = currentBatchEmployeeIds.has(emp.id) && !karyawanToRemove.includes(emp.id);
      if (isInBatch) return false;

      const matchesSearch =
        emp.nama_lengkap.toLowerCase().includes(editEmployeeSearch.toLowerCase()) ||
        emp.nip.toLowerCase().includes(editEmployeeSearch.toLowerCase()) ||
        (emp.email && emp.email.toLowerCase().includes(editEmployeeSearch.toLowerCase()));

      const matchesStatus =
        editStatusFilter === "all" ||
        (emp.status_kepegawaian &&
          emp.status_kepegawaian.toLowerCase().includes(editStatusFilter.toLowerCase()));

      return matchesSearch && matchesStatus;
    });
  }, [employees, currentBatchEmployeeIds, karyawanToRemove, editEmployeeSearch, editStatusFilter]);

  const handleSelectAllAvailableForEdit = () => {
    const availableIds = availableEmployeesForEdit.map((e) => e.id);
    const allSelected = availableIds.every((id) => karyawanToAdd.includes(id));
    if (allSelected) {
      setKaryawanToAdd((prev) => prev.filter((id) => !availableIds.includes(id)));
    } else {
      setKaryawanToAdd((prev) => Array.from(new Set([...prev, ...availableIds])));
    }
  };

  // View Result Detail
  const handleViewResult = async (assessmentId: string) => {
    setIsResultModalOpen(true);
    setLoadingResult(true);
    setSelectedResultData(null);

    try {
      const res = await fetch(`/api/karyawan-test/results?assessment_id=${assessmentId}`);
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setSelectedResultData(data);
        }
      }
    } catch (err) {
      console.error("Fetch Result Detail Error:", err);
      showErrorToast("Gagal memuat detail hasil psikometri.");
    } finally {
      setLoadingResult(false);
    }
  };

  // Filtered Batches View
  const filteredBatches = useMemo(() => {
    if (!searchTerm.trim()) return batches;
    const term = searchTerm.toLowerCase();
    return batches.filter(
      (b) =>
        b.batch_name.toLowerCase().includes(term) ||
        b.karyawan_list.some(
          (k) =>
            k.nama_lengkap.toLowerCase().includes(term) ||
            k.nip.toLowerCase().includes(term)
        )
    );
  }, [batches, searchTerm]);

  // Filtered Assessments View
  const filteredAssessments = useMemo(() => {
    return assessmentData.filter((item) => {
      const matchesSearch =
        item.nama_lengkap.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.nip.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.batch_name.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesBatch =
        selectedBatchFilter === "all" ||
        item.batch_id === selectedBatchFilter ||
        item.batch_name === selectedBatchFilter;

      return matchesSearch && matchesBatch;
    });
  }, [assessmentData, searchTerm, selectedBatchFilter]);

  // Active Batch Name (if filtered)
  const activeBatchObj = useMemo(() => {
    if (selectedBatchFilter === "all") return null;
    return batches.find((b) => b.id === selectedBatchFilter || b.batch_name === selectedBatchFilter) || null;
  }, [batches, selectedBatchFilter]);

  // Overall Statistics
  const stats = useMemo(() => {
    const totalAssigned = assessmentData.length;
    const completedCount = assessmentData.filter((a) => a.status === "COMPLETED").length;
    const ongoingCount = assessmentData.filter((a) => a.status === "ONGOING").length;
    const invitedCount = assessmentData.filter((a) => a.status === "INVITED").length;
    const completionRate = totalAssigned > 0 ? Math.round((completedCount / totalAssigned) * 100) : 0;

    return {
      totalBatches: batches.length,
      totalAssigned,
      completedCount,
      ongoingCount,
      invitedCount,
      completionRate,
    };
  }, [batches, assessmentData]);

  // GSAP: Animasi entrance halaman & komponen utama
  useGSAP(
    () => {
      const tl = gsap.timeline({ defaults: { ease: "power2.out" } });

      tl.from(".test-header", {
        y: -12,
        opacity: 0,
        duration: 0.45,
        clearProps: "all",
      })
        .from(
          ".test-kpi-card",
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
          ".test-workspace",
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

  // GSAP: Animasi transisi saat tab atau mode view berganti
  useGSAP(
    () => {
      gsap.from(".test-tab-content", {
        y: 10,
        opacity: 0,
        duration: 0.32,
        ease: "power2.out",
        clearProps: "all",
      });

      if (activeTab === "batches") {
        if (batchViewMode === "table") {
          gsap.from(".test-batch-row", {
            y: 8,
            opacity: 0,
            duration: 0.28,
            stagger: 0.025,
            ease: "power2.out",
            clearProps: "all",
          });
        } else {
          gsap.from(".test-batch-grid-item", {
            y: 10,
            opacity: 0,
            duration: 0.28,
            stagger: 0.03,
            ease: "power2.out",
            clearProps: "all",
          });
        }
      } else {
        gsap.from(".test-assessment-row", {
          y: 8,
          opacity: 0,
          duration: 0.28,
          stagger: 0.02,
          ease: "power2.out",
          clearProps: "all",
        });
      }
    },
    {
      scope: containerRef,
      dependencies: [activeTab, batchViewMode, filteredBatches, filteredAssessments],
    }
  );

  return (
    <div ref={containerRef} className="w-full space-y-4 pb-12">
      {/* 1. Header Toolbar (Executive & Compact) */}
      <div className="test-header bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="badge badge-primary badge-outline text-[10px] font-bold uppercase tracking-wider py-1 px-2.5">
              RSU Avisena • SDM &amp; Kepegawaian
            </span>
            <span className="text-slate-300 text-xs">•</span>
            <span className="text-[11px] font-semibold text-slate-500">
              Evaluasi Karyawan Tetap
            </span>
          </div>
          <h1 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight">
            Asesmen &amp; Evaluasi Psikometri
          </h1>
          <p className="text-xs text-slate-500 max-w-xl font-medium leading-relaxed">
            Pengelolaan batch jadwal tes kognitif dan kepribadian (MBTI, DISC, PAPI Kostick, CFIT) melalui Magic Link.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={fetchData}
            title="Segarkan Data"
            className="btn btn-ghost btn-sm btn-square text-slate-500 hover:text-slate-800 rounded-xl"
          >
            <RotateCcw size={16} className={loading ? "animate-spin" : ""} />
          </button>

          <button
            onClick={() => {
              setIsCreateModalOpen(true);
              setBatchNameInput(
                `Evaluasi Karyawan Tetap - ${new Date().toLocaleDateString("id-ID", { month: "long", year: "numeric" })}`
              );
            }}
            className="btn btn-primary btn-sm gap-2 font-bold text-xs uppercase tracking-wider rounded-xl shadow-xs active:scale-[0.98] transition-all px-4"
          >
            <PlusCircle size={16} />
            Buat Batch Baru
          </button>
        </div>
      </div>

      {/* 2. Compact Inline KPI Ribbon (Clean & Data-Dense) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="test-kpi-card bg-white border border-slate-200/90 rounded-xl p-3.5 shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Batch</p>
            <p className="text-xl font-black text-slate-800 font-mono tabular-nums mt-0.5">
              {stats.totalBatches} <span className="text-xs font-semibold text-slate-400 font-sans">Batch</span>
            </p>
          </div>
          <div className="w-9 h-9 rounded-lg bg-blue-50 text-[#0173b6] flex items-center justify-center font-bold">
            <Layers size={18} />
          </div>
        </div>

        <div className="test-kpi-card bg-white border border-slate-200/90 rounded-xl p-3.5 shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Peserta</p>
            <p className="text-xl font-black text-slate-800 font-mono tabular-nums mt-0.5">
              {stats.totalAssigned} <span className="text-xs font-semibold text-slate-400 font-sans">Orang</span>
            </p>
          </div>
          <div className="w-9 h-9 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
            <Users size={18} />
          </div>
        </div>

        <div className="test-kpi-card bg-white border border-slate-200/90 rounded-xl p-3.5 shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Selesai Ujian</p>
            <div className="flex items-baseline gap-2 mt-0.5">
              <span className="text-xl font-black text-emerald-600 font-mono tabular-nums">
                {stats.completedCount}
              </span>
              <span className="badge badge-success badge-xs font-bold text-white font-mono tabular-nums">
                {stats.completionRate}%
              </span>
            </div>
          </div>
          <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            <CheckCircle2 size={18} />
          </div>
        </div>

        <div className="test-kpi-card bg-white border border-slate-200/90 rounded-xl p-3.5 shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Menunggu / Tes</p>
            <p className="text-xl font-black text-amber-600 font-mono tabular-nums mt-0.5">
              {stats.invitedCount + stats.ongoingCount}{" "}
              <span className="text-xs font-semibold text-slate-400 font-sans">
                ({stats.ongoingCount} jalan)
              </span>
            </p>
          </div>
          <div className="w-9 h-9 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
            <Clock size={18} />
          </div>
        </div>
      </div>

      {/* 3. Main Workspace with Compact Controls */}
      <div className="test-workspace bg-white rounded-2xl border border-slate-200/90 shadow-xs p-5 space-y-4">
        {/* Navigation & Controls Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          {/* DaisyUI Tabs */}
          <div role="tablist" className="tabs tabs-box bg-slate-100/90 p-1 rounded-xl w-full sm:w-auto inline-flex">
            <button
              role="tab"
              onClick={() => setActiveTab("batches")}
              className={`tab text-xs font-bold gap-2 transition-all rounded-lg ${
                activeTab === "batches"
                  ? "tab-active !bg-white !text-[#0173b6] shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <ClipboardCheck size={14} />
              Daftar Batch Ujian
              <span
                className={`badge badge-sm font-mono tabular-nums ${
                  activeTab === "batches" ? "badge-primary" : "badge-ghost"
                }`}
              >
                {batches.length}
              </span>
            </button>
            <button
              role="tab"
              onClick={() => setActiveTab("assessments")}
              className={`tab text-xs font-bold gap-2 transition-all rounded-lg ${
                activeTab === "assessments"
                  ? "tab-active !bg-white !text-[#0173b6] shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Users size={14} />
              Daftar Peserta
              <span
                className={`badge badge-sm font-mono tabular-nums ${
                  activeTab === "assessments" ? "badge-primary" : "badge-ghost"
                }`}
              >
                {selectedBatchFilter !== "all" ? filteredAssessments.length : assessmentData.length}
              </span>
            </button>
          </div>

          {/* Search, Filter & Layout Toggles */}
          <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 w-full md:w-auto">
            {/* Search Input */}
            <div className="relative flex-1 sm:w-64">
              <input
                type="text"
                placeholder={activeTab === "batches" ? "Cari nama batch..." : "Cari karyawan / NIP..."}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input input-bordered input-sm w-full pl-8 pr-3 bg-slate-50 focus:border-[#0173b6] rounded-xl text-xs font-medium"
              />
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" size={13} />
            </div>

            {/* Batch Dropdown Filter */}
            {batches.length > 0 && (activeTab === "assessments" || selectedBatchFilter !== "all") && (
              <BatchFilterDropdown
                batches={batches}
                selectedBatchFilter={selectedBatchFilter}
                onSelectBatch={(batchId) => {
                  setSelectedBatchFilter(batchId);
                  if (activeTab === "batches" && batchId !== "all") {
                    setActiveTab("assessments");
                  }
                }}
                totalParticipants={assessmentData.length}
              />
            )}

            {/* View Mode Toggle (Only in Batches Tab) */}
            {activeTab === "batches" && (
              <div className="join border border-slate-200 rounded-xl p-0.5 bg-slate-50">
                <button
                  type="button"
                  onClick={() => setBatchViewMode("table")}
                  title="Tampilan Tabel (Rapi & Kompak)"
                  className={`btn btn-xs join-item rounded-lg border-none ${
                    batchViewMode === "table"
                      ? "bg-white text-[#0173b6] shadow-xs font-bold"
                      : "bg-transparent text-slate-500 hover:text-slate-800"
                  }`}
                >
                  <TableIcon size={14} />
                  <span className="hidden sm:inline">Tabel</span>
                </button>
                <button
                  type="button"
                  onClick={() => setBatchViewMode("grid")}
                  title="Tampilan Grid Kompak"
                  className={`btn btn-xs join-item rounded-lg border-none ${
                    batchViewMode === "grid"
                      ? "bg-white text-[#0173b6] shadow-xs font-bold"
                      : "bg-transparent text-slate-500 hover:text-slate-800"
                  }`}
                >
                  <LayoutGrid size={14} />
                  <span className="hidden sm:inline">Grid</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Active Filter Notification Bar (If filtering participants by a batch) */}
        {activeTab === "assessments" && activeBatchObj && (
          <div className="bg-blue-50/80 border border-blue-200 rounded-xl p-3 flex items-center justify-between gap-3 text-xs text-blue-900">
            <div className="flex items-center gap-2">
              <span className="badge badge-primary badge-sm font-bold">Filter Aktif</span>
              <span>
                Menampilkan peserta untuk batch: <strong>{activeBatchObj.batch_name}</strong> ({activeBatchObj.total_karyawan} karyawan)
              </span>
            </div>
            <button
              onClick={() => setSelectedBatchFilter("all")}
              className="btn btn-ghost btn-xs text-[#0173b6] hover:bg-blue-100 rounded-lg font-bold gap-1"
            >
              <X size={13} />
              Tampilkan Semua Batch
            </button>
          </div>
        )}

        {/* TAB 1: BATCHES - SLEEK TABLE OR COMPACT GRID */}
        {activeTab === "batches" && (
          <div className="test-tab-content">
            {loading ? (
              <div className="py-16 flex flex-col items-center justify-center text-slate-400 space-y-3">
                <Loader2 size={36} className="animate-spin text-[#0173b6]" />
                <p className="text-xs font-bold text-slate-500">Memuat data batch tes...</p>
              </div>
            ) : filteredBatches.length === 0 ? (
              <div className="py-16 text-center text-slate-400 space-y-2 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
                <ClipboardCheck size={40} className="mx-auto text-slate-300" />
                <p className="text-sm font-bold text-slate-700">Tidak Ada Batch yang Sesuai</p>
                <p className="text-xs text-slate-500">
                  {searchTerm ? "Silakan ubah kata kunci pencarian Anda." : "Klik tombol 'Buat Batch Baru' untuk menambahkan batch ujian."}
                </p>
              </div>
            ) : batchViewMode === "table" ? (
              /* SLEEK EXECUTIVE DATA TABLE FOR BATCHES */
              <div className="w-full overflow-x-auto rounded-xl border border-slate-200/90 shadow-2xs bg-white">
                <table className="table table-zebra table-sm md:table-md w-full">
                  <thead>
                    <tr className="bg-[#05445e] text-white uppercase text-[11px] tracking-wider font-bold">
                      <th className="py-3 px-4 text-white">Nama Batch Ujian</th>
                      <th className="py-3 px-4 text-white">Jadwal Ujian</th>
                      <th className="py-3 px-4 text-center text-white">Peserta</th>
                      <th className="py-3 px-4 text-white">Progress Evaluasi</th>
                      <th className="py-3 px-4 text-center text-white">Rincian Status</th>
                      <th className="py-3 px-4 text-right text-white">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs">
                    {filteredBatches.map((batch) => {
                      const percent =
                        batch.total_karyawan > 0
                          ? Math.round((batch.total_completed / batch.total_karyawan) * 100)
                          : 0;

                      return (
                        <tr key={batch.id} className="test-batch-row hover:bg-slate-50/80 transition-colors">
                          {/* Nama Batch */}
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2.5">
                              <div className="w-8 h-8 rounded-lg bg-blue-50 text-[#0173b6] flex items-center justify-center font-bold shrink-0">
                                <ClipboardCheck size={16} />
                              </div>
                              <div className="min-w-0">
                                <p className="font-bold text-slate-900 truncate max-w-xs md:max-w-md" title={batch.batch_name}>
                                  {batch.batch_name}
                                </p>
                                <p className="text-[10px] text-slate-400 font-mono tabular-nums">
                                  Dibuat: {new Date(batch.created_at).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}
                                </p>
                              </div>
                            </div>
                          </td>

                          {/* Jadwal Pelaksanaan */}
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-1.5 font-mono tabular-nums text-slate-700">
                              <Calendar size={13} className="text-[#0173b6] shrink-0" />
                              <span className="font-semibold">
                                {new Date(batch.scheduled_date).toLocaleDateString("id-ID", {
                                  day: "numeric",
                                  month: "short",
                                  year: "numeric",
                                })}
                              </span>
                            </div>
                          </td>

                          {/* Peserta Count */}
                          <td className="py-3 px-4 text-center">
                            <span className="badge badge-ghost font-mono tabular-nums text-xs font-bold">
                              {batch.total_karyawan} Orang
                            </span>
                          </td>

                          {/* Progress Bar & Percentage */}
                          <td className="py-3 px-4">
                            <div className="space-y-1 min-w-[140px]">
                              <div className="flex justify-between text-[11px] font-mono tabular-nums font-semibold text-slate-600">
                                <span>{batch.total_completed}/{batch.total_karyawan}</span>
                                <span className="font-bold text-slate-800">{percent}%</span>
                              </div>
                              <progress
                                className="progress progress-primary w-full h-1.5 rounded-full bg-slate-100"
                                value={percent}
                                max="100"
                              ></progress>
                            </div>
                          </td>

                          {/* Status Breakdown Pills */}
                          <td className="py-3 px-4 text-center">
                            <div className="inline-flex items-center gap-1.5 font-mono tabular-nums text-[11px]">
                              <span className="badge badge-success badge-sm text-white font-bold" title="Sudah Selesai">
                                {batch.total_completed} Selesai
                              </span>
                              <span className="badge badge-warning badge-sm text-slate-900 font-bold" title="Menunggu / Tes">
                                {batch.total_invited + batch.total_ongoing} Menunggu
                              </span>
                            </div>
                          </td>

                          {/* Actions */}
                          <td className="py-3 px-4 text-right">
                            <div className="inline-flex items-center gap-1 justify-end">
                              <button
                                onClick={() => {
                                  setSelectedBatchFilter(batch.id);
                                  setActiveTab("assessments");
                                }}
                                className="btn btn-outline btn-primary btn-xs rounded-lg font-bold gap-1 active:scale-[0.98]"
                                title="Lihat Peserta Batch Ini"
                              >
                                <Users size={12} />
                                <span>Peserta</span>
                              </button>

                              <button
                                onClick={() => handleOpenEditModal(batch)}
                                className="btn btn-ghost btn-xs btn-square text-slate-500 hover:text-[#0173b6] hover:bg-blue-50 rounded-lg"
                                title="Edit Batch & Kelola Peserta"
                              >
                                <Pencil size={13} />
                              </button>

                              <button
                                onClick={() => handleDeleteBatch(batch)}
                                className="btn btn-ghost btn-xs btn-square text-slate-400 hover:text-error hover:bg-red-50 rounded-lg"
                                title="Hapus Batch"
                              >
                                <Trash2 size={13} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              /* COMPACT REFINED GRID (TIDAK LAGI CARD BESAR CLUNKY) */
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {filteredBatches.map((batch) => {
                  const percent =
                    batch.total_karyawan > 0
                      ? Math.round((batch.total_completed / batch.total_karyawan) * 100)
                      : 0;

                  return (
                    <div
                      key={batch.id}
                      className="test-batch-grid-item bg-white border border-slate-200/90 rounded-xl p-4 hover:border-[#0173b6] hover:shadow-xs transition-all shadow-2xs space-y-3 flex flex-col justify-between"
                    >
                      <div>
                        {/* Compact Header */}
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-1.5">
                              <span className="badge badge-primary badge-outline text-[9px] font-bold uppercase py-0.5 px-2">
                                Batch
                              </span>
                              <span className="text-[10px] text-slate-400 font-mono tabular-nums">
                                {batch.total_karyawan} Peserta
                              </span>
                            </div>
                            <h3
                              className="text-sm font-black text-slate-800 mt-1 truncate hover:text-[#0173b6] transition-colors"
                              title={batch.batch_name}
                            >
                              {batch.batch_name}
                            </h3>
                          </div>

                          <div className="flex items-center gap-0.5 shrink-0">
                            <button
                              onClick={() => handleOpenEditModal(batch)}
                              className="btn btn-ghost btn-xs btn-square text-slate-400 hover:text-[#0173b6] rounded-md"
                              title="Edit"
                            >
                              <Pencil size={13} />
                            </button>
                            <button
                              onClick={() => handleDeleteBatch(batch)}
                              className="btn btn-ghost btn-xs btn-square text-slate-400 hover:text-error rounded-md"
                              title="Hapus"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </div>

                        {/* Date info */}
                        <div className="mt-2.5 flex items-center justify-between text-[11px] text-slate-600 bg-slate-50 p-2 rounded-lg border border-slate-100 font-mono tabular-nums">
                          <div className="flex items-center gap-1.5">
                            <Calendar size={12} className="text-[#0173b6]" />
                            <span>
                              {new Date(batch.scheduled_date).toLocaleDateString("id-ID", {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                              })}
                            </span>
                          </div>
                          <span className="text-[10px] text-slate-400 uppercase font-sans font-bold">
                            Jadwal
                          </span>
                        </div>

                        {/* Micro Progress */}
                        <div className="mt-3 space-y-1">
                          <div className="flex justify-between text-[10px] font-mono tabular-nums font-bold text-slate-600">
                            <span>Progress</span>
                            <span>{batch.total_completed}/{batch.total_karyawan} ({percent}%)</span>
                          </div>
                          <progress
                            className="progress progress-primary w-full h-1.5 rounded-full bg-slate-100"
                            value={percent}
                            max="100"
                          ></progress>
                        </div>
                      </div>

                      {/* Compact Footer */}
                      <div className="pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs">
                        <div className="flex items-center gap-1.5 font-mono tabular-nums text-[10px]">
                          <span className="text-emerald-600 font-bold">{batch.total_completed} Selesai</span>
                          <span className="text-slate-300">•</span>
                          <span className="text-amber-600 font-bold">{batch.total_invited + batch.total_ongoing} Belum</span>
                        </div>

                        <button
                          onClick={() => {
                            setSelectedBatchFilter(batch.id);
                            setActiveTab("assessments");
                          }}
                          className="btn btn-ghost btn-xs text-[#0173b6] hover:bg-blue-50 font-bold gap-1 rounded-lg"
                        >
                          <span>Buka Peserta</span>
                          <ArrowRight size={12} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: ASSESSMENTS TABLE (CLEAN DATA-DENSE EXECUTIVE TABLE) */}
        {activeTab === "assessments" && (
          <div className="test-tab-content">
            {loading ? (
              <div className="py-16 flex flex-col items-center justify-center text-slate-400 space-y-3">
                <Loader2 size={36} className="animate-spin text-[#0173b6]" />
                <p className="text-xs font-bold text-slate-500">Memuat data peserta...</p>
              </div>
            ) : filteredAssessments.length === 0 ? (
              <div className="py-16 text-center text-slate-400 text-xs font-medium bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
                Tidak ada data peserta asesmen yang sesuai dengan filter pencarian.
              </div>
            ) : (
              <div className="w-full overflow-x-auto rounded-xl border border-slate-200/90 shadow-2xs bg-white">
                <table className="table table-zebra table-sm md:table-md w-full">
                  <thead>
                    <tr className="bg-[#05445e] text-white uppercase text-[11px] tracking-wider font-bold">
                      <th className="py-3.5 px-4 text-white">Karyawan</th>
                      <th className="py-3.5 px-4 text-white">Jabatan &amp; Unit Kerja</th>
                      <th className="py-3.5 px-4 text-white">Status Pegawai</th>
                      <th className="py-3.5 px-4 text-white">Batch Ujian</th>
                      <th className="py-3.5 px-4 text-white">Status Pengerjaan</th>
                      <th className="py-3.5 px-4 text-center text-white">Hasil Psikometri</th>
                      <th className="py-3.5 px-4 text-center text-white">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs">
                    {filteredAssessments.map((item) => (
                      <tr key={item.id} className="test-assessment-row hover:bg-slate-50/80 transition-colors">
                        {/* Karyawan Profile */}
                        <td className="py-3 px-4">
                          <p className="font-bold text-slate-900">{item.nama_lengkap}</p>
                          <div className="text-[11px] text-slate-500 font-mono tabular-nums flex items-center gap-1.5 mt-0.5">
                            <span>NIP: {item.nip}</span>
                            <span className="text-slate-300">•</span>
                            <span className="truncate max-w-[140px]">{item.email || "No email"}</span>
                          </div>
                        </td>

                        {/* Jabatan & Departemen */}
                        <td className="py-3 px-4">
                          <p className="font-semibold text-slate-800">{item.nama_jabatan || "-"}</p>
                          <p className="text-[11px] text-slate-500">{item.nama_departemen || "-"}</p>
                        </td>

                        {/* Status Kepegawaian */}
                        <td className="py-3 px-4">
                          <span className="badge badge-ghost badge-sm font-bold uppercase text-[10px]">
                            {item.status_kepegawaian || "Kontrak"}
                          </span>
                        </td>

                        {/* Nama Batch */}
                        <td className="py-3 px-4 font-semibold text-slate-700 truncate max-w-[180px]" title={item.batch_name}>
                          {item.batch_name}
                        </td>

                        {/* Status Pengerjaan Badge */}
                        <td className="py-3 px-4">
                          {item.status === "COMPLETED" ? (
                            <span className="badge badge-success badge-sm gap-1.5 font-bold text-white shadow-2xs">
                              <CheckCircle2 size={12} /> Selesai
                            </span>
                          ) : item.status === "ONGOING" ? (
                            <span className="badge badge-info badge-sm gap-1.5 font-bold text-white shadow-2xs">
                              <Clock size={12} className="animate-spin" /> Sedang Dikerjakan
                            </span>
                          ) : (
                            <span className="badge badge-warning badge-sm gap-1.5 font-bold text-slate-900 shadow-2xs">
                              <Send size={12} /> Undangan Terkirim
                            </span>
                          )}
                        </td>

                        {/* Hasil Psikometri CTA */}
                        <td className="py-3 px-4 text-center">
                          {item.status === "COMPLETED" ? (
                            <button
                              onClick={() => handleViewResult(item.id)}
                              className="btn btn-primary btn-xs gap-1.5 font-bold uppercase tracking-wider rounded-lg shadow-2xs active:scale-[0.98] mx-auto"
                            >
                              <Eye size={13} />
                              Lihat Hasil
                            </button>
                          ) : (
                            <span className="text-[11px] text-slate-400 italic">Belum Selesai</span>
                          )}
                        </td>

                        {/* Action - Delete Participant */}
                        <td className="py-3 px-4 text-center">
                          <div className="tooltip tooltip-left" data-tip="Keluarkan dari Batch">
                            <button
                              onClick={() => handleDeleteParticipant(item)}
                              className="btn btn-ghost btn-xs btn-square text-slate-400 hover:text-error hover:bg-red-50 rounded-lg transition-colors"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>

      {/* MODAL 1: BUAT BATCH TEST BARU */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Buat Batch Test Karyawan"
        size="2xl"
      >
        <form onSubmit={handleCreateBatch} className="space-y-4">
          <div className="space-y-1">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
              Nama Batch Ujian / Evaluasi <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="Contoh: Evaluasi Karyawan Tetap Gelombang 1 2026"
              value={batchNameInput}
              onChange={(e) => setBatchNameInput(e.target.value)}
              className="input input-bordered w-full bg-slate-50 focus:border-[#0173b6] text-xs font-medium rounded-xl"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
              Tanggal Pelaksanaan Tes <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              required
              value={scheduledDateInput}
              onChange={(e) => setScheduledDateInput(e.target.value)}
              className="input input-bordered w-full bg-slate-50 focus:border-[#0173b6] text-xs font-medium rounded-xl font-mono"
            />
          </div>

          <div className="space-y-2.5 pt-2">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Pilih Karyawan{" "}
                <span className="badge badge-primary badge-sm font-mono tabular-nums ml-1">
                  {selectedEmployeeIds.length} Dipilih
                </span>
                <span className="text-red-500 ml-1">*</span>
              </label>

              <button
                type="button"
                onClick={handleSelectAllFiltered}
                className="btn btn-ghost btn-xs text-[#0173b6] hover:bg-blue-50 font-bold"
              >
                Pilih Semua Hasil Filter ({filteredEmployeesForModal.length})
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Cari nama, NIP, email..."
                  value={employeeSearch}
                  onChange={(e) => setEmployeeSearch(e.target.value)}
                  className="input input-bordered input-sm w-full pl-8 bg-slate-50 focus:border-[#0173b6] text-xs rounded-xl"
                />
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" size={13} />
              </div>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="select select-bordered select-sm bg-slate-50 text-slate-700 text-xs rounded-xl font-medium focus:border-[#0173b6]"
              >
                <option value="all">Semua Status Kepegawaian</option>
                <option value="Kontrak">Karyawan Kontrak</option>
                <option value="Tetap">Karyawan Tetap</option>
                <option value="Dokter">Dokter Tetap</option>
              </select>
            </div>

            <div className="border border-slate-200 rounded-xl max-h-56 overflow-y-auto divide-y divide-slate-100 bg-white">
              {filteredEmployeesForModal.length === 0 ? (
                <div className="p-6 text-center text-slate-400 text-xs italic">
                  Tidak ada karyawan yang sesuai filter pencarian.
                </div>
              ) : (
                filteredEmployeesForModal.map((emp) => {
                  const isSelected = selectedEmployeeIds.includes(emp.id);
                  return (
                    <div
                      key={emp.id}
                      onClick={() => handleToggleSelectEmployee(emp.id)}
                      className={`p-2.5 flex items-center justify-between cursor-pointer transition-colors ${
                        isSelected ? "bg-blue-50/70 hover:bg-blue-50" : "hover:bg-slate-50"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => {}}
                          className="checkbox checkbox-primary checkbox-sm rounded-md"
                        />
                        <div>
                          <p className="text-xs font-bold text-slate-800">{emp.nama_lengkap}</p>
                          <p className="text-[10px] text-slate-400 font-mono tabular-nums">
                            NIP: {emp.nip} | {emp.nama_departemen || "Departemen -"} | {emp.email || "No Email"}
                          </p>
                        </div>
                      </div>
                      <span className="badge badge-ghost badge-sm text-[9px] font-bold uppercase tracking-wider">
                        {emp.status_kepegawaian || "Kontrak"}
                      </span>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsCreateModalOpen(false)}
              className="btn btn-ghost btn-sm text-slate-600 rounded-xl font-bold"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="btn btn-primary btn-sm gap-2 font-bold text-xs uppercase tracking-wider rounded-xl shadow-md disabled:opacity-50"
            >
              {submitting ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  Mengirim Magic Link...
                </>
              ) : (
                <>
                  <Send size={14} />
                  Kirim Undangan Batch
                </>
              )}
            </button>
          </div>
        </form>
      </Modal>

      {/* MODAL 2: EDIT BATCH & KELOLA PESERTA */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => {
          if (!submitting) {
            setIsEditModalOpen(false);
            setEditingBatch(null);
          }
        }}
        title={`Kelola & Edit Batch: ${editingBatch?.batch_name || ""}`}
        size="3xl"
      >
        {editingBatch && (
          <form onSubmit={handleUpdateBatch} className="space-y-4">
            <div role="tablist" className="tabs tabs-box bg-slate-100/90 p-1 rounded-xl">
              <button
                type="button"
                role="tab"
                onClick={() => setEditSubTab("info")}
                className={`tab text-xs font-bold gap-1.5 transition-all rounded-lg flex-1 ${
                  editSubTab === "info"
                    ? "tab-active !bg-white !text-[#0173b6] shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <Calendar size={13} />
                Informasi Batch
              </button>
              <button
                type="button"
                role="tab"
                onClick={() => setEditSubTab("participants")}
                className={`tab text-xs font-bold gap-1.5 transition-all rounded-lg flex-1 ${
                  editSubTab === "participants"
                    ? "tab-active !bg-white !text-[#0173b6] shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <Users size={13} />
                Peserta ({editingBatch.karyawan_list.length})
                {karyawanToRemove.length > 0 && (
                  <span className="badge badge-error badge-xs text-white font-mono tabular-nums">
                    -{karyawanToRemove.length}
                  </span>
                )}
              </button>
              <button
                type="button"
                role="tab"
                onClick={() => setEditSubTab("add")}
                className={`tab text-xs font-bold gap-1.5 transition-all rounded-lg flex-1 ${
                  editSubTab === "add"
                    ? "tab-active !bg-white !text-[#0173b6] shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <UserPlus size={13} />
                Tambah Karyawan
                {karyawanToAdd.length > 0 && (
                  <span className="badge badge-success badge-xs text-white font-mono tabular-nums">
                    +{karyawanToAdd.length}
                  </span>
                )}
              </button>
            </div>

            {/* Sub-tab 1: Info */}
            {editSubTab === "info" && (
              <div className="space-y-3.5 animate-in fade-in duration-200">
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Nama Batch Ujian / Evaluasi <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={editBatchName}
                    onChange={(e) => setEditBatchName(e.target.value)}
                    placeholder="Contoh: Evaluasi Karyawan Tetap Gelombang 2"
                    className="input input-bordered w-full bg-slate-50 focus:border-[#0173b6] text-xs font-medium rounded-xl"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Tanggal Pelaksanaan Tes <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={editScheduledDate}
                    onChange={(e) => setEditScheduledDate(e.target.value)}
                    className="input input-bordered w-full bg-slate-50 focus:border-[#0173b6] text-xs font-medium rounded-xl font-mono"
                  />
                  <div className="mt-2 bg-blue-50 border border-blue-200 rounded-xl p-3 flex items-start gap-2 text-xs text-blue-900">
                    <Sparkles size={15} className="text-[#0173b6] shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold">Otomatis Memperbarui Validitas Magic Link:</p>
                      <p className="text-[11px] text-blue-700 mt-0.5 leading-relaxed">
                        Mengubah tanggal tes di sini otomatis memperbarui masa berlaku magic link bagi seluruh peserta batch ini.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2.5 pt-1">
                  <div className="bg-slate-50 border border-slate-200/80 p-3 rounded-xl text-center">
                    <p className="text-[10px] uppercase font-bold text-slate-500">Terdaftar</p>
                    <p className="text-lg font-black text-slate-800 mt-0.5 font-mono tabular-nums">
                      {editingBatch.total_karyawan}
                    </p>
                  </div>
                  <div className="bg-emerald-50/70 border border-emerald-100 p-3 rounded-xl text-center">
                    <p className="text-[10px] uppercase font-bold text-emerald-700">Selesai</p>
                    <p className="text-lg font-black text-emerald-700 mt-0.5 font-mono tabular-nums">
                      {editingBatch.total_completed}
                    </p>
                  </div>
                  <div className="bg-amber-50/70 border border-amber-100 p-3 rounded-xl text-center">
                    <p className="text-[10px] uppercase font-bold text-amber-700">Menunggu</p>
                    <p className="text-lg font-black text-amber-700 mt-0.5 font-mono tabular-nums">
                      {editingBatch.total_invited + editingBatch.total_ongoing}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Sub-tab 2: Participants List */}
            {editSubTab === "participants" && (
              <div className="space-y-3 animate-in fade-in duration-200">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Cari nama atau NIP peserta..."
                    value={participantSearch}
                    onChange={(e) => setParticipantSearch(e.target.value)}
                    className="input input-bordered input-sm w-full pl-8 bg-slate-50 focus:border-[#0173b6] text-xs rounded-xl"
                  />
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" size={13} />
                </div>

                <div className="border border-slate-200 rounded-xl max-h-64 overflow-y-auto divide-y divide-slate-100 bg-white">
                  {editingBatch.karyawan_list
                    .filter(
                      (p) =>
                        p.nama_lengkap.toLowerCase().includes(participantSearch.toLowerCase()) ||
                        p.nip.toLowerCase().includes(participantSearch.toLowerCase())
                    )
                    .map((item) => {
                      const isMarkedForRemoval = karyawanToRemove.includes(item.karyawan_id);
                      return (
                        <div
                          key={item.id}
                          className={`p-3 flex items-center justify-between gap-3 transition-colors ${
                            isMarkedForRemoval
                              ? "bg-red-50/80 border-l-4 border-l-red-500"
                              : "hover:bg-slate-50"
                          }`}
                        >
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <p
                                className={`text-xs font-bold ${
                                  isMarkedForRemoval ? "line-through text-red-600" : "text-slate-800"
                                }`}
                              >
                                {item.nama_lengkap}
                              </p>
                              {item.status === "COMPLETED" ? (
                                <span className="badge badge-success badge-xs text-white font-bold">
                                  Selesai
                                </span>
                              ) : item.status === "ONGOING" ? (
                                <span className="badge badge-info badge-xs text-white font-bold">
                                  Sedang Tes
                                </span>
                              ) : (
                                <span className="badge badge-warning badge-xs text-slate-900 font-bold">
                                  Diundang
                                </span>
                              )}
                              {isMarkedForRemoval && (
                                <span className="badge badge-error badge-xs text-white font-bold">
                                  Akan Dikeluarkan
                                </span>
                              )}
                            </div>
                            <p className="text-[10px] text-slate-400 font-mono tabular-nums mt-0.5">
                              NIP: {item.nip} | {item.nama_departemen || "-"} | {item.email || "No Email"}
                            </p>
                          </div>

                          <div>
                            {isMarkedForRemoval ? (
                              <button
                                type="button"
                                onClick={() => handleToggleRemoveKaryawan(item.karyawan_id)}
                                className="btn btn-outline btn-xs rounded-lg font-bold"
                              >
                                Batal Hapus
                              </button>
                            ) : (
                              <button
                                type="button"
                                onClick={() => handleToggleRemoveKaryawan(item.karyawan_id)}
                                className="btn btn-outline btn-error btn-xs rounded-lg font-bold gap-1"
                              >
                                <UserMinus size={12} />
                                Keluarkan
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>
            )}

            {/* Sub-tab 3: Add employee */}
            {editSubTab === "add" && (
              <div className="space-y-3 animate-in fade-in duration-200">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Pilih Karyawan Tambahan ({karyawanToAdd.length} Dipilih)
                  </p>
                  <button
                    type="button"
                    onClick={handleSelectAllAvailableForEdit}
                    className="btn btn-ghost btn-xs text-[#0173b6] hover:bg-blue-50 font-bold"
                  >
                    Pilih Semua ({availableEmployeesForEdit.length})
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Cari nama, NIP, email..."
                      value={editEmployeeSearch}
                      onChange={(e) => setEditEmployeeSearch(e.target.value)}
                      className="input input-bordered input-sm w-full pl-8 bg-slate-50 focus:border-[#0173b6] text-xs rounded-xl"
                    />
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" size={13} />
                  </div>

                  <select
                    value={editStatusFilter}
                    onChange={(e) => setEditStatusFilter(e.target.value)}
                    className="select select-bordered select-sm bg-slate-50 text-slate-700 text-xs rounded-xl font-medium focus:border-[#0173b6]"
                  >
                    <option value="all">Semua Status Kepegawaian</option>
                    <option value="Kontrak">Karyawan Kontrak</option>
                    <option value="Tetap">Karyawan Tetap</option>
                    <option value="Dokter">Dokter Tetap</option>
                  </select>
                </div>

                <div className="border border-slate-200 rounded-xl max-h-56 overflow-y-auto divide-y divide-slate-100 bg-white">
                  {availableEmployeesForEdit.length === 0 ? (
                    <div className="p-6 text-center text-slate-400 text-xs italic">
                      Tidak ada karyawan yang tersedia untuk ditambahkan.
                    </div>
                  ) : (
                    availableEmployeesForEdit.map((emp) => {
                      const isSelected = karyawanToAdd.includes(emp.id);
                      return (
                        <div
                          key={emp.id}
                          onClick={() => handleToggleAddKaryawan(emp.id)}
                          className={`p-2.5 flex items-center justify-between cursor-pointer transition-colors ${
                            isSelected ? "bg-blue-50/70 hover:bg-blue-50" : "hover:bg-slate-50"
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => {}}
                              className="checkbox checkbox-primary checkbox-sm rounded-md"
                            />
                            <div>
                              <p className="text-xs font-bold text-slate-800">{emp.nama_lengkap}</p>
                              <p className="text-[10px] text-slate-400 font-mono tabular-nums">
                                NIP: {emp.nip} | {emp.nama_departemen || "Departemen -"} | {emp.email || "No Email"}
                              </p>
                            </div>
                          </div>
                          <span className="badge badge-ghost badge-sm text-[9px] font-bold uppercase tracking-wider">
                            {emp.status_kepegawaian || "Kontrak"}
                          </span>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            )}

            {/* Actions Footer */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-slate-100">
              <div className="text-xs text-slate-500 flex items-center gap-2">
                {karyawanToRemove.length > 0 && (
                  <span className="badge badge-error badge-sm text-white font-bold font-mono tabular-nums">
                    -{karyawanToRemove.length} Dikeluarkan
                  </span>
                )}
                {karyawanToAdd.length > 0 && (
                  <span className="badge badge-success badge-sm text-white font-bold font-mono tabular-nums">
                    +{karyawanToAdd.length} Ditambahkan
                  </span>
                )}
                {karyawanToRemove.length === 0 && karyawanToAdd.length === 0 && (
                  <span className="text-slate-400 italic">Tidak ada perubahan peserta</span>
                )}
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                <button
                  type="button"
                  disabled={submitting}
                  onClick={() => setIsEditModalOpen(false)}
                  className="btn btn-ghost btn-sm text-slate-600 rounded-xl font-bold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="btn btn-primary btn-sm gap-2 font-bold text-xs uppercase tracking-wider rounded-xl shadow-md disabled:opacity-50"
                >
                  {submitting ? (
                    <>
                  <Loader2 size={14} className="animate-spin" />
                      Menyimpan...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 size={14} />
                      Simpan Perubahan
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        )}
      </Modal>

      {/* MODAL 3: DETAIL HASIL PSIKOMETRI */}
      <Modal
        isOpen={isResultModalOpen}
        onClose={() => setIsResultModalOpen(false)}
        title="Detail Hasil Psikometri Karyawan"
        size="5xl"
      >
        {loadingResult ? (
          <div className="py-16 flex flex-col items-center justify-center space-y-3 text-slate-400">
            <Loader2 size={36} className="animate-spin text-[#0173b6]" />
            <p className="text-xs font-bold text-slate-600">Memuat data hasil tes psikometri...</p>
          </div>
        ) : !selectedResultData ? (
          <div className="py-12 text-center text-slate-400 text-xs font-medium">
            Data hasil tes tidak ditemukan.
          </div>
        ) : (
          <div className="space-y-5 max-h-[70vh] overflow-y-auto pr-2 custom-scrollbar">
            {/* Header Profil */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/90 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h4 className="text-base font-black text-slate-900">{selectedResultData.assessment.nama_lengkap}</h4>
                <p className="text-xs text-slate-500 font-medium font-mono tabular-nums mt-0.5">
                  NIP: {selectedResultData.assessment.nip} | {selectedResultData.assessment.nama_jabatan || "-"} ({selectedResultData.assessment.nama_departemen || "-"})
                </p>
              </div>
              <div className="text-left sm:text-right">
                <span className="badge badge-primary badge-outline text-[11px] font-bold uppercase tracking-wider py-2 px-3">
                  {selectedResultData.assessment.batch_name}
                </span>
              </div>
            </div>

            {/* Section 1: MBTI */}
            <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-2xs space-y-3">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h5 className="font-black text-blue-600 text-xs uppercase tracking-wider flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
                  1. MBTI Personality Indicator
                </h5>
                {selectedResultData.results.mbti && (
                  <span className="badge badge-primary font-black text-xs font-mono tracking-widest px-3 py-2">
                    {selectedResultData.results.mbti.final_result}
                  </span>
                )}
              </div>

              {selectedResultData.results.mbti ? (() => {
                const mbti = selectedResultData.results.mbti;
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

                const mbtiProfile = getMBTIProfileDetail(mbti.final_result);

                return (
                  <div className="space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 border-b border-slate-100 pb-3">
                      <div className="flex items-baseline gap-3">
                        <h2 className="text-3xl font-black text-slate-800 tracking-tight leading-none font-mono">
                          {mbti.final_result}
                        </h2>
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                          Tipe Kepribadian Utama
                        </span>
                      </div>
                      {mbtiProfile?.julukan && (
                        <span className="badge badge-outline border-indigo-200 text-indigo-700 font-bold text-xs py-2 px-3">
                          {mbtiProfile.julukan}
                        </span>
                      )}
                    </div>

                    <div className="space-y-2.5">
                      <div>
                        <div className="flex justify-between items-center text-xs mb-1 font-mono tabular-nums">
                          <span className={scoreE >= scoreI ? "font-bold text-indigo-600" : "text-slate-400"}>
                            E ({ePct}%)
                          </span>
                          <span className={scoreI > scoreE ? "font-bold text-indigo-600" : "text-slate-400"}>
                            I ({iPct}%)
                          </span>
                        </div>
                        <div className="w-full bg-slate-200/60 rounded-full h-2 overflow-hidden flex">
                          <div className={`h-full ${scoreE >= scoreI ? "bg-indigo-500" : "bg-slate-300"}`} style={{ width: `${ePct}%` }} />
                          <div className={`h-full ${scoreI > scoreE ? "bg-indigo-500" : "bg-slate-300"}`} style={{ width: `${iPct}%` }} />
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between items-center text-xs mb-1 font-mono tabular-nums">
                          <span className={scoreS >= scoreN ? "font-bold text-emerald-600" : "text-slate-400"}>
                            S ({sPct}%)
                          </span>
                          <span className={scoreN > scoreS ? "font-bold text-emerald-600" : "text-slate-400"}>
                            N ({nPct}%)
                          </span>
                        </div>
                        <div className="w-full bg-slate-200/60 rounded-full h-2 overflow-hidden flex">
                          <div className={`h-full ${scoreS >= scoreN ? "bg-emerald-500" : "bg-slate-300"}`} style={{ width: `${sPct}%` }} />
                          <div className={`h-full ${scoreN > scoreS ? "bg-emerald-500" : "bg-slate-300"}`} style={{ width: `${nPct}%` }} />
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between items-center text-xs mb-1 font-mono tabular-nums">
                          <span className={scoreT >= scoreF ? "font-bold text-amber-600" : "text-slate-400"}>
                            T ({tPct}%)
                          </span>
                          <span className={scoreF > scoreT ? "font-bold text-amber-600" : "text-slate-400"}>
                            F ({fPct}%)
                          </span>
                        </div>
                        <div className="w-full bg-slate-200/60 rounded-full h-2 overflow-hidden flex">
                          <div className={`h-full ${scoreT >= scoreF ? "bg-amber-500" : "bg-slate-300"}`} style={{ width: `${tPct}%` }} />
                          <div className={`h-full ${scoreF > scoreT ? "bg-amber-500" : "bg-slate-300"}`} style={{ width: `${fPct}%` }} />
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between items-center text-xs mb-1 font-mono tabular-nums">
                          <span className={scoreJ >= scoreP ? "font-bold text-cyan-600" : "text-slate-400"}>
                            J ({jPct}%)
                          </span>
                          <span className={scoreP > scoreJ ? "font-bold text-cyan-600" : "text-slate-400"}>
                            P ({pPct}%)
                          </span>
                        </div>
                        <div className="w-full bg-slate-200/60 rounded-full h-2 overflow-hidden flex">
                          <div className={`h-full ${scoreJ >= scoreP ? "bg-cyan-500" : "bg-slate-300"}`} style={{ width: `${jPct}%` }} />
                          <div className={`h-full ${scoreP > scoreJ ? "bg-cyan-500" : "bg-slate-300"}`} style={{ width: `${pPct}%` }} />
                        </div>
                      </div>
                    </div>

                    {mbtiProfile && (
                      <div className="bg-slate-50/80 p-3.5 rounded-xl border border-slate-200 text-xs space-y-2 mt-3">
                        {mbtiProfile.ciri_ciri_umum && (
                          <div className="bg-indigo-50/60 border border-indigo-100 p-2.5 rounded-lg">
                            <span className="font-bold text-indigo-700 text-[10px] uppercase tracking-wider block mb-0.5">
                              Ciri-ciri Utama
                            </span>
                            <p className="text-slate-700 text-[11px] leading-relaxed">
                              {mbtiProfile.ciri_ciri_umum}
                            </p>
                          </div>
                        )}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          <div className="bg-emerald-50/60 border border-emerald-100 p-2.5 rounded-lg">
                            <span className="font-bold text-emerald-700 text-[10px] uppercase tracking-wider block mb-0.5">
                              Kontribusi Organisasi
                            </span>
                            <p className="text-slate-700 text-[11px] leading-relaxed">
                              {mbtiProfile.kontribusi_pada_organisasi}
                            </p>
                          </div>
                          <div className="bg-amber-50/60 border border-amber-100 p-2.5 rounded-lg">
                            <span className="font-bold text-amber-700 text-[10px] uppercase tracking-wider block mb-0.5">
                              Area Pengembangan
                            </span>
                            <p className="text-slate-700 text-[11px] leading-relaxed">
                              {mbtiProfile.kelemahan}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })() : (
                <p className="text-xs text-slate-400 italic">Belum dikerjakan</p>
              )}
            </div>

            {/* Section 2: DISC */}
            <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-2xs space-y-3">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h5 className="font-black text-orange-500 text-xs uppercase tracking-wider flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-orange-500"></span>
                  2. DISC Profile
                </h5>
              </div>

              {selectedResultData.results.disc ? (() => {
                const disc = selectedResultData.results.disc;
                const diffD = Number(disc.diff_d || 0);
                const diffI = Number(disc.diff_i || 0);
                const diffS = Number(disc.diff_s || 0);
                const diffC = Number(disc.diff_c || 0);

                const diffMap: Record<string, number> = { D: diffD, I: diffI, S: diffS, C: diffC };
                const dims: Array<"D" | "I" | "S" | "C"> = ["D", "I", "S", "C"];
                const positive = dims.filter((d) => diffMap[d] >= 0).sort((a, b) => diffMap[b] - diffMap[a]).join("");
                const negative = dims.filter((d) => diffMap[d] < 0).sort((a, b) => diffMap[b] - diffMap[a]).join("");
                const pattern = `${positive}/${negative}`;
                const profileDetail = getDISCProfileDetail({ positive, negative, pattern });

                return (
                  <div className="space-y-3.5">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-orange-50/40 p-3 rounded-xl border border-orange-100">
                      <div>
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                          Pola DISC (Midline 0)
                        </span>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-xl font-black text-orange-600 font-mono tracking-widest">{pattern}</span>
                          {profileDetail?.karakter_utama && (
                            <span className="badge badge-warning text-slate-900 font-black text-[10px] uppercase tracking-wider">
                              {profileDetail.karakter_utama}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-[11px] font-mono tabular-nums text-slate-600 bg-white px-2.5 py-1 rounded-lg border border-slate-200 inline-block shadow-2xs">
                          Positif: <strong className="text-orange-600">{positive || "-"}</strong> | Negatif: <strong className="text-slate-700">{negative || "-"}</strong>
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-center">
                      <div className="bg-orange-50/50 p-2.5 rounded-xl border border-orange-100 shadow-2xs">
                        <p className="text-xs font-black text-orange-600">D (Dominance)</p>
                        <p className="font-mono tabular-nums text-sm font-black text-slate-800 mt-0.5">Diff: {disc.diff_d}</p>
                        <p className="text-[9px] text-slate-400 font-mono tabular-nums">M: {disc.most_d} | L: {disc.least_d}</p>
                      </div>
                      <div className="bg-blue-50/50 p-2.5 rounded-xl border border-blue-100 shadow-2xs">
                        <p className="text-xs font-black text-[#0173b6]">I (Influence)</p>
                        <p className="font-mono tabular-nums text-sm font-black text-slate-800 mt-0.5">Diff: {disc.diff_i}</p>
                        <p className="text-[9px] text-slate-400 font-mono tabular-nums">M: {disc.most_i} | L: {disc.least_i}</p>
                      </div>
                      <div className="bg-emerald-50/50 p-2.5 rounded-xl border border-emerald-100 shadow-2xs">
                        <p className="text-xs font-black text-emerald-600">S (Steadiness)</p>
                        <p className="font-mono tabular-nums text-sm font-black text-slate-800 mt-0.5">Diff: {disc.diff_s}</p>
                        <p className="text-[9px] text-slate-400 font-mono tabular-nums">M: {disc.most_s} | L: {disc.least_s}</p>
                      </div>
                      <div className="bg-purple-50/50 p-2.5 rounded-xl border border-purple-100 shadow-2xs">
                        <p className="text-xs font-black text-purple-600">C (Compliance)</p>
                        <p className="font-mono tabular-nums text-sm font-black text-slate-800 mt-0.5">Diff: {disc.diff_c}</p>
                        <p className="text-[9px] text-slate-400 font-mono tabular-nums">M: {disc.most_c} | L: {disc.least_c}</p>
                      </div>
                    </div>

                    {profileDetail && (
                      <div className="bg-slate-50/80 p-3 rounded-xl border border-slate-200 text-xs space-y-2 mt-2">
                        {profileDetail.deskripsi && (
                          <p className="text-slate-600 leading-relaxed text-[11px]">{profileDetail.deskripsi}</p>
                        )}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          <div className="bg-emerald-50/60 border border-emerald-100 p-2.5 rounded-lg">
                            <span className="font-bold text-emerald-700 text-[10px] uppercase tracking-wider block mb-0.5">
                              Kelebihan
                            </span>
                            <p className="text-slate-700 text-[11px] leading-relaxed">{profileDetail.kelebihan}</p>
                          </div>
                          <div className="bg-amber-50/60 border border-amber-100 p-2.5 rounded-lg">
                            <span className="font-bold text-amber-700 text-[10px] uppercase tracking-wider block mb-0.5">
                              Kekurangan
                            </span>
                            <p className="text-slate-700 text-[11px] leading-relaxed">{profileDetail.kekurangan}</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })() : (
                <p className="text-xs text-slate-400 italic">Belum dikerjakan</p>
              )}
            </div>

            {/* Section 3: PAPI Kostick */}
            <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-2xs space-y-3">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h5 className="font-black text-emerald-600 text-xs uppercase tracking-wider flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                  3. PAPI Kostick
                </h5>
              </div>

              {selectedResultData.results.papi ? (
                <PAPIResultView scores={selectedResultData.results.papi} />
              ) : (
                <p className="text-xs text-slate-400 italic">Belum dikerjakan</p>
              )}
            </div>

            {/* Section 4: CFIT */}
            <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-2xs space-y-3">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h5 className="font-black text-purple-700 text-xs uppercase tracking-wider flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-purple-600"></span>
                  4. CFIT (Culture Fair Intelligence Test)
                </h5>
                {selectedResultData.results.cfit && (
                  <span className="badge badge-secondary font-black text-xs font-mono tracking-widest px-3 py-2">
                    IQ {selectedResultData.results.cfit.iq_score} — {selectedResultData.results.cfit.category}
                  </span>
                )}
              </div>

              {selectedResultData.results.cfit ? (
                <CFITResultView result={selectedResultData.results.cfit} />
              ) : (
                <p className="text-xs text-slate-400 italic">Belum dikerjakan</p>
              )}
            </div>
          </div>
        )}

        <div className="flex justify-end pt-3 border-t border-slate-100">
          <button
            onClick={() => setIsResultModalOpen(false)}
            className="btn btn-neutral btn-sm rounded-xl font-bold uppercase tracking-wider text-xs px-5"
          >
            Tutup
          </button>
        </div>
      </Modal>
    </div>
  );
}
