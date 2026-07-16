"use client";

import React, { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { CheckCircle2, XCircle, Clock, Calendar, ArrowRightLeft, UserCircle2, Loader2, RefreshCw } from "lucide-react";

export default function ApproveTukarShiftPage() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [isLoading, setIsLoading] = useState(true);
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  
  const [actionLoading, setActionLoading] = useState<"APPROVE" | "REJECT" | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      setError("Token tidak valid atau tidak ditemukan di URL.");
      setIsLoading(false);
      return;
    }

    fetch(`/api/tukar-shift/approve?token=${token}`)
      .then(res => res.json().then(data => ({ status: res.status, data })))
      .then(({ status, data }) => {
        if (status === 200) {
          setData(data);
        } else {
          setError(data.message || "Pengajuan tidak ditemukan.");
        }
      })
      .catch(err => setError("Gagal terhubung ke server."))
      .finally(() => setIsLoading(false));
  }, [token]);

  const handleAction = async (action: "APPROVE" | "REJECT") => {
    setActionLoading(action);
    setError(null);
    try {
      const res = await fetch("/api/tukar-shift/approve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, action })
      });
      const resData = await res.json();
      if (!res.ok) throw new Error(resData.message || "Gagal memproses persetujuan.");
      
      setActionSuccess(resData.message);
      setData(null); // Sembunyikan form jika sudah sukses
    } catch (err: any) {
      setError(err.message);
    } finally {
      setActionLoading(null);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin mb-4" />
        <p className="text-slate-500 font-medium">Memeriksa tautan persetujuan...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-xl bg-white rounded-3xl shadow-xl shadow-slate-200/50 overflow-hidden border border-slate-100">
        <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-8 text-center text-white">
          <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4 backdrop-blur-sm">
            <RefreshCw size={32} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold mb-2">Persetujuan Tukar Shift</h1>
          <p className="text-blue-100 text-sm">Sistem HRIS RSU Avisena</p>
        </div>

        <div className="p-8">
          {error && (
            <div className="bg-red-50 text-red-600 p-4 rounded-xl flex items-center gap-3 border border-red-100 mb-6">
              <XCircle size={24} className="shrink-0" />
              <p className="font-medium text-sm">{error}</p>
            </div>
          )}

          {actionSuccess && (
            <div className="bg-emerald-50 text-emerald-700 p-6 rounded-2xl border border-emerald-100 text-center space-y-4">
              <CheckCircle2 size={48} className="mx-auto text-emerald-500" />
              <div>
                <h3 className="font-bold text-lg text-emerald-800">Berhasil!</h3>
                <p className="text-sm mt-1">{actionSuccess}</p>
              </div>
            </div>
          )}

          {data && !actionSuccess && (
            <div className="space-y-8">
              <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100 space-y-6">
                
                {/* Info Pengaju */}
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                    <UserCircle2 size={24} />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Pihak 1 (Pemohon)</p>
                    <p className="font-bold text-slate-800 text-lg">{data.pengaju_nama}</p>
                    <div className="flex items-center gap-2 text-sm text-slate-500 mt-2">
                      <Calendar size={16} /> <span>{data.tanggal_pengaju}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-slate-500 mt-1">
                      <Clock size={16} /> <span>Shift: {data.shift_pengaju_nama || "Libur/Off"}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-center text-slate-300 relative py-2">
                  <div className="absolute border-l-2 border-dashed border-slate-200 h-full left-[19px] -z-10"></div>
                  <ArrowRightLeft className="bg-slate-50 rotate-90 text-blue-500" size={24} />
                </div>

                {/* Info Pengganti */}
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center shrink-0">
                    <UserCircle2 size={24} />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Pihak 2 (Ditukar Dengan)</p>
                    <p className="font-bold text-slate-800 text-lg">{data.pengganti_nama}</p>
                    <div className="flex items-center gap-2 text-sm text-slate-500 mt-2">
                      <Calendar size={16} /> <span>{data.tanggal_pengganti}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-slate-500 mt-1">
                      <Clock size={16} /> <span>Shift: {data.shift_pengganti_nama || "Libur/Off"}</span>
                    </div>
                  </div>
                </div>

              </div>

              <div className="space-y-2">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Alasan Pengajuan</p>
                <p className="text-sm text-slate-700 bg-slate-50 p-4 rounded-xl border border-slate-100">{data.alasan || "-"}</p>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-100">
                <button
                  onClick={() => handleAction("REJECT")}
                  disabled={actionLoading !== null}
                  className="py-3.5 rounded-xl font-bold text-sm text-red-600 bg-red-50 hover:bg-red-100 border border-red-100 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {actionLoading === "REJECT" ? <Loader2 size={18} className="animate-spin" /> : <XCircle size={18} />}
                  Tolak Pengajuan
                </button>
                <button
                  onClick={() => handleAction("APPROVE")}
                  disabled={actionLoading !== null}
                  className="py-3.5 rounded-xl font-bold text-sm text-white bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-500/20 transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {actionLoading === "APPROVE" ? <Loader2 size={18} className="animate-spin" /> : <CheckCircle2 size={18} />}
                  Setujui & Tukar
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
