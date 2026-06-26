"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import { ChevronLeft, Loader2, AlertTriangle } from "lucide-react";
import DatePickerField from "@/app/components/admin/DatePickerField";
import SearchableSelect from "@/app/components/admin/SearchableSelect";
import { showSuccessToast, showErrorToast } from "@/app/components/admin/Alert";

// Tipe data Option menggunakan string untuk UUID
type FormOption = { value: string; label: string };

interface Department {
  id: string; // UUID
  nama_departemen: string;
}

interface LevelJabatan {
  id: string; // UUID
  nama_level: string;
}

// Interface untuk error database agar type-safe
interface DatabaseError extends Error {
  code?: string;
}

const FormField = ({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) => (
  <div className="py-4 border-b border-slate-200 last:border-b-0">
    <label className="block text-sm font-medium text-slate-700 mb-1">
      {label}
    </label>
    {children}
  </div>
);

export default function EditPegawaiPage() {
  const router = useRouter();
  const params = useParams();

  // Pastikan mengambil 'id' sesuai dengan nama folder [id]
  const id = params.id as string;

  const [departments, setDepartments] = useState<FormOption[]>([]);
  const [levelJabatans, setLevelJabatans] = useState<FormOption[]>([]);
  const [employees, setEmployees] = useState<FormOption[]>([]);
  const [isClient, setIsClient] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAlamatSama, setIsAlamatSama] = useState(false);

  const [formData, setFormData] = useState({
    id: "",
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
    if (!id) {
      setIsLoading(false);
      setError("ID tidak valid.");
      return;
    }

    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const [karyawanRes, deptRes, jabatanRes, allKaryawanRes] = await Promise.all([
          fetch(`${baseUrl}/karyawan/${id}`),
          fetch(`${baseUrl}/departments`),
          fetch(`${baseUrl}/level-jabatan`),
          fetch(`${baseUrl}/karyawan`),
        ]);

        if (!karyawanRes.ok) throw new Error("Gagal memuat data pegawai.");
        if (!deptRes.ok) throw new Error("Gagal memuat data departemen.");
        if (!jabatanRes.ok) throw new Error("Gagal memuat data level jabatan.");
        if (!allKaryawanRes.ok) throw new Error("Gagal memuat data semua pegawai.");

        const karyawanData = await karyawanRes.json();
        const deptData: Department[] = await deptRes.json();
        const jabatanData: LevelJabatan[] = await jabatanRes.json();
        const allKaryawanData = await allKaryawanRes.json();

        const deptOptions = deptData.map((d) => ({
          value: d.id,
          label: d.nama_departemen,
        }));
        const jabatanOptions = jabatanData.map((j) => ({
          value: j.id,
          label: j.nama_level,
        }));
        const employeeOptions = allKaryawanData
          .filter((emp: any) => emp.id !== id) // Tidak bisa jadi atasan diri sendiri
          .map((emp: any) => ({
            value: emp.id,
            label: `${emp.nama_lengkap} (${emp.nama_level || 'Tanpa Level'})`,
          }));

        setDepartments(deptOptions);
        setLevelJabatans(jabatanOptions);
        setEmployees(employeeOptions);

        const selectedDept = deptOptions.find(
          (d) => d.label === karyawanData.nama_departemen,
        );
        const selectedLevel = jabatanOptions.find(
          (l) => l.label === karyawanData.nama_level,
        );

        setFormData({
          ...karyawanData,
          tanggal_lahir: karyawanData.tanggal_lahir
            ? new Date(karyawanData.tanggal_lahir)
            : null,
          tanggal_masuk: karyawanData.tanggal_masuk
            ? new Date(karyawanData.tanggal_masuk)
            : null,
          masa_berlaku_sip: karyawanData.masa_berlaku_sip
            ? new Date(karyawanData.masa_berlaku_sip)
            : null,
          jenis_kelamin: {
            value: karyawanData.jenis_kelamin,
            label: karyawanData.jenis_kelamin,
          },
          status_kepegawaian: {
            value: karyawanData.status_kepegawaian,
            label: karyawanData.status_kepegawaian,
          },
          departemen_id: selectedDept || null,
          level_jabatan_id: selectedLevel || null,
          atasan_id: karyawanData.atasan_id ? { value: karyawanData.atasan_id, label: karyawanData.nama_atasan } : null,
          rekening_bsi: karyawanData.rekening_bsi || "",
          alamat_domisili: karyawanData.alamat_domisili || "",
        });
        
        setIsAlamatSama(!karyawanData.alamat_domisili || karyawanData.alamat_domisili === karyawanData.alamat);
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Gagal memuat data.";
        setError(msg);
        showErrorToast(msg);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [baseUrl, id]);

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

      if (!jabatanRes.ok) throw new Error("Gagal memproses ID Jabatan.");
      const { id: jabatan_id } = await jabatanRes.json();

      const karyawanUpdateData = {
        nama_lengkap: formData.nama_lengkap,
        nik: formData.nik,
        profesi: formData.profesi,
        sip: formData.sip,
        masa_berlaku_sip:
          formData.masa_berlaku_sip?.toISOString().split("T")[0] || null,
        handphone: formData.handphone,
        email: formData.email,
        tanggal_lahir:
          formData.tanggal_lahir?.toISOString().split("T")[0] || null,
        jenis_kelamin: formData.jenis_kelamin.value,
        alamat: formData.alamat,
        alamat_domisili: isAlamatSama ? formData.alamat : formData.alamat_domisili,
        tanggal_masuk:
          formData.tanggal_masuk?.toISOString().split("T")[0] || null,
        status_kepegawaian: formData.status_kepegawaian.value,
        gaji_pokok: formData.gaji_pokok,
        rekening_bsi: formData.rekening_bsi,
        jabatan_id: jabatan_id,
        atasan_id: formData.atasan_id?.value || null,
      };

      const karyawanRes = await fetch(`${baseUrl}/karyawan/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(karyawanUpdateData),
      });

      if (!karyawanRes.ok) {
        const errorData = await karyawanRes.json();
        throw new Error(
          errorData.message || "Gagal memperbarui data karyawan.",
        );
      }

      showSuccessToast("Data pegawai berhasil diperbarui!");
      router.push("/admin/pegawai");
    } catch (err: unknown) {
      showErrorToast(err instanceof Error ? err.message : "Terjadi kesalahan.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputClass =
    "w-full border-gray-300 rounded-md shadow-sm focus:border-primary focus:ring-primary focus:ring-opacity-50 text-sm p-2.5";
  const placeholderClass =
    "w-full h-[42px] bg-slate-100 rounded-md animate-pulse";

  if (isLoading) {
    return (
      <div className="p-8 flex justify-center items-center h-full">
        <Loader2 className="animate-spin text-primary" size={48} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-center">
        <AlertTriangle className="mx-auto text-red-500" size={48} />
        <h2 className="mt-4 text-xl font-semibold text-red-600">
          Gagal Memuat Data
        </h2>
        <p className="mt-2 text-slate-500">{error}</p>
        <Link
          href="/admin/pegawai"
          className="mt-6 inline-flex items-center gap-2 text-primary hover:text-primary-dark"
        >
          <ChevronLeft size={20} /> Kembali ke Manajemen Pegawai
        </Link>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="mb-6">
        <Link
          href="/admin/pegawai"
          className="inline-flex items-center gap-2 text-primary hover:text-primary-dark"
        >
          <ChevronLeft size={20} /> Kembali ke Manajemen Pegawai
        </Link>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="bg-white p-8 rounded-lg shadow-md">
          <h1 className="text-2xl font-bold text-primary-dark mb-6 border-b pb-4">
            Edit Data Pegawai
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
                  className={`${inputClass} bg-slate-100 cursor-not-allowed`}
                  disabled
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
                  value={formData.handphone || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, handphone: e.target.value })
                  }
                  className={inputClass}
                />
              </FormField>
              <FormField label="Email">
                <input
                  type="email"
                  value={formData.email || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  className={inputClass}
                />
              </FormField>
              <FormField label="Alamat (KTP)">
                <textarea
                  value={formData.alamat || ""}
                  onChange={(e) => {
                    setFormData({ ...formData, alamat: e.target.value });
                    if (isAlamatSama) {
                      setFormData((prev) => ({ ...prev, alamat_domisili: e.target.value }));
                    }
                  }}
                  rows={3}
                  className={inputClass}
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
                    value={formData.alamat_domisili || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, alamat_domisili: e.target.value })
                    }
                    rows={3}
                    className={inputClass}
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
                      ...employees,
                    ]}
                    value={formData.atasan_id}
                    onChange={(option) =>
                      setFormData({
                        ...formData,
                        atasan_id: option as FormOption | null,
                      })
                    }
                    placeholder="Pilih atasan (opsional)..."
                  />
                ) : (
                  <div className={placeholderClass} />
                )}
              </FormField>
              <FormField label="Profesi">
                <input
                  type="text"
                  value={formData.profesi || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, profesi: e.target.value })
                  }
                  className={inputClass}
                />
              </FormField>
              <FormField label="No. SIP (jika ada)">
                <input
                  type="text"
                  value={formData.sip || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, sip: e.target.value })
                  }
                  className={inputClass}
                />
              </FormField>
              <FormField label="Masa Berlaku SIP">
                {isClient ? (
                  <DatePickerField
                    selected={formData.masa_berlaku_sip}
                    onChange={(date) =>
                      setFormData({ ...formData, masa_berlaku_sip: date })
                    }
                  />
                ) : (
                  <div className={placeholderClass} />
                )}
              </FormField>
              <FormField label="Gaji Pokok">
                <input
                  type="number"
                  value={formData.gaji_pokok || 0}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      gaji_pokok: Number(e.target.value),
                    })
                  }
                  className={inputClass}
                />
              </FormField>
              <FormField label="Rekening BSI">
                <input
                  type="text"
                  value={formData.rekening_bsi || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, rekening_bsi: e.target.value })
                  }
                  className={inputClass}
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
                "Simpan Perubahan"
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
