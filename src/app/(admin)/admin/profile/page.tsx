"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { getSafeImageUrl } from "@/app/utils/imageUrl";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Briefcase,
  ShieldCheck,
  Loader2,
  AlertCircle,
  ScanFace,
  CreditCard,
  Copy,
  CheckCircle2,
  RotateCw,
  Clock,
  Stethoscope,
  Sparkles,
  Printer,
  BadgeCheck,
  HeartPulse,
  Edit3,
  Users,
  GraduationCap,
  FolderOpen,
  FileText,
  ExternalLink,
  Award,
  Building2,
  Calendar,
  ArrowRight,
  FileCheck2,
} from "lucide-react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

if (typeof window !== "undefined") {
  gsap.registerPlugin(useGSAP);
}

interface KaryawanIdentity {
  readonly id: string;
  readonly nip: string;
  readonly nama_lengkap: string;
  readonly nik: string;
  readonly email?: string | null;
  readonly handphone?: string | null;
  readonly jenis_kelamin?: string | null;
  readonly tempat_lahir?: string | null;
  readonly tanggal_lahir?: string | null;
  readonly agama?: string | null;
  readonly suku_bangsa?: string | null;
  readonly status_pernikahan?: string | null;
  readonly jumlah_anak?: number | null;
  readonly alamat?: string | null;
  readonly alamat_domisili?: string | null;
  readonly tanggal_masuk?: string | null;
  readonly status_kepegawaian?: string | null;
  readonly nama_departemen?: string | null;
  readonly nama_level?: string | null;
  readonly profesi?: string | null;
  readonly nama_atasan?: string | null;
  readonly sisa_cuti?: number | null;
  readonly rekening_bsi?: string | null;
  readonly sip?: string | null;
  readonly masa_berlaku_sip?: string | null;
  readonly has_face_descriptor?: boolean;
}

interface SpouseInfo {
  readonly nama?: string | null;
  readonly tempat_lahir?: string | null;
  readonly tanggal_lahir?: string | null;
  readonly no_hp?: string | null;
}

interface ParentsInfo {
  readonly nama_ayah?: string | null;
  readonly pekerjaan_ayah?: string | null;
  readonly nohp_ayah?: string | null;
  readonly nama_ibu?: string | null;
  readonly pekerjaan_ibu?: string | null;
  readonly nohp_ibu?: string | null;
}

interface SiblingItem {
  readonly id?: number;
  readonly nama: string;
  readonly gender?: string | null;
  readonly umur?: number | string | null;
  readonly hubungan?: string | null;
  readonly pekerjaan?: string | null;
}

interface FormalEduItem {
  readonly id?: number;
  readonly tingkat: string;
  readonly nama_sekolah: string;
  readonly jurusan?: string | null;
  readonly tahun_masuk?: number | string | null;
  readonly tahun_lulus?: number | string | null;
  readonly nomor_ijazah?: string | null;
  readonly ipk?: string | null;
}

interface NonFormalEduItem {
  readonly id?: number;
  readonly nama_lembaga: string;
  readonly jenis_kursus: string;
  readonly tahun_masuk?: number | string | null;
  readonly tahun_selesai?: number | string | null;
  readonly nomor_sertifikat?: string | null;
}

interface WorkExpItem {
  readonly id?: number;
  readonly nama_instansi: string;
  readonly jabatan_terakhir: string;
  readonly lokasi?: string | null;
  readonly lama_kerja?: string | null;
  readonly tahun_mulai?: number | string | null;
  readonly tahun_selesai?: number | string | null;
  readonly alasan_berhenti?: string | null;
}

interface DocumentsData {
  readonly pas_foto_url?: string | null;
  readonly scan_ktp_url?: string | null;
  readonly kartu_keluarga_url?: string | null;
  readonly ijazah_url?: string | null;
  readonly transkrip_url?: string | null;
  readonly cv_url?: string | null;
  readonly str_url?: string | null;
  readonly paklaring_url?: string | null;
}

interface OtherDocItem {
  readonly id?: number;
  readonly nama_dokumen: string;
  readonly file_url: string;
}

interface CompletenessData {
  readonly is_complete: boolean;
  readonly percentage: number;
  readonly missing_sections: readonly string[];
  readonly pillars: {
    readonly identity: boolean;
    readonly family: boolean;
    readonly education: boolean;
    readonly documents: boolean;
  };
}

interface FullProfilePayload {
  readonly karyawan: KaryawanIdentity;
  readonly spouse: SpouseInfo | null;
  readonly parents: ParentsInfo | null;
  readonly siblings: readonly SiblingItem[];
  readonly education: {
    readonly formal: readonly FormalEduItem[];
    readonly nonFormal: readonly NonFormalEduItem[];
  };
  readonly experience: readonly WorkExpItem[];
  readonly documents: DocumentsData | null;
  readonly otherDocuments: readonly OtherDocItem[];
  readonly completeness: CompletenessData;
}

interface AbsensiItem {
  readonly id: string;
  readonly tanggal: string;
  readonly jam_masuk?: string | null;
  readonly jam_keluar?: string | null;
  readonly menit_terlambat?: number | null;
  readonly nama_shift?: string | null;
}

type ProfileTab =
  | "pekerjaan"
  | "identitas"
  | "keluarga"
  | "pendidikan"
  | "dokumen"
  | "presensi";

const STANDARD_DOCS: readonly {
  readonly key: keyof DocumentsData;
  readonly label: string;
  readonly isMandatory: boolean;
}[] = [
  { key: "pas_foto_url", label: "Pas Foto Resmi", isMandatory: true },
  { key: "scan_ktp_url", label: "Scan KTP Elektronik", isMandatory: true },
  { key: "kartu_keluarga_url", label: "Kartu Keluarga (KK)", isMandatory: true },
  { key: "ijazah_url", label: "Ijazah Pendidikan Terakhir", isMandatory: true },
  { key: "transkrip_url", label: "Transkrip Nilai Akademik", isMandatory: false },
  { key: "cv_url", label: "Curriculum Vitae (CV)", isMandatory: false },
  { key: "str_url", label: "STR / SIP Tenaga Medis", isMandatory: false },
  { key: "paklaring_url", label: "Paklaring / Surat Pengalaman Kerja", isMandatory: false },
];

function getCutOffRange(referenceDate = new Date()) {
  const year = referenceDate.getFullYear();
  const month = referenceDate.getMonth();
  const date = referenceDate.getDate();

  let start: Date;
  let end: Date;

  if (date >= 26) {
    start = new Date(year, month, 26, 0, 0, 0);
    end = new Date(year, month + 1, 25, 23, 59, 59);
  } else {
    start = new Date(year, month - 1, 26, 0, 0, 0);
    end = new Date(year, month, 25, 23, 59, 59);
  }
  return { start, end };
}

function calculateTenure(tanggalMasuk?: string | null) {
  if (!tanggalMasuk) return null;
  const start = new Date(tanggalMasuk);
  const now = new Date();
  const diffMonths =
    (now.getFullYear() - start.getFullYear()) * 12 +
    (now.getMonth() - start.getMonth());
  if (diffMonths < 1) return "Kurang dari 1 bulan";
  const years = Math.floor(diffMonths / 12);
  const months = diffMonths % 12;
  if (years === 0) return `${months} Bulan`;
  if (months === 0) return `${years} Tahun`;
  return `${years} Tahun ${months} Bulan`;
}

function calculateAge(tanggalLahir?: string | null) {
  if (!tanggalLahir) return null;
  const birth = new Date(tanggalLahir);
  const now = new Date();
  let age = now.getFullYear() - birth.getFullYear();
  const monthDiff = now.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && now.getDate() < birth.getDate())) {
    age--;
  }
  return age > 0 ? `${age} Tahun` : null;
}

function formatDateId(dateStr?: string | null) {
  if (!dateStr) return "-";
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return String(dateStr).slice(0, 10);
  return d.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function formatWibTime(timeStr?: string | null) {
  if (!timeStr) return "-";
  const timePart = timeStr.includes(" ")
    ? timeStr.split(" ")[1]?.substring(0, 5)
    : timeStr.includes("T")
    ? timeStr.split("T")[1]?.substring(0, 5)
    : timeStr.substring(0, 5);

  if (timePart && timePart.includes(":")) {
    const [rawH, rawM] = timePart.split(":");
    if (
      rawH !== undefined &&
      rawM !== undefined &&
      !isNaN(Number(rawH)) &&
      !isNaN(Number(rawM))
    ) {
      return `${rawH.padStart(2, "0")}:${rawM.padStart(2, "0")} WIB`;
    }
  }
  return "-";
}

function BarcodeVisual({ code }: { readonly code: string }) {
  const safeCode = code || "0000000000";
  return (
    <div className="flex flex-col items-center justify-center">
      <div className="flex items-end justify-center gap-[2px] h-9 w-full max-w-[210px] px-2.5 py-1 bg-white rounded-md border border-slate-200 shadow-2xs">
        {Array.from(safeCode).map((char, index) => {
          const charCode = char.charCodeAt(0);
          const widthClass =
            charCode % 3 === 0
              ? "w-[3px]"
              : charCode % 2 === 0
                ? "w-[2px]"
                : "w-[1px]";
          const heightClass =
            index % 4 === 0 ? "h-7" : index % 3 === 0 ? "h-6" : "h-7.5";
          return (
            <div
              key={`${char}-${index}`}
              className={`bg-slate-900 ${widthClass} ${heightClass}`}
            />
          );
        })}
      </div>
      <span className="text-[10px] font-mono tracking-[0.28em] text-slate-600 mt-1.5 tabular-nums font-bold">
        {safeCode}
      </span>
    </div>
  );
}

export default function ProfilePage() {
  const router = useRouter();
  const [payload, setPayload] = useState<FullProfilePayload | null>(null);
  const [absensiList, setAbsensiList] = useState<readonly AbsensiItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isCardFlipped, setIsCardFlipped] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<ProfileTab>("pekerjaan");

  const containerRef = useRef<HTMLDivElement>(null);
  const hasAnimatedRef = useRef(false);
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "";

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      if (params.get("complete") === "1") {
        router.replace("/admin/profile/edit");
      }
    }
  }, [router]);

  useEffect(() => {
    const fetchProfileData = async () => {
      setIsLoading(true);
      setErrorMessage(null);
      try {
        const userString = localStorage.getItem("user");
        if (!userString) {
          throw new Error("Sesi berakhir, silakan login kembali.");
        }

        const user = JSON.parse(userString);
        const karyawanId = user.karyawan_id;

        if (!karyawanId) {
          throw new Error("ID Karyawan tidak terdaftar pada sesi pengguna.");
        }

        const response = await fetch(`/api/karyawan/${karyawanId}/profile-lengkap`);
        if (!response.ok) {
          throw new Error("Gagal mengambil data profil dari server.");
        }

        const data: FullProfilePayload = await response.json();
        setPayload(data);

        try {
          const absensiResponse = await fetch(`${baseUrl}/absensi/${data.karyawan.id}`);
          if (absensiResponse.ok) {
            const absensiData: AbsensiItem[] = await absensiResponse.json();
            setAbsensiList(absensiData);
          }
        } catch {
          // Non-blocking error untuk riwayat absensi
        }
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Terjadi kesalahan.";
        setErrorMessage(msg);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfileData();
  }, [baseUrl]);

  useGSAP(
    () => {
      if (isLoading || !payload || hasAnimatedRef.current) return;
      hasAnimatedRef.current = true;

      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
      tl.fromTo(
        ".gsap-header",
        { opacity: 0, y: -14 },
        { opacity: 1, y: 0, duration: 0.4, clearProps: "all" }
      )
        .fromTo(
          ".gsap-hero",
          { opacity: 0, y: 14 },
          { opacity: 1, y: 0, duration: 0.42, clearProps: "all" },
          "-=0.25"
        )
        .fromTo(
          ".gsap-kpi-card",
          { opacity: 0, y: 12 },
          { opacity: 1, y: 0, duration: 0.35, stagger: 0.06, clearProps: "all" },
          "-=0.22"
        )
        .fromTo(
          ".gsap-banner",
          { opacity: 0, y: 10 },
          { opacity: 1, y: 0, duration: 0.35, clearProps: "all" },
          "-=0.2"
        )
        .fromTo(
          ".gsap-col-left",
          { opacity: 0, x: -12 },
          { opacity: 1, x: 0, duration: 0.4, clearProps: "all" },
          "-=0.2"
        )
        .fromTo(
          ".gsap-col-right",
          { opacity: 0, x: 12 },
          { opacity: 1, x: 0, duration: 0.4, clearProps: "all" },
          "-=0.35"
        );
    },
    { scope: containerRef, dependencies: [isLoading, Boolean(payload)] }
  );

  useGSAP(
    () => {
      if (isLoading || !payload) return;
      gsap.fromTo(
        ".gsap-tab-pane",
        { opacity: 0, y: 8 },
        { opacity: 1, y: 0, duration: 0.25, ease: "power2.out", clearProps: "all" }
      );
    },
    { scope: containerRef, dependencies: [activeTab] }
  );

  const handleCopy = (text: string, label: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedField(label);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const attendanceStats = useMemo(() => {
    if (!absensiList || absensiList.length === 0) {
      return {
        totalHadir: 0,
        tepatWaktu: 0,
        terlambat: 0,
      };
    }

    const { start, end } = getCutOffRange(new Date());

    const currentCutOffRecords = absensiList.filter((item) => {
      if (!item.tanggal) return false;
      const dateOnly = item.tanggal.split("T")[0];
      const [y, m, d] = dateOnly.split("-").map(Number);
      if (isNaN(y) || isNaN(m) || isNaN(d)) return false;
      const itemDate = new Date(y, m - 1, d);
      return itemDate >= start && itemDate <= end;
    });

    const totalHadir = currentCutOffRecords.length;
    const terlambat = currentCutOffRecords.filter(
      (item) => (item.menit_terlambat ?? 0) > 0
    ).length;
    const tepatWaktu = Math.max(0, totalHadir - terlambat);

    return { totalHadir, tepatWaktu, terlambat };
  }, [absensiList]);

  const cutOffLabel = useMemo(() => {
    const { start, end } = getCutOffRange(new Date());
    const formatShort = (d: Date) =>
      d.toLocaleDateString("id-ID", { day: "numeric", month: "short" });
    return `${formatShort(start)} - ${formatShort(end)}`;
  }, []);

  const uploadedDocsCount = useMemo(() => {
    if (!payload) return 0;
    const stdCount = STANDARD_DOCS.filter(
      (doc) => Boolean(payload.documents?.[doc.key])
    ).length;
    return stdCount + (payload.otherDocuments?.length || 0);
  }, [payload]);

  if (isLoading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <div className="text-center space-y-3">
          <Loader2 className="mx-auto h-10 w-10 animate-spin text-primary" />
          <p className="text-slate-500 font-bold text-xs uppercase tracking-wider">
            Menyinkronkan Berkas Profil Pegawai RSU Avisena...
          </p>
        </div>
      </div>
    );
  }

  if (errorMessage || !payload) {
    return (
      <div className="p-6 sm:p-8 max-w-2xl mx-auto min-h-[70vh] flex items-center justify-center">
        <div className="rounded-[32px] bg-white p-8 sm:p-12 text-center border border-slate-200/80 shadow-xl w-full space-y-4">
          <AlertCircle className="mx-auto h-14 w-14 text-rose-500" />
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">
            Data Profil Tidak Ditemukan
          </h2>
          <p className="text-slate-500 text-xs sm:text-sm font-medium leading-relaxed">
            {errorMessage ||
              "Data personalia Anda belum terhubung. Silakan hubungi bagian SDM / IT RSU Avisena."}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-6 py-2.5 bg-primary hover:bg-primary-dark text-white rounded-xl font-bold text-xs uppercase tracking-wider shadow-md transition-all active:scale-[0.98]"
          >
            Muat Ulang Halaman
          </button>
        </div>
      </div>
    );
  }

  const {
    karyawan: profile,
    spouse,
    parents,
    siblings,
    education,
    experience,
    documents,
    otherDocuments,
    completeness,
  } = payload;

  const defaultProfileImg =
    profile.jenis_kelamin === "Perempuan"
      ? "/img/potrait/woman.jpg"
      : "/img/potrait/man.jpg";

  const profileImg = getSafeImageUrl(documents?.pas_foto_url, defaultProfileImg);

  const tenureText = calculateTenure(profile.tanggal_masuk);
  const ageText = calculateAge(profile.tanggal_lahir);

  return (
    <div
      ref={containerRef}
      className="p-4 sm:p-6 lg:p-8 font-sans min-h-screen space-y-6"
    >
      {/* LAYER 1: Header & Primary Action Bar */}
      <div className="gsap-header flex flex-col lg:flex-row lg:items-end justify-between gap-4 border-b border-slate-200/80 pb-5">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-primary font-extrabold text-xs uppercase tracking-widest">
            <ShieldCheck size={15} />
            <span>Human Capital &bull; Pangkalan Data Personalia</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Profil &amp; Informasi Personalia Pegawai
          </h1>
          <p className="text-slate-500 text-xs sm:text-sm font-medium max-w-2xl">
            Kartu identitas digital, data keluarga, riwayat pendidikan, berkas kepegawaian, serta ringkasan presensi cut-off RSU Avisena.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={() => window.print()}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-white hover:bg-slate-50 border border-slate-200/90 text-slate-700 rounded-xl font-bold text-xs uppercase tracking-wider transition-all shadow-2xs active:scale-[0.98] min-h-[42px] cursor-pointer"
          >
            <Printer size={14} />
            <span>Cetak ID Card</span>
          </button>

          <Link
            href="/admin/my-activity"
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-slate-100 hover:bg-slate-200/80 text-slate-700 border border-slate-200/80 rounded-xl font-bold text-xs uppercase tracking-wider transition-all active:scale-[0.98] min-h-[42px]"
          >
            <Clock size={14} />
            <span>Aktivitas Saya</span>
          </Link>

          <Link
            href="/admin/profile/edit"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#0173b6] hover:bg-[#05445e] text-white rounded-xl font-extrabold text-xs uppercase tracking-wider shadow-lg shadow-blue-900/15 transition-all active:scale-[0.98] min-h-[42px]"
          >
            <Edit3 size={15} />
            <span>Edit Informasi Diri</span>
          </Link>
        </div>
      </div>

      {/* LAYER 2: Executive Hero Banner */}
      <div className="gsap-hero relative rounded-[28px] sm:rounded-[32px] bg-white border border-slate-200/90 shadow-lg shadow-slate-200/40 overflow-hidden">
        {/* Top Medical Gradient Cover (Clean Gradient Tanpa Tulisan/Watermark Icon) */}
        <div className="h-36 sm:h-44 w-full bg-gradient-to-r from-[#03344a] via-[#025175] to-[#0173b6] relative overflow-hidden">
          <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#ffffff_1.2px,transparent_1.2px)] [background-size:16px_16px]" />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/25 via-transparent to-transparent" />
        </div>

        {/* Bottom Identity Bar */}
        <div className="px-6 sm:px-8 pb-6 pt-3 flex flex-col lg:flex-row lg:items-end justify-between gap-5 relative">
          <div className="flex flex-col sm:flex-row items-center sm:items-end gap-5 -mt-16 sm:-mt-20 text-center sm:text-left">
            <div className="relative h-28 w-28 sm:h-32 sm:w-32 rounded-[26px] border-[6px] border-white bg-white shadow-2xl overflow-hidden shrink-0">
              <Image
                src={profileImg}
                alt={profile.nama_lengkap}
                width={140}
                height={140}
                className="h-full w-full object-cover"
                unoptimized
              />
            </div>

            <div className="space-y-2 pb-0.5">
              <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight text-center sm:text-left">
                {profile.nama_lengkap}
              </h2>

              <div className="flex items-center justify-center sm:justify-start flex-wrap gap-2 text-xs">
                <span className="px-2.5 py-1 bg-[#0173b6] text-white font-bold uppercase tracking-wider rounded-lg shadow-2xs text-[11px]">
                  {profile.profesi || profile.nama_level || "Staf RSU Avisena"}
                </span>
                <span className="text-slate-300">&bull;</span>
                <span className="text-slate-700 font-bold uppercase tracking-wider text-[11px]">
                  {profile.nama_departemen || "Unit RSU Avisena"}
                </span>
                <span className="text-slate-300">&bull;</span>
                <span className="text-slate-600 font-mono font-bold tabular-nums text-[11px]">
                  NIP: {profile.nip}
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center sm:justify-end gap-2.5">
            <button
              type="button"
              onClick={() => handleCopy(profile.nip, "NIP_HERO")}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 rounded-xl font-bold text-xs uppercase tracking-wider transition-all active:scale-[0.98] cursor-pointer"
            >
              {copiedField === "NIP_HERO" ? (
                <>
                  <CheckCircle2 size={14} className="text-emerald-600" />
                  <span className="text-emerald-700 font-bold">NIP Tersalin</span>
                </>
              ) : (
                <>
                  <Copy size={14} className="text-slate-400" />
                  <span>Salin NIP</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* LAYER 3: 4-Grid KPI Executive Summary Ribbon */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {/* KPI 1: Skor Kelengkapan Berkas */}
        <div className="gsap-kpi-card rounded-2xl bg-white p-5 border border-slate-200/80 shadow-xs flex items-center justify-between gap-4">
          <div className="space-y-1">
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Kelengkapan Berkas
            </p>
            <div className="flex items-baseline gap-2">
              <p className="text-2xl font-black text-slate-900 font-mono tabular-nums">
                {completeness.percentage}%
              </p>
              <span
                className={`badge badge-xs font-bold uppercase tracking-wider py-2 px-2 ${
                  completeness.is_complete
                    ? "badge-success text-white"
                    : "badge-warning text-amber-950"
                }`}
              >
                {completeness.is_complete ? "Lengkap" : "Perlu Dilengkapi"}
              </span>
            </div>
            <p className="text-[11px] text-slate-500 font-medium">
              4 Kategori Berkas Wajib
            </p>
          </div>
          <div
            className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border ${
              completeness.is_complete
                ? "bg-emerald-50 border-emerald-200 text-emerald-600"
                : "bg-amber-50 border-amber-200 text-amber-600"
            }`}
          >
            <FileCheck2 size={22} />
          </div>
        </div>

        {/* KPI 2: Kehadiran Cut-Off 26-25 */}
        <div className="gsap-kpi-card rounded-2xl bg-white p-5 border border-slate-200/80 shadow-xs flex items-center justify-between gap-4">
          <div className="space-y-1">
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Hadir Cut-Off ({cutOffLabel})
            </p>
            <div className="flex items-baseline gap-2">
              <p className="text-2xl font-black text-slate-900 font-mono tabular-nums">
                {attendanceStats.totalHadir}
              </p>
              <span className="text-xs font-bold text-slate-500">Hari</span>
            </div>
            <p className="text-[11px] text-emerald-700 font-bold font-mono tabular-nums">
              {attendanceStats.tepatWaktu} Tepat Waktu &bull; {attendanceStats.terlambat} Terlambat
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-200 text-[#0173b6] flex items-center justify-center shrink-0">
            <Clock size={22} />
          </div>
        </div>

        {/* KPI 3: Sisa Kuota Cuti */}
        <div className="gsap-kpi-card rounded-2xl bg-white p-5 border border-slate-200/80 shadow-xs flex items-center justify-between gap-4">
          <div className="space-y-1">
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Sisa Kuota Cuti Tahunan
            </p>
            <div className="flex items-baseline gap-2">
              <p className="text-2xl font-black text-slate-900 font-mono tabular-nums">
                {profile.sisa_cuti ?? 0}
              </p>
              <span className="text-xs font-bold text-slate-500">/ 12 Hari</span>
            </div>
            <p className="text-[11px] text-slate-500 font-medium font-mono tabular-nums">
              Terpakai: {Math.max(0, 12 - (profile.sisa_cuti ?? 0))} Hari
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center shrink-0">
            <Calendar size={22} />
          </div>
        </div>

        {/* KPI 4: Dokumen & Biometrik */}
        <div className="gsap-kpi-card rounded-2xl bg-white p-5 border border-slate-200/80 shadow-xs flex items-center justify-between gap-4">
          <div className="space-y-1">
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Arsip Digital &amp; Biometrik
            </p>
            <div className="flex items-baseline gap-2">
              <p className="text-2xl font-black text-slate-900 font-mono tabular-nums">
                {uploadedDocsCount}
              </p>
              <span className="text-xs font-bold text-slate-500">Berkas Terunggah</span>
            </div>
            <p
              className={`text-[11px] font-bold ${
                profile.has_face_descriptor ? "text-emerald-600" : "text-amber-600"
              }`}
            >
              {profile.has_face_descriptor
                ? "Wajah Kiosk Terdaftar"
                : "Wajah Kiosk Belum Terdaftar"}
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-slate-100 border border-slate-200 text-slate-700 flex items-center justify-center shrink-0">
            <FolderOpen size={22} />
          </div>
        </div>
      </div>

      {/* LAYER 4: Checklist Ringkas Status 4 Pilar Berkas */}
      <div
        className={`gsap-banner rounded-2xl p-4 sm:p-5 border shadow-2xs ${
          completeness.is_complete
            ? "bg-emerald-50/60 border-emerald-200"
            : "bg-amber-50/50 border-amber-200/80"
        }`}
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-slate-200/60">
          <div className="flex items-center gap-2">
            <span
              className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold font-mono tabular-nums ${
                completeness.is_complete
                  ? "bg-emerald-600 text-white"
                  : "bg-amber-500 text-white"
              }`}
            >
              {completeness.is_complete ? (
                <CheckCircle2 size={12} />
              ) : (
                <AlertCircle size={12} />
              )}
              <span>{completeness.percentage}% Lengkap</span>
            </span>
            <p className="text-xs font-bold text-slate-800">
              {completeness.is_complete
                ? "Seluruh data profil dan berkas wajib telah lengkap"
                : "Pemeriksaan kelengkapan berkas wajib personalia"}
            </p>
          </div>
          <span className="text-[11px] text-slate-500 font-medium">
            Klik kategori di bawah untuk menuju form pengisian
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 pt-3">
          {[
            {
              label: "1. Identitas & Kontak",
              ok: completeness.pillars.identity,
              step: "identitas",
            },
            {
              label: "2. Data Keluarga",
              ok: completeness.pillars.family,
              step: "keluarga",
            },
            {
              label: "3. Pendidikan Formal",
              ok: completeness.pillars.education,
              step: "pendidikan",
            },
            {
              label: "4. Dokumen Utama",
              ok: completeness.pillars.documents,
              step: "dokumen",
            },
          ].map((pillar) => (
            <Link
              key={pillar.label}
              href={`/admin/profile/edit?step=${pillar.step}`}
              className={`flex items-center justify-between gap-2 px-3 py-2 rounded-xl border text-xs font-bold transition-all hover:shadow-2xs ${
                pillar.ok
                  ? "bg-white border-emerald-200 text-emerald-800 hover:border-emerald-300"
                  : "bg-white border-amber-200 text-slate-800 hover:border-primary"
              }`}
            >
              <div className="flex items-center gap-2 min-w-0">
                {pillar.ok ? (
                  <CheckCircle2 size={14} className="text-emerald-600 shrink-0" />
                ) : (
                  <AlertCircle size={14} className="text-amber-500 shrink-0" />
                )}
                <span className="truncate">{pillar.label}</span>
              </div>
              <ArrowRight size={12} className="text-slate-400 shrink-0" />
            </Link>
          ))}
        </div>
      </div>

      {/* LAYER 5: 2-Column Main Dossier Layout (4 Cols ID Card + 8 Cols 6-Tab Read-Only Dossier) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start pb-8">
        {/* LEFT COLUMN (4 Cols): Hospital Identity Pass & Biometric Kiosk */}
        <div className="gsap-col-left lg:col-span-4 space-y-6">
          {/* Kartu Tanda Pengenal Digital Pegawai RSU Avisena */}
          <div className="rounded-[32px] bg-white p-6 shadow-lg shadow-slate-200/50 border border-slate-200/90 relative overflow-hidden text-center">
            <div className="w-14 h-2.5 rounded-full bg-slate-200 border border-slate-300 mx-auto mb-4 shadow-inner flex items-center justify-center">
              <div className="w-8 h-1 bg-slate-300/80 rounded-full" />
            </div>

            <div className="relative min-h-[410px] flex flex-col justify-between">
              {!isCardFlipped ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <div className="flex items-center gap-2 text-left">
                      <div className="h-8 w-8 rounded-xl bg-primary text-white flex items-center justify-center shadow-xs font-black text-sm">
                        +
                      </div>
                      <div>
                        <p className="text-xs font-extrabold text-slate-900 tracking-wider uppercase leading-none">
                          RSU Avisena
                        </p>
                        <p className="text-[9px] font-bold text-primary tracking-widest uppercase mt-0.5">
                          Hospital Identity Pass
                        </p>
                      </div>
                    </div>
                    <span className="badge badge-sm badge-success font-mono font-bold text-[10px] text-white">
                      VERIFIED
                    </span>
                  </div>

                  <div className="py-1 px-3 bg-gradient-to-r from-blue-100 via-sky-50 to-blue-100 rounded-lg border border-blue-200 text-[10px] font-bold text-primary tracking-wider uppercase flex items-center justify-between">
                    <span>Tenaga Resmi Rumah Sakit</span>
                    <Sparkles size={11} className="text-amber-500" />
                  </div>

                  <div className="relative inline-block my-1">
                    <div className="w-28 h-28 rounded-2xl border-4 border-slate-100 shadow-lg overflow-hidden mx-auto bg-slate-100">
                      <Image
                        src={profileImg}
                        alt={profile.nama_lengkap}
                        width={112}
                        height={112}
                        className="w-full h-full object-cover"
                        unoptimized
                      />
                    </div>
                    <div className="absolute -bottom-2 -right-2 p-1.5 bg-primary text-white rounded-xl shadow-md">
                      <ShieldCheck size={16} />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <h3 className="text-base font-extrabold text-slate-900 tracking-tight leading-tight">
                      {profile.nama_lengkap}
                    </h3>
                    <p className="text-xs font-bold text-primary">
                      {profile.profesi || profile.nama_level || "Staf Medis"}
                    </p>
                    <p className="text-[11px] font-medium text-slate-500">
                      {profile.nama_departemen || "RSU Avisena"}
                    </p>
                  </div>

                  <div className="pt-2">
                    <BarcodeVisual code={profile.nip} />
                  </div>
                </div>
              ) : (
                <div className="space-y-4 py-1 text-left">
                  <div className="h-8 bg-slate-900 rounded-lg -mx-2 shadow-inner flex items-center px-4">
                    <div className="h-2 w-full bg-slate-800 rounded" />
                  </div>

                  <div className="text-center pb-2 border-b border-slate-100">
                    <p className="text-[11px] font-extrabold text-slate-800 uppercase tracking-wider">
                      Ketentuan Pegawai RSU Avisena
                    </p>
                  </div>

                  <div className="text-[11px] text-slate-600 space-y-2 leading-relaxed bg-slate-50 p-3.5 rounded-xl border border-slate-200/80">
                    <p>1. Kartu ini merupakan tanda pengenal resmi pegawai RSU Avisena.</p>
                    <p>2. Wajib dikenakan selama bertugas di lingkungan rumah sakit.</p>
                    <p>3. Jika menemukan kartu ini, harap kembalikan ke Bagian Human Capital RSU Avisena.</p>
                  </div>

                  <div className="space-y-1 text-[11px] pt-1">
                    <p className="font-bold text-slate-900">Alamat Rumah Sakit:</p>
                    <p className="text-slate-500 leading-snug">
                      Jl. Melong Asih No. 153, Cimahi Selatan, Kota Cimahi, Jawa Barat
                    </p>
                    <p className="text-primary font-bold pt-1">
                      Layanan SDM: Ext. 104 / (022) 6052200
                    </p>
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400 font-mono tabular-nums">
                    <span>UUID: {profile.id.substring(0, 16)}...</span>
                    <span className="font-bold text-slate-600">CHIP: RFID-AVISENA</span>
                  </div>
                </div>
              )}
            </div>

            <div className="mt-5 pt-4 border-t border-slate-100 grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setIsCardFlipped(!isCardFlipped)}
                className="inline-flex items-center justify-center gap-1.5 py-2.5 px-3 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-xl font-bold text-xs uppercase tracking-wider border border-slate-200/80 transition-all active:scale-[0.98] min-h-[40px] cursor-pointer"
              >
                <RotateCw size={14} className="text-slate-500" />
                <span>{isCardFlipped ? "Sisi Depan" : "Sisi Belakang"}</span>
              </button>

              <button
                type="button"
                onClick={() => handleCopy(profile.nip, "NIP_BADGE")}
                className="inline-flex items-center justify-center gap-1.5 py-2.5 px-3 bg-[#05445e] hover:bg-[#0173b6] text-white rounded-xl font-bold text-xs uppercase tracking-wider transition-all active:scale-[0.98] shadow-xs min-h-[40px] cursor-pointer"
              >
                {copiedField === "NIP_BADGE" ? (
                  <>
                    <CheckCircle2 size={14} className="text-emerald-300" />
                    <span>Tersalin</span>
                  </>
                ) : (
                  <>
                    <Copy size={14} />
                    <span>Salin NIP</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Card: Akses Biometrik Wajah Kiosk */}
          <div className="rounded-[28px] bg-slate-900 p-6 text-white shadow-xl relative overflow-hidden space-y-4 border border-slate-800">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <h3 className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">
                  Biometrik Wajah Kiosk
                </h3>
                <p className="text-base font-extrabold tracking-tight text-white flex items-center gap-2">
                  <span>
                    {profile.has_face_descriptor ? "Terdaftar & Aktif" : "Belum Terdaftar"}
                  </span>
                  <span
                    className={`inline-block w-2 h-2 rounded-full ${
                      profile.has_face_descriptor
                        ? "bg-emerald-400 animate-pulse"
                        : "bg-rose-400"
                    }`}
                  />
                </p>
              </div>
              <div
                className={`h-10 w-10 rounded-xl flex items-center justify-center ${
                  profile.has_face_descriptor
                    ? "bg-emerald-500/20 text-emerald-400"
                    : "bg-rose-500/20 text-rose-400"
                }`}
              >
                <ScanFace size={20} />
              </div>
            </div>

            <p className="text-[11px] text-slate-400 leading-relaxed font-medium">
              {profile.has_face_descriptor
                ? "Wajah Anda terverifikasi untuk absensi kamera otomatis pada tablet kiosk RSU Avisena."
                : "Daftarkan rekaman wajah Anda agar dapat melakukan absensi pada tablet kiosk di pintu masuk rumah sakit."}
            </p>

            <Link
              href={`/admin/pegawai/enroll-face?nip=${profile.nip}`}
              className={`block w-full text-center font-bold text-xs uppercase tracking-wider py-3 rounded-xl transition-all active:scale-[0.98] min-h-[42px] ${
                profile.has_face_descriptor
                  ? "bg-white/10 hover:bg-white/20 text-white"
                  : "bg-primary hover:bg-primary-dark text-white shadow-xs"
              }`}
            >
              {profile.has_face_descriptor
                ? "Perbarui Rekaman Wajah"
                : "Daftarkan Wajah Sekarang"}
            </Link>
          </div>
        </div>

        {/* RIGHT COLUMN (8 Cols): Comprehensive Read-Only Dossier with 6 Tabs */}
        <div className="gsap-col-right lg:col-span-8">
          <div className="rounded-[32px] bg-white p-6 sm:p-8 shadow-lg shadow-slate-200/50 border border-slate-200/90 space-y-6">
            {/* Header Dossier & Quick Edit CTA */}
            <div className="pb-4 border-b border-slate-100">
              <div className="space-y-1">
                <h3 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
                  <div className="h-6 w-1.5 bg-[#0173b6] rounded-full" />
                  <span>Informasi &amp; Berkas Pegawai</span>
                </h3>
                <p className="text-xs text-slate-500 font-medium">
                  Tampilan baca (read-only) untuk seluruh data kepegawaian, keluarga, pendidikan, pengalaman, dan dokumen digital.
                </p>
              </div>
            </div>

            {/* 6 Segmented Dossier Tabs */}
            <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-1.5 p-1.5 bg-slate-100/90 rounded-2xl border border-slate-200/80 text-xs">
              {[
                { id: "pekerjaan" as const, label: "Penugasan", icon: Briefcase },
                { id: "identitas" as const, label: "Identitas", icon: User },
                { id: "keluarga" as const, label: "Keluarga", icon: Users },
                { id: "pendidikan" as const, label: "Pendidikan", icon: GraduationCap },
                { id: "dokumen" as const, label: "Berkas & Karir", icon: FolderOpen },
                { id: "presensi" as const, label: "Presensi", icon: Clock },
              ].map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center justify-center gap-1.5 py-2.5 px-2.5 rounded-xl font-bold transition-all min-h-[40px] cursor-pointer ${
                      isActive
                        ? "bg-white text-[#0173b6] shadow-xs border border-slate-200/60"
                        : "text-slate-600 hover:text-slate-900 hover:bg-white/50"
                    }`}
                  >
                    <Icon size={14} className="shrink-0" />
                    <span className="truncate">{tab.label}</span>
                  </button>
                );
              })}
            </div>

            {/* TAB CONTENT PANE */}
            <div className="gsap-tab-pane min-h-[380px]">
              {/* TAB 1: PENUGASAN & SIP */}
              {activeTab === "pekerjaan" && (
                <div className="space-y-6">
                  <div className="space-y-4">
                    <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-500 flex items-center gap-2">
                      <Briefcase size={14} className="text-primary" />
                      <span>Penugasan, Unit Kerja &amp; Penggajian</span>
                    </h4>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="p-4 bg-slate-50/80 rounded-2xl border border-slate-200/90 space-y-1">
                        <p className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">
                          Nomor Induk Pegawai (NIP)
                        </p>
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-bold text-slate-900 font-mono tabular-nums">
                            {profile.nip}
                          </p>
                          <button
                            type="button"
                            onClick={() => handleCopy(profile.nip, "NIP_GRID")}
                            className="p-1 text-slate-400 hover:text-primary transition-colors cursor-pointer"
                            title="Salin NIP"
                          >
                            {copiedField === "NIP_GRID" ? (
                              <CheckCircle2 size={14} className="text-emerald-600" />
                            ) : (
                              <Copy size={14} />
                            )}
                          </button>
                        </div>
                      </div>

                      <div className="p-4 bg-slate-50/80 rounded-2xl border border-slate-200/90 space-y-1">
                        <p className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">
                          Jabatan &amp; Profesi
                        </p>
                        <p className="text-sm font-bold text-slate-900">
                          {profile.profesi || profile.nama_level || "-"}
                        </p>
                      </div>

                      <div className="p-4 bg-slate-50/80 rounded-2xl border border-slate-200/90 space-y-1">
                        <p className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">
                          Departemen / Unit Kerja
                        </p>
                        <p className="text-sm font-bold text-slate-900">
                          {profile.nama_departemen || "-"}
                        </p>
                      </div>

                      <div className="p-4 bg-slate-50/80 rounded-2xl border border-slate-200/90 space-y-1">
                        <p className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">
                          Atasan Langsung (Supervisor)
                        </p>
                        <p className="text-sm font-bold text-slate-900">
                          {profile.nama_atasan || "-"}
                        </p>
                      </div>

                      <div className="p-4 bg-slate-50/80 rounded-2xl border border-slate-200/90 space-y-1">
                        <p className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">
                          Tanggal Bergabung &amp; Masa Kerja
                        </p>
                        <p className="text-sm font-bold text-slate-900 font-mono tabular-nums">
                          {formatDateId(profile.tanggal_masuk)}
                        </p>
                        {tenureText && (
                          <p className="text-xs text-slate-500 font-medium">
                            Masa Kerja: {tenureText}
                          </p>
                        )}
                      </div>

                      <div className="p-4 bg-slate-50/80 rounded-2xl border border-slate-200/90 space-y-1">
                        <p className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                          <CreditCard size={12} className="text-emerald-600" />
                          <span>Rekening Payroll (BSI)</span>
                        </p>
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-bold text-slate-900 font-mono tabular-nums">
                            {profile.rekening_bsi || "Belum Terdaftar"}
                          </p>
                          {profile.rekening_bsi && (
                            <button
                              type="button"
                              onClick={() =>
                                handleCopy(profile.rekening_bsi!, "BSI_GRID")
                              }
                              className="p-1 text-slate-400 hover:text-primary transition-colors cursor-pointer"
                            >
                              {copiedField === "BSI_GRID" ? (
                                <CheckCircle2 size={14} className="text-emerald-600" />
                              ) : (
                                <Copy size={14} />
                              )}
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Kredensial Medis (SIP / STR) */}
                  <div className="space-y-3 pt-4 border-t border-slate-100">
                    <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-500 flex items-center gap-2">
                      <Stethoscope size={14} className="text-primary" />
                      <span>Kredensial Medis &amp; Surat Izin Praktik (SIP)</span>
                    </h4>
                    <div className="p-4 bg-blue-50/60 rounded-2xl border border-blue-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="space-y-0.5">
                        <p className="text-[10px] font-extrabold text-primary uppercase tracking-wider">
                          Nomor Surat Izin Praktik (SIP)
                        </p>
                        <p className="text-sm font-bold text-slate-900 font-mono tabular-nums">
                          {profile.sip || "Tidak / Belum Terdaftar"}
                        </p>
                      </div>
                      <div className="sm:text-right space-y-0.5">
                        <p className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">
                          Masa Berlaku SIP
                        </p>
                        <p className="text-xs font-bold text-slate-800 font-mono tabular-nums">
                          {profile.masa_berlaku_sip
                            ? formatDateId(profile.masa_berlaku_sip)
                            : "-"}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: IDENTITAS PRIBADI & KONTAK */}
              {activeTab === "identitas" && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-500 flex items-center gap-2">
                      <User size={14} className="text-primary" />
                      <span>Biodata Kependudukan &amp; Kontak</span>
                    </h4>
                    <Link
                      href="/admin/profile/edit?step=identitas"
                      className="text-xs font-bold text-[#0173b6] hover:underline inline-flex items-center gap-1"
                    >
                      <Edit3 size={12} />
                      <span>Ubah Identitas</span>
                    </Link>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div className="p-4 bg-slate-50/80 rounded-2xl border border-slate-200/90 space-y-1">
                      <p className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">
                        Nomor Induk Kependudukan (NIK)
                      </p>
                      <p className="text-sm font-bold text-slate-900 font-mono tabular-nums">
                        {profile.nik || "-"}
                      </p>
                    </div>

                    <div className="p-4 bg-slate-50/80 rounded-2xl border border-slate-200/90 space-y-1">
                      <p className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">
                        Tempat, Tanggal Lahir
                      </p>
                      <p className="text-sm font-bold text-slate-900">
                        {profile.tempat_lahir || "-"},{" "}
                        <span className="font-mono tabular-nums">
                          {formatDateId(profile.tanggal_lahir)}
                        </span>
                      </p>
                      {ageText && (
                        <p className="text-[11px] text-slate-500 font-mono tabular-nums">
                          Usia: {ageText}
                        </p>
                      )}
                    </div>

                    <div className="p-4 bg-slate-50/80 rounded-2xl border border-slate-200/90 space-y-1">
                      <p className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">
                        Jenis Kelamin
                      </p>
                      <p className="text-sm font-bold text-slate-900">
                        {profile.jenis_kelamin || "-"}
                      </p>
                    </div>

                    <div className="p-4 bg-slate-50/80 rounded-2xl border border-slate-200/90 space-y-1">
                      <p className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">
                        Agama &amp; Suku Bangsa
                      </p>
                      <p className="text-sm font-bold text-slate-900">
                        {profile.agama || "-"}
                        {profile.suku_bangsa ? ` • ${profile.suku_bangsa}` : ""}
                      </p>
                    </div>

                    <div className="p-4 bg-slate-50/80 rounded-2xl border border-slate-200/90 space-y-1">
                      <p className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">
                        Status Pernikahan &amp; Anak
                      </p>
                      <p className="text-sm font-bold text-slate-900">
                        {profile.status_pernikahan || "-"}
                        {profile.jumlah_anak !== null &&
                        profile.jumlah_anak !== undefined
                          ? ` (${profile.jumlah_anak} Anak)`
                          : ""}
                      </p>
                    </div>

                    <div className="p-4 bg-slate-50/80 rounded-2xl border border-slate-200/90 space-y-1">
                      <p className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">
                        WhatsApp &amp; Email Aktif
                      </p>
                      <p className="text-sm font-bold text-slate-900 font-mono tabular-nums">
                        {profile.handphone || "-"}
                      </p>
                      <p className="text-xs text-slate-500 truncate">
                        {profile.email || "-"}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="p-4 bg-slate-50/80 rounded-2xl border border-slate-200/90 space-y-1.5">
                      <p className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                        <MapPin size={13} className="text-primary" />
                        <span>Alamat Sesuai KTP</span>
                      </p>
                      <p className="text-xs sm:text-sm font-medium text-slate-800 leading-relaxed">
                        {profile.alamat || "Belum dilengkapi."}
                      </p>
                    </div>

                    <div className="p-4 bg-slate-50/80 rounded-2xl border border-slate-200/90 space-y-1.5">
                      <p className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                        <MapPin size={13} className="text-emerald-600" />
                        <span>Alamat Domisili Saat Ini</span>
                      </p>
                      <p className="text-xs sm:text-sm font-medium text-slate-800 leading-relaxed">
                        {profile.alamat_domisili ||
                          profile.alamat ||
                          "Belum dilengkapi."}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: DATA KELUARGA */}
              {activeTab === "keluarga" && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-500 flex items-center gap-2">
                      <Users size={14} className="text-primary" />
                      <span>Data Orang Tua, Pasangan &amp; Saudara Kandung</span>
                    </h4>
                    <Link
                      href="/admin/profile/edit?step=keluarga"
                      className="text-xs font-bold text-[#0173b6] hover:underline inline-flex items-center gap-1"
                    >
                      <Edit3 size={12} />
                      <span>Perbarui Data Keluarga</span>
                    </Link>
                  </div>

                  {/* Orang Tua Kandung */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200/90 space-y-2">
                      <span className="badge badge-sm bg-blue-100 text-[#0173b6] border-0 font-bold uppercase text-[10px]">
                        Ayah Kandung
                      </span>
                      <p className="text-sm font-extrabold text-slate-900">
                        {parents?.nama_ayah || "Belum diisi"}
                      </p>
                      <div className="text-xs text-slate-600 space-y-0.5">
                        <p>Pekerjaan: {parents?.pekerjaan_ayah || "-"}</p>
                        <p className="font-mono tabular-nums">
                          No. HP: {parents?.nohp_ayah || "-"}
                        </p>
                      </div>
                    </div>

                    <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200/90 space-y-2">
                      <span className="badge badge-sm bg-emerald-100 text-emerald-800 border-0 font-bold uppercase text-[10px]">
                        Ibu Kandung
                      </span>
                      <p className="text-sm font-extrabold text-slate-900">
                        {parents?.nama_ibu || "Belum diisi"}
                      </p>
                      <div className="text-xs text-slate-600 space-y-0.5">
                        <p>Pekerjaan: {parents?.pekerjaan_ibu || "-"}</p>
                        <p className="font-mono tabular-nums">
                          No. HP: {parents?.nohp_ibu || "-"}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Pasangan (Suami / Istri) */}
                  <div className="p-4 rounded-2xl bg-blue-50/40 border border-blue-200/70 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-extrabold uppercase tracking-wider text-slate-700">
                        Data Pasangan (Suami / Istri)
                      </span>
                      <span className="text-[11px] font-bold text-slate-500">
                        Status: {profile.status_pernikahan || "-"}
                      </span>
                    </div>
                    {spouse?.nama ? (
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                        <div>
                          <p className="text-[10px] font-bold uppercase text-slate-400">
                            Nama Lengkap
                          </p>
                          <p className="text-sm font-bold text-slate-900">
                            {spouse.nama}
                          </p>
                        </div>
                        <div>
                          <p className="text-[10px] font-bold uppercase text-slate-400">
                            Tempat, Tanggal Lahir
                          </p>
                          <p className="text-xs font-bold text-slate-800">
                            {spouse.tempat_lahir || "-"},{" "}
                            <span className="font-mono tabular-nums">
                              {formatDateId(spouse.tanggal_lahir)}
                            </span>
                          </p>
                        </div>
                        <div>
                          <p className="text-[10px] font-bold uppercase text-slate-400">
                            Nomor Telepon / HP
                          </p>
                          <p className="text-xs font-bold text-slate-800 font-mono tabular-nums">
                            {spouse.no_hp || "-"}
                          </p>
                        </div>
                      </div>
                    ) : (
                      <p className="text-xs text-slate-500">
                        Tidak ada data pasangan terdaftar.
                      </p>
                    )}
                  </div>

                  {/* Saudara Kandung */}
                  <div className="space-y-3">
                    <h5 className="text-xs font-extrabold uppercase tracking-wider text-slate-500">
                      Daftar Saudara Kandung ({siblings.length})
                    </h5>
                    {siblings.length === 0 ? (
                      <div className="p-6 text-center rounded-2xl bg-slate-50 border border-dashed border-slate-200">
                        <p className="text-xs text-slate-500 font-medium">
                          Belum ada data saudara kandung yang dicatat.
                        </p>
                      </div>
                    ) : (
                      <div className="overflow-x-auto rounded-2xl border border-slate-200/80">
                        <table className="w-full text-left text-xs">
                          <thead className="bg-slate-100 text-slate-600 font-bold uppercase text-[11px]">
                            <tr>
                              <th className="px-4 py-2.5">Nama Saudara</th>
                              <th className="px-4 py-2.5">Hubungan</th>
                              <th className="px-4 py-2.5">L/P</th>
                              <th className="px-4 py-2.5">Usia</th>
                              <th className="px-4 py-2.5">Pekerjaan</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {siblings.map((sib, idx) => (
                              <tr key={sib.id ?? idx} className="hover:bg-slate-50/80">
                                <td className="px-4 py-2.5 font-bold text-slate-900">
                                  {sib.nama}
                                </td>
                                <td className="px-4 py-2.5 text-slate-600">
                                  {sib.hubungan || "-"}
                                </td>
                                <td className="px-4 py-2.5 text-slate-600">
                                  {sib.gender || "-"}
                                </td>
                                <td className="px-4 py-2.5 font-mono tabular-nums text-slate-700">
                                  {sib.umur ? `${sib.umur} Thn` : "-"}
                                </td>
                                <td className="px-4 py-2.5 text-slate-600">
                                  {sib.pekerjaan || "-"}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* TAB 4: PENDIDIKAN & PELATIHAN */}
              {activeTab === "pendidikan" && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-500 flex items-center gap-2">
                      <GraduationCap size={14} className="text-primary" />
                      <span>Riwayat Pendidikan Formal &amp; Pelatihan</span>
                    </h4>
                    <Link
                      href="/admin/profile/edit?step=pendidikan"
                      className="text-xs font-bold text-[#0173b6] hover:underline inline-flex items-center gap-1"
                    >
                      <Edit3 size={12} />
                      <span>Kelola Pendidikan</span>
                    </Link>
                  </div>

                  {/* Pendidikan Formal */}
                  <div className="space-y-3">
                    <h5 className="text-xs font-extrabold uppercase tracking-wider text-slate-600">
                      Pendidikan Formal ({education.formal.length})
                    </h5>
                    {education.formal.length === 0 ? (
                      <div className="p-6 text-center rounded-2xl bg-slate-50 border border-dashed border-slate-200 space-y-2">
                        <p className="text-xs text-slate-500 font-medium">
                          Belum ada riwayat pendidikan formal yang tercatat.
                        </p>
                        <Link
                          href="/admin/profile/edit?step=pendidikan"
                          className="inline-flex items-center gap-1.5 text-xs font-bold text-[#0173b6] hover:underline"
                        >
                          <span>Tambah Pendidikan Formal</span>
                          <ArrowRight size={13} />
                        </Link>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 gap-3">
                        {education.formal.map((edu, idx) => (
                          <div
                            key={edu.id ?? idx}
                            className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200/90 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                          >
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <span className="px-2.5 py-0.5 rounded-lg bg-[#0173b6] text-white font-extrabold text-[11px] font-mono">
                                  {edu.tingkat || "Pendidikan"}
                                </span>
                                <h6 className="text-sm font-extrabold text-slate-900">
                                  {edu.nama_sekolah}
                                </h6>
                              </div>
                              <p className="text-xs text-slate-600 font-medium">
                                Program Studi / Jurusan:{" "}
                                <span className="font-bold text-slate-800">
                                  {edu.jurusan || "-"}
                                </span>
                              </p>
                              {edu.nomor_ijazah && (
                                <p className="text-[11px] text-slate-500 font-mono tabular-nums">
                                  No. Ijazah: {edu.nomor_ijazah}
                                </p>
                              )}
                            </div>

                            <div className="sm:text-right space-y-1 shrink-0">
                              <span className="inline-block px-3 py-1 rounded-xl bg-white border border-slate-200 text-xs font-mono tabular-nums font-bold text-slate-700">
                                {edu.tahun_masuk || "?"} &ndash;{" "}
                                {edu.tahun_lulus || "?"}
                              </span>
                              {edu.ipk && (
                                <p className="text-xs font-mono tabular-nums font-bold text-emerald-700">
                                  IPK / Nilai: {edu.ipk}
                                </p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Pelatihan & Kursus Non-Formal */}
                  <div className="space-y-3 pt-4 border-t border-slate-100">
                    <h5 className="text-xs font-extrabold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
                      <Award size={14} className="text-amber-500" />
                      <span>Pelatihan, Seminar &amp; Sertifikasi ({education.nonFormal.length})</span>
                    </h5>
                    {education.nonFormal.length === 0 ? (
                      <div className="p-5 text-center rounded-2xl bg-slate-50 border border-dashed border-slate-200">
                        <p className="text-xs text-slate-500 font-medium">
                          Belum ada data pelatihan atau sertifikasi non-formal.
                        </p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {education.nonFormal.map((nf, idx) => (
                          <div
                            key={nf.id ?? idx}
                            className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200/90 space-y-1"
                          >
                            <p className="text-sm font-extrabold text-slate-900">
                              {nf.jenis_kursus}
                            </p>
                            <p className="text-xs font-bold text-primary">
                              {nf.nama_lembaga}
                            </p>
                            <div className="flex items-center justify-between text-[11px] text-slate-500 font-mono tabular-nums pt-1">
                              <span>
                                Tahun: {nf.tahun_masuk || "-"} s/d{" "}
                                {nf.tahun_selesai || "-"}
                              </span>
                              {nf.nomor_sertifikat && (
                                <span>No: {nf.nomor_sertifikat}</span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* TAB 5: PENGALAMAN KERJA & DOKUMEN DIGITAL */}
              {activeTab === "dokumen" && (
                <div className="space-y-6">
                  {/* Dokumen Digital */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-500 flex items-center gap-2">
                        <FolderOpen size={14} className="text-primary" />
                        <span>Arsip Dokumen Kepegawaian Digital</span>
                      </h4>
                      <Link
                        href="/admin/profile/edit?step=dokumen"
                        className="text-xs font-bold text-[#0173b6] hover:underline inline-flex items-center gap-1"
                      >
                        <Edit3 size={12} />
                        <span>Unggah / Perbarui Berkas</span>
                      </Link>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {STANDARD_DOCS.map((doc) => {
                        const fileUrl = documents?.[doc.key];
                        return (
                          <div
                            key={doc.key}
                            className={`p-3.5 rounded-2xl border flex items-center justify-between gap-3 ${
                              fileUrl
                                ? "bg-emerald-50/40 border-emerald-200"
                                : "bg-slate-50/80 border-slate-200/80"
                            }`}
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              <div
                                className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                                  fileUrl
                                    ? "bg-emerald-600 text-white"
                                    : "bg-slate-200 text-slate-500"
                                }`}
                              >
                                <FileText size={16} />
                              </div>
                              <div className="min-w-0">
                                <div className="flex items-center gap-1.5">
                                  <p className="text-xs font-extrabold text-slate-900 truncate">
                                    {doc.label}
                                  </p>
                                  {doc.isMandatory && (
                                    <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-amber-100 text-amber-800">
                                      Wajib
                                    </span>
                                  )}
                                </div>
                                <p className="text-[11px] text-slate-500">
                                  {fileUrl ? "Berkas Tersimpan" : "Belum Diunggah"}
                                </p>
                              </div>
                            </div>

                            {fileUrl ? (
                              <a
                                href={fileUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-white hover:bg-emerald-600 hover:text-white text-emerald-700 border border-emerald-200 text-[11px] font-bold transition-all shrink-0"
                              >
                                <span>Lihat</span>
                                <ExternalLink size={11} />
                              </a>
                            ) : (
                              <Link
                                href="/admin/profile/edit?step=dokumen"
                                className="text-[11px] font-bold text-[#0173b6] hover:underline shrink-0"
                              >
                                Unggah
                              </Link>
                            )}
                          </div>
                        );
                      })}
                    </div>

                    {/* Sertifikat & Dokumen Tambahan */}
                    {otherDocuments.length > 0 && (
                      <div className="pt-2 space-y-2">
                        <p className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
                          Sertifikat &amp; Dokumen Pendukung Tambahan ({otherDocuments.length})
                        </p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                          {otherDocuments.map((od, idx) => (
                            <div
                              key={od.id ?? idx}
                              className="p-3 rounded-xl bg-blue-50/50 border border-blue-200/80 flex items-center justify-between gap-2"
                            >
                              <span className="text-xs font-bold text-slate-800 truncate">
                                {od.nama_dokumen}
                              </span>
                              <a
                                href={od.file_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white text-[#0173b6] border border-blue-200 text-[11px] font-bold hover:bg-[#0173b6] hover:text-white transition-all shrink-0"
                              >
                                <span>Buka</span>
                                <ExternalLink size={11} />
                              </a>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Riwayat Pengalaman Kerja Sebelumnya */}
                  <div className="space-y-3 pt-4 border-t border-slate-100">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-500 flex items-center gap-2">
                        <Building2 size={14} className="text-primary" />
                        <span>Riwayat Pengalaman Kerja Sebelumnya ({experience.length})</span>
                      </h4>
                      <Link
                        href="/admin/profile/edit?step=pengalaman"
                        className="text-xs font-bold text-[#0173b6] hover:underline inline-flex items-center gap-1"
                      >
                        <Edit3 size={12} />
                        <span>Kelola Pengalaman</span>
                      </Link>
                    </div>

                    {experience.length === 0 ? (
                      <div className="p-5 text-center rounded-2xl bg-slate-50 border border-dashed border-slate-200">
                        <p className="text-xs text-slate-500 font-medium">
                          Belum ada riwayat pengalaman kerja sebelumnya yang dicatat.
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-2.5">
                        {experience.map((exp, idx) => (
                          <div
                            key={exp.id ?? idx}
                            className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200/90 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                          >
                            <div className="space-y-0.5">
                              <p className="text-sm font-extrabold text-slate-900">
                                {exp.jabatan_terakhir} &mdash;{" "}
                                <span className="text-primary">{exp.nama_instansi}</span>
                              </p>
                              <p className="text-xs text-slate-600">
                                Lokasi: {exp.lokasi || "-"} &bull; Alasan Berhenti:{" "}
                                {exp.alasan_berhenti || "-"}
                              </p>
                            </div>
                            <span className="px-3 py-1 rounded-xl bg-white border border-slate-200 text-xs font-mono tabular-nums font-bold text-slate-700 self-start sm:self-auto shrink-0">
                              {exp.tahun_mulai || "?"} &ndash; {exp.tahun_selesai || "?"}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* TAB 6: LOG PRESENSI PERIODE BERJALAN */}
              {activeTab === "presensi" && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                    <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-500 flex items-center gap-2">
                      <Clock size={14} className="text-primary" />
                      <span>Riwayat Presensi Periode Cut-Off (26 s/d 25)</span>
                    </h4>
                    <span className="text-xs font-semibold text-slate-500 font-mono tabular-nums">
                      {absensiList.length} Hari Tercatat
                    </span>
                  </div>

                  {absensiList.length === 0 ? (
                    <div className="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                      <Clock size={28} className="mx-auto text-slate-300 mb-2" />
                      <p className="text-xs font-bold text-slate-500">
                        Belum ada rekaman presensi pada periode ini.
                      </p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto max-h-[380px] overflow-y-auto rounded-2xl border border-slate-200/80">
                      <table className="w-full text-left text-xs whitespace-nowrap">
                        <thead className="bg-[#05445e] text-white font-semibold uppercase text-[11px] sticky top-0 z-10">
                          <tr>
                            <th className="px-4 py-3">Tanggal</th>
                            <th className="px-4 py-3">Shift</th>
                            <th className="px-4 py-3 text-center">Masuk</th>
                            <th className="px-4 py-3 text-center">Pulang</th>
                            <th className="px-4 py-3 text-right">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {absensiList.slice(0, 15).map((row, idx) => (
                            <tr
                              key={row.id ?? idx}
                              className="hover:bg-slate-50/80 transition-colors"
                            >
                              <td className="px-4 py-2.5 font-bold font-mono tabular-nums text-slate-900">
                                {row.tanggal}
                              </td>
                              <td className="px-4 py-2.5 font-semibold text-slate-700">
                                {row.nama_shift || "Normal"}
                              </td>
                              <td className="px-4 py-2.5 text-center font-mono tabular-nums text-emerald-700 font-bold">
                                {formatWibTime(row.jam_masuk)}
                              </td>
                              <td className="px-4 py-2.5 text-center font-mono tabular-nums text-primary font-bold">
                                {formatWibTime(row.jam_keluar)}
                              </td>
                              <td className="px-4 py-2.5 text-right">
                                <span
                                  className={`inline-flex px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase font-mono tabular-nums ${
                                    (row.menit_terlambat ?? 0) > 0
                                      ? "bg-amber-100 text-amber-800"
                                      : "bg-emerald-100 text-emerald-800"
                                  }`}
                                >
                                  {(row.menit_terlambat ?? 0) > 0
                                    ? `Terlambat ${row.menit_terlambat}m`
                                    : "Tepat Waktu"}
                                </span>
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

            {/* Footer Integritas Data SDM */}
            <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
                  ID Pegawai (Sistem UUID)
                </span>
                <span className="text-xs font-mono text-slate-600 tabular-nums font-semibold">
                  {profile.id}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <span className="badge badge-sm badge-ghost text-slate-600 text-[10px] font-bold uppercase tracking-wider font-mono">
                  Sistem Informasi SDM RSU Avisena
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
