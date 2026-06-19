import type { Attendance } from "@/hooks/admin/useAttendances";

export interface ReportEvent {
	id: number;
	event_title: string;
	event_datetime: string;
	event_date?: string;
	status_event: "Mendatang" | "Selesai";
	quota?: number;
}

export interface Presence {
	id: number;
	event_id: number;
	user_id: number;
	scanned_at?: string;
	user?: {
		id: number;
		name: string;
		email: string;
		angkatan?: string;
		phone?: string;
		status?: string;
		role?: string;
	};
}

export function formatDate(dateValue?: string | null) {
	if (!dateValue) return "-";

	const d = new Date(dateValue);

	if (Number.isNaN(d.getTime())) return "-";

	return d.toLocaleDateString("id-ID", {
		day: "2-digit",
		month: "long",
		year: "numeric",
	});
}

export function formatTime(dateValue?: string | null) {
	if (!dateValue) return "-";

	const d = new Date(dateValue);

	if (Number.isNaN(d.getTime())) return "-";

	return d.toLocaleTimeString("id-ID", {
		hour: "2-digit",
		minute: "2-digit",
	});
}

export function formatDateTimeIndonesia(dateValue?: string | null) {
	if (!dateValue) return "-";

	const d = new Date(dateValue);

	if (Number.isNaN(d.getTime())) return "-";

	const datePart = d.toLocaleDateString("id-ID", {
		day: "numeric",
		month: "long",
		year: "numeric",
	});
	const timeParts = new Intl.DateTimeFormat("id-ID", {
		hour: "2-digit",
		minute: "2-digit",
		hour12: false,
	}).formatToParts(d);
	const hour = timeParts.find((part) => part.type === "hour")?.value ?? "00";
	const minute = timeParts.find((part) => part.type === "minute")?.value ?? "00";

	return `${datePart}, ${hour}:${minute}`;
}

export function formatEventTime(startTime?: string | null, endTime?: string | null) {
	if (!startTime && !endTime) return "-";

	const start = startTime ? startTime.slice(0, 5) : "-";
	const end = endTime ? endTime.slice(0, 5) : "-";

	return `${start} - ${end}`;
}

export function getUserName(attendance: Attendance) {
	return attendance.user?.name ?? `User #${attendance.user_id}`;
}

export function getAttendanceCount(presences: Presence[], eventId: number) {
	return presences.filter((presence) => presence.event_id === eventId).length;
}

export function getAttendanceRate(
	presences: Presence[],
	eventId: number,
	quota?: number,
) {
	if (!quota) return 0;
	return Math.round((getAttendanceCount(presences, eventId) / quota) * 100);
}

export function getReportStats(events: ReportEvent[], presences: Presence[]) {
	const selesai = events.filter((event) => event.status_event === "Selesai").length;
	const totalHadir = presences.length;
	const avgRate =
		events.length > 0
			? Math.round(
					events.reduce((sum, event) => {
						return (
							sum +
							getAttendanceRate(presences, event.id, event.quota)
						);
					}, 0) / events.length,
				)
			: 0;

	return { selesai, totalHadir, avgRate };
}
