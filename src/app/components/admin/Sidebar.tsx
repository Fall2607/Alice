/** Path: app/components/admin/Sidebar.tsx */

"use client";

import { useState, useEffect, useMemo } from "react";
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
  HelpCircle,
} from "lucide-react";

/** * BAGIAN INTERNAL: Perbaikan untuk kesalahan resolusi pratinjau (Shim untuk Next.js Modules) */
const Link = ({ href, children, className, title }: any) => (
  <a
    href={href}
    className={className}
    title={title}
    onClick={(e) => {
      if (href?.startsWith("#")) e.preventDefault();
    }}
  >
    {children}
  </a>
);

const Image = ({ src, alt, fill, className }: any) => (
  <div
    className={`relative ${className}`}
    style={fill ? { width: "100%", height: "100%" } : {}}
  >
    <img
      src={src}
      alt={alt}
      className={className}
      style={fill ? { width: "100%", height: "100%", objectFit: "cover" } : {}}
    />
  </div>
);

const usePathname = () => {
  if (typeof window !== "undefined") return window.location.pathname;
  return "/admin";
};

const useRouter = () => ({
  push: (path: string) => {
    if (typeof window !== "undefined") window.location.href = path;
  },
});

// --- EXPORTS UNTUK KOMPATIBILITAS ---
export interface MenuItem {
  id?: string;
  href?: string;
  icon: string;
  label: string;
  subItems?: MenuItem[];
}

// Data menu fallback (statis) sesuai struktur asli Anda
export const menuItems: MenuItem[] = [
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
      {
        href: "/admin/job-positions",
        icon: "FileText",
        label: "Posisi Pekerjaan",
      },
      { href: "/admin/jabatan", icon: "Badge", label: "Jabatan" },
      { href: "/admin/departemen", icon: "Building2", label: "Departemen" },
      {
        href: "/admin/password-test",
        icon: "KeyRound",
        label: "Password Test",
      },
    ],
  },
  {
    label: "Setting Auth",
    icon: "ShieldCheck",
    subItems: [
      { href: "/admin/role", icon: "UserCheck", label: "Role" },
      { href: "/admin/user", icon: "Users", label: "User" },
      {
        href: "/admin/role/permissions",
        icon: "ShieldCheck",
        label: "Hak Akses",
      },
    ],
  },
];

interface LoggedInUser {
  name: string;
  role: string;
  role_id?: string;
  jenis_kelamin?: string;
}

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
const DynamicIcon = ({
  name,
  className,
  size = 18,
}: {
  name: string;
  className?: string;
  size?: number;
}) => {
  const IconComponent = (LucideIcons as any)[name];
  if (!IconComponent) return <HelpCircle className={className} size={size} />;
  return <IconComponent className={className} size={size} />;
};

/**
 * Modal konfirmasi logout
 */
const InternalModal = ({ isOpen, onClose, title, children }: any) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden">
        <div className="flex items-center justify-between p-5 border-b border-slate-100">
          <h3 className="text-lg font-bold text-slate-800">{title}</h3>
          <button
            onClick={onClose}
            className="p-1 hover:bg-slate-100 rounded-full text-slate-400"
          >
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
  // Inisialisasi dengan menuItems agar UI langsung tampil tanpa menunggu API (Background Fetch)
  const [displayMenus, setDisplayMenus] = useState<any[]>(menuItems);
  const [openMenu, setOpenMenu] = useState<string | null>(null);

  useEffect(() => {
    const fetchMenu = async () => {
      if (!user?.role_id) return;

      try {
        const response = await fetch(`/api/auth/menu?roleId=${user.role_id}`);
        if (!response.ok) throw new Error("API Gagal");
        const data = await response.json();

        if (Array.isArray(data) && data.length > 0) {
          setDisplayMenus(data);
        }
      } catch (err) {
        console.error("Gagal memuat menu dinamis:", err);
      }
    };

    fetchMenu();
  }, [user?.role_id]);

  useEffect(() => {
    const activeParent = displayMenus.find((item) =>
      item.subItems?.some((sub: any) => pathname.startsWith(sub.href)),
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
    if (!searchTerm) return displayMenus;

    return displayMenus
      .map((item) => {
        const matchesParent = item.label
          .toLowerCase()
          .includes(searchTerm.toLowerCase());
        const filteredSubItems = item.subItems?.filter((sub: any) =>
          sub.label.toLowerCase().includes(searchTerm.toLowerCase()),
        );

        if (
          matchesParent ||
          (filteredSubItems && filteredSubItems.length > 0)
        ) {
          return { ...item, subItems: filteredSubItems || item.subItems };
        }
        return null;
      })
      .filter((x) => x !== null);
  }, [displayMenus, searchTerm]);

  const profileImg =
    user?.jenis_kelamin === "Perempuan"
      ? "/img/potrait/woman.jpg"
      : "/img/potrait/man.jpg";

  return (
    <>
      <aside
        className={`flex h-screen flex-col overflow-y-auto shadow-xl bg-white py-6 transition-all duration-300 border-r border-slate-100 ${
          isCollapsed ? "w-20 px-2" : "w-60 px-4"
        }`}
      >
        {/* Header Brand */}
        <div
          className={`mb-4 text-center transition-all ${isCollapsed ? "h-10" : ""}`}
        >
          <h2
            className={`text-xl font-black text-primary-dark tracking-tighter transition-opacity ${isCollapsed ? "opacity-0 h-0" : "opacity-100"}`}
          >
            Admin Side
          </h2>
        </div>

        {/* Profil Section */}
        <div
          className={`border-y border-slate-100 py-4 my-4 transition-all ${isCollapsed ? "px-0 flex justify-center" : "px-1"}`}
        >
          <Link
            href="/admin/profile"
            className="flex items-center gap-3 group cursor-pointer p-1 rounded-xl transition-all hover:bg-slate-50"
          >
            <div className="relative h-10 w-10 flex-shrink-0">
              <Image
                src={profileImg}
                alt="Foto Profil"
                fill
                className="rounded-full object-cover border-2 border-white shadow-sm group-hover:border-primary transition-all"
              />
              <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-white rounded-full"></div>
            </div>
            {!isCollapsed && (
              <div className="overflow-hidden text-left">
                <p className="text-xs font-black text-slate-800 truncate group-hover:text-primary transition-colors leading-tight">
                  {user?.name || "User Alice"}
                </p>
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
                  {user?.role || "Administrator"}
                </p>
                <p className="text-[9px] font-bold text-blue-600 uppercase tracking-tighter mt-1">
                  Lihat Profil
                </p>
              </div>
            )}
          </Link>
        </div>

        {/* Input Cari Menu */}
        <div
          className={`relative mb-6 transition-all ${isCollapsed ? "opacity-0 pointer-events-none" : "opacity-100 px-1"}`}
        >
          <input
            type="text"
            placeholder="Cari menu..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2 pl-9 pr-3 text-[11px] font-medium text-slate-900 placeholder-slate-400 focus:border-primary focus:bg-white focus:outline-none focus:ring-1 focus:ring-primary transition-all"
          />
          <Search className="absolute left-3.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
        </div>

        {/* Navigation Area */}
        <div className="flex flex-1 flex-col justify-between">
          <nav className="space-y-1 px-1 custom-scrollbar">
            {/* PERBAIKAN: Menghapus blok isLoading spinner. 
                UI akan langsung me-render filteredMenuItems (Fallback awal).
                Saat API selesai, UI akan memperbarui secara halus tanpa interupsi spinner.
            */}
            {filteredMenuItems.map((item) => {
              const hasSubItems = item.subItems && item.subItems.length > 0;
              if (hasSubItems) {
                const isParentActive = item.subItems.some((sub: any) =>
                  pathname.startsWith(sub.href),
                );
                const isOpen = openMenu === item.label;
                return (
                  <div key={item.label} className="mb-0.5">
                    <button
                      onClick={() => handleMenuClick(item.label)}
                      className={`flex w-full items-center justify-between rounded-lg px-3 py-2.5 transition-all duration-300 ${
                        isParentActive
                          ? "bg-primary/5 text-primary font-bold"
                          : "text-slate-500 hover:bg-slate-50 hover:text-primary"
                      } ${isCollapsed ? "justify-center" : ""}`}
                    >
                      <div className="flex items-center">
                        <DynamicIcon
                          name={item.icon}
                          className="flex-shrink-0"
                        />
                        {!isCollapsed && (
                          <span className="mx-2.5 text-xs font-bold">
                            {item.label}
                          </span>
                        )}
                      </div>
                      {!isCollapsed && (
                        <ChevronDown
                          className={`h-3.5 w-3.5 transform transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`}
                        />
                      )}
                    </button>
                    <div
                      className={`overflow-hidden transition-all duration-300 ease-in-out ${!isCollapsed && isOpen ? "max-h-96 opacity-100 mt-1" : "max-h-0 opacity-0"}`}
                    >
                      <ul className="ml-5 border-l-2 border-slate-100 pl-3 space-y-0.5 py-0.5">
                        {item.subItems.map((subItem: any) => (
                          <li key={subItem.href}>
                            <Link
                              href={subItem.href}
                              className={`flex items-center rounded-md px-3 py-2 text-[11px] font-bold transition-all ${
                                pathname === subItem.href
                                  ? "bg-primary text-white shadow-md shadow-primary/20"
                                  : "text-slate-400 hover:text-primary hover:bg-slate-50"
                              }`}
                            >
                              <DynamicIcon
                                name={subItem.icon}
                                className="flex-shrink-0 mr-2"
                                size={14}
                              />
                              <span className="truncate">{subItem.label}</span>
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
                  className={`flex items-center rounded-lg px-3 py-2.5 transition-all duration-300 ${
                    pathname === item.href
                      ? "bg-primary text-white shadow-md shadow-primary/20"
                      : "text-slate-500 hover:bg-slate-50 hover:text-primary"
                  } ${isCollapsed ? "justify-center" : ""}`}
                >
                  <DynamicIcon name={item.icon} className="flex-shrink-0" />
                  {!isCollapsed && (
                    <span className="mx-2.5 text-xs font-bold">
                      {item.label}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Footer Area */}
          <div className="mt-8 border-t border-slate-50 pt-4 px-1">
            <button
              onClick={openLogoutModal}
              className={`flex w-full items-center rounded-lg px-3 py-2.5 text-red-500 font-bold transition-all hover:bg-red-50 ${isCollapsed ? "justify-center" : ""}`}
            >
              <LogOut size={18} className="flex-shrink-0" />
              {!isCollapsed && <span className="mx-2.5 text-xs">Keluar</span>}
            </button>
          </div>
        </div>
      </aside>

      <InternalModal
        isOpen={isLogoutModalOpen}
        onClose={closeLogoutModal}
        title="Konfirmasi Logout"
      >
        <p className="text-slate-600 text-sm font-medium leading-relaxed">
          Apakah Anda yakin ingin keluar dari sesi admin saat ini?
        </p>
        <div className="mt-8 flex justify-end gap-3">
          <button
            onClick={closeLogoutModal}
            className="rounded-xl bg-slate-100 px-5 py-2.5 text-xs font-black uppercase tracking-widest text-slate-500 hover:bg-slate-200 transition-all"
          >
            Batal
          </button>
          <button
            onClick={handleLogout}
            className="rounded-xl bg-red-600 px-5 py-2.5 text-xs font-black uppercase tracking-widest text-white hover:bg-red-700 shadow-lg shadow-red-200 transition-all"
          >
            Keluar
          </button>
        </div>
      </InternalModal>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #f1f5f9;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #e2e8f0;
        }
      `}</style>
    </>
  );
}
