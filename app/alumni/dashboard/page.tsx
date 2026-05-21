"use client";

import { useRouter } from "next/navigation";
import {
  useMyProfile,
  useAlumniEvents,
  useMyPresences,
  useMyRecommendations,
  useMyNotifications,
} from "@/hooks/alumni/useAlumniHooks";

// ─── Types ────────────────────────────────────────────────────────────────────
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

// ─── Helpers ──────────────────────────────────────────────────────────────────
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
    day: "numeric", month: "long", year: "numeric",
  });
}

function formatTime(datetime: string) {
  return new Date(datetime).toLocaleTimeString("id-ID", {
    hour: "2-digit", minute: "2-digit",
  }) + " WIB";
}

function formatShort(datetime: string) {
  const d = new Date(datetime);
  return `${d.getDate()} ${d.toLocaleString("id-ID", { month: "long" })} • ${d.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })}`;
}

function getDayNum(datetime: string) {
  return new Date(datetime).getDate();
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────
function Skeleton({ className }: { className: string }) {
  return <div className={`bg-gray-200 rounded-xl animate-pulse ${className}`} />;
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function AlumniDashboard() {
  const router = useRouter();

  // ── TanStack Query ──
  const { data: profile, isLoading: loadingProfile } = useMyProfile();
  const { data: events = [], isLoading: loadingEvents } = useAlumniEvents();
  const { data: presences = [], isLoading: loadingPresences } = useMyPresences();
  const { data: recommendations = [], isLoading: loadingRec } = useMyRecommendations();
  const { data: notifications = [] } = useMyNotifications();

  // ── Computed ──
  const firstName = profile?.first_name ?? "Alumni";
  const todayEvents = events.filter((e: Event) => isToday(e.event_datetime));
  const upcomingEvents = events
    .filter((e: Event) => new Date(e.event_datetime) > new Date() && !isToday(e.event_datetime))
    .slice(0, 3);
  const topRecommendation = recommendations[0] ?? null;
  const recentPresences = presences.slice(0, 3);
  const unreadNotif = notifications.filter((n: Notification) => !n.is_read).length;

  return (
    <div className="min-h-screen bg-gray-50 pb-24">

      {/* ── Mobile Header ── */}
      <header className="bg-white px-4 py-3 flex items-center justify-between sticky top-0 z-40 shadow-sm">
        <button className="p-1 text-gray-600">
          <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-teal-400 to-cyan-500 flex items-center justify-center">
            <span className="text-white text-xs font-bold">QR</span>
          </div>
          <span className="text-sm font-semibold text-gray-700">Presensi Alumni</span>
        </div>

        <div className="flex items-center gap-2">
          {/* Notif bell */}
          <button
            onClick={() => router.push("/notifikasi")}
            className="relative p-1"
          >
            <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6 6 0 10-12 0v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0a3 3 0 11-6 0h6z" />
            </svg>
            {unreadNotif > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
                {unreadNotif > 9 ? "9+" : unreadNotif}
              </span>
            )}
          </button>

          {/* Avatar */}
          <button onClick={() => router.push("/profil")}>
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-teal-500 to-cyan-500 flex items-center justify-center text-white text-sm font-bold">
              {loadingProfile ? "..." : firstName[0]?.toUpperCase()}
            </div>
          </button>
        </div>
      </header>

      <div className="px-4 pt-5 space-y-5">

        {/* ── Greeting ── */}
        <div>
          {loadingProfile ? (
            <Skeleton className="h-6 w-48 mb-1" />
          ) : (
            <h1 className="text-xl font-bold text-gray-900">
              Assalamu&apos;alaikum, {firstName} 👋
            </h1>
          )}
          <p className="text-sm text-gray-400 mt-0.5">Selamat datang di dashboard presensi Anda</p>
        </div>

        {/* ── Notification Banner ── */}
        {notifications.filter((n: Notification) => !n.is_read)[0] && (
          <div
            className="rounded-2xl p-4 flex items-start gap-3 cursor-pointer"
            style={{ background: "linear-gradient(135deg, #3ecf8e 0%, #20b070 100%)" }}
            onClick={() => router.push("/notifikasi")}
          >
            <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-white text-lg">📢</span>
            </div>
            <div>
              <p className="text-white font-semibold text-sm leading-tight">
                {notifications.filter((n: Notification) => !n.is_read)[0].title}
              </p>
              <p className="text-green-100 text-xs mt-1 leading-relaxed">
                {notifications.filter((n: Notification) => !n.is_read)[0].body}
              </p>
            </div>
          </div>
        )}

        {/* ── Stat Cards ── */}
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
              <p className="text-3xl font-bold text-gray-900">
                {Math.max(0, events.length - presences.length)}
              </p>
            )}
            <p className="text-xs text-gray-400 mt-0.5">Event tidak diikuti</p>
          </div>
        </div>

        {/* ── Rekomendasi Event ── */}
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
                  Lihat Semua →
                </button>
              </div>

              <h3 className="text-white font-bold text-lg leading-tight">
                {topRecommendation.event_title}
              </h3>

              <div className="space-y-1.5">
                {[
                  { icon: "📅", text: formatDate(topRecommendation.event_datetime) },
                  { icon: "🕐", text: formatTime(topRecommendation.event_datetime) },
                  { icon: "📍", text: topRecommendation.location },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-2 text-green-100 text-sm">
                    <span className="text-base">{item.icon}</span>
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

        {/* ── Scan QR Button ── */}
        <button
          onClick={() => router.push("/scan")}
          className="w-full py-4 rounded-2xl text-white font-semibold flex items-center justify-center gap-2 text-base shadow-md active:scale-95 transition-transform"
          style={{
            background: "linear-gradient(135deg, #3ecf8e 0%, #20b070 100%)",
            boxShadow: "0 4px 15px rgba(32, 176, 112, 0.4)",
          }}
        >
          <span className="text-xl">⬛</span>
          Scan QR Presensi
        </button>

        {/* ── Event Hari Ini ── */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-bold text-gray-900">Event Hari Ini</h2>
            <button
              onClick={() => router.push("/events")}
              className="text-xs text-teal-600 hover:underline"
            >
              Lihat Semua →
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
                    <span className="text-white font-bold text-lg leading-none">
                      {getDayNum(event.event_datetime)}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-800 text-sm truncate">{event.event_title}</p>
                    <p className="text-xs text-gray-400 mt-0.5 flex items-center gap-1">
                      <span>🕐</span>
                      {new Date(event.event_datetime).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })}
                      <span className="mx-1">·</span>
                      <span>📍</span>
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

        {/* ── Event Mendatang ── */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-bold text-gray-900">Event Mendatang</h2>
            <button
              onClick={() => router.push("/events")}
              className="text-xs text-teal-600 hover:underline"
            >
              Lihat Semua →
            </button>
          </div>

          {loadingEvents ? (
            <div className="space-y-2">
              {[1, 2, 3].map((i) => <Skeleton key={i} className="h-14 w-full" />)}
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

        {/* ── Riwayat Kehadiran ── */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-bold text-gray-900">Riwayat Kehadiran</h2>
            <button
              onClick={() => router.push("/riwayat")}
              className="text-xs text-teal-600 hover:underline"
            >
              Lihat Semua →
            </button>
          </div>

          {loadingPresences ? (
            <div className="space-y-2">
              {[1, 2, 3].map((i) => <Skeleton key={i} className="h-14 w-full" />)}
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
                    <p className="font-semibold text-gray-800 text-sm">
                      {p.event?.event_title ?? `Event #${p.event_id}`}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {new Date(p.scanned_at).toLocaleDateString("id-ID")}
                    </p>
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

      {/* ── Bottom Navbar ── */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-2 py-2 z-50">
        <div className="flex justify-around max-w-sm mx-auto">
          {[
            { icon: "🏠", label: "Dashboard", path: "/dashboard", active: true },
            { icon: "📅", label: "Event", path: "/events", active: false },
            { icon: "⬛", label: "Scan", path: "/scan", active: false },
            { icon: "📋", label: "Riwayat", path: "/riwayat", active: false },
            { icon: "👤", label: "Profil", path: "/profil", active: false },
          ].map((item) => (
            <button
              key={item.path}
              onClick={() => router.push(item.path)}
              className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-colors ${
                item.active ? "text-teal-600" : "text-gray-400 hover:text-gray-600"
              }`}
            >
              <span className="text-xl">{item.icon}</span>
              <span className={`text-xs font-medium ${item.active ? "text-teal-600" : "text-gray-400"}`}>
                {item.label}
              </span>
            </button>
          ))}
        </div>
      </nav>
    </div>
  );
}