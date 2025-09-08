// File: app/(admin)/admin/jabatan/page.tsx
"use client";

import { useState, useEffect } from 'react';
import { PlusCircle, Edit, Trash2, Loader2, AlertTriangle } from 'lucide-react';
import Modal from '@/app/components/modal';

// Interface disesuaikan dengan struktur data dari API/database Anda
interface LevelJabatan {
    id: number;
    nama_level: string;
}

export default function JabatanManagementPage() {
    const [jabatans, setJabatans] = useState<LevelJabatan[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [selectedJabatan, setSelectedJabatan] = useState<LevelJabatan | null>(null);
    const [formData, setFormData] = useState({ nama_level: '' });

    // State untuk setiap modal
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL_LAN || process.env.NEXT_PUBLIC_API_BASE_URL;

    // Fungsi untuk mengambil data dari API
    const fetchJabatans = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await fetch(`${baseUrl}/api/level-jabatan`);
            if (!response.ok) {
                throw new Error(`Gagal memuat data: ${response.statusText}`);
            }
            const data = await response.json();
            setJabatans(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Terjadi kesalahan yang tidak terduga.");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchJabatans();
    }, [baseUrl]);

    const handleCloseModals = () => {
        setIsAddModalOpen(false);
        setIsEditModalOpen(false);
        setIsDeleteModalOpen(false);
        setSelectedJabatan(null);
    };

    const handleOpenAddModal = () => {
        setFormData({ nama_level: '' });
        setIsAddModalOpen(true);
    };

    const handleOpenEditModal = (jabatan: LevelJabatan) => {
        setSelectedJabatan(jabatan);
        setFormData({ nama_level: jabatan.nama_level });
        setIsEditModalOpen(true);
    };

    const handleOpenDeleteModal = (jabatan: LevelJabatan) => {
        setSelectedJabatan(jabatan);
        setIsDeleteModalOpen(true);
    };

    // Fungsi untuk handle submit (Tambah & Edit)
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const isEditing = isEditModalOpen;
        const url = isEditing
            ? `${baseUrl}/api/level-jabatan/${selectedJabatan?.id}`
            : `${baseUrl}/api/level-jabatan`;
        const method = isEditing ? 'PUT' : 'POST';

        try {
            const response = await fetch(url, {
                method: method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ nama_level: formData.nama_level }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `Gagal ${isEditing ? 'memperbarui' : 'menambah'} data.`);
            }

            fetchJabatans(); // Muat ulang data setelah berhasil
            handleCloseModals();
        } catch (err) {
            alert(err instanceof Error ? err.message : 'Terjadi kesalahan.');
        }
    };

    // Fungsi untuk konfirmasi hapus
    const confirmDelete = async () => {
        if (!selectedJabatan) return;
        try {
            const response = await fetch(`${baseUrl}/api/level-jabatan/${selectedJabatan.id}`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Gagal menghapus data.');
            }

            setJabatans(jabatans.filter(j => j.id !== selectedJabatan.id));
            handleCloseModals();
        } catch (err) {
            alert(err instanceof Error ? err.message : 'Terjadi kesalahan saat menghapus.');
        }
    };

    return (
        <div className="p-8">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-primary-dark">Manajemen Level Jabatan</h1>
                <button onClick={handleOpenAddModal} className="flex items-center gap-2 bg-primary text-white font-semibold py-2 px-4 rounded-lg hover:bg-primary-dark">
                    <PlusCircle size={20} />
                    Tambah Level Jabatan
                </button>
            </div>

            <div className="bg-white shadow-md rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-slate-500">
                        <thead className="text-xs text-white uppercase bg-primary-dark">
                            <tr>
                                <th scope="col" className="px-6 py-3">ID</th>
                                <th scope="col" className="px-6 py-3">Nama Level Jabatan</th>
                                <th scope="col" className="px-6 py-3 text-center">Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            {isLoading ? (
                                <tr><td colSpan={3} className="text-center p-8"><Loader2 className="animate-spin" /></td></tr>
                            ) : error ? (
                                <tr><td colSpan={3} className="text-center p-8 text-red-500"><AlertTriangle className="inline-block mr-2" />{error}</td></tr>
                            ) : (
                                jabatans.map((jabatan) => (
                                    <tr key={jabatan.id} className="bg-white border-b border-slate-200 last:border-b-0 hover:bg-slate-50">
                                        <td className="px-6 py-4 font-semibold text-slate-700">{jabatan.id}</td>
                                        <th scope="row" className="px-6 py-4 font-medium">{jabatan.nama_level}</th>
                                        <td className="px-6 py-4 flex items-center justify-center gap-4">
                                            <button onClick={() => handleOpenEditModal(jabatan)} className="text-blue-600 hover:text-blue-800" title="Edit"><Edit size={18} /></button>
                                            <button onClick={() => handleOpenDeleteModal(jabatan)} className="text-red-600 hover:text-red-800" title="Hapus"><Trash2 size={18} /></button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <Modal isOpen={isAddModalOpen || isEditModalOpen} onClose={handleCloseModals} title={isAddModalOpen ? 'Tambah Level Jabatan Baru' : 'Edit Level Jabatan'}>
                <form onSubmit={handleSubmit}>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Nama Level Jabatan</label>
                        <input
                            type="text"
                            value={formData.nama_level}
                            onChange={(e) => setFormData({ nama_level: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md"
                            required
                        />
                    </div>
                    <div className="mt-6 flex justify-end gap-4">
                        <button type="button" onClick={handleCloseModals} className="rounded-full bg-slate-200 px-4 py-2 text-sm">Batal</button>
                        <button type="submit" className="rounded-full bg-primary px-4 py-2 text-sm text-white">{isAddModalOpen ? 'Tambah' : 'Simpan'}</button>
                    </div>
                </form>
            </Modal>

            <Modal isOpen={isDeleteModalOpen} onClose={handleCloseModals} title="Konfirmasi Hapus">
                <div>
                    <p>Apakah Anda yakin ingin menghapus level jabatan <strong>{selectedJabatan?.nama_level}</strong>?</p>
                    <div className="mt-6 flex justify-end gap-4">
                        <button onClick={handleCloseModals} className="rounded-full bg-slate-200 px-4 py-2 text-sm">Batal</button>
                        <button onClick={confirmDelete} className="rounded-full bg-red-600 px-4 py-2 text-sm text-white">Ya, Hapus</button>
                    </div>
                </div>
            </Modal>
        </div>
    );
}

