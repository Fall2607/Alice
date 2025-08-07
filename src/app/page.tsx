// File: app/page.tsx
"use client";

import type { FC, SVGProps } from "react";
import Image from "next/image"; // Impor komponen Image dari Next.js
import {
  Stethoscope,
  HeartPulse,
  FlaskConical,
  BedDouble,
  ShieldCheck,
  Clock,
  Award,
  ChevronRight,
} from "lucide-react";

// --- Data Mockup ---
const services = [
  {
    icon: HeartPulse,
    title: "Gawat Darurat 24 Jam",
    description: "Tim medis kami siap melayani kasus gawat darurat kapan saja.",
  },
  {
    icon: BedDouble,
    title: "Rawat Inap",
    description:
      "Kamar perawatan yang nyaman dan bersih untuk pemulihan optimal.",
  },
  {
    icon: Stethoscope,
    title: "Poliklinik Spesialis",
    description: "Konsultasi dengan dokter-dokter spesialis berpengalaman.",
  },
  {
    icon: FlaskConical,
    title: "Laboratorium & Radiologi",
    description: "Pemeriksaan penunjang dengan teknologi canggih.",
  },
];

const features = [
  {
    icon: Award,
    title: "Dokter Profesional",
    description:
      "Tim dokter ahli dengan sertifikasi nasional dan internasional.",
  },
  {
    icon: ShieldCheck,
    title: "Fasilitas Modern",
    description: "Investasi pada teknologi medis terkini untuk hasil terbaik.",
  },
  {
    icon: Clock,
    title: "Pelayanan 24/7",
    description:
      "Akses layanan kesehatan tanpa henti, kapan pun Anda butuhkan.",
  },
];

const testimonials = [
  {
    quote:
      "Pelayanan di RS Avisena sangat memuaskan. Dokter dan perawatnya ramah dan sangat profesional.",
    name: "Ahmad Subagja",
    role: "Pasien",
    avatar: "https://placehold.co/100x100/a7f3d0/14532d?text=AS",
  },
  {
    quote:
      "Proses pendaftaran hingga konsultasi berjalan lancar dan cepat. Terima kasih RS Avisena!",
    name: "Siti Nurhaliza",
    role: "Pasien",
    avatar: "https://placehold.co/100x100/fecaca/7f1d1d?text=SN",
  },
];

// --- Komponen-komponen Section ---
const HeroSection = () => (
  <section className="bg-slate-50 pt-32 pb-20">
    <div className="container mx-auto px-6 grid md:grid-cols-2 gap-12 items-center">
      <div className="text-center md:text-left">
        <h1 className="text-4xl md:text-5xl font-extrabold text-slate-800 leading-tight mb-4">
          Pelayanan Kesehatan <span className="text-emerald-600">Terbaik</span>{" "}
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
            className="bg-emerald-600 text-white px-8 py-3 rounded-full font-semibold hover:bg-emerald-700 transition-all duration-300 flex items-center justify-center gap-2"
          >
            Cari Dokter <ChevronRight size={20} />
          </a>
          <a
            href="/layanan#gawat-darurat"
            className="bg-white text-emerald-600 border-2 border-emerald-600 px-8 py-3 rounded-full font-semibold hover:bg-emerald-50 transition-all duration-300"
          >
            Layanan Gawat Darurat
          </a>
        </div>
      </div>
      <div>
        {/* Pastikan className ini ada untuk mengatur ukuran gambar */}
        <Image
          src="/img/front-rs.jpg"
          alt="Gedung Rumah Sakit Avisena"
          width={600}
          height={450}
          className="rounded-xl shadow-2xl w-full h-auto object-cover"
        />
      </div>
    </div>
  </section>
);

const ServicesSection = () => (
  <section id="layanan" className="py-20 bg-white">
    <div className="container mx-auto px-6">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold text-slate-800">
          Layanan Unggulan Kami
        </h2>
        <p className="text-slate-600 mt-2 max-w-2xl mx-auto">
          Kami menyediakan berbagai layanan medis untuk memenuhi segala
          kebutuhan kesehatan Anda.
        </p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        {services.map((service, index) => (
          <div
            key={index}
            className="bg-slate-50 p-8 rounded-xl shadow-md hover:shadow-xl hover:-translate-y-2 transition-all duration-300 text-center"
          >
            <div className="bg-emerald-100 text-emerald-600 rounded-full p-4 inline-block mb-4">
              <service.icon className="h-8 w-8" />
            </div>
            <h3 className="text-xl font-semibold text-slate-800 mb-2">
              {service.title}
            </h3>
            <p className="text-slate-600">{service.description}</p>
          </div>
        ))}
      </div>
    </div>
  </section>
);

const FeaturesSection = () => (
  <section id="unggulan" className="py-20 bg-slate-50">
    <div className="container mx-auto px-6">
      <div className="grid md:grid-cols-2 gap-16 items-center">
        <div>
          {/* Pastikan className ini juga ada di gambar kedua */}
          <Image
            src="/img/landing-2.jpg"
            alt="Tim Dokter Profesional RS Avisena"
            width={500}
            height={550}
            className="rounded-xl shadow-lg w-full h-auto object-cover"
          />
        </div>
        <div>
          <h2 className="text-3xl font-bold text-slate-800 mb-6">
            Kenapa Memilih RS Avisena?
          </h2>
          <p className="text-slate-600 mb-8">
            Kami tidak hanya mengobati, tetapi juga merawat. Kepercayaan dan
            kenyamanan Anda adalah prioritas utama kami.
          </p>
          <div className="space-y-6">
            {features.map((feature, index) => (
              <div key={index} className="flex items-start gap-4">
                <div className="bg-emerald-100 text-emerald-600 rounded-full p-3">
                  <feature.icon className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-slate-800">
                    {feature.title}
                  </h3>
                  <p className="text-slate-600">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  </section>
);

const TestimonialsSection = () => (
  <section id="tentang" className="py-20 bg-white">
    <div className="container mx-auto px-6">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold text-slate-800">
          Apa Kata Mereka Tentang Kami
        </h2>
        <p className="text-slate-600 mt-2 max-w-2xl mx-auto">
          Kepuasan pasien adalah bukti nyata dari kualitas pelayanan kami.
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {testimonials.map((testimonial, index) => (
          <div key={index} className="bg-slate-50 p-8 rounded-xl shadow-lg">
            <p className="text-slate-600 italic mb-6">"{testimonial.quote}"</p>
            <div className="flex items-center">
              <Image
                src={testimonial.avatar}
                alt={`Avatar of ${testimonial.name}`}
                width={56}
                height={56}
                className="w-14 h-14 rounded-full mr-4 object-cover"
              />
              <div>
                <h4 className="font-bold text-slate-800">{testimonial.name}</h4>
                <p className="text-sm text-slate-500">{testimonial.role}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  </section>
);

// --- Halaman Utama ---
export default function LandingPage() {
  return (
    <>
      <HeroSection />
      <ServicesSection />
      <FeaturesSection />
      <TestimonialsSection />
    </>
  );
}
