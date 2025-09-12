// File: app/data/roles.ts

export interface Role {
    id: number;
    name: string;
    description: string;
}

export const roles: Role[] = [
    { id: 1, name: 'Administrator', description: 'Akses penuh ke semua fitur admin.' },
    { id: 2, name: 'HC Staff', description: 'Mengelola data pegawai, lowongan, dan request.' },
    { id: 3, name: 'Supervisor', description: 'Dapat membuat request pegawai untuk departemennya.' },
    { id: 4, name: 'Konten Kreator', description: 'Mengelola artikel dan informasi di website.' },
];
