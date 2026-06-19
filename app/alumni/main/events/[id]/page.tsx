"use client";

import { use, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Calendar,
  MapPin,
  Users,
  Clock,
  ArrowLeft,
  CheckCircle,
  AlertCircle,
  Loader2,
  Tag,
} from "lucide-react";
import {
  useAlumniEventDetail,
  useRegisterEvent,
  useCancelRegistration,
} from "@/hooks/alumni/queries/events";
import { getApiErrorMessage, getImageUrl } from "@/lib/api";

function formatDate(dateStr: string) {
  if (!dateStr) return "-";

  return new Date(dateStr).toLocaleDateString("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function formatTime(timeStr: string) {
  if (!timeStr) return "";
  const parts = timeStr.split(":");
  if (parts.length >= 2) {
    return `${parts[0]}:${parts[1]}`;
  }
  return timeStr;
}

function Skeleton({ className }: { className: string }) {
  return <div className={`bg-gray-200 rounded-xl animate-pulse ${className}`} />;
}

function Toast({
  type,
  message,
}: {
  type: "success" | "error";
  message: string;
}) {
  return (
    <div
      className={`fixed bottom-24 left-1/2 w-[calc(100%-1.5rem)] max-w-sm -translate-x-1/2 z-50 flex items-center gap-2.5 px-4 py-3.5 rounded-2xl shadow-xl text-sm font-medium text-white transition-all ${
        type === "success" ? "bg-[#41A07E]" : "bg-red-500"
      }`}
    >
      {type === "success" ? (
        <CheckCircle size={16} />
      ) : (
        <AlertCircle size={16} />
      )}
      {message}
    </div>
  );
}

export default function EventDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const eventId = parseInt(id, 10);

  const { data, isLoading, isError } = useAlumniEventDetail(eventId);
  const registerEvent = useRegisterEvent();
  const cancelRegistration = useCancelRegistration();

  const [toast, setToast] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);
  const [currentTime] = useState(() => Date.now());

  const event = data?.event;
  const attendanceStatus = data?.attendance_status || event?.attendance_status;

  function showToast(type: "success" | "error", message: string) {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3000);
  }

  function handleRegister() {
    registerEvent.mutate(eventId, {
      onSuccess: () => {
        showToast("success", "Berhasil mendaftar event!");
      },
      onError: (error: unknown) => {
        showToast("error", getApiErrorMessage(error, "Pendaftaran event belum berhasil. Silakan coba lagi."));
      },
    });
  }

  function handleCancelRegistration() {
    if (
      !confirm(
        "Apakah Anda yakin ingin membatalkan pendaftaran event ini?"
      )
    ) {
      return;
    }

    cancelRegistration.mutate(eventId, {
      onSuccess: () => {
        showToast("success", "Pendaftaran berhasil dibatalkan");
      },
      onError: (error: unknown) => {
        showToast("error", getApiErrorMessage(error, "Pendaftaran belum berhasil dibatalkan. Silakan coba lagi."));
      },
    });
  }

  if (isLoading) {
    return (
      <div className="space-y-5">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="p-2 hover:bg-gray-50 rounded-xl transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <div>
            <Skeleton className="h-6 w-48 mb-1" />
            <Skeleton className="h-4 w-32" />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm space-y-4">
          <Skeleton className="h-48 w-full rounded-xl" />
          <Skeleton className="h-6 w-3/4" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-12 w-full rounded-xl" />
        </div>
      </div>
    );
  }

  if (isError || !event) {
    return (
      <div className="space-y-5">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="p-2 hover:bg-gray-50 rounded-xl transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Detail Event</h1>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-8 text-center border border-gray-100 shadow-sm">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-3" />
          <p className="font-semibold text-gray-800 mb-1">
            Event Tidak Ditemukan
          </p>
          <p className="text-sm text-gray-500 mb-4">
            Event yang Anda cari tidak tersedia atau sudah dihapus
          </p>
          <button
            onClick={() => router.back()}
            className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-[#41A07E] hover:bg-[#357f65]"
          >
            Kembali
          </button>
        </div>
      </div>
    );
  }

  const isRegistered = event.is_registered === true;
  const isAttended = ["present", "attended", "hadir"].includes(
    String(attendanceStatus || "").toLowerCase()
  );
  const description = event.description || event.event_description;
  const quota = Number(event.quota || 0);
  const remainingQuota =
    typeof event.remaining_quota === "number" ? event.remaining_quota : quota;
  const quotaFull = quota > 0 && remainingQuota <= 0;
  const eventDateTime = event.event_datetime || event.event_date;
  const isEventDone =
    event.status_event === "Selesai" ||
    (eventDateTime ? new Date(eventDateTime).getTime() < currentTime : false);
  const registerDisabled = registerEvent.isPending || quotaFull || isEventDone;

  return (
    <div className="space-y-5 pb-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => router.back()}
          className="p-2 hover:bg-gray-50 rounded-xl transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </button>
        <div className="min-w-0">
          <h1 className="text-xl font-bold text-gray-900">Detail Event</h1>
          <p className="text-xs text-gray-400 mt-0.5 truncate">
            Informasi lengkap event alumni
          </p>
        </div>
      </div>

      {/* Event Card */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {/* Poster Image */}
        {event.poster_url && (
          <div className="w-full h-56 bg-gray-100">
            <img
              src={getImageUrl(event.poster_url)}
              alt={event.event_title}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        <div className="p-5 space-y-4">
          {/* Kategori & Status */}
          <div className="flex items-start justify-between gap-2">
            <span className="text-[10px] bg-slate-100 text-slate-600 px-3 py-1 rounded-full font-medium flex items-center gap-1.5">
              <Tag className="w-3 h-3" />
              {event.category?.category_name || "Umum"}
            </span>

            {isAttended ? (
              <span className="text-[10px] bg-[#B2DE96] text-[#41A07E] border border-[#B2DE96] px-3 py-1 rounded-full font-bold flex items-center gap-1">
                <CheckCircle className="w-3 h-3" />
                Hadir
              </span>
            ) : isRegistered ? (
              <span className="text-[10px] bg-blue-50 text-blue-600 border border-blue-100 px-3 py-1 rounded-full font-bold">
                Terdaftar
              </span>
            ) : (
              <span className="text-[10px] bg-amber-50 text-amber-600 border border-amber-100 px-3 py-1 rounded-full font-semibold">
                Belum Terdaftar
              </span>
            )}
          </div>

          {/* Judul */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 leading-tight">
              {event.event_title}
            </h2>
          </div>

          {/* Deskripsi */}
          {description && (
            <div className="border-t border-gray-50 pt-4">
              <h3 className="text-sm font-semibold text-gray-700 mb-2">
                Deskripsi Event
              </h3>
              <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">
                {description}
              </p>
            </div>
          )}

          {/* Info Detail */}
          <div className="border-t border-gray-50 pt-4 space-y-3">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">
              Informasi Event
            </h3>

            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-[#B2DE96]/20 flex items-center justify-center flex-shrink-0">
                  <Calendar className="w-4 h-4 text-[#41A07E]" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-gray-400 mb-0.5">Tanggal</p>
                  <p className="text-sm font-medium text-gray-800">
                    {formatDate(event.event_date)}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-[#B2DE96]/20 flex items-center justify-center flex-shrink-0">
                  <Clock className="w-4 h-4 text-[#41A07E]" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-gray-400 mb-0.5">Waktu</p>
                  <p className="text-sm font-medium text-gray-800">
                    {formatTime(event.start_time)} - {formatTime(event.end_time)}{" "}
                    WIB
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-[#B2DE96]/20 flex items-center justify-center flex-shrink-0">
                  <MapPin className="w-4 h-4 text-[#41A07E]" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-gray-400 mb-0.5">Lokasi</p>
                  <p className="text-sm font-medium text-gray-800">
                    {event.location}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-[#B2DE96]/20 flex items-center justify-center flex-shrink-0">
                  <Users className="w-4 h-4 text-[#41A07E]" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-gray-400 mb-0.5">Kuota</p>
                  <p className="text-sm font-medium text-gray-800">
                    {quota > 0
                      ? `Sisa ${remainingQuota} dari ${quota} peserta`
                      : "Kuota tidak dibatasi"}
                  </p>
                  {quota > 0 && quotaFull && !isRegistered && (
                    <p className="text-xs text-red-500 mt-1">
                      Kuota sudah penuh
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Status Kehadiran Info */}
          {(isRegistered || isEventDone) && (
            <div className="border-t border-gray-50 pt-4">
              <div
                className={`rounded-xl p-4 ${
                  isAttended
                    ? "bg-[#B2DE96]/20 border border-[#B2DE96]/30"
                    : isEventDone
                    ? "bg-gray-50 border border-gray-100"
                    : "bg-blue-50 border border-blue-100"
                }`}
              >
                <div className="flex items-start gap-3">
                  {isAttended ? (
                    <CheckCircle className="w-5 h-5 text-[#41A07E] flex-shrink-0 mt-0.5" />
                  ) : (
                    <AlertCircle
                      className={`w-5 h-5 flex-shrink-0 mt-0.5 ${
                        isEventDone ? "text-gray-500" : "text-blue-600"
                      }`}
                    />
                  )}
                  <div className="min-w-0">
                    <p
                      className={`text-sm font-semibold ${
                        isAttended
                          ? "text-[#41A07E]"
                          : isEventDone
                          ? "text-gray-700"
                          : "text-blue-700"
                      }`}
                    >
                      {isAttended
                        ? "Anda Sudah Hadir"
                        : isEventDone
                        ? "Event Sudah Selesai"
                        : "Anda Sudah Terdaftar"}
                    </p>
                    <p
                      className={`text-xs mt-1 leading-relaxed ${
                        isAttended
                          ? "text-[#357f65]"
                          : isEventDone
                          ? "text-gray-500"
                          : "text-blue-600"
                      }`}
                    >
                      {isAttended
                        ? "Terima kasih telah menghadiri event ini. Presensi Anda sudah tercatat."
                        : isEventDone
                        ? "Pendaftaran dan pembatalan tidak tersedia untuk event yang sudah selesai."
                        : "Jangan lupa scan QR code saat event dimulai untuk konfirmasi kehadiran Anda."}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="border-t border-gray-50 pt-4 space-y-2">
            {!isRegistered ? (
              <button
                onClick={handleRegister}
                disabled={registerDisabled}
                className="w-full rounded-xl bg-[#41A07E] py-3.5 text-sm font-semibold text-white shadow-md shadow-[#B2DE96]/30 transition-colors hover:bg-[#357f65] active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {registerEvent.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Memproses...
                  </>
                ) : isEventDone ? (
                  "Event Selesai"
                ) : quotaFull ? (
                  "Kuota Penuh"
                ) : (
                  "Daftar Event"
                )}
              </button>
            ) : (
              <>
                {!isAttended && !isEventDone && (
                  <button
                    onClick={handleCancelRegistration}
                    disabled={cancelRegistration.isPending}
                    className="w-full rounded-xl bg-white border-2 border-red-200 py-3 text-sm font-semibold text-red-600 transition-colors hover:bg-red-50 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {cancelRegistration.isPending ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Memproses...
                      </>
                    ) : (
                      "Batal Daftar"
                    )}
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {toast && <Toast type={toast.type} message={toast.message} />}
    </div>
  );
}
