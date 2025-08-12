// File: app/components/landing-page/DoctorsSection.tsx
"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import { ChevronRight, ChevronLeft } from "lucide-react";

// Data Dokter diperbarui dengan kategori 'poli'
const doctors = [
  {
    name: "Dr. Budi Santoso, Sp.A",
    specialty: "Spesialis Anak",
    image: "https://placehold.co/400x400/b0e7e1/05445e?text=Dr.+Budi",
    poli: "Anak",
  },
  {
    name: "Dr. Citra Lestari, Sp.OG",
    specialty: "Spesialis Kandungan",
    image: "https://placehold.co/400x400/c5d8c9/05445e?text=Dr.+Citra",
    poli: "Obgyn",
  },
  {
    name: "Dr. Aditia Pratama, Sp.JP",
    specialty: "Spesialis Jantung",
    image: "https://placehold.co/400x400/84c1ba/05445e?text=Dr.+Aditia",
    poli: "Jantung",
  },
  {
    name: "Dr. Dewi Anggraini, Sp.M",
    specialty: "Spesialis Mata",
    image: "https://placehold.co/400x400/55929a/f2f2f2?text=Dr.+Dewi",
    poli: "Mata",
  },
  {
    name: "Dr. Eko Prasetyo, Sp.B",
    specialty: "Spesialis Bedah Umum",
    image: "https://placehold.co/400x400/b0e7e1/05445e?text=Dr.+Eko",
    poli: "Bedah",
  },
  {
    name: "Dr. Fitriana Sari, Sp.S",
    specialty: "Spesialis Saraf",
    image: "https://placehold.co/400x400/c5d8c9/05445e?text=Dr.+Fitriana",
    poli: "Syaraf",
  },
  {
    name: "Dr. Gilang Ramadhan, Sp.OT",
    specialty: "Spesialis Orthopedi",
    image: "https://placehold.co/400x400/84c1ba/05445e?text=Dr.+Gilang",
    poli: "Orthopedi",
  },
  {
    name: "Dr. Hana Yulita, Sp.THT-KL",
    specialty: "Spesialis THT",
    image: "https://placehold.co/400x400/55929a/f2f2f2?text=Dr.+Hana",
    poli: "THT",
  },
];

// Mendapatkan daftar poli unik secara otomatis dari data dokter
const poliFilters = [
  "Semua",
  ...Array.from(new Set(doctors.map((doc) => doc.poli))),
];

export default function DoctorsSection() {
  const [selectedPoli, setSelectedPoli] = useState("Semua");
  const [currentPage, setCurrentPage] = useState(0);

  // Memoize hasil filter agar tidak dihitung ulang pada setiap render
  const filteredDoctors = useMemo(() => {
    if (selectedPoli === "Semua") {
      return doctors;
    }
    return doctors.filter((doc) => doc.poli === selectedPoli);
  }, [selectedPoli]);

  const doctorsPerPage = 4;
  const totalPages = Math.ceil(filteredDoctors.length / doctorsPerPage);

  const handleFilterChange = (poli: string) => {
    setSelectedPoli(poli);
    setCurrentPage(0); // Reset ke halaman pertama saat filter berubah
  };

  const handleNext = () => {
    if (currentPage < totalPages - 1) {
      setCurrentPage(currentPage + 1);
    }
  };
  const handlePrev = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1);
    }
  };

  return (
    <section id="doctors" className="py-20 bg-white">
      <div className="container mx-auto px-6">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-slate-800">Tim Dokter Kami</h2>
          <p className="text-slate-600 mt-2 max-w-2xl mx-auto">
            Temui para dokter ahli kami yang berdedikasi untuk memberikan
            pelayanan terbaik.
          </p>
        </div>

        {/* Tombol Filter */}
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
              {Array.from({ length: totalPages }).map((_, pageIndex) => (
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
                          className="bg-background rounded-lg shadow-lg overflow-hidden group h-full"
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
                          <div className="p-6 text-center">
                            <h3 className="text-lg font-semibold text-primary-dark">
                              {doctor.name}
                            </h3>
                            <p className="text-text-muted">
                              {doctor.specialty}
                            </p>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Tombol Navigasi Carousel */}
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
        </div>

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
      </div>
    </section>
  );
}
