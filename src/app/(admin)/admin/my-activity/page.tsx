/** Path: app/(admin)/admin/self-service/page.tsx
 * Deskripsi: Antarmuka mandiri untuk Karyawan (Cuti, Lembur, dan Log Absensi).
 * Perubahan: Pemisahan komponen ke dalam tab untuk maintenance yang lebih baik.
 */

"use client";

import React, { useState } from "react";
import {
  CalendarDays,
  Clock,
  Timer,
  Calendar,
} from "lucide-react";
import AbsensiTab from "./components/AbsensiTab";
import CutiTab from "./components/CutiTab";
import LemburTab from "./components/LemburTab";

type ActiveTab = "cuti" | "lembur" | "absensi";

export default function SelfServicePage() {
  const [activeTab, setActiveTab] = useState<ActiveTab>("absensi");

  return (
    <div className="p-8 font-sans max-w-7xl mx-auto min-h-screen">
      {/* Header Halaman */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
        <div>
          <div className="flex items-center gap-2 mb-1 text-blue-600 font-black uppercase tracking-[0.3em] text-[9px]">
            <Timer size={12} />
            <span>Manajemen Waktu</span>
          </div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tighter leading-none">
            Aktivitas Saya
          </h1>
          <p className="text-slate-400 font-medium text-xs mt-2">
            Pantau kehadiran dan kelola permohonan administrasi Anda.
          </p>
        </div>

        {/* Tab Switcher Alice Style */}
        <div className="flex bg-slate-100 p-1 rounded-[20px] border border-slate-200 shadow-inner">
          <button
            onClick={() => setActiveTab("absensi")}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all ${activeTab === "absensi" ? "bg-white text-blue-600 shadow-md" : "text-slate-400 hover:text-slate-600"}`}
          >
            <Calendar size={14} /> Absensi
          </button>
          <button
            onClick={() => setActiveTab("cuti")}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all ${activeTab === "cuti" ? "bg-white text-blue-600 shadow-md" : "text-slate-400 hover:text-slate-600"}`}
          >
            <CalendarDays size={14} /> Cuti
          </button>
          <button
            onClick={() => setActiveTab("lembur")}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all ${activeTab === "lembur" ? "bg-white text-blue-600 shadow-md" : "text-slate-400 hover:text-slate-600"}`}
          >
            <Clock size={14} /> Lembur
          </button>
        </div>
      </div>

      {/* Render Active Tab */}
      {activeTab === "absensi" && <AbsensiTab />}
      {activeTab === "cuti" && <CutiTab />}
      {activeTab === "lembur" && <LemburTab />}

      <div className="text-center py-10 opacity-20 mt-10">
        <p className="text-[8px] font-black text-slate-900 uppercase tracking-[1.2em]">
          Alice Digital Platform
        </p>
      </div>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #e2e8f0;
          border-radius: 10px;
        }
      `}</style>
    </div>
  );
}
