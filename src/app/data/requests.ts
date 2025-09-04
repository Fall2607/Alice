// File: app/data/requests.ts

export interface JobRequest {
  id: number;
  requester: string;
  department: string;
  position: string;
  quantity: number;
  requestDate: string;
  status: "Menunggu Persetujuan" | "Disetujui" | "Ditolak";
  urgency: "Tinggi" | "Sedang" | "Rendah";
}

export const jobRequests: JobRequest[] = [
  {
    id: 1,
    requester: "Dr. Herry Herman, Sp.OT",
    department: "Ortopedi",
    position: "Asisten Perawat",
    quantity: 2,
    requestDate: "2025-08-30",
    status: "Menunggu Persetujuan",
    urgency: "Tinggi",
  },
  {
    id: 2,
    requester: "Kepala IT",
    department: "Sistem Informasi Rumah Sakit (SIRS)",
    position: "IT Support Staff",
    quantity: 1,
    requestDate: "2025-08-28",
    status: "Disetujui",
    urgency: "Sedang",
  },
  {
    id: 3,
    requester: "Manajer Keuangan",
    department: "Keuangan dan Akuntansi",
    position: "Staf Akunting",
    quantity: 1,
    requestDate: "2025-08-25",
    status: "Ditolak",
    urgency: "Rendah",
  },
];
