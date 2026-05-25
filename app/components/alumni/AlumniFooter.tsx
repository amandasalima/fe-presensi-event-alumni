"use client";

import { usePathname, useRouter } from "next/navigation";
import { Icon } from "./Icon";

export default function AlumniFooter() {
  const router = useRouter();
  const pathname = usePathname();

  const isActive = (path: string) => pathname === path;

  return (
    <nav className="fixed bottom-0 left-1/2 z-50 w-full max-w-[430px] -translate-x-1/2 px-4 pb-4">
      <div className="relative">
        <div className="bg-white border border-gray-100 rounded-3xl shadow-[0_-8px_24px_rgba(15,23,42,0.08)] px-6 py-3">
          <div className="grid grid-cols-3 items-center">
            <button
              onClick={() => router.push("/alumni/main/dashboard")}
              className={`flex flex-col items-center gap-1 py-1.5 rounded-xl transition-colors ${
                isActive("/alumni/dashboard")
                  ? "text-teal-600"
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
                isActive("/alumni/events")
                  ? "text-teal-600"
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
          className="absolute left-1/2 -top-8 -translate-x-1/2 flex flex-col items-center gap-1 text-teal-700 active:scale-95 transition-transform"
        >
          <span
            className="w-16 h-16 rounded-full text-white flex items-center justify-center border-4 border-white"
            style={{
              background: "linear-gradient(135deg, #3ecf8e 0%, #20b070 100%)",
              boxShadow: "0 8px 24px rgba(32,176,112,0.35)",
            }}
          >
            <Icon name="qr" className="w-7 h-7" />
          </span>
          <span className="text-[11px] font-semibold leading-none">
            Scan QR
          </span>
        </button>
      </div>
    </nav>
  );
}