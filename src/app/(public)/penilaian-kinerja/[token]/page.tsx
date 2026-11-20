"use client";

import React, { use, useState, useMemo, useRef } from "react";
import Link from "next/link";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";

if (typeof window !== "undefined") {
  gsap.registerPlugin(useGSAP);
}

import {
  MOCK_KARYAWAN_KONTRAK,
  KaryawanKontrakItem,
} from "@/app/data/penilaianKinerjaData";
import FormPenilaianKinerjaView, {
  FormAssessmentData,
} from "@/app/components/admin/FormPenilaianKinerjaView";
import {
  ShieldCheck,
  CheckCircle2,
  Clock,
  Printer,
  Sparkles,
  ArrowRight,
  FileCheck2,
  Building2,
  Lock,
} from "lucide-react";

interface PageProps {
  params: Promise<{
    token: string;
  }>;
}

export default function PenilaianKinerjaPublicPage({ params }: PageProps) {
  const pageRef = useRef<HTMLDivElement>(null);
  const resolvedParams = use(params);
  const token = resolvedParams.token;

  // Temukan data karyawan berdasarkan magic link token
  const initialKaryawan = useMemo(() => {
    const found = MOCK_KARYAWAN_KONTRAK.find((k) => k.magicLinkToken === token);
    return found || MOCK_KARYAWAN_KONTRAK[0];
  }, [token]);

  const [karyawan, setKaryawan] = useState<KaryawanKontrakItem>(initialKaryawan);
  const [isCompleted, setIsCompleted] = useState<boolean>(
    karyawan.statusPenilaian === "SELESAI"
  );
  const [submissionResult, setSubmissionResult] = useState<FormAssessmentData | null>(
    karyawan.hasil
      ? {
          karyawanId: karyawan.id,
          scores: {},
          totalSkor: karyawan.hasil.totalSkor,
          indeksPrestasi: karyawan.hasil.indeksPrestasi,
          norma: karyawan.hasil.norma,
          kategoriNorma: karyawan.hasil.kategoriNorma,
          rekomendasiUtama: karyawan.hasil.rekomendasi.tipe,
          kontrakTahun: 1,
          kelebihan: "",
          kekurangan: "",
          pelatihan: "",
          catatanSaran: karyawan.hasil.rekomendasi.detail,
        }
      : null
  );

  // GSAP: Entrance animation for public evaluation portal
  useGSAP(
    () => {
      const tl = gsap.timeline({ defaults: { ease: "power2.out" } });

      tl.from(".portal-header", {
        y: -14,
        opacity: 0,
        duration: 0.45,
        clearProps: "all",
      }).from(
        ".portal-content",
        {
          y: 16,
          opacity: 0,
          duration: 0.4,
          clearProps: "all",
        },
        "-=0.2"
      );
    },
    { scope: pageRef }
  );

  const handleSaveAssessment = (resultData: FormAssessmentData) => {
    setSubmissionResult(resultData);
    setIsCompleted(true);
    setKaryawan((prev) => ({
      ...prev,
      statusPenilaian: "SELESAI",
      hasil: {
        totalSkor: resultData.totalSkor,
        indeksPrestasi: resultData.indeksPrestasi,
        norma: resultData.norma,
        kategoriNorma: resultData.kategoriNorma,
        rekomendasi: {
          tipe: resultData.rekomendasiUtama,
          detail: resultData.catatanSaran,
        },
      },
    }));

    // Scroll to top to see confirmation smoothly
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <div ref={pageRef} className="min-h-screen bg-slate-50/70 font-sans antialiased text-slate-800">
      {/* 1. Header Minimalis Rumah Sakit dengan Standard Avisena */}
      <header className="portal-header bg-white border-b border-slate-200/90 px-4 sm:px-8 py-3.5 flex justify-between items-center sticky top-0 z-50 shadow-2xs">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 bg-[#0173b6] rounded-xl flex items-center justify-center text-white font-black italic shadow-xs shrink-0 text-base">
            A
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-black text-slate-900 tracking-tight uppercase text-xs sm:text-sm block leading-none">
                RSU Avisena
              </span>
              <span className="badge badge-primary badge-outline text-[9px] font-bold uppercase py-0.5 px-1.5">
                SDM Medis
              </span>
            </div>
            <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider block mt-0.5">
              Formulir Evaluasi Kinerja Pegawai (PKWT)
            </span>
          </div>
        </div>

        {/* Security Token Verified Chip */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="hidden sm:flex items-center gap-1.5 bg-emerald-50 text-emerald-800 px-2.5 py-1 rounded-xl border border-emerald-200/80 text-[11px] font-bold">
            <Lock size={12} className="text-emerald-600" />
            <span>Tautan Rahasia Terverifikasi</span>
          </div>
          <div className="flex items-center gap-1.5 bg-slate-100 text-slate-700 px-2.5 py-1 rounded-xl border border-slate-200 text-xs font-mono font-bold tabular-nums">
            <ShieldCheck size={13} className="text-[#0173b6]" />
            <span className="text-[11px]">{token}</span>
          </div>
        </div>
      </header>

      {/* 2. Main Workspace */}
      <main className="portal-content max-w-6xl mx-auto py-6 sm:py-8 px-4 sm:px-6 space-y-6">
        {/* Banner Sukses (Jika Baru Disimpan atau Sudah Selesai) */}
        {isCompleted && submissionResult && (
          <div className="p-6 rounded-2xl border-2 border-emerald-500 bg-gradient-to-r from-emerald-600 to-teal-700 text-white shadow-md flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="space-y-1.5 text-center sm:text-left">
              <div className="flex items-center gap-2 justify-center sm:justify-start">
                <Sparkles size={16} className="text-amber-300" />
                <span className="badge badge-sm font-black uppercase tracking-widest bg-white/20 text-white border-none">
                  Evaluasi Terverifikasi Resmi
                </span>
              </div>
              <h3 className="text-lg font-black tracking-tight">
                Penilaian Kinerja Berhasil Dikirimkan ke Bagian SDM
              </h3>
              <p className="text-xs text-emerald-100 font-medium">
                Nilai Norma: <b className="font-mono tabular-nums">{Number(submissionResult.norma).toFixed(2)}</b> ({submissionResult.kategoriNorma}) &bull; Rekomendasi: <b>{submissionResult.rekomendasiUtama}</b>
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => window.print()}
                className="btn btn-sm bg-white hover:bg-emerald-50 text-emerald-900 font-bold rounded-xl gap-2 active:scale-[0.98] transition-all shadow-sm"
              >
                <Printer size={14} />
                <span>Cetak Dokumen</span>
              </button>
            </div>
          </div>
        )}

        {/* Form Penilaian Interaktif */}
        <FormPenilaianKinerjaView
          karyawan={karyawan}
          readOnly={isCompleted}
          onSave={handleSaveAssessment}
        />

        {/* Footer Resmi Rumah Sakit */}
        <footer className="text-center text-[11px] font-bold uppercase tracking-wider text-slate-400 py-6 border-t border-slate-200/80 space-y-1">
          <p>Form Penilaian / HRD / XI / REV.1 &bull; Rumah Sakit Umum Avisena</p>
          <p className="text-[10px] text-slate-400 font-normal">
            Jl. Raya Melong No. 170, Cimahi Selatan &bull; Sistem Informasi Manajemen Rumah Sakit
          </p>
        </footer>
      </main>
    </div>
  );
}
