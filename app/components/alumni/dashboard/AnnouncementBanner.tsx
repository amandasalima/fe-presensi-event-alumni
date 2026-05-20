"use client";

import { Megaphone } from "lucide-react";

export default function AnnouncementBanner() {
  return (
    <div className="bg-gradient-to-r from-emerald-500 to-teal-500 rounded-2xl p-4 text-white shadow-lg">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
          <Megaphone size={20} />
        </div>
        <div>
          <h3 className="font-semibold text-sm mb-1">Pengumuman Penting</h3>
          <p className="text-xs text-emerald-50 leading-relaxed">
            Jangan lupa untuk scan QR code saat menghadiri event agar presensi Anda tercatat
          </p>
        </div>
      </div>
    </div>
  );
}
