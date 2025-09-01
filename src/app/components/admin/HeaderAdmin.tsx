// File: app/components/admin/HeaderAdmin.tsx
"use client";

import { useState, useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { Menu, Search, Bell, User, LogOut, ChevronRight } from "lucide-react";
import Image from "next/image";

interface HeaderAdminProps {
  toggleSidebar: () => void;
  openLogoutModal: () => void;
}

export default function HeaderAdmin({
  toggleSidebar,
  openLogoutModal,
}: HeaderAdminProps) {
  const pathname = usePathname();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const generateBreadcrumbs = () => {
    const pathSegments = pathname.split("/").filter(Boolean);
    const breadcrumbs = pathSegments.map((segment, index) => {
      const href = "/" + pathSegments.slice(0, index + 1).join("/");
      const label = segment.charAt(0).toUpperCase() + segment.slice(1);
      const isLast = index === pathSegments.length - 1;

      return (
        <li key={href} className="flex items-center">
          <Link
            href={href}
            className={`text-sm font-medium ${
              isLast ? "text-slate-800" : "text-slate-500 hover:text-slate-700"
            }`}
          >
            {label}
          </Link>
          {!isLast && <ChevronRight className="h-4 w-4 mx-1 text-slate-400" />}
        </li>
      );
    });
    return breadcrumbs;
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="flex h-16 items-center justify-between px-6 flex-shrink-0">
      <div className="flex items-center gap-4">
        <button
          onClick={toggleSidebar}
          className="text-primary-dark transition-colors hover:text-primary"
        >
          <Menu className="h-6 w-6" />
        </button>
        <nav aria-label="Breadcrumb">
          <ol className="flex items-center space-x-2">
            {generateBreadcrumbs()}
          </ol>
        </nav>
      </div>
      <div className="flex items-center gap-4">
        <div className="relative">
          <input
            type="search"
            placeholder="Cari..."
            className="w-full rounded-lg border border-slate-300 bg-slate-50 py-2 pl-10 pr-4 text-sm text-slate-900 placeholder-slate-400 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          />
          <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
        </div>
        <button className="relative text-slate-500 hover:text-slate-800">
          <Bell className="h-6 w-6" />
          <span className="absolute -top-1 -right-1 flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
          </span>
        </button>
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-2"
          >
            <Image
              src="https://placehold.co/100x100/0173b6/f2f2f2?text=FN"
              alt="Foto Profil Admin"
              width={32}
              height={32}
              className="h-8 w-8 rounded-full object-cover"
            />
          </button>
          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-48 origin-top-right rounded-md bg-white shadow-lg focus:outline-none">
              <div className="py-1">
                <div className="border-b px-4 py-2">
                  <p className="text-sm font-semibold text-slate-800">
                    FallenNight
                  </p>
                  <p className="text-xs text-slate-500">Administrator</p>
                </div>
                <Link
                  href="#"
                  className="flex items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-100"
                >
                  <User className="h-4 w-4" />
                  Profil
                </Link>
                <button
                  onClick={() => {
                    openLogoutModal();
                    setDropdownOpen(false);
                  }}
                  className="w-full text-left flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                >
                  <LogOut className="h-4 w-4" />
                  Keluar
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
