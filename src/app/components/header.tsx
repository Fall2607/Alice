"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Menu,
  X,
  PhoneCall,
  MessageCircle,
  MapPin,
  CalendarCheck,
  ChevronRight,
  ShieldAlert,
} from "lucide-react";
import AvisenaLogo from "./AvisenaLogo";

interface NavLinkItem {
  href: string;
  label: string;
  sectionId?: string;
}

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState<string>("beranda");
  const pathname = usePathname();

  const isHomePage = pathname === "/";
  // Navbar transparan penuh saat di puncak halaman utama ("/") dan belum di-scroll
  const isTransparentMode = isHomePage && !isScrolled && !isMenuOpen;

  const navLinks: NavLinkItem[] = [
    { href: "/", label: "Beranda", sectionId: "beranda" },
    { href: "/#alur-pendaftaran", label: "Alur Pendaftaran", sectionId: "alur-pendaftaran" },
    { href: "/#layanan", label: "Layanan & Fasilitas", sectionId: "layanan" },
    { href: "/#jadwal-dokter", label: "Jadwal Dokter", sectionId: "jadwal-dokter" },
    { href: "/tentang", label: "Tentang Kami" },
    { href: "/karir", label: "Karir" },
  ];

  // Scroll listener & ScrollSpy
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 40);

      if (pathname !== "/") return;

      if (window.scrollY < 380) {
        setActiveSection("beranda");
        return;
      }

      const trackedSections = ["alur-pendaftaran", "layanan", "jadwal-dokter"];
      const viewportTrigger = 240;

      let currentDetected = "";
      for (const id of trackedSections) {
        const el = document.getElementById(id);
        if (el) {
          const rect = el.getBoundingClientRect();
          if (rect.top <= viewportTrigger && rect.bottom >= 140) {
            currentDetected = id;
            break;
          }
        }
      }

      if (currentDetected) {
        setActiveSection(currentDetected);
      }
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [pathname]);

  useEffect(() => {
    if (isMenuOpen) setIsMenuOpen(false);
  }, [pathname]);

  const checkIsActive = (link: NavLinkItem): boolean => {
    if (pathname === "/") {
      if (link.sectionId) {
        return activeSection === link.sectionId;
      }
      return false;
    }

    if (link.href !== "/" && !link.href.startsWith("/#")) {
      return pathname === link.href || pathname.startsWith(`${link.href}/`);
    }

    if (pathname.startsWith("/dokter") && link.sectionId === "jadwal-dokter") return true;
    if (pathname.startsWith("/layanan") && link.sectionId === "layanan") return true;

    return false;
  };

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, link: NavLinkItem) => {
    if (pathname === "/" && link.sectionId) {
      e.preventDefault();
      setActiveSection(link.sectionId);
      setIsMenuOpen(false);

      if (link.sectionId === "beranda") {
        window.scrollTo({ top: 0, behavior: "smooth" });
        window.history.pushState(null, "", "/");
      } else {
        const targetEl = document.getElementById(link.sectionId);
        if (targetEl) {
          const headerOffset = 105;
          const elementPosition = targetEl.getBoundingClientRect().top;
          const offsetPosition = elementPosition + window.scrollY - headerOffset;
          window.scrollTo({ top: offsetPosition, behavior: "smooth" });
          window.history.pushState(null, "", `/#${link.sectionId}`);
        }
      }
    } else {
      setIsMenuOpen(false);
    }
  };

  return (
    <header
      className={`${
        isHomePage ? "fixed top-0 left-0 right-0" : "sticky top-0"
      } z-50 transition-all duration-300`}
    >
      {/* Top Utility Bar Minimalis: Transparan lembut di atas Hero, Solid Biru #154C96 saat di-scroll */}
      <div
        className={`text-xs hidden md:block transition-all duration-300 ${
          isTransparentMode
            ? "bg-black/25 backdrop-blur-[2px] text-white/90 border-b border-white/10"
            : "bg-[#154C96] text-white/95 border-b border-white/10"
        }`}
      >
        <div className="container mx-auto px-4 lg:px-8 py-1.5 flex justify-between items-center font-sans">
          <div className="flex items-center gap-1.5">
            <MapPin size={13} className="text-white/80" />
            <span className="font-medium">Jl. Melong No. 170, Cimahi Selatan, Kota Cimahi</span>
          </div>

          <a
            href="tel:0226000830"
            className="flex items-center gap-1.5 text-white/90 hover:text-white font-medium transition-colors"
            title="Hubungi IGD RSU Avisena"
          >
            <PhoneCall size={13} className="text-white/80" />
            <span>
              IGD: <strong className="font-mono tabular-nums font-semibold">(022) 6000830</strong>
            </span>
          </a>
        </div>
      </div>

      {/* Main Navbar: Clear/Transparan saat di atas gambar Parallax, berubah menjadi Putih Solid saat di-scroll */}
      <div
        className={`transition-all duration-300 ${
          isTransparentMode
            ? "bg-transparent border-b border-transparent py-4"
            : "bg-white/95 backdrop-blur-md shadow-md border-b border-slate-200/80 py-2.5"
        }`}
      >
        <div className="container mx-auto px-4 lg:px-8 flex justify-between items-center">
          {/* Logo RSU Avisena Cimahi (Putih saat transparan di atas gambar, Full Color saat navbar putih muncul) */}
          <Link
            href="/"
            onClick={(e) => handleNavClick(e, { href: "/", label: "Beranda", sectionId: "beranda" })}
            className="group flex items-center gap-2"
          >
            <AvisenaLogo
              variant="horizontal"
              colorMode={isTransparentMode ? "white" : "full"}
              height={isTransparentMode ? 48 : 44}
            />
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden lg:flex items-center space-x-2">
            {navLinks.map((link) => {
              const isActive = checkIsActive(link);
              return (
                <Link
                  key={link.label}
                  href={link.href}
                  onClick={(e) => handleNavClick(e, link)}
                  className={`text-sm px-3.5 py-2 rounded-xl transition-all duration-200 relative ${
                    isTransparentMode
                      ? isActive
                        ? "text-white font-bold bg-white/15 backdrop-blur-xs after:absolute after:bottom-1 after:left-3.5 after:right-3.5 after:h-0.5 after:bg-[#2dd4bf] after:rounded-full"
                        : "text-white/90 font-semibold hover:text-white hover:bg-white/10"
                      : isActive
                      ? "text-[#154C96] font-bold bg-[#00A79C]/10 after:absolute after:bottom-1 after:left-3.5 after:right-3.5 after:h-0.5 after:bg-[#00A79C] after:rounded-full"
                      : "text-slate-600 font-semibold hover:text-[#154C96] hover:bg-slate-50"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* Sisi Kanan: Tombol CTA Utama (Avisena Orange #F69320) */}
          <div className="hidden sm:flex items-center gap-3">
            <a
              href="/#alur-pendaftaran"
              onClick={(e) =>
                handleNavClick(e, {
                  href: "/#alur-pendaftaran",
                  label: "Alur Pendaftaran",
                  sectionId: "alur-pendaftaran",
                })
              }
              className="bg-[#F69320] hover:bg-[#e07f10] text-white px-5 py-2.5 rounded-full font-bold text-xs uppercase tracking-wider shadow-md hover:shadow-lg transition-all active:scale-95 flex items-center gap-2"
            >
              <CalendarCheck size={15} />
              <span>Daftar Online</span>
            </a>
          </div>

          {/* Mobile Menu Hamburger Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className={`lg:hidden p-2 rounded-xl transition-colors cursor-pointer ${
              isTransparentMode
                ? "text-white hover:bg-white/15"
                : "text-slate-700 hover:bg-slate-100"
            }`}
            aria-label="Buka Menu"
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Navigation */}
      {isMenuOpen && (
        <div className="lg:hidden bg-white/98 backdrop-blur-xl border-b border-slate-200 shadow-xl animate-in slide-in-from-top-3 duration-200">
          <div className="container mx-auto px-6 py-5 space-y-4">
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldAlert size={18} className="text-[#154C96]" />
                <div>
                  <p className="text-[10px] font-bold uppercase text-slate-500">IGD 24 Jam Cimahi</p>
                  <p className="text-xs font-black text-slate-800 font-mono tabular-nums">(022) 6000830</p>
                </div>
              </div>
              <a
                href="tel:0226000830"
                className="bg-[#154C96] text-white text-[11px] font-bold px-3 py-1.5 rounded-lg active:scale-95"
              >
                Panggil
              </a>
            </div>

            <nav className="flex flex-col space-y-1">
              {navLinks.map((link) => {
                const isActive = checkIsActive(link);
                return (
                  <Link
                    key={link.label}
                    href={link.href}
                    onClick={(e) => handleNavClick(e, link)}
                    className={`px-3.5 py-2.5 rounded-xl font-semibold transition-colors flex items-center justify-between text-sm ${
                      isActive
                        ? "bg-[#154C96] text-white font-bold shadow-2xs"
                        : "text-slate-700 hover:text-[#154C96] hover:bg-blue-50/60"
                    }`}
                  >
                    <span>{link.label}</span>
                    <ChevronRight size={16} className={isActive ? "text-[#00A79C]" : "text-slate-400"} />
                  </Link>
                );
              })}
            </nav>

            <div className="pt-2 border-t border-slate-100 flex flex-col gap-2">
              <a
                href="/#alur-pendaftaran"
                onClick={(e) =>
                  handleNavClick(e, {
                    href: "/#alur-pendaftaran",
                    label: "Alur Pendaftaran",
                    sectionId: "alur-pendaftaran",
                  })
                }
                className="w-full bg-[#F69320] hover:bg-[#e07f10] text-white py-3 rounded-xl font-bold text-center text-xs uppercase tracking-wider shadow-xs flex items-center justify-center gap-2"
              >
                <CalendarCheck size={16} />
                <span>Daftar Rawat Jalan Online</span>
              </a>

              <a
                href="https://wa.me/6281220200170?text=Halo%20Admin%20RSU%20Avisena%20Cimahi"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full bg-emerald-50 text-emerald-700 border border-emerald-200/80 py-2.5 rounded-xl font-bold text-center text-xs flex items-center justify-center gap-2"
              >
                <MessageCircle size={15} />
                <span>WhatsApp Care (0812-2020-0170)</span>
              </a>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
