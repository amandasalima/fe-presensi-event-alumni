"use client";

import { useState } from "react";
import AdminSidebar from "@/app/components/AdminSidebar";
import AdminHeader from "@/app/components/AdminHeader";
import { useEvents } from "@/hooks/admin/useEvents";
import { useBroadcast, useCreateBroadcast, useDeleteBroadcast } from "@/hooks/admin/useBroadcast";

// ─── Types ────────────────────────────────────────────────────────────────────
interface BroadcastItem {
  id: number;
  title: string;
  event_title?: string;
  created_at: string;
  recipient_count: number;
  status: "Terkirim" | "Pending" | "Gagal";
  message?: string;
}

interface Event {
  id: number;
  event_title: string;
  event_datetime: string;
  location: string;
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────
function TableSkeleton() {
  return (
    <>
      {[1, 2, 3].map((i) => (
        <tr key={i} className="border-b animate-pulse">
          {[1, 2, 3, 4, 5, 6, 7].map((j) => (
            <td key={j} className="p-5">
              <div className="h-4 bg-gray-100 rounded w-3/4" />
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function BroadcastPage() {
  const [title, setTitle] = useState("");
  const [selectedEventId, setSelectedEventId] = useState<number | null>(null);
  const [message, setMessage] = useState("");

  // ── TanStack Query ──
  const { data: events = [], isLoading: loadingEvents } = useEvents();
  const { data: broadcasts = [], isLoading: loadingBroadcast } = useBroadcast();
  const createBroadcast = useCreateBroadcast();
  const deleteBroadcast = useDeleteBroadcast();

  // ── Selected event detail ──
  const selectedEvent = events.find((e: Event) => e.id === selectedEventId) ?? null;

  // ── Auto fill preview message when event selected ──
  const previewMessage = selectedEvent
    ? `Assalamualaikum Alumni 👋\n\nKami mengundang Anda untuk menghadiri kegiatan *${selectedEvent.event_title}*\n\n📅 ${new Date(selectedEvent.event_datetime).toLocaleDateString("id-ID", { day: "2-digit", month: "long", year: "numeric" })}\n🕗 ${new Date(selectedEvent.event_datetime).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })} WIB\n📍 ${selectedEvent.location}\n\nSilakan lakukan presensi menggunakan QR Code saat acara berlangsung.`
    : message;

  // ── Stats ──
  const totalBroadcast = broadcasts.length;
  const totalTerkirim = broadcasts.reduce(
    (sum: number, b: BroadcastItem) => sum + (b.recipient_count ?? 0), 0
  );

  const handleSend = () => {
    if (!title || !message) return;
    createBroadcast.mutate(
      {
        title,
        event_id: selectedEventId,
        message,
      },
      {
        onSuccess: () => {
          setTitle("");
          setSelectedEventId(null);
          setMessage("");
        },
      }
    );
  };

  const handleDelete = (id: number) => {
    if (confirm("Yakin ingin menghapus riwayat broadcast ini?")) {
      deleteBroadcast.mutate(id);
    }
  };

  return (
    <div className="h-screen bg-gray-100 flex overflow-hidden">
      <AdminSidebar />

      <div className="flex-1 ml-72 flex flex-col h-screen">
        <AdminHeader title="Broadcast WhatsApp" />

        <main className="flex-1 overflow-y-auto p-8">

          {/* ── Stat Cards ── */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-3xl p-7 border-2 border-cyan-400">
              <p className="text-gray-500 text-lg">Total Broadcast</p>
              <h2 className="text-5xl font-bold mt-3 text-gray-800">
                {loadingBroadcast ? "..." : totalBroadcast}
              </h2>
              <p className="text-teal-500 mt-2 text-sm">Total pesan yang pernah dikirim</p>
            </div>

            <div className="bg-white rounded-3xl p-7 border-2 border-green-400">
              <p className="text-gray-500 text-lg">Pesan Terkirim</p>
              <h2 className="text-5xl font-bold mt-3 text-gray-800">
                {loadingBroadcast ? "..." : totalTerkirim.toLocaleString("id-ID")}
              </h2>
              <p className="text-green-500 mt-2 text-sm">WhatsApp berhasil dikirim</p>
            </div>

            <div className="bg-white rounded-3xl p-7 border-2 border-purple-400">
              <p className="text-gray-500 text-lg">Status API</p>
              <h2 className="text-3xl font-bold mt-3 text-green-600 flex items-center gap-2">
                <span className="w-3 h-3 bg-green-500 rounded-full inline-block animate-pulse" />
                Connected
              </h2>
              <p className="text-gray-400 mt-2 text-sm">WhatsApp API aktif</p>
            </div>
          </div>

          {/* ── Form Broadcast ── */}
          <div className="bg-white rounded-3xl shadow-sm overflow-hidden mb-8">
            {/* Header */}
            <div className="p-8 bg-cyan-50 flex items-center justify-between">
              <div>
                <h2 className="text-4xl font-bold">Kirim Broadcast</h2>
                <p className="text-gray-500 mt-2">Kirim informasi event kepada alumni</p>
              </div>
              <button
                onClick={handleSend}
                disabled={createBroadcast.isPending || !title || !message}
                className="px-6 py-3 bg-gradient-to-r from-teal-500 to-cyan-500 text-white rounded-2xl font-semibold shadow hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {createBroadcast.isPending ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Mengirim...
                  </>
                ) : (
                  "📤 Kirim Sekarang"
                )}
              </button>
            </div>

            {/* Error */}
            {createBroadcast.isError && (
              <div className="mx-8 mt-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-xl text-sm flex items-center gap-2">
                <span>⚠️</span>
                {(createBroadcast.error as Error)?.message || "Gagal mengirim broadcast"}
              </div>
            )}

            {/* Success */}
            {createBroadcast.isSuccess && (
              <div className="mx-8 mt-4 p-3 bg-green-50 border border-green-200 text-green-600 rounded-xl text-sm flex items-center gap-2">
                <span>✅</span>
                Broadcast berhasil dikirim!
              </div>
            )}

            {/* Form */}
            <div className="p-8 grid grid-cols-1 xl:grid-cols-2 gap-8">

              {/* Left: Form input */}
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Judul Broadcast</label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Masukkan judul pesan"
                    className="w-full px-5 py-4 border border-gray-200 rounded-2xl outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Pilih Event <span className="text-gray-400 font-normal">(Opsional)</span>
                  </label>
                  <div className="relative">
                    <select
                      value={selectedEventId ?? ""}
                      onChange={(e) => setSelectedEventId(Number(e.target.value) || null)}
                      disabled={loadingEvents}
                      className="w-full appearance-none px-5 py-4 border border-gray-200 rounded-2xl outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100 text-sm bg-white cursor-pointer disabled:bg-gray-50"
                    >
                      <option value="">-- Pilih event untuk isi otomatis --</option>
                      {events.map((e: Event) => (
                        <option key={e.id} value={e.id}>{e.event_title}</option>
                      ))}
                    </select>
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">▾</span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Isi Pesan</label>
                  <textarea
                    rows={10}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Tulis pesan WhatsApp..."
                    className="w-full px-5 py-4 border border-gray-200 rounded-2xl outline-none resize-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100 text-sm"
                  />
                  <p className="text-xs text-gray-400 mt-1">
                    Variabel tersedia: {"{nama}"}, {"{event_title}"}, {"{event_date}"}, {"{event_time}"}, {"{event_location}"}
                  </p>
                </div>
              </div>

              {/* Right: Preview */}
              <div className="bg-gradient-to-br from-teal-600 to-cyan-600 rounded-3xl p-8 text-white flex flex-col justify-between">
                <div>
                  <h2 className="text-2xl font-bold mb-1">Preview Pesan</h2>
                  <p className="text-cyan-100 text-sm mb-6">Tampilan pesan WhatsApp</p>

                  {/* WA bubble */}
                  <div className="bg-white text-gray-700 rounded-3xl p-6 shadow-lg">
                    {selectedEvent ? (
                      <>
                        <p className="font-bold text-lg mb-3">Assalamualaikum Alumni 👋</p>
                        <p className="mb-3 text-sm">
                          Kami mengundang Anda untuk menghadiri kegiatan{" "}
                          <span className="font-semibold text-cyan-600">{selectedEvent.event_title}</span>
                        </p>
                        <div className="space-y-1.5 text-sm mb-3 text-gray-600">
                          <p>📅 {new Date(selectedEvent.event_datetime).toLocaleDateString("id-ID", { day: "2-digit", month: "long", year: "numeric" })}</p>
                          <p>🕗 {new Date(selectedEvent.event_datetime).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })} WIB</p>
                          <p>📍 {selectedEvent.location}</p>
                        </div>
                        <p className="text-sm">Silakan lakukan presensi menggunakan QR Code saat acara berlangsung.</p>
                      </>
                    ) : message ? (
                      <p className="text-sm whitespace-pre-line">{message}</p>
                    ) : (
                      <p className="text-gray-400 text-sm italic">Tulis pesan atau pilih event untuk melihat preview...</p>
                    )}
                  </div>
                </div>

                <div className="mt-6 p-4 bg-white/10 rounded-2xl">
                  <p className="text-xs text-cyan-100">
                    Broadcast terhubung langsung dengan WhatsApp API secara real-time.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* ── Riwayat Broadcast ── */}
          <div className="bg-white rounded-3xl shadow-sm overflow-hidden">
            <div className="p-8 bg-cyan-50">
              <h2 className="text-4xl font-bold">Riwayat Broadcast</h2>
              <p className="text-gray-500 mt-2">Daftar pesan yang pernah dikirim</p>
            </div>

            <div className="p-8 overflow-x-auto">
              <table className="w-full">
                <thead className="bg-cyan-100">
                  <tr>
                    {["No", "Judul", "Event", "Tanggal", "Penerima", "Status", "Aksi"].map((h) => (
                      <th key={h} className="text-left p-5 text-sm font-semibold text-gray-700">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {loadingBroadcast ? (
                    <TableSkeleton />
                  ) : broadcasts.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="text-center py-12 text-gray-400">
                        <p className="text-3xl mb-2">💬</p>
                        <p className="text-sm">Belum ada riwayat broadcast</p>
                      </td>
                    </tr>
                  ) : (
                    broadcasts.map((item: BroadcastItem, index: number) => (
                      <tr key={item.id} className="border-b hover:bg-gray-50 transition-colors">
                        <td className="p-5 text-gray-500 text-sm">{index + 1}</td>
                        <td className="p-5 font-semibold text-gray-800">{item.title}</td>
                        <td className="p-5 text-gray-500 text-sm">{item.event_title ?? "-"}</td>
                        <td className="p-5 text-gray-500 text-sm">
                          {new Date(item.created_at).toLocaleDateString("id-ID", {
                            day: "2-digit", month: "long", year: "numeric",
                          })}
                        </td>
                        <td className="p-5 text-gray-500 text-sm">{item.recipient_count} Alumni</td>
                        <td className="p-5">
                          <span className={`px-3 py-1.5 rounded-xl text-xs font-semibold ${
                            item.status === "Terkirim"
                              ? "bg-green-100 text-green-700"
                              : item.status === "Gagal"
                              ? "bg-red-100 text-red-600"
                              : "bg-yellow-100 text-yellow-700"
                          }`}>
                            {item.status}
                          </span>
                        </td>
                        <td className="p-5">
                          <div className="flex gap-3 text-lg">
                            <button className="hover:opacity-70 transition-opacity" title="Lihat detail">👁️</button>
                            <button
                              onClick={() => handleDelete(item.id)}
                              disabled={deleteBroadcast.isPending}
                              className="hover:opacity-70 transition-opacity disabled:opacity-30"
                              title="Hapus"
                            >
                              🗑️
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <footer className="mt-10 text-center text-gray-400 text-xs pb-4">
            © 2026 QR Event Attendance System - Pesantren
          </footer>
        </main>
      </div>
    </div>
  );
}