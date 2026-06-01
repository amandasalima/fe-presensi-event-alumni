"use client";

import { useState } from "react";
import { Info, Plus, Trash2 } from "lucide-react";
import AdminSidebar from "@/app/components/AdminSidebar";
import AdminHeader from "@/app/components/AdminHeader";
import { FormInput, FormSelect, FormTextarea } from "@/app/components/FormControl";
import SearchInput from "@/app/components/SearchInput";
import { getApiErrorMessage } from "@/lib/api";
import {
	useEvents,
	useDeleteEvent,
	type Event,
} from "@/hooks/admin/useEvents";
import type { EventBroadcastTarget } from "@/hooks/admin/useBroadcast";
import { useCreateEventForm } from "./_hooks/useCreateEventForm";
import { useEventBroadcastForm } from "./_hooks/useEventBroadcastForm";
import {
	parseEventDate,
	sanitizeBroadcastMessage,
} from "./_utils/eventFormatters";

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
	label,
	value,
	sub,
	accent,
}: {
	label: string;
	value: string | number;
	sub: string;
	accent?: string;
}) {
	return (
		<div
			className={`bg-white rounded-2xl border p-6 flex flex-col gap-1 shadow-sm ${
				accent ? `border-l-4 ${accent}` : "border-gray-100"
			}`}
		>
			<p className="text-sm text-gray-500">{label}</p>
			<p
				className={`text-4xl font-bold ${accent ? "text-teal-600" : "text-gray-800"}`}
			>
				{value}
			</p>
			<p className="text-xs text-gray-400">{sub}</p>
		</div>
	);
}

const broadcastTargetDescriptions: Record<
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
			"Broadcast hanya dikirim ke alumni yang sudah terdaftar pada event ini.",
	},
	custom: {
		label: "Nomor manual",
		description:
			"Broadcast hanya dikirim ke daftar nomor yang Anda input satu per satu.",
	},
};

// ─── Create Event Modal ───────────────────────────────────────────────────────
function CreateEventModal({
	isOpen,
	onClose,
}: {
	isOpen: boolean;
	onClose: () => void;
}) {
	const {
		form,
		categories,
		selectedCategoryId,
		createEvent,
		handleChange,
		handleSubmit,
		isCategoryLoading,
		isCategoryError,
	} = useCreateEventForm(onClose);

	if (!isOpen) return null;

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
			<div className="w-full max-w-2xl bg-white rounded-2xl shadow-xl border border-gray-100">
				<div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
					<div>
						<h3 className="text-lg font-semibold text-gray-800">
							Buat Event Baru
						</h3>
						<p className="text-sm text-gray-400">Tambahkan data event alumni</p>
					</div>

					<button
						type="button"
						onClick={onClose}
						className="w-9 h-9 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
					>
						✕
					</button>
				</div>

				<form onSubmit={handleSubmit} className="p-6 space-y-5">
					<div>
						<label className="block text-sm font-medium text-gray-700 mb-1">
							Kategori
						</label>

						<FormSelect
							name="category_id"
							value={selectedCategoryId}
							onChange={handleChange}
							disabled={isCategoryLoading || categories.length === 0}
							className="text-gray-500 w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-400 bg-gray-50 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed"
							required
						>
							{isCategoryLoading && (
								<option value={0}>Memuat kategori...</option>
							)}

							{!isCategoryLoading && categories.length === 0 && (
								<option value={0}>Kategori belum tersedia</option>
							)}

							{!isCategoryLoading &&
								categories.map((category) => (
									<option key={category.id} value={category.id}>
										{category.category_name}
									</option>
								))}
						</FormSelect>

						{isCategoryError && (
							<p className="text-xs text-red-500 mt-1">
								Gagal memuat kategori event.
							</p>
						)}
					</div>

					<div>
						<label className="block text-sm font-medium text-gray-700 mb-1">
							Judul Event
						</label>
						<FormInput
							type="text"
							name="event_title"
							value={form.event_title}
							onChange={handleChange}
							placeholder="Contoh: Reuni Akbar 2025"
							className="text-gray-500 w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-400 bg-gray-50"
							required
						/>
					</div>

					<div>
						<label className="block text-sm font-medium text-gray-700 mb-1">
							Deskripsi
						</label>
						<FormTextarea
							name="description"
							value={form.description}
							onChange={handleChange}
							placeholder="Contoh: Reuni alumni angkatan 2010-2015"
							rows={3}
							className="text-gray-500 w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-400 bg-gray-50 resize-none"
							required
						/>
					</div>

					<div>
						<label className="block text-sm font-medium text-gray-700 mb-1">
							Lokasi
						</label>
						<FormInput
							type="text"
							name="location"
							value={form.location}
							onChange={handleChange}
							placeholder="Contoh: Aula Pesantren"
							className="text-gray-500 w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-400 bg-gray-50"
							required
						/>
					</div>

					<div className="grid grid-cols-3 gap-4">
						<div>
							<label className="block text-sm font-medium text-gray-700 mb-1">
								Tanggal Event
							</label>
							<FormInput
								type="date"
								name="event_date"
								value={form.event_date}
								onChange={handleChange}
								className="text-gray-500 w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-400 bg-gray-50"
								required
							/>
						</div>

						<div>
							<label className="block text-sm font-medium text-gray-700 mb-1">
								Jam Mulai
							</label>
							<FormInput
								type="time"
								name="start_time"
								value={form.start_time}
								onChange={handleChange}
								className="text-gray-500 w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-400 bg-gray-50"
								required
							/>
						</div>

						<div>
							<label className="block text-sm font-medium text-gray-700 mb-1">
								Jam Selesai
							</label>
							<FormInput
								type="time"
								name="end_time"
								value={form.end_time}
								onChange={handleChange}
								className="text-gray-500 w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-400 bg-gray-50"
								required
							/>
						</div>
					</div>

					{createEvent.isError && (
						<div className="p-3 bg-red-50 border border-red-200 text-red-600 rounded-xl text-sm">
							{createEvent.error instanceof Error
								? createEvent.error.message
								: "Gagal membuat event"}
						</div>
					)}

					<div className="flex justify-end gap-3 pt-2">
						<button
							type="button"
							onClick={onClose}
							className="px-5 py-2.5 rounded-xl border border-gray-200 text-gray-600 text-sm hover:bg-gray-50 transition-colors"
						>
							Batal
						</button>

						<button
							type="submit"
							disabled={
								createEvent.isPending ||
								isCategoryLoading ||
								categories.length === 0 ||
								!selectedCategoryId
							}
							className="px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-sm font-medium transition-colors disabled:opacity-60 flex items-center gap-2"
						>
							{createEvent.isPending ? (
								<>
									<span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
									Menyimpan...
								</>
							) : (
								"Simpan Event"
							)}
						</button>
					</div>
				</form>
			</div>
		</div>
	);
}

function BroadcastModal({
	event,
	isOpen,
	onClose,
}: {
	event: Event | null;
	isOpen: boolean;
	onClose: () => void;
}) {
	const {
		target,
		manualNumbers,
		customMessage,
		successMessage,
		errorMessage,
		sendDetail,
		preview,
		previewData,
		sendEventBroadcast,
		parsedNumbers,
		estimatedTargets,
		isMessageTooLong,
		isSubmitDisabled,
		updateManualNumber,
		addManualNumber,
		removeManualNumber,
		setCustomMessage,
		handleTargetChange,
		handleSubmit,
	} = useEventBroadcastForm(event);
	const previewMessage = sanitizeBroadcastMessage(previewData?.message) || "";

	if (!isOpen || !event) return null;

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
			<div className="w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-white rounded-2xl shadow-xl border border-gray-100">
				<div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
					<div>
						<h3 className="text-lg font-semibold text-gray-800">
							WA Broadcast
						</h3>
						<p className="text-sm text-gray-400">{event.event_title}</p>
					</div>

					<button
						type="button"
						onClick={onClose}
						className="w-9 h-9 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
					>
						✕
					</button>
				</div>

				<form onSubmit={handleSubmit} className="p-6 space-y-5">
					<div className="grid grid-cols-3 gap-4">
						<StatCard
							label="Alumni Ber-HP"
							value={
								preview.isLoading
									? "..."
									: (previewData?.breakdown.total_all ?? 0)
							}
							sub="Total alumni dengan nomor"
							accent="border-teal-400"
						/>
						<StatCard
							label="Terdaftar Event"
							value={
								preview.isLoading
									? "..."
									: (previewData?.breakdown.total_registered ?? 0)
							}
							sub="Alumni yang sudah daftar"
							accent="border-blue-400"
						/>
						<StatCard
							label="Estimasi Penerima"
							value={preview.isLoading ? "..." : estimatedTargets}
							sub="Target broadcast saat ini"
							accent="border-teal-400"
						/>
						{target === "custom" && (
							<StatCard
								label="Nomor Manual"
								value={parsedNumbers.validNumbers.length}
								sub={`Duplikat otomatis dihapus${
									previewData?.breakdown.total_custom !== undefined
										? ` • Preview: ${previewData.breakdown.total_custom}`
										: ""
								}`}
								accent="border-green-400"
							/>
						)}
					</div>

					<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
						<div className="space-y-5">
							<div>
								<label className="block text-sm font-medium text-gray-700 mb-2">
									Target Penerima
								</label>
								<FormSelect
									value={target}
									onChange={(e) =>
										handleTargetChange(e.target.value as EventBroadcastTarget)
									}
									className="text-gray-500 w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-400 bg-gray-50"
								>
									<option value="all">Semua alumni yang punya nomor HP</option>
									<option value="registered">
										Alumni yang sudah daftar event
									</option>
									<option value="custom">Nomor manual</option>
								</FormSelect>
								<div className="mt-3 flex gap-3 rounded-xl border border-teal-100 bg-teal-50 p-3 text-sm text-teal-800">
									<Info className="mt-0.5 h-4 w-4 shrink-0" />
									<div>
										<p className="font-medium">
											{broadcastTargetDescriptions[target].label}
										</p>
										<p className="mt-0.5 text-xs text-teal-700">
											{broadcastTargetDescriptions[target].description}
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
											className="inline-flex items-center gap-1.5 rounded-lg border border-teal-200 bg-teal-50 px-3 py-1.5 text-xs font-medium text-teal-700 transition-colors hover:bg-teal-100"
										>
											<Plus className="h-3.5 w-3.5" />
											Tambah
										</button>
									</div>
									<div className="space-y-2">
										{manualNumbers.map((number, index) => (
											<div
												key={`event-manual-number-${index}`}
												className="flex items-center gap-2"
											>
												<FormInput
													type="tel"
													value={number}
													onChange={(e) =>
														updateManualNumber(index, e.target.value)
													}
													placeholder={`Nomor ${index + 1}, contoh: 081234567890`}
													className="text-gray-500 w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-400 bg-gray-50"
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
									<p className="text-xs text-gray-400 mt-1">
										Nomor valid: {parsedNumbers.validNumbers.length}
										{parsedNumbers.invalidCount > 0
											? ` • Tidak valid: ${parsedNumbers.invalidCount}`
											: ""}
									</p>
								</div>
							)}

							<div>
								<div className="flex items-center justify-between mb-2">
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
									onChange={(e) => setCustomMessage(e.target.value)}
									placeholder="Kosongkan jika ingin memakai pesan default"
									rows={6}
									className="text-gray-500 w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-400 bg-gray-50 resize-none"
								/>
								{isMessageTooLong && (
									<p className="text-xs text-red-500 mt-1">
										Custom message maksimal 1000 karakter.
									</p>
								)}
							</div>
						</div>

						<div>
							<div className="flex items-center justify-between mb-2">
								<label className="block text-sm font-medium text-gray-700">
									Preview Pesan
								</label>
								<span className="text-xs bg-teal-50 text-teal-600 border border-teal-200 px-2 py-0.5 rounded-full font-medium">
									{target}
								</span>
							</div>
							<div className="min-h-[320px] text-gray-700 whitespace-pre-wrap bg-gray-50 border border-gray-200 rounded-xl p-4 text-sm">
								{target === "custom" &&
								parsedNumbers.validNumbers.length === 0
									? "Masukkan nomor manual untuk menghitung target custom."
									: preview.isLoading
									? "Memuat preview..."
									: preview.isError
										? getApiErrorMessage(preview.error, "Gagal memuat preview")
										: previewMessage || "Preview belum tersedia"}
							</div>
						</div>
					</div>

					{successMessage && (
						<div className="p-3 bg-green-50 border border-green-200 text-green-700 rounded-xl text-sm space-y-2">
							<p>{successMessage}</p>
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
									<pre className="mt-2 max-h-40 overflow-auto whitespace-pre-wrap break-words rounded-lg bg-white/70 p-3 text-gray-600">
										{JSON.stringify(sendDetail.fonnte, null, 2)}
									</pre>
								</details>
							)}
						</div>
					)}

					{(errorMessage || sendEventBroadcast.isError) && (
						<div className="p-3 bg-red-50 border border-red-200 text-red-600 rounded-xl text-sm space-y-2">
							<p>
								{errorMessage ||
									(sendEventBroadcast.error instanceof Error
										? sendEventBroadcast.error.message
										: "Gagal mengirim broadcast")}
							</p>
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
									<pre className="mt-2 max-h-40 overflow-auto whitespace-pre-wrap break-words rounded-lg bg-white/70 p-3 text-gray-600">
										{JSON.stringify(sendDetail.fonnte, null, 2)}
									</pre>
								</details>
							)}
						</div>
					)}

					<div className="flex justify-end gap-3 pt-2">
						<button
							type="button"
							onClick={onClose}
							className="px-5 py-2.5 rounded-xl border border-gray-200 text-gray-600 text-sm hover:bg-gray-50 transition-colors"
						>
							Batal
						</button>
						<button
							type="submit"
							disabled={isSubmitDisabled}
							className="px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-sm font-medium transition-colors disabled:opacity-60 flex items-center gap-2"
						>
							{sendEventBroadcast.isPending ? (
								<>
									<span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
									Mengirim...
								</>
							) : (
								"Kirim Broadcast"
							)}
						</button>
					</div>
				</form>
			</div>
		</div>
	);
}

// ─── Event Card (Mendatang) ───────────────────────────────────────────────────
function EventCardUpcoming({
	event,
	onDelete,
	onBroadcast,
}: {
	event: Event;
	onDelete: (id: number) => void;
	onBroadcast: (event: Event) => void;
}) {
	const { date, time } = parseEventDate(event);
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
					<span>
						{date} • {time}
					</span>
				</div>

				<div className="flex items-center gap-2">
					<span>📍</span>
					<span>{event.location}</span>
				</div>
			</div>

			<div className="flex gap-2 mt-4">
				<button className="flex-1 text-xs border border-teal-200 text-teal-600 hover:bg-teal-50 py-1.5 rounded-lg transition-colors">
					Edit
				</button>

				<button
					onClick={() => onBroadcast(event)}
					className="flex-1 text-xs border border-green-200 text-green-600 hover:bg-green-50 py-1.5 rounded-lg transition-colors"
				>
					WA Broadcast
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
function EventCardDone({
	event,
	onDelete,
	onBroadcast,
}: {
	event: Event;
	onDelete: (id: number) => void;
	onBroadcast: (event: Event) => void;
}) {
	const { date, time } = parseEventDate(event);
	const pct =
		event.quota && event.registered !== undefined
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
					<span>
						{date} • {time}
					</span>
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
						<span className="font-medium">
							{event.registered} / {event.quota}
						</span>
					</div>

					<div className="w-full bg-gray-100 rounded-full h-2">
						<div
							className="bg-teal-500 h-2 rounded-full transition-all"
							style={{ width: `${pct}%` }}
						/>
					</div>

					<p className="text-xs text-gray-400 mt-1 text-right">{pct}% terisi</p>
				</div>
			)}

			<div className="flex gap-2 mt-4">
				<button className="flex-1 text-xs border border-teal-200 text-teal-600 hover:bg-teal-50 py-1.5 rounded-lg transition-colors">
					Edit
				</button>

				<button
					onClick={() => onBroadcast(event)}
					className="flex-1 text-xs border border-green-200 text-green-600 hover:bg-green-50 py-1.5 rounded-lg transition-colors"
				>
					WA Broadcast
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
	const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
	const [broadcastEvent, setBroadcastEvent] = useState<Event | null>(null);

	const {
		data: events = [],
		isLoading,
		isError,
		error,
	} = useEvents(search, 10);

	const deleteEvent = useDeleteEvent();

	const handleDelete = (id: number) => {
		if (confirm("Yakin ingin menghapus event ini?")) {
			deleteEvent.mutate(id);
		}
	};

	const handleOpenBroadcast = (event: Event) => {
		setBroadcastEvent(event);
	};

	const filtered = events;

	const upcoming = filtered.filter((e) => e.status_event === "Mendatang");
	const done = filtered.filter((e) => e.status_event === "Selesai");

	const totalPeserta = events
		.filter((e) => e.registered !== undefined)
		.reduce((sum, e) => sum + (e.registered ?? 0), 0);

	return (
		<div className="flex min-h-screen bg-gray-50">
			<AdminSidebar />

			<div className="flex-1 ml-72 flex flex-col min-h-screen">
				<AdminHeader title="Kelola Event" />

				<main className="flex-1 p-8 space-y-6">
					<div className="grid grid-cols-4 gap-5">
						<StatCard
							label="Total Event"
							value={isLoading ? "..." : events.length}
							sub="Semua event"
						/>

						<StatCard
							label="Event Mendatang"
							value={
								isLoading
									? "..."
									: events.filter((e) => e.status_event === "Mendatang").length
							}
							sub="Event aktif"
							accent="border-teal-400"
						/>

						<StatCard
							label="Event Selesai"
							value={
								isLoading
									? "..."
									: events.filter((e) => e.status_event === "Selesai").length
							}
							sub="Event berlangsung"
						/>

						<StatCard
							label="Total Peserta"
							value={isLoading ? "..." : totalPeserta}
							sub="Total peserta"
							accent="border-blue-400"
						/>
					</div>

					<div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-5">
						<div className="flex items-center justify-between">
							<div>
								<h2 className="text-xl font-semibold text-gray-800">
									Manajemen Event
								</h2>
								<p className="text-sm text-gray-400">Kelola semua data acara</p>
							</div>

							<button
								onClick={() => setIsCreateModalOpen(true)}
								className="flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white px-5 py-2.5 rounded-xl font-medium text-sm transition-colors shadow-sm"
							>
								<span className="text-lg leading-none">+</span>
								Buat Event Baru
							</button>
						</div>

						<SearchInput
							leadingIcon={<span className="text-gray-400">🔍</span>}
							wrapperClassName="flex items-center bg-gray-50 border border-gray-100 rounded-xl px-4 py-2.5 gap-2"
							placeholder="Cari event..."
							value={search}
							onValueChange={setSearch}
							className="bg-transparent outline-none w-full text-sm text-gray-700 placeholder-gray-400"
						/>

						{isLoading && (
							<div className="space-y-6">
								<div>
									<div className="h-4 bg-gray-200 rounded w-32 mb-4 animate-pulse" />
									<div className="grid grid-cols-3 gap-4">
										{[1, 2, 3].map((i) => (
											<CardSkeleton key={i} />
										))}
									</div>
								</div>
							</div>
						)}

						{isError && (
							<div className="text-center py-12">
								<p className="text-4xl mb-3">⚠️</p>
								<p className="text-sm text-red-500 font-medium">
									Gagal memuat data event
								</p>
								<p className="text-xs text-gray-400 mt-1">
									{error instanceof Error
										? error.message
										: "Pastikan server backend sudah berjalan"}
								</p>
							</div>
						)}

						{!isLoading && !isError && (
							<>
								{upcoming.length > 0 && (
									<div>
										<div className="flex items-center gap-2 mb-4">
											<span>📅</span>
											<h3 className="font-semibold text-gray-700">
												Event Mendatang
											</h3>
										</div>

										<div className="grid grid-cols-3 gap-4">
											{upcoming.map((e) => (
												<EventCardUpcoming
													key={e.id}
													event={e}
													onDelete={handleDelete}
													onBroadcast={handleOpenBroadcast}
												/>
											))}
										</div>
									</div>
								)}

								{done.length > 0 && (
									<div>
										<div className="flex items-center gap-2 mb-4">
											<span>🕐</span>
											<h3 className="font-semibold text-gray-700">
												Event Selesai
											</h3>
										</div>

										<div className="grid grid-cols-2 gap-4">
											{done.map((e) => (
												<EventCardDone
													key={e.id}
													event={e}
													onDelete={handleDelete}
													onBroadcast={handleOpenBroadcast}
												/>
											))}
										</div>
									</div>
								)}

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

			<CreateEventModal
				isOpen={isCreateModalOpen}
				onClose={() => setIsCreateModalOpen(false)}
			/>

			{broadcastEvent && (
				<BroadcastModal
					event={broadcastEvent}
					isOpen={!!broadcastEvent}
					onClose={() => setBroadcastEvent(null)}
				/>
			)}
		</div>
	);
}
