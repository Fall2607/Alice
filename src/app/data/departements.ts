// File: app/data/departments.ts

export interface Department {
    id: number;
    name: string;
    category: 'Medis' | 'Non-Medis';
}

export const departments: Department[] = [
    // Medis
    { id: 1, name: 'Instalasi Gawat Darurat (IGD)', category: 'Medis' },
    { id: 2, name: 'Rawat Jalan (Poliklinik)', category: 'Medis' },
    { id: 3, name: 'Rawat Inap', category: 'Medis' },
    { id: 4, name: 'Instalasi Bedah Sentral', category: 'Medis' },
    { id: 5, name: 'Intensive Care Unit (ICU)', category: 'Medis' },
    { id: 6, name: 'Farmasi', category: 'Medis' },
    { id: 7, name: 'Laboratorium', category: 'Medis' },
    { id: 8, name: 'Radiologi', category: 'Medis' },
    { id: 9, name: 'Rehabilitasi Medis', category: 'Medis' },
    { id: 10, name: 'Gizi', category: 'Medis' },

    // Non-Medis
    { id: 11, name: 'Manajemen', category: 'Non-Medis' },
    { id: 12, name: 'Keuangan dan Akuntansi', category: 'Non-Medis' },
    { id: 13, name: 'Sumber Daya Manusia (HR)', category: 'Non-Medis' },
    { id: 14, name: 'Sistem Informasi Rumah Sakit (SIRS)', category: 'Non-Medis' },
    { id: 15, name: 'Pemasaran (Marketing)', category: 'Non-Medis' },
    { id: 16, name: 'Umum dan Logistik', category: 'Non-Medis' },
    { id: 17, name: 'Pemeliharaan Sarana (Teknisi)', category: 'Non-Medis' },
    { id: 18, name: 'Layanan Kebersihan (Laundry & Cleaning)', category: 'Non-Medis' },
];
