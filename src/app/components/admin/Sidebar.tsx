"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import * as LucideIcons from "lucide-react";
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
  Badge,
  ShieldCheck,
  UserCheck,
  Users,
  Send,
  X,
  Loader2,
  HelpCircle
} from "lucide-react";

// Tipe data untuk user yang login
interface LoggedInUser {
  name: string;
  role: string;
  role_id?: string;
  jenis_kelamin?: string;
}

/**
 * Data menu fallback (statis) untuk diekspor ke modul lain 
 * atau digunakan saat API belum memberikan data.
 */
export const menuItems = [
  { href: "/admin", icon: "LayoutDashboard", label: "Dashboard" },
  { href: "/admin/pegawai", icon: "Users", label: "Pegawai" },
  { href: "/admin/request-pegawai", icon: "Send", label: "Request Pegawai" },
  { href: "/admin/lowongan", icon: "ClipboardList", label: "Lowongan" },
  {
    label: "Setting Web",
    icon: "Settings",
    subItems: [
      { href: "/admin/dokter", icon: "Stethoscope", label: "Dokter" },
      { href: "/admin/layanan", icon: "HeartPulse", label: "Layanan" },
      { href: "/admin/artikel", icon: "Newspaper", label: "Artikel" },
    ],
  },
  {
    label: "Setting HRIS",
    icon: "Briefcase",
    subItems: [
      { href: "/admin/job-positions", icon: "FileText", label: "Posisi Pekerjaan" },
      { href: "/admin/jabatan", icon: "Badge", label: "Jabatan" },
      { href: "/admin/departemen", icon: "Building2", label: "Departemen" },
      { href: "/admin/password-test", icon: "KeyRound", label: "Password Test" },
    ],
  },
  {
    label: "Setting Auth",
    icon: "ShieldCheck",
    subItems: [
      { href: "/admin/role", icon: "UserCheck", label: "Role" },
      { href: "/admin/user", icon: "Users", label: "User" },
    ],
  },
];

interface SidebarProps {
  isCollapsed: boolean;
  openLogoutModal: () => void;
  closeLogoutModal: () => void;
  isLogoutModalOpen: boolean;
  user: LoggedInUser | null;
}

/**
 * Helper untuk merender ikon Lucide berdasarkan string nama dari Database
 */
const DynamicIcon = ({ name, className }: { name: string; className?: string }) => {
  const IconComponent = (LucideIcons as any)[name];
  if (!IconComponent) return <HelpCircle className={className} />;
  return <IconComponent className={className} />;
};

/**
 * Modal konfirmasi logout sederhana (Gaya Klasik)
 */
const InternalModal = ({ isOpen, onClose, title, children }: { isOpen: boolean; onClose: () => void; title: string; children: React.ReactNode }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md bg-white rounded-lg shadow-xl overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-slate-200">
          <h3 className="text-lg font-bold text-slate-800">{title}</h3>
          <button onClick={onClose} className="p-1 hover:bg-slate-100 rounded-full transition-colors text-slate-500">
            <X size={20} />
          </button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
};

export default function Sidebar({
  isCollapsed,
  openLogoutModal,
  closeLogoutModal,
  isLogoutModalOpen,
  user,
}: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [displayMenus, setDisplayMenus] = useState<any[]>(menuItems);
  const [isLoading, setIsLoading] = useState(true);
  const [openMenu, setOpenMenu] = useState<string | null>(null);

  /**
   * Mengambil data menu asli dari API berdasarkan role user
   */
  useEffect(() => {
    const fetchMenu = async () => {
      if (!user?.role_id) {
        setIsLoading(false);
        return;
      }
      
      try {
        const response = await fetch(`/api/auth/menu?roleId=${user.role_id}`);
        if (!response.ok) throw new Error("API Gagal");
        const data = await response.json();
        
        if (Array.isArray(data) && data.length > 0) {
          setDisplayMenus(data);
        }
      } catch (err) {
        console.error("Gagal memuat menu dinamis:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMenu();
  }, [user?.role_id]);

  useEffect(() => {
    const activeParent = displayMenus.find((item) =>
      item.subItems?.some((sub: any) => pathname.startsWith(sub.href))
    );
    if (activeParent) setOpenMenu(activeParent.label);
  }, [pathname, displayMenus]);

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("user");
    router.push("/login");
  };

  const handleMenuClick = (label: string) => {
    setOpenMenu(openMenu === label ? null : label);
  };

  const filteredMenuItems = useMemo(() => {
    return displayMenus
      .map((item) => {
        const matchesParent = item.label.toLowerCase().includes(searchTerm.toLowerCase());
        const filteredSubItems = item.subItems?.filter((sub: any) =>
          sub.label.toLowerCase().includes(searchTerm.toLowerCase())
        );

        if (matchesParent || (filteredSubItems && filteredSubItems.length > 0)) {
          return { ...item, subItems: filteredSubItems || item.subItems };
        }
        return null;
      })
      .filter((x) => x !== null);
  }, [displayMenus, searchTerm]);

  // Skema gambar default berdasarkan jenis kelamin
  const defaultProfileImage = user?.jenis_kelamin === "Perempuan" 
    ? "/img/potrait/woman.jpg" 
    : "/img/potrait/man.jpg";

  return (
    <>
      <aside
        className={`flex h-screen flex-col overflow-y-auto shadow-lg bg-white py-8 transition-all duration-300 ${
          isCollapsed ? "w-20 px-2" : "w-64 px-5"
        }`}
      >
        <div className={`mb-4 text-center transition-all ${isCollapsed ? "h-10" : ""}`}>
          <h2 className={`text-2xl font-bold text-primary-dark tracking-wider transition-opacity ${isCollapsed ? "opacity-0 h-0" : "opacity-100"}`}>
            Admin Side
          </h2>
        </div>

        <div className={`border-y border-slate-200 py-4 my-4 flex items-center gap-3 transition-all ${isCollapsed ? "justify-center" : "px-1"}`}>
          <div className="relative h-10 w-10 flex-shrink-0">
            <Image
              src={defaultProfileImage}
              alt="Foto Profil"
              fill
              sizes="40px"
              className="rounded-full object-cover"
            />
          </div>
          <div className={`${isCollapsed ? "hidden" : "block"} overflow-hidden text-left`}>
            <p className="text-sm font-medium text-slate-800 truncate">
              {user?.name || "User"}
            </p>
            <p className="text-xs text-slate-500">{user?.role || "Role"}</p>
          </div>
        </div>

        <div className={`relative mb-2 transition-all ${isCollapsed ? "opacity-0 pointer-events-none" : "opacity-100"}`}>
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
            {isLoading ? (
               <div className="flex justify-center py-4"><Loader2 className="animate-spin text-slate-400" size={20} /></div>
            ) : filteredMenuItems.map((item) => {
              if (item.subItems && item.subItems.length > 0) {
                const isParentActive = item.subItems.some((sub: any) => pathname.startsWith(sub.href));
                const isOpen = openMenu === item.label;
                return (
                  <div key={item.label}>
                    <button
                      onClick={() => handleMenuClick(item.label)}
                      className={`flex w-full transform items-center justify-between rounded-lg px-3 py-2 transition-colors duration-300 hover:bg-slate-100 ${
                        isParentActive ? "font-bold text-primary-dark" : "text-slate-600"
                      } ${isCollapsed ? "justify-center" : ""}`}
                    >
                      <div className="flex items-center">
                        <DynamicIcon name={item.icon} className="h-[18px] w-[18px] flex-shrink-0" />
                        <span className={`mx-2 text-xs font-medium transition-opacity ${isCollapsed ? "opacity-0 hidden" : "opacity-100"}`}>
                          {item.label}
                        </span>
                      </div>
                      {!isCollapsed && (
                        <ChevronDown className={`h-4 w-4 transform transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`} />
                      )}
                    </button>
                    <div className={`overflow-hidden transition-all duration-300 ease-in-out ${!isCollapsed && isOpen ? "max-h-96" : "max-h-0"}`}>
                      <ul className="ml-4 mt-1 border-l border-slate-200 pl-4 space-y-1 py-1 text-left">
                        {item.subItems.map((subItem: any) => (
                          <li key={subItem.href}>
                            <Link
                              href={subItem.href}
                              className={`flex transform items-center rounded-lg px-3 py-2 transition-colors duration-300 ${
                                pathname === subItem.href ? "bg-primary-dark text-white font-bold" : "text-slate-600 hover:bg-slate-100"
                              }`}
                            >
                              <DynamicIcon name={subItem.icon} className="h-4 w-4 flex-shrink-0" />
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
                  href={item.href || "#"}
                  title={isCollapsed ? item.label : undefined}
                  className={`flex transform items-center rounded-lg px-3 py-2 transition-colors duration-300 ${
                    pathname === item.href ? "bg-primary-dark text-white font-bold" : "text-slate-600 hover:bg-slate-100"
                  } ${isCollapsed ? "justify-center" : ""}`}
                >
                  <DynamicIcon name={item.icon} className="h-[18px] w-[18px] flex-shrink-0" />
                  <span className={`mx-2 text-xs font-medium transition-opacity ${isCollapsed ? "opacity-0 hidden" : "opacity-100"}`}>
                    {item.label}
                  </span>
                </Link>
              );
            })}
          </nav>
          <div className="mt-6">
            <button
              onClick={openLogoutModal}
              title={isCollapsed ? "Keluar" : undefined}
              className={`flex w-full transform items-center rounded-lg px-3 py-2 text-slate-600 transition-colors duration-300 hover:bg-slate-100 hover:text-slate-800 ${isCollapsed ? "justify-center" : ""}`}
            >
              <LogOut className="h-[18px] w-[18px] flex-shrink-0" />
              <span className={`mx-2 text-xs font-medium transition-opacity ${isCollapsed ? "opacity-0 hidden" : "opacity-100"}`}>
                Keluar
              </span>
            </button>
          </div>
        </div>
      </aside>

      <InternalModal isOpen={isLogoutModalOpen} onClose={closeLogoutModal} title="Konfirmasi Keluar">
        <p className="text-slate-600 text-sm">Apakah Anda yakin ingin keluar dari halaman admin?</p>
        <div className="mt-6 flex justify-end gap-4">
          <button onClick={closeLogoutModal} className="rounded-full bg-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-300">Batal</button>
          <button onClick={handleLogout} className="rounded-full bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700">Ya, Keluar</button>
        </div>
      </InternalModal>
    </>
  );
}