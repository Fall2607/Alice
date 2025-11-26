// File: src/app/karir/[slug]/apply/layout.tsx
"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Building2, ChevronDown, CheckCircle2, Circle } from "lucide-react";
import SidebarSteps from "@/app/components/career/SidebarSteps";
import { ApplyProvider } from "./ApplyContext";

export default function ApplyLayout({ children }: { children: React.ReactNode }) {
  const params = useParams();
  const slug = params?.slug as string;
  const [job, setJob] = useState<any | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const router = useRouter();
  const pathname = usePathname(); // Hook untuk mendeteksi URL aktif

  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "";

  // Definisi Langkah-Langkah
  const steps = [
    { id: 1, label: "Identitas Diri", path: "" }, // Root /apply
    { id: 2, label: "Data Keluarga", path: "/step2" },
    { id: 3, label: "Riwayat Pendidikan", path: "/step3" },
    { id: 4, label: "Pengalaman Kerja", path: "/step4" },
    { id: 5, label: "Upload Dokumen", path: "/step5" },
    { id: 6, label: "Review & Kirim", path: "/step6" },
  ];

  // Logika Menentukan Step Aktif
  const getCurrentStep = () => {
    if (!pathname) return 1;
    // Ambil segmen terakhir dari URL
    const segments = pathname.split('/');
    const lastSegment = segments[segments.length - 1];

    if (lastSegment === 'apply') return 1;
    if (lastSegment.startsWith('step')) {
      const num = parseInt(lastSegment.replace('step', ''));
      return isNaN(num) ? 1 : num;
    }
    return 1;
  };

  const currentStep = getCurrentStep();
  const progressPercent = (currentStep / steps.length) * 100;

  useEffect(() => {
    if (!slug) return;
    const fetchJob = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${baseUrl}/job-openings/${slug}`);
        if (!res.ok) throw new Error("Job not found");
        const data = await res.json();
        setJob(data);
      } catch (e) {
        console.error("Failed to load job", e);
      } finally {
        setLoading(false);
      }
    };
    fetchJob();
  }, [slug, baseUrl]);

  // Handler Navigasi Mobile
  const handleMobileNav = (path: string) => {
    router.push(`/karir/${slug}/apply${path}`);
    setIsMobileMenuOpen(false);
  };

  return (
    <ApplyProvider>
      <div className="min-h-screen bg-slate-50 font-sans text-slate-800">

        {/* --- TOP NAVIGATION BAR --- */}
        <div className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-sm bg-opacity-95 backdrop-blur-md transition-all">
          <div className="container mx-auto px-4 md:px-6 h-16 flex items-center justify-between relative">

            {/* Kiri: Tombol Kembali & Info Lowongan */}
            <div className="flex items-center gap-3 md:gap-4 overflow-hidden">
              <Link
                href={`/karir/${slug}`}
                className="p-2 rounded-full hover:bg-slate-100 text-slate-500 hover:text-slate-800 transition-colors shrink-0"
                title="Kembali ke Detail"
              >
                <ArrowLeft size={20} />
              </Link>
              <div className="h-8 w-[1px] bg-slate-200 hidden md:block"></div>
              <div className="min-w-0">
                <div className="flex items-center gap-2 text-[10px] md:text-xs font-bold text-primary uppercase tracking-wider">
                  <Building2 size={12} />
                  Melamar Posisi
                </div>
                <div className="text-sm md:text-base font-bold text-slate-800 truncate max-w-[150px] md:max-w-md">
                  {loading ? <span className="animate-pulse bg-slate-200 h-4 w-24 rounded inline-block"></span> : job?.title}
                </div>
              </div>
            </div>

            {/* Kanan: Mobile Step Indicator (Interactive Dropdown) */}
            <div className="md:hidden relative">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="flex items-center gap-2 text-xs font-bold text-slate-700 bg-slate-100 pl-3 pr-2 py-1.5 rounded-full hover:bg-slate-200 transition-colors border border-slate-200 active:scale-95"
              >
                Step {currentStep}/{steps.length}
                <ChevronDown size={14} className={`transition-transform duration-300 ${isMobileMenuOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Mobile Menu Overlay & Dropdown */}
              {isMobileMenuOpen && (
                <>
                  <div className="fixed inset-0 bg-black/20 z-40" onClick={() => setIsMobileMenuOpen(false)}></div>
                  <div className="absolute top-full right-0 mt-3 w-56 bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 origin-top-right">
                    <div className="bg-slate-50 px-4 py-2 border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      Navigasi Langkah
                    </div>
                    <div className="max-h-[60vh] overflow-y-auto custom-scrollbar">
                      {steps.map((step) => {
                        const isActive = currentStep === step.id;
                        const isDone = currentStep > step.id;
                        return (
                          <button
                            key={step.id}
                            onClick={() => handleMobileNav(step.path)}
                            className={`w-full text-left px-4 py-3 text-xs font-medium border-b border-slate-50 last:border-0 flex items-center gap-3 transition-colors ${isActive ? 'bg-primary/5 text-primary' : 'text-slate-600 hover:bg-slate-50'}`}
                          >
                            {isDone ? (
                              <CheckCircle2 size={16} className="text-green-500 shrink-0" />
                            ) : isActive ? (
                              <div className="w-4 h-4 rounded-full border-2 border-primary flex items-center justify-center shrink-0">
                                <div className="w-2 h-2 bg-primary rounded-full"></div>
                              </div>
                            ) : (
                              <Circle size={16} className="text-slate-300 shrink-0" />
                            )}
                            <span className={isActive ? "font-bold" : ""}>{step.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Mobile Progress Bar (Bottom of Header) */}
          <div className="md:hidden w-full bg-slate-100 h-1 absolute bottom-0 left-0">
            <div
              className="bg-primary h-full transition-all duration-500 ease-out rounded-r-full shadow-[0_0_10px_rgba(var(--primary),0.5)]"
              style={{ width: `${progressPercent}%` }}
            ></div>
          </div>
        </div>

        {/* --- MAIN CONTENT --- */}
        <div className="container mx-auto px-4 md:px-6 py-6 md:py-8">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">

            {/* SIDEBAR (Desktop Only - Sticky) */}
            <div className="hidden lg:block lg:col-span-1 sticky top-24 transition-all duration-300">
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-2">
                <SidebarSteps currentStep={currentStep} steps={steps} />
              </div>
            </div>

            {/* FORM AREA */}
            <div className="lg:col-span-3">
              <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/60 border border-white p-5 md:p-10 min-h-[500px] animate-in fade-in slide-in-from-bottom-4 duration-500 relative">
                {children}
              </div>
            </div>

          </div>
        </div>
      </div>
    </ApplyProvider>
  );
}