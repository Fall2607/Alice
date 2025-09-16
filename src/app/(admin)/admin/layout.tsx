// File: app/(admin)/admin/layout.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/app/components/admin/Sidebar";
import HeaderAdmin from "@/app/components/admin/HeaderAdmin";
import { Loader2 } from "lucide-react";

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
  // State untuk menandakan proses verifikasi token sedang berjalan
  const [isVerifying, setIsVerifying] = useState(true);
  // State untuk menyimpan data user yang login
  const [user, setUser] = useState<LoggedInUser | null>(null);

  // State untuk tampilan UI (sidebar, modal)
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

  useEffect(() => {
    // 1. Ambil token dan data user dari localStorage
    const token = localStorage.getItem("authToken");
    const userDataString = localStorage.getItem("user");

    if (!token || !userDataString) {
      // 2. Jika salah satu tidak ada, alihkan ke halaman login
      router.push("/login");
    } else {
      try {
        // 3. Parse data user dari string JSON
        const userData = JSON.parse(userDataString);
        setUser(userData);
      } catch (error) {
        // Jika data user tidak valid, hapus dan redirect
        localStorage.removeItem("authToken");
        localStorage.removeItem("user");
        router.push("/login");
        return; // Hentikan eksekusi
      }
      // 4. Proses verifikasi selesai
      setIsVerifying(false);
    }
  }, [router]);

  const toggleSidebar = () => setIsCollapsed(!isCollapsed);
  const openLogoutModal = () => setIsLogoutModalOpen(true);
  const closeLogoutModal = () => setIsLogoutModalOpen(false);

  // Selama proses verifikasi, tampilkan layar loading
  if (isVerifying) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-slate-50">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Jika verifikasi berhasil, tampilkan layout admin yang sebenarnya
  return (
    <div className="flex h-screen bg-slate-50">
      <Sidebar
        isCollapsed={isCollapsed}
        openLogoutModal={openLogoutModal}
        isLogoutModalOpen={isLogoutModalOpen}
        closeLogoutModal={closeLogoutModal}
        user={user} // Teruskan data user ke Sidebar
      />
      <div className="flex flex-1 flex-col overflow-hidden">
        <HeaderAdmin
          toggleSidebar={toggleSidebar}
          openLogoutModal={openLogoutModal}
          user={user} // Teruskan data user ke HeaderAdmin
        />
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
}
