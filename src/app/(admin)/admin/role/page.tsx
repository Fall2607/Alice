// File: app/(admin)/admin/role/page.tsx
"use client";

import { useState, useEffect } from 'react';
import { PlusCircle, Edit, Trash2, Loader2, AlertTriangle } from 'lucide-react';
import Modal from '@/app/components/modal';
import { showSuccessToast, showErrorToast } from '@/app/components/admin/Alert';

// Interface disesuaikan dengan struktur data dari API/database Anda
interface Role {
    id: number;
    nama_role: string;
    deskripsi: string | null;
}

export default function RoleManagementPage() {
    const [roles, setRoles] = useState<Role[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [selectedRole, setSelectedRole] = useState<Role | null>(null);
    const [formData, setFormData] = useState({ nama_role: '', deskripsi: '' });

    // State untuk setiap modal
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL_LAN || process.env.NEXT_PUBLIC_API_BASE_URL;

    const fetchRoles = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await fetch(`${baseUrl}/api/roles`);
            if (!response.ok) throw new Error("Gagal memuat data role.");
            const data = await response.json();
            setRoles(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Terjadi kesalahan.");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchRoles();
    }, [baseUrl]);

    const handleCloseModals = () => {
        setIsAddModalOpen(false);
        setIsEditModalOpen(false);
        setIsDeleteModalOpen(false);
        setSelectedRole(null);
    };

    const handleOpenAddModal = () => {
        setFormData({ nama_role: '', deskripsi: '' });
        setIsAddModalOpen(true);
    };

    const handleOpenEditModal = (role: Role) => {
        setSelectedRole(role);
        setFormData({ nama_role: role.nama_role, deskripsi: role.deskripsi || '' });
        setIsEditModalOpen(true);
    };

    const handleOpenDeleteModal = (role: Role) => {
        setSelectedRole(role);
        setIsDeleteModalOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const isEditing = isEditModalOpen;
        const url = isEditing
            ? `${baseUrl}/api/roles/${selectedRole?.id}`
            : `${baseUrl}/api/roles`;
        const method = isEditing ? 'PUT' : 'POST';

        try {
            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Gagal menyimpan data.');
            }

            showSuccessToast(`Role berhasil ${isEditing ? 'diperbarui' : 'ditambahkan'}!`);
            fetchRoles();
            handleCloseModals();
        } catch (err) {
            showErrorToast(err instanceof Error ? err.message : 'Terjadi kesalahan.');
        }
    };

    const confirmDelete = async () => {
        if (!selectedRole) return;
        try {
            const response = await fetch(`${baseUrl}/api/roles/${selectedRole.id}`, {
                method: 'DELETE',
            });
            if (!response.ok) throw new Error("Gagal menghapus role.");

            setRoles(roles.filter(r => r.id !== selectedRole.id));
            showSuccessToast("Role berhasil dihapus!");
            handleCloseModals();
        } catch (err) {
            showErrorToast(err instanceof Error ? err.message : "Gagal menghapus role.");
        }
    };

    return (
        <div className="p-8">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-primary-dark">Manajemen Role</h1>
                <button onClick={handleOpenAddModal} className="flex items-center gap-2 bg-primary text-white font-semibold py-2 px-4 rounded-lg hover:bg-primary-dark">
                    <PlusCircle size={20} />
                    Tambah Role
                </button>
            </div>

            <div className="bg-white shadow-md rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-slate-500">
                        <thead className="text-xs text-white uppercase bg-primary-dark">
                            <tr>
                                <th scope="col" className="px-6 py-3">Nama Role</th>
                                <th scope="col" className="px-6 py-3">Deskripsi</th>
                                <th scope="col" className="px-6 py-3 text-center">Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            {isLoading ? (
                                <tr><td colSpan={3} className="text-center p-8"><Loader2 className="animate-spin" /></td></tr>
                            ) : error ? (
                                <tr><td colSpan={3} className="text-center p-8 text-red-500"><AlertTriangle className="inline mr-2" />{error}</td></tr>
                            ) : (
                                roles.map((role) => (
                                    <tr key={role.id} className="bg-white border-b hover:bg-slate-50">
                                        <th scope="row" className="px-6 py-4 font-medium text-slate-900">{role.nama_role}</th>
                                        <td className="px-6 py-4">{role.deskripsi}</td>
                                        <td className="px-6 py-4 flex items-center justify-center gap-4">
                                            <button onClick={() => handleOpenEditModal(role)} className="text-blue-600 hover:text-blue-800" title="Edit"><Edit size={18} /></button>
                                            <button onClick={() => handleOpenDeleteModal(role)} className="text-red-600 hover:text-red-800" title="Hapus"><Trash2 size={18} /></button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <Modal isOpen={isAddModalOpen || isEditModalOpen} onClose={handleCloseModals} title={isAddModalOpen ? 'Tambah Role Baru' : 'Edit Role'}>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Nama Role</label>
                        <input
                            type="text"
                            value={formData.nama_role}
                            onChange={(e) => setFormData({ ...formData, nama_role: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Deskripsi</label>
                        <textarea
                            rows={3}
                            value={formData.deskripsi}
                            onChange={(e) => setFormData({ ...formData, deskripsi: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md"
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
                    <p>Apakah Anda yakin ingin menghapus role <strong>{selectedRole?.nama_role}</strong>?</p>
                    <div className="mt-6 flex justify-end gap-4">
                        <button onClick={handleCloseModals} className="rounded-full bg-slate-200 px-4 py-2 text-sm">Batal</button>
                        <button onClick={confirmDelete} className="rounded-full bg-red-600 px-4 py-2 text-sm text-white">Ya, Hapus</button>
                    </div>
                </div>
            </Modal>
        </div>
    );
}