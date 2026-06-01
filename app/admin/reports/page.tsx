"use client";

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
		<div className="flex min-h-screen bg-gray-50">
			<AdminSidebar />
			<div className="flex-1 ml-72 flex flex-col min-h-screen">
				<AdminHeader title="Kehadiran" />

				<main className="flex-1 p-8 space-y-6">
					{/* ── Hero ── */}
					<div className="bg-linear-to-r from-teal-600 to-cyan-500 rounded-2xl p-7 flex items-center gap-5 shadow-sm">
						<div className="bg-white/20 rounded-xl p-3 text-2xl">📋</div>
						<div>
							<h2 className="text-2xl font-bold text-white">
								Laporan Kehadiran
							</h2>
							<p className="text-teal-100 text-sm mt-1">
								Pilih event dan download laporan kehadiran dalam format CSV,
								Excel, atau PDF
							</p>
						</div>
					</div>

					{/* ── Stat Cards ── */}
					<div className="grid grid-cols-3 gap-5">
						{[
							{
								icon: "📅",
								label: "Total",
								accent: "border-teal-400",
								value: loadingEvents ? "..." : selesai,
								sub: "Event Terlaksana",
							},
							{
								icon: "👥",
								label: "Peserta",
								accent: "border-cyan-400",
								value: loadingPresences ? "..." : totalHadir,
								sub: "Total Kehadiran",
							},
							{
								icon: "📈",
								label: "Rate",
								accent: "border-emerald-400",
								value:
									loadingEvents || loadingPresences ? "..." : `${avgRate}%`,
								sub: "Rata-rata Kehadiran",
							},
						].map((s, i) => (
							<div
								key={i}
								className={`bg-white border-l-4 ${s.accent} rounded-2xl p-6 shadow-sm flex items-start gap-4`}
							>
								<span className="text-3xl">{s.icon}</span>
								<div className="flex-1">
									<div className="flex items-center justify-between">
										<p className="text-4xl font-bold text-gray-800">
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
					<div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm space-y-4">
						<div>
							<h3 className="font-semibold text-gray-800 flex items-center gap-2">
								<span className="text-teal-500">📅</span> Pilih Event untuk
								Download Laporan
							</h3>
							<p className="text-sm text-gray-400 mt-0.5">
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
								className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-700 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-teal-400"
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
							<div className="border border-teal-100 rounded-2xl overflow-hidden">
								{/* Header detail */}
								<div className="bg-teal-50 px-5 py-4 flex items-center justify-between">
									<div>
										<p className="font-semibold text-teal-800">
											{selectedAttendanceEvent.event_title}
										</p>
										<p className="text-sm text-teal-600 mt-0.5">
											📅 {formatDate(selectedAttendanceEvent.event_date)}
										</p>
										<p className="text-sm text-teal-600 mt-0.5">
											📍 {selectedAttendanceEvent.location}
										</p>

										<p className="text-sm text-teal-600 mt-0.5">
											Total kehadiran: {totalAttendances}
										</p>
									</div>
									<div className="flex gap-2">
										{(["PDF", "Excel", "CSV"] as const).map((f) => (
											<button
												key={f}
												onClick={() => handleDownload(f)}
												className="text-xs bg-teal-600 hover:bg-teal-700 text-white px-3 py-1.5 rounded-lg font-medium transition-colors"
											>
												⬇ {f}
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
															<span className="text-xs px-2.5 py-1 rounded-full font-medium bg-teal-50 text-teal-600 border border-teal-200">
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
					<div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
						<div className="mb-5">
							<h3 className="font-semibold text-gray-800 flex items-center gap-2">
								<span className="text-teal-500">📅</span> Semua Event
							</h3>
							<p className="text-sm text-gray-400 mt-0.5">
								Ringkasan kehadiran semua event yang telah berlangsung
							</p>
						</div>
						<div className="overflow-x-auto">
							<table className="w-full text-sm">
								<thead>
									<tr className="bg-teal-50">
										{[
											"Event",
											"Tanggal",
											"Hadir",
											"Tingkat Kehadiran",
											"Status",
										].map((h, i) => (
											<th
												key={h}
												className={`text-left px-5 py-3.5 text-teal-700 font-semibold ${i === 0 ? "rounded-l-xl" : ""} ${i === 4 ? "rounded-r-xl" : ""}`}
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
												<p className="text-3xl mb-2">📭</p>
												Belum ada data event
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
														{e.event_title}
													</td>
													<td className="px-5 py-4 text-gray-500">
														{formatDate(e.event_datetime)}
													</td>
													<td className="px-5 py-4 font-bold text-teal-600">
														{hadir}
													</td>
													<td className="px-5 py-4">
														<div className="flex items-center gap-3">
															<div className="w-28 bg-gray-100 rounded-full h-2">
																<div
																	className="bg-teal-500 h-2 rounded-full transition-all"
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
																	? "bg-teal-50 text-teal-600 border-teal-200"
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
