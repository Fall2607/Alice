// File: app/(admin)/admin/lowongan/[slug]/page.tsx
"use client";

import { useParams } from 'next/navigation';
import { jobOpenings, applicants } from '@/app/data/careers';
import Link from 'next/link';
import { ChevronLeft, Briefcase, MapPin, Clock, Eye } from 'lucide-react';

export default function DetailLowonganPage() {
    const params = useParams();
    const slug = params.slug;

    const job = jobOpenings.find(j => j.id.toString() === slug);
    const jobApplicants = applicants.filter(a => a.jobId.toString() === slug);

    const getStatusClass = (status: string) => {
        switch (status) {
            case 'Baru':
                return 'bg-blue-100 text-blue-800';
            case 'Ditinjau':
                return 'bg-yellow-100 text-yellow-800';
            case 'Wawancara':
                return 'bg-green-100 text-green-800';
            case 'Ditolak':
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-slate-100 text-slate-800';
        }
    };

    if (!job) {
        return (
            <div className="p-8 text-center">
                <h1 className="text-2xl font-bold text-red-600">Lowongan tidak ditemukan</h1>
                <Link href="/admin/lowongan" className="text-primary hover:underline mt-4 inline-block">
                    <span className="flex items-center gap-2">
                        <ChevronLeft size={20} />
                        Kembali ke daftar lowongan
                    </span>
                </Link>
            </div>
        );
    }

    return (
        <div className="p-8">
            <div>
                <Link href="/admin/lowongan" className="inline-flex items-center gap-2 text-primary hover:text-primary-dark transition-colors mb-6">
                    <ChevronLeft size={20} />
                    Kembali ke Daftar Lowongan
                </Link>
            </div>

            <div className="bg-white p-8 rounded-lg shadow-md">
                {/* Header Lowongan */}
                <div className="border-b  pb-4">
                    <span className={`px-3 py-1 text-sm font-medium rounded-full mb-4 inline-block ${job.category === 'Medis'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-green-100 text-green-800'
                        }`}>
                        {job.category}
                    </span>
                    <h1 className="text-4xl font-bold text-primary-dark mb-2">{job.title}</h1>
                    <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-slate-500">
                        <div className="flex items-center gap-2">
                            <Briefcase size={16} />
                            <span>{job.type}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <MapPin size={16} />
                            <span>{job.location}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Clock size={16} />
                            <span>Diposting pada: {new Date(job.postedDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                        </div>
                    </div>
                </div>

                {/* Deskripsi & Kualifikasi */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 my-6">
                    <div>
                        <div className="border-b border-slate-200 pb-2 mb-4">
                            <h2 className="text-xl font-semibold text-primary-dark">Deskripsi Pekerjaan</h2>
                        </div>
                        <p className="text-slate-600 text-sm leading-relaxed">{job.description}</p>
                    </div>
                    <div>
                        <div className="border-b border-slate-200 pb-2 mb-4">
                            <h2 className="text-xl font-semibold text-primary-dark">Kualifikasi</h2>
                        </div>
                        <ul className="list-disc list-inside space-y-2 text-slate-600 text-sm">
                            {job.qualifications.map((q, index) => (
                                <li key={index}>{q}</li>
                            ))}
                        </ul>
                    </div>
                </div>

                {/* Tabel Kandidat */}
                <div className="border-t pt-6">
                    <h2 className="text-2xl font-bold text-primary-dark mb-4">
                        Kandidat yang Melamar ({jobApplicants.length})
                    </h2>
                    <div className="overflow-x-auto rounded-lg border">
                        <table className="w-full text-sm text-left text-slate-500">
                            <thead className="text-xs text-white uppercase bg-primary-dark">
                                <tr>
                                    <th scope="col" className="px-6 py-3">Nama Kandidat</th>
                                    <th scope="col" className="px-6 py-3">Tanggal Melamar</th>
                                    <th scope="col" className="px-6 py-3">Status</th>
                                    <th scope="col" className="px-6 py-3 text-center">Aksi</th>
                                </tr>
                            </thead>
                            <tbody>
                                {jobApplicants.length > 0 ? (
                                    jobApplicants.map((applicant) => (
                                        <tr key={applicant.id} className="bg-white border-b border-slate-200 last:border-b-0 hover:bg-slate-50">
                                            <th scope="row" className="px-6 py-4 font-medium text-slate-900 whitespace-nowrap">
                                                {applicant.name}
                                                <p className="font-normal text-slate-500">{applicant.email}</p>
                                            </th>
                                            <td className="px-6 py-4">
                                                {new Date(applicant.appliedDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusClass(applicant.status)}`}>
                                                    {applicant.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <button className="text-primary hover:text-primary-dark p-2 rounded-full hover:bg-slate-100" title="Lihat CV">
                                                    <Eye size={18} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={4} className="text-center py-10 text-slate-500">
                                            Belum ada kandidat yang melamar untuk posisi ini.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}

