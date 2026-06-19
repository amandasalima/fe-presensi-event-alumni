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
import { FormSelect } from "@/app/components/FormControl";
import { useReportsPage } from "./_hooks/useReportsPage";
import {
	formatDate,
	formatTime,
	type Presence,
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
		detailPresences,
		events,
		getHadir,
		getRate,
		handleDownload,
		loadingDetail,
		loadingEvents,
		loadingPresences,
		selectedAttendanceEvent,
		selectedEventId,
		setSelectedEventId,
		setSelectedId,
		selesai,
		totalAttendances,
		totalHadir,
	} = useReportsPage();

	return (
		<div className="h-screen bg-gray-100 flex overflow-hidden">
			<AdminSidebar />

			<div className="flex-1 ml-56 flex flex-col h-screen">
				<AdminHeader title="Kehadiran" />

				<main className="flex-1 overflow-y-auto p-5 space-y-5">
					{/* ── Stat Cards ── */}
					<div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
						{[
							{
								icon: (
									<Icon3D variant="teal" size="md">
										<CalendarDays size={21} strokeWidth={2.5} />
									</Icon3D>
								),
								label: "Total",
								accent: "border-[#7AB2B2]",
								value: loadingEvents ? "..." : selesai,
								sub: "Event Terlaksana",
							},
							{
								icon: (
									<Icon3D variant="blue" size="md">
										<Users size={21} strokeWidth={2.5} />
									</Icon3D>
								),
								label: "Peserta",
								accent: "border-blue-400",
								value: loadingPresences ? "..." : totalHadir,
								sub: "Total Kehadiran",
							},
							{
								icon: (
									<Icon3D variant="green" size="md">
										<TrendingUp size={21} strokeWidth={2.5} />
									</Icon3D>
								),
								label: "Rate",
								accent: "border-emerald-400",
								value:
									loadingEvents || loadingPresences ? "..." : `${avgRate}%`,
								sub: "Rata-rata Kehadiran",
							},
						].map((s, i) => (
							<div
								key={i}
								className={`bg-white border-l-4 ${s.accent} rounded-2xl p-5 shadow-sm shadow-gray-200/70 flex items-start gap-4`}
							>
								{s.icon}

								<div className="flex-1">
									<div className="flex items-center justify-between gap-3">
										<p className="text-3xl font-bold text-gray-800">
											{s.value}
										</p>
										<span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">
											{s.label}
										</span>
									</div>

									<p className="text-sm text-gray-400 mt-1">{s.sub}</p>
								</div>
							</div>
						))}
					</div>

					{/* ── Pilih Event ── */}
					<div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm shadow-gray-200/70 space-y-4">
						<div>
							<h3 className="font-semibold text-gray-800 flex items-center gap-2">
								<Icon3D variant="teal" size="sm">
									<CalendarDays size={16} strokeWidth={2.5} />
								</Icon3D>
								Pilih Event untuk Download Laporan
							</h3>
							<p className="text-sm text-gray-400 mt-1 ml-10">
								Pilih event tertentu untuk melihat detail dan download laporan
								kehadiran
							</p>
						</div>

						<div className="relative">
							<FormSelect
								value={selectedEventId ?? ""}
								onChange={(e) =>
									setSelectedEventId(Number(e.target.value) || null)
								}
								className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-700 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#7AB2B2]"
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
								<div className="bg-[#7AB2B2]/10 px-5 py-4 flex items-center justify-between gap-4">
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
									<div className="flex gap-2">
										{(["PDF", "Excel", "CSV"] as const).map((f) => (
											<button
												key={f}
												onClick={() => handleDownload(f)}
												className="text-xs bg-[#2D7EA0] hover:bg-[#236175] text-white px-3 py-1.5 rounded-lg font-medium transition-colors flex items-center gap-1.5 shadow-sm"
											>
												<Download size={13} strokeWidth={2.5} />
												{f}
											</button>
										))}
									</div>
								</div>

								{/* Detail table */}
								<div className="overflow-x-auto">
									<table className="w-full text-sm">
										<thead>
											<tr className="bg-gray-50 border-b border-gray-100">
												{[
													"Nama",
													"Email",
													"Angkatan",
													"Waktu Scan",
													"Status",
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
											{loadingDetail ? (
												<TableSkeleton cols={5} />
											) : detailPresences.length === 0 ? (
												<tr>
													<td
														colSpan={5}
														className="text-center py-8 text-gray-400 text-sm"
													>
														Belum ada data kehadiran untuk event ini
													</td>
												</tr>
											) : (
												detailPresences.map((p: Presence, i: number) => (
													<tr
														key={p.id ?? i}
														className="border-b border-gray-50 hover:bg-gray-50 transition-colors"
													>
														<td className="px-5 py-3 font-medium text-gray-800">
															{p.user?.name ?? `User #${p.user_id}`}
														</td>

														<td className="px-5 py-3 text-gray-500">
															{p.user?.email ?? "-"}
														</td>

														<td className="px-5 py-3 text-gray-500">
															{p.user?.angkatan ?? "-"}
														</td>

														<td className="px-5 py-3 text-gray-500">
															{formatTime(p.scanned_at)}
														</td>

														<td className="px-5 py-3">
															<span className="text-xs px-2.5 py-1 rounded-full font-medium bg-[#7AB2B2]/10 text-[#2D7EA0] border border-teal-200">
																Hadir
															</span>
														</td>
													</tr>
												))
											)}
										</tbody>
									</table>
								</div>
							</div>
						)}
					</div>

					{/* ── Semua Event Table ── */}
					<div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm shadow-gray-200/70">
						<div className="mb-5">
							<h3 className="font-semibold text-gray-800 flex items-center gap-2">
								<Icon3D variant="teal" size="sm">
									<ClipboardList size={16} strokeWidth={2.5} />
								</Icon3D>
								Semua Event
							</h3>
							<p className="text-sm text-gray-400 mt-1 ml-10">
								Ringkasan kehadiran semua event yang telah berlangsung
							</p>
						</div>
						<div className="overflow-x-auto">
							<table className="w-full text-sm">
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
									{loadingEvents || loadingPresences ? (
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
													onClick={() => setSelectedId(e.id)}
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
					</div>

					<p className="text-center text-xs text-gray-400 pb-4">
						© 2026 QR Event Attendance System - Pesantren
					</p>
				</main>
			</div>
		</div>
	);
}
