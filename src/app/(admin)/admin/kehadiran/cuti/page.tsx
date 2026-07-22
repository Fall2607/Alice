"use client";

import React, { useState, useEffect } from "react";
import { CheckCircle2, XCircle, Clock, Search, Briefcase, Calendar as CalendarIcon, ChevronLeft, ChevronRight, Grid } from "lucide-react";

export default function ApprovalCutiPage() {
  const [pendingLeaves, setPendingLeaves] = useState<any[]>([]);
  const [approvedLeaves, setApprovedLeaves] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCalendarLoading, setIsCalendarLoading] = useState(false);
  const [userInfo, setUserInfo] = useState<any>(null);
  const [currentDate, setCurrentDate] = useState(new Date());

  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "/api";

  const fetchData = async (date: Date) => {
    try {
      setIsLoading(true);
      setIsCalendarLoading(true);
      
      const userStr = localStorage.getItem("user");
      if (!userStr) return;
      const user = JSON.parse(userStr);
      setUserInfo(user);

      let isHC = user.role?.toLowerCase() === 'hc' || user.role?.toLowerCase() === 'human capital';
      let isAdmin = user.role?.toLowerCase() === 'admin';
      let isHCAdmin = isHC || isAdmin;
      
      // Fetch Pending Leaves
      let urlPending = '';
      if (isAdmin) {
        urlPending = `${baseUrl}/cuti?status=Menunggu`;
      } else if (isHC) {
        urlPending = `${baseUrl}/cuti?status=Menunggu HC`;
      } else {
        urlPending = `${baseUrl}/cuti?atasan_id=${user.karyawan_id}&status=Menunggu Atasan,Menunggu SPV`;
      }

      const resPending = await fetch(urlPending, { cache: 'no-store' });
      if (resPending.ok) {
        setPendingLeaves(await resPending.json());
      }

      // Fetch Calendar Leaves (Approved & Pending)
      const year = date.getFullYear();
      const month = date.getMonth() + 1;
      let urlCal = `${baseUrl}/cuti?year=${year}&month=${month}&status=Disetujui,Menunggu Atasan,Menunggu SPV,Menunggu HC`;
      if (!isHCAdmin && user.karyawan_id) {
         urlCal += `&atasan_id=${user.karyawan_id}`;
      }
      
      const resCal = await fetch(urlCal, { cache: 'no-store' });
      if (resCal.ok) {
        setApprovedLeaves(await resCal.json());
      }

    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
      setIsCalendarLoading(false);
    }
  };

  useEffect(() => {
    fetchData(currentDate);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentDate]);

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const handleApproveReject = async (cuti_id: string, action: 'approve' | 'reject') => {
    if (!confirm(`Apakah Anda yakin ingin memproses pengajuan ini?`)) return;

    try {
      const isHC = userInfo.role?.toLowerCase() === 'hc' || userInfo.role?.toLowerCase() === 'human capital' || userInfo.role?.toLowerCase() === 'admin';
      
      const res = await fetch(`${baseUrl}/cuti/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cuti_id,
          action,
          approver_id: userInfo.karyawan_id,
          is_hc: isHC
        })
      });

      const data = await res.json();
      if (res.ok) {
        alert(data.message);
        fetchData(currentDate); // Refresh both pending and calendar
      } else {
        alert(data.message || "Terjadi kesalahan.");
      }
    } catch (err) {
      console.error(err);
      alert("Gagal memproses persetujuan.");
    }
  };

  // Calendar Logic
  const getDaysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

  const daysInMonth = getDaysInMonth(currentDate.getFullYear(), currentDate.getMonth());
  const firstDay = getFirstDayOfMonth(currentDate.getFullYear(), currentDate.getMonth());
  
  const monthName = currentDate.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });
  const weekDays = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];

  const getCutiForDate = (day: number) => {
    const yearStr = currentDate.getFullYear();
    const monthStr = String(currentDate.getMonth() + 1).padStart(2, '0');
    const dayStr = String(day).padStart(2, '0');
    const targetDateStr = `${yearStr}-${monthStr}-${dayStr}`;
    const dateObj = new Date(yearStr, currentDate.getMonth(), day, 0, 0, 0);
    
    return approvedLeaves.filter(cuti => {
      // Dukungan untuk multiple disjoint dates dari fitur cuti yang baru
      const alasan = cuti.alasan || cuti.keterangan || "";
      const datesMatch = alasan.match(/\[DATES:\s*(.*?)\]/);
      
      if (datesMatch) {
         const datesArr = datesMatch[1].split(',').map((d: string) => d.trim());
         return datesArr.includes(targetDateStr);
      }
      
      // Fallback untuk range tanggal konvensional
      const start = new Date(cuti.tanggal_mulai);
      const end = new Date(cuti.tanggal_selesai);
      start.setHours(0,0,0,0);
      end.setHours(0,0,0,0);
      return dateObj.getTime() >= start.getTime() && dateObj.getTime() <= end.getTime();
    });
  };

  return (
    <div className="p-8 font-sans max-w-7xl mx-auto min-h-screen">
      <div className="mb-10">
        <h1 className="text-4xl font-black text-slate-900 tracking-tighter leading-none mb-2">
          Dashboard Cuti
        </h1>
        <p className="text-slate-500 font-medium text-sm">
          Kelola persetujuan cuti dan pantau karyawan yang sedang cuti bulan ini.
        </p>
      </div>

      {/* KALENDER CUTI */}
      <div className="bg-white rounded-[32px] shadow-2xl shadow-slate-200/50 border border-slate-100 p-8 mb-10">
        <div className="flex items-center justify-between mb-8">
            <div>
                <h2 className="text-2xl font-black text-slate-800 flex items-center gap-2">
                    <Grid className="text-blue-500" /> Kalender Cuti Karyawan
                </h2>
                <p className="text-sm text-slate-500 mt-1">Menampilkan data pengajuan cuti. <span className="font-bold text-amber-500">Kuning: Menunggu</span> | <span className="font-bold text-emerald-500">Hijau: Disetujui</span></p>
            </div>
            <div className="flex items-center gap-4 bg-slate-50 p-2 rounded-xl border border-slate-100">
                <button onClick={handlePrevMonth} className="p-2 bg-white rounded-lg hover:bg-blue-50 hover:text-blue-600 transition-colors shadow-sm"><ChevronLeft size={20} /></button>
                <span className="font-black text-slate-700 min-w-[120px] text-center">{monthName}</span>
                <button onClick={handleNextMonth} className="p-2 bg-white rounded-lg hover:bg-blue-50 hover:text-blue-600 transition-colors shadow-sm"><ChevronRight size={20} /></button>
            </div>
        </div>

        {isCalendarLoading ? (
            <div className="h-64 flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
        ) : (
            <div className="grid grid-cols-7 gap-2">
                {weekDays.map(day => (
                    <div key={day} className="text-center text-xs font-black uppercase text-slate-400 pb-2">
                        {day}
                    </div>
                ))}
                
                {Array.from({ length: firstDay }).map((_, i) => (
                    <div key={`empty-${i}`} className="min-h-[100px] p-2 bg-slate-50/50 rounded-xl border border-slate-50 opacity-50"></div>
                ))}

                {Array.from({ length: daysInMonth }).map((_, i) => {
                    const day = i + 1;
                    const isToday = new Date().getDate() === day && new Date().getMonth() === currentDate.getMonth() && new Date().getFullYear() === currentDate.getFullYear();
                    const cutiHariIni = getCutiForDate(day);

                    return (
                        <div key={day} className={`min-h-[100px] p-2 rounded-xl border transition-all ${isToday ? 'bg-blue-50 border-blue-200' : 'bg-white border-slate-100 hover:border-blue-100 hover:shadow-md'}`}>
                            <div className={`text-sm font-black mb-2 ${isToday ? 'text-blue-600' : 'text-slate-500'}`}>
                                {day}
                            </div>
                            <div className="flex flex-col gap-1">
                                {cutiHariIni.map((c, idx) => {
                                    const isApproved = c.status === 'Disetujui';
                                    const bgColor = isApproved ? 'bg-emerald-500 hover:bg-emerald-600 shadow-emerald-200' : 'bg-amber-500 hover:bg-amber-600 shadow-amber-200 text-slate-900';
                                    return (
                                        <div key={idx} title={`${c.nama_lengkap} - ${c.jenis_cuti} (${c.status.replace('_', ' ')})`} className={`text-[10px] font-bold px-2 py-1 rounded-md truncate cursor-pointer shadow-sm ${isApproved ? 'text-white' : 'text-white'} ${bgColor}`}>
                                            {c.nama_lengkap.split(' ')[0]}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    );
                })}
            </div>
        )}
      </div>

      <div className="bg-white rounded-[32px] shadow-2xl shadow-slate-200/50 border border-slate-100 p-8 min-h-[400px]">
        <div className="mb-6 border-b border-slate-100 pb-4">
            <h2 className="text-2xl font-black text-slate-800">Menunggu Persetujuan</h2>
            <p className="text-sm text-slate-500 mt-1">Daftar pengajuan cuti yang membutuhkan tindak lanjut Anda.</p>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center h-40">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : pendingLeaves.length === 0 ? (
          <div className="text-center py-20 flex flex-col items-center">
            <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mb-4 border border-slate-100">
              <CheckCircle2 size={40} className="text-emerald-500" />
            </div>
            <h3 className="text-lg font-black text-slate-800">Semua Beres!</h3>
            <p className="text-slate-500 text-sm mt-1">Tidak ada pengajuan cuti yang tertunda saat ini.</p>
          </div>
        ) : (
          <div className="grid gap-6">
            {pendingLeaves.map((cuti) => (
              <div key={cuti.id} className="p-6 rounded-[24px] border border-slate-200 bg-slate-50 flex flex-col lg:flex-row lg:items-center justify-between gap-6 hover:shadow-lg hover:border-blue-200 transition-all">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="px-3 py-1 bg-amber-100 text-amber-700 text-[10px] font-black uppercase tracking-widest rounded-full border border-amber-200">
                      {cuti.status.replace('_', ' ')}
                    </span>
                    <span className="text-xs font-bold text-slate-400">ID: {cuti.id.substring(0,8)}</span>
                  </div>
                  
                  <h3 className="text-xl font-black text-slate-900 leading-tight mb-1">{cuti.nama_lengkap}</h3>
                  <div className="flex items-center gap-2 text-slate-500 text-xs font-bold mb-4">
                    <Briefcase size={12} /> {cuti.nama_jabatan || "Karyawan"}
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-white p-4 rounded-2xl border border-slate-100">
                    <div>
                      <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1">Jenis Cuti</p>
                      <p className="text-sm font-bold text-slate-800">{cuti.jenis_cuti}</p>
                    </div>
                    <div>
                      <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1">Durasi</p>
                      <p className="text-sm font-bold text-blue-600">{cuti.jumlah_hari} Hari</p>
                    </div>
                    <div className="col-span-2">
                      <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1">Tanggal</p>
                      <p className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                        <CalendarIcon size={14} className="text-blue-500"/>
                        {new Date(cuti.tanggal_mulai).toLocaleDateString("id-ID")} - {new Date(cuti.tanggal_selesai).toLocaleDateString("id-ID")}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4">
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Keterangan / Alasan:</p>
                    <p className="text-sm text-slate-700 italic border-l-2 border-slate-300 pl-3">"{cuti.alasan}"</p>
                  </div>
                </div>

                <div className="flex lg:flex-col gap-3 min-w-[200px]">
                  <button 
                    onClick={() => handleApproveReject(cuti.id, 'approve')}
                    className="flex-1 lg:flex-none flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white font-black py-4 px-6 rounded-2xl transition-all shadow-lg shadow-emerald-500/20 active:scale-95 text-xs uppercase tracking-widest"
                  >
                    <CheckCircle2 size={16} /> Approve
                  </button>
                  <button 
                    onClick={() => handleApproveReject(cuti.id, 'reject')}
                    className="flex-1 lg:flex-none flex items-center justify-center gap-2 bg-white hover:bg-rose-50 text-rose-500 font-black py-4 px-6 rounded-2xl border border-rose-200 transition-all active:scale-95 text-xs uppercase tracking-widest"
                  >
                    <XCircle size={16} /> Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
