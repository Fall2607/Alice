// File: app/components/Header.tsx
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Menu, X, Globe, Mail, Instagram, Facebook } from "lucide-react";

// Komponen Ikon TikTok SVG kustom
const TikTokIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M12.528 8.755A3.834 3.834 0 0 1 15.32 6.1h1.434v3.837a1.43 1.43 0 0 0 1.43 1.43h2.382V14a7.61 7.61 0 0 1-5.717 5.717v2.855a.571.571 0 0 1-.571.572h-2.858a.571.571 0 0 1-.571-.572v-9.143a3.834 3.834 0 0 1-3.263-3.803 3.834 3.834 0 0 1 3.804-3.834Z" />
  </svg>
);

// Komponen untuk Top Header
const TopHeader = () => (
  <div className="bg-primary-dark text-white text-sm py-2">
    <div className="container mx-auto px-6 flex justify-between items-center">
      <div className="hidden md:flex items-center space-x-6">
        <div className="flex items-center space-x-2">
          <Globe size={16} />
          <a
            href="https://rsavisena.co.id"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:underline"
          >
            rsavisena.co.id
          </a>
        </div>
        <div className="flex items-center space-x-2">
          <Mail size={16} />
          <a href="mailto:rsuavisena@gmail.com" className="hover:underline">
            rsuavisena@gmail.com
          </a>
        </div>
      </div>
      <div className="w-full md:w-auto flex justify-center md:justify-end items-center space-x-4">
        <Link href="/terms" className="hover:underline text-xs">
          Terms & Conditions
        </Link>
        <span className="text-gray-400">|</span>
        <Link href="/privacy" className="hover:underline text-xs">
          Privacy Policy
        </Link>
        <span className="text-gray-400">|</span>
        <Link href="/contact" className="hover:underline text-xs">
          Contact Us
        </Link>
      </div>
    </div>
  </div>
);

// Komponen Header Utama
export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    if (isMenuOpen) setIsMenuOpen(false);
  }, [pathname]);

  const navLinks = [
    { href: "/", label: "Beranda" },
    { href: "/layanan", label: "Layanan" },
    { href: "/dokter", label: "Dokter" },
    { href: "/tentang", label: "Tentang Kami" },
  ];

  const socialLinks = [
    { href: "https://instagram.com", icon: Instagram, label: "Instagram" },
    { href: "https://facebook.com", icon: Facebook, label: "Facebook" },
    { href: "https://tiktok.com", icon: TikTokIcon, label: "TikTok" },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50">
      <TopHeader />
      <div className="bg-white/80 backdrop-blur-lg shadow-sm">
        <div className="container mx-auto px-6 flex justify-between items-center h-24">
          <div className="flex-shrink-0">
            <Link href="/">
              <Image
                src="/brand-avisena.png"
                alt="Logo RSU Avisena"
                width={75}
                height={75}
                priority
                className="object-contain"
              />
            </Link>
          </div>
          <nav className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`transition-colors duration-300 ${
                    isActive
                      ? "text-primary font-semibold"
                      : "text-gray-600 font-medium hover:text-primary"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>
          <div className="hidden md:flex items-center space-x-6">
            <div className="flex items-center space-x-4">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.label}
                  className="text-gray-500 hover:text-primary transition-all duration-300 hover:scale-110"
                >
                  <social.icon className="h-5 w-5" />
                </a>
              ))}
            </div>
            <Link
              href="/buat-janji"
              className="bg-primary text-white px-6 py-2 rounded-full hover:bg-secondary transition-all duration-300 transform hover:scale-105 text-sm font-semibold"
            >
              Buat Janji
            </Link>
          </div>
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label="Toggle Menu"
            >
              <Menu className="h-7 w-7 text-gray-700" />
            </button>
          </div>
        </div>
        <div
          className={`md:hidden fixed inset-0 z-40 transition-opacity duration-300 ${
            isMenuOpen ? "opacity-100" : "opacity-0 pointer-events-none"
          }`}
        >
          <div
            className="fixed inset-0 bg-black/30 backdrop-blur-sm"
            onClick={() => setIsMenuOpen(false)}
          ></div>
          <div
            className={`fixed top-0 left-0 h-full w-72 bg-white shadow-xl z-50 p-6 transform transition-transform duration-300 ease-in-out ${
              isMenuOpen ? "translate-x-0" : "-translate-x-full"
            }`}
          >
            <div className="flex justify-between items-center mb-8">
              <span className="font-bold text-lg">Menu</span>
              <button onClick={() => setIsMenuOpen(false)}>
                <X className="h-6 w-6" />
              </button>
            </div>
            <nav className="flex flex-col space-y-5">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-gray-700 hover:text-primary text-lg"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
            <div className="border-t my-6"></div>
            <div className="flex space-x-5">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.label}
                  className="text-gray-500 hover:text-primary transition-colors"
                >
                  <social.icon className="h-6 w-6" />
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
