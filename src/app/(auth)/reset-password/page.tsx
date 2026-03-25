"use client";

import React, { useState, useEffect } from "react";
import { Lock, ShieldCheck, Loader2, AlertTriangle, CheckCircle, ArrowLeft } from "lucide-react";

/**
 * Interface untuk respon dari API Reset Password sesuai dengan snippet backend
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
   * Mengambil token dari URL saat komponen pertama kali dimuat
   */
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const t = params.get("token");
    if (t) {
      setToken(t);
    } else {
      setError("Token tidak ditemukan atau tidak valid. Silakan minta tautan baru melalui halaman Lupa Password.");
    }
  }, []);

  /**
   * Menangani pengiriman form reset password
   */
  const handleReset = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    
    // Validasi Sisi Klien
    if (password !== confirmPassword) {
      setError("Konfirmasi password tidak cocok.");
      return;
    }

    if (password.length < 6) {
      setError("Password minimal harus 6 karakter.");
      return;
    }

    if (!token) {
      setError("Token tidak valid. Data tidak lengkap untuk memproses permintaan.");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Mengirim payload { token, newPassword } sesuai dengan destructing di backend
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          token: token, 
          newPassword: password 
        }),
      });

      const data: ResetResponse = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Gagal mereset password.");
      }

      setSuccessMsg(data.message || "Password Anda berhasil diperbarui!");
      
      // Redirect ke halaman login setelah 3 detik
      setTimeout(() => {
        window.location.href = "/login";
      }, 3000);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Terjadi kesalahan sistem yang tidak diketahui.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Menangani error pemuatan logo
   */
  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>): void => {
    e.currentTarget.src = "https://via.placeholder.com/150x43?text=RSU+Avisena";
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 font-sans p-4">
      <div className="w-full max-w-md rounded-xl bg-white p-8 shadow-lg border border-slate-200">
        <div className="mb-8 text-center">
          <a href="/login">
            <img
              src="/brand-avisena.png"
              alt="Logo RSU Avisena"
              width={150}
              height={43}
              className="mx-auto"
              onError={handleImageError}
            />
          </a>
          <h1 className="mt-6 text-2xl font-bold text-slate-800">
            Atur Ulang Password
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Masukkan password baru untuk mengamankan kembali akun Anda.
          </p>
        </div>

        {/* Notifikasi Error */}
        {error && (
          <div className="mb-4 flex items-start gap-3 rounded-lg bg-red-50 p-3 text-sm text-red-700 animate-in fade-in slide-in-from-top-1">
            <AlertTriangle className="h-5 w-5 flex-shrink-0 mt-0.5" />
            <p>{error}</p>
          </div>
        )}

        {/* Notifikasi Sukses */}
        {successMsg && (
          <div className="mb-4 flex items-start gap-3 rounded-lg bg-green-50 p-3 text-sm text-green-700 animate-in fade-in slide-in-from-top-1">
            <CheckCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
            <p>{successMsg}</p>
          </div>
        )}

        {token && !successMsg && (
          <form onSubmit={handleReset} className="space-y-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700">Password Baru</label>
                <div className="mt-1 relative group">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" size={18} />
                  <input
                    type="password"
                    required
                    disabled={isLoading}
                    value={password}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-3 py-2 rounded-md border border-slate-300 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all text-sm"
                    placeholder="Minimal 6 karakter"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">Konfirmasi Password</label>
                <div className="mt-1 relative group">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" size={18} />
                  <input
                    type="password"
                    required
                    disabled={isLoading}
                    value={confirmPassword}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setConfirmPassword(e.target.value)}
                    className={`w-full pl-10 pr-3 py-2 rounded-md border shadow-sm focus:outline-none focus:ring-1 transition-all text-sm ${
                      confirmPassword && password !== confirmPassword 
                        ? "border-red-500 focus:ring-red-500" 
                        : "border-slate-300 focus:border-blue-500 focus:ring-blue-500"
                    }`}
                    placeholder="Ulangi password baru"
                  />
                </div>
                {confirmPassword && password !== confirmPassword && (
                  <p className="text-[10px] text-red-500 font-bold mt-1 uppercase tracking-tighter">Password tidak cocok!</p>
                )}
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading || !token}
              className="flex w-full items-center justify-center rounded-full bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:bg-blue-400 transition-all active:scale-95 shadow-blue-200"
            >
              {isLoading ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Memperbarui...</>
              ) : (
                "Simpan Password Baru"
              )}
            </button>
          </form>
        )}

        <div className="mt-8 pt-6 border-t border-slate-100 text-center">
          <a href="/login" className="inline-flex items-center gap-2 text-sm font-semibold text-blue-600 hover:text-blue-800 transition-colors">
            <ArrowLeft size={16} /> Kembali ke Login
          </a>
        </div>
      </div>
    </div>
  );
}