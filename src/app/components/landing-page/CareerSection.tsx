// File: app/components/landing-page/CareerSection.tsx
"use client"; // Ditambahkan untuk memastikan kompatibilitas dan pemuatan modul yang benar

import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function CareerSection() {
  return (
    <section id="career" className="py-20 bg-white">
      <div className="container mx-auto px-6">
        <div className="bg-background rounded-2xl shadow-lg overflow-hidden md:grid md:grid-cols-2 items-center">
          <div className="p-8 md:p-12">
            <h2 className="text-3xl font-bold text-primary-dark mb-4">
              Bergabung dengan Tim Kami
            </h2>
            <p className="text-slate-600 mb-8">
              Kami selalu mencari individu berbakat dan berdedikasi yang ingin
              membuat perbedaan di dunia kesehatan. Jadilah bagian dari keluarga
              besar RS Avisena dan kembangkan karir Anda bersama kami.
            </p>
            <Link
              href="/karir"
              className="inline-flex items-center bg-primary text-white px-6 py-3 rounded-full font-semibold hover:bg-secondary transition-all duration-300 transform hover:scale-105"
            >
              Lihat Lowongan Tersedia
              <ArrowRight className="w-5 h-5 ml-2" />
            </Link>
          </div>
          <div className="relative h-64 md:h-full">
            <Image
              src="https://placehold.co/600x500/84c1ba/f2f2f2?text=Karir+di+RS+Avisena"
              alt="Suasana kerja di Rumah Sakit Avisena"
              fill
              className="object-cover"
              unoptimized={true}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
