"use client";

import React, { useState, useEffect } from "react";
import {
  Lock,
  ShieldCheck,
  Loader2,
  AlertCircle,
  CheckCircle2,
  ArrowLeft,
} from "lucide-react";

/**
 * Komponen utama form registrasi dengan validasi token.
 * Menggunakan window.location.search sebagai alternatif untuk useSearchParams
 * guna memastikan kompatibilitas di lingkungan pratinjau.
 */
export default function App() {
  const [token, setToken] = useState<string | null>(null);
  const [password, setPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [status, setStatus] = useState<{
    type: "success" | "error";
    msg: string;
  } | null>(null);

  // Mengambil token dari URL secara manual saat komponen dimuat
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const tokenParam = params.get("token");

      if (tokenParam) {
        setToken(tokenParam);
      } else {
        setStatus({
          type: "error",
          msg: "Token aktivasi tidak ditemukan. Pastikan Anda membuka tautan dari email dengan benar.",
        });
      }
    }
  }, []);

  /**
   * Menangani pengiriman form untuk aktivasi akun
   */
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Validasi kecocokan password
    if (password !== confirmPassword) {
      setStatus({ type: "error", msg: "Konfirmasi password tidak cocok." });
      return;
    }

    // Validasi panjang password
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
        throw new Error(data.message || "Terjadi kesalahan saat membuat akun.");
      }

      setStatus({
        type: "success",
        msg: "Akun Anda telah aktif! Mengalihkan ke login...",
      });

      // Redirect ke login setelah sukses menggunakan window.location
      setTimeout(() => {
        window.location.href = "/login";
      }, 3000);
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Terjadi kesalahan sistem.";
      setStatus({ type: "error", msg });
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Menangani kegagalan pemuatan gambar logo
   */
  const handleImageError = (
    e: React.SyntheticEvent<HTMLImageElement, Event>,
  ) => {
    e.currentTarget.src = "https://via.placeholder.com/150x43?text=RSU+Avisena";
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 font-sans p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-slate-200 p-8">
        <div className="text-center mb-8">
          <a href="/login">
            <img
              src="/brand-avisena.png"
              alt="Logo RSU Avisena"
              width={140}
              className="mx-auto mb-6"
              onError={handleImageError}
            />
          </a>
          <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-blue-100">
            <ShieldCheck className="text-blue-600" size={32} />
          </div>
          <h1 className="text-2xl font-bold text-slate-800">
            Setel Password Akun
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Selesaikan pendaftaran akun HRIS Anda.
          </p>
        </div>

        {/* Notifikasi Status */}
        {status && (
          <div
            className={`p-4 rounded-xl mb-6 flex items-start gap-3 animate-in fade-in slide-in-from-top-1 duration-300 ${
              status.type === "success"
                ? "bg-green-50 text-green-700 border border-green-100"
                : "bg-red-50 text-red-700 border border-red-100"
            }`}
          >
            {status.type === "success" ? (
              <CheckCircle2 size={20} className="shrink-0 mt-0.5" />
            ) : (
              <AlertCircle size={20} className="shrink-0 mt-0.5" />
            )}
            <span className="text-sm font-medium leading-relaxed">
              {status.msg}
            </span>
          </div>
        )}

        {/* Form Pendaftaran (Hanya muncul jika token ada dan belum sukses) */}
        {token && status?.type !== "success" && (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest ml-1">
                  Password Baru
                </label>
                <div className="relative group">
                  <Lock
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors"
                    size={18}
                  />
                  <input
                    type="password"
                    required
                    disabled={isLoading}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-slate-200 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all text-sm"
                    placeholder="Min. 6 karakter"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest ml-1">
                  Konfirmasi Password
                </label>
                <div className="relative group">
                  <Lock
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors"
                    size={18}
                  />
                  <input
                    type="password"
                    required
                    disabled={isLoading}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className={`w-full pl-10 pr-3 py-2.5 rounded-xl border shadow-sm focus:outline-none focus:ring-1 transition-all text-sm ${
                      confirmPassword && password !== confirmPassword
                        ? "border-red-500 focus:ring-red-500"
                        : "border-slate-200 focus:border-blue-500 focus:ring-blue-500"
                    }`}
                    placeholder="Ulangi password baru"
                  />
                </div>
                {confirmPassword && password !== confirmPassword && (
                  <p className="text-[10px] text-red-500 font-bold mt-1 uppercase tracking-tighter ml-1">
                    Password tidak cocok!
                  </p>
                )}
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-600 text-white font-bold py-3.5 rounded-xl hover:bg-blue-700 transition-all flex justify-center items-center gap-2 shadow-lg shadow-blue-600/20 active:scale-95 disabled:bg-slate-300 disabled:shadow-none transition-all shadow-blue-200"
            >
              {isLoading ? (
                <>
                  <Loader2 className="animate-spin" size={20} />
                  Memproses Akun...
                </>
              ) : (
                "Aktifkan Akun Sekarang"
              )}
            </button>
          </form>
        )}

        {/* Navigasi Kembali */}
        <div className="mt-8 pt-6 border-t border-slate-100 text-center">
          <a
            href="/login"
            className="inline-flex items-center gap-2 text-sm font-bold text-slate-400 hover:text-blue-600 transition-colors"
          >
            <ArrowLeft size={16} /> Kembali ke Login
          </a>
        </div>
      </div>
    </div>
  );
}
