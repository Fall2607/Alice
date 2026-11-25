"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  User,
  Users,
  GraduationCap,
  Briefcase,
  FileText,
  CheckCircle2,
  AlertCircle,
  Edit3,
  Save,
  X,
  Plus,
  Trash2,
  Upload,
  ExternalLink,
  Loader2,
  Sparkles,
  ShieldCheck,
  Award,
  Paperclip,
} from "lucide-react";
import { showSuccessToast, showErrorToast } from "@/app/components/admin/Alert";

interface CompletenessInfo {
  is_complete: boolean;
  percentage: number;
  missing_sections: string[];
  pillars: {
    identity: boolean;
    family: boolean;
    education: boolean;
    documents: boolean;
  };
}

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

type SectionSubTab = "identitas" | "keluarga" | "pendidikan" | "pengalaman" | "dokumen";

const MAIN_DOC_FIELDS: {
  key: string;
  label: string;
  required: boolean;
  desc: string;
}[] = [
  { key: "pas_foto_url", label: "Pas Foto Formal", required: true, desc: "Format JPG/PNG berlatar rapi" },
  { key: "scan_ktp_url", label: "Scan KTP", required: true, desc: "KTP elektronik yang masih berlaku" },
  { key: "kartu_keluarga_url", label: "Kartu Keluarga (KK)", required: true, desc: "Dokumen KK terbaru" },
  { key: "ijazah_url", label: "Ijazah Pendidikan Terakhir", required: true, desc: "Scan ijazah asli/legalisir" },
  { key: "transkrip_url", label: "Transkrip Nilai", required: false, desc: "Transkrip akademik pendidikan terakhir" },
  { key: "str_url", label: "STR / SIP (Nakes)", required: false, desc: "Wajib bagi tenaga medis & kesehatan" },
  { key: "cv_url", label: "Curriculum Vitae (CV)", required: false, desc: "Ringkasan riwayat hidup terbaru" },
  { key: "paklaring_url", label: "Surat Pengalaman Kerja (Paklaring)", required: false, desc: "Jika memiliki pengalaman sebelumnya" },
];

const AGAMA_OPTIONS = ["Islam", "Kristen", "Katolik", "Hindu", "Buddha", "Konghucu"];
const MARITAL_OPTIONS = ["Belum Kawin", "Kawin", "Cerai Hidup", "Cerai Mati"];
const JENJANG_OPTIONS = ["SD", "SMP", "SMA", "SMK", "D1", "D2", "D3", "D4", "S1", "Profesi", "S2", "S3"];

function toDateInputString(val?: string | null): string {
  if (!val) return "";
  if (val.includes("T")) return val.split("T")[0];
  return val.substring(0, 10);
}

export default function EmployeeCompleteProfileSection({
  karyawanId,
  initialEditMode = false,
  isHRDView = false,
  onProfileSaved,
}: {
  readonly karyawanId: string;
  readonly initialEditMode?: boolean;
  readonly isHRDView?: boolean;
  readonly onProfileSaved?: (pasFotoUrl?: string | null) => void;
}) {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(initialEditMode);
  const [activeSubTab, setActiveSubTab] = useState<SectionSubTab>("identitas");
  const [uploadingKey, setUploadingKey] = useState<string | null>(null);
  const [autoSyncedBanner, setAutoSyncedBanner] = useState(false);
  const [completeness, setCompleteness] = useState<CompletenessInfo | null>(null);

  // Form states
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

  const fetchCompleteProfile = useCallback(async () => {
    if (!karyawanId) return;
    setIsLoading(true);
    try {
      const res = await fetch(`/api/karyawan/${karyawanId}/profile-lengkap`);
      if (!res.ok) throw new Error("Gagal memuat data kelengkapan profil.");
      const data = await res.json();

      const k = data.karyawan || {};
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
          : []
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
      setCompleteness(data.completeness || null);

      if (data.auto_synced_from_candidate) {
        setAutoSyncedBanner(true);
      }
      if (onProfileSaved && dc.pas_foto_url) {
        onProfileSaved(dc.pas_foto_url);
      }
    } catch (err) {
      console.error(err);
      showErrorToast("Gagal memuat rincian kelengkapan data diri.");
    } finally {
      setIsLoading(false);
    }
  }, [karyawanId, onProfileSaved]);

  useEffect(() => {
    fetchCompleteProfile();
  }, [fetchCompleteProfile]);

  useEffect(() => {
    if (initialEditMode) {
      setIsEditing(true);
    }
  }, [initialEditMode]);

  const handleFileUpload = async (file: File, targetKey: string, isOtherDocIndex?: number) => {
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      showErrorToast("Ukuran file maksimal 10 MB.");
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
        throw new Error(data.message || "Gagal mengunggah dokumen.");
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
      showSuccessToast("Berkas berhasil diunggah. Jangan lupa klik Simpan Data.");
    } catch (err) {
      console.error(err);
      showErrorToast(err instanceof Error ? err.message : "Gagal mengunggah berkas.");
    } finally {
      setUploadingKey(null);
    }
  };

  const handleSaveAll = async () => {
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

      showSuccessToast("Data informasi diri & dokumen berhasil disimpan!");
      setIsEditing(false);
      await fetchCompleteProfile();
    } catch (err) {
      console.error(err);
      showErrorToast(err instanceof Error ? err.message : "Gagal menyimpan data.");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="rounded-2xl bg-white p-8 border border-slate-200/80 shadow-xs flex items-center justify-center gap-3 text-slate-500">
        <Loader2 className="animate-spin text-primary" size={20} />
        <span className="text-xs font-bold uppercase tracking-wider">
          Memuat Data Keluarga, Pendidikan &amp; Berkas Dokumen...
        </span>
      </div>
    );
  }

  const pct = completeness?.percentage ?? 0;

  return (
    <div className="space-y-6">
      {/* Banner Status Kelengkapan Profil */}
      <div
        className={`rounded-2xl p-5 border shadow-xs transition-all ${
          completeness?.is_complete
            ? "bg-emerald-50/70 border-emerald-200"
            : "bg-amber-50/70 border-amber-200"
        }`}
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              {completeness?.is_complete ? (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-600 text-white">
                  <CheckCircle2 size={12} />
                  <span>Data Diri &amp; Berkas Lengkap (100%)</span>
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-500 text-white">
                  <AlertCircle size={12} />
                  <span>Kelengkapan Data Diri: {pct}%</span>
                </span>
              )}

              {autoSyncedBanner && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-100 text-primary border border-blue-200">
                  <Sparkles size={11} />
                  <span>Otomatis Ditarik dari Riwayat Lamaran</span>
                </span>
              )}
            </div>

            <p className="text-xs font-semibold text-slate-700">
              {completeness?.is_complete
                ? "Seluruh syarat data identitas, keluarga, pendidikan formal, dan 4 dokumen utama telah terpenuhi."
                : `Masih terdapat bagian yang belum lengkap: ${completeness?.missing_sections.join(" • ")}`}
            </p>

            {/* 4 Pillars Mini Indicators */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2">
              {[
                { label: "1. Identitas Diri", ok: completeness?.pillars.identity },
                { label: "2. Data Keluarga", ok: completeness?.pillars.family },
                { label: "3. Pendidikan Formal", ok: completeness?.pillars.education },
                { label: "4. Dokumen Utama", ok: completeness?.pillars.documents },
              ].map((pil) => (
                <div
                  key={pil.label}
                  className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border text-[11px] font-bold ${
                    pil.ok
                      ? "bg-white border-emerald-200 text-emerald-700"
                      : "bg-white/80 border-amber-200 text-amber-700"
                  }`}
                >
                  {pil.ok ? (
                    <CheckCircle2 size={13} className="text-emerald-600 shrink-0" />
                  ) : (
                    <AlertCircle size={13} className="text-amber-500 shrink-0" />
                  )}
                  <span className="truncate">{pil.label}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {!isEditing ? (
              <button
                type="button"
                onClick={() => setIsEditing(true)}
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-primary hover:bg-primary-dark text-white rounded-xl font-bold text-xs uppercase tracking-wider shadow-xs transition-all active:scale-[0.98] cursor-pointer"
              >
                <Edit3 size={14} />
                <span>{completeness?.is_complete ? "Perbarui Data & Berkas" : "Lengkapi Data Sekarang"}</span>
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsEditing(false);
                    fetchCompleteProfile();
                  }}
                  disabled={isSaving}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2.5 bg-white hover:bg-slate-100 text-slate-600 border border-slate-200 rounded-xl font-bold text-xs uppercase tracking-wider transition-all cursor-pointer"
                >
                  <X size={14} />
                  <span>Batal</span>
                </button>
                <button
                  type="button"
                  onClick={handleSaveAll}
                  disabled={isSaving}
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs uppercase tracking-wider shadow-xs transition-all active:scale-[0.98] cursor-pointer disabled:opacity-50"
                >
                  {isSaving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                  <span>Simpan Semua Data</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Kontainer Utama 5 Tab Data Diri, Keluarga, Pendidikan, Pengalaman & Dokumen */}
      <div className="rounded-2xl bg-white border border-slate-200/90 shadow-xs p-5 sm:p-6 space-y-6">
        {/* Sub-Tabs Navigation */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl border border-slate-200 overflow-x-auto text-xs">
          {[
            { id: "identitas", label: "Identitas & Kontak", icon: User, ok: completeness?.pillars.identity },
            { id: "keluarga", label: "Data Keluarga", icon: Users, ok: completeness?.pillars.family },
            { id: "pendidikan", label: "Pendidikan & Pelatihan", icon: GraduationCap, ok: completeness?.pillars.education },
            { id: "pengalaman", label: "Pengalaman Kerja", icon: Briefcase, ok: true },
            { id: "dokumen", label: "Dokumen & Berkas", icon: FileText, ok: completeness?.pillars.documents },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeSubTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveSubTab(tab.id as SectionSubTab)}
                className={`flex-1 min-w-[140px] py-2.5 px-3 rounded-lg font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  isActive
                    ? "bg-primary text-white shadow-xs"
                    : "text-slate-600 hover:text-slate-900 hover:bg-white/60"
                }`}
              >
                <Icon size={14} />
                <span>{tab.label}</span>
                {!tab.ok && (
                  <span
                    className={`w-2 h-2 rounded-full ${
                      isActive ? "bg-amber-300" : "bg-amber-500"
                    }`}
                    title="Bagian ini belum lengkap"
                  />
                )}
              </button>
            );
          })}
        </div>

        {/* TAB 1: IDENTITAS & KONTAK */}
        {activeSubTab === "identitas" && (
          <div className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                  Nama Lengkap (Sesuai KTP) *
                </label>
                <input
                  type="text"
                  disabled={!isEditing}
                  value={identity.nama_lengkap}
                  onChange={(e) => setIdentity({ ...identity, nama_lengkap: e.target.value })}
                  className="w-full h-[38px] px-3 rounded-xl border border-slate-200 bg-slate-50/80 text-xs font-semibold text-slate-800 focus:bg-white focus:border-primary focus:outline-none disabled:opacity-75"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                  Nomor Induk Kependudukan (NIK KTP) *
                </label>
                <input
                  type="text"
                  disabled={!isEditing}
                  value={identity.nik}
                  onChange={(e) => setIdentity({ ...identity, nik: e.target.value })}
                  className="w-full h-[38px] px-3 rounded-xl border border-slate-200 bg-slate-50/80 text-xs font-mono tabular-nums font-semibold text-slate-800 focus:bg-white focus:border-primary focus:outline-none disabled:opacity-75"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                  Tempat Lahir *
                </label>
                <input
                  type="text"
                  disabled={!isEditing}
                  placeholder="Contoh: Bandung / Cimahi"
                  value={identity.tempat_lahir}
                  onChange={(e) => setIdentity({ ...identity, tempat_lahir: e.target.value })}
                  className="w-full h-[38px] px-3 rounded-xl border border-slate-200 bg-slate-50/80 text-xs font-semibold text-slate-800 focus:bg-white focus:border-primary focus:outline-none disabled:opacity-75"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                  Tanggal Lahir *
                </label>
                <input
                  type="date"
                  disabled={!isEditing}
                  value={identity.tanggal_lahir}
                  onChange={(e) => setIdentity({ ...identity, tanggal_lahir: e.target.value })}
                  className="w-full h-[38px] px-3 rounded-xl border border-slate-200 bg-slate-50/80 text-xs font-mono tabular-nums font-semibold text-slate-800 focus:bg-white focus:border-primary focus:outline-none disabled:opacity-75"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                  Jenis Kelamin *
                </label>
                <select
                  disabled={!isEditing}
                  value={identity.jenis_kelamin}
                  onChange={(e) => setIdentity({ ...identity, jenis_kelamin: e.target.value })}
                  className="w-full h-[38px] px-3 rounded-xl border border-slate-200 bg-slate-50/80 text-xs font-semibold text-slate-800 focus:bg-white focus:border-primary focus:outline-none disabled:opacity-75"
                >
                  <option value="Laki-laki">Laki-laki</option>
                  <option value="Perempuan">Perempuan</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                  Agama *
                </label>
                <select
                  disabled={!isEditing}
                  value={identity.agama}
                  onChange={(e) => setIdentity({ ...identity, agama: e.target.value })}
                  className="w-full h-[38px] px-3 rounded-xl border border-slate-200 bg-slate-50/80 text-xs font-semibold text-slate-800 focus:bg-white focus:border-primary focus:outline-none disabled:opacity-75"
                >
                  {AGAMA_OPTIONS.map((ag) => (
                    <option key={ag} value={ag}>
                      {ag}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                  Suku Bangsa
                </label>
                <input
                  type="text"
                  disabled={!isEditing}
                  placeholder="Contoh: Sunda / Jawa"
                  value={identity.suku_bangsa}
                  onChange={(e) => setIdentity({ ...identity, suku_bangsa: e.target.value })}
                  className="w-full h-[38px] px-3 rounded-xl border border-slate-200 bg-slate-50/80 text-xs font-semibold text-slate-800 focus:bg-white focus:border-primary focus:outline-none disabled:opacity-75"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                  Status Pernikahan *
                </label>
                <select
                  disabled={!isEditing}
                  value={identity.status_pernikahan}
                  onChange={(e) => setIdentity({ ...identity, status_pernikahan: e.target.value })}
                  className="w-full h-[38px] px-3 rounded-xl border border-slate-200 bg-slate-50/80 text-xs font-semibold text-slate-800 focus:bg-white focus:border-primary focus:outline-none disabled:opacity-75"
                >
                  {MARITAL_OPTIONS.map((st) => (
                    <option key={st} value={st}>
                      {st}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                  Jumlah Anak
                </label>
                <input
                  type="number"
                  min={0}
                  disabled={!isEditing}
                  value={identity.jumlah_anak}
                  onChange={(e) => setIdentity({ ...identity, jumlah_anak: Number(e.target.value) || 0 })}
                  className="w-full h-[38px] px-3 rounded-xl border border-slate-200 bg-slate-50/80 text-xs font-mono tabular-nums font-semibold text-slate-800 focus:bg-white focus:border-primary focus:outline-none disabled:opacity-75"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                  No. Handphone / WhatsApp *
                </label>
                <input
                  type="text"
                  disabled={!isEditing}
                  value={identity.handphone}
                  onChange={(e) => setIdentity({ ...identity, handphone: e.target.value })}
                  className="w-full h-[38px] px-3 rounded-xl border border-slate-200 bg-slate-50/80 text-xs font-mono tabular-nums font-semibold text-slate-800 focus:bg-white focus:border-primary focus:outline-none disabled:opacity-75"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                  Alamat Email Aktif *
                </label>
                <input
                  type="email"
                  disabled={!isEditing}
                  value={identity.email}
                  onChange={(e) => setIdentity({ ...identity, email: e.target.value })}
                  className="w-full h-[38px] px-3 rounded-xl border border-slate-200 bg-slate-50/80 text-xs font-semibold text-slate-800 focus:bg-white focus:border-primary focus:outline-none disabled:opacity-75"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                  No. Rekening Payroll BSI
                </label>
                <input
                  type="text"
                  disabled={!isEditing}
                  placeholder="Nomor rekening Bank Syariah Indonesia"
                  value={identity.rekening_bsi}
                  onChange={(e) => setIdentity({ ...identity, rekening_bsi: e.target.value })}
                  className="w-full h-[38px] px-3 rounded-xl border border-slate-200 bg-slate-50/80 text-xs font-mono tabular-nums font-semibold text-slate-800 focus:bg-white focus:border-primary focus:outline-none disabled:opacity-75"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                  Nomor SIP / STR (Khusus Nakes)
                </label>
                <input
                  type="text"
                  disabled={!isEditing}
                  placeholder="Kosongkan jika Non-Medis"
                  value={identity.sip}
                  onChange={(e) => setIdentity({ ...identity, sip: e.target.value })}
                  className="w-full h-[38px] px-3 rounded-xl border border-slate-200 bg-slate-50/80 text-xs font-mono tabular-nums font-semibold text-slate-800 focus:bg-white focus:border-primary focus:outline-none disabled:opacity-75"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                  Masa Berlaku SIP / STR
                </label>
                <input
                  type="date"
                  disabled={!isEditing}
                  value={identity.masa_berlaku_sip}
                  onChange={(e) => setIdentity({ ...identity, masa_berlaku_sip: e.target.value })}
                  className="w-full h-[38px] px-3 rounded-xl border border-slate-200 bg-slate-50/80 text-xs font-mono tabular-nums font-semibold text-slate-800 focus:bg-white focus:border-primary focus:outline-none disabled:opacity-75"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                  Alamat Sesuai KTP *
                </label>
                <textarea
                  rows={2}
                  disabled={!isEditing}
                  value={identity.alamat}
                  onChange={(e) => setIdentity({ ...identity, alamat: e.target.value })}
                  className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50/80 text-xs font-semibold text-slate-800 focus:bg-white focus:border-primary focus:outline-none disabled:opacity-75"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                  Alamat Domisili Saat Ini
                </label>
                <textarea
                  rows={2}
                  disabled={!isEditing}
                  placeholder="Isi jika berbeda dengan alamat KTP"
                  value={identity.alamat_domisili}
                  onChange={(e) => setIdentity({ ...identity, alamat_domisili: e.target.value })}
                  className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50/80 text-xs font-semibold text-slate-800 focus:bg-white focus:border-primary focus:outline-none disabled:opacity-75"
                />
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: DATA KELUARGA */}
        {activeSubTab === "keluarga" && (
          <div className="space-y-6">
            {/* Orang Tua Kandung (Wajib) */}
            <div className="p-4 rounded-2xl bg-slate-50/70 border border-slate-200/80 space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-800">
                  Data Orang Tua Kandung (Wajib)
                </h4>
                <span className="text-[10px] font-bold text-primary uppercase">Syarat Kelengkapan</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Nama Ayah Kandung *</label>
                  <input
                    type="text"
                    disabled={!isEditing}
                    value={parents.nama_ayah}
                    onChange={(e) => setParents({ ...parents, nama_ayah: e.target.value })}
                    className="w-full h-[38px] px-3 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Pekerjaan Ayah</label>
                  <input
                    type="text"
                    disabled={!isEditing}
                    value={parents.pekerjaan_ayah}
                    onChange={(e) => setParents({ ...parents, pekerjaan_ayah: e.target.value })}
                    className="w-full h-[38px] px-3 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">No. HP Ayah</label>
                  <input
                    type="text"
                    disabled={!isEditing}
                    value={parents.nohp_ayah}
                    onChange={(e) => setParents({ ...parents, nohp_ayah: e.target.value })}
                    className="w-full h-[38px] px-3 rounded-xl border border-slate-200 bg-white text-xs font-mono tabular-nums font-semibold text-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Nama Ibu Kandung *</label>
                  <input
                    type="text"
                    disabled={!isEditing}
                    value={parents.nama_ibu}
                    onChange={(e) => setParents({ ...parents, nama_ibu: e.target.value })}
                    className="w-full h-[38px] px-3 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Pekerjaan Ibu</label>
                  <input
                    type="text"
                    disabled={!isEditing}
                    value={parents.pekerjaan_ibu}
                    onChange={(e) => setParents({ ...parents, pekerjaan_ibu: e.target.value })}
                    className="w-full h-[38px] px-3 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">No. HP Ibu</label>
                  <input
                    type="text"
                    disabled={!isEditing}
                    value={parents.nohp_ibu}
                    onChange={(e) => setParents({ ...parents, nohp_ibu: e.target.value })}
                    className="w-full h-[38px] px-3 rounded-xl border border-slate-200 bg-white text-xs font-mono tabular-nums font-semibold text-slate-800"
                  />
                </div>
              </div>
            </div>

            {/* Data Pasangan (Jika Kawin) */}
            {identity.status_pernikahan === "Kawin" && (
              <div className="p-4 rounded-2xl bg-blue-50/40 border border-blue-200/70 space-y-4">
                <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-800">
                  Data Pasangan (Suami / Istri) *
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Nama Pasangan *</label>
                    <input
                      type="text"
                      disabled={!isEditing}
                      value={spouse.nama}
                      onChange={(e) => setSpouse({ ...spouse, nama: e.target.value })}
                      className="w-full h-[38px] px-3 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-800"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Tempat Lahir</label>
                    <input
                      type="text"
                      disabled={!isEditing}
                      value={spouse.tempat_lahir}
                      onChange={(e) => setSpouse({ ...spouse, tempat_lahir: e.target.value })}
                      className="w-full h-[38px] px-3 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-800"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Tanggal Lahir</label>
                    <input
                      type="date"
                      disabled={!isEditing}
                      value={spouse.tanggal_lahir}
                      onChange={(e) => setSpouse({ ...spouse, tanggal_lahir: e.target.value })}
                      className="w-full h-[38px] px-3 rounded-xl border border-slate-200 bg-white text-xs font-mono tabular-nums font-semibold text-slate-800"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">No. Telepon / WA</label>
                    <input
                      type="text"
                      disabled={!isEditing}
                      value={spouse.no_hp}
                      onChange={(e) => setSpouse({ ...spouse, no_hp: e.target.value })}
                      className="w-full h-[38px] px-3 rounded-xl border border-slate-200 bg-white text-xs font-mono tabular-nums font-semibold text-slate-800"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Saudara Kandung */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-800">
                  Daftar Saudara Kandung (Opsional)
                </h4>
                {isEditing && (
                  <button
                    type="button"
                    onClick={() =>
                      setSiblings([
                        ...siblings,
                        { nama: "", gender: "Laki-laki", umur: "", hubungan: "Kakak", pekerjaan: "" },
                      ])
                    }
                    className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-primary rounded-xl font-bold text-xs transition-all cursor-pointer"
                  >
                    <Plus size={13} />
                    <span>Tambah Saudara</span>
                  </button>
                )}
              </div>

              {siblings.length === 0 ? (
                <p className="text-xs text-slate-400 italic py-2">Belum ada data saudara kandung yang dicatat.</p>
              ) : (
                <div className="space-y-2.5">
                  {siblings.map((sb, idx) => (
                    <div
                      key={idx}
                      className="grid grid-cols-1 sm:grid-cols-6 gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-200/80 items-end"
                    >
                      <div className="sm:col-span-2">
                        <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Nama Saudara</label>
                        <input
                          type="text"
                          disabled={!isEditing}
                          value={sb.nama}
                          onChange={(e) =>
                            setSiblings(siblings.map((it, i) => (i === idx ? { ...it, nama: e.target.value } : it)))
                          }
                          className="w-full h-[36px] px-2.5 rounded-lg border border-slate-200 bg-white text-xs font-semibold"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Hubungan</label>
                        <select
                          disabled={!isEditing}
                          value={sb.hubungan}
                          onChange={(e) =>
                            setSiblings(siblings.map((it, i) => (i === idx ? { ...it, hubungan: e.target.value } : it)))
                          }
                          className="w-full h-[36px] px-2.5 rounded-lg border border-slate-200 bg-white text-xs font-semibold"
                        >
                          <option value="Kakak">Kakak</option>
                          <option value="Adik">Adik</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Usia (Thn)</label>
                        <input
                          type="number"
                          disabled={!isEditing}
                          value={sb.umur}
                          onChange={(e) =>
                            setSiblings(siblings.map((it, i) => (i === idx ? { ...it, umur: e.target.value } : it)))
                          }
                          className="w-full h-[36px] px-2.5 rounded-lg border border-slate-200 bg-white text-xs font-mono tabular-nums font-semibold"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Pekerjaan</label>
                        <input
                          type="text"
                          disabled={!isEditing}
                          value={sb.pekerjaan}
                          onChange={(e) =>
                            setSiblings(siblings.map((it, i) => (i === idx ? { ...it, pekerjaan: e.target.value } : it)))
                          }
                          className="w-full h-[36px] px-2.5 rounded-lg border border-slate-200 bg-white text-xs font-semibold"
                        />
                      </div>
                      {isEditing && (
                        <div className="flex justify-end">
                          <button
                            type="button"
                            onClick={() => setSiblings(siblings.filter((_, i) => i !== idx))}
                            className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 3: PENDIDIKAN FORMAL & PELATIHAN */}
        {activeSubTab === "pendidikan" && (
          <div className="space-y-6">
            {/* Pendidikan Formal (Wajib Min. 1) */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-800">
                    Riwayat Pendidikan Formal (Wajib Minimal 1) *
                  </h4>
                  <p className="text-[11px] text-slate-500">Cantumkan pendidikan terakhir atau seluruh riwayat pendidikan formal</p>
                </div>
                {isEditing && (
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
                    className="inline-flex items-center gap-1 px-3 py-1.5 bg-primary text-white rounded-xl font-bold text-xs transition-all cursor-pointer"
                  >
                    <Plus size={13} />
                    <span>Tambah Pendidikan Formal</span>
                  </button>
                )}
              </div>

              {educationFormal.length === 0 ? (
                <div className="p-6 rounded-xl border border-dashed border-amber-300 bg-amber-50/40 text-center space-y-2">
                  <p className="text-xs font-bold text-amber-800">Belum ada data pendidikan formal.</p>
                  {isEditing && (
                    <button
                      type="button"
                      onClick={() =>
                        setEducationFormal([
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
                      className="inline-flex items-center gap-1 px-3 py-1.5 bg-amber-500 text-white rounded-lg font-bold text-xs"
                    >
                      <Plus size={13} />
                      <span>Isi Pendidikan Sekarang</span>
                    </button>
                  )}
                </div>
              ) : (
                <div className="space-y-3">
                  {educationFormal.map((ef, idx) => (
                    <div
                      key={idx}
                      className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-7 gap-3 items-end"
                    >
                      <div>
                        <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Jenjang *</label>
                        <select
                          disabled={!isEditing}
                          value={ef.tingkat || "S1"}
                          onChange={(e) =>
                            setEducationFormal(
                              educationFormal.map((it, i) => (i === idx ? { ...it, tingkat: e.target.value } : it))
                            )
                          }
                          className="w-full h-[36px] px-2.5 rounded-lg border border-slate-200 bg-white text-xs font-bold"
                        >
                          {JENJANG_OPTIONS.map((j) => (
                            <option key={j} value={j}>
                              {j}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="sm:col-span-2">
                        <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">
                          Nama Sekolah / Universitas *
                        </label>
                        <input
                          type="text"
                          disabled={!isEditing}
                          placeholder="Contoh: Universitas Padjadjaran"
                          value={ef.nama_sekolah}
                          onChange={(e) =>
                            setEducationFormal(
                              educationFormal.map((it, i) => (i === idx ? { ...it, nama_sekolah: e.target.value } : it))
                            )
                          }
                          className="w-full h-[36px] px-2.5 rounded-lg border border-slate-200 bg-white text-xs font-semibold"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Jurusan / Prodi</label>
                        <input
                          type="text"
                          disabled={!isEditing}
                          placeholder="Keperawatan / dll"
                          value={ef.jurusan || ""}
                          onChange={(e) =>
                            setEducationFormal(
                              educationFormal.map((it, i) => (i === idx ? { ...it, jurusan: e.target.value } : it))
                            )
                          }
                          className="w-full h-[36px] px-2.5 rounded-lg border border-slate-200 bg-white text-xs font-semibold"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Thn Lulus *</label>
                        <input
                          type="number"
                          disabled={!isEditing}
                          placeholder="2022"
                          value={ef.tahun_lulus || ""}
                          onChange={(e) =>
                            setEducationFormal(
                              educationFormal.map((it, i) => (i === idx ? { ...it, tahun_lulus: e.target.value } : it))
                            )
                          }
                          className="w-full h-[36px] px-2.5 rounded-lg border border-slate-200 bg-white text-xs font-mono tabular-nums font-semibold"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">IPK / Nilai</label>
                        <input
                          type="text"
                          disabled={!isEditing}
                          placeholder="3.65"
                          value={ef.ipk || ""}
                          onChange={(e) =>
                            setEducationFormal(
                              educationFormal.map((it, i) => (i === idx ? { ...it, ipk: e.target.value } : it))
                            )
                          }
                          className="w-full h-[36px] px-2.5 rounded-lg border border-slate-200 bg-white text-xs font-mono tabular-nums font-semibold"
                        />
                      </div>
                      <div className="flex items-center gap-1">
                        <div className="flex-1">
                          <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">No. Ijazah</label>
                          <input
                            type="text"
                            disabled={!isEditing}
                            value={ef.nomor_ijazah || ""}
                            onChange={(e) =>
                              setEducationFormal(
                                educationFormal.map((it, i) =>
                                  i === idx ? { ...it, nomor_ijazah: e.target.value } : it
                                )
                              )
                            }
                            className="w-full h-[36px] px-2.5 rounded-lg border border-slate-200 bg-white text-xs font-mono tabular-nums font-semibold"
                          />
                        </div>
                        {isEditing && (
                          <button
                            type="button"
                            onClick={() => setEducationFormal(educationFormal.filter((_, i) => i !== idx))}
                            className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg mt-4"
                          >
                            <Trash2 size={15} />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Pendidikan Non-Formal / Kursus */}
            <div className="space-y-3 pt-3 border-t border-slate-200/80">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-800">
                    Pelatihan, Kursus &amp; Sertifikasi Profesi (Opsional)
                  </h4>
                  <p className="text-[11px] text-slate-500">Contoh: BTCLS, ACLS, K3 Rumah Sakit, Workshop Medis</p>
                </div>
                {isEditing && (
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
                    className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-primary rounded-xl font-bold text-xs transition-all cursor-pointer"
                  >
                    <Plus size={13} />
                    <span>Tambah Pelatihan</span>
                  </button>
                )}
              </div>

              {educationNonFormal.length === 0 ? (
                <p className="text-xs text-slate-400 italic">Belum ada riwayat pelatihan atau kursus.</p>
              ) : (
                <div className="space-y-2.5">
                  {educationNonFormal.map((enf, idx) => (
                    <div
                      key={idx}
                      className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 grid grid-cols-1 sm:grid-cols-5 gap-3 items-end"
                    >
                      <div className="sm:col-span-2">
                        <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Nama Pelatihan / Sertifikasi</label>
                        <input
                          type="text"
                          disabled={!isEditing}
                          placeholder="Contoh: Pelatihan BTCLS"
                          value={enf.jenis_kursus || ""}
                          onChange={(e) =>
                            setEducationNonFormal(
                              educationNonFormal.map((it, i) =>
                                i === idx ? { ...it, jenis_kursus: e.target.value } : it
                              )
                            )
                          }
                          className="w-full h-[36px] px-2.5 rounded-lg border border-slate-200 bg-white text-xs font-semibold"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Penyelenggara</label>
                        <input
                          type="text"
                          disabled={!isEditing}
                          value={enf.nama_lembaga || ""}
                          onChange={(e) =>
                            setEducationNonFormal(
                              educationNonFormal.map((it, i) =>
                                i === idx ? { ...it, nama_lembaga: e.target.value } : it
                              )
                            )
                          }
                          className="w-full h-[36px] px-2.5 rounded-lg border border-slate-200 bg-white text-xs font-semibold"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Tahun</label>
                        <input
                          type="number"
                          disabled={!isEditing}
                          value={enf.tahun_selesai || ""}
                          onChange={(e) =>
                            setEducationNonFormal(
                              educationNonFormal.map((it, i) =>
                                i === idx ? { ...it, tahun_selesai: e.target.value } : it
                              )
                            )
                          }
                          className="w-full h-[36px] px-2.5 rounded-lg border border-slate-200 bg-white text-xs font-mono tabular-nums font-semibold"
                        />
                      </div>
                      <div className="flex items-center gap-1">
                        <div className="flex-1">
                          <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">No. Sertifikat</label>
                          <input
                            type="text"
                            disabled={!isEditing}
                            value={enf.nomor_sertifikat || ""}
                            onChange={(e) =>
                              setEducationNonFormal(
                                educationNonFormal.map((it, i) =>
                                  i === idx ? { ...it, nomor_sertifikat: e.target.value } : it
                                )
                              )
                            }
                            className="w-full h-[36px] px-2.5 rounded-lg border border-slate-200 bg-white text-xs font-mono tabular-nums font-semibold"
                          />
                        </div>
                        {isEditing && (
                          <button
                            type="button"
                            onClick={() => setEducationNonFormal(educationNonFormal.filter((_, i) => i !== idx))}
                            className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg mt-4"
                          >
                            <Trash2 size={15} />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 4: PENGALAMAN KERJA */}
        {activeSubTab === "pengalaman" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-800">
                  Riwayat Pengalaman Kerja Sebelumnya (Opsional)
                </h4>
                <p className="text-[11px] text-slate-500">Daftar rumah sakit atau perusahaan tempat bekerja sebelum RSU Avisena</p>
              </div>
              {isEditing && (
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
                  className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-primary rounded-xl font-bold text-xs transition-all cursor-pointer"
                >
                  <Plus size={13} />
                  <span>Tambah Pengalaman</span>
                </button>
              )}
            </div>

            {experience.length === 0 ? (
              <p className="text-xs text-slate-400 italic py-4">Belum ada riwayat pengalaman kerja yang dicatat.</p>
            ) : (
              <div className="space-y-3">
                {experience.map((ex, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3 items-end"
                  >
                    <div className="sm:col-span-2">
                      <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Nama Instansi / RS</label>
                      <input
                        type="text"
                        disabled={!isEditing}
                        value={ex.nama_instansi}
                        onChange={(e) =>
                          setExperience(
                            experience.map((it, i) => (i === idx ? { ...it, nama_instansi: e.target.value } : it))
                          )
                        }
                        className="w-full h-[36px] px-2.5 rounded-lg border border-slate-200 bg-white text-xs font-semibold"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Jabatan</label>
                      <input
                        type="text"
                        disabled={!isEditing}
                        value={ex.jabatan_terakhir || ""}
                        onChange={(e) =>
                          setExperience(
                            experience.map((it, i) => (i === idx ? { ...it, jabatan_terakhir: e.target.value } : it))
                          )
                        }
                        className="w-full h-[36px] px-2.5 rounded-lg border border-slate-200 bg-white text-xs font-semibold"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Thn Mulai</label>
                      <input
                        type="number"
                        disabled={!isEditing}
                        value={ex.tahun_mulai || ""}
                        onChange={(e) =>
                          setExperience(
                            experience.map((it, i) => (i === idx ? { ...it, tahun_mulai: e.target.value } : it))
                          )
                        }
                        className="w-full h-[36px] px-2.5 rounded-lg border border-slate-200 bg-white text-xs font-mono tabular-nums font-semibold"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Thn Selesai</label>
                      <input
                        type="number"
                        disabled={!isEditing}
                        value={ex.tahun_selesai || ""}
                        onChange={(e) =>
                          setExperience(
                            experience.map((it, i) => (i === idx ? { ...it, tahun_selesai: e.target.value } : it))
                          )
                        }
                        className="w-full h-[36px] px-2.5 rounded-lg border border-slate-200 bg-white text-xs font-mono tabular-nums font-semibold"
                      />
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="flex-1">
                        <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Alasan Berhenti</label>
                        <input
                          type="text"
                          disabled={!isEditing}
                          value={ex.alasan_berhenti || ""}
                          onChange={(e) =>
                            setExperience(
                              experience.map((it, i) => (i === idx ? { ...it, alasan_berhenti: e.target.value } : it))
                            )
                          }
                          className="w-full h-[36px] px-2.5 rounded-lg border border-slate-200 bg-white text-xs font-semibold"
                        />
                      </div>
                      {isEditing && (
                        <button
                          type="button"
                          onClick={() => setExperience(experience.filter((_, i) => i !== idx))}
                          className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg mt-4"
                        >
                          <Trash2 size={15} />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 5: DOKUMEN & BERKAS DIGITAL */}
        {activeSubTab === "dokumen" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {MAIN_DOC_FIELDS.map((docField) => {
                const fileUrl = documents[docField.key];
                const isUploading = uploadingKey === docField.key;

                return (
                  <div
                    key={docField.key}
                    className={`p-4 rounded-2xl border transition-all flex flex-col justify-between gap-3 ${
                      fileUrl
                        ? "bg-emerald-50/30 border-emerald-200/80"
                        : docField.required
                        ? "bg-amber-50/30 border-amber-200/80"
                        : "bg-slate-50/70 border-slate-200/80"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-1.5">
                          <h5 className="text-xs font-extrabold text-slate-800">{docField.label}</h5>
                          {docField.required && (
                            <span className="px-1.5 py-0.5 text-[9px] font-bold uppercase bg-rose-100 text-rose-700 rounded">
                              Wajib
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-500 mt-0.5">{docField.desc}</p>
                      </div>

                      {fileUrl ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700">
                          <CheckCircle2 size={11} />
                          <span>Tersedia</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-200 text-slate-600">
                          Belum Ada
                        </span>
                      )}
                    </div>

                    <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-200/60">
                      {fileUrl ? (
                        <a
                          href={fileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 text-xs font-bold text-primary hover:underline"
                        >
                          <ExternalLink size={13} />
                          <span>Lihat / Unduh Berkas</span>
                        </a>
                      ) : (
                        <span className="text-[11px] text-slate-400 italic">Belum ada file diunggah</span>
                      )}

                      {isEditing && (
                        <label className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl font-bold text-xs cursor-pointer shadow-2xs transition-all">
                          {isUploading ? (
                            <Loader2 size={13} className="animate-spin text-primary" />
                          ) : (
                            <Upload size={13} className="text-primary" />
                          )}
                          <span>{fileUrl ? "Ganti File" : "Unggah File"}</span>
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
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Sertifikat / Dokumen Tambahan */}
            <div className="space-y-3 pt-4 border-t border-slate-200/80">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                    <Paperclip size={14} className="text-primary" />
                    <span>Sertifikat &amp; Dokumen Pendukung Tambahan (Opsional)</span>
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    Unggah sertifikat pelatihan, NPWP, BPJS, atau berkas kepegawaian lainnya
                  </p>
                </div>
                {isEditing && (
                  <button
                    type="button"
                    onClick={() =>
                      setOtherDocuments([...otherDocuments, { nama_dokumen: "", file_url: "" }])
                    }
                    className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-primary rounded-xl font-bold text-xs transition-all cursor-pointer"
                  >
                    <Plus size={13} />
                    <span>Tambah Dokumen Lain</span>
                  </button>
                )}
              </div>

              {otherDocuments.length === 0 ? (
                <p className="text-xs text-slate-400 italic">Belum ada dokumen tambahan.</p>
              ) : (
                <div className="space-y-2.5">
                  {otherDocuments.map((od, idx) => {
                    const uploadKey = `other_${idx}`;
                    const isUploading = uploadingKey === uploadKey;
                    return (
                      <div
                        key={idx}
                        className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                      >
                        <div className="flex-1">
                          <input
                            type="text"
                            disabled={!isEditing}
                            placeholder="Nama Dokumen (Contoh: Sertifikat BTCLS / NPWP)"
                            value={od.nama_dokumen}
                            onChange={(e) =>
                              setOtherDocuments(
                                otherDocuments.map((it, i) =>
                                  i === idx ? { ...it, nama_dokumen: e.target.value } : it
                                )
                              )
                            }
                            className="w-full h-[36px] px-3 rounded-lg border border-slate-200 bg-white text-xs font-semibold"
                          />
                        </div>

                        <div className="flex items-center gap-2">
                          {od.file_url && (
                            <a
                              href={od.file_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-50 text-primary rounded-lg text-xs font-bold hover:underline"
                            >
                              <ExternalLink size={12} />
                              <span>Lihat Berkas</span>
                            </a>
                          )}

                          {isEditing && (
                            <>
                              <label className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-700 cursor-pointer hover:bg-slate-100">
                                {isUploading ? (
                                  <Loader2 size={12} className="animate-spin text-primary" />
                                ) : (
                                  <Upload size={12} className="text-primary" />
                                )}
                                <span>{od.file_url ? "Ganti" : "Pilih File"}</span>
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
                                className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg"
                              >
                                <Trash2 size={15} />
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Footer Save Bar when Editing */}
        {isEditing && (
          <div className="pt-4 border-t border-slate-200 flex items-center justify-between flex-wrap gap-3">
            <span className="text-xs text-slate-500 font-medium">
              Pastikan seluruh perubahan pada tiap tab sudah benar sebelum menekan tombol Simpan.
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setIsEditing(false);
                  fetchCompleteProfile();
                }}
                disabled={isSaving}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-xs uppercase tracking-wider cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleSaveAll}
                disabled={isSaving}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary hover:bg-primary-dark text-white rounded-xl font-bold text-xs uppercase tracking-wider shadow-xs transition-all active:scale-[0.98] cursor-pointer disabled:opacity-50"
              >
                {isSaving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                <span>Simpan Semua Data &amp; Berkas</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
