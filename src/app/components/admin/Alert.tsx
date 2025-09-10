// File: app/components/admin/Alerts.ts
"use client";

import Swal from 'sweetalert2';

// Konfigurasi dasar untuk notifikasi toast (pop-up kecil)
const Toast = Swal.mixin({
    toast: true,
    position: 'top-end',
    showConfirmButton: false,
    timer: 3000,
    timerProgressBar: true,
    didOpen: (toast) => {
        toast.addEventListener('mouseenter', Swal.stopTimer);
        toast.addEventListener('mouseleave', Swal.resumeTimer);
    }
});

// Fungsi untuk menampilkan notifikasi toast sukses
export const showSuccessToast = (message: string) => {
    Toast.fire({
        icon: 'success',
        title: message
    });
};

// Fungsi untuk menampilkan notifikasi toast error
export const showErrorToast = (message: string) => {
    Toast.fire({
        icon: 'error',
        title: message
    });
};

