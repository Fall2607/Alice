// File: app/components/admin/Sidebar.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Stethoscope,
  HeartPulse,
  Newspaper,
  LogOut,
  Search,
} from "lucide-react";
import Modal from "@/app/components/modal"; // Path diubah menjadi relatif

const navItems = [
  { href: "/admin", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/admin/dokter", icon: Stethoscope, label: "Dokter" },
  { href: "/admin/layanan", icon: HeartPulse, label: "Layanan" },
  { href: "/admin/artikel", icon: Newspaper, label: "Artikel" },
];

// Menambahkan interface untuk props
interface SidebarProps {
  isCollapsed: boolean;
}

export default function Sidebar({ isCollapsed }: SidebarProps) {
  const pathname = usePathname();
  const [searchTerm, setSearchTerm] = useState("");
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

  const filteredNavItems = navItems.filter((item) =>
    item.label.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <>
      <aside className={`flex h-screen flex-col overflow-y-auto bg-white py-6 transition-all duration-300 ${isCollapsed ? "w-20 px-2" : "w-64 px-5"}`}>
        <div className={`text-center transition-all duration-300 ${isCollapsed ? 'h-10' : ''}`}>
          <h2 className={`text-2xl font-bold text-primary-dark tracking-wider transition-opacity duration-200 ${isCollapsed ? 'opacity-0 h-0' : 'opacity-100'}`}>
            Admin Side
          </h2>
        </div>

        {/* User Profile Section */}
        <div className={`border-y border-slate-200 py-2 my-4 flex items-center transition-all duration-300 ${isCollapsed ? 'justify-center' : 'px-1'}`}>
          <Image
            src="https://placehold.co/100x100/84c1ba/f2f2f2?text=Karir+di+RS+Avisena"
            alt="Foto Profil Admin"
            width={40}
            height={40}
            className="h-10 w-10 rounded-full object-cover flex-shrink-0"
          />
          <div className={`${isCollapsed ? 'hidden' : 'block'}`}>
            <p className="text-sm font-medium text-slate-800">FallenNight</p>
            <p className="text-xs text-slate-500">Administrator</p>
          </div>
        </div>

        {/* Kolom Pencarian */}
        <div className={`relative mb-2 transition-all duration-300 ${isCollapsed ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
          <input
            type="text"
            placeholder="Cari menu..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-lg border border-slate-300 bg-white py-2 pl-10 pr-4 text-sm text-slate-900 placeholder-slate-400 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          />
          <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
        </div>

        <div className="flex flex-1 flex-col justify-between">
          <nav className="-mx-1 space-y-1">
            {filteredNavItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  title={isCollapsed ? item.label : undefined}
                  className={`flex transform items-center rounded-lg px-3 py-2 text-slate-600 transition-colors duration-300 hover:bg-slate-100 hover:text-slate-800 ${isActive ? "bg-slate-900 text-white font-bold hover:bg-slate-900 hover:text-white" : ""} ${isCollapsed ? "justify-center" : ""}`}
                >
                  <item.icon className="h-4.5 w-4.5 flex-shrink-0" aria-hidden="true" />
                  <span className={`mx-2 text-xs font-medium transition-opacity duration-200 ${isCollapsed ? 'opacity-0 hidden' : 'opacity-100'}`}>{item.label}</span>
                </Link>
              );
            })}
          </nav>
          <div className="mt-6">
            <button
              onClick={() => setIsLogoutModalOpen(true)}
              title={isCollapsed ? "Keluar" : undefined}
              className={`flex w-full transform items-center rounded-lg px-3 py-2 text-slate-600 transition-colors duration-300 hover:bg-slate-100 hover:text-slate-800 ${isCollapsed ? "justify-center" : ""}`}
            >
              <LogOut className="h-4.5 w-4.5 flex-shrink-0" aria-hidden="true" />
              <span className={`mx-2 text-xs font-medium transition-opacity duration-200 ${isCollapsed ? 'opacity-0 hidden' : 'opacity-100'}`}>Keluar</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Modal Konfirmasi Logout */}
      <Modal
        isOpen={isLogoutModalOpen}
        onClose={() => setIsLogoutModalOpen(false)}
        title="Konfirmasi Keluar"
      >
        <div>
          <p className="text-slate-600">
            Apakah Anda yakin ingin keluar dari halaman admin?
          </p>
          <div className="mt-6 flex justify-end gap-4">
            <button
              onClick={() => setIsLogoutModalOpen(false)}
              className="rounded-full bg-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-300"
            >
              Batal
            </button>
            <Link
              href="/"
              className="rounded-full bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700"
            >
              Ya, Keluar
            </Link>
          </div>
        </div>
      </Modal>
    </>
  );
}
