// File: app/components/Footer.tsx
import { Phone, Mail, MapPin, ChevronRight } from "lucide-react";
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-slate-800 text-slate-300">
      <div className="container mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Kolom 1: Tentang */}
          <div>
            <h3 className="text-xl font-bold text-white mb-4">RS Avisena</h3>
            <p className="text-slate-400">
              Melayani dengan hati, menyembuhkan dengan teknologi.
            </p>
          </div>
          {/* Kolom 2: Tautan Cepat */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">
              Tautan Cepat
            </h3>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="hover:text-white transition-colors">
                  Beranda
                </Link>
              </li>
              <li>
                <Link
                  href="/layanan"
                  className="hover:text-white transition-colors"
                >
                  Layanan
                </Link>
              </li>
              <li>
                <Link
                  href="/dokter"
                  className="hover:text-white transition-colors"
                >
                  Dokter
                </Link>
              </li>
              <li>
                <Link
                  href="/tentang"
                  className="hover:text-white transition-colors"
                >
                  Tentang Kami
                </Link>
              </li>
            </ul>
          </div>
          {/* Kolom 3: Kontak */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">
              Hubungi Kami
            </h3>
            <ul className="space-y-3 text-slate-400">
              <li className="flex items-start gap-3">
                <MapPin
                  size={20}
                  className="mt-1 text-emerald-400 flex-shrink-0"
                />
                <span>
                  Jl. Kesehatan No. 123, Bandung, Jawa Barat, Indonesia
                </span>
              </li>
              <li className="flex items-center gap-3">
                <Phone size={20} className="text-emerald-400 flex-shrink-0" />
                <span>(022) 123-4567</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail size={20} className="text-emerald-400 flex-shrink-0" />
                <span>info@rsavisena.co.id</span>
              </li>
            </ul>
          </div>
          {/* Kolom 4: Newsletter */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">
              Dapatkan Info Kesehatan
            </h3>
            <p className="text-slate-400 mb-4">
              Daftarkan email Anda untuk mendapatkan tips dan berita kesehatan
              terbaru.
            </p>
            <form className="flex">
              <input
                type="email"
                placeholder="Email Anda"
                className="w-full rounded-l-md px-4 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <button
                type="submit"
                className="bg-emerald-600 text-white px-4 py-2 rounded-r-md hover:bg-emerald-700"
              >
                <ChevronRight size={24} />
              </button>
            </form>
          </div>
        </div>
        <div className="mt-12 border-t border-slate-700 pt-8 text-center text-slate-500">
          <p>
            &copy; {new Date().getFullYear()} Rumah Sakit Avisena. Semua Hak
            Cipta Dilindungi.
          </p>
        </div>
      </div>
    </footer>
  );
}
