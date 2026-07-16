/** * Path: app/components/admin/AuthGuard.tsx
 * Deskripsi: Guard rute berbasis izin menu dari database (RBAC).
 * Perbaikan: Menangani error kompilasi pratinjau dan menyempurnakan UI Alice (Blue & Navy)
 * agar nampak profesional dengan ukuran kartu yang pas.
 */

"use client";

import React, { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  Loader2,
  ShieldAlert,
  ArrowLeft,
  Lock,
  ShieldCheck,
  RefreshCcw,
  AlertOctagon,
  Fingerprint,
} from "lucide-react";

interface AuthGuardProps {
  children: React.ReactNode;
}

export default function AuthGuard({ children }: AuthGuardProps) {
  const pathname = usePathname();
  const router = useRouter();

  const [status, setStatus] = useState<"loading" | "authorized" | "denied">(
    "loading",
  );
  const [mounted, setMounted] = useState(false);
  const [errorDetail, setErrorDetail] = useState<string | null>(null);

  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "";

  /**
   * Fungsi Pencocokan Izin (Recursive) - VERSI KETAT ALICE
   * Memastikan rute induk tidak membocorkan akses ke sub-rute terlarang.
   */
  const hasPermission = (allowedMenus: any[], currentPath: string): boolean => {
    const normalizedCurrentPath = currentPath.replace(/\/$/, "");

    // 1. Whitelist rute dasar Alice yang selalu bisa diakses (setelah login)
    const whitelist = ["/admin", "/admin/profile"];
    if (whitelist.includes(normalizedCurrentPath)) return true;

    for (const menu of allowedMenus) {
      if (menu.href && menu.href !== "#" && menu.href !== null) {
        const normalizedMenuPath = menu.href.replace(/\/$/, "");

        /**
         * LOGIKA PENGETATAN ALICE:
         * 1. Jika izin adalah Dashboard utama ('/admin'), lakukan pencocokan EKSAK.
         * 2. Untuk modul fungsional, izinkan sub-path (misal: /admin/pegawai/tambah).
         */
        if (normalizedMenuPath === "/admin") {
          if (normalizedCurrentPath === "/admin") return true;
        } else {
          if (
            normalizedCurrentPath === normalizedMenuPath ||
            normalizedCurrentPath.startsWith(normalizedMenuPath + "/")
          ) {
            return true;
          }
        }
      }

      if (menu.subItems && Array.isArray(menu.subItems)) {
        if (hasPermission(menu.subItems, currentPath)) return true;
      }
    }
    return false;
  };

  useEffect(() => {
    setMounted(true);

    const verifyAccess = async () => {
      setErrorDetail(null);

      const userString =
        typeof window !== "undefined" ? localStorage.getItem("user") : null;
      if (!userString) {
        router.push("/login");
        return;
      }

      try {
        const user = JSON.parse(userString);
        if (!user.role_id)
          throw new Error("ID Peran tidak terdeteksi dalam sistem.");

        let allowedMenus = null;
        const cachedMenus = sessionStorage.getItem("alice_auth_menus");
        const cacheRole = sessionStorage.getItem("alice_auth_role");

        if (cachedMenus && cacheRole === String(user.role_id)) {
          allowedMenus = JSON.parse(cachedMenus);
        } else {
          setStatus("loading");
          
          let apiUrl = "/api/auth/menu";
          if (baseUrl) {
            const cleanBase = baseUrl.replace(/\/$/, "");
            apiUrl = cleanBase.endsWith("/api")
              ? `${cleanBase}/auth/menu`
              : `${cleanBase}/api/auth/menu`;
          }

          const res = await fetch(`${apiUrl}?roleId=${user.role_id}&karyawanId=${user.karyawan_id || ""}`);

          if (!res.ok) {
            const errorData = await res.json().catch(() => ({}));
            throw new Error(
              errorData.message || `Gangguan protokol (Status: ${res.status})`,
            );
          }

          allowedMenus = await res.json();
          sessionStorage.setItem("alice_auth_menus", JSON.stringify(allowedMenus));
          sessionStorage.setItem("alice_auth_role", String(user.role_id));
        }


        const isAllowed = hasPermission(allowedMenus, pathname);

        if (isAllowed) {
          setStatus("authorized");
        } else {
          setStatus("denied");
        }
      } catch (error: any) {
        console.error("AuthGuard Security System:", error.message);
        setErrorDetail(error.message);
        setStatus("denied");
      }
    };

    verifyAccess();
  }, [pathname, baseUrl, router]);

  if (!mounted) return null;

  // 1. Tampilan Loading dengan Gaya Alice
  if (status === "loading") {
    return (
      <div className="flex h-[80vh] items-center justify-center bg-slate-50">
        <div className="text-center">
          <Loader2 className="mx-auto h-12 w-12 animate-spin text-primary" />
          <p className="mt-4 text-slate-400 font-black text-xs uppercase tracking-[0.2em]">
            Validate Access...
          </p>
        </div>
      </div>
    );
  }

  // 2. Tampilan Akses Ditolak (Alice Premium Style - Fitting Size)
  if (status === "denied") {
    return (
      <div className="min-h-[80vh] flex items-center justify-center p-6 relative">
        {/* Background Aura Alice */}
        <div className="absolute top-1/4 left-1/4 w-48 h-48 bg-primary/5 blur-[80px] rounded-full -z-10"></div>
        <div className="absolute bottom-1/4 right-1/4 w-48 h-48 bg-indigo-600/5 blur-[80px] rounded-full -z-10"></div>

        <div className="max-w-lg w-full bg-white rounded-[40px] border border-slate-100 shadow-[0_30px_60px_-12px_rgba(0,45,90,0.08)] overflow-hidden animate-in zoom-in slide-in-from-bottom-4 duration-700">
          <div className="p-8 md:p-12 flex flex-col items-center text-center">
            {/* Security Indicator Alice Style (Smaller) */}
            <div className="relative mb-8 group">
              <div className="absolute inset-0 bg-primary/10 blur-2xl rounded-full scale-125 opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
              <div
                className={`relative w-24 h-24 rounded-[32px] flex items-center justify-center shadow-xl transition-all duration-700 group-hover:scale-105 ${errorDetail ? "bg-amber-50 text-amber-500" : "bg-slate-900 text-white shadow-slate-900/20"}`}
              >
                {errorDetail ? (
                  <AlertOctagon size={48} />
                ) : (
                  <ShieldAlert size={48} />
                )}
              </div>
              <div className="absolute -bottom-2 -right-2 bg-primary text-white p-2.5 rounded-xl shadow-lg border-4 border-white">
                <Lock size={16} />
              </div>
            </div>

            {/* Content Alice Style */}
            <div className="space-y-4">
              <div className="space-y-2">
                <span className="text-[9px] font-black text-primary uppercase tracking-[0.4em] bg-blue-50 px-4 py-1.5 rounded-full border border-blue-100">
                  Protocol 403
                </span>
                <h1 className="text-3xl font-black text-slate-900 tracking-tighter uppercase leading-tight">
                  {errorDetail ? "Sistem Terhambat" : "Akses Terbatas"}
                </h1>
              </div>

              <div className="h-1 w-12 bg-primary rounded-full mx-auto"></div>

              <p className="text-slate-500 text-sm font-medium leading-relaxed px-2">
                {errorDetail
                  ? `Inkonsistensi protokol saat verifikasi identitas: ${errorDetail}`
                  : `Akun Anda tidak memiliki otoritas sah untuk memasuki modul ${pathname}.`}
              </p>
            </div>

            {/* Action Group Alice Style */}
            <div className="mt-10 flex flex-col gap-3 w-full max-w-xs">
              <button
                onClick={() => router.push("/admin")}
                className="group flex items-center justify-center gap-2 bg-primary text-white font-black py-4 px-6 rounded-2xl hover:bg-[#001b3a] transition-all shadow-lg shadow-blue-600/20 active:scale-95 text-[10px] uppercase tracking-widest"
              >
                <ArrowLeft
                  size={16}
                  className="group-hover:-translate-x-1 transition-transform"
                />
                Ke Dashboard Utama
              </button>

              <button
                onClick={() => window.location.reload()}
                className="flex items-center justify-center gap-2 bg-slate-50 text-slate-500 font-black py-3.5 px-6 rounded-2xl hover:bg-white hover:shadow-md transition-all active:scale-95 text-[10px] uppercase tracking-widest border border-slate-200"
              >
                <RefreshCcw size={14} />
                Refresh Sesi
              </button>
            </div>

            {/* Authentication Footer Alice Style */}
            <div className="mt-12 w-full border-t border-slate-50 pt-8 flex flex-col items-center gap-3">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-100">
                  <Fingerprint size={12} className="text-primary" />
                  <span className="text-[8px] font-black uppercase tracking-[0.1em] text-slate-400">
                    ID Verified
                  </span>
                </div>
                <div className="flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-100">
                  <ShieldCheck size={12} className="text-emerald-500" />
                  <span className="text-[8px] font-black uppercase tracking-[0.1em] text-slate-400">
                    Alice 3.0
                  </span>
                </div>
              </div>
              <p className="text-[9px] text-slate-300 font-bold italic uppercase tracking-tighter">
                Hubungi IT Admin untuk permohonan akses
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 3. Tampilan Konten (Authorized)
  return <>{children}</>;
}
