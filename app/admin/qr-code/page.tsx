"use client";

import { useState } from "react";
import AdminSidebar from "@/app/components/AdminSidebar";
import AdminHeader from "@/app/components/AdminHeader";
import { useEvents, useGenerateQR } from "@/hooks/admin/useEvents";

// ─── Types ────────────────────────────────────────────────────────────────────
interface Event {
  id: number;
  event_title: string;
  event_datetime: string;
  location: string;
  category: string;
  qr_code_image?: string; // base64 atau URL dari Laravel
  qr_token?: string;
}

// ─── QR Placeholder SVG ───────────────────────────────────────────────────────
function QRPlaceholder({ size = 120, muted = false }: { size?: number; muted?: boolean }) {
  const color = muted ? "#d1d5db" : "#0d9488";
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="5" y="5" width="35" height="35" rx="4" stroke={color} strokeWidth="5" fill="none" />
      <rect x="14" y="14" width="17" height="17" rx="2" fill={color} />
      <rect x="60" y="5" width="35" height="35" rx="4" stroke={color} strokeWidth="5" fill="none" />
      <rect x="69" y="14" width="17" height="17" rx="2" fill={color} />
      <rect x="5" y="60" width="35" height="35" rx="4" stroke={color} strokeWidth="5" fill="none" />
      <rect x="14" y="69" width="17" height="17" rx="2" fill={color} />
      <rect x="60" y="60" width="8" height="8" rx="1" fill={color} />
      <rect x="74" y="60" width="8" height="8" rx="1" fill={color} />
      <rect x="88" y="60" width="8" height="8" rx="1" fill={color} />
      <rect x="60" y="74" width="8" height="8" rx="1" fill={color} />
      <rect x="74" y="74" width="8" height="8" rx="1" fill={color} />
      <rect x="88" y="88" width="8" height="8" rx="1" fill={color} />
      <rect x="60" y="88" width="8" height="8" rx="1" fill={color} />
    </svg>
  );
}

// ─── QR Display (real image atau placeholder) ─────────────────────────────────
function QRDisplay({ src, size }: { src?: string; size: number }) {
  if (src) {
    return (
      <img
        src={src}
        alt="QR Code"
        width={size}
        height={size}
        className="rounded-lg"
      />
    );
  }
  return <QRPlaceholder size={size} />;
}

// ─── Riwayat Card ─────────────────────────────────────────────────────────────
function RiwayatCard({ event, onClick }: { event: Event; onClick: () => void }) {
  const date = new Date(event.event_datetime).toLocaleDateString("id-ID", {
    day: "2-digit", month: "short", year: "numeric",
  });

  return (
    <button
      onClick={onClick}
      className="group bg-white border border-gray-100 rounded-2xl p-4 flex flex-col items-center gap-3 hover:border-teal-300 hover:shadow-md transition-all duration-200 text-left w-full"
    >
      <div className="w-full aspect-square bg-gray-50 rounded-xl flex items-center justify-center group-hover:bg-teal-50 transition-colors overflow-hidden">
        {event.qr_code_image ? (
          <img src={event.qr_code_image} alt="QR" className="w-full h-full object-contain p-2" />
        ) : (
          <QRPlaceholder size={70} muted />
        )}
      </div>
      <div className="w-full">
        <p className="text-xs font-semibold text-gray-700 truncate">{event.event_title}</p>
        <p className="text-xs text-gray-400 mt-0.5 flex items-center gap-1">
          <span>📅</span> {date}
        </p>
      </div>
    </button>
  );
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────
function RiwayatSkeleton() {
  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-4 animate-pulse">
      <div className="w-full aspect-square bg-gray-100 rounded-xl mb-3" />
      <div className="h-3 bg-gray-200 rounded w-3/4 mb-1.5" />
      <div className="h-3 bg-gray-100 rounded w-1/2" />
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function GenerateQRPage() {
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [generatedEvent, setGeneratedEvent] = useState<Event | null>(null);

  // ── TanStack Query ──
  const { data: events = [], isLoading: loadingEvents } = useEvents();
  const generateQR = useGenerateQR();

  // ── Selected event detail ──
  const selected = events.find((e: Event) => e.id === selectedId) ?? null;

  // ── Riwayat: event yang sudah punya qr_token ──
  const riwayat = events.filter((e: Event) => !!e.qr_token);

  const handleGenerate = () => {
    if (!selectedId) return;
    generateQR.mutate(selectedId, {
      onSuccess: (data: Event) => {
        setGeneratedEvent(data);
      },
    });
  };

  const handleRiwayatClick = (event: Event) => {
    setSelectedId(event.id);
    setGeneratedEvent(event);
  };

  const handleDownload = (type: "png" | "pdf") => {
    if (!generatedEvent?.qr_code_image) return;
    const link = document.createElement("a");
    link.href = generatedEvent.qr_code_image;
    link.download = `QR-${generatedEvent.event_title}.${type}`;
    link.click();
  };

  const formatDate = (datetime: string) => {
    return new Date(datetime).toLocaleDateString("id-ID", {
      day: "2-digit", month: "long", year: "numeric",
    });
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar />

      <div className="flex-1 ml-72 flex flex-col min-h-screen">
        <AdminHeader title="Generate QR" />

        <main className="flex-1 p-8 space-y-6">

          {/* ── Hero Banner ── */}
          <div className="bg-gradient-to-r from-teal-600 to-cyan-500 rounded-2xl p-7 flex items-center gap-5 shadow-sm">
            <div className="bg-white/20 rounded-xl p-3">
              <QRPlaceholder size={36} />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">Generator QR Code Event</h2>
              <p className="text-teal-100 text-sm mt-1">
                Generate QR Code unik untuk setiap event dengan kualitas tinggi
              </p>
            </div>
          </div>

          {/* ── Two Column ── */}
          <div className="grid grid-cols-5 gap-5">

            {/* Left: Pilih Event */}
            <div className="col-span-2 bg-white border border-gray-100 rounded-2xl p-6 shadow-sm flex flex-col gap-5">
              <div>
                <h3 className="text-base font-semibold text-gray-800">Pilih Event</h3>
                <p className="text-sm text-gray-400 mt-0.5">Pilih event untuk generate QR Code</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Event</label>
                <div className="relative">
                  <select
                    value={selectedId ?? ""}
                    onChange={(e) => {
                      setSelectedId(Number(e.target.value) || null);
                      setGeneratedEvent(null);
                    }}
                    disabled={loadingEvents}
                    className="w-full appearance-none border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-700 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent cursor-pointer disabled:bg-gray-100"
                  >
                    <option value="">Pilih event...</option>
                    {events.map((e: Event) => (
                      <option key={e.id} value={e.id}>{e.event_title}</option>
                    ))}
                  </select>
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">▾</span>
                </div>
              </div>

              {/* Detail event terpilih */}
              {selected && (
                <div className="bg-teal-50 border border-teal-100 rounded-xl p-4 space-y-1.5 text-sm">
                  <p className="font-semibold text-teal-800">{selected.event_title}</p>
                  <p className="text-teal-600 flex items-center gap-1.5">
                    <span>📅</span> {formatDate(selected.event_datetime)}
                  </p>
                  <p className="text-teal-600 flex items-center gap-1.5">
                    <span>📍</span> {selected.location}
                  </p>
                  <span className="inline-block text-xs bg-teal-100 text-teal-700 px-2.5 py-0.5 rounded-full">
                    {selected.category}
                  </span>
                  {selected.qr_token && (
                    <p className="text-xs text-teal-500 flex items-center gap-1 mt-1">
                      <span>✓</span> QR sudah pernah di-generate
                    </p>
                  )}
                </div>
              )}

              {/* Error */}
              {generateQR.isError && (
                <div className="p-3 bg-red-50 border border-red-100 text-red-500 rounded-xl text-xs flex items-center gap-2">
                  <span>⚠️</span>
                  {(generateQR.error as Error)?.message || "Gagal generate QR Code"}
                </div>
              )}

              {/* Generate Button */}
              <button
                onClick={handleGenerate}
                disabled={!selectedId || generateQR.isPending}
                className="w-full mt-auto bg-teal-600 hover:bg-teal-700 disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed text-white font-medium py-3 rounded-xl text-sm transition-all duration-200 flex items-center justify-center gap-2"
              >
                {generateQR.isPending ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <span>⚡</span>
                    Generate QR Code
                  </>
                )}
              </button>
            </div>

            {/* Right: Preview */}
            <div className="col-span-3 bg-white border border-gray-100 rounded-2xl p-6 shadow-sm flex flex-col">
              <div className="mb-5">
                <h3 className="text-base font-semibold text-gray-800">Preview & Download QR Code</h3>
                <p className="text-sm text-gray-400 mt-0.5">QR Code siap untuk di-scan dan digunakan</p>
              </div>

              {!generatedEvent ? (
                <div className="flex-1 flex flex-col items-center justify-center gap-4 py-10">
                  <div className="opacity-20">
                    <QRPlaceholder size={110} muted />
                  </div>
                  <div className="text-center">
                    <p className="font-semibold text-gray-500 text-lg">Belum Ada QR Code</p>
                    <p className="text-sm text-gray-400 mt-1 max-w-xs">
                      Pilih event terlebih dahulu dari dropdown di sebelah kiri untuk generate QR Code
                    </p>
                  </div>
                </div>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center gap-6">
                  {/* QR display */}
                  <div className="relative">
                    <div className="w-52 h-52 bg-white border-2 border-teal-200 rounded-2xl flex items-center justify-center shadow-lg p-4">
                      <QRDisplay src={generatedEvent.qr_code_image} size={160} />
                    </div>
                    <span className="absolute -top-2 -right-2 bg-teal-500 text-white text-xs px-2.5 py-1 rounded-full font-medium shadow">
                      ✓ Siap
                    </span>
                  </div>

                  {/* Event info */}
                  <div className="text-center">
                    <p className="font-semibold text-gray-800">{generatedEvent.event_title}</p>
                    <p className="text-sm text-gray-400 mt-0.5">
                      {formatDate(generatedEvent.event_datetime)} • {generatedEvent.location}
                    </p>
                  </div>

                  {/* Download buttons */}
                  <div className="flex gap-3">
                    <button
                      onClick={() => handleDownload("png")}
                      className="flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white px-5 py-2.5 rounded-xl text-sm font-medium transition-colors"
                    >
                      <span>⬇</span> Download PNG
                    </button>
                    <button
                      onClick={() => handleDownload("pdf")}
                      className="flex items-center gap-2 border border-teal-200 text-teal-600 hover:bg-teal-50 px-5 py-2.5 rounded-xl text-sm font-medium transition-colors"
                    >
                      <span>📄</span> Download PDF
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* ── Riwayat QR Code ── */}
          <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
            <div className="mb-5">
              <h3 className="text-base font-semibold text-gray-800">Riwayat QR Code</h3>
              <p className="text-sm text-gray-400 mt-0.5">QR Code yang pernah di-generate untuk semua event</p>
            </div>
            <div className="grid grid-cols-5 gap-4">
              {loadingEvents ? (
                [1, 2, 3, 4, 5].map((i) => <RiwayatSkeleton key={i} />)
              ) : riwayat.length === 0 ? (
                <div className="col-span-5 text-center py-8 text-gray-400">
                  <p className="text-3xl mb-2">📭</p>
                  <p className="text-sm">Belum ada QR Code yang pernah di-generate</p>
                </div>
              ) : (
                riwayat.map((event: Event) => (
                  <RiwayatCard
                    key={event.id}
                    event={event}
                    onClick={() => handleRiwayatClick(event)}
                  />
                ))
              )}
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