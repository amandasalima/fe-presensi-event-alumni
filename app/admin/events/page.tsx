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
	Eye,
	Users,
} from "lucide-react";
import AdminSidebar from "@/app/components/AdminSidebar";
import AdminHeader from "@/app/components/AdminHeader";
import {
	FormInput,
	FormSelect,
	FormTextarea,
} from "@/app/components/FormControl";
import SearchInput from "@/app/components/SearchInput";
import { getApiErrorMessage, getApiFieldErrors } from "@/lib/api";
import {
	useEvents,
	useCreateEvent,
	useUpdateEvent,
	useDeleteEvent,
	useEventCategories,
	useEvent,
	useEventRegistrations,
	type Event,
	type EventPayload,
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

type EventFormErrors = Partial<Record<keyof EventFormState, string[]>>;

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

	const date = new Date(value);
	if (Number.isNaN(date.getTime())) {
		if (value.includes("T")) {
			return value.split("T")[0];
		}
		return value.slice(0, 10);
	}

	const year = date.getFullYear();
	const month = String(date.getMonth() + 1).padStart(2, "0");
	const day = String(date.getDate()).padStart(2, "0");

	return `${year}-${month}-${day}`;
}

function toInputTime(value?: string | null) {
	if (!value) return "";

	return value.slice(0, 5);
}

function getRegisteredCount(event: Event) {
	return event.quota_used ?? event.registered ?? 0;
}

function getRemainingQuota(event: Event) {
	return event.remaining_quota ?? null;
}

function getQuotaPercent(event: Event) {
	if (!event.quota) return 0;

	return Math.min(
		Math.round((getRegisteredCount(event) / event.quota) * 100),
		100,
	);
}

function getQuotaLabel(event: Event) {
	if (event.quota === null || event.quota === undefined || event.quota_status === "unlimited") {
		return "Tidak terbatas";
	}

	return `${getRegisteredCount(event)}/${event.quota}`;
}

function getRemainingQuotaLabel(event: Event) {
	const remainingQuota = getRemainingQuota(event);
	return remainingQuota === null ? "Tidak terbatas" : remainingQuota;
}

function formatDateTimeIndonesia(value?: string | null) {
	if (!value) return "-";

	const date = new Date(value);
	if (Number.isNaN(date.getTime())) return "-";

	const datePart = date.toLocaleDateString("id-ID", {
		day: "numeric",
		month: "long",
		year: "numeric",
	});
	const timeParts = new Intl.DateTimeFormat("id-ID", {
		hour: "2-digit",
		minute: "2-digit",
		hour12: false,
	}).formatToParts(date);
	const hour = timeParts.find((part) => part.type === "hour")?.value ?? "00";
	const minute = timeParts.find((part) => part.type === "minute")?.value ?? "00";

	return `${datePart}, ${hour}:${minute}`;
}

function isValidPoster(file: File) {
	const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

	return validTypes.includes(file.type) && file.size <= 5 * 1024 * 1024;
}

function hasEventValueChanged(
	key: keyof EventFormState,
	nextValue: EventFormState[keyof EventFormState],
	event: Event,
) {
	if (key === "poster") return nextValue instanceof File;
	if (key === "category_id") return Number(nextValue) !== (event.category_id ?? 0);
	if (key === "quota") {
		const currentQuota = event.quota ?? "";
		return nextValue !== currentQuota;
	}

	if (key === "event_date") {
		return nextValue !== toInputDate(event.event_date ?? event.event_datetime);
	}

	if (key === "start_time") return nextValue !== toInputTime(event.start_time);
	if (key === "end_time") return nextValue !== toInputTime(event.end_time);

	return nextValue !== event[key as keyof Event];
}

function buildChangedEventPayload(form: EventFormState, event: Event) {
	const payload: Partial<EventPayload> = {};

	(Object.keys(form) as Array<keyof EventFormState>).forEach((key) => {
		const value = form[key];
		if (value === "" || value === null || value === undefined) return;

		if (hasEventValueChanged(key, value, event)) {
			if (key === "quota") {
				payload.quota = Number(value);
			} else if (key === "poster") {
				payload.poster = value as File;
			} else {
				payload[key] = value as never;
			}
		}
	});

	return payload;
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
	const [formErrors, setFormErrors] = useState<EventFormErrors>({});

	useEffect(() => {
		if (!isOpen) return;

		if (mode === "edit" && event) {
			const matchedCategory = categories.find(
				(category) => category.category_name === event.category,
			);

			queueMicrotask(() => {
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
				setFormErrors({});
			});

			return;
		}

		queueMicrotask(() => {
			setForm({
				...initialEventForm,
				category_id: categories[0]?.id ?? 0,
				poster: null,
			});
			setFormErrors({});
		});
	}, [isOpen, mode, event, categories]);

	if (!isOpen) return null;

	const isPending = createEvent.isPending || updateEvent.isPending;
	const isError = createEvent.isError || updateEvent.isError;

	const errorMessage =
		createEvent.isError
			? getApiErrorMessage(createEvent.error, "Gagal menyimpan event")
			: updateEvent.isError
				? getApiErrorMessage(updateEvent.error, "Gagal menyimpan event")
				: "Gagal menyimpan event";

	const getFieldError = (field: keyof EventFormState) =>
		formErrors[field]?.[0] ?? "";

	const handleChange = (
		e: React.ChangeEvent<
			HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
		>,
	) => {
		const { name, value, type } = e.target;

		if (type === "file" && "files" in e.target) {
			const files = (e.target as HTMLInputElement).files;
			const file = files && files.length > 0 ? files[0] : null;

			if (file && !isValidPoster(file)) {
				setFormErrors((prev) => ({
					...prev,
					poster: ["Poster harus JPG, JPEG, PNG, atau WebP dan maksimal 5MB."],
				}));
				setForm((prev) => ({
					...prev,
					[name]: null,
				}));
				return;
			}

			setFormErrors((prev) => ({ ...prev, poster: undefined }));
			setForm((prev) => ({
				...prev,
				[name]: file,
			}));
			return;
		}

		setFormErrors((prev) => ({ ...prev, [name]: undefined }));
		setForm((prev) => ({
			...prev,
			[name]: name === "category_id" ? Number(value) : value,
		}));
	};

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();

		const nextErrors: EventFormErrors = {};

		if (!form.category_id) {
			nextErrors.category_id = ["Kategori wajib dipilih."];
		}

		if (!/^\d{4}-\d{2}-\d{2}$/.test(form.event_date)) {
			nextErrors.event_date = ["Tanggal event harus berformat YYYY-MM-DD."];
		}

		if (form.start_time && form.end_time && form.end_time <= form.start_time) {
			nextErrors.end_time = ["Jam selesai harus lebih besar dari jam mulai."];
		}

		if (form.poster && !isValidPoster(form.poster)) {
			nextErrors.poster = ["Poster harus JPG, JPEG, PNG, atau WebP dan maksimal 5MB."];
		}

		if (Object.keys(nextErrors).length > 0) {
			setFormErrors(nextErrors);
			return;
		}

		const payload: EventPayload = {
			category_id: form.category_id,
			event_title: form.event_title,
			description: form.description,
			location: form.location,
			event_date: form.event_date,
			start_time: form.start_time,
			end_time: form.end_time,
			poster: form.poster,
			...(form.quota === "" ? {} : { quota: form.quota }),
		};

		if (mode === "edit" && event) {
			const changedPayload = buildChangedEventPayload(form, event);

			updateEvent.mutate(
				{
					id: event.id,
					data: changedPayload,
				},
				{
					onSuccess: () => {
						setFormErrors({});
						if (onSuccess) onSuccess("Event berhasil diperbarui!");
						onClose();
					},
					onError: (error) => {
						setFormErrors(getApiFieldErrors(error));
					},
				},
			);

			return;
		}

		createEvent.mutate(payload, {
			onSuccess: () => {
				setFormErrors({});
				if (onSuccess) onSuccess("Event berhasil ditambahkan!");
				onClose();
			},
			onError: (error) => {
				setFormErrors(getApiFieldErrors(error));
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
							{getFieldError("category_id") && (
								<p className="text-xs text-red-500 mt-1">
									{getFieldError("category_id")}
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
							{getFieldError("poster") && (
								<p className="text-xs text-red-500 mt-1">
									{getFieldError("poster")}
								</p>
							)}
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
							{getFieldError("event_title") && (
								<p className="text-xs text-red-500 mt-1">
									{getFieldError("event_title")}
								</p>
							)}
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
							/>
							{getFieldError("description") && (
								<p className="text-xs text-red-500 mt-1">
									{getFieldError("description")}
								</p>
							)}
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
							{getFieldError("location") && (
								<p className="text-xs text-red-500 mt-1">
									{getFieldError("location")}
								</p>
							)}
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
								{getFieldError("event_date") && (
									<p className="text-xs text-red-500 mt-1">
										{getFieldError("event_date")}
									</p>
								)}
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
								{getFieldError("start_time") && (
									<p className="text-xs text-red-500 mt-1">
										{getFieldError("start_time")}
									</p>
								)}
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
								{getFieldError("end_time") && (
									<p className="text-xs text-red-500 mt-1">
										{getFieldError("end_time")}
									</p>
								)}
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
							{getFieldError("quota") && (
								<p className="text-xs text-red-500 mt-1">
									{getFieldError("quota")}
								</p>
							)}
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
									getApiErrorMessage(
										sendEventBroadcast.error,
										"Broadcast belum berhasil dikirim. Silakan coba lagi.",
									)}
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

function DetailItem({
	label,
	value,
}: {
	label: string;
	value: React.ReactNode;
}) {
	return (
		<div className="rounded-xl border border-gray-100 bg-gray-50 px-4 py-3">
			<p className="text-xs font-medium text-gray-400">{label}</p>
			<div className="mt-1 text-sm font-medium text-gray-800 break-words">
				{value ?? "-"}
			</div>
		</div>
	);
}

function EventRegistrationsModal({
	event,
	isOpen,
	onClose,
}: {
	event: Event | null;
	isOpen: boolean;
	onClose: () => void;
}) {
	const { data, isLoading, isError, error } = useEventRegistrations(
		event?.id ?? null,
		undefined,
		100,
	);

	if (!isOpen || !event) return null;

	const summary = data?.summary;
	const registrations = data?.registrations ?? [];
	const quotaFull = summary?.is_quota_full ?? event.is_quota_full;
	const quotaMessage =
		summary?.quota_message || event.quota_message || "Kuota penuh, segera hubungi penyelenggara";
	const quotaValue = summary?.quota ?? event.quota;
	const quotaUsed = summary?.quota_used ?? event.quota_used ?? event.registered ?? 0;
	const remainingQuota = summary?.remaining_quota ?? event.remaining_quota;

	return (
		<div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
			<div className="bg-white rounded-2xl shadow-xl w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
				<div className="p-6 border-b border-gray-100 flex items-start justify-between gap-4">
					<div>
						<h3 className="font-semibold text-gray-800 text-lg">
							Detail Pendaftar Event
						</h3>
						<p className="text-sm text-gray-400 mt-1">{event.event_title}</p>
					</div>

					<button
						type="button"
						onClick={onClose}
						className="text-gray-400 hover:text-gray-600"
						aria-label="Tutup daftar pendaftar"
					>
						<X size={20} />
					</button>
				</div>

				<div className="p-6 space-y-4 overflow-y-auto">
					<div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
						<StatCard
							label="Total Terdaftar"
							value={summary?.total_registered ?? registrations.length}
							sub="Pendaftar event"
							accent="border-blue-400"
						/>
						<StatCard
							label="Total Hadir"
							value={summary?.total_attended ?? 0}
							sub="Sudah scan QR"
							accent="border-emerald-400"
						/>
						<StatCard
							label="Kuota"
							value={quotaValue === null || quotaValue === undefined ? "Tidak terbatas" : `${quotaUsed}/${quotaValue}`}
							sub="Terpakai/kapasitas"
							accent="border-[#7AB2B2]"
						/>
						<StatCard
							label="Sisa Kuota"
							value={remainingQuota === null || remainingQuota === undefined ? "Tidak terbatas" : remainingQuota}
							sub="Dari backend"
							accent="border-[#7AB2B2]"
						/>
					</div>

					{quotaFull && (
						<div className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
							{quotaMessage}
						</div>
					)}

					{isError && (
						<div className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">
							{getApiErrorMessage(error, "Gagal memuat data pendaftar")}
						</div>
					)}

					<div className="overflow-x-auto border border-gray-100 rounded-2xl">
						<table className="w-full text-sm">
							<thead>
								<tr className="bg-gray-50 border-b border-gray-100">
									{[
										"Nama",
										"Email",
										"No HP",
										"Angkatan",
										"Status pendaftaran / kehadiran",
										"Jam daftar",
										"Jam scan QR",
									].map((header) => (
										<th
											key={header}
											className="text-left px-4 py-3 text-gray-500 font-medium whitespace-nowrap"
										>
											{header}
										</th>
									))}
								</tr>
							</thead>
							<tbody>
								{isLoading ? (
									[1, 2, 3].map((item) => (
										<tr key={item} className="border-b border-gray-50 animate-pulse">
											{Array.from({ length: 7 }).map((_, index) => (
												<td key={index} className="px-4 py-3">
													<div className="h-4 bg-gray-100 rounded w-24" />
												</td>
											))}
										</tr>
									))
								) : registrations.length === 0 ? (
									<tr>
										<td colSpan={7} className="text-center py-8 text-gray-400">
											Belum ada pendaftar untuk event ini
										</td>
									</tr>
								) : (
									registrations.map((registration, index) => {
										const attendance = registration.attendance;
										const registeredAt =
											registration.registered_at || attendance?.registered_at;
										const attendanceStatus = attendance?.status || "-";

										return (
											<tr
												key={registration.id ?? index}
												className="border-b border-gray-50 hover:bg-gray-50 transition-colors"
											>
												<td className="px-4 py-3 font-medium text-gray-800">
													{registration.user?.name ?? `User #${registration.user_id}`}
												</td>
												<td className="px-4 py-3 text-gray-500">
													{registration.user?.email ?? "-"}
												</td>
												<td className="px-4 py-3 text-gray-500">
													{registration.user?.phone ?? "-"}
												</td>
												<td className="px-4 py-3 text-gray-500">
													{registration.user?.angkatan ?? registration.user?.graduation_year ?? "-"}
												</td>
												<td className="px-4 py-3 text-gray-500">
													{registration.status} / {attendanceStatus}
												</td>
												<td className="px-4 py-3 text-gray-500 whitespace-nowrap">
													{formatDateTimeIndonesia(registeredAt)}
												</td>
												<td className="px-4 py-3 text-gray-500 whitespace-nowrap">
													{formatDateTimeIndonesia(attendance?.scanned_at)}
												</td>
											</tr>
										);
									})
								)}
							</tbody>
						</table>
					</div>
				</div>
			</div>
		</div>
	);
}

function EventDetailModal({
	eventId,
	fallbackEvent,
	isOpen,
	onClose,
}: {
	eventId: number | null;
	fallbackEvent: Event | null;
	isOpen: boolean;
	onClose: () => void;
}) {
	const {
		data: detailEvent,
		isLoading,
		isError,
		error,
		isFetching,
	} = useEvent(eventId ?? 0, isOpen ? 5000 : false);

	if (!isOpen) return null;

	const event = detailEvent ?? fallbackEvent;
	const { date, time } = event
		? parseEventDate(event)
		: { date: "-", time: "-" };
	const registered = event ? getRegisteredCount(event) : 0;
	const quotaPercent = event ? getQuotaPercent(event) : 0;

	return (
		<div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
			<div className="bg-white rounded-2xl shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
				<div className="p-6 border-b border-gray-100 flex items-start justify-between gap-4">
					<div>
						<h3 className="font-semibold text-gray-800 text-lg">
							Detail Event
						</h3>
						<p className="text-xs text-gray-400 mt-1">
							{isFetching ? "Memperbarui data..." : "Data event terbaru"}
						</p>
					</div>

					<button
						type="button"
						onClick={onClose}
						className="text-gray-400 hover:text-gray-600"
						aria-label="Tutup detail event"
					>
						<X size={20} />
					</button>
				</div>

				<div className="p-6 space-y-5">
					{isLoading && !event && (
						<div className="space-y-3">
							<div className="h-5 bg-gray-100 rounded w-2/3 animate-pulse" />
							<div className="h-28 bg-gray-100 rounded-2xl animate-pulse" />
							<div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
								{[1, 2, 3, 4].map((item) => (
									<div
										key={item}
										className="h-16 bg-gray-100 rounded-xl animate-pulse"
									/>
								))}
							</div>
						</div>
					)}

					{isError && !event && (
						<div className="rounded-xl px-4 py-3 text-sm bg-red-50 text-red-600 border border-red-100">
							{getApiErrorMessage(error, "Gagal memuat detail event")}
						</div>
					)}

					{event && (
						<>
							<div className="flex flex-col sm:flex-row gap-5">
								<div className="w-full sm:w-44 shrink-0">
									{event.poster_url ? (
										<img
											src={event.poster_url}
											alt={event.event_title}
											className="h-44 w-full rounded-2xl border border-gray-100 object-cover bg-gray-50"
										/>
									) : (
										<div className="h-44 w-full rounded-2xl border border-dashed border-gray-200 bg-gray-50 grid place-items-center text-sm text-gray-400">
											Tanpa poster
										</div>
									)}
								</div>

								<div className="flex-1 min-w-0">
									<div className="flex flex-wrap items-center gap-2 mb-3">
										<span
											className={`text-xs px-2.5 py-1 rounded-full font-medium border ${
												event.status_event === "Mendatang"
													? "bg-[#7AB2B2]/10 text-[#2D7EA0] border-teal-200"
													: "bg-gray-50 text-gray-500 border-gray-200"
											}`}
										>
											{event.status_event}
										</span>
										<span className="text-xs bg-gray-100 text-gray-600 px-2.5 py-1 rounded-full">
											{event.category}
										</span>
										{event.is_quota_full && (
											<span className="text-xs bg-red-50 text-red-600 border border-red-100 px-2.5 py-1 rounded-full font-medium">
												Penuh
											</span>
										)}
									</div>

									<h4 className="text-xl font-bold text-gray-800 leading-tight">
										{event.event_title}
									</h4>
									<p className="mt-3 text-sm text-gray-500 whitespace-pre-wrap">
										{event.description || "Tidak ada deskripsi."}
									</p>
								</div>
							</div>

							<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
								<StatCard
									label="Terdaftar"
									value={registered}
									sub="Peserta saat ini"
									accent="border-blue-400"
								/>
								<StatCard
									label="Kuota"
									value={getQuotaLabel(event)}
									sub="Kapasitas awal"
									accent="border-[#7AB2B2]"
								/>
								<StatCard
									label="Sisa Kuota"
									value={getRemainingQuotaLabel(event)}
									sub="Update otomatis"
									accent="border-emerald-400"
								/>
								<StatCard
									label="Terisi"
									value={event.quota ? `${quotaPercent}%` : "-"}
									sub="Persentase"
									accent="border-[#7AB2B2]"
								/>
							</div>

							{event.is_quota_full && (
								<div className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
									{event.quota_message || "Kuota penuh, segera hubungi penyelenggara"}
								</div>
							)}

							{event.quota && (
								<div>
									<div className="flex justify-between text-sm text-gray-600 mb-1.5">
										<span>Progress kuota</span>
										<span className="font-medium">
											{registered} / {event.quota}
										</span>
									</div>
									<div className="w-full bg-gray-100 rounded-full h-2.5">
										<div
											className="bg-[#3EBDAF] h-2.5 rounded-full transition-all"
											style={{ width: `${quotaPercent}%` }}
										/>
									</div>
								</div>
							)}

							<div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
								<DetailItem label="Tanggal" value={date} />
								<DetailItem
									label="Waktu"
									value={`${time} - ${event.end_time?.slice(0, 5) || "-"}`}
								/>
								<DetailItem label="Lokasi" value={event.location} />
								<DetailItem label="Kategori ID" value={event.category_id ?? "-"} />
								<DetailItem
									label="Dibuat"
									value={
										event.created_at
											? new Date(event.created_at).toLocaleString("id-ID")
											: "-"
									}
								/>
								<DetailItem
									label="Diperbarui"
									value={
										event.updated_at
											? new Date(event.updated_at).toLocaleString("id-ID")
											: "-"
									}
								/>
							</div>
						</>
					)}
				</div>
			</div>
		</div>
	);
}

// ─── Event Card (Mendatang) ───────────────────────────────────────────────────
function EventCardUpcoming({
	event,
	onDetail,
	onEdit,
	onDelete,
	onBroadcast,
	onRegistrations,
}: {
	event: Event;
	onDetail: (event: Event) => void;
	onEdit: (event: Event) => void;
	onDelete: (id: number) => void;
	onBroadcast: (event: Event) => void;
	onRegistrations: (event: Event) => void;
}) {
	const { date, time } = parseEventDate(event);
	const registered = getRegisteredCount(event);
	const remainingQuota = getRemainingQuota(event);
	const pct = getQuotaPercent(event);

	return (
		<div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow">
			<div className="flex items-start justify-between mb-3">
				<h3 className="font-semibold text-gray-800 text-base leading-tight">
					{event.event_title}
				</h3>
				<span className="text-xs bg-[#7AB2B2]/10 text-[#2D7EA0] border border-teal-200 px-2 py-0.5 rounded-full font-medium whitespace-nowrap ml-2">
					Mendatang
				</span>
				{event.is_quota_full && (
					<span className="text-xs bg-red-50 text-red-600 border border-red-100 px-2 py-0.5 rounded-full font-medium whitespace-nowrap">
						Penuh
					</span>
				)}
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

			<div className="mt-4">
				{event.quota === null || event.quota === undefined || event.quota_status === "unlimited" ? (
					<div className="rounded-xl border border-gray-100 bg-gray-50 px-3 py-2 text-sm text-gray-600">
						<p className="font-medium">Kuota: Tidak terbatas</p>
						<p className="text-xs text-gray-400 mt-0.5">Sisa kuota: Tidak terbatas</p>
					</div>
				) : (
					<>
					<div className="flex justify-between text-sm text-gray-600 mb-1.5">
						<span>Kuota</span>
						<span className="font-medium">
							{registered}/{event.quota}
						</span>
					</div>
					<p className="text-xs text-gray-400 mb-1.5">
						Sisa kuota: {remainingQuota ?? 0}
					</p>

					<div className="w-full bg-gray-100 rounded-full h-2">
						<div
							className="bg-[#3EBDAF] h-2 rounded-full transition-all"
							style={{ width: `${pct}%` }}
						/>
					</div>

					<p className="text-xs text-gray-400 mt-1 text-right">
						{registered} terdaftar
					</p>
					</>
				)}
				{event.is_quota_full && (
					<p className="text-xs text-red-500 mt-2">
						{event.quota_message || "Kuota penuh, segera hubungi penyelenggara"}
					</p>
				)}
			</div>

			<div className="grid grid-cols-2 gap-2 mt-4">
				<button
					onClick={() => onDetail(event)}
					className="flex-1 text-xs border border-blue-100 text-blue-600 hover:bg-blue-50 py-1.5 rounded-lg transition-colors flex items-center justify-center gap-1.5"
				>
					<Eye size={13} />
					Detail
				</button>

				<button
					onClick={() => onRegistrations(event)}
					className="flex-1 text-xs border border-blue-100 text-blue-600 hover:bg-blue-50 py-1.5 rounded-lg transition-colors flex items-center justify-center gap-1.5"
				>
					<Users size={13} />
					Pendaftar
				</button>

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
	onDetail,
	onEdit,
	onDelete,
	onBroadcast,
	onRegistrations,
}: {
	event: Event;
	onDetail: (event: Event) => void;
	onEdit: (event: Event) => void;
	onDelete: (id: number) => void;
	onBroadcast: (event: Event) => void;
	onRegistrations: (event: Event) => void;
}) {
	const { date, time } = parseEventDate(event);
	const registered = getRegisteredCount(event);
	const remainingQuota = getRemainingQuota(event);
	const pct = getQuotaPercent(event);

	return (
		<div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow">
			<div className="flex items-start justify-between mb-3">
				<h3 className="font-semibold text-gray-800 text-base leading-tight">
					{event.event_title}
				</h3>

				<span className="text-xs bg-gray-100 text-gray-500 border border-gray-200 px-2 py-0.5 rounded-full font-medium whitespace-nowrap ml-2">
					Selesai
				</span>
				{event.is_quota_full && (
					<span className="text-xs bg-red-50 text-red-600 border border-red-100 px-2 py-0.5 rounded-full font-medium whitespace-nowrap">
						Penuh
					</span>
				)}
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

			<div>
				{event.quota === null || event.quota === undefined || event.quota_status === "unlimited" ? (
					<div className="rounded-xl border border-gray-100 bg-gray-50 px-3 py-2 text-sm text-gray-600">
						<p className="font-medium">Kuota: Tidak terbatas</p>
						<p className="text-xs text-gray-400 mt-0.5">Sisa kuota: Tidak terbatas</p>
					</div>
				) : (
					<>
					<div className="flex justify-between text-sm text-gray-600 mb-1.5">
						<span>Kuota</span>
						<span className="font-medium">
							{registered} / {event.quota}
						</span>
					</div>

					<div className="w-full bg-gray-100 rounded-full h-2">
						<div
							className="bg-[#3EBDAF] h-2 rounded-full transition-all"
							style={{ width: `${pct}%` }}
						/>
					</div>

					<p className="text-xs text-gray-400 mt-1 text-right">
						{pct}% terisi
						{remainingQuota !== null ? ` • sisa ${remainingQuota}` : ""}
					</p>
					</>
				)}
				{event.is_quota_full && (
					<p className="text-xs text-red-500 mt-2">
						{event.quota_message || "Kuota penuh, segera hubungi penyelenggara"}
					</p>
				)}
			</div>

			<div className="grid grid-cols-2 gap-2 mt-4">
				<button
					onClick={() => onDetail(event)}
					className="flex-1 text-xs border border-blue-100 text-blue-600 hover:bg-blue-50 py-1.5 rounded-lg transition-colors flex items-center justify-center gap-1.5"
				>
					<Eye size={13} />
					Detail
				</button>

				<button
					onClick={() => onRegistrations(event)}
					className="flex-1 text-xs border border-blue-100 text-blue-600 hover:bg-blue-50 py-1.5 rounded-lg transition-colors flex items-center justify-center gap-1.5"
				>
					<Users size={13} />
					Pendaftar
				</button>

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
	const [detailEvent, setDetailEvent] = useState<Event | null>(null);
	const [registrationsEvent, setRegistrationsEvent] = useState<Event | null>(null);
	const [broadcastEvent, setBroadcastEvent] = useState<Event | null>(null);
	const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
	const [activeTab, setActiveTab] = useState<"upcoming" | "done">("upcoming");

	const showToast = (message: string, type: "success" | "error" = "success") => {
		setToast({ message, type });
		setTimeout(() => setToast(null), 3000);
	};

	const {
		data: events = [],
		isLoading,
		isError,
		error,
	} = useEvents(search, 10, undefined, undefined, 5000);

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

	const handleDetail = (event: Event) => {
		setDetailEvent(event);
	};

	const handleRegistrations = (event: Event) => {
		setRegistrationsEvent(event);
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
							placeholder="Cari event..."
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
									{getApiErrorMessage(
										error,
										"Data event belum berhasil dimuat. Silakan coba lagi.",
									)}
								</p>
							</div>
						)}

						{!isLoading && !isError && (
							<>
								{filtered.length === 0 ? (
									<div className="text-center py-12 text-gray-400">
										<p className="text-4xl mb-3">📭</p>
										<p className="text-sm">Tidak ada event ditemukan</p>
									</div>
								) : (
									<>
										<div className="flex gap-2 p-1 bg-gray-100 rounded-xl w-fit mb-4">
											<button
												onClick={() => setActiveTab("upcoming")}
												className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all ${
													activeTab === "upcoming"
														? "bg-white text-gray-800 shadow-sm"
														: "text-gray-500 hover:text-gray-700"
												}`}
											>
												Mendatang ({upcoming.length})
											</button>
											<button
												onClick={() => setActiveTab("done")}
												className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all ${
													activeTab === "done"
														? "bg-white text-gray-800 shadow-sm"
														: "text-gray-500 hover:text-gray-700"
												}`}
											>
												Selesai ({done.length})
											</button>
										</div>

										{activeTab === "upcoming" && (
											<div>
												{upcoming.length === 0 ? (
													<div className="text-center py-12 text-gray-400 bg-white border border-gray-100 rounded-2xl">
														<p className="text-4xl mb-3">📅</p>
														<p className="text-sm">Tidak ada event mendatang</p>
													</div>
												) : (
													<div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
														{upcoming.map((e) => (
															<EventCardUpcoming
																key={e.id}
																event={e}
																onDetail={handleDetail}
																onEdit={handleEdit}
																onDelete={handleDelete}
																onBroadcast={handleOpenBroadcast}
																onRegistrations={handleRegistrations}
															/>
														))}
													</div>
												)}
											</div>
										)}

										{activeTab === "done" && (
											<div>
												{done.length === 0 ? (
													<div className="text-center py-12 text-gray-400 bg-white border border-gray-100 rounded-2xl">
														<p className="text-4xl mb-3">🕒</p>
														<p className="text-sm">Tidak ada event selesai</p>
													</div>
												) : (
													<div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
														{done.map((e) => (
															<EventCardDone
																key={e.id}
																event={e}
																onDetail={handleDetail}
																onEdit={handleEdit}
																onDelete={handleDelete}
																onBroadcast={handleOpenBroadcast}
																onRegistrations={handleRegistrations}
															/>
														))}
													</div>
												)}
											</div>
										)}
									</>
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

			<EventDetailModal
				eventId={detailEvent?.id ?? null}
				fallbackEvent={detailEvent}
				isOpen={!!detailEvent}
				onClose={() => setDetailEvent(null)}
			/>

			<EventRegistrationsModal
				event={registrationsEvent}
				isOpen={!!registrationsEvent}
				onClose={() => setRegistrationsEvent(null)}
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
