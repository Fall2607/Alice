// File: app/data/employees.ts

export interface Employee {
    id: number;
    nip: string;
    nama_lengkap: string;
    nik: string;
    profesi: string;
    sip?: string; // Surat Izin Praktik (opsional)
    masa_berlaku_sip?: string; // Opsional
    handphone: string;
    email: string;
    tanggal_lahir: string;
    jenis_kelamin: 'Laki-laki' | 'Perempuan';
    alamat: string;
    tanggal_masuk: string;
    status_kepegawaian: 'Aktif' | 'Tidak Aktif' | 'Cuti';
    // Kolom lain bisa ditambahkan sesuai kebutuhan
}

export const employees: Employee[] = [
    {
        id: 1,
        nip: 'AVS-2018-001',
        nama_lengkap: 'dr. H. Aries Wiganda, Sp.A.',
        nik: '3277011234567890',
        profesi: 'Dokter Spesialis',
        sip: '123/SIP/DOK/2018',
        masa_berlaku_sip: '2028-03-15',
        handphone: '081234567890',
        email: 'aries.wiganda@avisena.co.id',
        tanggal_lahir: '1980-05-20',
        jenis_kelamin: 'Laki-laki',
        alamat: 'Jl. Melong Asih No. 1, Cimahi',
        tanggal_masuk: '2018-03-15',
        status_kepegawaian: 'Aktif',
    },
    {
        id: 2,
        nip: 'AVS-2019-002',
        nama_lengkap: 'Siti Aminah, S.Kep., Ners',
        nik: '3277011234567891',
        profesi: 'Perawat',
        sip: '456/SIP/PER/2019',
        masa_berlaku_sip: '2029-07-20',
        handphone: '081234567891',
        email: 'siti.aminah@avisena.co.id',
        tanggal_lahir: '1992-11-12',
        jenis_kelamin: 'Perempuan',
        alamat: 'Jl. Cihanjuang No. 15, Cimahi',
        tanggal_masuk: '2019-07-20',
        status_kepegawaian: 'Aktif',
    },
    {
        id: 3,
        nip: 'AVS-2021-003',
        nama_lengkap: 'Bambang Supriadi',
        nik: '3277011234567892',
        profesi: 'Driver',
        handphone: '081234567892',
        email: 'bambang.s@avisena.co.id',
        tanggal_lahir: '1988-01-30',
        jenis_kelamin: 'Laki-laki',
        alamat: 'Jl. Leuwi Gajah No. 22, Cimahi',
        tanggal_masuk: '2021-01-10',
        status_kepegawaian: 'Aktif',
    },
    {
        id: 4,
        nip: 'AVS-2020-004',
        nama_lengkap: 'Rina Marlina, S.E.',
        nik: '3277011234567893',
        profesi: 'Staf Keuangan',
        handphone: '081234567893',
        email: 'rina.marlina@avisena.co.id',
        tanggal_lahir: '1995-08-17',
        jenis_kelamin: 'Perempuan',
        alamat: 'Jl. Baros No. 5, Cimahi',
        tanggal_masuk: '2020-05-01',
        status_kepegawaian: 'Tidak Aktif',
    },
];

