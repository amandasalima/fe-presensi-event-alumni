"use client";

import { ReactNode, useState, useEffect } from "react";
import {
	Chart as ChartJS,
	CategoryScale,
	LinearScale,
	BarElement,
	Title,
	Tooltip,
	Legend,
} from "chart.js";
import { Bar } from "react-chartjs-2";

import {
	Activity,
	CalendarCheck,
	CalendarDays,
	CalendarX,
	ChartColumn,
	ClipboardCheck,
	Database,
	QrCode,
	Server,
	Users,
	X,
} from "lucide-react";
import AdminSidebar from "@/app/components/AdminSidebar";
import AdminHeader from "@/app/components/AdminHeader";
import FeedbackToast from "@/app/components/FeedbackToast";
import { useAlumni } from "@/hooks/admin/useAlumni";
import { useEvents } from "@/hooks/admin/useEvents";
import { useAttendanceChart } from "@/hooks/admin/useAttendanceChart";
import { useActivityLogs, ActivityLog } from "@/hooks/admin/useActivityLogs";

ChartJS.register(
	CategoryScale,
	LinearScale,
	BarElement,
	Title,
	Tooltip,
	Legend,
);

// ─── Types ────────────────────────────────────────────────────────────────────
interface Event {
	id: number;
	event_title: string;
	event_datetime?: string;
	event_date?: string;
	status_event: "Mendatang" | "Selesai" | "active" | "inactive";
}

type IconVariant = "teal" | "blue" | "green" | "red" | "gray" | "yellow";
type ChartRange = "3" | "6" | "12";

const MONTH_LABELS = [
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
		return { day: "-", year: "-" };
	}
	return {
		day: date.toLocaleDateString("id-ID", { day: "2-digit", month: "short" }),
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
			label = "Admin Masuk";
			badgeColor = "bg-blue-50 text-blue-700 border-blue-100";
			break;
		case "generate_qr":
			label = "QR Dibuat";
			badgeColor = "bg-[#7AB2B2]/10 text-[#236175] border-[#7AB2B2]/20";
			break;
		case "edit_user":
			label = "Pengguna Diperbarui";
			badgeColor = "bg-yellow-50 text-yellow-700 border-yellow-100";
			break;
		case "delete_user":
			label = "Pengguna Dihapus";
			badgeColor = "bg-red-50 text-red-700 border-red-100";
			break;
		case "create_event":
			label = "Event Dibuat";
			badgeColor = "bg-emerald-50 text-emerald-700 border-emerald-100";
			break;
		case "update_event":
			label = "Event Diperbarui";
			badgeColor = "bg-amber-50 text-amber-700 border-amber-100";
			break;
		case "delete_event":
			label = "Event Dihapus";
			badgeColor = "bg-rose-50 text-rose-700 border-rose-100";
			break;
		case "toggle_event":
			label = "Status Event Diubah";
			badgeColor = "bg-indigo-50 text-indigo-700 border-indigo-100";
			break;
	}

	return (
		<div
			key={log.id ?? i}
			className="py-2 px-1 border-b border-gray-100 last:border-b-0 flex flex-col gap-0.5"
		>
			<div className="flex items-center justify-between gap-2">
				<span
					className={`text-[10px] px-2 py-0.5 font-semibold rounded-full border ${badgeColor}`}
				>
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

function getCollectionCount(value: unknown) {
	if (Array.isArray(value)) return value.length;

	if (value && typeof value === "object") {
		const data = value as {
			data?: unknown;
			items?: unknown;
			alumni?: unknown;
			total?: unknown;
			count?: unknown;
			meta?: { total?: unknown };
		};

		if (typeof data.total === "number") return data.total;
		if (typeof data.count === "number") return data.count;
		if (typeof data.meta?.total === "number") return data.meta.total;
		if (Array.isArray(data.data)) return data.data.length;
		if (Array.isArray(data.items)) return data.items.length;
		if (Array.isArray(data.alumni)) return data.alumni.length;
	}

	return 0;
}

function Icon3D({
	children,
	variant = "teal",
	size = "md",
}: {
	children: ReactNode;
	variant?: IconVariant;
	size?: "sm" | "md" | "lg";
}) {
	const variants: Record<IconVariant, string> = {
		teal: "from-[#D8F3F0] via-[#7AB2B2] to-[#2D7EA0] text-white",
		blue: "from-blue-100 via-blue-400 to-blue-600 text-white",
		green: "from-emerald-100 via-emerald-400 to-emerald-600 text-white",
		red: "from-red-100 via-red-400 to-red-600 text-white",
		gray: "from-gray-100 via-gray-300 to-gray-500 text-white",
		yellow: "from-yellow-100 via-yellow-400 to-yellow-600 text-white",
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

// ─── Skeleton ─────────────────────────────────────────────────────────────────
function StatSkeleton() {
	return (
		<div className="bg-white rounded-2xl p-4 shadow-sm shadow-gray-200/70 border border-gray-100 animate-pulse">
			<div className="h-2.5 bg-gray-100 rounded w-1/2 mb-3" />
			<div className="flex items-center gap-3">
				<div className="w-10 h-10 rounded-xl bg-gray-100" />
				<div className="h-6 bg-gray-200 rounded w-1/3" />
			</div>
			<div className="h-2.5 bg-gray-100 rounded w-2/3 mt-2" />
		</div>
	);
}

function EventSkeleton() {
	return (
		<div className="flex items-center justify-between animate-pulse">
			<div className="flex items-center gap-3">
				<div className="w-10 h-10 rounded-xl bg-gray-100" />
				<div>
					<div className="h-3 bg-gray-200 rounded w-32 mb-1.5" />
					<div className="h-2.5 bg-gray-100 rounded w-20" />
				</div>
			</div>
			<div className="h-3 bg-gray-100 rounded w-12" />
		</div>
	);
}

// ─── Chart Bar (Chart.js) ────────────────────────────────────────────────────
function AttendanceChart({
	data,
	total,
}: {
	data: { label: string; count: number }[];
	total: number;
}) {
	if (total === 0) {
		return (
			<div className="h-56 rounded-xl border border-dashed border-gray-200 bg-gray-50 flex items-center justify-center text-center px-4">
				<p className="text-xs text-gray-400">
					Belum ada data kehadiran pada filter yang dipilih.
				</p>
			</div>
		);
	}

	const chartJsData = {
		labels: data.map((item) => item.label),
		datasets: [
			{
				label: "Kehadiran",
				data: data.map((item) => item.count),
				backgroundColor: data.map((_, i) => {
					const hue = 180 + i * 8;
					return `hsla(${hue}, 55%, 45%, 0.85)`;
				}),
				hoverBackgroundColor: data.map((_, i) => {
					const hue = 180 + i * 8;
					return `hsla(${hue}, 60%, 40%, 1)`;
				}),
				borderColor: data.map((_, i) => {
					const hue = 180 + i * 8;
					return `hsla(${hue}, 55%, 40%, 1)`;
				}),
				borderWidth: 1,
				borderRadius: 6,
				borderSkipped: false as const,
				barPercentage: 0.7,
				categoryPercentage: 0.8,
			},
		],
	};

	const chartOptions = {
		responsive: true,
		maintainAspectRatio: false,
		animation: {
			duration: 800,
			easing: "easeOutQuart" as const,
		},
		plugins: {
			legend: {
				display: false,
			},
			tooltip: {
				backgroundColor: "rgba(30, 41, 59, 0.95)",
				titleColor: "#e2e8f0",
				bodyColor: "#ffffff",
				titleFont: { size: 12, weight: "bold" as const },
				bodyFont: { size: 13 },
				padding: 12,
				cornerRadius: 10,
				displayColors: false,
				callbacks: {
					title: (items: { label: string }[]) =>
						`Bulan ${items[0]?.label ?? ""}`,
					label: (item: { raw: unknown }) => `${item.raw} kehadiran`,
				},
			},
		},
		scales: {
			x: {
				grid: {
					display: false,
				},
				border: {
					display: false,
				},
				ticks: {
					color: "#9ca3af",
					font: { size: 11 },
				},
			},
			y: {
				beginAtZero: true,
				grid: {
					color: "rgba(229, 231, 235, 0.5)",
				},
				border: {
					display: false,
					dash: [4, 4],
				},
				ticks: {
					color: "#9ca3af",
					font: { size: 11 },
					stepSize: 1,
					precision: 0,
				},
			},
		},
	};

	return (
		<div className="h-56 w-full">
			<Bar data={chartJsData} options={chartOptions} />
		</div>
	);
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function DashboardPage() {
	const [feedback, setFeedback] = useState<{
		type: "success" | "error";
		message: string;
	} | null>(null);

	// Check if redirected due to error=forbidden
	useEffect(() => {
		if (typeof window !== "undefined") {
			const params = new URLSearchParams(window.location.search);
			if (params.get("error") === "forbidden") {
				setFeedback({
					type: "error",
					message: "Kamu tidak memiliki akses ke pengelolaan admin.",
				});
				// clear query param
				window.history.replaceState({}, document.title, window.location.pathname);
			}
		}
	}, []);

	// ── TanStack Query ──
	const { data: alumni = [], isLoading: loadingAlumni } = useAlumni();
	const { data: events = [], isLoading: loadingEvents } = useEvents("", 100);
	const { data: activityLogs = [], isLoading: loadingActivityLogs } =
		useActivityLogs();
	const [showAllLogs, setShowAllLogs] = useState(false);
	const [chartYear, setChartYear] = useState(new Date().getFullYear());
	const [chartRange, setChartRange] = useState<ChartRange>("12");
	const [chartEventId, setChartEventId] = useState("all");

	// Fetch chart data from the dedicated backend endpoint
	const { data: chartResponse, isLoading: loadingChart } = useAttendanceChart(
		chartYear,
		Number(chartRange),
		chartEventId,
	);

	const isLoading = loadingAlumni || loadingEvents || loadingChart;

	// Derive chart display data from backend response
	const chartData = {
		bars: (chartResponse?.monthly ?? []).map((m) => ({
			label: m.label,
			count: m.total,
		})),
		total: chartResponse?.total ?? 0,
		startLabel: chartResponse?.monthly?.[0]?.label ?? MONTH_LABELS[0],
		endLabel:
			chartResponse?.monthly?.[chartResponse.monthly.length - 1]?.label ??
			MONTH_LABELS[Number(chartRange) - 1],
	};

	// Available years for the year filter dropdown
	const chartYears = [
		new Date().getFullYear(),
		new Date().getFullYear() - 1,
		new Date().getFullYear() - 2,
	];

	// ── Computed Stats ──
	const totalAlumni = getCollectionCount(alumni);
	const totalEvents = events.length;
	const totalPresences = chartResponse?.total ?? 0;

	const upcomingEvents = events
		.filter((event: Event) => isUpcomingEvent(event))
		.slice(0, 5);

	const activeEvents = upcomingEvents.length;

	// Today's scan count — for now show 0 since the chart endpoint doesn't provide daily breakdown
	const todayScan = 0;

	const stats: {
		title: string;
		value: number;
		desc: string;
		variant: IconVariant;
		icon: ReactNode;
	}[] = [
		{
			title: "Total Alumni",
			value: totalAlumni,
			desc: "Alumni terdaftar",
			variant: "teal",
			icon: <Users size={20} strokeWidth={2.5} />,
		},
		{
			title: "Total Event",
			value: totalEvents,
			desc: `${activeEvents} event aktif`,
			variant: "blue",
			icon: <CalendarDays size={20} strokeWidth={2.5} />,
		},
		{
			title: "Total Kehadiran",
			value: totalPresences,
			desc: "Sepanjang tahun",
			variant: "green",
			icon: <ClipboardCheck size={20} strokeWidth={2.5} />,
		},
		{
			title: "Pemindaian QR Hari Ini",
			value: todayScan,
			desc: "Pemantauan waktu nyata",
			variant: "teal",
			icon: <QrCode size={20} strokeWidth={2.5} />,
		},
	];

	return (
		<div className="h-screen bg-gray-100 flex overflow-hidden">
			<AdminSidebar />

			<div className="flex-1 ml-56 flex flex-col h-screen">
				<AdminHeader title="Dashboard" />

				<main className="flex-1 overflow-y-auto p-5">
					{/* ── Stat Cards ── */}
					<div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mb-5">
						{isLoading
							? [1, 2, 3, 4].map((i) => <StatSkeleton key={i} />)
							: stats.map((item) => (
									<div
										key={item.title}
										className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4"
									>
										<p className="text-gray-500 text-xs">{item.title}</p>
										<div className="flex items-center gap-3 mt-1">
											<Icon3D variant={item.variant} size="md">
												{item.icon}
											</Icon3D>
											<h2 className="text-3xl font-bold text-gray-800">
												{item.value}
											</h2>
										</div>
										<p className="text-gray-400 text-xs mt-1">{item.desc}</p>
									</div>
								))}
					</div>

					{/* ── Chart + Informasi Sistem ── */}
					<div className="grid grid-cols-1 xl:grid-cols-3 gap-4 mb-5">
						{/* Chart - lebih lebar */}
						<section className="xl:col-span-2 bg-white rounded-2xl p-5 shadow-sm shadow-gray-200/70 border border-gray-100">
							<div className="flex items-center gap-3 mb-4">
								<Icon3D variant="teal" size="md">
									<ChartColumn size={20} strokeWidth={2.5} />
								</Icon3D>
								<div>
									<h2 className="text-base font-bold text-gray-800 mb-1">
										Grafik Kehadiran Alumni
									</h2>
									<p className="text-gray-500 text-xs">
										Tren kehadiran alumni per bulan
									</p>
								</div>
							</div>
							<div className="mb-4 grid grid-cols-1 sm:grid-cols-3 gap-2">
								{/* Tahun */}
								<div className="relative">
									<select
									value={String(chartYear)}
									onChange={(event) => setChartYear(Number(event.target.value))}
									className="w-full h-9 appearance-none rounded-xl border border-gray-200 bg-white px-3 pr-10 text-xs font-medium text-gray-700 outline-none focus:border-[#2D7EA0] focus:ring-2 focus:ring-[#7AB2B2]/20 cursor-pointer"
									aria-label="Filter tahun grafik"
									>
									{chartYears.map((year) => (
										<option key={year} value={year}>
										{year}
										</option>
									))}
									</select>

									<span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
									▾
									</span>
								</div>

								{/* Rentang Bulan */}
								<div className="relative">
									<select
									value={chartRange}
									onChange={(event) =>
										setChartRange(event.target.value as ChartRange)
									}
									className="w-full h-9 appearance-none rounded-xl border border-gray-200 bg-white px-3 pr-10 text-xs font-medium text-gray-700 outline-none focus:border-[#2D7EA0] focus:ring-2 focus:ring-[#7AB2B2]/20 cursor-pointer"
									aria-label="Filter rentang bulan grafik"
									>
									<option value="3">3 bulan terakhir</option>
									<option value="6">6 bulan terakhir</option>
									<option value="12">12 bulan terakhir</option>
									</select>

									<span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
									▾
									</span>
								</div>

								{/* Event */}
								<div className="relative">
									<select
									value={chartEventId}
									onChange={(event) => setChartEventId(event.target.value)}
									className="w-full h-9 appearance-none rounded-xl border border-gray-200 bg-white px-3 pr-10 text-xs font-medium text-gray-700 outline-none focus:border-[#2D7EA0] focus:ring-2 focus:ring-[#7AB2B2]/20 cursor-pointer"
									aria-label="Filter event grafik"
									>
									<option value="all">Semua event</option>

									{events.map((event: Event) => (
										<option key={event.id} value={event.id}>
										{event.event_title}
										</option>
									))}
									</select>

									<span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
									▾
									</span>
								</div>
								</div>
							{loadingChart ? (
								<div className="h-40 rounded-xl bg-gray-50 animate-pulse" />
							) : (
								<>
									<AttendanceChart
										data={chartData.bars}
										total={chartData.total}
									/>
									<div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs text-gray-500">
										<span>
											Total {chartData.total} kehadiran pada periode{" "}
											{chartData.startLabel} - {chartData.endLabel} {chartYear}
										</span>
										<span className="font-semibold text-[#2D7EA0]">
											{chartEventId === "all"
												? "Semua event"
												: (events.find(
														(event: Event) => String(event.id) === chartEventId,
													)?.event_title ?? "Event dipilih")}
										</span>
									</div>
								</>
							)}
						</section>

						{/* Informasi Sistem */}
						<div className="bg-white rounded-2xl p-5 shadow-sm shadow-gray-200/70 border border-gray-100">
							<div className="flex items-center gap-3 mb-4">
								<Icon3D variant="green" size="md">
									<Server size={20} strokeWidth={2.5} />
								</Icon3D>
								<div>
									<h2 className="text-base font-bold text-gray-800 mb-1">
										Informasi Sistem
									</h2>
									<p className="text-gray-500 text-xs">
										Status dan aktivitas sistem
									</p>
								</div>
							</div>
							<div className="bg-[#7AB2B2]/10 rounded-xl p-4 space-y-2">
								<div className="flex justify-between items-center">
									<span className="text-gray-600 text-sm">Status Sistem</span>
									<span className="text-green-600 font-semibold text-sm flex items-center gap-1.5">
										<span className="w-2 h-2 bg-green-500 rounded-full inline-block animate-pulse" />
										Beroperasi
									</span>
								</div>
								{[
									{
										label: "QR Generator",
										status: "Active",
										icon: <QrCode size={14} />,
									},
									{
										label: "Database",
										status: "Running",
										icon: <Database size={14} />,
									},
								].map((item, i) => (
									<div
										key={i}
										className="flex justify-between items-center gap-3"
									>
										<span className="text-gray-500 text-xs flex items-center gap-2">
											<span className="w-6 h-6 rounded-lg bg-white text-[#2D7EA0] shadow-sm shadow-gray-300/60 flex items-center justify-center">
												{item.icon}
											</span>
											{item.label}
										</span>
										<span className="text-xs font-medium text-[#2D7EA0]">
											{item.status}
										</span>
									</div>
								))}
							</div>
						</div>
					</div>

					{/* ── Bottom Section ── */}
					<div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
						{/* Event Terbaru */}
						<div className="bg-white rounded-2xl p-5 shadow-sm shadow-gray-200/70 border border-gray-100">
							<div className="flex items-center gap-3 mb-4">
								<Icon3D variant="blue" size="md">
									<CalendarCheck size={20} strokeWidth={2.5} />
								</Icon3D>
								<div>
									<h2 className="text-base font-bold text-gray-800 mb-1">
										Event Terbaru
									</h2>
									<p className="text-gray-500 text-xs">
										Daftar event yang akan berlangsung
									</p>
								</div>
							</div>
							<div className="space-y-3">
								{loadingEvents ? (
									[1, 2, 3, 4, 5].map((i) => <EventSkeleton key={i} />)
								) : upcomingEvents.length === 0 ? (
									<div className="text-center py-6 text-gray-400 flex flex-col items-center">
										<Icon3D variant="gray" size="md">
											<CalendarX size={20} strokeWidth={2.5} />
										</Icon3D>
										<p className="text-xs mt-3">Belum ada event mendatang</p>
									</div>
								) : (
									upcomingEvents.map((event: Event, index: number) => {
										const { day, year } = formatDate(getEventDate(event));
										return (
											<div
												key={event.id}
												className="flex items-center justify-between"
											>
												<div className="flex items-center gap-3">
													<Icon3D variant="teal" size="sm">
														<span className="text-xs font-bold">
															{String(index + 1).padStart(2, "0")}
														</span>
													</Icon3D>
													<div>
														<h3 className="font-semibold text-gray-800 text-sm">
															{event.event_title}
														</h3>
														<p className="text-xs text-gray-400">
															Event Mendatang
														</p>
													</div>
												</div>
												<div className="text-right text-[#2D7EA0] font-semibold text-xs">
													{day} <br /> {year}
												</div>
											</div>
										);
									})
								)}
							</div>
						</div>

						{/* Aktivitas Terbaru */}
						<div className="bg-white rounded-2xl p-5 shadow-sm shadow-gray-200/70 border border-gray-100">
							<div className="flex items-center gap-3 mb-4">
								<Icon3D variant="yellow" size="md">
									<Activity size={20} strokeWidth={2.5} />
								</Icon3D>
								<h2 className="text-base font-bold text-gray-800">
									Aktivitas Terbaru
								</h2>
							</div>
							{loadingActivityLogs ? (
								<div className="space-y-2">
									{[1, 2, 3].map((i) => (
										<div
											key={i}
											className="h-8 bg-gray-100 rounded-lg animate-pulse"
										/>
									))}
								</div>
							) : (
								<div className="flex flex-col">
									{activityLogs
										.slice(0, 4)
										.map((log: ActivityLog, i: number) =>
											renderLogItem(log, i),
										)}
									{activityLogs.length === 0 && (
										<p className="text-xs text-gray-400 text-center py-3">
											Belum ada aktivitas
										</p>
									)}
									{activityLogs.length > 4 && (
										<button
											onClick={() => setShowAllLogs(true)}
											className="w-full mt-3 py-2 text-center text-xs font-bold text-[#2D7EA0] hover:text-[#236175] transition-colors border border-dashed border-teal-200 hover:border-[#A8D5D5] rounded-xl bg-[#7AB2B2]/10/20 hover:bg-[#7AB2B2]/10/55 flex items-center justify-center gap-2"
										>
											Lihat Lainnya
										</button>
									)}
								</div>
							)}
						</div>
					</div>

					<footer className="mt-6 text-center text-gray-400 text-xs pb-4">
						© 2026 Sistem Presensi Event Berbasis QR - Pesantren
					</footer>
				</main>
			</div>

			{showAllLogs && (
				<div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
					<div className="bg-white rounded-3xl shadow-xl w-full max-w-lg flex flex-col max-h-[80vh]">
						<div className="p-6 border-b border-gray-100 flex items-center justify-between">
							<div className="flex items-center gap-3">
								<Icon3D variant="yellow" size="md">
									<Activity size={20} strokeWidth={2.5} />
								</Icon3D>
								<div>
									<h3 className="font-bold text-gray-800 text-lg">
										Semua Aktivitas Admin
									</h3>
									<p className="text-xs text-gray-400 mt-1">
										Daftar lengkap log riwayat aktivitas admin
									</p>
								</div>
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
							{activityLogs.map((log: ActivityLog, i: number) =>
								renderLogItem(log, i),
							)}
						</div>
						<div className="p-4 border-t border-gray-100 flex justify-end">
							{/* <button
								onClick={() => setShowAllLogs(false)}
								className="px-6 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-2xl text-sm transition-colors"
							>
								Tutup
							</button> */}
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
