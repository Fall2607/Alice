// File: app/(admin)/admin/layout.tsx
import Sidebar from "@/app/components/admin/Sidebar";
import HeaderAdmin from "@/app/components/admin/HeaderAdmin";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <div className="flex flex-1 flex-col">
        <HeaderAdmin />
        <main className="flex-1 overflow-y-auto p-8">{children}</main>
      </div>
    </div>
  );
}
