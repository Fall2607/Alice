// File: app/layout.tsx
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

import Header from "@/app/components/header";
import Footer from "@/app/components/footer";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "RS Avisena - Pelayanan Kesehatan Terbaik",
  description:
    "Rumah Sakit Avisena berkomitmen memberikan perawatan medis berkualitas dengan sentuhan personal.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body className={inter.className}>
        <div className="flex flex-col min-h-screen">
          <Header />
          {/* Tambahkan padding atas di sini untuk memberi ruang bagi header fixed */}
          <main className="flex-grow pt-[50]">
            {" "}
            {/* Perubahan di sini */}
            {children}
          </main>
          <Footer />
        </div>
      </body>
    </html>
  );
}
