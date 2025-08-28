// File: app/layout.tsx
// Ini adalah layout root yang membungkus SELURUH aplikasi.
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

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
      <body className={inter.className}>{children}</body>
    </html>
  );
}
