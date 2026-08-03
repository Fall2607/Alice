"use client";

import { useState, useEffect } from "react";
import { Loader2, AlertTriangle, Info } from "lucide-react";

interface KaryawanResign {
  id: string;
  nip: string;
  nama_lengkap: string;
  profesi: string;
  nama_departemen: string;
  tanggal_keluar: string;
  alasan_resign: string;
}

export default function PegawaiResignPage() {
  const [employees, setEmployees] = useState<KaryawanResign[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "";

  const fetchResigned = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`${baseUrl}/karyawan?resign_only=true`);
      if (!response.ok) throw new Error("Gagal memuat data pegawai resign");
      const data = await response.json();
      setEmployees(data);
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : "Terjadi kesalahan saat memuat data."
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchResigned();
  }, [baseUrl]);

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-primary-dark">
          Data Pegawai Resign (Alumni)
        </h1>
        <p className="text-slate-500 mt-2">
          Daftar pegawai yang telah berstatus non-aktif atau mengundurkan diri.
        </p>
      </div>

      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-slate-500">
            <thead className="text-xs text-white uppercase bg-primary-dark">
              <tr>
                <th scope="col" className="px-6 py-3">Nama Pegawai</th>
                <th scope="col" className="px-6 py-3">Departemen</th>
                <th scope="col" className="px-6 py-3">Tanggal Keluar</th>
                <th scope="col" className="px-6 py-3">Alasan Resign</th>
              </tr>
            </thead>
            <tbody>
              {isLoading && (
                <tr>
                  <td colSpan={4} className="text-center p-8">
                    <Loader2 className="animate-spin h-8 w-8 text-primary mx-auto" />
                  </td>
                </tr>
              )}
              {!isLoading && error && (
                <tr>
                  <td colSpan={4} className="text-center p-8 text-red-500">
                    <AlertTriangle className="inline mr-2" /> {error}
                  </td>
                </tr>
              )}
              {!isLoading && !error && employees.length > 0 && (
                employees.map((emp) => (
                  <tr key={emp.id} className="border-b border-slate-300 last:border-b-0 hover:bg-slate-50">
                    <td className="px-6 py-4">
                      <p className="font-medium text-slate-900">{emp.nama_lengkap}</p>
                      <p className="text-xs text-slate-500">NIP: {emp.nip} | {emp.profesi}</p>
                    </td>
                    <td className="px-6 py-4">{emp.nama_departemen || "-"}</td>
                    <td className="px-6 py-4 font-semibold text-red-600">
                      {emp.tanggal_keluar
                        ? new Date(emp.tanggal_keluar).toLocaleDateString("id-ID", {
                            day: "numeric",
                            month: "long",
                            year: "numeric",
                          })
                        : "-"}
                    </td>
                    <td className="px-6 py-4 max-w-xs truncate" title={emp.alasan_resign}>
                      {emp.alasan_resign || "-"}
                    </td>
                  </tr>
                ))
              )}
              {!isLoading && !error && employees.length === 0 && (
                <tr>
                  <td colSpan={4} className="text-center p-8">
                    <Info className="mx-auto mb-2 text-slate-400" />
                    Belum ada data pegawai yang resign.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
