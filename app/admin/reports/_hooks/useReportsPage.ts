"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useQueries } from "@tanstack/react-query";
import { useEventAttendances } from "@/hooks/admin/useAttendances";
import { useEvents } from "@/hooks/admin/useEvents";
import { fetchAPI } from "@/lib/api";
import {
	exportAttendancesToExcel,
	exportAttendancesToPdf,
	type ReportEvent,
} from "../_utils/reportFormatters";

type AttendanceSummaryData = {
	summary?: {
		total_attended?: number;
	};
	total?: number;
	attendances?: unknown[];
};

type AttendanceSummaryResponse = {
	success: boolean;
	data: AttendanceSummaryData;
};

function getAttendanceTotal(data?: AttendanceSummaryData) {
	return data?.summary?.total_attended ?? data?.total ?? data?.attendances?.length ?? 0;
}

export function useReportsPage() {
	const [selectedEventId, setSelectedEventId] = useState<number | null>(null);
	const [selectedId, setSelectedId] = useState<number | null>(null);
	const [feedback, setFeedback] = useState<{
		type: "success" | "error";
		message: string;
	} | null>(null);
	const feedbackTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

	const {
		data: attendanceData,
		isLoading: loadingAttendances,
		isError: isAttendanceError,
		error: attendanceError,
	} = useEventAttendances(selectedEventId, 100);
	const { data: events = [], isLoading: loadingEvents } = useEvents();
	const typedEvents = events as ReportEvent[];
	const attendanceSummaryQueries = useQueries({
		queries: typedEvents.map((event) => ({
			queryKey: ["admin-event-attendance-summary", event.id],
			queryFn: async () => {
				const response = (await fetchAPI(
					`/admin/events/${event.id}/attendances?per_page=1`,
				)) as AttendanceSummaryResponse;

				return response.data;
			},
			enabled: !!event.id,
			staleTime: 30 * 1000,
		})),
	});
	const loadingAttendanceSummaries = attendanceSummaryQueries.some(
		(query) => query.isLoading,
	);
	const attendanceCountByEvent = useMemo(
		() =>
			typedEvents.reduce<Record<number, number>>((counts, event, index) => {
				counts[event.id] = getAttendanceTotal(
					attendanceSummaryQueries[index]?.data,
				);
				return counts;
			}, {}),
		[typedEvents, attendanceSummaryQueries],
	);
	const selectedAttendanceEvent = attendanceData?.event ?? null;
	const attendances = attendanceData?.attendances ?? [];
	const totalAttendances =
		attendanceData?.summary?.total_attended ?? attendanceData?.total ?? 0;
	const selected = typedEvents.find((event) => event.id === selectedId) ?? null;
	const selesai = typedEvents.filter((event) => event.status_event === "Selesai").length;
	const totalHadir = Object.values(attendanceCountByEvent).reduce(
		(total, count) => total + count,
		0,
	);
	const getHadir = (eventId: number) => attendanceCountByEvent[eventId] ?? 0;
	const getRate = (eventId: number, quota?: number | null) => {
		if (!quota) return 0;
		return Math.round((getHadir(eventId) / quota) * 100);
	};
	const avgRate =
		typedEvents.length > 0
			? Math.round(
					typedEvents.reduce(
						(total, event) => total + getRate(event.id, event.quota),
						0,
					) / typedEvents.length,
				)
			: 0;
	const clearFeedbackTimeout = () => {
		if (feedbackTimeoutRef.current) {
			clearTimeout(feedbackTimeoutRef.current);
			feedbackTimeoutRef.current = null;
		}
	};
	const showFeedback = (nextFeedback: {
		type: "success" | "error";
		message: string;
	}) => {
		clearFeedbackTimeout();
		setFeedback(nextFeedback);
		feedbackTimeoutRef.current = setTimeout(() => setFeedback(null), 3000);
	};

	useEffect(() => clearFeedbackTimeout, []);

	const handleDownload = (format: "PDF" | "Excel" | "CSV") => {
		if (!selectedAttendanceEvent) return;

		if (format === "PDF") {
			const opened = exportAttendancesToPdf(
				selectedAttendanceEvent,
				attendances,
				attendanceData?.summary,
			);

			if (!opened) {
				showFeedback({
					type: "error",
					message: "Popup PDF diblokir browser. Izinkan popup lalu coba lagi.",
				});
			} else {
				showFeedback({
					type: "success",
					message: "Data kehadiran siap dicetak atau disimpan sebagai PDF",
				});
			}
			return;
		}

		if (format === "Excel") {
			exportAttendancesToExcel(
				selectedAttendanceEvent,
				attendances,
				attendanceData?.summary,
			);
			showFeedback({
				type: "success",
				message: "Data kehadiran berhasil diexport ke Excel",
			});
		}
	};

	return {
		attendanceError,
		attendances,
		avgRate,
		events: typedEvents,
		feedback,
		getHadir,
		getRate,
		handleDownload,
		isAttendanceError,
		loadingAttendances,
		loadingAttendanceSummaries,
		loadingEvents,
		selected,
		selectedAttendanceEvent,
		selectedEventId,
		selectedId,
		setSelectedEventId,
		setSelectedId,
		selesai,
		totalAttendances,
		totalHadir,
	};
}
