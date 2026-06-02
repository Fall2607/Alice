/** Path: app/(admin)/admin/self-service/page.tsx
 * Deskripsi: Antarmuka mandiri untuk Karyawan (Cuti, Lembur, dan Log Absensi).
 * Perubahan: Penambahan fitur Log Absensi dalam satu dashboard terpadu.
 */

"use client";

import React, { useState, useEffect } from "react";
import {
  CalendarDays,
  Clock,
  Send,
  History,
  ChevronRight,
  Timer,
  AlertCircle,
  ShieldCheck,
  CheckCircle2,
  Calendar,
  LogIn,
  LogOut as LogOutIcon,
  Filter,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";

type ActiveTab = "cuti" | "lembur" | "absensi";

export default function SelfServicePage() {
  const [activeTab, setActiveTab] = useState<ActiveTab>("absensi");

  // Data Mockup untuk Visual
  const leaveBalance = 12;
  const overtimeHistory = [
    {
      id: 1,
      date: "24 Mar 2026",
      duration: "3 Jam",
      task: "Maintenance Server Core",
      status: "Approved",
    },
    {
      id: 2,
      date: "26 Mar 2026",
      duration: "2 Jam",
      task: "Update Security Protocol",
      status: "Pending",
    },
  ];

  const leaveHistory = [
    {
      id: 1,
      type: "Cuti Tahunan",
      range: "10 Apr - 12 Apr",
      status: "Approved",
    },
  ];

  const [attendanceLog, setAttendanceLog] = useState<any[]>([]);
  const [stats, setStats] = useState({ hadir: 0, terlambat: 0, score: 0 });
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
            
            const jamMasukObj = item.jam_masuk ? new Date(item.jam_masuk) : null;
            const inTime = jamMasukObj ? jamMasukObj.toLocaleTimeString("id-ID", { hour: '2-digit', minute: '2-digit' }) : "-";
            
            const jamKeluarObj = item.jam_keluar ? new Date(item.jam_keluar) : null;
            const outTime = jamKeluarObj ? jamKeluarObj.toLocaleTimeString("id-ID", { hour: '2-digit', minute: '2-digit' }) : "-";
            
            let status = "Tepat Waktu";
            if (item.menit_terlambat > 0) {
               status = "Terlambat";
               terlambat++;
            } else if (item.jam_keluar && jamKeluarObj && jamMasukObj) {
               // Pulang cepat logic
               if (jamKeluarObj.getHours() < 17) {
                   status = "Pulang Cepat";
               }
            }
            
            hadir++;

            return {
              date: dateStr,
              in: inTime,
              out: outTime,
              status: status
            };
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
      }
    };

    fetchAbsensi();
  }, [baseUrl]);

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

        {/* Tab Switcher Alice Style - Diperluas */}
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

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Sisi Kiri: Main Content (Form atau Log) */}
        <div className="lg:col-span-8">
          <div className="bg-white rounded-[40px] shadow-2xl shadow-slate-200/40 border border-white p-8 md:p-10 relative overflow-hidden h-full">
            <div className="absolute top-0 right-0 p-8 opacity-[0.02] pointer-events-none text-slate-900">
              {activeTab === "cuti" ? (
                <CalendarDays size={180} />
              ) : activeTab === "lembur" ? (
                <Clock size={180} />
              ) : (
                <Calendar size={180} />
              )}
            </div>

            {/* TAB: LOG ABSENSI */}
            {activeTab === "absensi" && (
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
                        <th className="pb-4 text-[9px] font-black text-slate-400 uppercase tracking-widest px-2">
                          Tanggal
                        </th>
                        <th className="pb-4 text-[9px] font-black text-slate-400 uppercase tracking-widest text-center">
                          Masuk
                        </th>
                        <th className="pb-4 text-[9px] font-black text-slate-400 uppercase tracking-widest text-center">
                          Pulang
                        </th>
                        <th className="pb-4 text-[9px] font-black text-slate-400 uppercase tracking-widest text-right px-2">
                          Status
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {attendanceLog.map((log, idx) => (
                        <tr
                          key={idx}
                          className="group hover:bg-slate-50/50 transition-colors"
                        >
                          <td className="py-4 px-2">
                            <span className="text-xs font-bold text-slate-700">
                              {log.date}
                            </span>
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
                            <span
                              className={`text-[9px] font-black uppercase tracking-tight ${
                                log.status === "Tepat Waktu"
                                  ? "text-emerald-500"
                                  : "text-amber-500"
                              }`}
                            >
                              {log.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                      {attendanceLog.length === 0 && (
                         <tr>
                            <td colSpan={4} className="py-8 text-center text-xs font-bold text-slate-400 uppercase tracking-widest">
                               Belum ada log absensi bulan ini.
                            </td>
                         </tr>
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
            )}

            {/* TAB: FORM CUTI/LEMBUR (Logika sebelumnya dipertahankan) */}
            {(activeTab === "cuti" || activeTab === "lembur") && (
              <div className="animate-in fade-in slide-in-from-left-4 duration-500">
                <h2 className="text-xl font-black text-slate-900 tracking-tight mb-8 flex items-center gap-3 uppercase">
                  <div className="h-6 w-1.5 bg-blue-600 rounded-full"></div>
                  {activeTab === "cuti" ? "Formulir Cuti" : "Laporan Lembur"}
                </h2>

                <form className="space-y-6 relative z-10">
                  {activeTab === "cuti" ? (
                    <>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div className="space-y-1.5">
                          <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">
                            Mulai Cuti
                          </label>
                          <input
                            type="date"
                            className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl focus:bg-white focus:ring-4 focus:ring-blue-500/5 focus:border-blue-600 outline-none transition-all font-bold text-slate-800 text-sm"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">
                            Selesai Cuti
                          </label>
                          <input
                            type="date"
                            className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl focus:bg-white focus:ring-4 focus:ring-blue-500/5 focus:border-blue-600 outline-none transition-all font-bold text-slate-800 text-sm"
                          />
                        </div>
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">
                          Kategori Izin
                        </label>
                        <div className="relative">
                          <select className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl focus:bg-white outline-none font-bold text-slate-800 appearance-none text-sm cursor-pointer">
                            <option>Cuti Tahunan</option>
                            <option>Cuti Sakit</option>
                            <option>Cuti Melahirkan</option>
                            <option>Izin Penting</option>
                          </select>
                        </div>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="space-y-1.5">
                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">
                          Tanggal Tugas
                        </label>
                        <input
                          type="date"
                          className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-slate-800 text-sm"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-5">
                        <div className="space-y-1.5">
                          <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">
                            Jam Mulai
                          </label>
                          <input
                            type="time"
                            className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-slate-800 text-sm"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">
                            Jam Selesai
                          </label>
                          <input
                            type="time"
                            className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-slate-800 text-sm"
                          />
                        </div>
                      </div>
                    </>
                  )}

                  <div className="space-y-1.5">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">
                      Catatan Keterangan
                    </label>
                    <textarea
                      rows={3}
                      className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-[24px] focus:bg-white focus:ring-4 focus:ring-blue-500/5 focus:border-blue-600 outline-none transition-all font-medium text-slate-700 text-sm"
                      placeholder={
                        activeTab === "cuti"
                          ? "Alasan pengambilan cuti..."
                          : "Tuliskan deskripsi pekerjaan lembur..."
                      }
                    ></textarea>
                  </div>

                  <button className="w-full flex items-center justify-center gap-3 bg-slate-900 text-white font-black py-4 rounded-2xl hover:bg-blue-600 transition-all shadow-xl shadow-slate-900/10 active:scale-[0.98] text-[10px] uppercase tracking-widest mt-4">
                    <Send size={16} /> Submit Permohonan
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>

        {/* Sisi Kanan: Summary Panel */}
        <div className="lg:col-span-4 space-y-6">
          {/* Status Card - Berubah Berdasarkan Tab */}
          <div
            className={`rounded-[32px] p-8 text-white shadow-xl relative overflow-hidden group border transition-all duration-500 ${
              activeTab === "absensi"
                ? "bg-slate-900 border-slate-800"
                : "bg-blue-600 border-blue-500 shadow-blue-200"
            }`}
          >
            <div className="absolute top-[-20%] right-[-10%] w-40 h-40 bg-white/5 rounded-full blur-3xl"></div>

            {activeTab === "absensi" ? (
              <>
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
                    <p className="text-[10px] font-bold text-slate-400 uppercase">
                      Hadir
                    </p>
                    <span className="text-3xl font-black leading-none">
                      {stats.hadir < 10 ? `0${stats.hadir}` : stats.hadir}{" "}
                      <span className="text-[10px] text-slate-500">HARI</span>
                    </span>
                  </div>
                  <div className="flex justify-between items-end">
                    <p className="text-[10px] font-bold text-slate-400 uppercase">
                      Terlambat
                    </p>
                    <span className="text-3xl font-black text-amber-500 leading-none">
                      {stats.terlambat < 10 ? `0${stats.terlambat}` : stats.terlambat}{" "}
                      <span className="text-[10px] text-slate-500">KALI</span>
                    </span>
                  </div>
                  <div className="pt-4 border-t border-white/5 flex items-center gap-2 text-emerald-400">
                    <ArrowUpRight size={14} />
                    <span className="text-[9px] font-black uppercase tracking-widest">
                      Skor Kehadiran: {stats.score}%
                    </span>
                  </div>
                </div>
              </>
            ) : activeTab === "cuti" ? (
              <>
                <div className="flex items-center gap-2 mb-6">
                  <div className="p-2 bg-white/10 rounded-lg">
                    <CalendarDays size={14} />
                  </div>
                  <h3 className="text-[9px] font-black text-blue-100 uppercase tracking-[0.3em]">
                    Sisa Jatah Cuti
                  </h3>
                </div>
                <div className="flex items-end gap-2">
                  <span className="text-6xl font-black leading-none tracking-tighter">
                    {leaveBalance}
                  </span>
                  <span className="text-lg font-bold text-blue-200 mb-1 uppercase tracking-widest">
                    Hari
                  </span>
                </div>
              </>
            ) : (
              <>
                <div className="flex items-center gap-2 mb-6">
                  <div className="p-2 bg-white/10 rounded-lg">
                    <Clock size={14} />
                  </div>
                  <h3 className="text-[9px] font-black text-blue-100 uppercase tracking-[0.3em]">
                    Total Lembur
                  </h3>
                </div>
                <div className="flex items-end gap-2">
                  <span className="text-6xl font-black leading-none tracking-tighter">
                    05
                  </span>
                  <span className="text-lg font-bold text-blue-200 mb-1 uppercase tracking-widest">
                    Jam
                  </span>
                </div>
              </>
            )}
          </div>

          {/* List Riwayat/Recent Activities */}
          <div className="bg-white rounded-[32px] border border-slate-100 shadow-lg shadow-slate-200/40 p-6 flex-1 flex flex-col h-full">
            <div className="flex items-center justify-between mb-6 px-1">
              <h3 className="font-black text-slate-900 uppercase tracking-widest text-[10px]">
                Aktivitas Terakhir
              </h3>
            </div>

            <div className="space-y-3 flex-1 overflow-y-auto max-h-[300px] custom-scrollbar">
              {(activeTab === "absensi"
                ? attendanceLog.slice(0, 3)
                : activeTab === "cuti"
                  ? leaveHistory
                  : overtimeHistory
              ).map((item: any, idx: number) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100 group hover:bg-white hover:border-blue-100 transition-all"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`h-10 w-10 rounded-xl flex items-center justify-center ${activeTab === "absensi" ? "bg-slate-100 text-slate-400" : item.status === "Approved" ? "bg-emerald-50 text-emerald-500" : "bg-amber-50 text-amber-500"}`}
                    >
                      {activeTab === "absensi" ? (
                        <Calendar size={16} />
                      ) : activeTab === "cuti" ? (
                        <CalendarDays size={16} />
                      ) : (
                        <History size={16} />
                      )}
                    </div>
                    <div>
                      <p className="font-bold text-slate-800 text-xs truncate max-w-[120px]">
                        {activeTab === "absensi"
                          ? logDateOnly(item.date)
                          : activeTab === "cuti"
                            ? item.type
                            : item.task}
                      </p>
                      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
                        {activeTab === "absensi"
                          ? item.in
                          : activeTab === "cuti"
                            ? item.range
                            : item.date}
                      </p>
                    </div>
                  </div>
                  <div
                    className={`px-2 py-1 rounded-lg text-[7px] font-black uppercase tracking-widest ${activeTab === "absensi" ? (item.status === "Tepat Waktu" ? "bg-emerald-500 text-white" : "bg-amber-500 text-white") : item.status === "Approved" ? "bg-emerald-500 text-white" : "bg-amber-500 text-white"}`}
                  >
                    {item.status}
                  </div>
                </div>
              ))}
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

      <div className="text-center py-10 opacity-20">
        <p className="text-[8px] font-black text-slate-900 uppercase tracking-[1.2em]">
          Alice Digital Platform
        </p>
      </div>

      <style jsx>{`
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

// Helper function
function logDateOnly(fullDate: string) {
  if (!fullDate || !fullDate.includes(",")) return fullDate;
  return fullDate.split(",")[1].trim();
}
