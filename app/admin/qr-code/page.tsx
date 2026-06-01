"use client";

import { useEffect, useMemo, useState } from "react";
import AdminSidebar from "@/app/components/AdminSidebar";
import AdminHeader from "@/app/components/AdminHeader";
import { FormInput, FormSelect } from "@/app/components/FormControl";
import SearchInput from "@/app/components/SearchInput";
import {
	useEvents,
	useGenerateQR,
	useEventQr,
	type Event,
	type EventQrCode,
} from "@/hooks/admin/useEvents";
import Image from "next/image";

// ─── QR Placeholder SVG ───────────────────────────────────────────────────────
function QRPlaceholder({
	size = 120,
	muted = false,
}: {
	size?: number;
	muted?: boolean;
}) {
	const color = muted ? "#d1d5db" : "#0d9488";

	return (
		<svg
			width={size}
			height={size}
			viewBox="0 0 100 100"
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
		>
			<rect
				x="5"
				y="5"
				width="35"
				height="35"
				rx="4"
				stroke={color}
				strokeWidth="5"
				fill="none"
			/>
			<rect x="14" y="14" width="17" height="17" rx="2" fill={color} />
			<rect
				x="60"
				y="5"
				width="35"
				height="35"
				rx="4"
				stroke={color}
				strokeWidth="5"
				fill="none"
			/>
			<rect x="69" y="14" width="17" height="17" rx="2" fill={color} />
			<rect
				x="5"
				y="60"
				width="35"
				height="35"
				rx="4"
				stroke={color}
				strokeWidth="5"
				fill="none"
			/>
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

// ─── QR Display ───────────────────────────────────────────────────────────────
function QRDisplay({ src }: { src?: string | null }) {
	if (src) {
		return (
			<Image
				src={src}
				alt="QR Code"
				width={240}
				height={240}
				className="w-full h-full object-contain rounded-lg"
				unoptimized
			/>
		);
	}

	return <QRPlaceholder size={150} muted />;
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────
function EventCardSkeleton() {
	return (
		<div className="bg-white border border-gray-100 rounded-2xl p-4 animate-pulse">
			<div className="h-4 bg-gray-200 rounded w-3/4 mb-3" />
			<div className="h-3 bg-gray-100 rounded w-1/2 mb-2" />
			<div className="h-3 bg-gray-100 rounded w-2/3" />
		</div>
	);
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

const API_BASE_URL =
	process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api";

function getAuthToken() {
	if (typeof window === "undefined") return null;

	return (
		localStorage.getItem("access_token") ||
		localStorage.getItem("admin_token") ||
		localStorage.getItem("alumni_token") ||
		localStorage.getItem("token")
	);
}

async function downloadSvgAsImage({
	svgUrl,
	fileName,
	type = "png",
}: {
	svgUrl: string;
	fileName: string;
	type?: "png" | "jpg";
}) {
	const response = await fetch(svgUrl);

	if (!response.ok) {
		throw new Error("Gagal mengambil SVG QR");
	}

	const svgBlob = await response.blob();
	const svgObjectUrl = URL.createObjectURL(svgBlob);

	const image = new window.Image();

	image.crossOrigin = "anonymous";

	await new Promise<void>((resolve, reject) => {
		image.onload = () => resolve();
		image.onerror = () => reject(new Error("Gagal memuat SVG"));
		image.src = svgObjectUrl;
	});

	const canvas = document.createElement("canvas");
	const size = 1000;

	canvas.width = size;
	canvas.height = size;

	const ctx = canvas.getContext("2d");

	if (!ctx) {
		URL.revokeObjectURL(svgObjectUrl);
		throw new Error("Canvas tidak tersedia");
	}

	ctx.fillStyle = "#ffffff";
	ctx.fillRect(0, 0, size, size);
	ctx.drawImage(image, 0, 0, size, size);

	const mimeType = type === "jpg" ? "image/jpeg" : "image/png";
	const extension = type === "jpg" ? "jpg" : "png";

	const outputBlob = await new Promise<Blob>((resolve, reject) => {
		canvas.toBlob(
			(blob) => {
				if (!blob) {
					reject(new Error("Gagal membuat file gambar"));
					return;
				}

				resolve(blob);
			},
			mimeType,
			1,
		);
	});

	const outputUrl = URL.createObjectURL(outputBlob);

	const link = document.createElement("a");
	link.href = outputUrl;
	link.download = `${fileName}.${extension}`;
	link.click();

	URL.revokeObjectURL(svgObjectUrl);
	URL.revokeObjectURL(outputUrl);
}

function formatEventDate(event: Event) {
	const rawDate = event.event_date || event.event_datetime;

	if (!rawDate) return "-";

	const d = new Date(rawDate);

	if (Number.isNaN(d.getTime())) return "-";

	return d.toLocaleDateString("id-ID", {
		day: "2-digit",
		month: "long",
		year: "numeric",
	});
}

function formatDateTime(value?: string | null) {
	if (!value) return "-";

	const d = new Date(value);

	if (Number.isNaN(d.getTime())) return "-";

	return d.toLocaleString("id-ID", {
		day: "2-digit",
		month: "short",
		year: "numeric",
		hour: "2-digit",
		minute: "2-digit",
	});
}

function toApiDateTime(value: string) {
	if (!value) return "";

	return value.replace("T", " ") + ":00";
}

function getDefaultValidFrom() {
	const now = new Date();
	now.setMinutes(now.getMinutes() - now.getTimezoneOffset());

	return now.toISOString().slice(0, 16);
}

// ─── Event List Card ──────────────────────────────────────────────────────────
function EventListCard({
	event,
	active,
	onClick,
}: {
	event: Event;
	active: boolean;
	onClick: () => void;
}) {
	return (
		<button
			type="button"
			onClick={onClick}
			className={`w-full text-left rounded-2xl border p-4 transition-all ${
				active
					? "border-teal-300 bg-teal-50 shadow-sm"
					: "border-gray-100 bg-white hover:border-teal-200 hover:bg-teal-50/40"
			}`}
		>
			<div className="flex items-start justify-between gap-3">
				<div className="min-w-0">
					<p className="font-semibold text-gray-800 text-sm truncate">
						{event.event_title}
					</p>
					<p className="text-xs text-gray-400 mt-1">{formatEventDate(event)}</p>
					<p className="text-xs text-gray-400 mt-0.5 truncate">
						{event.location}
					</p>
				</div>

				<span
					className={`text-xs px-2.5 py-0.5 rounded-full whitespace-nowrap ${
						active ? "bg-teal-100 text-teal-700" : "bg-gray-100 text-gray-500"
					}`}
				>
					{event.category}
				</span>
			</div>
		</button>
	);
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function GenerateQRPage() {
	const [search, setSearch] = useState("");
	const [selectedId, setSelectedId] = useState<number | null>(null);
	const [validFrom, setValidFrom] = useState(getDefaultValidFrom());
	const [timeoutMinutes, setTimeoutMinutes] = useState(60);
	const [generatedQr, setGeneratedQr] = useState<EventQrCode | null>(null);
	const [qrImageObjectUrl, setQrImageObjectUrl] = useState<string | null>(null);
	const [isLoadingQrImage, setIsLoadingQrImage] = useState(false);

	const {
		data: events = [],
		isLoading: loadingEvents,
		isError: eventsError,
	} = useEvents(search, 10);
	const {
		data: activeQr,
		isLoading: loadingQr,
		isError: activeQrError,
	} = useEventQr(selectedId);

	const generateQR = useGenerateQR();

	const selectedEvent = events.find((event) => event.id === selectedId) ?? null;

	const displayedQr = generatedQr ?? activeQr ?? null;
	const displayedQrId = displayedQr?.id ?? null;

	useEffect(() => {
		if (!selectedId || !displayedQrId) {
			return;
		}

		let objectUrl: string | null = null;

		const fetchQrImage = async () => {
			try {
				setIsLoadingQrImage(true);

				const token = getAuthToken();

				const response = await fetch(
					`${API_BASE_URL}/admin/events/${selectedId}/qr-image`,
					{
						method: "GET",
						headers: {
							Accept: "image/svg+xml",
							...(token ? { Authorization: `Bearer ${token}` } : {}),
						},
					},
				);

				if (!response.ok) {
					throw new Error("Gagal mengambil gambar QR");
				}

				const blob = await response.blob();
				objectUrl = URL.createObjectURL(blob);

				setQrImageObjectUrl(objectUrl);
			} catch (error) {
				console.error(error);
				setQrImageObjectUrl(null);
			} finally {
				setIsLoadingQrImage(false);
			}
		};

		fetchQrImage();

		return () => {
			if (objectUrl) {
				URL.revokeObjectURL(objectUrl);
			}
		};
	}, [selectedId, displayedQrId]);

	const filteredEvents = useMemo(() => {
		return events;
	}, [events]);

	const handleSelectEvent = (event: Event) => {
		setSelectedId(event.id);
		setGeneratedQr(null);
		setQrImageObjectUrl(null);
	};

	const handleGenerate = () => {
		if (!selectedId) return;

		generateQR.mutate(
			{
				eventId: selectedId,
				data: {
					valid_from: toApiDateTime(validFrom),
					timeout_minutes: timeoutMinutes,
				},
			},
			{
				onSuccess: (response) => {
					setQrImageObjectUrl(null);
					setGeneratedQr(response.data.qr_code);
				},
			},
		);
	};

	const isGenerateDisabled =
		!selectedId ||
		!validFrom ||
		timeoutMinutes < 1 ||
		timeoutMinutes > 1440 ||
		generateQR.isPending;

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
							<h2 className="text-2xl font-bold text-white">
								Generator QR Code Event
							</h2>
							<p className="text-teal-100 text-sm mt-1">
								Pilih event, tentukan waktu mulai berlaku, lalu generate QR Code
								presensi
							</p>
						</div>
					</div>

					{/* ── Two Column ── */}
					<div className="grid grid-cols-5 gap-5">
						{/* Left: Pilih Event + Form */}
						<div className="col-span-2 bg-white border border-gray-100 rounded-2xl p-6 shadow-sm flex flex-col gap-5">
							<div>
								<h3 className="text-base font-semibold text-gray-800">
									Atur QR Code
								</h3>
								<p className="text-sm text-gray-400 mt-0.5">
									Pilih event dan tentukan masa berlaku QR
								</p>
							</div>

							{/* Search */}
							<div>
								<label className="block text-sm font-medium text-gray-700 mb-2">
									Cari Event
								</label>

								<SearchInput
									leadingIcon={<span className="text-gray-400">🔍</span>}
									wrapperClassName="flex items-center bg-gray-50 border border-gray-100 rounded-xl px-4 py-2.5 gap-2"
									placeholder="Cari nama event..."
									value={search}
									onValueChange={setSearch}
									className="bg-transparent outline-none w-full text-sm text-gray-700 placeholder-gray-400"
								/>
							</div>

							{/* Event Select */}
							<div>
								<label className="block text-sm font-medium text-gray-700 mb-2">
									Event
								</label>

									<div className="relative">
										<FormSelect
											value={selectedId ?? ""}
											onChange={(e) => {
												setSelectedId(Number(e.target.value) || null);
												setGeneratedQr(null);
												setQrImageObjectUrl(null);
											}}
											disabled={loadingEvents}
										className="w-full appearance-none border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-700 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent cursor-pointer disabled:bg-gray-100"
									>
										<option value="">Pilih event...</option>
										{events.map((event) => (
											<option key={event.id} value={event.id}>
												{event.event_title}
											</option>
										))}
									</FormSelect>

									<span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
										▾
									</span>
								</div>
							</div>

							{/* Selected Event Detail */}
							{selectedEvent && (
								<div className="bg-teal-50 border border-teal-100 rounded-xl p-4 space-y-1.5 text-sm">
									<p className="font-semibold text-teal-800">
										{selectedEvent.event_title}
									</p>

									<p className="text-teal-600 flex items-center gap-1.5">
										<span>📅</span>
										{formatEventDate(selectedEvent)}
									</p>

									<p className="text-teal-600 flex items-center gap-1.5">
										<span>📍</span>
										{selectedEvent.location}
									</p>

									<span className="inline-block text-xs bg-teal-100 text-teal-700 px-2.5 py-0.5 rounded-full">
										{selectedEvent.category}
									</span>
								</div>
							)}

							{/* QR Settings */}
							<div className="grid grid-cols-2 gap-4">
								<div className="col-span-2">
									<label className="block text-sm font-medium text-gray-700 mb-2">
										Mulai Berlaku
									</label>

									<FormInput
										type="datetime-local"
										value={validFrom}
										onChange={(e) => setValidFrom(e.target.value)}
										className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-700 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent"
										required
									/>

									<p className="text-xs text-gray-400 mt-1">
										QR baru bisa digunakan mulai waktu ini.
									</p>
								</div>

								<div className="col-span-2">
									<label className="block text-sm font-medium text-gray-700 mb-2">
										Timeout QR
									</label>

									<div className="flex items-center gap-3">
										<FormInput
											type="number"
											min={1}
											max={1440}
											value={timeoutMinutes}
											onChange={(e) =>
												setTimeoutMinutes(Number(e.target.value))
											}
											className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-700 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent"
											required
										/>

										<span className="text-sm text-gray-500 whitespace-nowrap">
											menit
										</span>
									</div>

									<p className="text-xs text-gray-400 mt-1">
										QR akan expired setelah sekian menit dari waktu mulai
										berlaku.
									</p>
								</div>
							</div>

							{/* Existing QR Info */}
							{selectedId && !loadingQr && activeQr && !generatedQr && (
								<div className="p-3 bg-blue-50 border border-blue-100 text-blue-600 rounded-xl text-xs">
									Event ini sudah memiliki QR aktif. Generate ulang akan
									menonaktifkan QR sebelumnya.
								</div>
							)}

							{selectedId && !loadingQr && activeQrError && (
								<div className="p-3 bg-gray-50 border border-gray-100 text-gray-500 rounded-xl text-xs">
									Event ini belum memiliki QR aktif.
								</div>
							)}

							{/* Error */}
							{generateQR.isError && (
								<div className="p-3 bg-red-50 border border-red-100 text-red-500 rounded-xl text-xs flex items-center gap-2">
									<span>⚠️</span>
									{generateQR.error instanceof Error
										? generateQR.error.message
										: "Gagal generate QR Code"}
								</div>
							)}

							{/* Generate Button */}
							<button
								onClick={handleGenerate}
								disabled={isGenerateDisabled}
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
								<h3 className="text-base font-semibold text-gray-800">
									Preview QR Code
								</h3>
								<p className="text-sm text-gray-400 mt-0.5">
									QR aktif dari event yang dipilih akan tampil di sini
								</p>
							</div>

							{!selectedEvent ? (
								<div className="flex-1 flex flex-col items-center justify-center gap-4 py-10">
									<div className="opacity-20">
										<QRPlaceholder size={110} muted />
									</div>

									<div className="text-center">
										<p className="font-semibold text-gray-500 text-lg">
											Belum Ada Event Dipilih
										</p>
										<p className="text-sm text-gray-400 mt-1 max-w-xs">
											Pilih event terlebih dahulu untuk melihat atau generate QR
											Code.
										</p>
									</div>
								</div>
							) : loadingQr && !generatedQr ? (
								<div className="flex-1 flex flex-col items-center justify-center gap-4 py-10">
									<div className="w-52 h-52 bg-gray-100 rounded-2xl animate-pulse" />
									<div className="h-4 bg-gray-100 rounded w-48 animate-pulse" />
								</div>
							) : !displayedQr ? (
								<div className="flex-1 flex flex-col items-center justify-center gap-4 py-10">
									<div className="opacity-20">
										<QRPlaceholder size={110} muted />
									</div>

									<div className="text-center">
										<p className="font-semibold text-gray-500 text-lg">
											QR Belum Digenerate
										</p>
										<p className="text-sm text-gray-400 mt-1 max-w-xs">
											Atur waktu mulai berlaku dan timeout, lalu klik Generate
											QR Code.
										</p>
									</div>
								</div>
							) : (
								<div className="flex-1 flex flex-col items-center justify-center gap-6">
									<div className="relative">
										<div className="w-60 h-60 bg-white border-2 border-teal-200 rounded-2xl flex items-center justify-center shadow-lg p-4">
											{isLoadingQrImage ? (
												<div className="w-full h-full bg-gray-100 rounded-xl animate-pulse" />
											) : (
												<QRDisplay src={qrImageObjectUrl} />
											)}
										</div>

										<span
											className={`absolute -top-2 -right-2 text-white text-xs px-2.5 py-1 rounded-full font-medium shadow ${
												displayedQr.is_valid_now
													? "bg-teal-500"
													: displayedQr.is_expired
														? "bg-red-500"
														: "bg-amber-500"
											}`}
										>
											{displayedQr.is_valid_now
												? "Aktif"
												: displayedQr.is_expired
													? "Expired"
													: "Terjadwal"}
										</span>
									</div>

									<div className="text-center">
										<p className="font-semibold text-gray-800">
											{selectedEvent.event_title}
										</p>

										<p className="text-sm text-gray-400 mt-0.5">
											{formatEventDate(selectedEvent)} •{" "}
											{selectedEvent.location}
										</p>
									</div>

									<div className="w-full max-w-md bg-gray-50 border border-gray-100 rounded-xl p-4 space-y-2 text-sm">
										<div className="flex justify-between gap-4">
											<span className="text-gray-500">Mulai berlaku</span>
											<span className="font-medium text-gray-700 text-right">
												{formatDateTime(displayedQr.valid_from)}
											</span>
										</div>

										<div className="flex justify-between gap-4">
											<span className="text-gray-500">Expired</span>
											<span className="font-medium text-gray-700 text-right">
												{formatDateTime(displayedQr.expired_at)}
											</span>
										</div>

										<div className="flex justify-between gap-4">
											<span className="text-gray-500">Timeout</span>
											<span className="font-medium text-gray-700 text-right">
												{displayedQr.timeout_minutes} menit
											</span>
										</div>

										<div className="flex justify-between gap-4">
											<span className="text-gray-500">Token</span>
											<span className="font-mono text-xs text-gray-500 text-right truncate max-w-[220px]">
												{displayedQr.qr_token}
											</span>
										</div>
									</div>

									<div className="flex gap-3">
										<button
											onClick={() => {
												if (!qrImageObjectUrl || !selectedEvent) return;

												downloadSvgAsImage({
													svgUrl: qrImageObjectUrl,
													fileName: `QR-${selectedEvent.event_title}`,
													type: "png",
												});
											}}
											disabled={!qrImageObjectUrl}
											className="flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white px-5 py-2.5 rounded-xl text-sm font-medium transition-colors disabled:opacity-60"
										>
											<span>⬇</span>
											Download PNG
										</button>

										<button
											type="button"
											onClick={() => {
												if (qrImageObjectUrl) {
													window.open(qrImageObjectUrl, "_blank");
												}
											}}
											disabled={!qrImageObjectUrl}
											className="flex items-center gap-2 border border-teal-200 text-teal-600 hover:bg-teal-50 px-5 py-2.5 rounded-xl text-sm font-medium transition-colors disabled:opacity-60"
										>
											<span>↗</span>
											Buka QR
										</button>
									</div>
								</div>
							)}
						</div>
					</div>

					{/* ── Event List ── */}
					<div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
						<div className="mb-5">
							<h3 className="text-base font-semibold text-gray-800">
								Daftar Event
							</h3>
							<p className="text-sm text-gray-400 mt-0.5">
								Klik salah satu event untuk generate atau melihat QR aktif
							</p>
						</div>

						<div className="grid grid-cols-4 gap-4">
							{loadingEvents ? (
								[1, 2, 3, 4].map((i) => <EventCardSkeleton key={i} />)
							) : eventsError ? (
								<div className="col-span-4 text-center py-8 text-red-400">
									<p className="text-3xl mb-2">⚠️</p>
									<p className="text-sm">Gagal memuat data event</p>
								</div>
							) : filteredEvents.length === 0 ? (
								<div className="col-span-4 text-center py-8 text-gray-400">
									<p className="text-3xl mb-2">📭</p>
									<p className="text-sm">Belum ada event yang tersedia</p>
								</div>
							) : (
								filteredEvents.map((event) => (
									<EventListCard
										key={event.id}
										event={event}
										active={event.id === selectedId}
										onClick={() => handleSelectEvent(event)}
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
