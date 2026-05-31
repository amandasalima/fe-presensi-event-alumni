"use client";

import { useState } from "react";
import AdminSidebar from "@/app/components/AdminSidebar";
import AdminHeader from "@/app/components/AdminHeader";
import SearchInput from "@/app/components/SearchInput";
import {
	useEvents,
	useCreateEvent,
	useDeleteEvent,
	useEventCategories,
	type Event,
} from "@/hooks/admin/useEvents";

// ─── Helpers ─────────────────────────────────────────────────────────────────
function parseEventDate(event: Event) {
	const monthNames = [
		"Jan",
		"Feb",
		"Mar",
		"Apr",
		"Mei",
		"Jun",
		"Jul",
		"Agu",
		"Sep",
		"Okt",
		"Nov",
		"Des",
	];

	const formatDate = (dateValue: string) => {
		const d = new Date(dateValue);

		if (Number.isNaN(d.getTime())) {
			return "-";
		}

		const day = String(d.getDate()).padStart(2, "0");
		const month = monthNames[d.getMonth()];
		const year = d.getFullYear();

		return `${day} - ${month} - ${year}`;
	};

	const formatTime = (timeValue?: string) => {
		if (!timeValue) return "-";

		return timeValue.slice(0, 5);
	};

	if (event.event_date) {
		return {
			date: formatDate(event.event_date),
			time: formatTime(event.start_time),
		};
	}

	if (event.event_datetime) {
		return {
			date: formatDate(event.event_datetime),
			time: formatTime(event.start_time),
		};
	}

	return {
		date: "-",
		time: "-",
	};
}

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

// ─── Create Event Modal ───────────────────────────────────────────────────────
function CreateEventModal({
	isOpen,
	onClose,
}: {
	isOpen: boolean;
	onClose: () => void;
}) {
	const createEvent = useCreateEvent();
	const {
		data: categories = [],
		isLoading: isCategoryLoading,
		isError: isCategoryError,
	} = useEventCategories();

	const [form, setForm] = useState({
		category_id: 0,
		event_title: "",
		description: "",
		location: "",
		event_date: "",
		start_time: "",
		end_time: "",
	});

	const selectedCategoryId = form.category_id || categories[0]?.id || 0;

	if (!isOpen) return null;

	const handleChange = (
		e: React.ChangeEvent<
			HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
		>,
	) => {
		const { name, value } = e.target;

		setForm((prev) => ({
			...prev,
			[name]: name === "category_id" ? Number(value) : value,
		}));
	};

	const resetForm = () => {
		setForm({
			category_id: categories[0]?.id ?? 0,
			event_title: "",
			description: "",
			location: "",
			event_date: "",
			start_time: "",
			end_time: "",
		});
	};

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();

		if (!selectedCategoryId) {
			return;
		}

		createEvent.mutate(
			{
				...form,
				category_id: selectedCategoryId,
			},
			{
				onSuccess: () => {
					resetForm();
					onClose();
				},
			},
		);
	};

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

						<select
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
						</select>

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
						<input
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
						<textarea
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
						<input
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
							<input
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
							<input
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
							<input
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

// ─── Event Card (Mendatang) ───────────────────────────────────────────────────
function EventCardUpcoming({
	event,
	onDelete,
}: {
	event: Event;
	onDelete: (id: number) => void;
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
}: {
	event: Event;
	onDelete: (id: number) => void;
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
		</div>
	);
}
