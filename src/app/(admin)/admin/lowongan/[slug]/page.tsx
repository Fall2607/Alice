// File: src/app/(admin)/admin/lowongan/[slug]/page.tsx
"use client";

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { 
  ChevronLeft, Briefcase, MapPin, Clock, Eye, Loader2, 
  AlertTriangle, User, Phone, Mail, Calendar, FileText, CheckCircle, X,
  GraduationCap, Heart, Users, Download, Paperclip
} from 'lucide-react';
import Modal from '@/app/components/modal'; 

// --- INTERFACES ---
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

// Ringkasan untuk Tabel
interface ApplicantSummary {
    id: number;
    nama: string;
    email: string;
    no_whatsapp: string;
    created_at: string;
    status: string;
    job_id: number;
}

// Detail Lengkap untuk Modal
interface CandidateDetail {
    id: number;
    nama: string;
    email: string;
    no_whatsapp: string;
    tempat_lahir: string;
    tanggal_lahir: string;
    agama: string;
    status_pernikahan: string;
    alamat: string;
    
    // Relasi Keluarga
    spouse?: { nama: string; no_hp: string; children_count: number; tempat_lahir: string; tanggal_lahir: string } | null;
    parents?: { 
        nama_ayah: string; pekerjaan_ayah: string; nohp_ayah: string;
        nama_ibu: string; pekerjaan_ibu: string; nohp_ibu: string;
    } | null;
    siblings?: { nama: string; gender: string; umur: number; hubungan: string; pekerjaan: string }[];
    
    // Riwayat
    education: {
        formal: { nama_sekolah: string; tahun_masuk: number; tahun_lulus: number; nomor_ijazah: string; ipk?: string }[];
        nonFormal: { nama_lembaga: string; tahun_masuk: number; tahun_selesai: number; nomor_sertifikat: string }[];
    };
    experience: { 
        nama_instansi: string; jabatan_terakhir: string; lama_kerja: string; 
        tahun_mulai: number; tahun_selesai: number; alasan_berhenti: string;
        lokasi: string;
    }[];
    
    // Dokumen
    documents: Record<string, string | null> | null;
    otherDocuments?: { id: number; nama_dokumen: string; file_url: string }[];
    
    // Meta
    application: { status: string; appliedAt: string; jobTitle: string };
}

// Helper Component untuk Badge
const Badge = ({ label, color = "slate", icon: Icon }: { label: string; color?: string; icon?: any }) => (
    <span className={`px-2.5 py-1 bg-${color}-50 text-${color}-700 text-xs font-semibold rounded-md border border-${color}-200 flex items-center gap-1`}>
        {Icon && <Icon size={12} />} {label}
    </span>
);

export default function DetailLowonganPage() {
    const params = useParams();
    const slug = params.slug as string; // ID Job Opening
    
    const [job, setJob] = useState<JobDetail | null>(null);
    const [applicants, setApplicants] = useState<ApplicantSummary[]>([]);
    
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    
    // State Modal Detail
    const [selectedCandidateId, setSelectedCandidateId] = useState<number | null>(null);
    const [candidateDetail, setCandidateDetail] = useState<CandidateDetail | null>(null);
    const [isLoadingDetail, setIsLoadingDetail] = useState(false);

    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "";

    // 1. Fetch Data Awal
    useEffect(() => {
        if (!slug) return;
        
        const fetchData = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const jobRes = await fetch(`${baseUrl}/job-openings/${slug}`);
                if (!jobRes.ok) throw new Error("Lowongan tidak ditemukan.");
                const jobData = await jobRes.json();
                setJob(jobData);

                const applicantsRes = await fetch(`${baseUrl}/apply`);
                if (applicantsRes.ok) {
                    const allApplicants: ApplicantSummary[] = await applicantsRes.json();
                    const filtered = allApplicants.filter(a => a.job_id === parseInt(slug));
                    setApplicants(filtered);
                }

            } catch (err) {
                setError(err instanceof Error ? err.message : "Terjadi kesalahan");
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, [slug, baseUrl]);

    // 2. Fetch Detail Kandidat
    const handleViewCandidate = async (candidateId: number) => {
        setSelectedCandidateId(candidateId);
        setIsLoadingDetail(true);
        setCandidateDetail(null);
        
        try {
            const res = await fetch(`${baseUrl}/apply/${candidateId}`);
            if (!res.ok) throw new Error("Gagal mengambil detail kandidat");
            const data = await res.json();
            setCandidateDetail(data);
        } catch (err) {
            console.error(err);
            alert("Gagal memuat detail kandidat");
            setSelectedCandidateId(null);
        } finally {
            setIsLoadingDetail(false);
        }
    };

    const closeModal = () => {
        setSelectedCandidateId(null);
        setCandidateDetail(null);
    };

    const getStatusClass = (status: string) => {
        const s = status?.toLowerCase() || '';
        if (s === 'submitted') return 'bg-blue-100 text-blue-800';
        if (s === 'screening') return 'bg-yellow-100 text-yellow-800';
        if (s === 'interview') return 'bg-purple-100 text-purple-800';
        if (s === 'accepted') return 'bg-green-100 text-green-800';
        if (s === 'rejected') return 'bg-red-100 text-red-800';
        return 'bg-slate-100 text-slate-800';
    };

    if (isLoading) {
        return <div className="p-12 text-center flex justify-center"><Loader2 className="animate-spin h-8 w-8 text-primary" /></div>;
    }

    if (error || !job) {
        return (
            <div className="p-8 text-center">
                <h1 className="text-2xl font-bold text-red-600">{error || "Lowongan tidak ditemukan"}</h1>
                <Link href="/admin/lowongan" className="text-primary hover:underline mt-4 inline-block">Kembali</Link>
            </div>
        );
    }

    return (
        <div className="p-8">
            <div className="mb-6">
                <Link href="/admin/lowongan" className="inline-flex items-center gap-2 text-slate-500 hover:text-primary transition-colors font-medium">
                    <ChevronLeft size={20} /> Kembali ke Daftar Lowongan
                </Link>
            </div>

            {/* HEADER LOWONGAN & DESKRIPSI */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 mb-8">
                {/* Top Header Section */}
                <div className="flex flex-col md:flex-row justify-between items-start gap-6 border-b border-slate-100 pb-6 mb-6">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <span className={`px-2.5 py-0.5 text-xs font-bold uppercase rounded-full ${job.category === 'Medis' ? 'bg-blue-50 text-blue-600' : 'bg-green-50 text-green-600'}`}>
                                {job.category}
                            </span>
                            <span className={`px-2.5 py-0.5 text-xs font-bold uppercase rounded-full bg-slate-100 text-slate-600`}>
                                {job.status}
                            </span>
                        </div>
                        <h1 className="text-3xl font-bold text-slate-800">{job.title}</h1>
                        <p className="text-slate-500 text-sm mt-1">Diposting pada: {job.posted_date ? new Date(job.posted_date).toLocaleDateString('id-ID') : '-'}</p>
                    </div>
                    <div className="flex flex-col gap-2 text-right">
                        <div className="text-3xl font-bold text-primary">{applicants.length}</div>
                        <div className="text-sm text-slate-500 font-medium">Total Pelamar</div>
                    </div>
                </div>

                {/* Detail Deskripsi & Kualifikasi (DIKEMBALIKAN) */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 text-sm text-slate-600">
                    <div>
                        <h3 className="font-bold text-slate-800 mb-3 flex items-center gap-2">
                            <Briefcase size={16} className="text-slate-400" /> Deskripsi Pekerjaan
                        </h3>
                        <div className="space-y-2 leading-relaxed bg-slate-50 p-4 rounded-lg border border-slate-100">
                           {Array.isArray(job.deskripsi_job) ? job.deskripsi_job.map((p, i) => <p key={i}>• {p}</p>) : <p>{job.deskripsi_job}</p>}
                        </div>
                    </div>
                    <div>
                        <h3 className="font-bold text-slate-800 mb-3 flex items-center gap-2">
                            <CheckCircle size={16} className="text-slate-400" /> Kualifikasi
                        </h3>
                        <div className="space-y-2 leading-relaxed bg-slate-50 p-4 rounded-lg border border-slate-100">
                           {Array.isArray(job.kualifikasi_job) ? job.kualifikasi_job.map((q, i) => <p key={i}>• {q}</p>) : <p>{job.kualifikasi_job}</p>}
                        </div>
                    </div>
                </div>
            </div>

            {/* TABEL PELAMAR */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
                    <h2 className="text-lg font-bold text-slate-800">Kandidat Pelamar</h2>
                </div>
                
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="text-xs text-white uppercase bg-primary-dark">
                            <tr>
                                <th scope="col" className="px-6 py-3 font-semibold">Nama Kandidat</th>
                                <th scope="col" className="px-6 py-3 font-semibold">Kontak</th>
                                <th scope="col" className="px-6 py-3 font-semibold">Tanggal Apply</th>
                                <th scope="col" className="px-6 py-3 font-semibold">Status</th>
                                <th scope="col" className="px-6 py-3 text-center font-semibold">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {applicants.length > 0 ? (
                                applicants.map((applicant) => (
                                    <tr key={applicant.id} className="hover:bg-slate-50 transition-colors bg-white">
                                        <td className="px-6 py-4">
                                            <div className="font-bold text-slate-800">{applicant.nama}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-slate-600">{applicant.email}</div>
                                            <div className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                                                <Phone size={10}/> {applicant.no_whatsapp}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-slate-600">
                                            {new Date(applicant.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2.5 py-1 text-[10px] font-bold rounded-full uppercase tracking-wider ${getStatusClass(applicant.status)}`}>
                                                {applicant.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <button 
                                                onClick={() => handleViewCandidate(applicant.id)} 
                                                className="inline-flex items-center gap-1.5 text-primary hover:text-white border border-primary hover:bg-primary px-3 py-1.5 rounded-lg transition-all font-medium text-xs"
                                            >
                                                <Eye size={14} /> Detail
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={5} className="text-center py-16 bg-slate-50">
                                        <div className="flex flex-col items-center justify-center text-slate-400">
                                            <Users className="h-10 w-10 mb-2 opacity-50" />
                                            <p>Belum ada kandidat yang melamar.</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* MODAL DETAIL KANDIDAT LENGKAP */}
            <Modal isOpen={!!selectedCandidateId} onClose={closeModal} title="Profil Lengkap Kandidat" size="5xl">
                {isLoadingDetail ? (
                    <div className="p-20 text-center"><Loader2 className="animate-spin h-10 w-10 text-primary mx-auto" /></div>
                ) : candidateDetail ? (
                    <div className="flex flex-col h-[75vh]">
                        <div className="flex-1 overflow-y-auto custom-scrollbar pr-2">
                            
                            {/* 1. HEADER PROFIL */}
                            <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 mb-6 flex items-start gap-6">
                                <div className="w-24 h-24 bg-white rounded-lg flex items-center justify-center text-slate-300 shadow-sm border border-slate-200 shrink-0 overflow-hidden relative">
                                    {candidateDetail.documents && (candidateDetail.documents as any).pas_foto_url ? (
                                        <img src={(candidateDetail.documents as any).pas_foto_url} alt="Foto" className="w-full h-full object-cover" />
                                    ) : <User size={40} />}
                                </div>
                                <div className="flex-1">
                                    <h2 className="text-2xl font-bold text-slate-800">{candidateDetail.nama}</h2>
                                    <div className="flex flex-wrap gap-x-6 gap-y-2 mt-2 text-sm text-slate-600">
                                        <span className="flex items-center gap-1.5"><Mail size={14} className="text-slate-400"/> {candidateDetail.email}</span>
                                        <span className="flex items-center gap-1.5"><Phone size={14} className="text-slate-400"/> {candidateDetail.no_whatsapp}</span>
                                        <span className="flex items-center gap-1.5"><MapPin size={14} className="text-slate-400"/> {candidateDetail.alamat}</span>
                                    </div>
                                    <div className="mt-4 flex flex-wrap gap-2">
                                        <Badge label={candidateDetail.agama} icon={Heart} />
                                        <Badge label={candidateDetail.status_pernikahan} icon={Users} />
                                        <Badge label={`${candidateDetail.tempat_lahir}, ${new Date(candidateDetail.tanggal_lahir).toLocaleDateString('id-ID')}`} icon={Calendar} />
                                        <Badge label={`${new Date().getFullYear() - new Date(candidateDetail.tanggal_lahir).getFullYear()} Tahun`} color="blue" />
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                                
                                {/* KIRI: RIWAYAT */}
                                <div className="space-y-6">
                                    {/* Pengalaman Kerja */}
                                    <div className="border border-slate-200 rounded-xl overflow-hidden">
                                        <div className="bg-slate-50 px-4 py-3 border-b border-slate-200 font-bold text-slate-700 flex items-center gap-2">
                                            <Briefcase size={16} className="text-primary"/> Pengalaman Kerja
                                        </div>
                                        <div className="p-4 space-y-4">
                                            {candidateDetail.experience.length > 0 ? candidateDetail.experience.map((exp, i) => (
                                                <div key={i} className="relative pl-4 border-l-2 border-slate-200 pb-2 last:pb-0">
                                                    <div className="absolute -left-[5px] top-1.5 w-2.5 h-2.5 rounded-full bg-slate-300"></div>
                                                    <div className="font-bold text-slate-800 text-sm">{exp.jabatan_terakhir}</div>
                                                    <div className="text-xs font-semibold text-primary">{exp.nama_instansi} <span className="text-slate-400 font-normal">• {exp.lokasi}</span></div>
                                                    <div className="text-xs text-slate-500 mt-0.5">{exp.tahun_mulai} - {exp.tahun_selesai} ({exp.lama_kerja})</div>
                                                    {exp.alasan_berhenti && <div className="text-xs text-slate-500 italic mt-1 bg-slate-50 p-2 rounded">"{exp.alasan_berhenti}"</div>}
                                                </div>
                                            )) : <div className="text-slate-400 text-sm italic text-center py-2">Tidak ada data pengalaman.</div>}
                                        </div>
                                    </div>

                                    {/* Pendidikan */}
                                    <div className="border border-slate-200 rounded-xl overflow-hidden">
                                        <div className="bg-slate-50 px-4 py-3 border-b border-slate-200 font-bold text-slate-700 flex items-center gap-2">
                                            <GraduationCap size={16} className="text-primary"/> Pendidikan
                                        </div>
                                        <div className="p-4 space-y-4">
                                            {candidateDetail.education.formal.length > 0 ? candidateDetail.education.formal.map((edu, i) => (
                                                <div key={i} className="relative pl-4 border-l-2 border-blue-200 pb-2 last:pb-0">
                                                    <div className="absolute -left-[5px] top-1.5 w-2.5 h-2.5 rounded-full bg-blue-500"></div>
                                                    <div className="font-bold text-slate-800 text-sm">{edu.nama_sekolah}</div>
                                                    <div className="text-xs text-slate-500 mt-0.5">
                                                        {edu.tahun_masuk} - {edu.tahun_lulus}
                                                        {edu.ipk && <span className="ml-2 font-bold text-blue-600 bg-blue-50 px-1.5 rounded border border-blue-100">IPK: {edu.ipk}</span>}
                                                    </div>
                                                    <div className="text-[10px] text-slate-400 mt-0.5">No. Ijazah: {edu.nomor_ijazah}</div>
                                                </div>
                                            )) : <div className="text-slate-400 text-sm italic text-center py-2">Tidak ada data pendidikan.</div>}

                                            {candidateDetail.education.nonFormal.length > 0 && (
                                                <div className="mt-4 pt-4 border-t border-slate-100">
                                                    <p className="text-xs font-bold text-slate-400 uppercase mb-2">Non-Formal</p>
                                                    {candidateDetail.education.nonFormal.map((edu, i) => (
                                                        <div key={i} className="text-xs text-slate-600 mb-1 flex justify-between">
                                                            <span>• {edu.nama_lembaga}</span>
                                                            <span className="text-slate-400">{edu.tahun_masuk} - {edu.tahun_selesai}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* KANAN: KELUARGA & DOKUMEN */}
                                <div className="space-y-6">
                                    
                                    {/* Data Keluarga */}
                                    <div className="border border-slate-200 rounded-xl overflow-hidden">
                                        <div className="bg-slate-50 px-4 py-3 border-b border-slate-200 font-bold text-slate-700 flex items-center gap-2">
                                            <Users size={16} className="text-primary"/> Data Keluarga
                                        </div>
                                        <div className="p-4 space-y-4 text-sm">
                                            {candidateDetail.spouse && (
                                                <div className="bg-blue-50 p-3 rounded-lg border border-blue-100">
                                                    <span className="font-bold text-blue-800 text-xs uppercase block mb-1">Pasangan</span>
                                                    <div className="flex justify-between">
                                                        <span className="font-medium">{candidateDetail.spouse.nama}</span>
                                                        <span className="text-slate-500 text-xs">{candidateDetail.spouse.no_hp}</span>
                                                    </div>
                                                    <div className="text-xs text-slate-500 mt-1 flex justify-between">
                                                        <span>Lahir: {candidateDetail.spouse.tempat_lahir}, {new Date(candidateDetail.spouse.tanggal_lahir).toLocaleDateString()}</span>
                                                        <span>Anak: {candidateDetail.spouse.children_count}</span>
                                                    </div>
                                                </div>
                                            )}
                                            
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                                                    <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Ayah</span>
                                                    <p className="font-medium text-slate-700 text-xs truncate" title={candidateDetail.parents?.nama_ayah}>{candidateDetail.parents?.nama_ayah || '-'}</p>
                                                    <p className="text-[10px] text-slate-500 truncate">{candidateDetail.parents?.pekerjaan_ayah}</p>
                                                    <p className="text-[10px] text-slate-400">{candidateDetail.parents?.nohp_ayah}</p>
                                                </div>
                                                <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                                                    <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Ibu</span>
                                                    <p className="font-medium text-slate-700 text-xs truncate" title={candidateDetail.parents?.nama_ibu}>{candidateDetail.parents?.nama_ibu || '-'}</p>
                                                    <p className="text-[10px] text-slate-500 truncate">{candidateDetail.parents?.pekerjaan_ibu}</p>
                                                    <p className="text-[10px] text-slate-400">{candidateDetail.parents?.nohp_ibu}</p>
                                                </div>
                                            </div>

                                            {candidateDetail.siblings && candidateDetail.siblings.length > 0 && (
                                                <div className="mt-2 pt-2 border-t border-slate-100">
                                                    <span className="text-xs font-bold text-slate-400 uppercase block mb-2">Saudara Kandung</span>
                                                    <div className="space-y-1 max-h-32 overflow-y-auto custom-scrollbar pr-1">
                                                        {candidateDetail.siblings.map((s, i) => (
                                                            <div key={i} className="text-xs text-slate-600 flex justify-between items-center bg-slate-50 p-1.5 rounded">
                                                                <span className="font-medium">{s.nama} ({s.hubungan})</span>
                                                                <span className="text-slate-400 text-[10px]">{s.pekerjaan}</span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Dokumen */}
                                    <div className="border border-slate-200 rounded-xl overflow-hidden">
                                        <div className="bg-slate-50 px-4 py-3 border-b border-slate-200 font-bold text-slate-700 flex items-center gap-2">
                                            <FileText size={16} className="text-primary"/> Berkas Lamaran
                                        </div>
                                        <div className="p-4 grid grid-cols-1 gap-2">
                                            {/* Main Documents */}
                                            {candidateDetail.documents && Object.entries(candidateDetail.documents).map(([key, url]) => {
                                                if (!url || key.includes('id') || key.includes('candidate')) return null;
                                                const label = key.replace('_url', '').toUpperCase().replace('_', ' ');
                                                return (
                                                    <a key={key} href={url as string} target="_blank" rel="noreferrer" className="flex items-center justify-between p-2.5 rounded-lg bg-white border border-slate-200 hover:border-primary hover:bg-primary/5 transition-colors group shadow-sm">
                                                        <div className="flex items-center gap-3 overflow-hidden">
                                                            <div className="bg-slate-100 p-1.5 rounded text-slate-500 group-hover:text-primary transition-colors"><FileText size={16}/></div>
                                                            <span className="text-xs font-bold text-slate-700 truncate">{label}</span>
                                                        </div>
                                                        <Download size={14} className="text-slate-400 group-hover:text-primary shrink-0"/>
                                                    </a>
                                                )
                                            })}
                                            
                                            {/* Other Documents */}
                                            {candidateDetail.otherDocuments && candidateDetail.otherDocuments.length > 0 && (
                                                <>
                                                    <div className="text-[10px] font-bold text-slate-400 uppercase mt-2 mb-1 pl-1">Tambahan</div>
                                                    {candidateDetail.otherDocuments.map((doc, i) => (
                                                        <a key={i} href={doc.file_url} target="_blank" rel="noreferrer" className="flex items-center justify-between p-2.5 rounded-lg bg-blue-50 border border-blue-100 hover:bg-blue-100 transition-colors group shadow-sm">
                                                            <div className="flex items-center gap-3 overflow-hidden">
                                                                <Paperclip size={16} className="text-blue-500 shrink-0"/>
                                                                <span className="text-xs font-bold text-blue-700 truncate">{doc.nama_dokumen}</span>
                                                            </div>
                                                            <Download size={14} className="text-blue-500 shrink-0"/>
                                                        </a>
                                                    ))}
                                                </>
                                            )}

                                            {!candidateDetail.documents && (!candidateDetail.otherDocuments || candidateDetail.otherDocuments.length === 0) && 
                                                <p className="text-slate-400 text-sm italic text-center py-4">Tidak ada dokumen dilampirkan.</p>
                                            }
                                        </div>
                                    </div>

                                </div>
                            </div>
                        </div>

                        {/* Footer Modal */}
                        <div className="pt-4 mt-4 border-t border-slate-100 flex justify-between items-center bg-white shrink-0">
                            <div className="text-xs text-slate-500">
                                Melamar pada: {new Date(candidateDetail.application.appliedAt).toLocaleString('id-ID')}
                            </div>
                            <div className="flex gap-3">
                                <button onClick={closeModal} className="px-5 py-2 rounded-lg border border-slate-200 text-slate-600 font-bold hover:bg-slate-50 transition-colors text-sm">Tutup</button>
                                <button onClick={()=>alert("Fitur update status coming soon")} className="px-6 py-2 rounded-lg bg-primary text-white font-bold hover:bg-primary-dark transition-colors text-sm shadow-lg shadow-primary/20">Proses Lamaran</button>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="p-12 text-center text-red-500">Gagal memuat data kandidat.</div>
                )}
            </Modal>
        </div>
    );
}