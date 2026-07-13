"use client";

import React, { useState, useEffect } from "react";
import {
  CalendarDays,
  Send,
  AlertCircle,
  CheckCircle2,
  ShieldCheck,
  Calendar
} from "lucide-react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

export default function CutiTab() {
  const [leaveBalance, setLeaveBalance] = useState<number>(0);
  const [leaveHistory, setLeaveHistory] = useState<any[]>([]);
  const [leaveForm, setLeaveForm] = useState({ tanggal_kembali: '', alasan: '', kategori: 'Tahunan' });
  const [dateRange, setDateRange] = useState<[Date | null, Date | null]>([null, null]);
  const [startDate, endDate] = dateRange;
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [cutiMessage, setCutiMessage] = useState<{type: 'error'|'success', text: string} | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "/api";

  const calculateDays = (start: Date | null, end: Date | null) => {
    if (!start || !end) return 0;
    const sDate = new Date(start);
    const eDate = new Date(end);
    if (eDate < sDate) return 0;
    const diffTime = Math.abs(eDate.getTime() - sDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
    return diffDays + 1;
  };

  const jumlahHari = calculateDays(startDate, endDate);

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

        const cutiRes = await fetch(`${baseUrl}/cuti?karyawan_id=${user.karyawan_id}`, { cache: 'no-store' });
        if (cutiRes.ok) {
          const cutiData = await cutiRes.json();
          setLeaveHistory(cutiData.map((c: any) => {
            return {
              id: c.id,
              type: c.jenis_cuti || "Cuti",
              range: `${new Date(c.tanggal_mulai).toLocaleDateString("id-ID", {day:'numeric', month:'short'})} - ${new Date(c.tanggal_selesai).toLocaleDateString("id-ID", {day:'numeric', month:'short'})}`,
              status: c.status,
              alasan: c.alasan || c.keterangan,
              jumlah_hari: c.jumlah_hari
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
    
    if (!startDate || !endDate) {
      setCutiMessage({ type: 'error', text: `Silakan pilih rentang tanggal cuti.` });
      setIsSubmitting(false);
      return;
    }

    if (jumlahHari > 4) {
      setCutiMessage({ type: 'error', text: `Pengajuan cuti maksimal adalah 4 hari.` });
      setIsSubmitting(false);
      return;
    }

    if (leaveForm.kategori === 'Tahunan' && jumlahHari > leaveBalance) {
      setCutiMessage({ type: 'error', text: `Sisa cuti tahunan tidak mencukupi. Anda hanya memiliki ${leaveBalance} hari.` });
      setIsSubmitting(false);
      return;
    }

    try {
      const userString = localStorage.getItem("user");
      if (!userString) throw new Error("Sesi tidak ditemukan. Silakan login kembali.");
      const user = JSON.parse(userString);

      // Convert Date object to YYYY-MM-DD
      const formatYMD = (date: Date) => {
        const d = new Date(date);
        d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
        return d.toISOString().split('T')[0];
      };

      const payload = {
        karyawan_id: user.karyawan_id,
        jenis_cuti: leaveForm.kategori,
        tanggal_mulai: formatYMD(startDate),
        tanggal_selesai: formatYMD(endDate),
        tanggal_kembali: leaveForm.tanggal_kembali || null,
        jumlah_hari: jumlahHari,
        keterangan: leaveForm.alasan // Diteruskan ke kolom alasan
      };

      const res = await fetch(`${baseUrl}/cuti`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Gagal mengajukan cuti.");

      setCutiMessage({ type: 'success', text: "Pengajuan cuti berhasil dikirim." });
      setLeaveForm({ tanggal_kembali: '', alasan: '', kategori: 'Tahunan' });
      setDateRange([null, null]);
      
      const cutiRes = await fetch(`${baseUrl}/cuti?karyawan_id=${user.karyawan_id}`, { cache: 'no-store' });
      if (cutiRes.ok) {
        const cutiData = await cutiRes.json();
        setLeaveHistory(cutiData.map((c: any) => {
          return {
            id: c.id,
            type: c.jenis_cuti || "Cuti",
            range: `${new Date(c.tanggal_mulai).toLocaleDateString("id-ID", {day:'numeric', month:'short'})} - ${new Date(c.tanggal_selesai).toLocaleDateString("id-ID", {day:'numeric', month:'short'})}`,
            status: c.status,
            alasan: c.alasan || c.keterangan,
            jumlah_hari: c.jumlah_hari
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
              Formulir Pengajuan Cuti
            </h2>

            <form className="space-y-6 relative z-10" onSubmit={handleCutiSubmit}>
              {cutiMessage && (
                <div className={`p-4 rounded-2xl text-sm font-bold flex items-center gap-3 ${cutiMessage.type === 'error' ? 'bg-red-50 text-red-600 border border-red-100' : 'bg-emerald-50 text-emerald-600 border border-emerald-100'}`}>
                  {cutiMessage.type === 'error' ? <AlertCircle size={18} /> : <CheckCircle2 size={18} />}
                  {cutiMessage.text}
                </div>
              )}
              
              <div className="space-y-1.5">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Kategori Cuti</label>
                <div className="relative">
                  <select 
                    value={leaveForm.kategori}
                    onChange={(e) => setLeaveForm({...leaveForm, kategori: e.target.value})}
                    className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl focus:bg-white outline-none font-bold text-slate-800 appearance-none text-sm cursor-pointer"
                  >
                    <option value="Tahunan">Cuti Tahunan</option>
                    <option value="Sakit">Cuti Sakit</option>
                    <option value="Melahirkan">Cuti Melahirkan</option>
                    <option value="Izin Penting">Izin Penting (Kedukaan, Menikah, dll)</option>
                  </select>
                </div>
              </div>

              <div className="p-5 bg-slate-50 rounded-[24px] border border-slate-100">
                <div className="space-y-1.5">
                  <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-1 flex items-center gap-1.5"><Calendar size={12}/> Rentang Tanggal Cuti</label>
                  <div className="relative z-10 w-full">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-500 z-20 pointer-events-none">
                      <Calendar size={16} />
                    </div>
                    <DatePicker
                      selectsRange={true}
                      startDate={startDate || undefined}
                      endDate={endDate || undefined}
                      onChange={(update) => setDateRange(update)}
                      dateFormat="dd MMM yyyy"
                      placeholderText="Pilih Rentang Tanggal (Maks 4 Hari)"
                      className={`w-full bg-white border ${jumlahHari > 4 ? 'border-red-400 focus:ring-red-500/20' : 'border-slate-200 focus:ring-blue-500/20'} text-slate-700 py-3.5 pl-10 pr-4 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:border-blue-500 transition-all`}
                      wrapperClassName="w-full"
                    />
                  </div>
                  {jumlahHari > 4 && (
                    <p className="text-[10px] text-red-500 ml-1 font-bold">Peringatan: Pengajuan cuti maksimal 4 hari.</p>
                  )}
                </div>
              </div>
              
              <div className="flex items-center gap-4 bg-blue-50/50 p-4 rounded-2xl border border-blue-100/50">
                  <div className="flex-1">
                      <p className="text-[10px] font-black uppercase tracking-widest text-blue-800 mb-0.5">Durasi Cuti</p>
                      <p className="text-xs text-blue-600 font-medium leading-tight">Total hari kalender yang dipilih.</p>
                  </div>
                  <div className="bg-white px-4 py-2 rounded-xl border border-blue-100 shadow-sm text-center">
                      <span className={`text-2xl font-black leading-none ${jumlahHari > 4 ? 'text-red-500' : 'text-blue-600'}`}>{jumlahHari}</span>
                      <span className="text-[10px] font-bold text-blue-400 ml-1 uppercase">Hari</span>
                  </div>
              </div>

              <div className="space-y-1.5 pt-2">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1 text-emerald-600">Tanggal Kembali Bekerja (Opsional)</label>
                <input
                    type="date"
                    value={leaveForm.tanggal_kembali}
                    min={endDate ? endDate.toISOString().split('T')[0] : ''}
                    onChange={(e) => setLeaveForm({...leaveForm, tanggal_kembali: e.target.value})}
                    className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl focus:bg-white focus:ring-4 focus:ring-emerald-500/5 focus:border-emerald-600 outline-none transition-all font-bold text-slate-800 text-sm"
                  />
                  <p className="text-[10px] text-slate-400 ml-1">Pilih tanggal jika ada day off setelah masa cuti berakhir.</p>
              </div>

              <div className="space-y-1.5 pt-2">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Alasan Lengkap (Wajib)</label>
                <textarea
                  rows={3}
                  value={leaveForm.alasan}
                  onChange={(e) => setLeaveForm({...leaveForm, alasan: e.target.value})}
                  required
                  className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-[24px] focus:bg-white focus:ring-4 focus:ring-blue-500/5 focus:border-blue-600 outline-none transition-all font-medium text-slate-700 text-sm"
                  placeholder="Ceritakan detail cuti Anda..."
                ></textarea>
              </div>

              <button 
                disabled={isSubmitting || jumlahHari <= 0 || jumlahHari > 4 || (leaveForm.kategori === 'Tahunan' && jumlahHari > leaveBalance)}
                className="w-full flex items-center justify-center gap-3 bg-slate-900 text-white font-black py-4 rounded-2xl hover:bg-blue-600 transition-all shadow-xl shadow-slate-900/10 active:scale-[0.98] text-[10px] uppercase tracking-widest mt-4 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isSubmitting ? "Memproses..." : <><Send size={16} /> Ajukan Permohonan Cuti</>}
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
              Sisa Jatah Cuti Tahunan
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
            <span className="text-sm font-bold text-blue-200 mb-2 uppercase tracking-widest">
              Hari
            </span>
          </div>
          <p className="text-xs text-blue-200/80 mt-4 font-medium leading-relaxed">
            Pastikan Anda merencanakan cuti dari jauh hari agar operasional tim tetap berjalan lancar. Maksimal pengajuan adalah 4 hari.
          </p>
        </div>

        <div className="bg-white rounded-[32px] shadow-xl shadow-slate-200/50 border border-slate-100 p-8">
          <h3 className="text-[9px] font-black text-slate-400 uppercase tracking-[0.3em] mb-6 flex items-center gap-2">
            Riwayat Cuti Anda
          </h3>
          
          <div className="space-y-4 max-h-[400px] overflow-y-auto custom-scrollbar pr-2">
            {isLoading ? (
              <div className="space-y-3">
                {[1,2,3].map(i => (
                  <div key={i} className="h-16 bg-slate-50 rounded-2xl animate-pulse"></div>
                ))}
              </div>
            ) : leaveHistory.length === 0 ? (
              <div className="text-center py-10 bg-slate-50 rounded-2xl border border-slate-100 border-dashed">
                <ShieldCheck size={24} className="text-slate-300 mx-auto mb-2" />
                <p className="text-xs font-bold text-slate-400">Belum ada riwayat cuti</p>
              </div>
            ) : (
              leaveHistory.map((item) => (
                <div key={item.id} className="p-4 rounded-2xl border border-slate-100 hover:border-blue-100 hover:shadow-lg hover:shadow-blue-500/5 transition-all bg-white group">
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-xs font-black text-slate-700">{item.type}</span>
                    <span className={`text-[8px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full border ${
                      item.status === 'Disetujui' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                      (item.status && item.status.includes('Menunggu')) ? 'bg-amber-50 text-amber-600 border-amber-100' :
                      'bg-rose-50 text-rose-600 border-rose-100'
                    }`}>
                      {(item.status || 'TIDAK DIKETAHUI').replace('_', ' ')}
                    </span>
                  </div>
                  <div className="text-[10px] font-bold text-blue-600 mb-1 flex items-center gap-1.5">
                    <Calendar size={10} /> {item.range} ({item.jumlah_hari} Hari)
                  </div>
                  <p className="text-[10px] text-slate-500 line-clamp-1 mt-2 p-2 bg-slate-50 rounded-lg border border-slate-100">
                    "{item.alasan}"
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
