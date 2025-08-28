// File: app/components/admin/HeaderAdmin.tsx
"use client";

import { Bell, Search, UserCircle } from "lucide-react";

export default function HeaderAdmin() {
  return (
    <header className="bg-white shadow-sm p-4 flex justify-between items-center">
      <div>
        <h1 className="text-xl font-semibold text-slate-700">
          Selamat Datang, Admin!
        </h1>
      </div>
      <div className="flex items-center space-x-4">
        <div className="relative">
          <input
            type="text"
            placeholder="Cari..."
            className="pl-10 pr-4 py-2 border rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-primary"
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
