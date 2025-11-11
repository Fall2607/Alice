// File: app/(admin)/admin/lowongan/page.tsx
"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { PlusCircle, Edit, Trash2, Loader2, AlertTriangle, Info, Eye } from 'lucide-react';
import { showSuccessToast, showErrorToast } from '@/app/components/admin/Alert';
import Modal from '@/app/components/modal'; // Impor modal

interface JobOpening {
    id: number;
    title: string;
    category: 'Medis' | 'Non-Medis';
    status: 'Draft' | 'Published' | 'Closed' | 'Archived';
    posted_date: string | null;
    closing_date?: string | null; // Tambahkan closing date
}

export default function JobManagementPage() {
    const [jobs, setJobs] = useState<JobOpening[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "";

    // State untuk Modal Edit
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    // State untuk Modal Delete
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    
    const [selectedJob, setSelectedJob] = useState<JobOpening | null>(null);
    const [editForm, setEditForm] = useState({
        title: "",
        status: "Draft" as JobOpening['status'],
        closing_date: ""
    });

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

    // Fungsi baru untuk menangani konfirmasi penghapusan
    const handleConfirmDelete = async () => {
        if (!selectedJob) return;
        try {
            const res = await fetch(`${baseUrl}/job-openings/${selectedJob.id}`, { method: 'DELETE' });
            if (!res.ok) throw new Error("Gagal menghapus lowongan.");
            showSuccessToast("Lowongan berhasil dihapus.");
            fetchData(); // Muat ulang data
        } catch (err) {
            showErrorToast(err instanceof Error ? err.message : "Gagal menghapus.");
        } finally {
            handleCloseModals();
        }
    };

    // Fungsi untuk membuka modal edit
    const handleOpenEditModal = (job: JobOpening) => {
        setSelectedJob(job);
        setEditForm({
            title: job.title,
            status: job.status,
            closing_date: job.closing_date ? new Date(job.closing_date).toISOString().split('T')[0] : ""
        });
        setIsEditModalOpen(true);
    };

    // Fungsi baru untuk membuka modal delete
    const handleOpenDeleteModal = (job: JobOpening) => {
        setSelectedJob(job);
        setIsDeleteModalOpen(true);
    };

    // Fungsi gabungan untuk menutup semua modal
    const handleCloseModals = () => {
        setIsEditModalOpen(false);
        setIsDeleteModalOpen(false);
        setSelectedJob(null);
        setEditForm({ title: "", status: "Draft", closing_date: "" });
    };

    const handleUpdateJob = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedJob) return;

        try {
            const body = {
                title: editForm.title,
                status: editForm.status,
                closing_date: editForm.closing_date || null
            };
            
            const res = await fetch(`${baseUrl}/job-openings/${selectedJob.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            });

            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.message || "Gagal memperbarui lowongan");
            }
            
            showSuccessToast("Lowongan berhasil diperbarui.");
            handleCloseModals();
            fetchData(); // Muat ulang data
        } catch (err) {
            showErrorToast(err instanceof Error ? err.message : "Gagal memperbarui.");
        }
    };

    const getStatusClass = (status: string) => {
        switch (status) {
            case 'Published': return 'bg-green-100 text-green-800';
            case 'Draft': return 'bg-yellow-100 text-yellow-800';
            case 'Closed': return 'bg-slate-100 text-slate-800';
            case 'Archived': return 'bg-gray-100 text-gray-800';
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
                                    <tr key={job.id} className="bg-white border-b border-slate-300 last:border-b-0 hover:bg-slate-50">
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
                                            <button onClick={() => handleOpenEditModal(job)} className="p-2 text-blue-600 hover:text-blue-800 rounded-full hover:bg-blue-50" title="Edit"><Edit size={18} /></button>
                                            {/* Menggunakan handleOpenDeleteModal */}
                                            <button onClick={() => handleOpenDeleteModal(job)} className="p-2 text-red-600 hover:text-red-800 rounded-full hover:bg-red-50" title="Hapus"><Trash2 size={18} /></button>
                                        </td>
                                    </tr>
                                ))
                            ) : (<tr><td colSpan={5} className="text-center p-8"><Info className="mx-auto mb-2 text-slate-400" />Tidak ada data lowongan.</td></tr>)}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal untuk Edit Lowongan */}
            <Modal isOpen={isEditModalOpen} onClose={handleCloseModals} title="Edit Lowongan Pekerjaan">
                <form onSubmit={handleUpdateJob}>
                    <div className="space-y-4">
                        <div>
                            <label htmlFor="editTitle" className="block text-sm font-medium text-gray-700 mb-1">Judul Lowongan</label>
                            <input
                                type="text"
                                id="editTitle"
                                value={editForm.title}
                                onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                                required
                                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                            />
                        </div>
                         <div>
                            <label htmlFor="editStatus" className="block text-sm font-medium text-gray-700 mb-1">Status Lowongan</label>
                            <select
                                id="editStatus"
                                value={editForm.status}
                                onChange={(e) => setEditForm({ ...editForm, status: e.target.value as JobOpening['status'] })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                            >
                                <option value="Draft">Draft</option>
                                <option value="Published">Published</option>
                                <option value="Closed">Closed</option>
                                <option value="Archived">Archived</option>
                            </select>
                        </div>
                         <div>
                            <label htmlFor="editClosingDate" className="block text-sm font-medium text-gray-700 mb-1">Tanggal Penutupan (Opsional)</label>
                            <input
                                type="date"
                                id="editClosingDate"
                                value={editForm.closing_date}
                                onChange={(e) => setEditForm({ ...editForm, closing_date: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                            />
                        </div>
                    </div>
                    <div className="mt-6 flex justify-end gap-4">
                        <button type="button" onClick={handleCloseModals} className="rounded-lg bg-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-300">Batal</button>
                        <button type="submit" className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary-dark">Simpan Perubahan</button>
                    </div>
                </form>
            </Modal>

            {/* Modal baru untuk Konfirmasi Hapus */}
            <Modal isOpen={isDeleteModalOpen} onClose={handleCloseModals} title="Hapus Lowongan Pekerjaan">
                {selectedJob && (
                    <div>
                        <p className="text-slate-600">
                            Apakah Anda yakin ingin menghapus lowongan untuk posisi <strong>{selectedJob.title}</strong>? Tindakan ini tidak dapat dibatalkan.
                        </p>
                        <div className="mt-6 flex justify-end gap-4">
                            <button onClick={handleCloseModals} className="rounded-lg bg-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-300">
                                Batal
                            </button>
                            <button onClick={handleConfirmDelete} className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700">
                                Ya, Hapus
                            </button>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
}