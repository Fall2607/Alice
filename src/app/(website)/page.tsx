// File: app/page.tsx

// Impor semua komponen section yang telah dibuat
import HeroSection from "@/app/components/landing-page/HeroSection";
import ServicesSection from "@/app/components/landing-page/ServicesSection";
import FeaturesSection from "@/app/components/landing-page/FeaturesSection";
import DoctorsSection from "@/app/components/landing-page/DoctorsSection";
import ArticlesSection from "@/app/components/landing-page/ArticlesSection";
import HealthCalculatorSection from "@/app/components/landing-page/HealthCalculatorSection";
import CareerSection from "@/app/components/landing-page/CareerSection";
import TestimonialsSection from "@/app/components/landing-page/TestimonialsSection";

export default function LandingPage() {
  return (
    <>
      <HeroSection />
      <ServicesSection />
      <FeaturesSection />
      <DoctorsSection />
      <ArticlesSection />
      <HealthCalculatorSection />
      <CareerSection />
      <TestimonialsSection />
    </>
  );
}
