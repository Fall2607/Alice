// File: app/(admin)/admin/pegawai/tambah/page.tsx
"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import DatePickerField from '@/app/components/admin/DatePickerField';
import SearchableSelect from '@/app/components/admin/SearchableSelect';
type Option = { value: number | string; label: string };

interface Department {
    id: number;
    nama_departemen: string;
}

interface LevelJabatan {
    id: number;
    nama_level: string;
}

const FormField = ({ label, children }: { label: string, children: React.ReactNode }) => (
    <div className="py-4 border-b border-slate-200">
        <label className="block text-sm font-medium text-slate-700 mb-1">{label}</label>
        {children}
    </div>
);

export default function TambahPegawaiPage() {
    const [departments, setDepartments] = useState<{ value: number; label: string }[]>([]);
    const [levelJabatans, setLevelJabatans] = useState<{ value: number; label: string }[]>([]);

    const [formData, setFormData] = useState({
        nip: '',
        nama_lengkap: '',
        nik: '',
        profesi: '',
        sip: '',
        masa_berlaku_sip: null as Date | null,
        handphone: '',
        email: '',
        tanggal_lahir: null as Date | null,
        jenis_kelamin: null as Option | null,
        alamat: '',
        tanggal_masuk: null as Date | null,
        status_kepegawaian: null as Option | null,
        gaji_pokok: 0,
        jabatan_id: null as Option | null,
        departemen_id: null as Option | null,
    });

    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL_LAN || process.env.NEXT_PUBLIC_API_BASE_URL;

    useEffect(() => {
        const fetchDataForDropdowns = async () => {
            try {
                const [deptRes, jabatanRes] = await Promise.all([
                    fetch(`${baseUrl}/api/departments`),
                    fetch(`${baseUrl}/api/level-jabatan`)
                ]);

                const deptData: Department[] = await deptRes.json();
                const jabatanData: LevelJabatan[] = await jabatanRes.json();

                setDepartments(deptData.map(d => ({ value: d.id, label: d.nama_departemen })));
                setLevelJabatans(jabatanData.map(j => ({ value: j.id, label: j.nama_level })));
            } catch (error) {
                console.error("Gagal mengambil data dropdown:", error);
            }
        };
        fetchDataForDropdowns();
    }, [baseUrl]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        console.log("Data Pegawai Baru:", {
            ...formData,
            jabatan_id: formData.jabatan_id?.value,
            departemen_id: formData.departemen_id?.value,
            jenis_kelamin: formData.jenis_kelamin?.value,
            status_kepegawaian: formData.status_kepegawaian?.value,
        });
        // Di sini Anda akan mengirim data ke API POST /api/pegawai
    };

    const inputClass = "w-full border-gray-300 rounded-md shadow-sm focus:border-primary focus:ring-primary focus:ring-opacity-50 text-sm p-2.5";

    return (
        <div className="p-8">
            <div className="mb-6">
                <Link href="/admin/pegawai" className="inline-flex items-center gap-2 text-primary hover:text-primary-dark">
                    <ChevronLeft size={20} />
                    Kembali ke Manajemen Pegawai
                </Link>
            </div>

            <form onSubmit={handleSubmit}>
                <div className="bg-white p-8 rounded-lg shadow-md">
                    <h1 className="text-2xl font-bold text-primary-dark mb-6 border-b pb-4">Form Tambah Pegawai Baru</h1>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-12">
                        {/* Kolom Kiri */}
                        <div>
                            <h2 className="text-lg font-semibold text-primary-dark mb-4 border-b pb-2">Data Diri & Kontak</h2>
                            <FormField label="NIP"><input type="text" value={formData.nip} onChange={e => setFormData({ ...formData, nip: e.target.value })} className={inputClass} placeholder="Contoh: AVS-2025-005" required /></FormField>
                            <FormField label="Nama Lengkap"><input type="text" value={formData.nama_lengkap} onChange={e => setFormData({ ...formData, nama_lengkap: e.target.value })} className={inputClass} placeholder="Masukkan nama lengkap" required /></FormField>
                            <FormField label="NIK"><input type="text" value={formData.nik} onChange={e => setFormData({ ...formData, nik: e.target.value })} className={inputClass} placeholder="Masukkan 16 digit NIK" required /></FormField>
                            <FormField label="Tanggal Lahir"><DatePickerField selected={formData.tanggal_lahir} onChange={date => setFormData({ ...formData, tanggal_lahir: date })} placeholderText="Pilih tanggal lahir" /></FormField>
                            <FormField label="Jenis Kelamin">
                                <SearchableSelect options={[{ value: 'Laki-laki', label: 'Laki-laki' }, { value: 'Perempuan', label: 'Perempuan' }]} value={formData.jenis_kelamin} onChange={option => setFormData({ ...formData, jenis_kelamin: option! })} />
                            </FormField>
                            <FormField label="No. Handphone"><input type="tel" value={formData.handphone} onChange={e => setFormData({ ...formData, handphone: e.target.value })} className={inputClass} placeholder="Contoh: 08123456789" /></FormField>
                            <FormField label="Email"><input type="email" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} className={inputClass} placeholder="Contoh: nama@avisena.co.id" /></FormField>
                            <FormField label="Alamat"><textarea value={formData.alamat} onChange={e => setFormData({ ...formData, alamat: e.target.value })} rows={3} className={inputClass} placeholder="Masukkan alamat lengkap"></textarea></FormField>
                        </div>

                        {/* Kolom Kanan */}
                        <div>
                            <h2 className="text-lg font-semibold text-primary-dark mb-4 border-b pb-2">Informasi Kepegawaian & Profesional</h2>
                            <FormField label="Tanggal Masuk"><DatePickerField selected={formData.tanggal_masuk} onChange={date => setFormData({ ...formData, tanggal_masuk: date })} placeholderText="Pilih tanggal masuk" /></FormField>
                            <FormField label="Status Kepegawaian">
                                <SearchableSelect options={[{ value: 'Aktif', label: 'Aktif' }, { value: 'Tidak Aktif', label: 'Tidak Aktif' }, { value: 'Cuti', label: 'Cuti' }]} value={formData.status_kepegawaian} onChange={option => setFormData({ ...formData, status_kepegawaian: option! })} />
                            </FormField>
                            <FormField label="Departemen">
                                <SearchableSelect options={departments} value={formData.departemen_id} onChange={option => setFormData({ ...formData, departemen_id: option })} placeholder="Cari & pilih departemen..." />
                            </FormField>
                            <FormField label="Level Jabatan">
                                <SearchableSelect options={levelJabatans} value={formData.jabatan_id} onChange={option => setFormData({ ...formData, jabatan_id: option })} placeholder="Cari & pilih level jabatan..." />
                            </FormField>
                            <FormField label="Profesi"><input type="text" value={formData.profesi} onChange={e => setFormData({ ...formData, profesi: e.target.value })} className={inputClass} placeholder="Contoh: Perawat, Staf IT" /></FormField>
                            <FormField label="No. SIP (jika ada)"><input type="text" value={formData.sip} onChange={e => setFormData({ ...formData, sip: e.target.value })} className={inputClass} placeholder="Masukkan nomor SIP" /></FormField>
                            <FormField label="Masa Berlaku SIP"><DatePickerField selected={formData.masa_berlaku_sip} onChange={date => setFormData({ ...formData, masa_berlaku_sip: date })} placeholderText="Pilih tanggal berlaku" /></FormField>
                            <FormField label="Gaji Pokok"><input type="number" value={formData.gaji_pokok} onChange={e => setFormData({ ...formData, gaji_pokok: Number(e.target.value) })} className={inputClass} placeholder="Contoh: 5000000" /></FormField>
                        </div>
                    </div>

                    <div className="mt-8 pt-6 border-t flex justify-end gap-4">
                        <Link href="/admin/pegawai" className="rounded-full bg-slate-200 px-6 py-2 text-sm font-semibold">Batal</Link>
                        <button type="submit" className="rounded-full bg-primary px-6 py-2 text-sm font-semibold text-white">Simpan Data</button>
                    </div>
                </div>
            </form>
        </div>
    );
}

