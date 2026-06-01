"use client";

import { useState } from "react";
import { X } from "lucide-react";
import AdminSidebar from "@/app/components/AdminSidebar";
import AdminHeader from "@/app/components/AdminHeader";
import { useAlumni } from "@/hooks/admin/useAlumni";
import { useEvents } from "@/hooks/admin/useEvents";
import { usePresences } from "@/hooks/admin/usePresences";
import { useActivityLogs, ActivityLog } from "@/hooks/admin/useActivityLogs";

// ─── Types ────────────────────────────────────────────────────────────────────
interface Event {
	id: number;
	event_title: string;
	event_datetime?: string;
	event_date?: string;
	status_event: "Mendatang" | "Selesai" | "active" | "inactive";
}

interface Presence {
	id: number;
	scanned_at: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function getValidDate(dateValue?: string | null) {
	if (!dateValue) return null;

	const date = new Date(dateValue);

	if (Number.isNaN(date.getTime())) {
		return null;
	}

	return date;
}

function formatDate(dateValue?: string | null) {
	const date = getValidDate(dateValue);

	if (!date) {
		return {
			day: "-",
			year: "-",
		};
	}

	return {
		day: date.toLocaleDateString("id-ID", {
			day: "2-digit",
			month: "short",
		}),
		year: date.getFullYear(),
	};
}

function formatDateTime(dateValue?: string | null) {
	const date = getValidDate(dateValue);

	if (!date) {
		return "-";
	}

	return date.toLocaleString("id-ID", {
		day: "2-digit",
		month: "short",
		year: "numeric",
		hour: "2-digit",
		minute: "2-digit",
	});
}

function renderLogItem(log: ActivityLog, i: number) {
	let label = "Aktivitas";
	let badgeColor = "bg-gray-100 text-gray-700 border-gray-200";

	switch (log.action) {
		case "login":
			label = "Login Admin";
			badgeColor = "bg-blue-50 text-blue-700 border-blue-100";
			break;
		case "generate_qr":
			label = "QR Generated";
			badgeColor = "bg-teal-50 text-teal-700 border-teal-100";
			break;
		case "edit_user":
			label = "User Updated";
			badgeColor = "bg-yellow-50 text-yellow-700 border-yellow-100";
			break;
		case "delete_user":
			label = "User Deleted";
			badgeColor = "bg-red-50 text-red-700 border-red-100";
			break;
		case "create_event":
			label = "Event Created";
			badgeColor = "bg-emerald-50 text-emerald-700 border-emerald-100";
			break;
		case "update_event":
			label = "Event Updated";
			badgeColor = "bg-amber-50 text-amber-700 border-amber-100";
			break;
		case "delete_event":
			label = "Event Deleted";
			badgeColor = "bg-rose-50 text-rose-700 border-rose-100";
			break;
		case "toggle_event":
			label = "Event Status Toggled";
			badgeColor = "bg-indigo-50 text-indigo-700 border-indigo-100";
			break;
	}

	return (
		<div
			key={log.id ?? i}
			className="py-2.5 px-1 border-b border-gray-100 last:border-b-0 flex flex-col gap-0.5"
		>
			<div className="flex items-center justify-between gap-2">
				<span className={`text-[10px] px-2 py-0.5 font-semibold rounded-full border ${badgeColor}`}>
					{label}
				</span>
				<span className="text-[10px] text-gray-400 font-mono">
					{formatDateTime(log.created_at)}
				</span>
			</div>
			<p className="text-xs text-gray-700 mt-1 leading-normal font-medium">
				{log.description}
			</p>
		</div>
	);
}

function getEventDate(event: Event) {
	return event.event_date ?? event.event_datetime ?? null;
}

function isUpcomingEvent(event: Event) {
	const eventDate = getValidDate(getEventDate(event));

	if (event.status_event === "Mendatang" || event.status_event === "active") {
		return true;
	}

	if (eventDate) {
		const today = new Date();
		today.setHours(0, 0, 0, 0);

		const normalizedEventDate = new Date(eventDate);
		normalizedEventDate.setHours(0, 0, 0, 0);

		return normalizedEventDate >= today;
	}

	return false;
}

function isToday(datetime?: string | null) {
	const date = getValidDate(datetime);

	if (!date) return false;

	const now = new Date();

	return (
		date.getDate() === now.getDate() &&
		date.getMonth() === now.getMonth() &&
		date.getFullYear() === now.getFullYear()
	);
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────
function StatSkeleton() {
	return (
		<div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 animate-pulse">
			<div className="w-14 h-14 rounded-2xl bg-gray-100 mb-6" />
			<div className="h-3 bg-gray-100 rounded w-1/2 mb-3" />
			<div className="h-8 bg-gray-200 rounded w-1/3 mb-3" />
			<div className="h-3 bg-gray-100 rounded w-2/3" />
		</div>
	);
}

function EventSkeleton() {
	return (
		<div className="flex items-center justify-between animate-pulse">
			<div className="flex items-center gap-4">
				<div className="w-14 h-14 rounded-2xl bg-gray-100" />
				<div>
					<div className="h-4 bg-gray-200 rounded w-40 mb-2" />
					<div className="h-3 bg-gray-100 rounded w-24" />
				</div>
			</div>
			<div className="h-4 bg-gray-100 rounded w-16" />
		</div>
	);
}

// ─── Chart Bar (simple, no library) ──────────────────────────────────────────
function SimpleChart({ presences }: { presences: Presence[] }) {
	const months = [
		"Jan",
		"Feb",
		"Mar",
		"Apr",
		"Mei",
		"Jun",
		"Jul",
		"Agt",
		"Sep",
		"Okt",
		"Nov",
		"Des",
	];

	const counts = months.map(
		(_, i) =>
			presences.filter((p) => getValidDate(p.scanned_at)?.getMonth() === i)
				.length,
	);

	const max = Math.max(...counts, 1);

	return (
		<div className="flex items-end gap-3 h-56 w-full">
			{counts.map((count, i) => (
				<div key={i} className="flex-1 flex flex-col items-center gap-2">
					<span className="text-xs text-gray-400">
						{count > 0 ? count : ""}
					</span>
					<div
						className="w-full rounded-t-lg bg-gradient-to-t from-teal-500 to-cyan-400 transition-all duration-500"
						style={{
							height: `${(count / max) * 100}%`,
							minHeight: count > 0 ? "8px" : "2px",
						}}
					/>
					<span className="text-xs text-gray-400">{months[i]}</span>
				</div>
			))}
		</div>
	);
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function DashboardPage() {
	// ── TanStack Query ──
	const { data: alumni = [], isLoading: loadingAlumni } = useAlumni();
	const { data: events = [], isLoading: loadingEvents } = useEvents();
	const { data: presences = [], isLoading: loadingPresences } = usePresences();
	const { data: activityLogs = [], isLoading: loadingActivityLogs } = useActivityLogs();
	const [showAllLogs, setShowAllLogs] = useState(false);

	const isLoading = loadingAlumni || loadingEvents || loadingPresences;

	// ── Computed Stats ──
	const totalAlumni = alumni.length;
	const totalEvents = events.length;
	const totalPresences = presences.length;

	const upcomingEvents = events
		.filter((event: Event) => isUpcomingEvent(event))
		.slice(0, 5);

	const activeEvents = upcomingEvents.length;

	const todayScan = presences.filter((p: Presence) =>
		isToday(p.scanned_at),
	).length;

	const stats = [
		{
			title: "Total Alumni",
			value: totalAlumni,
			desc: "Alumni terdaftar",
			gradient: "from-teal-500 to-cyan-500",
		},
		{
			title: "Total Event",
			value: totalEvents,
			desc: `${activeEvents} event aktif`,
			gradient: "from-cyan-500 to-blue-500",
		},
		{
			title: "Total Kehadiran",
			value: totalPresences,
			desc: "Sepanjang tahun",
			gradient: "from-emerald-500 to-teal-500",
		},
		{
			title: "QR Scan Hari Ini",
			value: todayScan,
			desc: "Real-time tracking",
			gradient: "from-teal-400 to-cyan-400",
		},
	];

	return (
		<div className="h-screen bg-gray-100 flex overflow-hidden">
			<AdminSidebar />

			<div className="flex-1 ml-72 flex flex-col h-screen">
				<AdminHeader title="Dashboard" />

				<main className="flex-1 overflow-y-auto p-8">
					{/* Title */}
					<div className="mb-8">
						<h1 className="text-5xl font-bold text-gray-800 mb-2">
							Dashboard Overview
						</h1>
						<p className="text-gray-500 text-lg">
							Sistem Kehadiran Event Alumni Pesantren
						</p>
					</div>

					{/* ── Stat Cards ── */}
					<div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
						{isLoading
							? [1, 2, 3, 4].map((i) => <StatSkeleton key={i} />)
							: stats.map((item, index) => (
									<div
										key={index}
										className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
									>
										<div
											className={`w-14 h-14 rounded-2xl bg-gradient-to-r ${item.gradient} mb-6`}
										/>
										<h3 className="text-gray-500 text-sm">{item.title}</h3>
										<h2 className="text-4xl font-bold text-gray-800 mt-2">
											{item.value}
										</h2>
										<p className="text-teal-600 text-sm mt-3">{item.desc}</p>
									</div>
								))}
					</div>

					{/* ── Chart ── */}
					<section className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 mb-8">
						<h2 className="text-2xl font-bold text-gray-800 mb-1">
							Grafik Kehadiran Alumni
						</h2>
						<p className="text-gray-500 mb-8">
							Tren kehadiran alumni per bulan
						</p>
						{loadingPresences ? (
							<div className="h-64 rounded-2xl bg-gray-50 animate-pulse" />
						) : (
							<SimpleChart presences={presences} />
						)}
					</section>

					{/* ── Bottom Section ── */}
					<div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
						{/* Event Terbaru */}
						<div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
							<h2 className="text-2xl font-bold text-gray-800 mb-1">
								Event Terbaru
							</h2>
							<p className="text-gray-500 mb-8">
								Daftar event yang akan berlangsung
							</p>
							<div className="space-y-5">
								{loadingEvents ? (
									[1, 2, 3, 4, 5].map((i) => <EventSkeleton key={i} />)
								) : upcomingEvents.length === 0 ? (
									<div className="text-center py-8 text-gray-400">
										<p className="text-3xl mb-2">📭</p>
										<p className="text-sm">Belum ada event mendatang</p>
									</div>
								) : (
									upcomingEvents.map((event: Event, index: number) => {
										const { day, year } = formatDate(getEventDate(event));

										return (
											<div
												key={event.id}
												className="flex items-center justify-between"
											>
												<div className="flex items-center gap-4">
													<div className="w-14 h-14 rounded-2xl bg-gradient-to-r from-teal-500 to-cyan-500 text-white flex items-center justify-center font-bold text-lg flex-shrink-0">
														{String(index + 1).padStart(2, "0")}
													</div>
													<div>
														<h3 className="font-semibold text-gray-800">
															{event.event_title}
														</h3>
														<p className="text-sm text-gray-400">
															Event Mendatang
														</p>
													</div>
												</div>
												<div className="text-right text-teal-600 font-semibold text-sm">
													{day} <br /> {year}
												</div>
											</div>
										);
									})
								)}
							</div>
						</div>

						{/* Right Column */}
						<div className="space-y-8">
							{/* Informasi Sistem */}
							<div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
								<h2 className="text-2xl font-bold text-gray-800 mb-1">
									Informasi Sistem
								</h2>
								<p className="text-gray-500 mb-6">
									Status dan aktivitas sistem
								</p>
								<div className="bg-teal-50 rounded-2xl p-6 space-y-3">
									<div className="flex justify-between items-center">
										<span className="text-gray-600">Status Sistem</span>
										<span className="text-green-600 font-semibold flex items-center gap-1.5">
											<span className="w-2 h-2 bg-green-500 rounded-full inline-block animate-pulse" />
											Online
										</span>
									</div>
									{[
										{
											label: "QR Generator",
											status: "Active",
											color: "text-teal-600",
										},
										{
											label: "WhatsApp API",
											status: "Connected",
											color: "text-teal-600",
										},
										{
											label: "Database",
											status: "Running",
											color: "text-teal-600",
										},
									].map((item, i) => (
										<div key={i} className="flex justify-between items-center">
											<span className="text-gray-500 text-sm">
												{item.label}
											</span>
											<span className={`text-sm font-medium ${item.color}`}>
												{item.status}
											</span>
										</div>
									))}
								</div>
							</div>

							{/* Aktivitas Terbaru */}
							<div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
								<h2 className="text-2xl font-bold text-gray-800 mb-6">
									Aktivitas Terbaru
								</h2>
								{loadingActivityLogs ? (
									<div className="space-y-3">
										{[1, 2, 3].map((i) => (
											<div
												key={i}
												className="h-10 bg-gray-100 rounded-xl animate-pulse"
											/>
										))}
									</div>
								) : (
									<div className="flex flex-col">
										{activityLogs
											.slice(0, 4)
											.map((log: ActivityLog, i: number) => renderLogItem(log, i))}
										{activityLogs.length === 0 && (
											<p className="text-sm text-gray-400 text-center py-4">
												Belum ada aktivitas
											</p>
										)}
										{activityLogs.length > 4 && (
											<button
												onClick={() => setShowAllLogs(true)}
												className="w-full mt-4 py-2 text-center text-xs font-bold text-teal-600 hover:text-teal-700 transition-colors border border-dashed border-teal-200 hover:border-teal-300 rounded-xl bg-teal-50/20 hover:bg-teal-50/55 flex items-center justify-center gap-2"
											>
												Lihat Lainnya
											</button>
										)}
									</div>
								)}
							</div>
						</div>
					</div>

					<footer className="mt-12 text-center text-gray-400 text-sm pb-8">
						© 2026 QR Event Attendance System - Pesantren
					</footer>
				</main>
			</div>

			{showAllLogs && (
				<div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
					<div className="bg-white rounded-3xl shadow-xl w-full max-w-lg flex flex-col max-h-[80vh]">
						<div className="p-6 border-b border-gray-100 flex items-center justify-between">
							<div>
								<h3 className="font-bold text-gray-800 text-lg">Semua Aktivitas Admin</h3>
								<p className="text-xs text-gray-400 mt-1">Daftar lengkap log riwayat aktivitas admin</p>
							</div>
							<button
								onClick={() => setShowAllLogs(false)}
								className="text-gray-400 hover:text-gray-650 p-2 hover:bg-gray-50 rounded-xl transition-colors"
								aria-label="Tutup"
							>
								<X size={20} />
							</button>
						</div>
						<div className="p-6 overflow-y-auto flex-1 divide-y divide-gray-100">
							{activityLogs.map((log: ActivityLog, i: number) => renderLogItem(log, i))}
						</div>
						<div className="p-6 border-t border-gray-100 flex justify-end">
							<button
								onClick={() => setShowAllLogs(false)}
								className="px-6 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-2xl text-sm transition-colors"
							>
								Tutup
							</button>
						</div>
					</div>
				</div>
			)}
		</div>
	);
}
