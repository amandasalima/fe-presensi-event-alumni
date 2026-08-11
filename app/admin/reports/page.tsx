"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import {
	CalendarDays,
	ClipboardList,
	Download,
	FileText,
	Inbox,
	MapPin,
	TrendingUp,
	Users,
	X,
} from "lucide-react";
import AdminSidebar from "@/app/components/AdminSidebar";
import AdminHeader from "@/app/components/AdminHeader";
import FeedbackToast from "@/app/components/FeedbackToast";
import { FormSelect } from "@/app/components/FormControl";
import { useReportsPage } from "./_hooks/useReportsPage";
import {
	formatDate,
	formatDateTimeIndonesia,
	type ReportEvent,
} from "./_utils/reportFormatters";

// ─── Helpers ──────────────────────────────────────────────────────────────────
function capitalizeStatus(value?: string | null) {
	if (!value) return "-";

	return value
		.toLowerCase()
		.replace(/\b\w/g, (char) => char.toUpperCase());
}

function formatShortEventDate(dateStr?: string | null) {
	if (!dateStr) return "-";

	const date = new Date(dateStr);
	if (Number.isNaN(date.getTime())) return "-";

	return new Intl.DateTimeFormat("id-ID", {
		day: "2-digit",
		month: "short",
		year: "numeric",
	})
		.format(date)
		.replace(/\./g, "");
}

function TableSkeleton({ cols }: { cols: number }) {
	return (
		<>
			{[1, 2, 3, 4].map((i) => (
				<tr key={i} className="border-b border-gray-100 animate-pulse">
					{Array.from({ length: cols }).map((_, j) => (
						<td key={j} className="p-3">
							<div className="h-4 bg-gray-100 rounded w-3/4 mx-auto" />
						</td>
					))}
				</tr>
			))}
		</>
	);
}

function Pagination({
	currentPage,
	totalPages,
	onPageChange,
}: {
	currentPage: number;
	totalPages: number;
	onPageChange: (page: number) => void;
}) {
	if (totalPages <= 1) return null;

	const pages = Array.from({ length: totalPages }, (_, index) => index + 1);

	return (
		<div className="flex flex-wrap items-center justify-between gap-3 border-t border-gray-100 px-4 py-3">
			<p className="text-xs text-gray-500">
				Halaman {currentPage} dari {totalPages}
			</p>

			<div className="flex items-center gap-1.5">
				<button
					type="button"
					onClick={() => onPageChange(currentPage - 1)}
					disabled={currentPage === 1}
					className="inline-flex h-8 items-center justify-center rounded-lg border border-gray-200 px-3 text-xs font-semibold text-gray-600 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
				>
					Sebelumnya
				</button>

				{pages.map((page) => (
					<button
						key={page}
						type="button"
						onClick={() => onPageChange(page)}
						className={`h-8 min-w-8 rounded-lg px-2 text-xs font-semibold transition ${
							page === currentPage
								? "bg-[#2D7EA0] text-white"
								: "border border-gray-200 text-gray-600 hover:bg-gray-50"
						}`}
					>
						{page}
					</button>
				))}

				<button
					type="button"
					onClick={() => onPageChange(currentPage + 1)}
					disabled={currentPage === totalPages}
					className="inline-flex h-8 items-center justify-center rounded-lg border border-gray-200 px-3 text-xs font-semibold text-gray-600 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
				>
					Berikutnya
				</button>
			</div>
		</div>
	);
}

// ─── Icon 3D ──────────────────────────────────────────────────────────────────
function Icon3D({
	children,
	variant = "teal",
	size = "md",
}: {
	children: ReactNode;
	variant?: "teal" | "blue" | "green" | "red" | "amber" | "gray";
	size?: "sm" | "md" | "lg";
}) {
	const variants = {
		teal: "from-[#D8F3F0] via-[#7AB2B2] to-[#2D7EA0] text-white",
		blue: "from-blue-100 via-blue-400 to-blue-600 text-white",
		green: "from-emerald-100 via-emerald-400 to-emerald-600 text-white",
		red: "from-red-100 via-red-400 to-red-600 text-white",
		amber: "from-amber-100 via-amber-400 to-amber-600 text-white",
		gray: "from-gray-100 via-gray-300 to-gray-500 text-white",
	};

	const sizes = {
		sm: "w-8 h-8 rounded-xl",
		md: "w-10 h-10 rounded-2xl",
		lg: "w-14 h-14 rounded-2xl",
	};

	return (
		<span
			className={`${sizes[size]} shrink-0 overflow-visible inline-flex items-center justify-center bg-gradient-to-br ${variants[variant]} shadow-lg shadow-gray-300/70 border border-white/60 ring-1 ring-black/5`}
		>
			<span className="inline-flex items-center justify-center leading-none drop-shadow-sm">
				{children}
			</span>
		</span>
	);
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function ReportsPage() {
	const {
		avgRate,
		attendances,
		events,
		feedback,
		getHadir,
		getRate,
		handleDownload,
		loadingAttendanceSummaries,
		loadingAttendances,
		loadingEvents,
		selectedAttendanceEvent,
		selectedEventId,
		setSelectedEventId,
		selesai,
		totalAttendances,
		totalHadir,
	} = useReportsPage();

	const [isEventModalOpen, setIsEventModalOpen] = useState(false);
	const [eventPage, setEventPage] = useState(1);
	const [attendancePage, setAttendancePage] = useState(1);

	const EVENT_PER_PAGE = 5;
	const ATTENDANCE_PER_PAGE = 5;

	const eventTotalPages = Math.max(
		1,
		Math.ceil(events.length / EVENT_PER_PAGE),
	);

	const paginatedEvents = useMemo(() => {
		const start = (eventPage - 1) * EVENT_PER_PAGE;
		return events.slice(start, start + EVENT_PER_PAGE);
	}, [events, eventPage]);

	const attendanceTotalPages = Math.max(
		1,
		Math.ceil(attendances.length / ATTENDANCE_PER_PAGE),
	);

	const paginatedAttendances = useMemo(() => {
		const start = (attendancePage - 1) * ATTENDANCE_PER_PAGE;
		return attendances.slice(start, start + ATTENDANCE_PER_PAGE);
	}, [attendances, attendancePage]);

	useEffect(() => {
		if (eventPage > eventTotalPages) {
			setEventPage(eventTotalPages);
		}
	}, [eventPage, eventTotalPages]);

	useEffect(() => {
		if (attendancePage > attendanceTotalPages) {
			setAttendancePage(attendanceTotalPages);
		}
	}, [attendancePage, attendanceTotalPages]);

	useEffect(() => {
		setAttendancePage(1);
	}, [selectedEventId]);

	const openEventDetail = (eventId: number) => {
		setSelectedEventId(eventId);
		setAttendancePage(1);
		setIsEventModalOpen(true);
	};

	const closeEventDetail = () => {
		setIsEventModalOpen(false);
	};

	return (
		<div className="h-screen bg-gray-100 flex overflow-hidden">
			<AdminSidebar />

			<div className="flex-1 min-w-0 ml-56 flex flex-col h-screen">
				<AdminHeader title="Kehadiran" />

				<main className="flex-1 min-w-0 overflow-y-auto p-5">
					{/* ── Stat Cards ── */}
					<div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 mb-5">
						{[
							{
								label: "Total",
								value: loadingEvents ? "..." : selesai,
								sub: "Event Terlaksana",
								icon: (
									<Icon3D variant="teal" size="md">
										<CalendarDays size={20} strokeWidth={2.5} />
									</Icon3D>
								),
							},
							{
								label: "Peserta",
								value: loadingAttendanceSummaries ? "..." : totalHadir,
								sub: "Total Kehadiran",
								icon: (
									<Icon3D variant="blue" size="md">
										<Users size={20} strokeWidth={2.5} />
									</Icon3D>
								),
							},
							{
								label: "Rate",
								value:
									loadingEvents || loadingAttendanceSummaries
										? "..."
										: `${avgRate}%`,
								sub: "Rata-rata Kehadiran",
								icon: (
									<Icon3D variant="green" size="md">
										<TrendingUp size={20} strokeWidth={2.5} />
									</Icon3D>
								),
							},
						].map((s, i) => (
							<div
								key={i}
								className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4"
							>
								<p className="text-gray-500 text-xs">{s.label}</p>
								<div className="flex items-center gap-3 mt-1">
									{s.icon}
									<h2 className="text-3xl font-bold text-gray-800">
										{s.value}
									</h2>
								</div>
								<p className="text-gray-400 text-xs mt-1">{s.sub}</p>
							</div>
						))}
					</div>

					{/* ── Pilih Event ── */}
					<section className="min-w-0 bg-white rounded-2xl p-5 shadow-sm shadow-gray-200/70 border border-gray-100 mb-5">
						<div className="flex items-center gap-3 mb-4">
							<Icon3D variant="teal" size="md">
								<CalendarDays size={20} strokeWidth={2.5} />
							</Icon3D>
							<div>
								<h2 className="text-base font-bold text-gray-800 mb-1">
									Pilih Event untuk Detail Kehadiran
								</h2>
								<p className="text-gray-500 text-xs">
									Pilih event atau klik baris event di bawah untuk melihat detail
									kehadiran.
								</p>
							</div>
						</div>

						<div className="relative">
							<FormSelect
								value={selectedEventId ?? ""}
								onChange={(e) => {
									const eventId = Number(e.target.value) || null;
									setSelectedEventId(eventId);

									if (eventId) {
										setAttendancePage(1);
										setIsEventModalOpen(true);
									}
								}}
								className="w-full appearance-none border border-gray-200 rounded-xl px-4 py-3 pr-10 text-sm text-gray-700 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#7AB2B2] focus:border-transparent cursor-pointer"
							>
								<option value="">Pilih event...</option>

								{events.map((event: ReportEvent) => (
									<option key={event.id} value={event.id}>
										{formatShortEventDate(
											event.event_date ?? event.event_datetime,
										)}{" "}
										- {event.event_title}
									</option>
								))}
							</FormSelect>

							<span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
								▾
							</span>
						</div>
					</section>

					{/* ── Semua Event Table ── */}
					<section className="bg-white rounded-2xl p-5 shadow-sm shadow-gray-200/70 border border-gray-100">
						<div className="flex items-center gap-3 mb-4">
							<Icon3D variant="teal" size="md">
								<ClipboardList size={20} strokeWidth={2.5} />
							</Icon3D>
							<div>
								<h2 className="text-base font-bold text-gray-800 mb-1">
									Semua Event
								</h2>
								<p className="text-gray-500 text-xs">
									Klik salah satu event untuk melihat detail kehadiran.
								</p>
							</div>
						</div>

						<div className="overflow-hidden rounded-xl border border-gray-100">
							<div className="w-full max-w-full overflow-x-auto">
								<table className="w-full min-w-[900px] table-fixed text-xs">
									<colgroup>
										<col className="w-[34%]" />
										<col className="w-[16%]" />
										<col className="w-[10%]" />
										<col className="w-[25%]" />
										<col className="w-[15%]" />
									</colgroup>
									<thead>
										<tr className="bg-[#7AB2B2]/10">
											<th className="p-3 text-center font-semibold text-[#236175] rounded-l-xl">
												Event
											</th>
											<th className="p-3 text-center font-semibold text-[#236175]">
												Tanggal
											</th>
											<th className="p-3 text-center font-semibold text-[#236175]">
												Hadir
											</th>
											<th className="p-3 text-center font-semibold text-[#236175]">
												Tingkat Kehadiran
											</th>
											<th className="p-3 text-center font-semibold text-[#236175] rounded-r-xl">
												Status
											</th>
										</tr>
									</thead>

									<tbody>
										{loadingEvents || loadingAttendanceSummaries ? (
											<TableSkeleton cols={5} />
										) : events.length === 0 ? (
											<tr>
												<td
													colSpan={5}
													className="py-10 text-center text-sm text-gray-400"
												>
													<Icon3D variant="gray" size="lg">
														<Inbox size={26} strokeWidth={2.5} />
													</Icon3D>
													<p className="mt-3">Belum ada data event</p>
												</td>
											</tr>
										) : (
											paginatedEvents.map((e: ReportEvent) => {
												const hadir = getHadir(e.id);
												const rate = getRate(e.id, e.quota);

												return (
													<tr
														key={e.id}
														onClick={() => openEventDetail(e.id)}
														className="cursor-pointer border-b border-gray-100 transition-colors odd:bg-white even:bg-blue-50 hover:bg-blue-100"
													>
														<td className="p-3 font-medium text-gray-800">
															<div className="flex min-w-0 items-center gap-3">
																<Icon3D variant="teal" size="sm">
																	<FileText size={15} strokeWidth={2.5} />
																</Icon3D>
																<span className="min-w-0 truncate" title={e.event_title}>{e.event_title}</span>
															</div>
														</td>

														<td className="p-3 text-center text-gray-500 whitespace-nowrap">
															{formatShortEventDate(
																e.event_date ?? e.event_datetime,
															)}
														</td>

														<td className="p-3 text-center font-bold text-[#2D7EA0]">
															{hadir}
														</td>

														<td className="p-3">
															<div className="flex items-center justify-center gap-3">
																<div className="h-2 w-28 rounded-full bg-gray-100">
																	<div
																		className="h-2 rounded-full bg-[#3EBDAF] transition-all"
																		style={{ width: `${rate}%` }}
																	/>
																</div>
																<span className="text-xs font-medium text-gray-600">
																	{rate}%
																</span>
															</div>
														</td>

														<td className="p-3 text-center">
															<span
																className={`inline-block rounded-lg border px-2.5 py-1 text-xs font-medium ${
																	String(e.status_event).toLowerCase() === "selesai"
																		? "border-emerald-200 bg-emerald-50 text-emerald-600"
																		: String(e.status_event).toLowerCase() === "mendatang"
																			? "border-amber-200 bg-amber-50 text-amber-600"
																			: "border-gray-200 bg-gray-50 text-gray-600"
																}`}
															>
																{capitalizeStatus(e.status_event)}
															</span>
														</td>
													</tr>
												);
											})
										)}
									</tbody>
								</table>
							</div>

							{!loadingEvents && events.length > 0 && (
								<Pagination
									currentPage={eventPage}
									totalPages={eventTotalPages}
									onPageChange={setEventPage}
								/>
							)}
						</div>
					</section>

					<footer className="mt-6 text-center text-gray-400 text-xs pb-4">
						© 2026 Sistem Presensi Event Berbasis QR - Pesantren
					</footer>
				</main>
			</div>

			{/* ── Event Detail Modal ── */}
			{isEventModalOpen && selectedAttendanceEvent && (
				<div
					className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
					onClick={closeEventDetail}
				>
					<div
						className="w-full max-w-6xl overflow-hidden rounded-2xl bg-white shadow-2xl"
						onClick={(e) => e.stopPropagation()}
					>
						{/* Modal header */}
						<div className="flex flex-col gap-4 border-b border-gray-100 p-5 sm:flex-row sm:items-start sm:justify-between">
							<div className="min-w-0">
								<div className="flex items-center gap-3">
									<Icon3D variant="teal" size="md">
										<CalendarDays size={20} strokeWidth={2.5} />
									</Icon3D>

									<div className="min-w-0">
										<h2 className="truncate text-lg font-bold text-gray-900">
											{selectedAttendanceEvent.event_title}
										</h2>
										<p className="mt-1 text-xs text-gray-500">
											Detail kehadiran event
										</p>
									</div>
								</div>

								<div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-xs text-gray-500">
									<span className="flex items-center gap-1.5">
										<CalendarDays size={14} className="text-[#2D7EA0]" />
										{formatDate(
											selectedAttendanceEvent.event_date ??
												selectedAttendanceEvent.event_datetime,
										)}
									</span>

									{selectedAttendanceEvent.location && (
										<span className="flex items-center gap-1.5">
											<MapPin size={14} className="text-[#2D7EA0]" />
											{selectedAttendanceEvent.location}
										</span>
									)}

									<span className="font-semibold text-[#2D7EA0]">
										Total kehadiran: {totalAttendances}
									</span>
								</div>
							</div>

							<div className="flex items-center gap-2">
								{(["PDF", "Excel"] as const).map((format) => (
									<button
										key={format}
										type="button"
										onClick={() => handleDownload(format)}
										className="inline-flex items-center gap-1.5 rounded-xl bg-[#2D7EA0] px-3 py-2 text-xs font-semibold text-white transition hover:bg-[#236175]"
									>
										<Download size={13} strokeWidth={2.5} />
										{format}
									</button>
								))}

								<button
									type="button"
									onClick={closeEventDetail}
									className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-gray-200 text-gray-400 transition hover:bg-gray-50 hover:text-gray-700"
									aria-label="Tutup popup"
								>
									<X size={17} />
								</button>
							</div>
						</div>

						{/* Modal table */}
						<div className="max-h-[70vh] overflow-y-auto p-5">
							<div className="overflow-hidden rounded-xl border border-gray-100">
								<div className="w-full overflow-x-auto">
									<table className="w-full min-w-[1000px] text-xs">
										<thead>
											<tr className="bg-[#7AB2B2]/10">
												<th className="p-3 text-center font-semibold text-[#236175] rounded-l-xl">
													Nama
												</th>
												<th className="p-3 text-center font-semibold text-[#236175]">
													Email
												</th>
												<th className="p-3 text-center font-semibold text-[#236175]">
													No HP
												</th>
												<th className="p-3 text-center font-semibold text-[#236175]">
													Angkatan
												</th>
												<th className="p-3 text-center font-semibold text-[#236175]">
													Jam Daftar
												</th>
												<th className="p-3 text-center font-semibold text-[#236175]">
													Waktu Hadir / Scan QR
												</th>
												<th className="p-3 text-center font-semibold text-[#236175] rounded-r-xl">
													Status Hadir
												</th>
											</tr>
										</thead>

										<tbody>
											{loadingAttendances ? (
												<TableSkeleton cols={7} />
											) : attendances.length === 0 ? (
												<tr>
													<td
														colSpan={7}
														className="py-10 text-center text-sm text-gray-400"
													>
														Belum ada data kehadiran untuk event ini.
													</td>
												</tr>
											) : (
												paginatedAttendances.map((attendance, i: number) => {
													const nested = attendance.attendance;
													const scannedAt =
														nested?.scanned_at || attendance.scanned_at;
													const status =
														nested?.status || attendance.status || "hadir";
													const normalizedStatus = String(status)
														.toLowerCase()
														.trim();

													const statusClass =
														normalizedStatus === "hadir"
															? "border-emerald-200 bg-emerald-50 text-emerald-600"
															: normalizedStatus === "registered"
																? "border-blue-200 bg-blue-50 text-blue-600"
																: normalizedStatus === "tidak hadir"
																	? "border-red-200 bg-red-50 text-red-600"
																	: "border-gray-200 bg-gray-50 text-gray-600";

													return (
														<tr
															key={attendance.id ?? i}
															className="border-b border-gray-100 transition-colors odd:bg-white even:bg-blue-50 hover:bg-blue-100"
														>
															<td className="p-3 font-medium text-gray-800">
																{attendance.user?.name ??
																	`Pengguna #${attendance.user_id}`}
															</td>

															<td className="p-3 text-center text-gray-500">
																{attendance.user?.email ?? "-"}
															</td>

															<td className="p-3 text-center text-gray-500">
																{attendance.user?.phone ?? "-"}
															</td>

															<td className="p-3 text-center text-gray-500">
																{attendance.user?.angkatan ?? "-"}
															</td>

															<td className="p-3 text-center text-gray-500 whitespace-nowrap">
																{formatDateTimeIndonesia(
																	nested?.registered_at,
																)}
															</td>

															<td className="p-3 text-center text-gray-500 whitespace-nowrap">
																{formatDateTimeIndonesia(scannedAt)}
															</td>

															<td className="p-3 text-center">
																<span
																	className={`inline-block rounded-lg border px-2.5 py-1 text-xs font-medium ${statusClass}`}
																>
																	{capitalizeStatus(String(status))}
																</span>
															</td>
														</tr>
													);
												})
											)}
										</tbody>
									</table>
								</div>

								{!loadingAttendances && attendances.length > 0 && (
									<Pagination
										currentPage={attendancePage}
										totalPages={attendanceTotalPages}
										onPageChange={setAttendancePage}
									/>
								)}
							</div>
						</div>
					</div>
				</div>
			)}

			{feedback && (
				<FeedbackToast type={feedback.type} message={feedback.message} />
			)}
		</div>
	);
}