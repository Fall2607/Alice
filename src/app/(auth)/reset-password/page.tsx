"use client";

import React, { useState, useEffect } from "react";
import { Lock, ShieldCheck, Loader2, AlertTriangle, CheckCircle2, ArrowLeft, KeyRound } from "lucide-react";

/**
 * Interface untuk respon API Reset Password
 */
interface ResetResponse {
  message: string;
}

export default function App() {
  const [token, setToken] = useState<string | null>(null);
  const [password, setPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  /**
   * Mengambil token dari URL menggunakan window.location.search 
   * untuk memastikan kompatibilitas di lingkungan pratinjau.
   */
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const t = params.get("token");
      if (t) {
        setToken(t);
      } else {
        setError("Token tidak valid atau tidak ditemukan. Silakan ajukan ulang permintaan reset password.");
      }
    }
  }, []);

  /**
   * Menangani pengiriman form reset password
   */
  const handleReset = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      setError("Konfirmasi password tidak cocok.");
      return;
    }

    if (password.length < 6) {
      setError("Password minimal harus 6 karakter.");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, newPassword: password }),
      });

      const data: ResetResponse = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Gagal memperbarui password.");
      }

      setSuccessMsg("Password berhasil diperbarui! Mengalihkan ke login...");
      
      setTimeout(() => {
        window.location.href = "/login";
      }, 3000);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan sistem.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>): void => {
    e.currentTarget.src = "https://via.placeholder.com/150x43?text=Alice+App";
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-blue-50 font-sans p-6">
      {/* Ornamen Latar Belakang */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
        <div className="absolute top-[-10%] left-[-5%] w-[400px] h-[400px] bg-blue-400/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-[-10%] left-[-5%] w-[300px] h-[300px] bg-emerald-400/5 rounded-full blur-3xl"></div>
      </div>

      <div className="w-full max-w-[440px]">
        <div className="bg-white/80 backdrop-blur-xl rounded-[32px] shadow-[0_20px_50px_rgba(0,0,0,0.05)] border border-white p-10 transition-all duration-500">
          <div className="mb-10 text-center">
            <div className="w-16 h-16 bg-blue-600/10 rounded-2xl flex items-center justify-center mx-auto mt-8 mb-4 rotate-3">
               <KeyRound className="text-blue-600" size={32} />
            </div>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              Reset Password
            </h1>
            <p className="text-slate-500 text-sm mt-2 font-medium">
              Amankan kembali akses akun Alice Anda
            </p>
          </div>

          {/* Notifikasi Status */}
          {error && (
            <div className="mb-6 flex items-start gap-3 rounded-2xl bg-red-50 p-4 text-xs font-bold text-red-600 border border-red-100 animate-in fade-in slide-in-from-top-2">
              <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
              <p>{error}</p>
            </div>
          )}

          {successMsg && (
            <div className="mb-6 flex items-start gap-3 rounded-2xl bg-green-50 p-4 text-xs font-bold text-green-600 border border-green-100 animate-in fade-in slide-in-from-top-2">
              <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5" />
              <p>{successMsg}</p>
            </div>
          )}

          {token && !successMsg && (
            <form onSubmit={handleReset} className="space-y-5">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.15em] ml-4">
                  Password Baru
                </label>
                <div className="relative group">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors">
                    <Lock size={18} />
                  </div>
                  <input
                    type="password"
                    required
                    disabled={isLoading}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-12 pr-6 py-3.5 bg-slate-50/50 border border-slate-200 rounded-2xl focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all duration-200 text-sm font-medium text-slate-700"
                    placeholder="Minimal 6 karakter"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.15em] ml-4">
                  Konfirmasi Password
                </label>
                <div className="relative group">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors">
                    <Lock size={18} />
                  </div>
                  <input
                    type="password"
                    required
                    disabled={isLoading}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className={`w-full pl-12 pr-6 py-3.5 bg-slate-50/50 border rounded-2xl focus:bg-white outline-none transition-all duration-200 text-sm font-medium text-slate-700 ${
                      confirmPassword && password !== confirmPassword 
                        ? "border-red-500 focus:ring-4 focus:ring-red-500/10" 
                        : "border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                    }`}
                    placeholder="Ulangi password baru"
                  />
                </div>
                {confirmPassword && password !== confirmPassword && (
                  <p className="text-[10px] text-red-500 font-bold mt-1 uppercase tracking-tighter ml-4 animate-in fade-in">
                    Password tidak cocok!
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-3 bg-blue-600 px-6 py-4 rounded-2xl text-sm font-bold text-white shadow-xl shadow-blue-500/20 hover:bg-blue-700 hover:shadow-blue-500/30 active:scale-[0.98] transition-all duration-300 disabled:bg-slate-300 disabled:shadow-none"
              >
                {isLoading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <>
                    <span>Simpan Password</span>
                    <ShieldCheck size={18} />
                  </>
                )}
              </button>
            </form>
          )}

          <div className="mt-10 pt-8 border-t border-slate-100 flex justify-center">
            <a 
              href="/login" 
              className="inline-flex items-center gap-2 text-sm font-bold text-slate-400 hover:text-blue-600 transition-all group"
            >
              <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
              Kembali ke Login
            </a>
          </div>
        </div>
        
        {/* Footer info updated */}
        <p className="mt-8 text-center text-[10px] text-slate-400 font-bold uppercase tracking-[0.3em]">
          Fallen • {new Date().getFullYear()}
        </p>
      </div>
    </div>
  );
}