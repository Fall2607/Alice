"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Briefcase,
  Calendar,
  ShieldCheck,
  IdCard,
  Loader2,
  AlertCircle,
  Camera,
  ChevronLeft,
  ScanFace,
  UserCheck,
  FileBadge,
  CreditCard,
  Copy,
  CheckCircle2,
  RotateCw,
  Clock,
  Building2,
  Stethoscope,
  Award,
  Sparkles,
  ExternalLink,
} from "lucide-react";
import Swal from "sweetalert2";

interface ProfileData {
  readonly id: string;
  readonly nip: string;
  readonly nama_lengkap: string;
  readonly nik: string;
  readonly email?: string | null;
  readonly handphone?: string | null;
  readonly jenis_kelamin?: string | null;
  readonly tanggal_lahir?: string | null;
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

interface AbsensiItem {
  readonly id: string;
  readonly tanggal: string;
  readonly jam_masuk?: string | null;
  readonly jam_keluar?: string | null;
  readonly menit_terlambat?: number | null;
  readonly nama_shift?: string | null;
}

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

function formatWibTime(timeStr?: string | null) {
  if (!timeStr) return "-";
  if (timeStr.includes("T")) {
    const d = new Date(timeStr);
    d.setTime(d.getTime() + 7 * 60 * 60 * 1000);
    return `${d.toISOString().substring(11, 16)} WIB`;
  }
  return `${timeStr.substring(0, 5)} WIB`;
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
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [absensiList, setAbsensiList] = useState<readonly AbsensiItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isCardFlipped, setIsCardFlipped] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "";

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

        const response = await fetch(`${baseUrl}/karyawan/${karyawanId}`);
        if (!response.ok) {
          throw new Error("Gagal mengambil data profil dari server.");
        }

        const data: ProfileData = await response.json();
        setProfile(data);

        try {
          const absensiResponse = await fetch(`${baseUrl}/absensi/${data.id}`);
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
        lastRecord: null as AbsensiItem | null,
      };
    }

    const { start, end } = getCutOffRange(new Date());

    const currentCutOffRecords = absensiList.filter((item) => {
      if (!item.tanggal) return false;
      const itemDate = new Date(item.tanggal);
      return itemDate >= start && itemDate <= end;
    });

    const totalHadir = currentCutOffRecords.length;
    const terlambat = currentCutOffRecords.filter(
      (item) => (item.menit_terlambat ?? 0) > 0,
    ).length;
    const tepatWaktu = Math.max(0, totalHadir - terlambat);
    const lastRecord = absensiList[0] || null;

    return { totalHadir, tepatWaktu, terlambat, lastRecord };
  }, [absensiList]);

  const cutOffLabel = useMemo(() => {
    const { start, end } = getCutOffRange(new Date());
    const formatShort = (d: Date) =>
      d.toLocaleDateString("id-ID", { day: "numeric", month: "short" });
    return `${formatShort(start)} - ${formatShort(end)}`;
  }, []);

  if (isLoading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <div className="text-center space-y-3">
          <Loader2 className="mx-auto h-10 w-10 animate-spin text-[#0173b6]" />
          <p className="text-slate-400 font-bold text-xs uppercase tracking-wider">
            Menyinkronkan Profil Karyawan...
          </p>
        </div>
      </div>
    );
  }

  if (errorMessage || !profile) {
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
            className="mt-4 px-6 py-2.5 bg-[#0173b6] hover:bg-[#015f96] text-white rounded-xl font-bold text-xs uppercase tracking-wider shadow-md transition-all active:scale-[0.98]"
          >
            Muat Ulang Halaman
          </button>
        </div>
      </div>
    );
  }

  const profileImg =
    profile.jenis_kelamin === "Perempuan"
      ? "/img/potrait/woman.jpg"
      : "/img/potrait/man.jpg";

  const tenureText = calculateTenure(profile.tanggal_masuk);
  const ageText = calculateAge(profile.tanggal_lahir);

  return (
    <div className="p-4 sm:p-6 lg:p-8 font-sans max-w-7xl mx-auto min-h-screen space-y-8">
      {/* Top Navigasi Kembali & Breadcrumbs */}
      <div className="flex items-center justify-between">
        <Link
          href="/admin"
          className="inline-flex items-center gap-2 text-slate-500 hover:text-[#0173b6] font-bold text-xs uppercase tracking-wider transition-colors py-1"
        >
          <ChevronLeft size={16} />
          <span>Kembali ke Beranda</span>
        </Link>

        <div className="flex items-center gap-2">
          <Link
            href="/admin/my-activity"
            className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-blue-50 hover:bg-blue-100 text-[#0173b6] rounded-xl font-bold text-xs uppercase tracking-wider transition-all active:scale-[0.98]"
          >
            <Clock size={14} />
            <span>Riwayat Aktivitas</span>
          </Link>
        </div>
      </div>

      {/* Hero Banner Section */}
      <div className="relative mb-12">
        <div className="h-44 sm:h-52 md:h-60 w-full rounded-[32px] sm:rounded-[36px] bg-gradient-to-r from-[#05445e] via-[#0173b6] to-sky-600 shadow-xl shadow-blue-900/10 overflow-hidden relative">
          <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:16px_16px]" />
          <div className="absolute top-4 right-6 text-white/20 flex items-center gap-2 font-black text-sm tracking-widest uppercase">
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
        </div>

        {/* Floating Avatar & Basic Identity */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-5 px-6 sm:px-10 -mt-16 sm:-mt-20 relative z-10">
          <div className="flex flex-col sm:flex-row items-center sm:items-end gap-5 text-center sm:text-left">
            {/* Avatar Frame */}
            <div className="relative h-32 w-32 sm:h-40 sm:w-40 md:h-44 md:w-44 rounded-[28px] sm:rounded-[32px] border-[6px] border-white bg-white shadow-2xl overflow-hidden group shrink-0">
              <img
                src={profileImg}
                alt="Foto Profil"
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-xs">
                <Camera className="text-white" size={26} />
              </div>
            </div>

            {/* Name & Headline Tags */}
            <div className="pb-1 space-y-2">
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-slate-900 tracking-tight leading-tight">
                {profile.nama_lengkap}
              </h1>
              <div className="flex items-center justify-center sm:justify-start flex-wrap gap-2 sm:gap-3 text-xs">
                <span className="px-3 py-1 bg-[#0173b6] text-white font-extrabold uppercase tracking-wider rounded-lg shadow-xs">
                  {profile.profesi || profile.nama_level || "Tenaga Medis / Staf"}
                </span>
                <div className="w-1.5 h-1.5 rounded-full bg-slate-300 hidden sm:block" />
                <span className="text-slate-600 font-bold uppercase tracking-wider">
                  {profile.nama_departemen || "RSU Avisena"}
                </span>
                <div className="w-1.5 h-1.5 rounded-full bg-slate-300 hidden sm:block" />
                <span className="text-slate-500 font-mono font-bold tabular-nums">
                  NIP: {profile.nip}
                </span>
              </div>
            </div>
          </div>

          {/* Quick Copy Button Banner */}
          <div className="flex items-center justify-center sm:justify-end gap-3 pb-2">
            <button
              onClick={() => handleCopy(profile.nip, "NIP_HERO")}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 rounded-xl font-bold text-xs uppercase tracking-wider shadow-sm transition-all active:scale-[0.98]"
            >
              {copiedField === "NIP_HERO" ? (
                <>
                  <CheckCircle2 size={15} className="text-emerald-600" />
                  <span className="text-emerald-700">NIP Tersalin</span>
                </>
              ) : (
                <>
                  <Copy size={15} className="text-slate-400" />
                  <span>Salin NIP</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Grid Layout 2 Kolom */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start pb-8">
        {/* Kolom Kiri: Kartu Identitas Digital & Ringkasan Presensi */}
        <div className="lg:col-span-4 space-y-6">
          {/* Card: Kartu Tanda Pengenal Pegawai RSU Avisena (Interactive Digital ID Badge) */}
          <div className="rounded-[32px] bg-white p-6 sm:p-7 shadow-xl shadow-slate-200/50 border border-slate-200/90 relative overflow-hidden text-center">
            {/* Lanyard Hole Visual */}
            <div className="w-14 h-2.5 rounded-full bg-slate-200 border border-slate-300/80 mx-auto mb-5 shadow-inner" />

            {!isCardFlipped ? (
              /* Sisi Depan ID Card */
              <div className="space-y-5 animate-in fade-in duration-300">
                {/* Header Badge RS */}
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2 text-left">
                    <div className="h-8 w-8 rounded-lg bg-[#0173b6] text-white flex items-center justify-center shadow-xs font-black text-xs">
                      +
                    </div>
                    <div>
                      <p className="text-[11px] font-black text-slate-900 tracking-wider uppercase leading-none">
                        RSU Avisena
                      </p>
                      <p className="text-[9px] font-bold text-[#0173b6] tracking-widest uppercase">
                        Kartu Tanda Pengenal
                      </p>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-[10px] font-black tracking-wider uppercase">
                    Aktif
                  </span>
                </div>

                {/* Avatar Card */}
                <div className="relative inline-block my-1">
                  <div className="w-28 h-28 rounded-2xl border-4 border-slate-100 shadow-lg overflow-hidden mx-auto bg-slate-100">
                    <img
                      src={profileImg}
                      alt={profile.nama_lengkap}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="absolute -bottom-2 -right-2 p-1.5 bg-[#0173b6] text-white rounded-xl shadow-md">
                    <ShieldCheck size={16} />
                  </div>
                </div>

                {/* Nama & Posisi */}
                <div className="space-y-1">
                  <h3 className="text-base font-black text-slate-900 tracking-tight">
                    {profile.nama_lengkap}
                  </h3>
                  <p className="text-xs font-bold text-[#0173b6]">
                    {profile.profesi || profile.nama_level || "Staf Medis"}
                  </p>
                  <p className="text-[11px] font-medium text-slate-500">
                    {profile.nama_departemen || "RSU Avisena"}
                  </p>
                </div>

                {/* Barcode Visual NIP */}
                <div className="pt-2">
                  <BarcodeVisual code={profile.nip} />
                </div>
              </div>
            ) : (
              /* Sisi Belakang ID Card */
              <div className="space-y-4 py-2 text-left animate-in fade-in duration-300">
                <div className="text-center pb-2 border-b border-slate-100">
                  <p className="text-[11px] font-black text-slate-800 uppercase tracking-wider">
                    Ketentuan Pegawai RSU Avisena
                  </p>
                </div>

                <div className="text-[11px] text-slate-600 space-y-2 leading-relaxed bg-slate-50 p-3.5 rounded-xl border border-slate-200/80">
                  <p>1. Kartu ini merupakan tanda pengenal resmi pegawai RSU Avisena.</p>
                  <p>2. Wajib dikenakan selama bertugas di lingkungan rumah sakit.</p>
                  <p>3. Jika menemukan kartu ini, harap kembalikan ke Bagian Human Capital RSU Avisena.</p>
                </div>

                <div className="space-y-1 text-[11px]">
                  <p className="font-bold text-slate-900">Alamat Rumah Sakit:</p>
                  <p className="text-slate-500 leading-snug">
                    Jl. Melong Asih No. 153, Cimahi Selatan, Kota Cimahi, Jawa Barat
                  </p>
                  <p className="text-[#0173b6] font-bold pt-1">
                    Layanan SDM: Ext. 104 / (022) 6052200
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-100 text-center">
                  <p className="text-[10px] text-slate-400 font-mono tabular-nums">
                    UUID: {profile.id.substring(0, 18)}...
                  </p>
                </div>
              </div>
            )}

            {/* Action Bar ID Card: Balik Kartu & Salin NIP */}
            <div className="mt-6 pt-4 border-t border-slate-100 grid grid-cols-2 gap-2">
              <button
                onClick={() => setIsCardFlipped(!isCardFlipped)}
                className="inline-flex items-center justify-center gap-1.5 py-2 px-3 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-xl font-bold text-xs uppercase tracking-wider border border-slate-200/80 transition-all active:scale-[0.98]"
              >
                <RotateCw size={13} className="text-slate-500" />
                <span>{isCardFlipped ? "Depan" : "Belakang"}</span>
              </button>

              <button
                onClick={() => handleCopy(profile.nip, "NIP_BADGE")}
                className="inline-flex items-center justify-center gap-1.5 py-2 px-3 bg-slate-900 hover:bg-[#0173b6] text-white rounded-xl font-bold text-xs uppercase tracking-wider transition-all active:scale-[0.98]"
              >
                {copiedField === "NIP_BADGE" ? (
                  <>
                    <CheckCircle2 size={13} className="text-emerald-400" />
                    <span>Tersalin</span>
                  </>
                ) : (
                  <>
                    <Copy size={13} />
                    <span>Salin NIP</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Card: Ringkasan Aktivitas Presensi (Cut-Off 26 - 25) */}
          <div className="rounded-[28px] bg-gradient-to-br from-[#05445e] to-[#0173b6] p-6 text-white shadow-xl shadow-blue-900/10 space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xs font-black uppercase tracking-wider text-blue-200">
                  Presensi Periode Berjalan
                </h3>
                <p className="text-[11px] text-blue-100/80 font-mono tabular-nums">
                  Cut-Off: {cutOffLabel}
                </p>
              </div>
              <div className="h-9 w-9 rounded-xl bg-white/10 flex items-center justify-center text-blue-200">
                <Clock size={18} />
              </div>
            </div>

            {/* 3 Metrik Utama Kehadiran */}
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="p-3 bg-white/10 rounded-2xl backdrop-blur-xs">
                <p className="text-[10px] font-bold text-blue-200 uppercase tracking-wider">
                  Total Hadir
                </p>
                <p className="text-xl font-black font-mono tabular-nums text-white mt-0.5">
                  {attendanceStats.totalHadir}
                </p>
                <p className="text-[9px] text-blue-200/80">Hari</p>
              </div>

              <div className="p-3 bg-white/10 rounded-2xl backdrop-blur-xs">
                <p className="text-[10px] font-bold text-emerald-200 uppercase tracking-wider">
                  Tepat Waktu
                </p>
                <p className="text-xl font-black font-mono tabular-nums text-emerald-300 mt-0.5">
                  {attendanceStats.tepatWaktu}
                </p>
                <p className="text-[9px] text-emerald-200/80">Hari</p>
              </div>

              <div className="p-3 bg-white/10 rounded-2xl backdrop-blur-xs">
                <p className="text-[10px] font-bold text-amber-200 uppercase tracking-wider">
                  Terlambat
                </p>
                <p className="text-xl font-black font-mono tabular-nums text-amber-300 mt-0.5">
                  {attendanceStats.terlambat}
                </p>
                <p className="text-[9px] text-amber-200/80">Hari</p>
              </div>
            </div>

            {/* Kuota Cuti Tahunan */}
            <div className="p-3.5 bg-black/20 rounded-2xl border border-white/10 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-blue-100 font-medium">Sisa Cuti Tahunan:</span>
                <span className="font-mono font-bold text-white tabular-nums">
                  {profile.sisa_cuti ?? 0} Hari
                </span>
              </div>
              <div className="w-full h-2 rounded-full bg-white/20 overflow-hidden">
                <div
                  className="h-full bg-emerald-400 rounded-full transition-all duration-500"
                  style={{
                    width: `${Math.min(100, Math.max(0, ((profile.sisa_cuti ?? 0) / 12) * 100))}%`,
                  }}
                />
              </div>
              <div className="flex justify-between text-[10px] text-blue-200/70 font-mono tabular-nums">
                <span>Terpakai: {Math.max(0, 12 - (profile.sisa_cuti ?? 0))} Hari</span>
                <span>Alokasi: 12 Hari</span>
              </div>
            </div>

            {/* Presensi Terakhir */}
            {attendanceStats.lastRecord && (
              <div className="text-[11px] text-blue-100/90 pt-1 border-t border-white/10 flex items-center justify-between">
                <span>Absensi Terakhir:</span>
                <span className="font-mono tabular-nums font-bold text-white">
                  {new Date(attendanceStats.lastRecord.tanggal).toLocaleDateString("id-ID", {
                    day: "numeric",
                    month: "short",
                  })}{" "}
                  ({formatWibTime(attendanceStats.lastRecord.jam_masuk)})
                </span>
              </div>
            )}
          </div>

          {/* Card: Akses Biometrik Wajah Kiosk */}
          <div className="rounded-[28px] bg-slate-900 p-6 text-white shadow-xl relative overflow-hidden space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  Biometrik Wajah (Kiosk)
                </h3>
                <p className="text-base font-black tracking-tight text-white">
                  {profile.has_face_descriptor ? "Terdaftar & Aktif" : "Belum Terdaftar"}
                </p>
              </div>
              <div
                className={`h-10 w-10 rounded-xl flex items-center justify-center ${profile.has_face_descriptor
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
                : "Daftarkan foto wajah Anda agar dapat melakukan absensi pada tablet kiosk di pintu masuk."}
            </p>

            <Link
              href={`/admin/pegawai/enroll-face?nip=${profile.nip}`}
              className={`block w-full text-center font-bold text-xs uppercase tracking-wider py-3 rounded-xl transition-all active:scale-[0.98] ${profile.has_face_descriptor
                  ? "bg-white/10 hover:bg-white/20 text-white"
                  : "bg-[#0173b6] hover:bg-[#015f96] text-white shadow-md shadow-blue-500/20"
                }`}
            >
              {profile.has_face_descriptor ? "Perbarui Rekaman Wajah" : "Daftarkan Wajah Sekarang"}
            </Link>
          </div>
        </div>

        {/* Kolom Kanan: Rincian Lengkap Data Pegawai */}
        <div className="lg:col-span-8">
          <div className="rounded-[32px] sm:rounded-[36px] bg-white p-6 sm:p-8 md:p-10 shadow-xl shadow-slate-200/50 border border-slate-200/80 space-y-8">
            {/* Header Rincian */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
              <div className="space-y-1">
                <h3 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                  <div className="h-6 w-1.5 bg-[#0173b6] rounded-full"></div>
                  Biodata & Ketenagakerjaan
                </h3>
                <p className="text-xs text-slate-500 font-medium">
                  Data resmi personalia terintegrasi dengan Human Capital RSU Avisena
                </p>
              </div>

              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold self-start sm:self-auto">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>Status: {profile.status_kepegawaian || "Pegawai Aktif"}</span>
              </div>
            </div>

            {/* Kelompok 1: Penugasan & Posisi Kerja */}
            <div className="space-y-4">
              <h4 className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-2">
                <Briefcase size={14} className="text-[#0173b6]" />
                <span>Penugasan & Status Kerja</span>
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* NIP */}
                <div className="p-3.5 bg-slate-50/80 rounded-2xl border border-slate-200/80 space-y-1">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">
                    Nomor Induk Pegawai (NIP)
                  </p>
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-bold text-slate-900 font-mono tabular-nums tracking-wider">
                      {profile.nip}
                    </p>
                    <button
                      onClick={() => handleCopy(profile.nip, "NIP_GRID")}
                      className="p-1 text-slate-400 hover:text-[#0173b6] transition-colors"
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

                {/* Jabatan & Profesi */}
                <div className="p-3.5 bg-slate-50/80 rounded-2xl border border-slate-200/80 space-y-1">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">
                    Jabatan & Profesi Medis
                  </p>
                  <p className="text-sm font-bold text-slate-900 truncate">
                    {profile.profesi || profile.nama_level || "-"}
                  </p>
                </div>

                {/* Departemen / Ruang Kerja */}
                <div className="p-3.5 bg-slate-50/80 rounded-2xl border border-slate-200/80 space-y-1">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">
                    Departemen / Unit Kerja
                  </p>
                  <p className="text-sm font-bold text-slate-900 truncate">
                    {profile.nama_departemen || "-"}
                  </p>
                </div>

                {/* Atasan Langsung */}
                <div className="p-3.5 bg-slate-50/80 rounded-2xl border border-slate-200/80 space-y-1">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">
                    Atasan Langsung
                  </p>
                  <p className="text-sm font-bold text-slate-900 truncate">
                    {profile.nama_atasan || "-"}
                  </p>
                </div>

                {/* Tanggal Masuk & Masa Kerja */}
                <div className="p-3.5 bg-slate-50/80 rounded-2xl border border-slate-200/80 space-y-1">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">
                    Tanggal Bergabung & Masa Kerja
                  </p>
                  <div className="text-sm font-bold text-slate-900">
                    <span className="font-mono tabular-nums">
                      {profile.tanggal_masuk
                        ? new Date(profile.tanggal_masuk).toLocaleDateString("id-ID", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        })
                        : "-"}
                    </span>
                    {tenureText && (
                      <span className="text-xs font-normal text-slate-500 block">
                        Masa Kerja: {tenureText}
                      </span>
                    )}
                  </div>
                </div>

                {/* Status Kontrak */}
                <div className="p-3.5 bg-slate-50/80 rounded-2xl border border-slate-200/80 space-y-1">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">
                    Status Ikatan Kerja
                  </p>
                  <p className="text-sm font-bold text-slate-900">
                    {profile.status_kepegawaian || "Pegawai Tetap"}
                  </p>
                </div>
              </div>
            </div>

            {/* Kelompok 2: Kredensial Medis (SIP / STR jika ada) */}
            {profile.sip && (
              <div className="space-y-4 pt-4 border-t border-slate-100">
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-2">
                  <Stethoscope size={14} className="text-[#0173b6]" />
                  <span>Kredensial & Surat Izin Praktik (SIP)</span>
                </h4>

                <div className="p-4 bg-blue-50/60 rounded-2xl border border-blue-200/70 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-1">
                    <p className="text-[10px] font-black text-[#0173b6] uppercase tracking-wider">
                      Nomor Izin Praktik
                    </p>
                    <p className="text-sm font-bold text-slate-900 font-mono tabular-nums">
                      {profile.sip}
                    </p>
                  </div>
                  {profile.masa_berlaku_sip && (
                    <div className="text-right sm:text-right">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">
                        Masa Berlaku
                      </p>
                      <p className="text-xs font-bold text-slate-700 font-mono tabular-nums">
                        s/d {profile.masa_berlaku_sip}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Kelompok 3: Data Pribadi & Rekening Payroll */}
            <div className="space-y-4 pt-4 border-t border-slate-100">
              <h4 className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-2">
                <User size={14} className="text-[#0173b6]" />
                <span>Identitas Pribadi & Penggajian</span>
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* NIK KTP */}
                <div className="p-3.5 bg-slate-50/80 rounded-2xl border border-slate-200/80 space-y-1">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">
                    Nomor Induk Kependudukan (NIK)
                  </p>
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-bold text-slate-900 font-mono tabular-nums tracking-wider">
                      {profile.nik || "-"}
                    </p>
                    {profile.nik && (
                      <button
                        onClick={() => handleCopy(profile.nik, "NIK_GRID")}
                        className="p-1 text-slate-400 hover:text-[#0173b6] transition-colors"
                        title="Salin NIK"
                      >
                        {copiedField === "NIK_GRID" ? (
                          <CheckCircle2 size={14} className="text-emerald-600" />
                        ) : (
                          <Copy size={14} />
                        )}
                      </button>
                    )}
                  </div>
                </div>

                {/* Tanggal Lahir & Usia */}
                <div className="p-3.5 bg-slate-50/80 rounded-2xl border border-slate-200/80 space-y-1">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">
                    Tanggal Lahir & Usia
                  </p>
                  <p className="text-sm font-bold text-slate-900 font-mono tabular-nums">
                    {profile.tanggal_lahir
                      ? new Date(profile.tanggal_lahir).toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })
                      : "-"}
                    {ageText && (
                      <span className="text-xs font-normal text-slate-500 ml-2">
                        ({ageText})
                      </span>
                    )}
                  </p>
                </div>

                {/* Jenis Kelamin */}
                <div className="p-3.5 bg-slate-50/80 rounded-2xl border border-slate-200/80 space-y-1">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">
                    Jenis Kelamin
                  </p>
                  <p className="text-sm font-bold text-slate-900">
                    {profile.jenis_kelamin || "-"}
                  </p>
                </div>

                {/* Rekening BSI Payroll */}
                <div className="p-3.5 bg-slate-50/80 rounded-2xl border border-slate-200/80 space-y-1">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                    <CreditCard size={12} className="text-emerald-600" />
                    <span>Rekening Penggajian (BSI)</span>
                  </p>
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-bold text-slate-900 font-mono tabular-nums">
                      {profile.rekening_bsi || "Belum Terdaftar"}
                    </p>
                    {profile.rekening_bsi && (
                      <button
                        onClick={() => handleCopy(profile.rekening_bsi!, "BSI_GRID")}
                        className="p-1 text-slate-400 hover:text-[#0173b6] transition-colors"
                        title="Salin No. Rekening"
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

            {/* Kelompok 4: Kontak & Alamat */}
            <div className="space-y-4 pt-4 border-t border-slate-100">
              <h4 className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-2">
                <Mail size={14} className="text-[#0173b6]" />
                <span>Kontak & Alamat Domisili</span>
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="flex items-center gap-3 p-3.5 bg-slate-50/80 rounded-2xl border border-slate-200/80">
                  <div className="h-9 w-9 rounded-xl bg-blue-50 text-[#0173b6] flex items-center justify-center shrink-0">
                    <Mail size={16} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">
                      Email Resmi
                    </p>
                    <p className="text-xs font-bold text-slate-800 truncate">
                      {profile.email || "Email belum didaftarkan"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3.5 bg-slate-50/80 rounded-2xl border border-slate-200/80">
                  <div className="h-9 w-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                    <Phone size={16} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">
                      Nomor WhatsApp / HP
                    </p>
                    <p className="text-xs font-bold text-slate-800 font-mono tabular-nums truncate">
                      {profile.handphone || "Nomor belum terdata"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Alamat Domisili */}
              <div className="p-4 bg-slate-50/80 rounded-2xl border border-slate-200/80 space-y-1.5">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <MapPin size={13} className="text-[#0173b6]" />
                  <span>Alamat Domisili / Tempat Tinggal</span>
                </p>
                <p className="text-xs sm:text-sm font-medium text-slate-700 leading-relaxed">
                  {profile.alamat_domisili ||
                    profile.alamat ||
                    "Alamat domisili belum dilengkapi pada pangkalan data personalia."}
                </p>
              </div>
            </div>

            {/* Note Verifikasi Keamanan Personalia */}
            <div className="p-5 bg-blue-50/60 rounded-2xl border border-blue-200/80 flex items-start gap-4">
              <div className="h-10 w-10 rounded-xl bg-white shadow-xs border border-blue-200 flex items-center justify-center text-[#0173b6] shrink-0 mt-0.5">
                <ShieldCheck size={20} />
              </div>
              <div className="space-y-0.5">
                <p className="text-xs font-black text-slate-900">
                  Integritas Pangkalan Data SDM RSU Avisena
                </p>
                <p className="text-[11px] text-slate-600 leading-relaxed font-medium">
                  Seluruh arsip biodata kepegawaian dilindungi dan disinkronkan secara terpusat.
                  Apabila terdapat pembaruan alamat domisili, nomor kontak, atau mutasi jabatan, silakan
                  mengajukan verifikasi melalui Bagian Human Capital RSU Avisena.
                </p>
              </div>
            </div>

            {/* Footer Profil: ID Pegawai & Hak Akses */}
            <div className="pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
                  ID Pegawai (Sistem UUID)
                </span>
                <span className="text-xs font-mono text-slate-500 tabular-nums">
                  {profile.id}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-lg text-[10px] font-bold uppercase tracking-wider font-mono">
                  Sistem Absensi Kiosk & GPS
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
