"use client";

import { Bell, User } from "lucide-react";
import { useCurrentUser } from "@/hooks/alumni/useCurrentUser";

export default function AlumniHeader() {
  const { data: user } = useCurrentUser();

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-slate-200">
      <div className="max-w-lg mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-white font-bold">
            {user?.first_name?.[0] ?? "A"}
          </div>
          <div>
            <p className="text-xs text-slate-500">Dashboard</p>
            <p className="text-sm font-semibold text-slate-800">Alumni Portal</p>
          </div>
        </div>
        <button className="relative p-2 hover:bg-slate-100 rounded-full transition">
          <Bell size={20} className="text-slate-600" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
        </button>
      </div>
    </header>
  );
}
