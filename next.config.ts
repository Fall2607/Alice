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
      {
        protocol: "http",
        hostname: "182.253.37.110",
        port: "4000",
        pathname: "/**",
      },
      {
        protocol: "http",
        hostname: "192.168.100.10",
        port: "4000",
        pathname: "/**",
      },
      {
        protocol: "http",
        hostname: "localhost",
        port: "4000",
        pathname: "/**",
      },
      // Tambahkan hostname lain di sini jika Anda menggunakan storage cloud (misal: S3 atau Firebase)
    ],
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  /* Opsi konfigurasi lainnya bisa ditambahkan di bawah ini */
};

export default nextConfig;