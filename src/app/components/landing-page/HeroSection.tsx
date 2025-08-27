// File: app/components/landing-page/HeroSection.tsx
import Image from "next/image";
import { ChevronRight } from "lucide-react";

export default function HeroSection() {
  return (
    <section className="bg-background pt-32 pb-20">
      <div className="container mx-auto px-6 grid md:grid-cols-2 gap-12 items-center">
        <div className="text-center md:text-left">
          <h1 className="text-4xl md:text-5xl font-extrabold text-slate-800 leading-tight mb-4">
            Pelayanan Kesehatan <span className="text-primary">Terbaik</span>{" "}
            untuk Anda & Keluarga
          </h1>
          <p className="text-lg text-slate-600 mb-8">
            RS Avisena berkomitmen memberikan perawatan medis berkualitas dengan
            sentuhan personal, didukung oleh teknologi modern dan tim medis
            profesional.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
            <a
              href="/dokter"
              className="bg-primary text-white px-8 py-3 rounded-full font-semibold hover:bg-secondary transition-all duration-300 flex items-center justify-center gap-2"
            >
              Cari Dokter <ChevronRight size={20} />
            </a>
            <a
              href="/layanan#gawat-darurat"
              className="bg-white text-primary border-2 border-primary px-8 py-3 rounded-full font-semibold hover:bg-background-soft transition-all duration-300"
            >
              Layanan Gawat Darurat
            </a>
          </div>
        </div>
        <div>
          <Image
            src="/img/banner/banner-kami.jpg"
            alt="Gedung Rumah Sakit Avisena"
            width={600}
            height={450}
            className="rounded-xl shadow-2xl w-full h-auto object-cover"
          />
        </div>
      </div>
    </section>
  );
}
