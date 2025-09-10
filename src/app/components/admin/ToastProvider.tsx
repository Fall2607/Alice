// File: app/components/admin/ToastProvider.tsx
"use client";

import { Toaster } from 'sonner';

export default function ToastProvider() {
    // Komponen Toaster akan menangani penampilan semua notifikasi
    // richColors akan memberikan warna otomatis untuk success (hijau), error (merah), dll.
    // position="top-right" memindahkan notifikasi ke pojok kanan atas.
    // closeButton menambahkan tombol 'x' untuk menutup notifikasi secara manual.
    return <Toaster position="top-right" richColors closeButton />;
}

