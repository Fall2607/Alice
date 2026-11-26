"use client";

import { useState } from "react";
import HeroSection from "@/app/components/landing-page/HeroSection";
import RegistrationSection from "@/app/components/landing-page/RegistrationSection";
import ServicesSection from "@/app/components/landing-page/ServicesSection";
import DoctorsSection from "@/app/components/landing-page/DoctorsSection";
import AboutCimahiSection from "@/app/components/landing-page/AboutCimahiSection";
import HealthCalculatorSection from "@/app/components/landing-page/HealthCalculatorSection";
import ArticlesSection from "@/app/components/landing-page/ArticlesSection";
import CareerSection from "@/app/components/landing-page/CareerSection";
import TestimonialsSection from "@/app/components/landing-page/TestimonialsSection";
import BookingModal from "@/app/components/landing-page/BookingModal";

export default function LandingPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPoli, setSelectedPoli] = useState("Semua");
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [bookingTrack, setBookingTrack] = useState<"umum" | "bpjs">("umum");
  const [bookingDoctor, setBookingDoctor] = useState("");
  const [bookingPoli, setBookingPoli] = useState("");

  const handleOpenBookingModal = (track: "umum" | "bpjs" = "umum", docName = "", poliName = "") => {
    setBookingTrack(track);
    setBookingDoctor(docName);
    setBookingPoli(poliName);
    setIsBookingModalOpen(true);
  };

  const handleDoctorBooking = (docName?: string, poliName?: string) => {
    setBookingDoctor(docName || "");
    setBookingPoli(poliName || "");
    setBookingTrack("umum");
    setIsBookingModalOpen(true);
  };

  const handleSearchChange = (term: string) => {
    setSearchTerm(term);
  };

  const handleSelectPoliFromHero = (poli: string) => {
    const cleanPoli = poli.replace(/Spesialis\s*|Poli\s*/gi, "").trim();
    setSelectedPoli(cleanPoli);
    const docElem = document.getElementById("jadwal-dokter");
    if (docElem) {
      docElem.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <>
      {/* 1. Hero Section + Quick Search Bar ("Avisena, Tetangga Sehatmu") */}
      <HeroSection
        onSearchChange={handleSearchChange}
        onSelectPoli={handleSelectPoliFromHero}
        onOpenBookingModal={() => handleOpenBookingModal("umum")}
      />

      {/* 2. Modul Alur Pendaftaran 2 Jalur (BPJS Mobile JKN vs Umum/Asuransi WA) */}
      <RegistrationSection onOpenBookingModal={handleOpenBookingModal} />

      {/* 3. Showcase Layanan Unggulan 24 Jam & Rawat Inap VIP New Look + Poliklinik */}
      <ServicesSection
        onSelectPoli={handleSelectPoliFromHero}
        onOpenBookingModal={(poliName) => handleOpenBookingModal("umum", "", poliName || "")}
      />

      {/* 4. Jadwal Dokter Spesialis dengan Format Filter Lengkap (Pencarian & Poli) */}
      <DoctorsSection
        searchTerm={searchTerm}
        selectedPoliProp={selectedPoli}
        onOpenBookingModal={handleDoctorBooking}
      />

      {/* 5. Nilai & Akar Sejarah Lokal RSU Avisena Cimahi ("Lahir dari Rumah dr. Lia di Melong") */}
      <AboutCimahiSection />

      {/* 6. Edukasi & Kalkulator Kesehatan Interaktif Warga */}
      <HealthCalculatorSection />

      {/* 7. Artikel Edukasi Kesehatan Terkini */}
      <ArticlesSection />

      {/* 8. Peluang Karir Medis & Non-Medis RSU Avisena */}
      <CareerSection />

      {/* 9. Testimoni Pasien & Warga Cimahi */}
      <TestimonialsSection />

      {/* Interactive Booking Modal */}
      <BookingModal
        isOpen={isBookingModalOpen}
        onClose={() => setIsBookingModalOpen(false)}
        defaultTrack={bookingTrack}
        selectedDoctorName={bookingDoctor}
        selectedPoliName={bookingPoli}
      />
    </>
  );
}
