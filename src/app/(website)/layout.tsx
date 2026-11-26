"use client";

import Header from "@/app/components/header";
import Footer from "@/app/components/footer";
import FloatingWhatsApp from "@/app/components/FloatingWhatsApp";
import { Kanit } from "next/font/google";
import { usePathname } from "next/navigation";
import "./website.css";

const kanit = Kanit({
  weight: ["300", "400", "500", "600", "700", "800"],
  subsets: ["latin"],
  display: "swap",
  variable: "--font-kanit",
  fallback: ["system-ui", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "sans-serif"],
});

export default function WebsiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className={`website-theme flex flex-col min-h-screen bg-[#F7F9FB] text-[#10162C] ${kanit.className}`}>
      <Header />
      <main className="flex-grow pt-0">
        {children}
      </main>
      <Footer />
      <FloatingWhatsApp />
    </div>
  );
}
