"use client";

import React, { useState } from "react";
import { AlertTriangle, Loader2, UserPlus, LogIn, Mail, Lock } from "lucide-react";

/**
 * Interface untuk data user yang akan disimpan di localStorage
 */
interface UserData {
  id: string;
  karyawan_id: string;
  role_id: string; // Dibutuhkan untuk Sidebar dinamis
  name: string;
  email: string;
  role: string;
  jenis_kelamin: string; // Dibutuhkan untuk foto profil default
}

interface LoginResponse {
  message?: string;
  token?: string;
  user?: UserData;
}

export default function App() {
  const [identifier, setIdentifier] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  /**
   * Menangani proses login dan menyimpan data ke localStorage
   */
  const handleLogin = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier, password }),
      });

      const data: LoginResponse = await response.json();
      if (!response.ok) throw new Error(data.message || "Login gagal.");

      // Simpan Token dan Data User (termasuk role_id)
      if (data.token) localStorage.setItem("authToken", data.token);
      if (data.user) localStorage.setItem("user", JSON.stringify(data.user));

      // Redirect ke dashboard admin
      window.location.href = "/admin";
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan tidak dikenal.");
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
        <div className="absolute top-[-10%] right-[-5%] w-[400px] h-[400px] bg-blue-400/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-[-10%] left-[-5%] w-[300px] h-[300px] bg-emerald-400/5 rounded-full blur-3xl"></div>
      </div>

      <div className="w-full max-w-[440px]">
        <div className="bg-white/80 backdrop-blur-xl rounded-[32px] shadow-[0_20px_50px_rgba(0,0,0,0.05)] border border-white p-10 transition-all duration-500">
          <div className="mb-10 text-center">
            <a href="/">
              <img
                src="/brand-avisena.png"
                alt="Logo Alice"
                width={160}
                className="mx-auto drop-shadow-sm transition-transform hover:scale-105 duration-300"
                onError={handleImageError}
              />
            </a>
            <h1 className="mt-8 text-3xl font-extrabold text-slate-900 tracking-tight">
              Selamat Datang
            </h1>
            <p className="text-slate-500 text-sm mt-2 font-medium">
              Masuk ke Dashboard Alice
            </p>
          </div>

          {error && (
            <div className="mb-6 flex items-center gap-3 rounded-2xl bg-red-50 p-4 text-xs font-bold text-red-600 border border-red-100 animate-in fade-in slide-in-from-top-2">
              <AlertTriangle className="h-4 w-4 shrink-0" />
              <p>{error}</p>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            {/* Input Email atau NIP */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.15em] ml-4">
                Email atau NIP
              </label>
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors">
                  <Mail size={18} />
                </div>
                <input
                  type="text"
                  required
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  className="w-full pl-12 pr-6 py-3.5 bg-slate-50/50 border border-slate-200 rounded-2xl focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all duration-200 text-sm font-medium text-slate-700"
                  placeholder="Masukkan email atau NIP"
                />
              </div>
            </div>

            {/* Input Password dengan Tautan Lupa Password */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between ml-4 mr-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.15em]">
                  Kata Sandi
                </label>
                <a 
                  href="/forgot-password" 
                  className="text-[10px] font-bold text-blue-600 hover:text-blue-800 transition-colors uppercase tracking-widest"
                >
                  Lupa?
                </a>
              </div>
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors">
                  <Lock size={18} />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-12 pr-6 py-3.5 bg-slate-50/50 border border-slate-200 rounded-2xl focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all duration-200 text-sm font-medium text-slate-700"
                  placeholder="••••••••"
                />
              </div>
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
                  <span>Masuk Sistem</span>
                  <LogIn size={18} />
                </>
              )}
            </button>
          </form>

          {/* Footer Card: Daftar Akun Baru */}
          <div className="mt-10 pt-8 border-t border-slate-100 text-center">
            <p className="text-sm text-slate-500 font-medium">
              Belum punya akses?{" "}
              <a 
                href="/register" 
                className="inline-flex items-center gap-1.5 font-bold text-blue-600 hover:text-blue-800 transition-colors"
              >
                <UserPlus size={16} />
                Daftar Akun Baru
              </a>
            </p>
          </div>
        </div>
        
        {/* Nama Pengembang */}
        <p className="mt-8 text-center text-[10px] text-slate-400 font-bold uppercase tracking-[0.3em]">
          Fallen • {new Date().getFullYear()}
        </p>
      </div>
    </div>
  );
}