"use client";

import React, { useState } from "react";
// Menggunakan tag <a> standar sebagai pengganti Link untuk kompatibilitas lingkungan pratinjau
import {
  Mail,
  Loader2,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";

interface EmployeeInfo {
  nip: string;
  nama: string;
  email: string;
}

export default function App() {
  const [email, setEmail] = useState<string>("");
  const [step, setStep] = useState<"input" | "validate" | "success">("input");
  const [employeeData, setEmployeeData] = useState<EmployeeInfo | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Cek apakah email terdaftar di tabel karyawan
   */
  const handleCheckEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, action: "check" }),
      });

      const data: { message?: string; data?: any } = await res.json();

      if (!res.ok) throw new Error(data.message || "Request gagal");

      setEmployeeData(data.data);
      setStep("validate");
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Terjadi kesalahan saat memverifikasi email.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Kirim email undangan jika data divalidasi oleh user
   */
  const handleSendInvite = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, action: "invite" }),
      });

      const data: { message?: string } = await res.json();

      if (!res.ok) throw new Error(data.message || "Request gagal");

      setStep("success");
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Gagal mengirim link aktivasi.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 font-sans p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
        <div className="p-8">
          <div className="text-center mb-8">
            <Link href="/login">
              <Image
                src="/brand-avisena.png"
                alt="Logo"
                width={140}
                height={40}
                className="mx-auto mb-6 cursor-pointer"
              />
            </Link>
            <h1 className="text-2xl font-bold text-slate-800">
              Daftar Akun Baru
            </h1>
            <p className="text-slate-500 text-sm mt-1">
              Khusus Karyawan RSU Avisena
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-xl flex items-start gap-3 text-red-700 text-sm animate-in fade-in zoom-in">
              <AlertCircle size={18} className="shrink-0 mt-0.5" />
              <p className="font-medium">{error}</p>
            </div>
          )}

          {step === "input" && (
            <form onSubmit={handleCheckEmail} className="space-y-6">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                  Email Karyawan
                </label>
                <div className="relative">
                  <Mail
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                    size={18}
                  />
                  <input
                    type="email"
                    required
                    className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                    placeholder="nama@avisena.co.id"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-blue-600 text-white font-bold py-3 rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20 flex justify-center items-center gap-2"
              >
                {isLoading ? (
                  <Loader2 className="animate-spin" size={20} />
                ) : (
                  "Verifikasi Data"
                )}
              </button>
            </form>
          )}

          {step === "validate" && employeeData && (
            <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
              <div className="bg-blue-50/50 p-6 rounded-2xl border border-blue-100">
                <div className="flex items-center gap-4 mb-4 pb-4 border-b border-blue-100">
                  <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-xl">
                    {employeeData.nama.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800 leading-none">
                      {employeeData.nama}
                    </h3>
                    <p className="text-xs text-blue-600 font-bold mt-1 uppercase tracking-tight">
                      NIP: {employeeData.nip}
                    </p>
                  </div>
                </div>
                <p className="text-slate-600 text-xs leading-relaxed">
                  Data profil ditemukan. Kami akan mengirimkan email konfirmasi
                  ke alamat <strong>{employeeData.email}</strong> untuk
                  melanjutkan pendaftaran.
                </p>
              </div>

              <div className="flex flex-col gap-3">
                <button
                  onClick={handleSendInvite}
                  disabled={isLoading}
                  className="w-full bg-blue-600 text-white font-bold py-3 rounded-xl hover:bg-blue-700 transition-all flex justify-center items-center gap-2"
                >
                  {isLoading ? (
                    <Loader2 className="animate-spin" size={20} />
                  ) : (
                    <>
                      <ShieldCheck size={18} /> Benar, Kirim Link Aktivasi
                    </>
                  )}
                </button>
                <button
                  onClick={() => setStep("input")}
                  disabled={isLoading}
                  className="w-full bg-slate-100 text-slate-600 font-bold py-3 rounded-xl hover:bg-slate-200 transition-all"
                >
                  Bukan Saya, Kembali
                </button>
              </div>
            </div>
          )}

          {step === "success" && (
            <div className="text-center py-4 animate-in zoom-in duration-300">
              <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6 border border-green-100">
                <CheckCircle2 className="text-green-500" size={48} />
              </div>
              <h2 className="text-xl font-bold text-slate-800 mb-2">
                Email Terkirim!
              </h2>
              <p className="text-slate-500 text-sm leading-relaxed mb-8">
                Silakan periksa kotak masuk email <strong>{email}</strong>. Klik
                link di dalamnya untuk mengatur password dan mengaktifkan akun
                Anda.
              </p>
              <a
                href="/login"
                className="text-blue-600 font-bold text-sm hover:underline flex items-center justify-center gap-2 mx-auto"
              >
                <ArrowLeft size={16} /> Kembali ke Halaman Login
              </a>
            </div>
          )}
        </div>

        <div className="bg-slate-50 p-6 border-t border-slate-100 text-center">
          <p className="text-xs text-slate-400">
            Ada kendala pendaftaran?{" "}
            <span className="text-blue-600 cursor-pointer font-bold">
              Hubungi IT Support
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}
