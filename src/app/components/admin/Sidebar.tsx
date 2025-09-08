// File: app/components/admin/Sidebar.tsx
"use client";

import { useState, useEffect } from "react";
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
  Settings,
  Briefcase,
  FileText,
  KeyRound,
  ChevronDown,
  ClipboardList,
  Building2,
  Award,
  Send,
  Users,
} from "lucide-react";
import Modal from "@/app/components/modal";

// Ekspor menuItems agar bisa digunakan di komponen lain
export const menuItems = [
  { href: "/admin", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/admin/pegawai", icon: Users, label: "Pegawai" },
  { href: "/admin/request-pegawai", icon: Send, label: "Request Pegawai" },
  { href: "/admin/lowongan", icon: ClipboardList, label: "Lowongan" },
  {
    label: "Setting Web",
    icon: Settings,
    subItems: [
      { href: "/admin/dokter", icon: Stethoscope, label: "Dokter" },
      { href: "/admin/layanan", icon: HeartPulse, label: "Layanan" },
      { href: "/admin/artikel", icon: Newspaper, label: "Artikel" },
    ],
  },
  {
    label: "Setting HRIS",
    icon: Briefcase,
    subItems: [
      { href: "/admin/job-positions", icon: FileText, label: "Posisi Pekerjaan" },
      { href: "/admin/jabatan", icon: Award, label: "Jabatan" }, // Tambahkan menu baru
      { href: "/admin/departemen", icon: Building2, label: "Departemen" },
      { href: "/admin/password-test", icon: KeyRound, label: "Password Test" },
    ],
  },
];

interface SidebarProps {
  isCollapsed: boolean;
  openLogoutModal: () => void;
  closeLogoutModal: () => void;
  isLogoutModalOpen: boolean;
  pendingRequestCount: number;
}

export default function Sidebar({
  isCollapsed,
  openLogoutModal,
  closeLogoutModal,
  isLogoutModalOpen,
  pendingRequestCount,
}: SidebarProps) {
  const pathname = usePathname();
  const [searchTerm, setSearchTerm] = useState("");
  const [openMenu, setOpenMenu] = useState<string | null>(() => {
    const activeParent = menuItems.find(item =>
      item.subItems?.some(sub => pathname.startsWith(sub.href))
    );
    return activeParent?.label || null;
  });

  useEffect(() => {
    if (searchTerm.trim() !== "") {
      const firstMatchingParent = menuItems.find(item =>
        item.subItems?.some(subItem =>
          subItem.label.toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
      if (firstMatchingParent) {
        setOpenMenu(firstMatchingParent.label);
      }
    }
  }, [searchTerm]);

  const handleMenuClick = (label: string) => {
    setOpenMenu(openMenu === label ? null : label);
  };

  const filteredMenuItems = menuItems.map(item => {
    if (!item.subItems) {
      return item.label.toLowerCase().includes(searchTerm.toLowerCase()) ? item : null;
    }
    const filteredSubItems = item.subItems.filter(subItem =>
      subItem.label.toLowerCase().includes(searchTerm.toLowerCase())
    );
    if (filteredSubItems.length > 0) {
      return { ...item, subItems: filteredSubItems };
    }
    if (item.label.toLowerCase().includes(searchTerm.toLowerCase())) {
      return { ...item, subItems: item.subItems };
    }
    return null;
  }).filter(Boolean as unknown as <T>(x: T | null) => x is T);

  return (
    <>
      <aside
        className={`flex h-screen flex-col overflow-y-auto shadow-lg bg-white py-8 transition-all duration-300 ${isCollapsed ? "w-20 px-2" : "w-64 px-5"
          }`}
      >
        <div
          className={`mb-4 text-center transition-all duration-300 ${isCollapsed ? "h-10" : ""
            }`}
        >
          <h2
            className={`text-2xl font-bold text-primary-dark tracking-wider transition-opacity duration-200 ${isCollapsed ? "opacity-0 h-0" : "opacity-100"
              }`}
          >
            Admin Side
          </h2>
        </div>

        <div
          className={`border-y border-slate-200 py-4 my-4 flex items-center gap-3 transition-all duration-300 ${isCollapsed ? "justify-center" : "px-1"
            }`}
        >
          <Image
            src="/img/potrait/woman.jpg"
            alt="Foto Profil Admin"
            width={40}
            height={40}
            className="h-10 w-10 rounded-full object-cover flex-shrink-0"
          />
          <div className={`${isCollapsed ? "hidden" : "block"}`}>
            <p className="text-sm font-medium text-slate-800">FallenNight</p>
            <p className="text-xs text-slate-500">Administrator</p>
          </div>
        </div>

        <div
          className={`relative mb-2 transition-all duration-300 ${isCollapsed ? "opacity-0 pointer-events-none" : "opacity-100"
            }`}
        >
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
            {filteredMenuItems.map((item) => {
              if (item.subItems) {
                const isParentActive = item.subItems.some(sub => pathname.startsWith(sub.href));
                const isOpen = openMenu === item.label;
                return (
                  <div key={item.label}>
                    <button
                      onClick={() => handleMenuClick(item.label)}
                      className={`flex w-full transform items-center justify-between rounded-lg px-3 py-2 transition-colors duration-300 hover:bg-slate-100 ${isParentActive ? "font-bold text-primary-dark" : "text-slate-600"} ${isCollapsed ? "justify-center" : ""}`}
                    >
                      <div className="flex items-center">
                        <item.icon className="h-[18px] w-[18px] flex-shrink-0" aria-hidden="true" />
                        <span className={`mx-2 text-xs font-medium transition-opacity duration-200 ${isCollapsed ? "opacity-0 hidden" : "opacity-100"}`}>
                          {item.label}
                        </span>
                      </div>
                      {!isCollapsed && (
                        <ChevronDown className={`h-4 w-4 transform transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
                      )}
                    </button>
                    <div className={`overflow-hidden transition-all duration-300 ease-in-out ${!isCollapsed && isOpen ? 'max-h-96' : 'max-h-0'}`}>
                      <ul className="ml-4 mt-1 border-l border-slate-200 pl-4 space-y-1 py-1">
                        {item.subItems.map((subItem) => (
                          <li key={subItem.href}>
                            <Link
                              href={subItem.href}
                              className={`flex transform items-center rounded-lg px-3 py-2 transition-colors duration-300 ${pathname === subItem.href ? "bg-primary-dark text-white font-bold hover:bg-primary-dark" : "text-slate-600 hover:bg-slate-100"}`}
                            >
                              <subItem.icon className="h-4 w-4 flex-shrink-0" aria-hidden="true" />
                              <span className="mx-2 text-xs font-medium">{subItem.label}</span>
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                );
              }
              return (
                <Link
                  key={item.label}
                  href={item.href!}
                  title={isCollapsed ? item.label : undefined}
                  className={`flex transform items-center rounded-lg px-3 py-2 transition-colors duration-300 ${pathname === item.href ? "bg-primary-dark text-white font-bold hover:bg-primary-dark" : "text-slate-600 hover:bg-slate-100"} ${isCollapsed ? "justify-center" : ""}`}
                >
                  <item.icon className="h-[18px] w-[18px] flex-shrink-0" aria-hidden="true" />
                  <span className={`mx-2 text-xs font-medium transition-opacity duration-200 ${isCollapsed ? "opacity-0 hidden" : "opacity-100"}`}>
                    {item.label}
                  </span>
                  {item.label === 'Request Pegawai' && pendingRequestCount > 0 && (
                    <span className={`ml-auto flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs text-white ${isCollapsed ? '' : 'mr-2'}`}>
                      {pendingRequestCount}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
          <div className="mt-6">
            <button
              onClick={openLogoutModal}
              title={isCollapsed ? "Keluar" : undefined}
              className={`flex w-full transform items-center rounded-lg px-3 py-2 text-slate-600 transition-colors duration-300 hover:bg-slate-100 hover:text-slate-800 ${isCollapsed ? "justify-center" : ""
                }`}
            >
              <LogOut className="h-[18px] w-[18px] flex-shrink-0" aria-hidden="true" />
              <span className={`mx-2 text-xs font-medium transition-opacity duration-200 ${isCollapsed ? "opacity-0 hidden" : "opacity-100"}`}>
                Keluar
              </span>
            </button>
          </div>
        </div>
      </aside>

      <Modal isOpen={isLogoutModalOpen} onClose={closeLogoutModal} title="Konfirmasi Keluar">
        <div>
          <p className="text-slate-600">
            Apakah Anda yakin ingin keluar dari halaman admin?
          </p>
          <div className="mt-6 flex justify-end gap-4">
            <button
              onClick={closeLogoutModal}
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

