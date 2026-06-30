"use client";

import React, { useState, useEffect } from "react";
import { Users, Clock, AlertTriangle, CalendarDays, Loader2, ArrowRight, Grid } from "lucide-react";
import Link from "next/link";
import Select from "react-select";

export default function DashboardAbsensiPage() {
  const [selectedUnit, setSelectedUnit] = useState("all");
  const [departemenList, setDepartemenList] = useState<{id: string, nama_departemen: string}[]>([]);
  const [stats, setStats] = useState({
    totalKaryawan: 0,
    hadirHariIni: 0,
    terlambatHariIni: 0,
    alphaHariIni: 0,
    kehadiranBulanIni: 0
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch('/api/departemen')
      .then(res => res.json())
      .then(data => setDepartemenList(Array.isArray(data) ? data : []))
      .catch(console.error);
  }, []);

  useEffect(() => {
    let superiorParam = "";
    try {
      const userStr = localStorage.getItem("user");
      if (userStr) {
        const userObj = JSON.parse(userStr);
        const role = userObj.role?.toLowerCase() || "";
        if (role === "spv" || role === "supervisor" || role === "koordinator") {
          superiorParam = `&superiorId=${userObj.karyawan_id}`;
        }
      }
    } catch (e) {
      console.error(e);
    }

    setIsLoading(true);
    fetch(`/api/absensi/dashboard?unit=${selectedUnit}${superiorParam}`)
      .then(res => res.json())
      .then(data => {
        setStats(data);
      })
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, [selectedUnit]);

  const dateStr = new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  // Format options for react-select
  const unitOptions = [
    { value: "all", label: "Semua Unit (Seluruh Karyawan)" },
    ...departemenList.map(dep => ({ value: dep.id, label: dep.nama_departemen }))
  ];

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight">Dashboard Kehadiran</h1>
          <p className="text-sm font-medium text-slate-500 mt-1">
            Ringkasan absensi harian per {dateStr}
          </p>
        </div>
        
        <div className="relative w-full md:w-72">
          <Select 
            options={unitOptions}
            value={unitOptions.find(opt => opt.value === selectedUnit)}
            onChange={(selectedOption) => setSelectedUnit(selectedOption?.value || "all")}
            placeholder="Pilih Unit / Departemen..."
            className="text-sm font-semibold"
            classNamePrefix="react-select"
            styles={{
              control: (base) => ({
                ...base,
                border: '1px solid #e2e8f0',
                borderRadius: '0.5rem',
                padding: '2px',
                boxShadow: 'none',
                '&:hover': {
                  border: '1px solid #cbd5e1'
                }
              })
            }}
          />
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 text-[#0173b6] animate-spin" />
        </div>
      ) : (
        <>
          {/* Main Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-gradient-to-br from-blue-500 to-[#0173b6] p-6 rounded-2xl text-white shadow-lg shadow-blue-200 relative overflow-hidden">
              <div className="absolute -right-4 -bottom-4 opacity-10">
                <Users size={120} />
              </div>
              <p className="text-blue-100 text-sm font-bold uppercase tracking-wider mb-2">Total Karyawan</p>
              <h2 className="text-4xl font-black">{stats.totalKaryawan}</h2>
            </div>
            
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-center">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                  <CalendarDays size={16} />
                </div>
                <p className="text-slate-500 text-sm font-bold uppercase tracking-wider">Hadir Hari Ini</p>
              </div>
              <h2 className="text-3xl font-black text-slate-800">{stats.hadirHariIni} <span className="text-sm font-semibold text-slate-400">orang</span></h2>
              <p className="text-xs text-emerald-500 font-bold mt-2">
                {stats.totalKaryawan > 0 ? Math.round((stats.hadirHariIni / stats.totalKaryawan) * 100) : 0}% dari total
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-center">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center shrink-0">
                  <Clock size={16} />
                </div>
                <p className="text-slate-500 text-sm font-bold uppercase tracking-wider">Terlambat</p>
              </div>
              <h2 className="text-3xl font-black text-slate-800">{stats.terlambatHariIni} <span className="text-sm font-semibold text-slate-400">orang</span></h2>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-center">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 rounded-full bg-red-100 text-red-600 flex items-center justify-center shrink-0">
                  <AlertTriangle size={16} />
                </div>
                <p className="text-slate-500 text-sm font-bold uppercase tracking-wider">Belum Absen / Alpha</p>
              </div>
              <h2 className="text-3xl font-black text-slate-800">{stats.alphaHariIni} <span className="text-sm font-semibold text-slate-400">orang</span></h2>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
               <h3 className="text-lg font-black text-slate-800 mb-1">Rata-rata Kehadiran Bulan Ini</h3>
               <p className="text-sm text-slate-500 mb-6">Persentase tingkat kehadiran keseluruhan</p>
               
               <div className="flex items-center gap-6">
                 <div className="relative w-32 h-32 flex items-center justify-center shrink-0">
                    <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                      <path
                        className="text-slate-100"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="3"
                      />
                      <path
                        className="text-[#0173b6] drop-shadow-md"
                        strokeDasharray={`${stats.kehadiranBulanIni}, 100`}
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="3.5"
                        strokeLinecap="round"
                      />
                    </svg>
                    <div className="absolute flex flex-col items-center justify-center">
                      <span className="text-2xl font-black text-slate-800">{stats.kehadiranBulanIni}%</span>
                    </div>
                 </div>
                 
                 <div>
                   <p className="text-sm font-bold text-slate-600 mb-2">Insight Kedisiplinan</p>
                   <p className="text-xs text-slate-500 leading-relaxed">
                     {Number(stats.kehadiranBulanIni) >= 90 
                       ? "Luar biasa! Tingkat kedisiplinan unit ini sangat tinggi." 
                       : Number(stats.kehadiranBulanIni) >= 75
                       ? "Tingkat kehadiran cukup baik, namun masih ada ruang untuk ditingkatkan."
                       : "Perhatian: Tingkat kehadiran unit ini berada di bawah standar."}
                   </p>
                 </div>
               </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col items-center justify-center text-center">
              <div className="w-16 h-16 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mb-4">
                <Grid size={32} />
              </div>
              <h3 className="text-lg font-black text-slate-800 mb-2">Ingin melihat detail lengkap?</h3>
              <p className="text-sm text-slate-500 mb-6 max-w-sm">
                Buka halaman Rekapitulasi untuk melihat tabel absensi bulanan dan kalender heatmap per karyawan.
              </p>
              <Link 
                href="/admin/kehadiran/rekap" 
                className="flex items-center gap-2 bg-[#0173b6] hover:bg-[#005f98] text-white px-6 py-3 rounded-lg text-sm font-bold transition-all shadow-md shadow-blue-200"
              >
                Buka Rekap Bulanan <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
