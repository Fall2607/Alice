// File: app/data/users.ts

export interface User {
    id: number;
    name: string;
    email: string;
    role: string; // Seharusnya cocok dengan nama dari roles.ts
    status: 'Aktif' | 'Non-Aktif';
}

export const users: User[] = [
    { id: 1, name: 'FallenNight', email: 'admin@avisena.co.id', role: 'Administrator', status: 'Aktif' },
    { id: 2, name: 'Jane Doe', email: 'jane.doe@avisena.co.id', role: 'HC Staff', status: 'Aktif' },
    { id: 3, name: 'John Smith', email: 'john.smith@avisena.co.id', role: 'Supervisor', status: 'Aktif' },
    { id: 4, name: 'Budi Santoso', email: 'budi.s@avisena.co.id', role: 'Konten Kreator', status: 'Non-Aktif' },
];
