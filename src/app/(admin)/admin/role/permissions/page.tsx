/** Path: app/(admin)/admin/role/permissions/page.tsx */

"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  Save, 
  Loader2, 
  AlertTriangle, 
  ChevronLeft,
  Lock,
  Eye,
  PlusSquare,
  Edit3,
  Trash2
} from "lucide-react";
import { showSuccessToast, showErrorToast } from "@/app/components/admin/Alert";

// Interface disesuaikan dengan struktur ID (Number) sesuai file role/page.tsx Anda
interface Role {
  id: number; 
  nama_role: string;
}

interface MenuPermission {
  menu_id: number;
  nama_menu: string;
  path: string;
  can_view: boolean;
  can_create: boolean;
  can_edit: boolean;
  can_delete: boolean;
}

export default function PermissionsPage() {
  const router = useRouter();
  const [roles, setRoles] = useState<Role[]>([]);
  const [selectedRoleId, setSelectedRoleId] = useState<number | "">("");
  const [permissions, setPermissions] = useState<MenuPermission[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Base URL dari environment variable
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "";

  /**
   * Fetch daftar Role dari server
   * Menggunakan path sesuai koreksi Anda (tanpa penambahan /api manual)
   */
  const fetchRoles = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`${baseUrl}/roles`);
      if (!response.ok) throw new Error("Gagal memuat data role dari server.");
      const data = await response.json();
      setRoles(data);
      
      if (data && data.length > 0) {
        setSelectedRoleId(data[0].id);
      }
    } catch (err: any) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan koneksi.");
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Fetch Matriks Izin berdasarkan Role ID
   */
  const fetchPermissions = async (roleId: number) => {
    setIsLoading(true);
    try {
      const response = await fetch(`${baseUrl}/auth/role-access/${roleId}`);
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Gagal memuat matriks hak akses.");
      }
      const data = await response.json();
      setPermissions(data);
    } catch (err: any) {
      showErrorToast(err instanceof Error ? err.message : "Gagal memuat data akses.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRoles();
  }, []);

  useEffect(() => {
    if (typeof selectedRoleId === "number") {
      fetchPermissions(selectedRoleId);
    }
  }, [selectedRoleId]);

  const handleTogglePermission = (menuId: number, field: keyof MenuPermission) => {
    setPermissions(prev => prev.map(item => {
      if (item.menu_id === menuId) {
        return { ...item, [field]: !item[field] };
      }
      return item;
    }));
  };

  /**
   * Simpan Perubahan Matriks
   */
  const handleSave = async () => {
    if (selectedRoleId === "") return;
    setIsSaving(true);
    try {
      const response = await fetch(`${baseUrl}/auth/role-access`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          role_id: selectedRoleId,
          permissions: permissions
        }),
      });

      if (!response.ok) throw new Error("Gagal menyimpan perubahan.");
      
      showSuccessToast("Konfigurasi hak akses berhasil diperbarui!");
    } catch (err: any) {
      showErrorToast(err instanceof Error ? err.message : "Gagal menyimpan data.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="p-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <Link href="/admin/role" className="text-primary hover:text-primary-dark text-sm font-semibold flex items-center gap-1 mb-1 transition-colors">
            <ChevronLeft size={16} /> Kembali ke Role
          </Link>
          <h1 className="text-3xl font-bold text-primary-dark">
            Manajemen Hak Akses
          </h1>
        </div>
        
        <button
          onClick={handleSave}
          disabled={isSaving || selectedRoleId === "" || isLoading}
          className="flex items-center gap-2 bg-primary text-white font-semibold py-2 px-6 rounded-lg hover:bg-primary-dark transition-all disabled:bg-slate-400 shadow-md"
        >
          {isSaving ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
          Simpan Perubahan
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1">
          <label className="block text-xs font-bold text-slate-500 uppercase mb-3 ml-1 tracking-wider">
            Pilih Role
          </label>
          <div className="flex flex-col gap-2">
            {isLoading && roles.length === 0 ? (
              <div className="flex items-center justify-center p-8 bg-white border border-slate-200 rounded-lg">
                <Loader2 className="animate-spin text-slate-300" />
              </div>
            ) : roles.length > 0 ? (
              roles.map((role) => (
                <button
                  key={role.id}
                  onClick={() => setSelectedRoleId(role.id)}
                  className={`w-full text-left px-4 py-3 rounded-lg font-medium transition-all text-sm border ${
                    selectedRoleId === role.id 
                    ? "bg-primary text-white border-primary shadow-md" 
                    : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50 shadow-sm"
                  }`}
                >
                  {role.nama_role}
                </button>
              ))
            ) : (
              <div className="p-4 bg-amber-50 text-amber-600 rounded-lg text-xs font-medium border border-amber-100 flex items-center gap-2">
                <AlertTriangle size={14} /> Role tidak ditemukan.
              </div>
            )}
          </div>
        </div>

        <div className="lg:col-span-3">
          <div className="bg-white shadow-md rounded-lg overflow-hidden border border-slate-300">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left text-slate-500">
                <thead className="text-xs text-white uppercase bg-primary-dark font-bold">
                  <tr>
                    <th scope="col" className="px-6 py-4">Menu / Modul Sistem</th>
                    <th scope="col" className="px-4 py-4 text-center">
                      <div className="flex flex-col items-center gap-1">
                        <Eye size={14} />
                        <span>Lihat</span>
                      </div>
                    </th>
                    <th scope="col" className="px-4 py-4 text-center">
                      <div className="flex flex-col items-center gap-1">
                        <PlusSquare size={14} />
                        <span>Buat</span>
                      </div>
                    </th>
                    <th scope="col" className="px-4 py-4 text-center">
                      <div className="flex flex-col items-center gap-1">
                        <Edit3 size={14} />
                        <span>Ubah</span>
                      </div>
                    </th>
                    <th scope="col" className="px-4 py-4 text-center">
                      <div className="flex flex-col items-center gap-1">
                        <Trash2 size={14} />
                        <span>Hapus</span>
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {isLoading && roles.length > 0 ? (
                    <tr>
                      <td colSpan={5} className="text-center p-12">
                        <Loader2 className="animate-spin text-primary mx-auto" size={32} />
                      </td>
                    </tr>
                  ) : error ? (
                    <tr>
                      <td colSpan={5} className="text-center p-12 text-red-500 font-medium">
                        <AlertTriangle className="inline mr-2" /> {error}
                      </td>
                    </tr>
                  ) : permissions.length > 0 ? (
                    permissions.map((item) => (
                      <tr 
                        key={item.menu_id} 
                        className="bg-white border-b border-slate-300 last:border-b-0 hover:bg-slate-50 transition-colors"
                      >
                        <th scope="row" className="px-6 py-4 font-medium text-slate-900">
                          <div className="flex flex-col">
                            <span>{item.nama_menu}</span>
                            <span className="text-[10px] text-slate-400 font-mono italic mt-0.5">{item.path}</span>
                          </div>
                        </th>
                        <td className="px-4 py-4 text-center">
                          <input 
                            type="checkbox" 
                            checked={item.can_view} 
                            onChange={() => handleTogglePermission(item.menu_id, 'can_view')}
                            className="w-4 h-4 accent-primary cursor-pointer border-slate-300 rounded"
                          />
                        </td>
                        <td className="px-4 py-4 text-center">
                          <input 
                            type="checkbox" 
                            checked={item.can_create} 
                            onChange={() => handleTogglePermission(item.menu_id, 'can_create')}
                            className="w-4 h-4 accent-primary cursor-pointer border-slate-300 rounded"
                          />
                        </td>
                        <td className="px-4 py-4 text-center">
                          <input 
                            type="checkbox" 
                            checked={item.can_edit} 
                            onChange={() => handleTogglePermission(item.menu_id, 'can_edit')}
                            className="w-4 h-4 accent-primary cursor-pointer border-slate-300 rounded"
                          />
                        </td>
                        <td className="px-4 py-4 text-center">
                          <input 
                            type="checkbox" 
                            checked={item.can_delete} 
                            onChange={() => handleTogglePermission(item.menu_id, 'can_delete')}
                            className="w-4 h-4 accent-primary cursor-pointer border-slate-300 rounded"
                          />
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="text-center p-12 text-slate-400 italic">
                        {selectedRoleId !== "" ? "Memuat menu..." : "Pilih role untuk mengatur hak akses."}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="mt-4 flex items-center gap-2 p-3 bg-blue-50 text-blue-700 rounded-lg text-[11px] border border-blue-100 font-medium italic">
            <Lock size={14} className="flex-shrink-0" />
            <p>Perubahan ini akan langsung berdampak pada izin akses dan visibilitas sidebar pengguna. Pastikan untuk menekan tombol Simpan sebelum berpindah role.</p>
          </div>
        </div>
      </div>
    </div>
  );
}