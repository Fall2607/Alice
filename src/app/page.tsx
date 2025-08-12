// File: app/page.tsx

// Impor semua komponen section yang telah dibuat
import HeroSection from "./components/landing-page/HeroSection";
import ServicesSection from "./components/landing-page/ServicesSection";
import FeaturesSection from "./components/landing-page/FeaturesSection";
import DoctorsSection from "./components/landing-page/DoctorsSection";
import ArticlesSection from "./components/landing-page/ArticlesSection"; // Impor section baru
import TestimonialsSection from "./components/landing-page/TestimonialsSection";

export default function LandingPage() {
  return (
    <>
      <HeroSection />
      <ServicesSection />
      <FeaturesSection />
      <DoctorsSection />
      <ArticlesSection /> {/* Tambahkan section baru di sini */}
      <TestimonialsSection />
    </>
  );
}
