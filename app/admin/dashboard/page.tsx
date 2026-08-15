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
  QrCode,
  Users,
  X,
} from "lucide-react";
import AdminLayout from "@/app/components/AdminLayout";
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
      badgeColor = "bg-blue-50 text-blue-700 border-blue-200";
      break;
    case "generate_qr":
      label = "QR Dibuat";
      badgeColor = "bg-[#0D5C3A]/10 text-[#0D5C3A] border-[#0D5C3A]/20";
      break;
    case "edit_user":
      label = "Pengguna Diperbarui";
      badgeColor = "bg-[#D4AF37]/10 text-[#9A7A1A] border-[#D4AF37]/30";
      break;
    case "delete_user":
      label = "Pengguna Dihapus";
      badgeColor = "bg-red-50 text-red-700 border-red-200";
      break;
    case "create_event":
      label = "Event Dibuat";
      badgeColor = "bg-emerald-50 text-emerald-700 border-emerald-200";
      break;
    case "update_event":
      label = "Event Diperbarui";
      badgeColor = "bg-amber-50 text-amber-700 border-amber-200";
      break;
    case "delete_event":
      label = "Event Dihapus";
      badgeColor = "bg-rose-50 text-rose-700 border-rose-200";
      break;
    case "toggle_event":
      label = "Status Event Diubah";
      badgeColor = "bg-indigo-50 text-indigo-700 border-indigo-200";
      break;
  }

  return (
    <div
      key={log.id ?? i}
      className="py-2.5 px-3 border-b border-[#0D5C3A]/5 last:border-b-0 flex flex-col gap-1 hover:bg-[#E8F5E9]/30 rounded-lg transition-colors"
    >
      <div className="flex items-center justify-between gap-2">
        <span
          className={`text-[10px] px-2.5 py-0.5 font-semibold rounded-full border ${badgeColor}`}
        >
          {label}
        </span>
        <span className="text-[10px] text-[#0D5C3A]/40 font-mono">
          {formatDateTime(log.created_at)}
        </span>
      </div>
      <p className="text-xs text-[#0D5C3A]/70 mt-1 leading-normal font-medium">
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
    teal: "from-[#0D5C3A] via-[#0A4D30] to-[#073D26] text-white",
    blue: "from-[#2D7EA0] via-[#236175] to-[#1A4D5C] text-white",
    green: "from-[#0D5C3A] via-[#0F7047] to-[#0D5C3A] text-white",
    red: "from-red-500 via-red-600 to-red-700 text-white",
    gray: "from-gray-400 via-gray-500 to-gray-600 text-white",
    yellow: "from-[#D4AF37] via-[#B8941F] to-[#9A7A1A] text-white",
  };

  const sizes = {
    sm: "w-8 h-8 rounded-xl",
    md: "w-11 h-11 rounded-2xl",
    lg: "w-14 h-14 rounded-2xl",
  };

  return (
    <span
      className={`${sizes[size]} shrink-0 overflow-visible inline-flex items-center justify-center bg-gradient-to-br ${variants[variant]} shadow-lg shadow-[#0D5C3A]/20 border border-white/40 ring-1 ring-[#D4AF37]/20`}
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
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-[#0D5C3A]/10 animate-pulse">
      <div className="h-2.5 bg-[#E8F5E9] rounded w-1/2 mb-3" />
      <div className="flex items-center gap-3">
        <div className="w-11 h-11 rounded-xl bg-[#0D5C3A]/10" />
        <div className="h-6 bg-[#E8F5E9] rounded w-1/3" />
      </div>
      <div className="h-2.5 bg-[#E8F5E9]/70 rounded w-2/3 mt-2" />
    </div>
  );
}

function EventSkeleton() {
  return (
    <div className="flex items-center justify-between p-3 rounded-xl bg-[#E8F5E9]/30 animate-pulse">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-[#0D5C3A]/10" />
        <div>
          <div className="h-3 bg-[#0D5C3A]/20 rounded w-32 mb-1.5" />
          <div className="h-2.5 bg-[#0D5C3A]/10 rounded w-20" />
        </div>
      </div>
      <div className="h-3 bg-[#0D5C3A]/10 rounded w-12" />
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
      <div className="h-56 rounded-xl border-2 border-dashed border-[#0D5C3A]/20 bg-[#E8F5E9]/30 flex items-center justify-center text-center px-4">
        <div>
          <div className="w-16 h-16 mx-auto mb-3 bg-[#0D5C3A]/10 rounded-full flex items-center justify-center">
            <ChartColumn className="text-[#0D5C3A]/40" size={32} />
          </div>
          <p className="text-xs text-[#0D5C3A]/60 font-medium">
            Belum ada data kehadiran pada filter yang dipilih.
          </p>
        </div>
      </div>
    );
  }

  const chartJsData = {
    labels: data.map((item) => item.label),
    datasets: [
      {
        label: "Kehadiran",
        data: data.map((item) => item.count),
        backgroundColor: "rgba(13, 92, 58, 0.85)", // Hijau pesantren
        hoverBackgroundColor: "rgba(212, 175, 55, 0.9)", // Emas saat hover
        borderColor: "rgba(13, 92, 58, 1)",
        borderWidth: 1,
        borderRadius: 8,
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
        backgroundColor: "rgba(13, 92, 58, 0.95)",
        titleColor: "#E8F5E9",
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
          color: "#0D5C3A",
          font: { size: 11, weight: 500 as const },
        },
      },
      y: {
        beginAtZero: true,
        grid: {
          color: "rgba(13, 92, 58, 0.1)",
        },
        border: {
          display: false,
          dash: [4, 4],
        },
        ticks: {
          color: "#0D5C3A",
          font: { size: 11, weight: 500 as const },
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
        setTimeout(() => {
          setFeedback({
            type: "error",
            message: "Kamu tidak memiliki akses ke pengelolaan admin.",
          });
        }, 0);
        // clear query param
        window.history.replaceState(
          {},
          document.title,
          window.location.pathname,
        );
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
    <AdminLayout title="Dashboard">
      {/* Welcome Banner */}
      <div className="mb-5 bg-gradient-to-r from-[#0D5C3A] via-[#0A4D30] to-[#0D5C3A] rounded-2xl p-6 shadow-lg relative overflow-hidden">
        {/* Decorative Pattern */}
        <div className="absolute inset-0 opacity-10">
          <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern
                id="dashboard-pattern"
                width="40"
                height="40"
                patternUnits="userSpaceOnUse"
              >
                <circle
                  cx="20"
                  cy="20"
                  r="15"
                  fill="none"
                  stroke="#D4AF37"
                  strokeWidth="0.5"
                />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#dashboard-pattern)" />
          </svg>
        </div>
        <div className="relative z-10 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white mb-1">
              Assalamualaikum, Admin!
            </h1>
            <p className="text-[#E8F5E9]/90 text-sm">
              Selamat datang di Dashboard Pesantren Al-Falah
            </p>
          </div>
          <div className="hidden md:block">
            <div className="w-16 h-16 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center border-2 border-[#D4AF37]/30">
              <Activity className="text-[#D4AF37]" size={32} strokeWidth={2} />
            </div>
          </div>
        </div>
      </div>

      {/* ── Stat Cards ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mb-5">
        {isLoading
          ? [1, 2, 3, 4].map((i) => <StatSkeleton key={i} />)
          : stats.map((item) => (
              <div
                key={item.title}
                className="bg-white rounded-2xl border border-[#0D5C3A]/10 shadow-md shadow-[#0D5C3A]/5 p-5 hover:shadow-lg hover:shadow-[#0D5C3A]/10 transition-all duration-300 hover:-translate-y-1"
              >
                <p className="text-[#0D5C3A]/70 text-xs font-semibold uppercase tracking-wide">
                  {item.title}
                </p>
                <div className="flex items-center gap-3 mt-2">
                  <Icon3D variant={item.variant} size="md">
                    {item.icon}
                  </Icon3D>
                  <h2 className="text-3xl font-bold text-[#0D5C3A]">
                    {item.value}
                  </h2>
                </div>
                <p className="text-[#0D5C3A]/50 text-xs mt-2">{item.desc}</p>
              </div>
            ))}
      </div>

      {/* ── Chart Section (Full Width) ── */}
      <div className="mb-5">
        <section className="w-full bg-white rounded-2xl p-6 shadow-md shadow-[#0D5C3A]/5 border border-[#0D5C3A]/10">
          <div className="flex items-center gap-3 mb-4">
            <Icon3D variant="teal" size="md">
              <ChartColumn size={20} strokeWidth={2.5} />
            </Icon3D>
            <div>
              <h2 className="text-base font-bold text-[#0D5C3A] mb-1">
                Grafik Kehadiran Alumni
              </h2>
              <p className="text-[#0D5C3A]/60 text-xs">
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
                className="w-full h-9 appearance-none rounded-xl border border-[#0D5C3A]/20 bg-white px-3 pr-10 text-xs font-medium text-[#0D5C3A] outline-none focus:border-[#0D5C3A] focus:ring-2 focus:ring-[#0D5C3A]/20 cursor-pointer"
                aria-label="Filter tahun grafik"
              >
                {chartYears.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>

              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[#0D5C3A]/60 pointer-events-none">
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
                className="w-full h-9 appearance-none rounded-xl border border-[#0D5C3A]/20 bg-white px-3 pr-10 text-xs font-medium text-[#0D5C3A] outline-none focus:border-[#0D5C3A] focus:ring-2 focus:ring-[#0D5C3A]/20 cursor-pointer"
                aria-label="Filter rentang bulan grafik"
              >
                <option value="3">3 bulan terakhir</option>
                <option value="6">6 bulan terakhir</option>
                <option value="12">12 bulan terakhir</option>
              </select>

              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[#0D5C3A]/60 pointer-events-none">
                ▾
              </span>
            </div>

            {/* Event */}
            <div className="relative">
              <select
                value={chartEventId}
                onChange={(event) => setChartEventId(event.target.value)}
                className="w-full h-9 appearance-none rounded-xl border border-[#0D5C3A]/20 bg-white px-3 pr-10 text-xs font-medium text-[#0D5C3A] outline-none focus:border-[#0D5C3A] focus:ring-2 focus:ring-[#0D5C3A]/20 cursor-pointer"
                aria-label="Filter event grafik"
              >
                <option value="all">Semua event</option>

                {events.map((event: Event) => (
                  <option key={event.id} value={event.id}>
                    {event.event_title}
                  </option>
                ))}
              </select>

              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[#0D5C3A]/60 pointer-events-none">
                ▾
              </span>
            </div>
          </div>
          {loadingChart ? (
            <div className="h-40 rounded-xl bg-[#E8F5E9] animate-pulse" />
          ) : (
            <>
              <AttendanceChart data={chartData.bars} total={chartData.total} />
              <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs text-[#0D5C3A]/70">
                <span>
                  Total {chartData.total} kehadiran pada periode{" "}
                  {chartData.startLabel} - {chartData.endLabel} {chartYear}
                </span>
                <span className="font-semibold text-[#0D5C3A]">
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
      </div>

      {/* ── Bottom Section ── */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        {/* Event Terbaru */}
        <div className="bg-white rounded-2xl p-6 shadow-md shadow-[#0D5C3A]/5 border border-[#0D5C3A]/10">
          <div className="flex items-center gap-3 mb-4">
            <Icon3D variant="blue" size="md">
              <CalendarCheck size={20} strokeWidth={2.5} />
            </Icon3D>
            <div>
              <h2 className="text-base font-bold text-[#0D5C3A] mb-1">
                Event Terbaru
              </h2>
              <p className="text-[#0D5C3A]/60 text-xs">
                Daftar event yang akan berlangsung
              </p>
            </div>
          </div>
          <div className="space-y-3">
            {loadingEvents ? (
              [1, 2, 3, 4, 5].map((i) => <EventSkeleton key={i} />)
            ) : upcomingEvents.length === 0 ? (
              <div className="text-center py-6 text-[#0D5C3A]/40 flex flex-col items-center">
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
                    className="flex items-center justify-between p-3 rounded-xl bg-gradient-to-r from-[#E8F5E9] to-white border border-[#0D5C3A]/10 hover:border-[#D4AF37]/30 transition-all duration-200 hover:shadow-sm"
                  >
                    <div className="flex items-center gap-3">
                      <Icon3D variant="teal" size="sm">
                        <span className="text-xs font-bold">
                          {String(index + 1).padStart(2, "0")}
                        </span>
                      </Icon3D>
                      <div>
                        <h3 className="font-semibold text-[#0D5C3A] text-sm">
                          {event.event_title}
                        </h3>
                        <p className="text-xs text-[#0D5C3A]/50">
                          Event Mendatang
                        </p>
                      </div>
                    </div>
                    <div className="text-right text-[#D4AF37] font-bold text-xs">
                      {day} <br />{" "}
                      <span className="text-[#0D5C3A]/70">{year}</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Aktivitas Terbaru */}
        <div className="bg-white rounded-2xl p-6 shadow-md shadow-[#0D5C3A]/5 border border-[#0D5C3A]/10">
          <div className="flex items-center gap-3 mb-4">
            <Icon3D variant="yellow" size="md">
              <Activity size={20} strokeWidth={2.5} />
            </Icon3D>
            <h2 className="text-base font-bold text-[#0D5C3A]">
              Aktivitas Terbaru
            </h2>
          </div>
          {loadingActivityLogs ? (
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-8 bg-[#E8F5E9] rounded-lg animate-pulse"
                />
              ))}
            </div>
          ) : (
            <div className="flex flex-col">
              {activityLogs
                .slice(0, 4)
                .map((log: ActivityLog, i: number) => renderLogItem(log, i))}
              {activityLogs.length === 0 && (
                <p className="text-xs text-[#0D5C3A]/40 text-center py-3">
                  Belum ada aktivitas
                </p>
              )}
              {activityLogs.length > 4 && (
                <button
                  onClick={() => setShowAllLogs(true)}
                  className="w-full mt-3 py-2.5 text-center text-xs font-bold text-[#0D5C3A] hover:text-white transition-colors border-2 border-dashed border-[#0D5C3A]/20 hover:border-[#0D5C3A] rounded-xl bg-[#E8F5E9] hover:bg-[#0D5C3A] flex items-center justify-center gap-2"
                >
                  Lihat Semua Aktivitas
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      <footer className="mt-6 text-center text-[#0D5C3A]/40 text-xs pb-4">
        © 2026 Sistem Presensi Event - Pondok Pesantren Al-Qur&apos;an Al-Falah
      </footer>

      {showAllLogs && (
        <div className="fixed inset-0 bg-[#0D5C3A]/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg flex flex-col max-h-[80vh] border-2 border-[#D4AF37]/20">
            <div className="p-6 border-b border-[#0D5C3A]/10 flex items-center justify-between bg-gradient-to-r from-[#E8F5E9] to-white">
              <div className="flex items-center gap-3">
                <Icon3D variant="yellow" size="md">
                  <Activity size={20} strokeWidth={2.5} />
                </Icon3D>
                <div>
                  <h3 className="font-bold text-[#0D5C3A] text-lg">
                    Semua Aktivitas Admin
                  </h3>
                  <p className="text-xs text-[#0D5C3A]/60 mt-1">
                    Daftar lengkap log riwayat aktivitas admin
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowAllLogs(false)}
                className="text-[#0D5C3A]/60 hover:text-[#0D5C3A] p-2 hover:bg-[#0D5C3A]/10 rounded-xl transition-colors"
                aria-label="Tutup"
              >
                <X size={20} />
              </button>
            </div>
            <div className="p-6 overflow-y-auto flex-1">
              {activityLogs.map((log: ActivityLog, i: number) =>
                renderLogItem(log, i),
              )}
            </div>
          </div>
        </div>
      )}
      {feedback && (
        <FeedbackToast type={feedback.type} message={feedback.message} />
      )}
    </AdminLayout>
  );
}
