"use client";

import React, { useState, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import {
  Mail,
  Loader2,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Search,
  LogIn,
  Send,
} from "lucide-react";

if (typeof window !== "undefined") {
  gsap.registerPlugin(useGSAP);
}

interface EmployeeInfo {
  nip: string;
  nama: string;
  email: string;
}

export default function RegisterPage() {
  const [email, setEmail] = useState<string>("");
  const [step, setStep] = useState<"input" | "validate" | "success">("input");
  const [employeeData, setEmployeeData] = useState<EmployeeInfo | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

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
    { scope: containerRef, dependencies: [step] }
  );

  const handleCheckEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), action: "check" }),
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.message || "Gagal memverifikasi email.");

      setEmployeeData(data.data);
      setStep("validate");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Gagal memverifikasi email.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendInvite = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), action: "invite" }),
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.message || "Gagal mengirim tautan aktivasi.");

      setStep("success");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Gagal mengirim tautan aktivasi.");
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
                Aktivasi Akun Portal Pegawai
              </p>
            </div>
          </div>

          {/* PANEL KANAN: FORMULIR REGISTRASI */}
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
                Aktivasi Akun Pegawai
              </h1>
              <p className="text-slate-500 text-xs mt-1 font-medium">
                {step === "input" && "Verifikasi email dinas terdaftar Anda"}
                {step === "validate" && "Konfirmasi identitas data kepegawaian Anda"}
                {step === "success" && "Tautan aktivasi berhasil terkirim"}
              </p>
            </div>

            {/* DaisyUI Step Indicator */}
            <div className="auth-form-item mb-6">
              <ul className="steps steps-horizontal w-full text-[10px] font-bold">
                <li className={`step ${step === "input" || step === "validate" || step === "success" ? "step-primary" : ""}`}>
                  Cek Email
                </li>
                <li className={`step ${step === "validate" || step === "success" ? "step-primary" : ""}`}>
                  Konfirmasi
                </li>
                <li className={`step ${step === "success" ? "step-primary" : ""}`}>
                  Selesai
                </li>
              </ul>
            </div>

            {/* Alert Error */}
            {error && (
              <div className="auth-form-item mb-5 flex items-start gap-2.5 rounded-2xl bg-rose-50 p-3.5 text-xs font-bold text-rose-700 border border-rose-200 animate-in fade-in slide-in-from-top-2">
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-rose-600" />
                <p className="leading-relaxed">{error}</p>
              </div>
            )}

            {/* TAHAP 1: INPUT EMAIL */}
            {step === "input" && (
              <form onSubmit={handleCheckEmail} className="space-y-4">
                <div className="auth-form-item space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 ml-1">
                    Email Karyawan
                  </label>
                  <div className="relative flex items-center bg-slate-50/80 border border-slate-200/90 rounded-2xl hover:border-slate-300 focus-within:border-[#0173b6] focus-within:bg-white focus-within:ring-4 focus-within:ring-[#0173b6]/10 transition-all">
                    <div className="w-9 h-9 rounded-xl bg-blue-50 text-[#0173b6] flex items-center justify-center shrink-0 ml-1.5">
                      <Mail size={16} />
                    </div>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-transparent border-0 outline-none px-3 py-3 text-sm font-semibold text-slate-800 placeholder:text-slate-400"
                      placeholder="nama@avisena.co.id"
                      autoComplete="email"
                    />
                  </div>
                </div>

                <div className="auth-form-item pt-2">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full min-h-[46px] flex items-center justify-center gap-2 bg-[#0173b6] hover:bg-[#005f98] text-white font-bold text-xs uppercase tracking-wider rounded-2xl shadow-lg shadow-blue-500/20 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed border-0"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>Memeriksa...</span>
                      </>
                    ) : (
                      <>
                        <Search size={15} />
                        <span>Verifikasi Data</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}

            {/* TAHAP 2: VALIDASI IDENTITAS */}
            {step === "validate" && employeeData && (
              <div className="space-y-4">
                <div className="auth-form-item p-4 rounded-2xl bg-blue-50/60 border border-blue-200/80 space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-[#0173b6] text-white font-black flex items-center justify-center text-lg shadow-md shadow-blue-500/20">
                      {employeeData.nama.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="text-sm font-bold text-[#05445e] truncate leading-tight">
                        {employeeData.nama}
                      </h3>
                      <p className="text-xs font-mono font-bold text-[#0173b6] tabular-nums mt-0.5">
                        NIP: {employeeData.nip}
                      </p>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-blue-200/60 text-xs text-slate-600">
                    <p className="text-[11px] text-slate-500 mb-1">
                      Tautan aktivasi akan dikirimkan ke email:
                    </p>
                    <p className="font-semibold text-slate-800 break-all bg-white/80 p-2 rounded-lg border border-blue-100">
                      {employeeData.email}
                    </p>
                  </div>
                </div>

                <div className="auth-form-item space-y-2 pt-1">
                  <button
                    onClick={handleSendInvite}
                    disabled={isLoading}
                    className="w-full min-h-[46px] flex items-center justify-center gap-2 bg-[#0173b6] hover:bg-[#005f98] text-white font-bold text-xs uppercase tracking-wider rounded-2xl shadow-lg shadow-blue-500/20 active:scale-[0.98] transition-all disabled:opacity-50 border-0"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>Mengirim...</span>
                      </>
                    ) : (
                      <>
                        <Send size={15} />
                        <span>Kirim Tautan Aktivasi</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setStep("input");
                      setError(null);
                    }}
                    disabled={isLoading}
                    className="w-full py-2.5 text-xs font-bold text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-all"
                  >
                    Bukan Saya, Kembali
                  </button>
                </div>
              </div>
            )}

            {/* TAHAP 3: SUKSES */}
            {step === "success" && (
              <div className="auth-form-item text-center py-2 space-y-4">
                <div className="w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center mx-auto border border-emerald-200 text-emerald-600">
                  <CheckCircle2 size={36} />
                </div>
                <div>
                  <h3 className="text-xl font-black text-[#05445e]">
                    Email Terkirim!
                  </h3>
                  <p className="text-xs text-slate-500 font-medium mt-1 leading-relaxed">
                    Silakan periksa kotak masuk <strong className="text-slate-800">{email}</strong> untuk melengkapi pendaftaran.
                  </p>
                </div>

                <div className="pt-2">
                  <Link
                    href="/login"
                    className="w-full min-h-[46px] inline-flex items-center justify-center gap-2 bg-[#0173b6] hover:bg-[#005f98] text-white font-bold text-xs uppercase tracking-wider rounded-2xl shadow-lg shadow-blue-500/20 active:scale-[0.98] transition-all"
                  >
                    <LogIn size={15} />
                    <span>Kembali ke Login</span>
                  </Link>
                </div>
              </div>
            )}

            {/* Navigasi Balik ke Login */}
            {step !== "success" && (
              <div className="auth-form-item mt-6 pt-5 border-t border-slate-100 text-center">
                <Link
                  href="/login"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-[#0173b6] transition-colors"
                >
                  <ArrowLeft size={14} />
                  <span>Sudah punya akun? Login</span>
                </Link>
              </div>
            )}
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
