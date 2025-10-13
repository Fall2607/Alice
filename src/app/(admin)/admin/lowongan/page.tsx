// File: app/(admin)/admin/lowongan/page.tsx
"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { PlusCircle, Edit, Trash2, Loader2, AlertTriangle, Info, Eye } from 'lucide-react';
import { showSuccessToast, showErrorToast } from '@/app/components/admin/Alert';

interface JobOpening {
    id: number;
    title: string;
    category: 'Medis' | 'Non-Medis';
    status: 'Draft' | 'Published' | 'Closed';
    posted_date: string | null;
}

export default function JobManagementPage() {
    const [jobs, setJobs] = useState<JobOpening[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "";

    const fetchData = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const res = await fetch(`${baseUrl}/job-openings`);
            if (!res.ok) throw new Error("Gagal memuat data lowongan.");
            const data = await res.json();
            setJobs(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Terjadi kesalahan");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [baseUrl]);

    const handleDeleteJob = async (id: number) => {
        if (window.confirm("Apakah Anda yakin ingin menghapus lowongan ini?")) {
            try {
                const res = await fetch(`${baseUrl}/job-openings/${id}`, { method: 'DELETE' });
                if (!res.ok) throw new Error("Gagal menghapus lowongan.");
                showSuccessToast("Lowongan berhasil dihapus.");
                fetchData(); // Muat ulang data
            } catch (err) {
                showErrorToast(err instanceof Error ? err.message : "Gagal menghapus.");
            }
        }
    };

    const getStatusClass = (status: string) => {
        switch (status) {
            case 'Published': return 'bg-green-100 text-green-800';
            case 'Draft': return 'bg-yellow-100 text-yellow-800';
            case 'Closed': return 'bg-slate-100 text-slate-800';
            default: return '';
        }
    };

    return (
        <div className="p-8">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-primary-dark">Manajemen Lowongan Pekerjaan</h1>
                <Link href="/admin/request-pegawai" className="flex items-center gap-2 bg-primary text-white font-semibold py-2 px-4 rounded-lg hover:bg-primary-dark transition-colors">
                    <PlusCircle size={20} />
                    Buat dari Request
                </Link>
            </div>

            <div className="bg-white shadow-md rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-slate-500">
                        <thead className="text-xs text-white uppercase bg-primary-dark">
                            <tr>
                                <th scope="col" className="px-6 py-3">Posisi Lowongan</th>
                                <th scope="col" className="px-6 py-3">Kategori</th>
                                <th scope="col" className="px-6 py-3">Status</th>
                                <th scope="col" className="px-6 py-3">Tanggal Posting</th>
                                <th scope="col" className="px-6 py-3 text-center">Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            {isLoading ? (<tr><td colSpan={5} className="text-center p-8"><Loader2 className="animate-spin h-8 w-8 text-primary mx-auto" /></td></tr>)
                                : error ? (<tr><td colSpan={5} className="text-center p-8 text-red-500"><AlertTriangle className="inline mr-2" />{error}</td></tr>)
                                    : jobs.length > 0 ? (
                                        jobs.map((job) => (
                                            <tr key={job.id} className="bg-white border-b hover:bg-slate-50">
                                                <th scope="row" className="px-6 py-4 font-medium text-slate-900">{job.title}</th>
                                                <td className="px-6 py-4">{job.category}</td>
                                                <td className="px-6 py-4">
                                                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusClass(job.status)}`}>{job.status}</span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    {job.posted_date ? new Date(job.posted_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : 'Belum diposting'}
                                                </td>
                                                <td className="px-6 py-4 flex items-center justify-center gap-2">
                                                    <Link href={`/admin/lowongan/${job.id}`} className="p-2 text-slate-500 hover:text-primary rounded-full hover:bg-slate-100" title="Lihat Detail & Kandidat"><Eye size={18} /></Link>
                                                    <button onClick={() => alert("Fitur edit dalam pengembangan")} className="p-2 text-blue-600 hover:text-blue-800 rounded-full hover:bg-blue-50" title="Edit"><Edit size={18} /></button>
                                                    <button onClick={() => handleDeleteJob(job.id)} className="p-2 text-red-600 hover:text-red-800 rounded-full hover:bg-red-50" title="Hapus"><Trash2 size={18} /></button>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (<tr><td colSpan={5} className="text-center p-8"><Info className="mx-auto mb-2 text-slate-400" />Tidak ada data lowongan.</td></tr>)}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
