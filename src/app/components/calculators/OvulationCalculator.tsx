// File: app/components/calculators/OvulationCalculator.tsx
"use client";

import { useState } from 'react';

export default function OvulationCalculator() {
    const [lastPeriodDate, setLastPeriodDate] = useState('');
    const [cycleLength, setCycleLength] = useState('28');
    const [result, setResult] = useState<{ fertileWindow: string; ovulationDate: string } | null>(null);

    const calculateOvulation = () => {
        if (!lastPeriodDate) {
            setResult(null);
            return;
        }

        const lmp = new Date(lastPeriodDate);
        const cycle = parseInt(cycleLength);

        // Ovulation typically occurs 14 days before the next period
        const ovulationDay = new Date(lmp);
        ovulationDay.setDate(lmp.getDate() + cycle - 14);

        // Fertile window is about 5 days before ovulation + ovulation day
        const fertileStart = new Date(ovulationDay);
        fertileStart.setDate(ovulationDay.getDate() - 5);

        const options: Intl.DateTimeFormatOptions = { month: 'long', day: 'numeric' };
        const formattedOvulationDate = ovulationDay.toLocaleDateString('id-ID', options);
        const formattedFertileStart = fertileStart.toLocaleDateString('id-ID', options);
        const formattedFertileEnd = new Date(ovulationDay);
        formattedFertileEnd.setDate(ovulationDay.getDate() + 1);
        const formattedFertileEndString = formattedFertileEnd.toLocaleDateString('id-ID', options);

        setResult({
            fertileWindow: `${formattedFertileStart} - ${formattedFertileEndString}`,
            ovulationDate: formattedOvulationDate,
        });
    };

    return (
        <div>
            <h3 className="text-2xl font-bold text-primary-dark mb-4">Kalkulator Masa Subur</h3>
            <p className="text-slate-600 mb-6">Perkirakan masa subur dan hari ovulasi Anda untuk membantu perencanaan kehamilan.</p>

            <div className="space-y-4">
                <div>
                    <label htmlFor="lastPeriodDate" className="block text-sm font-medium text-slate-700 mb-1">Hari Pertama Haid Terakhir</label>
                    <input
                        type="date"
                        id="lastPeriodDate"
                        value={lastPeriodDate}
                        onChange={(e) => setLastPeriodDate(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
                    />
                </div>
                <div>
                    <label htmlFor="cycleLength" className="block text-sm font-medium text-slate-700 mb-1">Rata-rata Siklus Haid (hari)</label>
                    <input
                        type="number"
                        id="cycleLength"
                        value={cycleLength}
                        onChange={(e) => setCycleLength(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
                    />
                </div>
                <button
                    onClick={calculateOvulation}
                    className="w-full bg-primary text-white px-4 py-2 rounded-full hover:bg-secondary transition-colors font-semibold"
                >
                    Hitung Masa Subur
                </button>
            </div>

            {result && (
                <div className="mt-6 p-4 bg-background-soft rounded-lg text-center space-y-2">
                    <div>
                        <p className="text-sm text-primary-dark">Perkiraan Jendela Subur Anda:</p>
                        <p className="text-xl font-bold text-primary">{result.fertileWindow}</p>
                    </div>
                    <div>
                        <p className="text-sm text-primary-dark">Perkiraan Hari Ovulasi:</p>
                        <p className="text-xl font-bold text-primary">{result.ovulationDate}</p>
                    </div>
                </div>
            )}
        </div>
    );
}
