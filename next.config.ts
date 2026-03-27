import type { NextConfig } from "next";

/**
 * Konfigurasi Next.js untuk aplikasi Alice
 * Menambahkan remotePatterns agar next/image diizinkan mengambil gambar dari domain eksternal
 */
const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "ui-avatars.com",
        port: "",
        pathname: "/api/**",
      },
      {
        protocol: "https",
        hostname: "placehold.co",
        port: "",
        pathname: "/**",
      },
      // Tambahkan hostname lain di sini jika Anda menggunakan storage cloud (misal: S3 atau Firebase)
    ],
  },
  /* Opsi konfigurasi lainnya bisa ditambahkan di bawah ini */
};

export default nextConfig;