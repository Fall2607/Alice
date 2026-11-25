"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import {
  User,
  Users,
  GraduationCap,
  Briefcase,
  FileText,
  CheckCircle2,
  AlertCircle,
  Save,
  ChevronLeft,
  ChevronRight,
  Plus,
  Trash2,
  Upload,
  ExternalLink,
  Loader2,
  Sparkles,
  ShieldCheck,
  Paperclip,
  Mail,
  Phone,
  MapPin,
  Calendar,
  CreditCard,
  Stethoscope,
  IdCard,
  Building2,
  Heart,
  Award,
} from "lucide-react";
import SearchableSelect from "@/app/components/admin/SearchableSelect";
import { showSuccessToast, showErrorToast } from "@/app/components/admin/Alert";

if (typeof window !== "undefined") {
  gsap.registerPlugin(useGSAP);
}

type FormOption = { value: string; label: string };
type EditSection = "identitas" | "keluarga" | "pendidikan" | "pengalaman" | "dokumen";

interface SiblingItem {
  nama: string;
  gender: string;
  umur: string | number;
  hubungan: string;
  pekerjaan: string;
}

interface FormalEduItem {
  tingkat: string;
  nama_sekolah: string;
  jurusan: string;
  tahun_masuk: string | number;
  tahun_lulus: string | number;
  nomor_ijazah: string;
  ipk: string;
}

interface NonFormalEduItem {
  nama_lembaga: string;
  jenis_kursus: string;
  tahun_masuk: string | number;
  tahun_selesai: string | number;
  nomor_sertifikat: string;
}

interface WorkExpItem {
  nama_instansi: string;
  jabatan_terakhir: string;
  lokasi: string;
  lama_kerja: string;
  tahun_mulai: string | number;
  tahun_selesai: string | number;
  alasan_berhenti: string;
}

interface OtherDocItem {
  nama_dokumen: string;
  file_url: string;
}

const GENDER_OPTIONS: FormOption[] = [
  { value: "Laki-laki", label: "Laki-laki" },
  { value: "Perempuan", label: "Perempuan" },
];

const AGAMA_OPTIONS: FormOption[] = [
  { value: "Islam", label: "Islam" },
  { value: "Kristen", label: "Kristen Protestan" },
  { value: "Katolik", label: "Katolik" },
  { value: "Hindu", label: "Hindu" },
  { value: "Buddha", label: "Buddha" },
  { value: "Konghucu", label: "Konghucu" },
];

const MARITAL_OPTIONS: FormOption[] = [
  { value: "Belum Kawin", label: "Belum Kawin (Lajang)" },
  { value: "Kawin", label: "Kawin (Menikah)" },
  { value: "Cerai Hidup", label: "Cerai Hidup" },
  { value: "Cerai Mati", label: "Cerai Mati" },
];

const JENJANG_OPTIONS: FormOption[] = [
  { value: "SD", label: "SD / Sederajat" },
  { value: "SMP", label: "SMP / Sederajat" },
  { value: "SMA", label: "SMA / MA" },
  { value: "SMK", label: "SMK / Kejuruan" },
  { value: "D1", label: "Diploma 1 (D1)" },
  { value: "D2", label: "Diploma 2 (D2)" },
  { value: "D3", label: "Diploma 3 (D3)" },
  { value: "D4", label: "Diploma 4 (D4)" },
  { value: "S1", label: "Sarjana (S1)" },
  { value: "Profesi", label: "Profesi (Ners / Dokter / Apoteker)" },
  { value: "S2", label: "Magister (S2)" },
  { value: "S3", label: "Doktor (S3)" },
];

const MAIN_DOC_FIELDS: {
  key: string;
  label: string;
  required: boolean;
  desc: string;
}[] = [
  { key: "pas_foto_url", label: "Pas Foto Formal Pegawai", required: true, desc: "Format JPG/PNG berlatar rapi untuk ID Card Digital" },
  { key: "scan_ktp_url", label: "Scan KTP Elektronik", required: true, desc: "KTP asli yang terbaca jelas (PDF/JPG/PNG)" },
  { key: "kartu_keluarga_url", label: "Kartu Keluarga (KK)", required: true, desc: "Dokumen Kartu Keluarga terbaru" },
  { key: "ijazah_url", label: "Ijazah Pendidikan Terakhir", required: true, desc: "Scan ijazah asli atau legalisir resmi" },
  { key: "transkrip_url", label: "Transkrip Nilai Akademik", required: false, desc: "Transkrip nilai pendidikan terakhir" },
  { key: "str_url", label: "STR / SIP Aktif (Khusus Nakes)", required: false, desc: "Wajib bagi dokter, perawat, bidan, farmasi & nakes" },
  { key: "cv_url", label: "Curriculum Vitae (CV)", required: false, desc: "Dokumen riwayat hidup terbaru" },
  { key: "paklaring_url", label: "Surat Pengalaman Kerja (Paklaring)", required: false, desc: "Referensi kerja dari instansi sebelumnya" },
];

function toDateInputString(val?: string | null): string {
  if (!val) return "";
  if (val.includes("T")) return val.split("T")[0];
  return val.substring(0, 10);
}

function hasText(val: unknown): boolean {
  return typeof val === "string" && val.trim().length > 0;
}

export default function EditProfileCompletePage() {
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);
  const formPaneRef = useRef<HTMLDivElement>(null);

  const [karyawanId, setKaryawanId] = useState<string | null>(null);
  const [nip, setNip] = useState<string>("");
  const [departemen, setDepartemen] = useState<string>("");
  const [jabatanLevel, setJabatanLevel] = useState<string>("");

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [activeSection, setActiveSection] = useState<EditSection>("identitas");
  const [uploadingKey, setUploadingKey] = useState<string | null>(null);

  const [identity, setIdentity] = useState({
    nama_lengkap: "",
    nik: "",
    tempat_lahir: "",
    tanggal_lahir: "",
    jenis_kelamin: "Laki-laki",
    suku_bangsa: "",
    agama: "Islam",
    status_pernikahan: "Belum Kawin",
    jumlah_anak: 0,
    handphone: "",
    email: "",
    alamat: "",
    alamat_domisili: "",
    rekening_bsi: "",
    sip: "",
    masa_berlaku_sip: "",
  });

  const [spouse, setSpouse] = useState({
    nama: "",
    tempat_lahir: "",
    tanggal_lahir: "",
    no_hp: "",
  });

  const [parents, setParents] = useState({
    nama_ayah: "",
    pekerjaan_ayah: "",
    nohp_ayah: "",
    nama_ibu: "",
    pekerjaan_ibu: "",
    nohp_ibu: "",
  });

  const [siblings, setSiblings] = useState<SiblingItem[]>([]);
  const [educationFormal, setEducationFormal] = useState<FormalEduItem[]>([]);
  const [educationNonFormal, setEducationNonFormal] = useState<NonFormalEduItem[]>([]);
  const [experience, setExperience] = useState<WorkExpItem[]>([]);
  const [documents, setDocuments] = useState<Record<string, string>>({
    cv_url: "",
    pas_foto_url: "",
    scan_ktp_url: "",
    ijazah_url: "",
    transkrip_url: "",
    kartu_keluarga_url: "",
    str_url: "",
    paklaring_url: "",
  });
  const [otherDocuments, setOtherDocuments] = useState<OtherDocItem[]>([]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const stepParam = params.get("step");
      if (
        stepParam === "identitas" ||
        stepParam === "keluarga" ||
        stepParam === "pendidikan" ||
        stepParam === "pengalaman" ||
        stepParam === "dokumen"
      ) {
        setActiveSection(stepParam);
      }
    }
  }, []);

  useEffect(() => {
    const loadProfileData = async () => {
      setIsLoading(true);
      try {
        const userStr = localStorage.getItem("user");
        if (!userStr) {
          router.push("/login");
          return;
        }
        const user = JSON.parse(userStr);
        const kId = user.karyawan_id;
        if (!kId) {
          showErrorToast("Akun Anda belum terhubung dengan ID Karyawan.");
          setIsLoading(false);
          return;
        }
        setKaryawanId(kId);

        const res = await fetch(`/api/karyawan/${kId}/profile-lengkap`);
        if (!res.ok) throw new Error("Gagal memuat data profil pegawai.");
        const data = await res.json();

        const k = data.karyawan || {};
        setNip(k.nip || "-");
        setDepartemen(k.nama_departemen || "RSU Avisena");
        setJabatanLevel(k.profesi || k.nama_level || "Pegawai");

        setIdentity({
          nama_lengkap: k.nama_lengkap || "",
          nik: k.nik || "",
          tempat_lahir: k.tempat_lahir || "",
          tanggal_lahir: toDateInputString(k.tanggal_lahir),
          jenis_kelamin: k.jenis_kelamin || "Laki-laki",
          suku_bangsa: k.suku_bangsa || "",
          agama: k.agama || "Islam",
          status_pernikahan: k.status_pernikahan || "Belum Kawin",
          jumlah_anak: Number(k.jumlah_anak) || 0,
          handphone: k.handphone || "",
          email: k.email || "",
          alamat: k.alamat || "",
          alamat_domisili: k.alamat_domisili || "",
          rekening_bsi: k.rekening_bsi || "",
          sip: k.sip || "",
          masa_berlaku_sip: toDateInputString(k.masa_berlaku_sip),
        });

        const sp = data.spouse || {};
        setSpouse({
          nama: sp.nama || "",
          tempat_lahir: sp.tempat_lahir || "",
          tanggal_lahir: toDateInputString(sp.tanggal_lahir),
          no_hp: sp.no_hp || "",
        });

        const pr = data.parents || {};
        setParents({
          nama_ayah: pr.nama_ayah || "",
          pekerjaan_ayah: pr.pekerjaan_ayah || "",
          nohp_ayah: pr.nohp_ayah || "",
          nama_ibu: pr.nama_ibu || "",
          pekerjaan_ibu: pr.pekerjaan_ibu || "",
          nohp_ibu: pr.nohp_ibu || "",
        });

        setSiblings(Array.isArray(data.siblings) ? data.siblings : []);
        setEducationFormal(
          Array.isArray(data.education?.formal) && data.education.formal.length > 0
            ? data.education.formal
            : [
                {
                  tingkat: "S1",
                  nama_sekolah: "",
                  jurusan: "",
                  tahun_masuk: "",
                  tahun_lulus: "",
                  nomor_ijazah: "",
                  ipk: "",
                },
              ]
        );
        setEducationNonFormal(
          Array.isArray(data.education?.nonFormal) ? data.education.nonFormal : []
        );
        setExperience(Array.isArray(data.experience) ? data.experience : []);

        const dc = data.documents || {};
        setDocuments({
          cv_url: dc.cv_url || "",
          pas_foto_url: dc.pas_foto_url || "",
          scan_ktp_url: dc.scan_ktp_url || "",
          ijazah_url: dc.ijazah_url || "",
          transkrip_url: dc.transkrip_url || "",
          kartu_keluarga_url: dc.kartu_keluarga_url || "",
          str_url: dc.str_url || "",
          paklaring_url: dc.paklaring_url || "",
        });

        setOtherDocuments(Array.isArray(data.otherDocuments) ? data.otherDocuments : []);
      } catch (err) {
        console.error(err);
        showErrorToast("Gagal memuat data formulir profil.");
      } finally {
        setIsLoading(false);
      }
    };

    loadProfileData();
  }, [router]);

  // Live Completeness Calculation
  const liveCompleteness = useMemo(() => {
    const isIdentityOk =
      hasText(identity.nama_lengkap) &&
      hasText(identity.nik) &&
      hasText(identity.tempat_lahir) &&
      hasText(identity.tanggal_lahir) &&
      hasText(identity.jenis_kelamin) &&
      hasText(identity.agama) &&
      hasText(identity.status_pernikahan) &&
      hasText(identity.handphone) &&
      hasText(identity.email) &&
      hasText(identity.alamat);

    const isSpouseRequired = identity.status_pernikahan === "Kawin";
    const isFamilyOk =
      hasText(parents.nama_ayah) &&
      hasText(parents.nama_ibu) &&
      (!isSpouseRequired || hasText(spouse.nama));

    const isEducationOk = educationFormal.some(
      (ef) => hasText(ef.nama_sekolah) && hasText(String(ef.tahun_lulus || ""))
    );

    const isDocumentsOk =
      hasText(documents.pas_foto_url) &&
      hasText(documents.scan_ktp_url) &&
      hasText(documents.kartu_keluarga_url) &&
      hasText(documents.ijazah_url);

    const completedPillars = [isIdentityOk, isFamilyOk, isEducationOk, isDocumentsOk].filter(Boolean).length;
    const percentage = Math.round((completedPillars / 4) * 100);

    return {
      isComplete: completedPillars === 4,
      percentage,
      pillars: {
        identity: isIdentityOk,
        family: isFamilyOk,
        education: isEducationOk,
        documents: isDocumentsOk,
      },
    };
  }, [identity, parents, spouse, educationFormal, documents]);

  // GSAP Single Entrance Animation
  useGSAP(
    () => {
      if (isLoading) return;
      const tl = gsap.timeline({ defaults: { ease: "power2.out" } });
      tl.fromTo(
        ".edit-header",
        { opacity: 0, y: -12 },
        { opacity: 1, y: 0, duration: 0.4, clearProps: "all" }
      )
        .fromTo(
          ".edit-sidebar",
          { opacity: 0, x: -14 },
          { opacity: 1, x: 0, duration: 0.35, clearProps: "all" },
          "-=0.2"
        )
        .fromTo(
          ".edit-main-card",
          { opacity: 0, y: 14 },
          { opacity: 1, y: 0, duration: 0.35, clearProps: "all" },
          "-=0.25"
        );
    },
    { scope: containerRef, dependencies: [isLoading] }
  );

  // GSAP Section Switch Animation
  useGSAP(
    () => {
      if (!formPaneRef.current) return;
      gsap.fromTo(
        formPaneRef.current,
        { opacity: 0, y: 8 },
        { opacity: 1, y: 0, duration: 0.25, ease: "power2.out", clearProps: "all" }
      );
    },
    { scope: containerRef, dependencies: [activeSection] }
  );

  const handleFileUpload = async (file: File, targetKey: string, isOtherDocIndex?: number) => {
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      showErrorToast("Ukuran berkas maksimal 10 MB.");
      return;
    }

    setUploadingKey(targetKey);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (!res.ok || !data.url) {
        throw new Error(data.message || "Gagal mengunggah berkas.");
      }

      if (typeof isOtherDocIndex === "number") {
        setOtherDocuments((prev) =>
          prev.map((item, idx) =>
            idx === isOtherDocIndex ? { ...item, file_url: data.url } : item
          )
        );
      } else {
        setDocuments((prev) => ({ ...prev, [targetKey]: data.url }));
      }
      showSuccessToast("Berkas berhasil diunggah. Klik Simpan Data untuk menyimpan perubahan.");
    } catch (err) {
      console.error(err);
      showErrorToast(err instanceof Error ? err.message : "Gagal mengunggah berkas.");
    } finally {
      setUploadingKey(null);
    }
  };

  const handleSaveAll = async () => {
    if (!karyawanId) return;
    setIsSaving(true);
    try {
      const res = await fetch(`/api/karyawan/${karyawanId}/profile-lengkap`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          identity,
          spouse: identity.status_pernikahan === "Kawin" ? spouse : null,
          parents,
          siblings,
          educationFormal,
          educationNonFormal,
          experience,
          documents,
          otherDocuments,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Gagal menyimpan data profil.");
      }

      showSuccessToast("Seluruh data informasi diri & berkas berhasil disimpan!");

      // Update pas_foto_url di local user state dan broadcast event
      if (documents.pas_foto_url) {
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
          try {
            const parsed = JSON.parse(storedUser);
            parsed.pas_foto_url = documents.pas_foto_url;
            localStorage.setItem("user", JSON.stringify(parsed));
            window.dispatchEvent(new Event("user-updated"));
          } catch {}
        }
      }

      router.push("/admin/profile");
    } catch (err) {
      console.error(err);
      showErrorToast(err instanceof Error ? err.message : "Gagal menyimpan perubahan.");
    } finally {
      setIsSaving(false);
    }
  };

  const sectionList: {
    id: EditSection;
    step: number;
    title: string;
    subtitle: string;
    icon: React.ElementType;
    isRequired: boolean;
    isComplete: boolean;
  }[] = [
    {
      id: "identitas",
      step: 1,
      title: "Identitas & Kontak",
      subtitle: "Biodata KTP, kontak, SIP & rekening",
      icon: User,
      isRequired: true,
      isComplete: liveCompleteness.pillars.identity,
    },
    {
      id: "keluarga",
      step: 2,
      title: "Data Keluarga",
      subtitle: "Orang tua, pasangan & saudara",
      icon: Users,
      isRequired: true,
      isComplete: liveCompleteness.pillars.family,
    },
    {
      id: "pendidikan",
      step: 3,
      title: "Pendidikan & Pelatihan",
      subtitle: "Pendidikan formal & sertifikasi",
      icon: GraduationCap,
      isRequired: true,
      isComplete: liveCompleteness.pillars.education,
    },
    {
      id: "pengalaman",
      step: 4,
      title: "Pengalaman Kerja",
      subtitle: "Riwayat instansi sebelumnya",
      icon: Briefcase,
      isRequired: false,
      isComplete: experience.length > 0,
    },
    {
      id: "dokumen",
      step: 5,
      title: "Dokumen & Berkas Digital",
      subtitle: "Foto, KTP, KK, Ijazah, STR & CV",
      icon: FileText,
      isRequired: true,
      isComplete: liveCompleteness.pillars.documents,
    },
  ];

  const currentSectionIndex = sectionList.findIndex((s) => s.id === activeSection);

  if (isLoading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <div className="text-center space-y-3">
          <Loader2 className="mx-auto h-10 w-10 animate-spin text-[#0173b6]" />
          <p className="text-slate-500 font-bold text-xs uppercase tracking-wider">
            Memuat Formulir Dossier Personalia RSU Avisena...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="p-8 font-sans min-h-screen space-y-6">
      {/* LAYER 1: HEADER HALAMAN */}
      <div className="edit-header flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 pb-4 border-b border-slate-200/80">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <Link
              href="/admin/profile"
              className="inline-flex items-center gap-1 text-slate-500 hover:text-[#0173b6] font-bold text-xs uppercase tracking-wider transition-colors"
            >
              <ChevronLeft size={15} />
              <span>Kembali ke Profil</span>
            </Link>
            <span className="text-slate-300">/</span>
            <span className="inline-flex items-center gap-1.5 text-[#0173b6] font-bold uppercase tracking-wider text-xs">
              <Sparkles size={14} />
              <span>Pemutakhiran Data Mandiri (Self-Service)</span>
            </span>
          </div>
          <h1 className="text-3xl font-bold text-[#05445e] tracking-tight">
            Edit &amp; Lengkapi Informasi Diri Pegawai
          </h1>
          <p className="text-slate-500 font-medium text-sm mt-1 max-w-3xl">
            Lengkapi biodata kependudukan, susunan keluarga, riwayat pendidikan, pengalaman kerja, serta unggah dokumen digital kepegawaian RSU Avisena.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Link
            href="/admin/profile"
            className="btn btn-sm min-h-[44px] px-4 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200/90 rounded-xl font-bold text-xs uppercase tracking-wider"
          >
            Batal
          </Link>
          <button
            type="button"
            onClick={handleSaveAll}
            disabled={isSaving}
            className="inline-flex items-center gap-2 bg-[#0173b6] hover:bg-[#05445e] text-white font-bold py-2.5 px-6 rounded-xl shadow-xs transition-all active:scale-[0.98] text-xs uppercase tracking-wider min-h-[44px] cursor-pointer disabled:opacity-50"
          >
            {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
            <span>Simpan Seluruh Perubahan</span>
          </button>
        </div>
      </div>

      {/* LAYER 2: LAYOUT 2-KOLOM (SIDEBAR KIRI STICKY 3 KOLOM + KONTEN KANAN LUAS 9 KOLOM) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* SIDEBAR KIRI STICKY (4 Kolom di lg, 3 Kolom di xl) */}
        <div className="edit-sidebar lg:col-span-4 xl:col-span-3 space-y-5 lg:sticky lg:top-6">
          {/* Live Scorecard Kelengkapan Data */}
          <div className="rounded-2xl bg-gradient-to-br from-[#05445e] via-[#03587c] to-[#0173b6] p-6 text-white shadow-lg space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-blue-200">
                  Skor Kelengkapan Dossier
                </p>
                <p className="text-3xl font-black font-mono tabular-nums mt-0.5">
                  {liveCompleteness.percentage}%
                </p>
              </div>
              <span
                className={`badge badge-sm font-bold text-[10px] border-0 ${
                  liveCompleteness.isComplete
                    ? "bg-emerald-400 text-slate-950"
                    : "bg-amber-400 text-slate-950"
                }`}
              >
                {liveCompleteness.isComplete ? "LENGKAP" : "BELUM LENGKAP"}
              </span>
            </div>

            <progress
              className="progress progress-success w-full h-2.5 bg-white/20"
              value={liveCompleteness.percentage}
              max="100"
            />

            <div className="pt-2 border-t border-white/15 space-y-1 text-xs">
              <p className="font-bold text-white truncate">{identity.nama_lengkap || "Pegawai"}</p>
              <p className="text-blue-100/80 text-[11px] font-mono tabular-nums">
                NIP: {nip} &bull; {departemen}
              </p>
            </div>
          </div>

          {/* Menu Navigasi 5 Bagian Formulir */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-3 space-y-1.5">
            <p className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Tahapan Pengisian Data
            </p>
            {sectionList.map((sec) => {
              const Icon = sec.icon;
              const isActive = activeSection === sec.id;
              return (
                <button
                  key={sec.id}
                  type="button"
                  onClick={() => setActiveSection(sec.id)}
                  className={`w-full text-left p-3 rounded-xl transition-all flex items-start gap-3 cursor-pointer ${
                    isActive
                      ? "bg-[#0173b6] text-white shadow-xs"
                      : "hover:bg-slate-50 text-slate-700"
                  }`}
                >
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                      isActive
                        ? "bg-white/20 text-white"
                        : sec.isComplete
                        ? "bg-emerald-50 text-emerald-600"
                        : "bg-slate-100 text-slate-500"
                    }`}
                  >
                    <Icon size={16} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <p className={`text-xs font-bold truncate ${isActive ? "text-white" : "text-slate-800"}`}>
                        {sec.step}. {sec.title}
                      </p>
                      {sec.isComplete ? (
                        <CheckCircle2
                          size={14}
                          className={isActive ? "text-emerald-300 shrink-0" : "text-emerald-600 shrink-0"}
                        />
                      ) : sec.isRequired ? (
                        <AlertCircle
                          size={14}
                          className={isActive ? "text-amber-300 shrink-0" : "text-amber-500 shrink-0"}
                        />
                      ) : null}
                    </div>
                    <p
                      className={`text-[11px] truncate mt-0.5 ${
                        isActive ? "text-blue-100" : "text-slate-400"
                      }`}
                    >
                      {sec.subtitle}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Info Keamanan Data */}
          <div className="bg-blue-50/70 rounded-2xl border border-blue-200/70 p-4 flex items-start gap-3">
            <ShieldCheck size={18} className="text-[#0173b6] shrink-0 mt-0.5" />
            <div className="space-y-1 text-[11px] text-slate-600 leading-relaxed">
              <p className="font-bold text-slate-800">Kerahasiaan Arsip SDM</p>
              <p>
                Data yang Anda simpan langsung terenkripsi dan terhubung ke pangkalan data Human Capital RSU Avisena.
              </p>
            </div>
          </div>
        </div>

        {/* AREA FORMULIR KANAN LUAS (8 Kolom di lg, 9 Kolom di xl) */}
        <div className="edit-main-card lg:col-span-8 xl:col-span-9">
          <div
            ref={formPaneRef}
            className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 sm:p-8 space-y-7"
          >
            {/* ===================================================== */}
            {/* BAGIAN 1: IDENTITAS & KONTAK PRIBADI */}
            {/* ===================================================== */}
            {activeSection === "identitas" && (
              <div className="space-y-7">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-100">
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-[#0173b6]">
                      Bagian 1 dari 5 &bull; Wajib Diisi
                    </span>
                    <h2 className="text-xl font-bold text-[#05445e] mt-0.5">
                      Identitas Kependudukan &amp; Kontak Pribadi
                    </h2>
                  </div>
                  <span
                    className={`badge badge-sm font-bold ${
                      liveCompleteness.pillars.identity ? "badge-success text-white" : "badge-warning"
                    }`}
                  >
                    {liveCompleteness.pillars.identity ? "Bagian Ini Lengkap" : "Belum Lengkap"}
                  </span>
                </div>

                {/* Sub-grup 1: Biodata KTP */}
                <div className="space-y-4">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
                    <IdCard size={15} className="text-[#0173b6]" />
                    <span>A. Data Kependudukan (Sesuai KTP)</span>
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">
                        Nama Lengkap Beserta Gelar <span className="text-rose-500">*</span>
                      </label>
                      <div className="relative">
                        <User className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                        <input
                          type="text"
                          value={identity.nama_lengkap}
                          onChange={(e) => setIdentity({ ...identity, nama_lengkap: e.target.value })}
                          placeholder="Masukkan nama lengkap sesuai KTP"
                          className="w-full h-[42px] pl-10 pr-4 bg-slate-50/80 border border-slate-200/90 rounded-xl text-xs font-semibold text-slate-800 focus:bg-white focus:border-[#0173b6] focus:ring-2 focus:ring-[#0173b6]/20 outline-none transition-all"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">
                        Nomor Induk Kependudukan (NIK 16 Digit) <span className="text-rose-500">*</span>
                      </label>
                      <div className="relative">
                        <IdCard className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                        <input
                          type="text"
                          maxLength={16}
                          value={identity.nik}
                          onChange={(e) => setIdentity({ ...identity, nik: e.target.value })}
                          placeholder="3277xxxxxxxxxxxx"
                          className="w-full h-[42px] pl-10 pr-4 bg-slate-50/80 border border-slate-200/90 rounded-xl text-xs font-mono tabular-nums font-semibold text-slate-800 focus:bg-white focus:border-[#0173b6] focus:ring-2 focus:ring-[#0173b6]/20 outline-none transition-all"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">
                        Tempat Kelahiran <span className="text-rose-500">*</span>
                      </label>
                      <div className="relative">
                        <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                        <input
                          type="text"
                          value={identity.tempat_lahir}
                          onChange={(e) => setIdentity({ ...identity, tempat_lahir: e.target.value })}
                          placeholder="Contoh: Kota Cimahi / Bandung"
                          className="w-full h-[42px] pl-10 pr-4 bg-slate-50/80 border border-slate-200/90 rounded-xl text-xs font-semibold text-slate-800 focus:bg-white focus:border-[#0173b6] focus:ring-2 focus:ring-[#0173b6]/20 outline-none transition-all"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">
                        Tanggal Lahir <span className="text-rose-500">*</span>
                      </label>
                      <div className="relative">
                        <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                        <input
                          type="date"
                          value={identity.tanggal_lahir}
                          onChange={(e) => setIdentity({ ...identity, tanggal_lahir: e.target.value })}
                          className="w-full h-[42px] pl-10 pr-4 bg-slate-50/80 border border-slate-200/90 rounded-xl text-xs font-mono tabular-nums font-semibold text-slate-800 focus:bg-white focus:border-[#0173b6] focus:ring-2 focus:ring-[#0173b6]/20 outline-none transition-all"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">
                        Jenis Kelamin <span className="text-rose-500">*</span>
                      </label>
                      <SearchableSelect
                        options={GENDER_OPTIONS}
                        value={GENDER_OPTIONS.find((o) => o.value === identity.jenis_kelamin) || GENDER_OPTIONS[0]}
                        onChange={(opt) =>
                          setIdentity({ ...identity, jenis_kelamin: String(opt?.value || "Laki-laki") })
                        }
                        placeholder="Pilih Jenis Kelamin"
                        isClearable={false}
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">
                        Agama <span className="text-rose-500">*</span>
                      </label>
                      <SearchableSelect
                        options={AGAMA_OPTIONS}
                        value={AGAMA_OPTIONS.find((o) => o.value === identity.agama) || AGAMA_OPTIONS[0]}
                        onChange={(opt) => setIdentity({ ...identity, agama: String(opt?.value || "Islam") })}
                        placeholder="Pilih Agama"
                        isClearable={false}
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">
                        Suku Bangsa
                      </label>
                      <input
                        type="text"
                        value={identity.suku_bangsa}
                        onChange={(e) => setIdentity({ ...identity, suku_bangsa: e.target.value })}
                        placeholder="Contoh: Sunda / Jawa / Minang"
                        className="w-full h-[40px] px-4 bg-slate-50/80 border border-slate-200/90 rounded-xl text-xs font-semibold text-slate-800 focus:bg-white focus:border-[#0173b6] focus:ring-2 focus:ring-[#0173b6]/20 outline-none transition-all"
                      />
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                      <div className="col-span-2">
                        <label className="block text-xs font-bold text-slate-700 mb-1.5">
                          Status Pernikahan <span className="text-rose-500">*</span>
                        </label>
                        <SearchableSelect
                          options={MARITAL_OPTIONS}
                          value={
                            MARITAL_OPTIONS.find((o) => o.value === identity.status_pernikahan) ||
                            MARITAL_OPTIONS[0]
                          }
                          onChange={(opt) =>
                            setIdentity({
                              ...identity,
                              status_pernikahan: String(opt?.value || "Belum Kawin"),
                            })
                          }
                          placeholder="Status Pernikahan"
                          isClearable={false}
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1.5">
                          Jml Anak
                        </label>
                        <input
                          type="number"
                          min={0}
                          value={identity.jumlah_anak}
                          onChange={(e) =>
                            setIdentity({ ...identity, jumlah_anak: Math.max(0, Number(e.target.value) || 0) })
                          }
                          className="w-full h-[38px] px-3 bg-slate-50/80 border border-slate-200/90 rounded-xl text-xs font-mono tabular-nums font-semibold text-slate-800 focus:bg-white focus:border-[#0173b6] outline-none"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Sub-grup 2: Kontak, Finansial & Kredensial */}
                <div className="space-y-4 pt-4 border-t border-slate-100">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
                    <Phone size={15} className="text-[#0173b6]" />
                    <span>B. Kontak Aktif, Rekening Payroll &amp; Kredensial Medis</span>
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">
                        Nomor Handphone / WhatsApp Aktif <span className="text-rose-500">*</span>
                      </label>
                      <div className="relative">
                        <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                        <input
                          type="text"
                          value={identity.handphone}
                          onChange={(e) => setIdentity({ ...identity, handphone: e.target.value })}
                          placeholder="08xxxxxxxxxx"
                          className="w-full h-[42px] pl-10 pr-4 bg-slate-50/80 border border-slate-200/90 rounded-xl text-xs font-mono tabular-nums font-semibold text-slate-800 focus:bg-white focus:border-[#0173b6] focus:ring-2 focus:ring-[#0173b6]/20 outline-none transition-all"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">
                        Alamat Email Resmi <span className="text-rose-500">*</span>
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                        <input
                          type="email"
                          value={identity.email}
                          onChange={(e) => setIdentity({ ...identity, email: e.target.value })}
                          placeholder="nama@email.com"
                          className="w-full h-[42px] pl-10 pr-4 bg-slate-50/80 border border-slate-200/90 rounded-xl text-xs font-semibold text-slate-800 focus:bg-white focus:border-[#0173b6] focus:ring-2 focus:ring-[#0173b6]/20 outline-none transition-all"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">
                        Nomor Rekening Payroll (Bank Syariah Indonesia / BSI)
                      </label>
                      <div className="relative">
                        <CreditCard className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                        <input
                          type="text"
                          value={identity.rekening_bsi}
                          onChange={(e) => setIdentity({ ...identity, rekening_bsi: e.target.value })}
                          placeholder="Masukkan nomor rekening BSI"
                          className="w-full h-[42px] pl-10 pr-4 bg-slate-50/80 border border-slate-200/90 rounded-xl text-xs font-mono tabular-nums font-semibold text-slate-800 focus:bg-white focus:border-[#0173b6] focus:ring-2 focus:ring-[#0173b6]/20 outline-none transition-all"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1.5">
                          Nomor SIP / STR (Nakes)
                        </label>
                        <div className="relative">
                          <Stethoscope className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
                          <input
                            type="text"
                            value={identity.sip}
                            onChange={(e) => setIdentity({ ...identity, sip: e.target.value })}
                            placeholder="Opsional Non-Medis"
                            className="w-full h-[42px] pl-10 pr-3 bg-slate-50/80 border border-slate-200/90 rounded-xl text-xs font-mono tabular-nums font-semibold text-slate-800 focus:bg-white focus:border-[#0173b6] outline-none"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1.5">
                          Masa Berlaku SIP
                        </label>
                        <input
                          type="date"
                          value={identity.masa_berlaku_sip}
                          onChange={(e) => setIdentity({ ...identity, masa_berlaku_sip: e.target.value })}
                          className="w-full h-[42px] px-3 bg-slate-50/80 border border-slate-200/90 rounded-xl text-xs font-mono tabular-nums font-semibold text-slate-800 focus:bg-white focus:border-[#0173b6] outline-none"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Sub-grup 3: Alamat Tempat Tinggal */}
                <div className="space-y-4 pt-4 border-t border-slate-100">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
                      <MapPin size={15} className="text-[#0173b6]" />
                      <span>C. Alamat KTP &amp; Alamat Domisili</span>
                    </h3>
                    <button
                      type="button"
                      onClick={() => setIdentity({ ...identity, alamat_domisili: identity.alamat })}
                      className="text-[11px] font-bold text-[#0173b6] hover:underline cursor-pointer"
                    >
                      Samakan Domisili dengan Alamat KTP
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">
                        Alamat Lengkap Sesuai KTP <span className="text-rose-500">*</span>
                      </label>
                      <textarea
                        rows={3}
                        value={identity.alamat}
                        onChange={(e) => setIdentity({ ...identity, alamat: e.target.value })}
                        placeholder="Jalan, Nomor Rumah, RT/RW, Kelurahan, Kecamatan, Kota/Kabupaten"
                        className="w-full p-3.5 bg-slate-50/80 border border-slate-200/90 rounded-xl text-xs font-semibold text-slate-800 focus:bg-white focus:border-[#0173b6] focus:ring-2 focus:ring-[#0173b6]/20 outline-none transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">
                        Alamat Domisili Saat Ini
                      </label>
                      <textarea
                        rows={3}
                        value={identity.alamat_domisili}
                        onChange={(e) => setIdentity({ ...identity, alamat_domisili: e.target.value })}
                        placeholder="Alamat tempat tinggal aktif saat ini"
                        className="w-full p-3.5 bg-slate-50/80 border border-slate-200/90 rounded-xl text-xs font-semibold text-slate-800 focus:bg-white focus:border-[#0173b6] focus:ring-2 focus:ring-[#0173b6]/20 outline-none transition-all"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ===================================================== */}
            {/* BAGIAN 2: DATA KELUARGA */}
            {/* ===================================================== */}
            {activeSection === "keluarga" && (
              <div className="space-y-7">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-100">
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-[#0173b6]">
                      Bagian 2 dari 5 &bull; Wajib Diisi
                    </span>
                    <h2 className="text-xl font-bold text-[#05445e] mt-0.5">
                      Susunan Data Keluarga Pegawai
                    </h2>
                  </div>
                  <span
                    className={`badge badge-sm font-bold ${
                      liveCompleteness.pillars.family ? "badge-success text-white" : "badge-warning"
                    }`}
                  >
                    {liveCompleteness.pillars.family ? "Bagian Ini Lengkap" : "Belum Lengkap"}
                  </span>
                </div>

                {/* A. Orang Tua Kandung */}
                <div className="p-5 rounded-2xl bg-slate-50/70 border border-slate-200/80 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-[#05445e] flex items-center gap-2">
                      <Users size={15} className="text-[#0173b6]" />
                      <span>A. Data Orang Tua Kandung (Wajib)</span>
                    </h3>
                    <span className="badge badge-xs badge-primary text-[10px] font-bold">Wajib</span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">
                        Nama Lengkap Ayah Kandung <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={parents.nama_ayah}
                        onChange={(e) => setParents({ ...parents, nama_ayah: e.target.value })}
                        placeholder="Nama ayah kandung"
                        className="w-full h-[40px] px-3.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:border-[#0173b6] outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">
                        Pekerjaan Ayah
                      </label>
                      <input
                        type="text"
                        value={parents.pekerjaan_ayah}
                        onChange={(e) => setParents({ ...parents, pekerjaan_ayah: e.target.value })}
                        placeholder="Pekerjaan ayah"
                        className="w-full h-[40px] px-3.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:border-[#0173b6] outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">
                        Nomor Telepon / HP Ayah
                      </label>
                      <input
                        type="text"
                        value={parents.nohp_ayah}
                        onChange={(e) => setParents({ ...parents, nohp_ayah: e.target.value })}
                        placeholder="08xxxxxxxxxx / -"
                        className="w-full h-[40px] px-3.5 bg-white border border-slate-200 rounded-xl text-xs font-mono tabular-nums font-semibold text-slate-800 focus:border-[#0173b6] outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">
                        Nama Lengkap Ibu Kandung <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={parents.nama_ibu}
                        onChange={(e) => setParents({ ...parents, nama_ibu: e.target.value })}
                        placeholder="Nama ibu kandung"
                        className="w-full h-[40px] px-3.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:border-[#0173b6] outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">
                        Pekerjaan Ibu
                      </label>
                      <input
                        type="text"
                        value={parents.pekerjaan_ibu}
                        onChange={(e) => setParents({ ...parents, pekerjaan_ibu: e.target.value })}
                        placeholder="Pekerjaan ibu"
                        className="w-full h-[40px] px-3.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:border-[#0173b6] outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">
                        Nomor Telepon / HP Ibu
                      </label>
                      <input
                        type="text"
                        value={parents.nohp_ibu}
                        onChange={(e) => setParents({ ...parents, nohp_ibu: e.target.value })}
                        placeholder="08xxxxxxxxxx / -"
                        className="w-full h-[40px] px-3.5 bg-white border border-slate-200 rounded-xl text-xs font-mono tabular-nums font-semibold text-slate-800 focus:border-[#0173b6] outline-none"
                      />
                    </div>
                  </div>
                </div>

                {/* B. Pasangan Suami/Istri (Jika Kawin) */}
                {identity.status_pernikahan === "Kawin" ? (
                  <div className="p-5 rounded-2xl bg-blue-50/40 border border-blue-200/80 space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xs font-bold uppercase tracking-wider text-[#05445e] flex items-center gap-2">
                        <Heart size={15} className="text-rose-500" />
                        <span>B. Data Pasangan (Suami / Istri)</span>
                      </h3>
                      <span className="badge badge-xs badge-primary text-[10px] font-bold">
                        Wajib (Status Kawin)
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1.5">
                          Nama Lengkap Pasangan <span className="text-rose-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={spouse.nama}
                          onChange={(e) => setSpouse({ ...spouse, nama: e.target.value })}
                          placeholder="Nama suami / istri"
                          className="w-full h-[40px] px-3.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-800"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1.5">
                          Tempat Lahir
                        </label>
                        <input
                          type="text"
                          value={spouse.tempat_lahir}
                          onChange={(e) => setSpouse({ ...spouse, tempat_lahir: e.target.value })}
                          placeholder="Kota kelahiran"
                          className="w-full h-[40px] px-3.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-800"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1.5">
                          Tanggal Lahir
                        </label>
                        <input
                          type="date"
                          value={spouse.tanggal_lahir}
                          onChange={(e) => setSpouse({ ...spouse, tanggal_lahir: e.target.value })}
                          className="w-full h-[40px] px-3.5 bg-white border border-slate-200 rounded-xl text-xs font-mono tabular-nums font-semibold text-slate-800"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1.5">
                          No. Handphone Pasangan
                        </label>
                        <input
                          type="text"
                          value={spouse.no_hp}
                          onChange={(e) => setSpouse({ ...spouse, no_hp: e.target.value })}
                          placeholder="08xxxxxxxxxx"
                          className="w-full h-[40px] px-3.5 bg-white border border-slate-200 rounded-xl text-xs font-mono tabular-nums font-semibold text-slate-800"
                        />
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/70 text-xs text-slate-500 flex items-center justify-between">
                    <span>
                      Status pernikahan Anda saat ini tercatat sebagai{" "}
                      <strong className="text-slate-800">{identity.status_pernikahan}</strong> (Data pasangan tidak diwajibkan).
                    </span>
                    <button
                      type="button"
                      onClick={() => setActiveSection("identitas")}
                      className="font-bold text-[#0173b6] hover:underline cursor-pointer"
                    >
                      Ubah Status Pernikahan
                    </button>
                  </div>
                )}

                {/* C. Saudara Kandung */}
                <div className="space-y-4 pt-3 border-t border-slate-100">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-xs font-bold uppercase tracking-wider text-[#05445e]">
                        C. Daftar Saudara Kandung (Opsional)
                      </h3>
                      <p className="text-[11px] text-slate-400">
                        Tambahkan data kakak atau adik kandung jika ada
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        setSiblings([
                          ...siblings,
                          { nama: "", gender: "Laki-laki", umur: "", hubungan: "Kakak", pekerjaan: "" },
                        ])
                      }
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-blue-50 hover:bg-blue-100 text-[#0173b6] rounded-xl font-bold text-xs transition-all cursor-pointer"
                    >
                      <Plus size={14} />
                      <span>Tambah Saudara</span>
                    </button>
                  </div>

                  {siblings.length === 0 ? (
                    <div className="p-6 rounded-xl border border-dashed border-slate-200 text-center text-xs text-slate-400">
                      Belum ada daftar saudara kandung yang ditambahkan.
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {siblings.map((sb, idx) => (
                        <div
                          key={idx}
                          className="p-4 rounded-xl bg-slate-50/80 border border-slate-200/80 grid grid-cols-1 sm:grid-cols-12 gap-3 items-end"
                        >
                          <div className="sm:col-span-4">
                            <label className="block text-[11px] font-bold text-slate-600 mb-1">
                              Nama Lengkap Saudara
                            </label>
                            <input
                              type="text"
                              value={sb.nama}
                              onChange={(e) =>
                                setSiblings(
                                  siblings.map((it, i) => (i === idx ? { ...it, nama: e.target.value } : it))
                                )
                              }
                              placeholder="Nama saudara"
                              className="w-full h-[38px] px-3 bg-white border border-slate-200 rounded-xl text-xs font-semibold"
                            />
                          </div>
                          <div className="sm:col-span-2">
                            <label className="block text-[11px] font-bold text-slate-600 mb-1">
                              Hubungan
                            </label>
                            <select
                              value={sb.hubungan}
                              onChange={(e) =>
                                setSiblings(
                                  siblings.map((it, i) => (i === idx ? { ...it, hubungan: e.target.value } : it))
                                )
                              }
                              className="w-full h-[38px] px-2.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold"
                            >
                              <option value="Kakak">Kakak</option>
                              <option value="Adik">Adik</option>
                            </select>
                          </div>
                          <div className="sm:col-span-2">
                            <label className="block text-[11px] font-bold text-slate-600 mb-1">
                              Usia (Thn)
                            </label>
                            <input
                              type="number"
                              value={sb.umur}
                              onChange={(e) =>
                                setSiblings(
                                  siblings.map((it, i) => (i === idx ? { ...it, umur: e.target.value } : it))
                                )
                              }
                              placeholder="25"
                              className="w-full h-[38px] px-3 bg-white border border-slate-200 rounded-xl text-xs font-mono tabular-nums font-semibold"
                            />
                          </div>
                          <div className="sm:col-span-3">
                            <label className="block text-[11px] font-bold text-slate-600 mb-1">
                              Pekerjaan
                            </label>
                            <input
                              type="text"
                              value={sb.pekerjaan}
                              onChange={(e) =>
                                setSiblings(
                                  siblings.map((it, i) => (i === idx ? { ...it, pekerjaan: e.target.value } : it))
                                )
                              }
                              placeholder="Pekerjaan"
                              className="w-full h-[38px] px-3 bg-white border border-slate-200 rounded-xl text-xs font-semibold"
                            />
                          </div>
                          <div className="sm:col-span-1 flex justify-end">
                            <button
                              type="button"
                              onClick={() => setSiblings(siblings.filter((_, i) => i !== idx))}
                              className="h-[38px] w-[38px] flex items-center justify-center text-rose-600 hover:bg-rose-100 rounded-xl transition-colors cursor-pointer"
                              title="Hapus baris"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ===================================================== */}
            {/* BAGIAN 3: PENDIDIKAN FORMAL & PELATIHAN */}
            {/* ===================================================== */}
            {activeSection === "pendidikan" && (
              <div className="space-y-7">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-100">
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-[#0173b6]">
                      Bagian 3 dari 5 &bull; Wajib Minimal 1 Pendidikan Formal
                    </span>
                    <h2 className="text-xl font-bold text-[#05445e] mt-0.5">
                      Riwayat Pendidikan Formal &amp; Sertifikasi Pelatihan
                    </h2>
                  </div>
                  <span
                    className={`badge badge-sm font-bold ${
                      liveCompleteness.pillars.education ? "badge-success text-white" : "badge-warning"
                    }`}
                  >
                    {liveCompleteness.pillars.education ? "Bagian Ini Lengkap" : "Belum Lengkap"}
                  </span>
                </div>

                {/* A. Pendidikan Formal */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-xs font-bold uppercase tracking-wider text-[#05445e] flex items-center gap-2">
                        <GraduationCap size={16} className="text-[#0173b6]" />
                        <span>A. Pendidikan Formal (Wajib Minimal 1 Jenjang)</span>
                      </h3>
                      <p className="text-[11px] text-slate-400">
                        Isi dari pendidikan terakhir (contoh: D3 / S1 / Profesi / SMA)
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        setEducationFormal([
                          ...educationFormal,
                          {
                            tingkat: "S1",
                            nama_sekolah: "",
                            jurusan: "",
                            tahun_masuk: "",
                            tahun_lulus: "",
                            nomor_ijazah: "",
                            ipk: "",
                          },
                        ])
                      }
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-[#0173b6] hover:bg-[#05445e] text-white rounded-xl font-bold text-xs transition-all cursor-pointer"
                    >
                      <Plus size={14} />
                      <span>Tambah Jenjang Pendidikan</span>
                    </button>
                  </div>

                  <div className="space-y-4">
                    {educationFormal.map((ef, idx) => (
                      <div
                        key={idx}
                        className="p-5 rounded-2xl bg-slate-50/80 border border-slate-200/90 space-y-4 relative"
                      >
                        <div className="flex items-center justify-between pb-2 border-b border-slate-200/70">
                          <span className="text-xs font-extrabold text-[#05445e] uppercase tracking-wider">
                            Pendidikan Formal #{idx + 1}
                          </span>
                          {educationFormal.length > 1 && (
                            <button
                              type="button"
                              onClick={() =>
                                setEducationFormal(educationFormal.filter((_, i) => i !== idx))
                              }
                              className="inline-flex items-center gap-1 text-xs font-bold text-rose-600 hover:underline cursor-pointer"
                            >
                              <Trash2 size={13} />
                              <span>Hapus</span>
                            </button>
                          )}
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                          <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1.5">
                              Jenjang Pendidikan <span className="text-rose-500">*</span>
                            </label>
                            <SearchableSelect
                              options={JENJANG_OPTIONS}
                              value={
                                JENJANG_OPTIONS.find((o) => o.value === ef.tingkat) ||
                                JENJANG_OPTIONS[8]
                              }
                              onChange={(opt) =>
                                setEducationFormal(
                                  educationFormal.map((it, i) =>
                                    i === idx ? { ...it, tingkat: String(opt?.value || "S1") } : it
                                  )
                                )
                              }
                              placeholder="Pilih Jenjang"
                              isClearable={false}
                            />
                          </div>

                          <div className="sm:col-span-2">
                            <label className="block text-xs font-bold text-slate-700 mb-1.5">
                              Nama Sekolah / Perguruan Tinggi <span className="text-rose-500">*</span>
                            </label>
                            <input
                              type="text"
                              value={ef.nama_sekolah}
                              onChange={(e) =>
                                setEducationFormal(
                                  educationFormal.map((it, i) =>
                                    i === idx ? { ...it, nama_sekolah: e.target.value } : it
                                  )
                                )
                              }
                              placeholder="Contoh: Universitas Jenderal Achmad Yani / STIKES..."
                              className="w-full h-[38px] px-3.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-800"
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1.5">
                              Program Studi / Jurusan
                            </label>
                            <input
                              type="text"
                              value={ef.jurusan || ""}
                              onChange={(e) =>
                                setEducationFormal(
                                  educationFormal.map((it, i) =>
                                    i === idx ? { ...it, jurusan: e.target.value } : it
                                  )
                                )
                              }
                              placeholder="Contoh: S1 Keperawatan"
                              className="w-full h-[38px] px-3.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-800"
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1.5">
                              Tahun Masuk
                            </label>
                            <input
                              type="number"
                              value={ef.tahun_masuk || ""}
                              onChange={(e) =>
                                setEducationFormal(
                                  educationFormal.map((it, i) =>
                                    i === idx ? { ...it, tahun_masuk: e.target.value } : it
                                  )
                                )
                              }
                              placeholder="2018"
                              className="w-full h-[38px] px-3.5 bg-white border border-slate-200 rounded-xl text-xs font-mono tabular-nums font-semibold text-slate-800"
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1.5">
                              Tahun Lulus <span className="text-rose-500">*</span>
                            </label>
                            <input
                              type="number"
                              value={ef.tahun_lulus || ""}
                              onChange={(e) =>
                                setEducationFormal(
                                  educationFormal.map((it, i) =>
                                    i === idx ? { ...it, tahun_lulus: e.target.value } : it
                                  )
                                )
                              }
                              placeholder="2022"
                              className="w-full h-[38px] px-3.5 bg-white border border-slate-200 rounded-xl text-xs font-mono tabular-nums font-semibold text-slate-800"
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1.5">
                              Nomor Seri Ijazah
                            </label>
                            <input
                              type="text"
                              value={ef.nomor_ijazah || ""}
                              onChange={(e) =>
                                setEducationFormal(
                                  educationFormal.map((it, i) =>
                                    i === idx ? { ...it, nomor_ijazah: e.target.value } : it
                                  )
                                )
                              }
                              placeholder="Nomor ijazah resmi"
                              className="w-full h-[38px] px-3.5 bg-white border border-slate-200 rounded-xl text-xs font-mono tabular-nums font-semibold text-slate-800"
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1.5">
                              IPK / Nilai Rata-Rata
                            </label>
                            <input
                              type="text"
                              value={ef.ipk || ""}
                              onChange={(e) =>
                                setEducationFormal(
                                  educationFormal.map((it, i) =>
                                    i === idx ? { ...it, ipk: e.target.value } : it
                                  )
                                )
                              }
                              placeholder="Contoh: 3.65"
                              className="w-full h-[38px] px-3.5 bg-white border border-slate-200 rounded-xl text-xs font-mono tabular-nums font-semibold text-slate-800"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* B. Pelatihan Non-Formal */}
                <div className="space-y-4 pt-4 border-t border-slate-100">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-xs font-bold uppercase tracking-wider text-[#05445e] flex items-center gap-2">
                        <Award size={16} className="text-[#0173b6]" />
                        <span>B. Kursus, Pelatihan &amp; Sertifikasi Profesi (Opsional)</span>
                      </h3>
                      <p className="text-[11px] text-slate-400">
                        Contoh: BTCLS, ACLS, PPGD, Pelatihan K3RS, BHD, Manajemen Bangsal
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        setEducationNonFormal([
                          ...educationNonFormal,
                          {
                            nama_lembaga: "",
                            jenis_kursus: "",
                            tahun_masuk: "",
                            tahun_selesai: "",
                            nomor_sertifikat: "",
                          },
                        ])
                      }
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-blue-50 hover:bg-blue-100 text-[#0173b6] rounded-xl font-bold text-xs transition-all cursor-pointer"
                    >
                      <Plus size={14} />
                      <span>Tambah Pelatihan</span>
                    </button>
                  </div>

                  {educationNonFormal.length === 0 ? (
                    <div className="p-6 rounded-xl border border-dashed border-slate-200 text-center text-xs text-slate-400">
                      Belum ada riwayat pelatihan atau sertifikasi non-formal yang ditambahkan.
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {educationNonFormal.map((enf, idx) => (
                        <div
                          key={idx}
                          className="p-4 rounded-xl bg-slate-50/80 border border-slate-200/80 grid grid-cols-1 sm:grid-cols-12 gap-3 items-end"
                        >
                          <div className="sm:col-span-4">
                            <label className="block text-[11px] font-bold text-slate-600 mb-1">
                              Nama Pelatihan / Sertifikasi
                            </label>
                            <input
                              type="text"
                              value={enf.jenis_kursus || ""}
                              onChange={(e) =>
                                setEducationNonFormal(
                                  educationNonFormal.map((it, i) =>
                                    i === idx ? { ...it, jenis_kursus: e.target.value } : it
                                  )
                                )
                              }
                              placeholder="Contoh: Basic Trauma Cardiac Life Support"
                              className="w-full h-[38px] px-3 bg-white border border-slate-200 rounded-xl text-xs font-semibold"
                            />
                          </div>
                          <div className="sm:col-span-3">
                            <label className="block text-[11px] font-bold text-slate-600 mb-1">
                              Lembaga Penyelenggara
                            </label>
                            <input
                              type="text"
                              value={enf.nama_lembaga || ""}
                              onChange={(e) =>
                                setEducationNonFormal(
                                  educationNonFormal.map((it, i) =>
                                    i === idx ? { ...it, nama_lembaga: e.target.value } : it
                                  )
                                )
                              }
                              placeholder="Penyelenggara"
                              className="w-full h-[38px] px-3 bg-white border border-slate-200 rounded-xl text-xs font-semibold"
                            />
                          </div>
                          <div className="sm:col-span-2">
                            <label className="block text-[11px] font-bold text-slate-600 mb-1">
                              Tahun
                            </label>
                            <input
                              type="number"
                              value={enf.tahun_selesai || ""}
                              onChange={(e) =>
                                setEducationNonFormal(
                                  educationNonFormal.map((it, i) =>
                                    i === idx ? { ...it, tahun_selesai: e.target.value } : it
                                  )
                                )
                              }
                              placeholder="2024"
                              className="w-full h-[38px] px-3 bg-white border border-slate-200 rounded-xl text-xs font-mono tabular-nums font-semibold"
                            />
                          </div>
                          <div className="sm:col-span-2">
                            <label className="block text-[11px] font-bold text-slate-600 mb-1">
                              No. Sertifikat
                            </label>
                            <input
                              type="text"
                              value={enf.nomor_sertifikat || ""}
                              onChange={(e) =>
                                setEducationNonFormal(
                                  educationNonFormal.map((it, i) =>
                                    i === idx ? { ...it, nomor_sertifikat: e.target.value } : it
                                  )
                                )
                              }
                              placeholder="Nomor"
                              className="w-full h-[38px] px-3 bg-white border border-slate-200 rounded-xl text-xs font-mono tabular-nums font-semibold"
                            />
                          </div>
                          <div className="sm:col-span-1 flex justify-end">
                            <button
                              type="button"
                              onClick={() =>
                                setEducationNonFormal(educationNonFormal.filter((_, i) => i !== idx))
                              }
                              className="h-[38px] w-[38px] flex items-center justify-center text-rose-600 hover:bg-rose-100 rounded-xl transition-colors cursor-pointer"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ===================================================== */}
            {/* BAGIAN 4: PENGALAMAN KERJA */}
            {/* ===================================================== */}
            {activeSection === "pengalaman" && (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-100">
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-[#0173b6]">
                      Bagian 4 dari 5 &bull; Opsional
                    </span>
                    <h2 className="text-xl font-bold text-[#05445e] mt-0.5">
                      Riwayat Pengalaman Kerja Sebelum RSU Avisena
                    </h2>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      setExperience([
                        ...experience,
                        {
                          nama_instansi: "",
                          jabatan_terakhir: "",
                          lokasi: "",
                          lama_kerja: "",
                          tahun_mulai: "",
                          tahun_selesai: "",
                          alasan_berhenti: "",
                        },
                      ])
                    }
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#0173b6] hover:bg-[#05445e] text-white rounded-xl font-bold text-xs transition-all cursor-pointer"
                  >
                    <Plus size={14} />
                    <span>Tambah Pengalaman Kerja</span>
                  </button>
                </div>

                {experience.length === 0 ? (
                  <div className="p-10 rounded-2xl border border-dashed border-slate-200 text-center space-y-2">
                    <Building2 size={32} className="mx-auto text-slate-300" />
                    <p className="text-sm font-bold text-slate-600">
                      Belum Ada Riwayat Pengalaman Kerja Sebelumnya
                    </p>
                    <p className="text-xs text-slate-400 max-w-md mx-auto">
                      Jika Anda memiliki pengalaman kerja di rumah sakit atau perusahaan lain sebelum bergabung di RSU Avisena, klik tombol Tambah Pengalaman Kerja di atas.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {experience.map((ex, idx) => (
                      <div
                        key={idx}
                        className="p-5 rounded-2xl bg-slate-50/80 border border-slate-200/90 space-y-4"
                      >
                        <div className="flex items-center justify-between pb-2 border-b border-slate-200/70">
                          <span className="text-xs font-extrabold text-[#05445e] uppercase tracking-wider">
                            Pengalaman Kerja #{idx + 1}
                          </span>
                          <button
                            type="button"
                            onClick={() => setExperience(experience.filter((_, i) => i !== idx))}
                            className="inline-flex items-center gap-1 text-xs font-bold text-rose-600 hover:underline cursor-pointer"
                          >
                            <Trash2 size={13} />
                            <span>Hapus</span>
                          </button>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                          <div className="sm:col-span-2">
                            <label className="block text-xs font-bold text-slate-700 mb-1.5">
                              Nama Rumah Sakit / Perusahaan
                            </label>
                            <input
                              type="text"
                              value={ex.nama_instansi}
                              onChange={(e) =>
                                setExperience(
                                  experience.map((it, i) =>
                                    i === idx ? { ...it, nama_instansi: e.target.value } : it
                                  )
                                )
                              }
                              placeholder="Nama instansi tempat bekerja"
                              className="w-full h-[38px] px-3.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1.5">
                              Jabatan / Posisi Terakhir
                            </label>
                            <input
                              type="text"
                              value={ex.jabatan_terakhir || ""}
                              onChange={(e) =>
                                setExperience(
                                  experience.map((it, i) =>
                                    i === idx ? { ...it, jabatan_terakhir: e.target.value } : it
                                  )
                                )
                              }
                              placeholder="Posisi jabatan"
                              className="w-full h-[38px] px-3.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1.5">
                              Kota / Lokasi
                            </label>
                            <input
                              type="text"
                              value={ex.lokasi || ""}
                              onChange={(e) =>
                                setExperience(
                                  experience.map((it, i) =>
                                    i === idx ? { ...it, lokasi: e.target.value } : it
                                  )
                                )
                              }
                              placeholder="Kota"
                              className="w-full h-[38px] px-3.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1.5">
                              Tahun Mulai
                            </label>
                            <input
                              type="number"
                              value={ex.tahun_mulai || ""}
                              onChange={(e) =>
                                setExperience(
                                  experience.map((it, i) =>
                                    i === idx ? { ...it, tahun_mulai: e.target.value } : it
                                  )
                                )
                              }
                              placeholder="2020"
                              className="w-full h-[38px] px-3.5 bg-white border border-slate-200 rounded-xl text-xs font-mono tabular-nums font-semibold"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1.5">
                              Tahun Selesai
                            </label>
                            <input
                              type="number"
                              value={ex.tahun_selesai || ""}
                              onChange={(e) =>
                                setExperience(
                                  experience.map((it, i) =>
                                    i === idx ? { ...it, tahun_selesai: e.target.value } : it
                                  )
                                )
                              }
                              placeholder="2023"
                              className="w-full h-[38px] px-3.5 bg-white border border-slate-200 rounded-xl text-xs font-mono tabular-nums font-semibold"
                            />
                          </div>
                          <div className="sm:col-span-2">
                            <label className="block text-xs font-bold text-slate-700 mb-1.5">
                              Alasan Berhenti / Pindah
                            </label>
                            <input
                              type="text"
                              value={ex.alasan_berhenti || ""}
                              onChange={(e) =>
                                setExperience(
                                  experience.map((it, i) =>
                                    i === idx ? { ...it, alasan_berhenti: e.target.value } : it
                                  )
                                )
                              }
                              placeholder="Contoh: Kontrak berakhir / Pengembangan karir"
                              className="w-full h-[38px] px-3.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ===================================================== */}
            {/* BAGIAN 5: UNGGAH DOKUMEN & BERKAS DIGITAL */}
            {/* ===================================================== */}
            {activeSection === "dokumen" && (
              <div className="space-y-7">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-100">
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-[#0173b6]">
                      Bagian 5 dari 5 &bull; 4 Dokumen Utama Wajib
                    </span>
                    <h2 className="text-xl font-bold text-[#05445e] mt-0.5">
                      Arsip Berkas &amp; Dokumen Digital Kepegawaian
                    </h2>
                  </div>
                  <span
                    className={`badge badge-sm font-bold ${
                      liveCompleteness.pillars.documents ? "badge-success text-white" : "badge-warning"
                    }`}
                  >
                    {liveCompleteness.pillars.documents ? "4 Dokumen Wajib Lengkap" : "Dokumen Wajib Belum Lengkap"}
                  </span>
                </div>

                {/* Grid 8 Dokumen Standar */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {MAIN_DOC_FIELDS.map((docField) => {
                    const fileUrl = documents[docField.key];
                    const isUploading = uploadingKey === docField.key;

                    return (
                      <div
                        key={docField.key}
                        className={`p-5 rounded-2xl border transition-all flex flex-col justify-between gap-4 ${
                          fileUrl
                            ? "bg-emerald-50/30 border-emerald-200/90"
                            : docField.required
                            ? "bg-amber-50/30 border-amber-200/90"
                            : "bg-slate-50/70 border-slate-200/80"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <h4 className="text-xs font-extrabold text-slate-900">
                                {docField.label}
                              </h4>
                              {docField.required ? (
                                <span className="px-2 py-0.5 text-[9px] font-bold uppercase bg-rose-100 text-rose-700 rounded-md">
                                  Wajib
                                </span>
                              ) : (
                                <span className="px-2 py-0.5 text-[9px] font-bold uppercase bg-slate-200 text-slate-600 rounded-md">
                                  Opsional
                                </span>
                              )}
                            </div>
                            <p className="text-[11px] text-slate-500">{docField.desc}</p>
                          </div>

                          {fileUrl ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 shrink-0">
                              <CheckCircle2 size={12} />
                              <span>Terunggah</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-slate-200/80 text-slate-600 shrink-0">
                              Kosong
                            </span>
                          )}
                        </div>

                        <div className="flex items-center justify-between gap-3 pt-3 border-t border-slate-200/60">
                          {fileUrl ? (
                            <a
                              href={fileUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 text-xs font-bold text-[#0173b6] hover:underline"
                            >
                              <ExternalLink size={14} />
                              <span>Lihat / Unduh Dokumen</span>
                            </a>
                          ) : (
                            <span className="text-[11px] text-slate-400 italic">
                              Format PDF, JPG, atau PNG (Maks. 10MB)
                            </span>
                          )}

                          <label className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl font-bold text-xs cursor-pointer shadow-2xs transition-all shrink-0">
                            {isUploading ? (
                              <Loader2 size={14} className="animate-spin text-[#0173b6]" />
                            ) : (
                              <Upload size={14} className="text-[#0173b6]" />
                            )}
                            <span>{fileUrl ? "Ganti Berkas" : "Pilih Berkas"}</span>
                            <input
                              type="file"
                              accept=".pdf,.jpg,.jpeg,.png"
                              className="hidden"
                              disabled={isUploading}
                              onChange={(e) => {
                                const f = e.target.files?.[0];
                                if (f) handleFileUpload(f, docField.key);
                              }}
                            />
                          </label>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Sertifikat & Dokumen Pendukung Tambahan */}
                <div className="space-y-4 pt-5 border-t border-slate-200/80">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-xs font-bold uppercase tracking-wider text-[#05445e] flex items-center gap-2">
                        <Paperclip size={15} className="text-[#0173b6]" />
                        <span>Sertifikat Pelatihan &amp; Dokumen Tambahan Lainnya</span>
                      </h3>
                      <p className="text-[11px] text-slate-400">
                        Tambahkan berkas sertifikat kompetensi, NPWP, BPJS, atau dokumen pendukung lain
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        setOtherDocuments([...otherDocuments, { nama_dokumen: "", file_url: "" }])
                      }
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-blue-50 hover:bg-blue-100 text-[#0173b6] rounded-xl font-bold text-xs transition-all cursor-pointer"
                    >
                      <Plus size={14} />
                      <span>Tambah Dokumen Lain</span>
                    </button>
                  </div>

                  {otherDocuments.length === 0 ? (
                    <div className="p-6 rounded-xl border border-dashed border-slate-200 text-center text-xs text-slate-400">
                      Belum ada dokumen tambahan yang dilampirkan.
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {otherDocuments.map((od, idx) => {
                        const uploadKey = `other_${idx}`;
                        const isUploading = uploadingKey === uploadKey;
                        return (
                          <div
                            key={idx}
                            className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                          >
                            <div className="flex-1">
                              <input
                                type="text"
                                placeholder="Nama Dokumen (Contoh: Sertifikat BTCLS / Kartu NPWP / BPJS)"
                                value={od.nama_dokumen}
                                onChange={(e) =>
                                  setOtherDocuments(
                                    otherDocuments.map((it, i) =>
                                      i === idx ? { ...it, nama_dokumen: e.target.value } : it
                                    )
                                  )
                                }
                                className="w-full h-[38px] px-3.5 rounded-xl border border-slate-200 bg-white text-xs font-semibold"
                              />
                            </div>

                            <div className="flex items-center gap-2.5">
                              {od.file_url && (
                                <a
                                  href={od.file_url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1 px-3 py-2 bg-blue-50 text-[#0173b6] rounded-xl text-xs font-bold hover:underline"
                                >
                                  <ExternalLink size={13} />
                                  <span>Lihat Berkas</span>
                                </a>
                              )}

                              <label className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 cursor-pointer hover:bg-slate-100">
                                {isUploading ? (
                                  <Loader2 size={13} className="animate-spin text-[#0173b6]" />
                                ) : (
                                  <Upload size={13} className="text-[#0173b6]" />
                                )}
                                <span>{od.file_url ? "Ganti File" : "Unggah File"}</span>
                                <input
                                  type="file"
                                  accept=".pdf,.jpg,.jpeg,.png"
                                  className="hidden"
                                  disabled={isUploading}
                                  onChange={(e) => {
                                    const f = e.target.files?.[0];
                                    if (f) handleFileUpload(f, uploadKey, idx);
                                  }}
                                />
                              </label>

                              <button
                                type="button"
                                onClick={() =>
                                  setOtherDocuments(otherDocuments.filter((_, i) => i !== idx))
                                }
                                className="h-[38px] w-[38px] flex items-center justify-center text-rose-600 hover:bg-rose-100 rounded-xl transition-colors cursor-pointer"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* FOOTER NAVIGASI ANTAR BAGIAN & TOMBOL SIMPAN */}
            <div className="pt-6 border-t border-slate-200/80 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-2 w-full sm:w-auto">
                {currentSectionIndex > 0 && (
                  <button
                    type="button"
                    onClick={() => setActiveSection(sectionList[currentSectionIndex - 1].id)}
                    className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-xs uppercase tracking-wider transition-all cursor-pointer"
                  >
                    <ChevronLeft size={15} />
                    <span>Bagian Sebelumnya</span>
                  </button>
                )}
              </div>

              <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
                {currentSectionIndex < sectionList.length - 1 ? (
                  <button
                    type="button"
                    onClick={() => setActiveSection(sectionList[currentSectionIndex + 1].id)}
                    className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-slate-800 hover:bg-slate-900 text-white rounded-xl font-bold text-xs uppercase tracking-wider transition-all cursor-pointer"
                  >
                    <span>Bagian Selanjutnya</span>
                    <ChevronRight size={15} />
                  </button>
                ) : null}

                <button
                  type="button"
                  onClick={handleSaveAll}
                  disabled={isSaving}
                  className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#0173b6] hover:bg-[#05445e] text-white rounded-xl font-bold text-xs uppercase tracking-wider shadow-xs transition-all active:scale-[0.98] cursor-pointer disabled:opacity-50"
                >
                  {isSaving ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
                  <span>Simpan Seluruh Data</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
