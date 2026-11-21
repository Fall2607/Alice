"use client";

import React, { useState, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import {
  AlertTriangle,
  Loader2,
  LogIn,
  Mail,
  Lock,
  Eye,
  EyeOff,
  UserPlus,
} from "lucide-react";

if (typeof window !== "undefined") {
  gsap.registerPlugin(useGSAP);
}

interface UserData {
  id: string;
  karyawan_id: string;
  role_id: string;
  name: string;
  email: string;
  role: string;
  jenis_kelamin: string;
}

interface LoginResponse {
  message?: string;
  error?: string;
  token?: string;
  user?: UserData;
}

export default function LoginPage() {
  const [identifier, setIdentifier] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [showPassword, setShowPassword] = useState<boolean>(false);

  const containerRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

      tl.from(".auth-shell", {
        y: 20,
        scale: 0.98,
        opacity: 0,
        duration: 0.55,
        clearProps: "all",
      })
        .from(
          ".auth-visual",
          {
            opacity: 0,
            x: -20,
            duration: 0.5,
            clearProps: "all",
          },
          "-=0.3"
        )
        .from(
          ".auth-form-item",
          {
            y: 10,
            opacity: 0,
            duration: 0.35,
            stagger: 0.05,
            clearProps: "all",
          },
          "-=0.3"
        );
    },
    { scope: containerRef }
  );

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier: identifier.trim(), password }),
      });

      const data: LoginResponse = await response.json();

      if (!response.ok) {
        const errorMessage = data.error
          ? `${data.message} (${data.error})`
          : data.message || "Gagal masuk ke sistem. Silakan periksa kembali email/NIP dan kata sandi.";
        throw new Error(errorMessage);
      }

      if (data.token) localStorage.setItem("authToken", data.token);
      if (data.user) localStorage.setItem("user", JSON.stringify(data.user));

      window.location.href = "/admin";
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan tidak terduga.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      ref={containerRef}
      className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-slate-50 via-white to-blue-50/70 font-sans p-4 sm:p-6 relative overflow-hidden selection:bg-[#0173b6]/20 selection:text-[#0173b6]"
    >
      {/* Ambient background glow */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
        <div className="absolute top-[-10%] right-[-5%] w-[450px] h-[450px] bg-blue-400/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-[-10%] left-[-5%] w-[380px] h-[380px] bg-emerald-400/5 rounded-full blur-3xl"></div>
      </div>

      <div className="w-full max-w-[880px] relative z-10">
        <div className="auth-shell bg-white/95 backdrop-blur-xl rounded-[32px] shadow-[0_20px_60px_rgba(5,68,94,0.08)] border border-slate-200/80 overflow-hidden grid grid-cols-1 lg:grid-cols-12 transition-all duration-300">
          {/* PANEL KIRI: VISUAL ARTWORK ALICE BLUE */}
          <div className="auth-visual hidden lg:flex lg:col-span-5 relative bg-gradient-to-br from-[#05445e] to-[#0173b6] text-white p-8 flex-col justify-between overflow-hidden">
            <Image
              src="/img/alice-auth-bg.jpg"
              alt="Alice Medical Technology"
              fill
              className="object-cover object-center mix-blend-overlay opacity-90"
              priority
              unoptimized
            />
            {/* Soft gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#05445e] via-[#05445e]/30 to-transparent"></div>

            {/* Badge Atas */}
            <div className="relative z-10">
              <span className="inline-block px-3 py-1 rounded-full bg-white/15 backdrop-blur-md border border-white/20 text-[11px] font-mono font-bold tracking-wider uppercase text-white">
                ALICE - HRIS
              </span>
            </div>

            {/* Label Bawah */}
            <div className="relative z-10 space-y-1">
              <h2 className="text-xl font-black text-white tracking-tight">
                RSU Avisena
              </h2>
              <p className="text-xs text-white/80 font-medium">
                Sistem Manajemen Kepegawaian &amp; Presensi
              </p>
            </div>
          </div>

          {/* PANEL KANAN: FORMULIR LOGIN */}
          <div className="lg:col-span-7 p-8 sm:p-10 flex flex-col justify-center">
            {/* Header Form */}
            <div className="auth-form-item text-center mb-6">
              <Link href="/" className="inline-block group mb-3">
                <div className="relative w-36 h-10 mx-auto transition-transform group-hover:scale-105 duration-300">
                  <Image
                    src="/brand-avisena.png"
                    alt="Logo RSU Avisena"
                    fill
                    sizes="160px"
                    className="object-contain"
                    priority
                    unoptimized
                  />
                </div>
              </Link>
              <div className="lg:hidden inline-block mb-2">
                <span className="px-3 py-1 rounded-full bg-blue-50 border border-blue-100 text-[11px] font-black tracking-wider text-[#0173b6] uppercase font-mono">
                  ALICE - HRIS
                </span>
              </div>
              <h1 className="text-2xl font-black text-[#05445e] tracking-tight">
                Selamat Datang
              </h1>
              <p className="text-slate-500 text-xs mt-1 font-medium">
                Masuk menggunakan email dinas atau NIP Anda
              </p>
            </div>

            {/* Alert Error */}
            {error && (
              <div className="auth-form-item mb-5 flex items-start gap-2.5 rounded-2xl bg-rose-50 p-3.5 text-xs font-bold text-rose-700 border border-rose-200 animate-in fade-in slide-in-from-top-2">
                <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5 text-rose-600" />
                <p className="leading-relaxed">{error}</p>
              </div>
            )}

            {/* Form Utama */}
            <form onSubmit={handleLogin} className="space-y-4">
              {/* Input Email atau NIP */}
              <div className="auth-form-item space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 ml-1">
                  Email atau NIP
                </label>
                <div className="relative flex items-center bg-slate-50/80 border border-slate-200/90 rounded-2xl hover:border-slate-300 focus-within:border-[#0173b6] focus-within:bg-white focus-within:ring-4 focus-within:ring-[#0173b6]/10 transition-all">
                  <div className="w-9 h-9 rounded-xl bg-blue-50 text-[#0173b6] flex items-center justify-center shrink-0 ml-1.5">
                    <Mail size={16} />
                  </div>
                  <input
                    type="text"
                    required
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    className="w-full bg-transparent border-0 outline-none px-3 py-3 text-sm font-semibold text-slate-800 placeholder:text-slate-400"
                    placeholder="Masukkan email atau NIP"
                    autoComplete="username"
                  />
                </div>
              </div>

              {/* Input Kata Sandi */}
              <div className="auth-form-item space-y-1.5">
                <div className="flex items-center justify-between ml-1">
                  <label className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                    Kata Sandi
                  </label>
                  <Link
                    href="/forgot-password"
                    className="text-[10px] font-bold text-[#0173b6] hover:text-[#005f98] transition-colors uppercase tracking-wider hover:underline"
                  >
                    Lupa?
                  </Link>
                </div>
                <div className="relative flex items-center bg-slate-50/80 border border-slate-200/90 rounded-2xl hover:border-slate-300 focus-within:border-[#0173b6] focus-within:bg-white focus-within:ring-4 focus-within:ring-[#0173b6]/10 transition-all">
                  <div className="w-9 h-9 rounded-xl bg-blue-50 text-[#0173b6] flex items-center justify-center shrink-0 ml-1.5">
                    <Lock size={16} />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-transparent border-0 outline-none px-3 py-3 text-sm font-semibold text-slate-800 placeholder:text-slate-400"
                    placeholder="••••••••"
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="p-2.5 text-slate-400 hover:text-[#0173b6] transition-colors mr-1 focus:outline-none"
                    aria-label={showPassword ? "Sembunyikan sandi" : "Tampilkan sandi"}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {/* Tombol Masuk */}
              <div className="auth-form-item pt-2">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full min-h-[46px] flex items-center justify-center gap-2 bg-[#0173b6] hover:bg-[#005f98] text-white font-bold text-xs uppercase tracking-wider rounded-2xl shadow-lg shadow-blue-500/20 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed border-0"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Memverifikasi...</span>
                    </>
                  ) : (
                    <>
                      <span>Masuk Sistem</span>
                      <LogIn size={15} />
                    </>
                  )}
                </button>
              </div>
            </form>

            {/* Navigasi Registrasi */}
            <div className="auth-form-item mt-6 pt-5 border-t border-slate-100 text-center">
              <p className="text-xs text-slate-500 font-medium">
                Belum punya akses?{" "}
                <Link
                  href="/register"
                  className="inline-flex items-center gap-1 font-bold text-[#0173b6] hover:text-[#005f98] transition-colors ml-1"
                >
                  <UserPlus size={14} />
                  <span>Daftar Akun Baru</span>
                </Link>
              </p>
            </div>
          </div>
        </div>

        {/* Author Footer */}
        <p className="mt-8 text-center text-[10px] text-slate-400 font-bold uppercase tracking-[0.3em]">
          Fallen • {new Date().getFullYear()}
        </p>
      </div>
    </div>
  );
}
