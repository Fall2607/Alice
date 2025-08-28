// File: app/(admin)/admin/page.tsx
import { Stethoscope, HeartPulse, Newspaper } from "lucide-react";

const stats = [
  { name: "Total Dokter", stat: "25", icon: Stethoscope },
  { name: "Total Layanan", stat: "16", icon: HeartPulse },
  { name: "Total Artikel", stat: "3", icon: Newspaper },
];

export default function DashboardPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold text-primary-dark mb-6">Dashboard</h1>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {stats.map((item) => (
          <div
            key={item.name}
            className="overflow-hidden rounded-lg bg-white px-4 py-5 shadow sm:p-6"
          >
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <item.icon
                  className="h-8 w-8 text-primary"
                  aria-hidden="true"
                />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dt className="truncate text-sm font-medium text-gray-500">
                  {item.name}
                </dt>
                <dd className="text-3xl font-semibold tracking-tight text-gray-900">
                  {item.stat}
                </dd>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-bold text-primary-dark">Selamat Datang!</h2>
        <p className="text-slate-600 mt-2">
          Anda telah masuk ke dasbor admin RSU Avisena. Dari sini, Anda dapat
          mengelola konten dokter, layanan, dan artikel yang ditampilkan di
          website utama.
        </p>
      </div>
    </div>
  );
}
