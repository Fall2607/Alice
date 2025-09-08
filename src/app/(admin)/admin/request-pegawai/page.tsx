// File: app/(admin)/admin/request-pegawai/page.tsx
"use client";

import { useState } from "react";
import { PlusCircle, CheckCircle, XCircle } from "lucide-react";
import {
  jobRequests as initialRequests,
  JobRequest,
} from "@/app/data/requests";
import { departments } from "@/app/data/departements";
import { jobPositions } from "@/app/data/careers";
import Modal from "@/app/components/modal";

export default function RequestPegawaiPage() {
  const [requests, setRequests] = useState(initialRequests);
  const [selectedRequest, setSelectedRequest] = useState<JobRequest | null>(
    null
  );

  // State untuk setiap modal
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isApproveModalOpen, setIsApproveModalOpen] = useState(false);
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);

  const handleCloseModals = () => {
    setIsAddModalOpen(false);
    setIsApproveModalOpen(false);
    setIsRejectModalOpen(false);
    setSelectedRequest(null);
  };

  const handleOpenApproveModal = (request: JobRequest) => {
    setSelectedRequest(request);
    setIsApproveModalOpen(true);
  };

  const handleOpenRejectModal = (request: JobRequest) => {
    setSelectedRequest(request);
    setIsRejectModalOpen(true);
  };

  const handleApprove = () => {
    if (!selectedRequest) return;
    console.log(
      `Request ID ${selectedRequest.id} disetujui dan lowongan dibuat.`
    );
    setRequests(
      requests.map((r) =>
        r.id === selectedRequest.id ? { ...r, status: "Disetujui" } : r
      )
    );
    handleCloseModals();
  };

  const handleReject = () => {
    if (!selectedRequest) return;
    console.log(`Request ID ${selectedRequest.id} ditolak.`);
    setRequests(
      requests.map((r) =>
        r.id === selectedRequest.id ? { ...r, status: "Ditolak" } : r
      )
    );
    handleCloseModals();
  };

  const getStatusClass = (status: string) => {
    switch (status) {
      case "Menunggu Persetujuan":
        return "bg-yellow-100 text-yellow-800";
      case "Disetujui":
        return "bg-green-100 text-green-800";
      case "Ditolak":
        return "bg-red-100 text-red-800";
      default:
        return "bg-slate-100 text-slate-800";
    }
  };

  const getUrgencyClass = (urgency: string) => {
    switch (urgency) {
      case "Tinggi":
        return "text-red-600 font-semibold";
      case "Sedang":
        return "text-yellow-600 font-semibold";
      case "Rendah":
        return "text-green-600 font-semibold";
      default:
        return "text-slate-600";
    }
  };

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-primary-dark">
          Request Penambahan Pegawai
        </h1>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-2 bg-primary text-white font-semibold py-2 px-4 rounded-lg hover:bg-primary-dark"
        >
          <PlusCircle size={20} />
          Buat Request Baru
        </button>
      </div>

      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-slate-500">
            <thead className="text-xs text-white uppercase bg-primary-dark">
              <tr>
                <th scope="col" className="px-6 py-3">
                  Posisi yang Diajukan
                </th>
                <th scope="col" className="px-6 py-3">
                  Requester
                </th>
                <th scope="col" className="px-6 py-3">
                  Tanggal
                </th>
                <th scope="col" className="px-6 py-3">
                  Urgensi
                </th>
                <th scope="col" className="px-6 py-3">
                  Status
                </th>
                <th scope="col" className="px-6 py-3 text-center">
                  Aksi HC
                </th>
              </tr>
            </thead>
            <tbody>
              {requests.map((req) => (
                <tr
                  key={req.id}
                  className="bg-white border-b border-slate-300 last:border-b-0 hover:bg-slate-50"
                >
                  <th
                    scope="row"
                    className="px-6 py-4 font-medium text-slate-900"
                  >
                    {req.position}
                    <p className="font-normal text-slate-500">
                      {req.quantity} orang
                    </p>
                  </th>
                  <td className="px-6 py-4">
                    {req.requester}
                    <p className="text-slate-500 text-xs">{req.department}</p>
                  </td>
                  <td className="px-6 py-4">
                    {new Date(req.requestDate).toLocaleDateString("id-ID", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </td>
                  <td className={`px-6 py-4 ${getUrgencyClass(req.urgency)}`}>
                    {req.urgency}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusClass(
                        req.status
                      )}`}
                    >
                      {req.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    {req.status === "Menunggu Persetujuan" && (
                      <div className="flex justify-center items-center gap-2">
                        <button
                          onClick={() => handleOpenApproveModal(req)}
                          className="p-2 text-green-600 hover:bg-green-50 rounded-full"
                          title="Setujui"
                        >
                          <CheckCircle size={18} />
                        </button>
                        <button
                          onClick={() => handleOpenRejectModal(req)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-full"
                          title="Tolak"
                        >
                          <XCircle size={18} />
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Tambah Request */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={handleCloseModals}
        title="Buat Request Pegawai Baru"
      >
        <form>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Departemen
              </label>
              <select className="w-full px-3 py-2 border border-gray-300 rounded-md">
                {departments.map((d) => (
                  <option key={d.id}>{d.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Posisi Jabatan
              </label>
              <select className="w-full px-3 py-2 border border-gray-300 rounded-md">
                {Object.values(jobPositions)
                  .flat()
                  .map((p) => (
                    <option key={p}>{p}</option>
                  ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Jumlah Dibutuhkan
              </label>
              <input
                type="number"
                min="1"
                defaultValue="1"
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tingkat Urgensi
              </label>
              <select className="w-full px-3 py-2 border border-gray-300 rounded-md">
                <option>Rendah</option>
                <option>Sedang</option>
                <option>Tinggi</option>
              </select>
            </div>
          </div>
          <div className="mt-6 flex justify-end gap-4">
            <button
              type="button"
              onClick={handleCloseModals}
              className="rounded-full bg-slate-200 px-4 py-2 text-sm"
            >
              Batal
            </button>
            <button
              type="submit"
              className="rounded-full bg-primary px-4 py-2 text-sm text-white"
            >
              Kirim Request
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal Setujui Request */}
      <Modal
        isOpen={isApproveModalOpen}
        onClose={handleCloseModals}
        title="Setujui & Buat Lowongan"
      >
        {selectedRequest && (
          <div>
            <div className="space-y-2 text-sm text-slate-600 border-b pb-4 mb-4">
              <p>Anda akan menyetujui permintaan penambahan pegawai untuk:</p>
              <p>
                <strong>Posisi:</strong> {selectedRequest.position}
              </p>
              <p>
                <strong>Jumlah:</strong> {selectedRequest.quantity} orang
              </p>
              <p>
                <strong>Departemen:</strong> {selectedRequest.department}
              </p>
            </div>
            <p className="text-slate-600">
              Tindakan ini akan secara otomatis membuat draf lowongan baru di
              halaman Manajemen Lowongan. Lanjutkan?
            </p>
            <div className="mt-6 flex justify-end gap-4">
              <button
                onClick={handleCloseModals}
                className="rounded-full bg-slate-200 px-4 py-2 text-sm"
              >
                Batal
              </button>
              <button
                onClick={handleApprove}
                className="rounded-full bg-green-600 px-4 py-2 text-sm text-white"
              >
                Ya, Setujui & Buat Lowongan
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Modal Tolak Request */}
      <Modal
        isOpen={isRejectModalOpen}
        onClose={handleCloseModals}
        title="Tolak Request"
      >
        <p className="text-slate-600">
          Apakah Anda yakin ingin menolak request ini?
        </p>
        <div className="mt-6 flex justify-end gap-4">
          <button
            onClick={handleCloseModals}
            className="rounded-full bg-slate-200 px-4 py-2 text-sm"
          >
            Batal
          </button>
          <button
            onClick={handleReject}
            className="rounded-full bg-red-600 px-4 py-2 text-sm text-white"
          >
            Ya, Tolak
          </button>
        </div>
      </Modal>
    </div>
  );
}
