// File: app/(admin)/admin/user/page.tsx
"use client";

import { useState, useEffect } from "react";
import { PlusCircle, Edit, Trash2, Loader2, AlertTriangle } from "lucide-react";
import Modal from "@/app/components/modal";
import { showSuccessToast, showErrorToast } from "@/app/components/admin/Alert";
import SearchableSelect from "@/app/components/admin/SearchableSelect";

type Option = { value: number | string; label: string };

interface User {
  id: number;
  nama_lengkap: string;
  email: string;
  nama_role: string;
  status: "Aktif" | "Non-Aktif";
  nip: string;
  role_id: number;
}

interface Role {
  id: number;
  nama_role: string;
}

// Menambahkan field email ke interface Karyawan
interface Karyawan {
  nip: string;
  nama_lengkap: string;
  email: string; // Email dibutuhkan untuk auto-fill
}

export default function UserManagementPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [karyawan, setKaryawan] = useState<Karyawan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [formData, setFormData] = useState({
    nip: "",
    email: "",
    password: "",
    role_id: "",
    status: "Aktif" as "Aktif" | "Non-Aktif",
  });

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isClient, setIsClient] = useState(false);

  const baseUrl =
    process.env.NEXT_PUBLIC_API_BASE_URL_LAN ||
    process.env.NEXT_PUBLIC_API_BASE_URL;

  const fetchData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [userRes, roleRes, karyawanRes] = await Promise.all([
        fetch(`${baseUrl}/api/users`),
        fetch(`${baseUrl}/api/roles`),
        fetch(`${baseUrl}/api/karyawan`), // API ini sudah mengembalikan email
      ]);

      if (!userRes.ok)
        throw new Error(`Gagal memuat data user (Status: ${userRes.status})`);
      if (!roleRes.ok)
        throw new Error(`Gagal memuat data role (Status: ${roleRes.status})`);
      if (!karyawanRes.ok)
        throw new Error(
          `Gagal memuat data karyawan (Status: ${karyawanRes.status})`
        );

      const userData = await userRes.json();
      const roleData = await roleRes.json();
      const karyawanData = await karyawanRes.json();

      setUsers(userData);
      setRoles(roleData);
      setKaryawan(karyawanData);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Terjadi kesalahan saat memuat data awal."
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    setIsClient(true);
    fetchData();
  }, [baseUrl]);

  const handleCloseModals = () => {
    setIsAddModalOpen(false);
    setIsEditModalOpen(false);
    setIsDeleteModalOpen(false);
    setSelectedUser(null);
    // Reset form data
    setFormData({
      nip: "",
      email: "",
      password: "",
      role_id: "",
      status: "Aktif",
    });
  };

  const handleOpenAddModal = () => {
    setFormData({
      nip: "",
      email: "",
      password: "",
      // Set default role jika ada, jika tidak, kosongkan
      role_id: roles.length > 0 ? roles[0].id.toString() : "",
      status: "Aktif",
    });
    setIsAddModalOpen(true);
  };

  const handleOpenEditModal = (user: User) => {
    setSelectedUser(user);
    setFormData({
      nip: user.nip,
      email: user.email,
      password: "", // Password dikosongkan untuk keamanan
      // FIX: Cek jika user.role_id ada sebelum memanggil toString()
      role_id: user.role_id ? user.role_id.toString() : "",
      status: user.status,
    });
    setIsEditModalOpen(true);
  };

  const handleOpenDeleteModal = (user: User) => {
    setSelectedUser(user);
    setIsDeleteModalOpen(true);
  };

  // Fungsi untuk handle pemilihan karyawan dan auto-fill email
  const handleKaryawanSelect = (option: Option | null) => {
    if (option) {
      const selected = karyawan.find((k) => k.nip === option.value);
      setFormData({
        ...formData,
        nip: selected?.nip || "",
        email: selected?.email || "", // Otomatis isi email
      });
    } else {
      setFormData({
        ...formData,
        nip: "",
        email: "",
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const isEditing = isEditModalOpen;
    const url = isEditing
      ? `${baseUrl}/api/users/${selectedUser?.id}`
      : `${baseUrl}/api/users`;
    // Gunakan PATCH untuk update, sesuai dengan API yang dibuat
    const method = isEditing ? "PATCH" : "POST";

    // Salin form data untuk dimodifikasi
    const body: Partial<typeof formData> = { ...formData };

    // Jika sedang edit dan password kosong, hapus dari body agar tidak mengupdate password
    if (isEditing && !body.password) {
      delete body.password;
    }

    try {
      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.message ||
            `Gagal ${isEditing ? "memperbarui" : "menambah"} user.`
        );
      }

      showSuccessToast(
        `User berhasil ${isEditing ? "diperbarui" : "ditambahkan"}!`
      );
      fetchData(); // Muat ulang data terbaru
      handleCloseModals();
    } catch (err) {
      showErrorToast(err instanceof Error ? err.message : "Terjadi kesalahan.");
    }
  };

  const confirmDelete = async () => {
    if (!selectedUser) return;
    try {
      const response = await fetch(`${baseUrl}/api/users/${selectedUser.id}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Gagal menghapus user.");
      }

      // Optimistic UI update
      setUsers(users.filter((u) => u.id !== selectedUser.id));
      showSuccessToast("User berhasil dihapus!");
      handleCloseModals();
    } catch (err) {
      showErrorToast(
        err instanceof Error ? err.message : "Gagal menghapus user."
      );
    }
  };

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-primary-dark">Manajemen User</h1>
        <button
          onClick={handleOpenAddModal}
          className="flex items-center gap-2 bg-primary text-white font-semibold py-2 px-4 rounded-lg hover:bg-primary-dark"
        >
          <PlusCircle size={20} />
          Tambah User
        </button>
      </div>

      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-slate-500">
            <thead className="text-xs text-white uppercase bg-primary-dark">
              <tr>
                <th scope="col" className="px-6 py-3">
                  Nama User
                </th>
                <th scope="col" className="px-6 py-3">
                  Email
                </th>
                <th scope="col" className="px-6 py-3">
                  Role
                </th>
                <th scope="col" className="px-6 py-3 text-center">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={4} className="text-center p-8">
                    <Loader2 className="animate-spin h-8 w-8 text-primary mx-auto" />
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan={4} className="text-center p-8 text-red-500">
                    <AlertTriangle className="inline mr-2" />
                    {error}
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr
                    key={user.id}
                    className="bg-white border-b border-slate-300 last:border-b-0 hover:bg-slate-50"
                  >
                    <td className="px-6 py-4">
                      <p className="font-medium text-slate-900">
                        {user.nama_lengkap || "(NIP tidak terhubung)"}
                      </p>
                      <p className="text-xs text-slate-500">
                        NIP : {user.nip || "-"}
                      </p>
                    </td>
                    <td className="px-6 py-4">{user.email}</td>
                    <td className="px-6 py-4">{user.nama_role}</td>
                    <td className="px-6 py-4 flex items-center justify-center gap-4">
                      <button
                        onClick={() => handleOpenEditModal(user)}
                        className="text-blue-600 hover:text-blue-800"
                        title="Edit"
                      >
                        <Edit size={18} />
                      </button>
                      <button
                        onClick={() => handleOpenDeleteModal(user)}
                        className="text-red-600 hover:text-red-800"
                        title="Hapus"
                      >
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Modal
        isOpen={isAddModalOpen || isEditModalOpen}
        onClose={handleCloseModals}
        title={isAddModalOpen ? "Tambah User Baru" : "Edit User"}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Pegawai (NIP)
            </label>
            {isClient ? (
              <SearchableSelect
                options={karyawan.map((k) => ({
                  value: k.nip,
                  label: `${k.nama_lengkap} (${k.nip})`,
                }))}
                value={
                  karyawan
                    .map((k) => ({
                      value: k.nip,
                      label: `${k.nama_lengkap} (${k.nip})`,
                    }))
                    .find((k) => k.value === formData.nip) || null
                }
                onChange={handleKaryawanSelect}
                placeholder="Cari pegawai..."
                isDisabled={isEditModalOpen} // NIP tidak bisa diubah saat edit
              />
            ) : (
              <div className="w-full h-[42px] bg-slate-100 rounded-md animate-pulse"></div>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              className="w-full px-3 py-2 border rounded-md bg-slate-100" // Ganti warna jadi abu-abu
              required
              readOnly // Email diisi otomatis dari data karyawan
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              type="password"
              value={formData.password}
              onChange={(e) =>
                setFormData({ ...formData, password: e.target.value })
              }
              className="w-full px-3 py-2 border rounded-md"
              placeholder={
                isEditModalOpen
                  ? "Isi untuk ganti password"
                  : "Masukkan password"
              }
              required={!isEditModalOpen}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Role
            </label>
            <select
              value={formData.role_id}
              onChange={(e) =>
                setFormData({ ...formData, role_id: e.target.value })
              }
              className="w-full px-3 py-2 border rounded-md"
              required
            >
              <option value="" disabled>
                -- Pilih Role --
              </option>
              {roles.map((role) => (
                <option key={role.id} value={role.id}>
                  {role.nama_role}
                </option>
              ))}
            </select>
          </div>
          <div className="mt-6 flex justify-end gap-4">
            <button
              type="button"
              onClick={handleCloseModals}
              className="rounded-lg bg-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-300"
            >
              Batal
            </button>
            <button
              type="submit"
              className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary-dark"
            >
              {isAddModalOpen ? "Tambah" : "Simpan Perubahan"}
            </button>
          </div>
        </form>
      </Modal>

      <Modal
        isOpen={isDeleteModalOpen}
        onClose={handleCloseModals}
        title="Konfirmasi Hapus"
      >
        <div>
          <p>
            Apakah Anda yakin ingin menghapus user{" "}
            <strong>{selectedUser?.nama_lengkap}</strong>?
          </p>
          <div className="mt-6 flex justify-end gap-4">
            <button
              onClick={handleCloseModals}
              className="rounded-lg bg-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-300"
            >
              Batal
            </button>
            <button
              onClick={confirmDelete}
              className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700"
            >
              Ya, Hapus
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
