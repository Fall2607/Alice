// File: app/components/Modal.tsx
"use client";

import { X } from "lucide-react";
import { useEffect, useState } from "react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title: string;
}

export default function Modal({
  isOpen,
  onClose,
  children,
  title,
}: ModalProps) {
  const [isRendered, setIsRendered] = useState(false);

  // Efek untuk mengontrol animasi dan scroll lock
  useEffect(() => {
    if (isOpen) {
      setIsRendered(true);
      document.body.style.overflow = "hidden"; // Mencegah scroll di belakang modal
    } else {
      // Tunggu animasi selesai sebelum menghapus dari DOM
      const timer = setTimeout(() => {
        setIsRendered(false);
        document.body.style.overflow = "auto"; // Kembalikan scroll
      }, 300); // Durasi harus cocok dengan `duration-300`
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // Efek untuk menangani tombol Escape
  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleEsc);
    return () => {
      window.removeEventListener("keydown", handleEsc);
    };
  }, [onClose]);

  if (!isRendered) return null;

  return (
    <div
      className={`fixed inset-0 z-50 flex justify-center items-center p-4 transition-opacity duration-300 
                  ${isOpen ? "opacity-100" : "opacity-0"}`}
      onClick={onClose}
    >
      {/* Latar belakang transparan dengan blur */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />

      <div
        className={`bg-white rounded-lg shadow-xl w-full max-w-lg p-6 relative transition-all duration-300 ease-in-out
                    ${
                      isOpen
                        ? "translate-y-0 opacity-100"
                        : "-translate-y-10 opacity-0"
                    }`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center border-b pb-3 mb-4">
          <h3 className="text-xl font-semibold text-primary-dark">{title}</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={24} />
          </button>
        </div>
        <div>{children}</div>
      </div>
    </div>
  );
}
