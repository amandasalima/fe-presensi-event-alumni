"use client";

import { useEffect, useRef } from "react";
import { Icon } from "./Icon";
import { getImageUrl } from "@/lib/api";
import EngagementSegmentBadge from "@/app/components/EngagementSegmentBadge";

export default function ProfilePopup({
  name,
  email,
  avatarUrl,
  segment,
  onClose,
  onProfile,
  onHistory,
  onLogout,
}: {
  name: string;
  email: string;
  avatarUrl?: string | null;
  segment?: string | null;
  onClose: () => void;
  onProfile: () => void;
  onHistory: () => void;
  onLogout: () => void;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        onClose();
      }
    }

    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [onClose]);

  return (
    <div
      ref={ref}
      className="absolute top-12 right-0 w-72 max-w-[calc(100vw-1.5rem)] bg-white rounded-2xl shadow-xl border border-gray-100 z-50 overflow-hidden"
    >
      <div className="px-4 py-3 border-b border-gray-50">
        <div className="flex items-center gap-3">
          {avatarUrl ? (
            <img
              src={getImageUrl(avatarUrl)}
              alt={name}
              className="w-10 h-10 rounded-full object-cover flex-shrink-0 border border-green-100"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-[#41A07E] flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
              {name[0]?.toUpperCase()}
            </div>
          )}

          <div className="min-w-0 flex-1">
            <div className="flex min-w-0 items-center gap-2">
              <p className="min-w-0 font-semibold text-gray-800 text-sm truncate">
                {name}
              </p>
              {segment && (
                <EngagementSegmentBadge
                  segment={segment}
                  variant="rank"
                  className="shrink-0 rounded-full px-2.5 py-1 text-[10px] font-bold"
                />
              )}
            </div>
            <p className="text-xs text-gray-400 truncate">{email}</p>
          </div>
        </div>
      </div>

      <div className="py-1">
        <button
          onClick={onProfile}
          className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-green-50 transition-colors"
        >
          <Icon name="profile" className="w-4 h-4 text-[#41A07E]" />
          Lihat Profil
        </button>

        <button
          onClick={onHistory}
          className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-green-50 transition-colors"
        >
          <Icon name="calendar" className="w-4 h-4 text-[#41A07E]" />
          Riwayat Kehadiran
        </button>

        <button
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-500 hover:bg-red-50 transition-colors"
        >
          <Icon name="logout" className="w-4 h-4" />
          Keluar
        </button>
      </div>
    </div>
  );
}
