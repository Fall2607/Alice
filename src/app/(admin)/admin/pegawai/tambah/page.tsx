"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronLeft, Loader2 } from "lucide-react";
import DatePickerField from "@/app/components/admin/DatePickerField";
import SearchableSelect from "@/app/components/admin/SearchableSelect";
import { showSuccessToast, showErrorToast } from "@/app/components/admin/Alert";

// Renamed to FormOption to avoid naming collisions with external components
type FormOption = { value: string; label: string };

interface Department {
  id: string; // UUID
  nama_departemen: string;
}

interface LevelJabatan {
  id: string; // UUID
  nama_level: string;
}

interface Employee {
  id: string; // UUID
  nama_lengkap: string;
  nip: string;
}

const FormField = ({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) => (
  <div className="py-4 border-b border-slate-200">
    <label className="block text-sm font-medium text-slate-700 mb-1">
      {label}
    </label>
    {children}
  </div>
);

export default function TambahPegawaiPage() {
  const router = useRouter();
  const [departments, setDepartments] = useState<FormOption[]>([]);
  const [levelJabatans, setLevelJabatans] = useState<FormOption[]>([]);
  const [employeeOptions, setEmployeeOptions] = useState<FormOption[]>([]);
  const [isClient, setIsClient] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAlamatSama, setIsAlamatSama] = useState(false);

  const [formData, setFormData] = useState({
    nip: "",
    nama_lengkap: "",
    nik: "",
    profesi: "",
    sip: "",
    masa_berlaku_sip: null as Date | null,
    handphone: "",
    email: "",
    tanggal_lahir: null as Date | null,
    jenis_kelamin: { value: "Laki-laki", label: "Laki-laki" } as FormOption,
    alamat: "",
    alamat_domisili: "",
    tanggal_masuk: null as Date | null,
    status_kepegawaian: {
      value: "Karyawan Kontrak",
      label: "Karyawan Kontrak",
    } as FormOption,
    gaji_pokok: 0,
    level_jabatan_id: null as FormOption | null,
    departemen_id: null as FormOption | null,
    atasan_id: null as FormOption | null,
    rekening_bsi: "",
  });

  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "";

  useEffect(() => {
    setIsClient(true);
    const fetchDataForDropdowns = async () => {
      try {
        const [deptRes, jabatanRes, employeeRes] = await Promise.all([
          fetch(`${baseUrl}/departments`),
          fetch(`${baseUrl}/level-jabatan`),
          fetch(`${baseUrl}/karyawan`),
        ]);

        if (!deptRes.ok || !jabatanRes.ok || !employeeRes.ok) {
          throw new Error("Gagal mengambil data referensi.");
        }

        const deptData: Department[] = await deptRes.json();
        const levelData: LevelJabatan[] = await jabatanRes.json();
        const empData: Employee[] = await employeeRes.json();

        setDepartments(
          deptData.map((d) => ({ value: d.id, label: d.nama_departemen })),
        );
        setLevelJabatans(
          levelData.map((j) => ({ value: j.id, label: j.nama_level })),
        );
        setEmployeeOptions(
          empData.map((e) => ({
            value: e.id,
            label: `${e.nama_lengkap} (${e.nip})`,
          })),
        );
      } catch (error: unknown) {
        console.error("Gagal mengambil data dropdown:", error);
        showErrorToast("Beberapa data pilihan gagal dimuat.");
      }
    };
    fetchDataForDropdowns();
  }, [baseUrl]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (!formData.departemen_id || !formData.level_jabatan_id) {
      showErrorToast("Departemen dan Level Jabatan wajib diisi.");
      setIsSubmitting(false);
      return;
    }

    try {
      const jabatanRes = await fetch(`${baseUrl}/jabatan`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          departemen_id: formData.departemen_id.value,
          level_jabatan_id: formData.level_jabatan_id.value,
        }),
      });

      if (!jabatanRes.ok) throw new Error("Gagal memproses struktur Jabatan.");
      const { id: jabatan_uuid } = await jabatanRes.json();

      const karyawanData = {
        nip: formData.nip,
        nama_lengkap: formData.nama_lengkap,
        nik: formData.nik,
        profesi: formData.profesi || null,
        sip: formData.sip || null,
        masa_berlaku_sip:
          formData.masa_berlaku_sip?.toISOString().split("T")[0] || null,
        handphone: formData.handphone || null,
        email: formData.email || null,
        tanggal_lahir:
          formData.tanggal_lahir?.toISOString().split("T")[0] || null,
        jenis_kelamin: formData.jenis_kelamin.value,
        alamat: formData.alamat || null,
        alamat_domisili: isAlamatSama ? formData.alamat : (formData.alamat_domisili || null),
        tanggal_masuk:
          formData.tanggal_masuk?.toISOString().split("T")[0] || null,
        status_kepegawaian: formData.status_kepegawaian.value,
        gaji_pokok: formData.gaji_pokok || null,
        rekening_bsi: formData.rekening_bsi || null,
        jabatan_id: jabatan_uuid,
        atasan_id: formData.atasan_id?.value || null,
      };

      const karyawanRes = await fetch(`${baseUrl}/karyawan`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(karyawanData),
      });

      if (!karyawanRes.ok) {
        const errorData = await karyawanRes.json();
        throw new Error(errorData.message || "Gagal menyimpan data karyawan.");
      }

      showSuccessToast("Data pegawai berhasil ditambahkan!");
      router.push("/admin/pegawai");
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : "Terjadi kesalahan.";
      showErrorToast(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputClass =
    "w-full border-gray-300 rounded-md shadow-sm focus:border-primary focus:ring-primary focus:ring-opacity-50 text-sm p-2.5";
  const placeholderClass =
    "w-full h-[42px] bg-slate-100 rounded-md animate-pulse";

  return (
    <div className="p-8">
      <div className="mb-6">
        <Link
          href="/admin/pegawai"
          className="inline-flex items-center gap-2 text-primary hover:text-primary-dark"
        >
          <ChevronLeft size={20} />
          Kembali ke Manajemen Pegawai
        </Link>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="bg-white p-8 rounded-lg shadow-md">
          <h1 className="text-2xl font-bold text-primary-dark mb-6 border-b pb-4">
            Form Tambah Pegawai Baru
          </h1>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-12">
            <div>
              <h2 className="text-lg font-semibold text-primary-dark mb-4 border-b pb-2">
                Data Diri & Kontak
              </h2>
              <FormField label="NIP">
                <input
                  type="text"
                  value={formData.nip}
                  onChange={(e) =>
                    setFormData({ ...formData, nip: e.target.value })
                  }
                  className={inputClass}
                  placeholder="Contoh: AVS-2025-005"
                  required
                />
              </FormField>
              <FormField label="Nama Lengkap">
                <input
                  type="text"
                  value={formData.nama_lengkap}
                  onChange={(e) =>
                    setFormData({ ...formData, nama_lengkap: e.target.value })
                  }
                  className={inputClass}
                  placeholder="Masukkan nama lengkap"
                  required
                />
              </FormField>
              <FormField label="NIK">
                <input
                  type="text"
                  value={formData.nik}
                  onChange={(e) =>
                    setFormData({ ...formData, nik: e.target.value })
                  }
                  className={inputClass}
                  placeholder="Masukkan 16 digit NIK"
                  required
                />
              </FormField>
              <FormField label="Tanggal Lahir">
                {isClient ? (
                  <DatePickerField
                    selected={formData.tanggal_lahir}
                    onChange={(date) =>
                      setFormData({ ...formData, tanggal_lahir: date })
                    }
                    placeholderText="Pilih tanggal lahir"
                  />
                ) : (
                  <div className={placeholderClass} />
                )}
              </FormField>
              <FormField label="Jenis Kelamin">
                {isClient ? (
                  <SearchableSelect
                    options={[
                      { value: "Laki-laki", label: "Laki-laki" },
                      { value: "Perempuan", label: "Perempuan" },
                    ]}
                    value={formData.jenis_kelamin}
                    onChange={(option) =>
                      setFormData({
                        ...formData,
                        jenis_kelamin: option as FormOption,
                      })
                    }
                  />
                ) : (
                  <div className={placeholderClass} />
                )}
              </FormField>
              <FormField label="No. Handphone">
                <input
                  type="tel"
                  value={formData.handphone}
                  onChange={(e) =>
                    setFormData({ ...formData, handphone: e.target.value })
                  }
                  className={inputClass}
                  placeholder="Contoh: 08123456789"
                />
              </FormField>
              <FormField label="Email">
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  className={inputClass}
                  placeholder="Contoh: nama@avisena.co.id"
                />
              </FormField>
              <FormField label="Alamat (KTP)">
                <textarea
                  value={formData.alamat}
                  onChange={(e) => {
                    setFormData({ ...formData, alamat: e.target.value });
                    if (isAlamatSama) {
                      setFormData((prev) => ({ ...prev, alamat_domisili: e.target.value }));
                    }
                  }}
                  rows={3}
                  className={inputClass}
                  placeholder="Masukkan alamat KTP lengkap"
                ></textarea>
              </FormField>
              <FormField label="Alamat Domisili">
                <div className="mb-2 flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="alamatSama"
                    checked={isAlamatSama}
                    onChange={(e) => {
                      setIsAlamatSama(e.target.checked);
                      if (e.target.checked) {
                        setFormData({ ...formData, alamat_domisili: formData.alamat });
                      }
                    }}
                    className="rounded border-gray-300 text-primary focus:ring-primary"
                  />
                  <label htmlFor="alamatSama" className="text-sm text-slate-600">Sama dengan alamat KTP</label>
                </div>
                {!isAlamatSama && (
                  <textarea
                    value={formData.alamat_domisili}
                    onChange={(e) =>
                      setFormData({ ...formData, alamat_domisili: e.target.value })
                    }
                    rows={3}
                    className={inputClass}
                    placeholder="Masukkan alamat domisili lengkap"
                  ></textarea>
                )}
              </FormField>
            </div>
            <div>
              <h2 className="text-lg font-semibold text-primary-dark mb-4 border-b pb-2">
                Informasi Kepegawaian & Profesional
              </h2>
              <FormField label="Tanggal Masuk">
                {isClient ? (
                  <DatePickerField
                    selected={formData.tanggal_masuk}
                    onChange={(date) =>
                      setFormData({ ...formData, tanggal_masuk: date })
                    }
                    placeholderText="Pilih tanggal masuk"
                  />
                ) : (
                  <div className={placeholderClass} />
                )}
              </FormField>
              <FormField label="Status Kepegawaian">
                {isClient ? (
                  <SearchableSelect
                    options={[
                      { value: "Karyawan Kontrak", label: "Karyawan Kontrak" },
                      { value: "Karyawan Tetap", label: "Karyawan Tetap" },
                      { value: "Dokter Mitra", label: "Dokter Mitra" },
                      { value: "Dokter Tetap", label: "Dokter Tetap" },
                    ]}
                    value={formData.status_kepegawaian}
                    onChange={(option) =>
                      setFormData({
                        ...formData,
                        status_kepegawaian: option as FormOption,
                      })
                    }
                  />
                ) : (
                  <div className={placeholderClass} />
                )}
              </FormField>
              <FormField label="Departemen">
                {isClient ? (
                  <SearchableSelect
                    options={departments}
                    value={formData.departemen_id}
                    onChange={(option) =>
                      setFormData({
                        ...formData,
                        departemen_id: option as FormOption,
                      })
                    }
                    placeholder="Cari & pilih departemen..."
                  />
                ) : (
                  <div className={placeholderClass} />
                )}
              </FormField>
              <FormField label="Level Jabatan">
                {isClient ? (
                  <SearchableSelect
                    options={levelJabatans}
                    value={formData.level_jabatan_id}
                    onChange={(option) =>
                      setFormData({
                        ...formData,
                        level_jabatan_id: option as FormOption,
                      })
                    }
                    placeholder="Cari & pilih level jabatan..."
                  />
                ) : (
                  <div className={placeholderClass} />
                )}
              </FormField>
              <FormField label="Atasan Langsung">
                {isClient ? (
                  <SearchableSelect
                    options={[
                      { value: "", label: "Tanpa Atasan" },
                      ...employeeOptions,
                    ]}
                    value={formData.atasan_id}
                    onChange={(option) =>
                      setFormData({
                        ...formData,
                        atasan_id: option as FormOption,
                      })
                    }
                    placeholder="Pilih atasan langsung..."
                  />
                ) : (
                  <div className={placeholderClass} />
                )}
              </FormField>
              <FormField label="Profesi">
                <input
                  type="text"
                  value={formData.profesi}
                  onChange={(e) =>
                    setFormData({ ...formData, profesi: e.target.value })
                  }
                  className={inputClass}
                  placeholder="Contoh: Perawat, Staf IT"
                />
              </FormField>
              <FormField label="No. SIP (jika ada)">
                <input
                  type="text"
                  value={formData.sip}
                  onChange={(e) =>
                    setFormData({ ...formData, sip: e.target.value })
                  }
                  className={inputClass}
                  placeholder="Masukkan nomor SIP"
                />
              </FormField>
              <FormField label="Masa Berlaku SIP">
                {isClient ? (
                  <DatePickerField
                    selected={formData.masa_berlaku_sip}
                    onChange={(date) =>
                      setFormData({ ...formData, masa_berlaku_sip: date })
                    }
                    placeholderText="Pilih tanggal berlaku"
                  />
                ) : (
                  <div className={placeholderClass} />
                )}
              </FormField>
              <FormField label="Gaji Pokok">
                <input
                  type="number"
                  value={formData.gaji_pokok}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      gaji_pokok: Number(e.target.value),
                    })
                  }
                  className={inputClass}
                  placeholder="Contoh: 5000000"
                />
              </FormField>
              <FormField label="Rekening BSI">
                <input
                  type="text"
                  value={formData.rekening_bsi}
                  onChange={(e) =>
                    setFormData({ ...formData, rekening_bsi: e.target.value })
                  }
                  className={inputClass}
                  placeholder="Contoh: 7123456789"
                />
              </FormField>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t flex justify-end gap-4">
            <Link
              href="/admin/pegawai"
              className="rounded-full bg-slate-200 px-6 py-2 text-sm font-semibold"
            >
              Batal
            </Link>
            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-full bg-primary px-6 py-2 text-sm font-semibold text-white flex items-center justify-center min-w-[120px]"
            >
              {isSubmitting ? (
                <Loader2 className="animate-spin" />
              ) : (
                "Simpan Data"
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
