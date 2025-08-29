// File: app/components/admin/HeaderAdmin.tsx
"use client";

import { Bell, Search, UserCircle, Menu, ChevronRight } from 'lucide-react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';

interface HeaderAdminProps {
  toggleSidebar: () => void;
}

// Fungsi helper untuk mengubah path menjadi breadcrumbs
const generateBreadcrumbs = (pathname: string) => {
  const pathParts = pathname.split('/').filter(part => part);
  const breadcrumbs = pathParts.map((part, index) => {
    const href = '/' + pathParts.slice(0, index + 1).join('/');
    const label = part.charAt(0).toUpperCase() + part.slice(1);
    return { href, label };
  });
  return breadcrumbs;
};

export default function HeaderAdmin({ toggleSidebar }: HeaderAdminProps) {
  const pathname = usePathname();
  const breadcrumbs = generateBreadcrumbs(pathname);

  return (
    <header className="p-4 flex justify-between items-center">
      <div className="flex items-center gap-4">
        <button onClick={toggleSidebar} className="p-2 rounded-full hover:bg-slate-100">
          <Menu className="h-6 w-6 text-slate-600" />
        </button>

        {/* Breadcrumbs */}
        <nav className="hidden md:flex items-center text-sm text-slate-500">
          {breadcrumbs.map((crumb, index) => (
            <div key={crumb.href} className="flex items-center">
              <Link href={crumb.href} className="hover:text-primary">
                {crumb.label}
              </Link>
              {index < breadcrumbs.length - 1 && (
                <ChevronRight size={16} className="mx-1" />
              )}
            </div>
          ))}
        </nav>
      </div>

      <div className="flex items-center space-x-4">
        <div className="relative">
          <input
            type="text"
            placeholder="Cari..."
            className="w-full rounded-lg border border-slate-300 bg-white py-2 pl-10 pr-4 text-sm text-slate-900 placeholder-slate-400 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          />
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
        </div>
        <button className="p-2 rounded-full hover:bg-slate-100">
          <Bell className="h-6 w-6 text-slate-500" />
        </button>
        <button className="p-2 rounded-full hover:bg-slate-100">
          <UserCircle className="h-6 w-6 text-slate-500" />
        </button>
      </div>
    </header>
  );
}
