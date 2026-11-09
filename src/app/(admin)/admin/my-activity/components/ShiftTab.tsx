"use client";

import React, { useState, useEffect } from "react";
import {
  Users,
  Calendar,
  Clock,
  Send,
  AlertCircle,
  CheckCircle2,
  RefreshCw,
  X,
  Loader2,
  ArrowLeftRight,
} from "lucide-react";
import Select from "react-select";

interface UnitShiftItem {
  readonly karyawan_id: string;
  readonly nama_lengkap: string;
  readonly tanggal: string;
  readonly shift_id?: number | null;
  readonly nama_shift?: string | null;
}

export default function ShiftTab() {
  const [userKaryawanId, setUserKaryawanId] = useState<string>("");
  const [selectedMonth, setSelectedMonth] = useState<string>(() => {
    const now = new Date();
    const mm = String(now.getMonth() + 1).padStart(2, "0");
    const yyyy = now.getFullYear();
    return `${yyyy}-${mm}`;
  });
  const [jadwalUnit, setJadwalUnit] = useState<readonly UnitShiftItem[]>([]);

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRekanJadwal, setSelectedRekanJadwal] = useState<UnitShiftItem | null>(null);
  const [mySelectedJadwalString, setMySelectedJadwalString] = useState("");
  const [alasan, setAlasan] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const userDataStr = localStorage.getItem("user");
    if (userDataStr) {
      try {
        const user = JSON.parse(userDataStr);
        if (user.karyawan_id) {
          setUserKaryawanId(user.karyawan_id);
        }
      } catch (e) {
        console.error("Gagal membaca session user:", e);
      }
    }
  }, []);

  const fetchJadwalUnit = async (kId: string, month: string) => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const res = await fetch(
        `/api/tukar-shift/jadwal-unit?karyawan_id=${kId}&bulan=${month}`
      );
      if (res.ok) {
        const data: UnitShiftItem[] = await res.json();
        setJadwalUnit(data);
      } else {
        setErrorMessage("Gagal memuat jadwal shift unit.");
      }
    } catch (err) {
      console.error("Gagal memuat jadwal unit:", err);
      setErrorMessage("Koneksi gagal saat memuat jadwal unit.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (userKaryawanId && selectedMonth) {
      fetchJadwalUnit(userKaryawanId, selectedMonth);
    }
  }, [userKaryawanId, selectedMonth]);

  const myJadwalList = jadwalUnit.filter((j) => j.karyawan_id === userKaryawanId);
  const rekanJadwalList = jadwalUnit.filter((j) => j.karyawan_id !== userKaryawanId);

  const openModal = (rekanJadwal: UnitShiftItem) => {
    setErrorMessage(null);
    setSuccessMessage(null);
    setSelectedRekanJadwal(rekanJadwal);
    setMySelectedJadwalString("");
    setAlasan("");
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRekanJadwal) return;

    if (!mySelectedJadwalString) {
      setErrorMessage("Silakan pilih jadwal dinas Anda yang akan ditukar.");
      return;
    }

    const [myTanggal, myShiftIdStr] = mySelectedJadwalString.split("|");
    const myShiftId = myShiftIdStr ? parseInt(myShiftIdStr, 10) : null;

    setErrorMessage(null);
    setIsSubmitting(true);

    try {
      const res = await fetch("/api/tukar-shift/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          karyawan_pengaju_id: userKaryawanId,
          karyawan_pengganti_id: selectedRekanJadwal.karyawan_id,
          tanggal_pengaju: myTanggal,
          tanggal_pengganti: selectedRekanJadwal.tanggal,
          shift_pengaju_id: myShiftId,
          shift_pengganti_id: selectedRekanJadwal.shift_id,
          alasan,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Gagal mengajukan pertukaran shift.");
      }

      setSuccessMessage(
        `Permohonan tukar shift tanggal ${myTanggal} dengan ${selectedRekanJadwal.nama_lengkap} (${selectedRekanJadwal.tanggal}) berhasil diajukan.`
      );
      setIsModalOpen(false);
      fetchJadwalUnit(userKaryawanId, selectedMonth);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Terjadi kesalahan.";
      setErrorMessage(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectStyles = {
    control: (base: any, state: any) => ({
      ...base,
      backgroundColor: state.isFocused ? "#ffffff" : "#f8fafc",
      borderColor: state.isFocused ? "#0173b6" : "#cbd5e1",
      boxShadow: state.isFocused ? "0 0 0 2px rgba(1, 115, 182, 0.15)" : "none",
      padding: "3px 6px",
      borderRadius: "0.75rem",
      cursor: "pointer",
      fontSize: "0.8125rem",
      fontWeight: "600",
      color: "#0f172a",
      "&:hover": {
        borderColor: "#0173b6",
      },
    }),
    menu: (base: any) => ({
      ...base,
      zIndex: 60,
      borderRadius: "0.875rem",
      overflow: "hidden",
      boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)",
      border: "1px solid #e2e8f0",
      padding: "6px",
    }),
    option: (base: any, state: any) => ({
      ...base,
      backgroundColor: state.isSelected ? "#0173b6" : state.isFocused ? "#f0f7fc" : "#ffffff",
      color: state.isSelected ? "#ffffff" : "#1e293b",
      fontWeight: state.isSelected ? "700" : "600",
      borderRadius: "0.5rem",
      cursor: "pointer",
      padding: "8px 12px",
      fontSize: "0.8125rem",
    }),
    singleValue: (base: any) => ({
      ...base,
      color: "#0f172a",
      fontWeight: "600",
    }),
  };

  const myShiftSelectOptions = myJadwalList.map((item) => ({
    value: `${item.tanggal}|${item.shift_id || ""}`,
    label: `${item.tanggal} — Shift: ${item.nama_shift || "Libur / Off"}`,
  }));

  return (
    <div className="space-y-6">
      {/* Main Container Card */}
      <div className="bg-white rounded-2xl shadow-xs border border-slate-200/80 p-6 sm:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2.5">
              <div className="h-5 w-1.5 bg-primary rounded-full"></div>
              Jadwal Shift Satu Unit Kerja
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
              Lihat jadwal dinas rekan satu unit kerja dan ajukan permohonan pertukaran shift kerja.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <label className="text-xs font-bold text-slate-600">Pilih Bulan:</label>
            <input
              type="month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="px-3.5 py-2 bg-slate-50 border border-slate-200/90 rounded-xl text-xs font-bold text-slate-800 outline-none focus:ring-2 focus:ring-primary/20 focus:bg-white shadow-xs"
            />
          </div>
        </div>

        {/* Feedback Alert */}
        {successMessage && (
          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center gap-3 text-xs sm:text-sm font-bold">
            <CheckCircle2 size={18} className="text-emerald-600 shrink-0" />
            <p>{successMessage}</p>
          </div>
        )}

        {/* Tabel Data Jadwal Shift Rekan */}
        {isLoading ? (
          <div className="py-16 text-center text-slate-400">
            <RefreshCw className="animate-spin mx-auto mb-3 text-primary" size={26} />
            <p className="text-xs font-bold">Memuat jadwal rekan unit...</p>
          </div>
        ) : rekanJadwalList.length === 0 ? (
          <div className="py-16 text-center bg-slate-50/70 rounded-xl border border-dashed border-slate-200">
            <Users size={32} className="mx-auto mb-2 text-slate-300" />
            <p className="text-slate-500 text-xs font-bold">
              Tidak ada jadwal rekan yang ditemukan pada bulan ini.
            </p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-xl border border-slate-200/80 shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs whitespace-nowrap">
                <thead className="text-xs text-white uppercase bg-primary-dark font-semibold">
                  <tr>
                    <th scope="col" className="px-6 py-3.5">Tanggal</th>
                    <th scope="col" className="px-6 py-3.5">Nama Rekan</th>
                    <th scope="col" className="px-6 py-3.5">Shift Dinas</th>
                    <th scope="col" className="px-6 py-3.5 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {rekanJadwalList.map((jadwal, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-6 py-4 font-mono font-bold text-slate-800 tabular-nums">
                        {jadwal.tanggal}
                      </td>
                      <td className="px-6 py-4 font-bold text-slate-800">
                        {jadwal.nama_lengkap}
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-3 py-1 rounded-lg text-xs font-semibold bg-blue-50 text-primary border border-blue-200/70">
                          {jadwal.nama_shift || "Libur / Off"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <button
                          onClick={() => openModal(jadwal)}
                          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-white border border-slate-200 text-slate-700 hover:text-primary hover:border-primary/40 hover:bg-blue-50 text-xs font-bold rounded-xl transition-all shadow-xs active:scale-[0.98] min-h-[36px]"
                        >
                          <ArrowLeftRight size={13} />
                          <span>Tukar Shift</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Modal Form Tukar Shift */}
      {isModalOpen && selectedRekanJadwal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col border border-slate-200">
            {/* Header Modal */}
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/60">
              <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
                <ArrowLeftRight className="text-primary" size={18} />
                <span>Formulir Tukar Shift</span>
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg transition-colors"
                aria-label="Tutup"
              >
                <X size={20} />
              </button>
            </div>

            {/* Content Form */}
            <div className="p-6 overflow-y-auto max-h-[72vh] space-y-5">
              {errorMessage && (
                <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl flex items-start gap-2.5 text-xs font-bold">
                  <AlertCircle size={16} className="shrink-0 mt-0.5" />
                  <p>{errorMessage}</p>
                </div>
              )}

              <form id="tukarShiftFormModal" onSubmit={handleSubmit} className="space-y-5">
                {/* Info Rekan Box */}
                <div className="bg-blue-50/70 border border-blue-100 rounded-2xl p-4.5 space-y-1.5">
                  <p className="text-[11px] font-bold text-primary uppercase tracking-wider">
                    Jadwal Rekan yang Dituju
                  </p>
                  <p className="font-bold text-slate-900 text-sm">
                    {selectedRekanJadwal.nama_lengkap}
                  </p>
                  <div className="flex items-center gap-4 text-xs font-semibold text-slate-600 font-mono tabular-nums pt-1">
                    <span className="flex items-center gap-1.5">
                      <Calendar size={13} className="text-primary" />
                      {selectedRekanJadwal.tanggal}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Clock size={13} className="text-primary" />
                      {selectedRekanJadwal.nama_shift || "Libur / Off"}
                    </span>
                  </div>
                </div>

                {/* Dropdown Jadwal Pribadi dengan react-select */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">
                    Pilih Jadwal Anda yang Akan Ditukar <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative z-30">
                    <Select
                      options={myShiftSelectOptions}
                      value={myShiftSelectOptions.find(
                        (opt) => opt.value === mySelectedJadwalString
                      )}
                      onChange={(selected: any) =>
                        setMySelectedJadwalString(selected ? selected.value : "")
                      }
                      isClearable
                      placeholder="-- Pilih Jadwal Anda Bulan Ini --"
                      noOptionsMessage={() => "Tidak ada jadwal dinas pribadi pada bulan ini"}
                      styles={selectStyles}
                    />
                  </div>
                </div>

                {/* Alasan Textarea */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">
                    Alasan Tukar Shift <span className="text-rose-500">*</span>
                  </label>
                  <textarea
                    required
                    rows={3}
                    value={alasan}
                    onChange={(e) => setAlasan(e.target.value)}
                    placeholder="Contoh: Ada keperluan dinas pengganti / izin keluarga..."
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200/90 rounded-2xl font-medium text-slate-700 text-xs sm:text-sm focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all resize-none"
                  />
                </div>
              </form>
            </div>

            {/* Footer Modal */}
            <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors min-h-[38px]"
              >
                Batal
              </button>
              <button
                type="submit"
                form="tukarShiftFormModal"
                disabled={isSubmitting}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary hover:bg-primary-dark disabled:opacity-50 text-white text-xs font-bold rounded-xl transition-all shadow-xs active:scale-[0.98] min-h-[38px]"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 size={14} className="animate-spin" />
                    <span>Mengirim...</span>
                  </>
                ) : (
                  <>
                    <Send size={14} />
                    <span>Ajukan Tukar Shift</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
