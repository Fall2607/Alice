/** Path: app/(admin)/admin/role/permissions/page.tsx */

"use client";

import React, { useState, useEffect } from "react";
// Import standar Next.js (Mungkin menyebabkan error di pratinjau ini, tapi wajib untuk proyek asli Anda)
// import { useRouter } from "next/navigation";
// import Link from "next/link";
// import { showSuccessToast, showErrorToast } from "@/app/components/admin/Alert";

import {
  Save,
  Loader2,
  AlertTriangle,
  ChevronLeft,
  Lock,
  Eye,
  PlusSquare,
  Edit3,
  Trash2,
  Check,
  X,
} from "lucide-react";

/** * BAGIAN INTERNAL: Mocking untuk resolusi pratinjau (Preview Fix)
 * Bagian ini membantu agar kode dapat berjalan di tampilan 'Canvas' tanpa error,
 * namun pastikan Anda menggunakan import asli di proyek Next.js lokal Anda.
 */
const showSuccessToast = (msg: string) => console.log("Success:", msg);
const showErrorToast = (msg: string) => console.log("Error:", msg);

// Interface UUID String
interface Role {
  id: string;
  nama_role: string;
}

interface MenuPermission {
  menu_id: string;
  nama_menu: string;
  path: string;
  can_view: boolean;
  can_create: boolean;
  can_edit: boolean;
  can_delete: boolean;
}

export default function App() {
  // const router = useRouter(); // Gunakan useRouter() asli di lokal
  const [roles, setRoles] = useState<Role[]>([]);
  const [selectedRoleId, setSelectedRoleId] = useState<string>("");
  const [permissions, setPermissions] = useState<MenuPermission[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isPermissionsLoading, setIsPermissionsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);

  // Sesuai instruksi Anda, /api tidak perlu ditulis manual jika baseUrl sudah mencakupnya
  const baseUrl =
    typeof window !== "undefined"
      ? process.env.NEXT_PUBLIC_API_BASE_URL || ""
      : "";

  /**
   * Mengambil daftar Role
   */
  const fetchRoles = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`${baseUrl}/roles`);
      if (!response.ok) throw new Error("Gagal memuat data role.");
      const data = await response.json();
      setRoles(data);

      if (data && data.length > 0) {
        setSelectedRoleId(data[0].id);
      }
    } catch (err: any) {
      setError(
        err instanceof Error ? err.message : "Terjadi kesalahan koneksi.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Mengambil Matriks Izin (GET)
   */
  const fetchPermissions = async (roleId: string) => {
    setIsPermissionsLoading(true);
    setApiError(null);
    try {
      const url = `${baseUrl}/auth/role-access/${roleId}`;
      const response = await fetch(url);
      const data = await response.json();

      if (!response.ok) {
        // Tangkap pesan error spesifik dari backend (seperti syntax error SQL)
        throw new Error(
          data.error || data.message || "Gagal mengambil matriks.",
        );
      }

      if (Array.isArray(data)) {
        setPermissions(data);
      } else {
        setPermissions([]);
      }
    } catch (err: any) {
      setApiError(err.message);
      showErrorToast(`Error: ${err.message}`);
      setPermissions([]);
    } finally {
      setIsPermissionsLoading(false);
    }
  };

  useEffect(() => {
    fetchRoles();
  }, [baseUrl]);

  useEffect(() => {
    if (selectedRoleId !== "") {
      fetchPermissions(selectedRoleId);
    }
  }, [selectedRoleId, baseUrl]);

  const handleTogglePermission = (
    menuId: string,
    field: keyof MenuPermission,
  ) => {
    setPermissions((prev) =>
      prev.map((item) => {
        if (item.menu_id === menuId) {
          return { ...item, [field]: !item[field] };
        }
        return item;
      }),
    );
  };

  /**
   * Simpan Perubahan (POST)
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
          permissions: permissions,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Gagal menyimpan perubahan.");
      }

      showSuccessToast("Konfigurasi hak akses berhasil diperbarui!");
    } catch (err: any) {
      showErrorToast(err.message || "Gagal menyimpan data.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="p-8 font-sans min-h-screen bg-slate-50">
      {/* Header Page */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <button
            onClick={() => window.history.back()}
            className="text-primary hover:text-primary-dark text-sm font-semibold flex items-center gap-1 mb-1 transition-colors"
          >
            <ChevronLeft size={16} /> Kembali ke Role
          </button>
          <h1 className="text-3xl font-bold text-primary-dark">
            Manajemen Hak Akses
          </h1>
        </div>

        <button
          onClick={handleSave}
          disabled={isSaving || selectedRoleId === "" || isPermissionsLoading}
          className="flex items-center gap-2 bg-[#007bff] text-white font-semibold py-2 px-6 rounded-lg hover:bg-blue-700 transition-all disabled:bg-slate-400 shadow-md"
        >
          {isSaving ? (
            <Loader2 className="animate-spin" size={20} />
          ) : (
            <Save size={20} />
          )}
          Simpan Perubahan
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Kolom Kiri: Navigasi Role */}
        <div className="lg:col-span-1">
          <label className="block text-xs font-bold text-slate-500 uppercase mb-3 ml-1 tracking-wider">
            Pilih Role
          </label>
          <div className="flex flex-col gap-2">
            {isLoading && roles.length === 0 ? (
              <div className="flex items-center justify-center p-8 bg-white border border-slate-200 rounded-lg">
                <Loader2 className="animate-spin text-primary" />
              </div>
            ) : (
              roles.map((role) => (
                <button
                  key={role.id}
                  onClick={() => setSelectedRoleId(role.id)}
                  className={`w-full text-left px-4 py-3 rounded-lg font-medium transition-all text-sm border ${
                    selectedRoleId === role.id
                      ? "bg-[#007bff] text-white border-blue-600 shadow-md"
                      : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50 shadow-sm"
                  }`}
                >
                  {role.nama_role}
                </button>
              ))
            )}
          </div>
        </div>

        {/* Kolom Kanan: Matriks Hak Akses */}
        <div className="lg:col-span-3">
          <div className="bg-white shadow-md rounded-lg overflow-hidden border border-slate-300">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left text-slate-500">
                <thead className="text-xs text-white uppercase bg-[#002d5a] font-bold">
                  <tr>
                    <th scope="col" className="px-6 py-4">
                      Menu / Modul Sistem
                    </th>
                    <th scope="col" className="px-4 py-4 text-center">
                      Lihat
                    </th>
                    <th scope="col" className="px-4 py-4 text-center">
                      Buat
                    </th>
                    <th scope="col" className="px-4 py-4 text-center">
                      Ubah
                    </th>
                    <th scope="col" className="px-4 py-4 text-center">
                      Hapus
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {isPermissionsLoading ? (
                    <tr>
                      <td colSpan={5} className="text-center p-12">
                        <div className="flex flex-col items-center gap-2">
                          <Loader2
                            className="animate-spin text-blue-600"
                            size={32}
                          />
                          <span className="text-slate-400">
                            Sinkronisasi Data...
                          </span>
                        </div>
                      </td>
                    </tr>
                  ) : apiError ? (
                    <tr>
                      <td colSpan={5} className="text-center p-12">
                        <div className="bg-red-50 p-6 rounded-lg border border-red-100 inline-block text-left max-w-xl">
                          <div className="flex items-center gap-2 text-red-600 font-bold mb-2">
                            <AlertTriangle size={20} />
                            <span>Kesalahan Query SQL (Backend)</span>
                          </div>
                          <p className="text-xs text-red-500 font-mono break-words bg-white p-3 rounded border border-red-200">
                            {apiError}
                          </p>
                          <p className="mt-3 text-[10px] text-slate-400 italic font-medium">
                            Catatan: Pesan di atas mengonfirmasi adanya typo
                            ".." pada query SQL Anda di file [roleId]/route.ts.
                            Mohon segera perbaiki di sisi server.
                          </p>
                        </div>
                      </td>
                    </tr>
                  ) : permissions.length > 0 ? (
                    permissions.map((item) => (
                      <tr
                        key={item.menu_id}
                        className="bg-white border-b border-slate-200 last:border-b-0 hover:bg-slate-50 transition-colors"
                      >
                        <th
                          scope="row"
                          className="px-6 py-4 font-medium text-slate-900"
                        >
                          <div className="flex flex-col">
                            <span>{item.nama_menu}</span>
                            <span className="text-[10px] text-slate-400 font-mono italic mt-0.5">
                              {item.path}
                            </span>
                          </div>
                        </th>
                        <td className="px-4 py-4 text-center">
                          <input
                            type="checkbox"
                            checked={item.can_view}
                            onChange={() =>
                              handleTogglePermission(item.menu_id, "can_view")
                            }
                            className="w-4 h-4 accent-blue-600 cursor-pointer border-slate-300 rounded"
                          />
                        </td>
                        <td className="px-4 py-4 text-center">
                          <input
                            type="checkbox"
                            checked={item.can_create}
                            onChange={() =>
                              handleTogglePermission(item.menu_id, "can_create")
                            }
                            className="w-4 h-4 accent-blue-600 cursor-pointer border-slate-300 rounded"
                          />
                        </td>
                        <td className="px-4 py-4 text-center">
                          <input
                            type="checkbox"
                            checked={item.can_edit}
                            onChange={() =>
                              handleTogglePermission(item.menu_id, "can_edit")
                            }
                            className="w-4 h-4 accent-blue-600 cursor-pointer border-slate-300 rounded"
                          />
                        </td>
                        <td className="px-4 py-4 text-center">
                          <input
                            type="checkbox"
                            checked={item.can_delete}
                            onChange={() =>
                              handleTogglePermission(item.menu_id, "can_delete")
                            }
                            className="w-4 h-4 accent-blue-600 cursor-pointer border-slate-300 rounded"
                          />
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan={5}
                        className="text-center p-12 text-slate-400 italic"
                      >
                        {selectedRoleId !== ""
                          ? "Data menu tidak ditemukan. Pastikan tabel menus sudah terisi."
                          : "Pilih role untuk mengatur hak akses."}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="mt-4 flex items-center gap-2 p-3 bg-blue-50 text-blue-700 rounded-lg text-[11px] border border-blue-100 font-medium italic">
            <Lock size={14} className="flex-shrink-0" />
            <p>
              Izin "Lihat" menentukan visibilitas menu di sidebar. Sistem
              menggunakan identitas UUID untuk keamanan akses.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
