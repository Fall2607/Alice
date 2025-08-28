// File: app/dokter/page.tsx
"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import PageBanner from "@/app/components/PageBanner";
import DoctorFilter from "@/app/components/DoctorFilter";
import { doctors, Doctor } from "@/app/data/doctor";
import Modal from "@/app/components/modal";

export default function DoctorPage() {
  const [selectedPoli, setSelectedPoli] = useState("Semua");
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);

  const filteredDoctors = useMemo(() => {
    return doctors.filter((doctor) => {
      const poliMatch =
        selectedPoli === "Semua" || doctor.poli === selectedPoli;
      const searchMatch = doctor.name
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
      return poliMatch && searchMatch;
    });
  }, [selectedPoli, searchTerm]);

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
      <div className="bg-background">
        <PageBanner
          title="Tim Dokter Profesional Kami"
          description="Temukan dokter spesialis yang tepat untuk kebutuhan kesehatan Anda. Kami siap melayani dengan keahlian dan dedikasi tinggi."
          imageUrl="/img/banner/banner-dokter.jpg"
        />

        <section className="py-20">
          <div className="container mx-auto px-6">
            <div className="lg:grid lg:grid-cols-4 lg:gap-8 lg:items-start">
              {/* Kolom Filter */}
              <div className="lg:col-span-1 mb-8 lg:mb-0">
                <DoctorFilter
                  selectedPoli={selectedPoli}
                  onPoliChange={setSelectedPoli}
                  searchTerm={searchTerm}
                  onSearchChange={setSearchTerm}
                />
              </div>

              {/* Kolom Daftar Dokter */}
              <div className="lg:col-span-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-8">
                  {filteredDoctors.length > 0 ? (
                    filteredDoctors.map((doctor, index) => (
                      <div
                        key={index}
                        className="bg-white rounded-lg shadow-lg overflow-hidden group h-full flex flex-col"
                      >
                        <div className="relative h-64">
                          <Image
                            src={doctor.image}
                            alt={`Foto ${doctor.name}`}
                            fill
                            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
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
                    ))
                  ) : (
                    <div className="sm:col-span-2 xl:col-span-3 text-center py-12">
                      <p className="text-slate-500">
                        Tidak ada dokter yang ditemukan.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>

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
          </div>
        )}
      </Modal>
    </>
  );
}
