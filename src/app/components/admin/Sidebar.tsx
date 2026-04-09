/** Path: app/components/admin/Sidebar.tsx 
 * Deskripsi: Sidebar dinamis dengan desain "Sharp & Premium".
 * Perbaikan: Mengembalikan animasi dropdown dan ikon pada sub-menu item.
 * Skema Warna: Kustom Primary (#0173b6).
 */

"use client";

import React, { useState, useEffect, useMemo } from "react";
import * as LucideIcons from "lucide-react";
import {
  LogOut,
  Search,
  ChevronDown,
  Loader2,
  HelpCircle,
  Fingerprint,
  ShieldCheck,
} from "lucide-react";

import Link from "next/link";
import { usePathname } from "next/navigation";

// --- INTERFACES ---
export interface MenuItem {
  id?: string;
  href?: string;
  icon: string;
  label: string;
  subItems?: MenuItem[];
}

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

const DynamicIcon = ({ name, className, size = 18 }: { name: string; className?: string; size?: number }) => {
  const IconComponent = (LucideIcons as any)[name];
  if (!IconComponent) return <HelpCircle className={className} size={size} />;
  return <IconComponent className={className} size={size} />;
};

export default function Sidebar({ isCollapsed, openLogoutModal, user }: SidebarProps) {
  const pathname = usePathname();
  const [searchTerm, setSearchTerm] = useState("");
  const [displayMenus, setDisplayMenus] = useState<MenuItem[]>([]);
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  const currentPath = pathname.replace(/\/$/, "") || "/admin";

  useEffect(() => {
    setMounted(true);
    if (user?.role_id) {
      const cached = localStorage.getItem(`sidebar_menu_${user.role_id}`);
      if (cached) {
        setDisplayMenus(JSON.parse(cached));
        setIsLoading(false);
      }

      const fetchMenu = async () => {
        try {
          const response = await fetch(`/api/auth/menu?roleId=${user.role_id}`);
          if (response.ok) {
            const data = await response.json();
            if (Array.isArray(data)) {
              setDisplayMenus(data);
              localStorage.setItem(`sidebar_menu_${user.role_id}`, JSON.stringify(data));
            }
          }
        } catch (err) {
          console.error("Gagal sinkronisasi menu:", err);
        } finally {
          setIsLoading(false);
        }
      };
      fetchMenu();
    }
  }, [user?.role_id]);

useEffect(() => {
  if (displayMenus.length === 0) return;

  const activeParent = displayMenus.find((item) =>
    item.subItems?.some(
      (sub) => currentPath === sub.href?.replace(/\/$/, "")
    )
  );

  if (activeParent) {
    setOpenMenu(activeParent.label);
  } else {
    // ⛔ kalau bukan submenu → collapse semua
    setOpenMenu(null);
  }
}, [currentPath, displayMenus]);

  const toggleSubMenu = (label: string) => {
    setOpenMenu(openMenu === label ? null : label);
  };

  const filteredMenuItems = useMemo(() => {
    if (!searchTerm) return displayMenus;
    return displayMenus
      .map((item) => {
        const matchesParent = item.label.toLowerCase().includes(searchTerm.toLowerCase());
        const filteredSub = item.subItems?.filter((sub) =>
          sub.label.toLowerCase().includes(searchTerm.toLowerCase())
        );
        if (matchesParent || (filteredSub && filteredSub.length > 0)) {
          return { ...item, subItems: filteredSub || item.subItems };
        }
        return null;
      })
      .filter((x): x is MenuItem => x !== null);
  }, [displayMenus, searchTerm]);

  const profileImg = user?.jenis_kelamin === "Perempuan" ? "/img/potrait/woman.jpg" : "/img/potrait/man.jpg";
  const isProfileActive = currentPath === "/admin/profile";

  if (!mounted) return <aside className={`h-screen bg-white border-r border-slate-100 ${isCollapsed ? "w-20" : "w-64"}`} />;

  return (
    <>
      <aside className={`flex h-screen flex-col overflow-hidden bg-white transition-all duration-300 border-r border-slate-100 sticky top-0 z-50 ${isCollapsed ? "w-20" : "w-64"}`}>
        {/* Brand Section */}
        <div className="p-6 border-b border-slate-50 shrink-0">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 bg-[#0173b6] rounded-md flex items-center justify-center shrink-0 shadow-lg shadow-blue-100 text-white font-black text-xl italic">
              A
            </div>
            {!isCollapsed && (
              <div className="overflow-hidden animate-in fade-in slide-in-from-left-2">
                <h2 className="text-sm font-black text-slate-800 tracking-tighter leading-none">Alice Admin</h2>
                <p className="text-[8px] font-bold text-slate-400 tracking-widest mt-1">HRIS Ecosystem</p>
              </div>
            )}
          </div>
        </div>

        {/* Profile Button */}
        <div className={`p-4 ${isCollapsed ? "flex justify-center" : ""}`}>
          <Link
            href="/admin/profile"
            className={`flex items-center gap-3 p-2.5 rounded-md transition-all border group ${
              isProfileActive 
                ? "bg-[#0173b6] border-[#0173b6] shadow-md shadow-blue-100" 
                : "hover:bg-slate-50 border-transparent"
            } ${isCollapsed ? "w-10 h-10 justify-center p-0" : "w-full"}`}
          >
            <div className="relative shrink-0">
              <img
                src={profileImg}
                alt="Profile"
                className={`h-8 w-8 rounded-md object-cover border-2 transition-all ${
                  isProfileActive ? "border-white/20" : "border-white shadow-sm"
                }`}
              />
              <div className={`absolute -bottom-0.5 -right-0.5 w-2 h-2 bg-emerald-400 border-2 border-white rounded-full`}></div>
            </div>
            {!isCollapsed && (
              <div className="overflow-hidden flex-1 text-left">
                <p className={`text-[11px] font-black truncate leading-none mb-1 ${
                  isProfileActive ? "text-white" : "text-slate-800"
                }`}>
                  {user?.name || "Administrator"}
                </p>
                <p className={`text-[8px] font-bold truncate ${
                  isProfileActive ? "text-blue-100" : "text-slate-400"
                }`}>
                  {user?.role || "System User"}
                </p>
              </div>
            )}
          </Link>
        </div>

        {/* Search */}
        {!isCollapsed && (
          <div className="px-4 mb-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Cari menu..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full rounded-md border border-slate-100 bg-slate-50 py-2 pl-9 pr-3 text-[11px] font-bold text-slate-700 focus:border-[#0173b6] focus:bg-white outline-none transition-all"
              />
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
            </div>
          </div>
        )}

        {/* Navigasi Dinamis */}
        <nav className="flex-1 overflow-y-auto px-3 space-y-1 custom-sidebar-scroll">
          {isLoading && displayMenus.length === 0 ? (
            <div className="py-10 flex flex-col items-center justify-center">
              <Loader2 className="animate-spin text-slate-200" size={24} />
            </div>
          ) : (
            filteredMenuItems.map((item) => {
              const hasSub = !!(item.subItems && item.subItems.length > 0);
              const isActive = hasSub
                ? item.subItems?.some((sub) => currentPath === sub.href?.replace(/\/$/, ""))
                : currentPath === item.href?.replace(/\/$/, "");
              const isOpen = openMenu === item.label;

              if (hasSub) {
                return (
                  <div key={item.label} className="mb-1">
                    <button
                      onClick={() => toggleSubMenu(item.label)}
                      className={`flex w-full items-center justify-between rounded-md px-3 py-2.5 transition-all group ${
                        isActive ? "bg-blue-50/50 text-[#0173b6]" : "text-slate-500 hover:bg-slate-50"
                      } ${isCollapsed ? "justify-center" : ""}`}
                    >
                      <div className="flex items-center">
                        <DynamicIcon
                          name={item.icon}
                          className={isActive ? "text-[#0173b6]" : "text-slate-400 group-hover:text-[#0173b6]"}
                        />
                        {!isCollapsed && (
                          <span className="ml-3 text-[11px] font-black ">
                            {item.label}
                          </span>
                        )}
                      </div>
                      {!isCollapsed && (
                        <ChevronDown
                          size={12}
                          className={`transition-transform duration-300 opacity-30 ${isOpen ? "rotate-180" : ""}`}
                        />
                      )}
                    </button>
                    
                    {/* DROP DOWN DENGAN ANIMASI */}
                    {!isCollapsed && (
                      <div className={`grid transition-all duration-300 ease-in-out ${isOpen ? "grid-rows-[1fr] opacity-100 mt-1" : "grid-rows-[0fr] opacity-0"}`}>
                        <div className="overflow-hidden">
                          <div className="ml-4 border-l border-slate-100 pl-2 space-y-0.5">
                            {item.subItems?.map((sub) => {
                              const isSubActive = currentPath === sub.href?.replace(/\/$/, "");
                              return (
                                <Link
                                  key={sub.href}
                                  href={sub.href || "#"}
                                  className={`flex items-center rounded-md px-3 py-2 text-[11px] font-bold transition-all gap-2.5 ${
                                    isSubActive
                                      ? "bg-[#0173b6] text-white shadow-sm"
                                      : "text-slate-500 hover:text-[#0173b6] hover:bg-slate-50"
                                  }`}
                                >
                                  {/* ICON SUB ITEM DIKEMBALIKAN */}
                                  <DynamicIcon 
                                    name={sub.icon} 
                                    size={14} 
                                    className={isSubActive ? "text-white" : "text-slate-300"} 
                                  />
                                  <span className="truncate">{sub.label}</span>
                                </Link>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              }

              return (
                <Link
                  key={item.label}
                  href={item.href || "#"}
                  className={`flex items-center rounded-md px-3 py-2.5 transition-all group ${
                    isActive
                      ? "bg-[#0173b6] text-white shadow-md shadow-blue-100"
                      : "text-slate-500 hover:bg-slate-50 hover:text-[#0173b6]"
                  } ${isCollapsed ? "justify-center" : ""}`}
                >
                  <DynamicIcon
                    name={item.icon}
                    className={isActive ? "text-white" : "text-slate-400 group-hover:text-[#0173b6]"}
                  />
                  {!isCollapsed && (
                    <span className="ml-3 text-[11px] font-black ">
                      {item.label}
                    </span>
                  )}
                </Link>
              );
            })
          )}
        </nav>

        {/* Footer Secure */}
        <div className="mt-auto p-4 space-y-3 shrink-0">
          {!isCollapsed && (
            <div className="bg-slate-50 rounded-md p-3 border border-slate-100">
              <div className="flex items-center gap-2 mb-1 text-[#0173b6]">
                <ShieldCheck size={12} />
                <span className="text-[8px] font-black tracking-widest">Secure Access</span>
              </div>
              <div className="flex items-center gap-2 text-slate-400">
                <Fingerprint size={12} />
                <span className="text-[8px] font-bold tracking-widest">Alice Guard v3</span>
              </div>
            </div>
          )}

          <button
            onClick={openLogoutModal}
            className={`flex w-full items-center rounded-md px-3 py-2.5 text-red-500 font-black transition-all hover:bg-red-50 group ${
              isCollapsed ? "justify-center" : ""
            }`}
          >
            <LogOut
              size={18}
              className="group-hover:scale-110 transition-transform"
            />
            {!isCollapsed && (
              <span className="ml-3 text-[11px] tracking-widest">
                Logout System
              </span>
            )}
          </button>
        </div>
      </aside>

      <style jsx>{`
        .custom-sidebar-scroll::-webkit-scrollbar { width: 0px; }
        .custom-sidebar-scroll { scrollbar-width: none; -ms-overflow-style: none; }
      `}</style>
    </>
  );
}