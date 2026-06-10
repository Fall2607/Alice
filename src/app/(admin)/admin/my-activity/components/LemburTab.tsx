"use client";

import React, { useState, useEffect } from "react";
import {
  Clock,
  Send,
  AlertCircle,
  CheckCircle2,
  ShieldCheck,
  History,
} from "lucide-react";

export default function LemburTab() {
  const [lemburHistory, setLemburHistory] = useState<any[]>([]);
  const [totalLembur, setTotalLembur] = useState<number>(0);
  const [lemburForm, setLemburForm] = useState({ tanggal_lembur: '', jam_mulai: '', jam_selesai: '', kegiatan: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lemburMessage, setLemburMessage] = useState<{type: 'error'|'success', text: string} | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "";

  useEffect(() => {
    const fetchLembur = async () => {
      try {
        const userString = localStorage.getItem("user");
        if (!userString) return;
        const user = JSON.parse(userString);
        if (!user.karyawan_id) return;

        const res = await fetch(`${baseUrl}/lembur?karyawan_id=${user.karyawan_id}`);
        if (res.ok) {
          const data = await res.json();
          setLemburHistory(data);

          // Hitung total jam lembur yang disetujui bulan ini (asumsi data dikembalikan semua)
          let totalHours = 0;
          const currentMonth = new Date().getMonth();
          const currentYear = new Date().getFullYear();

          data.forEach((item: any) => {
             if (item.status === "Disetujui") {
                const dateObj = new Date(item.tanggal_lembur);
                if (dateObj.getMonth() === currentMonth && dateObj.getFullYear() === currentYear) {
                   const start = new Date(item.jam_mulai);
                   const end = new Date(item.jam_selesai);
                   const diffHours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
                   if (diffHours > 0) totalHours += diffHours;
                }
             }
          });
          setTotalLembur(Math.round(totalHours));
        }
      } catch (err) {
        console.error("Failed to fetch lembur", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchLembur();
  }, [baseUrl]);

  const handleLemburSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLemburMessage(null);
    setIsSubmitting(true);
    try {
      const userString = localStorage.getItem("user");
      if (!userString) throw new Error("Sesi tidak ditemukan. Silakan login kembali.");
      const user = JSON.parse(userString);

      // Construct proper timestamp
      const startDT = new Date(`${lemburForm.tanggal_lembur}T${lemburForm.jam_mulai}:00`);
      const endDT = new Date(`${lemburForm.tanggal_lembur}T${lemburForm.jam_selesai}:00`);

      if (endDT <= startDT) {
         throw new Error("Jam selesai harus lebih besar dari jam mulai.");
      }

      const payload = {
        karyawan_id: user.karyawan_id,
        tanggal_lembur: lemburForm.tanggal_lembur,
        jam_mulai: startDT.toISOString(),
        jam_selesai: endDT.toISOString(),
        kegiatan: lemburForm.kegiatan,
      };

      const res = await fetch(`${baseUrl}/lembur`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Gagal mengajukan lembur.");

      setLemburMessage({ type: 'success', text: "Pengajuan lembur berhasil dikirim." });
      setLemburForm({ tanggal_lembur: '', jam_mulai: '', jam_selesai: '', kegiatan: '' });
      
      // Reload history
      const historyRes = await fetch(`${baseUrl}/lembur?karyawan_id=${user.karyawan_id}`);
      if (historyRes.ok) {
        const historyData = await historyRes.json();
        setLemburHistory(historyData);
      }
    } catch (err: any) {
      setLemburMessage({ type: 'error', text: err.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatTime = (isoString: string) => {
     if (!isoString) return "-";
     return new Date(isoString).toLocaleTimeString("id-ID", { hour: '2-digit', minute: '2-digit' });
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      {/* Sisi Kiri: Main Content */}
      <div className="lg:col-span-8">
        <div className="bg-white rounded-[40px] shadow-2xl shadow-slate-200/40 border border-white p-8 md:p-10 relative overflow-hidden h-full">
          <div className="absolute top-0 right-0 p-8 opacity-[0.02] pointer-events-none text-slate-900">
            <Clock size={180} />
          </div>

          <div className="animate-in fade-in slide-in-from-left-4 duration-500">
            <h2 className="text-xl font-black text-slate-900 tracking-tight mb-8 flex items-center gap-3 uppercase">
              <div className="h-6 w-1.5 bg-blue-600 rounded-full"></div>
              Formulir Lembur
            </h2>

            <form className="space-y-6 relative z-10" onSubmit={handleLemburSubmit}>
              {lemburMessage && (
                <div className={`p-4 rounded-2xl text-sm font-bold flex items-center gap-3 ${lemburMessage.type === 'error' ? 'bg-red-50 text-red-600 border border-red-100' : 'bg-emerald-50 text-emerald-600 border border-emerald-100'}`}>
                  {lemburMessage.type === 'error' ? <AlertCircle size={18} /> : <CheckCircle2 size={18} />}
                  {lemburMessage.text}
                </div>
              )}
              
              <div className="space-y-1.5">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Tanggal Lembur</label>
                <input
                  type="date"
                  value={lemburForm.tanggal_lembur}
                  onChange={(e) => setLemburForm({...lemburForm, tanggal_lembur: e.target.value})}
                  required
                  className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-slate-800 text-sm focus:bg-white focus:ring-4 focus:ring-blue-500/5 focus:border-blue-600 outline-none transition-all"
                />
              </div>

              <div className="grid grid-cols-2 gap-5">
                <div className="space-y-1.5">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Jam Mulai</label>
                  <input
                    type="time"
                    value={lemburForm.jam_mulai}
                    onChange={(e) => setLemburForm({...lemburForm, jam_mulai: e.target.value})}
                    required
                    className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-slate-800 text-sm focus:bg-white focus:ring-4 focus:ring-blue-500/5 focus:border-blue-600 outline-none transition-all"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Jam Selesai</label>
                  <input
                    type="time"
                    value={lemburForm.jam_selesai}
                    onChange={(e) => setLemburForm({...lemburForm, jam_selesai: e.target.value})}
                    required
                    className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-slate-800 text-sm focus:bg-white focus:ring-4 focus:ring-blue-500/5 focus:border-blue-600 outline-none transition-all"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Kegiatan Pekerjaan</label>
                <textarea
                  rows={3}
                  value={lemburForm.kegiatan}
                  onChange={(e) => setLemburForm({...lemburForm, kegiatan: e.target.value})}
                  required
                  className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-[24px] focus:bg-white focus:ring-4 focus:ring-blue-500/5 focus:border-blue-600 outline-none transition-all font-medium text-slate-700 text-sm"
                  placeholder="Tuliskan deskripsi pekerjaan lembur..."
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
              <Clock size={14} />
            </div>
            <h3 className="text-[9px] font-black text-blue-100 uppercase tracking-[0.3em]">
              Total Lembur Disetujui (Bulan Ini)
            </h3>
          </div>
          <div className="flex items-end gap-2">
            {isLoading ? (
              <div className="h-14 w-16 bg-blue-500 rounded-xl animate-pulse"></div>
            ) : (
              <span className="text-6xl font-black leading-none tracking-tighter">
                {totalLembur < 10 ? `0${totalLembur}` : totalLembur}
              </span>
            )}
            <span className="text-lg font-bold text-blue-200 mb-1 uppercase tracking-widest">
              Jam
            </span>
          </div>
        </div>

        <div className="bg-white rounded-[32px] border border-slate-100 shadow-lg shadow-slate-200/40 p-6 flex-1 flex flex-col h-full">
          <div className="flex items-center justify-between mb-6 px-1">
            <h3 className="font-black text-slate-900 uppercase tracking-widest text-[10px]">
              Riwayat Lembur
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
            ) : lemburHistory.length === 0 ? (
              <div className="py-8 text-center text-xs font-bold text-slate-400 uppercase tracking-widest">
                Belum ada riwayat lembur.
              </div>
            ) : (
              lemburHistory.map((item: any, idx: number) => (
                <div key={idx} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100 group hover:bg-white hover:border-blue-100 transition-all">
                  <div className="flex items-center gap-3">
                    <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${item.status === "Disetujui" ? "bg-emerald-50 text-emerald-500" : item.status === "Ditolak" ? "bg-red-50 text-red-500" : "bg-amber-50 text-amber-500"}`}>
                      <History size={16} />
                    </div>
                    <div>
                      <p className="font-bold text-slate-800 text-xs truncate max-w-[120px]">{item.kegiatan}</p>
                      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
                        {new Date(item.tanggal_lembur).toLocaleDateString("id-ID", { day: 'numeric', month: 'short' })} • {formatTime(item.jam_mulai)} - {formatTime(item.jam_selesai)}
                      </p>
                    </div>
                  </div>
                  <div className={`px-2 py-1 rounded-lg text-[7px] font-black uppercase tracking-widest ${item.status === "Disetujui" ? "bg-emerald-500 text-white" : item.status === "Ditolak" ? "bg-red-500 text-white" : "bg-amber-500 text-white"}`}>
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
