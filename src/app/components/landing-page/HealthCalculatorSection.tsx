// File: app/components/landing-page/HealthCalculatorSection.tsx
"use client";

import { useState } from "react";
import {
  Baby,
  Scale,
  Flame,
  GlassWater,
  ChevronDown,
  CalendarHeart,
} from "lucide-react";

// Impor komponen kalkulator fungsional menggunakan path alias
import PregnancyCalculator from "@/app/components/calculators/PregnancyCalculator";
import BmiCalculator from "@/app/components/calculators/BmiCalculator";
import CalorieCalculator from "@/app/components/calculators/CalorieCalculator";
import WaterCalculator from "@/app/components/calculators/WaterCalculator";
import OvulationCalculator from "@/app/components/calculators/OvulationCalculator";

// Tipe data untuk setiap kalkulator
interface Calculator {
  id: string;
  icon: React.ElementType;
  title: string;
  description: string;
  content: React.ReactNode;
}

// Data untuk kalkulator diperbarui dengan komponen fungsional
const calculators: Calculator[] = [
  {
    id: "kehamilan",
    icon: Baby,
    title: "Kalkulator Kehamilan",
    description: "Perkirakan tanggal lahir buah hati Anda.",
    content: <PregnancyCalculator />,
  },
  {
    id: "ovulasi",
    icon: CalendarHeart,
    title: "Kalkulator Masa Subur",
    description: "Temukan jendela ovulasi Anda.",
    content: <OvulationCalculator />,
  },
  {
    id: "imt",
    icon: Scale,
    title: "Indeks Massa Tubuh (IMT)",
    description: "Ketahui status berat badan ideal Anda.",
    content: <BmiCalculator />,
  },
  {
    id: "kalori",
    icon: Flame,
    title: "Kebutuhan Kalori Harian",
    description: "Hitung kebutuhan kalori harian Anda.",
    content: <CalorieCalculator />,
  },
  {
    id: "air",
    icon: GlassWater,
    title: "Kebutuhan Air Harian",
    description: "Pastikan tubuh Anda terhidrasi dengan baik.",
    content: <WaterCalculator />,
  },
];

export default function HealthCalculatorSection() {
  const [activeCalculator, setActiveCalculator] = useState<string>(
    calculators[0].id
  );
  const [isAnimating, setIsAnimating] = useState(false);

  const handleCalculatorChange = (id: string) => {
    if (id === activeCalculator || isAnimating) return;

    setIsAnimating(true);
    setTimeout(() => {
      setActiveCalculator(id);
      setIsAnimating(false);
    }, 150); // Durasi harus cocok dengan transisi fade-out
  };

  const selectedCalculator = calculators.find((c) => c.id === activeCalculator);

  return (
    <section id="health-calculator" className="py-20 bg-primary">
      <div className="container mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-white">
            Kalkulator Kesehatan
          </h2>
          <p className="text-slate-200 mt-2 max-w-2xl mx-auto">
            Gunakan alat bantu interaktif kami untuk memantau kesehatan Anda.
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-2xl overflow-hidden md:flex md:items-start">
          {/* Kolom Kiri: Akordeon */}
          <div className="md:w-1/3 border-r border-slate-200">
            {calculators.map((calc) => {
              const isActive = activeCalculator === calc.id;
              return (
                <button
                  key={calc.id}
                  onClick={() => handleCalculatorChange(calc.id)}
                  className={`w-full text-left p-6 border-b border-slate-200 transition-colors duration-300 ${
                    isActive ? "bg-background" : "hover:bg-slate-50"
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <div className="flex items-center">
                      <div
                        className={`rounded-full p-3 mr-4 ${
                          isActive
                            ? "bg-primary text-white"
                            : "bg-background-soft text-primary-dark"
                        }`}
                      >
                        <calc.icon className="h-6 w-6" />
                      </div>
                      <div>
                        <h4
                          className={`font-semibold ${
                            isActive ? "text-primary" : "text-slate-800"
                          }`}
                        >
                          {calc.title}
                        </h4>
                        <p className="text-sm text-slate-500">
                          {calc.description}
                        </p>
                      </div>
                    </div>
                    <ChevronDown
                      className={`h-5 w-5 text-slate-400 transition-transform duration-300 ${
                        isActive ? "rotate-180" : ""
                      }`}
                    />
                  </div>
                </button>
              );
            })}
          </div>

          {/* Kolom Kanan: Konten Kalkulator */}
          <div className="md:w-2/3 p-8 md:p-12">
            <div
              className={`transition-opacity duration-150 ${
                isAnimating ? "opacity-0" : "opacity-100"
              }`}
            >
              {selectedCalculator && selectedCalculator.content}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
