"use client";

import { useState } from "react";
import AdminSidebar from "@/app/components/AdminSidebar";
import AdminHeader from "@/app/components/AdminHeader";
import { useEvents, useCreateEvent, useDeleteEvent } from "@/hooks/admin/useEvents";

// ─── Types ───────────────────────────────────────────────────────────────────
type EventStatus = "Mendatang" | "Selesai";

export interface Event {
  id: number;
  event_title: string;      // sesuai field Laravel
  category: string;
  event_datetime: string;   // format: "2026-03-10T09:00:00"
  location: string;
  status_event: EventStatus;
  quota?: number;
  registered?: number;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────
function parseDate(datetime: string) {
  const d = new Date(datetime);
  return {
    date: d.toISOString().split("T")[0],
    time: d.toTimeString().slice(0, 5),
  };
}

// ─── Loading Skeleton ─────────────────────────────────────────────────────────
function CardSkeleton() {
  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm animate-pulse">
      <div className="h-4 bg-gray-200 rounded w-3/4 mb-3" />
      <div className="h-3 bg-gray-100 rounded w-1/4 mb-4" />
      <div className="h-3 bg-gray-100 rounded w-1/2 mb-2" />
      <div className="h-3 bg-gray-100 rounded w-2/3" />
    </div>
  );
}

// ─── Stat Card ────────────────────────────────────────────────────────────────
function StatCard({
  label, value, sub, accent,
}: {
  label: string; value: string | number; sub: string; accent?: string;
}) {
  return (
    <div className={`bg-white rounded-2xl border p-6 flex flex-col gap-1 shadow-sm ${accent ? `border-l-4 ${accent}` : "border-gray-100"}`}>
      <p className="text-sm text-gray-500">{label}</p>
      <p className={`text-4xl font-bold ${accent ? "text-teal-600" : "text-gray-800"}`}>
        {value}
      </p>
      <p className="text-xs text-gray-400">{sub}</p>
    </div>
  );
}

// ─── Event Card (Mendatang) ───────────────────────────────────────────────────
function EventCardUpcoming({ event, onDelete }: { event: Event; onDelete: (id: number) => void }) {
  const { date, time } = parseDate(event.event_datetime);
  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <h3 className="font-semibold text-gray-800 text-base leading-tight">
          {event.event_title}
        </h3>
        <span className="text-xs bg-teal-50 text-teal-600 border border-teal-200 px-2 py-0.5 rounded-full font-medium whitespace-nowrap ml-2">
          Mendatang
        </span>
      </div>
      <span className="inline-block text-xs bg-gray-100 text-gray-600 px-3 py-1 rounded-full mb-3">
        {event.category}
      </span>
      <div className="space-y-1.5 text-sm text-gray-500">
        <div className="flex items-center gap-2">
          <span>📅</span>
          <span>{date} • {time}</span>
        </div>
        <div className="flex items-center gap-2">
          <span>📍</span>
          <span>{event.location}</span>
        </div>
      </div>
      {/* Action buttons */}
      <div className="flex gap-2 mt-4">
        <button className="flex-1 text-xs border border-teal-200 text-teal-600 hover:bg-teal-50 py-1.5 rounded-lg transition-colors">
          Edit
        </button>
        <button
          onClick={() => onDelete(event.id)}
          className="flex-1 text-xs border border-red-100 text-red-400 hover:bg-red-50 py-1.5 rounded-lg transition-colors"
        >
          Hapus
        </button>
      </div>
    </div>
  );
}

// ─── Event Card (Selesai) ─────────────────────────────────────────────────────
function EventCardDone({ event, onDelete }: { event: Event; onDelete: (id: number) => void }) {
  const { date, time } = parseDate(event.event_datetime);
  const pct = event.quota && event.registered
    ? Math.round((event.registered / event.quota) * 100)
    : 0;

  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <h3 className="font-semibold text-gray-800 text-base leading-tight">
          {event.event_title}
        </h3>
        <span className="text-xs bg-gray-100 text-gray-500 border border-gray-200 px-2 py-0.5 rounded-full font-medium whitespace-nowrap ml-2">
          Selesai
        </span>
      </div>
      <span className="inline-block text-xs bg-gray-100 text-gray-600 px-3 py-1 rounded-full mb-3">
        {event.category}
      </span>
      <div className="space-y-1.5 text-sm text-gray-500 mb-4">
        <div className="flex items-center gap-2">
          <span>📅</span>
          <span>{date} • {time}</span>
        </div>
        <div className="flex items-center gap-2">
          <span>📍</span>
          <span>{event.location}</span>
        </div>
      </div>
      {event.quota && event.registered !== undefined && (
        <div>
          <div className="flex justify-between text-sm text-gray-600 mb-1.5">
            <span>Peserta Terdaftar</span>
            <span className="font-medium">{event.registered} / {event.quota}</span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-2">
            <div className="bg-teal-500 h-2 rounded-full transition-all" style={{ width: `${pct}%` }} />
          </div>
          <p className="text-xs text-gray-400 mt-1 text-right">{pct}% terisi</p>
        </div>
      )}
      <div className="flex gap-2 mt-4">
        <button className="flex-1 text-xs border border-teal-200 text-teal-600 hover:bg-teal-50 py-1.5 rounded-lg transition-colors">
          Edit
        </button>
        <button
          onClick={() => onDelete(event.id)}
          className="flex-1 text-xs border border-red-100 text-red-400 hover:bg-red-50 py-1.5 rounded-lg transition-colors"
        >
          Hapus
        </button>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function KelolEventPage() {
  const [search, setSearch] = useState("");

  // ── TanStack Query ──
  const { data: events = [], isLoading, isError } = useEvents();
  const deleteEvent = useDeleteEvent();

  const handleDelete = (id: number) => {
    if (confirm("Yakin ingin menghapus event ini?")) {
      deleteEvent.mutate(id);
    }
  };

  // ── Filter ──
  const filtered = events.filter((e: Event) =>
    e.event_title.toLowerCase().includes(search.toLowerCase()) ||
    e.category.toLowerCase().includes(search.toLowerCase())
  );

  const upcoming = filtered.filter((e: Event) => e.status_event === "Mendatang");
  const done = filtered.filter((e: Event) => e.status_event === "Selesai");

  const totalPeserta = events
    .filter((e: Event) => e.registered !== undefined)
    .reduce((sum: number, e: Event) => sum + (e.registered ?? 0), 0);

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar />

      <div className="flex-1 ml-72 flex flex-col min-h-screen">
        <AdminHeader title="Kelola Event" />

        <main className="flex-1 p-8 space-y-6">

          {/* ── Stat Cards ── */}
          <div className="grid grid-cols-4 gap-5">
            <StatCard label="Total Event" value={isLoading ? "..." : events.length} sub="Semua event" />
            <StatCard label="Event Mendatang" value={isLoading ? "..." : events.filter((e: Event) => e.status_event === "Mendatang").length} sub="Event aktif" accent="border-teal-400" />
            <StatCard label="Event Selesai" value={isLoading ? "..." : events.filter((e: Event) => e.status_event === "Selesai").length} sub="Event berlangsung" />
            <StatCard label="Total Peserta" value={isLoading ? "..." : totalPeserta} sub="Total peserta" accent="border-blue-400" />
          </div>

          {/* ── Manajemen Event ── */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-gray-800">Manajemen Event</h2>
                <p className="text-sm text-gray-400">Kelola semua data acara</p>
              </div>
              <button className="flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white px-5 py-2.5 rounded-xl font-medium text-sm transition-colors shadow-sm">
                <span className="text-lg leading-none">+</span>
                Buat Event Baru
              </button>
            </div>

            {/* Search */}
            <div className="flex items-center bg-gray-50 border border-gray-100 rounded-xl px-4 py-2.5 gap-2">
              <span className="text-gray-400">🔍</span>
              <input
                type="text"
                placeholder="Cari event..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="bg-transparent outline-none w-full text-sm text-gray-700 placeholder-gray-400"
              />
            </div>

            {/* ── Loading State ── */}
            {isLoading && (
              <div className="space-y-6">
                <div>
                  <div className="h-4 bg-gray-200 rounded w-32 mb-4 animate-pulse" />
                  <div className="grid grid-cols-3 gap-4">
                    {[1, 2, 3].map((i) => <CardSkeleton key={i} />)}
                  </div>
                </div>
              </div>
            )}

            {/* ── Error State ── */}
            {isError && (
              <div className="text-center py-12">
                <p className="text-4xl mb-3">⚠️</p>
                <p className="text-sm text-red-500 font-medium">Gagal memuat data event</p>
                <p className="text-xs text-gray-400 mt-1">Pastikan server backend sudah berjalan</p>
              </div>
            )}

            {/* ── Data ── */}
            {!isLoading && !isError && (
              <>
                {/* Event Mendatang */}
                {upcoming.length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 mb-4">
                      <span>📅</span>
                      <h3 className="font-semibold text-gray-700">Event Mendatang</h3>
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      {upcoming.map((e: Event) => (
                        <EventCardUpcoming key={e.id} event={e} onDelete={handleDelete} />
                      ))}
                    </div>
                  </div>
                )}

                {/* Event Selesai */}
                {done.length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 mb-4">
                      <span>🕐</span>
                      <h3 className="font-semibold text-gray-700">Event Selesai</h3>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      {done.map((e: Event) => (
                        <EventCardDone key={e.id} event={e} onDelete={handleDelete} />
                      ))}
                    </div>
                  </div>
                )}

                {/* Empty state */}
                {filtered.length === 0 && (
                  <div className="text-center py-12 text-gray-400">
                    <p className="text-4xl mb-3">📭</p>
                    <p className="text-sm">Tidak ada event ditemukan</p>
                  </div>
                )}
              </>
            )}
          </div>

          <p className="text-center text-xs text-gray-400 pb-4">
            © 2026 QR Event Attendance System - Pesantren
          </p>
        </main>
      </div>
    </div>
  );
}