// File: app/components/landing-page/FeaturesSection.tsx
"use client"; // Diperlukan untuk import gambar statis di App Router

import Image from "next/image";
import { ShieldCheck, Clock, Award } from "lucide-react";
// Impor gambar dari folder src/assets menggunakan path alias yang benar
import landingImage from "@/app/assets/image/landing-2.jpg";

// Data Fitur
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

export default function FeaturesSection() {
  return (
    <section id="unggulan" className="py-20 bg-background">
      <div className="container mx-auto px-6">
        <div className="grid md:grid-cols-2 gap-16 items-center">
          <div>
            <Image
              src={landingImage} // Gunakan gambar yang sudah diimpor
              alt="Tim Dokter Profesional RS Avisena"
              width={500}
              height={550}
              placeholder="blur" // Menambahkan efek blur saat gambar dimuat
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
                  <div className="bg-subtle text-primary-dark rounded-full p-3">
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
}
