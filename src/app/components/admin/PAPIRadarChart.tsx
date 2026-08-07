"use client";

import React, { useState } from "react";

interface PAPIRadarChartProps {
  scores: Record<string, number>;
}

export default function PAPIRadarChart({ scores }: PAPIRadarChartProps) {
  const [hoveredTrait, setHoveredTrait] = useState<{
    name: string;
    label: string;
    score: number;
  } | null>(null);

  const traits = [
    { key: "n", name: "N", label: "Menyelesaikan Tugas (Work Direction)" },
    { key: "g", name: "G", label: "Pekerja Keras (Work Direction)" },
    { key: "a", name: "A", label: "Kebutuhan Berprestasi (Work Direction)" },
    { key: "l", name: "L", label: "Kepemimpinan (Leadership)" },
    { key: "p", name: "P", label: "Kebutuhan Mengontrol (Leadership)" },
    { key: "i", name: "I", label: "Pengambilan Keputusan (Leadership)" },
    { key: "t", name: "T", label: "Kecepatan Kerja (Activity)" },
    { key: "v", name: "V", label: "Energi / Vitalitas (Activity)" },
    { key: "x", name: "X", label: "Kebutuhan Diperhatikan (Social Nature)" },
    { key: "s", name: "S", label: "Hubungan Sosial (Social Nature)" },
    { key: "b", name: "B", label: "Kebutuhan Kelompok (Social Nature)" },
    { key: "o", name: "O", label: "Kebutuhan Kasih Sayang (Social Nature)" },
    { key: "r", name: "R", label: "Berpikir Teoritis (Work Style)" },
    { key: "d", name: "D", label: "Minat Detail (Work Style)" },
    { key: "c", name: "C", label: "Keteraturan (Work Style)" },
    { key: "z", name: "Z", label: "Kebutuhan Perubahan (Temperament)" },
    { key: "e", name: "E", label: "Pengendalian Emosi (Temperament)" },
    { key: "k", name: "K", label: "Kebutuhan Agresif / Memaksa (Temperament)" },
    { key: "f", name: "F", label: "Kebutuhan Mengikuti Atasan (Followership)" },
    { key: "w", name: "W", label: "Kebutuhan Arahan (Followership)" },
  ];

  const center = 220;
  const radius = 150;
  const angleStep = (2 * Math.PI) / traits.length;

  // Grid levels (Scores 1 to 9)
  const gridLevels = [3, 6, 9];

  // Calculate coordinates
  const getCoordinates = (index: number, score: number) => {
    const angle = index * angleStep - Math.PI / 2;
    const r = radius * (score / 9);
    const x = center + r * Math.cos(angle);
    const y = center + r * Math.sin(angle);
    return { x, y };
  };

  // Label coordinates (placed slightly further out)
  const getLabelCoordinates = (index: number) => {
    const angle = index * angleStep - Math.PI / 2;
    const r = radius + 22;
    const x = center + r * Math.cos(angle);
    const y = center + r * Math.sin(angle);
    return { x, y };
  };

  const points = traits.map((t, idx) => {
    const score = Number(scores[`score_${t.key}`] || 0);
    const plotScore = (t.key === "z" || t.key === "k") ? 9 - score : score;
    return {
      ...getCoordinates(idx, plotScore),
      score,
      name: t.name,
      label: t.label,
    };
  });

  const polygonPath = points.map((p) => `${p.x},${p.y}`).join(" ");

  return (
    <div className="flex flex-col items-center justify-center p-4 bg-slate-50/50 rounded-2xl border border-slate-100 shadow-inner relative w-full max-w-[460px] mx-auto">
      {/* Tooltip Overlay */}
      <div className="absolute top-4 left-4 right-4 h-12 flex items-center justify-center pointer-events-none">
        {hoveredTrait ? (
          <div className="bg-slate-800 text-white text-[11px] px-3 py-1.5 rounded-lg shadow-md border border-slate-700 animate-in fade-in zoom-in-95 duration-150 flex items-center gap-2">
            <span className="font-black bg-emerald-500 text-slate-900 px-1.5 py-0.5 rounded text-[10px]">
              {hoveredTrait.name}
            </span>
            <span className="font-medium text-slate-200">{hoveredTrait.label}:</span>
            <span className="font-bold text-emerald-400 text-xs">{hoveredTrait.score} / 9</span>
          </div>
        ) : (
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            Arahkan kursor pada titik atau huruf untuk detail skor
          </span>
        )}
      </div>

      <svg
        viewBox="0 0 440 440"
        className="w-full h-auto mt-6"
        style={{ transform: "rotate(0deg)" }}
      >
        <defs>
          <radialGradient id="radarAreaGradient" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#10b981" stopOpacity="0.1" />
            <stop offset="70%" stopColor="#059669" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#047857" stopOpacity="0.45" />
          </radialGradient>
        </defs>

        {/* Outer Circular Grid Lines */}
        {gridLevels.map((level) => {
          const gridPoints = traits
            .map((_, idx) => {
              const { x, y } = getCoordinates(idx, level);
              return `${x},${y}`;
            })
            .join(" ");
          return (
            <polygon
              key={level}
              points={gridPoints}
              fill="none"
              stroke="#e2e8f0"
              strokeWidth="1"
              strokeDasharray={level === 9 ? "0" : "3 3"}
            />
          );
        })}

        {/* Axis Lines and Labels */}
        {traits.map((t, idx) => {
          const maxCoord = getCoordinates(idx, 9);
          const labelCoord = getLabelCoordinates(idx);
          const score = Number(scores[`score_${t.key}`] || 0);

          return (
            <g key={t.key} className="group">
              {/* Radial Line */}
              <line
                x1={center}
                y1={center}
                x2={maxCoord.x}
                y2={maxCoord.y}
                stroke="#e2e8f0"
                strokeWidth="1.2"
                className="transition-all duration-200 group-hover:stroke-emerald-400 group-hover:stroke-[1.8]"
              />

              {/* Text label button area */}
              <circle
                cx={labelCoord.x}
                cy={labelCoord.y}
                r="16"
                fill="transparent"
                className="cursor-pointer"
                onMouseEnter={() =>
                  setHoveredTrait({ name: t.name, label: t.label, score })
                }
                onMouseLeave={() => setHoveredTrait(null)}
              />

              {/* Text Label */}
              <text
                x={labelCoord.x}
                y={labelCoord.y}
                textAnchor="middle"
                dominantBaseline="central"
                className="text-[10px] font-bold fill-slate-500 cursor-pointer select-none transition-all duration-200 group-hover:fill-emerald-600 group-hover:font-black"
                onMouseEnter={() =>
                  setHoveredTrait({ name: t.name, label: t.label, score })
                }
                onMouseLeave={() => setHoveredTrait(null)}
              >
                {t.name}
              </text>
            </g>
          );
        })}

        {/* Filled Score Area Polygon */}
        <polygon
          points={polygonPath}
          fill="url(#radarAreaGradient)"
          stroke="#059669"
          strokeWidth="2.5"
          className="transition-all duration-500 ease-out"
        />

        {/* Score Dots */}
        {points.map((p, idx) => {
          const isHovered = hoveredTrait?.name === p.name;
          return (
            <g key={idx}>
              <circle
                cx={p.x}
                cy={p.y}
                r={isHovered ? 6 : 4.5}
                fill={isHovered ? "#10b981" : "#ffffff"}
                stroke="#059669"
                strokeWidth={isHovered ? 2.5 : 2}
                className="cursor-pointer transition-all duration-200"
                onMouseEnter={() =>
                  setHoveredTrait({ name: p.name, label: p.label, score: p.score })
                }
                onMouseLeave={() => setHoveredTrait(null)}
              />
            </g>
          );
        })}

        {/* Center Point */}
        <circle cx={center} cy={center} r="3" fill="#64748b" />
      </svg>
    </div>
  );
}
