// File: app/components/admin/Sidebar.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Stethoscope,
  HeartPulse,
  Newspaper,
  LogOut,
  Search,
} from "lucide-react";

const navItems = [
  { href: "/admin", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/admin/dokter", icon: Stethoscope, label: "Dokter" },
  { href: "/admin/layanan", icon: HeartPulse, label: "Layanan" },
  { href: "/admin/artikel", icon: Newspaper, label: "Artikel" },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [searchTerm, setSearchTerm] = useState("");

  const filteredNavItems = navItems.filter((item) =>
    item.label.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <aside className="flex h-screen w-64 flex-col overflow-y-auto bg-primary-dark px-5 py-8">
      <div className="mb-6 text-center">
        <h2 className="text-2xl font-bold text-white tracking-wider">
          Admin Side
        </h2>
      </div>

      {/* Kolom Pencarian */}
      <div className="relative mb-6">
        <input
          type="text"
          placeholder="Cari menu..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full rounded-full border border-primary bg-primary-dark py-2 pl-10 pr-4 text-sm text-white placeholder-slate-400 focus:border-secondary focus:outline-none focus:ring-1 focus:ring-secondary"
        />
        <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
      </div>

      <div className="flex flex-1 flex-col justify-between">
        <nav className="-mx-3 space-y-2">
          {filteredNavItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.label}
                href={item.href}
                className={`flex transform items-center rounded-lg px-3 py-2 text-slate-300 transition-colors duration-300 hover:bg-primary hover:text-white ${
                  isActive ? "bg-secondary text-white font-bold" : ""
                }`}
              >
                <item.icon className="h-5 w-5" aria-hidden="true" />
                <span className="mx-2 text-sm font-medium">{item.label}</span>
              </Link>
            );
          })}
        </nav>
        <div className="mt-6">
          <Link
            href="/"
            className="flex transform items-center rounded-lg px-3 py-2 text-slate-300 transition-colors duration-300 hover:bg-primary hover:text-white"
          >
            <LogOut className="h-5 w-5" aria-hidden="true" />
            <span className="mx-2 text-sm font-medium">Keluar</span>
          </Link>
        </div>
      </div>
    </aside>
  );
}
