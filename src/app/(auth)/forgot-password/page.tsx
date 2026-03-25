"use client";

import React, { useState } from "react";
import { Mail, KeyRound, Loader2, AlertTriangle, CheckCircle, ArrowLeft } from "lucide-react";

/**
 * Interface untuk respon API
 */
interface ForgotPasswordResponse {
  message: string;
}

export default function App() {
  const [email, setEmail] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  /**
   * Menangani pengiriman form permintaan reset
   */
  const handleRequestReset = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccessMsg(null);

    try {
      // Mengirim payload { email } ke API
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: email.trim() }),
      });

      const data: ForgotPasswordResponse = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Gagal mengirim permintaan.");
      }

      setSuccessMsg(data.message);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Terjadi kesalahan tidak dikenal.");
      }
    } finally {
      setIsLoading(false);
    }
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
              onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
                e.currentTarget.src = "https://via.placeholder.com/150x43?text=RSU+Avisena";
              }}
            />
          </a>
          <h1 className="mt-6 text-2xl font-bold text-slate-800">
            Lupa Password
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Masukkan email untuk menerima tautan pemulihan.
          </p>
        </div>

        {error && (
          <div className="mb-4 flex items-center gap-3 rounded-lg bg-red-50 p-3 text-sm text-red-700 animate-in fade-in slide-in-from-top-1">
            <AlertTriangle className="h-5 w-5 flex-shrink-0" />
            <p>{error}</p>
          </div>
        )}

        {successMsg && (
          <div className="mb-4 flex items-center gap-3 rounded-lg bg-green-50 p-3 text-sm text-green-700 animate-in fade-in slide-in-from-top-1">
            <CheckCircle className="h-5 w-5 flex-shrink-0" />
            <p>{successMsg}</p>
          </div>
        )}

        {!successMsg && (
          <form onSubmit={handleRequestReset} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-700">
                Email Terdaftar
              </label>
              <div className="mt-1 relative group">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" size={18} />
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-3 py-2 rounded-md border border-slate-300 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all"
                  placeholder="admin@avisena.co.id"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="flex w-full items-center justify-center rounded-full bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:cursor-not-allowed disabled:bg-blue-400 transition-all active:scale-95"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Mengirim...
                </>
              ) : (
                "Kirim Tautan Reset"
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