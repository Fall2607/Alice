// File: app/components/Footer.tsx
"use client"; // Ditambahkan untuk memastikan impor modul berjalan benar

import { Phone, Mail, MapPin, ChevronRight } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export default function Footer() {
  return (
    <footer className="bg-primary-dark text-slate-300">
      <div className="container mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Kolom 1: Logo & Peta */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white mb-4">
              Kami Berlokasi
            </h3>
            <div className="w-full h-48 rounded-lg overflow-hidden">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3960.999123888267!2d107.55335347474786!3d-6.92202009310896!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e68e5f22f772275%3A0xc3c97c0fc659e86c!2sRumah%20Sakit%20Umum%20Avisena!5e0!3m2!1sen!2sid!4v1724750614138!5m2!1sen!2sid"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen={false}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Lokasi RSU Avisena di Google Maps"
              ></iframe>
            </div>
          </div>

          {/* Kolom 2: Tautan Cepat - DIPERBARUI */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">
              Tautan Cepat
            </h3>
            <div className="grid grid-cols-2 gap-x-4 text-sm">
              <ul className="space-y-2">
                <li>
                  <Link
                    href="/"
                    className="text-slate-400 hover:text-white transition-colors"
                  >
                    Beranda
                  </Link>
                </li>
                <li>
                  <Link
                    href="/layanan"
                    className="text-slate-400 hover:text-white transition-colors"
                  >
                    Layanan
                  </Link>
                </li>
                <li>
                  <Link
                    href="/dokter"
                    className="text-slate-400 hover:text-white transition-colors"
                  >
                    Dokter
                  </Link>
                </li>
              </ul>
              <ul className="space-y-2">
                <li>
                  <Link
                    href="/karir"
                    className="text-slate-400 hover:text-white transition-colors"
                  >
                    Karir
                  </Link>
                </li>
                <li>
                  <Link
                    href="/tentang"
                    className="text-slate-400 hover:text-white transition-colors"
                  >
                    Tentang
                  </Link>
                </li>
                <li>
                  <Link
                    href="/kontak"
                    className="text-slate-400 hover:text-white transition-colors"
                  >
                    Kontak
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          {/* Kolom 3: Hubungi Kami */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">
              Hubungi Kami
            </h3>
            <ul className="space-y-3 text-slate-400 text-sm">
              <li className="flex items-start gap-3">
                <MapPin
                  size={16}
                  className="mt-1 text-secondary flex-shrink-0"
                />
                <span>
                  Jl. Melong No.170, Melong, Kec. Cimahi Selatan, Kota Cimahi,
                  Jawa Barat 40534
                </span>
              </li>
              <li className="flex items-center gap-3">
                <Phone size={16} className="text-secondary flex-shrink-0" />
                <span>(022) 6023191</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail size={16} className="text-secondary flex-shrink-0" />
                <span>rsuavisena@gmail.com</span>
              </li>
            </ul>
          </div>

          {/* Kolom 4: Info Kesehatan */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">
              Dapatkan Info Kesehatan
            </h3>
            <p className="text-slate-400 mb-4 text-sm">
              Daftarkan email Anda untuk mendapatkan tips dan berita kesehatan
              terbaru.
            </p>
            <form className="flex">
              <input
                type="email"
                placeholder="Email Anda"
                className="w-full rounded-l-md px-4 py-2 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-secondary"
              />
              <button
                type="submit"
                className="bg-primary text-white px-4 py-2 rounded-r-md hover:bg-secondary transition-colors"
              >
                <ChevronRight size={24} />
              </button>
            </form>
          </div>
        </div>
        <div className="mt-12 border-t border-text-muted pt-8 text-center text-slate-500 text-sm">
          <p>
            &copy; {new Date().getFullYear()} Rumah Sakit Umum Avisena. Semua
            Hak Cipta Dilindungi.
          </p>
        </div>
      </div>
    </footer>
  );
}
