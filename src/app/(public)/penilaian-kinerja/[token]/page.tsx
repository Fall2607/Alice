"use client";

import React, { use, useState, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  MOCK_KARYAWAN_KONTRAK,
  KaryawanKontrakItem,
} from "@/app/data/penilaianKinerjaData";
import FormPenilaianKinerjaView from "@/app/components/admin/FormPenilaianKinerjaView";
import {
  ShieldCheck,
  CheckCircle2,
  Clock,
  Printer,
  Sparkles,
  ArrowRight,
} from "lucide-react";

interface PageProps {
  params: Promise<{
    token: string;
  }>;
}

export default function PenilaianKinerjaPublicPage({ params }: PageProps) {
  const resolvedParams = use(params);
  const token = resolvedParams.token;

  // Ambil data karyawan berdasarkan token
  const initialKaryawan = useMemo(() => {
    const found = MOCK_KARYAWAN_KONTRAK.find((k) => k.magicLinkToken === token);
    return found || MOCK_KARYAWAN_KONTRAK[0];
  }, [token]);

  const [karyawan, setKaryawan] = useState<KaryawanKontrakItem>(initialKaryawan);
  const [isCompleted, setIsCompleted] = useState<boolean>(karyawan.statusPenilaian === "SELESAI");
  const [submissionResult, setSubmissionResult] = useState<any>(karyawan.hasil || null);

  const handleSaveAssessment = (resultData: any) => {
    setSubmissionResult(resultData);
    setIsCompleted(true);
  };

  return (
    <div className="min-h-screen bg-[#fcfcfd] font-sans antialiased text-slate-800">
      {/* Header Minimalis Sesuai Assessment Layout */}
      <header className="bg-white border-b border-slate-200 px-4 sm:px-8 py-3.5 flex justify-between items-center sticky top-0 z-50">
        <div className="flex items-center gap-2.5">
          <div className="h-8 w-8 bg-[#0173b6] rounded-md flex items-center justify-center text-white font-black italic shadow-lg shadow-blue-100 shrink-0">
            A
          </div>
          <div>
            <span className="font-black text-slate-800 tracking-tighter uppercase text-xs sm:text-sm block leading-none">
              RSU Avisena
            </span>
            <span className="text-[9px] sm:text-[10px] text-slate-400 font-bold uppercase tracking-wider block mt-0.5">
              Evaluasi Kinerja Karyawan
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1.5 text-slate-500 bg-slate-50 px-2.5 py-1 rounded-md border border-slate-200 text-xs shrink-0">
          <ShieldCheck size={13} className="text-[#0173b6]" />
          <span className="text-[10px] font-bold uppercase tracking-widest font-mono">
            {token}
          </span>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-3xl mx-auto py-5 sm:py-8 px-3 sm:px-6 space-y-5">
        {/* Banner Sukses (Jika Baru Disimpan) */}
        {isCompleted && submissionResult && (
          <div className="p-6 rounded-xl border border-emerald-500 bg-gradient-to-r from-emerald-600 to-teal-700 text-white shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="space-y-1 text-center sm:text-left">
              <div className="flex items-center gap-2 justify-center sm:justify-start">
                <Sparkles size={16} className="text-amber-300" />
                <span className="text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full bg-white/20">
                  Evaluasi Berhasil Disimpan
                </span>
              </div>
              <h3 className="text-base font-black uppercase tracking-tight">
                Penilaian Telah Dikirim ke HRD
              </h3>
              <p className="text-xs text-emerald-100">
                Nilai Norma: <b>{Number(submissionResult.norma).toFixed(2)}</b> ({submissionResult.kategoriNorma}) &bull; Rekomendasi: <b>{submissionResult.rekomendasiUtama || "Kontrak"}</b>
              </p>
            </div>

            <button
              onClick={() => window.print()}
              className="px-6 py-3 bg-white text-emerald-800 hover:bg-emerald-50 font-black rounded-lg uppercase text-[10px] tracking-widest transition-all shadow-md shrink-0 cursor-pointer"
            >
              Cetak Dokumen
            </button>
          </div>
        )}

        {/* Form Penilaian */}
        <FormPenilaianKinerjaView
          karyawan={karyawan}
          readOnly={false}
          onSave={handleSaveAssessment}
        />

        {/* Footer Minimalis */}
        <footer className="text-center text-[10px] font-bold uppercase tracking-widest text-slate-400 py-6 border-t border-slate-200">
          Form Penilaian / HRD / XI / REV.1 &bull; Human Resource Development RSU Avisena
        </footer>
      </main>

      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
        body { font-family: 'Plus Jakarta Sans', sans-serif !important; }
      `}</style>
    </div>
  );
}
