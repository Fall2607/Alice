"use client";

import React, { useState, useEffect } from "react";
import {
  CalendarDays,
  Send,
  AlertCircle,
  CheckCircle2,
  ShieldCheck,
  Calendar,
  Users
} from "lucide-react";
import Select from "react-select";
import Swal from "sweetalert2";
import { XCircle, Edit } from "lucide-react";

export default function CutiTab() {
  const [leaveBalance, setLeaveBalance] = useState<number>(0);
  const [leaveHistory, setLeaveHistory] = useState<any[]>([]);
  const [delegationPeers, setDelegationPeers] = useState<any[]>([]);
  const [leaveForm, setLeaveForm] = useState({ tanggal_kembali: '', alasan: '', kategori: 'Tahunan', delegasi: '' });
  const [isRescheduleModalOpen, setIsRescheduleModalOpen] = useState(false);
  const [rescheduleData, setRescheduleData] = useState<any>(null);
  const [selectedPeriod, setSelectedPeriod] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });
  const [selectedDates, setSelectedDates] = useState<Date[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [cutiMessage, setCutiMessage] = useState<{type: 'error'|'success', text: string} | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "/api";

  const jumlahHari = selectedDates.length;

  const getPeriodDates = () => {
    if (!selectedPeriod) return [];
    const [yearStr, monthStr] = selectedPeriod.split('-');
    const year = parseInt(yearStr);
    const month = parseInt(monthStr) - 1; 
    const startDate = new Date(year, month - 1, 26);
    const endDate = new Date(year, month, 25);
    
    const dates = [];
    const cur = new Date(startDate);
    while (cur <= endDate) {
      dates.push(new Date(cur));
      cur.setDate(cur.getDate() + 1);
    }
    return dates;
  };

  const periodDates = getPeriodDates();

  const toggleDate = (date: Date) => {
    const isSelected = selectedDates.find(d => d.getTime() === date.getTime());
    if (isSelected) {
      setSelectedDates(selectedDates.filter(d => d.getTime() !== date.getTime()));
    } else {
      if (selectedDates.length >= 4) {
         setCutiMessage({ type: 'error', text: 'Maksimal 4 hari cuti dalam satu pengajuan.'});
         return;
      }
      setSelectedDates([...selectedDates, date].sort((a,b) => a.getTime() - b.getTime()));
    }
    setCutiMessage(null);
  };

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

          let combinedPeers: any[] = [];

          if (kData.departemen_id) {
            const peersRes = await fetch(`${baseUrl}/karyawan?departemen_id=${kData.departemen_id}`);
            if (peersRes.ok) {
              combinedPeers.push(...await peersRes.json());
            }
          }

          // Fetch subordinates as well, just in case user is SPV/Coordinator of cross-unit members
          const subRes = await fetch(`${baseUrl}/karyawan?superior_id=${user.karyawan_id}`);
          if (subRes.ok) {
             combinedPeers.push(...await subRes.json());
          }

          // Remove duplicates based on id
          const uniquePeers = Array.from(new Map(combinedPeers.map(item => [item.id, item])).values());
          setDelegationPeers(uniquePeers.filter((p: any) => p.id !== user.karyawan_id));
        }

        const cutiRes = await fetch(`${baseUrl}/cuti?karyawan_id=${user.karyawan_id}`, { cache: 'no-store' });
        if (cutiRes.ok) {
          const cutiData = await cutiRes.json();
          setLeaveHistory(cutiData.map((c: any) => {
            return {
              id: c.id,
              type: c.jenis_cuti || "Cuti",
              range: `${new Date(c.tanggal_mulai).toLocaleDateString("id-ID", {day:'numeric', month:'short'})} - ${new Date(c.tanggal_selesai).toLocaleDateString("id-ID", {day:'numeric', month:'short'})}`,
              tanggal_mulai: c.tanggal_mulai,
              tanggal_selesai: c.tanggal_selesai,
              status: c.status,
              alasan: c.alasan || c.keterangan,
              jumlah_hari: c.jumlah_hari,
              rejected_by: c.rejected_by
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

  
  const checkHMin1 = (tanggal_mulai: string) => {
      const tm = new Date(tanggal_mulai);
      tm.setHours(0,0,0,0);
      const today = new Date();
      today.setHours(0,0,0,0);
      return today < tm;
  };

  const handleCancelCuti = async (cuti: any) => {
      if(!checkHMin1(cuti.tanggal_mulai)){
          Swal.fire('Gagal', 'Pembatalan hanya bisa dilakukan maksimal H-1', 'error');
          return;
      }
      
      const res = await Swal.fire({
          title: 'Batalkan Cuti?',
          text: "Jadwal Anda akan dikembalikan seperti semula.",
          icon: 'warning',
          showCancelButton: true,
          confirmButtonColor: '#d33',
          cancelButtonColor: '#3085d6',
          confirmButtonText: 'Ya, Batalkan!'
      });

      if (!res.isConfirmed) return;
      
      try {
          const userStr = localStorage.getItem("user");
          const user = JSON.parse(userStr!);
          const response = await fetch('/api/cuti/cancel', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ cuti_id: cuti.id, karyawan_id: user.karyawan_id })
          });
          if(response.ok){
              Swal.fire('Berhasil!', 'Cuti berhasil dibatalkan', 'success').then(() => window.location.reload());
          } else {
              const err = await response.json();
              Swal.fire('Gagal', err.message, 'error');
          }
      } catch(e) { console.error(e); }
  }

  const openRescheduleModal = (cuti: any) => {
      if(!checkHMin1(cuti.tanggal_mulai)){
          Swal.fire('Gagal', 'Ganti tanggal hanya bisa dilakukan maksimal H-1', 'error');
          return;
      }
      setRescheduleData(cuti);
      setIsRescheduleModalOpen(true);
      // Reset selected dates so they can pick again
      setSelectedDates([]);
      setLeaveForm({ ...leaveForm, alasan: cuti.alasan });
  }

  const handleRescheduleSubmit = async () => {
      if (selectedDates.length === 0) {
          Swal.fire('Error', 'Pilih tanggal cuti yang baru di kalender', 'error');
          return;
      }
      try {
          const userStr = localStorage.getItem("user");
          const user = JSON.parse(userStr!);
          
          const formatDates = selectedDates.map(d => {
              const yyyy = d.getFullYear();
              const mm = String(d.getMonth() + 1).padStart(2, '0');
              const dd = String(d.getDate()).padStart(2, '0');
              return `${yyyy}-${mm}-${dd}`;
          });
          // Match the dates format
          const newAlasan = `${leaveForm.alasan.replace(/\[DATES:.*\]/, '').trim()} [DATES: ${formatDates.join(', ')}]`;

          const res = await fetch('/api/cuti/reschedule', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                  cuti_id: rescheduleData.id,
                  karyawan_id: user.karyawan_id,
                  tanggal_mulai: formatDates[0],
                  tanggal_selesai: formatDates[formatDates.length - 1],
                  jumlah_hari: selectedDates.length,
                  alasan: newAlasan
              })
          });

          if (res.ok) {
              Swal.fire('Berhasil', 'Jadwal cuti berhasil diganti', 'success').then(() => window.location.reload());
          } else {
              const err = await res.json();
              Swal.fire('Gagal', err.message, 'error');
          }
      } catch (e) {
          console.error(e);
      }
  }

  const handleCutiSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCutiMessage(null);
    setIsSubmitting(true);
    
    if (selectedDates.length === 0) {
      setCutiMessage({ type: 'error', text: `Silakan pilih minimal 1 hari cuti pada kalender.` });
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

      const earliestDate = selectedDates[0];
      const latestDate = selectedDates[selectedDates.length - 1];
      const dateStrings = selectedDates.map(d => formatYMD(d)).join(',');
      let finalAlasan = `[DATES: ${dateStrings}] ${leaveForm.alasan}`;
      if (leaveForm.delegasi) {
          finalAlasan += `\n[DELEGASI: ${leaveForm.delegasi}]`;
      }

      const payload = {
        karyawan_id: user.karyawan_id,
        jenis_cuti: leaveForm.kategori,
        tanggal_mulai: formatYMD(earliestDate),
        tanggal_selesai: formatYMD(latestDate),
        tanggal_kembali: leaveForm.tanggal_kembali || null,
        jumlah_hari: jumlahHari,
        keterangan: finalAlasan // Diteruskan ke kolom alasan
      };

      const res = await fetch(`${baseUrl}/cuti`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Gagal mengajukan cuti.");

      setCutiMessage({ type: 'success', text: "Pengajuan cuti berhasil dikirim." });
      setLeaveForm({ tanggal_kembali: '', alasan: '', kategori: 'Tahunan', delegasi: '' });
      setSelectedDates([]);
      
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
                <div className="relative z-50">
                  <Select
                    options={[
                        { value: "Tahunan", label: "Cuti Tahunan" },
                        { value: "Sakit", label: "Cuti Sakit" },
                        { value: "Melahirkan", label: "Cuti Melahirkan" },
                        { value: "Izin Penting", label: "Izin Penting (Kedukaan, Menikah, dll)" }
                    ]}
                    value={{ value: leaveForm.kategori, label: leaveForm.kategori === 'Izin Penting' ? 'Izin Penting (Kedukaan, Menikah, dll)' : `Cuti ${leaveForm.kategori}` }}
                    onChange={(selected: any) => {
                        setLeaveForm({...leaveForm, kategori: selected.value});
                        setSelectedDates([]);
                        setCutiMessage(null);
                    }}
                    styles={{
                        control: (base, state) => ({
                            ...base,
                            backgroundColor: state.isFocused ? 'white' : '#f8fafc',
                            borderColor: state.isFocused ? '#3b82f6' : '#f1f5f9',
                            boxShadow: state.isFocused ? '0 0 0 1px #3b82f6' : 'none',
                            padding: '6px',
                            borderRadius: '1rem',
                            cursor: 'pointer',
                            fontSize: '0.875rem',
                            fontWeight: '700',
                            color: '#1e293b'
                        }),
                        menu: base => ({ ...base, zIndex: 50, borderRadius: '1rem', overflow: 'hidden', padding: '4px' }),
                        option: (base, state) => ({
                            ...base,
                            backgroundColor: state.isSelected ? '#eff6ff' : state.isFocused ? '#f8fafc' : 'white',
                            color: state.isSelected ? '#2563eb' : '#334155',
                            fontWeight: state.isSelected ? '700' : '500',
                            borderRadius: '0.75rem',
                            cursor: 'pointer',
                            padding: '10px 12px'
                        })
                    }}
                  />
                </div>
              </div>

              {leaveForm.kategori !== 'Tahunan' ? (
                <div className="p-10 bg-slate-50 border border-slate-100 rounded-[24px] text-center">
                    <AlertCircle size={48} className="text-slate-300 mx-auto mb-4" />
                    <h3 className="font-black text-slate-800 mb-2 text-lg">Fitur Masih Dalam Pengembangan</h3>
                    <p className="text-xs text-slate-500 font-medium max-w-sm mx-auto leading-relaxed">
                        Pengajuan jenis cuti ini saat ini belum tersedia secara digital. Silakan hubungi tim Human Capital untuk mengajukan cuti khusus ini secara manual.
                    </p>
                </div>
              ) : (
                <>
                  <div className="p-3 sm:p-5 bg-slate-50 rounded-[20px] sm:rounded-[24px] border border-slate-100">
                    <div className="space-y-3 sm:space-y-4">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-3">
                          <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-1.5"><Calendar size={12}/> Kalender Periodik (26-25)</label>
                          <input 
                              type="month" 
                              value={selectedPeriod} 
                              onChange={e => { setSelectedPeriod(e.target.value); setSelectedDates([]); }} 
                              className="bg-white border border-slate-200 text-slate-700 py-1.5 px-3 rounded-lg text-xs font-semibold focus:outline-none focus:ring-2 focus:border-blue-500 transition-all w-full sm:w-auto"
                          />
                      </div>
                      
                      <div className="grid grid-cols-7 gap-0.5 sm:gap-1.5 mt-2">
                          {['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'].map(day => (
                              <div key={day} className="text-center text-[9px] sm:text-[10px] font-black text-slate-400 py-1">{day}</div>
                          ))}
                          {[...Array(periodDates.length > 0 ? periodDates[0].getDay() : 0).fill(null), ...periodDates].map((date, idx) => {
                              if (!date) return <div key={`empty-${idx}`} className="p-1 sm:p-2"></div>;
                              const isSelected = selectedDates.find(d => d.getTime() === date.getTime());
                              const isToday = date.toDateString() === new Date().toDateString();
                              const isWeekend = date.getDay() === 0 || date.getDay() === 6;
                              return (
                                  <button
                                      key={idx}
                                      type="button"
                                      onClick={() => toggleDate(date)}
                                      className={`p-1 sm:p-1.5 rounded-lg sm:rounded-xl font-bold flex flex-col items-center justify-center transition-all aspect-square 
                                          ${isSelected ? 'bg-blue-600 text-white shadow-md shadow-blue-500/40 ring-1 sm:ring-2 ring-blue-600 ring-offset-1 sm:ring-offset-2 scale-105' : 
                                            'bg-white text-slate-700 hover:bg-blue-50 border border-slate-200 hover:border-blue-300'
                                          } ${isToday && !isSelected ? 'text-blue-600 ring-1 ring-blue-300' : ''} ${isWeekend && !isSelected ? 'text-rose-500 bg-rose-50/20' : ''}`}
                                  >
                                      <span className="text-xs sm:text-sm">{date.getDate()}</span>
                                  </button>
                              )
                          })}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4 bg-blue-50/50 p-4 rounded-2xl border border-blue-100/50">
                      <div className="flex-1">
                          <p className="text-[10px] font-black uppercase tracking-widest text-blue-800 mb-0.5">Durasi Cuti</p>
                          <p className="text-xs text-blue-600 font-medium leading-tight">Total hari kalender yang dipilih (Maksimal 4 hari).</p>
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
                        min={selectedDates.length > 0 ? new Date(selectedDates[selectedDates.length-1].getTime() + 86400000).toISOString().split('T')[0] : ''}
                        onChange={(e) => setLeaveForm({...leaveForm, tanggal_kembali: e.target.value})}
                        className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl focus:bg-white focus:ring-4 focus:ring-emerald-500/5 focus:border-emerald-600 outline-none transition-all font-bold text-slate-800 text-sm"
                      />
                      <p className="text-[10px] text-slate-400 ml-1">Pilih tanggal jika ada day off setelah masa cuti berakhir.</p>
                  </div>

                  <div className="space-y-1.5 pt-2">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-1 text-blue-600"><Users size={12}/> Delegasi Pekerjaan (Opsional)</label>
                    <div className="relative z-40">
                        <Select
                            options={delegationPeers.map(peer => ({
                                value: peer.nama_lengkap,
                                label: `${peer.nama_lengkap} ${peer.nama_level ? `(${peer.nama_level})` : ''}`
                            }))}
                            value={leaveForm.delegasi ? { value: leaveForm.delegasi, label: leaveForm.delegasi } : null}
                            onChange={(selected: any) => setLeaveForm({...leaveForm, delegasi: selected ? selected.value : ''})}
                            isClearable
                            placeholder="Pilih Partner Delegasi"
                            noOptionsMessage={() => "Tidak ada rekan dalam satu unit"}
                            styles={{
                                control: (base, state) => ({
                                    ...base,
                                    backgroundColor: state.isFocused ? 'white' : '#f8fafc',
                                    borderColor: state.isFocused ? '#3b82f6' : '#f1f5f9',
                                    boxShadow: state.isFocused ? '0 0 0 1px #3b82f6' : 'none',
                                    padding: '6px',
                                    borderRadius: '1rem',
                                    cursor: 'pointer',
                                    fontSize: '0.875rem',
                                    fontWeight: '700',
                                    color: '#1e293b'
                                }),
                                menu: base => ({ ...base, zIndex: 50, borderRadius: '1rem', overflow: 'hidden', padding: '4px' }),
                                option: (base, state) => ({
                                    ...base,
                                    backgroundColor: state.isSelected ? '#eff6ff' : state.isFocused ? '#f8fafc' : 'white',
                                    color: state.isSelected ? '#2563eb' : '#334155',
                                    fontWeight: state.isSelected ? '700' : '500',
                                    borderRadius: '0.75rem',
                                    cursor: 'pointer',
                                    padding: '10px 12px'
                                })
                            }}
                        />
                    </div>
                    <p className="text-[10px] text-slate-400 ml-1">Pilih rekan yang akan menggantikan tugas Anda selama cuti.</p>
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
                </>
              )}
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
                    <div className="flex flex-col items-end">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                        item.status === 'Disetujui' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                        (item.status && item.status.includes('Menunggu')) ? 'bg-amber-50 text-amber-600 border-amber-100' :
                        'bg-rose-50 text-rose-600 border-rose-100'
                      }`}>
                        {(item.status || 'TIDAK DIKETAHUI').replace('_', ' ')}
                      </span>
                      {item.status === 'Ditolak' && item.rejected_by && (
                        <span className="text-[9px] font-bold text-rose-400 mt-1">Oleh: {item.rejected_by}</span>
                      )}
                    </div>
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
    
      
      {/* MODAL RESCHEDULE */}
      {isRescheduleModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
              <div className="bg-white rounded-3xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl relative">
                  <button onClick={() => setIsRescheduleModalOpen(false)} className="absolute top-6 right-6 text-slate-400 hover:text-rose-500 z-10"><XCircle size={28} /></button>
                  
                  <div className="mb-6">
                      <h2 className="text-2xl font-black text-slate-800">Ganti Tanggal Cuti</h2>
                      <p className="text-slate-500 font-bold mt-1">Silakan pilih tanggal pengganti di kalender periodik ini.</p>
                  </div>

                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 mb-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-1.5">Kalender Periodik</label>
                        <input 
                            type="month" 
                            value={selectedPeriod} 
                            onChange={e => { setSelectedPeriod(e.target.value); setSelectedDates([]); }} 
                            className="bg-white border border-slate-200 text-slate-700 py-1.5 px-3 rounded-lg text-xs font-semibold focus:outline-none focus:ring-2 focus:border-blue-500 transition-all"
                        />
                    </div>
                    
                    <div className="grid grid-cols-7 gap-1.5">
                        {['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'].map(day => (
                            <div key={day} className="text-center text-[10px] font-black text-slate-400 py-1">{day}</div>
                        ))}
                        {[...Array(getPeriodDates().length > 0 ? getPeriodDates()[0].getDay() : 0).fill(null), ...getPeriodDates()].map((date, idx) => {
                            if (!date) return <div key={`empty-${idx}`} className="p-2"></div>;
                            const isSelected = selectedDates.find(d => d.getTime() === date.getTime());
                            const isToday = date.toDateString() === new Date().toDateString();
                            const isWeekend = date.getDay() === 0 || date.getDay() === 6;
                            
                            const toggleDate = (d: Date) => {
                                const exist = selectedDates.find(sd => sd.getTime() === d.getTime());
                                if(exist) setSelectedDates(selectedDates.filter(sd => sd.getTime() !== d.getTime()));
                                else setSelectedDates([...selectedDates, d].sort((a,b) => a.getTime() - b.getTime()));
                            };

                            return (
                                <button
                                    key={idx}
                                    type="button"
                                    onClick={() => toggleDate(date)}
                                    className={`p-1.5 rounded-xl font-bold flex flex-col items-center justify-center transition-all aspect-square 
                                        ${isSelected ? 'bg-blue-600 text-white shadow-md shadow-blue-500/40 ring-2 ring-blue-600 ring-offset-2 scale-105' : 
                                          'bg-white text-slate-700 hover:bg-blue-50 border border-slate-200 hover:border-blue-300'
                                        } ${isToday && !isSelected ? 'text-blue-600 ring-1 ring-blue-300' : ''} ${isWeekend && !isSelected ? 'text-rose-500 bg-rose-50/20' : ''}`}
                                >
                                    <span className="text-sm">{date.getDate()}</span>
                                </button>
                            )
                        })}
                    </div>
                  </div>

                  <div className="space-y-3 mb-6">
                    <label className="text-sm font-bold text-slate-700">Alasan</label>
                    <textarea
                      rows={3}
                      value={leaveForm.alasan}
                      onChange={(e) => setLeaveForm({...leaveForm, alasan: e.target.value})}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                    ></textarea>
                  </div>

                  <button 
                    onClick={handleRescheduleSubmit}
                    disabled={selectedDates.length === 0}
                    className="w-full bg-blue-600 text-white font-black py-4 rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20 uppercase tracking-widest text-xs disabled:opacity-50"
                  >
                    Simpan Perubahan
                  </button>
              </div>
          </div>
      )}


      {/* MODAL RESCHEDULE */}
      {isRescheduleModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
              <div className="bg-white rounded-3xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl relative">
                  <button onClick={() => setIsRescheduleModalOpen(false)} className="absolute top-6 right-6 text-slate-400 hover:text-rose-500 z-10"><XCircle size={28} /></button>
                  
                  <div className="mb-6">
                      <h2 className="text-2xl font-black text-slate-800">Ganti Tanggal Cuti</h2>
                      <p className="text-slate-500 font-bold mt-1">Silakan pilih tanggal pengganti di kalender periodik ini.</p>
                  </div>

                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 mb-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-1.5">Kalender Periodik</label>
                        <input 
                            type="month" 
                            value={selectedPeriod} 
                            onChange={e => { setSelectedPeriod(e.target.value); setSelectedDates([]); }} 
                            className="bg-white border border-slate-200 text-slate-700 py-1.5 px-3 rounded-lg text-xs font-semibold focus:outline-none focus:ring-2 focus:border-blue-500 transition-all"
                        />
                    </div>
                    
                    <div className="grid grid-cols-7 gap-1.5">
                        {['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'].map(day => (
                            <div key={day} className="text-center text-[10px] font-black text-slate-400 py-1">{day}</div>
                        ))}
                        {[...Array(getPeriodDates().length > 0 ? getPeriodDates()[0].getDay() : 0).fill(null), ...getPeriodDates()].map((date, idx) => {
                            if (!date) return <div key={`empty-${idx}`} className="p-2"></div>;
                            const isSelected = selectedDates.find(d => d.getTime() === date.getTime());
                            const isToday = date.toDateString() === new Date().toDateString();
                            const isWeekend = date.getDay() === 0 || date.getDay() === 6;
                            
                            const toggleDate = (d: Date) => {
                                const exist = selectedDates.find(sd => sd.getTime() === d.getTime());
                                if(exist) setSelectedDates(selectedDates.filter(sd => sd.getTime() !== d.getTime()));
                                else setSelectedDates([...selectedDates, d].sort((a,b) => a.getTime() - b.getTime()));
                            };

                            return (
                                <button
                                    key={idx}
                                    type="button"
                                    onClick={() => toggleDate(date)}
                                    className={`p-1.5 rounded-xl font-bold flex flex-col items-center justify-center transition-all aspect-square 
                                        ${isSelected ? 'bg-blue-600 text-white shadow-md shadow-blue-500/40 ring-2 ring-blue-600 ring-offset-2 scale-105' : 
                                          'bg-white text-slate-700 hover:bg-blue-50 border border-slate-200 hover:border-blue-300'
                                        } ${isToday && !isSelected ? 'text-blue-600 ring-1 ring-blue-300' : ''} ${isWeekend && !isSelected ? 'text-rose-500 bg-rose-50/20' : ''}`}
                                >
                                    <span className="text-sm">{date.getDate()}</span>
                                </button>
                            )
                        })}
                    </div>
                  </div>

                  <div className="space-y-3 mb-6">
                    <label className="text-sm font-bold text-slate-700">Alasan</label>
                    <textarea
                      rows={3}
                      value={leaveForm.alasan}
                      onChange={(e) => setLeaveForm({...leaveForm, alasan: e.target.value})}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                    ></textarea>
                  </div>

                  <button 
                    onClick={handleRescheduleSubmit}
                    disabled={selectedDates.length === 0}
                    className="w-full bg-blue-600 text-white font-black py-4 rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20 uppercase tracking-widest text-xs disabled:opacity-50"
                  >
                    Simpan Perubahan
                  </button>
              </div>
          </div>
      )}
    </div>
  );
}
