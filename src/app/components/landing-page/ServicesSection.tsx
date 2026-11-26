"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import {
  ChevronRight,
  ShieldAlert,
  BedDouble,
  Accessibility,
  FlaskConical,
  Pill,
  HeartPulse,
  Sparkles,
  PhoneCall,
  Clock,
  CheckCircle2,
  Stethoscope,
  Ambulance,
  Activity,
  MessageCircle,
  Baby,
} from "lucide-react";

interface ServicesSectionProps {
  onSelectPoli?: (poli: string) => void;
  onOpenBookingModal?: (poliName?: string) => void;
}

const ROOM_TIERS = [
  {
    id: "vip",
    label: "Suite VIP",
    badge: "New Look • 1 Bed Privat",
    capacity: "1 Pasien (Privat Eksklusif)",
    desc: "Ruang perawatan eksklusif berdesain hangat seperti di rumah sendiri dengan privasi penuh serta area istirahat keluarga yang lega.",
    amenities: [
      "1 Tempat Tidur Elektrik Privat",
      "Sofa Bed & Meja Keluarga",
      "Smart TV 43” & WiFi Cepat",
      "Kulkas, Dispenser & Pantry",
      "Kamar Mandi Dalam + Water Heater",
      "Akses Nurse Call Siaga 24 Jam",
    ],
  },
  {
    id: "kelas1",
    label: "Kelas 1",
    badge: "2 Bed • Tenang & Nyaman",
    capacity: "2 Pasien per Kamar",
    desc: "Kamar rawat kapasitas dua pasien dengan tirai penyekat privasi penuh, pencahayaan alami yang tenang, dan sirkulasi udara sejuk.",
    amenities: [
      "2 Tempat Tidur Pasien",
      "Kursi & Sofa Penunggu",
      "Televisi LED & AC Sejuk",
      "Kamar Mandi Dalam + Water Heater",
      "Loker Penyimpanan Pribadi",
      "Akses Nurse Call Siaga 24 Jam",
    ],
  },
  {
    id: "kelas2",
    label: "Kelas 2",
    badge: "3–4 Bed • Bersih & Lega",
    capacity: "3 – 4 Pasien per Kamar",
    desc: "Ruang rawat bersih dan tertata rapi dengan pengawasan perawat intensif 24 jam serta fasilitas penunjang kenyamanan pasien.",
    amenities: [
      "3 – 4 Tempat Tidur Pasien",
      "AC & Televisi Ruangan",
      "Tirai Privasi Standar Medis",
      "Kursi Penunggu Pasien",
      "Kamar Mandi Dalam Bersih",
      "Akses Nurse Call Siaga 24 Jam",
    ],
  },
  {
    id: "kelas3",
    label: "Kelas 3",
    badge: "Standar KRIS • Terawat",
    capacity: "Kamar Rawat Bersama Terstandar",
    desc: "Fasilitas kamar rawat inap yang bersih, sejuk, dan manusiawi sesuai standar pelayanan rumah sakit modern bagi seluruh lapisan masyarakat.",
    amenities: [
      "Tempat Tidur Medis Ergonomis",
      "Ruangan Ber-AC & Sirkulasi Udara Baik",
      "Tirai Pembatas Antar Tempat Tidur",
      "Kamar Mandi Dalam Aksesibel",
      "Nakas Penyimpanan Pasien",
      "Perawatan Medis Penuh Empati 24 Jam",
    ],
  },
] as const;

export default function ServicesSection({
  onSelectPoli,
  onOpenBookingModal,
}: ServicesSectionProps) {
  const [selectedRoomTier, setSelectedRoomTier] = useState<string>("vip");

  const activeRoom = useMemo(
    () => ROOM_TIERS.find((r) => r.id === selectedRoomTier) || ROOM_TIERS[0],
    [selectedRoomTier]
  );

  const handleJumpToDoctorPoli = (serviceTitle?: string) => {
    if (serviceTitle && onSelectPoli) {
      onSelectPoli(serviceTitle);
    } else {
      const el = document.getElementById("jadwal-dokter");
      if (el) el.scrollIntoView({ behavior: "smooth" });
    }
  };

  // 4 Unit Instalasi Medis & Penunjang 24 Jam (Murni Fasilitas RS, bebas redundansi dengan daftar Poliklinik)
  const hospitalInstallations = [
    {
      title: "Kamar Bersalin (VK), Operasi (OK) & Perinatologi",
      badge: "Ibu, Bayi & Bedah",
      ribbon: "from-[#00A79C] via-teal-400 to-[#154C96]",
      icon: Baby,
      iconStyle: "bg-[#E6F7F6] text-[#008f85] border-[#00A79C]/25 group-hover:bg-[#00A79C] group-hover:text-white",
      badgeStyle: "bg-[#E6F7F6] text-[#00857c] border-[#00A79C]/20",
      checkColor: "text-[#00A79C]",
      desc: "Fasilitas kamar bersalin yang tenang dan steril, instalasi bedah sentral modern, serta ruang perawatan intensif bayi baru lahir (Perinatologi).",
      points: [
        "Persalinan Normal & Operasi Caesar (SC) Siaga",
        "Instalasi Kamar Operasi (OK) Steril & Modern",
        "Ruang Perinatologi & Inkubator Perawatan Bayi",
      ],
      footerLabel: "Siaga Persalinan & Tindakan 24 Jam",
      is24Hours: true,
      actionLabel: "Dokter Obgyn & Anak",
      onAction: () => handleJumpToDoctorPoli("Obgyn"),
    },
    {
      title: "Rehabilitasi Medik, Fisioterapi & Hemodialisa",
      badge: "Pemulihan & Terapi",
      ribbon: "from-[#154C96] via-sky-500 to-[#00A79C]",
      icon: Accessibility,
      iconStyle: "bg-[#EFF6FF] text-[#154C96] border-blue-200 group-hover:bg-[#154C96] group-hover:text-white",
      badgeStyle: "bg-[#EFF6FF] text-[#154C96] border-blue-200",
      checkColor: "text-[#154C96]",
      desc: "Unit pemulihan fungsi gerak terpadu bersama dokter Sp.KFR dan fisioterapis ahli, serta unit layanan cuci darah (Hemodialisa) yang nyaman.",
      points: [
        "Fisioterapi Pasca Stroke, Cedera & Nyeri Sendi",
        "Terapi Wicara & Tumbuh Kembang Anak",
        "Unit Hemodialisa (Cuci Darah) Terjadwal",
      ],
      footerLabel: "Senin – Sabtu (Terjadwal)",
      is24Hours: false,
      actionLabel: "Jadwal Rehab Medik",
      onAction: () => handleJumpToDoctorPoli("Rehabilitasi Medik"),
    },
    {
      title: "Laboratorium Klinik, Radiologi Digital & MCU",
      badge: "Diagnostik 24 Jam",
      ribbon: "from-[#154C96] via-[#00A79C] to-emerald-400",
      icon: FlaskConical,
      iconStyle: "bg-[#EFF6FF] text-[#154C96] border-blue-200 group-hover:bg-[#154C96] group-hover:text-white",
      badgeStyle: "bg-[#EFF6FF] text-[#154C96] border-blue-200",
      checkColor: "text-[#154C96]",
      desc: "Pemeriksaan penunjang medis berakurasi tinggi untuk membantu penegakan diagnosis dokter secara cepat, akurat, dan terintegrasi.",
      points: [
        "Rontgen Digital (DR) & USG 4 Dimensi Kehamilan",
        "Laboratorium Patologi Klinik & Cek Darah 24 Jam",
        "Paket Medical Check-Up (MCU) Mandiri & Korporasi",
      ],
      footerLabel: "Siaga 24 Jam Penuh",
      is24Hours: true,
      actionLabel: "Daftar Medical Check-Up",
      onAction: () => onOpenBookingModal?.("Poli Penyakit Dalam"),
    },
    {
      title: "Instalasi Farmasi & Apotek Siaga 24 Jam",
      badge: "Obat Resmi BPOM",
      ribbon: "from-[#F69320] via-amber-400 to-[#00A79C]",
      icon: Pill,
      iconStyle: "bg-[#FFF7ED] text-[#d97706] border-orange-200 group-hover:bg-[#F69320] group-hover:text-white",
      badgeStyle: "bg-[#FFF7ED] text-[#c26a0c] border-orange-200",
      checkColor: "text-[#F69320]",
      desc: "Menjamin ketersediaan obat-obatan orisinal, alat kesehatan, dan peracikan resep higienis dengan edukasi dosis langsung oleh apoteker.",
      points: [
        "Pelayanan Resep Rawat Jalan, Inap & IGD 24 Jam",
        "Konseling Informasi & Keamanan Dosis Obat",
        "Melayani Farmasi Pasien Umum, Asuransi & BPJS",
      ],
      footerLabel: "Buka 24 Jam Non-Stop",
      is24Hours: true,
      actionLabel: "Tanya Ketersediaan Obat",
      onAction: () =>
        window.open(
          "https://wa.me/6281220200170?text=Halo%20Instalasi%20Farmasi%20RSU%20Avisena%20Cimahi%2C%20saya%20ingin%20menanyakan%20informasi%20obat",
          "_blank"
        ),
    },
  ];

  return (
    <section
      id="layanan"
      className="py-24 bg-[#F4F7FA] border-y border-slate-200/80 relative overflow-hidden"
    >
      {/* Subtle Ambient Background Accents */}
      <div className="absolute top-20 left-0 -ml-32 w-96 h-96 rounded-full bg-[#154C96]/5 blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-20 right-0 -mr-32 w-96 h-96 rounded-full bg-[#00A79C]/8 blur-3xl pointer-events-none"></div>

      <div className="container mx-auto px-4 lg:px-8 relative z-10">
        {/* SECTION HEADER */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-14">
          <div className="max-w-2xl space-y-3">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-[#00A79C]/30 text-[#154C96] text-xs font-bold uppercase tracking-wider shadow-2xs">
              <HeartPulse size={14} className="text-[#00A79C]" />
              <span>Instalasi &amp; Fasilitas Medis RSU Avisena Cimahi</span>
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-[40px] font-black text-[#10162C] tracking-tight leading-[1.15]">
              Fasilitas Rumah Sakit Modern{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#154C96] to-[#00A79C]">
                yang Hangat &amp; Siaga 24 Jam
              </span>
            </h2>
            <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
              Dirancang khusus untuk memberikan rasa tenang bagi pasien dan keluarga—mulai dari penanganan darurat,
              kamar rawat inap berkonsep <em>homey</em>, hingga instalasi medis terpadu di Jl. Melong No. 170 Cimahi.
            </p>
          </div>

          {/* Quick Summary Stats */}
          <div className="flex items-center gap-3 sm:gap-4 bg-white p-3.5 rounded-2xl border border-slate-200/90 shadow-xs shrink-0 self-start lg:self-end">
            <div className="px-3 border-r border-slate-100">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Gawat Darurat</p>
              <p className="text-base font-black text-[#D92D20] font-mono tabular-nums">IGD 24 Jam</p>
            </div>
            <div className="px-3 border-r border-slate-100">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Rawat Inap</p>
              <p className="text-base font-black text-[#00A79C]">New Look</p>
            </div>
            <div className="px-2">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Penunjang</p>
              <p className="text-base font-black text-[#154C96] font-mono tabular-nums">Siaga 24/7</p>
            </div>
          </div>
        </div>

        {/* =========================================================================
            BLOK 1: IGD 24 JAM & AMBULANCE SIAGA (FULL-WIDTH COMMAND BANNER)
           ========================================================================= */}
        <div className="rounded-[28px] bg-gradient-to-br from-[#10162C] via-[#154C96] to-[#0c3163] text-white p-6 sm:p-8 lg:p-10 shadow-xl relative overflow-hidden border border-[#154C96] mb-8">
          <div className="absolute -right-12 -top-12 w-72 h-72 rounded-full bg-[#00A79C]/15 blur-2xl pointer-events-none"></div>
          <div className="absolute right-8 bottom-4 opacity-10 pointer-events-none hidden lg:block">
            <Activity size={180} strokeWidth={1.2} />
          </div>

          <div className="relative z-10 grid lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-7 space-y-4">
              <div className="flex flex-wrap items-center gap-2.5">
                <div className="inline-flex items-center gap-2 bg-[#D92D20] text-white px-3.5 py-1.5 rounded-full text-xs font-bold tracking-wide shadow-sm">
                  <span className="w-2 h-2 rounded-full bg-white animate-ping"></span>
                  <span>SIAGA GAWAT DARURAT 24 JAM</span>
                </div>
                <span className="text-xs font-mono text-sky-200 bg-white/10 px-3 py-1 rounded-full backdrop-blur-xs">
                  Unit Trauma &amp; Ambulance RSU Avisena Cimahi
                </span>
              </div>

              <h3 className="text-2xl sm:text-3xl font-black tracking-tight text-white leading-snug">
                IGD 24 Jam &amp; Layanan Jemput Ambulance Cepat
              </h3>
              <p className="text-white/85 text-xs sm:text-sm leading-relaxed max-w-2xl">
                Penanganan kegawatdaruratan medis tanpa tunda dengan sistem triase responsif, didukung dokter jaga
                bersertifikat kegawatdaruratan (ATLS/ACLS) serta armada ambulance siaga penuh bagi warga Cimahi.
              </p>

              <div className="flex flex-wrap items-center gap-3 pt-2">
                <a
                  href="tel:0226000830"
                  className="btn min-h-[44px] bg-[#D92D20] hover:bg-[#b8251a] text-white font-bold px-6 rounded-full border-0 shadow-lg hover:scale-105 active:scale-95 transition-all gap-2 text-xs uppercase tracking-wider"
                >
                  <PhoneCall size={16} />
                  <span>Panggil IGD: (022) 6000830</span>
                </a>
                <a
                  href="https://wa.me/6281220200170?text=Halo%20RSU%20Avisena%20Cimahi%2C%20saya%20membutuhkan%20informasi%20layanan%20IGD%2FAmbulance"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn min-h-[44px] bg-white/15 hover:bg-white/25 text-white border border-white/25 font-bold px-5 rounded-full text-xs gap-2"
                >
                  <MessageCircle size={15} />
                  <span>Hubungi via WhatsApp</span>
                </a>
              </div>
            </div>

            <div className="lg:col-span-5 grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-1 gap-3">
              <div className="bg-white/10 backdrop-blur-xs border border-white/15 rounded-2xl p-4 flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-emerald-400/20 text-emerald-300 flex items-center justify-center shrink-0">
                  <Clock size={20} />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">Triase Cepat &lt; 5 Menit</h4>
                  <p className="text-[11px] text-white/75 mt-0.5">
                    Observasi dan tindakan penyelamatan instan begitu pasien tiba di IGD.
                  </p>
                </div>
              </div>

              <div className="bg-white/10 backdrop-blur-xs border border-white/15 rounded-2xl p-4 flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-amber-400/20 text-amber-300 flex items-center justify-center shrink-0">
                  <Ambulance size={20} />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">Armada Ambulance Siap Jemput</h4>
                  <p className="text-[11px] text-white/75 mt-0.5">
                    Dilengkapi oksigen sentral, defibrilator, monitor vital, dan tenaga medis pendamping.
                  </p>
                </div>
              </div>

              <div className="bg-white/10 backdrop-blur-xs border border-white/15 rounded-2xl p-4 flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-sky-400/20 text-sky-300 flex items-center justify-center shrink-0">
                  <ShieldAlert size={20} />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">Melayani Seluruh Pasien</h4>
                  <p className="text-[11px] text-white/75 mt-0.5">
                    Penanganan darurat berlaku bagi pasien Umum, Asuransi Swasta, maupun BPJS.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* =========================================================================
            BLOK 2: RAWAT INAP 'NEW LOOK' (FULL-WIDTH LARGE SHOWCASE 12 KOLOM)
           ========================================================================= */}
        <div className="rounded-[32px] bg-white border border-slate-200/90 shadow-lg overflow-hidden mb-8">
          <div className="grid lg:grid-cols-12 items-stretch">
            {/* Sisi Kiri (6 Kolom): Visual Kamar Rawat Inap Besar */}
            <div className="lg:col-span-6 relative min-h-[320px] sm:min-h-[380px] lg:min-h-[440px] bg-slate-100 overflow-hidden group">
              <Image
                src="/img/banner/banner-layanan.jpg"
                alt="Fasilitas Kamar Rawat Inap New Look RSU Avisena Cimahi"
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-700"
                sizes="(max-width: 1024px) 100vw, 650px"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#10162C]/85 via-[#10162C]/25 to-transparent"></div>

              {/* Top Badges on Photo */}
              <div className="absolute top-5 left-5 right-5 flex items-center justify-between gap-2">
                <span className="inline-flex items-center gap-1.5 bg-[#00A79C] text-white font-bold text-xs uppercase tracking-wider py-2 px-4 rounded-full shadow-md">
                  <Sparkles size={13} />
                  <span>Rawat Inap &lsquo;New Look&rsquo;</span>
                </span>
                <span className="bg-black/65 text-white text-[10px] font-mono px-3 py-1 rounded-lg backdrop-blur-xs">
                  Foto Kamar: 800×550px
                </span>
              </div>

              {/* Bottom Caption on Photo */}
              <div className="absolute bottom-5 left-5 right-5 bg-white/95 backdrop-blur-md rounded-2xl p-4 border border-white/60 shadow-lg flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl bg-[#154C96] text-white flex items-center justify-center shrink-0">
                    <BedDouble size={22} />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-[#00A79C]">
                      Suasana Pemulihan Terbaik
                    </p>
                    <h4 className="text-sm sm:text-base font-black text-[#10162C]">
                      Desain Kamar Hangat, Tenang &amp; Homey
                    </h4>
                  </div>
                </div>
                <span className="hidden sm:inline-block text-xs font-mono font-bold text-[#154C96] bg-[#EFF6FF] px-3 py-1.5 rounded-xl border border-blue-200/60 shrink-0">
                  {activeRoom.label}
                </span>
              </div>
            </div>

            {/* Sisi Kanan (6 Kolom): Interactive Room Class Explorer */}
            <div className="lg:col-span-6 p-6 sm:p-8 lg:p-10 flex flex-col justify-between space-y-6">
              <div className="space-y-5">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-[#00A79C]">
                    Pilihan Kelas Kamar Rawat Inap
                  </span>
                  <h3 className="text-2xl sm:text-3xl font-black text-[#10162C] tracking-tight mt-1">
                    Kenyamanan Istirahat Seperti di Rumah Sendiri
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 mt-1.5 leading-relaxed">
                    Klik tab kelas kamar di bawah untuk melihat fasilitas lengkap yang kami sediakan bagi kenyamanan
                    pasien dan keluarga pendamping.
                  </p>
                </div>

                {/* 4 Room Tier Tabs (Suite VIP, Kelas 1, Kelas 2, Kelas 3) */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-[#F4F7FA] p-1.5 rounded-2xl border border-slate-200/80">
                  {ROOM_TIERS.map((tier) => {
                    const isActive = selectedRoomTier === tier.id;
                    return (
                      <button
                        key={tier.id}
                        type="button"
                        onClick={() => setSelectedRoomTier(tier.id)}
                        className={`py-2.5 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                          isActive
                            ? "bg-[#154C96] text-white shadow-sm"
                            : "text-slate-600 hover:text-[#10162C] hover:bg-white/60"
                        }`}
                      >
                        {tier.label}
                      </button>
                    );
                  })}
                </div>

                {/* Active Room Tier Detail Card */}
                <div className="bg-[#F7F9FB] rounded-2xl p-5 border border-slate-200/90 space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-200/70">
                    <div>
                      <h4 className="text-lg font-black text-[#10162C]">{activeRoom.label}</h4>
                      <p className="text-xs text-slate-500 font-medium">{activeRoom.capacity}</p>
                    </div>
                    <span className="text-xs font-bold text-[#00857c] bg-[#E6F7F6] border border-[#00A79C]/25 px-3 py-1 rounded-full">
                      {activeRoom.badge}
                    </span>
                  </div>

                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">{activeRoom.desc}</p>

                  {/* 2-Column Amenities List */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                    {activeRoom.amenities.map((item) => (
                      <div
                        key={item}
                        className="flex items-center gap-2 bg-white px-3 py-2 rounded-xl border border-slate-200/70 text-xs font-semibold text-slate-700 shadow-2xs"
                      >
                        <CheckCircle2 size={14} className="text-[#00A79C] shrink-0" />
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Bottom CTA Rawat Inap */}
              <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <span className="text-xs text-slate-500 font-medium">
                  Melayani pasien Umum, Asuransi Swasta &amp; BPJS Kesehatan
                </span>
                <a
                  href="https://wa.me/6281220200170?text=Halo%20Admin%20RSU%20Avisena%20Cimahi%2C%20saya%20ingin%20menanyakan%20informasi%20ketersediaan%20kamar%20rawat%20inap"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-sm min-h-[40px] bg-[#00A79C] hover:bg-[#008f85] text-white border-0 font-bold px-5 rounded-xl gap-2 text-xs shadow-xs"
                >
                  <MessageCircle size={15} />
                  <span>Tanya Ketersediaan Kamar</span>
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* =========================================================================
            BLOK 3: 4 UNIT INSTALASI MEDIS & PENUNJANG RUMAH SAKIT (GRID 2x2)
           ========================================================================= */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {hospitalInstallations.map((unit) => {
            const IconComp = unit.icon;
            return (
              <div
                key={unit.title}
                className="rounded-3xl bg-white border border-slate-200/90 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden flex flex-col justify-between group"
              >
                <div>
                  <div className={`h-1.5 w-full bg-gradient-to-r ${unit.ribbon}`}></div>
                  <div className="p-6 sm:p-7 space-y-4">
                    <div className="flex items-center justify-between gap-3">
                      <div
                        className={`w-12 h-12 rounded-2xl border flex items-center justify-center font-bold transition-colors shrink-0 ${unit.iconStyle}`}
                      >
                        <IconComp size={24} />
                      </div>
                      <span
                        className={`px-3 py-1 rounded-full font-bold text-[10px] uppercase tracking-wider border ${unit.badgeStyle}`}
                      >
                        {unit.badge}
                      </span>
                    </div>

                    <div>
                      <h4 className="text-lg sm:text-xl font-black text-[#10162C] group-hover:text-[#154C96] transition-colors">
                        {unit.title}
                      </h4>
                      <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mt-1.5">{unit.desc}</p>
                    </div>

                    <div className="space-y-2 pt-1">
                      {unit.points.map((point) => (
                        <div key={point} className="flex items-center gap-2.5 text-xs text-slate-700 font-semibold">
                          <CheckCircle2 size={14} className={`${unit.checkColor} shrink-0`} />
                          <span>{point}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="px-6 sm:px-7 py-4 bg-[#F7F9FB] border-t border-slate-100 flex items-center justify-between text-xs">
                  <span
                    className={`font-semibold flex items-center gap-1.5 ${
                      unit.is24Hours ? "text-emerald-600" : "text-slate-500"
                    }`}
                  >
                    {unit.is24Hours && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>}
                    {unit.footerLabel}
                  </span>
                  <button
                    type="button"
                    onClick={unit.onAction}
                    className="font-bold text-[#154C96] hover:text-[#00A79C] hover:underline inline-flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    <span>{unit.actionLabel}</span>
                    <ChevronRight size={13} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Bridge Callout menuju Jadwal Dokter & Poliklinik Rawat Jalan */}
        <div className="mt-10 bg-white rounded-2xl p-4 sm:px-6 border border-slate-200/90 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3 text-center sm:text-left">
            <div className="w-10 h-10 rounded-xl bg-[#EFF6FF] text-[#154C96] border border-blue-200 hidden sm:flex items-center justify-center shrink-0">
              <Stethoscope size={20} />
            </div>
            <div>
              <h4 className="text-sm font-black text-[#10162C]">
                Mencari Poliklinik Spesialis Rawat Jalan &amp; Jam Praktik Dokter?
              </h4>
              <p className="text-xs text-slate-500">
                Jelajahi seluruh poliklinik spesialis beserta jadwal lengkap dokter kami pada bagian di bawah ini.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => handleJumpToDoctorPoli()}
            className="btn btn-sm min-h-[38px] bg-[#154C96] hover:bg-[#0f3870] text-white border-0 font-bold px-5 rounded-xl text-xs shrink-0 gap-1.5 cursor-pointer"
          >
            <span>Pilih Poliklinik &amp; Dokter</span>
            <ChevronRight size={14} />
          </button>
        </div>
      </div>
    </section>
  );
}
