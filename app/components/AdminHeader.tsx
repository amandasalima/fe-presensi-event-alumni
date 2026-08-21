"use client";

import Link from "next/link";
import { useAdminProfile } from "@/hooks/admin/useSetting";
import { getImageUrl } from "@/lib/api";
import { Settings, Menu } from "lucide-react";
import { useSidebar } from "@/context/SidebarContext";

export default function AdminHeader({ title }: { title: string }) {
  const { data: profile } = useAdminProfile();
  const { toggleMobileSidebar } = useSidebar();

  const name = profile?.name ?? "Administrator";
  const initials = name[0]?.toUpperCase() ?? "A";
  const avatarUrl = profile?.avatar_url;

  return (
    <header className="h-16 bg-gradient-to-r from-white via-[#F1F8F4] to-white border-b border-[#0D5C3A]/10 flex items-center justify-between px-4 sm:px-6 sticky top-0 z-40 shadow-sm">
      <div className="flex items-center gap-3">
        {/* Hamburger Menu Button for mobile */}
        <button
          onClick={toggleMobileSidebar}
          className="p-2 rounded-xl hover:bg-[#E8F5E9]/50 active:scale-95 transition lg:hidden text-[#0D5C3A]"
          aria-label="Buka menu navigasi"
        >
          <Menu className="w-5.5 h-5.5" />
        </button>

        <div>
          <h2 className="text-base sm:text-lg md:text-xl font-bold text-[#0D5C3A] leading-tight line-clamp-1">{title}</h2>
          <p className="text-[10px] sm:text-xs text-[#0D5C3A]/60 mt-0.5 line-clamp-1">
            Pondok Pesantren Al-Qur&apos;an Al-Falah
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Profile */}
        <Link
          href="/admin/settings"
          className="flex items-center gap-2 sm:gap-3 rounded-xl px-2 sm:px-3 py-1.5 sm:py-2 transition-all duration-200 hover:bg-[#E8F5E9] active:scale-[0.98] border border-transparent hover:border-[#0D5C3A]/10 group"
          aria-label="Buka pengaturan profil"
        >
          <div className="text-right hidden md:block">
            <h4 className="font-semibold text-[#0D5C3A] text-sm group-hover:text-[#0D5C3A] line-clamp-1 max-w-[150px]">
              {name}
            </h4>
            <p className="text-[10px] text-[#0D5C3A]/50 flex items-center gap-1 justify-end">
              <Settings className="w-3 h-3" />
              <span>Administrator</span>
            </p>
          </div>

          {avatarUrl ? (
            <img
              src={getImageUrl(avatarUrl)}
              alt={name}
              className="w-8 h-8 sm:w-10 sm:w-10 rounded-full object-cover ring-2 ring-[#D4AF37]/30 shadow-sm"
            />
          ) : (
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-[#0D5C3A] to-[#073D26] text-white flex items-center justify-center font-bold text-sm shadow-md ring-2 ring-[#D4AF37]/20">
              {initials}
            </div>
          )}
        </Link>
      </div>
    </header>
  );
}
