// File: tailwind.config.ts
import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    // Pastikan path ini sesuai dengan struktur proyek Anda
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",

    // Tambahkan ini jika Anda menggunakan direktori `src`
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};
export default config;
