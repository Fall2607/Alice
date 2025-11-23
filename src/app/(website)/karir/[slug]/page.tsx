// File: app/karir/[slug]/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Briefcase,
  MapPin,
  Clock,
  Loader2,
  AlertTriangle,
  Calendar,
  Share2,
  CheckCircle2,
  Building2,
  ChevronRight,
  X,
  User,
  Mail,
  Phone,
  CreditCard,
  Map,
  Heart
} from "lucide-react";

// --- Interfaces ---
interface JobDetail {
  id: number;
  title: string;
  status: string;
  posted_date: string | null;
  closing_date: string | null;
  nama_job: string;
  category: string;
  deskripsi_job: string[];
  kualifikasi_job: string[];
}

// Interface untuk Form Data Identitas
interface IdentityForm {
  fullName: string;
  email: string;
  birthPlace: string;
  birthDate: string;
  ethnicity: string;
  religion: string;
  ktp: string;
  address: string;
  whatsapp: string;
  maritalStatus: string;
}

export default function CareerDetailPage() {
  const params = useParams();
  const slug = params.slug as string;

  const [job, setJob] = useState<JobDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCopied, setIsCopied] = useState(false);

  // State untuk Modal & Form
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
  const [formData, setFormData] = useState<IdentityForm>({
    fullName: "",
    email: "",
    birthPlace: "",
    birthDate: "",
    ethnicity: "",
    religion: "",
    ktp: "",
    address: "",
    whatsapp: "",
    maritalStatus: "Belum Kawin" // Default sesuai request
  });

  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "";

  useEffect(() => {
    if (!slug) return;

    const fetchJobDetail = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const res = await fetch(`${baseUrl}/job-openings/${slug}`);
        if (!res.ok) {
          if (res.status === 404) throw new Error("Lowongan tidak ditemukan.");
          throw new Error("Gagal memuat detail lowongan.");
        }
        const data = await res.json();
        setJob(data);
      } catch (err) {
        console.error("Fetch Error:", err);
        setError(err instanceof Error ? err.message : "Terjadi kesalahan saat memuat data.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchJobDetail();
  }, [slug, baseUrl]);

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmitStep1 = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Data Identitas:", formData);
    alert("Data Identitas tersimpan! (Logika lanjut ke step berikutnya akan di sini)");
    // Di sini nanti logika untuk lanjut ke Step B
  };

  // --- Loading State ---
  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center">
        <div className="relative">
          <div className="h-16 w-16 rounded-full border-4 border-primary/20 animate-ping absolute"></div>
          <div className="h-16 w-16 rounded-full border-4 border-t-primary animate-spin relative flex justify-center items-center">
            <Loader2 className="h-6 w-6 text-primary" />
          </div>
        </div>
        <p className="text-slate-500 mt-6 font-medium animate-pulse">Sedang menyiapkan detail peluang karir...</p>
      </div>
    );
  }

  // --- Error State ---
  if (error || !job) {
    return (
      <div className="min-h-screen bg-slate-50 pt-32 pb-20 px-6 flex justify-center items-center">
        <div className="max-w-lg w-full bg-white p-10 rounded-2xl shadow-xl text-center border border-slate-100">
          <div className="bg-red-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertTriangle className="h-10 w-10 text-red-500" />
          </div>
          <h1 className="text-2xl font-bold text-slate-800 mb-3">Oops! Lowongan Tidak Ditemukan</h1>
          <p className="text-slate-600 mb-8 leading-relaxed">
            {error || "Sepertinya lowongan ini sudah terisi atau telah dihapus."}
          </p>
          <Link
            href="/karir"
            className="inline-flex items-center gap-2 bg-primary text-white px-8 py-3 rounded-xl hover:bg-primary-dark transition-all shadow-lg shadow-primary/30 font-semibold"
          >
            <ArrowLeft size={18} />
            Cari Lowongan Lain
          </Link>
        </div>
      </div>
    );
  }

  // --- Main Content ---
  return (
    <div className="bg-slate-50 min-h-screen pb-20">
      {/* Hero Header */}
      <div className="bg-primary text-white pt-32 pb-16 md:pb-24 px-6 relative overflow-hidden">
        {/* Decorative Background Elements */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-secondary/20 rounded-full blur-2xl translate-y-1/3 -translate-x-1/3"></div>

        <div className="container mx-auto relative z-10">
          <Link
            href="/karir"
            className="inline-flex items-center gap-2 text-white/80 hover:text-white transition-colors mb-8 font-medium bg-white/10 px-4 py-2 rounded-full hover:bg-white/20 backdrop-blur-sm w-fit"
          >
            <ArrowLeft size={16} />
            Kembali
          </Link>

          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
            <div className="max-w-3xl">
              <div className="flex flex-wrap gap-3 mb-4">
                <span className="px-3 py-1 rounded-lg bg-secondary text-white text-xs font-bold uppercase tracking-wider shadow-sm">
                  {job.category}
                </span>
                {job.status === 'Published' && (
                  <span className="px-3 py-1 rounded-lg bg-green-500/20 border border-green-400/30 text-green-100 text-xs font-bold uppercase tracking-wider">
                    Active Hiring
                  </span>
                )}
              </div>
              <h1 className="text-3xl md:text-5xl font-bold mb-6 leading-tight">
                {job.title}
              </h1>

              <div className="flex flex-wrap gap-y-3 gap-x-6 text-white/90 font-medium">
                <div className="flex items-center gap-2">
                  <Building2 size={18} className="text-secondary" />
                  <span>RSU Avisena</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin size={18} className="text-secondary" />
                  <span>Bandung, Jawa Barat</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock size={18} className="text-secondary" />
                  <span>Penuh Waktu</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar size={18} className="text-secondary" />
                  <span>Diposting {job.posted_date ? new Date(job.posted_date).toLocaleDateString("id-ID", { day: 'numeric', month: 'short' }) : 'Baru saja'}</span>
                </div>
              </div>
            </div>

            {/* Share Button (Desktop) */}
            <button
              onClick={handleShare}
              className="hidden md:flex items-center gap-2 bg-white/10 hover:bg-white/20 px-4 py-3 rounded-xl transition-all backdrop-blur-md border border-white/10"
              title="Salin Link Lowongan"
            >
              {isCopied ? <CheckCircle2 size={20} className="text-green-300" /> : <Share2 size={20} />}
              <span>{isCopied ? "Link Tersalin!" : "Bagikan"}</span>
            </button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 -mt-10 relative z-20">
        <div className="flex flex-col lg:flex-row gap-8">

          {/* Left Column: Content */}
          <div className="lg:w-2/3 space-y-8">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8">
              <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-3">
                <div className="w-1 h-8 bg-primary rounded-full"></div>
                Deskripsi Pekerjaan
              </h2>
              <div className="prose prose-slate max-w-none text-slate-600 leading-relaxed">
                {Array.isArray(job.deskripsi_job) ? (
                  job.deskripsi_job.map((desc, idx) => (
                    <p key={idx} className="mb-4 last:mb-0">{desc}</p>
                  ))
                ) : (
                  <p>{job.deskripsi_job}</p>
                )}
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8">
              <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-3">
                <div className="w-1 h-8 bg-secondary rounded-full"></div>
                Kualifikasi & Persyaratan
              </h2>
              <ul className="space-y-4">
                {Array.isArray(job.kualifikasi_job) ? (
                  job.kualifikasi_job.map((req, idx) => (
                    <li key={idx} className="flex items-start gap-3 text-slate-600">
                      <div className="mt-1 min-w-[20px] h-5 w-5 rounded-full bg-blue-50 flex items-center justify-center">
                        <div className="h-2 w-2 rounded-full bg-primary"></div>
                      </div>
                      <span className="leading-relaxed">{req}</span>
                    </li>
                  ))
                ) : (
                  <li className="flex items-start gap-3 text-slate-600">
                    <span>{job.kualifikasi_job}</span>
                  </li>
                )}
              </ul>
            </div>

            <div className="lg:hidden bg-white p-6 rounded-2xl shadow-sm border border-slate-100 text-center">
              <h3 className="font-bold text-slate-800 text-lg mb-2">Siap Bergabung?</h3>
              <p className="text-slate-500 mb-6 text-sm">Jangan lewatkan kesempatan berkarir di RS Avisena.</p>
              <button
                onClick={() => setIsApplyModalOpen(true)}
                className="w-full bg-primary text-white py-4 rounded-xl font-bold text-lg hover:bg-primary-dark shadow-lg shadow-primary/20 transition-all active:scale-95"
              >
                Lamar Sekarang
              </button>
            </div>
          </div>

          {/* Right Column: Sticky Sidebar */}
          <div className="lg:w-1/3">
            <div className="sticky top-28 space-y-6">

              <div className="bg-white rounded-2xl shadow-lg shadow-slate-200/50 border border-slate-100 p-6 md:p-8 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-110 duration-700"></div>

                <h3 className="font-bold text-slate-800 text-xl mb-2">Ringkasan</h3>
                <p className="text-slate-500 text-sm mb-6">Informasi penting terkait lowongan ini.</p>

                <div className="space-y-4 mb-8">
                  <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                    <span className="text-slate-500 text-sm flex items-center gap-2"><Clock size={16} /> Tipe</span>
                    <span className="font-semibold text-slate-800 text-sm">Penuh Waktu</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                    <span className="text-slate-500 text-sm flex items-center gap-2"><Briefcase size={16} /> Level</span>
                    <span className="font-semibold text-slate-800 text-sm">Staff / Senior</span>
                  </div>
                  {job.closing_date && (
                    <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg border border-red-100">
                      <span className="text-red-500 text-sm flex items-center gap-2"><Calendar size={16} /> Penutupan</span>
                      <span className="font-bold text-red-600 text-sm">{new Date(job.closing_date).toLocaleDateString("id-ID", { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                    </div>
                  )}
                </div>

                <button
                  onClick={() => setIsApplyModalOpen(true)}
                  className="w-full bg-primary text-white py-4 rounded-xl font-bold text-lg hover:bg-primary-dark shadow-xl shadow-primary/25 transition-all transform hover:-translate-y-1 active:translate-y-0 flex items-center justify-center gap-2"
                >
                  Lamar Posisi Ini <ChevronRight size={20} />
                </button>

                <div className="mt-4 text-center">
                  <p className="text-xs text-slate-400">
                    Pastikan CV Anda dalam format PDF (Max 2MB).
                  </p>
                </div>
              </div>

              <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-6 text-white text-center shadow-lg">
                <h4 className="font-bold mb-2">Butuh Bantuan?</h4>
                <p className="text-slate-300 text-sm mb-4">Jika Anda mengalami kendala saat melamar, hubungi tim rekrutmen kami.</p>
                <a href="mailto:hrd@rsavisena.com" className="text-secondary font-semibold hover:underline text-sm">hrd@rsavisena.com</a>
              </div>

            </div>
          </div>
        </div>
      </div>

      {/* --- MODAL FORMULIR LAMARAN --- */}
      {isApplyModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop Blur */}
          <div
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
            onClick={() => setIsApplyModalOpen(false)}
          ></div>

          {/* Modal Content */}
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl relative z-10 overflow-hidden flex flex-col max-h-[90vh]">

            {/* Header Modal */}
            <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center bg-white">
              <div>
                <h2 className="text-2xl font-bold text-slate-800">Formulir Lamaran</h2>
                <p className="text-slate-500 text-sm mt-1">
                  Posisi: <span className="text-primary font-semibold">{job.title}</span>
                </p>
              </div>
              <button
                onClick={() => setIsApplyModalOpen(false)}
                className="p-2 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            {/* Stepper Indicator */}
            <div className="px-8 py-4 bg-slate-50 border-b border-slate-100">
              <div className="flex items-center gap-2 text-sm font-semibold text-primary">
                <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center text-sm shadow-lg shadow-primary/20">1</div>
                <span>Data Identitas</span>
                <div className="h-1 w-12 bg-slate-200 rounded-full ml-4"></div>
                <div className="w-8 h-8 rounded-full bg-slate-200 text-slate-400 flex items-center justify-center text-sm ml-2">2</div>
                <span className="text-slate-400 font-normal">Dokumen & CV</span>
              </div>
            </div>

            {/* Scrollable Form Body */}
            <div className="p-8 overflow-y-auto custom-scrollbar">
              <form id="identityForm" onSubmit={handleSubmitStep1}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                  {/* Nama Lengkap */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-bold text-slate-700 mb-2">Nama Lengkap Beserta Gelar <span className="text-red-500">*</span></label>
                    <div className="relative">
                      <User className="absolute left-4 top-3.5 text-slate-400" size={18} />
                      <input
                        type="text"
                        name="fullName"
                        required
                        value={formData.fullName}
                        onChange={handleInputChange}
                        placeholder="Contoh: dr. Ahmad Fauzi, Sp.PD"
                        className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                      />
                    </div>
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Email <span className="text-red-500">*</span></label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-3.5 text-slate-400" size={18} />
                      <input
                        type="email"
                        name="email"
                        required
                        value={formData.email}
                        onChange={handleInputChange}
                        placeholder="email@anda.com"
                        className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                      />
                    </div>
                  </div>

                  {/* WhatsApp */}
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">No. HP (WhatsApp Aktif) <span className="text-red-500">*</span></label>
                    <div className="relative">
                      <Phone className="absolute left-4 top-3.5 text-slate-400" size={18} />
                      <input
                        type="tel"
                        name="whatsapp"
                        required
                        value={formData.whatsapp}
                        onChange={handleInputChange}
                        placeholder="08123xxxxxxx"
                        className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                      />
                    </div>
                  </div>

                  {/* Tempat Lahir */}
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Tempat Lahir <span className="text-red-500">*</span></label>
                    <div className="relative">
                      <MapPin className="absolute left-4 top-3.5 text-slate-400" size={18} />
                      <input
                        type="text"
                        name="birthPlace"
                        required
                        value={formData.birthPlace}
                        onChange={handleInputChange}
                        placeholder="Kota Kelahiran"
                        className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                      />
                    </div>
                  </div>

                  {/* Tanggal Lahir */}
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Tanggal Lahir <span className="text-red-500">*</span></label>
                    <div className="relative">
                      <Calendar className="absolute left-4 top-3.5 text-slate-400" size={18} />
                      <input
                        type="date"
                        name="birthDate"
                        required
                        value={formData.birthDate}
                        onChange={handleInputChange}
                        className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-slate-600"
                      />
                    </div>
                  </div>

                  {/* Suku Bangsa */}
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Suku Bangsa</label>
                    <div className="relative">
                      <User className="absolute left-4 top-3.5 text-slate-400" size={18} />
                      <input
                        type="text"
                        name="ethnicity"
                        value={formData.ethnicity}
                        onChange={handleInputChange}
                        placeholder="Contoh: Sunda, Jawa"
                        className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                      />
                    </div>
                  </div>

                  {/* Agama */}
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Agama <span className="text-red-500">*</span></label>
                    <div className="relative">
                      <div className="absolute left-4 top-3.5 text-slate-400 pointer-events-none">
                        <Heart size={18} />
                      </div>
                      <select
                        name="religion"
                        required
                        value={formData.religion}
                        onChange={handleInputChange}
                        className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all appearance-none bg-white text-slate-600"
                      >
                        <option value="">Pilih Agama</option>
                        <option value="Islam">Islam</option>
                        <option value="Protestan">Kristen Protestan</option>
                        <option value="Katolik">Kristen Katolik</option>
                        <option value="Hindu">Hindu</option>
                        <option value="Buddha">Buddha</option>
                        <option value="Khonghucu">Khonghucu</option>
                        <option value="Lainnya">Lainnya</option>
                      </select>
                      <div className="absolute right-4 top-4 text-slate-400 pointer-events-none">
                        <ChevronRight className="rotate-90" size={16} />
                      </div>
                    </div>
                  </div>

                  {/* No KTP */}
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">No. KTP (NIK) <span className="text-red-500">*</span></label>
                    <div className="relative">
                      <CreditCard className="absolute left-4 top-3.5 text-slate-400" size={18} />
                      <input
                        type="number"
                        name="ktp"
                        required
                        value={formData.ktp}
                        onChange={handleInputChange}
                        placeholder="16 digit NIK"
                        className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                      />
                    </div>
                  </div>

                  {/* Status Perkawinan */}
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Status <span className="text-red-500">*</span></label>
                    <div className="relative">
                      <div className="absolute left-4 top-3.5 text-slate-400 pointer-events-none">
                        <Heart size={18} />
                      </div>
                      <select
                        name="religion"
                        required
                        value={formData.religion}
                        onChange={handleInputChange}
                        className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all appearance-none bg-white text-slate-600"
                      >
                        <option value="">Pilih Status</option>
                        <option value="Belum Menikah">Belum Menikah</option>
                        <option value="Menikah">Menikah</option>
                        <option value="Duda">Duda</option>
                        <option value="Janda">Janda</option>
                      </select>
                      <div className="absolute right-4 top-4 text-slate-400 pointer-events-none">
                        <ChevronRight className="rotate-90" size={16} />
                      </div>
                    </div>
                  </div>

                  {/* Alamat Sekarang */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-bold text-slate-700 mb-2">Alamat Lengkap Sekarang <span className="text-red-500">*</span></label>
                    <div className="relative">
                      <Map className="absolute left-4 top-3.5 text-slate-400" size={18} />
                      <textarea
                        name="address"
                        required
                        value={formData.address}
                        onChange={handleInputChange}
                        rows={3}
                        placeholder="Jalan, RT/RW, Kelurahan, Kecamatan, Kota/Kabupaten"
                        className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none"
                      ></textarea>
                    </div>
                  </div>

                </div>
              </form>
            </div>

            {/* Footer Modal */}
            <div className="px-8 py-6 bg-slate-50 border-t border-slate-100 flex justify-end gap-4">
              <button
                onClick={() => setIsApplyModalOpen(false)}
                className="px-6 py-3 rounded-xl text-slate-600 font-semibold hover:bg-slate-200 transition-colors"
              >
                Batal
              </button>
              <button
                type="submit"
                form="identityForm"
                className="px-8 py-3 rounded-xl bg-primary text-white font-bold hover:bg-primary-dark shadow-lg shadow-primary/20 transition-all active:scale-95 flex items-center gap-2"
              >
                Lanjut ke Dokumen <ChevronRight size={18} />
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}