"use client";

import { useEffect, useState } from "react";
import {
	Info,
	Plus,
	Trash2,
	CheckCircle,
	AlertCircle,
	X,
	CalendarDays,
	MapPin,
	Clock3,
	Pencil,
	Megaphone,
	Search,
} from "lucide-react";
import AdminSidebar from "@/app/components/AdminSidebar";
import AdminHeader from "@/app/components/AdminHeader";
import {
	FormInput,
	FormSelect,
	FormTextarea,
} from "@/app/components/FormControl";
import SearchInput from "@/app/components/SearchInput";
import { getApiErrorMessage } from "@/lib/api";
import {
	useEvents,
	useCreateEvent,
	useUpdateEvent,
	useDeleteEvent,
	useEventCategories,
	type Event,
} from "@/hooks/admin/useEvents";
import type { EventBroadcastTarget } from "@/hooks/admin/useBroadcast";
import { useEventBroadcastForm } from "./_hooks/useEventBroadcastForm";
import {
	parseEventDate,
	sanitizeBroadcastMessage,
} from "./_utils/eventFormatters";

type EventFormMode = "create" | "edit";

type EventFormState = {
	category_id: number;
	event_title: string;
	description: string;
	location: string;
	event_date: string;
	start_time: string;
	end_time: string;
	quota: number | "";
	poster?: File | null;
};

const initialEventForm: EventFormState = {
	category_id: 0,
	event_title: "",
	description: "",
	location: "",
	event_date: "",
	start_time: "",
	end_time: "",
	quota: "",
	poster: null,
};

function toInputDate(value?: string | null) {
	if (!value) return "";

	if (value.includes("T")) {
		return value.split("T")[0];
	}

	return value.slice(0, 10);
}

function toInputTime(value?: string | null) {
	if (!value) return "";

	return value.slice(0, 5);
}

/* ─── Toast Component ───────────────────────────────────────────────── */
function Toast({ type, message }: { type: "success" | "error"; message: string }) {
	return (
		<div
			className={`fixed bottom-6 right-6 z-[100] flex items-center gap-2.5 px-4 py-3.5 rounded-2xl shadow-xl text-sm font-medium text-white transition-all animate-in slide-in-from-bottom-5 fade-in duration-300 ${
				type === "success" ? "bg-[#3EBDAF]" : "bg-red-500"
			}`}
		>
			{type === "success" ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
			{message}
		</div>
	);
}


// ─── 3D Icon ─────────────────────────────────────────────────────────────────
function Icon3D({
	children,
	variant = "teal",
	size = "md",
}: {
	children: React.ReactNode;
	variant?: "teal" | "blue" | "green" | "red" | "gray";
	size?: "sm" | "md";
}) {
	const variants = {
		teal: "from-[#D8F3F0] via-[#7AB2B2] to-[#2D7EA0] text-white",
		blue: "from-blue-100 via-blue-400 to-blue-600 text-white",
		green:
			"from-emerald-100 via-emerald-400 to-emerald-600 text-white",
		red: "from-red-100 via-red-400 to-red-600 text-white",
		gray: "from-gray-100 via-gray-300 to-gray-500 text-white",
	};

	const sizes = {
		sm: "w-7 h-7 rounded-xl",
		md: "w-9 h-9 rounded-2xl",
	};

	return (
		<span
			className={`${sizes[size]} inline-flex items-center justify-center bg-gradient-to-br ${variants[variant]} shadow-lg shadow-gray-300/70 border border-white/60 ring-1 ring-black/5`}
		>
			<span className="drop-shadow-sm">{children}</span>
		</span>
	);
}

// ─── Loading Skeleton ─────────────────────────────────────────────────────────
function CardSkeleton() {
	return (
		<div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm animate-pulse">
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
			className={`bg-white rounded-2xl border p-4 flex flex-col gap-1 shadow-sm ${
				accent ? `border-l-4 ${accent}` : "border-gray-100"
			}`}
		>
			<p className="text-xs text-gray-500">{label}</p>
			<p
				className={`text-3xl font-bold ${accent ? "text-[#2D7EA0]" : "text-gray-800"}`}
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

// ─── Create/Edit Event Modal ──────────────────────────────────────────────────
function EventFormModal({
	isOpen,
	mode,
	event,
	onClose,
	onSuccess,
}: {
	isOpen: boolean;
	mode: EventFormMode;
	event: Event | null;
	onClose: () => void;
	onSuccess?: (message: string) => void;
}) {
	const createEvent = useCreateEvent();
	const updateEvent = useUpdateEvent();

	const {
		data: categories = [],
		isLoading: isCategoryLoading,
		isError: isCategoryError,
	} = useEventCategories();

	const [form, setForm] = useState<EventFormState>(initialEventForm);

	useEffect(() => {
		if (!isOpen) return;

		if (mode === "edit" && event) {
			const matchedCategory = categories.find(
				(category) => category.category_name === event.category,
			);

			setForm({
				category_id:
					event.category_id ?? matchedCategory?.id ?? categories[0]?.id ?? 0,
				event_title: event.event_title ?? "",
				description: event.description ?? "",
				location: event.location ?? "",
				event_date: toInputDate(event.event_date ?? event.event_datetime),
				start_time: toInputTime(event.start_time),
				end_time: toInputTime(event.end_time),
				quota: event.quota ?? "",
				poster: null,
			});

			return;
		}

		setForm({
			...initialEventForm,
			category_id: categories[0]?.id ?? 0,
			poster: null,
		});
	}, [isOpen, mode, event, categories]);

	if (!isOpen) return null;

	const isPending = createEvent.isPending || updateEvent.isPending;
	const isError = createEvent.isError || updateEvent.isError;

	const errorMessage =
		createEvent.error instanceof Error
			? createEvent.error.message
			: updateEvent.error instanceof Error
				? updateEvent.error.message
				: "Gagal menyimpan event";

	const handleChange = (
		e: React.ChangeEvent<
			HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
		>,
	) => {
		const { name, value, type } = e.target;

		if (type === "file" && "files" in e.target) {
			const files = (e.target as HTMLInputElement).files;
			setForm((prev) => ({
				...prev,
				[name]: files && files.length > 0 ? files[0] : null,
			}));
			return;
		}

		setForm((prev) => ({
			...prev,
			[name]: name === "category_id" ? Number(value) : value,
		}));
	};

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();

		if (!form.category_id) return;

		const payload: any = { ...form };
		if (payload.quota === "") {
			delete payload.quota;
		}

		if (mode === "edit" && event) {
			updateEvent.mutate(
				{
					id: event.id,
					data: payload,
				},
				{
					onSuccess: () => {
						if (onSuccess) onSuccess("Event berhasil diperbarui!");
						onClose();
					},
				},
			);

			return;
		}

		createEvent.mutate(payload, {
			onSuccess: () => {
				if (onSuccess) onSuccess("Event berhasil ditambahkan!");
				onClose();
			},
		});
	};

	return (
		<div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
			<div className="bg-white rounded-2xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
				<div className="p-6 border-b border-gray-100 flex items-center justify-between">
					<h3 className="font-semibold text-gray-800 text-lg">
						{mode === "edit" ? "Edit Event" : "Buat Event Baru"}
					</h3>

					<button
						type="button"
						onClick={onClose}
						className="text-gray-400 hover:text-gray-600"
						aria-label="Tutup modal"
					>
						<X size={20} />
					</button>
				</div>

				<form onSubmit={handleSubmit}>
					<div className="p-6 space-y-4">
						<div>
							<label className="text-xs font-medium text-gray-600 mb-1 block">
								Kategori
							</label>

							<FormSelect
								name="category_id"
								value={form.category_id}
								onChange={handleChange}
								disabled={isCategoryLoading || categories.length === 0}
								className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-500 focus:outline-none focus:ring-2 focus:ring-[#7AB2B2] bg-white disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed"
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
							<label className="text-xs font-medium text-gray-600 mb-1 block">
								Poster Event (Opsional)
							</label>

							{mode === "edit" && event?.poster_url && !form.poster && (
								<div className="mb-3">
									<img
										src={event.poster_url}
										alt="Current poster"
										className="h-24 object-cover rounded-xl border border-gray-200"
									/>
								</div>
							)}

							{form.poster && (
								<div className="mb-3">
									<img
										src={URL.createObjectURL(form.poster)}
										alt="Preview poster"
										className="h-24 object-cover rounded-xl border border-gray-200"
									/>
								</div>
							)}

							<FormInput
								type="file"
								name="poster"
								accept="image/jpeg,image/jpg,image/png,image/webp"
								onChange={handleChange}
								className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-500 focus:outline-none focus:ring-2 focus:ring-[#7AB2B2] bg-white file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-[#7AB2B2]/10 file:text-[#236175] hover:file:bg-[#7AB2B2]/20"
							/>
							<p className="text-xs text-gray-400 mt-1">
								Format: JPG, JPEG, PNG, WebP (Max: 5MB)
							</p>
						</div>

						<div>
							<label className="text-xs font-medium text-gray-600 mb-1 block">
								Judul Event
							</label>
							<FormInput
								type="text"
								name="event_title"
								value={form.event_title}
								onChange={handleChange}
								placeholder="Contoh: Reuni Akbar 2025"
								className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-500 focus:outline-none focus:ring-2 focus:ring-[#7AB2B2]"
								required
							/>
						</div>

						<div>
							<label className="text-xs font-medium text-gray-600 mb-1 block">
								Deskripsi
							</label>
							<FormTextarea
								name="description"
								value={form.description}
								onChange={handleChange}
								placeholder="Contoh: Reuni alumni angkatan 2010-2015"
								rows={2}
								className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-500 focus:outline-none focus:ring-2 focus:ring-[#7AB2B2] resize-none"
								required
							/>
						</div>

						<div>
							<label className="text-xs font-medium text-gray-600 mb-1 block">
								Lokasi
							</label>
							<FormInput
								type="text"
								name="location"
								value={form.location}
								onChange={handleChange}
								placeholder="Contoh: Aula Pesantren"
								className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-500 focus:outline-none focus:ring-2 focus:ring-[#7AB2B2]"
								required
							/>
						</div>

						<div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
							<div>
								<label className="text-xs font-medium text-gray-600 mb-1 block">
									Tanggal Event
								</label>
								<FormInput
									type="date"
									name="event_date"
									value={form.event_date}
									onChange={handleChange}
									className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-500 focus:outline-none focus:ring-2 focus:ring-[#7AB2B2]"
									required
								/>
							</div>

							<div>
								<label className="text-xs font-medium text-gray-600 mb-1 block">
									Jam Mulai
								</label>
								<FormInput
									type="time"
									name="start_time"
									value={form.start_time}
									onChange={handleChange}
									className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-500 focus:outline-none focus:ring-2 focus:ring-[#7AB2B2]"
									required
								/>
							</div>

							<div>
								<label className="text-xs font-medium text-gray-600 mb-1 block">
									Jam Selesai
								</label>
								<FormInput
									type="time"
									name="end_time"
									value={form.end_time}
									onChange={handleChange}
									className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-500 focus:outline-none focus:ring-2 focus:ring-[#7AB2B2]"
									required
								/>
							</div>
						</div>

						<div>
							<label className="text-xs font-medium text-gray-600 mb-1 block">
								Kuota Peserta
							</label>
							<FormInput
								type="number"
								name="quota"
								value={form.quota}
								onChange={handleChange}
								placeholder="Kosongkan jika tidak ada batasan kuota"
								min={1}
								className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-500 focus:outline-none focus:ring-2 focus:ring-[#7AB2B2]"
							/>
						</div>

						{isError && (
							<div className="rounded-xl px-4 py-3 text-xs font-medium bg-red-50 text-red-600 border border-red-100">
								{errorMessage}
							</div>
						)}
					</div>

					<div className="p-6 border-t border-gray-100 flex gap-3">
						<button
							type="button"
							onClick={onClose}
							className="flex-1 border border-gray-200 text-gray-600 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors"
						>
							Batal
						</button>

						<button
							type="submit"
							disabled={
								isPending ||
								isCategoryLoading ||
								categories.length === 0 ||
								!form.category_id
							}
							className="flex-1 bg-[#2D7EA0] hover:bg-[#236175] disabled:bg-[#A8D5D5] text-white py-2.5 rounded-xl text-sm font-medium transition-colors flex items-center justify-center gap-2"
						>
							{isPending && (
								<span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
							)}
							{isPending
								? "Menyimpan..."
								: mode === "edit"
									? "Perbarui"
									: "Simpan"}
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
							accent="border-[#7AB2B2]"
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
							accent="border-[#7AB2B2]"
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
									className="text-gray-500 w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#7AB2B2] bg-gray-50"
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
											{broadcastTargetDescriptions[target].label}
										</p>
										<p className="mt-0.5 text-xs text-[#236175]">
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
											className="inline-flex items-center gap-1.5 rounded-lg border border-teal-200 bg-[#7AB2B2]/10 px-3 py-1.5 text-xs font-medium text-[#236175] transition-colors hover:bg-[#7AB2B2]/20"
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
													className="text-gray-500 w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#7AB2B2] bg-gray-50"
												/>
												<button
													type="button"
													onClick={() => removeManualNumber(index)}
													aria-label={`Hapus nomor ${index + 1}`}
													className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-red-100 text-red-500 transition-colors hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
													disabled={
														manualNumbers.length === 1 && !number.trim()
													}
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
									className="text-gray-500 w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#7AB2B2] bg-gray-50 resize-none"
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
								<span className="text-xs bg-[#7AB2B2]/10 text-[#2D7EA0] border border-teal-200 px-2 py-0.5 rounded-full font-medium">
									{target}
								</span>
							</div>
							<div className="min-h-[320px] text-gray-700 whitespace-pre-wrap bg-gray-50 border border-gray-200 rounded-xl p-4 text-sm">
								{target === "custom" && parsedNumbers.validNumbers.length === 0
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
							className="px-5 py-2.5 rounded-xl bg-[#2D7EA0] hover:bg-[#236175] text-white text-sm font-medium transition-colors disabled:opacity-60 flex items-center gap-2"
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
	onEdit,
	onDelete,
	onBroadcast,
}: {
	event: Event;
	onEdit: (event: Event) => void;
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
				<span className="text-xs bg-[#7AB2B2]/10 text-[#2D7EA0] border border-teal-200 px-2 py-0.5 rounded-full font-medium whitespace-nowrap ml-2">
					Mendatang
				</span>
			</div>

			<span className="inline-block text-xs bg-gray-100 text-gray-600 px-3 py-1 rounded-full mb-3">
				{event.category}
			</span>

			<div className="space-y-1.5 text-sm text-gray-500">
				<div className="flex items-center gap-2">
					<Icon3D size="sm" variant="teal">
						<CalendarDays size={15} />
					</Icon3D>
					<span>
						{date} • {time}
					</span>
				</div>

				<div className="flex items-center gap-2">
					<Icon3D size="sm" variant="blue">
						<MapPin size={15} />
					</Icon3D>
					<span>{event.location}</span>
				</div>
			</div>

			<div className="flex gap-2 mt-4">
				<button
					onClick={() => onEdit(event)}
					className="flex-1 text-xs border border-teal-200 text-[#2D7EA0] hover:bg-[#7AB2B2]/10 py-1.5 rounded-lg transition-colors flex items-center justify-center gap-1.5"
				>
					<Pencil size={13} />
					Edit
				</button>

				<button
					onClick={() => onBroadcast(event)}
					className="flex-1 text-xs border border-green-200 text-green-600 hover:bg-green-50 py-1.5 rounded-lg transition-colors flex items-center justify-center gap-1.5"
				>
					<Megaphone size={13} />
					WA
				</button>

				<button
					onClick={() => onDelete(event.id)}
					className="flex-1 text-xs border border-red-100 text-red-400 hover:bg-red-50 py-1.5 rounded-lg transition-colors flex items-center justify-center gap-1.5"
				>
					<Trash2 size={13} />
					Hapus
				</button>
			</div>
		</div>
	);
}

// ─── Event Card (Selesai) ─────────────────────────────────────────────────────
function EventCardDone({
	event,
	onEdit,
	onDelete,
	onBroadcast,
}: {
	event: Event;
	onEdit: (event: Event) => void;
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
					<Icon3D size="sm" variant="gray">
						<CalendarDays size={15} />
					</Icon3D>
					<span>
						{date} • {time}
					</span>
				</div>

				<div className="flex items-center gap-2">
					<Icon3D size="sm" variant="blue">
						<MapPin size={15} />
					</Icon3D>
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
							className="bg-[#3EBDAF] h-2 rounded-full transition-all"
							style={{ width: `${pct}%` }}
						/>
					</div>

					<p className="text-xs text-gray-400 mt-1 text-right">{pct}% terisi</p>
				</div>
			)}

			<div className="flex gap-2 mt-4">
				<button
					onClick={() => onEdit(event)}
					className="flex-1 text-xs border border-teal-200 text-[#2D7EA0] hover:bg-[#7AB2B2]/10 py-1.5 rounded-lg transition-colors flex items-center justify-center gap-1.5"
				>
					<Pencil size={13} />
					Edit
				</button>

				<button
					onClick={() => onBroadcast(event)}
					className="flex-1 text-xs border border-green-200 text-green-600 hover:bg-green-50 py-1.5 rounded-lg transition-colors flex items-center justify-center gap-1.5"
				>
					<Megaphone size={13} />
					WA
				</button>

				<button
					onClick={() => onDelete(event.id)}
					className="flex-1 text-xs border border-red-100 text-red-400 hover:bg-red-50 py-1.5 rounded-lg transition-colors flex items-center justify-center gap-1.5"
				>
					<Trash2 size={13} />
					Hapus
				</button>
			</div>
		</div>
	);
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function KelolEventPage() {
	const [search, setSearch] = useState("");
	const [isEventModalOpen, setIsEventModalOpen] = useState(false);
	const [eventModalMode, setEventModalMode] = useState<EventFormMode>("create");
	const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
	const [broadcastEvent, setBroadcastEvent] = useState<Event | null>(null);
	const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

	const showToast = (message: string, type: "success" | "error" = "success") => {
		setToast({ message, type });
		setTimeout(() => setToast(null), 3000);
	};

	const {
		data: events = [],
		isLoading,
		isError,
		error,
	} = useEvents(search, 10);

	const deleteEvent = useDeleteEvent();

	const handleCreate = () => {
		setEventModalMode("create");
		setSelectedEvent(null);
		setIsEventModalOpen(true);
	};

	const handleEdit = (event: Event) => {
		setEventModalMode("edit");
		setSelectedEvent(event);
		setIsEventModalOpen(true);
	};

	const handleCloseEventModal = () => {
		setIsEventModalOpen(false);
		setSelectedEvent(null);
	};

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
		<div className="h-screen bg-gray-100 flex overflow-hidden">
			<AdminSidebar />

			<div className="flex-1 ml-56 flex flex-col h-screen">
				<AdminHeader title="Kelola Event" />

				<main className="flex-1 overflow-y-auto p-5">
					<div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mb-5">
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
							accent="border-[#7AB2B2]"
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

					<div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-4 mb-5">
						<div className="flex items-center justify-between">
							<div>
								<h2 className="text-base font-bold text-gray-800">
									Manajemen Event
								</h2>
								<p className="text-xs text-gray-400">Kelola semua data acara</p>
							</div>

							<button
								onClick={handleCreate}
								className="flex items-center gap-2 bg-[#2D7EA0] hover:bg-[#236175] text-white px-4 py-2.5 rounded-xl font-medium text-sm transition-colors shadow-sm"
							>
								<span className="w-7 h-7 inline-flex items-center justify-center rounded-xl bg-white/20 shadow-inner border border-white/30">
									<Plus size={16} />
								</span>
								Buat Event Baru
							</button>
						</div>

						<SearchInput
							leadingIcon={<Search size={16} className="text-gray-400" />}
							wrapperClassName="flex items-center gap-2 w-full px-4 py-2.5 border border-gray-200 rounded-xl mb-4 focus-within:border-[#3EBDAF] bg-white"
							placeholder="Cari nama atau email..."
							value={search}
							onValueChange={setSearch}
							className="w-full bg-transparent outline-none text-sm text-gray-800 placeholder-gray-400"
						/>


						{isLoading && (
							<div className="space-y-6">
								<div>
									<div className="h-4 bg-gray-200 rounded w-32 mb-4 animate-pulse" />
									<div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
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
											<Icon3D variant="teal">
												<CalendarDays size={18} />
											</Icon3D>
											<h3 className="font-semibold text-gray-700">
												Event Mendatang
											</h3>
										</div>

										<div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
											{upcoming.map((e) => (
												<EventCardUpcoming
													key={e.id}
													event={e}
													onEdit={handleEdit}
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
											<Icon3D variant="gray">
												<Clock3 size={18} />
											</Icon3D>
											<h3 className="font-semibold text-gray-700">
												Event Selesai
											</h3>
										</div>

										<div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
											{done.map((e) => (
												<EventCardDone
													key={e.id}
													event={e}
													onEdit={handleEdit}
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

			<EventFormModal
				isOpen={isEventModalOpen}
				mode={eventModalMode}
				event={selectedEvent}
				onClose={handleCloseEventModal}
				onSuccess={showToast}
			/>

			{broadcastEvent && (
				<BroadcastModal
					event={broadcastEvent}
					isOpen={!!broadcastEvent}
					onClose={() => setBroadcastEvent(null)}
				/>
			)}

			{toast && <Toast type={toast.type} message={toast.message} />}
		</div>
	);
}
