"use client";

import {
	Award,
	CalendarCheck,
	History,
	ShieldCheck,
	Target,
	Trophy,
} from "lucide-react";
import EngagementSegmentBadge from "@/app/components/EngagementSegmentBadge";
import {
	clampEngagementPercentage,
	getEngagementSegmentConfig,
} from "@/lib/engagement";
import type { AlumniEngagementSummary } from "@/hooks/alumni/queries/engagement";

const toneColors = {
	success: "#41A07E",
	warning: "#2D7EA0",
	info: "#0EA5E9",
	neutral: "#6B7280",
};

const levelLabels = {
	"Al-Muqorrobun": "Level Utama",
	"Al-Mutawasithun": "Level Menengah",
	"Al-Mubtadi'un": "Level Awal",
	"Ghoir Mukayyad": "Level Mulai",
};

function SkeletonLine({ className }: { className: string }) {
	return <div className={`animate-pulse rounded bg-gray-200 ${className}`} />;
}

function formatDate(value?: string | null) {
	if (!value) return "-";

	const date = new Date(value);
	if (Number.isNaN(date.getTime())) return "-";

	return date.toLocaleDateString("id-ID", {
		day: "numeric",
		month: "short",
		year: "numeric",
	});
}

function formatTime(value?: string | null) {
	if (!value) return "";
	return value.slice(0, 5);
}

export default function EngagementProgressCard({
	engagement,
	isLoading,
	isError,
}: {
	engagement?: AlumniEngagementSummary;
	isLoading: boolean;
	isError: boolean;
}) {
	if (isLoading) {
		return (
			<section className="rounded-2xl border border-gray-50 bg-white p-4 shadow-sm">
				<div className="flex items-center justify-between gap-3">
					<div className="space-y-2">
						<SkeletonLine className="h-4 w-36" />
						<SkeletonLine className="h-3 w-48" />
					</div>
					<SkeletonLine className="h-16 w-16 rounded-full" />
				</div>
				<SkeletonLine className="mt-4 h-3 w-full" />
				<SkeletonLine className="mt-3 h-16 w-full rounded-xl" />
			</section>
		);
	}

	if (isError) {
		return (
			<section className="rounded-2xl border border-red-100 bg-red-50 p-4 text-sm text-red-600">
				Engagement belum dapat dimuat. Silakan coba beberapa saat lagi.
			</section>
		);
	}

	if (!engagement) return null;

	const attendance = engagement.attendance;
	const totalEvents = attendance?.total_events ?? 0;
	const attendedEvents = attendance?.attended_events ?? 0;
	const percentage = clampEngagementPercentage(attendance?.percentage);
	const config = getEngagementSegmentConfig(engagement.segment);
	const color = toneColors[config.tone];
	const recentAttendances = engagement.recent_attendances ?? [];
	const hasEligibleEvents = totalEvents > 0;

	const nextHint = !hasEligibleEvents
		? "Engagement akan muncul setelah ada event yang selesai."
		: engagement.next_segment
			? `Butuh ${engagement.remaining_attendances_to_next_segment} kehadiran lagi untuk naik ke ${engagement.next_segment}.`
			: "Kamu sudah berada di segment tertinggi. Pertahankan konsistensimu.";

	return (
		<section className="overflow-hidden rounded-2xl border border-[#B2DE96]/40 bg-white shadow-md shadow-[#7AB2B2]/15">
			<div className="bg-[#2D7EA0] p-4 text-white">
				<div className="flex items-start justify-between gap-4">
					<div className="min-w-0">
						<div className="mb-2 flex items-center gap-2 text-xs font-semibold text-[#B2DE96]">
							<Trophy size={15} strokeWidth={2.5} />
							<span>Progress Kompetitif Kehadiran</span>
						</div>
						<p className="text-xs font-semibold uppercase tracking-wide text-white/60">
							Peringkat Anda Saat Ini
						</p>
						<h2 className="mt-1 text-lg font-bold leading-tight">
							{config.label}
						</h2>
						<p className="mt-1 text-xs leading-relaxed text-white/75">
							{config.competitiveCopy}
						</p>
					</div>

					<div
						className="grid h-20 w-20 shrink-0 place-items-center rounded-full"
						style={{
							background: `conic-gradient(${color} ${percentage * 3.6}deg, rgba(255,255,255,0.18) 0deg)`,
						}}
					>
						<div className="grid h-14 w-14 place-items-center rounded-full bg-white text-center">
							<span className="text-xl font-bold text-gray-900">
								{percentage}%
							</span>
						</div>
					</div>
				</div>

				<div className="mt-4 flex flex-wrap items-center gap-2">
		
					<span className="rounded-lg bg-white/15 px-2.5 py-1 text-xs font-semibold text-white">Kehadiran
						{hasEligibleEvents
							? ` ${attendedEvents} dari ${totalEvents} event`
							: "Belum ada event eligible"}
					</span>
				</div>
			</div>

			<div className="space-y-4 p-4">
				<div>
					<div className="relative h-3 rounded-full bg-gray-100">
						<div
							className="h-3 rounded-full transition-all"
							style={{ width: `${percentage}%`, backgroundColor: color }}
						/>
						{[0, 40, 70, 100].map((point) => (
							<span
								key={point}
								className="absolute top-1/2 h-4 w-1 -translate-y-1/2 rounded-full bg-white shadow-sm ring-1 ring-gray-200"
								style={{ left: `${point}%`, transform: "translate(-50%, -50%)" }}
							/>
						))}
					</div>
					<div className="mt-2 grid grid-cols-4 text-[10px] font-semibold text-gray-400">
						<span>0%</span>
						<span className="text-center">40%</span>
						<span className="text-center">70%</span>
						<span className="text-right">100%</span>
					</div>
				</div>

				<div className="flex items-start gap-3 rounded-xl bg-gray-50 p-3">
					<Target size={17} className="mt-0.5 shrink-0 text-[#2D7EA0]" />
					<p className="text-xs font-medium leading-relaxed text-gray-600">
						{nextHint}
					</p>
				</div>

				<div className="grid grid-cols-4 gap-1.5">
					{[
						["Utama", "Al-Muqorrobun"],
						["Menengah", "Al-Mutawasithun"],
						["Awal", "Al-Mubtadi'un"],
						["Mulai", "Ghoir Mukayyad"],
					].map(([rank, segmentName]) => {
						const isCurrent = segmentName === config.label;

						return (
							<div
								key={segmentName}
								className={`rounded-xl border p-2 text-center ${
									isCurrent
										? "border-[#2D7EA0] bg-[#7AB2B2]/15"
										: "border-gray-100 bg-white"
								}`}
							>
								{isCurrent ? (
									<ShieldCheck
										size={16}
										className="mx-auto text-[#2D7EA0]"
										strokeWidth={2.5}
									/>
								) : (
									<Award
										size={16}
										className="mx-auto text-gray-300"
										strokeWidth={2.5}
									/>
								)}
								<p className="mt-1 text-[10px] font-bold text-gray-700">
									{rank}
								</p>
								<p
									className={`mt-0.5 truncate text-[9px] font-semibold ${
										isCurrent ? "text-[#2D7EA0]" : "text-gray-300"
									}`}
								>
									{levelLabels[segmentName as keyof typeof levelLabels]}
								</p>
							</div>
						);
					})}
				</div>

				<div>
					<div className="mb-2 flex items-center gap-2">
						<History size={16} className="text-[#41A07E]" />
						<h3 className="text-sm font-bold text-gray-900">
							Kehadiran Terbaru
						</h3>
					</div>

					{recentAttendances.length === 0 ? (
						<p className="rounded-xl border border-gray-100 px-3 py-3 text-center text-xs text-gray-400">
							Belum ada riwayat kehadiran terbaru.
						</p>
					) : (
						<div className="space-y-2">
							{recentAttendances.slice(0, 3).map((attendanceItem) => (
								<div
									key={attendanceItem.id}
									className="flex items-center gap-3 rounded-xl border border-gray-100 px-3 py-2.5"
								>
									<span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-[#B2DE96]/35 text-[#41A07E]">
										<CalendarCheck size={16} strokeWidth={2.5} />
									</span>
									<div className="min-w-0">
										<p className="truncate text-xs font-semibold text-gray-800">
											{attendanceItem.event?.event_title ?? "Event alumni"}
										</p>
										<p className="mt-0.5 truncate text-[11px] text-gray-400">
											{formatDate(attendanceItem.scanned_at)}
											{attendanceItem.event?.start_time
												? `, ${formatTime(attendanceItem.event.start_time)} WIB`
												: ""}
										</p>
									</div>
								</div>
							))}
						</div>
					)}
				</div>
			</div>
		</section>
	);
}
