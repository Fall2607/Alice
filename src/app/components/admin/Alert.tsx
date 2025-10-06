// File: src/app/components/admin/Alert.tsx
"use client";

import toast, { Toaster, ToastBar } from 'react-hot-toast';
import { CheckCircle, XCircle, AlertTriangle, Info } from 'lucide-react';

// --- Fungsi untuk memicu notifikasi ---

/**
 * Menampilkan notifikasi toast sukses.
 * @param message - Pesan yang akan ditampilkan.
 */
export const showSuccessToast = (message: string) => {
  toast.custom(
    (t) => (
      <div
        className={`${
          t.visible ? 'animate-enter' : 'animate-leave'
        } pointer-events-auto flex w-full max-w-sm items-center rounded-lg bg-white shadow-lg ring-1 ring-black ring-opacity-5`}
      >
        <div className="flex w-0 flex-1 items-center p-4">
          <div className="flex-shrink-0 text-green-500">
            <CheckCircle />
          </div>
          <div className="ml-3 flex-1">
            <p className="text-sm font-medium text-slate-900">Berhasil!</p>
            <p className="mt-1 text-sm text-slate-500">{message}</p>
          </div>
        </div>
        <div className="flex border-l border-slate-200">
          <button
            onClick={() => toast.dismiss(t.id)}
            className="flex w-full items-center justify-center rounded-none rounded-r-lg border border-transparent p-4 text-sm font-medium text-primary hover:text-primary-dark focus:outline-none focus:ring-2 focus:ring-primary"
          >
            Tutup
          </button>
        </div>
      </div>
    ),
    { duration: 4000 }
  );
};

/**
 * Menampilkan notifikasi toast error.
 * @param message - Pesan yang akan ditampilkan.
 */
export const showErrorToast = (message: string) => {
  toast.custom(
    (t) => (
      <div
        className={`${
          t.visible ? 'animate-enter' : 'animate-leave'
        } pointer-events-auto flex w-full max-w-sm items-center rounded-lg bg-white shadow-lg ring-1 ring-black ring-opacity-5`}
      >
        <div className="flex w-0 flex-1 items-center p-4">
          <div className="flex-shrink-0 text-red-500">
            <XCircle />
          </div>
          <div className="ml-3 flex-1">
            <p className="text-sm font-medium text-slate-900">Gagal!</p>
            <p className="mt-1 text-sm text-slate-500">{message}</p>
          </div>
        </div>
        <div className="flex border-l border-slate-200">
          <button
            onClick={() => toast.dismiss(t.id)}
            className="flex w-full items-center justify-center rounded-none rounded-r-lg border border-transparent p-4 text-sm font-medium text-primary hover:text-primary-dark focus:outline-none focus:ring-2 focus:ring-primary"
          >
            Tutup
          </button>
        </div>
      </div>
    ),
    { duration: 6000 } // Error ditampilkan lebih lama
  );
};

/**
 * Menampilkan notifikasi toast informasi.
 * @param message - Pesan yang akan ditampilkan.
 */
export const showInfoToast = (message: string) => {
    toast.custom(
      (t) => (
        <div
          className={`${
            t.visible ? 'animate-enter' : 'animate-leave'
          } pointer-events-auto flex w-full max-w-sm items-center rounded-lg bg-white shadow-lg ring-1 ring-black ring-opacity-5`}
        >
          <div className="flex w-0 flex-1 items-center p-4">
            <div className="flex-shrink-0 text-blue-500">
              <Info />
            </div>
            <div className="ml-3 flex-1">
              <p className="text-sm font-medium text-slate-900">Informasi</p>
              <p className="mt-1 text-sm text-slate-500">{message}</p>
            </div>
          </div>
          <div className="flex border-l border-slate-200">
            <button
              onClick={() => toast.dismiss(t.id)}
              className="flex w-full items-center justify-center rounded-none rounded-r-lg border border-transparent p-4 text-sm font-medium text-primary hover:text-primary-dark focus:outline-none focus:ring-2 focus:ring-primary"
            >
              Tutup
            </button>
          </div>
        </div>
      ),
      { duration: 4000 }
    );
  };

/**
 * Komponen Provider untuk Toaster.
 * Komponen ini HARUS dipasang di layout utama aplikasi Anda (misal: layout.tsx terluar)
 * agar notifikasi bisa muncul di halaman manapun.
 */
export function ToasterProvider() {
  return (
    <Toaster position="top-right" reverseOrder={false}>
      {(t) => (
        <ToastBar toast={t}>
          {({ icon, message }) => (
            <>
              {icon}
              {message}
            </>
          )}
        </ToastBar>
      )}
    </Toaster>
  );
}
