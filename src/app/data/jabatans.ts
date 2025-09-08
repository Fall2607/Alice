// File: app/data/jabatans.ts

export interface Jabatan {
    id: number;
    nama_jabatan: string;
}

export const jabatans: Jabatan[] = [
    { id: 1, nama_jabatan: 'Staff' },
    { id: 2, nama_jabatan: 'Koordinator' },
    { id: 3, nama_jabatan: 'Supervisor' },
    { id: 4, nama_jabatan: 'Wakil Direktur' },
    { id: 5, nama_jabatan: 'Direktur' },
];
