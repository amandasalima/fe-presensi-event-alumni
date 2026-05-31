"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Icon } from "./Icon";
import ProfilePopup from "./ProfilePopup";
import {
  useMyProfile,
  useMyNotifications,
} from "@/hooks/alumni/useAlumniHooks";

interface Notification {
  id: number;
  title: string;
  body: string;
  is_read: boolean;
}

export default function AlumniHeader() {
  const router = useRouter();
  const [showProfile, setShowProfile] = useState(false);

  const { data: profile, isLoading: loadingProfile } = useMyProfile();
  const { data: notifications = [] } = useMyNotifications();

  // Support both old and new field names
  const firstName = profile?.first_name ?? profile?.name?.split(' ')[0] ?? "Alumni";
  const fullName = profile?.first_name 
    ? `${profile.first_name} ${profile.last_name}` 
    : profile?.name ?? "Alumni";
  const email = profile?.email ?? "";

  const unreadNotif = notifications.filter(
    (n: Notification) => !n.is_read
  ).length;

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    router.push("/alumni/login");
  };

  return (
    <header className="fixed inset-x-0 top-0 z-50 w-full bg-white pt-[env(safe-area-inset-top)] shadow-sm">
      <div className="px-3 sm:px-4 md:px-6 lg:px-8 py-3 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-teal-400 to-cyan-500 flex items-center justify-center text-white flex-shrink-0">
            <Icon name="qr" className="w-4 h-4" />
          </div>
          <span className="text-[13px] min-[360px]:text-sm font-semibold text-gray-700 truncate">
            Presensi Event Alumni
          </span>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2 relative flex-shrink-0">
          <button
            onClick={() => router.push("/alumni/notifikasi")}
            className="relative p-1.5 hover:bg-gray-50 rounded-xl transition-colors"
          >
            <Icon name="bell" className="w-5 h-5 text-gray-600" />

            {unreadNotif > 0 && (
              <span className="absolute top-0.5 right-0.5 w-4 h-4 bg-red-500 text-white text-[10px] rounded-full flex items-center justify-center font-bold">
                {unreadNotif > 9 ? "9+" : unreadNotif}
              </span>
            )}
          </button>

          <button
            onClick={() => setShowProfile(!showProfile)}
            className="flex items-center gap-1 hover:bg-gray-50 rounded-xl px-1 py-1 transition-colors"
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-teal-500 to-cyan-500 flex items-center justify-center text-white text-sm font-bold">
              {loadingProfile ? "•" : firstName[0]?.toUpperCase()}
            </div>

            <Icon
              name="chevron"
              className={`w-3.5 h-3.5 text-gray-400 transition-transform duration-200 ${
                showProfile ? "rotate-180" : ""
              }`}
            />
          </button>

          {showProfile && (
            <ProfilePopup
              name={fullName}
              email={email}
              onClose={() => setShowProfile(false)}
              onProfile={() => {
                setShowProfile(false);
                router.push("/alumni/main/profil");
              }}
              onLogout={handleLogout}
            />
          )}
        </div>
      </div>
    </header>
  );
}
