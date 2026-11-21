"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import {
  Lock,
  Loader2,
  AlertTriangle,
  CheckCircle2,
  ArrowLeft,
  KeyRound,
  Eye,
  EyeOff,
  Check,
} from "lucide-react";

if (typeof window !== "undefined") {
  gsap.registerPlugin(useGSAP);
}

export default function RegisterCompletePage() {
  const [token, setToken] = useState<string | null>(null);
  const [password, setPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [status, setStatus] = useState<{ type: "success" | "error"; msg: string } | null>(null);
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState<boolean>(false);

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

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const tokenParam = params.get("token");

      if (tokenParam) {
        setToken(tokenParam);
      } else {
        setStatus({
          type: "error",
          msg: "Token aktivasi tidak ditemukan atau sudah kedaluwarsa. Pastikan Anda membuka tautan dari email resmi dengan benar.",
        });
      }
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      setStatus({ type: "error", msg: "Konfirmasi kata sandi tidak cocok." });
      return;
    }

    if (password.length < 6) {
      setStatus({ type: "error", msg: "Kata sandi minimal harus 6 karakter." });
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

      setStatus({
        type: "success",
        msg: "Akun Alice Anda telah aktif! Mengalihkan ke login...",
      });

      setTimeout(() => {
        window.location.href = "/login";
      }, 2500);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Terjadi kesalahan sistem.";
      setStatus({ type: "error", msg });
    } finally {
      setIsLoading(false);
    }
  };

  const isPasswordMatch = confirmPassword.length > 0 && password === confirmPassword;
  const isPasswordMismatch = confirmPassword.length > 0 && password !== confirmPassword;
  const isLengthValid = password.length >= 6;

  return (
    <div
      ref={containerRef}
      className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-slate-50 via-white to-blue-50/70 font-sans p-4 sm:p-6 relative overflow-hidden selection:bg-[#0173b6]/20 selection:text-[#0173b6]"
    >
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
            <div className="absolute inset-0 bg-gradient-to-t from-[#05445e] via-[#05445e]/30 to-transparent"></div>

            <div className="relative z-10">
              <span className="inline-block px-3 py-1 rounded-full bg-white/15 backdrop-blur-md border border-white/20 text-[11px] font-mono font-bold tracking-wider uppercase text-white">
                ALICE - HRIS
              </span>
            </div>

            <div className="relative z-10 space-y-1">
              <h2 className="text-xl font-black text-white tracking-tight">
                RSU Avisena
              </h2>
              <p className="text-xs text-white/80 font-medium">
                Atur Kata Sandi Baru
              </p>
            </div>
          </div>

          {/* PANEL KANAN: FORMULIR ATUR KATA SANDI */}
          <div className="lg:col-span-7 p-8 sm:p-10 flex flex-col justify-center">
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
                Selesaikan Pendaftaran
              </h1>
              <p className="text-slate-500 text-xs mt-1 font-medium">
                Atur kata sandi untuk akun Alice Anda
              </p>
            </div>

            {status && (
              <div
                className={`auth-form-item mb-5 flex items-start gap-2.5 rounded-2xl p-3.5 text-xs font-bold border animate-in fade-in slide-in-from-top-2 ${
                  status.type === "success"
                    ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                    : "bg-rose-50 text-rose-700 border-rose-200"
                }`}
              >
                {status.type === "success" ? (
                  <CheckCircle2 size={18} className="text-emerald-600 shrink-0 mt-0.5" />
                ) : (
                  <AlertTriangle size={18} className="text-rose-600 shrink-0 mt-0.5" />
                )}
                <p className="leading-relaxed">{status.msg}</p>
              </div>
            )}

            {token && status?.type !== "success" && (
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Kata Sandi Baru */}
                <div className="auth-form-item space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 ml-1">
                    Kata Sandi Baru
                  </label>
                  <div className="relative flex items-center bg-slate-50/80 border border-slate-200/90 rounded-2xl hover:border-slate-300 focus-within:border-[#0173b6] focus-within:bg-white focus-within:ring-4 focus-within:ring-[#0173b6]/10 transition-all">
                    <div className="w-9 h-9 rounded-xl bg-blue-50 text-[#0173b6] flex items-center justify-center shrink-0 ml-1.5">
                      <Lock size={16} />
                    </div>
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      disabled={isLoading}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full bg-transparent border-0 outline-none px-3 py-3 text-sm font-semibold text-slate-800 placeholder:text-slate-400"
                      placeholder="Minimal 6 karakter"
                      autoComplete="new-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="p-2.5 text-slate-400 hover:text-[#0173b6] transition-colors mr-1 focus:outline-none"
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  {password.length > 0 && (
                    <div className="flex items-center gap-1.5 text-[11px] ml-1 mt-1">
                      <span
                        className={`inline-flex items-center gap-1 font-bold ${
                          isLengthValid ? "text-emerald-600" : "text-amber-600"
                        }`}
                      >
                        {isLengthValid ? <Check size={12} /> : "•"} Minimal 6 karakter
                      </span>
                    </div>
                  )}
                </div>

                {/* Konfirmasi Kata Sandi */}
                <div className="auth-form-item space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 ml-1">
                    Konfirmasi Kata Sandi
                  </label>
                  <div
                    className={`relative flex items-center bg-slate-50/80 border rounded-2xl hover:border-slate-300 focus-within:bg-white focus-within:ring-4 transition-all ${
                      isPasswordMismatch
                        ? "border-rose-400 focus-within:border-rose-500 focus-within:ring-rose-500/10"
                        : isPasswordMatch
                        ? "border-emerald-400 focus-within:border-emerald-500 focus-within:ring-emerald-500/10"
                        : "border-slate-200/90 focus-within:border-[#0173b6] focus-within:ring-[#0173b6]/10"
                    }`}
                  >
                    <div className="w-9 h-9 rounded-xl bg-blue-50 text-[#0173b6] flex items-center justify-center shrink-0 ml-1.5">
                      <Lock size={16} />
                    </div>
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      required
                      disabled={isLoading}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full bg-transparent border-0 outline-none px-3 py-3 text-sm font-semibold text-slate-800 placeholder:text-slate-400"
                      placeholder="Ulangi kata sandi"
                      autoComplete="new-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="p-2.5 text-slate-400 hover:text-[#0173b6] transition-colors mr-1 focus:outline-none"
                    >
                      {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  {isPasswordMismatch && (
                    <p className="text-[11px] font-bold text-rose-600 ml-1 mt-1">
                      Kata sandi tidak cocok.
                    </p>
                  )}
                  {isPasswordMatch && (
                    <p className="text-[11px] font-bold text-emerald-600 ml-1 mt-1 flex items-center gap-1">
                      <Check size={12} /> Kata sandi cocok!
                    </p>
                  )}
                </div>

                {/* Tombol Simpan */}
                <div className="auth-form-item pt-2">
                  <button
                    type="submit"
                    disabled={isLoading || !isLengthValid || isPasswordMismatch}
                    className="w-full min-h-[46px] flex items-center justify-center gap-2 bg-[#0173b6] hover:bg-[#005f98] text-white font-bold text-xs uppercase tracking-wider rounded-2xl shadow-lg shadow-blue-500/20 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed border-0"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>Mengaktifkan...</span>
                      </>
                    ) : (
                      <>
                        <KeyRound size={15} />
                        <span>Aktifkan Akun</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}

            {/* Navigasi Balik ke Login */}
            <div className="auth-form-item mt-6 pt-5 border-t border-slate-100 text-center">
              <Link
                href="/login"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-[#0173b6] transition-colors"
              >
                <ArrowLeft size={14} />
                <span>Batal &amp; Kembali ke Login</span>
              </Link>
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
