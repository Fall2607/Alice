/** Path: app/(admin)/admin/profile/page.tsx */

"use client";

import React, { useState, useEffect } from "react";
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
  QrCode,
  Download,
  Info,
  ScanFace,
} from "lucide-react";

/** * BAGIAN INTERNAL: Fix untuk pratinjau (Shim untuk modul Next.js) */
const Link = ({ href, children, className }: any) => (
  <a href={href} className={className}>
    {children}
  </a>
);

const showErrorToast = (msg: string) => console.error("Toast Error:", msg);

interface ProfileData {
  id: string;
  nip: string;
  nama_lengkap: string;
  nik: string;
  email: string;
  handphone: string;
  jenis_kelamin: string;
  alamat: string;
  tanggal_masuk: string;
  status_kepegawaian: string;
  nama_departemen: string;
  nama_level: string;
  profesi: string;
  has_face_descriptor?: boolean;
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDownloading, setIsDownloading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "";

  useEffect(() => {
    const fetchProfileData = async () => {
      setIsLoading(true);
      try {
        const userString = localStorage.getItem("user");
        if (!userString)
          throw new Error("Sesi berakhir, silakan login kembali.");

        const user = JSON.parse(userString);
        const karyawanId = user.karyawan_id;

        if (!karyawanId) throw new Error("ID Profil tidak ditemukan.");

        const response = await fetch(`${baseUrl}/karyawan/${karyawanId}`);
        if (!response.ok)
          throw new Error("Gagal mengambil data profil dari server.");

        const data = await response.json();
        setProfile(data);
      } catch (err: any) {
        setError(err.message);
        showErrorToast(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfileData();
  }, [baseUrl]);

  /**
   * Fungsi untuk mengunduh QR Code sebagai file gambar (.png)
   */
  const handleDownloadQR = async () => {
    if (!profile) return;
    setIsDownloading(true);

    try {
      const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=500x500&data=${profile.id}&margin=10&bgcolor=ffffff&color=002d5a`;

      // Mengambil data gambar dari URL
      const response = await fetch(qrUrl);
      const blob = await response.blob();

      // Membuat URL sementara untuk Blob gambar
      const url = window.URL.createObjectURL(blob);

      // Membuat elemen link tersembunyi untuk memicu unduhan
      const link = document.createElement("a");
      link.href = url;
      // Nama file disesuaikan dengan nama karyawan
      const safeName = profile.nama_lengkap.replace(/\s+/g, "_");
      link.download = `QR_Absensi_${safeName}.png`;

      document.body.appendChild(link);
      link.click();

      // Bersihkan resources
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Download Error:", err);
      showErrorToast("Gagal mengunduh QR Code. Silakan coba lagi.");
    } finally {
      setIsDownloading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-[80vh] items-center justify-center bg-slate-50">
        <div className="text-center">
          <Loader2 className="mx-auto h-12 w-12 animate-spin text-primary" />
          <p className="mt-4 text-slate-400 font-black text-xs uppercase tracking-[0.2em]">
            Menyinkronkan Profil...
          </p>
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="p-8 bg-slate-50 min-h-screen">
        <div className="rounded-[40px] bg-white p-12 text-center border border-slate-200 shadow-sm max-w-2xl mx-auto">
          <AlertCircle className="mx-auto h-16 w-16 text-red-500 mb-4" />
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">
            Data Tidak Ditemukan
          </h2>
          <p className="mt-2 text-slate-500 font-medium">
            {error || "Silakan hubungi tim IT."}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="mt-8 bg-primary text-white px-8 py-3 rounded-2xl font-bold text-sm hover:bg-primary-dark transition-all shadow-lg shadow-primary/20"
          >
            Coba Lagi
          </button>
        </div>
      </div>
    );
  }

  const profileImg =
    profile.jenis_kelamin === "Perempuan"
      ? "/img/potrait/woman.jpg"
      : "/img/potrait/man.jpg";

  // URL QR Code tampilan
  const qrDisplayUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${profile.id}&margin=10&bgcolor=ffffff&color=002d5a`;

  return (
    <div className="p-8 font-sans max-w-7xl mx-auto min-h-screen">
      {/* Back Navigation */}
      <div className="mb-6">
        <Link
          href="/admin"
          className="inline-flex items-center gap-2 text-slate-400 hover:text-primary font-bold text-[10px] uppercase tracking-[0.2em] transition-colors"
        >
          <ChevronLeft size={14} /> Kembali ke Beranda
        </Link>
      </div>

      {/* Hero Profile Section (FIXED LAYOUT) */}
      <div className="relative mb-16">
        {/* Banner area */}
        <div className="h-48 md:h-56 w-full rounded-[40px] bg-gradient-to-r from-primary-dark via-primary to-blue-500 shadow-xl shadow-primary/10 overflow-hidden relative">
          <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/20"></div>
        </div>

        {/* Container for Avatar and Name */}
        <div className="flex flex-col md:flex-row md:items-end gap-6 px-10 -mt-20 relative z-10">
          {/* Avatar frame */}
          <div className="relative h-40 w-40 md:h-44 md:w-44 rounded-[40px] border-[8px] border-white bg-white shadow-2xl overflow-hidden group shrink-0">
            <img
              src={profileImg}
              alt="Avatar"
              className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-primary/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer backdrop-blur-[2px]">
              <Camera className="text-white" size={28} />
            </div>
          </div>

          {/* Name and Basic Info Section */}
          <div className="pb-2 flex-1">
            <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tighter leading-none mb-3">
              {profile.nama_lengkap}
            </h1>
            <div className="flex items-center flex-wrap gap-3">
              <span className="px-3 py-1 bg-primary text-white text-[10px] font-black uppercase tracking-widest rounded-lg shadow-sm shadow-primary/30">
                {profile.nama_level}
              </span>
              <div className="w-1.5 h-1.5 rounded-full bg-slate-300"></div>
              <span className="text-slate-500 font-bold text-xs uppercase tracking-[0.1em]">
                {profile.nama_departemen}
              </span>
              <div className="w-1.5 h-1.5 rounded-full bg-slate-300"></div>
              <span className="text-slate-400 font-bold text-xs uppercase tracking-widest">
                NIP: {profile.nip}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-12 grid grid-cols-1 lg:grid-cols-12 gap-8 pb-12">
        {/* Kolom Kiri: QR Code Absensi (FIXED DOWNLOAD) */}
        <div className="lg:col-span-4 space-y-6">
          <div className="rounded-[48px] bg-white p-10 shadow-xl shadow-slate-200/50 border border-slate-100 text-center relative overflow-hidden group transition-all hover:shadow-2xl">
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-primary/5 rounded-full blur-3xl group-hover:bg-primary/10 transition-all duration-700"></div>

            <div className="flex items-center justify-center gap-3 mb-8">
              <div className="p-2 bg-primary/10 rounded-xl text-primary">
                <QrCode size={20} />
              </div>
              <h3 className="text-xs font-black text-primary-dark uppercase tracking-[0.3em]">
                Absensi Digital
              </h3>
            </div>

            <div className="relative inline-block p-6 bg-slate-50 rounded-[40px] border border-slate-100 mb-8 transition-transform group-hover:scale-105 duration-500">
              <img
                src={qrDisplayUrl}
                alt="QR Code Absensi"
                className="w-48 h-48 mix-blend-multiply"
              />
              <div className="absolute inset-0 border-2 border-primary/5 rounded-[40px] pointer-events-none"></div>
            </div>

            <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 mb-8">
              <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-1">Nomor Induk Pegawai (NIP)</p>
              <p className="text-2xl font-black text-slate-800 tracking-widest">{profile.nip}</p>
              <p className="text-[10px] text-slate-400 mt-2 leading-relaxed">Gunakan NIP ini saat melakukan absensi di mesin Kiosk</p>
            </div>

            <div className="space-y-6">
              <p className="text-[11px] text-slate-400 font-bold leading-relaxed px-2">
                Gunakan Kode QR ini untuk pencatatan kehadiran pada mesin
                scanner di lobi atau departemen masing-masing.
              </p>
              <button
                onClick={handleDownloadQR}
                disabled={isDownloading}
                className="w-full flex items-center justify-center gap-3 bg-slate-900 text-white py-4 rounded-3xl font-black text-[10px] uppercase tracking-[0.2em] hover:bg-primary transition-all shadow-xl shadow-slate-900/10 active:scale-95 disabled:bg-slate-400 disabled:cursor-not-allowed"
              >
                {isDownloading ? (
                  <Loader2 className="animate-spin" size={16} />
                ) : (
                  <Download size={16} />
                )}
                {isDownloading ? "Mengunduh..." : "Unduh Kode QR"}
              </button>
            </div>
          </div>

          {/* Status Kepegawaian Mini Card */}
          <div className="rounded-[40px] bg-primary-dark p-8 text-white shadow-2xl shadow-primary/20 relative overflow-hidden group">
            <div className="absolute bottom-[-20%] left-[-10%] w-32 h-32 bg-white/5 rounded-full blur-2xl group-hover:bg-white/10 transition-all"></div>
            <h3 className="mb-6 text-[10px] font-black text-primary/40 uppercase tracking-[0.3em]">
              Status Kontrak
            </h3>
            <div className="flex items-center gap-5 relative z-10">
              <div className="h-14 w-14 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/10">
                <Briefcase size={28} className="text-primary" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-primary/60 uppercase tracking-widest">
                  Jenis Pegawai
                </p>
                <p className="text-xl font-black tracking-tight text-white">
                  {profile.status_kepegawaian}
                </p>
              </div>
            </div>
          </div>

          {/* Biometrik Mini Card */}
          <div className="rounded-[40px] bg-slate-900 p-8 text-white shadow-xl relative overflow-hidden group">
            <h3 className="mb-6 text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">
              Akses Biometrik Wajah
            </h3>
            <div className="flex items-center gap-5 relative z-10 mb-6">
              <div className={`h-14 w-14 rounded-2xl flex items-center justify-center border ${profile.has_face_descriptor ? 'bg-emerald-500/20 border-emerald-500/30' : 'bg-rose-500/20 border-rose-500/30'}`}>
                <ScanFace size={28} className={profile.has_face_descriptor ? 'text-emerald-400' : 'text-rose-400'} />
              </div>
              <div>
                <p className={`text-[10px] font-bold uppercase tracking-widest ${profile.has_face_descriptor ? 'text-emerald-400/80' : 'text-rose-400/80'}`}>
                  Status
                </p>
                <p className="text-xl font-black tracking-tight text-white">
                  {profile.has_face_descriptor ? "Terdaftar" : "Belum Daftar"}
                </p>
              </div>
            </div>
            {!profile.has_face_descriptor ? (
               <Link 
                 href={`/admin/pegawai/enroll-face?nip=${profile.nip}`}
                 className="block w-full text-center bg-blue-600 hover:bg-blue-500 text-white font-black text-[10px] uppercase tracking-widest py-3 rounded-2xl transition-colors"
               >
                 Daftar Sekarang
               </Link>
            ) : (
               <Link 
                 href={`/admin/pegawai/enroll-face?nip=${profile.nip}`}
                 className="block w-full text-center bg-white/10 hover:bg-white/20 text-white font-black text-[10px] uppercase tracking-widest py-3 rounded-2xl transition-colors"
               >
                 Perbarui Wajah
               </Link>
            )}
          </div>
        </div>

        {/* Kolom Kanan: Informasi Detail */}
        <div className="lg:col-span-8 space-y-6">
          <div className="rounded-[48px] bg-white p-10 shadow-xl shadow-slate-200/50 border border-slate-100 h-full flex flex-col">
            <div className="flex items-center justify-between mb-12 pb-6 border-b border-slate-50">
              <h3 className="text-xl font-black text-primary-dark flex items-center gap-4 tracking-tight">
                <div className="h-2 w-8 bg-primary rounded-full"></div>
                Informasi Detail
              </h3>
              <div className="flex items-center gap-2 px-4 py-2 bg-emerald-50 rounded-2xl border border-emerald-100">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                <span className="text-emerald-700 text-[10px] font-black uppercase tracking-wider">
                  Aktif
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-12 gap-x-16 flex-1">
              <div className="group">
                <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em] mb-3 group-hover:text-primary transition-colors">
                  Jabatan & Profesi
                </p>
                <p className="text-lg font-bold text-slate-800 leading-snug">
                  {profile.profesi || profile.nama_level || "-"}
                </p>
              </div>
              <div className="group">
                <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em] mb-3 group-hover:text-primary transition-colors">
                  Lama Bergabung
                </p>
                <div className="flex items-center gap-3 text-lg font-bold text-slate-800">
                  <Calendar size={20} className="text-primary" />
                  {profile.tanggal_masuk
                    ? new Date(profile.tanggal_masuk).toLocaleDateString(
                        "id-ID",
                        { day: "numeric", month: "long", year: "numeric" },
                      )
                    : "-"}
                </div>
              </div>
              <div className="group">
                <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em] mb-3 group-hover:text-primary transition-colors">
                  Identitas KTP (NIK)
                </p>
                <p className="text-lg font-bold text-slate-800 tracking-wide">
                  {profile.nik}
                </p>
              </div>
              <div className="group">
                <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em] mb-3 group-hover:text-primary transition-colors">
                  Kontak Aktif
                </p>
                <div className="flex flex-col gap-3">
                  <div className="flex items-center gap-3 text-sm font-bold text-slate-700">
                    <div className="h-8 w-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
                      <Mail size={14} />
                    </div>
                    <span className="truncate">{profile.email}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm font-bold text-slate-700">
                    <div className="h-8 w-8 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600">
                      <Phone size={14} />
                    </div>
                    {profile.handphone || "-"}
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-16 p-8 bg-slate-50/80 backdrop-blur-sm rounded-[32px] border border-slate-100 flex items-start gap-5">
              <div className="h-12 w-12 rounded-2xl bg-white flex items-center justify-center shadow-md text-primary shrink-0">
                <ShieldCheck size={24} />
              </div>
              <div>
                <p className="text-sm font-black text-primary-dark mb-1">
                  Verifikasi Keamanan
                </p>
                <p className="text-[11px] text-slate-500 leading-relaxed font-medium">
                  Data ini dikelola oleh departemen SDM RSU Avisena. Seluruh
                  informasi bersifat rahasia dan dilindungi oleh sistem keamanan
                  Alice. Segera hubungi HRD jika terdapat perbedaan data.
                </p>
              </div>
            </div>

            <div className="mt-12 pt-8 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-6">
              <div className="flex flex-col">
                <span className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">
                  ID Database
                </span>
                <span className="text-[10px] font-mono text-slate-300 truncate max-w-[200px]">
                  {profile.id}
                </span>
              </div>
              <button className="w-full sm:w-auto px-10 py-4 rounded-3xl bg-primary/10 text-primary font-black text-[10px] uppercase tracking-[0.3em] hover:bg-primary hover:text-white transition-all duration-500 border border-primary/20 hover:shadow-xl hover:shadow-primary/20">
                Lengkapi Data Profil
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Branding */}
      <div className="text-center pb-12 mt-6">
        <p className="text-[9px] font-black text-slate-300 uppercase tracking-[1em]">
          Alice • Digital Workplace • {new Date().getFullYear()}
        </p>
      </div>
    </div>
  );
}
