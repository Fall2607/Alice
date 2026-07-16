"use client";

import React, { useState, useEffect } from "react";
import { Users, Calendar, Clock, FileText, Send, AlertCircle, CheckCircle2, RefreshCw, X } from "lucide-react";

export default function ShiftTab() {
  const [userKaryawanId, setUserKaryawanId] = useState<string>("");
  const [selectedMonth, setSelectedMonth] = useState("");
  const [jadwalUnit, setJadwalUnit] = useState<any[]>([]);
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRekanJadwal, setSelectedRekanJadwal] = useState<any>(null);
  const [mySelectedJadwalString, setMySelectedJadwalString] = useState(""); // Gabungan tanggal|shift_id
  const [alasan, setAlasan] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    // Set default month to current month (YYYY-MM)
    const now = new Date();
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    const yyyy = now.getFullYear();
    setSelectedMonth(`${yyyy}-${mm}`);

    const userDataStr = localStorage.getItem("user");
    if (userDataStr) {
      const user = JSON.parse(userDataStr);
      if (user.karyawan_id) {
        setUserKaryawanId(user.karyawan_id);
      }
    }
  }, []);

  useEffect(() => {
    if (userKaryawanId && selectedMonth) {
      fetchJadwalUnit();
    }
  }, [userKaryawanId, selectedMonth]);

  const fetchJadwalUnit = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/tukar-shift/jadwal-unit?karyawan_id=${userKaryawanId}&bulan=${selectedMonth}`);
      if (res.ok) {
        setJadwalUnit(await res.json());
      }
    } catch (err) {
      console.error("Gagal memuat jadwal unit", err);
    } finally {
      setIsLoading(false);
    }
  };

  const myJadwalList = jadwalUnit.filter(j => j.karyawan_id === userKaryawanId);
  const rekanJadwalList = jadwalUnit.filter(j => j.karyawan_id !== userKaryawanId);

  const openModal = (rekanJadwal: any) => {
    setError(null);
    setSuccess(false);
    setSelectedRekanJadwal(rekanJadwal);
    setMySelectedJadwalString("");
    setAlasan("");
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mySelectedJadwalString) {
      setError("Silakan pilih jadwal Anda yang akan ditukar.");
      return;
    }

    const [myTanggal, myShiftIdStr] = mySelectedJadwalString.split('|');
    const myShiftId = myShiftIdStr ? parseInt(myShiftIdStr) : null;

    setError(null);
    setIsSubmitting(true);

    try {
      const res = await fetch('/api/tukar-shift/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          karyawan_pengaju_id: userKaryawanId,
          karyawan_pengganti_id: selectedRekanJadwal.karyawan_id,
          tanggal_pengaju: myTanggal,
          tanggal_pengganti: selectedRekanJadwal.tanggal,
          shift_pengaju_id: myShiftId,
          shift_pengganti_id: selectedRekanJadwal.shift_id,
          alasan
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Gagal mengajukan");
      
      setSuccess(true);
      setIsModalOpen(false);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
              <Users className="text-blue-600" /> Jadwal Shift Satu Unit
            </h2>
            <p className="text-sm text-slate-500 mt-1">Lihat jadwal rekan satu unit dan pilih jadwal yang ingin Anda tukar.</p>
          </div>
          <div className="flex items-center gap-2">
            <label className="text-sm font-bold text-slate-700">Pilih Bulan:</label>
            <input 
              type="month" 
              value={selectedMonth} 
              onChange={e => setSelectedMonth(e.target.value)}
              className="p-2 border border-slate-200 rounded-xl bg-slate-50 text-sm outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {success && (
          <div className="mb-6 bg-emerald-50 text-emerald-700 p-4 rounded-xl flex items-center gap-3 border border-emerald-100">
            <CheckCircle2 size={20} />
            <p className="font-medium text-sm">Pengajuan tukar shift berhasil dikirim! Atasan Anda akan menerima email persetujuan.</p>
          </div>
        )}

        {isLoading ? (
          <div className="py-12 text-center text-slate-400">
            <RefreshCw className="animate-spin mx-auto mb-2" size={24} />
            <p className="text-sm">Memuat data jadwal...</p>
          </div>
        ) : rekanJadwalList.length === 0 ? (
          <div className="py-12 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200">
            <p className="text-slate-500 text-sm">Tidak ada jadwal rekan yang ditemukan pada bulan ini.</p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-slate-200">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4">Tanggal</th>
                  <th className="px-6 py-4">Nama Rekan</th>
                  <th className="px-6 py-4">Shift</th>
                  <th className="px-6 py-4 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {rekanJadwalList.map((jadwal, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-6 py-3 font-medium text-slate-700">{jadwal.tanggal}</td>
                    <td className="px-6 py-3 text-slate-600">{jadwal.nama_lengkap}</td>
                    <td className="px-6 py-3">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold bg-blue-50 text-blue-700 border border-blue-100">
                        {jadwal.nama_shift || "Libur/Off"}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-center">
                      <button 
                        onClick={() => openModal(jadwal)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 text-slate-600 hover:text-blue-600 hover:border-blue-200 hover:bg-blue-50 text-xs font-bold rounded-lg transition-all"
                      >
                        <RefreshCw size={12} /> Tukar Shift
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Pengajuan */}
      {isModalOpen && selectedRekanJadwal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200">
            
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <h3 className="font-bold text-lg text-slate-800 flex items-center gap-2">
                <RefreshCw className="text-blue-600" size={20} /> Form Tukar Shift
              </h3>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6 overflow-y-auto max-h-[70vh]">
              {error && (
                <div className="mb-4 bg-red-50 text-red-600 p-3 rounded-lg flex items-start gap-2 border border-red-100 text-sm font-medium">
                  <AlertCircle size={16} className="mt-0.5 shrink-0" />
                  <p>{error}</p>
                </div>
              )}

              <form id="tukarForm" onSubmit={handleSubmit} className="space-y-6">
                
                {/* Info Rekan */}
                <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 space-y-2">
                  <p className="text-xs font-bold text-blue-400 uppercase tracking-wider">Anda akan menukar jadwal dengan:</p>
                  <p className="font-bold text-blue-900">{selectedRekanJadwal.nama_lengkap}</p>
                  <div className="flex items-center gap-4 text-sm text-blue-700">
                    <span className="flex items-center gap-1"><Calendar size={14} /> {selectedRekanJadwal.tanggal}</span>
                    <span className="flex items-center gap-1"><Clock size={14} /> {selectedRekanJadwal.nama_shift || "Libur/Off"}</span>
                  </div>
                </div>

                {/* Pilih Jadwal Sendiri */}
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">Pilih Jadwal Anda yang akan ditukar <span className="text-red-500">*</span></label>
                  <select 
                    required 
                    value={mySelectedJadwalString} 
                    onChange={e => setMySelectedJadwalString(e.target.value)}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                  >
                    <option value="">-- Pilih Jadwal Anda Bulan Ini --</option>
                    {myJadwalList.map((j, idx) => (
                      <option key={idx} value={`${j.tanggal}|${j.shift_id || ""}`}>
                        {j.tanggal} - Shift: {j.nama_shift || "Libur/Off"}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Alasan */}
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">Alasan <span className="text-red-500">*</span></label>
                  <textarea 
                    required rows={3}
                    value={alasan} onChange={e => setAlasan(e.target.value)}
                    placeholder="Contoh: Ada acara keluarga mendadak..."
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm resize-none"
                  ></textarea>
                </div>

              </form>
            </div>

            <div className="p-5 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
              <button 
                type="button" 
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 text-sm font-bold text-slate-500 hover:text-slate-700 hover:bg-slate-200 rounded-lg transition-colors"
              >
                Batal
              </button>
              <button 
                type="submit" 
                form="tukarForm"
                disabled={isSubmitting}
                className="flex items-center gap-2 px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-lg transition-colors disabled:opacity-50"
              >
                {isSubmitting ? "Mengirim..." : <><Send size={16} /> Ajukan Tukar</>}
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
