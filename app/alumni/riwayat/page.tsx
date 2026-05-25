"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMyPresences } from "@/hooks/alumni/useAlumniHooks";
import {
  Search,
  Calendar,
  MapPin,
  CheckCircle,
  ChevronRight,
  Clock,
  Award,
  Loader2,
  ArrowLeft,
} from "lucide-react";

interface Presence {
  id: number;
  event_id: number;
  scanned_at: string;
  event?: {
    id?: number;
    event_title: string;
    location?: string;
    event_date?: string;
    event_datetime?: string;
    start_time?: string;
    end_time?: string;
    status_event?: string;
  };
}

function formatDate(dateStr?: string) {
  if (!dateStr) return "";
  return new Date(dateStr).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function formatTime(timeStr?: string) {
  if (!timeStr) return "";
  const parts = timeStr.split(":");
  if (parts.length >= 2) {
    return `${parts[0]}:${parts[1]}`;
  }
  return timeStr;
}

function formatScannedAt(dateStr: string) {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  const formattedDate = d.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  const formattedTime = d.toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
  });
  return `${formattedDate} • ${formattedTime} WIB`;
}

export default function AlumniPresenceHistoryPage() {
  const router = useRouter();
  const { data: presences = [], isLoading } = useMyPresences();
  const [searchQuery, setSearchQuery] = useState("");

  // Filter presences based on event title or location
  const filteredPresences = presences.filter((p: Presence) => {
    const titleMatch = p.event?.event_title
      ?.toLowerCase()
      .includes(searchQuery.toLowerCase());
    const locationMatch = p.event?.location
      ?.toLowerCase()
      .includes(searchQuery.toLowerCase());
    return titleMatch || locationMatch;
  });

  return (
    <div className="space-y-5 pb-6">
      {/* Header & Back Button */}
      <div className="space-y-3">
        <button
          onClick={() => router.push("/alumni/dashboard")}
          className="flex items-center gap-2 text-gray-500 hover:text-gray-700 text-sm font-semibold transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali ke Dashboard</span>
        </button>

        <div>
          <h1 className="text-xl font-bold text-gray-900">Riwayat Kehadiran</h1>
          <p className="text-xs text-gray-400 mt-0.5">
            Daftar kegiatan pondok pesantren yang telah Anda hadiri
          </p>
        </div>
      </div>

      {/* Summary Stat Card */}
      {!isLoading && presences.length > 0 && (
        <div className="bg-gradient-to-br from-teal-500 to-emerald-600 rounded-3xl p-5 text-white shadow-sm border border-teal-100 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] uppercase tracking-wider font-bold text-teal-100">
              Pencapaian Kehadiran
            </span>
            <h2 className="text-2xl font-black">{presences.length} Event</h2>
            <p className="text-[11px] text-teal-50 leading-relaxed">
              Anda aktif berpartisipasi dalam agenda silaturahmi pondok pesantren.
            </p>
          </div>
          <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
            <Award className="w-6 h-6 text-white" />
          </div>
        </div>
      )}

      {/* Search Bar */}
      {!isLoading && presences.length > 0 && (
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-gray-400" />
          <input
            type="text"
            placeholder="Cari berdasarkan nama event atau lokasi..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white pl-10 pr-4 py-2.5 rounded-2xl border border-gray-100 shadow-sm text-sm focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-colors"
          />
        </div>
      )}

      {/* Main List Area */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((n) => (
            <div
              key={n}
              className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm space-y-3 animate-pulse"
            >
              <div className="flex justify-between items-center">
                <div className="h-4 bg-gray-200 rounded w-1/3" />
                <div className="h-5 bg-gray-200 rounded-full w-14" />
              </div>
              <div className="h-5 bg-gray-200 rounded w-3/4" />
              <div className="h-3 bg-gray-200 rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : filteredPresences.length === 0 ? (
        <div className="bg-white rounded-2xl p-8 text-center text-gray-400 border border-gray-100 shadow-sm space-y-3">
          <Clock className="w-10 h-10 text-gray-300 mx-auto" />
          <div className="space-y-1">
            <p className="text-sm font-semibold text-gray-700">
              {presences.length === 0
                ? "Belum Ada Riwayat Kehadiran"
                : "Tidak Menemukan Hasil"}
            </p>
            <p className="text-xs text-gray-400 max-w-xs mx-auto leading-relaxed">
              {presences.length === 0
                ? "Anda belum pernah tercatat hadir via scan QR Code. Silakan ikuti event pesantren mendatang."
                : "Coba cari dengan kata kunci lain atau periksa kembali ejaan Anda."}
            </p>
          </div>
          {presences.length === 0 && (
            <div className="flex gap-2 justify-center pt-2">
              <button
                onClick={() => router.push("/alumni/events")}
                className="bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold px-4 py-2 rounded-xl transition"
              >
                Cari Event
              </button>
              <button
                onClick={() => router.push("/alumni/scan")}
                className="bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 text-xs font-bold px-4 py-2 rounded-xl transition"
              >
                Scan QR Presensi
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {filteredPresences.map((p: Presence) => {
            const eventId = p.event?.id || p.event_id;
            return (
              <div
                key={p.id}
                onClick={() => router.push(`/alumni/events/${eventId}`)}
                className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm hover:shadow-md transition cursor-pointer flex flex-col justify-between gap-4 group"
              >
                <div className="flex justify-between items-start gap-3">
                  <div className="space-y-1 min-w-0">
                    <h3 className="font-bold text-gray-800 text-sm leading-snug group-hover:text-teal-600 transition-colors">
                      {p.event?.event_title || `Event #${eventId}`}
                    </h3>

                    {/* Waktu Pelaksanaan Acara */}
                    <div className="flex items-center gap-1.5 text-xs text-gray-400">
                      <Calendar className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                      <span className="truncate">
                        {p.event?.event_date
                          ? formatDate(p.event.event_date)
                          : p.event?.event_datetime
                          ? formatDate(p.event.event_datetime.split("T")[0])
                          : "Waktu tidak ditentukan"}
                        {p.event?.start_time && (
                          <>
                            {" "}
                            • {formatTime(p.event.start_time)} -{" "}
                            {formatTime(p.event.end_time)} WIB
                          </>
                        )}
                      </span>
                    </div>

                    {/* Lokasi */}
                    {p.event?.location && (
                      <div className="flex items-center gap-1.5 text-xs text-gray-400">
                        <MapPin className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                        <span className="truncate">{p.event.location}</span>
                      </div>
                    )}
                  </div>

                  <span className="text-[10px] bg-emerald-50 text-emerald-600 border border-emerald-100 px-2 py-1 rounded-lg font-bold flex-shrink-0 flex items-center gap-1">
                    <CheckCircle className="w-3 h-3 text-emerald-500" />
                    Hadir
                  </span>
                </div>

                {/* Footer Card: Waktu Scan Presensi */}
                <div className="border-t border-gray-50 pt-3 flex items-center justify-between text-[11px] text-gray-400">
                  <div className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-teal-600" />
                    <span>
                      Diverifikasi:{" "}
                      <span className="font-medium text-gray-600">
                        {formatScannedAt(p.scanned_at)}
                      </span>
                    </span>
                  </div>
                  <div className="flex items-center gap-0.5 text-teal-600 font-bold group-hover:translate-x-0.5 transition-transform">
                    <span>Detail Event</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
