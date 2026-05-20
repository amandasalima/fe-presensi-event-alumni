"use client";

import { useState } from "react";
import AdminSidebar from "@/app/components/AdminSidebar";
import AdminHeader from "@/app/components/AdminHeader";
import { useEvents } from "@/hooks/admin/useEvents";
import { usePresences } from "@/hooks/admin/usePresences";

// ─── Types ────────────────────────────────────────────────────────────────────
interface Event {
  id: number;
  event_title: string;
  event_datetime: string;
  status_event: "Mendatang" | "Selesai";
  quota?: number;
}

interface Presence {
  id: number;
  user_id: number;
  event_id: number;
  scanned_at: string;
  user?: {
    first_name: string;
    last_name: string;
    email: string;
  };
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function formatDate(datetime: string) {
  return new Date(datetime).toLocaleDateString("id-ID", {
    day: "2-digit", month: "long", year: "numeric",
  });
}

function formatTime(datetime: string) {
  return new Date(datetime).toLocaleTimeString("id-ID", {
    hour: "2-digit", minute: "2-digit",
  });
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────
function TableSkeleton({ cols }: { cols: number }) {
  return (
    <>
      {[1, 2, 3, 4].map((i) => (
        <tr key={i} className="border-b animate-pulse">
          {Array.from({ length: cols }).map((_, j) => (
            <td key={j} className="px-5 py-4">
              <div className="h-4 bg-gray-100 rounded w-3/4" />
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function ReportsPage() {
  const [selectedId, setSelectedId] = useState<number | null>(null);

  // ── TanStack Query ──
  const { data: events = [], isLoading: loadingEvents } = useEvents();
  const { data: allPresences = [], isLoading: loadingPresences } = usePresences();
  const { data: detailPresences = [], isLoading: loadingDetail } = usePresences(
    selectedId ?? undefined
  );

  // ── Selected event ──
  const selected = events.find((e: Event) => e.id === selectedId) ?? null;

  // ── Stats ──
  const selesai = events.filter((e: Event) => e.status_event === "Selesai").length;
  const totalHadir = allPresences.length;
  const avgRate = events.length > 0
    ? Math.round(
        events.reduce((sum: number, e: Event) => {
          const hadir = allPresences.filter((p: Presence) => p.event_id === e.id).length;
          const rate = e.quota ? (hadir / e.quota) * 100 : 0;
          return sum + rate;
        }, 0) / events.length
      )
    : 0;

  // ── Per event attendance count ──
  const getHadir = (eventId: number) =>
    allPresences.filter((p: Presence) => p.event_id === eventId).length;

  const getRate = (eventId: number, quota?: number) => {
    if (!quota) return 0;
    return Math.round((getHadir(eventId) / quota) * 100);
  };

  // ── Download handler ──
  const handleDownload = (format: "PDF" | "Excel" | "CSV") => {
    if (!selectedId) return;
    window.open(
      `${process.env.NEXT_PUBLIC_API_URL}/Reports/${selectedId}/download?format=${format.toLowerCase()}`,
      "_blank"
    );
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar />
      <div className="flex-1 ml-72 flex flex-col min-h-screen">
        <AdminHeader title="Kehadiran" />

        <main className="flex-1 p-8 space-y-6">

          {/* ── Hero ── */}
          <div className="bg-linear-to-r from-teal-600 to-cyan-500 rounded-2xl p-7 flex items-center gap-5 shadow-sm">
            <div className="bg-white/20 rounded-xl p-3 text-2xl">📋</div>
            <div>
              <h2 className="text-2xl font-bold text-white">Laporan Kehadiran</h2>
              <p className="text-teal-100 text-sm mt-1">
                Pilih event dan download laporan kehadiran dalam format CSV, Excel, atau PDF
              </p>
            </div>
          </div>

          {/* ── Stat Cards ── */}
          <div className="grid grid-cols-3 gap-5">
            {[
              {
                icon: "📅", label: "Total", accent: "border-teal-400",
                value: loadingEvents ? "..." : selesai,
                sub: "Event Terlaksana",
              },
              {
                icon: "👥", label: "Peserta", accent: "border-cyan-400",
                value: loadingPresences ? "..." : totalHadir,
                sub: "Total Kehadiran",
              },
              {
                icon: "📈", label: "Rate", accent: "border-emerald-400",
                value: loadingEvents || loadingPresences ? "..." : `${avgRate}%`,
                sub: "Rata-rata Kehadiran",
              },
            ].map((s, i) => (
              <div key={i} className={`bg-white border-l-4 ${s.accent} rounded-2xl p-6 shadow-sm flex items-start gap-4`}>
                <span className="text-3xl">{s.icon}</span>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <p className="text-4xl font-bold text-gray-800">{s.value}</p>
                    <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">{s.label}</span>
                  </div>
                  <p className="text-sm text-gray-400 mt-1">{s.sub}</p>
                </div>
              </div>
            ))}
          </div>

          {/* ── Pilih Event ── */}
          <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm space-y-4">
            <div>
              <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                <span className="text-teal-500">📅</span> Pilih Event untuk Download Laporan
              </h3>
              <p className="text-sm text-gray-400 mt-0.5">
                Pilih event tertentu untuk melihat detail dan download laporan kehadiran
              </p>
            </div>

            <div className="relative">
              <select
                value={selectedId ?? ""}
                onChange={(e) => setSelectedId(Number(e.target.value) || null)}
                disabled={loadingEvents}
                className="w-full appearance-none border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-700 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-teal-400 cursor-pointer disabled:bg-gray-100"
              >
                <option value="">-- Pilih Event --</option>
                {events.map((e: Event) => (
                  <option key={e.id} value={e.id}>
                    {e.event_title} — {formatDate(e.event_datetime)}
                  </option>
                ))}
              </select>
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">▾</span>
            </div>

            {/* Detail event terpilih */}
            {selected && (
              <div className="border border-teal-100 rounded-2xl overflow-hidden">
                {/* Header detail */}
                <div className="bg-teal-50 px-5 py-4 flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-teal-800">{selected.event_title}</p>
                    <p className="text-sm text-teal-600 mt-0.5">
                      📅 {formatDate(selected.event_datetime)}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    {(["PDF", "Excel", "CSV"] as const).map((f) => (
                      <button
                        key={f}
                        onClick={() => handleDownload(f)}
                        className="text-xs bg-teal-600 hover:bg-teal-700 text-white px-3 py-1.5 rounded-lg font-medium transition-colors"
                      >
                        ⬇ {f}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Detail table */}
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-100">
                        {["Nama", "Email", "Waktu Scan", "Status"].map((h) => (
                          <th key={h} className="text-left px-5 py-3 text-gray-500 font-medium">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {loadingDetail ? (
                        <TableSkeleton cols={4} />
                      ) : detailPresences.length === 0 ? (
                        <tr>
                          <td colSpan={4} className="text-center py-8 text-gray-400 text-sm">
                            Belum ada data kehadiran untuk event ini
                          </td>
                        </tr>
                      ) : (
                        detailPresences.map((p: Presence, i: number) => (
                          <tr key={i} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                            <td className="px-5 py-3 font-medium text-gray-800">
                              {p.user ? `${p.user.first_name} ${p.user.last_name}` : `User #${p.user_id}`}
                            </td>
                            <td className="px-5 py-3 text-gray-500">{p.user?.email ?? "-"}</td>
                            <td className="px-5 py-3 text-gray-500">{formatTime(p.scanned_at)}</td>
                            <td className="px-5 py-3">
                              <span className="text-xs px-2.5 py-1 rounded-full font-medium bg-teal-50 text-teal-600 border border-teal-200">
                                Hadir
                              </span>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>

          {/* ── Semua Event Table ── */}
          <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
            <div className="mb-5">
              <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                <span className="text-teal-500">📅</span> Semua Event
              </h3>
              <p className="text-sm text-gray-400 mt-0.5">
                Ringkasan kehadiran semua event yang telah berlangsung
              </p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-teal-50">
                    {["Event", "Tanggal", "Hadir", "Tingkat Kehadiran", "Status"].map((h, i) => (
                      <th key={h} className={`text-left px-5 py-3.5 text-teal-700 font-semibold ${i === 0 ? "rounded-l-xl" : ""} ${i === 4 ? "rounded-r-xl" : ""}`}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {loadingEvents || loadingPresences ? (
                    <TableSkeleton cols={5} />
                  ) : events.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="text-center py-10 text-gray-400 text-sm">
                        <p className="text-3xl mb-2">📭</p>
                        Belum ada data event
                      </td>
                    </tr>
                  ) : (
                    events.map((e: Event) => {
                      const hadir = getHadir(e.id);
                      const rate = getRate(e.id, e.quota);
                      return (
                        <tr
                          key={e.id}
                          className="border-b border-gray-50 hover:bg-gray-50 transition-colors cursor-pointer"
                          onClick={() => setSelectedId(e.id)}
                        >
                          <td className="px-5 py-4 font-medium text-gray-800">{e.event_title}</td>
                          <td className="px-5 py-4 text-gray-500">{formatDate(e.event_datetime)}</td>
                          <td className="px-5 py-4 font-bold text-teal-600">{hadir}</td>
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-28 bg-gray-100 rounded-full h-2">
                                <div
                                  className="bg-teal-500 h-2 rounded-full transition-all"
                                  style={{ width: `${rate}%` }}
                                />
                              </div>
                              <span className="text-sm text-gray-600 font-medium">{rate}%</span>
                            </div>
                          </td>
                          <td className="px-5 py-4">
                            <span className={`text-xs px-3 py-1.5 rounded-full font-medium border ${
                              e.status_event === "Mendatang"
                                ? "bg-teal-50 text-teal-600 border-teal-200"
                                : "bg-gray-50 text-gray-500 border-gray-200"
                            }`}>
                              {e.status_event}
                            </span>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <p className="text-center text-xs text-gray-400 pb-4">
            © 2026 QR Event Attendance System - Pesantren
          </p>
        </main>
      </div>
    </div>
  );
}