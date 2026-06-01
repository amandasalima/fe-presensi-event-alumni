"use client";

import { useParams, useRouter } from "next/navigation";
import {
  useAlumniEventDetail,
  useRegisterEvent,
  useCancelRegistration,
} from "@/hooks/alumni/useAlumniHooks";
import { getImageUrl } from "@/lib/api";
import {
  ArrowLeft,
  Calendar,
  MapPin,
  Users,
  Tag,
  CheckCircle,
  AlertTriangle,
  Loader2,
} from "lucide-react";
import { useState } from "react";

function formatDate(dateStr: string) {
  if (!dateStr) return "";
  return new Date(dateStr).toLocaleDateString("id-ID", {
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

function getMessage(value: unknown) {
  if (
    value &&
    typeof value === "object" &&
    "message" in value &&
    typeof value.message === "string"
  ) {
    return value.message;
  }

  return null;
}

export default function AlumniEventDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = Number(params.id);

  const { data, isLoading, error } = useAlumniEventDetail(id);
  const registerMutation = useRegisterEvent();
  const cancelMutation = useCancelRegistration();

  const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

  if (isLoading) {
    return (
      <div className="space-y-4 py-10 text-center">
        <Loader2 className="w-8 h-8 text-teal-600 animate-spin mx-auto" />
        <p className="text-sm text-gray-500">Memuat detail event...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="bg-white rounded-2xl p-6 text-center shadow-sm border border-gray-100 space-y-4">
        <AlertTriangle className="w-10 h-10 text-amber-500 mx-auto" />
        <h3 className="font-bold text-gray-800">Event Tidak Ditemukan</h3>
        <p className="text-xs text-gray-500">
          Maaf, data event tidak berhasil dimuat atau event tersebut tidak terdaftar di sistem.
        </p>
        <button
          onClick={() => router.push("/alumni/main/events")}
          className="bg-teal-600 text-white text-xs font-semibold px-4 py-2 rounded-xl"
        >
          Kembali ke Daftar Event
        </button>
      </div>
    );
  }

  const { event, remaining_quota, is_registered: isRegistered, registration } = data;

  const handleRegister = () => {
    setMessage(null);
    registerMutation.mutate(id, {
      onSuccess: (res: unknown) => {
        setMessage({
          text: getMessage(res) || "Berhasil mendaftar event! Sampai jumpa di lokasi.",
          type: "success",
        });
      },
      onError: (err: unknown) => {
        setMessage({
          text: getMessage(err) || "Gagal mendaftar ke event ini.",
          type: "error",
        });
      },
    });
  };

  const handleCancel = () => {
    setMessage(null);
    cancelMutation.mutate(id, {
      onSuccess: (res: unknown) => {
        setMessage({
          text: getMessage(res) || "Pendaftaran event berhasil dibatalkan.",
          type: "success",
        });
      },
      onError: (err: unknown) => {
        setMessage({
          text: getMessage(err) || "Gagal membatalkan pendaftaran.",
          type: "error",
        });
      },
    });
  };

  const isAttended = registration?.status === "attended";
  const isMutationLoading = registerMutation.isPending || cancelMutation.isPending;

  return (
    <div className="space-y-5 pb-6">
      {/* Tombol Back */}
      <button
        onClick={() => router.push("/alumni/main/events")}
        className="flex items-center gap-2 text-gray-500 hover:text-gray-700 text-sm font-semibold transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Kembali ke Event</span>
      </button>

      {/* Konten Utama Detail */}
      <div className="bg-white rounded-3xl overflow-hidden border border-gray-100 shadow-sm">
        {/* Cover Pattern / Image / Gradient */}
        {event?.poster_url ? (
          <div className="h-48 sm:h-56 relative w-full px-4 sm:px-6 flex items-end pb-4 bg-gray-100">
            <img src={getImageUrl(event.poster_url)} alt={event.event_title || "Event Poster"} className="absolute inset-0 w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
            <span className="relative z-10 min-w-0 max-w-full text-[10px] bg-white/20 text-white px-3 py-1 rounded-full font-medium backdrop-blur-sm flex items-center gap-1">
              <Tag className="w-3 h-3" />
              <span className="truncate">{event?.category?.category_name || "Kategori"}</span>
            </span>
          </div>
        ) : (
          <div className="h-28 bg-gradient-to-br from-teal-500 to-emerald-600 px-4 sm:px-6 flex items-end pb-4">
            <span className="min-w-0 max-w-full text-[10px] bg-white/20 text-white px-3 py-1 rounded-full font-medium backdrop-blur-sm flex items-center gap-1">
              <Tag className="w-3 h-3" />
              <span className="truncate">{event?.category?.category_name || "Kategori"}</span>
            </span>
          </div>
        )}

        {/* Info Event */}
        <div className="p-4 sm:p-6 space-y-5">
          <div className="space-y-2">
            <h1 className="text-xl font-bold text-gray-800 leading-snug">
              {event?.event_title}
            </h1>
            <p className="text-xs text-gray-400">
              Dibuat pada {formatDate(event?.created_at)}
            </p>
          </div>

          {/* Alert Message */}
          {message && (
            <div
              className={`p-3.5 rounded-xl text-xs font-semibold leading-relaxed border ${
                message.type === "success"
                  ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                  : "bg-red-50 text-red-700 border-red-100"
              }`}
            >
              {message.text}
            </div>
          )}

          {/* Status Pendaftaran Banner */}
          {isRegistered && (
            <div
              className={`p-4 rounded-2xl flex items-start gap-3 border ${
                isAttended
                  ? "bg-emerald-50 text-emerald-800 border-emerald-100"
                  : "bg-teal-50 text-teal-800 border-teal-100"
              }`}
            >
              <CheckCircle className={`w-5 h-5 flex-shrink-0 mt-0.5 ${isAttended ? "text-emerald-600" : "text-teal-600"}`} />
              <div className="space-y-0.5">
                <p className="text-xs font-bold">
                  {isAttended ? "Kehadiran Terverifikasi" : "Pendaftaran Terdaftar"}
                </p>
                <p className="text-[11px] opacity-80 leading-relaxed">
                  {isAttended
                    ? "Anda telah tercatat hadir pada event ini via scan QR Code. Terima kasih!"
                    : `Anda telah terdaftar pada event ini sejak ${formatDate(registration?.registered_at)}.`}
                </p>
              </div>
            </div>
          )}

          {/* Informasi Detail / Metadata */}
          <div className="space-y-3.5 bg-gray-50/50 rounded-2xl p-4 border border-gray-50">
            <div className="flex items-start gap-3 text-xs text-gray-600">
              <Calendar className="w-4 h-4 text-teal-600 flex-shrink-0 mt-0.5" />
              <div className="space-y-0.5">
                <p className="font-semibold text-gray-700">Waktu Pelaksanaan</p>
                <p className="text-gray-500">
                  {formatDate(event?.event_date)}
                </p>
                <p className="text-gray-400 font-medium">
                  Pukul {formatTime(event?.start_time)} - {formatTime(event?.end_time)} WIB
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 text-xs text-gray-600">
              <MapPin className="w-4 h-4 text-teal-600 flex-shrink-0 mt-0.5" />
              <div className="space-y-0.5">
                <p className="font-semibold text-gray-700">Tempat / Lokasi</p>
                <p className="text-gray-500">{event?.location}</p>
              </div>
            </div>

            <div className="flex items-start gap-3 text-xs text-gray-600">
              <Users className="w-4 h-4 text-teal-600 flex-shrink-0 mt-0.5" />
              <div className="space-y-0.5">
                <p className="font-semibold text-gray-700">Informasi Kuota</p>
                {event?.quota ? (
                  <>
                    <p className="text-gray-500">
                      Tersedia untuk {event.quota} alumni
                    </p>
                    <p className="text-gray-400 font-medium">
                      Sisa kuota pendaftaran saat ini: {remaining_quota} tempat
                    </p>
                  </>
                ) : (
                  <p className="text-gray-500">
                    Kuota pendaftaran tidak dibatasi
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Deskripsi Acara */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold text-gray-700 uppercase tracking-wider">
              Deskripsi Kegiatan
            </h3>
            <p className="text-xs text-gray-500 leading-relaxed whitespace-pre-line">
              {event?.description || event?.event_description || "Tidak ada deskripsi tambahan untuk event ini."}
            </p>
          </div>

          {/* Tombol Aksi */}
          <div className="pt-2">
            {isAttended ? (
              <button
                disabled
                className="w-full bg-gray-100 text-gray-400 text-sm font-bold py-3 rounded-2xl cursor-not-allowed flex items-center justify-center gap-1.5"
              >
                <CheckCircle className="w-4 h-4" />
                <span>Anda Sudah Hadir</span>
              </button>
            ) : isRegistered ? (
              <button
                onClick={handleCancel}
                disabled={isMutationLoading}
                className="w-full bg-red-50 hover:bg-red-100 text-red-600 text-sm font-bold py-3 rounded-2xl transition flex items-center justify-center gap-1.5 disabled:opacity-50"
              >
                {isMutationLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <span>Batalkan Pendaftaran</span>
                )}
              </button>
            ) : (!event?.quota || remaining_quota > 0) ? (
              <button
                onClick={handleRegister}
                disabled={isMutationLoading}
                className="w-full bg-gradient-to-r from-teal-500 to-emerald-500 text-white text-sm font-bold py-3 rounded-2xl hover:opacity-90 transition flex items-center justify-center gap-1.5 disabled:opacity-50 shadow-sm"
              >
                {isMutationLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <span>Daftar Event Sekarang</span>
                )}
              </button>
            ) : (
              <button
                disabled
                className="w-full bg-gray-100 text-gray-400 text-sm font-bold py-3 rounded-2xl cursor-not-allowed"
              >
                Kuota Sudah Penuh
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
