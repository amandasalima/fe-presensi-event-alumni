"use client";

import { useEffect, useRef } from "react";
import { Icon } from "./Icon";

export default function ProfilePopup({
  name,
  email,
  onClose,
  onProfile,
  onLogout,
}: {
  name: string;
  email: string;
  onClose: () => void;
  onProfile: () => void;
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
      className="absolute top-12 right-0 w-56 bg-white rounded-2xl shadow-xl border border-gray-100 z-50 overflow-hidden"
    >
      <div className="px-4 py-3 border-b border-gray-50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-teal-400 to-cyan-500 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
            {name[0]?.toUpperCase()}
          </div>

          <div className="min-w-0">
            <p className="font-semibold text-gray-800 text-sm truncate">
              {name}
            </p>
            <p className="text-xs text-gray-400 truncate">{email}</p>
          </div>
        </div>
      </div>

      <div className="py-1">
        <button
          onClick={onProfile}
          className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
        >
          <Icon name="profile" className="w-4 h-4 text-gray-400" />
          Lihat Profil
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