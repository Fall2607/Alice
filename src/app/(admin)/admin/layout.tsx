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
import { Loader2, AlertCircle, CheckCircle2, ArrowRight, FileCheck2 } from "lucide-react";
import { Inter } from "next/font/google";
import Modal from "@/app/components/modal";

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
  pas_foto_url?: string | null;
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
  const [isMobile, setIsMobile] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [profileCompletenessPrompt, setProfileCompletenessPrompt] = useState<{
    isOpen: boolean;
    percentage: number;
    missingSections: string[];
    pillars: {
      identity: boolean;
      family: boolean;
      education: boolean;
      documents: boolean;
    };
  } | null>(null);

  /**
   * Logout handler
   */
  const handleLogout = useCallback(() => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("authToken");
      localStorage.removeItem("user");
      sessionStorage.removeItem("profile_prompt_skipped");
    }
    router.push("/login");
  }, [router]);

  useEffect(() => {
    setMounted(true);

    const handleResize = () => {
      if (window.innerWidth < 768) {
        setIsCollapsed(true); // Auto close on mobile
        setIsMobile(true);
      } else {
        setIsCollapsed(false); // Auto open on desktop
        setIsMobile(false);
      }
    };

    // Set initial layout
    handleResize();
    window.addEventListener("resize", handleResize);

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
      } catch {
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
      window.removeEventListener("resize", handleResize);
    };
  }, [router, handleLogout]);

  // Close sidebar on route change for mobile
  useEffect(() => {
    if (isMobile) {
      setIsCollapsed(true);
    }
  }, [pathname, isMobile]);

  // Cek kelengkapan data diri karyawan 1x setiap sesi login & sinkronkan pas foto terbaru
  useEffect(() => {
    if (!user?.karyawan_id) return;
    if (typeof window === "undefined") return;

    let cancelled = false;
    fetch(`/api/karyawan/${user.karyawan_id}/profile-lengkap`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (cancelled || !data) return;

        // Update pas_foto_url di state user dan localStorage jika ada
        const newFotoUrl = data.documents?.pas_foto_url || null;
        if (newFotoUrl && newFotoUrl !== user.pas_foto_url) {
          const updatedUser = { ...user, pas_foto_url: newFotoUrl };
          setUser(updatedUser);
          localStorage.setItem("user", JSON.stringify(updatedUser));
          window.dispatchEvent(new Event("user-updated"));
        }

        if (sessionStorage.getItem("profile_prompt_skipped") === "true") return;

        if (data.completeness && !data.completeness.is_complete) {
          setProfileCompletenessPrompt({
            isOpen: true,
            percentage: data.completeness.percentage ?? 0,
            missingSections: data.completeness.missing_sections || [],
            pillars: data.completeness.pillars || {
              identity: false,
              family: false,
              education: false,
              documents: false,
            },
          });
        }
      })
      .catch(() => {});

    // Listener custom event jika user memperbarui foto di halaman edit profile
    const handleUserUpdated = () => {
      const stored = localStorage.getItem("user");
      if (stored) {
        try {
          setUser(JSON.parse(stored));
        } catch {}
      }
    };
    window.addEventListener("user-updated", handleUserUpdated);

    return () => {
      cancelled = true;
      window.removeEventListener("user-updated", handleUserUpdated);
    };
  }, [user?.karyawan_id]);

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
      className={`${inter.variable} font-sans flex h-screen bg-slate-50 overflow-hidden relative`}
    >
      {/* Mobile Overlay */}
      {!isCollapsed && isMobile && (
        <div 
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40 transition-opacity"
          onClick={() => setIsCollapsed(true)}
        />
      )}

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
        <main className="flex-1 overflow-y-auto p-3 md:p-6 custom-scrollbar bg-slate-50/50">
          <AuthGuard key={pathname}>{children}</AuthGuard>
        </main>
      </div>

      <Modal
        isOpen={isLogoutModalOpen}
        onClose={() => setIsLogoutModalOpen(false)}
        title="Konfirmasi Logout"
        size="sm" // Menggunakan ukuran "sm" agar kotak tidak terlalu lebar
      >
        <div>
          <p className="mb-6 text-sm text-slate-500 font-medium">
            Apakah Anda yakin ingin keluar dari sistem? Anda harus login kembali untuk mengakses halaman ini.
          </p>
          <div className="flex justify-end gap-3">
            <button
              onClick={() => setIsLogoutModalOpen(false)}
              className="rounded-md px-4 py-2 text-sm font-bold text-slate-600 hover:bg-slate-100 transition-colors"
            >
              Batal
            </button>
            <button
              onClick={handleLogout}
              className="rounded-md bg-red-500 px-4 py-2 text-sm font-bold text-white hover:bg-red-600 transition-colors shadow-md shadow-red-100"
            >
              Ya, Keluar
            </button>
          </div>
        </div>
      </Modal>

      {/* Modal Notifikasi Pengingat Kelengkapan Data Diri Karyawan */}
      <Modal
        isOpen={Boolean(profileCompletenessPrompt?.isOpen) && pathname !== "/admin/profile/edit"}
        onClose={() => {
          sessionStorage.setItem("profile_prompt_skipped", "true");
          setProfileCompletenessPrompt((prev) => (prev ? { ...prev, isOpen: false } : null));
        }}
        title="Kelengkapan Data Informasi Diri Pegawai"
        size="lg"
      >
        {profileCompletenessPrompt && (
          <div className="space-y-5">
            <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200 flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0 mt-0.5">
                <FileCheck2 size={20} />
              </div>
              <div className="space-y-1 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-extrabold text-slate-900">
                    Halo, {user?.name || "Rekan RSU Avisena"}!
                  </p>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-mono tabular-nums font-extrabold bg-amber-500 text-white">
                    {profileCompletenessPrompt.percentage}% Lengkap
                  </span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed font-medium">
                  Anda memiliki data informasi diri dan dokumen kepegawaian yang belum lengkap.
                  Mohon lengkapi data Anda untuk pemutakhiran arsip Human Capital RSU Avisena.
                </p>
                <div className="w-full h-2 bg-amber-200/70 rounded-full overflow-hidden mt-2">
                  <div
                    className="h-full bg-amber-500 rounded-full transition-all duration-500"
                    style={{ width: `${profileCompletenessPrompt.percentage}%` }}
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Status 4 Kategori Wajib:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {[
                  { label: "Identitas Diri & Kontak", ok: profileCompletenessPrompt.pillars.identity },
                  { label: "Data Keluarga (Ortu / Pasangan)", ok: profileCompletenessPrompt.pillars.family },
                  { label: "Riwayat Pendidikan Formal", ok: profileCompletenessPrompt.pillars.education },
                  { label: "Dokumen Utama (Foto, KTP, KK, Ijazah)", ok: profileCompletenessPrompt.pillars.documents },
                ].map((item) => (
                  <div
                    key={item.label}
                    className={`flex items-center gap-2.5 p-3 rounded-xl border text-xs font-bold ${
                      item.ok
                        ? "bg-emerald-50/60 border-emerald-200 text-emerald-800"
                        : "bg-slate-50 border-slate-200 text-slate-700"
                    }`}
                  >
                    {item.ok ? (
                      <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
                    ) : (
                      <AlertCircle size={16} className="text-amber-500 shrink-0" />
                    )}
                    <span>{item.label}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => {
                  sessionStorage.setItem("profile_prompt_skipped", "true");
                  setProfileCompletenessPrompt((prev) => (prev ? { ...prev, isOpen: false } : null));
                }}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-bold uppercase tracking-wider transition-all cursor-pointer"
              >
                Lewati / Nanti Saja
              </button>
              <button
                type="button"
                onClick={() => {
                  sessionStorage.setItem("profile_prompt_skipped", "true");
                  setProfileCompletenessPrompt((prev) => (prev ? { ...prev, isOpen: false } : null));
                  router.push("/admin/profile/edit");
                }}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-primary hover:bg-primary-dark text-white text-xs font-bold uppercase tracking-wider shadow-md transition-all active:scale-[0.98] cursor-pointer"
              >
                <span>Isi Data Sekarang</span>
                <ArrowRight size={14} />
              </button>
            </div>
          </div>
        )}
      </Modal>

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
