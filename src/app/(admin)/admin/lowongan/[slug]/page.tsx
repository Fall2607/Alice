// File: app/(admin)/admin/lowongan/[slug]/page.tsx
"use client";

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ChevronLeft, Briefcase, MapPin, Clock, Eye, Loader2, AlertTriangle } from 'lucide-react';
// Asumsi ada data pelamar statis untuk saat ini
import { applicants } from '@/app/data/careers';

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

interface Applicant {
    id: number;
    name: string;
    email: string;
    appliedDate: string;
    status: string;
}

export default function DetailLowonganPage() {
    const params = useParams();
    const slug = params.slug as string;
    const [job, setJob] = useState<JobDetail | null>(null);
    const [jobApplicants, setJobApplicants] = useState<Applicant[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "";

    useEffect(() => {
        if (!slug) return;

        const fetchData = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const res = await fetch(`${baseUrl}/job-openings/${slug}`);
                if (!res.ok) throw new Error("Lowongan tidak ditemukan.");
                const data = await res.json();
                setJob(data);

                // TODO: Ganti ini dengan fetch ke API pelamar
                const filteredApplicants = applicants.filter(a => a.jobId.toString() === slug);
                setJobApplicants(filteredApplicants);

            } catch (err) {
                setError(err instanceof Error ? err.message : "Terjadi kesalahan");
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, [slug, baseUrl]);


    const getStatusClass = (status: string) => {
        switch (status) {
            case 'Baru': return 'bg-blue-100 text-blue-800';
            case 'Ditinjau': return 'bg-yellow-100 text-yellow-800';
            case 'Wawancara': return 'bg-green-100 text-green-800';
            case 'Ditolak': return 'bg-red-100 text-red-800';
            default: return 'bg-slate-100 text-slate-800';
        }
    };

    if (isLoading) {
        return <div className="p-8 text-center"><Loader2 className="animate-spin h-8 w-8 text-primary mx-auto" /></div>;
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
                <Link href="/admin/lowongan" className="inline-flex items-center gap-2 text-primary hover:text-primary-dark transition-colors mb-6">
                    <ChevronLeft size={20} />
                    Kembali ke Daftar Lowongan
                </Link>
            </div>

            <div className="bg-white p-8 rounded-lg shadow-md">
                <div className="border-b pb-4">
                    <span className={`px-3 py-1 text-sm font-medium rounded-full mb-4 inline-block ${job.category === 'Medis' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'}`}>
                        {job.category}
                    </span>
                    <h1 className="text-4xl font-bold text-primary-dark mb-2">{job.title}</h1>
                    <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-slate-500">
                        <div className="flex items-center gap-2"><Briefcase size={16} /><span>{job.status}</span></div>
                        <div className="flex items-center gap-2"><MapPin size={16} /><span>Bandung, Jawa Barat</span></div>
                        <div className="flex items-center gap-2"><Clock size={16} />
                            <span>Diposting pada: {job.posted_date ? new Date(job.posted_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : 'Belum diposting'}</span>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 my-6">
                    <div>
                        <h2 className="text-xl font-semibold text-primary-dark border-b pb-2 mb-4">Deskripsi Pekerjaan</h2>
                        <div className="text-slate-600 text-sm leading-relaxed space-y-2">
                            {/* API mengembalikan deskripsi_job sebagai array, jadi kita map */}
                            {Array.isArray(job.deskripsi_job) ? job.deskripsi_job.map((p, i) => <p key={i}>{p}</p>) : <p>{job.deskripsi_job}</p>}
                        </div>
                    </div>
                    <div>
                        <h2 className="text-xl font-semibold text-primary-dark border-b pb-2 mb-4">Kualifikasi</h2>
                        <ul className="list-disc list-inside space-y-2 text-slate-600 text-sm">
                            {Array.isArray(job.kualifikasi_job) ? job.kualifikasi_job.map((q, i) => <li key={i}>{q}</li>) : <li>{job.kualifikasi_job}</li>}
                        </ul>
                    </div>
                </div>

                <div className="border-t pt-6">
                    <h2 className="text-2xl font-bold text-primary-dark mb-4">Kandidat yang Melamar ({jobApplicants.length})</h2>
                    <div className="overflow-x-auto rounded-lg border">
                        <table className="w-full text-sm text-left text-slate-500">
                            <thead className="text-xs text-white uppercase bg-primary-dark">
                                <tr>
                                    <th scope="col" className="px-6 py-3">Nama Kandidat</th>
                                    <th scope="col" className="px-6 py-3">Tanggal Melamar</th>
                                    <th scope="col" className="px-6 py-3">Status</th>
                                    <th scope="col" className="px-6 py-3 text-center">Aksi</th>
                                </tr>
                            </thead>
                            <tbody>
                                {jobApplicants.length > 0 ? (
                                    jobApplicants.map((applicant) => (
                                        <tr key={applicant.id} className="bg-white border-b hover:bg-slate-50">
                                            <th scope="row" className="px-6 py-4 font-medium text-slate-900">{applicant.name}<p className="font-normal text-slate-500">{applicant.email}</p></th>
                                            <td className="px-6 py-4">{new Date(applicant.appliedDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</td>
                                            <td className="px-6 py-4"><span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusClass(applicant.status)}`}>{applicant.status}</span></td>
                                            <td className="px-6 py-4 text-center"><button className="text-primary hover:text-primary-dark p-2" title="Lihat CV"><Eye size={18} /></button></td>
                                        </tr>
                                    ))
                                ) : (<tr><td colSpan={4} className="text-center py-10 text-slate-500">Belum ada kandidat.</td></tr>)}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}
