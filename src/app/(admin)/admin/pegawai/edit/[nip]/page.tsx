// File: app/(admin)/admin/pegawai/edit/[nip]/page.tsx
"use client";

// Kode halaman ini akan sangat mirip dengan halaman Tambah Pegawai,
// namun dengan tambahan logika untuk mengambil data pegawai yang akan diedit
// dan mengirimkannya dengan metode PUT.

// Untuk saat ini, kita gunakan placeholder.
import Link from "next/link";
import { ChevronLeft } from "lucide-react";

export default function EditPegawaiPage({
  params,
}: {
  params: { nip: string };
}) {
  return (
    <div className="p-8">
      <div className="mb-6">
        <Link
          href="/admin/pegawai"
          className="inline-flex items-center gap-2 text-primary hover:text-primary-dark"
        >
          <ChevronLeft size={20} />
          Kembali ke Manajemen Pegawai
        </Link>
      </div>
      <div className="bg-white p-8 rounded-lg shadow-md">
        <h1 className="text-2xl font-bold text-primary-dark mb-6">
          Edit Data Pegawai (NIP: {params.nip})
        </h1>
        <p>Form untuk mengedit data pegawai akan ditampilkan di sini.</p>
      </div>
    </div>
  );
}
