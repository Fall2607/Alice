"use client";

import React, { useState } from "react";
import {
  Smartphone,
  MessageCircle,
  CalendarCheck,
  CheckCircle2,
  Clock,
  ArrowRight,
  ShieldCheck,
  FileText,
  UserCheck,
  Download,
  AlertCircle,
} from "lucide-react";

interface RegistrationSectionProps {
  onOpenBookingModal: (defaultTrack?: "umum" | "bpjs") => void;
}

export default function RegistrationSection({ onOpenBookingModal }: RegistrationSectionProps) {
  const [activeTab, setActiveTab] = useState<"bpjs" | "umum">("bpjs");

  const bpjsSteps = [
    {
      step: "01",
      title: "Buka Aplikasi Mobile JKN",
      desc: "Pastikan status kepesertaan BPJS aktif dan surat rujukan FKTP (Puskesmas/Klinik) telah terbit di sistem online.",
    },
    {
      step: "02",
      title: "Pilih Menu 'Pendaftaran Pelayanan'",
      desc: "Pilih Rujukan Tingkat Lanjut, lalu cari faskes tujuan: RSU Avisena Cimahi.",
    },
    {
      step: "03",
      title: "Pilih Poliklinik & Jadwal Dokter",
      desc: "Pendaftaran dapat dilakukan mulai H-30 s/d H-1 sebelum tanggal rencana kunjungan berobat.",
    },
    {
      step: "04",
      title: "Dapatkan Nomor & Check-In Mandiri",
      desc: "Tiba di RSU Avisena Jl. Melong 170 minimal 30 menit sebelum jam praktik untuk scan barcode di Anjungan Mandiri.",
    },
  ];

  const umumSteps = [
    {
      step: "01",
      title: "Pilih Dokter & Poliklinik",
      desc: "Tentukan dokter spesialis pilihan Anda dan periksa ketersediaan jadwal praktiknya.",
    },
    {
      step: "02",
      title: "Isi Formulir Reservasi Online / WA",
      desc: "Gunakan form reservasi di website ini atau kirim data via WhatsApp Customer Care RSU Avisena.",
    },
    {
      step: "03",
      title: "Verifikasi Kartu Asuransi / Umum",
      desc: "Tim admission kami akan memverifikasi klaim jaminan asuransi swasta rekanan Anda.",
    },
    {
      step: "04",
      title: "Langsung Menuju Ruang Tunggu",
      desc: "Datang sesuai estimasi jam yang dikonfirmasi, bebas antre berbelit di loket pendaftaran.",
    },
  ];

  return (
    <section id="alur-pendaftaran" className="py-20 bg-white relative overflow-hidden">
      <div className="container mx-auto px-4 lg:px-8">
        {/* Header Section */}
        <div className="text-center max-w-3xl mx-auto space-y-3 mb-12">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#154C96]/10 text-[#154C96] text-xs font-bold uppercase tracking-wider">
            <CalendarCheck size={14} className="text-[#00A79C]" />
            <span>Akses Cepat Pelayanan Pasien</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-[#10162C] tracking-tight">
            Alur Pendaftaran Pasien RSU Avisena
          </h2>
          <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
            Pilih jalur pendaftaran sesuai kebutuhan Anda. Kami mempermudah proses administrasi dengan sistem digital
            agar Anda dapat langsung fokus pada pemeriksaan kesehatan.
          </p>

          {/* DaisyUI Segmented Button Switcher */}
          <div className="inline-flex p-1 rounded-2xl bg-slate-100 border border-slate-200 mt-3">
            <button
              onClick={() => setActiveTab("bpjs")}
              className={`px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === "bpjs"
                  ? "bg-[#00A79C] text-white shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Smartphone size={16} />
              <span>Pasien BPJS Kesehatan (Mobile JKN)</span>
            </button>
            <button
              onClick={() => setActiveTab("umum")}
              className={`px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === "umum"
                  ? "bg-[#154C96] text-white shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <UserCheck size={16} />
              <span>Pasien Umum &amp; Asuransi Swasta</span>
            </button>
          </div>
        </div>

        {/* CONTENT DUAL CARD (TAMPIL SESUAI TAB ATAU COMPARISON VIEW) */}
        <div className="grid lg:grid-cols-12 gap-8 items-stretch max-w-6xl mx-auto">
          {/* Card 1: Jalur BPJS Kesehatan */}
          <div
            className={`lg:col-span-6 rounded-3xl p-6 sm:p-8 border transition-all duration-300 flex flex-col justify-between ${
              activeTab === "bpjs"
                ? "bg-gradient-to-br from-emerald-50/50 via-white to-white border-[#00A79C] ring-2 ring-[#00A79C]/20 shadow-xl"
                : "bg-white border-slate-200 opacity-75 hover:opacity-100"
            }`}
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="badge bg-[#00A79C] text-white font-bold text-[10px] uppercase tracking-wider py-2.5 px-3 border-0">
                  Jalur 1: BPJS Kesehatan
                </span>
                <span className="text-xs font-semibold text-[#00A79C] flex items-center gap-1 font-mono">
                  <Clock size={13} />
                  H-30 s/d H-1
                </span>
              </div>

              <h3 className="text-xl sm:text-2xl font-bold text-[#10162C] mb-2">
                Pendaftaran via Aplikasi Mobile JKN
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 mb-6">
                Bagi peserta BPJS Kesehatan rujukan FKTP. Tidak perlu antre subuh di rumah sakit, seluruh antrean poli
                dapat dipesan dari genggaman Anda.
              </p>

              {/* 4 Steps Checklist */}
              <div className="space-y-4">
                {bpjsSteps.map((item) => (
                  <div key={item.step} className="flex items-start gap-3.5">
                    <div className="w-8 h-8 rounded-xl bg-[#00A79C]/15 text-[#00A79C] font-mono font-black text-xs flex items-center justify-center shrink-0">
                      {item.step}
                    </div>
                    <div>
                      <h4 className="text-xs sm:text-sm font-bold text-slate-800">{item.title}</h4>
                      <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Action Bar BPJS */}
            <div className="pt-6 mt-6 border-t border-slate-100 space-y-3">
              <div className="bg-emerald-50/70 rounded-xl p-3 border border-emerald-200/60 flex items-center gap-2.5 text-xs text-emerald-800">
                <CheckCircle2 size={16} className="text-[#00A79C] shrink-0" />
                <span>Mesin Anjungan Mandiri (APM) tersedia di lobi utama RSU Avisena untuk cetak tiket cepat.</span>
              </div>

              <div className="flex flex-wrap gap-2.5">
                <a
                  href="https://play.google.com/store/apps/details?id=app.bpjs.mobile"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-sm flex-1 bg-[#00A79C] hover:bg-[#008f85] text-white border-0 font-bold rounded-xl gap-2"
                >
                  <Download size={14} />
                  <span>Buka Mobile JKN</span>
                </a>
                <button
                  onClick={() => onOpenBookingModal("bpjs")}
                  className="btn btn-sm btn-outline border-slate-300 text-slate-700 hover:bg-slate-100 font-bold rounded-xl"
                >
                  Panduan Lengkap
                </button>
              </div>
            </div>
          </div>

          {/* Card 2: Jalur Pasien Umum & Asuransi Swasta */}
          <div
            className={`lg:col-span-6 rounded-3xl p-6 sm:p-8 border transition-all duration-300 flex flex-col justify-between ${
              activeTab === "umum"
                ? "bg-gradient-to-br from-blue-50/50 via-white to-white border-[#154C96] ring-2 ring-[#154C96]/20 shadow-xl"
                : "bg-white border-slate-200 opacity-75 hover:opacity-100"
            }`}
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="badge bg-[#154C96] text-white font-bold text-[10px] uppercase tracking-wider py-2.5 px-3 border-0">
                  Jalur 2: Umum &amp; Asuransi
                </span>
                <span className="text-xs font-semibold text-[#F69320] flex items-center gap-1 font-mono">
                  <CheckCircle2 size={13} />
                  Bebas Antre Loket
                </span>
              </div>

              <h3 className="text-xl sm:text-2xl font-bold text-[#10162C] mb-2">
                Reservasi Online &amp; WhatsApp Care
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 mb-6">
                Layanan prioritas bagi pasien mandiri umum maupun pemegang asuransi komersial (AdMedika, Sinarmas, AIA,
                Prudential, dll).
              </p>

              {/* 4 Steps Checklist */}
              <div className="space-y-4">
                {umumSteps.map((item) => (
                  <div key={item.step} className="flex items-start gap-3.5">
                    <div className="w-8 h-8 rounded-xl bg-[#154C96]/15 text-[#154C96] font-mono font-black text-xs flex items-center justify-center shrink-0">
                      {item.step}
                    </div>
                    <div>
                      <h4 className="text-xs sm:text-sm font-bold text-slate-800">{item.title}</h4>
                      <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Action Bar Umum */}
            <div className="pt-6 mt-6 border-t border-slate-100 space-y-3">
              <div className="bg-blue-50/70 rounded-xl p-3 border border-blue-200/60 flex items-center gap-2.5 text-xs text-[#154C96]">
                <ShieldCheck size={16} className="text-[#154C96] shrink-0" />
                <span>Terhubung dengan lebih dari 25+ jaringan asuransi kesehatan nasional &amp; korporasi.</span>
              </div>

              <div className="flex flex-wrap gap-2.5">
                <button
                  onClick={() => onOpenBookingModal("umum")}
                  className="btn btn-sm flex-1 bg-[#F69320] hover:bg-[#e07f10] text-white border-0 font-bold rounded-xl gap-2 shadow-xs"
                >
                  <CalendarCheck size={14} />
                  <span>Isi Formulir Reservasi</span>
                </button>
                <a
                  href="https://wa.me/6281220200170?text=Halo%20Admin%20RSU%20Avisena%20Cimahi%2C%20saya%20ingin%20reservasi%20pasien%20umum%2Fasuransi"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-sm bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl gap-1.5"
                >
                  <MessageCircle size={14} />
                  <span>WhatsApp CS</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
