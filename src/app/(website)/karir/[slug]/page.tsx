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
  X,
  User,
  Mail,
  Phone,
  CreditCard,
  Map,
  Heart,
  ChevronDown,
  Users,
  Baby,
  Search
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

interface IdentityForm {
  // A. Identitas Diri
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
  
  // Kondisional (Pasangan)
  spouseName?: string;
  spouseBirthPlace?: string;
  spouseBirthDate?: string;
  childrenCount?: string;
  spousePhone?: string;

  // B. Data Keluarga (Orang Tua)
  fatherName: string;
  fatherJob: string;
  fatherPhone: string;
  motherName: string;
  motherJob: string;
  motherPhone: string;
}

// --- COMPONENT: SEARCHABLE SELECT (Select2 Style) ---
interface Option {
  value: string;
  label: string;
}

const SearchableSelect = ({ 
  options, 
  value, 
  onChange, 
  placeholder, 
  icon: Icon 
}: { 
  options: Option[], 
  value: string, 
  onChange: (val: string) => void, 
  placeholder: string,
  icon?: any
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const wrapperRef = useRef<HTMLDivElement>(null);

  const filteredOptions = useMemo(() => {
    return options.filter(opt => opt.label.toLowerCase().includes(search.toLowerCase()));
  }, [options, search]);

  const selectedLabel = options.find(opt => opt.value === value)?.label;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={wrapperRef}>
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full pl-11 pr-10 py-3 rounded-xl border cursor-pointer flex items-center bg-white transition-all ${isOpen ? 'border-primary ring-2 ring-primary/20' : 'border-slate-200 hover:border-slate-300'}`}
      >
        {Icon && <Icon className="absolute left-4 text-slate-400" size={18} />}
        <span className={`text-sm md:text-base ${selectedLabel ? 'text-slate-800' : 'text-slate-400'}`}>
          {selectedLabel || placeholder}
        </span>
        <ChevronDown className={`absolute right-4 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} size={16} />
      </div>

      {isOpen && (
        <div className="absolute z-50 w-full mt-2 bg-white border border-slate-100 rounded-xl shadow-xl max-h-60 overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-100">
          <div className="p-2 border-b border-slate-50 sticky top-0 bg-white">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 text-slate-400" size={14} />
              <input 
                type="text" 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Cari..."
                className="w-full pl-9 pr-3 py-2 bg-slate-50 border-none rounded-lg text-sm focus:ring-0 text-slate-700 placeholder:text-slate-400"
                autoFocus
              />
            </div>
          </div>
          <div className="overflow-y-auto custom-scrollbar flex-1 p-1">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((opt) => (
                <div
                  key={opt.value}
                  onClick={() => {
                    onChange(opt.value);
                    setIsOpen(false);
                    setSearch("");
                  }}
                  className={`px-4 py-2.5 text-sm rounded-lg cursor-pointer transition-colors ${value === opt.value ? 'bg-primary/10 text-primary font-medium' : 'text-slate-600 hover:bg-slate-50'}`}
                >
                  {opt.label}
                </div>
              ))
            ) : (
              <div className="px-4 py-3 text-sm text-slate-400 text-center">Tidak ditemukan</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

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
    maritalStatus: "", 
    spouseName: "",
    spouseBirthPlace: "",
    spouseBirthDate: "",
    childrenCount: "",
    spousePhone: "",
    // Init Data Orang Tua
    fatherName: "",
    fatherJob: "",
    fatherPhone: "",
    motherName: "",
    motherJob: "",
    motherPhone: ""
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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCustomChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmitStep1 = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Data Identitas Lengkap:", formData);
    alert(`Data Tersimpan!\nNama: ${formData.fullName}\nAyah: ${formData.fatherName}`);
  };

  const religionOptions = [
    { value: "Islam", label: "Islam" },
    { value: "Protestan", label: "Kristen Protestan" },
    { value: "Katolik", label: "Kristen Katolik" },
    { value: "Hindu", label: "Hindu" },
    { value: "Buddha", label: "Buddha" },
    { value: "Khonghucu", label: "Khonghucu" },
    { value: "Lainnya", label: "Lainnya" },
  ];

  const maritalStatusOptions = [
    { value: "Belum Kawin", label: "Belum Kawin" },
    { value: "Kawin", label: "Kawin" },
    { value: "Janda", label: "Janda" },
    { value: "Duda", label: "Duda" },
  ];

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
      <div className="bg-primary text-white pt-28 pb-16 md:pt-32 md:pb-24 px-4 md:px-6 relative overflow-hidden">
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
                  <span>Bandung</span>
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
                <button
                  onClick={() => setIsApplyModalOpen(true)}
                  className="w-full bg-primary text-white py-4 rounded-xl font-bold text-lg hover:bg-primary-dark shadow-xl shadow-primary/25 transition-all transform hover:-translate-y-1 active:translate-y-0 flex items-center justify-center gap-2"
                >
                  Lamar Posisi Ini <ChevronRight size={20} />
                </button>
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
            <button
                onClick={() => setIsApplyModalOpen(true)}
                className="flex-1 bg-primary text-white py-3 rounded-xl font-bold text-lg shadow-lg shadow-primary/20 active:scale-95 transition-transform flex items-center justify-center gap-2"
            >
                Lamar Sekarang <ChevronRight size={20} />
            </button>
        </div>
      </div>

      {isApplyModalOpen && (
        <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center md:p-4">
          <div 
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" 
            onClick={() => setIsApplyModalOpen(false)}
          ></div>

          <div className="bg-white w-full h-[95vh] md:h-auto md:max-h-[90vh] md:max-w-4xl rounded-t-3xl md:rounded-3xl shadow-2xl relative z-10 overflow-hidden flex flex-col transition-transform transform translate-y-0">
            
            <div className="md:hidden flex justify-center pt-3 pb-1 bg-white" onClick={() => setIsApplyModalOpen(false)}>
                <div className="w-12 h-1.5 bg-slate-200 rounded-full"></div>
            </div>

            <div className="px-6 md:px-8 py-4 md:py-6 border-b border-slate-100 flex justify-between items-center bg-white shrink-0">
              <div>
                <h2 className="text-xl md:text-2xl font-bold text-slate-800">Formulir Lamaran</h2>
                <p className="text-slate-500 text-xs md:text-sm mt-0.5">
                  Posisi: <span className="text-primary font-semibold truncate max-w-[200px] inline-block align-bottom">{job.title}</span>
                </p>
              </div>
              <button 
                onClick={() => setIsApplyModalOpen(false)}
                className="p-2 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            <div className="px-6 md:px-8 py-3 md:py-4 bg-slate-50 border-b border-slate-100 shrink-0">
                <div className="flex items-center gap-2 text-sm font-semibold text-primary">
                    <div className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-primary text-white flex items-center justify-center text-xs md:text-sm shadow-lg shadow-primary/20">1</div>
                    <span className="text-xs md:text-sm">Identitas</span>
                    <div className="h-1 w-8 md:w-12 bg-slate-200 rounded-full ml-2 md:ml-4"></div>
                    <div className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-slate-200 text-slate-400 flex items-center justify-center text-xs md:text-sm ml-2">2</div>
                    <span className="text-slate-400 font-normal text-xs md:text-sm hidden sm:inline">Dokumen & CV</span>
                    <span className="text-slate-400 font-normal text-xs md:text-sm sm:hidden">Dokumen</span>
                </div>
            </div>

            <div className="p-6 md:p-8 overflow-y-auto custom-scrollbar flex-grow bg-white">
              <form id="identityForm" onSubmit={handleSubmitStep1}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-6">
                  
                  {/* --- A. IDENTITAS DIRI --- */}
                  <div className="md:col-span-2">
                    <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-4 pb-2 border-b border-slate-100 flex items-center gap-2">
                        <User size={16} className="text-primary" /> A. Identitas Diri
                    </h3>
                  </div>

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
                            className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm md:text-base"
                        />
                    </div>
                  </div>

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
                            className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm md:text-base"
                        />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">No. HP (WhatsApp) <span className="text-red-500">*</span></label>
                    <div className="relative">
                        <Phone className="absolute left-4 top-3.5 text-slate-400" size={18} />
                        <input 
                            type="tel" 
                            name="whatsapp"
                            required
                            value={formData.whatsapp}
                            onChange={handleInputChange}
                            placeholder="08123xxxxxxx"
                            className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm md:text-base"
                        />
                    </div>
                  </div>

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
                            className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm md:text-base"
                        />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Tanggal Lahir <span className="text-red-500">*</span></label>
                    <DateInput 
                        name="birthDate"
                        value={formData.birthDate}
                        onChange={(name, val) => handleCustomChange(name, val)}
                        icon={Calendar}
                    />
                  </div>

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
                            className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm md:text-base"
                        />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Agama <span className="text-red-500">*</span></label>
                    <SearchableSelect 
                      options={religionOptions}
                      value={formData.religion}
                      onChange={(val) => handleCustomChange('religion', val)}
                      placeholder="Pilih Agama"
                      icon={Heart}
                    />
                  </div>

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
                            className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm md:text-base"
                        />
                    </div>
                  </div>

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
                            className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none text-sm md:text-base"
                        ></textarea>
                    </div>
                  </div>

                  <div className="md:col-span-2 pt-2 border-t border-slate-100">
                    <label className="block text-sm font-bold text-slate-700 mb-2">Status Perkawinan <span className="text-red-500">*</span></label>
                    <SearchableSelect 
                      options={maritalStatusOptions}
                      value={formData.maritalStatus}
                      onChange={(val) => handleCustomChange('maritalStatus', val)}
                      placeholder="Pilih Status Perkawinan"
                      icon={Users}
                    />
                  </div>

                  {formData.maritalStatus === "Kawin" && (
                    <div className="md:col-span-2 bg-blue-50/50 p-6 rounded-2xl border border-blue-100 animate-in slide-in-from-top-4 fade-in duration-300">
                        <h3 className="text-sm font-bold text-blue-800 uppercase tracking-wider mb-4 flex items-center gap-2">
                            <Heart size={16} /> Data Pasangan
                        </h3>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div className="md:col-span-2">
                                <label className="block text-sm font-bold text-slate-700 mb-2">Nama Suami / Istri</label>
                                <div className="relative">
                                    <User className="absolute left-4 top-3.5 text-slate-400" size={18} />
                                    <input 
                                        type="text" 
                                        name="spouseName"
                                        required
                                        value={formData.spouseName}
                                        onChange={handleInputChange}
                                        placeholder="Nama Lengkap Pasangan"
                                        className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm md:text-base bg-white"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">Tempat Lahir Pasangan</label>
                                <div className="relative">
                                    <MapPin className="absolute left-4 top-3.5 text-slate-400" size={18} />
                                    <input 
                                        type="text" 
                                        name="spouseBirthPlace"
                                        required
                                        value={formData.spouseBirthPlace}
                                        onChange={handleInputChange}
                                        placeholder="Kota Kelahiran"
                                        className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm md:text-base bg-white"
                                    />
                                </div>
                            </div>

                             <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">Tanggal Lahir Pasangan</label>
                                <DateInput 
                                    name="spouseBirthDate"
                                    value={formData.spouseBirthDate || ""}
                                    onChange={(name, val) => handleCustomChange(name, val)}
                                    icon={Calendar}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">Jumlah Anak</label>
                                <div className="relative">
                                    <Baby className="absolute left-4 top-3.5 text-slate-400" size={18} />
                                    <input 
                                        type="number" 
                                        name="childrenCount"
                                        min="0"
                                        value={formData.childrenCount}
                                        onChange={handleInputChange}
                                        placeholder="0"
                                        className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm md:text-base bg-white"
                                    />
                                </div>
                            </div>

                             <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">No. HP Pasangan</label>
                                <div className="relative">
                                    <Phone className="absolute left-4 top-3.5 text-slate-400" size={18} />
                                    <input 
                                        type="tel" 
                                        name="spousePhone"
                                        required
                                        value={formData.spousePhone}
                                        onChange={handleInputChange}
                                        placeholder="08xxxxxxxxxx"
                                        className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm md:text-base bg-white"
                                    />
                                </div>
                            </div>

                        </div>
                    </div>
                  )}

                  {/* --- B. DATA KELUARGA (ORANG TUA) --- */}
                  <div className="md:col-span-2 mt-6">
                    <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-4 pb-2 border-b border-slate-100 flex items-center gap-2">
                        <Users size={16} className="text-primary" /> B. Data Keluarga (Orang Tua)
                    </h3>
                  </div>

                  {/* --- DATA AYAH --- */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-bold text-slate-700 mb-2">Nama Ayah</label>
                    <div className="relative">
                        <User className="absolute left-4 top-3.5 text-slate-400" size={18} />
                        <input 
                            type="text" 
                            name="fatherName"
                            required
                            value={formData.fatherName}
                            onChange={handleInputChange}
                            placeholder="Nama Lengkap Ayah"
                            className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm md:text-base"
                        />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Pekerjaan Ayah</label>
                    <div className="relative">
                        <Briefcase className="absolute left-4 top-3.5 text-slate-400" size={18} />
                        <input 
                            type="text" 
                            name="fatherJob"
                            required
                            value={formData.fatherJob}
                            onChange={handleInputChange}
                            placeholder="Pekerjaan"
                            className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm md:text-base"
                        />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">No. HP Ayah</label>
                    <div className="relative">
                        <Phone className="absolute left-4 top-3.5 text-slate-400" size={18} />
                        <input 
                            type="tel" 
                            name="fatherPhone"
                            required
                            value={formData.fatherPhone}
                            onChange={handleInputChange}
                            placeholder="08xxxxxxxxxx"
                            className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm md:text-base"
                        />
                    </div>
                  </div>

                  {/* --- DATA IBU --- */}
                  <div className="md:col-span-2 mt-2">
                    <label className="block text-sm font-bold text-slate-700 mb-2">Nama Ibu</label>
                    <div className="relative">
                        <User className="absolute left-4 top-3.5 text-slate-400" size={18} />
                        <input 
                            type="text" 
                            name="motherName"
                            required
                            value={formData.motherName}
                            onChange={handleInputChange}
                            placeholder="Nama Lengkap Ibu"
                            className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm md:text-base"
                        />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Pekerjaan Ibu</label>
                    <div className="relative">
                        <Briefcase className="absolute left-4 top-3.5 text-slate-400" size={18} />
                        <input 
                            type="text" 
                            name="motherJob"
                            required
                            value={formData.motherJob}
                            onChange={handleInputChange}
                            placeholder="Pekerjaan"
                            className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm md:text-base"
                        />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">No. HP Ibu</label>
                    <div className="relative">
                        <Phone className="absolute left-4 top-3.5 text-slate-400" size={18} />
                        <input 
                            type="tel" 
                            name="motherPhone"
                            required
                            value={formData.motherPhone}
                            onChange={handleInputChange}
                            placeholder="08xxxxxxxxxx"
                            className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm md:text-base"
                        />
                    </div>
                  </div>

                </div>
              </form>
            </div>

            <div className="px-6 md:px-8 py-4 md:py-6 bg-slate-50 border-t border-slate-100 flex justify-end gap-3 md:gap-4 shrink-0 safe-area-bottom">
                <button 
                    onClick={() => setIsApplyModalOpen(false)}
                    className="px-5 md:px-6 py-2.5 md:py-3 rounded-xl text-slate-600 font-semibold hover:bg-slate-200 transition-colors text-sm md:text-base"
                >
                    Batal
                </button>
                <button 
                    type="submit"
                    form="identityForm"
                    className="px-6 md:px-8 py-2.5 md:py-3 rounded-xl bg-primary text-white font-bold hover:bg-primary-dark shadow-lg shadow-primary/20 transition-all active:scale-95 flex items-center gap-2 text-sm md:text-base"
                >
                    Lanjut <ChevronRight size={18} />
                </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}