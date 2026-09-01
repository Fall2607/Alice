// File: app/components/Modal.tsx
"use client";

import { useEffect } from "react";
import { X } from "lucide-react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  size?: "sm" | "md" | "lg" | "xl" | "2xl" | "3xl" | "4xl" | "5xl";
}

export default function Modal({
  isOpen,
  onClose,
  title,
  children,
  size = "lg",
}: ModalProps) {
  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    if (isOpen) {
      document.body.style.overflow = "hidden";
      document.addEventListener("keydown", handleEsc);
    }

    return () => {
      document.body.style.overflow = "auto";
      document.removeEventListener("keydown", handleEsc);
    };
  }, [isOpen, onClose]);

  const sizeClasses = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-lg",
    xl: "max-w-xl",
    "2xl": "max-w-2xl",
    "3xl": "max-w-3xl",
    "4xl": "max-w-4xl",
    "5xl": "max-w-5xl",
  };

  if (!isOpen) return null;

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 md:p-6 transition-opacity duration-300 ${
        isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
      }`}
      aria-labelledby="modal-title"
      role="dialog"
      aria-modal="true"
    >
      {/* Latar Belakang Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      ></div>

      {/* Konten Modal dengan Max Height 90vh & Header Sticky */}
      <div
        className={`relative z-10 w-full max-h-[90vh] flex flex-col transform rounded-2xl bg-white shadow-2xl transition-all duration-300 border border-slate-100 ${
          sizeClasses[size]
        } ${
          isOpen ? "translate-y-0 opacity-100 scale-100" : "-translate-y-10 opacity-0 scale-95"
        }`}
      >
        {/* Sticky Header Modal */}
        <div className="flex items-center justify-between p-5 md:p-6 border-b border-slate-100 bg-slate-50/80 rounded-t-2xl shrink-0">
          <h3 id="modal-title" className="text-lg md:text-xl font-black text-slate-800 tracking-tight leading-none">
            {title}
          </h3>
          <button
            type="button"
            className="rounded-full p-2 text-slate-400 hover:bg-slate-200 hover:text-slate-700 transition-all shrink-0"
            onClick={onClose}
          >
            <X size={20} />
          </button>
        </div>

        {/* Scrollable Body Content */}
        <div className="p-6 md:p-8 overflow-y-auto custom-scrollbar flex-1">
          {children}
        </div>
      </div>
    </div>
  );
}
