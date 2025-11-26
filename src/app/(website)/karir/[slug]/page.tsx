// File: app/karir/[slug]/page.tsx
"use client";

import { useState, useEffect, useRef, useMemo } from "react";
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

// --- COMPONENT: DATE INPUT (Native Date Picker) ---
const DateInput = ({ 
  value, 
  onChange, 
  name,
  icon: Icon,
}: { 
  value: string, 
  onChange: (name: string, val: string) => void, 
  name: string,
  icon?: any,
  placeholder?: string 
}) => {
  
  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(name, e.target.value);
  };

  return (
    <div className="relative">
      {Icon && <Icon className="absolute left-4 top-3.5 text-slate-400" size={18} />}
      <input 
        type="date" 
        name={name}
        value={value}
        onChange={handleInput}
        className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm md:text-base text-slate-800 placeholder:text-slate-400 bg-white"
        style={{ colorScheme: "light" }} 
      />
    </div>
  );
};

export default function CareerDetailPage() {
  const params = useParams();
  const slug = params.slug as string;

  const [job, setJob] = useState<JobDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCopied, setIsCopied] = useState(false);
  
  // State untuk Modal & Form
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);

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

  return (
    <div className="bg-slate-50 min-h-screen pb-28 lg:pb-20"> 
      {/* Hero Header */}
      <div className="bg-primary text-white pt-15 pb-16 md:pt-20 md:pb-24 px-4 md:px-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-secondary/20 rounded-full blur-2xl translate-y-1/3 -translate-x-1/3"></div>

        <div className="container mx-auto relative z-10">
          <Link
            href="/karir"
            className="inline-flex items-center gap-2 text-white/80 hover:text-white transition-colors mb-6 md:mb-8 font-medium bg-white/10 px-4 py-2 rounded-full hover:bg-white/20 backdrop-blur-sm w-fit text-sm md:text-base"
          >
            <ArrowLeft size={16} />
            Kembali
          </Link>

          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
            <div className="max-w-3xl">
                <div className="flex flex-wrap gap-2 md:gap-3 mb-3 md:mb-4">
                     <span className="px-2.5 py-1 rounded-lg bg-secondary text-white text-[10px] md:text-xs font-bold uppercase tracking-wider shadow-sm">
                        {job.category}
                     </span>
                     {job.status === 'Published' && (
                        <span className="px-2.5 py-1 rounded-lg bg-green-500/20 border border-green-400/30 text-green-100 text-[10px] md:text-xs font-bold uppercase tracking-wider">
                           Active Hiring
                        </span>
                     )}
                </div>
              <h1 className="text-2xl md:text-5xl font-bold mb-4 md:mb-6 leading-snug">
                {job.title}
              </h1>
              
              <div className="flex flex-wrap gap-y-2 gap-x-4 md:gap-x-6 text-white/90 font-medium text-sm md:text-base">
                <div className="flex items-center gap-1.5 md:gap-2">
                  <Building2 size={16} className="text-secondary shrink-0" />
                  <span>RSU Avisena</span>
                </div>
                <div className="flex items-center gap-1.5 md:gap-2">
                  <MapPin size={16} className="text-secondary shrink-0" />
                  <span>Cimahi</span>
                </div>
                <div className="flex items-center gap-1.5 md:gap-2">
                   <Calendar size={16} className="text-secondary shrink-0" />
                   <span>{job.posted_date ? new Date(job.posted_date).toLocaleDateString("id-ID", { day: 'numeric', month: 'short' }) : 'Baru'}</span>
                </div>
              </div>
            </div>

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

      <div className="container mx-auto px-4 md:px-6 -mt-6 md:-mt-10 relative z-20">
        <div className="flex flex-col lg:flex-row gap-6 md:gap-8">
          
          <div className="lg:w-2/3 space-y-6 md:space-y-8">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 md:p-8">
              <h2 className="text-lg md:text-xl font-bold text-slate-800 mb-4 md:mb-6 flex items-center gap-3">
                <div className="w-1 h-6 md:h-8 bg-primary rounded-full"></div>
                Deskripsi Pekerjaan
              </h2>
              <div className="prose prose-slate prose-sm md:prose-base max-w-none text-slate-600 leading-relaxed">
                 {Array.isArray(job.deskripsi_job) ? (
                  job.deskripsi_job.map((desc, idx) => (
                    <p key={idx} className="mb-3 md:mb-4 last:mb-0">{desc}</p>
                  ))
                ) : (
                  <p>{job.deskripsi_job}</p>
                )}
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 md:p-8">
              <h2 className="text-lg md:text-xl font-bold text-slate-800 mb-4 md:mb-6 flex items-center gap-3">
                <div className="w-1 h-6 md:h-8 bg-secondary rounded-full"></div>
                Kualifikasi & Persyaratan
              </h2>
              <ul className="space-y-3 md:space-y-4">
                {Array.isArray(job.kualifikasi_job) ? (
                  job.kualifikasi_job.map((req, idx) => (
                    <li key={idx} className="flex items-start gap-3 text-slate-600 text-sm md:text-base">
                      <div className="mt-1 min-w-[16px] h-4 w-4 md:min-w-[20px] md:h-5 md:w-5 rounded-full bg-blue-50 flex items-center justify-center shrink-0">
                        <div className="h-1.5 w-1.5 md:h-2 md:w-2 rounded-full bg-primary"></div>
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
          </div>

          <div className="hidden lg:block lg:w-1/3">
            <div className="sticky top-28 space-y-6">
              <div className="bg-white rounded-2xl shadow-lg shadow-slate-200/50 border border-slate-100 p-8 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-110 duration-700"></div>
                <h3 className="font-bold text-slate-800 text-xl mb-2">Ringkasan</h3>
                <p className="text-slate-500 text-sm mb-6">Informasi penting terkait lowongan ini.</p>
                <div className="space-y-4 mb-8">
                    <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                        <span className="text-slate-500 text-sm flex items-center gap-2"><Clock size={16}/> Tipe</span>
                        <span className="font-semibold text-slate-800 text-sm">Penuh Waktu</span>
                    </div>
                     <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                        <span className="text-slate-500 text-sm flex items-center gap-2"><Briefcase size={16}/> Level</span>
                        <span className="font-semibold text-slate-800 text-sm">Staff / Senior</span>
                    </div>
                    {job.closing_date && (
                         <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg border border-red-100">
                            <span className="text-red-500 text-sm flex items-center gap-2"><Calendar size={16}/> Penutupan</span>
                            <span className="font-bold text-red-600 text-sm">{new Date(job.closing_date).toLocaleDateString("id-ID", { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                        </div>
                    )}
                </div>
                <Link
                href={`/karir/${slug}/apply`}
                >
                <button
                  className="w-full bg-primary text-white py-4 rounded-xl font-bold text-lg hover:bg-primary-dark shadow-xl shadow-primary/25 transition-all transform hover:-translate-y-1 active:translate-y-0 flex items-center justify-center gap-2"
                >
                  Lamar Posisi Ini <ChevronRight size={20} />
                </button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-slate-200 lg:hidden z-40 safe-area-bottom shadow-[0_-4px_10px_rgba(0,0,0,0.05)]">
        <div className="flex gap-3 items-center max-w-md mx-auto">
            <button
                onClick={handleShare}
                className="p-3 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 active:bg-slate-100 transition-colors"
                title="Bagikan"
            >
               {isCopied ? <CheckCircle2 size={24} className="text-green-500" /> : <Share2 size={24} />}
            </button>
            <Link
              href={`/karir/${slug}/apply`}
              className="px-6 py-3 rounded-xl bg-primary text-white font-semibold hover:bg-primary-dark"
            >
              Lamar Sekarang
            </Link>
        </div>
      </div>
    </div>
  );
}