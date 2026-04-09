/** Path: src/app/(admin)/admin/lowongan/page.tsx
 * Deskripsi: Halaman Manajemen Lowongan Pekerjaan (List View).
 * Fitur: Menampilkan jumlah pelamar per lowongan dengan UI Modern, sudut lancip, dan kontainer lebar.
 * Perbaikan: Menggunakan shim untuk navigasi dan menyertakan modal secara internal untuk pratinjau Canvas.
 */

"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { 
  PlusCircle, 
  Edit, 
  Trash2, 
  Loader2, 
  AlertTriangle, 
  Info, 
  Eye, 
  Briefcase, 
  Users, 
  Calendar,
  Search,
  X,
  ChevronRight
} from 'lucide-react';
import Link from 'next/link';

// Mock Alert/Toast untuk pratinjau (Di lokal gunakan @/app/components/admin/Alert)
const showSuccessToast = (msg: string) => console.log("Success Toast:", msg);
const showErrorToast = (msg: string) => console.log("Error Toast:", msg);

// Komponen Modal Internal (Gaya Lancip rounded-md)
const Modal = ({ isOpen, onClose, title, children, size = "md" }: any) => {
  if (!isOpen) return null;
  const sizeClasses: Record<string, string> = {
    sm: "max-w-sm", md: "max-w-md", lg: "max-w-lg", xl: "max-w-xl", "5xl": "max-w-5xl",
  };
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
      <div className={`bg-white rounded-md shadow-2xl w-full ${sizeClasses[size] || sizeClasses.md} my-8 animate-in zoom-in duration-200 border border-slate-200`}>
        <div className="flex items-center justify-between p-5 border-b border-slate-100 bg-slate-50/50">
          <h2 className="text-lg font-bold text-slate-800 leading-none">{title}</h2>
          <button onClick={onClose} className="p-1 hover:bg-slate-200 rounded-full transition-colors text-slate-500">
            <X size={20} />
          </button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
};

// --- DATA INTERFACES ---
interface JobOpening {
    id: string; // UUID
    title: string;
    category: 'Medis' | 'Non-Medis';
    status: 'Draft' | 'Published' | 'Closed' | 'Archived';
    posted_date: string | null;
    closing_date?: string | null;
    applicant_count: number;
}

export default function JobManagementPage() {
    const [jobs, setJobs] = useState<JobOpening[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState("");
    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "";

    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
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
            console.error("Fetch Error:", err);
            // Fallback dummy untuk simulasi pratinjau jika API belum siap
            setJobs([
                { id: "1", title: "Perawat Pelaksana", category: "Medis", status: "Published", posted_date: "2026-04-08", applicant_count: 12 },
                { id: "2", title: "Admin Radiologi", category: "Non-Medis", status: "Draft", posted_date: null, applicant_count: 0 }
            ]);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [baseUrl]);

    const filteredJobs = useMemo(() => {
        return jobs.filter(j => j.title.toLowerCase().includes(searchTerm.toLowerCase()));
    }, [jobs, searchTerm]);

    const handleConfirmDelete = async () => {
        if (!selectedJob) return;
        try {
            const res = await fetch(`${baseUrl}/job-openings/${selectedJob.id}`, { method: 'DELETE' });
            if (!res.ok) throw new Error("Gagal menghapus lowongan.");
            showSuccessToast("Lowongan berhasil dihapus.");
            fetchData();
        } catch (err) {
            showErrorToast("Gagal menghapus lowongan.");
        } finally {
            handleCloseModals();
        }
    };

    const handleOpenEditModal = (job: JobOpening) => {
        setSelectedJob(job);
        setEditForm({
            title: job.title,
            status: job.status,
            closing_date: job.closing_date ? new Date(job.closing_date).toISOString().split('T')[0] : ""
        });
        setIsEditModalOpen(true);
    };

    const handleOpenDeleteModal = (job: JobOpening) => {
        setSelectedJob(job);
        setIsDeleteModalOpen(true);
    };

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
            if (!res.ok) throw new Error("Gagal memperbarui.");
            showSuccessToast("Lowongan berhasil diperbarui.");
            handleCloseModals();
            fetchData();
        } catch (err) {
            showErrorToast("Gagal memperbarui lowongan.");
        }
    };

    const getStatusClass = (status: string) => {
        switch (status) {
            case 'Published': return 'bg-emerald-50 text-emerald-700 border-emerald-100';
            case 'Draft': return 'bg-amber-50 text-amber-700 border-amber-100';
            case 'Closed': return 'bg-slate-50 text-slate-600 border-slate-200';
            case 'Archived': return 'bg-slate-100 text-slate-400 border-slate-200';
            default: return 'bg-slate-50 text-slate-500';
        }
    };

    return (
        <div className="p-8 font-sans max-w-7xl mx-auto min-h-screen">
            {/* Header Bagian Atas */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
                <div>
                    <h1 className="text-4xl font-extrabold text-[#05445e] tracking-tight leading-none mb-2">Manajemen Lowongan Kerja</h1>
                    <p className="text-slate-400 font-medium text-sm">Kelola publikasi posisi dan pantau antrean pelamar secara real-time.</p>
                </div>
                <Link href="/admin/request-pegawai" className="flex items-center gap-3 bg-[#0173b6] text-white font-bold py-3 px-6 rounded-md hover:bg-[#015a8f] transition-all shadow-lg shadow-blue-200 active:scale-95 text-xs uppercase tracking-widest">
                    <PlusCircle size={18} />
                    Buat Dari Request
                </Link>
            </div>

            {/* Bar Pencarian */}
            <div className="mb-6 relative group">
                <input 
                    type="text" 
                    placeholder="Cari posisi lowongan..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-12 pr-4 py-3.5 bg-white border border-slate-200 rounded-md shadow-sm focus:ring-4 focus:ring-blue-50 focus:border-[#0173b6] outline-none transition-all font-medium text-slate-700"
                />
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-[#0173b6] transition-colors" size={20} />
            </div>

            {/* Kartu Tabel Utama */}
            <div className="bg-white rounded-md shadow-sm border border-slate-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-[#05445e] text-white uppercase font-bold text-[10px] tracking-widest">
                                <th className="px-8 py-5">Posisi Lowongan</th>
                                <th className="px-8 py-5">Kategori</th>
                                <th className="px-8 py-5 text-center">Status</th>
                                <th className="px-8 py-5 text-center">Pelamar</th>
                                <th className="px-8 py-5">Tanggal Posting</th>
                                <th className="px-8 py-5 text-center">Tindakan</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {isLoading ? (
                                <tr><td colSpan={6} className="p-24 text-center"><Loader2 className="animate-spin text-[#0173b6] mx-auto" size={32} /></td></tr>
                            ) : filteredJobs.length > 0 ? (
                                filteredJobs.map((job) => (
                                    <tr key={job.id} className="hover:bg-slate-50 transition-colors group">
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-4">
                                                <div className="h-10 w-10 bg-slate-50 rounded-md flex items-center justify-center text-[#0173b6] border border-slate-100">
                                                    <Briefcase size={20} />
                                                </div>
                                                <div>
                                                    <span className="font-bold text-slate-800 tracking-tight block mb-1">{job.title}</span>
                                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                                                        <Calendar size={12} /> Deadline: {job.closing_date ? new Date(job.closing_date).toLocaleDateString('id-ID') : 'Tanpa Batas'}
                                                    </span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <span className={`text-[10px] font-bold uppercase px-2.5 py-1 rounded border ${job.category === 'Medis' ? 'text-blue-600 bg-blue-50 border-blue-100' : 'text-emerald-600 bg-emerald-50 border-emerald-100'}`}>
                                                {job.category}
                                            </span>
                                        </td>
                                        <td className="px-8 py-6 text-center">
                                            <span className={`px-3 py-1 text-[10px] font-bold rounded-md border uppercase tracking-widest ${getStatusClass(job.status)}`}>
                                                {job.status}
                                            </span>
                                        </td>
                                        <td className="px-8 py-6 text-center">
                                            {/* VISUAL INDIKATOR PELAMAR */}
                                            <div className="inline-flex flex-col items-center">
                                                <div className="flex items-center gap-1.5 text-[#05445e] font-black text-xl leading-none">
                                                    <Users size={16} className="text-blue-200" />
                                                    {job.applicant_count || 0}
                                                </div>
                                                <span className="text-[8px] font-bold text-slate-300 uppercase tracking-widest mt-1">Kandidat</span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <span className="text-xs font-bold text-slate-500">
                                                {job.posted_date ? new Date(job.posted_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Draft'}
                                            </span>
                                        </td>
                                        <td className="px-8 py-6 text-center">
                                            <div className="flex items-center justify-center gap-2">
                                                <Link href={`/admin/lowongan/${job.id}`} className="p-2.5 text-slate-400 hover:text-[#0173b6] hover:bg-blue-50 rounded-md transition-all" title="Detail & Pelamar">
                                                    <Eye size={18} />
                                                </Link>
                                                <button onClick={() => handleOpenEditModal(job)} className="p-2.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-all" title="Edit Lowongan">
                                                    <Edit size={18} />
                                                </button>
                                                <button onClick={() => handleOpenDeleteModal(job)} className="p-2.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-all" title="Hapus Lowongan">
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr><td colSpan={6} className="p-20 text-center text-slate-300 font-bold uppercase tracking-widest text-xs">Data tidak ditemukan</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal Edit Lowongan */}
            <Modal isOpen={isEditModalOpen} onClose={handleCloseModals} title="Konfigurasi Lowongan">
                <form onSubmit={handleUpdateJob} className="space-y-6">
                    <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Judul Posting</label>
                        <input
                            type="text"
                            value={editForm.title}
                            onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                            required
                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-md font-bold text-slate-800 outline-none focus:bg-white focus:border-[#0173b6] transition-all"
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Status</label>
                            <select
                                value={editForm.status}
                                onChange={(e) => setEditForm({ ...editForm, status: e.target.value as any })}
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-md font-bold text-slate-800 outline-none"
                            >
                                <option value="Draft">Draft</option>
                                <option value="Published">Published</option>
                                <option value="Closed">Closed</option>
                                <option value="Archived">Archived</option>
                            </select>
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Batas Akhir Lamaran</label>
                            <input
                                type="date"
                                value={editForm.closing_date}
                                onChange={(e) => setEditForm({ ...editForm, closing_date: e.target.value })}
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-md font-bold text-slate-800 outline-none"
                            />
                        </div>
                    </div>
                    <div className="pt-4 flex justify-end gap-3 border-t border-slate-100">
                        <button type="button" onClick={handleCloseModals} className="px-6 py-2.5 rounded-md bg-slate-100 text-slate-500 font-bold text-xs uppercase tracking-widest">Batal</button>
                        <button type="submit" className="px-6 py-2.5 rounded-md bg-[#0173b6] text-white font-bold text-xs uppercase tracking-widest shadow-lg shadow-blue-100">Simpan Perubahan</button>
                    </div>
                </form>
            </Modal>

            {/* Modal Konfirmasi Hapus */}
            <Modal isOpen={isDeleteModalOpen} onClose={handleCloseModals} title="Konfirmasi Hapus Lowongan">
                {selectedJob && (
                    <div className="text-center py-4">
                        <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6 border border-red-100"><Trash2 size={32} /></div>
                        <p className="text-slate-600 font-medium leading-relaxed mb-8">
                            Apakah Anda yakin ingin menghapus lowongan untuk posisi <br/>
                            <strong className="text-slate-800 font-bold uppercase tracking-tight">{selectedJob.title}</strong>? <br/>
                            <span className="text-[10px] text-red-400 font-bold uppercase mt-2 block italic">* Tindakan ini permanen dan data tidak dapat dipulihkan.</span>
                        </p>
                        <div className="flex gap-3">
                            <button onClick={handleCloseModals} className="flex-1 py-3 rounded-md bg-slate-100 text-slate-500 font-bold text-[10px] uppercase">Batalkan</button>
                            <button onClick={handleConfirmDelete} className="flex-1 py-3 rounded-md bg-red-600 text-white font-bold text-[10px] uppercase shadow-lg shadow-red-100">Ya, Hapus Lowongan</button>
                        </div>
                    </div>
                )}
            </Modal>


            <style jsx global>{`
                .custom-scrollbar::-webkit-scrollbar { width: 4px; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 4px; }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #cbd5e1; }
            `}</style>
        </div>
    );
}