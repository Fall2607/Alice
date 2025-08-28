// File: app/layanan/page.tsx
"use client";

import PageBanner from "@/app/components/PageBanner"; // Path diubah menjadi alias absolut
import { allServices } from "@/app/data/services"; // Path diubah menjadi alias absolut

export default function LayananPage() {
  return (
    <div className="bg-background">
      <PageBanner
        title="Layanan & Fasilitas Kami"
        description="RS Avisena menyediakan beragam layanan poliklinik spesialis dan fasilitas penunjang medis modern untuk memenuhi segala kebutuhan kesehatan Anda."
        imageUrl="/img/banner/banner-layanan.jpg"
      />

      <section className="py-20">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl font-bold text-slate-800 mb-2 text-center">
            Daftar Poliklinik
          </h2>
          <p className="text-center text-slate-600 mb-12 max-w-2xl mx-auto">
            Temukan layanan spesialis yang Anda butuhkan dari daftar poliklinik
            komprehensif kami.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
            {allServices.map((service, index) => (
              <div
                key={index}
                className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300 text-center flex flex-col items-center"
              >
                <div className="bg-background-soft text-primary-dark rounded-full p-4 inline-block mb-4">
                  <service.icon className="h-8 w-8" />
                </div>
                <h3 className="text-lg font-semibold text-primary-dark">
                  {service.title}
                </h3>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
