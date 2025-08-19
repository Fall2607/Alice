"use client";

import Link from "next/link";
import { Baby, Scale, Flame, GlassWater } from "lucide-react";

// Data untuk kalkulator
const calculators = [
  {
    icon: Baby,
    title: "Kalkulator Kehamilan",
    description: "Perkirakan tanggal lahir buah hati Anda.",
    link: "/kalkulator/kehamilan",
    color: "bg-pink-100 text-pink-600",
  },
  {
    icon: Scale,
    title: "Kalkulator Indeks Massa Tubuh",
    description: "Ketahui status berat badan ideal Anda.",
    link: "/kalkulator/imt",
    color: "bg-blue-100 text-blue-600",
  },
  {
    icon: Flame,
    title: "Kalkulator Kebutuhan Kalori",
    description: "Hitung kebutuhan kalori harian Anda.",
    link: "/kalkulator/kalori",
    color: "bg-orange-100 text-orange-600",
  },
  {
    icon: GlassWater,
    title: "Kalkulator Kebutuhan Air",
    description: "Pastikan tubuh Anda terhidrasi dengan baik.",
    link: "/kalkulator/air",
    color: "bg-sky-100 text-sky-600",
  },
];

export default function HealthCalculatorSection() {
  return (
    <section id="health-calculator" className="py-20 bg-white">
      <div className="container mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-slate-800">
            Kalkulator Kesehatan
          </h2>
          <p className="text-slate-600 mt-2 max-w-2xl mx-auto">
            Gunakan alat bantu kami untuk memantau kesehatan Anda dan keluarga
            dengan lebih mudah.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {calculators.map((calc) => (
            <Link
              href={calc.link}
              key={calc.title}
              className="block p-8 bg-background rounded-xl shadow-md hover:shadow-xl hover:-translate-y-2 transition-all duration-300 text-center group"
            >
              <div
                className={`rounded-full p-4 inline-block mb-4 transition-colors duration-300 ${calc.color}`}
              >
                <calc.icon className="h-10 w-10" />
              </div>
              <h3 className="text-xl font-semibold text-primary-dark mb-2 group-hover:text-primary transition-colors">
                {calc.title}
              </h3>
              <p className="text-text-muted text-sm">{calc.description}</p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
