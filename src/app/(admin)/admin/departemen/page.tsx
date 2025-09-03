// File: src/app/(admin)/admin/departemen/page.tsx
"use client";

import { useState, useEffect } from 'react';
import { PlusCircle, Edit, Trash2, Loader2, AlertTriangle } from 'lucide-react';

// Mendefinisikan tipe data untuk objek departemen sesuai dengan response API
interface Department {
    id: number;
    nama_departemen: string;
    jenis_departemen: string;
}

export default function DepartmentManagementPage() {
    // State untuk menyimpan data departemen dari API
    const [departments, setDepartments] = useState<Department[]>([]);
    // State untuk menandakan proses loading data
    const [isLoading, setIsLoading] = useState(true);
    // State untuk menyimpan pesan error jika terjadi
    const [error, setError] = useState<string | null>(null);

    // useEffect akan berjalan satu kali saat komponen pertama kali di-mount
    useEffect(() => {
        // Fungsi async untuk mengambil data dari API
        const fetchDepartments = async () => {
            try {
                setIsLoading(true);
                setError(null);

                const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

                if (!baseUrl) {
                    throw new Error("Variabel NEXT_PUBLIC_API_BASE_URL tidak ditemukan. Pastikan file .env.local sudah benar dan server sudah di-restart.");
                }

                // URL seharusnya 'departments' (plural) agar cocok dengan nama folder API
                const apiUrl = `${baseUrl}/api/departments`;
                console.log(`Mencoba mengambil data dari: ${apiUrl}`);

                const response = await fetch(apiUrl);

                if (!response.ok) {
                    const errorText = await response.text();
                    console.error("Server merespons dengan error:", errorText);
                    throw new Error(`Server merespons dengan status ${response.status}. Penyebabnya kemungkinan besar adalah salah ketik pada path API atau masalah server.`);
                }

                const data: Department[] = await response.json();
                setDepartments(data);
            } catch (err: any) {
                console.error("Detail error fetch:", err);
                setError(err.message);
            } finally {
                setIsLoading(false);
            }
        };

        fetchDepartments();
    }, []); // Array dependensi kosong agar hanya berjalan sekali

    return (
        <div className="p-8">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-gray-800">
                    Manajemen Departemen
                </h1>
                <button
                    className="flex items-center gap-2 bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors duration-300"
                >
                    <PlusCircle size={20} />
                    Tambah Departemen
                </button>
            </div>

            <div className="bg-white shadow-md rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-slate-500">
                        <thead className="text-xs text-white uppercase bg-gray-700">
                            <tr>
                                <th scope="col" className="px-6 py-3">
                                    Nama Departemen
                                </th>
                                <th scope="col" className="px-6 py-3">
                                    Jenis Departemen
                                </th>
                                <th scope="col" className="px-6 py-3 text-center">
                                    Aksi
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {isLoading ? (
                                <tr>
                                    <td colSpan={3} className="text-center p-8">
                                        <div className="flex justify-center items-center gap-2 text-slate-500">
                                            <Loader2 className="animate-spin" size={20} />
                                            <span>Memuat data...</span>
                                        </div>
                                    </td>
                                </tr>
                            ) : error ? (
                                <tr>
                                    <td colSpan={3} className="text-center p-8">
                                        <div className="flex flex-col justify-center items-center gap-2 text-red-600">
                                            <AlertTriangle size={24} />
                                            <span>Error: {error}</span>
                                        </div>
                                    </td>
                                </tr>
                            ) : departments.length === 0 ? (
                                <tr>
                                    <td colSpan={3} className="text-center p-8 text-slate-500">
                                        Tidak ada data departemen yang ditemukan.
                                    </td>
                                </tr>
                            ) : (
                                departments.map((dept) => (
                                    <tr key={dept.id} className="bg-white border-b border-slate-200 last:border-b-0 hover:bg-slate-50">
                                        <th scope="row" className="px-6 py-4 font-medium text-slate-900 whitespace-nowrap">
                                            {dept.nama_departemen}
                                        </th>
                                        <td className="px-6 py-4">
                                            <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                                                {dept.jenis_departemen}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 flex items-center justify-center gap-4">
                                            <button className="text-blue-600 hover:text-blue-800" title="Edit">
                                                <Edit size={18} />
                                            </button>
                                            <button className="text-red-600 hover:text-red-800" title="Hapus">
                                                <Trash2 size={18} />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

