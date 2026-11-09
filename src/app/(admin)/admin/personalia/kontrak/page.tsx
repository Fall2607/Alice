"use client";

import React, { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import {
  MOCK_KARYAWAN_KONTRAK,
  KaryawanKontrakItem,
  getNormaColorBadge,
} from "@/app/data/penilaianKinerjaData";
import FormPenilaianKinerjaView, {
  FormAssessmentData,
} from "@/app/components/admin/FormPenilaianKinerjaView";
import SearchableSelect from "@/app/components/admin/SearchableSelect";
import Pagination from "@/app/components/admin/Pagination";
import { showSuccessToast, showInfoToast } from "@/app/components/admin/Alert";
import {
  FileSignature,
  Search,
  Send,
  Mail,
  Copy,
  ExternalLink,
  CheckCircle2,
  Clock,
  X,
  Check,
} from "lucide-react";

type FormOption = { value: string; label: string };

const LEVEL_OPTIONS: FormOption[] = [
  { value: "all", label: "Semua Level" },
  { value: "Staff", label: "Staff (Penilai: Koordinator)" },
  { value: "Koordinator", label: "Koordinator (Penilai: SPV)" },
  { value: "SPV", label: "SPV (Penilai: Direktur)" },
];

const STATUS_OPTIONS: FormOption[] = [
  { value: "all", label: "Semua Status" },
  { value: "BELUM_DIKIRIM", label: "Belum Dikirim" },
  { value: "MENUNGGU_PENILAIAN", label: "Menunggu Penilaian" },
  { value: "SELESAI", label: "Evaluasi Selesai" },
];

const URGENCY_OPTIONS: FormOption[] = [
  { value: "all", label: "Semua Sisa Waktu" },
  { value: "LE_30", label: "≤ 30 Hari (Kritis)" },
  { value: "LE_60", label: "≤ 60 Hari" },
];

export default function KontrakPegawaiPage() {
  const [karyawanList, setKaryawanList] =
    useState<readonly KaryawanKontrakItem[]>(MOCK_KARYAWAN_KONTRAK);

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedLevel, setSelectedLevel] = useState<FormOption | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<FormOption | null>(null);
  const [selectedUrgency, setSelectedUrgency] = useState<FormOption | null>(null);

  const [selectedIds, setSelectedIds] = useState<readonly string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const [activeKaryawanForm, setActiveKaryawanForm] =
    useState<KaryawanKontrakItem | null>(null);

  const [blastModalData, setBlastModalData] = useState<{
    readonly items: readonly KaryawanKontrakItem[];
    readonly isOpen: boolean;
  }>({
    items: [],
    isOpen: false,
  });

  const [copiedToken, setCopiedToken] = useState<string | null>(null);

  // Filter dan sort dari sisa kontrak paling dekat ke paling lama (ascending)
  const sortedAndFilteredList = useMemo(() => {
    return karyawanList
      .filter((k) => {
        const term = searchTerm.toLowerCase();
        const searchMatch =
          k.nama_lengkap.toLowerCase().includes(term) ||
          k.nip.toLowerCase().includes(term) ||
          k.unit.toLowerCase().includes(term) ||
          k.jabatan.toLowerCase().includes(term) ||
          k.penilai.nama.toLowerCase().includes(term) ||
          k.penilai.jabatan.toLowerCase().includes(term);

        if (!searchMatch) return false;

        if (selectedLevel && selectedLevel.value !== "all" && k.level !== selectedLevel.value) {
          return false;
        }

        if (
          selectedStatus &&
          selectedStatus.value !== "all" &&
          k.statusPenilaian !== selectedStatus.value
        ) {
          return false;
        }

        if (selectedUrgency && selectedUrgency.value === "LE_30" && k.sisa_hari > 30) {
          return false;
        }
        if (selectedUrgency && selectedUrgency.value === "LE_60" && k.sisa_hari > 60) {
          return false;
        }

        return true;
      })
      .sort((a, b) => a.sisa_hari - b.sisa_hari); // Sort dari paling dekat ke paling lama
  }, [karyawanList, searchTerm, selectedLevel, selectedStatus, selectedUrgency]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedLevel, selectedStatus, selectedUrgency]);

  const itemOffset = (currentPage - 1) * itemsPerPage;
  const currentItems = sortedAndFilteredList.slice(itemOffset, itemOffset + itemsPerPage);
  const totalPages = Math.ceil(sortedAndFilteredList.length / itemsPerPage);

  const handleToggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
  };

  const handleCopyMagicLink = (token: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const url = `${window.location.origin}/penilaian-kinerja/${token}`;
    navigator.clipboard.writeText(url);
    setCopiedToken(token);
    showSuccessToast("Tautan Magic Link Penilaian berhasil disalin.");
    setTimeout(() => {
      setCopiedToken(null);
    }, 2500);
  };

  const handleOpenSingleBlast = (k: KaryawanKontrakItem) => {
    setBlastModalData({
      items: [k],
      isOpen: true,
    });
  };

  const handleOpenBulkBlast = () => {
    const selectedItems = karyawanList.filter((k) => selectedIds.includes(k.id));
    if (selectedItems.length === 0) {
      showInfoToast("Pilih minimal 1 karyawan untuk dikirimkan link evaluasi.");
      return;
    }
    setBlastModalData({
      items: selectedItems,
      isOpen: true,
    });
  };

  const handleExecuteBlast = () => {
    const idsToUpdate = blastModalData.items.map((k) => k.id);
    const nowIso = new Date().toISOString();

    setKaryawanList((prev) =>
      prev.map((k) => {
        if (idsToUpdate.includes(k.id)) {
          return {
            ...k,
            statusPenilaian: "MENUNGGU_PENILAIAN",
            tgl_kirim_link: nowIso,
          };
        }
        return k;
      }),
    );

    showSuccessToast(
      `Magic link berhasil dikirimkan ke ${blastModalData.items.length} pimpinan penilai.`,
    );
    setBlastModalData({ items: [], isOpen: false });
    setSelectedIds([]);
  };

  const handleSaveForm = (resultData: FormAssessmentData) => {
    if (!activeKaryawanForm) return;

    setKaryawanList((prev) =>
      prev.map((k) => {
        if (k.id === activeKaryawanForm.id) {
          return {
            ...k,
            statusPenilaian: "SELESAI",
            tgl_dinilai: new Date().toISOString(),
            hasil: {
              totalSkor: resultData.totalSkor,
              indeksPrestasi: resultData.indeksPrestasi,
              norma: resultData.norma,
              kategoriNorma: resultData.kategoriNorma,
              rekomendasi: {
                tipe: resultData.rekomendasiUtama,
                detail:
                  resultData.catatanSaran ||
                  "Penilaian kinerja telah diverifikasi resmi oleh pimpinan.",
              },
            },
          };
        }
        return k;
      }),
    );

    showSuccessToast(
      `Hasil penilaian kinerja ${activeKaryawanForm.nama_lengkap} berhasil disimpan.`,
    );
    setActiveKaryawanForm(null);
  };

  const renderTableRows = (employees: readonly KaryawanKontrakItem[]) => {
    return employees.map((employee) => {
      const isSelected = selectedIds.includes(employee.id);
      const isUrgent = employee.sisa_hari <= 30;

      const rowClass = isUrgent
        ? "bg-red-50/70 hover:bg-red-100/70"
        : employee.statusPenilaian === "MENUNGGU_PENILAIAN"
          ? "bg-amber-50/40 hover:bg-amber-100/40"
          : "bg-white hover:bg-slate-50";

      return (
        <tr
          key={employee.id}
          className={`${rowClass} border-b border-slate-300 last:border-b-0 ${isSelected ? "bg-blue-50/60" : ""
            }`}
        >
          {/* Checkbox */}
          <td className="px-6 py-4 text-center">
            <input
              type="checkbox"
              checked={isSelected}
              onChange={() => handleToggleSelect(employee.id)}
              className="w-4 h-4 rounded text-primary focus:ring-primary border-slate-300 cursor-pointer"
            />
          </td>

          {/* Nama Pegawai & NIP */}
          <td className="px-6 py-4">
            <div className="flex items-center gap-3">
              <div>
                <p className="font-semibold text-slate-900 leading-snug">
                  {employee.gelar_depan ? `${employee.gelar_depan} ` : ""}
                  {employee.nama_lengkap}
                  {employee.gelar_belakang ? `, ${employee.gelar_belakang}` : ""}
                </p>
                <p className="text-xs text-slate-500 font-mono tabular-nums mt-0.5">
                  NIP: {employee.nip} &bull; {employee.unit}
                </p>
              </div>
            </div>
          </td>

          {/* Level & Jabatan */}
          <td className="px-6 py-4">
            <p className="font-medium text-slate-900">{employee.jabatan}</p>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span
                className={`px-2 py-0.5 text-xs font-semibold rounded-full ${employee.level === "SPV"
                    ? "bg-purple-100 text-purple-800"
                    : employee.level === "Koordinator"
                      ? "bg-indigo-100 text-indigo-800"
                      : "bg-blue-100 text-blue-800"
                  }`}
              >
                {employee.level}
              </span>
              {employee.hasSubordinates && (
                <span className="text-[10px] text-amber-800 bg-amber-100 px-1.5 py-0.5 rounded-full font-medium">
                  + Manajerial
                </span>
              )}
            </div>
          </td>

          {/* Sisa Masa Kontrak */}
          <td className="px-6 py-4 font-mono tabular-nums">
            <div className="flex items-center gap-2">
              <p
                className={`font-bold text-sm ${isUrgent ? "text-red-700" : "text-slate-800"
                  }`}
              >
                {employee.sisa_hari} Hari Lagi
              </p>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              s/d {employee.tgl_selesai_kontrak}
            </p>
          </td>

          {/* Atasan Penilai */}
          <td className="px-6 py-4">
            <p className="font-medium text-slate-900">{employee.penilai.nama}</p>
            <p className="text-xs text-slate-500">{employee.penilai.jabatan}</p>
          </td>

          {/* Status Penilaian */}
          <td className="px-6 py-4 text-center">
            {employee.statusPenilaian === "SELESAI" && employee.hasil ? (
              <div className="inline-flex flex-col items-center">
                <span
                  className={`px-2.5 py-1 text-xs font-semibold rounded-full ${getNormaColorBadge(
                    employee.hasil.kategoriNorma,
                  )}`}
                >
                  Norma {employee.hasil.norma.toFixed(2)} ({employee.hasil.kategoriNorma})
                </span>
                <span className="text-[11px] text-slate-500 mt-1 font-medium">
                  Rekomendasi: {employee.hasil.rekomendasi.tipe}
                </span>
              </div>
            ) : employee.statusPenilaian === "MENUNGGU_PENILAIAN" ? (
              <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-amber-100 text-amber-800">
                Menunggu Penilaian
              </span>
            ) : (
              <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-slate-100 text-slate-700">
                Belum Dikirim
              </span>
            )}
          </td>

          {/* Aksi */}
          <td className="px-6 py-4">
            <div className="flex items-center justify-center gap-2">
              <button
                onClick={() => setActiveKaryawanForm(employee)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-primary text-white text-xs font-semibold rounded-lg hover:bg-primary-dark transition-colors"
                title="Buka Form Penilaian Kinerja"
              >
                <FileSignature size={14} />
                <span>Form Nilai</span>
              </button>

              <button
                onClick={() => handleOpenSingleBlast(employee)}
                className="p-1.5 text-slate-500 hover:text-emerald-600 transition-colors"
                title="Kirim Magic Link ke Atasan Penilai"
              >
                <Mail size={18} />
              </button>

              <button
                onClick={(e) => handleCopyMagicLink(employee.magicLinkToken, e)}
                className={`p-1.5 transition-colors ${copiedToken === employee.magicLinkToken
                    ? "text-emerald-600"
                    : "text-slate-500 hover:text-primary"
                  }`}
                title="Salin Magic Link Penilaian"
              >
                {copiedToken === employee.magicLinkToken ? (
                  <Check size={18} />
                ) : (
                  <Copy size={18} />
                )}
              </button>

              <Link
                href={`/penilaian-kinerja/${employee.magicLinkToken}`}
                target="_blank"
                className="p-1.5 text-blue-600 hover:text-blue-800 transition-colors"
                title="Buka Form di Tab Baru"
              >
                <ExternalLink size={18} />
              </Link>
            </div>
          </td>
        </tr>
      );
    });
  };

  return (
    <div className="p-8">
      {/* Header Halaman (Identik dengan Manajemen Pegawai) */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold text-primary-dark">
            Monitoring Masa Kontrak Pegawai (PKWT)
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Daftar pegawai dengan masa kontrak yang berakhir dalam 90 hari ke depan, diurutkan dari sisa masa kontrak terdekat.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleOpenBulkBlast}
            disabled={selectedIds.length === 0}
            className={`flex items-center gap-2 font-semibold py-2 px-4 rounded-lg transition-all ${selectedIds.length > 0
                ? "bg-primary text-white hover:bg-primary-dark shadow-sm active:scale-95"
                : "bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed"
              }`}
          >
            <Send size={18} />
            <span>Blast Magic Link ({selectedIds.length})</span>
          </button>
        </div>
      </div>

      {/* Grid Filter (Identik dengan grid 5 kolom Manajemen Pegawai) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
        <div className="relative lg:col-span-2">
          <input
            type="text"
            placeholder="Cari NIP, nama pegawai, unit kerja, atau atasan..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border rounded-lg text-sm text-slate-900 focus:outline-none focus:border-primary"
          />
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            size={20}
          />
        </div>

        <div>
          <SearchableSelect
            options={LEVEL_OPTIONS}
            value={selectedLevel}
            onChange={(val) => setSelectedLevel(val as FormOption | null)}
            placeholder="Filter level..."
          />
        </div>

        <div>
          <SearchableSelect
            options={STATUS_OPTIONS}
            value={selectedStatus}
            onChange={(val) => setSelectedStatus(val as FormOption | null)}
            placeholder="Filter status..."
          />
        </div>

        <div>
          <SearchableSelect
            options={URGENCY_OPTIONS}
            value={selectedUrgency}
            onChange={(val) => setSelectedUrgency(val as FormOption | null)}
            placeholder="Filter sisa waktu..."
          />
        </div>
      </div>

      {/* Title Bar Tabel Tunggal */}
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-xl font-semibold text-primary-dark">
          Daftar Kontrak Pegawai
        </h2>
        <span className="text-sm text-slate-600">
          Total: <b className="text-slate-900 font-mono tabular-nums">{sortedAndFilteredList.length}</b> pegawai
        </span>
      </div>

      {/* Tabel Utama Tunggal: Diurutkan dari paling dekat ke paling lama */}
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-slate-500">
            <thead className="text-xs text-white uppercase bg-primary-dark">
              <tr>
                <th scope="col" className="px-6 py-3.5 w-12 text-center">
                  <input
                    type="checkbox"
                    checked={
                      currentItems.length > 0 &&
                      currentItems.every((k) => selectedIds.includes(k.id))
                    }
                    onChange={(e) => {
                      if (e.target.checked) {
                        const newIds = Array.from(
                          new Set([...selectedIds, ...currentItems.map((k) => k.id)]),
                        );
                        setSelectedIds(newIds);
                      } else {
                        setSelectedIds(
                          selectedIds.filter((id) => !currentItems.some((k) => k.id === id)),
                        );
                      }
                    }}
                    className="w-4 h-4 rounded text-primary focus:ring-primary border-slate-300 cursor-pointer"
                  />
                </th>
                <th scope="col" className="px-6 py-3.5">Nama Pegawai</th>
                <th scope="col" className="px-6 py-3.5">Level & Jabatan</th>
                <th scope="col" className="px-6 py-3.5">Sisa Kontrak</th>
                <th scope="col" className="px-6 py-3.5">Atasan Penilai</th>
                <th scope="col" className="px-6 py-3.5 text-center">Status</th>
                <th scope="col" className="px-6 py-3.5 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {currentItems.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center p-8 text-slate-500">
                    Tidak ada data pegawai yang sesuai dengan filter pencarian.
                  </td>
                </tr>
              ) : (
                renderTableRows(currentItems)
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Identik dengan Halaman Manajemen Pegawai */}
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      </div>

      {/* ================= MODAL BLAST EMAIL MAGIC LINK ================= */}
      {blastModalData.isOpen && blastModalData.items.length > 0 && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-xl max-w-xl w-full max-h-[90vh] flex flex-col shadow-xl border border-slate-200 overflow-hidden">
            {/* Header Modal */}
            <div className="p-4 bg-primary-dark text-white flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2.5">
                <Send size={18} className="text-cyan-400" />
                <h3 className="font-bold text-sm">
                  Pengiriman Magic Link Evaluasi Kinerja
                </h3>
              </div>
              <button
                onClick={() => setBlastModalData({ items: [], isOpen: false })}
                className="text-slate-300 hover:text-white p-1"
              >
                <X size={18} />
              </button>
            </div>

            {/* Email Preview Body */}
            <div className="p-5 overflow-y-auto space-y-4 text-xs">
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 space-y-1.5 text-slate-600 font-medium">
                <div>
                  <span className="text-slate-400 w-16 inline-block">Pengirim:</span>
                  <span className="font-semibold text-slate-800">
                    Human Capital RSU Avisena &lt;hrd@avisena.co.id&gt;
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 w-16 inline-block">Penerima:</span>
                  <span className="font-semibold text-slate-800">
                    {blastModalData.items.map((it) => it.penilai.email).join(", ")}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 w-16 inline-block">Perihal:</span>
                  <span className="font-semibold text-primary">
                    [RSU Avisena] Permohonan Penilaian Kinerja Karyawan Habis Kontrak
                  </span>
                </div>
              </div>

              <div className="border border-slate-200 rounded-lg p-4 bg-white space-y-3 text-slate-700 leading-relaxed">
                <p>
                  Yth.{" "}
                  <b>
                    {blastModalData.items.length === 1
                      ? `${blastModalData.items[0].penilai.nama}`
                      : "Bapak / Ibu Pimpinan Penilai"}
                  </b>
                  ,
                </p>
                <p>
                  Sehubungan dengan akan berakhirnya masa perjanjian kerja pegawai di unit Anda, kami
                  memohon kesediaan Bapak/Ibu untuk mengisi formulir evaluasi kinerja resmi RSU Avisena.
                </p>

                <div className="bg-slate-50 p-3 rounded border border-slate-200 space-y-1">
                  <p className="font-bold text-slate-800">Daftar Pegawai yang Perlu Dinilai:</p>
                  <ul className="list-disc list-inside space-y-1 text-slate-600">
                    {blastModalData.items.map((it) => (
                      <li key={it.id}>
                        <b>{it.nama_lengkap}</b> ({it.jabatan} - {it.unit}) &mdash; Sisa:{" "}
                        <span className="text-red-600 font-bold font-mono tabular-nums">
                          {it.sisa_hari} hari
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>

                <p className="text-slate-500 text-[11px] pt-2 border-t border-slate-100">
                  Tautan evaluasi bersifat rahasia dan dapat diakses langsung oleh atasan tanpa kata sandi.
                </p>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="p-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-2.5 shrink-0">
              <button
                onClick={() => setBlastModalData({ items: [], isOpen: false })}
                className="px-3.5 py-1.5 text-slate-600 hover:text-slate-800 text-xs font-semibold rounded-lg"
              >
                Batal
              </button>
              <button
                onClick={handleExecuteBlast}
                className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-primary hover:bg-primary-dark text-white text-xs font-bold rounded-lg shadow-xs transition-colors"
              >
                <Send size={13} />
                <span>Kirimkan Sekarang</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL FULL FORM PENILAIAN KINERJA ================= */}
      {activeKaryawanForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-xl w-full max-w-6xl h-[94vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
            {/* Modal Header */}
            <div className="px-5 py-3.5 bg-primary-dark text-white flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2.5">
                <FileSignature size={18} className="text-white" />
                <div>
                  <h2 className="text-sm font-bold truncate">
                    Evaluasi Kinerja: {activeKaryawanForm.nama_lengkap}
                  </h2>
                  <p className="text-[11px] text-slate-300">
                    {activeKaryawanForm.jabatan} &bull; Penilai:{" "}
                    <span className="text-white font-semibold">
                      {activeKaryawanForm.penilai.nama}
                    </span>
                  </p>
                </div>
              </div>
              <button
                onClick={() => setActiveKaryawanForm(null)}
                className="text-slate-300 hover:text-white p-1"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Content */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-50">
              <FormPenilaianKinerjaView
                karyawan={activeKaryawanForm}
                onSave={handleSaveForm}
                onCancel={() => setActiveKaryawanForm(null)}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
