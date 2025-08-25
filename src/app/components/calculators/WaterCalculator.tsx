// File: app/components/calculators/WaterCalculator.tsx
"use client";

import { useState } from 'react';

export default function WaterCalculator() {
    const [weight, setWeight] = useState('');
    const [result, setResult] = useState<string | null>(null);

    const calculateWaterIntake = () => {
        const w = parseFloat(weight);
        if (isNaN(w) || w <= 0) {
            setResult(null);
            return;
        }
        // Rumus sederhana: 35ml per kg berat badan
        const waterIntake = (w * 35) / 1000; // Konversi ke liter
        setResult(waterIntake.toFixed(1));
    };

    return (
        <div>
            <h3 className="text-2xl font-bold text-primary-dark mb-4">Kalkulator Kebutuhan Air</h3>
            <p className="text-slate-600 mb-6">Hitung perkiraan jumlah air yang perlu Anda minum setiap hari berdasarkan berat badan Anda.</p>

            <div className="space-y-4">
                <div>
                    <label htmlFor="weight-water" className="block text-sm font-medium text-slate-700 mb-1">Berat Badan (kg)</label>
                    <input
                        type="number"
                        id="weight-water"
                        value={weight}
                        onChange={(e) => setWeight(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
                    />
                </div>
                <button
                    onClick={calculateWaterIntake}
                    className="w-full bg-primary text-white px-4 py-2 rounded-full hover:bg-secondary transition-colors font-semibold"
                >
                    Hitung Kebutuhan Air
                </button>
            </div>

            {result && (
                <div className="mt-6 p-4 bg-background-soft rounded-lg text-center">
                    <p className="text-sm text-primary-dark">Kebutuhan Air Harian Anda:</p>
                    <p className="text-2xl font-bold text-primary">{result} Liter</p>
                </div>
            )}
        </div>
    );
}
