"use client";

import { useState, useEffect, useMemo } from "react";
import {
  ClipboardCheck,
  PlusCircle,
  Search,
  Loader2,
  CheckCircle2,
  Clock,
  Send,
  UserCheck,
  Building2,
  Calendar,
  Eye,
  Award,
  ChevronRight,
  Sparkles,
  Users,
} from "lucide-react";
import Modal from "@/app/components/modal";
import { showSuccessToast, showErrorToast } from "@/app/components/admin/Alert";
import PAPIRadarChart from "@/app/components/admin/PAPIRadarChart";
import { getPAPIInterpretation } from "@/app/data/tests/papiInterpretations";

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
  created_at: string;
  has_mbti: boolean;
  has_disc: boolean;
  has_papi: boolean;
}

interface BatchSummary {
  batch_name: string;
  created_at: string;
  scheduled_date: string;
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

  // Filtering states
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedBatchFilter, setSelectedBatchFilter] = useState("all");
  const [activeTab, setActiveTab] = useState<"batches" | "assessments">("batches");

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

  // Modal State: Detail Result
  const [isResultModalOpen, setIsResultModalOpen] = useState(false);
  const [loadingResult, setLoadingResult] = useState(false);
  const [selectedResultData, setSelectedResultData] = useState<any>(null);

  // Load Data
  const fetchData = async () => {
    setLoading(true);
    try {
      const [batchRes, empRes] = await Promise.all([
        fetch("/api/karyawan-test/batch"),
        fetch("/api/karyawan")
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

  // Filtered Assessments View
  const filteredAssessments = useMemo(() => {
    return assessmentData.filter((item) => {
      const matchesSearch =
        item.nama_lengkap.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.nip.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.batch_name.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesBatch =
        selectedBatchFilter === "all" || item.batch_name === selectedBatchFilter;

      return matchesSearch && matchesBatch;
    });
  }, [assessmentData, searchTerm, selectedBatchFilter]);

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
      completionRate
    };
  }, [batches, assessmentData]);

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-500">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#0173b6] via-blue-700 to-indigo-800 rounded-xl p-6 md:p-8 text-white shadow-xl shadow-blue-900/10 relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-8 -translate-y-8 opacity-10 pointer-events-none">
          <ClipboardCheck size={320} />
        </div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-blue-100 text-xs font-bold uppercase tracking-wider mb-3">
              <Sparkles size={14} className="text-yellow-300" />
              Modul Evaluasi Karyawan Tetap
            </div>
            <h1 className="text-2xl md:text-3xl font-black uppercase tracking-tight text-white leading-tight">
              Assesmen & Evaluasi Karyawan
            </h1>
            <p className="text-blue-100 text-xs md:text-sm mt-1 max-w-xl font-medium leading-relaxed">
              Fasilitas penugasan tes psikometri (MBTI, DISC, PAPI Kostick) secara terstruktur via Magic Link Email untuk pertimbangan penetapan status Karyawan Tetap.
            </p>
          </div>

          <button
            onClick={() => {
              setIsCreateModalOpen(true);
              setBatchNameInput(`Evaluasi Karyawan Tetap - ${new Date().toLocaleDateString("id-ID", { month: "long", year: "numeric" })}`);
            }}
            className="px-6 py-3.5 bg-white text-[#0173b6] hover:bg-blue-50 font-black rounded-lg text-xs uppercase tracking-wider transition-all duration-300 shadow-lg flex items-center justify-center gap-2 active:scale-95 shrink-0"
          >
            <PlusCircle size={18} />
            Buat Batch Test Baru
          </button>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-lg border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="w-10 h-10 rounded-lg bg-blue-50 text-[#0173b6] flex items-center justify-center font-bold">
            <ClipboardCheck size={22} />
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Total Batch Ujian</p>
            <h3 className="text-2xl font-black text-slate-800">{stats.totalBatches}</h3>
          </div>
        </div>

        <div className="bg-white p-5 rounded-lg border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0 border border-indigo-100">
            <Users size={24} />
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Karyawan Diikutsertakan</p>
            <h3 className="text-2xl font-black text-slate-800">{stats.totalAssigned}</h3>
          </div>
        </div>

        <div className="bg-white p-5 rounded-lg border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-100">
            <CheckCircle2 size={24} />
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Tes Selesai Dikerjakan</p>
            <div className="flex items-center gap-2">
              <h3 className="text-2xl font-black text-emerald-600">{stats.completedCount}</h3>
              <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">
                {stats.completionRate}%
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-lg border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 border border-amber-100">
            <Clock size={24} />
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Menunggu / Sedang Tes</p>
            <h3 className="text-2xl font-black text-amber-600">{stats.invitedCount + stats.ongoingCount}</h3>
          </div>
        </div>
      </div>

      {/* Action Bar & Tabs */}
      <div className="bg-white p-4 rounded-lg border border-slate-100 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-slate-100 pb-4">
          {/* Tab Selection */}
          <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-md w-full sm:w-auto">
            <button
              onClick={() => setActiveTab("batches")}
              className={`flex-1 sm:flex-none px-4 py-2 text-xs font-bold rounded-md transition-all ${
                activeTab === "batches"
                  ? "bg-white text-[#0173b6] shadow-sm"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              Ringkasan Batch ({batches.length})
            </button>
            <button
              onClick={() => setActiveTab("assessments")}
              className={`flex-1 sm:flex-none px-4 py-2 text-xs font-bold rounded-md transition-all ${
                activeTab === "assessments"
                  ? "bg-white text-[#0173b6] shadow-sm"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              Daftar Karyawan ({assessmentData.length})
            </button>
          </div>

          {/* Search & Filters */}
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-64">
              <input
                type="text"
                placeholder="Cari karyawan / batch..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-md text-xs font-medium focus:outline-none focus:border-[#0173b6] transition-all"
              />
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
            </div>

            {batches.length > 0 && (
              <select
                value={selectedBatchFilter}
                onChange={(e) => setSelectedBatchFilter(e.target.value)}
                className="bg-slate-50 border border-slate-200 text-slate-700 text-xs rounded-md px-3 py-2 font-medium focus:outline-none focus:border-[#0173b6]"
              >
                <option value="all">Semua Batch</option>
                {batches.map((b) => (
                  <option key={b.batch_name} value={b.batch_name}>
                    {b.batch_name}
                  </option>
                ))}
              </select>
            )}
          </div>
        </div>

        {/* TAB 1: BATCHES OVERVIEW */}
        {activeTab === "batches" && (
          <div>
            {loading ? (
              <div className="py-12 flex justify-center items-center text-slate-400">
                <Loader2 size={32} className="animate-spin text-[#0173b6]" />
              </div>
            ) : batches.length === 0 ? (
              <div className="py-16 text-center text-slate-400 space-y-3">
                <ClipboardCheck size={48} className="mx-auto text-slate-300" />
                <p className="text-sm font-bold text-slate-600">Belum Ada Batch Tes Karyawan</p>
                <p className="text-xs max-w-sm mx-auto">
                  Klik tombol "Buat Batch Test Baru" di atas untuk mengirimkan undangan tes psikometri kepada karyawan.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {batches.map((batch) => {
                  const percent = batch.total_karyawan > 0 ? Math.round((batch.total_completed / batch.total_karyawan) * 100) : 0;
                  return (
                    <div
                      key={batch.batch_name}
                      className="bg-white border border-slate-100 rounded-lg p-5 hover:border-[#0173b6] transition-all shadow-sm space-y-4 group"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <span className="text-[10px] font-black uppercase tracking-widest text-[#0173b6] bg-blue-50 px-2.5 py-1 rounded border border-blue-100">
                            Batch Evaluasi
                          </span>
                          <h3 className="text-base font-black text-slate-800 mt-2 group-hover:text-[#0173b6] transition-colors">
                            {batch.batch_name}
                          </h3>
                        </div>
                        <div className="text-right">
                          <span className="text-xs font-mono font-bold text-slate-500 block">
                            {new Date(batch.scheduled_date).toLocaleDateString("id-ID", {
                              day: "numeric",
                              month: "short",
                              year: "numeric"
                            })}
                          </span>
                          <span className="text-[10px] text-slate-400 font-medium">Jadwal Ujian</span>
                        </div>
                      </div>

                      {/* Progress Bar */}
                      <div>
                        <div className="flex justify-between text-xs font-bold text-slate-600 mb-1.5">
                          <span>Progress Pengerjaan Karyawan</span>
                          <span>{batch.total_completed} / {batch.total_karyawan} ({percent}%)</span>
                        </div>
                        <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                          <div
                            className="bg-[#0173b6] h-full rounded-full transition-all duration-500"
                            style={{ width: `${percent}%` }}
                          ></div>
                        </div>
                      </div>

                      {/* Details Footer */}
                      <div className="pt-3 border-t border-slate-50 flex items-center justify-between text-xs font-medium text-slate-500">
                        <div className="flex items-center gap-3">
                          <span className="text-emerald-600 font-bold">{batch.total_completed} Selesai</span>
                          <span>•</span>
                          <span className="text-amber-600 font-bold">{batch.total_invited + batch.total_ongoing} Menunggu</span>
                        </div>
                        <button
                          onClick={() => {
                            setSelectedBatchFilter(batch.batch_name);
                            setActiveTab("assessments");
                          }}
                          className="text-[#0173b6] font-bold hover:underline flex items-center gap-1"
                        >
                          Lihat Peserta
                          <ChevronRight size={14} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: ASSESSMENTS TABLE */}
        {activeTab === "assessments" && (
          <div>
            {loading ? (
              <div className="py-12 flex justify-center items-center text-slate-400">
                <Loader2 size={32} className="animate-spin text-[#0173b6]" />
              </div>
            ) : filteredAssessments.length === 0 ? (
              <div className="py-12 text-center text-slate-400 text-xs font-medium">
                Tidak ada data tes karyawan yang cocok dengan kriteria pencarian.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-50 text-slate-500 uppercase tracking-wider font-bold border-b border-slate-100">
                      <th className="py-3 px-4">Karyawan</th>
                      <th className="py-3 px-4">Jabatan & Departemen</th>
                      <th className="py-3 px-4">Status Kepegawaian</th>
                      <th className="py-3 px-4">Nama Batch</th>
                      <th className="py-3 px-4">Status Tes</th>
                      <th className="py-3 px-4 text-center">Hasil Psikometri</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredAssessments.map((item) => (
                      <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3.5 px-4">
                          <p className="font-bold text-slate-800">{item.nama_lengkap}</p>
                          <p className="text-[10px] text-slate-400 font-mono">NIP: {item.nip} | {item.email || "No email"}</p>
                        </td>
                        <td className="py-3.5 px-4">
                          <p className="font-medium text-slate-700">{item.nama_jabatan || "-"}</p>
                          <p className="text-[10px] text-slate-400">{item.nama_departemen || "-"}</p>
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="inline-block px-2.5 py-1 rounded bg-slate-100 text-slate-700 font-bold text-[10px] uppercase">
                            {item.status_kepegawaian || "Kontrak"}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 font-medium text-slate-600 truncate max-w-[180px]">
                          {item.batch_name}
                        </td>
                        <td className="py-3.5 px-4">
                          {item.status === "COMPLETED" ? (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 font-black text-[10px] border border-emerald-200">
                              <CheckCircle2 size={12} /> Selesai
                            </span>
                          ) : item.status === "ONGOING" ? (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 font-black text-[10px] border border-blue-200">
                              <Clock size={12} className="animate-spin" /> Sedang Dikerjakan
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 font-black text-[10px] border border-amber-200">
                              <Send size={12} /> Undangan Terkirim
                            </span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          {item.status === "COMPLETED" ? (
                            <button
                              onClick={() => handleViewResult(item.id)}
                              className="px-3 py-1.5 bg-[#0173b6] hover:bg-blue-700 text-white font-bold text-[10px] uppercase tracking-wider rounded transition-all shadow-sm flex items-center gap-1.5 mx-auto"
                            >
                              <Eye size={13} /> Lihat Hasil
                            </button>
                          ) : (
                            <span className="text-[10px] text-slate-400 italic">Belum Selesai</span>
                          )}
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
        <form onSubmit={handleCreateBatch} className="space-y-5">
          {/* Input Batch Name */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Nama Batch Ujian / Evaluasi <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="Contoh: Evaluasi Karyawan Tetap Gelombang 1 2026"
              value={batchNameInput}
              onChange={(e) => setBatchNameInput(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-md text-xs font-medium focus:outline-none focus:border-[#0173b6] transition-all"
            />
          </div>

          {/* Scheduled Date */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Tanggal Pelaksanaan Tes <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              required
              value={scheduledDateInput}
              onChange={(e) => setScheduledDateInput(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-md text-xs font-medium focus:outline-none focus:border-[#0173b6] transition-all"
            />
          </div>

          {/* Filter & Karyawan Selector */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Pilih Karyawan ({selectedEmployeeIds.length} Dipilih) <span className="text-red-500">*</span>
              </label>

              <button
                type="button"
                onClick={handleSelectAllFiltered}
                className="text-xs font-bold text-[#0173b6] hover:underline"
              >
                Pilih Semua Hasil Filter ({filteredEmployeesForModal.length})
              </button>
            </div>

            {/* Filter controls */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Cari nama, NIP, email..."
                  value={employeeSearch}
                  onChange={(e) => setEmployeeSearch(e.target.value)}
                  className="w-full pl-8 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-md text-xs font-medium focus:outline-none focus:border-[#0173b6]"
                />
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" size={13} />
              </div>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-slate-50 border border-slate-200 text-slate-700 text-xs rounded-md px-3 py-2 font-medium focus:outline-none focus:border-[#0173b6]"
              >
                <option value="all">Semua Status Kepegawaian</option>
                <option value="Kontrak">Karyawan Kontrak</option>
                <option value="Tetap">Karyawan Tetap</option>
                <option value="Dokter">Dokter Tetap</option>
              </select>
            </div>

            {/* Employees List Container */}
            <div className="border border-slate-200 rounded-md max-h-60 overflow-y-auto divide-y divide-slate-100 custom-scrollbar">
              {filteredEmployeesForModal.length === 0 ? (
                <div className="p-6 text-center text-slate-400 text-xs italic">
                  Tidak ada karyawan yang sesuai filter.
                </div>
              ) : (
                filteredEmployeesForModal.map((emp) => {
                  const isSelected = selectedEmployeeIds.includes(emp.id);
                  return (
                    <div
                      key={emp.id}
                      onClick={() => handleToggleSelectEmployee(emp.id)}
                      className={`p-3 flex items-center justify-between cursor-pointer transition-colors ${
                        isSelected ? "bg-blue-50/70 hover:bg-blue-50" : "hover:bg-slate-50"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => {}}
                          className="rounded text-[#0173b6] focus:ring-[#0173b6] h-4 w-4"
                        />
                        <div>
                          <p className="text-xs font-bold text-slate-800">{emp.nama_lengkap}</p>
                          <p className="text-[10px] text-slate-400">
                            NIP: {emp.nip} | {emp.nama_departemen || "Departemen -"} | {emp.email || "No Email"}
                          </p>
                        </div>
                      </div>
                      <span className="text-[9px] font-bold uppercase tracking-wider bg-slate-100 text-slate-600 px-2 py-0.5 rounded">
                        {emp.status_kepegawaian || "Kontrak"}
                      </span>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsCreateModalOpen(false)}
              className="px-5 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-md transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2.5 bg-[#0173b6] hover:bg-blue-700 text-white font-bold text-xs uppercase tracking-wider rounded-md transition-all shadow-md flex items-center gap-2 disabled:opacity-50"
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

      {/* MODAL 2: DETAIL HASIL PSIKOMETRI */}
      <Modal
        isOpen={isResultModalOpen}
        onClose={() => setIsResultModalOpen(false)}
        title="Detail Hasil Psikometri Karyawan"
        size="5xl"
      >
        {loadingResult ? (
          <div className="py-16 flex flex-col items-center justify-center space-y-3 text-slate-400">
            <Loader2 size={36} className="animate-spin text-[#0173b6]" />
            <p className="text-xs font-bold">Memuat data hasil tes psikometri...</p>
          </div>
        ) : !selectedResultData ? (
          <div className="py-12 text-center text-slate-400 text-xs font-medium">
            Data hasil tes tidak ditemukan.
          </div>
        ) : (
          <div className="space-y-6 max-h-[70vh] overflow-y-auto pr-2 custom-scrollbar">
            {/* Employee Summary Card */}
            <div className="bg-slate-50 p-4 rounded-lg border border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h4 className="text-base font-black text-slate-800">{selectedResultData.assessment.nama_lengkap}</h4>
                <p className="text-xs text-slate-500 font-medium">
                  NIP: {selectedResultData.assessment.nip} | {selectedResultData.assessment.nama_jabatan || "-"} ({selectedResultData.assessment.nama_departemen || "-"})
                </p>
              </div>
              <div className="text-left sm:text-right">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#0173b6] bg-blue-50 px-2.5 py-1 rounded border border-blue-100">
                  {selectedResultData.assessment.batch_name}
                </span>
              </div>
            </div>

            {/* RESULT SECTION 1: MBTI */}
            <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm relative overflow-hidden group">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
                <h5 className="font-black text-blue-600 text-xs uppercase tracking-wider flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
                  1. MBTI Personality Indicator
                </h5>
                {selectedResultData.results.mbti && (
                  <span className="px-3 py-1 bg-blue-600 text-white font-black text-xs rounded uppercase tracking-widest shadow-sm">
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

                return (
                  <div className="space-y-4">
                    <div className="flex items-baseline gap-3 border-b border-slate-100 pb-3">
                      <h2 className="text-4xl font-black text-slate-800 tracking-tight leading-none">
                        {mbti.final_result}
                      </h2>
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                        Tipe Kepribadian Utama
                      </span>
                    </div>

                    <div className="space-y-3">
                      {/* E vs I */}
                      <div>
                        <div className="flex justify-between items-center text-xs mb-1">
                          <span className={`flex items-center gap-1 ${scoreE >= scoreI ? "font-bold text-indigo-600" : "text-slate-400"}`}>
                            E (Extraversion) <span className={`text-[10px] px-1.5 py-0.5 rounded ${scoreE >= scoreI ? "bg-indigo-100 text-indigo-700 font-bold" : "bg-slate-100 text-slate-500"}`}>{ePct}%</span>
                          </span>
                          <span className={`flex items-center gap-1 ${scoreI > scoreE ? "font-bold text-indigo-600" : "text-slate-400"}`}>
                            <span className={`text-[10px] px-1.5 py-0.5 rounded ${scoreI > scoreE ? "bg-indigo-100 text-indigo-700 font-bold" : "bg-slate-100 text-slate-500"}`}>{iPct}%</span> (Introversion) I
                          </span>
                        </div>
                        <div className="w-full bg-slate-200/60 rounded-full h-2 overflow-hidden flex">
                          <div className={`h-full transition-all duration-500 ${scoreE >= scoreI ? "bg-indigo-500" : "bg-slate-300"}`} style={{ width: `${ePct}%` }} />
                          <div className={`h-full transition-all duration-500 ${scoreI > scoreE ? "bg-indigo-500" : "bg-slate-300"}`} style={{ width: `${iPct}%` }} />
                        </div>
                      </div>

                      {/* S vs N */}
                      <div>
                        <div className="flex justify-between items-center text-xs mb-1">
                          <span className={`flex items-center gap-1 ${scoreS >= scoreN ? "font-bold text-emerald-600" : "text-slate-400"}`}>
                            S (Sensing) <span className={`text-[10px] px-1.5 py-0.5 rounded ${scoreS >= scoreN ? "bg-emerald-100 text-emerald-700 font-bold" : "bg-slate-100 text-slate-500"}`}>{sPct}%</span>
                          </span>
                          <span className={`flex items-center gap-1 ${scoreN > scoreS ? "font-bold text-emerald-600" : "text-slate-400"}`}>
                            <span className={`text-[10px] px-1.5 py-0.5 rounded ${scoreN > scoreS ? "bg-emerald-100 text-emerald-700 font-bold" : "bg-slate-100 text-slate-500"}`}>{nPct}%</span> (Intuition) N
                          </span>
                        </div>
                        <div className="w-full bg-slate-200/60 rounded-full h-2 overflow-hidden flex">
                          <div className={`h-full transition-all duration-500 ${scoreS >= scoreN ? "bg-emerald-500" : "bg-slate-300"}`} style={{ width: `${sPct}%` }} />
                          <div className={`h-full transition-all duration-500 ${scoreN > scoreS ? "bg-emerald-500" : "bg-slate-300"}`} style={{ width: `${nPct}%` }} />
                        </div>
                      </div>

                      {/* T vs F */}
                      <div>
                        <div className="flex justify-between items-center text-xs mb-1">
                          <span className={`flex items-center gap-1 ${scoreT >= scoreF ? "font-bold text-amber-600" : "text-slate-400"}`}>
                            T (Thinking) <span className={`text-[10px] px-1.5 py-0.5 rounded ${scoreT >= scoreF ? "bg-amber-100 text-amber-700 font-bold" : "bg-slate-100 text-slate-500"}`}>{tPct}%</span>
                          </span>
                          <span className={`flex items-center gap-1 ${scoreF > scoreT ? "font-bold text-amber-600" : "text-slate-400"}`}>
                            <span className={`text-[10px] px-1.5 py-0.5 rounded ${scoreF > scoreT ? "bg-amber-100 text-amber-700 font-bold" : "bg-slate-100 text-slate-500"}`}>{fPct}%</span> (Feeling) F
                          </span>
                        </div>
                        <div className="w-full bg-slate-200/60 rounded-full h-2 overflow-hidden flex">
                          <div className={`h-full transition-all duration-500 ${scoreT >= scoreF ? "bg-amber-500" : "bg-slate-300"}`} style={{ width: `${tPct}%` }} />
                          <div className={`h-full transition-all duration-500 ${scoreF > scoreT ? "bg-amber-500" : "bg-slate-300"}`} style={{ width: `${fPct}%` }} />
                        </div>
                      </div>

                      {/* J vs P */}
                      <div>
                        <div className="flex justify-between items-center text-xs mb-1">
                          <span className={`flex items-center gap-1 ${scoreJ >= scoreP ? "font-bold text-cyan-600" : "text-slate-400"}`}>
                            J (Judging) <span className={`text-[10px] px-1.5 py-0.5 rounded ${scoreJ >= scoreP ? "bg-cyan-100 text-cyan-700 font-bold" : "bg-slate-100 text-slate-500"}`}>{jPct}%</span>
                          </span>
                          <span className={`flex items-center gap-1 ${scoreP > scoreJ ? "font-bold text-cyan-600" : "text-slate-400"}`}>
                            <span className={`text-[10px] px-1.5 py-0.5 rounded ${scoreP > scoreJ ? "bg-cyan-100 text-cyan-700 font-bold" : "bg-slate-100 text-slate-500"}`}>{pPct}%</span> (Perceiving) P
                          </span>
                        </div>
                        <div className="w-full bg-slate-200/60 rounded-full h-2 overflow-hidden flex">
                          <div className={`h-full transition-all duration-500 ${scoreJ >= scoreP ? "bg-cyan-500" : "bg-slate-300"}`} style={{ width: `${jPct}%` }} />
                          <div className={`h-full transition-all duration-500 ${scoreP > scoreJ ? "bg-cyan-500" : "bg-slate-300"}`} style={{ width: `${pPct}%` }} />
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })() : (
                <p className="text-xs text-slate-400 italic">Belum dikerjakan</p>
              )}
            </div>

            {/* RESULT SECTION 2: DISC */}
            <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
                <h5 className="font-black text-orange-500 text-xs uppercase tracking-wider flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-orange-500"></span>
                  2. DISC Profile (Dominance, Influence, Steadiness, Compliance)
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
                const positive = dims.filter(d => diffMap[d] >= 0).sort((a, b) => diffMap[b] - diffMap[a]).join("");
                const negative = dims.filter(d => diffMap[d] < 0).sort((a, b) => diffMap[b] - diffMap[a]).join("");
                const pattern = `${positive}/${negative}`;

                return (
                  <div className="space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3 bg-orange-50/30 p-3 rounded-lg border border-orange-100">
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Pola Tipe Profil DISC (Midline 0)</span>
                        <span className="text-2xl font-black text-orange-600 font-mono tracking-widest">{pattern}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-[11px] font-medium text-slate-600 bg-white px-3 py-1.5 rounded-md border border-slate-200 inline-block shadow-2xs">
                          Positif (≥0): <strong className="text-orange-600 font-mono">{positive || "-"}</strong> | Negatif (&lt;0): <strong className="text-slate-700 font-mono">{negative || "-"}</strong>
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                      <div className="bg-orange-50/50 p-3 rounded-lg border border-orange-100 shadow-inner">
                        <p className="text-xs font-black text-orange-600">D (Dominance)</p>
                        <p className="font-mono text-sm font-black text-slate-800 mt-1">
                          Diff: {disc.diff_d}
                        </p>
                        <div className="text-[9px] text-slate-400 font-medium mt-1">
                          Most: {disc.most_d} | Least: {disc.least_d}
                        </div>
                      </div>

                      <div className="bg-[#0173b6]/5 p-3 rounded-lg border border-blue-100 shadow-inner">
                        <p className="text-xs font-black text-[#0173b6]">I (Influence)</p>
                        <p className="font-mono text-sm font-black text-slate-800 mt-1">
                          Diff: {disc.diff_i}
                        </p>
                        <div className="text-[9px] text-slate-400 font-medium mt-1">
                          Most: {disc.most_i} | Least: {disc.least_i}
                        </div>
                      </div>

                      <div className="bg-emerald-50/50 p-3 rounded-lg border border-emerald-100 shadow-inner">
                        <p className="text-xs font-black text-emerald-600">S (Steadiness)</p>
                        <p className="font-mono text-sm font-black text-slate-800 mt-1">
                          Diff: {disc.diff_s}
                        </p>
                        <div className="text-[9px] text-slate-400 font-medium mt-1">
                          Most: {disc.most_s} | Least: {disc.least_s}
                        </div>
                      </div>

                      <div className="bg-purple-50/50 p-3 rounded-lg border border-purple-100 shadow-inner">
                        <p className="text-xs font-black text-purple-600">C (Compliance)</p>
                        <p className="font-mono text-sm font-black text-slate-800 mt-1">
                          Diff: {disc.diff_c}
                        </p>
                        <div className="text-[9px] text-slate-400 font-medium mt-1">
                          Most: {disc.most_c} | Least: {disc.least_c}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })() : (
                <p className="text-xs text-slate-400 italic">Belum dikerjakan</p>
              )}
            </div>

            {/* RESULT SECTION 3: PAPI KOSTICK */}
            <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h5 className="font-black text-emerald-600 text-xs uppercase tracking-wider flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                  3. PAPI Kostick (Roles & Needs Profile)
                </h5>
              </div>

              {selectedResultData.results.papi ? (() => {
                const papi = selectedResultData.results.papi;
                const papiCategories = [
                  {
                    title: "Kepemimpinan & Pengaruh (Leadership)",
                    color: "text-blue-600 bg-blue-50 border-blue-100",
                    barColor: "bg-blue-500",
                    traits: [
                      { key: "score_l", code: "L", label: "Peran Kepemimpinan" },
                      { key: "score_p", code: "P", label: "Kebutuhan Mengontrol Orang Lain" },
                      { key: "score_i", code: "I", label: "Kemampuan Mengambil Keputusan" },
                    ]
                  },
                  {
                    title: "Arah & Komitmen Kerja (Work Direction)",
                    color: "text-emerald-600 bg-emerald-50 border-emerald-100",
                    barColor: "bg-emerald-500",
                    traits: [
                      { key: "score_g", code: "G", label: "Peran Pekerja Keras" },
                      { key: "score_a", code: "A", label: "Kebutuhan Berprestasi" },
                      { key: "score_n", code: "N", label: "Kebutuhan Menyelesaikan Tugas" },
                    ]
                  },
                  {
                    title: "Gaya & Keteraturan Kerja (Work Style)",
                    color: "text-purple-600 bg-purple-50 border-purple-100",
                    barColor: "bg-purple-500",
                    traits: [
                      { key: "score_r", code: "R", label: "Tipe Berpikir Teoritis" },
                      { key: "score_d", code: "D", label: "Minat pada Detail" },
                      { key: "score_c", code: "C", label: "Peran Keteraturan" },
                    ]
                  },
                  {
                    title: "Sifat Sosial & Hubungan (Social Nature)",
                    color: "text-pink-600 bg-pink-50 border-pink-100",
                    barColor: "bg-pink-500",
                    traits: [
                      { key: "score_x", code: "X", label: "Kebutuhan Diperhatikan" },
                      { key: "score_s", code: "S", label: "Hubungan Sosial" },
                      { key: "score_b", code: "B", label: "Kebutuhan Kelompok" },
                      { key: "score_o", code: "O", label: "Kebutuhan Kedekatan" },
                    ]
                  },
                  {
                    title: "Temperamen & Emosi (Temperament)",
                    color: "text-amber-600 bg-amber-50 border-amber-100",
                    barColor: "bg-amber-500",
                    traits: [
                      { key: "score_z", code: "Z", label: "Kebutuhan Perubahan" },
                      { key: "score_k", code: "K", label: "Peran Defensif / Agresif" },
                      { key: "score_f", code: "F", label: "Kebutuhan Membantu Atasan" },
                      { key: "score_w", code: "W", label: "Kebutuhan Pengawasan" },
                      { key: "score_v", code: "V", label: "Tipe Energik / Vigorous" },
                      { key: "score_e", code: "E", label: "Kontrol Emosi" },
                    ]
                  }
                ];

                return (
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                    {/* Left: Diagram Radar PAPI Kostick */}
                    <div className="lg:col-span-5 flex flex-col items-center justify-center bg-slate-50/70 p-4 rounded-xl border border-slate-100">
                      <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 border-b border-slate-200 pb-1 w-full text-center">
                        Diagram Radar PAPI Kostick (20 Trait)
                      </span>
                      <PAPIRadarChart scores={papi} />
                    </div>

                    {/* Right: Breakdown Detail Trait & Penjelasan Interpretasi Kualitatif */}
                    <div className="lg:col-span-7 space-y-4 max-h-[550px] overflow-y-auto pr-2 custom-scrollbar">
                      {papiCategories.map((cat, idx) => (
                        <div key={idx} className="bg-slate-50/70 p-4 rounded-xl border border-slate-100 space-y-3">
                          <span className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded border inline-block ${cat.color}`}>
                            {cat.title}
                          </span>

                          <div className="space-y-3 pt-1">
                            {cat.traits.map((trait) => {
                              const val = Number(papi[trait.key] || 0);
                              const pct = Math.min(Math.round((val / 9) * 100), 100);
                              const interpretation = getPAPIInterpretation(trait.code, val);
                              return (
                                <div key={trait.code} className="space-y-1.5 pb-2 border-b border-slate-200/50 last:border-0 last:pb-0">
                                  <div className="flex justify-between items-center text-xs">
                                    <span className="font-bold text-slate-700 flex items-center gap-1.5">
                                      <span className="w-5 h-5 rounded bg-slate-800 text-white flex items-center justify-center text-[10px] font-mono font-black shadow-sm">
                                        {trait.code}
                                      </span>
                                      {trait.label}
                                    </span>
                                    <span className="font-mono font-black text-slate-800 bg-white px-2 py-0.5 rounded border border-slate-200 text-[11px]">
                                      {val} / 9
                                    </span>
                                  </div>
                                  <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                                    <div
                                      className={`h-full rounded-full transition-all duration-500 ${cat.barColor}`}
                                      style={{ width: `${pct}%` }}
                                    ></div>
                                  </div>
                                  {interpretation && (
                                    <p className="text-[10px] text-slate-600 leading-relaxed font-medium bg-white p-2.5 rounded-md border border-slate-100 shadow-2xs">
                                      {interpretation}
                                    </p>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })() : (
                <p className="text-xs text-slate-400 italic">Belum dikerjakan</p>
              )}
            </div>
          </div>
        )}

        <div className="flex justify-end pt-2 border-t border-slate-100">
          <button
            onClick={() => setIsResultModalOpen(false)}
            className="px-5 py-2 bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs uppercase tracking-wider rounded-md transition-all"
          >
            Tutup
          </button>
        </div>
      </Modal>
    </div>
  );
}
