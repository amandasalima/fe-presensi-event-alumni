"use client";

import { useMemo, useState } from "react";
import { Info, Plus, Trash2 } from "lucide-react";
import AdminSidebar from "@/app/components/AdminSidebar";
import AdminHeader from "@/app/components/AdminHeader";
import { FormInput, FormSelect, FormTextarea } from "@/app/components/FormControl";
import { ApiError, getApiErrorMessage } from "@/lib/api";
import {
	type EventBroadcastTarget,
	useEventBroadcastPreview,
	useSendEventBroadcast,
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
		<div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
			<p className="text-xs text-gray-500">{label}</p>
			<p className="mt-1 text-3xl font-bold text-gray-800">{value}</p>
			<p className="mt-1 text-xs text-gray-400">{sub}</p>
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

type BroadcastDebugDetail = {
	totalSent?: number;
	fonnte?: unknown;
	senderStatus?: unknown;
	blockedReason?: unknown;
};

function getBroadcastDebugDetail(source: unknown): BroadcastDebugDetail | null {
	const payload =
		source instanceof ApiError
			? (source.data as Record<string, unknown> | null)
			: (source as Record<string, unknown> | null);

	if (!payload || typeof payload !== "object") return null;

	const data =
		payload.data && typeof payload.data === "object"
			? (payload.data as Record<string, unknown>)
			: {};
	const detail = {
		fonnte: data.fonnte ?? payload.fonnte,
		senderStatus: data.sender_status ?? payload.sender_status,
		blockedReason: data.blocked_reason ?? payload.blocked_reason,
	};

	if (
		detail.fonnte === undefined &&
		detail.senderStatus === undefined &&
		detail.blockedReason === undefined
	) {
		return null;
	}

	return detail;
}

const targetDescriptions: Record<
	EventBroadcastTarget,
	{ label: string; description: string }
> = {
	all: {
		label: "Semua alumni",
		description:
			"Broadcast akan dikirim ke seluruh alumni yang memiliki nomor HP valid.",
	},
	registered: {
		label: "Terdaftar event",
		description:
			"Broadcast hanya dikirim ke alumni yang sudah terdaftar pada event yang dipilih.",
	},
	custom: {
		label: "Nomor manual",
		description:
			"Broadcast hanya dikirim ke daftar nomor yang Anda input satu per satu.",
	},
};

export default function BroadcastPage() {
	const [selectedEventId, setSelectedEventId] = useState<number | null>(null);
	const [target, setTarget] = useState<EventBroadcastTarget>("all");
	const [manualNumbers, setManualNumbers] = useState([""]);
	const [customMessage, setCustomMessage] = useState("");
	const [successMessage, setSuccessMessage] = useState("");
	const [errorMessage, setErrorMessage] = useState("");
	const [sendDetail, setSendDetail] = useState<{
		totalSent: number;
		fonnte?: unknown;
		senderStatus?: unknown;
		blockedReason?: unknown;
	} | null>(null);

	const { data: events = [], isLoading: loadingEvents } = useEvents();
	const sendBroadcast = useSendEventBroadcast();
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
			...(target === "custom"
				? { numbers: parsedNumbers.validNumbers }
				: {}),
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
	const isSubmitDisabled =
		!selectedEventId ||
		sendBroadcast.isPending ||
		isMessageTooLong ||
		(target === "custom" && parsedNumbers.validNumbers.length === 0);

	const resetResult = () => {
		setSuccessMessage("");
		setErrorMessage("");
		setSendDetail(null);
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

	const handleSubmit = () => {
		resetResult();

		if (!selectedEventId || isSubmitDisabled) return;

		const confirmed = confirm(
			`Kirim broadcast WhatsApp?\n\nTarget: ${targetDescriptions[target].label}\nJumlah penerima: ${estimatedTargets}\nEvent: ${
				selectedEvent?.event_title ?? "-"
			}`,
		);

		if (!confirmed) return;

		sendBroadcast.mutate(
			{
				eventId: selectedEventId,
				payload: {
					target,
					...(target === "custom"
						? { numbers: parsedNumbers.validNumbers }
						: {}),
					custom_message: customMessage.trim() || previewMessage || null,
				},
			},
			{
				onSuccess: (response) => {
					const totalSent = response.data?.total_sent ?? 0;
					setSuccessMessage(
						`${response.message || "Broadcast berhasil dikirim"} Total terkirim: ${totalSent}.`,
					);
					setSendDetail({
						totalSent,
						fonnte: response.data?.fonnte ?? response.fonnte,
						senderStatus:
							response.data?.sender_status ?? response.sender_status,
						blockedReason:
							response.data?.blocked_reason ?? response.blocked_reason,
					});
				},
				onError: (error) => {
					setErrorMessage(getApiErrorMessage(error, "Gagal mengirim broadcast"));
					const detail = getBroadcastDebugDetail(error);
					if (detail) {
						setSendDetail({
							totalSent: 0,
							...detail,
						});
					}
				},
			},
		);
	};

	return (
		<div className="h-screen bg-gray-100 flex overflow-hidden">
			<AdminSidebar />

			<div className="flex-1 ml-56 flex flex-col h-screen">
				<AdminHeader title="Broadcast WhatsApp" />

				<main className="flex-1 overflow-y-auto p-5">
					<div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mb-5">
						<StatCard
							label="Alumni dengan no HP"
							value={
								preview.isLoading
									? "..."
									: (previewData?.breakdown.total_all ?? 0)
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
									: "Target custom"
							}
						/>
						<StatCard
							label="Estimasi Penerima"
							value={preview.isLoading ? "..." : estimatedTargets}
							sub="Target broadcast saat ini"
						/>
					</div>

					<div className="rounded-2xl border border-gray-100 bg-white shadow-sm">
						<div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
							<div>
								<h2 className="text-base font-bold text-gray-800">
									Kirim Broadcast Event
								</h2>
								<p className="text-xs text-gray-400">
									Preview dan pengiriman memakai endpoint admin event.
								</p>
							</div>
							<button
								type="button"
								onClick={handleSubmit}
								disabled={isSubmitDisabled}
								className="flex items-center gap-2 rounded-xl bg-[#2D7EA0] px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#236175] disabled:cursor-not-allowed disabled:opacity-60"
							>
								{sendBroadcast.isPending ? (
									<>
										<span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
										Mengirim...
									</>
								) : (
									"Kirim Broadcast"
								)}
							</button>
						</div>

						<div className="grid grid-cols-1 gap-4 p-5 xl:grid-cols-2">
							<div className="space-y-4">
								<div>
									<label className="mb-2 block text-sm font-medium text-gray-700">
										Event
									</label>
									<FormSelect
										value={selectedEventId ?? ""}
										onChange={(event) => {
											resetResult();
											setSelectedEventId(Number(event.target.value) || null);
										}}
										disabled={loadingEvents}
										className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#7AB2B2] disabled:cursor-not-allowed disabled:bg-gray-100"
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
									<p className="mt-1 text-xs text-gray-400">
										{selectedEvent
											? `${formatEventDate(selectedEvent)} - ${selectedEvent.location}`
											: "Broadcast wajib dikaitkan dengan event."}
									</p>
								</div>

								<div>
									<label className="mb-2 block text-sm font-medium text-gray-700">
										Target Penerima
									</label>
									<FormSelect
										value={target}
										onChange={(event) => {
											resetResult();
											setTarget(event.target.value as EventBroadcastTarget);
										}}
										className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#7AB2B2]"
									>
										<option value="all">Semua alumni yang punya nomor HP</option>
										<option value="registered">
											Alumni yang sudah daftar event
										</option>
										<option value="custom">Nomor manual</option>
									</FormSelect>
									<div className="mt-3 flex gap-3 rounded-xl border border-[#7AB2B2]/20 bg-[#7AB2B2]/10 p-3 text-sm text-teal-800">
										<Info className="mt-0.5 h-4 w-4 shrink-0" />
										<div>
											<p className="font-medium">
												{targetDescriptions[target].label}
											</p>
											<p className="mt-0.5 text-xs text-[#236175]">
												{targetDescriptions[target].description}
											</p>
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
												className="inline-flex items-center gap-1.5 rounded-lg border border-teal-200 bg-[#7AB2B2]/10 px-3 py-1.5 text-xs font-medium text-[#236175] transition-colors hover:bg-[#7AB2B2]/20"
											>
												<Plus className="h-3.5 w-3.5" />
												Tambah
											</button>
										</div>
										<div className="space-y-2">
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
														className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#7AB2B2]"
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
									</div>
								)}

								<div>
									<div className="mb-2 flex items-center justify-between">
										<label className="block text-sm font-medium text-gray-700">
											Custom Message
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
										placeholder="Kosongkan jika ingin memakai template default backend"
										rows={7}
										className="w-full resize-none rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#7AB2B2]"
									/>
									{isMessageTooLong && (
										<p className="mt-1 text-xs text-red-500">
											Custom message maksimal 1000 karakter.
										</p>
									)}
								</div>
							</div>

							<div className="space-y-4">
								<div>
									<div className="mb-2 flex items-center justify-between">
										<label className="block text-sm font-medium text-gray-700">
											Preview Pesan
										</label>
										<span className="rounded-full border border-teal-200 bg-[#7AB2B2]/10 px-2 py-0.5 text-xs font-medium text-[#2D7EA0]">
											{target}
										</span>
									</div>
									<div className="min-h-[360px] whitespace-pre-wrap rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700">
										{!selectedEventId
											? "Pilih event untuk melihat preview."
											: target === "custom" &&
													parsedNumbers.validNumbers.length === 0
												? "Masukkan nomor manual untuk menghitung target custom."
												: preview.isLoading
													? "Memuat preview..."
													: preview.isError
														? getApiErrorMessage(
																preview.error,
																"Gagal memuat preview",
															)
														: previewMessage || "Preview belum tersedia"}
									</div>
								</div>

								{successMessage && (
									<div className="space-y-2 rounded-xl border border-green-200 bg-green-50 p-3 text-sm text-green-700">
										<p>{successMessage}</p>
										<p className="text-xs">
											Total sent: {sendDetail?.totalSent ?? 0}
										</p>
										{sendDetail?.fonnte !== undefined && (
											<details className="text-xs">
												<summary className="cursor-pointer font-medium">
													Detail teknis Fonnte
												</summary>
												<pre className="mt-2 max-h-48 overflow-auto whitespace-pre-wrap break-words rounded-lg bg-white/70 p-3 text-gray-600">
													{JSON.stringify(sendDetail.fonnte, null, 2)}
												</pre>
											</details>
										)}
										{sendDetail?.senderStatus !== undefined && (
											<p className="text-xs">
												Sender status: {String(sendDetail.senderStatus)}
											</p>
										)}
										{sendDetail?.blockedReason !== undefined && (
											<p className="text-xs">
												Blocked reason: {String(sendDetail.blockedReason)}
											</p>
										)}
									</div>
								)}

								{errorMessage && (
									<div className="space-y-2 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-600">
										<p>{errorMessage}</p>
										{sendDetail?.senderStatus !== undefined && (
											<p className="text-xs">
												Sender status: {String(sendDetail.senderStatus)}
											</p>
										)}
										{sendDetail?.blockedReason !== undefined && (
											<p className="text-xs">
												Blocked reason: {String(sendDetail.blockedReason)}
											</p>
										)}
										{sendDetail?.fonnte !== undefined && (
											<details className="text-xs">
												<summary className="cursor-pointer font-medium">
													Detail teknis Fonnte
												</summary>
												<pre className="mt-2 max-h-48 overflow-auto whitespace-pre-wrap break-words rounded-lg bg-white/70 p-3 text-gray-600">
													{JSON.stringify(sendDetail.fonnte, null, 2)}
												</pre>
											</details>
										)}
									</div>
								)}
							</div>
						</div>
					</div>

					<p className="mt-6 pb-4 text-center text-xs text-gray-400">
						© 2026 QR Event Attendance System - Pesantren
					</p>
				</main>
			</div>
		</div>
	);
}
