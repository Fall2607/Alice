"use client";

import { useRef, useEffect } from "react";
import Image from "next/image";
import {
  Search,
  PhoneCall,
  CalendarCheck,
  ChevronRight,
  Sparkles,
  Stethoscope,
} from "lucide-react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";

if (typeof window !== "undefined") {
  gsap.registerPlugin(useGSAP);
}

interface HeroSectionProps {
  onSearchChange?: (term: string) => void;
  onSelectPoli?: (poli: string) => void;
  onOpenBookingModal?: () => void;
}

export default function HeroSection({
  onSearchChange,
  onSelectPoli,
  onOpenBookingModal,
}: HeroSectionProps) {
  const heroRef = useRef<HTMLDivElement>(null);
  const parallaxBgRef = useRef<HTMLDivElement>(null);

  // GSAP Smooth Entrance Animation
  useGSAP(
    () => {
      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

      tl.from(".hero-badge", { y: -16, opacity: 0, duration: 0.55 })
        .from(".hero-title", { y: 28, opacity: 0, duration: 0.7 }, "-=0.3")
        .from(".hero-desc", { y: 20, opacity: 0, duration: 0.6 }, "-=0.4")
        .from(".hero-cta", { y: 16, opacity: 0, duration: 0.5 }, "-=0.3")
        .from(".hero-quicksearch", { y: 24, opacity: 0, duration: 0.65 }, "-=0.3");
    },
    { scope: heroRef }
  );

  // Clear Parallax Scroll Effect pada Full-Screen Hero Image
  useEffect(() => {
    let ticking = false;

    const updateParallax = () => {
      if (parallaxBgRef.current) {
        const scrollY = window.scrollY;
        if (scrollY <= 1100) {
          const yOffset = scrollY * 0.38;
          parallaxBgRef.current.style.transform = `translate3d(0, ${yOffset}px, 0) scale(1.1)`;
        }
      }
      ticking = false;
    };

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(updateParallax);
        ticking = true;
      }
    };

    updateParallax();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const quickPills = [
    "Spesialis Anak",
    "Kandungan & Kebidanan",
    "Penyakit Dalam",
    "Bedah Umum",
    "Rehabilitasi Medik",
    "Poli Gigi",
  ];

  return (
    <section
      ref={heroRef}
      id="beranda"
      className="relative w-full min-h-screen flex flex-col justify-between overflow-hidden bg-[#10162C]"
    >
      {/* FULL-SCREEN CLEAR PARALLAX IMAGE LAYER */}
      <div
        ref={parallaxBgRef}
        className="absolute inset-0 w-full h-full will-change-transform pointer-events-none"
        style={{ transform: "translate3d(0, 0px, 0) scale(1.1)" }}
      >
        <Image
          src="/img/banner/banner-kami.jpg"
          alt="Gedung Pelayanan RSU Avisena Cimahi Jl. Melong No. 170"
          fill
          priority
          className="object-cover object-center brightness-[0.95] contrast-[1.03]"
          sizes="100vw"
        />
      </div>

      {/* Clear Editorial Gradient: Terang & jernih di sisi gambar gedung (kanan), teduh proporsional di area teks (kiri) & navbar atas */}
      <div className="absolute inset-0 bg-gradient-to-r from-[#10162C]/80 via-[#10162C]/45 to-transparent pointer-events-none"></div>
      <div className="absolute inset-0 bg-gradient-to-b from-black/45 via-transparent to-[#10162C]/75 pointer-events-none"></div>

      {/* MAIN HERO CONTENT (Dituliskan di Atas Gambar Full-Screen) */}
      <div className="container mx-auto px-4 lg:px-8 relative z-10 flex-grow flex items-center pt-32 pb-10">
        <div className="max-w-2xl lg:max-w-3xl space-y-6 text-center md:text-left">
          {/* Tag Big Idea Resmi */}
          <div className="hero-badge inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/15 backdrop-blur-md border border-white/30 text-white text-xs font-bold tracking-wide shadow-sm">
            <Sparkles size={14} className="text-[#5eead4]" />
            <span>Avisena, Tetangga Sehatmu</span>
            <span className="text-white/40">•</span>
            <span className="text-[#5eead4] font-semibold">RSU Avisena Cimahi</span>
          </div>

          {/* Headline Utama */}
          <h1 className="hero-title text-3xl sm:text-5xl lg:text-[56px] font-black text-white leading-[1.12] tracking-tight drop-shadow-md">
            Lebih Peduli, Lebih Dekat. <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#5eead4] via-[#2dd4bf] to-white">
              Tetangga Sehat Keluarga Anda
            </span>{" "}
            di Cimahi.
          </h1>

          {/* Deskripsi Hangat & Otentik */}
          <p className="hero-desc text-white/95 text-sm sm:text-base lg:text-lg leading-relaxed max-w-2xl mx-auto md:mx-0 font-normal drop-shadow-xs">
            Tumbuh dari rumah dr. Lia di Cimahi Selatan, RSU Avisena hadir melayani warga dan pekerja dengan sepenuh
            hati. Dilengkapi dokter spesialis berpengalaman, fasilitas rawat inap yang hangat, serta layanan IGD 24 Jam
            siaga respon cepat.
          </p>

          {/* Tombol Aksi Utama (Hero CTA) */}
          <div className="hero-cta flex flex-wrap items-center justify-center md:justify-start gap-3.5 pt-2">
            <button
              type="button"
              onClick={onOpenBookingModal}
              className="btn min-h-[48px] bg-[#F69320] hover:bg-[#e07f10] text-white font-bold px-7 rounded-full border-0 shadow-xl hover:shadow-2xl transition-all active:scale-95 text-xs sm:text-sm uppercase tracking-wider flex items-center gap-2 cursor-pointer"
            >
              <CalendarCheck size={18} />
              <span>Daftar Rawat Jalan</span>
            </button>

            <a
              href="#jadwal-dokter"
              className="btn min-h-[48px] bg-white/15 hover:bg-white/25 backdrop-blur-md text-white border border-white/40 hover:border-white font-bold px-6 rounded-full transition-all active:scale-95 text-xs sm:text-sm flex items-center gap-2"
            >
              <Stethoscope size={18} className="text-[#5eead4]" />
              <span>Cari Jadwal Dokter</span>
            </a>

            <a
              href="tel:0226000830"
              className="inline-flex items-center gap-2 text-xs font-bold text-white bg-black/30 hover:bg-black/45 backdrop-blur-md border border-white/25 px-4 py-3 rounded-full transition-colors"
              title="Panggilan Cepat Darurat"
            >
              <PhoneCall size={14} className="text-[#5eead4]" />
              <span className="font-mono tabular-nums">IGD: (022) 6000830</span>
            </a>
          </div>
        </div>
      </div>

      {/* QUICK SEARCH BAR TERINTEGRASI DI BAGIAN BAWAH LAYAR FULL-SCREEN HERO */}
      <div className="container mx-auto px-4 lg:px-8 relative z-20 pb-8 md:pb-10">
        <div className="hero-quicksearch bg-white/95 backdrop-blur-xl rounded-3xl p-4 sm:p-5 border border-white/60 shadow-2xl max-w-4xl mx-auto">
          <div className="flex flex-col md:flex-row items-center gap-3">
            {/* Input Search */}
            <div className="relative w-full flex-grow">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Search size={18} className="text-[#00A79C]" />
              </div>
              <input
                type="text"
                placeholder="Cari dokter spesialis atau layanan yang Anda butuhkan..."
                onChange={(e) => onSearchChange?.(e.target.value)}
                className="w-full pl-11 pr-4 py-3 rounded-2xl bg-[#F4F7FA] border border-slate-200/90 text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:bg-white focus:border-[#00A79C] focus:ring-2 focus:ring-[#00A79C]/20 transition-all outline-none"
              />
            </div>

            {/* Quick Action Button */}
            <a
              href="#jadwal-dokter"
              className="w-full md:w-auto bg-[#154C96] hover:bg-[#0f3870] text-white px-7 py-3 rounded-2xl font-bold text-xs uppercase tracking-wider transition-all active:scale-95 shrink-0 flex items-center justify-center gap-2 shadow-sm"
            >
              <span>Temukan Jadwal</span>
              <ChevronRight size={15} />
            </a>
          </div>

          {/* Quick Filter Chips */}
          <div className="flex items-center gap-2 flex-wrap pt-3 mt-3 border-t border-slate-200/70 text-xs">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mr-1">
              Poli Populer:
            </span>
            {quickPills.map((pill) => (
              <button
                key={pill}
                type="button"
                onClick={() => onSelectPoli?.(pill)}
                className="px-3 py-1 rounded-full text-[11px] font-semibold bg-[#E6F7F6] hover:bg-[#00A79C] text-[#007a72] hover:text-white transition-colors cursor-pointer border border-[#00A79C]/20"
              >
                {pill}
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
