/**
 * Path: app/components/admin/AuthGuard.tsx
 * Deskripsi: Komponen pelindung global untuk mengecek hak akses rute (RBAC).
 */

"use client";

import React, { useState, useEffect } from "react";
import { Loader2, ShieldAlert, ArrowLeft, Lock } from "lucide-react";

/** * BAGIAN INTERNAL: Shim untuk Next.js Modules agar pratinjau tetap berjalan
 * Di proyek asli Anda, silakan gunakan: 
 * import { usePathname, useRouter } from "next/navigation";
 */
const usePathname = () => {
  if (typeof window !== 'undefined') return window.location.pathname;
  return "/admin";
};

const useRouter = () => ({
  push: (path: string) => { if (typeof window !== 'undefined') window.location.href = path; },
  back: () => { if (typeof window !== 'undefined') window.history.back(); }
});

interface AuthGuardProps {
  children: React.ReactNode;
}

export default function AuthGuard({ children }: AuthGuardProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "";

  /**
   * Fungsi rekursif untuk mencari apakah path saat ini ada di daftar menu yang diizinkan
   */
  const hasPermission = (menus: any[], currentPath: string): boolean => {
    // 1. Dashboard biasanya diizinkan untuk semua yang sudah login admin
    if (currentPath === "/admin") return true;
    // 2. Profil juga biasanya diizinkan untuk semua
    if (currentPath === "/admin/profile") return true;
    // 3. Kiosk absensi (jika rute ini ada di dalam grup admin)
    if (currentPath.startsWith("/absensi")) return true;

    for (const menu of menus) {
      // Cek kecocokan path (menangani sub-path juga)
      if (menu.href && currentPath.startsWith(menu.href) && menu.href !== "#") {
        return true;
      }
      // Cek di sub-menu jika ada
      if (menu.subItems && hasPermission(menu.subItems, currentPath)) {
        return true;
      }
    }
    return false;
  };

  const verifyAccess = async () => {
    setIsLoading(true);
    const userString = localStorage.getItem("user");
    
    if (!userString) {
      // Jika tidak ada user di storage, arahkan ke login
      router.push("/login");
      return;
    }

    try {
      const user = JSON.parse(userString);
      if (!user.role_id) throw new Error("Role ID tidak ditemukan");

      // Panggil API Menu Dinamis berdasarkan role user
      const res = await fetch(`${baseUrl}/auth/menu?roleId=${user.role_id}`);
      if (!res.ok) throw new Error("Gagal verifikasi menu");
      
      const allowedMenus = await res.json();
      
      // Validasi path saat ini terhadap menu yang diizinkan
      const authorized = hasPermission(allowedMenus, pathname);
      setIsAuthorized(authorized);
    } catch (error) {
      console.error("Authorization Guard Error:", error);
      // Fallback: Jika error, anggap tidak berhak demi keamanan
      setIsAuthorized(false);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    verifyAccess();
  }, [pathname]);

  // 1. Tampilan saat Loading Verifikasi
  if (isLoading) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center">
        <Loader2 className="animate-spin text-primary mb-4" size={48} />
        <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.4em]">Sistem Verifikasi Alice</p>
      </div>
    );
  }

  // 2. Tampilan jika Akses Ditolak (Global)
  if (isAuthorized === false) {
    return (
      <div className="min-h-[90vh] flex items-center justify-center p-6 bg-slate-50/50">
        <div className="max-w-md w-full text-center bg-white rounded-[48px] p-12 shadow-2xl shadow-slate-200/50 border border-white animate-in zoom-in duration-500">
          <div className="w-24 h-24 bg-red-50 text-red-500 rounded-[32px] flex items-center justify-center mx-auto mb-8 shadow-xl shadow-red-100/20">
            <ShieldAlert size={48} />
          </div>
          <h1 className="text-3xl font-black text-primary-dark tracking-tighter mb-4 leading-none">Akses Terbatas</h1>
          <p className="text-slate-500 font-medium leading-relaxed mb-10 px-2">
            Mohon maaf, Anda tidak memiliki izin untuk mengakses halaman <span className="text-primary font-black">{pathname}</span>.
          </p>
          <div className="space-y-4">
            <button 
              onClick={() => router.back()}
              className="w-full flex items-center justify-center gap-3 bg-primary text-white font-black py-4.5 rounded-2xl hover:bg-primary-dark transition-all shadow-xl shadow-primary/20 active:scale-95 text-xs uppercase tracking-widest"
            >
              <ArrowLeft size={18} /> Kembali
            </button>
            <button 
              onClick={() => router.push("/admin")}
              className="w-full py-2 text-[10px] font-black uppercase tracking-widest text-slate-300 hover:text-primary transition-colors"
            >
              Kembali ke Dashboard
            </button>
          </div>
          
          <div className="mt-10 pt-6 border-t border-slate-50 flex items-center justify-center gap-2 text-slate-300">
            <Lock size={12} />
            <span className="text-[9px] font-black uppercase tracking-[0.2em]">Alice Secure Guard</span>
          </div>
        </div>
      </div>
    );
  }

  // 3. Render halaman jika diizinkan
  return <>{children}</>;
}