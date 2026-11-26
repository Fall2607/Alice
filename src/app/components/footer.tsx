"use client";

import {
  Phone,
  Mail,
  MapPin,
  ChevronRight,
  Clock,
  Instagram,
  Facebook,
  Youtube,
  ExternalLink,
  ShieldAlert,
} from "lucide-react";
import Link from "next/link";
import AvisenaLogo from "./AvisenaLogo";

export default function Footer() {
  return (
    <footer className="bg-[#10162C] text-slate-300 font-sans border-t-4 border-[#00A79C]">
      {/* Top Footer Banner: Hotline Darurat 24 Jam */}
      <div className="bg-[#154C96] text-white py-4 border-b border-white/10">
        <div className="container mx-auto px-4 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-rose-600 flex items-center justify-center text-white shrink-0">
              <ShieldAlert size={16} />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-rose-200">
                Pusat Bantuan Gawat Darurat &amp; Ambulance 24 Jam
              </p>
              <p className="text-sm font-black font-mono tabular-nums">Hotline RSU Avisena: (022) 6000830</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <a
              href="tel:0226000830"
              className="btn btn-xs bg-[#D92D20] hover:bg-[#b8251a] text-white font-bold border-0 px-4 rounded-full"
            >
              Hubungi IGD Sekarang
            </a>
            <a
              href="https://wa.me/6281220200170?text=Halo%20Admin%20RSU%20Avisena%20Cimahi"
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-xs bg-emerald-600 hover:bg-emerald-700 text-white font-bold border-0 px-4 rounded-full"
            >
              WhatsApp Care
            </a>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10">
          {/* Kolom 1: Profil Cabang Cimahi (4 Kolom) */}
          <div className="lg:col-span-4 space-y-4">
            <Link href="/" className="inline-block">
              <AvisenaLogo variant="horizontal" colorMode="white" height={42} />
            </Link>

            <p className="text-xs text-slate-400 leading-relaxed max-w-sm">
              Rumah Sakit Umum Avisena Cabang Cimahi merupakan unit fasilitas kesehatan pertama Avisena Healthcare
              Group. Berkomitmen menjadi tetangga sehat terpercaya dengan pelayanan medis profesional, hangat, dan
              penuh empati.
            </p>

            <div className="pt-2 text-xs text-slate-400 space-y-1 font-mono">
              <p className="flex items-center gap-2">
                <Clock size={14} className="text-[#00A79C]" />
                <span>Pelayanan IGD &amp; Rawat Inap: 24 Jam</span>
              </p>
              <p className="flex items-center gap-2">
                <Clock size={14} className="text-[#F69320]" />
                <span>Poliklinik Rawat Jalan: Senin – Sabtu</span>
              </p>
            </div>

            {/* Social Icons */}
            <div className="flex items-center gap-3 pt-2">
              <a
                href="https://instagram.com/rsu_avisena"
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-lg bg-white/10 hover:bg-[#00A79C] text-white flex items-center justify-center transition-colors"
                aria-label="Instagram RSU Avisena"
              >
                <Instagram size={15} />
              </a>
              <a
                href="https://facebook.com/rsuavisena"
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-lg bg-white/10 hover:bg-[#154C96] text-white flex items-center justify-center transition-colors"
                aria-label="Facebook RSU Avisena"
              >
                <Facebook size={15} />
              </a>
              <a
                href="https://youtube.com/@rsuavisena"
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-lg bg-white/10 hover:bg-rose-600 text-white flex items-center justify-center transition-colors"
                aria-label="YouTube RSU Avisena"
              >
                <Youtube size={15} />
              </a>
            </div>
          </div>

          {/* Kolom 2: Tautan Cepat & Layanan (3 Kolom) */}
          <div className="lg:col-span-3 space-y-4">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider border-b border-white/10 pb-2">
              Navigasi Layanan
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/#jadwal-dokter" className="hover:text-[#00A79C] transition-colors flex items-center gap-1.5">
                  <ChevronRight size={12} className="text-[#00A79C]" />
                  <span>Jadwal Dokter Spesialis</span>
                </Link>
              </li>
              <li>
                <Link href="/#alur-pendaftaran" className="hover:text-[#00A79C] transition-colors flex items-center gap-1.5">
                  <ChevronRight size={12} className="text-[#00A79C]" />
                  <span>Alur Pasien BPJS (Mobile JKN)</span>
                </Link>
              </li>
              <li>
                <Link href="/#layanan" className="hover:text-[#00A79C] transition-colors flex items-center gap-1.5">
                  <ChevronRight size={12} className="text-[#00A79C]" />
                  <span>Rawat Inap VIP &amp; Kamar Pasien</span>
                </Link>
              </li>
              <li>
                <Link href="/#layanan" className="hover:text-[#00A79C] transition-colors flex items-center gap-1.5">
                  <ChevronRight size={12} className="text-[#00A79C]" />
                  <span>Rehabilitasi Medik &amp; Fisioterapi</span>
                </Link>
              </li>
              <li>
                <Link href="/tentang" className="hover:text-[#00A79C] transition-colors flex items-center gap-1.5">
                  <ChevronRight size={12} className="text-[#00A79C]" />
                  <span>Tentang Kami &amp; Sejarah Melong</span>
                </Link>
              </li>
              <li>
                <Link href="/karir" className="hover:text-[#00A79C] transition-colors flex items-center gap-1.5">
                  <ChevronRight size={12} className="text-[#00A79C]" />
                  <span>Karir &amp; Rekrutmen Tenaga Medis</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Kolom 3: Kontak & Peta Google Maps (5 Kolom) */}
          <div className="lg:col-span-5 space-y-4">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider border-b border-white/10 pb-2">
              Lokasi &amp; Kontak Resmi
            </h4>

            <div className="space-y-2.5 text-xs text-slate-300">
              <div className="flex items-start gap-2.5">
                <MapPin size={16} className="text-[#00A79C] shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-white">RSU Avisena Cimahi</p>
                  <p className="text-slate-400">
                    Jl. Melong No. 170, Kel. Melong, Kec. Cimahi Selatan, Kota Cimahi, Jawa Barat 40534
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2.5 font-mono">
                <Phone size={15} className="text-[#F69320] shrink-0" />
                <span>Telepon: (022) 6000830</span>
              </div>

              <div className="flex items-center gap-2.5 font-mono">
                <Mail size={15} className="text-sky-400 shrink-0" />
                <span>Email: rsavisena@gmail.com / cs@rsavisena.co.id</span>
              </div>
            </div>

            {/* Embed Peta Mini */}
            <div className="w-full h-36 rounded-2xl overflow-hidden border border-white/10 shadow-sm relative">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3960.999123888267!2d107.55335347474786!3d-6.92202009310896!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e68e5f22f772275%3A0xc3c97c0fc659e86c!2sRumah%20Sakit%20Umum%20Avisena!5e0!3m2!1sen!2sid!4v1724750614138!5m2!1sen!2sid"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen={false}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Peta Lokasi RSU Avisena Cimahi"
              ></iframe>
              <a
                href="https://maps.app.goo.gl/uX3L3b7wXzP2V7c96"
                target="_blank"
                rel="noopener noreferrer"
                className="absolute bottom-2 right-2 bg-white/90 hover:bg-white text-[#154C96] text-[10px] font-bold px-2.5 py-1 rounded-md shadow-xs flex items-center gap-1 backdrop-blur-xs"
              >
                <span>Buka di Google Maps</span>
                <ExternalLink size={10} />
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Bar: Copyright & Penanda Jaringan Endorsement (Guideline Bab 7.4) */}
        <div className="pt-8 mt-10 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-3 text-xs text-slate-500 text-center md:text-left">
          <p>
            &copy; {new Date().getFullYear()} <strong>RSU Avisena Cimahi</strong>. Seluruh Hak Cipta Dilindungi
            Undang-Undang.
          </p>

          <p className="text-[11px] text-slate-400">
            Bagian dari <strong className="text-white">Avisena Healthcare Group</strong> — Melayani juga di Pangalengan,
            Kuningan, Subang, dan Cikampek.
          </p>
        </div>
      </div>
    </footer>
  );
}
