// File: app/components/landing-page/DoctorsSection.tsx
"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import { ChevronRight, ChevronLeft } from "lucide-react";
// Impor data dari file terpisah menggunakan path relatif
import { doctors, poliFilters, Doctor } from "@/app/data/doctor";
import Modal from "@/app/components/modal"; // Impor komponen Modal menggunakan path relatif

export default function DoctorsSection() {
  const [selectedPoli, setSelectedPoli] = useState("Semua");
  const [currentPage, setCurrentPage] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);

  const filteredDoctors = useMemo(() => {
    if (selectedPoli === "Semua") return doctors;
    return doctors.filter((doc) => doc.poli === selectedPoli);
  }, [selectedPoli]);

  const doctorsPerPage = 4;
  const totalPages = Math.ceil(filteredDoctors.length / doctorsPerPage);

  const handleFilterChange = (poli: string) => {
    setSelectedPoli(poli);
    setCurrentPage(0);
  };

  const handleNext = () => {
    if (currentPage < totalPages - 1) setCurrentPage(currentPage + 1);
  };
  const handlePrev = () => {
    if (currentPage > 0) setCurrentPage(currentPage - 1);
  };

  const handleOpenModal = (doctor: Doctor) => {
    setSelectedDoctor(doctor);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedDoctor(null);
  };

  return (
    <>
      <section id="doctors" className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-slate-800">
              Tim Dokter Kami
            </h2>
            <p className="text-slate-600 mt-2 max-w-2xl mx-auto">
              Temui para dokter ahli kami yang berdedikasi untuk memberikan
              pelayanan terbaik.
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-2 mb-12">
            {poliFilters.map((poli) => (
              <button
                key={poli}
                onClick={() => handleFilterChange(poli)}
                className={`px-4 py-2 text-sm font-medium rounded-full transition-colors ${
                  selectedPoli === poli
                    ? "bg-primary text-white"
                    : "bg-background text-slate-700 hover:bg-subtle"
                }`}
              >
                {poli}
              </button>
            ))}
          </div>

          <div className="relative">
            <div className="overflow-hidden">
              <div
                className="flex transition-transform duration-500 ease-in-out"
                style={{ transform: `translateX(-${currentPage * 100}%)` }}
              >
                {totalPages > 0 ? (
                  Array.from({ length: totalPages }).map((_, pageIndex) => (
                    <div key={pageIndex} className="min-w-full flex-shrink-0">
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                        {filteredDoctors
                          .slice(
                            pageIndex * doctorsPerPage,
                            (pageIndex + 1) * doctorsPerPage
                          )
                          .map((doctor, docIndex) => (
                            <div
                              key={docIndex}
                              className="bg-background rounded-lg shadow-lg overflow-hidden group h-full flex flex-col"
                            >
                              <div className="relative h-64">
                                <Image
                                  src={doctor.image}
                                  alt={`Foto ${doctor.name}`}
                                  fill
                                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                                  className="object-cover group-hover:scale-110 transition-transform duration-500 ease-in-out"
                                  unoptimized={true}
                                />
                              </div>
                              <div className="p-6 text-center flex flex-col flex-grow">
                                <h3 className="text-lg font-semibold text-primary-dark">
                                  {doctor.name}
                                </h3>
                                <p className="text-text-muted flex-grow">
                                  {doctor.specialty}
                                </p>
                                <button
                                  onClick={() => handleOpenModal(doctor)}
                                  className="mt-4 bg-primary text-white px-4 py-2 rounded-full hover:bg-secondary transition-all duration-300 text-sm font-semibold"
                                >
                                  Lihat Jadwal
                                </button>
                              </div>
                            </div>
                          ))}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-10 text-slate-500">
                    Tidak ada dokter yang ditemukan untuk poli ini.
                  </div>
                )}
              </div>
            </div>

            {totalPages > 1 && (
              <div className="hidden md:block">
                <button
                  onClick={handlePrev}
                  disabled={currentPage === 0}
                  className="absolute top-1/2 -left-4 -translate-y-1/2 p-2 rounded-full bg-white shadow-md hover:bg-background transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  aria-label="Previous doctors"
                >
                  <ChevronLeft className="h-6 w-6 text-primary" />
                </button>
                <button
                  onClick={handleNext}
                  disabled={currentPage >= totalPages - 1}
                  className="absolute top-1/2 -right-4 -translate-y-1/2 p-2 rounded-full bg-white shadow-md hover:bg-background transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  aria-label="Next doctors"
                >
                  <ChevronRight className="h-6 w-6 text-primary" />
                </button>
              </div>
            )}
          </div>

          {totalPages > 1 && (
            <div className="flex md:hidden items-center justify-center space-x-4 mt-8">
              <button
                onClick={handlePrev}
                disabled={currentPage === 0}
                className="p-3 rounded-full bg-background hover:bg-subtle transition-colors disabled:opacity-50"
              >
                <ChevronLeft className="h-6 w-6 text-primary" />
              </button>
              <button
                onClick={handleNext}
                disabled={currentPage >= totalPages - 1}
                className="p-3 rounded-full bg-background hover:bg-subtle transition-colors disabled:opacity-50"
              >
                <ChevronRight className="h-6 w-6 text-primary" />
              </button>
            </div>
          )}
        </div>
      </section>

      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={`Jadwal Praktik`}
      >
        {selectedDoctor && (
          <div>
            <h4 className="text-lg font-semibold text-slate-800">
              {selectedDoctor.name}
            </h4>
            <p className="text-text-muted mb-4">{selectedDoctor.specialty}</p>
            <p className="text-slate-600">
              Jadwal dokter akan ditampilkan di sini.
            </p>
            {/* Nanti di sini Anda bisa map data jadwal dokter */}
          </div>
        )}
      </Modal>
    </>
  );
}
