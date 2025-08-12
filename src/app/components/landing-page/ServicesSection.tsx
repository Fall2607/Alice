// File: app/components/landing-page/ServicesSection.tsx
"use client";

import { useState } from "react";
import {
  Stethoscope,
  HeartPulse,
  FlaskConical,
  BedDouble,
  ChevronRight,
  ChevronLeft,
  Baby,
  Eye,
  Scissors,
  Bone,
  Brain,
  Ear,
  HeartHandshake,
  BrainCircuit,
  Droplets,
  Accessibility,
} from "lucide-react";

// Komponen Ikon Kustom
const ToothIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    {/* Bentuk gigi */}
    <path d="M12 2c-2.5 0-5 1-6.5 3S4 9 4 12c0 3.5 1.5 6 3 8 .5.7 1.2 1 2 1 .8 0 1.5-.4 2-1 .7-.8 1-2 1-3s.3-2.2 1-3c.7.8 1 2 1 3s.3 2.2 1 3c.5.6 1.2 1 2 1 .8 0 1.5-.3 2-1 1.5-2 3-4.5 3-8 0-3-.5-5.5-1.5-7S14.5 2 12 2z" />
  </svg>
);

// Data Layanan
const allServices = [
  {
    icon: Baby,
    title: "Poli Anak",
    description: "Layanan kesehatan terpadu untuk buah hati Anda.",
  },
  {
    icon: ToothIcon,
    title: "Poli Gigi & Mulut",
    description: "Solusi lengkap untuk kesehatan gigi, gusi, dan mulut.",
  },
  {
    icon: Scissors,
    title: "Poli Bedah",
    description: "Tindakan bedah umum dan spesialis oleh tim ahli.",
  },
  {
    icon: HeartPulse,
    title: "Poli Jantung",
    description: "Penanganan komprehensif untuk kesehatan jantung.",
  },
  {
    icon: Eye,
    title: "Poli Mata",
    description: "Pemeriksaan dan penanganan berbagai penyakit mata.",
  },
  {
    icon: HeartHandshake,
    title: "Poli Obgyn",
    description: "Kesehatan ibu dan anak selama kehamilan dan persalinan.",
  },
  {
    icon: Bone,
    title: "Poli Orthopedi",
    description: "Penanganan cedera dan kelainan pada tulang dan sendi.",
  },
  {
    icon: BrainCircuit,
    title: "Poli Psikiatri",
    description: "Layanan kesehatan jiwa untuk semua kalangan.",
  },
  {
    icon: Brain,
    title: "Poli Syaraf",
    description: "Diagnosis dan perawatan gangguan sistem saraf.",
  },
  {
    icon: Droplets,
    title: "Poli Urologi",
    description: "Penanganan masalah pada saluran kemih dan reproduksi.",
  },
  {
    icon: Ear,
    title: "Poli THT",
    description: "Layanan untuk keluhan telinga, hidung, dan tenggorokan.",
  },
  {
    icon: Stethoscope,
    title: "Poli Penyakit Dalam",
    description: "Penanganan berbagai penyakit organ dalam.",
  },
  {
    icon: Droplets,
    title: "Unit Hemodialisa",
    description: "Fasilitas cuci darah dengan teknologi modern.",
  },
  {
    icon: Accessibility,
    title: "Rehabilitasi Medik",
    description: "Program pemulihan fungsi tubuh pasca cedera/sakit.",
  },
  {
    icon: FlaskConical,
    title: "Patologi Klinik (SPPK)",
    description: "Layanan laboratorium untuk diagnosis akurat.",
  },
  {
    icon: BedDouble,
    title: "Layanan Lainnya",
    description: "Jelajahi semua layanan unggulan kami selengkapnya.",
  },
];

export default function ServicesSection() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const itemsToSlide = 4; // Jumlah item yang digeser setiap kali klik
  const totalItems = allServices.length;
  const maxIndex = totalItems - itemsToSlide;

  const handleNext = () => {
    setCurrentIndex((prev) => Math.min(prev + itemsToSlide, maxIndex));
  };
  const handlePrev = () => {
    setCurrentIndex((prev) => Math.max(prev - itemsToSlide, 0));
  };

  return (
    <section id="layanan" className="py-20 bg-white">
      <div className="container mx-auto px-6">
        <div className="flex justify-between items-center mb-12">
          <div className="text-left">
            <h2 className="text-3xl font-bold text-slate-800">
              Layanan Poliklinik Kami
            </h2>
            <p className="text-slate-600 mt-2 max-w-2xl">
              Kami menyediakan berbagai layanan poliklinik spesialis untuk
              memenuhi kebutuhan kesehatan Anda.
            </p>
          </div>
          <div className="hidden md:flex items-center space-x-2">
            <button
              onClick={handlePrev}
              disabled={currentIndex === 0}
              className="p-2 rounded-full bg-background hover:bg-subtle transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Previous services"
            >
              <ChevronLeft className="h-6 w-6 text-primary" />
            </button>
            <button
              onClick={handleNext}
              disabled={currentIndex >= maxIndex}
              className="p-2 rounded-full bg-background hover:bg-subtle transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Next services"
            >
              <ChevronRight className="h-6 w-6 text-primary" />
            </button>
          </div>
        </div>
        <div className="overflow-hidden">
          <div
            className="flex transition-transform duration-500 ease-in-out -mx-4"
            style={{
              transform: `translateX(calc(-${
                currentIndex * (100 / itemsToSlide)
              }%))`,
            }}
          >
            {allServices.map((service, index) => (
              <div
                key={service.title}
                className="w-full sm:w-1/2 lg:w-1/4 flex-shrink-0 px-4"
              >
                <div className="bg-background p-8 rounded-xl shadow-md hover:shadow-xl hover:-translate-y-2 transition-all duration-300 text-center h-full flex flex-col items-center justify-center">
                  <div className="bg-background-soft text-primary-dark rounded-full p-4 inline-block mb-4">
                    <service.icon className="h-8 w-8" />
                  </div>
                  <h3 className="text-xl font-semibold text-slate-800 mb-2">
                    {service.title}
                  </h3>
                  <p className="text-slate-600 text-sm">
                    {service.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="flex md:hidden items-center justify-center space-x-4 mt-8">
          <button
            onClick={handlePrev}
            disabled={currentIndex === 0}
            className="p-3 rounded-full bg-background hover:bg-subtle transition-colors disabled:opacity-50"
          >
            <ChevronLeft className="h-6 w-6 text-primary" />
          </button>
          <button
            onClick={handleNext}
            disabled={currentIndex >= maxIndex}
            className="p-3 rounded-full bg-background hover:bg-subtle transition-colors disabled:opacity-50"
          >
            <ChevronRight className="h-6 w-6 text-primary" />
          </button>
        </div>
      </div>
    </section>
  );
}
