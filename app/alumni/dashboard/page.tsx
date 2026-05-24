"use client";

import { useRouter } from "next/navigation";
import {
  useMyProfile,
  useAlumniEvents,
  useMyPresences,
  useMyRecommendations,
  useMyNotifications,
} from "@/hooks/alumni/useAlumniHooks";

interface Event {
  id: number;
  event_title: string;
  event_datetime: string;
  location: string;
  category: string;
  status_event: "Mendatang" | "Selesai";
}

interface Presence {
  id: number;
  event_id: number;
  scanned_at: string;
  event?: {
    event_title: string;
    event_datetime: string;
  };
}

interface Notification {
  id: number;
  title: string;
  body: string;
  is_read: boolean;
}

function isToday(datetime: string) {
  const d = new Date(datetime);
  const now = new Date();
  return (
    d.getDate() === now.getDate() &&
    d.getMonth() === now.getMonth() &&
    d.getFullYear() === now.getFullYear()
  );
}

function formatDate(datetime: string) {
  return new Date(datetime).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function formatTime(datetime: string) {
  return (
    new Date(datetime).toLocaleTimeString("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
    }) + " WIB"
  );
}

function formatShort(datetime: string) {
  const d = new Date(datetime);
  return `${d.getDate()} ${d.toLocaleString("id-ID", {
    month: "long",
  })} • ${d.toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
  })}`;
}

function getDayNum(datetime: string) {
  return new Date(datetime).getDate();
}

function Skeleton({ className }: { className: string }) {
  return <div className={`bg-gray-200 rounded-xl animate-pulse ${className}`} />;
}

function Icon({
  name,
  className = "w-5 h-5",
}: {
  name:
    | "home"
    | "calendar"
    | "qr"
    | "history"
    | "user"
    | "bell"
    | "menu"
    | "megaphone"
    | "clock"
    | "pin";
  className?: string;
}) {
  const common = {
    fill: "none",
    viewBox: "0 0 24 24",
    stroke: "currentColor",
    strokeWidth: 2,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    className,
  };

  switch (name) {
    case "home":
      return (
        <svg {...common}>
          <path d="M3 10.5 12 3l9 7.5" />
          <path d="M5 10v10h14V10" />
          <path d="M9 20v-6h6v6" />
        </svg>
      );
    case "calendar":
      return (
        <svg {...common}>
          <path d="M8 2v4M16 2v4M3 10h18" />
          <rect x="3" y="4" width="18" height="18" rx="2" />
        </svg>
      );
    case "qr":
      return (
        <svg {...common}>
          <rect x="4" y="4" width="6" height="6" rx="1" />
          <rect x="14" y="4" width="6" height="6" rx="1" />
          <rect x="4" y="14" width="6" height="6" rx="1" />
          <path d="M14 14h2v2h-2zM18 14h2M14 18h2M18 18h2v2" />
        </svg>
      );
    case "history":
      return (
        <svg {...common}>
          <path d="M3 12a9 9 0 1 0 3-6.7" />
          <path d="M3 4v5h5" />
          <path d="M12 7v5l3 2" />
        </svg>
      );
    case "user":
      return (
        <svg {...common}>
          <path d="M20 21a8 8 0 0 0-16 0" />
          <circle cx="12" cy="8" r="4" />
        </svg>
      );
    case "bell":
      return (
        <svg {...common}>
          <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" />
          <path d="M13.73 21a2 2 0 0 1-3.46 0" />
        </svg>
      );
    case "menu":
      return (
        <svg {...common}>
          <path d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      );
    case "megaphone":
      return (
        <svg {...common}>
          <path d="M3 11v2a2 2 0 0 0 2 2h2l4 5v-5l8-3V8l-8-3v10" />
          <path d="M21 9v6" />
        </svg>
      );
    case "clock":
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="9" />
          <path d="M12 7v5l3 2" />
        </svg>
      );
    case "pin":
      return (
        <svg {...common}>
          <path d="M12 21s7-4.4 7-11a7 7 0 1 0-14 0c0 6.6 7 11 7 11z" />
          <circle cx="12" cy="10" r="2.5" />
        </svg>
      );
  }
}

export default function AlumniDashboard() {
  const router = useRouter();

  const { data: profile, isLoading: loadingProfile } = useMyProfile();
  const { data: events = [], isLoading: loadingEvents } = useAlumniEvents();
  const { data: presences = [], isLoading: loadingPresences } = useMyPresences();
  const { data: recommendations = [], isLoading: loadingRec } = useMyRecommendations();
  const { data: notifications = [] } = useMyNotifications();

  const firstName = profile?.first_name ?? "Alumni";
  const todayEvents = events.filter((e: Event) => isToday(e.event_datetime));
  const upcomingEvents = events
    .filter((e: Event) => new Date(e.event_datetime) > new Date() && !isToday(e.event_datetime))
    .slice(0, 3);
  const topRecommendation = recommendations[0] ?? null;
  const recentPresences = presences.slice(0, 3);
  const unreadNotif = notifications.filter((n: Notification) => !n.is_read).length;
  const unreadNotification = notifications.filter((n: Notification) => !n.is_read)[0];

  const navItems = [
    { icon: "home" as const, label: "Dashboard", path: "/dashboard", active: true },
    { icon: "calendar" as const, label: "Event", path: "/events", active: false },
    { icon: "history" as const, label: "Riwayat", path: "/riwayat", active: false },
    { icon: "user" as const, label: "Profil", path: "/profil", active: false },
  ];

  return (
    <div className="min-h-screen bg-gray-50 pb-28">
      <header className="bg-white px-4 py-3 flex items-center justify-between sticky top-0 z-40 shadow-sm">
        <button className="p-1 text-gray-600" aria-label="Buka menu">
          <Icon name="menu" className="w-[22px] h-[22px]" />
        </button>

        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-teal-400 to-cyan-500 flex items-center justify-center text-white">
            <Icon name="qr" className="w-4 h-4" />
          </div>
          <span className="text-sm font-semibold text-gray-700">Presensi Alumni</span>
        </div>

        <div className="flex items-center gap-2">
          <button onClick={() => router.push("/notifikasi")} className="relative p-1" aria-label="Notifikasi">
            <Icon name="bell" className="w-[22px] h-[22px]" />
            {unreadNotif > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
                {unreadNotif > 9 ? "9+" : unreadNotif}
              </span>
            )}
          </button>

          <button onClick={() => router.push("/profil")} aria-label="Profil">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-teal-500 to-cyan-500 flex items-center justify-center text-white text-sm font-bold">
              {loadingProfile ? "..." : firstName[0]?.toUpperCase()}
            </div>
          </button>
        </div>
      </header>

      <div className="px-4 pt-5 space-y-5">
        <div>
          {loadingProfile ? (
            <Skeleton className="h-6 w-48 mb-1" />
          ) : (
            <h1 className="text-xl font-bold text-gray-900">Assalamu&apos;alaikum, {firstName}</h1>
          )}
          <p className="text-sm text-gray-400 mt-0.5">Selamat datang di dashboard presensi Anda</p>
        </div>

        {unreadNotification && (
          <div
            className="rounded-2xl p-4 flex items-start gap-3 cursor-pointer"
            style={{ background: "linear-gradient(135deg, #3ecf8e 0%, #20b070 100%)" }}
            onClick={() => router.push("/notifikasi")}
          >
            <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5 text-white">
              <Icon name="megaphone" className="w-5 h-5" />
            </div>
            <div>
              <p className="text-white font-semibold text-sm leading-tight">{unreadNotification.title}</p>
              <p className="text-green-100 text-xs mt-1 leading-relaxed">{unreadNotification.body}</p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white rounded-2xl p-4 text-center shadow-sm border border-gray-50">
            {loadingPresences ? (
              <Skeleton className="h-8 w-12 mx-auto mb-1" />
            ) : (
              <p className="text-3xl font-bold text-gray-900">{presences.length}</p>
            )}
            <p className="text-xs text-gray-400 mt-0.5">Event diikuti</p>
          </div>
          <div className="bg-white rounded-2xl p-4 text-center shadow-sm border border-gray-50">
            {loadingEvents || loadingPresences ? (
              <Skeleton className="h-8 w-12 mx-auto mb-1" />
            ) : (
              <p className="text-3xl font-bold text-gray-900">{Math.max(0, events.length - presences.length)}</p>
            )}
            <p className="text-xs text-gray-400 mt-0.5">Event tidak diikuti</p>
          </div>
        </div>

        <div>
          {loadingRec ? (
            <div className="rounded-2xl overflow-hidden">
              <Skeleton className="h-44 w-full" />
            </div>
          ) : topRecommendation ? (
            <div
              className="rounded-2xl p-5 space-y-3"
              style={{ background: "linear-gradient(135deg, #2d9e6b 0%, #1a7a50 100%)" }}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs bg-white/20 text-white px-3 py-1 rounded-full font-medium">
                  Rekomendasi Event
                </span>
                <button
                  onClick={() => router.push("/rekomendasi")}
                  className="text-xs text-green-200 hover:text-white transition-colors"
                >
                  Lihat Semua
                </button>
              </div>

              <h3 className="text-white font-bold text-lg leading-tight">{topRecommendation.event_title}</h3>

              <div className="space-y-1.5">
                {[
                  { icon: "calendar" as const, text: formatDate(topRecommendation.event_datetime) },
                  { icon: "clock" as const, text: formatTime(topRecommendation.event_datetime) },
                  { icon: "pin" as const, text: topRecommendation.location },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-2 text-green-100 text-sm">
                    <Icon name={item.icon} className="w-4 h-4 flex-shrink-0" />
                    <span>{item.text}</span>
                  </div>
                ))}
              </div>

              <button
                onClick={() => router.push(`/events/${topRecommendation.id}`)}
                className="w-full bg-white text-teal-700 font-semibold py-2.5 rounded-xl text-sm hover:bg-green-50 transition-colors"
              >
                Lihat Detail & Daftar
              </button>
            </div>
          ) : null}
        </div>

        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-bold text-gray-900">Event Hari Ini</h2>
            <button onClick={() => router.push("/events")} className="text-xs text-teal-600 hover:underline">
              Lihat Semua
            </button>
          </div>

          {loadingEvents ? (
            <Skeleton className="h-20 w-full" />
          ) : todayEvents.length === 0 ? (
            <div className="bg-white rounded-2xl p-4 text-center text-gray-400 text-sm border border-gray-50">
              Tidak ada event hari ini
            </div>
          ) : (
            <div className="space-y-2">
              {todayEvents.map((event: Event) => (
                <div key={event.id} className="bg-white rounded-2xl p-4 flex items-center gap-3 shadow-sm border border-gray-50">
                  <div
                    className="w-12 h-12 rounded-xl flex flex-col items-center justify-center flex-shrink-0"
                    style={{ background: "linear-gradient(135deg, #3ecf8e 0%, #20b070 100%)" }}
                  >
                    <span className="text-white font-bold text-lg leading-none">{getDayNum(event.event_datetime)}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-800 text-sm truncate">{event.event_title}</p>
                    <p className="text-xs text-gray-400 mt-0.5 flex items-center gap-1">
                      <Icon name="clock" className="w-3.5 h-3.5 flex-shrink-0" />
                      {new Date(event.event_datetime).toLocaleTimeString("id-ID", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                      <span className="mx-1">·</span>
                      <Icon name="pin" className="w-3.5 h-3.5 flex-shrink-0" />
                      {event.location}
                    </p>
                  </div>
                  <button
                    onClick={() => router.push(`/events/${event.id}`)}
                    className="text-xs border border-gray-200 text-gray-600 px-3 py-1.5 rounded-lg hover:bg-gray-50 transition-colors flex-shrink-0"
                  >
                    Detail
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-bold text-gray-900">Event Mendatang</h2>
            <button onClick={() => router.push("/events")} className="text-xs text-teal-600 hover:underline">
              Lihat Semua
            </button>
          </div>

          {loadingEvents ? (
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-14 w-full" />
              ))}
            </div>
          ) : upcomingEvents.length === 0 ? (
            <div className="bg-white rounded-2xl p-4 text-center text-gray-400 text-sm border border-gray-50">
              Tidak ada event mendatang
            </div>
          ) : (
            <div className="space-y-2">
              {upcomingEvents.map((event: Event) => (
                <div key={event.id} className="bg-white rounded-2xl px-4 py-3.5 flex items-center justify-between shadow-sm border border-gray-50">
                  <div>
                    <p className="font-semibold text-gray-800 text-sm">{event.event_title}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{formatShort(event.event_datetime)}</p>
                  </div>
                  <button
                    onClick={() => router.push(`/events/${event.id}`)}
                    className="text-xs text-white px-4 py-2 rounded-xl font-medium flex-shrink-0 ml-3"
                    style={{ background: "linear-gradient(135deg, #3ecf8e 0%, #20b070 100%)" }}
                  >
                    Lihat
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-bold text-gray-900">Riwayat Kehadiran</h2>
            <button onClick={() => router.push("/riwayat")} className="text-xs text-teal-600 hover:underline">
              Lihat Semua
            </button>
          </div>

          {loadingPresences ? (
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-14 w-full" />
              ))}
            </div>
          ) : recentPresences.length === 0 ? (
            <div className="bg-white rounded-2xl p-4 text-center text-gray-400 text-sm border border-gray-50">
              Belum ada riwayat kehadiran
            </div>
          ) : (
            <div className="space-y-2">
              {recentPresences.map((p: Presence) => (
                <div key={p.id} className="bg-white rounded-2xl px-4 py-3.5 flex items-center justify-between shadow-sm border border-gray-50">
                  <div>
                    <p className="font-semibold text-gray-800 text-sm">{p.event?.event_title ?? `Event #${p.event_id}`}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{new Date(p.scanned_at).toLocaleDateString("id-ID")}</p>
                  </div>
                  <span className="text-xs bg-teal-50 text-teal-600 border border-teal-200 px-3 py-1.5 rounded-xl font-medium flex-shrink-0 ml-3">
                    Hadir
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-3 pt-2 pb-3 z-50 shadow-[0_-8px_24px_rgba(15,23,42,0.06)]">
        <div className="grid grid-cols-5 items-end max-w-md mx-auto">
          {navItems.slice(0, 2).map((item) => (
            <button
              key={item.path}
              onClick={() => router.push(item.path)}
              className={`flex flex-col items-center gap-1 py-1.5 rounded-xl transition-colors ${
                item.active ? "text-teal-600" : "text-gray-400 hover:text-gray-600"
              }`}
            >
              <Icon name={item.icon} className="w-5 h-5" />
              <span className="text-[11px] font-medium leading-none">{item.label}</span>
            </button>
          ))}

          <button
            onClick={() => router.push("/alumni/scan")}
            className="-mt-9 flex flex-col items-center gap-1 text-teal-700 active:scale-95 transition-transform"
            aria-label="Scan QR Presensi"
          >
            <span
              className="w-16 h-16 rounded-full text-white flex items-center justify-center shadow-lg border-4 border-white"
              style={{
                background: "linear-gradient(135deg, #3ecf8e 0%, #20b070 100%)",
                boxShadow: "0 8px 24px rgba(32, 176, 112, 0.35)",
              }}
            >
              <Icon name="qr" className="w-7 h-7" />
            </span>
            <span className="text-[11px] font-semibold leading-none">Scan</span>
          </button>

          {navItems.slice(2).map((item) => (
            <button
              key={item.path}
              onClick={() => router.push(item.path)}
              className={`flex flex-col items-center gap-1 py-1.5 rounded-xl transition-colors ${
                item.active ? "text-teal-600" : "text-gray-400 hover:text-gray-600"
              }`}
            >
              <Icon name={item.icon} className="w-5 h-5" />
              <span className="text-[11px] font-medium leading-none">{item.label}</span>
            </button>
          ))}
        </div>
      </nav>
    </div>
  );
}
