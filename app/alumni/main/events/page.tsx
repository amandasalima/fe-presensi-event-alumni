"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAlumniEvents } from "@/hooks/alumni/useAlumniHooks";
import { Search, Calendar, MapPin, Users, ChevronRight, Tag } from "lucide-react";

interface Event {
  id: number;
  event_title: string;
  event_description?: string;
  event_date: string;
  start_time: string;
  end_time: string;
  location: string;
  quota: number;
  remaining_quota: number;
  is_registered: boolean;
  category?: {
    id: number;
    category_name: string;
  };
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function formatTime(timeStr: string) {
  if (!timeStr) return "";
  // format HH:MM:SS to HH:MM
  const parts = timeStr.split(":");
  if (parts.length >= 2) {
    return `${parts[0]}:${parts[1]}`;
  }
  return timeStr;
}

export default function AlumniEventsPage() {
  const router = useRouter();
  const { data: events = [], isLoading } = useAlumniEvents();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Semua");

  // Extract unique categories from events for filtering
  const categories: string[] = ["Semua", ...Array.from(new Set<string>(
    events
      .map((e: Event) => e.category?.category_name)
      .filter((name: string | undefined): name is string => !!name)
  ))];

  // Filter events
  const filteredEvents = events.filter((event: Event) => {
    const matchesSearch =
      event.event_title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.location.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory =
      selectedCategory === "Semua" ||
      event.category?.category_name === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-5">
      {/* Header Halaman */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Daftar Event</h1>
          <p className="text-xs text-gray-400 mt-0.5">
            Ikuti berbagai kegiatan alumni pondok pesantren
          </p>
        </div>
      </div>

      {/* Pencarian dan Filter Kategori */}
      <div className="space-y-3">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-gray-400" />
          <input
            type="text"
            placeholder="Cari event atau lokasi..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white pl-10 pr-4 py-2.5 rounded-2xl border border-gray-100 shadow-sm text-sm focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-colors"
          />
        </div>

        {/* Kategori Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors ${
                selectedCategory === category
                  ? "bg-teal-600 text-white shadow-sm"
                  : "bg-white text-gray-500 border border-gray-100 hover:bg-gray-50"
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {/* Daftar Event */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((n) => (
            <div key={n} className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm space-y-3 animate-pulse">
              <div className="flex justify-between items-center">
                <div className="h-4 bg-gray-200 rounded w-1/4" />
                <div className="h-5 bg-gray-200 rounded-full w-16" />
              </div>
              <div className="h-6 bg-gray-200 rounded w-3/4" />
              <div className="space-y-2">
                <div className="h-3 bg-gray-200 rounded w-1/2" />
                <div className="h-3 bg-gray-200 rounded w-2/3" />
              </div>
              <div className="h-10 bg-gray-200 rounded-xl w-full" />
            </div>
          ))}
        </div>
      ) : filteredEvents.length === 0 ? (
        <div className="bg-white rounded-2xl p-8 text-center text-gray-400 border border-gray-100 shadow-sm space-y-2">
          <Calendar className="w-10 h-10 text-gray-300 mx-auto" />
          <p className="text-sm font-medium">Tidak ada event yang ditemukan</p>
          <p className="text-xs text-gray-400">Silakan cari dengan kata kunci lain atau pilih kategori berbeda.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredEvents.map((event: Event) => (
            <div
              key={event.id}
              className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between"
            >
              <div>
                {/* Atas: Kategori & Status */}
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-medium flex items-center gap-1">
                    <Tag className="w-2.5 h-2.5" />
                    {event.category?.category_name || "Kategori"}
                  </span>

                  {event.is_registered ? (
                    <span className="text-[10px] bg-emerald-50 text-emerald-600 border border-emerald-100 px-2 py-0.5 rounded font-semibold">
                      Terdaftar
                    </span>
                  ) : (
                    <span className="text-[10px] bg-amber-50 text-amber-600 border border-amber-100 px-2 py-0.5 rounded font-semibold">
                      Belum Terdaftar
                    </span>
                  )}
                </div>

                {/* Judul Event */}
                <h3 className="font-bold text-gray-800 text-base leading-snug">
                  {event.event_title}
                </h3>

                {/* Deskripsi Singkat */}
                {event.event_description && (
                  <p className="text-xs text-gray-400 mt-1 line-clamp-2 leading-relaxed">
                    {event.event_description}
                  </p>
                )}

                {/* Informasi Meta */}
                <div className="mt-3.5 space-y-1.5 border-t border-gray-50 pt-3">
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <Calendar className="w-3.5 h-3.5 text-teal-600 flex-shrink-0" />
                    <span>
                      {formatDate(event.event_date)} • {formatTime(event.start_time)} - {formatTime(event.end_time)} WIB
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <MapPin className="w-3.5 h-3.5 text-teal-600 flex-shrink-0" />
                    <span className="truncate">{event.location}</span>
                  </div>

                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <Users className="w-3.5 h-3.5 text-teal-600 flex-shrink-0" />
                    <span>Sisa kuota: {event.remaining_quota} / {event.quota}</span>
                  </div>
                </div>
              </div>

              {/* Tombol Detail */}
              <button
                onClick={() => router.push(`/alumni/events/${event.id}`)}
                className="w-full mt-4 bg-teal-50 hover:bg-teal-100 text-teal-700 font-semibold py-2 rounded-xl text-xs flex items-center justify-center gap-1 transition-colors"
              >
                <span>Lihat Detail & Pendaftaran</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
