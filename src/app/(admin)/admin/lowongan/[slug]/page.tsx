// File: src/app/(admin)/admin/lowongan/[slug]/page.tsx
"use client";

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
    ChevronLeft, Briefcase, MapPin, Clock, Eye, Loader2,
    AlertTriangle, User, Phone, Mail, Calendar, FileText, CheckCircle, X
} from 'lucide-react';
import Modal from '@/app/components/modal'; // Pastikan komponen Modal sudah ada (seperti di halaman request)

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

interface ApplicantSummary {
    id: number;
    nama: string;
    email: string;
    no_whatsapp: string;
    created_at: string;
    status: string;
    job_id: number;
}

// Interface untuk Detail Lengkap Kandidat (dari API /api/apply/[id])
interface CandidateDetail {
    nama: string;
    email: string;
    no_whatsapp: string;
    tempat_lahir: string;
    tanggal_lahir: string;
    agama: string;
    status_pernikahan: string;
    alamat: string;
    spouse?: { nama: string; no_hp: string } | null;
    education: {
        formal: { nama_sekolah: string; tahun_masuk: number; tahun_lulus: number }[];
        nonFormal: { nama_lembaga: string }[];
    };
    experience: { nama_instansi: string; jabatan_terakhir: string; lama_kerja: string }[];
    documents: { cv_url: string; pas_foto_url: string; ijazah_url: string } | null;
    application: { status: string; appliedAt: string };
}

export default function DetailLowonganPage() {
    const params = useParams();
    const slug = params.slug as string; // Ini adalah ID Job Opening

    const [job, setJob] = useState<JobDetail | null>(null);
    const [applicants, setApplicants] = useState<ApplicantSummary[]>([]);

    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // State untuk Modal Detail Kandidat
    const [selectedCandidateId, setSelectedCandidateId] = useState<number | null>(null);
    const [candidateDetail, setCandidateDetail] = useState<CandidateDetail | null>(null);
    const [isLoadingDetail, setIsLoadingDetail] = useState(false);

    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "";

    // 1. Fetch Job & List Applicants
    useEffect(() => {
        if (!slug) return;

        const fetchData = async () => {
            setIsLoading(true);
            setError(null);
            try {
                // A. Ambil Detail Lowongan
                const jobRes = await fetch(`${baseUrl}/job-openings/${slug}`);
                if (!jobRes.ok) throw new Error("Lowongan tidak ditemukan.");
                const jobData = await jobRes.json();
                setJob(jobData);

                // B. Ambil List Semua Pelamar (Lalu filter di client untuk job ini)
                // Note: Idealnya API support filter ?job_id=... tapi untuk skrg kita filter manual
                const applicantsRes = await fetch(`${baseUrl}/apply`);
                if (applicantsRes.ok) {
                    const allApplicants: ApplicantSummary[] = await applicantsRes.json();
                    // Filter pelamar yang job_id nya sesuai dengan halaman ini
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

    // 2. Fetch Detail Kandidat saat tombol mata diklik
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
        switch (status.toLowerCase()) {
            case 'submitted': return 'bg-blue-100 text-blue-800';
            case 'screening': return 'bg-yellow-100 text-yellow-800';
            case 'interview': return 'bg-purple-100 text-purple-800';
            case 'accepted': return 'bg-green-100 text-green-800';
            case 'rejected': return 'bg-red-100 text-red-800';
            default: return 'bg-slate-100 text-slate-800';
        }
    };

    if (isLoading) {
        return <div className="p-8 text-center flex justify-center"><Loader2 className="animate-spin h-8 w-8 text-primary" /></div>;
    }

    if (error || !job) {
        return (
            <div className="p-8 text-center">
                <h1 className="text-2xl font-bold text-red-600">{error || "Lowongan tidak ditemukan"}</h1>
                <Link href="/admin/lowongan" className="text-primary hover:underline mt-4 inline-block">
                    <span className="flex items-center gap-2"><ChevronLeft size={20} />Kembali</span>
                </Link>
            </div>
        );
    }

    return (
        <div className="p-8">
            <div>
                <Link href="/admin/lowongan" className="inline-flex items-center gap-2 text-primary hover:text-primary-dark transition-colors mb-6 font-medium">
                    <ChevronLeft size={20} />
                    Kembali ke Daftar Lowongan
                </Link>
            </div>

            {/* HEADER LOWONGAN */}
            <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-200 mb-8">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-100 pb-6 mb-6">
                    <div>
                        <span className={`px-3 py-1 text-xs font-bold uppercase rounded-full mb-3 inline-block ${job.category === 'Medis' ? 'bg-blue-50 text-blue-600' : 'bg-green-50 text-green-600'}`}>
                            {job.category}
                        </span>
                        <h1 className="text-3xl font-bold text-slate-800">{job.title}</h1>
                    </div>
                    <div className="flex gap-4 text-sm font-medium">
                        <div className="px-4 py-2 bg-slate-50 rounded-lg text-slate-600 border border-slate-100">
                            Status: <span className="text-slate-900">{job.status}</span>
                        </div>
                        <div className="px-4 py-2 bg-slate-50 rounded-lg text-slate-600 border border-slate-100">
                            Diposting: <span className="text-slate-900">{job.posted_date ? new Date(job.posted_date).toLocaleDateString('id-ID') : '-'}</span>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 text-sm text-slate-600">
                    <div>
                        <h3 className="font-bold text-slate-800 mb-2">Deskripsi</h3>
                        <div className="space-y-1">
                            {Array.isArray(job.deskripsi_job) ? job.deskripsi_job.map((p, i) => <p key={i}>• {p}</p>) : <p>{job.deskripsi_job}</p>}
                        </div>
                    </div>
                    <div>
                        <h3 className="font-bold text-slate-800 mb-2">Kualifikasi</h3>
                        <div className="space-y-1">
                            {Array.isArray(job.kualifikasi_job) ? job.kualifikasi_job.map((q, i) => <p key={i}>• {q}</p>) : <p>{job.kualifikasi_job}</p>}
                        </div>
                    </div>
                </div>
            </div>

            {/* TABEL PELAMAR */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-200 bg-white flex justify-between items-center">
                    <h2 className="text-lg font-bold text-slate-800">Kandidat Pelamar <span className="ml-2 bg-slate-100 px-2 py-0.5 rounded-full text-xs border border-slate-200 text-slate-600">{applicants.length}</span></h2>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="text-xs text-white uppercase bg-primary-dark">
                            <tr>
                                <th scope="col" className="px-6 py-3 font-semibold">Nama Kandidat</th>
                                <th scope="col" className="px-6 py-3 font-semibold">Kontak</th>
                                <th scope="col" className="px-6 py-3 font-semibold">Tanggal Melamar</th>
                                <th scope="col" className="px-6 py-3 font-semibold">Status</th>
                                <th scope="col" className="px-6 py-3 text-center font-semibold">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {applicants.length > 0 ? (
                                applicants.map((applicant) => (
                                    <tr key={applicant.id} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="font-bold text-slate-800">{applicant.nama}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-slate-600">{applicant.email}</div>
                                            <div className="text-xs text-slate-400">{applicant.no_whatsapp}</div>
                                        </td>
                                        <td className="px-6 py-4 text-slate-600">
                                            {new Date(applicant.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2.5 py-1 text-xs font-bold rounded-full uppercase tracking-wider ${getStatusClass(applicant.status)}`}>
                                                {applicant.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <button
                                                onClick={() => handleViewCandidate(applicant.id)}
                                                className="inline-flex items-center gap-1 text-primary hover:text-primary-dark hover:bg-primary/5 px-3 py-1.5 rounded-lg transition-colors font-medium text-xs"
                                                title="Lihat Detail Lengkap"
                                            >
                                                <Eye size={16} /> Detail
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={5} className="text-center py-12">
                                        <div className="flex flex-col items-center justify-center text-slate-400">
                                            <User className="h-10 w-10 mb-2 opacity-50" />
                                            <p>Belum ada kandidat yang melamar untuk posisi ini.</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* MODAL DETAIL KANDIDAT */}
            <Modal isOpen={!!selectedCandidateId} onClose={closeModal} title="Detail Kandidat Pelamar" size="4xl">
                {isLoadingDetail ? (
                    <div className="p-12 text-center"><Loader2 className="animate-spin h-8 w-8 text-primary mx-auto" /></div>
                ) : candidateDetail ? (
                    <div className="space-y-8">
                        {/* Header Profil */}
                        <div className="flex items-start gap-6 pb-6 border-b border-slate-100">
                            <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center text-slate-400 shrink-0">
                                <User size={40} />
                            </div>
                            <div className="flex-1">
                                <h2 className="text-2xl font-bold text-slate-800">{candidateDetail.nama}</h2>
                                <div className="flex flex-wrap gap-4 mt-2 text-sm text-slate-600">
                                    <span className="flex items-center gap-1"><Mail size={14} /> {candidateDetail.email}</span>
                                    <span className="flex items-center gap-1"><Phone size={14} /> {candidateDetail.no_whatsapp}</span>
                                    <span className="flex items-center gap-1"><MapPin size={14} /> {candidateDetail.alamat}</span>
                                </div>
                                <div className="mt-4 flex gap-2">
                                    <span className="px-3 py-1 bg-slate-100 text-slate-600 text-xs font-bold rounded-full">{candidateDetail.agama}</span>
                                    <span className="px-3 py-1 bg-slate-100 text-slate-600 text-xs font-bold rounded-full">{candidateDetail.status_pernikahan}</span>
                                    <span className="px-3 py-1 bg-slate-100 text-slate-600 text-xs font-bold rounded-full">{candidateDetail.tempat_lahir}, {new Date(candidateDetail.tanggal_lahir).toLocaleDateString()}</span>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            {/* Kiri: Pendidikan & Pengalaman */}
                            <div className="space-y-6">
                                <div>
                                    <h3 className="font-bold text-slate-800 mb-3 flex items-center gap-2"><Briefcase size={18} className="text-primary" /> Pengalaman Kerja</h3>
                                    <ul className="space-y-3">
                                        {candidateDetail.experience.length > 0 ? candidateDetail.experience.map((exp: any, i: number) => (
                                            <li key={i} className="bg-slate-50 p-3 rounded-lg text-sm border border-slate-100">
                                                <div className="font-bold text-slate-800">{exp.jabatan_terakhir}</div>
                                                <div className="text-slate-600">{exp.nama_instansi}</div>
                                                <div className="text-xs text-slate-400 mt-1">{exp.lama_kerja}</div>
                                            </li>
                                        )) : <li className="text-slate-400 text-sm italic">Tidak ada data pengalaman.</li>}
                                    </ul>
                                </div>

                                <div>
                                    <h3 className="font-bold text-slate-800 mb-3 flex items-center gap-2"><Clock size={18} className="text-primary" /> Pendidikan Terakhir</h3>
                                    <ul className="space-y-3">
                                        {candidateDetail.education.formal.length > 0 ? candidateDetail.education.formal.map((edu: any, i: number) => (
                                            <li key={i} className="bg-slate-50 p-3 rounded-lg text-sm border border-slate-100">
                                                <div className="font-bold text-slate-800">{edu.nama_sekolah}</div>
                                                <div className="text-xs text-slate-500">{edu.tahun_masuk} - {edu.tahun_lulus}</div>
                                            </li>
                                        )) : <li className="text-slate-400 text-sm italic">Tidak ada data pendidikan.</li>}
                                    </ul>
                                </div>
                            </div>

                            {/* Kanan: Dokumen */}
                            <div>
                                <h3 className="font-bold text-slate-800 mb-3 flex items-center gap-2"><FileText size={18} className="text-primary" /> Dokumen Lampiran</h3>
                                <div className="grid grid-cols-1 gap-3">
                                    {candidateDetail.documents && Object.entries(candidateDetail.documents).map(([key, url]) => {
                                        if (key === 'id' || key === 'candidate_id' || !url) return null;
                                        // Bersihkan nama key (misal: cv_url -> CV)
                                        const label = key.replace('_url', '').toUpperCase().replace('_', ' ');
                                        return (
                                            <a
                                                key={key}
                                                href={url as string}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex items-center justify-between p-3 rounded-lg border border-slate-200 hover:border-primary hover:bg-primary/5 transition-colors group"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div className="bg-slate-100 p-2 rounded text-slate-500 group-hover:text-primary transition-colors">
                                                        <FileText size={18} />
                                                    </div>
                                                    <span className="font-medium text-sm text-slate-700">{label}</span>
                                                </div>
                                                <span className="text-xs text-primary font-bold">Lihat</span>
                                            </a>
                                        )
                                    })}
                                    {!candidateDetail.documents && <p className="text-slate-400 text-sm italic">Tidak ada dokumen.</p>}
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-end pt-6 border-t gap-3">
                            <button onClick={closeModal} className="px-4 py-2 rounded-lg border text-slate-600 font-bold hover:bg-slate-50">Tutup</button>
                            <button onClick={() => alert("Fitur update status akan datang")} className="px-6 py-2 rounded-lg bg-primary text-white font-bold hover:bg-primary-dark">Proses Lamaran</button>
                        </div>
                    </div>
                ) : (
                    <div className="p-8 text-center text-red-500">Gagal memuat data kandidat.</div>
                )}
            </Modal>
        </div>
    );
}