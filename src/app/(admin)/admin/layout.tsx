// File: app/(admin)/admin/layout.tsx
"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from 'next/navigation';
import Sidebar from "@/app/components/admin/Sidebar";
import HeaderAdmin from "@/app/components/admin/HeaderAdmin";
import { Loader2 } from "lucide-react";
import { showInfoToast } from "@/app/components/admin/Alert"; // Asumsi Anda punya fungsi ini

// Tipe data untuk user yang login
interface LoggedInUser {
  name: string;
  role: string;
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [isVerifying, setIsVerifying] = useState(true);
  const [user, setUser] = useState<LoggedInUser | null>(null);
  
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

  // --- LOGIKA LOGOUT OTOMATIS ---

  // Fungsi untuk melakukan logout
  const handleLogout = useCallback(() => {
    // Hapus data sesi dari localStorage
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    
    // Beri notifikasi (opsional)
    // Anda bisa membuat fungsi showInfoToast di komponen Alert Anda
    // showInfoToast("Sesi Anda telah berakhir karena tidak aktif.");

    // Arahkan ke halaman login
    router.push('/login');
  }, [router]);


  useEffect(() => {
    // 1. Verifikasi token saat komponen dimuat
    const token = localStorage.getItem('authToken');
    const userDataString = localStorage.getItem('user');

    if (!token || !userDataString) {
      router.push('/login');
    } else {
      try {
        const userData = JSON.parse(userDataString);
        setUser(userData);
        setIsVerifying(false);
      } catch (error) {
        handleLogout(); // Jika data user korup, logout saja
        return;
      }
    }

    // 2. Setup timer untuk inactivity logout
    let inactivityTimer: NodeJS.Timeout;
    const inactivityTimeoutDuration = 15 * 60 * 1000; // 15 menit

    const resetTimer = () => {
      clearTimeout(inactivityTimer);
      inactivityTimer = setTimeout(handleLogout, inactivityTimeoutDuration);
    };

    // Event listener untuk mendeteksi aktivitas pengguna
    const events = ['mousemove', 'keydown', 'click', 'scroll'];
    events.forEach(event => window.addEventListener(event, resetTimer));

    // Inisialisasi timer saat komponen dimuat
    resetTimer();

    // Cleanup function: hapus event listener dan timer saat komponen di-unmount
    return () => {
      clearTimeout(inactivityTimer);
      events.forEach(event => window.removeEventListener(event, resetTimer));
    };

  }, [router, handleLogout]);


  const toggleSidebar = () => setIsCollapsed(!isCollapsed);
  const openLogoutModal = () => setIsLogoutModalOpen(true);
  const closeLogoutModal = () => setIsLogoutModalOpen(false);
  
  if (isVerifying) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-slate-50">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-slate-50">
      <Sidebar
        isCollapsed={isCollapsed}
        openLogoutModal={openLogoutModal}
        isLogoutModalOpen={isLogoutModalOpen}
        closeLogoutModal={closeLogoutModal}
        user={user}
      />
      <div className="flex flex-1 flex-col overflow-hidden">
        <HeaderAdmin
          toggleSidebar={toggleSidebar}
          openLogoutModal={openLogoutModal}
          user={user}
        />
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
}

