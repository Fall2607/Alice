// File: app/components/calculators/PregnancyCalculator.tsx
"use client";

import { useState } from 'react';

export default function PregnancyCalculator() {
    const [lmp, setLmp] = useState('');
    const [dueDate, setDueDate] = useState<string | null>(null);

    const calculateDueDate = () => {
        if (!lmp) {
            setDueDate("Silakan pilih tanggal terlebih dahulu.");
            return;
        }
        const lmpDate = new Date(lmp);
        // Naegele's rule: LMP + 1 year - 3 months + 7 days
        lmpDate.setFullYear(lmpDate.getFullYear() + 1);
        lmpDate.setMonth(lmpDate.getMonth() - 3);
        lmpDate.setDate(lmpDate.getDate() + 7);

        const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' };
        setDueDate(lmpDate.toLocaleDateString('id-ID', options));
    };

    return (
        <div>
            <h3 className="text-2xl font-bold text-primary-dark mb-4">Kalkulator Kehamilan</h3>
            <p className="text-slate-600 mb-6">Masukkan tanggal pertama dari periode menstruasi terakhir Anda (HPHT) untuk memperkirakan tanggal persalinan.</p>

            <div className="space-y-4">
                <div>
                    <label htmlFor="lmp" className="block text-sm font-medium text-slate-700 mb-1">Tanggal Pertama Haid Terakhir (HPHT)</label>
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
                    Hitung Perkiraan Lahir
                </button>
            </div>

            {dueDate && (
                <div className="mt-6 p-4 bg-background-soft rounded-lg text-center">
                    <p className="text-sm text-primary-dark">Perkiraan Tanggal Persalinan Anda:</p>
                    <p className="text-2xl font-bold text-primary">{dueDate}</p>
                </div>
            )}
        </div>
    );
}
