"use client";

import { useState, useEffect } from "react";
import { Loader2, Plus, Trash2, Key, Users } from "lucide-react";
import Select from "react-select";
import Modal from "@/app/components/modal";
import { showSuccessToast, showErrorToast } from "@/app/components/admin/Alert";

interface Delegation {
    id: string;
    karyawan_id: string;
    nama_karyawan: string;
    departemen_id: string;
    nama_departemen: string;
    created_at: string;
}

interface Karyawan {
    id: string;
    nama_lengkap: string;
}

interface Departemen {
    id: string;
    nama_departemen: string;
}

export default function DelegasiJadwalPage() {
    const [delegations, setDelegations] = useState<Delegation[]>([]);
    const [karyawans, setKaryawans] = useState<Karyawan[]>([]);
    const [departemens, setDepartemens] = useState<Departemen[]>([]);
    
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    
    // React Select states
    const [selectedKaryawan, setSelectedKaryawan] = useState<any>(null);
    const [selectedDepartemens, setSelectedDepartemens] = useState<any[]>([]);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const [resDel, resKar, resDep] = await Promise.all([
                fetch('/api/jadwal-kerja/delegasi'),
                fetch('/api/karyawan'),
                fetch('/api/departemen')
            ]);
            
            if (resDel.ok) setDelegations(await resDel.json());
            if (resKar.ok) setKaryawans(await resKar.json());
            if (resDep.ok) setDepartemens(await resDep.json());
        } catch (error) {
            console.error(error);
            showErrorToast("Gagal mengambil data");
        } finally {
            setIsLoading(false);
        }
    };

    const handleAdd = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!selectedKaryawan) {
            showErrorToast("Pilih staff terlebih dahulu!");
            return;
        }
        
        if (!selectedDepartemens || selectedDepartemens.length === 0) {
            showErrorToast("Pilih minimal satu departemen!");
            return;
        }

        setIsSubmitting(true);
        try {
            const departemen_ids = selectedDepartemens.map(d => d.value);
            
            const res = await fetch('/api/jadwal-kerja/delegasi', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    karyawan_id: selectedKaryawan.value, 
                    departemen_ids 
                })
            });
            const data = await res.json();
            if (res.ok) {
                if (data.duplicatesSkipped > 0) {
                    showSuccessToast(`Berhasil menambahkan ${data.inserted.length} delegasi (${data.duplicatesSkipped} dilewati karena sudah ada)`);
                } else {
                    showSuccessToast("Delegasi berhasil ditambahkan");
                }
                setIsAddModalOpen(false);
                setSelectedKaryawan(null);
                setSelectedDepartemens([]);
                fetchData();
            } else {
                showErrorToast(data.message || "Gagal menambahkan delegasi");
            }
        } catch (error) {
            showErrorToast("Terjadi kesalahan sistem");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Apakah Anda yakin ingin mencabut akses delegasi ini?")) return;
        try {
            const res = await fetch(`/api/jadwal-kerja/delegasi/${id}`, { method: 'DELETE' });
            if (res.ok) {
                showSuccessToast("Delegasi berhasil dicabut");
                fetchData();
            } else {
                showErrorToast("Gagal mencabut delegasi");
            }
        } catch (error) {
            showErrorToast("Terjadi kesalahan sistem");
        }
    };

    const karyawanOptions = karyawans.map(k => ({ value: k.id, label: k.nama_lengkap }));
    const departemenOptions = departemens.map(d => ({ value: d.id, label: d.nama_departemen }));

    if (isLoading) {
        return (
            <div className="flex h-64 items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
            </div>
        );
    }

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-6">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 tracking-tight flex items-center gap-3">
                        <div className="p-2.5 bg-blue-100 rounded-xl">
                            <Key className="h-6 w-6 text-blue-600" />
                        </div>
                        Delegasi Akses Jadwal
                    </h1>
                    <p className="mt-2 text-sm text-gray-500 max-w-2xl">
                        Berikan wewenang khusus kepada Staff (Non-Koordinator) untuk mengatur jadwal pada departemen/unit yang dipilih, tanpa perlu mengubah role asli mereka.
                    </p>
                </div>
                <button
                    onClick={() => setIsAddModalOpen(true)}
                    className="flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-blue-700 transition-all focus:ring-4 focus:ring-blue-100"
                >
                    <Plus className="h-5 w-5" />
                    Tambah Delegasi
                </button>
            </div>

            {/* Content Table */}
            <div className="rounded-2xl border border-gray-100 bg-white shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-gray-600">
                        <thead className="border-b border-gray-100 bg-gray-50/80 text-gray-700 uppercase tracking-wider text-xs">
                            <tr>
                                <th className="px-6 py-4 font-semibold">Nama Staff (Delegator)</th>
                                <th className="px-6 py-4 font-semibold">Departemen (Wewenang)</th>
                                <th className="px-6 py-4 font-semibold">Tanggal Diberikan</th>
                                <th className="px-6 py-4 text-right font-semibold">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {delegations.length > 0 ? (
                                delegations.map((del) => (
                                    <tr key={del.id} className="hover:bg-blue-50/50 transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700">
                                                    <Users className="h-4 w-4" />
                                                </div>
                                                <span className="font-semibold text-gray-900">{del.nama_karyawan}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                                {del.nama_departemen}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-gray-500">
                                            {new Date(del.created_at).toLocaleDateString('id-ID', { year: 'numeric', month: 'short', day: 'numeric' })}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button
                                                onClick={() => handleDelete(del.id)}
                                                className="text-gray-400 hover:text-red-500 hover:bg-red-50 p-2 rounded-lg transition-colors"
                                                title="Cabut Akses"
                                            >
                                                <Trash2 className="h-5 w-5" />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={4} className="px-6 py-12 text-center">
                                        <div className="flex flex-col items-center justify-center text-gray-400">
                                            <Key className="h-12 w-12 mb-3 text-gray-300" />
                                            <p className="text-base font-medium text-gray-900">Belum Ada Delegasi</p>
                                            <p className="text-sm mt-1">Anda belum memberikan akses khusus ke staff mana pun.</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <Modal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                title="Tambah Delegasi Akses"
            >
                <form onSubmit={handleAdd} className="space-y-5 p-2">
                    <div>
                        <label className="mb-1.5 block text-sm font-semibold text-gray-700">Pilih Staff (Delegator)</label>
                        <Select 
                            options={karyawanOptions}
                            value={selectedKaryawan}
                            onChange={(val) => setSelectedKaryawan(val)}
                            placeholder="Cari dan pilih staff..."
                            isClearable
                            className="text-sm"
                            styles={{
                                control: (baseStyles, state) => ({
                                  ...baseStyles,
                                  borderColor: state.isFocused ? '#3b82f6' : '#d1d5db',
                                  borderRadius: '0.5rem',
                                  padding: '2px'
                                }),
                            }}
                        />
                        <p className="mt-1.5 text-xs text-gray-500">Staff ini akan mendapatkan akses ke menu Manajemen Jadwal.</p>
                    </div>
                    
                    <div>
                        <label className="mb-1.5 block text-sm font-semibold text-gray-700">Departemen / Unit Wewenang</label>
                        <Select 
                            options={departemenOptions}
                            value={selectedDepartemens}
                            onChange={(val) => setSelectedDepartemens(val as any[])}
                            placeholder="Cari dan pilih unit..."
                            isMulti
                            isClearable
                            className="text-sm"
                            styles={{
                                control: (baseStyles, state) => ({
                                  ...baseStyles,
                                  borderColor: state.isFocused ? '#3b82f6' : '#d1d5db',
                                  borderRadius: '0.5rem',
                                  padding: '2px'
                                }),
                            }}
                        />
                        <p className="mt-1.5 text-xs text-gray-500">Anda dapat memilih lebih dari satu unit yang boleh diaturnya.</p>
                    </div>

                    <div className="mt-8 flex justify-end gap-3 border-t pt-4 border-gray-100">
                        <button
                            type="button"
                            onClick={() => setIsAddModalOpen(false)}
                            className="rounded-xl border border-gray-200 px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                            Batal
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-700 transition-colors disabled:opacity-50"
                        >
                            {isSubmitting ? <Loader2 className="h-5 w-5 animate-spin" /> : <Plus className="h-5 w-5" />}
                            Berikan Akses
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}
