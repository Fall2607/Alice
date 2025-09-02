// File: app/(admin)/admin/job-positions/page.tsx
"use client";

import { useState } from 'react';
import { PlusCircle, Edit, Trash2 } from 'lucide-react';
import { jobPositions } from '@/app/data/careers';
import Pagination from '@/app/components/admin/Pagination';

type Position = {
    category: 'Medis' | 'Non-Medis';
    name: string;
};

export default function JobPositionsPage() {
    const [medisPositions, setMedisPositions] = useState<Position[]>(
        jobPositions.Medis.map(p => ({ category: 'Medis', name: p }))
    );
    const [nonMedisPositions, setNonMedisPositions] = useState<Position[]>(
        jobPositions['Non-Medis'].map(p => ({ category: 'Non-Medis', name: p }))
    );

    const [currentPageMedis, setCurrentPageMedis] = useState(1);
    const [currentPageNonMedis, setCurrentPageNonMedis] = useState(1);
    const itemsPerPage = 10;

    // Pagination Logic for Medis
    const totalPagesMedis = Math.ceil(medisPositions.length / itemsPerPage);
    const currentMedisPositions = medisPositions.slice(
        (currentPageMedis - 1) * itemsPerPage,
        currentPageMedis * itemsPerPage
    );

    // Pagination Logic for Non-Medis
    const totalPagesNonMedis = Math.ceil(nonMedisPositions.length / itemsPerPage);
    const currentNonMedisPositions = nonMedisPositions.slice(
        (currentPageNonMedis - 1) * itemsPerPage,
        currentPageNonMedis * itemsPerPage
    );

    const handleAddPosition = () => {
        console.log("Membuka modal untuk menambah posisi baru...");
    };

    const handleDeletePosition = (name: string, category: 'Medis' | 'Non-Medis') => {
        if (window.confirm(`Apakah Anda yakin ingin menghapus posisi "${name}"?`)) {
            if (category === 'Medis') {
                setMedisPositions(medisPositions.filter(p => p.name !== name));
            } else {
                setNonMedisPositions(nonMedisPositions.filter(p => p.name !== name));
            }
        }
    };

    const renderTable = (title: string, positions: Position[], currentPage: number, totalPages: number, onPageChange: (page: number) => void) => (
        <div className="flex flex-col">
            <h2 className="text-xl font-bold text-primary-dark mb-4 px-4 pt-4">{title}</h2>
            <div className="bg-white shadow-md rounded-lg overflow-hidden flex-grow flex flex-col">
                <div className="overflow-x-auto flex-grow">
                    <table className="w-full text-sm text-left text-slate-500">
                        <thead className="text-xs text-white uppercase bg-primary-dark">
                            <tr>
                                <th scope="col" className="px-6 py-3">Nama Posisi</th>
                                <th scope="col" className="px-6 py-3 text-center">Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            {positions.map((position, index) => (
                                <tr key={index} className="bg-white border-b border-slate-200 last:border-b-0 hover:bg-slate-50">
                                    <th scope="row" className="px-6 py-4 font-medium text-slate-900 whitespace-nowrap">
                                        {position.name}
                                    </th>
                                    <td className="px-6 py-4 flex items-center justify-center gap-4">
                                        <button className="text-blue-600 hover:text-blue-800" title="Edit">
                                            <Edit size={18} />
                                        </button>
                                        <button onClick={() => handleDeletePosition(position.name, position.category)} className="text-red-600 hover:text-red-800" title="Hapus">
                                            <Trash2 size={18} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={onPageChange} />
            </div>
        </div>
    );

    return (
        <div className="p-8">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-primary-dark">
                    Manajemen Posisi Pekerjaan
                </h1>
                <button
                    onClick={handleAddPosition}
                    className="flex items-center gap-2 bg-primary text-white font-semibold py-2 px-4 rounded-lg hover:bg-primary-dark transition-colors duration-300"
                >
                    <PlusCircle size={20} />
                    Tambah Posisi
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
                {renderTable("Posisi Non-Medis", currentNonMedisPositions, currentPageNonMedis, totalPagesNonMedis, setCurrentPageNonMedis)}
                {renderTable("Posisi Medis", currentMedisPositions, currentPageMedis, totalPagesMedis, setCurrentPageMedis)}
            </div>
        </div>
    );
}

