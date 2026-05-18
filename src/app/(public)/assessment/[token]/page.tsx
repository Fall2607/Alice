/** Path: src/app/(public)/assessment/[token]/page.tsx 
 * Deskripsi: Halaman Verifikasi Kode Akses.
 * Fungsi: Memvalidasi 6 karakter kode akses dari email sebelum masuk ke dashboard.
 * Perbaikan: Menggunakan shim internal untuk navigasi agar jalan di pratinjau & menghilangkan header.
 */

"use client";

import React, { useState, useEffect } from "react";
import { Fingerprint, ArrowRight, Loader2 } from "lucide-react";
import { useRouter, useParams } from "next/navigation";


export default function VerificationPage() {
  const router = useRouter();
  const params = useParams();
  const token = params.token;
  
  const [accessCode, setAccessCode] = useState("");
  const [mounted, setMounted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => { setMounted(true); }, []);

const handleVerify = async (e: React.FormEvent) => {
  e.preventDefault();
  setIsLoading(true);

  try {
    const res = await fetch('/api/assessment/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, access_code: accessCode })
    });

    const data = await res.json();

    if (!res.ok) {
      // Tampilkan error dari backend (salah kode, expired, dsb.)
      alert(data.message || "Gagal melakukan verifikasi. Coba lagi.");
      return;
    }

    // Jika sukses, simpan sesi dan arahkan ke dashboard ujian
    sessionStorage.setItem("verified_token", token as string);
    sessionStorage.setItem("assessment_id", data.assessmentId);
    sessionStorage.setItem("candidate_id", data.candidateId);
    
    router.push(`/assessment/${token}/dashboard`);
  } catch (error: any) {
    alert("Terjadi kesalahan saat menghubungi server.");
  } finally {
    setIsLoading(false);
  }
};

  if (!mounted) return null;

  return (
    <div className="flex-1 flex flex-col items-center justify-start pt-12 md:pt-24 p-6 animate-in fade-in zoom-in duration-500 font-sans min-h-screen bg-[#fcfcfd]">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-5 text-[#0173b6] border border-blue-100 shadow-sm">
            <Fingerprint size={32} />
          </div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tighter uppercase mb-2 leading-none">Verifikasi Kode Akses</h1>
          <p className="text-slate-400 text-xs font-medium px-4 leading-relaxed">
            Masukkan 6 karakter kode akses yang dikirimkan ke email Anda untuk memvalidasi akses peserta seleksi.
          </p>
        </div>

        <div className="bg-white p-6 md:p-8 rounded-md border border-slate-200 shadow-sm">
          <form onSubmit={handleVerify} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Kode Akses (6 Karakter)</label>
              <input 
                type="text" 
                maxLength={6}
                placeholder="••••••"
                value={accessCode}
                onChange={(e) => setAccessCode(e.target.value.toUpperCase())}
                className="w-full text-center text-3xl tracking-[0.6em] py-5 bg-slate-50 border border-slate-200 rounded-md focus:bg-white focus:border-[#0173b6] outline-none transition-all font-black text-[#0173b6] uppercase"
                required
              />
            </div>
            <button 
              type="submit"
              disabled={isLoading || accessCode.length !== 6}
              className="w-full bg-[#0173b6] text-white font-black py-4 rounded-md hover:bg-[#015a8f] transition-all shadow-lg shadow-blue-100 flex items-center justify-center gap-3 uppercase text-[10px] tracking-widest active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <><Loader2 size={16} className="animate-spin" /> Memverifikasi...</>
              ) : (
                <>Akses Modul Ujian <ArrowRight size={16} /></>
              )}
            </button>
          </form>
        </div>
        
        <p className="text-center mt-10 text-[9px] font-black text-slate-300 uppercase tracking-widest">
          Sesi Token: {token}
        </p>
      </div>
      
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
        body { font-family: 'Plus Jakarta Sans', sans-serif !important; }
      `}</style>
    </div>
  );
}