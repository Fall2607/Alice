/** Path: src/app/(admin)/admin/lowongan/[slug]/page.tsx
 * Deskripsi: Halaman detail lowongan dengan UI Modern, kontainer lebar, dan sudut lancip.
 * Skema Warna: Kustom Primary (#0173b6).
 */

"use client";

import React, { useState, useEffect } from "react";
import { getPAPIInterpretation } from "@/app/data/tests/papiInterpretations";
import { getDISCProfileDetail } from "@/app/utils/discUtils";
import { getMBTIProfileDetail } from "@/app/utils/mbtiUtils";
import {
  ChevronLeft,
  Briefcase,
  MapPin,
  Clock,
  Eye,
  Loader2,
  AlertTriangle,
  User,
  Phone,
  Mail,
  Calendar,
  FileText,
  CheckCircle,
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
  LayoutGrid,
  Zap,
  Sparkles,
  Building2
} from "lucide-react";
import AssessmentSelector from "@/app/components/admin/AssessmentSelector";
import PAPIRadarChart from "@/app/components/admin/PAPIRadarChart";
import Modal from "@/app/components/modal";

import { useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';

// --- INTERFACES ---
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
}

const Badge = ({
  label,
  color = "slate",
  icon: Icon,
}: {
  label: string;
  color?: string;
  icon?: any;
}) => (
  <span
    className={`px-2.5 py-1 bg-${color}-50 text-${color}-700 text-[10px] font-bold rounded border border-${color}-200 flex items-center gap-1.5 uppercase tracking-wide`}
  >
    {Icon && <Icon size={12} />} {label}
  </span>
);

export default function DetailLowonganPage() {
  const { slug } = useParams();
  const [job, setJob] = useState<JobDetail | null>(null);
  const [applicants, setApplicants] = useState<ApplicantSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCandidateId, setSelectedCandidateId] = useState<string | null>(
    null,
  );
  const [candidateDetail, setCandidateDetail] = useState<any>(null);
  const [selectedAssessmentId, setSelectedAssessmentId] = useState<
    string | null
  >(null);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);
  const [invitingId, setInvitingId] = useState<string | null>(null);
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [selectedCandidates, setSelectedCandidates] = useState<string[]>([]);
  const [isBulkInviting, setIsBulkInviting] = useState(false);
  const [activeTab, setActiveTab] = useState<"detail" | "assessment">("detail");
  const [inviteModal, setInviteModal] = useState<{
    isOpen: boolean;
    type: "single" | "bulk";
    candidateId?: string;
    scheduledDate: string;
  }>({ isOpen: false, type: "single", scheduledDate: "" });

  const [dialog, setDialog] = useState<{
    isOpen: boolean;
    type: "alert" | "confirm";
    title: string;
    message: string;
    onConfirm?: () => void;
    confirmText?: string;
    cancelText?: string;
    isDanger?: boolean;
  }>({ isOpen: false, type: "alert", title: "", message: "" });

  const [scoreModal, setScoreModal] = useState<{
    isOpen: boolean;
    applicantName: string;
    details: any[];
    isLoading: boolean;
  }>({ isOpen: false, applicantName: "", details: [], isLoading: false });

  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "";

  const handleViewScores = async (
    applicationStatusId: string,
    applicantName: string,
  ) => {
    setScoreModal({
      isOpen: true,
      applicantName,
      details: [],
      isLoading: true,
    });
    try {
      const res = await fetch(
        `/api/job-assessments/scores/${applicationStatusId}`,
      );
      if (res.ok) {
        const data = await res.json();
        setScoreModal((prev) => ({ ...prev, details: data, isLoading: false }));
      } else {
        throw new Error("Gagal mengambil data skor");
      }
    } catch (error) {
      setScoreModal((prev) => ({ ...prev, isLoading: false }));
      setDialog({
        isOpen: true,
        type: "alert",
        title: "Error",
        message: "Gagal memuat rincian skor.",
      });
    }
  };

  const processInvite = async (applicant: any, scheduledDate: string, quiet = false) => {
    setInvitingId(applicant.id);
    try {
      const response = await fetch(`/api/assessment/invite`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
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
      if (!response.ok)
        throw new Error(data.message || "Gagal mengirim undangan tes.");

      if (!quiet)
        setDialog({
          isOpen: true,
          type: "alert",
          title: "Sukses",
          message:
            data.message ||
            "Undangan tes berhasil dikirim beserta Token & Kode Akses!",
        });

      // Update UI status secara lokal agar tidak perlu refresh halaman
      setApplicants((prev) =>
        prev.map((a) =>
          a.id === applicant.id ? { ...a, status: "ASSESSMENT" } : a,
        ),
      );
      return true;
    } catch (err: any) {
      if (!quiet)
        setDialog({
          isOpen: true,
          type: "alert",
          title: "Gagal",
          message: err.message || "Terjadi kesalahan saat mengirim undangan.",
          isDanger: true,
        });
      return false;
    } finally {
      setInvitingId(null);
    }
  };

  const handleReject = (candidateId: string) => {
    const applicant = applicants.find((a) => a.id === candidateId);
    if (!applicant || !job) return;

    setDialog({
      isOpen: true,
      type: "confirm",
      title: "Tolak Kandidat",
      message: `Apakah Anda yakin ingin MENOLAK ${applicant.nama}? Status pelamar akan diubah menjadi REJECTED.`,
      confirmText: "Ya, Tolak",
      isDanger: true,
      onConfirm: async () => {
        setDialog((prev) => ({ ...prev, isOpen: false }));
        setRejectingId(candidateId);
        try {
          const response = await fetch(`/api/apply/${candidateId}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ status: "REJECTED", job_opening_id: slug }),
          });
          const data = await response.json();
          if (!response.ok)
            throw new Error(data.message || "Gagal mengubah status.");

          setApplicants((prev) =>
            prev.map((a) =>
              a.id === candidateId ? { ...a, status: "REJECTED" } : a,
            ),
          );
          setDialog({
            isOpen: true,
            type: "alert",
            title: "Sukses",
            message: `Kandidat ${applicant.nama} berhasil ditolak.`,
          });
        } catch (err: any) {
          setDialog({
            isOpen: true,
            type: "alert",
            title: "Gagal",
            message: err.message || "Terjadi kesalahan saat menolak kandidat.",
            isDanger: true,
          });
        } finally {
          setRejectingId(null);
        }
      },
    });
  };

  const handleSendInvite = (candidateId: string) => {
    const applicant = applicants.find((a) => a.id === candidateId);
    if (!applicant || !job) return;

    setInviteModal({
      isOpen: true,
      type: "single",
      candidateId,
      scheduledDate: new Date().toISOString().split('T')[0],
    });
  };

  const handleBulkSendInvite = () => {
    if (selectedCandidates.length === 0 || !job) return;

    setInviteModal({
      isOpen: true,
      type: "bulk",
      scheduledDate: new Date().toISOString().split('T')[0],
    });
  };

  const toggleSelectAll = () => {
    const processableCandidates = applicants.filter(
      (a) =>
        !a.status ||
        ["SUBMITTED", "APPLIED", "PENDING"].includes(a.status.toUpperCase()),
    );

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

  useEffect(() => {
    if (!slug) return;
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [jobRes, applicantsRes] = await Promise.all([
          fetch(`${baseUrl}/job-openings/${slug}`),
          fetch(`${baseUrl}/apply`),
        ]);
        if (jobRes.ok) setJob(await jobRes.json());
        if (applicantsRes.ok) {
          const all = await applicantsRes.json();
          setApplicants(all.filter((a: any) => a.job_opening_id === slug));
        }
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [slug, baseUrl]);

  const handleViewCandidate = async (candidateId: string) => {
    setSelectedCandidateId(candidateId);
    setIsLoadingDetail(true);
    try {
      const res = await fetch(`${baseUrl}/apply/${candidateId}`);
      if (!res.ok) throw new Error("Gagal memuat profil.");
      setCandidateDetail(await res.json());
    } catch (err) {
      console.error(err);
      setCandidateDetail(null);
      setDialog({
        isOpen: true,
        type: "alert",
        title: "Error",
        message: "Gagal memuat profil kandidat.",
        isDanger: true,
      });
    } finally {
      setIsLoadingDetail(false);
    }
  };

  const handleViewAssessment = async (candidateId: string) => {
    setSelectedAssessmentId(candidateId);
    setIsLoadingDetail(true);
    try {
      const res = await fetch(`${baseUrl}/apply/${candidateId}`);
      if (!res.ok) throw new Error("Gagal memuat profil.");
      setCandidateDetail(await res.json());
    } catch (err) {
      console.error(err);
      setCandidateDetail(null);
      setDialog({
        isOpen: true,
        type: "alert",
        title: "Error",
        message: "Gagal memuat profil kandidat.",
        isDanger: true,
      });
    } finally {
      setIsLoadingDetail(false);
    }
  };

  const getStatusClass = (status: string) => {
    const s = status?.toLowerCase() || "";
    if (s === "accepted") return "bg-green-50 text-green-700 border-green-100";
    if (s === "rejected") return "bg-red-50 text-red-700 border-red-100";
    return "bg-blue-50 text-blue-700 border-blue-100";
  };

  if (isLoading)
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <Loader2 className="animate-spin text-primary" size={40} />
      </div>
    );

  if (error || !job)
    return (
      <div className="p-12 text-center">
        <AlertTriangle className="mx-auto text-red-500 mb-4" size={48} />
        <h1 className="text-xl font-bold text-slate-800">
          {error || "Lowongan tidak ditemukan"}
        </h1>
        <Link
          href="/admin/lowongan"
          className="mt-6 inline-flex bg-primary text-white px-6 py-2 rounded-md font-bold hover:bg-primary-dark transition-all shadow-lg shadow-primary/20"
        >
          Kembali
        </Link>
      </div>
    );

  return (
    <div className="p-8 font-sans max-w-7xl mx-auto min-h-screen">
      <div className="mb-6">
        <Link
          href="/admin/lowongan"
          className="inline-flex items-center gap-2 text-slate-500 hover:text-primary font-bold text-xs transition-colors group"
        >
          <ChevronLeft
            size={18}
            className="group-hover:-translate-x-1 transition-transform"
          />{" "}
          Kembali ke Manajemen Lowongan
        </Link>
      </div>

      <div className="bg-white p-8 rounded-md shadow-sm border border-slate-200 mb-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-10 opacity-[0.03] text-primary-dark">
          <ClipboardList size={180} />
        </div>
        <div className="flex flex-col lg:flex-row justify-between items-start gap-8 relative z-10">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-4">
              <span
                className={`px-3 py-1 text-[10px] font-bold uppercase rounded border ${job.category === "Medis" ? "bg-blue-50 text-blue-600 border-blue-100" : "bg-green-50 text-green-600 border-green-100"}`}
              >
                {job.category}
              </span>
              <span className="px-3 py-1 text-[10px] font-bold uppercase rounded bg-slate-100 text-slate-600 border border-slate-200">
                {job.status}
              </span>
            </div>
            <h1 className="text-4xl font-extrabold text-primary-dark tracking-tight leading-tight mb-3">
              {job.title}
            </h1>
            <div className="flex items-center flex-wrap gap-x-8 gap-y-2 text-slate-400 font-bold text-xs uppercase tracking-wider">
              <div className="flex items-center gap-2">
                <Calendar size={14} className="text-primary" /> Posted:{" "}
                {job.posted_date
                  ? new Date(job.posted_date).toLocaleDateString("id-ID", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })
                  : "-"}
              </div>
              <div className="flex items-center gap-2">
                <Clock size={14} className="text-primary" /> Deadline:{" "}
                {job.closing_date
                  ? new Date(job.closing_date).toLocaleDateString("id-ID")
                  : "Tanpa Batas"}
              </div>
            </div>
          </div>
          <div className="bg-slate-50 p-8 rounded-md border border-slate-100 text-center min-w-[180px] shadow-inner">
            <div className="text-5xl font-black text-primary mb-1 leading-none">
              {applicants.length}
            </div>
            <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">
              Total Pelamar
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 mt-10 pt-10 border-t border-slate-100">
          <div>
            <h3 className="text-xs font-bold text-primary-dark mb-4 flex items-center gap-3 uppercase tracking-widest">
              <div className="w-1.5 h-6 bg-primary rounded-full"></div>{" "}
              Deskripsi Pekerjaan
            </h3>
            <div className="space-y-3 bg-slate-50/50 p-6 rounded-md border border-slate-100 text-sm text-slate-600 leading-relaxed font-medium">
              {Array.isArray(job.deskripsi_job) ? (
                job.deskripsi_job.map((p, i) => (
                  <div key={i} className="flex gap-3">
                    <span className="text-primary font-black">•</span>{" "}
                    <p>{p}</p>
                  </div>
                ))
              ) : (
                <p>{job.deskripsi_job}</p>
              )}
            </div>
          </div>
          <div>
            <h3 className="text-xs font-bold text-primary-dark mb-4 flex items-center gap-3 uppercase tracking-widest">
              <div className="w-1.5 h-6 bg-green-500 rounded-full"></div>{" "}
              Kualifikasi Utama
            </h3>
            <div className="space-y-3 bg-slate-50/50 p-6 rounded-md border border-slate-100 text-sm text-slate-600 leading-relaxed font-medium">
              {Array.isArray(job.kualifikasi_job) ? (
                job.kualifikasi_job.map((q, i) => (
                  <div key={i} className="flex gap-3">
                    <span className="text-green-500 font-black">•</span>{" "}
                    <p>{q}</p>
                  </div>
                ))
              ) : (
                <p>{job.kualifikasi_job}</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* TAB NAVIGATION */}
      <div className="flex border-b border-slate-200 mb-8">
        <button
          onClick={() => setActiveTab("detail")}
          className={`px-6 py-4 font-bold text-sm uppercase tracking-widest transition-all border-b-2 flex items-center gap-2 ${activeTab === "detail" ? "border-primary text-primary bg-primary/5" : "border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50"}`}
        >
          <Briefcase size={16} /> Data Pelamar & Lowongan
        </button>
        <button
          onClick={() => setActiveTab("assessment")}
          className={`px-6 py-4 font-bold text-sm uppercase tracking-widest transition-all border-b-2 flex items-center gap-2 ${activeTab === "assessment" ? "border-primary text-primary bg-primary/5" : "border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50"}`}
        >
          <FileSpreadsheet size={16} /> Konfigurasi Assessment
        </button>
      </div>

      {activeTab === "detail" ? (
        <>
          {/* TABEL PELAMAR (Style Lancip & Lebar) */}
          <div className="bg-white rounded-md shadow-sm border border-slate-200 overflow-hidden mb-12">
            <div className="bg-primary-dark px-8 py-5 flex justify-between items-center">
              <h2 className="text-xs font-bold text-white uppercase tracking-[0.2em] flex items-center gap-3">
                <Users size={18} className="text-blue-300" />
                Daftar Kandidat Pelamar
              </h2>
              {selectedCandidates.length > 0 && (
                <button
                  onClick={handleBulkSendInvite}
                  disabled={isBulkInviting}
                  className="bg-emerald-500 hover:bg-emerald-400 text-white px-4 py-2 rounded text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 transition-all shadow-md active:scale-95 disabled:opacity-50"
                >
                  {isBulkInviting ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : (
                    <Mail size={14} />
                  )}
                  Kirim Undangan Massal ({selectedCandidates.length})
                </button>
              )}
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-50 text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100">
                    <th className="px-6 py-5 w-[50px] text-center">
                      <input
                        type="checkbox"
                        checked={
                          applicants.length > 0 &&
                          selectedCandidates.length === applicants.length
                        }
                        onChange={toggleSelectAll}
                        className="w-4 h-4 rounded border-slate-300 text-primary focus:ring-primary cursor-pointer accent-primary"
                      />
                    </th>
                    <th className="px-4 py-5">Nama Lengkap</th>
                    <th className="px-8 py-5">Informasi Kontak</th>
                    <th className="px-8 py-5 text-center">Tanggal Apply</th>
                    <th className="px-8 py-5 text-center">Status Pipeline</th>
                    <th className="px-8 py-5 text-center">Kecocokan</th>
                    <th className="px-8 py-5 text-center">Tindakan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {applicants.length > 0 ? (
                    applicants.map((applicant) => (
                      <tr
                        key={applicant.id}
                        className={`hover:bg-slate-50 transition-all group ${selectedCandidates.includes(applicant.id) ? "bg-blue-50/30" : ""}`}
                      >
                        <td className="px-6 py-6 text-center">
                          {(!applicant.status ||
                            ["SUBMITTED", "APPLIED", "PENDING"].includes(
                              applicant.status.toUpperCase(),
                            )) && (
                              <input
                                type="checkbox"
                                checked={selectedCandidates.includes(
                                  applicant.id,
                                )}
                                onChange={() => toggleSelect(applicant.id)}
                                className="w-4 h-4 rounded border-slate-300 text-primary focus:ring-primary cursor-pointer accent-primary"
                              />
                            )}
                        </td>
                        <td className="px-4 py-6">
                          <div className="font-bold text-slate-800 text-base tracking-tight">
                            {applicant.nama}
                          </div>
                        </td>
                        <td className="px-8 py-6">
                          <div className="text-xs font-bold text-slate-500">
                            {applicant.email}
                          </div>
                          <div className="text-[10px] text-slate-300 font-bold flex items-center gap-1.5 mt-1.5 uppercase">
                            <Phone size={10} className="text-emerald-500" />{" "}
                            {applicant.no_whatsapp}
                          </div>
                        </td>
                        <td className="px-8 py-6 text-center">
                          <span className="text-xs font-bold text-slate-400">
                            {new Date(applicant.created_at).toLocaleDateString(
                              "id-ID",
                              {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                              },
                            )}
                          </span>
                        </td>
                        <td className="px-8 py-6 text-center">
                          <span
                            className={`px-3 py-1.5 text-[9px] font-bold rounded-md border uppercase tracking-widest ${getStatusClass(applicant.status)}`}
                          >
                            {applicant.status}
                          </span>
                        </td>
                        <td className="px-8 py-6 text-center w-[150px]">
                          {applicant.suitability_match !== null &&
                            applicant.suitability_match !== undefined ? (
                            <div
                              className="flex flex-col items-center gap-1.5 cursor-pointer hover:bg-slate-100 p-2 rounded-lg transition-all"
                              onClick={() =>
                                applicant.application_status_id &&
                                handleViewScores(
                                  applicant.application_status_id,
                                  applicant.nama,
                                )
                              }
                              title="Klik untuk melihat detail skor"
                            >
                              <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                                <div
                                  className={`h-full ${Number(applicant.suitability_match) >= 80 ? "bg-emerald-500" : Number(applicant.suitability_match) >= 50 ? "bg-amber-500" : "bg-red-500"}`}
                                  style={{
                                    width: `${Math.round(Number(applicant.suitability_match))}%`,
                                  }}
                                ></div>
                              </div>
                              <span
                                className={`text-xs font-black ${Number(applicant.suitability_match) >= 80 ? "text-emerald-600" : Number(applicant.suitability_match) >= 50 ? "text-amber-600" : "text-red-600"}`}
                              >
                                {Math.round(
                                  Number(applicant.suitability_match),
                                )}
                                %
                              </span>
                            </div>
                          ) : (
                            <span className="text-xs text-slate-300 font-bold">
                              -
                            </span>
                          )}
                        </td>
                        <td className="px-8 py-6 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => handleViewCandidate(applicant.id)}
                              className="p-3 text-primary hover:text-white border border-slate-100 hover:bg-primary rounded-md shadow-sm transition-all active:scale-95"
                              title="Lihat Profil Lengkap"
                            >
                              <Eye size={18} />
                            </button>
                            {(!applicant.status ||
                              ["SUBMITTED", "APPLIED", "PENDING"].includes(
                                applicant.status.toUpperCase(),
                              )) && (
                                <>
                                  <button
                                    onClick={() => handleSendInvite(applicant.id)}
                                    disabled={invitingId === applicant.id}
                                    className="p-3 text-emerald-600 hover:text-white border border-slate-100 hover:bg-emerald-500 rounded-md shadow-sm transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                                    title="Loloskan Administrasi (Kirim Undangan Tes)"
                                  >
                                    {invitingId === applicant.id ? (
                                      <Loader2
                                        size={18}
                                        className="animate-spin"
                                      />
                                    ) : (
                                      <Mail size={18} />
                                    )}
                                  </button>
                                  <button
                                    onClick={() => handleReject(applicant.id)}
                                    disabled={rejectingId === applicant.id}
                                    className="p-3 text-rose-500 hover:text-white border border-slate-100 hover:bg-rose-500 rounded-md shadow-sm transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                                    title="Tolak Kandidat (Gagal Administrasi)"
                                  >
                                    {rejectingId === applicant.id ? (
                                      <Loader2
                                        size={18}
                                        className="animate-spin"
                                      />
                                    ) : (
                                      <XCircle size={18} />
                                    )}
                                  </button>
                                </>
                              )}

                            {(applicant.status?.toUpperCase() === 'ASSESSMENT' || applicant.status?.toUpperCase() === 'COMPLETED') && (
                              <button
                                onClick={() => handleViewAssessment(applicant.id)}
                                className="p-3 text-blue-500 hover:text-white border border-slate-100 hover:bg-blue-500 rounded-md shadow-sm transition-all active:scale-95"
                                title="Lihat Hasil Assessment"
                              >
                                <ClipboardList size={18} />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="text-center py-20">
                        <div className="flex flex-col items-center justify-center grayscale opacity-30">
                          <Users className="h-12 w-12 mb-3 text-slate-400" />
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                            Belum ada kandidat yang melamar.
                          </p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      ) : (
        <AssessmentSelector jobOpeningId={slug as string} jobId={job.job_id} />
      )}

      {/* MODAL PROFIL KANDIDAT */}
      <Modal
        isOpen={!!selectedCandidateId}
        onClose={() => setSelectedCandidateId(null)}
        title="Profil Lengkap Kandidat"
        size="5xl"
      >
        {isLoadingDetail ? (
          <div className="p-20 text-center">
            <Loader2 className="animate-spin h-10 w-10 text-primary mx-auto mb-4" />
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
              Menyinkronkan Identitas...
            </p>
          </div>
        ) : candidateDetail ? (
          <div className="flex flex-col gap-8">
            {/* HEADER PROFILE */}
            <div className="relative rounded-xl overflow-hidden border border-slate-200 shadow-sm">
              {/* Banner Background */}
              <div className="h-24 bg-gradient-to-r from-primary-dark to-primary/80"></div>

              <div className="bg-white px-6 pb-6 pt-0 relative flex flex-col md:flex-row gap-6 md:items-end -mt-12">
                {/* Photo */}
                <div className="w-24 h-24 bg-white rounded-xl border-4 border-slate-50 shadow-lg flex items-center justify-center shrink-0 overflow-hidden z-10 mx-auto md:mx-0 relative">
                  {candidateDetail.documents?.pas_foto_url ? (
                    <Image
                      src={candidateDetail.documents.pas_foto_url}
                      alt="Foto"
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <User size={40} className="text-slate-200" />
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 text-center md:text-left pt-2 md:pt-0 md:pb-1">
                  <h2 className="text-2xl font-black text-slate-800 tracking-tight uppercase mb-1">
                    {candidateDetail.nama}
                  </h2>
                  <div className="flex flex-wrap justify-center md:justify-start gap-x-6 gap-y-1 text-[11px] font-bold text-slate-500">
                    <span className="flex items-center gap-1.5">
                      <Mail size={12} className="text-primary" />{" "}
                      {candidateDetail.email}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Phone size={12} className="text-primary" />{" "}
                      {candidateDetail.no_whatsapp}
                    </span>
                  </div>
                </div>

                {/* Badges */}
                <div className="flex flex-wrap justify-center md:justify-end gap-2 md:pb-1">
                  <Badge
                    label={candidateDetail.status_pernikahan}
                    icon={Heart}
                  />
                  <Badge label={candidateDetail.agama} icon={Target} />
                  <Badge
                    label={`${new Date().getFullYear() - new Date(candidateDetail.tanggal_lahir).getFullYear()} Thn`}
                    color="primary"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 bg-slate-50/50 p-2 rounded-xl">
              {/* KOLOM KIRI */}
              <div className="space-y-4">
                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                  <h4 className="font-bold text-primary-dark text-xs mb-4 flex items-center gap-2 uppercase tracking-widest pb-3 border-b border-slate-100">
                    <div className="p-1.5 bg-blue-50 rounded text-primary">
                      <Briefcase size={14} />
                    </div>{" "}
                    Pengalaman Kerja
                  </h4>
                  <div className="space-y-5">
                    {candidateDetail.experience?.length > 0 ? (
                      candidateDetail.experience.map((exp: any, i: number) => (
                        <div
                          key={i}
                          className="relative pl-6 before:content-[''] before:absolute before:left-[5px] before:top-1.5 before:w-2 before:h-2 before:bg-primary before:rounded-full after:content-[''] after:absolute after:left-[8px] after:top-3.5 after:bottom-[-16px] after:w-[2px] after:bg-slate-100 last:after:hidden"
                        >
                          <p className="font-black text-slate-800 text-sm leading-tight">
                            {exp.jabatan_terakhir}
                          </p>
                          <p className="text-primary font-bold text-xs uppercase mt-0.5">
                            {exp.nama_instansi}
                          </p>
                          <p className="text-[10px] text-slate-400 font-bold mt-1.5 uppercase tracking-wider bg-slate-50 inline-block px-2 py-0.5 rounded border border-slate-100">
                            {exp.tahun_mulai} — {exp.tahun_selesai}
                          </p>
                        </div>
                      ))
                    ) : (
                      <div className="flex items-center gap-2 text-xs italic text-slate-400 bg-slate-50 p-3 rounded-lg">
                        <Info size={14} /> Belum ada pengalaman kerja.
                      </div>
                    )}
                  </div>
                </div>

                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                  <h4 className="font-bold text-primary-dark text-xs mb-4 flex items-center gap-2 uppercase tracking-widest pb-3 border-b border-slate-100">
                    <div className="p-1.5 bg-emerald-50 rounded text-emerald-600">
                      <GraduationCap size={14} />
                    </div>{" "}
                    Pendidikan Terakhir
                  </h4>
                  <div className="space-y-4">
                    {candidateDetail.education?.formal?.length > 0 ? (
                      candidateDetail.education.formal.map(
                        (edu: any, i: number) => (
                          <div
                            key={i}
                            className="bg-slate-50 p-4 rounded-lg border border-slate-100"
                          >
                            <p className="font-black text-slate-800 text-sm uppercase leading-tight mb-1">
                              {edu.nama_sekolah}
                            </p>
                            <div className="flex items-center gap-3">
                              <p className="text-emerald-600 font-bold text-[11px] uppercase tracking-wider">
                                Lulus {edu.tahun_lulus}
                              </p>
                              {edu.ipk && (
                                <span className="bg-white px-2 py-0.5 rounded text-[10px] border border-emerald-100 font-black text-emerald-700 shadow-sm">
                                  IPK: {edu.ipk}
                                </span>
                              )}
                            </div>
                          </div>
                        ),
                      )
                    ) : (
                      <div className="flex items-center gap-2 text-xs italic text-slate-400 bg-slate-50 p-3 rounded-lg">
                        <Info size={14} /> Belum ada data pendidikan.
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* KOLOM KANAN */}
              <div className="space-y-4">
                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                  <h4 className="font-bold text-primary-dark text-xs mb-4 flex items-center gap-2 uppercase tracking-widest pb-3 border-b border-slate-100">
                    <div className="p-1.5 bg-purple-50 rounded text-purple-600">
                      <Users size={14} />
                    </div>{" "}
                    Data Keluarga
                  </h4>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">
                        Ayah
                      </p>
                      <p className="text-xs font-bold text-slate-700 truncate">
                        {candidateDetail.parents?.nama_ayah || "-"}
                      </p>
                    </div>
                    <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">
                        Ibu
                      </p>
                      <p className="text-xs font-bold text-slate-700 truncate">
                        {candidateDetail.parents?.nama_ibu || "-"}
                      </p>
                    </div>
                    {candidateDetail.spouse && (
                      <div className="col-span-2 bg-purple-50/30 p-3 rounded-lg border border-purple-100">
                        <p className="text-[9px] font-black text-purple-400 uppercase tracking-widest mb-0.5">
                          Pasangan
                        </p>
                        <p className="text-xs font-bold text-purple-800">
                          {candidateDetail.spouse.nama}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                  <h4 className="font-bold text-primary-dark text-xs mb-4 flex items-center gap-2 uppercase tracking-widest pb-3 border-b border-slate-100">
                    <div className="p-1.5 bg-amber-50 rounded text-amber-600">
                      <FileText size={14} />
                    </div>{" "}
                    Berkas Pendukung
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {candidateDetail.documents &&
                      Object.entries(candidateDetail.documents).some(
                        ([k, v]) =>
                          v && !k.includes("id") && !k.includes("candidate"),
                      ) ? (
                      Object.entries(candidateDetail.documents).map(
                        ([k, v]) => {
                          if (!v || k.includes("id") || k.includes("candidate"))
                            return null;
                          const label = k
                            .replace("_url", "")
                            .replace("_", " ")
                            .toUpperCase();
                          return (
                            <a
                              key={k}
                              href={v as string}
                              target="_blank"
                              className="p-2.5 bg-slate-50 border border-slate-100 rounded-lg flex items-center gap-2 hover:bg-primary hover:text-white hover:border-primary transition-colors group"
                            >
                              <div className="bg-white p-1.5 rounded text-slate-400 group-hover:text-primary">
                                <Paperclip size={12} />
                              </div>
                              <span className="text-[10px] font-bold text-slate-600 uppercase truncate flex-1 group-hover:text-white">
                                {label}
                              </span>
                              <Download
                                size={14}
                                className="text-slate-300 group-hover:text-white shrink-0"
                              />
                            </a>
                          );
                        },
                      )
                    ) : (
                      <div className="col-span-2 flex items-center gap-2 text-xs italic text-slate-400 bg-slate-50 p-3 rounded-lg">
                        <Info size={14} /> Berkas belum diunggah.
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setSelectedCandidateId(null)}
                className="px-8 py-2.5 bg-slate-800 text-white font-bold rounded-lg hover:bg-slate-700 transition-all text-xs uppercase tracking-widest shadow-md"
              >
                Tutup Profil
              </button>
            </div>
          </div>
        ) : null}
      </Modal>

      {/* SCORE DETAILS MODAL */}
      <Modal
        isOpen={scoreModal.isOpen}
        onClose={() => setScoreModal((prev) => ({ ...prev, isOpen: false }))}
        title={`Detail Skor Assessment - ${scoreModal.applicantName}`}
        size="xl"
      >
        <div className="p-2 overflow-y-auto max-h-[60vh]">
          {scoreModal.isLoading ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 size={32} className="animate-spin text-primary" />
            </div>
          ) : scoreModal.details.length === 0 ? (
            <p className="text-center text-slate-500 font-medium bg-slate-50 p-6 rounded-lg">
              Tidak ada detail skor untuk kandidat ini.
            </p>
          ) : (
            <div className="space-y-3">
              {scoreModal.details.map((item, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-xl border border-slate-100 bg-slate-50 flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center"
                >
                  <div className="flex-1">
                    <p className="text-sm font-bold text-slate-700 mb-1.5">
                      {item.question}
                    </p>
                    <div className="text-xs text-slate-500 flex items-center gap-2">
                      Jawaban:{" "}
                      <span className="font-bold text-primary bg-primary/10 px-2 py-0.5 rounded border border-primary/20">
                        {item.answer_value}
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-col items-end shrink-0">
                    <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1">
                      Skor
                    </div>
                    <div
                      className={`text-xl font-black ${item.fuzzy_score >= 80 ? "text-emerald-500" : item.fuzzy_score >= 50 ? "text-amber-500" : "text-red-500"}`}
                    >
                      {Math.round(item.fuzzy_score)}%
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="mt-6 flex justify-end pt-4 border-t border-slate-100">
          <button
            onClick={() =>
              setScoreModal((prev) => ({ ...prev, isOpen: false }))
            }
            className="px-6 py-2.5 bg-slate-800 text-white font-bold rounded-lg hover:bg-slate-700 transition-all text-xs uppercase tracking-widest shadow-md"
          >
            Tutup Panel
          </button>
        </div>
      </Modal>

      {/* DIALOG MODAL (Alert & Confirm) */}
      <Modal
        isOpen={dialog.isOpen}
        onClose={() => setDialog((prev) => ({ ...prev, isOpen: false }))}
        title={dialog.title}
        size="md"
      >
        <p className="text-slate-600 font-medium mb-8 leading-relaxed text-sm">
          {dialog.message}
        </p>
        <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
          {dialog.type === "confirm" && (
            <button
              onClick={() => setDialog((prev) => ({ ...prev, isOpen: false }))}
              className="px-6 py-2.5 bg-slate-100 text-slate-600 font-bold rounded-md hover:bg-slate-200 transition-all text-xs uppercase tracking-widest"
            >
              {dialog.cancelText || "Batal"}
            </button>
          )}
          <button
            onClick={() => {
              if (dialog.onConfirm) dialog.onConfirm();
              if (dialog.type === "alert")
                setDialog((prev) => ({ ...prev, isOpen: false }));
            }}
            className={`px-6 py-2.5 text-white font-bold rounded-md transition-all text-xs uppercase tracking-widest shadow-md ${dialog.isDanger ? "bg-red-500 hover:bg-red-600 shadow-red-500/20" : "bg-primary hover:bg-primary-dark shadow-primary/20"}`}
          >
            {dialog.confirmText || "OK Mengerti"}
          </button>
        </div>
      </Modal>

      {/* INVITE MODAL DENGAN PENJADWALAN */}
      <Modal
        isOpen={inviteModal.isOpen}
        onClose={() => setInviteModal({ ...inviteModal, isOpen: false })}
        title={inviteModal.type === "single" ? "Jadwalkan & Kirim Undangan Tes" : "Jadwalkan Undangan Massal"}
        size="md"
      >
        <p className="text-slate-600 font-medium mb-4 leading-relaxed text-sm">
          {inviteModal.type === "single"
            ? `Tentukan tanggal tes psikometri untuk kandidat terpilih. Ujian hanya valid di tanggal tersebut.`
            : `Tentukan tanggal tes psikometri untuk ${selectedCandidates.length} kandidat. Ujian hanya valid di tanggal tersebut.`}
        </p>
        <div className="mb-8">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-2 block">
            Tanggal Ujian / Tes
          </label>
          <input
            type="date"
            min={new Date().toISOString().split('T')[0]}
            value={inviteModal.scheduledDate}
            onChange={(e) => setInviteModal({ ...inviteModal, scheduledDate: e.target.value })}
            className="w-full text-base py-3 px-4 bg-slate-50 border border-slate-200 rounded-md focus:bg-white focus:border-primary outline-none transition-all font-bold text-slate-800"
            required
          />
        </div>
        <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
          <button
            onClick={() => setInviteModal({ ...inviteModal, isOpen: false })}
            className="px-6 py-2.5 bg-slate-100 text-slate-600 font-bold rounded-md hover:bg-slate-200 transition-all text-xs uppercase tracking-widest"
          >
            Batal
          </button>
          <button
            onClick={async () => {
              if (!inviteModal.scheduledDate) {
                 alert("Tanggal tes harus diisi!");
                 return;
              }
              const schedDate = inviteModal.scheduledDate;
              setInviteModal({ ...inviteModal, isOpen: false });
              
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
                setDialog({
                  isOpen: true,
                  type: "alert",
                  title: "Proses Selesai",
                  message: `Selesai! Berhasil mengirim ${successCount} dari ${selectedCandidates.length} undangan tes.`,
                });
              }
            }}
            className="px-6 py-2.5 bg-primary text-white font-bold rounded-md hover:bg-primary-dark transition-all text-xs uppercase tracking-widest shadow-md shadow-primary/20"
          >
            Kirim Undangan
          </button>
        </div>
      </Modal>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #e2e8f0;
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #cbd5e1;
        }
      `}</style>
      {/* MODAL HASIL ASSESSMENT */}
      <Modal
        isOpen={!!selectedAssessmentId}
        onClose={() => setSelectedAssessmentId(null)}
        title="Hasil Psikometri Kandidat"
        size="5xl"
      >
        {isLoadingDetail ? (
          <div className="p-20 text-center">
            <Loader2 className="animate-spin h-10 w-10 text-primary mx-auto mb-4" />
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
              Memuat Hasil Evaluasi...
            </p>
          </div>
        ) : candidateDetail && candidateDetail.assessment_results ? (
          <div className="flex flex-col gap-6">
            {/* Header info */}
            <div className="bg-slate-50 p-6 rounded-xl border border-slate-100 flex items-center justify-between shadow-sm">
              <div>
                <h3 className="text-xl font-black text-slate-800 uppercase tracking-tight">
                  {candidateDetail.nama}
                </h3>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-1 font-mono">
                  Token: {candidateDetail.assessment_results.session.token}
                </p>
              </div>
              <Badge
                label={candidateDetail.assessment_results.session.status}
                color={
                  candidateDetail.assessment_results.session.status ===
                    "COMPLETED"
                    ? "success"
                    : "primary"
                }
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* MBTI Card */}
              <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm relative overflow-hidden group hover:shadow-md transition-shadow">
                <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:scale-110 transition-transform">
                  <LayoutGrid size={100} />
                </div>
                <h4 className="font-bold text-blue-600 text-[10px] mb-2 uppercase tracking-widest flex items-center gap-2">
                  <LayoutGrid size={14} /> MBTI Personality
                </h4>
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

                  const mbtiProfile = getMBTIProfileDetail(mbti.final_result);

                  return (
                    <>
                      <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 mb-5 border-b border-slate-100 pb-3">
                        <div className="flex items-baseline gap-3">
                          <h2 className="text-5xl font-black text-slate-800 tracking-tight leading-none">
                            {mbti.final_result}
                          </h2>
                          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                            Tipe Kepribadian
                          </span>
                        </div>
                        {mbtiProfile?.julukan && (
                          <span className="text-[11px] font-bold text-indigo-700 bg-indigo-50 border border-indigo-100 px-3 py-1 rounded-md self-start sm:self-auto">
                            {mbtiProfile.julukan}
                          </span>
                        )}
                      </div>
                      
                      {/* Comparison lists */}
                      <div className="space-y-3.5">
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

                      {/* Profil Detail Penjelasan MBTI */}
                      {mbtiProfile && (
                        <div className="bg-slate-50/80 p-4 rounded-lg border border-slate-200 text-xs space-y-2.5 mt-4">
                          {mbtiProfile.ciri_ciri_umum && (
                            <div className="bg-indigo-50/60 border border-indigo-100 p-2.5 rounded-md">
                              <span className="font-bold text-indigo-700 text-[10px] uppercase tracking-wider flex items-center gap-1.5 mb-1">
                                <Sparkles size={13} className="text-indigo-600 shrink-0" /> Ciri-ciri Umum
                              </span>
                              <p className="text-slate-700 text-[11px] leading-relaxed">
                                {mbtiProfile.ciri_ciri_umum}
                              </p>
                            </div>
                          )}

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 pt-1">
                            <div className="bg-emerald-50/60 border border-emerald-100 p-2.5 rounded-md">
                              <span className="font-bold text-emerald-700 text-[10px] uppercase tracking-wider flex items-center gap-1.5 mb-1">
                                <Building2 size={13} className="text-emerald-600 shrink-0" /> Kontribusi pada Organisasi
                              </span>
                              <p className="text-slate-700 text-[11px] leading-relaxed">
                                {mbtiProfile.kontribusi_pada_organisasi}
                              </p>
                            </div>

                            <div className="bg-amber-50/60 border border-amber-100 p-2.5 rounded-md">
                              <span className="font-bold text-amber-700 text-[10px] uppercase tracking-wider flex items-center gap-1.5 mb-1">
                                <AlertTriangle size={13} className="text-amber-600 shrink-0" /> Kelemahan / Area Pengembangan
                              </span>
                              <p className="text-slate-700 text-[11px] leading-relaxed">
                                {mbtiProfile.kelemahan}
                              </p>
                            </div>
                          </div>
                        </div>
                      )}
                    </>
                  );
                })() : (
                  <p className="text-xs italic text-slate-400 mt-4">
                    Belum diselesaikan.
                  </p>
                )}
              </div>

              {/* DISC Card */}
              <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm relative overflow-hidden group hover:shadow-md transition-shadow">
                <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:scale-110 transition-transform">
                  <Zap size={100} />
                </div>
                <h4 className="font-bold text-orange-500 text-[10px] mb-4 uppercase tracking-widest flex items-center gap-2">
                  <Zap size={14} /> DISC Profile
                </h4>
                {candidateDetail.assessment_results.disc ? (() => {
                  const disc = candidateDetail.assessment_results.disc;
                  const diffD = Number(disc.diff_d || 0);
                  const diffI = Number(disc.diff_i || 0);
                  const diffS = Number(disc.diff_s || 0);
                  const diffC = Number(disc.diff_c || 0);

                  const diffMap: Record<string, number> = { D: diffD, I: diffI, S: diffS, C: diffC };
                  const dims: Array<"D" | "I" | "S" | "C"> = ["D", "I", "S", "C"];
                  const positive = dims.filter(d => diffMap[d] >= 0).sort((a, b) => diffMap[b] - diffMap[a]).join("");
                  const negative = dims.filter(d => diffMap[d] < 0).sort((a, b) => diffMap[b] - diffMap[a]).join("");
                  const pattern = `${positive}/${negative}`;
                  const profileDetail = getDISCProfileDetail({ positive, negative, pattern });

                  return (
                    <div className="space-y-4">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3 bg-orange-50/30 p-3 rounded-lg border border-orange-100">
                        <div>
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Pola Tipe Profil DISC (Midline 0)</span>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-2xl font-black text-orange-600 font-mono tracking-widest">{pattern}</span>
                            {profileDetail?.karakter_utama && (
                              <span className="bg-orange-600 text-white text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-md shadow-2xs">
                                {profileDetail.karakter_utama}
                              </span>
                            )}
                          </div>
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

                      {/* Profil Detail Penjelasan */}
                      {profileDetail && (
                        <div className="bg-slate-50/80 p-4 rounded-lg border border-slate-200 text-xs space-y-2.5 mt-3">
                          <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                            <span className="font-bold text-slate-700 uppercase tracking-wider text-[11px]">
                              Klasifikasi Profil: <strong className="text-orange-600">{profileDetail.tipe}</strong>
                            </span>
                            <span className="text-[10px] font-semibold text-slate-400">
                              Karakter: <strong className="text-slate-700">{profileDetail.karakter_utama}</strong>
                            </span>
                          </div>

                          {profileDetail.deskripsi && (
                            <p className="text-slate-600 leading-relaxed">
                              {profileDetail.deskripsi}
                            </p>
                          )}

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 pt-1">
                            <div className="bg-emerald-50/60 border border-emerald-100 p-2.5 rounded-md">
                              <span className="font-bold text-emerald-700 text-[10px] uppercase tracking-wider flex items-center gap-1.5 mb-1">
                                <CheckCircle size={13} className="text-emerald-600 shrink-0" /> Kelebihan / Potensi
                              </span>
                              <p className="text-slate-700 text-[11px] leading-relaxed">
                                {profileDetail.kelebihan}
                              </p>
                            </div>

                            <div className="bg-amber-50/60 border border-amber-100 p-2.5 rounded-md">
                              <span className="font-bold text-amber-700 text-[10px] uppercase tracking-wider flex items-center gap-1.5 mb-1">
                                <AlertTriangle size={13} className="text-amber-600 shrink-0" /> Area Pengembangan / Kekurangan
                              </span>
                              <p className="text-slate-700 text-[11px] leading-relaxed">
                                {profileDetail.kekurangan}
                              </p>
                            </div>
                          </div>

                          {profileDetail.posisi_yang_sesuai && (
                            <div className="bg-blue-50/60 border border-blue-100 p-2.5 rounded-md">
                              <span className="font-bold text-[#0173b6] text-[10px] uppercase tracking-wider flex items-center gap-1.5 mb-1">
                                <Target size={13} className="text-[#0173b6] shrink-0" /> Rekomendasi Bidang / Posisi
                              </span>
                              <p className="text-slate-700 text-[11px] leading-relaxed">
                                {profileDetail.posisi_yang_sesuai}
                              </p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })() : (
                  <p className="text-xs italic text-slate-400 mt-4">
                    Belum diselesaikan.
                  </p>
                )}
              </div>
              {/* PAPI Card */}
              <div className="col-span-1 md:col-span-2 bg-white p-6 rounded-xl border border-slate-200 shadow-sm relative overflow-hidden group hover:shadow-md transition-shadow">
                <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:scale-110 transition-transform">
                  <ClipboardList size={100} />
                </div>
                <h4 className="font-bold text-emerald-600 text-[10px] mb-4 uppercase tracking-widest flex items-center gap-2 border-b border-slate-100 pb-3">
                  <ClipboardList size={14} /> PAPI Kostick (Roles & Needs Profile)
                </h4>
                {candidateDetail.assessment_results.papi ? (() => {
                  const papi = candidateDetail.assessment_results.papi;
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
                  <p className="text-xs italic text-slate-400 mt-4">
                    Belum diselesaikan.
                  </p>
                )}
              </div></div>
            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setSelectedAssessmentId(null)}
                className="px-8 py-2.5 bg-slate-800 text-white font-bold rounded-lg hover:bg-slate-700 transition-all text-xs uppercase tracking-widest shadow-md"
              >
                Tutup Laporan
              </button>
            </div>
          </div>
        ) : (
          <div className="p-10 text-center">
            <p className="text-sm font-bold text-slate-500">
              Belum ada sesi tes (Assessment) yang dibuat untuk kandidat ini
              atau tes belum dimulai.
            </p>
            <button
              onClick={() => setSelectedAssessmentId(null)}
              className="mt-4 px-6 py-2 bg-slate-100 text-slate-600 font-bold rounded-md hover:bg-slate-200 text-xs uppercase tracking-widest"
            >
              Kembali
            </button>
          </div>
        )}
      </Modal>
    </div>
  );
}
