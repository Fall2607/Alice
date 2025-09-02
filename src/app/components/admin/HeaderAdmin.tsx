// File: app/components/admin/HeaderAdmin.tsx
"use client";

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { Search, Bell, Menu, User, LogOut, ChevronRight } from 'lucide-react';
import Image from 'next/image';
import { menuItems } from './Sidebar';

interface HeaderAdminProps {
  toggleSidebar: () => void;
  openLogoutModal: () => void;
}

export default function HeaderAdmin({ toggleSidebar, openLogoutModal }: HeaderAdminProps) {
  const [isDropdownOpen, setDropdownOpen] = useState(false);
  const [breadcrumbs, setBreadcrumbs] = useState<string[]>([]);
  const pathname = usePathname();

  useEffect(() => {
    const pathParts = pathname.split('/').filter(part => part);
    const newBreadcrumbs: string[] = ['Admin'];

    if (pathParts.length === 1 && pathParts[0] === 'admin') {
      newBreadcrumbs.push('Dashboard');
    } else if (pathParts.length > 1) {
      const findLabels = (items: typeof menuItems, parts: string[], basePath: string): string[] => {
        if (parts.length === 0) return [];
        const currentPart = parts[0];
        const remainingParts = parts.slice(1);
        const currentSegmentPath = `${basePath}/${currentPart}`;

        for (const item of items) {
          if (item.href === currentSegmentPath) {
            return [item.label, ...findLabels(items, remainingParts, currentSegmentPath)];
          }
          if (item.subItems) {
            for (const subItem of item.subItems) {
              if (subItem.href === currentSegmentPath) {
                return [item.label, subItem.label, ...findLabels(items, remainingParts, currentSegmentPath)];
              }
            }
          }
        }
        return [currentPart.charAt(0).toUpperCase() + currentPart.slice(1), ...findLabels(items, remainingParts, currentSegmentPath)];
      };

      const labels = findLabels(menuItems, pathParts.slice(1), `/${pathParts[0]}`);
      newBreadcrumbs.push(...labels);
    }

    setBreadcrumbs(newBreadcrumbs);
  }, [pathname]);

  return (
    <header className="sticky top-0 z-30 w-full px-8 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={toggleSidebar} className="text-primary-dark hover:text-primary transition-colors">
            <Menu size={24} />
          </button>
          <div className="text-sm font-medium text-slate-500 flex items-center gap-1">
            {breadcrumbs.map((crumb, index) => (
              <span key={index} className="flex items-center gap-1">
                {index > 0 && <ChevronRight size={16} />}
                <span className={index === breadcrumbs.length - 1 ? "text-primary-dark font-semibold" : ""}>
                  {crumb}
                </span>
              </span>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="relative">
            <input
              type="text"
              placeholder="Cari..."
              className="rounded-lg border border-slate-300 bg-white py-2 pl-10 pr-4 text-sm w-64 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
            <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
          </div>

          <button className="relative text-slate-500 hover:text-primary-dark">
            <Bell size={22} />
            <span className="absolute -top-1 -right-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
            </span>
          </button>

          <div className="relative">
            <button onClick={() => setDropdownOpen(!isDropdownOpen)} className="flex items-center gap-2">
              <Image
                src="/img/potrait/man.jpg"
                alt="User Profile"
                width={36}
                height={36}
                className="rounded-full object-cover"
              />
            </button>
            {isDropdownOpen && (
              <div
                className="absolute right-0 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none"
                role="menu"
                aria-orientation="vertical"
                aria-labelledby="user-menu-button"
              >
                <Link
                  href="/admin/profile"
                  className="flex w-full items-center gap-3 px-4 py-2 text-sm text-slate-700 hover:bg-slate-100"
                  role="menuitem"
                >
                  <User size={16} />
                  Profil
                </Link>
                <button
                  onClick={() => {
                    openLogoutModal();
                    setDropdownOpen(false);
                  }}
                  className="flex w-full items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                  role="menuitem"
                >
                  <LogOut size={16} />
                  Keluar
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

