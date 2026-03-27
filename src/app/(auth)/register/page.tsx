"use client";

import React, { useState } from "react";
import { Mail, UserCheck, Loader2, ArrowLeft, CheckCircle2, AlertCircle, ShieldCheck, Search } from "lucide-react";

/**
 * Interface data karyawan untuk validasi visual
 */
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
   * Cek keberadaan email di database karyawan
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
      const data = await res.json();

      if (!res.ok) throw new Error(data.message);

      setEmployeeData(data.data);
      setStep("validate");
    } catch (err: any) {
      setError(err.message || "Gagal memverifikasi email.");
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Kirim undangan registrasi ke email karyawan
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
      const data = await res.json();

      if (!res.ok) throw new Error(data.message);

      setStep("success");
    } catch (err: any) {
      setError(err.message || "Gagal mengirim link aktivasi.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>): void => {
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
               <UserCheck className="text-blue-600" size={32} />
            </div>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              Daftar Akun Alice
            </h1>
            <p className="text-slate-500 text-sm mt-2 font-medium">
              Verifikasi identitas karyawan Anda
            </p>
          </div>

          {error && (
            <div className="mb-6 flex items-start gap-3 rounded-2xl bg-red-50 p-4 text-xs font-bold text-red-600 border border-red-100 animate-in fade-in slide-in-from-top-2">
              <AlertCircle size={18} className="shrink-0 mt-0.5" />
              <p>{error}</p>
            </div>
          )}

          {step === "input" && (
            <form onSubmit={handleCheckEmail} className="space-y-6">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.15em] ml-4">Email Karyawan</label>
                <div className="relative group">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors">
                    <Mail size={18} />
                  </div>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-12 pr-6 py-3.5 bg-slate-50/50 border border-slate-200 rounded-2xl focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all duration-200 text-sm font-medium text-slate-700"
                    placeholder="nama@avisena.co.id"
                  />
                </div>
              </div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-3 bg-blue-600 px-6 py-4 rounded-2xl text-sm font-bold text-white shadow-xl shadow-blue-500/20 hover:bg-blue-700 active:scale-[0.98] transition-all duration-300 disabled:bg-slate-300"
              >
                {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <><Search size={18} /> Verifikasi Data</>}
              </button>
            </form>
          )}

          {step === "validate" && employeeData && (
            <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
              <div className="bg-blue-50/50 p-6 rounded-[24px] border border-blue-100 text-center">
                <div className="w-16 h-16 bg-blue-600 text-white rounded-2xl flex items-center justify-center font-bold text-2xl mx-auto mb-4 shadow-lg shadow-blue-500/20">
                  {employeeData.nama.charAt(0)}
                </div>
                <h3 className="font-bold text-slate-900 text-lg leading-tight">{employeeData.nama}</h3>
                <p className="text-[10px] text-blue-600 font-extrabold mt-1 uppercase tracking-widest">NIP: {employeeData.nip}</p>
                <p className="text-slate-500 text-xs mt-4 leading-relaxed font-medium">
                  Klik tombol di bawah untuk menerima link aktivasi di email <strong>{employeeData.email}</strong>
                </p>
              </div>

              <div className="flex flex-col gap-3">
                <button
                  onClick={handleSendInvite}
                  disabled={isLoading}
                  className="w-full bg-blue-600 text-white font-bold py-4 rounded-2xl hover:bg-blue-700 transition-all shadow-xl shadow-blue-500/20 flex justify-center items-center gap-2 active:scale-95"
                >
                  {isLoading ? <Loader2 className="animate-spin" size={20} /> : <><ShieldCheck size={18} /> Kirim Link Aktivasi</>}
                </button>
                <button
                  onClick={() => setStep("input")}
                  disabled={isLoading}
                  className="w-full bg-slate-100 text-slate-500 font-bold py-3.5 rounded-2xl hover:bg-slate-200 transition-all text-sm"
                >
                  Bukan Saya, Kembali
                </button>
              </div>
            </div>
          )}

          {step === "success" && (
            <div className="text-center py-4 animate-in zoom-in duration-300">
              <div className="w-20 h-20 bg-green-50 rounded-[28px] flex items-center justify-center mx-auto mb-6 border border-green-100">
                <CheckCircle2 className="text-green-500" size={48} />
              </div>
              <h2 className="text-2xl font-extrabold text-slate-900 mb-2 tracking-tight">Email Terkirim!</h2>
              <p className="text-slate-500 text-sm leading-relaxed mb-8 font-medium">
                Silakan periksa kotak masuk <strong>{email}</strong> untuk melengkapi pendaftaran.
              </p>
              <a 
                href="/login"
                className="inline-flex items-center gap-2 text-sm font-bold text-blue-600 hover:text-blue-800 transition-all group"
              >
                <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> 
                Kembali ke Login
              </a>
            </div>
          )}

          {step !== "success" && (
            <div className="mt-10 pt-8 border-t border-slate-100 text-center">
              <a href="/login" className="inline-flex items-center gap-2 text-sm font-bold text-slate-400 hover:text-blue-600 transition-all group">
                <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                Sudah punya akun? Login
              </a>
            </div>
          )}
        </div>
        
        <p className="mt-8 text-center text-[10px] text-slate-400 font-bold uppercase tracking-[0.3em]">
          Fallen • {new Date().getFullYear()}
        </p>
      </div>
    </div>
  );
}