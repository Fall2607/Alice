// File: app/components/calculators/CalorieCalculator.tsx
"use client";

import { useState } from 'react';

export default function CalorieCalculator() {
    const [age, setAge] = useState('');
    const [gender, setGender] = useState('male');
    const [weight, setWeight] = useState('');
    const [height, setHeight] = useState('');
    const [activity, setActivity] = useState('1.2');
    const [result, setResult] = useState<string | null>(null);

    const calculateCalories = () => {
        const ageNum = parseInt(age);
        const weightNum = parseFloat(weight);
        const heightNum = parseFloat(height);
        const activityNum = parseFloat(activity);

        if (isNaN(ageNum) || isNaN(weightNum) || isNaN(heightNum)) return;

        let bmr = 0;
        if (gender === 'male') {
            bmr = 10 * weightNum + 6.25 * heightNum - 5 * ageNum + 5;
        } else {
            bmr = 10 * weightNum + 6.25 * heightNum - 5 * ageNum - 161;
        }
        const tdee = bmr * activityNum;
        setResult(tdee.toFixed(0));
    };

    return (
        <div>
            <h3 className="text-2xl font-bold text-primary-dark mb-4">Kalkulator Kebutuhan Kalori</h3>
            <p className="text-slate-600 mb-6">Hitung perkiraan kalori harian yang Anda butuhkan untuk menjaga berat badan.</p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                    <label htmlFor="age" className="block text-sm font-medium text-slate-700 mb-1">Usia (tahun)</label>
                    <input type="number" id="age" value={age} onChange={(e) => setAge(e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded-md" />
                </div>
                <div>
                    <label htmlFor="gender" className="block text-sm font-medium text-slate-700 mb-1">Jenis Kelamin</label>
                    <select id="gender" value={gender} onChange={(e) => setGender(e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded-md">
                        <option value="male">Pria</option>
                        <option value="female">Wanita</option>
                    </select>
                </div>
                <div>
                    <label htmlFor="weight-cal" className="block text-sm font-medium text-slate-700 mb-1">Berat Badan (kg)</label>
                    <input type="number" id="weight-cal" value={weight} onChange={(e) => setWeight(e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded-md" />
                </div>
                <div>
                    <label htmlFor="height-cal" className="block text-sm font-medium text-slate-700 mb-1">Tinggi Badan (cm)</label>
                    <input type="number" id="height-cal" value={height} onChange={(e) => setHeight(e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded-md" />
                </div>
                <div className="sm:col-span-2">
                    <label htmlFor="activity" className="block text-sm font-medium text-slate-700 mb-1">Tingkat Aktivitas</label>
                    <select id="activity" value={activity} onChange={(e) => setActivity(e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded-md">
                        <option value="1.2">Jarang Olahraga</option>
                        <option value="1.375">Olahraga Ringan (1-3x/minggu)</option>
                        <option value="1.55">Olahraga Sedang (3-5x/minggu)</option>
                        <option value="1.725">Olahraga Berat (6-7x/minggu)</option>
                    </select>
                </div>
                <div className="sm:col-span-2">
                    <button onClick={calculateCalories} className="w-full bg-primary text-white px-4 py-2 rounded-full hover:bg-secondary transition-colors font-semibold">
                        Hitung Kalori
                    </button>
                </div>
            </div>

            {result && (
                <div className="mt-6 p-4 bg-background-soft rounded-lg text-center">
                    <p className="text-sm text-primary-dark">Kebutuhan Kalori Harian Anda:</p>
                    <p className="text-2xl font-bold text-primary">{result} kkal</p>
                </div>
            )}
        </div>
    );
}
