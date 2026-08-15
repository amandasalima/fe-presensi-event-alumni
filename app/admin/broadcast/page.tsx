"use client";

import { useMemo, useState } from "react";
import {
  Clipboard,
  ClipboardCheck,
  Info,
  MessageCircle,
  Plus,
  Trash2,
} from "lucide-react";
import AdminLayout from "@/app/components/AdminLayout";
import {
  FormInput,
  FormSelect,
  FormTextarea,
} from "@/app/components/FormControl";
import { getApiErrorMessage } from "@/lib/api";
import {
  type EventBroadcastTarget,
  useEventBroadcastPreview,
} from "@/hooks/admin/useBroadcast";
import { useEvents, type Event } from "@/hooks/admin/useEvents";
import {
  parseWhatsappNumbers,
  sanitizeBroadcastMessage,
} from "../events/_utils/eventFormatters";

function StatCard({
  label,
  value,
  sub,
}: {
  label: string;
  value: string | number;
  sub: string;
}) {
  return (
    <div className="rounded-2xl border border-[#0D5C3A]/10 bg-white p-4 shadow-sm shadow-[#0D5C3A]/5">
      <p className="text-xs text-[#0D5C3A]/60">{label}</p>
      <p className="mt-1 text-3xl font-bold text-[#0D5C3A]">{value}</p>
      <p className="mt-1 text-xs text-[#0D5C3A]/50">{sub}</p>
    </div>
  );
}

function formatEventDate(event: Event | null) {
  const dateSource = event?.event_date || event?.event_datetime;

  if (!dateSource) return "-";

  const date = new Date(dateSource);

  if (Number.isNaN(date.getTime())) return "-";

  return date.toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

const targetDescriptions: Record<
  EventBroadcastTarget,
  { label: string; description: string }
> = {
  all: {
    label: "Semua alumni",
    description:
      "Pesan massal akan dikirim ke seluruh alumni yang memiliki nomor HP valid.",
  },
  registered: {
    label: "Terdaftar event",
    description:
      "Pesan massal hanya dikirim ke alumni yang sudah terdaftar pada event yang dipilih.",
  },
  custom: {
    label: "Nomor manual",
    description:
      "Pesan massal hanya dikirim ke daftar nomor yang Anda masukkan satu per satu.",
  },
};

export default function BroadcastPage() {
  const [selectedEventId, setSelectedEventId] = useState<number | null>(null);
  const [target, setTarget] = useState<EventBroadcastTarget>("all");
  const [manualNumbers, setManualNumbers] = useState([""]);
  const [customMessage, setCustomMessage] = useState("");
  const [copyStatus, setCopyStatus] = useState<"message" | "numbers" | "">("");

  const { data: events = [], isLoading: loadingEvents } = useEvents();
  const selectedEvent =
    events.find((event: Event) => event.id === selectedEventId) ?? null;
  const numbersInput = useMemo(() => manualNumbers.join("\n"), [manualNumbers]);
  const parsedNumbers = useMemo(
    () => parseWhatsappNumbers(numbersInput),
    [numbersInput],
  );
  const previewParams = useMemo(
    () => ({
      target,
      ...(target === "custom" ? { numbers: parsedNumbers.validNumbers } : {}),
      custom_message: customMessage.trim() || null,
    }),
    [target, parsedNumbers.validNumbers, customMessage],
  );
  const preview = useEventBroadcastPreview(selectedEventId, previewParams);
  const previewData = preview.data;
  const previewMessage = sanitizeBroadcastMessage(previewData?.message) || "";
  const estimatedTargets =
    target === "custom"
      ? parsedNumbers.validNumbers.length
      : (previewData?.total_targets ?? 0);
  const isMessageTooLong = customMessage.length > 1000;
  const messageToSend = customMessage.trim() || previewMessage;

  const resetResult = () => setCopyStatus("");

  const copyToClipboard = async (
    value: string,
    status: "message" | "numbers",
  ) => {
    if (!value) return;

    try {
      await navigator.clipboard.writeText(value);
      setCopyStatus(status);
      window.setTimeout(() => setCopyStatus(""), 2500);
    } catch {
      setCopyStatus("");
    }
  };

  const openWhatsApp = (phoneNumber?: string) => {
    if (!messageToSend) return;
    const normalizedNumber = phoneNumber?.replace(/\D/g, "");
    const baseUrl = normalizedNumber
      ? `https://wa.me/${normalizedNumber}`
      : "https://wa.me/";
    window.open(
      `${baseUrl}?text=${encodeURIComponent(messageToSend)}`,
      "_blank",
      "noopener,noreferrer",
    );
  };

  const updateManualNumber = (index: number, value: string) => {
    resetResult();
    setManualNumbers((current) =>
      current.map((number, itemIndex) =>
        itemIndex === index ? value.replace(/[^\d+\s-]/g, "") : number,
      ),
    );
  };

  const addManualNumber = () => {
    setManualNumbers((current) => [...current, ""]);
  };

  const removeManualNumber = (index: number) => {
    resetResult();
    setManualNumbers((current) => {
      const next = current.filter((_, itemIndex) => itemIndex !== index);
      return next.length > 0 ? next : [""];
    });
  };

  return (
    <AdminLayout title="Pesan Massal WhatsApp">
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mb-5">
        <StatCard
          label="Alumni dengan no HP"
          value={
            preview.isLoading ? "..." : (previewData?.breakdown.total_all ?? 0)
          }
          sub="Alumni dengan nomor HP valid"
        />
        <StatCard
          label="Terdaftar Event"
          value={
            preview.isLoading
              ? "..."
              : (previewData?.breakdown.total_registered ?? 0)
          }
          sub="Alumni yang sudah daftar"
        />
        <StatCard
          label="Nomor Manual"
          value={parsedNumbers.validNumbers.length}
          sub={
            parsedNumbers.invalidCount > 0
              ? `${parsedNumbers.invalidCount} tidak valid`
              : "Target khusus"
          }
        />
        <StatCard
          label="Estimasi Penerima"
          value={preview.isLoading ? "..." : estimatedTargets}
          sub="Target pesan massal saat ini"
        />
      </div>

      <div className="rounded-2xl border border-[#0D5C3A]/10 bg-white shadow-sm shadow-[#0D5C3A]/5">
        <div className="flex items-center justify-between border-b border-[#0D5C3A]/10 px-5 py-4">
          <div>
            <h2 className="text-base font-bold text-[#0D5C3A]">
              Pesan WhatsApp Event
            </h2>
            <p className="text-xs text-[#0D5C3A]/60">
              Mode kirim manual: pesan tidak akan dikirim otomatis oleh sistem.
            </p>
          </div>
        </div>

        <div className="space-y-5 p-5">
          <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
            {/* Dropdown Event */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Event
              </label>

              <div className="relative">
                <FormSelect
                  value={selectedEventId ?? ""}
                  onChange={(event) => {
                    resetResult();
                    setSelectedEventId(Number(event.target.value) || null);
                  }}
                  disabled={loadingEvents}
                  className="w-full appearance-none rounded-xl border border-[#0D5C3A]/20 bg-[#F1F8F4] px-4 py-2.5 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-[#0D5C3A] cursor-pointer disabled:cursor-not-allowed disabled:bg-gray-100"
                >
                  <option value="">
                    {loadingEvents ? "Memuat event..." : "Pilih event"}
                  </option>

                  {events.map((event: Event) => (
                    <option key={event.id} value={event.id}>
                      {event.event_title}
                    </option>
                  ))}
                </FormSelect>

                <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">
                  ▾
                </span>
              </div>

              <p className="mt-1 text-xs text-gray-400">
                {selectedEvent
                  ? `${formatEventDate(selectedEvent)} - ${selectedEvent.location}`
                  : "Pesan massal wajib dikaitkan dengan event."}
              </p>
            </div>

            {/* Dropdown Target Penerima */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Target Penerima
              </label>

              <div className="relative">
                <FormSelect
                  value={target}
                  onChange={(event) => {
                    resetResult();
                    setTarget(event.target.value as EventBroadcastTarget);
                  }}
                  className="w-full appearance-none rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-[#7AB2B2] cursor-pointer"
                >
                  <option value="all">Semua alumni yang punya nomor HP</option>

                  <option value="registered">
                    Alumni yang sudah daftar event
                  </option>

                  <option value="custom">Nomor manual</option>
                </FormSelect>

                <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">
                  ▾
                </span>
              </div>

              <div className="mt-3 flex gap-3 rounded-xl border border-[#0D5C3A]/20 bg-[#E8F5E9] p-3 text-sm text-[#0D5C3A]">
                <Info className="mt-0.5 h-4 w-4 shrink-0" />

                <div>
                  <p className="font-medium">
                    {targetDescriptions[target].label}
                  </p>

                  <p className="mt-0.5 text-xs text-[#0D5C3A]/70">
                    {targetDescriptions[target].description}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {target === "custom" && (
            <div>
              <div className="mb-2 flex items-center justify-between gap-3">
                <label className="block text-sm font-medium text-gray-700">
                  Nomor HP Tujuan
                </label>
                <button
                  type="button"
                  onClick={addManualNumber}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-[#D4AF37] bg-[#D4AF37]/10 px-3 py-1.5 text-xs font-semibold text-[#9A7A1A] transition-colors hover:bg-[#D4AF37]/20"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Tambah
                </button>
              </div>
              <div className="grid grid-cols-1 gap-2 xl:grid-cols-2">
                {manualNumbers.map((number, index) => (
                  <div
                    key={`manual-number-${index}`}
                    className="flex items-center gap-2"
                  >
                    <FormInput
                      type="tel"
                      value={number}
                      onChange={(event) =>
                        updateManualNumber(index, event.target.value)
                      }
                      placeholder={`Nomor ${index + 1}, contoh: 081234567890`}
                      className="w-full rounded-xl border border-[#0D5C3A]/20 bg-[#F1F8F4] px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#0D5C3A]"
                    />
                    <button
                      type="button"
                      onClick={() => removeManualNumber(index)}
                      aria-label={`Hapus nomor ${index + 1}`}
                      className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-red-100 text-red-500 transition-colors hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                      disabled={manualNumbers.length === 1 && !number.trim()}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
              <p className="mt-1 text-xs text-gray-400">
                Nomor valid: {parsedNumbers.validNumbers.length}
                {parsedNumbers.invalidCount > 0
                  ? `, tidak valid: ${parsedNumbers.invalidCount}`
                  : ""}
              </p>
              {parsedNumbers.validNumbers.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {parsedNumbers.validNumbers.map((number) => (
                    <button
                      key={number}
                      type="button"
                      onClick={() => openWhatsApp(number)}
                      disabled={!messageToSend}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-green-200 bg-green-50 px-3 py-1.5 text-xs font-medium text-green-700 transition-colors hover:bg-green-100 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <MessageCircle className="h-3.5 w-3.5" />
                      Buka chat {number}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          <div className="grid grid-cols-1 gap-4 xl:grid-cols-2 xl:items-start">
            <div className="flex h-full min-h-[430px] flex-col">
              <div className="mb-2 flex items-center justify-between">
                <label className="block text-sm font-medium text-gray-700">
                  Pesan Khusus
                </label>
                <span
                  className={`text-xs ${
                    isMessageTooLong ? "text-red-500" : "text-gray-400"
                  }`}
                >
                  {customMessage.length}/1000
                </span>
              </div>
              <FormTextarea
                value={customMessage}
                onChange={(event) => {
                  resetResult();
                  setCustomMessage(event.target.value);
                }}
                placeholder="Kosongkan jika ingin memakai template default"
                rows={12}
                className="min-h-[360px] w-full flex-1 resize-none rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#7AB2B2]"
              />
              {isMessageTooLong && (
                <p className="mt-1 text-xs text-red-500">
                  Pesan khusus maksimal 1000 karakter.
                </p>
              )}
            </div>

            <div className="space-y-4">
              <div className="flex h-full min-h-[430px] flex-col">
                <div className="mb-2 flex items-center justify-between">
                  <label className="block text-sm font-medium text-gray-700">
                    Pratinjau Pesan
                  </label>
                  <span className="rounded-full border border-[#D4AF37] bg-[#D4AF37]/10 px-2 py-0.5 text-xs font-medium text-[#9A7A1A]">
                    {target}
                  </span>
                </div>
                <div className="min-h-[360px] flex-1 overflow-y-auto whitespace-pre-wrap rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700">
                  {!selectedEventId
                    ? "Pilih event untuk melihat pratinjau."
                    : target === "custom" &&
                        parsedNumbers.validNumbers.length === 0
                      ? "Masukkan nomor manual untuk menghitung target khusus."
                      : preview.isLoading
                        ? "Memuat pratinjau..."
                        : preview.isError
                          ? getApiErrorMessage(
                              preview.error,
                              "Gagal memuat pratinjau",
                            )
                          : previewMessage || "Pratinjau belum tersedia"}
                </div>
                <div className="mt-3 rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800">
                  Pesan dapat diedit melalui kolom{" "}
                  <span className="font-medium">Pesan Khusus</span>. Setelah itu
                  salin atau buka WhatsApp; sistem tidak mengirim pesan secara
                  otomatis.
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => copyToClipboard(messageToSend, "message")}
                    disabled={!messageToSend}
                    className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#0D5C3A] to-[#0A4D30] hover:from-[#0A4D30] hover:to-[#073D26] px-4 py-2.5 text-sm font-semibold text-white transition-all shadow-md shadow-[#0D5C3A]/20 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {copyStatus === "message" ? (
                      <ClipboardCheck className="h-4 w-4" />
                    ) : (
                      <Clipboard className="h-4 w-4" />
                    )}
                    {copyStatus === "message"
                      ? "Pesan tersalin"
                      : "Salin Pesan"}
                  </button>
                  <button
                    type="button"
                    onClick={() => openWhatsApp()}
                    disabled={!messageToSend}
                    className="inline-flex items-center gap-2 rounded-xl border border-green-200 bg-green-50 px-4 py-2.5 text-sm font-medium text-green-700 transition-colors hover:bg-green-100 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <MessageCircle className="h-4 w-4" />
                    Buka WhatsApp
                  </button>
                  {target === "custom" && (
                    <button
                      type="button"
                      onClick={() =>
                        copyToClipboard(
                          parsedNumbers.validNumbers.join("\n"),
                          "numbers",
                        )
                      }
                      disabled={parsedNumbers.validNumbers.length === 0}
                      className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {copyStatus === "numbers" ? (
                        <ClipboardCheck className="h-4 w-4" />
                      ) : (
                        <Clipboard className="h-4 w-4" />
                      )}
                      {copyStatus === "numbers"
                        ? "Nomor tersalin"
                        : "Salin Nomor"}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <p className="mt-6 pb-4 text-center text-xs text-[#0D5C3A]/40">
        © 2026 Sistem Presensi Event - Pondok Pesantren Al-Qur&apos;an Al-Falah
      </p>
    </AdminLayout>
  );
}
