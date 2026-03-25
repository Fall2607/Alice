"use client";

import React, { useState } from "react";
import { AlertTriangle, Loader2 } from "lucide-react";

/**
 * Interface untuk data pengguna yang dikembalikan dari API
 */
interface UserData {
  id: string;
  karyawan_id: string;
  name: string;
  email: string;
  role: string;
}

/**
 * Interface untuk respon dari endpoint /api/auth/login
 */
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
   * Menangani proses pengiriman form login
   */
  const handleLogin = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ identifier, password }),
      });

      // Melakukan casting hasil json ke interface LoginResponse
      const data: LoginResponse = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Login gagal, silakan coba lagi.");
      }

      // Simpan token ke localStorage jika ada
      if (data.token) {
        localStorage.setItem("authToken", data.token);
      }

      // Simpan data user sebagai string JSON jika ada
      if (data.user) {
        localStorage.setItem("user", JSON.stringify(data.user));
      }

      // Redirect menggunakan window.location untuk kompatibilitas lingkungan pratinjau
      window.location.href = "/admin";
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

  /**
   * Handler untuk menangani kegagalan pemuatan gambar logo
   */
  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>): void => {
    const target = e.currentTarget;
    target.src = "https://via.placeholder.com/150x43?text=RSU+Avisena";
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 font-sans">
      <div className="w-full max-w-md rounded-xl bg-white p-8 shadow-lg border border-slate-200">
        <div className="mb-8 text-center">
          <a href="/">
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
            Admin Login
          </h1>
          <p className="text-slate-500 text-sm">
            Silakan masuk untuk mengelola sistem.
          </p>
        </div>

        {error && (
          <div className="mb-4 flex items-center gap-3 rounded-lg bg-red-50 p-3 text-sm text-red-700 animate-in fade-in slide-in-from-top-1">
            <AlertTriangle className="h-5 w-5 flex-shrink-0" />
            <p>{error}</p>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label
              htmlFor="identifier"
              className="block text-sm font-medium text-slate-700"
            >
              Email atau NIP
            </label>
            <div className="mt-1">
              <input
                id="identifier"
                name="identifier"
                type="text"
                autoComplete="email"
                required
                value={identifier}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setIdentifier(e.target.value)}
                className="w-full rounded-md border border-slate-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between">
              <label
                htmlFor="password"
                className="block text-sm font-medium text-slate-700"
              >
                Password
              </label>
              <a 
                href="/forgot-password" 
                className="text-xs font-semibold text-blue-600 hover:text-blue-800 transition-colors"
              >
                Lupa Password?
              </a>
            </div>
            <div className="mt-1">
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
                className="w-full rounded-md border border-slate-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all"
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="flex w-full items-center justify-center rounded-full bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:bg-blue-400 transition-all active:scale-95"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Memproses...
                </>
              ) : (
                "Masuk"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}