"use client";

import { QrCode } from "lucide-react";
import { useRouter } from "next/navigation";

export default function ScanQRButton() {
  const router = useRouter();

  return (
    <button
      onClick={() => router.push("/alumni/main/scan")}
      className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-2xl p-5 shadow-lg hover:shadow-xl transition-all active:scale-[0.98] flex items-center justify-center gap-3"
    >
      <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
        <QrCode size={24} />
      </div>
      <div className="text-left">
        <p className="font-bold text-base">Scan QR Code</p>
        <p className="text-xs text-emerald-50">Presensi event dengan mudah</p>
      </div>
    </button>
  );
}
