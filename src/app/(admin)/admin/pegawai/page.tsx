// File: app/(admin)/admin/pegawai/page.tsx
"use client";

import { useState } from 'react';
import Link from 'next/link';
import { PlusCircle, Edit, Trash2 } from 'lucide-react';
import { employees as initialEmployees, Employee } from '@/app/data/employees';
import Modal from '@/app/components/modal';

export default function EmployeeManagementPage() {
    const [employeeList, setEmployeeList] = useState(initialEmployees);
    const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

    const handleOpenDeleteModal = (employee: Employee) => {
        setSelectedEmployee(employee);
        setIsDeleteModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsDeleteModalOpen(false);
        setSelectedEmployee(null);
    };

    const confirmDelete = () => {
        if (!selectedEmployee) return;
        console.log("Menghapus Pegawai:", selectedEmployee.id);
        setEmployeeList(employeeList.filter(emp => emp.id !== selectedEmployee.id));
        handleCloseModal();
    };

    return (
        <div className="p-8">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-primary-dark">Manajemen Pegawai</h1>
                <Link href="/admin/pegawai/tambah" className="flex items-center gap-2 bg-primary text-white font-semibold py-2 px-4 rounded-lg hover:bg-primary-dark">
                    <PlusCircle size={20} />
                    Tambah Pegawai
                </Link>
            </div>

            <div className="bg-white shadow-md rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-slate-500">
                        <thead className="text-xs text-white uppercase bg-primary-dark">
                            <tr>
                                <th scope="col" className="px-6 py-3">NIP</th>
                                <th scope="col" className="px-6 py-3">Nama Lengkap</th>
                                <th scope="col" className="px-6 py-3">Profesi</th>
                                <th scope="col" className="px-6 py-3">Kontak</th>
                                <th scope="col" className="px-6 py-3">Status</th>
                                <th scope="col" className="px-6 py-3 text-center">Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            {employeeList.map((employee) => (
                                <tr key={employee.id} className="bg-white border-b border-slate-200 last:border-b-0 hover:bg-slate-50">
                                    <td className="px-6 py-4 font-semibold text-slate-700">{employee.nip}</td>
                                    <th scope="row" className="px-6 py-4 font-medium">{employee.nama_lengkap}</th>
                                    <td className="px-6 py-4">{employee.profesi}</td>
                                    <td className="px-6 py-4">
                                        <p className="font-medium">{employee.handphone}</p>
                                        <p className="text-xs text-slate-500">{employee.email}</p>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 text-xs rounded-full ${employee.status_kepegawaian === 'Aktif' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                            {employee.status_kepegawaian}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 flex items-center justify-center gap-4">
                                        <Link href={`/admin/pegawai/edit/${employee.nip}`} className="text-blue-600 hover:text-blue-800" title="Edit">
                                            <Edit size={18} />
                                        </Link>
                                        <button onClick={() => handleOpenDeleteModal(employee)} className="text-red-600 hover:text-red-800" title="Hapus"><Trash2 size={18} /></button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal Hapus */}
            <Modal isOpen={isDeleteModalOpen} onClose={handleCloseModal} title="Konfirmasi Hapus">
                <div>
                    <p>Apakah Anda yakin ingin menghapus data pegawai <strong>{selectedEmployee?.nama_lengkap}</strong>?</p>
                    <div className="mt-6 flex justify-end gap-4">
                        <button onClick={handleCloseModal} className="rounded-full bg-slate-200 px-4 py-2 text-sm">Batal</button>
                        <button onClick={confirmDelete} className="rounded-full bg-red-600 px-4 py-2 text-sm text-white">Ya, Hapus</button>
                    </div>
                </div>
            </Modal>
        </div>
    );
}

