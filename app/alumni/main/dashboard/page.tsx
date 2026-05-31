"use client";

import { useRouter } from "next/navigation";
import {
  useMyProfile,
  useAlumniEvents,
  useMyPresences,
  useMyRecommendations,
  useMyNotifications,
} from "@/hooks/alumni/useAlumniHooks";
import { Icon } from "@/app/components/alumni/Icon";

// ─── Types ────────────────────────────────────────────────────────────────────
interface Event {
  id: number;
  event_title: string;
  event_datetime: string;
  location: string;
  category?: unknown;
  status_event?: string;
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

// ─── Skeleton ─────────────────────────────────────────────────────────────────
function Skeleton({ className }: { className: string }) {
  return <div className={`bg-gray-200 rounded-xl animate-pulse ${className}`} />;
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function AlumniDashboard() {
  const router = useRouter();

  const { data: profile, isLoading: loadingProfile } = useMyProfile();
  const { data: events = [], isLoading: loadingEvents } = useAlumniEvents();
  const { data: presences = [], isLoading: loadingPresences } = useMyPresences();
  const { data: recommendations = [], isLoading: loadingRec } =
    useMyRecommendations();
  const { data: notifications = [] } = useMyNotifications();

  const firstName = profile?.first_name ?? "Alumni";

  const todayEvents = events.filter((event: Event) =>
    isToday(event.event_datetime)
  );

  const upcomingEvents = events
    .filter(
      (event: Event) =>
        new Date(event.event_datetime) > new Date() &&
        !isToday(event.event_datetime)
    )
    .slice(0, 3);

  const topRecommendation = recommendations[0] ?? null;
  const recentPresences = presences.slice(0, 3);

  const unreadNotification = notifications.filter(
    (notification: Notification) => !notification.is_read
  )[0];

  return (
    <>
      {/* Greeting */}
      <div>
        {loadingProfile ? (
          <Skeleton className="h-6 w-48 mb-1" />
        ) : (
          <h1 className="text-xl font-bold text-gray-900">
            Assalamu&apos;alaikum, {firstName}
          </h1>
        )}

        <p className="text-sm text-gray-400 mt-0.5">
          Selamat datang di dashboard presensi Anda
        </p>
      </div>

      {/* Notification Banner */}
      {unreadNotification && (
        <div
          className="rounded-2xl p-4 flex items-start gap-3 cursor-pointer active:opacity-90"
          style={{
            background: "linear-gradient(135deg, #3ecf8e 0%, #20b070 100%)",
          }}
          onClick={() => router.push("/alumni/notifikasi")}
        >
          <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5 text-white">
            <svg
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
              className="w-5 h-5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z"
              />
            </svg>
          </div>

          <div className="min-w-0">
            <p className="text-white font-semibold text-sm leading-tight">
              {unreadNotification.title}
            </p>
            <p className="text-green-100 text-xs mt-1 leading-relaxed line-clamp-2">
              {unreadNotification.body}
            </p>
          </div>
        </div>
      )}

      {/* Stat Cards */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white rounded-2xl p-4 text-center shadow-sm border border-gray-50">
          {loadingPresences ? (
            <Skeleton className="h-8 w-12 mx-auto mb-1" />
          ) : (
            <p className="text-3xl font-bold text-gray-900">
              {presences.length}
            </p>
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

      {/* Rekomendasi Event */}
      {loadingRec ? (
        <Skeleton className="h-44 w-full rounded-2xl" />
      ) : topRecommendation ? (
        <div
          className="rounded-2xl p-5 space-y-3"
          style={{
            background: "linear-gradient(135deg, #2d9e6b 0%, #1a7a50 100%)",
          }}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs bg-white/20 text-white px-3 py-1 rounded-full font-medium">
              Rekomendasi Event
            </span>

            <button
              onClick={() => router.push("/alumni/main/events")}
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
              {
                icon: "calendar" as const,
                text: formatDate(topRecommendation.event_datetime),
              },
              {
                icon: "clock" as const,
                text: formatTime(topRecommendation.event_datetime),
              },
              {
                icon: "pin" as const,
                text: topRecommendation.location,
              },
            ].map((item, index) => (
              <div
                key={index}
                className="flex items-center gap-2 text-green-100 text-sm"
              >
                <Icon name={item.icon} className="w-4 h-4 flex-shrink-0" />
                <span>{item.text}</span>
              </div>
            ))}
          </div>

          <button
            onClick={() =>
              router.push(`/alumni/main/events/${topRecommendation.id}`)
            }
            className="w-full bg-white text-teal-700 font-semibold py-2.5 rounded-xl text-sm hover:bg-green-50 transition-colors"
          >
            Lihat Detail & Daftar
          </button>
        </div>
      ) : null}

      {/* Event Hari Ini */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-bold text-gray-900">Event Hari Ini</h2>

          <button
            onClick={() => router.push("/alumni/main/events")}
            className="text-xs text-teal-600"
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
              <div
                key={event.id}
                className="bg-white rounded-2xl p-4 flex items-center gap-3 shadow-sm border border-gray-50"
              >
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{
                    background:
                      "linear-gradient(135deg, #3ecf8e 0%, #20b070 100%)",
                  }}
                >
                  <span className="text-white font-bold text-lg">
                    {getDayNum(event.event_datetime)}
                  </span>
                </div>

                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-800 text-sm truncate">
                    {event.event_title}
                  </p>

                  <p className="text-xs text-gray-400 mt-0.5 flex items-center gap-1">
                    <Icon name="clock" className="w-3.5 h-3.5" />
                    <span>
                    {new Date(event.event_datetime).toLocaleTimeString(
                      "id-ID",
                      {
                        hour: "2-digit",
                        minute: "2-digit",
                      }
                    )}
                    </span>
                    <span className="mx-1">·</span>
                    <Icon name="pin" className="w-3.5 h-3.5" />
                    <span className="truncate">{event.location}</span>
                  </p>
                </div>

                <button
                  onClick={() => router.push(`/alumni/main/events/${event.id}`)}
                  className="text-xs border border-gray-200 text-gray-600 px-3 py-1.5 rounded-lg flex-shrink-0"
                >
                  Detail
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Event Mendatang */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-bold text-gray-900">Event Mendatang</h2>

          <button
            onClick={() => router.push("/alumni/main/events")}
            className="text-xs text-teal-600"
          >
            Lihat Semua →
          </button>
        </div>

        {loadingEvents ? (
          <div className="space-y-2">
            {[1, 2, 3].map((item) => (
              <Skeleton key={item} className="h-14 w-full" />
            ))}
          </div>
        ) : upcomingEvents.length === 0 ? (
          <div className="bg-white rounded-2xl p-4 text-center text-gray-400 text-sm border border-gray-50">
            Tidak ada event mendatang
          </div>
        ) : (
          <div className="space-y-2">
            {upcomingEvents.map((event: Event) => (
              <div
                key={event.id}
                className="bg-white rounded-2xl px-4 py-3.5 flex items-center justify-between shadow-sm border border-gray-50"
              >
                <div className="min-w-0 mr-3">
                  <p className="font-semibold text-gray-800 text-sm truncate">
                    {event.event_title}
                  </p>

                  <p className="text-xs text-gray-400 mt-0.5">
                    {formatShort(event.event_datetime)}
                  </p>
                </div>

                <button
                  onClick={() => router.push(`/alumni/main/events/${event.id}`)}
                  className="text-xs text-white px-4 py-2 rounded-xl font-medium flex-shrink-0"
                  style={{
                    background:
                      "linear-gradient(135deg, #3ecf8e 0%, #20b070 100%)",
                  }}
                >
                  Lihat
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Riwayat Kehadiran */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-bold text-gray-900">Riwayat Kehadiran</h2>

          <button
            onClick={() => router.push("/alumni/main/riwayat")}
            className="text-xs text-teal-600"
          >
            Lihat Semua →
          </button>
        </div>

        {loadingPresences ? (
          <div className="space-y-2">
            {[1, 2, 3].map((item) => (
              <Skeleton key={item} className="h-14 w-full" />
            ))}
          </div>
        ) : recentPresences.length === 0 ? (
          <div className="bg-white rounded-2xl p-4 text-center text-gray-400 text-sm border border-gray-50">
            Belum ada riwayat kehadiran
          </div>
        ) : (
          <div className="space-y-2">
            {recentPresences.map((presence: Presence) => (
              <div
                key={presence.id}
                className="bg-white rounded-2xl px-4 py-3.5 flex items-center justify-between shadow-sm border border-gray-50"
              >
                <div className="min-w-0 mr-3">
                  <p className="font-semibold text-gray-800 text-sm truncate">
                    {presence.event?.event_title ??
                      `Event #${presence.event_id}`}
                  </p>

                  <p className="text-xs text-gray-400 mt-0.5">
                    {new Date(presence.scanned_at).toLocaleDateString("id-ID")}
                  </p>
                </div>

                <span className="text-xs bg-teal-50 text-teal-600 border border-teal-200 px-3 py-1.5 rounded-xl font-medium flex-shrink-0">
                  Hadir
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
