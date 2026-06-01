"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Icon } from "./Icon";
import ProfilePopup from "./ProfilePopup";
import {
  useMarkAllAsRead,
  useMarkAsRead,
  useMyProfile,
  useMyNotifications,
  useUnreadCount,
} from "@/hooks/alumni/useAlumniHooks";
import type { AlumniNotification } from "@/hooks/alumni/useAlumniHooks";
import { clearAuthStorage } from "@/lib/api";

export default function AlumniHeader() {
  const router = useRouter();
  const [showProfile, setShowProfile] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const notificationRef = useRef<HTMLDivElement>(null);

  const { data: profile, isLoading: loadingProfile } = useMyProfile();
  const { data: notifications = [] } = useMyNotifications();
  const { data: unreadCountData } = useUnreadCount();
  const markAllAsRead = useMarkAllAsRead();
  const markAsRead = useMarkAsRead();

  // Support both old and new field names
  const firstName = profile?.first_name ?? profile?.name?.split(' ')[0] ?? "Alumni";
  const fullName = profile?.first_name 
    ? `${profile.first_name} ${profile.last_name}` 
    : profile?.name ?? "Alumni";
  const email = profile?.email ?? "";

  const localUnreadNotif = notifications.filter(
    (n: AlumniNotification) => n.is_read !== true
  ).length;
  const unreadNotif = unreadCountData?.unread_count ?? localUnreadNotif;
  const readNotif = Math.max(0, notifications.length - unreadNotif);

  const latestNotifications = useMemo(
    () =>
      [...notifications]
        .sort((a: AlumniNotification, b: AlumniNotification) => {
          const aTime = a.created_at ? new Date(a.created_at).getTime() : 0;
          const bTime = b.created_at ? new Date(b.created_at).getTime() : 0;

          return bTime - aTime;
        })
        .slice(0, 3),
    [notifications]
  );

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        notificationRef.current &&
        !notificationRef.current.contains(event.target as Node)
      ) {
        setShowNotifications(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const formatNotificationDate = (value?: string) => {
    if (!value) return "";

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;

    return date.toLocaleString("id-ID", {
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getNotificationText = (notification: AlumniNotification) => ({
    title:
      notification.title ||
      notification.data?.event_title ||
      "Notifikasi Alumni",
    message: notification.message || notification.body || "",
  });

  const handleLogout = () => {
    clearAuthStorage();
    window.location.href = "/alumni/login";
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
          <div ref={notificationRef} className="relative">
            <button
              onClick={() => {
                setShowNotifications((current) => !current);
                setShowProfile(false);
              }}
              className="relative p-1.5 hover:bg-gray-50 rounded-xl transition-colors"
              aria-label="Buka notifikasi"
              aria-expanded={showNotifications}
            >
              <Icon name="bell" className="w-5 h-5 text-gray-600" />

              {unreadNotif > 0 && (
                <span className="absolute top-0.5 right-0.5 w-4 h-4 bg-red-500 text-white text-[10px] rounded-full flex items-center justify-center font-bold">
                  {unreadNotif > 9 ? "9+" : unreadNotif}
                </span>
              )}
            </button>

            {showNotifications && (
              <div className="absolute right-0 top-full mt-2 w-80 max-w-[calc(100vw-1.5rem)] overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-xl">
                <div className="flex items-center justify-between gap-3 border-b border-gray-100 px-4 py-3">
                  <div className="min-w-0">
                    <h2 className="text-sm font-bold text-gray-900">
                      Notifikasi
                    </h2>
                    <div className="mt-1 flex flex-wrap items-center gap-1.5">
                      <span className="rounded-full bg-teal-50 px-2 py-0.5 text-[10px] font-bold text-teal-700">
                        {unreadNotif} belum
                      </span>
                      <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-bold text-gray-500">
                        {readNotif} dibaca
                      </span>
                    </div>
                  </div>

                  {unreadNotif > 0 && (
                    <button
                      type="button"
                      onClick={() => markAllAsRead.mutate()}
                      disabled={markAllAsRead.isPending}
                      className="flex-shrink-0 rounded-xl bg-teal-600 px-3 py-2 text-[11px] font-semibold text-white transition-colors hover:bg-teal-700 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {markAllAsRead.isPending ? "..." : "Tandai semua"}
                    </button>
                  )}
                </div>

                {latestNotifications.length === 0 ? (
                  <div className="px-4 py-6 text-center">
                    <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-2xl bg-gray-50 text-gray-300">
                      <Icon name="bell" className="h-5 w-5" />
                    </div>
                    <p className="mt-2 text-sm font-semibold text-gray-800">
                      Belum ada notifikasi
                    </p>
                    <p className="mt-1 text-xs leading-relaxed text-gray-400">
                      Info terbaru akan muncul di sini.
                    </p>
                  </div>
                ) : (
                  <div className="max-h-80 overflow-y-auto">
                    {latestNotifications.map((notification, index) => {
                      const { title, message } =
                        getNotificationText(notification);
                      const isRead = notification.is_read === true;
                      const canMarkRead = !isRead && typeof notification.id === "number";

                      return (
                        <button
                          key={notification.id ?? `${notification.type}-${index}`}
                          type="button"
                          onClick={() => {
                            if (canMarkRead) {
                              markAsRead.mutate(notification.id as number);
                            }
                            setShowNotifications(false);
                            router.push("/alumni/main/notifikasi");
                          }}
                          className={`flex w-full items-start gap-3 border-b border-gray-50 px-4 py-3 text-left transition-colors last:border-b-0 hover:bg-gray-50 ${
                            !isRead ? "bg-teal-50/40" : ""
                          }`}
                        >
                          <span
                            className={`mt-1.5 h-2.5 w-2.5 flex-shrink-0 rounded-full ring-2 ${
                              isRead
                                ? "bg-gray-200 ring-gray-100"
                                : "bg-teal-500 ring-teal-200 animate-pulse"
                            }`}
                          />

                          <span className="min-w-0 flex-1">
                            <span className="flex items-start justify-between gap-2">
                              <span className={`line-clamp-1 text-sm ${
                                isRead
                                  ? "font-medium text-gray-600"
                                  : "font-bold text-gray-900"
                              }`}>
                                {title}
                              </span>
                              {notification.created_at && (
                                <span className="flex-shrink-0 text-[10px] font-medium text-gray-400">
                                  {formatNotificationDate(
                                    notification.created_at
                                  )}
                                </span>
                              )}
                            </span>

                            {message && (
                              <span className={`mt-0.5 line-clamp-2 block text-xs leading-relaxed ${
                                isRead ? "text-gray-400" : "text-gray-500"
                              }`}>
                                {message}
                              </span>
                            )}

                            {!isRead && (
                              <span className="mt-1.5 inline-flex items-center gap-1 rounded-full bg-teal-100 px-2 py-0.5 text-[10px] font-bold text-teal-700">
                                Belum dibaca
                              </span>
                            )}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                )}

                <div className="border-t border-gray-100 p-3">
                  <button
                    type="button"
                    onClick={() => {
                      setShowNotifications(false);
                      router.push("/alumni/main/notifikasi");
                    }}
                    className="w-full rounded-xl bg-teal-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-teal-700"
                  >
                    Lihat semua
                  </button>
                </div>
              </div>
            )}
          </div>

          <button
            onClick={() => {
              setShowProfile(!showProfile);
              setShowNotifications(false);
            }}
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
