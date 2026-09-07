"use client";

import React, { useState } from "react";
import { getPAPIData } from "@/app/data/tests/papiInterpretations";
import { Info } from "lucide-react";

interface PAPIRadarChartProps {
  scores: Record<string, number>;
  onSelectTrait?: (traitCode: string) => void;
  selectedTrait?: string | null;
}

export default function PAPIRadarChart({ scores, onSelectTrait, selectedTrait }: PAPIRadarChartProps) {
  const [hoveredTrait, setHoveredTrait] = useState<{
    code: string;
    score: number;
    category: string;
    description: string;
    text: string;
  } | null>(null);

  const traits = [
    { key: "n", name: "N", label: "Menyelesaikan Tugas" },
    { key: "g", name: "G", label: "Pekerja Keras" },
    { key: "a", name: "A", label: "Kebutuhan Berprestasi" },
    { key: "l", name: "L", label: "Peran Kepemimpinan" },
    { key: "p", name: "P", label: "Kebutuhan Mengontrol" },
    { key: "i", name: "I", label: "Pengambilan Keputusan" },
    { key: "t", name: "T", label: "Kecepatan Bertindak" },
    { key: "v", name: "V", label: "Energi & Vitalitas" },
    { key: "x", name: "X", label: "Kebutuhan Diperhatikan" },
    { key: "s", name: "S", label: "Interaksi Sosial" },
    { key: "b", name: "B", label: "Kebutuhan Kelompok" },
    { key: "o", name: "O", label: "Kebutuhan Kasih Sayang" },
    { key: "r", name: "R", label: "Berpikir Teoritis" },
    { key: "d", name: "D", label: "Minat Detail" },
    { key: "c", name: "C", label: "Keteraturan / Struktur" },
    { key: "z", name: "Z", label: "Kebutuhan Perubahan" },
    { key: "e", name: "E", label: "Pengendalian Emosi" },
    { key: "k", name: "K", label: "Kebutuhan Sikap Tegas" },
    { key: "f", name: "F", label: "Mendukung Otoritas" },
    { key: "w", name: "W", label: "Kebutuhan Aturan" },
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
    const score = Number(scores[`score_${t.key}`] ?? scores[t.name] ?? scores[t.key] ?? 0);
    const plotScore = (t.key === "z" || t.key === "k") ? 9 - score : score;
    return {
      ...getCoordinates(idx, plotScore),
      score,
      name: t.name,
      label: t.label,
    };
  });

  const polygonPath = points.map((p) => `${p.x},${p.y}`).join(" ");

  const handleHover = (traitCode: string, score: number) => {
    const data = getPAPIData(traitCode, score);
    setHoveredTrait({
      code: traitCode,
      score,
      category: data.category,
      description: data.description,
      text: data.text,
    });
  };

  // Active trait to show: either currently hovered or selected
  const activeTraitCode = hoveredTrait?.code || selectedTrait;
  const activeData = activeTraitCode
    ? getPAPIData(
        activeTraitCode,
        Number(
          scores[`score_${activeTraitCode.toLowerCase()}`] ??
            scores[activeTraitCode] ??
            0
        )
      )
    : null;
  const activeScore = activeTraitCode
    ? Number(
        scores[`score_${activeTraitCode.toLowerCase()}`] ??
          scores[activeTraitCode] ??
          0
      )
    : 0;

  return (
    <div className="flex flex-col items-center justify-center p-4 bg-gradient-to-b from-slate-50/90 to-white rounded-2xl border border-slate-200 shadow-inner relative w-full max-w-[480px] mx-auto select-none">
      {/* Fixed Height Tooltip Header Card (prevents any layout shift / jitter) */}
      <div className="w-full h-[76px] mb-2 flex items-center justify-center overflow-hidden">
        {activeTraitCode && activeData ? (
          <div className="bg-slate-900 text-white text-[11px] p-2.5 rounded-xl shadow-md border border-slate-700 w-full h-full flex flex-col justify-between transition-all">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5 min-w-0">
                <span className="w-5 h-5 rounded bg-emerald-400 text-slate-950 font-black text-[10px] flex items-center justify-center shadow-xs shrink-0">
                  {activeTraitCode}
                </span>
                <span className="font-bold text-slate-100 text-xs truncate">
                  {activeData.description}
                </span>
              </div>
              <span className="font-mono font-black text-emerald-400 bg-slate-800 px-2 py-0.5 rounded border border-slate-700 text-[11px] shrink-0">
                {activeScore} / 9
              </span>
            </div>
            <p className="text-[10px] text-slate-300 line-clamp-2 leading-tight italic">
              &ldquo;{activeData.text}&rdquo;
            </p>
          </div>
        ) : (
          <div className="bg-slate-100/80 border border-slate-200/80 rounded-xl p-2.5 w-full h-full flex items-center justify-center gap-2 text-center text-slate-400">
            <Info size={14} className="shrink-0 text-slate-400" />
            <span className="text-[11px] font-semibold tracking-wide">
              Arahkan kursor / klik titik trait untuk detail interpretasi
            </span>
          </div>
        )}
      </div>

      <svg
        viewBox="0 0 440 440"
        className="w-full h-auto"
        style={{ transform: "rotate(0deg)" }}
      >
        <defs>
          <radialGradient id="radarAreaGradient" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#10b981" stopOpacity="0.15" />
            <stop offset="70%" stopColor="#059669" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#047857" stopOpacity="0.5" />
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
              pointerEvents="none"
            />
          );
        })}

        {/* Axis Lines */}
        {traits.map((t, idx) => {
          const maxCoord = getCoordinates(idx, 9);
          const isSelected = selectedTrait === t.name;
          const isHovered = hoveredTrait?.code === t.name;

          return (
            <line
              key={`axis-${t.key}`}
              x1={center}
              y1={center}
              x2={maxCoord.x}
              y2={maxCoord.y}
              stroke={isSelected || isHovered ? "#10b981" : "#e2e8f0"}
              strokeWidth={isSelected || isHovered ? "2" : "1.2"}
              pointerEvents="none"
              className="transition-colors duration-150"
            />
          );
        })}

        {/* Filled Score Area Polygon */}
        <polygon
          points={polygonPath}
          fill="url(#radarAreaGradient)"
          stroke="#059669"
          strokeWidth="2.5"
          pointerEvents="none"
          className="transition-all duration-300 ease-out"
        />

        {/* Score Dots */}
        {points.map((p, idx) => {
          const isHovered = hoveredTrait?.code === p.name;
          const isSelected = selectedTrait === p.name;
          return (
            <circle
              key={`dot-${idx}`}
              cx={p.x}
              cy={p.y}
              r={isSelected ? 6.5 : isHovered ? 6 : 4.5}
              fill={isSelected ? "#047857" : isHovered ? "#10b981" : "#ffffff"}
              stroke="#059669"
              strokeWidth={isSelected || isHovered ? 2.5 : 2}
              pointerEvents="none"
              className="transition-all duration-150"
            />
          );
        })}

        {/* Center Point */}
        <circle cx={center} cy={center} r="3.5" fill="#64748b" pointerEvents="none" />

        {/* Interactive Hit Area & Labels Group (rendered on top with pointer-events) */}
        {traits.map((t, idx) => {
          const labelCoord = getLabelCoordinates(idx);
          const score = Number(scores[`score_${t.key}`] ?? scores[t.name] ?? scores[t.key] ?? 0);
          const isSelected = selectedTrait === t.name;
          const isHovered = hoveredTrait?.code === t.name;

          return (
            <g
              key={`interactive-${t.key}`}
              className="cursor-pointer"
              onMouseEnter={() => handleHover(t.name, score)}
              onMouseLeave={() => setHoveredTrait(null)}
              onClick={() => onSelectTrait && onSelectTrait(t.name)}
            >
              {/* Invisible generous hit target circle */}
              <circle
                cx={labelCoord.x}
                cy={labelCoord.y}
                r="18"
                fill="transparent"
              />

              {/* Text Label */}
              <text
                x={labelCoord.x}
                y={labelCoord.y}
                textAnchor="middle"
                dominantBaseline="central"
                pointerEvents="none"
                className={`text-[10px] font-mono select-none transition-all duration-150 ${
                  isSelected
                    ? "fill-emerald-600 font-black text-[13px]"
                    : isHovered
                    ? "fill-emerald-600 font-black text-[11px]"
                    : "fill-slate-600 font-bold"
                }`}
              >
                {t.name}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
