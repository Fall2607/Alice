"use client";

import React, { useState, useEffect } from "react";
import { Lock, ShieldCheck, Loader2, AlertTriangle, CheckCircle2, ArrowLeft, KeyRound } from "lucide-react";

/**
 * Halaman finalisasi registrasi Alice (Set Password)
 */
export default function App() {
  const [token, setToken] = useState<string | null>(null);
  const [password, setPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [status, setStatus] = useState<{ type: "success" | "error"; msg: string } | null>(null);

  /**
   * Mengambil token dari URL secara manual untuk kompatibilitas lingkungan pratinjau
   */
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const tokenParam = params.get("token");
      
      if (tokenParam) {
        setToken(tokenParam);
      } else {
        setStatus({ 
          type: "error", 
          msg: "Token aktivasi tidak ditemukan. Pastikan Anda membuka tautan dari email Alice dengan benar." 
        });
      }
    }
  }, []);

  /**
   * Menangani finalisasi pembuatan akun
   */
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      setStatus({ type: "error", msg: "Konfirmasi password tidak cocok." });
      return;
    }

    if (password.length < 6) {
      setStatus({ type: "error", msg: "Password minimal harus 6 karakter." });
      return;
    }

    setIsLoading(true);
    setStatus(null);

    try {
      const response = await fetch("/api/auth/register/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Gagal mengaktifkan akun.");
      }

      setStatus({ type: "success", msg: "Akun Alice Anda telah aktif! Mengalihkan ke login..." });
      
      setTimeout(() => {
        window.location.href = "/login";
      }, 3000);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Terjadi kesalahan sistem.";
      setStatus({ type: "error", msg });
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    e.currentTarget.src = "https://via.placeholder.com/150x43?text=Alice+App";
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-blue-50 font-sans p-6 overflow-hidden relative">
      {/* Ornamen Latar Belakang */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
        <div className="absolute top-[-10%] right-[-5%] w-[400px] h-[400px] bg-blue-400/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-[-10%] left-[-5%] w-[300px] h-[300px] bg-emerald-400/5 rounded-full blur-3xl"></div>
      </div>

      <div className="w-full max-w-[440px] relative z-10">
        <div className="bg-white/80 backdrop-blur-xl rounded-[32px] shadow-[0_20px_50px_rgba(0,0,0,0.05)] border border-white p-10 transition-all duration-500">
          <div className="mb-10 text-center">
            <div className="w-16 h-16 bg-blue-600/10 rounded-2xl flex items-center justify-center mx-auto mt-8 mb-4 rotate-3">
               <ShieldCheck className="text-blue-600" size={32} />
            </div>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              Selesaikan Pendaftaran
            </h1>
            <p className="text-slate-500 text-sm mt-2 font-medium">
              Atur kata sandi untuk akun Alice Anda
            </p>
          </div>

          {status && (
            <div className={`p-4 rounded-2xl mb-6 flex items-start gap-3 animate-in fade-in slide-in-from-top-1 duration-300 ${
              status.type === "success" 
                ? "bg-green-50 text-green-700 border border-green-100" 
                : "bg-red-50 text-red-700 border border-red-100"
            }`}>
              {status.type === "success" ? (
                <CheckCircle2 size={20} className="shrink-0 mt-0.5" />
              ) : (
                <AlertTriangle size={20} className="shrink-0 mt-0.5" />
              )}
              <span className="text-sm font-bold leading-relaxed">{status.msg}</span>
            </div>
          )}

          {token && status?.type !== "success" && (
            <form onSubmit={handleSubmit} className="space-y-5">
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
                    <span>Aktifkan Akun</span>
                    <KeyRound size={18} />
                  </>
                )}
              </button>
            </form>
          )}

          <div className="mt-10 pt-8 border-t border-slate-100 text-center">
            <a 
              href="/login" 
              className="inline-flex items-center gap-2 text-sm font-bold text-slate-400 hover:text-blue-600 transition-all group"
            >
              <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
              Batal & Kembali ke Login
            </a>
          </div>
        </div>
        
        <p className="mt-8 text-center text-[10px] text-slate-400 font-bold uppercase tracking-[0.3em]">
          Fallen • {new Date().getFullYear()}
        </p>
      </div>
    </div>
  );
}