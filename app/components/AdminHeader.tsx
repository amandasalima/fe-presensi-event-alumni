"use client";

import Link from "next/link";
import { useAdminProfile } from "@/hooks/admin/useSetting";
import { getImageUrl } from "@/lib/api";
import { Settings } from "lucide-react";

export default function AdminHeader({ title }: { title: string }) {
  const { data: profile } = useAdminProfile();

  const name = profile?.name ?? "Administrator";
  const initials = name[0]?.toUpperCase() ?? "A";
  const avatarUrl = profile?.avatar_url;

  return (
    <header className="h-16 bg-gradient-to-r from-white via-[#F1F8F4] to-white border-b border-[#0D5C3A]/10 flex items-center justify-between px-6 sticky top-0 z-40 shadow-sm">
      <div>
        <h2 className="text-xl font-bold text-[#0D5C3A]">{title}</h2>
        <p className="text-xs text-[#0D5C3A]/60 mt-0.5">
          Pondok Pesantren Al-Qur&apos;an Al-Falah
        </p>
      </div>

      <div className="flex items-center gap-3">
        {/* Profile */}
        <Link
          href="/admin/settings"
          className="flex items-center gap-3 rounded-xl px-3 py-2 transition-all duration-200 hover:bg-[#E8F5E9] active:scale-[0.98] border border-transparent hover:border-[#0D5C3A]/10 group"
          aria-label="Buka pengaturan profil"
        >
          <div className="text-right">
            <h4 className="font-semibold text-[#0D5C3A] text-sm group-hover:text-[#0D5C3A]">
              {name}
            </h4>
            <p className="text-xs text-[#0D5C3A]/50 flex items-center gap-1.5 justify-end">
              <Settings className="w-3 h-3" />
              <span>Administrator</span>
            </p>
          </div>

          {avatarUrl ? (
            <img
              src={getImageUrl(avatarUrl)}
              alt={name}
              className="w-10 h-10 rounded-full object-cover ring-2 ring-[#D4AF37]/30 shadow-sm"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#0D5C3A] to-[#073D26] text-white flex items-center justify-center font-bold text-sm shadow-md ring-2 ring-[#D4AF37]/20">
              {initials}
            </div>
          )}
        </Link>
      </div>
    </header>
  );
}
