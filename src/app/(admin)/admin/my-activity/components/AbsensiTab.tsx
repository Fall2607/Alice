"use client";

import React, { useState, useEffect } from "react";
import {
  Calendar,
  LogIn,
  LogOut as LogOutIcon,
  Filter,
  ArrowUpRight,
  ShieldCheck,
} from "lucide-react";

export default function AbsensiTab() {
  const [attendanceLog, setAttendanceLog] = useState<any[]>([]);
  const [stats, setStats] = useState({ hadir: 0, terlambat: 0, score: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "";

  useEffect(() => {
    const fetchAbsensi = async () => {
      try {
        const userString = localStorage.getItem("user");
        if (!userString) return;
        const user = JSON.parse(userString);
        if (!user.karyawan_id) return;

        const response = await fetch(`${baseUrl}/absensi/${user.karyawan_id}`);
        if (response.ok) {
          const data = await response.json();
          let hadir = 0;
          let terlambat = 0;

          const formattedLogs = data.map((item: any) => {
            const dateObj = new Date(item.tanggal);
            const dateStr = dateObj.toLocaleDateString("id-ID", { weekday: 'long', day: '2-digit', month: 'short' });
            
            // Backend (Vercel) mengirimkan timestamp WIB yang terbungkus dalam format UTC (Z). 
            // Parsing dengan new Date() di browser akan menambah +7 jam (offset lokal).
            // Solusi: Ambil saja bagian jam dari string aslinya.
            const extractTime = (timeStr: string) => {
               if (!timeStr) return "-";
               // Jika format ISO "2026-06-26T08:00:00.000Z"
               if (timeStr.includes("T")) {
                   return timeStr.substring(11, 16);
               }
               // Jika format "2026-06-26 08:00:00"
               const parts = timeStr.split(" ");
               if (parts.length > 1) {
                   return parts[1].substring(0, 5);
               }
               return "-";
            };

            const inTime = extractTime(item.jam_masuk);
            const outTime = extractTime(item.jam_keluar);
            const jamKeluarObj = item.jam_keluar ? new Date(item.jam_keluar) : null;
            const jamMasukObj = item.jam_masuk ? new Date(item.jam_masuk) : null;
            
            let status = "Tepat Waktu";
            if (item.menit_terlambat > 0) {
               status = "Terlambat";
               terlambat++;
            } else if (item.jam_keluar && jamKeluarObj && jamMasukObj) {
               if (jamKeluarObj.getHours() < 17) {
                   status = "Pulang Cepat";
               }
            }
            hadir++;
            return { date: dateStr, shift: item.nama_shift || "Umum", in: inTime, out: outTime, status: status };
          });

          setAttendanceLog(formattedLogs);
          setStats({
            hadir,
            terlambat,
            score: hadir === 0 ? 0 : Math.round(((hadir - terlambat) / hadir) * 100)
          });
        }
      } catch (err) {
        console.error("Failed to fetch absensi", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchAbsensi();
  }, [baseUrl]);

  function logDateOnly(fullDate: string) {
    if (!fullDate || !fullDate.includes(",")) return fullDate;
    return fullDate.split(",")[1].trim();
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      {/* Sisi Kiri: Main Content */}
      <div className="lg:col-span-8">
        <div className="bg-white rounded-[40px] shadow-2xl shadow-slate-200/40 border border-white p-8 md:p-10 relative overflow-hidden h-full">
          <div className="absolute top-0 right-0 p-8 opacity-[0.02] pointer-events-none text-slate-900">
            <Calendar size={180} />
          </div>

          <div className="animate-in fade-in slide-in-from-left-4 duration-500">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-3 uppercase">
                <div className="h-6 w-1.5 bg-blue-600 rounded-full"></div>
                Log Kehadiran Bulanan
              </h2>
              <div className="flex gap-2">
                <button className="p-2 bg-slate-50 text-slate-400 rounded-xl hover:text-blue-600 border border-slate-100 transition-all">
                  <Filter size={16} />
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-slate-50">
                    <th className="pb-4 text-[9px] font-black text-slate-400 uppercase tracking-widest px-2">Tanggal</th>
                    <th className="pb-4 text-[9px] font-black text-slate-400 uppercase tracking-widest px-2">Shift</th>
                    <th className="pb-4 text-[9px] font-black text-slate-400 uppercase tracking-widest text-center">Masuk</th>
                    <th className="pb-4 text-[9px] font-black text-slate-400 uppercase tracking-widest text-center">Pulang</th>
                    <th className="pb-4 text-[9px] font-black text-slate-400 uppercase tracking-widest text-right px-2">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {isLoading ? (
                    Array(3).fill(0).map((_, i) => (
                      <tr key={i} className="animate-pulse">
                        <td className="py-4 px-2"><div className="h-4 bg-slate-100 rounded w-20"></div></td>
                        <td className="py-4 px-2"><div className="h-4 bg-slate-100 rounded w-16"></div></td>
                        <td className="py-4 px-2"><div className="h-6 bg-slate-100 rounded-lg mx-auto w-16"></div></td>
                        <td className="py-4 px-2"><div className="h-6 bg-slate-100 rounded-lg mx-auto w-16"></div></td>
                        <td className="py-4 px-2 flex justify-end"><div className="h-4 bg-slate-100 rounded w-16"></div></td>
                      </tr>
                    ))
                  ) : attendanceLog.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-xs font-bold text-slate-400 uppercase tracking-widest">
                        Belum ada log absensi bulan ini.
                      </td>
                    </tr>
                  ) : (
                    attendanceLog.map((log, idx) => (
                      <tr key={idx} className="group hover:bg-slate-50/50 transition-colors">
                        <td className="py-4 px-2">
                          <span className="text-xs font-bold text-slate-700">{log.date}</span>
                        </td>
                        <td className="py-4 px-2">
                          <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-1 rounded-md">{log.shift}</span>
                        </td>
                        <td className="py-4 text-center">
                          <div className="inline-flex items-center gap-1.5 text-xs font-black text-emerald-600 bg-emerald-50 px-3 py-1 rounded-lg border border-emerald-100">
                            <LogIn size={12} /> {log.in}
                          </div>
                        </td>
                        <td className="py-4 text-center">
                          <div className="inline-flex items-center gap-1.5 text-xs font-black text-blue-600 bg-blue-50 px-3 py-1 rounded-lg border border-blue-100">
                            <LogOutIcon size={12} /> {log.out}
                          </div>
                        </td>
                        <td className="py-4 text-right px-2">
                          <span className={`text-[9px] font-black uppercase tracking-tight ${log.status === "Tepat Waktu" ? "text-emerald-500" : "text-amber-500"}`}>
                            {log.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <div className="mt-8 pt-6 border-t border-slate-50 flex justify-center">
              <button className="text-[10px] font-black text-blue-600 uppercase tracking-widest hover:underline">
                Lihat Laporan Lengkap
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Sisi Kanan: Summary Panel */}
      <div className="lg:col-span-4 space-y-6">
        <div className="rounded-[32px] p-8 text-white shadow-xl relative overflow-hidden group border transition-all duration-500 bg-slate-900 border-slate-800">
          <div className="absolute top-[-20%] right-[-10%] w-40 h-40 bg-white/5 rounded-full blur-3xl"></div>
          <div className="flex items-center gap-2 mb-6">
            <div className="p-2 bg-white/10 rounded-lg">
              <Calendar size={14} />
            </div>
            <h3 className="text-[9px] font-black text-slate-400 uppercase tracking-[0.3em]">
              Ringkasan Bulan Ini
            </h3>
          </div>
          <div className="space-y-5 relative z-10">
            <div className="flex justify-between items-end">
              <p className="text-[10px] font-bold text-slate-400 uppercase">Hadir</p>
              {isLoading ? (
                <div className="h-8 w-16 bg-slate-800 rounded animate-pulse"></div>
              ) : (
                <span className="text-3xl font-black leading-none">
                  {stats.hadir < 10 ? `0${stats.hadir}` : stats.hadir} <span className="text-[10px] text-slate-500">HARI</span>
                </span>
              )}
            </div>
            <div className="flex justify-between items-end">
              <p className="text-[10px] font-bold text-slate-400 uppercase">Terlambat</p>
              {isLoading ? (
                <div className="h-8 w-16 bg-slate-800 rounded animate-pulse"></div>
              ) : (
                <span className="text-3xl font-black text-amber-500 leading-none">
                  {stats.terlambat < 10 ? `0${stats.terlambat}` : stats.terlambat} <span className="text-[10px] text-slate-500">KALI</span>
                </span>
              )}
            </div>
            <div className="pt-4 border-t border-white/5 flex items-center gap-2 text-emerald-400">
              <ArrowUpRight size={14} />
              <span className="text-[9px] font-black uppercase tracking-widest">
                {isLoading ? "Menghitung Skor..." : `Skor Kehadiran: ${stats.score}%`}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-[32px] border border-slate-100 shadow-lg shadow-slate-200/40 p-6 flex-1 flex flex-col h-full">
          <div className="flex items-center justify-between mb-6 px-1">
            <h3 className="font-black text-slate-900 uppercase tracking-widest text-[10px]">
              Aktivitas Terakhir
            </h3>
          </div>
          <div className="space-y-3 flex-1 overflow-y-auto max-h-[300px] custom-scrollbar">
            {isLoading ? (
              Array(3).fill(0).map((_, i) => (
                <div key={i} className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl animate-pulse">
                  <div className="h-10 w-10 bg-slate-200 rounded-xl"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-3 bg-slate-200 rounded w-1/2"></div>
                    <div className="h-2 bg-slate-200 rounded w-1/3"></div>
                  </div>
                </div>
              ))
            ) : (
              attendanceLog.slice(0, 3).map((item: any, idx: number) => (
                <div key={idx} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100 group hover:bg-white hover:border-blue-100 transition-all">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl flex items-center justify-center bg-slate-100 text-slate-400">
                      <Calendar size={16} />
                    </div>
                    <div>
                      <p className="font-bold text-slate-800 text-xs truncate max-w-[120px]">{logDateOnly(item.date)}</p>
                      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">{item.in}</p>
                    </div>
                  </div>
                  <div className={`px-2 py-1 rounded-lg text-[7px] font-black uppercase tracking-widest ${item.status === "Tepat Waktu" ? "bg-emerald-500 text-white" : "bg-amber-500 text-white"}`}>
                    {item.status}
                  </div>
                </div>
              ))
            )}
          </div>
          <div className="mt-6 p-4 bg-slate-50 rounded-2xl border border-dashed border-slate-200 text-center">
            <div className="flex items-center justify-center gap-2 text-slate-300 font-bold text-[9px] uppercase tracking-widest">
              <ShieldCheck size={12} />
              <span>Alice Security Guard</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
