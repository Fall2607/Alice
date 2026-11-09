"use client";

import React, { useState } from "react";
import {
  CalendarDays,
  Clock,
  Timer,
  Calendar,
  RefreshCw,
} from "lucide-react";
import AbsensiTab from "./components/AbsensiTab";
import ShiftTab from "./components/ShiftTab";
import CutiTab from "./components/CutiTab";
import LemburTab from "./components/LemburTab";

type ActiveTab = "absensi" | "shift" | "cuti" | "lembur";

export default function SelfServicePage() {
  const [activeTab, setActiveTab] = useState<ActiveTab>("absensi");

  return (
    <div className="p-8 font-sans min-h-screen space-y-6">
      {/* Header Halaman */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-2 border-b border-slate-200/80">
        <div>
          <div className="flex items-center gap-2 mb-1 text-primary font-bold uppercase tracking-wider text-xs">
            <Timer size={15} />
            <span>Manajemen Waktu & Kehadiran</span>
          </div>
          <h1 className="text-3xl font-bold text-primary-dark tracking-tight">
            Aktivitas Saya
          </h1>
          <p className="text-slate-500 font-medium text-sm mt-1">
            Pantau riwayat presensi harian, jadwal dinas unit kerja, dan administrasi permohonan mandiri Anda.
          </p>
        </div>

        {/* Tab Switcher Alice Style */}
        <div className="flex items-center bg-slate-100 p-1.5 rounded-2xl border border-slate-200 shadow-inner overflow-x-auto max-w-full">
          <button
            onClick={() => setActiveTab("absensi")}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all min-h-[44px] whitespace-nowrap active:scale-[0.98] ${
              activeTab === "absensi"
                ? "bg-white text-primary shadow-xs border border-slate-200/80 font-bold"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Calendar size={15} /> Presensi
          </button>
          <button
            onClick={() => setActiveTab("shift")}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all min-h-[44px] whitespace-nowrap active:scale-[0.98] ${
              activeTab === "shift"
                ? "bg-white text-primary shadow-xs border border-slate-200/80 font-bold"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <RefreshCw size={15} /> Jadwal Shift
          </button>
          <button
            onClick={() => setActiveTab("cuti")}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all min-h-[44px] whitespace-nowrap active:scale-[0.98] ${
              activeTab === "cuti"
                ? "bg-white text-primary shadow-xs border border-slate-200/80 font-bold"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <CalendarDays size={15} /> Cuti
          </button>
          <button
            onClick={() => setActiveTab("lembur")}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all min-h-[44px] whitespace-nowrap active:scale-[0.98] ${
              activeTab === "lembur"
                ? "bg-white text-primary shadow-xs border border-slate-200/80 font-bold"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Clock size={15} /> Lembur
          </button>
        </div>
      </div>

      {/* Render Active Tab */}
      <div className="transition-opacity duration-200">
        {activeTab === "absensi" && <AbsensiTab />}
        {activeTab === "shift" && <ShiftTab />}
        {activeTab === "cuti" && <CutiTab />}
        {activeTab === "lembur" && <LemburTab />}
      </div>
    </div>
  );
}
