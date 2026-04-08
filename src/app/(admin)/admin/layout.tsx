/**
 * Path: app/(admin)/admin/layout.tsx
 * Deskripsi: Layout utama admin dengan proteksi AuthGuard global + font khusus admin.
 */

"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter, usePathname } from "next/navigation";
import Sidebar from "@/app/components/admin/Sidebar";
import HeaderAdmin from "@/app/components/admin/HeaderAdmin";
import AuthGuard from "@/app/components/admin/AuthGuard";
import { Loader2 } from "lucide-react";
import { Inter } from "next/font/google";

// ✅ Font khusus admin (tidak global)
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-admin",
  display: "swap",
});

interface LoggedInUser {
  id: string;
  karyawan_id: string;
  role_id: string;
  name: string;
  role: string;
  jenis_kelamin: string;
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();

  const [isVerifying, setIsVerifying] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [user, setUser] = useState<LoggedInUser | null>(null);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

  /**
   * Logout handler
   */
  const handleLogout = useCallback(() => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("authToken");
      localStorage.removeItem("user");
    }
    router.push("/login");
  }, [router]);

  useEffect(() => {
    setMounted(true);

    const token = localStorage.getItem("authToken");
    const userDataString = localStorage.getItem("user");

    // 1. Validasi sesi
    if (!token || !userDataString) {
      router.push("/login");
    } else {
      try {
        const userData = JSON.parse(userDataString);
        setUser(userData);
        setIsVerifying(false);
      } catch (error) {
        handleLogout();
        return;
      }
    }

    // 2. Auto logout (15 menit idle)
    let inactivityTimer: NodeJS.Timeout;

    const resetTimer = () => {
      clearTimeout(inactivityTimer);
      inactivityTimer = setTimeout(handleLogout, 15 * 60 * 1000);
    };

    const events = ["mousemove", "keydown", "click", "scroll"];
    events.forEach((event) => window.addEventListener(event, resetTimer));

    resetTimer();

    return () => {
      clearTimeout(inactivityTimer);
      events.forEach((event) => window.removeEventListener(event, resetTimer));
    };
  }, [router, handleLogout]);

  /**
   * Prevent hydration error
   */
  if (!mounted || isVerifying) {
    return (
      <div className="flex h-screen w-full flex-col items-center justify-center bg-slate-50">
        <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">
          Memulai Sesi Alice...
        </p>
      </div>
    );
  }

  return (
    // ✅ Font hanya aktif di admin
    <div
      className={`${inter.variable} font-sans flex h-screen bg-slate-50 overflow-hidden`}
    >
      <Sidebar
        isCollapsed={isCollapsed}
        openLogoutModal={() => setIsLogoutModalOpen(true)}
        isLogoutModalOpen={isLogoutModalOpen}
        closeLogoutModal={() => setIsLogoutModalOpen(false)}
        user={user as any}
      />

      <div className="flex flex-1 flex-col min-w-0 overflow-hidden">
        <HeaderAdmin
          toggleSidebar={() => setIsCollapsed(!isCollapsed)}
          openLogoutModal={() => setIsLogoutModalOpen(true)}
          user={user as any}
        />

        {/* Proteksi halaman */}
        <main className="flex-1 overflow-y-auto p-6 custom-scrollbar bg-slate-50/50">
          <AuthGuard key={pathname}>{children}</AuthGuard>
        </main>
      </div>

      {/* Custom Scrollbar */}
      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #e2e8f0;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #cbd5e1;
        }
      `}</style>
    </div>
  );
}
