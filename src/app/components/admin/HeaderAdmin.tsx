/** Path: app/components/admin/HeaderAdmin.tsx
 * Deskripsi: Komponen Header Admin Alice dengan Breadcrumbs dinamis.
 * Perbaikan: Menghapus import statis menuItems dan menggunakan caching localStorage.
 */

"use client";

import React, { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import {
  Search,
  Bell,
  Menu as MenuIcon,
  User,
  LogOut,
  ChevronRight,
  Shield,
} from "lucide-react";

// Tipe data lokal untuk sinkronisasi
interface MenuItem {
  label: string;
  href?: string;
  subItems?: MenuItem[] | null;
}

interface LoggedInUser {
  name: string;
  role: string;
  role_id?: string;
  jenis_kelamin?: string;
}

interface HeaderAdminProps {
  toggleSidebar: () => void;
  openLogoutModal: () => void;
  user: LoggedInUser | null;
}

export default function HeaderAdmin({
  toggleSidebar,
  openLogoutModal,
  user,
}: HeaderAdminProps) {
  const [isDropdownOpen, setDropdownOpen] = useState(false);
  const [breadcrumbs, setBreadcrumbs] = useState<string[]>([]);
  const pathname = usePathname();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);

    /**
     * LOGIKA BREADCRUMBS DINAMIS:
     * Mengambil data menu dari localStorage agar label sesuai dengan database.
     */
    const cachedMenu = localStorage.getItem(`sidebar_menu_${user?.role_id}`);
    const menuData: MenuItem[] = cachedMenu ? JSON.parse(cachedMenu) : [];

    const pathParts = pathname.split("/").filter((part) => part);
    const labels: string[] = ["Admin"];

    const findLabelRecursive = (
      items: MenuItem[],
      targetPath: string,
    ): string | null => {
      for (const item of items) {
        if (item.href === targetPath) return item.label;
        if (item.subItems) {
          const found = findLabelRecursive(item.subItems, targetPath);
          if (found) return found;
        }
      }
      return null;
    };

    if (pathParts.length === 1 && pathParts[0] === "admin") {
      labels.push("Dashboard");
    } else {
      let currentPath = "/admin";
      for (let i = 1; i < pathParts.length; i++) {
        currentPath += `/${pathParts[i]}`;
        const label = findLabelRecursive(menuData, currentPath);
        if (label) {
          labels.push(label);
        } else {
          // Fallback jika path tidak terdaftar di menu (misal detail/edit)
          const fallback = pathParts[i]
            .split("-")
            .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
            .join(" ");
          labels.push(fallback);
        }
      }
    }

    setBreadcrumbs(labels);
  }, [pathname, user?.role_id]);

  // Gambar profil berdasarkan jenis kelamin
  const profileImg =
    user?.jenis_kelamin === "Perempuan"
      ? "/img/potrait/woman.jpg"
      : "/img/potrait/man.jpg";

  if (!mounted)
    return <header className="h-16 bg-white border-b border-slate-100" />;

  return (
    <header className="sticky top-0 z-40 flex h-16 w-full items-center justify-between bg-white/80 backdrop-blur-md px-6 border-b border-slate-100">
      {/* Sisi Kiri: Navigasi */}
      <div className="flex items-center gap-4">
        <button
          onClick={toggleSidebar}
          className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-50 text-slate-500 transition-all hover:bg-blue-50 hover:text-primary active:scale-95 border border-slate-100"
        >
          <MenuIcon size={18} />
        </button>

        <nav className="hidden md:flex items-center gap-2">
          {breadcrumbs.map((crumb, index) => (
            <React.Fragment key={index}>
              {index > 0 && (
                <ChevronRight size={12} className="text-slate-300" />
              )}
              <span
                className={`text-[10px] font-black uppercase tracking-widest ${
                  index === breadcrumbs.length - 1
                    ? "text-primary"
                    : "text-slate-400"
                }`}
              >
                {crumb}
              </span>
            </React.Fragment>
          ))}
        </nav>
      </div>

      {/* Sisi Kanan: Aksi & Profil */}
      <div className="flex items-center gap-3">
        {/* Search - Ukuran lebih pas */}
        <div className="relative hidden lg:block mr-2">
          <input
            type="text"
            placeholder="Cari..."
            className="w-48 rounded-xl border border-slate-100 bg-slate-50 py-2 pl-9 pr-3 text-[10px] font-bold text-slate-900 focus:border-blue-400 focus:bg-white outline-none transition-all placeholder:text-slate-300"
          />
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300"
            size={14}
          />
        </div>

        <button className="relative h-10 w-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 hover:text-primary transition-all border border-slate-100">
          <Bell size={18} />
          <span className="absolute top-2.5 right-2.5 h-1.5 w-1.5 rounded-full bg-red-500 border border-white"></span>
        </button>

        {/* Profil Dropdown */}
        <div className="relative ml-1">
          <button
            onClick={() => setDropdownOpen(!isDropdownOpen)}
            className="flex items-center gap-2.5 p-1 pr-2 rounded-xl hover:bg-slate-50 transition-all border border-transparent hover:border-slate-100"
          >
            <div className="relative h-8 w-8">
              <img
                src={profileImg}
                alt="User"
                className="h-8 w-8 rounded-full object-cover border border-white shadow-sm"
              />
              <div className="absolute bottom-0 right-0 h-2 w-2 bg-emerald-500 border border-white rounded-full"></div>
            </div>
            <div className="hidden sm:block text-left">
              <p className="text-[10px] font-black text-slate-800 leading-none mb-0.5 uppercase truncate max-w-[80px]">
                {user?.name || "User"}
              </p>
              <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest truncate">
                {user?.role || "Staff"}
              </p>
            </div>
          </button>

          {isDropdownOpen && (
            <div className="absolute right-0 mt-2 w-52 origin-top-right rounded-2xl bg-white shadow-2xl shadow-slate-200 border border-slate-100 overflow-hidden animate-in zoom-in duration-200">
              <div className="px-4 py-3 bg-slate-50/50 border-b border-slate-100">
                <p className="text-[10px] font-black text-slate-900 uppercase truncate">
                  {user?.name}
                </p>
                <p className="text-[8px] font-bold text-primary uppercase tracking-widest mt-0.5">
                  {user?.role}
                </p>
              </div>
              <div className="p-1.5">
                <Link
                  href="/admin/profile"
                  className="flex items-center gap-3 px-3 py-2 text-[10px] font-black uppercase tracking-widest text-slate-600 hover:bg-blue-50 hover:text-primary rounded-xl transition-all"
                  onClick={() => setDropdownOpen(false)}
                >
                  <User size={14} /> Profil Saya
                </Link>
                <button
                  onClick={() => {
                    openLogoutModal();
                    setDropdownOpen(false);
                  }}
                  className="flex w-full items-center gap-3 px-3 py-2 text-[10px] font-black uppercase tracking-widest text-red-500 hover:bg-red-50 rounded-xl transition-all"
                >
                  <LogOut size={14} /> Keluar Sistem
                </button>
              </div>
              <div className="px-4 py-2 border-t border-slate-50 flex items-center gap-2 text-slate-300">
                <Shield size={10} />
                <span className="text-[7px] font-black uppercase tracking-[0.2em]">
                  Alice Secure
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
