"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { clearAuthStorage } from "@/lib/api";

const menuItems = [
  {
    name: "Dashboard",
    path: "/admin/dashboard",
  },
  {
    name: "Kelola User",
    path: "/admin/users",
  },
  {
    name: "Kelola Event",
    path: "/admin/events",
  },
  {
    name: "Generate QR",
    path: "/admin/qr-code",
  },
  {
    name: "Broadcast WA",
    path: "/admin/broadcast",
  },
  {
    name: "Laporan Kehadiran",
    path: "/admin/reports",
  },
  {
    name: "Pengaturan",
    path: "/admin/settings",
  },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = () => {
    clearAuthStorage();
    window.location.href = "/admin/login";
  };

  return (
    <aside className="w-72 bg-gradient-to-b from-teal-700 to-cyan-700 text-white flex flex-col fixed left-0 top-0 h-screen z-50">
      {/* Logo */}
      <div className="p-6 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center text-teal-700 font-bold text-xl shadow">
            QR
          </div>

          <div>
            <h1 className="font-bold text-2xl">QR Event System</h1>
            <p className="text-sm text-cyan-100">Admin Panel</p>
          </div>
        </div>
      </div>

      {/* Menu */}
      <nav className="flex-1 p-5 space-y-3 overflow-y-auto">
        {menuItems.map((item, index) => {
          const active = pathname === item.path;

          return (
            <Link
              key={index}
              href={item.path}
              className={`flex items-center justify-between px-5 py-4 rounded-2xl transition-all duration-300 ${
                active
                  ? "bg-cyan-500/40 shadow-lg backdrop-blur-md"
                  : "hover:bg-white/10"
              }`}
            >
              <span className="text-lg">{item.name}</span>

              {active && <span>›</span>}
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="p-5 border-t border-white/10">
        <button
          onClick={handleLogout}
          className="w-full py-4 rounded-2xl bg-white/10 hover:bg-white/20 transition text-lg"
        >
          Keluar
        </button>
      </div>
    </aside>
  );
}