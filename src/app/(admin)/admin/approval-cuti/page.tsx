"use client";

import React, { useState, useEffect } from "react";
import { CheckCircle2, XCircle, Clock, Search, Briefcase, Calendar } from "lucide-react";

export default function ApprovalCutiPage() {
  const [pendingLeaves, setPendingLeaves] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [userInfo, setUserInfo] = useState<any>(null);
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "/api";

  useEffect(() => {
    fetchPendingLeaves();
  }, [baseUrl]);

  const fetchPendingLeaves = async () => {
    try {
      setIsLoading(true);
      const userStr = localStorage.getItem("user");
      if (!userStr) return;
      const user = JSON.parse(userStr);
      setUserInfo(user);

      // HC bisa melihat semua yang PENDING_HC
      // ATASAN bisa melihat semua yang PENDING_ATASAN dan atasan_id = dirinya
      let isHC = user.role?.toLowerCase() === 'hc' || user.role?.toLowerCase() === 'human capital';
      let isAdmin = user.role?.toLowerCase() === 'admin';
      
      let url = '';
      if (isAdmin) {
        // Admin melihat SEMUA pengajuan yang masih pending (baik di Atasan maupun HC) untuk keperluan tracking
        url = `${baseUrl}/cuti?status=Menunggu`;
      } else if (isHC) {
        url = `${baseUrl}/cuti?status=Menunggu HC`;
      } else {
        url = `${baseUrl}/cuti?atasan_id=${user.karyawan_id}&status=Menunggu Atasan`;
      }

      const res = await fetch(url, { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        setPendingLeaves(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
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
        fetchPendingLeaves(); // Refresh data
      } else {
        alert(data.message || "Terjadi kesalahan.");
      }
    } catch (err) {
      console.error(err);
      alert("Gagal memproses persetujuan.");
    }
  };

  return (
    <div className="p-8 font-sans max-w-7xl mx-auto min-h-screen">
      <div className="mb-10">
        <h1 className="text-4xl font-black text-slate-900 tracking-tighter leading-none mb-2">
          Approval Cuti
        </h1>
        <p className="text-slate-500 font-medium text-sm">
          Kelola dan tinjau pengajuan cuti yang menunggu persetujuan Anda.
        </p>
      </div>

      <div className="bg-white rounded-[32px] shadow-2xl shadow-slate-200/50 border border-slate-100 p-8 min-h-[500px]">
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
                        <Calendar size={14} className="text-blue-500"/>
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
