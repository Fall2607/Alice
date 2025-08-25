// File: app/components/calculators/BmiCalculator.tsx
"use client";

import { useState } from 'react';

export default function BmiCalculator() {
    const [height, setHeight] = useState('');
    const [weight, setWeight] = useState('');
    const [result, setResult] = useState<{ bmi: string; category: string; color: string } | null>(null);

    const calculateBmi = () => {
        const h = parseFloat(height);
        const w = parseFloat(weight);

        if (isNaN(h) || isNaN(w) || h <= 0 || w <= 0) {
            setResult(null);
            return;
        }

        const hInMeters = h / 100;
        const bmi = w / (hInMeters * hInMeters);
        let category = '';
        let color = '';

        if (bmi < 18.5) {
            category = 'Berat Badan Kurang';
            color = 'text-blue-500';
        } else if (bmi >= 18.5 && bmi < 24.9) {
            category = 'Berat Badan Normal';
            color = 'text-green-500';
        } else if (bmi >= 25 && bmi < 29.9) {
            category = 'Kelebihan Berat Badan';
            color = 'text-yellow-500';
        } else {
            category = 'Obesitas';
            color = 'text-red-500';
        }

        setResult({ bmi: bmi.toFixed(1), category, color });
    };

    return (
        <div>
            <h3 className="text-2xl font-bold text-primary-dark mb-4">Kalkulator Indeks Massa Tubuh (IMT)</h3>
            <p className="text-slate-600 mb-6">Hitung Indeks Massa Tubuh Anda untuk mengetahui apakah berat badan Anda ideal.</p>

            <div className="space-y-4">
                <div>
                    <label htmlFor="height" className="block text-sm font-medium text-slate-700 mb-1">Tinggi Badan (cm)</label>
                    <input type="number" id="height" value={height} onChange={(e) => setHeight(e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary" />
                </div>
                <div>
                    <label htmlFor="weight" className="block text-sm font-medium text-slate-700 mb-1">Berat Badan (kg)</label>
                    <input type="number" id="weight" value={weight} onChange={(e) => setWeight(e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary" />
                </div>
                <button onClick={calculateBmi} className="w-full bg-primary text-white px-4 py-2 rounded-full hover:bg-secondary transition-colors font-semibold">
                    Hitung IMT
                </button>
            </div>

            {result && (
                <div className="mt-6 p-4 bg-background-soft rounded-lg text-center">
                    <p className="text-sm text-primary-dark">Indeks Massa Tubuh Anda:</p>
                    <p className={`text-3xl font-bold ${result.color}`}>{result.bmi}</p>
                    <p className={`font-semibold ${result.color}`}>{result.category}</p>
                </div>
            )}
        </div>
    );
}
