// File: app/components/calculators/PregnancyCalculator.tsx
"use client";

import { useState } from "react";

interface PregnancyInfo {
  dueDate: string;
  gestationalWeek: number;
  trimester: number;
}

export default function PregnancyCalculator() {
  const [lmp, setLmp] = useState("");
  const [result, setResult] = useState<PregnancyInfo | string | null>(null);

  const calculateDueDate = () => {
    if (!lmp) {
      setResult("Silakan pilih tanggal terlebih dahulu.");
      return;
    }
    const lmpDate = new Date(lmp);
    const today = new Date();

    if (lmpDate > today) {
      setResult("Tanggal tidak valid. Silakan pilih tanggal di masa lalu.");
      return;
    }

    // Hitung perkiraan tanggal persalinan (HPL)
    const dueDate = new Date(lmpDate);
    dueDate.setDate(dueDate.getDate() + 280); // Rata-rata 280 hari atau 40 minggu

    // Hitung usia kehamilan saat ini
    const diffTime = Math.abs(today.getTime() - lmpDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const gestationalWeek = Math.floor(diffDays / 7);

    // Tentukan trimester
    let trimester = 0;
    if (gestationalWeek >= 1 && gestationalWeek <= 13) {
      trimester = 1;
    } else if (gestationalWeek >= 14 && gestationalWeek <= 27) {
      trimester = 2;
    } else if (gestationalWeek >= 28) {
      trimester = 3;
    }

    const options: Intl.DateTimeFormatOptions = {
      year: "numeric",
      month: "long",
      day: "numeric",
    };

    setResult({
      dueDate: dueDate.toLocaleDateString("id-ID", options),
      gestationalWeek,
      trimester,
    });
  };

  return (
    <div>
      <h3 className="text-2xl font-bold text-primary-dark mb-4">
        Kalkulator Kehamilan
      </h3>
      <p className="text-slate-600 mb-6">
        Masukkan tanggal pertama dari periode menstruasi terakhir Anda (HPHT)
        untuk memperkirakan tanggal persalinan dan trimester saat ini.
      </p>

      <div className="space-y-4">
        <div>
          <label
            htmlFor="lmp"
            className="block text-sm font-medium text-slate-700 mb-1"
          >
            Tanggal Pertama Haid Terakhir (HPHT)
          </label>
          <input
            type="date"
            id="lmp"
            value={lmp}
            onChange={(e) => setLmp(e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
          />
        </div>
        <button
          onClick={calculateDueDate}
          className="w-full bg-primary text-white px-4 py-2 rounded-full hover:bg-secondary transition-colors font-semibold"
        >
          Hitung Perkiraan
        </button>
      </div>

      {result && (
        <div className="mt-6 p-4 bg-background-soft rounded-lg text-center space-y-4">
          {typeof result === "string" ? (
            <p className="text-red-600 font-semibold">{result}</p>
          ) : (
            <>
              <div>
                <p className="text-sm text-primary-dark">
                  Perkiraan Tanggal Persalinan Anda:
                </p>
                <p className="text-2xl font-bold text-primary">
                  {result.dueDate}
                </p>
              </div>
              <div>
                <p className="text-sm text-primary-dark">
                  Saat ini Anda berada di:
                </p>
                <p className="text-xl font-bold text-primary">
                  Trimester ke-{result.trimester} (Minggu ke-
                  {result.gestationalWeek})
                </p>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
