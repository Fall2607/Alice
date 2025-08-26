// File: app/components/landing-page/ServicesSection.tsx
"use client";

import { useState } from "react";
import { ChevronRight, ChevronLeft } from "lucide-react";
import { allServices } from "../../data/services"; // Path diubah menjadi relatif

export default function ServicesSection() {
  // State ini sekarang hanya untuk slider desktop
  const [currentPage, setCurrentPage] = useState(0);
  const itemsPerPage = 6;
  const totalPages = Math.ceil(allServices.length / itemsPerPage);

  const handleNext = () => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages - 1));
  };
  const handlePrev = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 0));
  };

  return (
    <section id="layanan" className="py-20 bg-white">
      <div className="container mx-auto px-6">
        {/* Header Section */}
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
              disabled={currentPage === 0}
              className="p-2 rounded-full bg-background hover:bg-subtle transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Previous services"
            >
              <ChevronLeft className="h-6 w-6 text-primary" />
            </button>
            <button
              onClick={handleNext}
              disabled={currentPage >= totalPages - 1}
              className="p-2 rounded-full bg-background hover:bg-subtle transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Next services"
            >
              <ChevronRight className="h-6 w-6 text-primary" />
            </button>
          </div>
        </div>

        {/* Slider untuk Desktop (md ke atas) - DIPERBARUI */}
        <div className="hidden md:block -mx-4 overflow-hidden">
          {" "}
          {/* Tambahkan overflow-hidden di sini */}
          <div
            className="flex transition-transform duration-500 ease-in-out"
            style={{
              transform: `translateX(-${currentPage * 100}%)`,
            }}
          >
            {Array.from({ length: totalPages }).map((_, pageIndex) => {
              const start = pageIndex * itemsPerPage;
              const pageItems = allServices.slice(start, start + itemsPerPage);

              return (
                <div key={pageIndex} className="min-w-full flex-shrink-0 px-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {pageItems.map((service) => (
                      <div
                        key={service.title}
                        className="bg-background p-8 rounded-xl shadow-md hover:shadow-xl hover:-translate-y-2 transition-all duration-300 text-center"
                      >
                        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-background-soft text-primary-dark mb-4">
                          <service.icon className="h-8 w-8" />
                        </div>
                        <h3 className="text-xl font-semibold text-slate-800 mb-2">
                          {service.title}
                        </h3>
                        <p className="text-slate-600 text-sm">
                          {service.description}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Carousel Geser untuk Mobile (di bawah md) */}
        <div className="md:hidden -mx-6">
          <div className="flex overflow-x-auto space-x-6 px-6 pb-4">
            {allServices.map((service) => (
              <div key={service.title} className="w-4/5 sm:w-2/5 flex-shrink-0">
                <div className="bg-background p-8 rounded-xl shadow-md text-center h-full flex flex-col items-center justify-center">
                  <div className="flex h-20 w-20 items-center justify-center rounded-full bg-background-soft text-primary-dark mb-4 flex-shrink-0">
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
      </div>
    </section>
  );
}
