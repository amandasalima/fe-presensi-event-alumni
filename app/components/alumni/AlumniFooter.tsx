"use client";

import { usePathname, useRouter } from "next/navigation";
import { Icon } from "./Icon";

export default function AlumniFooter() {
  const router = useRouter();
  const pathname = usePathname();

  const isActive = (path: string) => pathname === path;

  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 w-full px-3 sm:px-4 md:px-0 pb-[calc(0.75rem+env(safe-area-inset-bottom))] md:pb-[env(safe-area-inset-bottom)]">
      <div className="relative">
        <div className="bg-white border border-gray-100 rounded-3xl md:rounded-none md:border-x-0 md:border-b-0 shadow-[0_-8px_24px_rgba(15,23,42,0.08)] px-3 min-[360px]:px-5 sm:px-6 md:px-8 py-2.5 min-[360px]:py-3">
          <div className="grid grid-cols-3 items-center">
            <button
              onClick={() => router.push("/alumni/main/dashboard")}
              className={`flex flex-col items-center gap-1 py-1.5 rounded-xl transition-colors ${
                isActive("/alumni/main/dashboard")
                  ? "text-[#41A07E]"
                  : "text-gray-400"
              }`}
            >
              <Icon name="home" className="w-5 h-5" />
              <span className="text-[11px] font-medium leading-none">
                Beranda
              </span>
            </button>

            <div />

            <button
              onClick={() => router.push("/alumni/main/events")}
              className={`flex flex-col items-center gap-1 py-1.5 rounded-xl transition-colors ${
                isActive("/alumni/main/events")
                  ? "text-[#41A07E]"
                  : "text-gray-400"
              }`}
            >
              <Icon name="calendar" className="w-5 h-5" />
              <span className="text-[11px] font-medium leading-none">
                Event
              </span>
            </button>
          </div>
        </div>

        <button
          onClick={() => router.push("/alumni/main/scan")}
          className="absolute left-1/2 -top-7 min-[360px]:-top-8 -translate-x-1/2 flex flex-col items-center gap-1 text-[#41A07E] active:scale-95 transition-transform"
        >
          <span className="w-14 h-14 min-[360px]:w-16 min-[360px]:h-16 rounded-full bg-[#41A07E] text-white flex items-center justify-center border-4 border-white shadow-[0_8px_24px_rgba(65,160,126,0.35)]">
            <Icon name="qr" className="w-6 h-6 min-[360px]:w-7 min-[360px]:h-7" />
          </span>
          <span className="text-[11px] font-semibold leading-none">
            Pindai QR
          </span>
        </button>
      </div>
    </nav>
  );
}
