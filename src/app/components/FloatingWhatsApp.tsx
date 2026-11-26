"use client";

import React, { useState } from "react";
import { X, PhoneCall } from "lucide-react";

// Ikon SVG Resmi WhatsApp
const WhatsAppIcon = ({ size = 24 }: { size?: number }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="currentColor"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
  >
    <path d="M12.031 2C6.508 2 2.023 6.485 2.023 12.008c0 1.765.46 3.489 1.334 5.01L2 22l5.122-1.343a9.97 9.97 0 0 0 4.909 1.294h.004c5.522 0 10.007-4.485 10.007-10.008C22.042 6.485 17.554 2 12.031 2Zm5.829 14.129c-.247.697-1.438 1.332-2.005 1.417-.514.077-1.186.11-1.916-.122-.442-.14-1.011-.328-1.741-.643-3.064-1.323-5.065-4.41-5.218-4.614-.153-.204-1.245-1.656-1.245-3.159 0-1.503.787-2.242 1.066-2.548.279-.306.609-.383.812-.383.203 0 .406.002.584.011.187.009.438-.071.685.523.254.612.863 2.108.939 2.261.076.153.127.331.025.535-.101.204-.152.331-.305.51-.152.178-.32.398-.457.535-.152.153-.311.319-.133.625.178.306.789 1.302 1.694 2.109 1.164 1.038 2.145 1.36 2.45 1.513.305.153.482.127.66-.077.178-.204.762-.892.965-1.198.203-.306.406-.255.685-.153.279.102 1.777.838 2.082.991.305.153.508.229.584.357.076.127.076.739-.171 1.436Z" />
  </svg>
);

export default function FloatingWhatsApp() {
  const [isOpen, setIsOpen] = useState(false);
  const waNumber = "6281220200170";
  const defaultMessage = encodeURIComponent(
    "Halo Admin RSU Avisena Cimahi, saya ingin menanyakan informasi layanan / pendaftaran pasien."
  );

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end font-sans">
      {/* Popover Bubble Card */}
      {isOpen && (
        <div className="mb-3 w-76 bg-white rounded-2xl shadow-2xl border border-slate-200/80 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-300">
          {/* Header Popover */}
          <div className="bg-[#154C96] p-3.5 text-white flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-full bg-white/15 flex items-center justify-center text-emerald-400 shrink-0">
                <WhatsAppIcon size={20} />
              </div>
              <div>
                <h4 className="text-xs font-bold leading-tight">Customer Care Avisena</h4>
                <p className="text-[10px] text-white/80 flex items-center gap-1 mt-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  Online • Siap Melayani
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-white/80 hover:text-white p-1 rounded-lg transition-colors cursor-pointer"
              aria-label="Tutup Chat"
            >
              <X size={16} />
            </button>
          </div>

          {/* Body Popover */}
          <div className="p-3.5 bg-slate-50 space-y-3 text-xs">
            <div className="bg-white p-3 rounded-xl border border-slate-200/70 shadow-2xs space-y-1">
              <p className="text-slate-500 font-semibold text-[10px] uppercase tracking-wider">
                RSU Avisena Cimahi
              </p>
              <p className="text-slate-800 font-medium leading-relaxed">
                Sampurasun Warga Cimahi! Ada yang bisa kami bantu seputar jadwal dokter, rawat inap, atau pendaftaran?
              </p>
            </div>

            <div className="space-y-1.5">
              <a
                href={`https://wa.me/${waNumber}?text=${defaultMessage}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full bg-[#25D366] hover:bg-[#1ebe5a] text-white py-2.5 px-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-xs active:scale-[0.98]"
              >
                <WhatsAppIcon size={16} />
                <span>Mulai Chat WhatsApp</span>
              </a>

              <a
                href="tel:0226000830"
                className="w-full bg-white hover:bg-slate-100 text-[#154C96] border border-slate-200 py-2 px-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all text-[11px]"
              >
                <PhoneCall size={13} />
                <span>IGD Darurat (022) 6000830</span>
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Main Trigger Button: Bulat Ringkas (w-12 h-12) dengan Logo WhatsApp Resmi */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        title="Chat WhatsApp RSU Avisena Cimahi"
        className="w-12 h-12 rounded-full bg-[#25D366] hover:bg-[#1ebe5a] text-white flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer border-2 border-white"
        aria-label="Chat WhatsApp RSU Avisena Cimahi"
      >
        <WhatsAppIcon size={24} />
      </button>
    </div>
  );
}
