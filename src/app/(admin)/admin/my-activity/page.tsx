"use client";

import React, { useState, useRef } from "react";
import {
  CalendarDays,
  Clock,
  Timer,
  Calendar,
  RefreshCw,
} from "lucide-react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import AbsensiTab from "./components/AbsensiTab";
import ShiftTab from "./components/ShiftTab";
import CutiTab from "./components/CutiTab";
import LemburTab from "./components/LemburTab";

if (typeof window !== "undefined") {
  gsap.registerPlugin(useGSAP);
}

type ActiveTab = "absensi" | "shift" | "cuti" | "lembur";

export default function SelfServicePage() {
  const [activeTab, setActiveTab] = useState<ActiveTab>("absensi");
  const containerRef = useRef<HTMLDivElement>(null);

  // Entrance animation for header run ONCE on initial mount
  useGSAP(
    () => {
      gsap.fromTo(
        ".gsap-header-anim",
        { opacity: 0, y: -10 },
        { opacity: 1, y: 0, duration: 0.35, ease: "power2.out", clearProps: "all" }
      );
    },
    { scope: containerRef, dependencies: [] }
  );

  // Tab switch animation targeting content container
  useGSAP(
    () => {
      gsap.fromTo(
        ".gsap-tab-content",
        { opacity: 0, y: 8 },
        { opacity: 1, y: 0, duration: 0.28, ease: "power2.out", clearProps: "all" }
      );
    },
    { scope: containerRef, dependencies: [activeTab] }
  );

  return (
    <div ref={containerRef} className="p-8 font-sans min-h-screen space-y-6">
      {/* Header Halaman dengan Navigation Tab Kotak 2x2 di Sisi Kanan */}
      <div className="gsap-header-anim flex flex-col lg:flex-row justify-between items-start lg:items-center gap-5 pb-4 border-b border-slate-200/80">
        <div>
          <div className="flex items-center gap-2 mb-1.5 text-primary font-bold uppercase tracking-wider text-xs">
            <Timer size={15} />
            <span>Manajemen Waktu &amp; Kehadiran Mandiri</span>
          </div>
          <h1 className="text-3xl font-bold text-primary-dark tracking-tight">
            Aktivitas Saya
          </h1>
          <p className="text-slate-600 font-medium text-sm mt-1 max-w-xl">
            Pantau riwayat presensi harian, jadwal dinas unit kerja, administrasi cuti mandiri, dan pengajuan lembur Anda.
          </p>
        </div>

        {/* Tab Navigation Grid Kotak 2 x 2 di Sisi Kanan */}
        <div className="grid grid-cols-2 gap-2 w-full sm:w-auto shrink-0">
          {/* Tab 1: Presensi Harian */}
          <button
            onClick={() => setActiveTab("absensi")}
            className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-xs font-bold transition-all min-h-[44px] border active:scale-[0.98] ${
              activeTab === "absensi"
                ? "bg-primary text-white border-primary shadow-xs"
                : "bg-white hover:bg-slate-50 text-slate-700 border-slate-200/90 shadow-2xs"
            }`}
          >
            <div
              className={`p-1.5 rounded-lg shrink-0 ${
                activeTab === "absensi"
                  ? "bg-white/20 text-white"
                  : "bg-blue-50 text-primary"
              }`}
            >
              <Calendar size={15} />
            </div>
            <span className="whitespace-nowrap">Presensi Harian</span>
          </button>

          {/* Tab 2: Tukar Shift */}
          <button
            onClick={() => setActiveTab("shift")}
            className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-xs font-bold transition-all min-h-[44px] border active:scale-[0.98] ${
              activeTab === "shift"
                ? "bg-primary text-white border-primary shadow-xs"
                : "bg-white hover:bg-slate-50 text-slate-700 border-slate-200/90 shadow-2xs"
            }`}
          >
            <div
              className={`p-1.5 rounded-lg shrink-0 ${
                activeTab === "shift"
                  ? "bg-white/20 text-white"
                  : "bg-blue-50 text-primary"
              }`}
            >
              <RefreshCw size={15} />
            </div>
            <span className="whitespace-nowrap">Tukar Shift</span>
          </button>

          {/* Tab 3: Cuti Tahunan */}
          <button
            onClick={() => setActiveTab("cuti")}
            className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-xs font-bold transition-all min-h-[44px] border active:scale-[0.98] ${
              activeTab === "cuti"
                ? "bg-primary text-white border-primary shadow-xs"
                : "bg-white hover:bg-slate-50 text-slate-700 border-slate-200/90 shadow-2xs"
            }`}
          >
            <div
              className={`p-1.5 rounded-lg shrink-0 ${
                activeTab === "cuti"
                  ? "bg-white/20 text-white"
                  : "bg-blue-50 text-primary"
              }`}
            >
              <CalendarDays size={15} />
            </div>
            <span className="whitespace-nowrap">Cuti Tahunan</span>
          </button>

          {/* Tab 4: Kerja Lembur */}
          <button
            onClick={() => setActiveTab("lembur")}
            className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-xs font-bold transition-all min-h-[44px] border active:scale-[0.98] ${
              activeTab === "lembur"
                ? "bg-primary text-white border-primary shadow-xs"
                : "bg-white hover:bg-slate-50 text-slate-700 border-slate-200/90 shadow-2xs"
            }`}
          >
            <div
              className={`p-1.5 rounded-lg shrink-0 ${
                activeTab === "lembur"
                  ? "bg-white/20 text-white"
                  : "bg-blue-50 text-primary"
              }`}
            >
              <Clock size={15} />
            </div>
            <span className="whitespace-nowrap">Kerja Lembur</span>
          </button>
        </div>
      </div>

      {/* Konten Tab Aktif */}
      <div className="gsap-tab-content">
        {activeTab === "absensi" && <AbsensiTab />}
        {activeTab === "shift" && <ShiftTab />}
        {activeTab === "cuti" && <CutiTab />}
        {activeTab === "lembur" && <LemburTab />}
      </div>
    </div>
  );
}
