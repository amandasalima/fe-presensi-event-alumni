"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useQueries } from "@tanstack/react-query";
import {
	fetchEventAttendances,
	type GetEventAttendancesParams,
	useEventAttendances,
} from "@/hooks/admin/useAttendances";
import { useEvents } from "@/hooks/admin/useEvents";
import { fetchAPI, getApiErrorMessage } from "@/lib/api";
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
	const [selectedEventId, setSelectedEventIdState] = useState<number | null>(null);
	const [selectedId, setSelectedId] = useState<number | null>(null);
	const [attendanceParams, setAttendanceParams] = useState<GetEventAttendancesParams>({
		page: 1,
		per_page: 10,
	});
	const [exportingFormat, setExportingFormat] = useState<"PDF" | "Excel" | null>(
		null,
	);
	const [feedback, setFeedback] = useState<{
		type: "success" | "error";
		message: string;
	} | null>(null);
	const feedbackTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

	const {
		data: attendanceData,
		isLoading: isLoadingAttendances,
		isFetching: isFetchingAttendances,
		isError: isAttendanceError,
		error: attendanceError,
	} = useEventAttendances(selectedEventId, attendanceParams);
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
	const attendanceByAngkatan = attendanceData?.breakdown?.by_angkatan ?? [];
	const attendanceByDomicile = attendanceData?.breakdown?.by_domicile ?? [];
	const attendanceCurrentPage = attendanceData?.current_page ?? 1;
	const attendanceLastPage = attendanceData?.last_page ?? 1;
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
	const setSelectedEventId = (eventId: number | null) => {
		setSelectedEventIdState(eventId);
		setAttendanceParams((previous) => ({ ...previous, page: 1 }));
	};

	useEffect(() => clearFeedbackTimeout, []);

	const handleDownload = async (format: "PDF" | "Excel") => {
		if (!selectedEventId || exportingFormat) return;

		const preparedPdfWindow =
			format === "PDF"
				? window.open("", "_blank", "width=1120,height=800")
				: null;

		if (format === "PDF" && !preparedPdfWindow) {
			showFeedback({
				type: "error",
				message: "Popup PDF diblokir browser. Izinkan popup lalu coba lagi.",
			});
			return;
		}

		setExportingFormat(format);

		try {
			const firstPage = await fetchEventAttendances(selectedEventId, {
				page: 1,
				per_page: 100,
			});
			const remainingPages = await Promise.all(
				Array.from(
					{ length: Math.max(0, firstPage.last_page - 1) },
					(_, index) => index + 2,
				).map((page) =>
					fetchEventAttendances(selectedEventId, { page, per_page: 100 }),
				),
			);
			const allAttendances = [
				...firstPage.attendances,
				...remainingPages.flatMap((page) => page.attendances),
			];

			if (format === "PDF") {
				exportAttendancesToPdf(
					firstPage.event,
					allAttendances,
					firstPage.summary,
					preparedPdfWindow,
				);
				showFeedback({
					type: "success",
					message: "Data kehadiran siap dicetak atau disimpan sebagai PDF",
				});
			} else {
				exportAttendancesToExcel(
					firstPage.event,
					allAttendances,
					firstPage.summary,
				);
				showFeedback({
					type: "success",
					message: "Data kehadiran berhasil diekspor ke Excel",
				});
			}
		} catch (error) {
			preparedPdfWindow?.close();
			showFeedback({
				type: "error",
				message: getApiErrorMessage(
					error,
					"Gagal menyiapkan data kehadiran untuk diekspor.",
				),
			});
		} finally {
			setExportingFormat(null);
		}
	};

	return {
		attendanceError,
		attendanceByAngkatan,
		attendanceByDomicile,
		attendanceCurrentPage,
		attendanceLastPage,
		attendances,
		attendanceParams,
		setAttendanceParams,
		avgRate,
		events: typedEvents,
		feedback,
		getHadir,
		getRate,
		handleDownload,
		isExporting: exportingFormat !== null,
		exportingFormat,
		isAttendanceError,
		loadingAttendances: isLoadingAttendances || isFetchingAttendances,
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
