"use client";

import React, { useState, useEffect } from "react";
import {
  CalendarDays,
  Send,
  AlertCircle,
  CheckCircle2,
  ShieldCheck,
} from "lucide-react";

export default function CutiTab() {
  const [leaveBalance, setLeaveBalance] = useState<number>(0);
  const [leaveHistory, setLeaveHistory] = useState<any[]>([]);
  const [leaveForm, setLeaveForm] = useState({ tanggal_mulai: '', tanggal_selesai: '', alasan: '', kategori: 'Cuti Tahunan' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [cutiMessage, setCutiMessage] = useState<{type: 'error'|'success', text: string} | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "";

  useEffect(() => {
    const fetchCuti = async () => {
      try {
        const userString = localStorage.getItem("user");
        if (!userString) return;
        const user = JSON.parse(userString);
        if (!user.karyawan_id) return;

        const karyawanRes = await fetch(`${baseUrl}/karyawan/${user.karyawan_id}`);
        if (karyawanRes.ok) {
          const kData = await karyawanRes.json();
          setLeaveBalance(kData.sisa_cuti !== undefined ? kData.sisa_cuti : 0);
        }

        const cutiRes = await fetch(`${baseUrl}/cuti?karyawan_id=${user.karyawan_id}`);
        if (cutiRes.ok) {
          const cutiData = await cutiRes.json();
          setLeaveHistory(cutiData.map((c: any) => {
            const splitAlasan = c.alasan?.split(" - ");
            const isCat = splitAlasan && splitAlasan.length > 1;
            return {
              id: c.id,
              type: isCat ? splitAlasan[0] : "Cuti",
              range: `${new Date(c.tanggal_mulai).toLocaleDateString("id-ID", {day:'numeric', month:'short'})} - ${new Date(c.tanggal_selesai).toLocaleDateString("id-ID", {day:'numeric', month:'short'})}`,
              status: c.status === 'PENDING' ? 'Pending' : c.status === 'APPROVED' ? 'Approved' : 'Rejected',
              alasan: isCat ? splitAlasan[1] : c.alasan,
            };
          }));
        }
      } catch (err) {
        console.error("Failed to fetch cuti", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchCuti();
  }, [baseUrl]);

  const handleCutiSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCutiMessage(null);
    setIsSubmitting(true);
    try {
      const userString = localStorage.getItem("user");
      if (!userString) throw new Error("Sesi tidak ditemukan. Silakan login kembali.");
      const user = JSON.parse(userString);

      const payload = {
        karyawan_id: user.karyawan_id,
        tanggal_mulai: leaveForm.tanggal_mulai,
        tanggal_selesai: leaveForm.tanggal_selesai,
        alasan: `${leaveForm.kategori} - ${leaveForm.alasan}`
      };

      const res = await fetch(`${baseUrl}/cuti`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Gagal mengajukan cuti.");

      setCutiMessage({ type: 'success', text: "Pengajuan cuti berhasil dikirim." });
      setLeaveForm({ tanggal_mulai: '', tanggal_selesai: '', alasan: '', kategori: 'Cuti Tahunan' });
      
      const cutiRes = await fetch(`${baseUrl}/cuti?karyawan_id=${user.karyawan_id}`);
      if (cutiRes.ok) {
        const cutiData = await cutiRes.json();
        setLeaveHistory(cutiData.map((c: any) => {
          const splitAlasan = c.alasan?.split(" - ");
          const isCat = splitAlasan && splitAlasan.length > 1;
          return {
            id: c.id,
            type: isCat ? splitAlasan[0] : "Cuti",
            range: `${new Date(c.tanggal_mulai).toLocaleDateString("id-ID", {day:'numeric', month:'short'})} - ${new Date(c.tanggal_selesai).toLocaleDateString("id-ID", {day:'numeric', month:'short'})}`,
            status: c.status === 'PENDING' ? 'Pending' : c.status === 'APPROVED' ? 'Approved' : 'Rejected',
            alasan: isCat ? splitAlasan[1] : c.alasan,
          };
        }));
      }
    } catch (err: any) {
      setCutiMessage({ type: 'error', text: err.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      {/* Sisi Kiri: Main Content */}
      <div className="lg:col-span-8">
        <div className="bg-white rounded-[40px] shadow-2xl shadow-slate-200/40 border border-white p-8 md:p-10 relative overflow-hidden h-full">
          <div className="absolute top-0 right-0 p-8 opacity-[0.02] pointer-events-none text-slate-900">
            <CalendarDays size={180} />
          </div>

          <div className="animate-in fade-in slide-in-from-left-4 duration-500">
            <h2 className="text-xl font-black text-slate-900 tracking-tight mb-8 flex items-center gap-3 uppercase">
              <div className="h-6 w-1.5 bg-blue-600 rounded-full"></div>
              Formulir Cuti
            </h2>

            <form className="space-y-6 relative z-10" onSubmit={handleCutiSubmit}>
              {cutiMessage && (
                <div className={`p-4 rounded-2xl text-sm font-bold flex items-center gap-3 ${cutiMessage.type === 'error' ? 'bg-red-50 text-red-600 border border-red-100' : 'bg-emerald-50 text-emerald-600 border border-emerald-100'}`}>
                  {cutiMessage.type === 'error' ? <AlertCircle size={18} /> : <CheckCircle2 size={18} />}
                  {cutiMessage.text}
                </div>
              )}
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-1.5">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Mulai Cuti</label>
                  <input
                    type="date"
                    value={leaveForm.tanggal_mulai}
                    onChange={(e) => setLeaveForm({...leaveForm, tanggal_mulai: e.target.value})}
                    required
                    className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl focus:bg-white focus:ring-4 focus:ring-blue-500/5 focus:border-blue-600 outline-none transition-all font-bold text-slate-800 text-sm"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Selesai Cuti</label>
                  <input
                    type="date"
                    value={leaveForm.tanggal_selesai}
                    min={leaveForm.tanggal_mulai}
                    onChange={(e) => setLeaveForm({...leaveForm, tanggal_selesai: e.target.value})}
                    required
                    className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl focus:bg-white focus:ring-4 focus:ring-blue-500/5 focus:border-blue-600 outline-none transition-all font-bold text-slate-800 text-sm"
                  />
                </div>
              </div>
              
              <div className="space-y-1.5">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Kategori Izin</label>
                <div className="relative">
                  <select 
                    value={leaveForm.kategori}
                    onChange={(e) => setLeaveForm({...leaveForm, kategori: e.target.value})}
                    className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl focus:bg-white outline-none font-bold text-slate-800 appearance-none text-sm cursor-pointer"
                  >
                    <option>Cuti Tahunan</option>
                    <option>Cuti Sakit</option>
                    <option>Cuti Melahirkan</option>
                    <option>Izin Penting</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Catatan Keterangan</label>
                <textarea
                  rows={3}
                  value={leaveForm.alasan}
                  onChange={(e) => setLeaveForm({...leaveForm, alasan: e.target.value})}
                  required
                  className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-[24px] focus:bg-white focus:ring-4 focus:ring-blue-500/5 focus:border-blue-600 outline-none transition-all font-medium text-slate-700 text-sm"
                  placeholder="Alasan pengambilan cuti..."
                ></textarea>
              </div>

              <button 
                disabled={isSubmitting}
                className="w-full flex items-center justify-center gap-3 bg-slate-900 text-white font-black py-4 rounded-2xl hover:bg-blue-600 transition-all shadow-xl shadow-slate-900/10 active:scale-[0.98] text-[10px] uppercase tracking-widest mt-4 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isSubmitting ? "Memproses..." : <><Send size={16} /> Submit Permohonan</>}
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Sisi Kanan: Summary Panel */}
      <div className="lg:col-span-4 space-y-6">
        <div className="rounded-[32px] p-8 text-white shadow-xl relative overflow-hidden group border transition-all duration-500 bg-blue-600 border-blue-500 shadow-blue-200">
          <div className="absolute top-[-20%] right-[-10%] w-40 h-40 bg-white/5 rounded-full blur-3xl"></div>
          <div className="flex items-center gap-2 mb-6">
            <div className="p-2 bg-white/10 rounded-lg">
              <CalendarDays size={14} />
            </div>
            <h3 className="text-[9px] font-black text-blue-100 uppercase tracking-[0.3em]">
              Sisa Jatah Cuti
            </h3>
          </div>
          <div className="flex items-end gap-2">
            {isLoading ? (
              <div className="h-14 w-16 bg-blue-500 rounded-xl animate-pulse"></div>
            ) : (
              <span className="text-6xl font-black leading-none tracking-tighter">
                {leaveBalance}
              </span>
            )}
            <span className="text-lg font-bold text-blue-200 mb-1 uppercase tracking-widest">
              Hari
            </span>
          </div>
        </div>

        <div className="bg-white rounded-[32px] border border-slate-100 shadow-lg shadow-slate-200/40 p-6 flex-1 flex flex-col h-full">
          <div className="flex items-center justify-between mb-6 px-1">
            <h3 className="font-black text-slate-900 uppercase tracking-widest text-[10px]">
              Riwayat Cuti
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
            ) : leaveHistory.length === 0 ? (
              <div className="py-8 text-center text-xs font-bold text-slate-400 uppercase tracking-widest">
                Belum ada riwayat cuti.
              </div>
            ) : (
              leaveHistory.map((item: any, idx: number) => (
                <div key={idx} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100 group hover:bg-white hover:border-blue-100 transition-all">
                  <div className="flex items-center gap-3">
                    <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${item.status === "Approved" ? "bg-emerald-50 text-emerald-500" : item.status === "Rejected" ? "bg-red-50 text-red-500" : "bg-amber-50 text-amber-500"}`}>
                      <CalendarDays size={16} />
                    </div>
                    <div>
                      <p className="font-bold text-slate-800 text-xs truncate max-w-[120px]">{item.type}</p>
                      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">{item.range}</p>
                    </div>
                  </div>
                  <div className={`px-2 py-1 rounded-lg text-[7px] font-black uppercase tracking-widest ${item.status === "Approved" ? "bg-emerald-500 text-white" : item.status === "Rejected" ? "bg-red-500 text-white" : "bg-amber-500 text-white"}`}>
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
