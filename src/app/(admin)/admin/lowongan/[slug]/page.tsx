/** Path: src/app/(admin)/admin/lowongan/[slug]/page.tsx 
 * Deskripsi: Halaman detail lowongan dengan UI Modern, kontainer lebar, dan sudut lancip.
 * Skema Warna: Kustom Primary (#0173b6).
 */

"use client";

import React, { useState, useEffect } from 'react';
import { 
  ChevronLeft, Briefcase, MapPin, Clock, Eye, Loader2, 
  AlertTriangle, User, Phone, Mail, Calendar, FileText, CheckCircle, X,
  GraduationCap, Heart, Users, Download, Paperclip, ClipboardList,
  Target, Info
} from 'lucide-react';

/** --- SHIM NAVIGASI CANVAS --- */
const useParams = () => {
  const path = typeof window !== 'undefined' ? window.location.pathname : "";
  const segments = path.split('/');
  return { slug: segments[segments.length - 1] };
};

const Link = ({ href, children, className }: any) => (
  <a href={href} className={className} onClick={(e) => {
    e.preventDefault();
    window.history.pushState({}, '', href);
    window.dispatchEvent(new PopStateEvent('popstate'));
  }}>{children}</a>
);

/** --- MODAL COMPONENT (Gaya Lancip/Sharp) --- */
const Modal = ({ isOpen, onClose, title, children, size = "md" }: any) => {
  if (!isOpen) return null;
  const sizeClasses: Record<string, string> = {
    sm: "max-w-sm", md: "max-w-md", lg: "max-w-lg", xl: "max-w-xl", "5xl": "max-w-5xl",
  };
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm overflow-y-auto">
      <div className={`bg-white rounded-md shadow-2xl w-full ${sizeClasses[size] || sizeClasses.md} my-8 animate-in zoom-in duration-200 border border-slate-200`}>
        <div className="flex items-center justify-between p-6 border-b border-slate-100 bg-slate-50/50">
          <div>
            <h2 className="text-xl font-bold text-slate-800 leading-none">{title}</h2>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-slate-200 rounded-full transition-colors text-slate-400">
            <X size={20} />
          </button>
        </div>
        <div className="p-8">{children}</div>
      </div>
    </div>
  );
};

// --- INTERFACES ---
interface JobDetail {
    id: string; title: string; status: string; posted_date: string | null;
    closing_date: string | null; nama_job: string; category: string;
    deskripsi_job: string[]; kualifikasi_job: string[];
}

interface ApplicantSummary {
    id: string; nama: string; email: string; no_whatsapp: string;
    created_at: string; status: string; job_opening_id: string; 
}

const Badge = ({ label, color = "slate", icon: Icon }: { label: string; color?: string; icon?: any }) => (
    <span className={`px-2.5 py-1 bg-${color}-50 text-${color}-700 text-[10px] font-bold rounded border border-${color}-200 flex items-center gap-1.5 uppercase tracking-wide`}>
        {Icon && <Icon size={12} />} {label}
    </span>
);

export default function DetailLowonganPage() {
    const { slug } = useParams();
    const [job, setJob] = useState<JobDetail | null>(null);
    const [applicants, setApplicants] = useState<ApplicantSummary[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedCandidateId, setSelectedCandidateId] = useState<string | null>(null);
    const [candidateDetail, setCandidateDetail] = useState<any>(null);
    const [isLoadingDetail, setIsLoadingDetail] = useState(false);

    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "";

    useEffect(() => {
        if (!slug) return;
        const fetchData = async () => {
            setIsLoading(true);
            try {
                const [jobRes, applicantsRes] = await Promise.all([
                    fetch(`${baseUrl}/job-openings/${slug}`),
                    fetch(`${baseUrl}/apply`)
                ]);
                if (jobRes.ok) setJob(await jobRes.json());
                if (applicantsRes.ok) {
                    const all = await applicantsRes.json();
                    setApplicants(all.filter((a: any) => a.job_opening_id === slug));
                }
            } catch (err: any) { setError(err.message); } finally { setIsLoading(false); }
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
        } finally { setIsLoadingDetail(false); }
    };

    const getStatusClass = (status: string) => {
        const s = status?.toLowerCase() || '';
        if (s === 'accepted') return 'bg-green-50 text-green-700 border-green-100';
        if (s === 'rejected') return 'bg-red-50 text-red-700 border-red-100';
        return 'bg-blue-50 text-blue-700 border-blue-100';
    };

    if (isLoading) return (
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <Loader2 className="animate-spin text-primary" size={40} />
      </div>
    );

    if (error || !job) return (
      <div className="p-12 text-center">
        <AlertTriangle className="mx-auto text-red-500 mb-4" size={48} />
        <h1 className="text-xl font-bold text-slate-800">{error || "Lowongan tidak ditemukan"}</h1>
        <Link href="/admin/lowongan" className="mt-6 inline-flex bg-primary text-white px-6 py-2 rounded-md font-bold hover:bg-primary-dark transition-all shadow-lg shadow-primary/20">Kembali</Link>
      </div>
    );

    return (
        <div className="p-8 font-sans max-w-7xl mx-auto min-h-screen">
            <div className="mb-6">
                <Link href="/admin/lowongan" className="inline-flex items-center gap-2 text-slate-500 hover:text-primary font-bold text-xs transition-colors group">
                    <ChevronLeft size={18} className="group-hover:-translate-x-1 transition-transform" /> Kembali ke Manajemen Lowongan
                </Link>
            </div>

            {/* HEADER JOB CARD - Desain Modern & Lebar */}
            <div className="bg-white p-8 rounded-md shadow-sm border border-slate-200 mb-8 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-10 opacity-[0.03] text-primary-dark"><ClipboardList size={180}/></div>
                <div className="flex flex-col lg:flex-row justify-between items-start gap-8 relative z-10">
                    <div className="flex-1">
                        <div className="flex items-center gap-3 mb-4">
                            <span className={`px-3 py-1 text-[10px] font-bold uppercase rounded border ${job.category === 'Medis' ? 'bg-blue-50 text-blue-600 border-blue-100' : 'bg-green-50 text-green-600 border-green-100'}`}>
                                {job.category}
                            </span>
                            <span className="px-3 py-1 text-[10px] font-bold uppercase rounded bg-slate-100 text-slate-600 border border-slate-200">
                                {job.status}
                            </span>
                        </div>
                        <h1 className="text-4xl font-extrabold text-primary-dark tracking-tight leading-tight mb-3">{job.title}</h1>
                        <div className="flex items-center flex-wrap gap-x-8 gap-y-2 text-slate-400 font-bold text-xs uppercase tracking-wider">
                             <div className="flex items-center gap-2"><Calendar size={14} className="text-primary"/> Posted: {job.posted_date ? new Date(job.posted_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : '-'}</div>
                             <div className="flex items-center gap-2"><Clock size={14} className="text-primary"/> Deadline: {job.closing_date ? new Date(job.closing_date).toLocaleDateString('id-ID') : 'Tanpa Batas'}</div>
                        </div>
                    </div>
                    <div className="bg-slate-50 p-8 rounded-md border border-slate-100 text-center min-w-[180px] shadow-inner">
                        <div className="text-5xl font-black text-primary mb-1 leading-none">{applicants.length}</div>
                        <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Total Pelamar</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 mt-10 pt-10 border-t border-slate-100">
                    <div>
                        <h3 className="text-xs font-bold text-primary-dark mb-4 flex items-center gap-3 uppercase tracking-widest">
                            <div className="w-1.5 h-6 bg-primary rounded-full"></div> Deskripsi Pekerjaan
                        </h3>
                        <div className="space-y-3 bg-slate-50/50 p-6 rounded-md border border-slate-100 text-sm text-slate-600 leading-relaxed font-medium">
                           {Array.isArray(job.deskripsi_job) ? job.deskripsi_job.map((p, i) => <div key={i} className="flex gap-3"><span className="text-primary font-black">•</span> <p>{p}</p></div>) : <p>{job.deskripsi_job}</p>}
                        </div>
                    </div>
                    <div>
                        <h3 className="text-xs font-bold text-primary-dark mb-4 flex items-center gap-3 uppercase tracking-widest">
                             <div className="w-1.5 h-6 bg-green-500 rounded-full"></div> Kualifikasi Utama
                        </h3>
                        <div className="space-y-3 bg-slate-50/50 p-6 rounded-md border border-slate-100 text-sm text-slate-600 leading-relaxed font-medium">
                           {Array.isArray(job.kualifikasi_job) ? job.kualifikasi_job.map((q, i) => <div key={i} className="flex gap-3"><span className="text-green-500 font-black">•</span> <p>{q}</p></div>) : <p>{job.kualifikasi_job}</p>}
                        </div>
                    </div>
                </div>
            </div>

            {/* TABEL PELAMAR (Style Lancip & Lebar) */}
            <div className="bg-white rounded-md shadow-sm border border-slate-200 overflow-hidden mb-12">
                <div className="bg-primary-dark px-8 py-5 flex justify-between items-center">
                    <h2 className="text-xs font-bold text-white uppercase tracking-[0.2em] flex items-center gap-3">
                        <Users size={18} className="text-blue-300" />
                        Daftar Kandidat Pelamar
                    </h2>
                </div>
                
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-slate-50 text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100">
                                <th className="px-8 py-5">Nama Lengkap</th>
                                <th className="px-8 py-5">Informasi Kontak</th>
                                <th className="px-8 py-5 text-center">Tanggal Apply</th>
                                <th className="px-8 py-5 text-center">Status Pipeline</th>
                                <th className="px-8 py-5 text-center">Tindakan</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {applicants.length > 0 ? (
                                applicants.map((applicant) => (
                                    <tr key={applicant.id} className="hover:bg-slate-50 transition-all group">
                                        <td className="px-8 py-6">
                                            <div className="font-bold text-slate-800 text-base tracking-tight">{applicant.nama}</div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="text-xs font-bold text-slate-500">{applicant.email}</div>
                                            <div className="text-[10px] text-slate-300 font-bold flex items-center gap-1.5 mt-1.5 uppercase">
                                                <Phone size={10} className="text-emerald-500"/> {applicant.no_whatsapp}
                                            </div>
                                        </td>
                                        <td className="px-8 py-6 text-center">
                                            <span className="text-xs font-bold text-slate-400">
                                                {new Date(applicant.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                                            </span>
                                        </td>
                                        <td className="px-8 py-6 text-center">
                                            <span className={`px-3 py-1.5 text-[9px] font-bold rounded-md border uppercase tracking-widest ${getStatusClass(applicant.status)}`}>
                                                {applicant.status}
                                            </span>
                                        </td>
                                        <td className="px-8 py-6 text-center">
                                            <button 
                                                onClick={() => handleViewCandidate(applicant.id)} 
                                                className="p-3 text-primary hover:text-white border border-slate-100 hover:bg-primary rounded-md shadow-sm transition-all active:scale-95"
                                                title="Lihat Profil Lengkap"
                                            >
                                                <Eye size={18} />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={5} className="text-center py-20">
                                        <div className="flex flex-col items-center justify-center grayscale opacity-30">
                                            <Users className="h-12 w-12 mb-3 text-slate-400" />
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Belum ada kandidat yang melamar.</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* MODAL PROFIL KANDIDAT */}
            <Modal isOpen={!!selectedCandidateId} onClose={() => setSelectedCandidateId(null)} title="Profil Lengkap Kandidat" size="5xl">
                {isLoadingDetail ? (
                    <div className="p-20 text-center">
                        <Loader2 className="animate-spin h-10 w-10 text-primary mx-auto mb-4" />
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Menyinkronkan Identitas...</p>
                    </div>
                ) : candidateDetail ? (
                    <div className="flex flex-col gap-8">
                        {/* Summary Header */}
                        <div className="bg-slate-50 p-6 rounded-md border border-slate-100 flex flex-col md:flex-row items-center md:items-start gap-8 shadow-inner">
                            <div className="w-28 h-28 bg-white rounded-md border-4 border-white shadow-md flex items-center justify-center shrink-0 overflow-hidden relative group">
                                {candidateDetail.documents?.pas_foto_url ? (
                                    <img src={candidateDetail.documents.pas_foto_url} alt="Foto" className="w-full h-full object-cover" />
                                ) : <User size={48} className="text-slate-200" />}
                            </div>
                            <div className="flex-1 text-center md:text-left pt-2">
                                <h2 className="text-3xl font-black text-primary-dark tracking-tighter uppercase mb-2 leading-none">{candidateDetail.nama}</h2>
                                <div className="flex flex-wrap justify-center md:justify-start gap-x-8 gap-y-2 text-xs font-bold text-slate-400">
                                    <span className="flex items-center gap-2"><Mail size={14} className="text-primary"/> {candidateDetail.email}</span>
                                    <span className="flex items-center gap-2"><Phone size={14} className="text-primary"/> {candidateDetail.no_whatsapp}</span>
                                </div>
                                <div className="mt-4 flex flex-wrap justify-center md:justify-start gap-2">
                                    <Badge label={candidateDetail.status_pernikahan} icon={Heart} />
                                    <Badge label={candidateDetail.agama} icon={Target} />
                                    <Badge label={`${new Date().getFullYear() - new Date(candidateDetail.tanggal_lahir).getFullYear()} Thn`} color="primary" />
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-6">
                                <section>
                                    <h4 className="font-bold text-slate-800 text-[11px] mb-4 flex items-center gap-3 uppercase tracking-widest border-b pb-2">
                                        <Briefcase size={16} className="text-primary"/> Pengalaman Kerja
                                    </h4>
                                    <div className="space-y-4">
                                        {candidateDetail.experience?.length > 0 ? candidateDetail.experience.map((exp: any, i: number) => (
                                            <div key={i} className="border-l-2 border-primary/20 pl-4 py-1">
                                                <p className="font-bold text-slate-800 text-sm">{exp.jabatan_terakhir}</p>
                                                <p className="text-primary font-bold text-xs uppercase">{exp.nama_instansi}</p>
                                                <p className="text-[10px] text-slate-400 font-bold mt-1 uppercase tracking-wider">{exp.tahun_mulai} — {exp.tahun_selesai}</p>
                                            </div>
                                        )) : <p className="text-xs italic text-slate-300">Data belum tersedia.</p>}
                                    </div>
                                </section>
                                <section>
                                    <h4 className="font-bold text-slate-800 text-[11px] mb-4 flex items-center gap-3 uppercase tracking-widest border-b pb-2">
                                        <GraduationCap size={16} className="text-primary"/> Pendidikan Terakhir
                                    </h4>
                                    <div className="space-y-4">
                                        {candidateDetail.education?.formal?.length > 0 ? candidateDetail.education.formal.map((edu: any, i: number) => (
                                            <div key={i} className="border-l-2 border-blue-400/30 pl-4 py-1">
                                                <p className="font-bold text-slate-800 text-sm uppercase">{edu.nama_sekolah}</p>
                                                <p className="text-blue-500 font-bold text-xs mt-1">Lulus {edu.tahun_lulus} {edu.ipk && <span className="ml-2 bg-blue-50 px-2 py-0.5 rounded text-[10px] border border-blue-100">IPK: {edu.ipk}</span>}</p>
                                            </div>
                                        )) : <p className="text-xs italic text-slate-300">Data belum tersedia.</p>}
                                    </div>
                                </section>
                            </div>

                            <div className="space-y-6">
                                <section className="bg-slate-50 p-6 rounded-md border border-slate-100">
                                    <h4 className="font-bold text-slate-800 text-[11px] mb-4 flex items-center gap-3 uppercase tracking-widest border-b border-slate-200 pb-2">
                                        <Users size={16} className="text-primary"/> Data Keluarga
                                    </h4>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="bg-white p-3 rounded-md border border-slate-100 shadow-sm">
                                            <p className="text-[9px] font-bold text-slate-300 uppercase mb-1">Ayah</p>
                                            <p className="text-xs font-bold text-slate-700 truncate">{candidateDetail.parents?.nama_ayah || '-'}</p>
                                        </div>
                                        <div className="bg-white p-3 rounded-md border border-slate-100 shadow-sm">
                                            <p className="text-[9px] font-bold text-slate-300 uppercase mb-1">Ibu</p>
                                            <p className="text-xs font-bold text-slate-700 truncate">{candidateDetail.parents?.nama_ibu || '-'}</p>
                                        </div>
                                        {candidateDetail.spouse && (
                                            <div className="col-span-2 bg-blue-50/50 p-3 rounded-md border border-blue-100">
                                                <p className="text-[9px] font-bold text-blue-400 uppercase mb-1">Pasangan</p>
                                                <p className="text-xs font-bold text-blue-800">{candidateDetail.spouse.nama}</p>
                                            </div>
                                        )}
                                    </div>
                                </section>

                                <section>
                                    <h4 className="font-bold text-slate-800 text-[11px] mb-4 flex items-center gap-3 uppercase tracking-widest border-b pb-2">
                                        <FileText size={16} className="text-primary"/> Berkas Pendukung
                                    </h4>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                        {candidateDetail.documents && Object.entries(candidateDetail.documents).map(([k, v]) => {
                                            if (!v || k.includes('id') || k.includes('candidate')) return null;
                                            const label = k.replace('_url', '').replace('_', ' ').toUpperCase();
                                            return (
                                                <a key={k} href={v as string} target="_blank" className="p-2.5 bg-white border border-slate-200 rounded flex justify-between items-center hover:bg-slate-50 transition-all group">
                                                    <span className="text-[10px] font-bold text-slate-600 uppercase truncate group-hover:text-primary">{label}</span> 
                                                    <Download size={14} className="text-slate-300 group-hover:text-primary shrink-0"/>
                                                </a>
                                            )
                                        })}
                                    </div>
                                </section>
                            </div>
                        </div>

                        <div className="pt-6 border-t border-slate-100 flex justify-end gap-3">
                            <button onClick={()=>setSelectedCandidateId(null)} className="px-8 py-2.5 bg-slate-100 text-slate-500 font-bold rounded-md hover:bg-slate-200 transition-all text-xs uppercase tracking-widest">Tutup</button>
                            <button onClick={()=>alert("Status rekrutmen diproses")} className="px-8 py-2.5 bg-primary text-white font-bold rounded-md hover:bg-primary-dark transition-all text-xs uppercase tracking-widest shadow-md shadow-primary/20">Setujui Kandidat</button>
                        </div>
                    </div>
                ) : null}
            </Modal>

            <style jsx global>{`
                .custom-scrollbar::-webkit-scrollbar { width: 4px; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 4px; }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #cbd5e1; }
            `}</style>
        </div>
    );
}