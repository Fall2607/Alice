import React from "react";

interface AvisenaLogoProps {
  variant?: "horizontal" | "vertical" | "symbol-only" | "badge";
  colorMode?: "full" | "white";
  className?: string;
  width?: number;
  height?: number;
}

/**
 * Komponen Logo Resmi RSU Avisena Cimahi
 * Membaca aset SVG resmi dari public/img/Logo_Cimahi/
 * Menggunakan explicit CSS height agar SVG dengan viewBox tanpa intrinsic width/height
 * selalu tampil proporsional dan tidak pernah collapse menjadi 0x0 px.
 */
export default function AvisenaLogo({
  variant = "horizontal",
  colorMode = "full",
  className = "",
  height = 46,
}: AvisenaLogoProps) {
  const isWhite = colorMode === "white";

  const svgSrc =
    variant === "horizontal"
      ? isWhite
        ? "/img/Logo_Cimahi/Horizontal/FA%20LOGO%20AVISENA_Cimahi%20Horizontal%20White.svg"
        : "/img/Logo_Cimahi/Horizontal/FA%20LOGO%20AVISENA_Cimahi%20Horizontal%20Color.svg"
      : isWhite
      ? "/img/Logo_Cimahi/FA%20LOGO%20AVISENA_Cimahi%20White.svg"
      : "/img/Logo_Cimahi/FA%20LOGO%20AVISENA_Cimahi%20Color.svg";

  return (
    <div className={`inline-flex items-center select-none shrink-0 ${className}`}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={svgSrc}
        alt="Logo Resmi RSU Avisena Cimahi"
        style={{ height: `${height}px`, width: "auto" }}
        className="block object-contain transition-opacity duration-300"
      />
    </div>
  );
}
