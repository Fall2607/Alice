"use client";

import React from "react";
import Link from "next/link";
import {
  Heart,
  ShieldCheck,
  Users2,
  TrendingUp,
  MapPin,
  Sparkles,
  Award,
  ArrowRight,
  Quote,
} from "lucide-react";

export default function AboutCimahiSection() {
  const coreValues = [
    {
      num: "01",
      title: "Berintegritas",
      desc: "Menjunjung tinggi kejujuran medis, etika profesi luhur, dan transparansi pelayanan kesehatan di setiap tindakan.",
      icon: ShieldCheck,
      iconBg: "bg-[#EFF6FF] text-[#154C96] border-blue-200 group-hover:bg-[#154C96] group-hover:text-white",
      accentBadge: "bg-[#EFF6FF] text-[#154C96]",
    },
    {
      num: "02",
      title: "Bertanggung Jawab",
      desc: "Menempatkan keselamatan pasien sebagai amanah tertinggi dengan respon klinis yang tuntas, tepat, dan terukur.",
      icon: Heart,
      iconBg: "bg-[#E6F7F6] text-[#008f85] border-[#00A79C]/30 group-hover:bg-[#00A79C] group-hover:text-white",
      accentBadge: "bg-[#E6F7F6] text-[#008f85]",
    },
    {
      num: "03",
      title: "Berkolaboratif",
      desc: "Bekerja sinergis bersama tim medis lintas disiplin, keluarga pasien, dan komunitas warga Cimahi.",
      icon: Users2,
      iconBg: "bg-[#FFF7ED] text-[#d97706] border-orange-200 group-hover:bg-[#F69320] group-hover:text-white",
      accentBadge: "bg-[#FFF7ED] text-[#d97706]",
    },
    {
      num: "04",
      title: "Bertumbuh",
      desc: "Terus memperbarui teknologi kedokteran, kenyamanan fasilitas rawat, dan kompetensi tenaga kesehatan.",
      icon: TrendingUp,
      iconBg: "bg-emerald-50 text-emerald-700 border-emerald-200 group-hover:bg-emerald-600 group-hover:text-white",
      accentBadge: "bg-emerald-50 text-emerald-700",
    },
  ];

  return (
    <section className="relative bg-[#F0F5FA] border-t border-b border-slate-200/90 py-24 overflow-hidden">
      {/* Geometric Ribbon Divider Pemisah Tegas dari Section Jadwal Dokter */}
      <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#154C96] via-[#00A79C] to-[#F69320]"></div>

      {/* Decorative Background Blur */}
      <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-[#154C96]/5 blur-3xl pointer-events-none"></div>
      <div className="absolute -bottom-24 -left-24 w-96 h-96 rounded-full bg-[#00A79C]/8 blur-3xl pointer-events-none"></div>

      <div className="container mx-auto px-4 lg:px-8 relative z-10">
        <div className="grid lg:grid-cols-12 gap-10 lg:gap-12 items-center max-w-6xl mx-auto">
          {/* Kolom Kiri: Cerita Sejarah & Kehangatan Melong */}
          <div className="lg:col-span-6 space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-[#00A79C]/30 text-[#154C96] text-xs font-bold uppercase tracking-wider shadow-2xs">
              <Sparkles size={14} className="text-[#00A79C]" />
              <span>Akar Sejarah &amp; Dedikasi Lokal</span>
            </div>

            <h2 className="text-3xl sm:text-4xl font-black text-[#10162C] tracking-tight leading-[1.18]">
              Lahir dari Rumah,{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#154C96] to-[#00A79C]">
                Tumbuh Bersama Warga Cimahi
              </span>
            </h2>

            <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
              Kisah RSU Avisena berawal dari rumah pribadi <strong>dr. Lia</strong> di Jl. Melong, Cimahi Selatan.
              Berangkat dari kepedulian tulus terhadap kesehatan keluarga, pekerja, dan warga sekitar yang membutuhkan
              pertolongan medis, Avisena tumbuh menjadi rumah sakit umum modern dengan tetap menjaga kehangatan sebuah
              rumah.
            </p>

            {/* Motto Card */}
            <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-sm relative overflow-hidden">
              <div className="absolute top-0 left-0 w-1.5 h-full bg-[#00A79C]"></div>
              <div className="flex items-start gap-3.5 pl-2">
                <div className="w-10 h-10 rounded-xl bg-[#E6F7F6] text-[#008f85] flex items-center justify-center shrink-0 mt-0.5">
                  <Quote size={20} />
                </div>
                <div className="space-y-1">
                  <p className="text-[11px] font-bold text-[#154C96] uppercase tracking-wider">Motto Pelayanan Kami</p>
                  <p className="text-base sm:text-lg font-black italic text-[#10162C]">
                    &ldquo;Melayani dengan Sepenuh Hati.&rdquo;
                  </p>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Bagi kami, setiap pasien yang hadir bukan sekadar pengunjung, melainkan <em>Tamu Mulia</em> dan
                    tetangga dekat kami sendiri.
                  </p>
                </div>
              </div>
            </div>

            {/* Footer Info & Link ke Halaman Tentang Kami */}
            <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-700 bg-white px-3 py-2 rounded-xl border border-slate-200/80 shadow-2xs">
                  <MapPin size={15} className="text-[#00A79C]" />
                  <span>Unit Induk Pertama Avisena</span>
                </div>
                <div className="flex items-center gap-2 text-xs font-bold text-slate-700 bg-white px-3 py-2 rounded-xl border border-slate-200/80 shadow-2xs">
                  <Award size={15} className="text-[#F69320]" />
                  <span>Akreditasi Paripurna KARS</span>
                </div>
              </div>

              <Link
                href="/tentang"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-[#154C96] hover:text-[#00A79C] transition-colors"
              >
                <span>Baca Sejarah Lengkap</span>
                <ArrowRight size={14} />
              </Link>
            </div>
          </div>

          {/* Kolom Kanan: 4 Nilai Utama Avisena (4B) dengan Badge & Ikon Kontras Tinggi */}
          <div className="lg:col-span-6">
            <div className="bg-white rounded-[32px] p-6 sm:p-8 border border-slate-200/90 shadow-xl space-y-6 relative overflow-hidden">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div>
                  <span className="inline-block px-3 py-1 rounded-full bg-[#EFF6FF] text-[#154C96] border border-blue-200 font-bold uppercase text-[10px] tracking-wider">
                    Core Values • 4B
                  </span>
                  <h3 className="text-xl font-black text-[#10162C] mt-1.5">4 Nilai Utama RSU Avisena</h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Prinsip dasar setiap dokter, perawat, dan staf dalam melayani Anda
                  </p>
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                {coreValues.map((val) => {
                  const Icon = val.icon;
                  return (
                    <div
                      key={val.title}
                      className="p-5 rounded-2xl bg-[#F8FAFC] border border-slate-200/80 hover:border-[#00A79C] hover:bg-white hover:shadow-md transition-all duration-300 space-y-3 group"
                    >
                      <div className="flex items-center justify-between">
                        {/* Icon Container dengan latar terang & ikon kontras tegas */}
                        <div
                          className={`w-11 h-11 rounded-2xl border flex items-center justify-center font-bold transition-all duration-300 shadow-2xs ${val.iconBg}`}
                        >
                          <Icon size={20} strokeWidth={2.2} />
                        </div>
                        <span
                          className={`font-mono text-xs font-black px-2.5 py-1 rounded-lg ${val.accentBadge}`}
                        >
                          {val.num}
                        </span>
                      </div>

                      <div>
                        <h4 className="text-sm font-black text-[#10162C] group-hover:text-[#154C96] transition-colors">
                          {val.title}
                        </h4>
                        <p className="text-xs text-slate-500 leading-relaxed mt-1">{val.desc}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
