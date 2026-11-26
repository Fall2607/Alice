"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import {
  ChevronRight,
  ChevronLeft,
  Calendar,
  Clock,
  User,
  Stethoscope,
  CalendarCheck,
  CheckCircle2,
  Info,
} from "lucide-react";
import { doctors, Doctor } from "@/app/data/doctor";
import DoctorFilter from "@/app/components/DoctorFilter";
import Modal from "@/app/components/modal";

interface DoctorsSectionProps {
  searchTerm?: string;
  selectedPoliProp?: string;
  onOpenBookingModal?: (doctorName?: string, poliName?: string) => void;
}

export default function DoctorsSection({
  searchTerm: externalSearch = "",
  selectedPoliProp = "Semua",
  onOpenBookingModal,
}: DoctorsSectionProps) {
  const [selectedPoli, setSelectedPoli] = useState("Semua");
  const [localSearch, setLocalSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(0);
  const [selectedDoctorDetail, setSelectedDoctorDetail] = useState<Doctor | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  // Sync jika ada pencarian atau filter dari hero quick search
  const activeSearch = localSearch || externalSearch;

  useMemo(() => {
    if (selectedPoliProp && selectedPoliProp !== "Semua") {
      setSelectedPoli(selectedPoliProp);
    }
  }, [selectedPoliProp]);

  // Filter dokter
  const filteredDoctors = useMemo(() => {
    return doctors.filter((doc) => {
      const matchPoli = selectedPoli === "Semua" || doc.poli === selectedPoli;
      const matchSearch =
        !activeSearch ||
        doc.name.toLowerCase().includes(activeSearch.toLowerCase()) ||
        doc.specialty.toLowerCase().includes(activeSearch.toLowerCase()) ||
        doc.poli.toLowerCase().includes(activeSearch.toLowerCase());
      return matchPoli && matchSearch;
    });
  }, [selectedPoli, activeSearch]);

  const doctorsPerPage = 6;
  const totalPages = Math.max(1, Math.ceil(filteredDoctors.length / doctorsPerPage));

  const handlePoliChange = (poli: string) => {
    setSelectedPoli(poli);
    setCurrentPage(0);
  };

  const handleSearchChange = (term: string) => {
    setLocalSearch(term);
    setCurrentPage(0);
  };

  const handleNext = () => {
    if (currentPage < totalPages - 1) setCurrentPage(currentPage + 1);
  };
  const handlePrev = () => {
    if (currentPage > 0) setCurrentPage(currentPage - 1);
  };

  const handleOpenDetailModal = (doctor: Doctor) => {
    setSelectedDoctorDetail(doctor);
    setIsDetailModalOpen(true);
  };

  const handleCloseDetailModal = () => {
    setIsDetailModalOpen(false);
    setSelectedDoctorDetail(null);
  };

  const getDefaultSchedule = (idx: number) => {
    const days = [
      "Senin – Rabu: 08.00 – 12.00 WIB",
      "Kamis – Sabtu: 13.00 – 16.00 WIB",
      "Senin – Jumat: 09.00 – 13.00 WIB",
      "Selasa & Kamis: 14.00 – 17.00 WIB",
    ];
    return days[idx % days.length];
  };

  return (
    <>
      <section id="jadwal-dokter" className="py-20 bg-white relative">
        <div className="container mx-auto px-4 lg:px-8">
          {/* Header Section */}
          <div className="text-center max-w-3xl mx-auto space-y-3 mb-12">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#154C96]/10 text-[#154C96] text-xs font-bold uppercase tracking-wider">
              <Stethoscope size={14} className="text-[#00A79C]" />
              <span>Tim Dokter Spesialis RSU Avisena Cimahi</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-[#10162C] tracking-tight">
              Jadwal Dokter &amp; Poliklinik Rawat Jalan
            </h2>
            <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
              Gunakan filter di bawah untuk menemukan dokter spesialis pilihan Anda dan pastikan jadwal kunjungan Anda
              sesuai jam praktik.
            </p>
          </div>

          {/* TWO COLUMN LAYOUT: FILTER SIDEBAR (Kiri) & DAFTAR DOKTER (Kanan) */}
          <div className="lg:grid lg:grid-cols-12 lg:gap-8 items-start">
            {/* Kolom Kiri: DoctorFilter Komponen Resmi */}
            <div className="lg:col-span-4 xl:col-span-3 mb-8 lg:mb-0">
              <DoctorFilter
                selectedPoli={selectedPoli}
                onPoliChange={handlePoliChange}
                searchTerm={activeSearch}
                onSearchChange={handleSearchChange}
              />
            </div>

            {/* Kolom Kanan: Grid Kartu Dokter */}
            <div className="lg:col-span-8 xl:col-span-9 space-y-6">
              {/* Status Header Hasil Pencarian */}
              <div className="bg-[#F7F9FB] rounded-2xl p-4 border border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2 text-slate-700">
                  <span className="font-bold text-[#154C96]">Poliklinik:</span>
                  <span className="badge badge-sm bg-[#154C96] text-white font-bold">{selectedPoli}</span>
                  {activeSearch && (
                    <span className="text-slate-500">
                      • Kata kunci: &ldquo;<strong className="text-slate-800">{activeSearch}</strong>&rdquo;
                    </span>
                  )}
                </div>

                <span className="text-slate-500 font-medium">
                  Ditemukan <strong className="font-mono text-slate-800">{filteredDoctors.length}</strong> Dokter
                </span>
              </div>

              {filteredDoctors.length === 0 ? (
                <div className="py-20 text-center bg-[#F7F9FB] rounded-3xl border border-slate-200 p-8">
                  <Stethoscope size={40} className="mx-auto text-slate-300 mb-3" />
                  <h4 className="text-base font-bold text-slate-700">Dokter Tidak Ditemukan</h4>
                  <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                    Tidak ada jadwal dokter yang cocok dengan pencarian &ldquo;{activeSearch}&rdquo; pada poli &ldquo;
                    {selectedPoli}&rdquo;.
                  </p>
                  <button
                    onClick={() => {
                      setLocalSearch("");
                      setSelectedPoli("Semua");
                    }}
                    className="mt-4 btn btn-xs btn-outline border-slate-300 text-[#154C96] font-bold"
                  >
                    Tampilkan Semua Dokter
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                  {filteredDoctors
                    .slice(currentPage * doctorsPerPage, (currentPage + 1) * doctorsPerPage)
                    .map((doctor, idx) => {
                      const scheduleText = getDefaultSchedule(idx);
                      const isOnlineToday = idx % 2 === 0;

                      return (
                        <div
                          key={doctor.name}
                          className="bg-white rounded-3xl border border-slate-200/90 shadow-2xs hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between overflow-hidden group"
                        >
                          <div>
                            {/* Foto Dokter */}
                            <div className="relative h-56 bg-gradient-to-b from-slate-100 to-slate-200 overflow-hidden">
                              {doctor.image && !doctor.image.includes("placehold.co") ? (
                                <Image
                                  src={doctor.image}
                                  alt={doctor.name}
                                  fill
                                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                                  sizes="(max-width: 768px) 100vw, 300px"
                                />
                              ) : (
                                <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-tr from-[#154C96]/10 via-slate-100 to-[#00A79C]/10 text-slate-400 p-4 text-center">
                                  <div className="w-16 h-16 rounded-full bg-white shadow-sm flex items-center justify-center text-[#154C96] mb-2 border border-slate-200">
                                    <User size={32} className="text-[#154C96]" />
                                  </div>
                                  <span className="text-[9px] font-mono text-slate-400 bg-white/80 px-2 py-0.5 rounded-md">
                                    Foto: 400 × 400 px
                                  </span>
                                </div>
                              )}

                              {/* Status Badge */}
                              <div className="absolute top-3 left-3">
                                <span
                                  className={`badge badge-sm font-bold text-[9px] uppercase tracking-wider border-0 shadow-xs ${
                                    isOnlineToday
                                      ? "bg-emerald-500 text-white"
                                      : "bg-slate-700/80 backdrop-blur-xs text-white"
                                  }`}
                                >
                                  {isOnlineToday ? "Praktik Hari Ini" : "Tersedia Pekan Ini"}
                                </span>
                              </div>

                              {/* Poli Badge */}
                              <div className="absolute bottom-3 right-3">
                                <span className="badge badge-sm bg-[#00A79C] text-white font-bold text-[10px] border-0 shadow-xs">
                                  Poli {doctor.poli}
                                </span>
                              </div>
                            </div>

                            {/* Detail Dokter */}
                            <div className="p-5 space-y-3">
                              <div>
                                <p className="text-[11px] font-bold text-[#00A79C] uppercase tracking-wider">
                                  {doctor.specialty}
                                </p>
                                <h4 className="text-base font-bold text-[#10162C] group-hover:text-[#154C96] transition-colors leading-snug mt-0.5">
                                  {doctor.name}
                                </h4>
                              </div>

                              {/* Jadwal Praktik Singkat */}
                              <div className="bg-[#F7F9FB] p-2.5 rounded-xl border border-slate-200/80 space-y-1">
                                <div className="flex items-center gap-1.5 text-slate-400 text-[10px] font-bold uppercase tracking-wider">
                                  <Clock size={12} className="text-[#F69320]" />
                                  <span>Jadwal Praktik</span>
                                </div>
                                <p className="text-xs font-semibold text-slate-700 font-mono tabular-nums leading-tight">
                                  {scheduleText}
                                </p>
                              </div>
                            </div>
                          </div>

                          {/* Action Buttons: Lihat Jadwal & Buat Janji */}
                          <div className="p-5 pt-0 grid grid-cols-2 gap-2">
                            <button
                              onClick={() => handleOpenDetailModal(doctor)}
                              className="btn btn-sm btn-outline border-slate-300 text-slate-700 hover:bg-slate-100 font-bold rounded-xl text-[11px]"
                            >
                              Lihat Jadwal
                            </button>
                            <button
                              onClick={() => onOpenBookingModal?.(doctor.name, `Poli ${doctor.poli}`)}
                              className="btn btn-sm bg-[#F69320] hover:bg-[#e07f10] text-white font-bold rounded-xl border-0 shadow-2xs text-[11px] uppercase tracking-wider"
                            >
                              Buat Janji
                            </button>
                          </div>
                        </div>
                      );
                    })}
                </div>
              )}

              {/* Paginasi Dokter */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between pt-6 border-t border-slate-100">
                  <span className="text-xs text-slate-500 font-medium">
                    Halaman <strong className="font-mono text-slate-800">{currentPage + 1}</strong> dari{" "}
                    <strong className="font-mono text-slate-800">{totalPages}</strong>
                  </span>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={handlePrev}
                      disabled={currentPage === 0}
                      className="btn btn-sm btn-outline border-slate-300 text-slate-700 rounded-xl disabled:opacity-40"
                    >
                      <ChevronLeft size={16} />
                      <span className="hidden sm:inline">Sebelumnya</span>
                    </button>
                    <button
                      onClick={handleNext}
                      disabled={currentPage >= totalPages - 1}
                      className="btn btn-sm btn-outline border-slate-300 text-slate-700 rounded-xl disabled:opacity-40"
                    >
                      <span className="hidden sm:inline">Selanjutnya</span>
                      <ChevronRight size={16} />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Modal Detail Jadwal Dokter */}
      <Modal
        isOpen={isDetailModalOpen}
        onClose={handleCloseDetailModal}
        title={`Profil & Jadwal Praktik Dokter`}
      >
        {selectedDoctorDetail && (
          <div className="space-y-5 p-2 font-sans">
            <div className="flex items-center gap-4 border-b border-slate-100 pb-4">
              <div className="w-16 h-16 rounded-2xl bg-blue-50 text-[#154C96] flex items-center justify-center font-bold shrink-0 border border-blue-200">
                <Stethoscope size={30} />
              </div>
              <div>
                <span className="badge badge-sm bg-[#00A79C] text-white font-bold text-[10px] mb-1">
                  Poli {selectedDoctorDetail.poli}
                </span>
                <h4 className="text-lg font-bold text-[#10162C]">{selectedDoctorDetail.name}</h4>
                <p className="text-xs text-slate-500">{selectedDoctorDetail.specialty}</p>
              </div>
            </div>

            <div className="bg-[#F7F9FB] rounded-2xl p-4 border border-slate-200/80 space-y-3">
              <h5 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Clock size={14} className="text-[#F69320]" />
                <span>Waktu Praktik RSU Avisena Cimahi</span>
              </h5>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between py-1.5 border-b border-slate-200/60 font-mono">
                  <span className="font-semibold text-slate-700">Senin &amp; Rabu:</span>
                  <span className="font-bold text-[#154C96]">08.00 – 12.00 WIB</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-200/60 font-mono">
                  <span className="font-semibold text-slate-700">Selasa &amp; Kamis:</span>
                  <span className="font-bold text-[#154C96]">13.00 – 16.00 WIB</span>
                </div>
                <div className="flex justify-between py-1.5 font-mono">
                  <span className="font-semibold text-slate-700">Jumat:</span>
                  <span className="font-bold text-[#154C96]">08.30 – 11.30 WIB</span>
                </div>
              </div>
              <p className="text-[11px] text-slate-400 italic">
                *Jadwal dapat berubah sewaktu-waktu sesuai tindakan operasi atau visit darurat.
              </p>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                onClick={handleCloseDetailModal}
                className="btn btn-sm btn-ghost text-slate-500 font-bold rounded-xl"
              >
                Tutup
              </button>
              <button
                onClick={() => {
                  handleCloseDetailModal();
                  onOpenBookingModal?.(selectedDoctorDetail.name, `Poli ${selectedDoctorDetail.poli}`);
                }}
                className="btn btn-sm bg-[#F69320] hover:bg-[#e07f10] text-white font-bold rounded-xl px-5 uppercase text-xs tracking-wider"
              >
                <CalendarCheck size={14} />
                <span>Buat Janji dengan Dokter Ini</span>
              </button>
            </div>
          </div>
        )}
      </Modal>
    </>
  );
}
