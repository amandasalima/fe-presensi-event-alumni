"use client";

import type { ReactNode } from "react";
import {
	CalendarDays,
	ClipboardList,
	Download,
	FileText,
	Inbox,
	MapPin,
	TrendingUp,
	Users,
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

// ─── Skeleton ─────────────────────────────────────────────────────────────────
function TableSkeleton({ cols }: { cols: number }) {
	return (
		<>
			{[1, 2, 3, 4].map((i) => (
				<tr key={i} className="border-b animate-pulse">
					{Array.from({ length: cols }).map((_, j) => (
						<td key={j} className="px-5 py-4">
							<div className="h-4 bg-gray-100 rounded w-3/4" />
						</td>
					))}
				</tr>
			))}
		</>
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
									loadingEvents || loadingAttendanceSummaries ? "..." : `${avgRate}%`,
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
					<section className="min-w-0 bg-white rounded-2xl p-5 shadow-sm shadow-gray-200/70 border border-gray-100 mb-5">						<div className="flex items-center gap-3 mb-4">
							<Icon3D variant="teal" size="md">
								<CalendarDays size={20} strokeWidth={2.5} />
							</Icon3D>
							<div>
								<h2 className="text-base font-bold text-gray-800 mb-1">
									Pilih Event untuk Detail Kehadiran
								</h2>
								<p className="text-gray-500 text-xs">
									Pilih event atau klik baris event di bawah untuk melihat siapa saja yang hadir saat pemindaian QR kehadiran
								</p>
							</div>
						</div>

						<div className="space-y-4">

						<div className="relative">
							<FormSelect
								value={selectedEventId ?? ""}
								onChange={(e) =>
								setSelectedEventId(Number(e.target.value) || null)
								}
								className="w-full appearance-none border border-gray-200 rounded-xl px-4 py-3 pr-10 text-sm text-gray-700 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#7AB2B2] focus:border-transparent cursor-pointer"
							>
								<option value="">Pilih event...</option>

								{events.map((event: ReportEvent) => (
								<option key={event.id} value={event.id}>
									{event.event_title} —{" "}
									{formatDate(event.event_date ?? event.event_datetime)}
								</option>
								))}
							</FormSelect>

							<span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
								▾
							</span>
						</div>

						{/* Detail event terpilih */}
						{selectedAttendanceEvent && (
							<div className="border border-[#7AB2B2]/20 rounded-2xl overflow-hidden">
								{/* Header detail */}
								<div className="bg-[#7AB2B2]/10 px-5 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
									<div>
										<p className="font-semibold text-teal-800">
											{selectedAttendanceEvent.event_title}
										</p>
										<p className="text-sm text-[#2D7EA0] mt-2 flex items-center gap-2">
											<Icon3D variant="teal" size="sm">
												<CalendarDays size={15} strokeWidth={2.5} />
											</Icon3D>
											{formatDate(selectedAttendanceEvent.event_date)}
										</p>
										<p className="text-sm text-[#2D7EA0] mt-1.5 flex items-center gap-2">
											<Icon3D variant="blue" size="sm">
												<MapPin size={15} strokeWidth={2.5} />
											</Icon3D>
											{selectedAttendanceEvent.location}
										</p>

										<p className="text-sm text-[#2D7EA0] mt-2 font-medium">
											Total kehadiran: {totalAttendances}
										</p>
									</div>
									<div className="flex flex-wrap gap-2">
										{(["PDF", "Excel"] as const).map((f) => (
											<button
												key={f}
												onClick={() => handleDownload(f)}
												className="inline-flex items-center gap-1.5 rounded-xl bg-[#2D7EA0] px-4 py-2 text-xs font-semibold text-white shadow-sm transition-all hover:-translate-y-0.5 hover:bg-[#236175] hover:shadow-md active:scale-[0.98]"
											>
												<Download size={13} strokeWidth={2.5} />
												{f}
											</button>
										))}
									</div>
								</div>

								{/* Detail table */}
								<div className="w-full max-w-full overflow-x-auto">
  									<table className="w-full min-w-[900px] text-sm">
										<thead>
											<tr className="bg-gray-50 border-b border-gray-100">
												{[
													"Nama",
													"Email",
													"No HP",
													"Angkatan",
													"Jam daftar",
											"Waktu hadir / pemindaian QR",
													"Status hadir",
												].map((h) => (
													<th
														key={h}
														className="text-left px-5 py-3 text-gray-500 font-medium"
													>
														{h}
													</th>
												))}
											</tr>
										</thead>

										<tbody>
											{loadingAttendances ? (
												<TableSkeleton cols={7} />
											) : attendances.length === 0 ? (
												<tr>
													<td
														colSpan={7}
														className="text-center py-8 text-gray-400 text-sm"
													>
														Belum ada data kehadiran untuk event ini
													</td>
												</tr>
											) : (
												attendances.map((attendance, i: number) => {
													const nested = attendance.attendance;
													const scannedAt =
														nested?.scanned_at || attendance.scanned_at;
													const status =
														nested?.status || attendance.status || "hadir";

													return (
														<tr
															key={attendance.id ?? i}
															className="border-b border-gray-50 hover:bg-gray-50 transition-colors"
														>
															<td className="px-5 py-3 font-medium text-gray-800">
																	{attendance.user?.name ?? `Pengguna #${attendance.user_id}`}
															</td>

															<td className="px-5 py-3 text-gray-500">
																{attendance.user?.email ?? "-"}
															</td>

															<td className="px-5 py-3 text-gray-500">
																{attendance.user?.phone ?? "-"}
															</td>

															<td className="px-5 py-3 text-gray-500">
																{attendance.user?.angkatan ?? "-"}
															</td>

															<td className="px-5 py-3 text-gray-500 whitespace-nowrap">
																{formatDateTimeIndonesia(nested?.registered_at)}
															</td>

															<td className="px-5 py-3 text-gray-500 whitespace-nowrap">
																{formatDateTimeIndonesia(scannedAt)}
															</td>

															<td className="px-5 py-3">
																<span className="text-xs px-2.5 py-1 rounded-full font-medium bg-[#7AB2B2]/10 text-[#2D7EA0] border border-teal-200">
																	{status}
																</span>
															</td>
														</tr>
													);
												})
											)}
										</tbody>
									</table>
								</div>
							</div>
						)}
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
									Ringkasan kehadiran semua event yang telah berlangsung
								</p>
							</div>
						</div>
						<div className="w-full max-w-full overflow-x-auto">
  							<table className="w-full min-w-[900px] text-sm">
								<thead>
									<tr className="bg-[#7AB2B2]/10">
										{[
											"Event",
											"Tanggal",
											"Hadir",
											"Tingkat Kehadiran",
											"Status",
										].map((h, i) => (
											<th
												key={h}
												className={`text-left px-5 py-3.5 text-[#236175] font-semibold ${i === 0 ? "rounded-l-xl" : ""} ${i === 4 ? "rounded-r-xl" : ""}`}
											>
												{h}
											</th>
										))}
									</tr>
								</thead>
								<tbody>
									{loadingEvents || loadingAttendanceSummaries ? (
										<TableSkeleton cols={5} />
									) : events.length === 0 ? (
										<tr>
											<td
												colSpan={5}
												className="text-center py-10 text-gray-400 text-sm"
											>
												<Icon3D variant="gray" size="lg">
													<Inbox size={26} strokeWidth={2.5} />
												</Icon3D>
												<p className="mt-3">Belum ada data event</p>
											</td>
										</tr>
									) : (
										events.map((e: ReportEvent) => {
											const hadir = getHadir(e.id);
											const rate = getRate(e.id, e.quota);
											return (
												<tr
													key={e.id}
																											className="border-b border-gray-50 hover:bg-gray-50 transition-colors cursor-pointer"
													onClick={() => setSelectedEventId(e.id)}
												>
													<td className="px-5 py-4 font-medium text-gray-800">
														<div className="flex items-center gap-3">
															<Icon3D variant="teal" size="sm">
																<FileText size={15} strokeWidth={2.5} />
															</Icon3D>
															{e.event_title}
														</div>
													</td>
													<td className="px-5 py-4 text-gray-500">
														{formatDate(e.event_datetime)}
													</td>
													<td className="px-5 py-4 font-bold text-[#2D7EA0]">
														{hadir}
													</td>
													<td className="px-5 py-4">
														<div className="flex items-center gap-3">
															<div className="w-28 bg-gray-100 rounded-full h-2">
																<div
																	className="bg-[#3EBDAF] h-2 rounded-full transition-all"
																	style={{ width: `${rate}%` }}
																/>
															</div>
															<span className="text-sm text-gray-600 font-medium">
																{rate}%
															</span>
														</div>
													</td>
													<td className="px-5 py-4">
														<span
															className={`text-xs px-3 py-1.5 rounded-full font-medium border ${
																e.status_event === "Mendatang"
																	? "bg-[#7AB2B2]/10 text-[#2D7EA0] border-teal-200"
																	: "bg-gray-50 text-gray-500 border-gray-200"
															}`}
														>
															{e.status_event}
														</span>
													</td>
												</tr>
											);
										})
									)}
								</tbody>
							</table>
						</div>
					</section>

					<footer className="mt-6 text-center text-gray-400 text-xs pb-4">
						© 2026 Sistem Presensi Event Berbasis QR - Pesantren
					</footer>
				</main>
			</div>

			{feedback && (
				<FeedbackToast type={feedback.type} message={feedback.message} />
			)}
		</div>
	);
}