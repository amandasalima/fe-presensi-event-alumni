"use client";

import { createPortal } from "react-dom";
import { CheckCircle } from "lucide-react";

interface SuccessModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  onClose: () => void;
}

export default function SuccessModal({
  isOpen,
  title,
  message,
  onClose,
}: SuccessModalProps) {
  if (!isOpen || typeof document === "undefined") return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 animate-in fade-in zoom-in duration-200">
        <div className="flex flex-col items-center text-center">
          {/* Success Icon */}
          <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mb-4">
            <CheckCircle size={32} className="text-emerald-600" />
          </div>

          {/* Title */}
          <h3 className="text-xl font-bold text-slate-800 mb-2">{title}</h3>

          {/* Message */}
          <p className="text-sm text-slate-600 mb-6">{message}</p>

          {/* Button */}
          <button
            onClick={onClose}
            className="w-full rounded-xl py-3 text-sm font-semibold text-white transition active:scale-95"
            style={{
              background: "linear-gradient(135deg, #4ade80 0%, #16a34a 100%)",
            }}
          >
            OK
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
