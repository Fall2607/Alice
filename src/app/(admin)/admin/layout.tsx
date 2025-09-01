// File: app/(admin)/admin/layout.tsx
"use client";

import { useState } from "react";
import Sidebar from "@/app/components/admin/Sidebar";
import HeaderAdmin from "@/app/components/admin/HeaderAdmin";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

  const toggleSidebar = () => setIsCollapsed(!isCollapsed);
  const openLogoutModal = () => setIsLogoutModalOpen(true);
  const closeLogoutModal = () => setIsLogoutModalOpen(false);

  return (
    <div className="flex h-screen bg-slate-50">
      <Sidebar
        isCollapsed={isCollapsed}
        openLogoutModal={openLogoutModal}
        isLogoutModalOpen={isLogoutModalOpen}
        closeLogoutModal={closeLogoutModal}
      />
      <div className="flex flex-1 flex-col overflow-hidden">
        <HeaderAdmin
          toggleSidebar={toggleSidebar}
          openLogoutModal={openLogoutModal}
        />
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
}
