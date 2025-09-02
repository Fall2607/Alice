// File: app/(admin)/admin/lowongan/page.tsx
"use client";

import { useState } from 'react';
import Link from 'next/link';
import { PlusCircle, Edit, Trash2 } from 'lucide-react';
import { jobOpenings } from '@/app/data/careers';

export default function JobManagementPage() {
    const [jobs, setJobs] = useState(jobOpenings);

    const handleAddJob = () => {
        console.log("Membuka modal untuk menambah lowongan baru...");
    };

    const handleEditJob = (id: number) => {
        console.log(`Mengedit lowongan dengan ID: ${id}`);
    };

    const handleDeleteJob = (id: number) => {
        if (window.confirm("Apakah Anda yakin ingin menghapus lowongan ini?")) {
            console.log(`Menghapus lowongan dengan ID: ${id}`);
            setJobs(jobs.filter(job => job.id !== id));
        }
    };

    return (
        <div className="p-8">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-primary-dark">
                    Manajemen Lowongan Pekerjaan
                </h1>
                <button
                    onClick={handleAddJob}
                    className="flex items-center gap-2 bg-primary text-white font-semibold py-2 px-4 rounded-lg hover:bg-primary-dark transition-colors duration-300"
                >
                    <PlusCircle size={20} />
                    Tambah Lowongan
                </button>
            </div>

            <div className="bg-white shadow-md rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-slate-500">
                        <thead className="text-xs text-white uppercase bg-primary-dark">
                            <tr>
                                <th scope="col" className="px-6 py-3">
                                    Posisi
                                </th>
                                <th scope="col" className="px-6 py-3">
                                    Kategori
                                </th>
                                <th scope="col" className="px-6 py-3">
                                    Tipe
                                </th>
                                <th scope="col" className="px-6 py-3">
                                    Tanggal Posting
                                </th>
                                <th scope="col" className="px-6 py-3 text-center">
                                    Aksi
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {jobs.map((job) => (
                                <tr key={job.id} className="bg-white border-b border-slate-200 last:border-b-0 hover:bg-slate-50">
                                    <th scope="row" className="px-6 py-4 font-medium text-slate-900 whitespace-nowrap">
                                        <Link href={`/admin/lowongan/${job.id}`} className="hover:underline text-primary">
                                            {job.title}
                                        </Link>
                                    </th>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${job.category === 'Medis'
                                                ? 'bg-blue-100 text-blue-800'
                                                : 'bg-green-100 text-green-800'
                                            }`}>
                                            {job.category}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        {job.type}
                                    </td>
                                    <td className="px-6 py-4">
                                        {new Date(job.postedDate).toLocaleDateString('id-ID', {
                                            day: 'numeric',
                                            month: 'long',
                                            year: 'numeric',
                                        })}
                                    </td>
                                    <td className="px-6 py-4 flex items-center justify-center gap-4">
                                        <button onClick={() => handleEditJob(job.id)} className="text-blue-600 hover:text-blue-800" title="Edit">
                                            <Edit size={18} />
                                        </button>
                                        <button onClick={() => handleDeleteJob(job.id)} className="text-red-600 hover:text-red-800" title="Hapus">
                                            <Trash2 size={18} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

