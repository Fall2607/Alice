"use client";

import React, { useState } from "react";
import {
  X,
  CalendarCheck,
  User,
  CreditCard,
  Phone,
  Stethoscope,
  Calendar,
  CheckCircle2,
  Building,
  AlertCircle,
  MessageCircle,
} from "lucide-react";

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTrack?: "umum" | "bpjs";
  selectedDoctorName?: string;
  selectedPoliName?: string;
}

export default function BookingModal({
  isOpen,
  onClose,
  defaultTrack = "umum",
  selectedDoctorName = "",
  selectedPoliName = "",
}: BookingModalProps) {
  const [track, setTrack] = useState<"umum" | "bpjs" | "asuransi">(
    defaultTrack === "bpjs" ? "bpjs" : "umum"
  );
  const [formData, setFormData] = useState({
    nama: "",
    nik: "",
    noWa: "",
    poli: selectedPoliName || "Poli Penyakit Dalam",
    dokter: selectedDoctorName || "",
    tanggal: new Date().toISOString().split("T")[0],
    catatan: "",
  });
  const [isSubmitted, setIsSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitted(true);
  };

  const handleReset = () => {
    setIsSubmitted(false);
    onClose();
  };

  const handleForwardWhatsApp = () => {
    const text = encodeURIComponent(
      `Halo Admin RSU Avisena Cimahi, saya telah mengisi formulir reservasi online:\n\n` +
        `• Nama Pasien: ${formData.nama}\n` +
        `• NIK/Kartu: ${formData.nik}\n` +
        `• Jalur: ${track.toUpperCase()}\n` +
        `• Poliklinik: ${formData.poli}\n` +
        `• Tanggal Kunjungan: ${formData.tanggal}\n` +
        `• No WhatsApp: ${formData.noWa}\n` +
        `• Catatan: ${formData.catatan || "-"}\n\nMohon konfirmasi jadwal dan nomor estimasi antrean. Terima kasih!`
    );
    window.open(`https://wa.me/6281220200170?text=${text}`, "_blank");
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 font-sans animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-xl w-full border border-slate-200 shadow-2xl overflow-hidden my-8">
        {/* Header Modal */}
        <div className="bg-[#154C96] p-6 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 text-white/80 hover:text-white p-1 rounded-xl hover:bg-white/10 transition-colors cursor-pointer"
            aria-label="Tutup"
          >
            <X size={20} />
          </button>
          <div className="flex items-center gap-2 mb-2">
            <span className="badge badge-sm bg-[#00A79C] text-white border-0 font-bold uppercase text-[9px] px-2.5">
              RSU Avisena Cimahi
            </span>
            <span className="text-xs text-white/80">• Reservasi Rawat Jalan</span>
          </div>
          <h3 className="text-xl font-black text-white tracking-tight">Formulir Janji Temu Poliklinik</h3>
          <p className="text-xs text-white/80 mt-1">
            Kemudahan akses berobat tanpa antre berbelit. Konfirmasi nomor antrean akan dikirim ke WhatsApp Anda.
          </p>
        </div>

        {/* Modal Body */}
        {isSubmitted ? (
          <div className="p-8 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle2 size={36} />
            </div>
            <h4 className="text-xl font-bold text-slate-800">Reservasi Berhasil Diajukan!</h4>
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-left text-xs space-y-2 max-w-md mx-auto font-mono">
              <div className="flex justify-between">
                <span className="text-slate-400">Nama Pasien:</span>
                <span className="font-bold text-slate-800">{formData.nama}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Jalur Pembayaran:</span>
                <span className="font-bold text-[#154C96] uppercase">{track}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Poliklinik Tujuan:</span>
                <span className="font-bold text-slate-800">{formData.poli}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Tanggal Kunjungan:</span>
                <span className="font-bold text-emerald-600">{formData.tanggal}</span>
              </div>
            </div>

            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Untuk respon cepat konfirmasi dokter dan nomor antrean, Anda dapat langsung menghubungkan data ini ke
              WhatsApp Customer Care Avisena.
            </p>

            <div className="flex flex-col sm:flex-row gap-2 pt-2">
              <button
                onClick={handleForwardWhatsApp}
                className="btn btn-sm bg-[#00A79C] hover:bg-[#008f85] text-white flex-1 font-bold rounded-xl gap-2 py-2.5"
              >
                <MessageCircle size={15} />
                <span>Kirim ke WhatsApp CS</span>
              </button>
              <button
                onClick={handleReset}
                className="btn btn-sm btn-ghost text-slate-600 hover:bg-slate-100 font-bold rounded-xl"
              >
                Selesai / Tutup
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {/* Pilihan Jalur Pembayaran (3 Tabs) */}
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
                Pilih Jalur Pasien
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setTrack("umum")}
                  className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all ${
                    track === "umum"
                      ? "bg-[#154C96] text-white border-[#154C96] shadow-xs"
                      : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                  }`}
                >
                  Pasien Umum
                </button>
                <button
                  type="button"
                  onClick={() => setTrack("bpjs")}
                  className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all ${
                    track === "bpjs"
                      ? "bg-[#00A79C] text-white border-[#00A79C] shadow-xs"
                      : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                  }`}
                >
                  BPJS Kesehatan
                </button>
                <button
                  type="button"
                  onClick={() => setTrack("asuransi")}
                  className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all ${
                    track === "asuransi"
                      ? "bg-[#F69320] text-white border-[#F69320] shadow-xs"
                      : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                  }`}
                >
                  Asuransi Swasta
                </button>
              </div>
            </div>

            {/* Nama & NIK */}
            <div className="grid sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                  Nama Lengkap Pasien *
                </label>
                <div className="relative">
                  <User size={15} className="absolute left-3 top-3 text-slate-400" />
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Rina Melati"
                    value={formData.nama}
                    onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50/70 focus:bg-white focus:border-[#154C96] focus:ring-2 focus:ring-[#154C96]/20 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                  NIK (16 Digit) / No. BPJS *
                </label>
                <div className="relative">
                  <CreditCard size={15} className="absolute left-3 top-3 text-slate-400" />
                  <input
                    type="text"
                    required
                    placeholder="32770..."
                    value={formData.nik}
                    onChange={(e) => setFormData({ ...formData, nik: e.target.value })}
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50/70 focus:bg-white focus:border-[#154C96] focus:ring-2 focus:ring-[#154C96]/20 outline-none font-mono"
                  />
                </div>
              </div>
            </div>

            {/* No WhatsApp & Tanggal Kunjungan */}
            <div className="grid sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                  Nomor WhatsApp Aktif *
                </label>
                <div className="relative">
                  <Phone size={15} className="absolute left-3 top-3 text-slate-400" />
                  <input
                    type="tel"
                    required
                    placeholder="08123456789"
                    value={formData.noWa}
                    onChange={(e) => setFormData({ ...formData, noWa: e.target.value })}
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50/70 focus:bg-white focus:border-[#154C96] focus:ring-2 focus:ring-[#154C96]/20 outline-none font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                  Tanggal Rencana Berobat *
                </label>
                <div className="relative">
                  <Calendar size={15} className="absolute left-3 top-3 text-slate-400" />
                  <input
                    type="date"
                    required
                    value={formData.tanggal}
                    onChange={(e) => setFormData({ ...formData, tanggal: e.target.value })}
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50/70 focus:bg-white focus:border-[#154C96] focus:ring-2 focus:ring-[#154C96]/20 outline-none font-mono"
                  />
                </div>
              </div>
            </div>

            {/* Poliklinik & Dokter */}
            <div className="grid sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                  Poliklinik Tujuan
                </label>
                <select
                  value={formData.poli}
                  onChange={(e) => setFormData({ ...formData, poli: e.target.value })}
                  className="w-full py-2 px-3 text-xs rounded-xl border border-slate-200 bg-slate-50/70 focus:bg-white focus:border-[#154C96] outline-none"
                >
                  <option value="Poli Penyakit Dalam">Poli Penyakit Dalam</option>
                  <option value="Poli Anak">Poli Spesialis Anak</option>
                  <option value="Poli Kandungan & Kebidanan">Poli Kandungan &amp; Kebidanan (Obgyn)</option>
                  <option value="Poli Bedah Umum">Poli Bedah Umum</option>
                  <option value="Poli Rehabilitasi Medik">Poli Rehabilitasi Medik &amp; Fisioterapi</option>
                  <option value="Poli Gigi & Mulut">Poli Gigi &amp; Mulut</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                  Dokter Spesialis (Opsional)
                </label>
                <input
                  type="text"
                  placeholder="Nama dokter jika ada preferensi"
                  value={formData.dokter}
                  onChange={(e) => setFormData({ ...formData, dokter: e.target.value })}
                  className="w-full py-2 px-3 text-xs rounded-xl border border-slate-200 bg-slate-50/70 focus:bg-white focus:border-[#154C96] outline-none"
                />
              </div>
            </div>

            {/* Catatan / Keluhan */}
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                Keluhan / Gejala Singkat
              </label>
              <textarea
                rows={2}
                placeholder="Tuliskan keluhan atau riwayat kunjungan..."
                value={formData.catatan}
                onChange={(e) => setFormData({ ...formData, catatan: e.target.value })}
                className="w-full py-2 px-3 text-xs rounded-xl border border-slate-200 bg-slate-50/70 focus:bg-white focus:border-[#154C96] outline-none resize-none"
              ></textarea>
            </div>

            {/* Tombol Submit */}
            <div className="pt-2 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={onClose}
                className="btn btn-sm btn-ghost text-xs text-slate-500 hover:bg-slate-100 rounded-xl"
              >
                Batal
              </button>
              <button
                type="submit"
                className="btn btn-sm bg-[#F69320] hover:bg-[#e07f10] text-white font-bold rounded-xl px-5 text-xs uppercase tracking-wider shadow-sm"
              >
                Kirim Reservasi Sekarang
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
