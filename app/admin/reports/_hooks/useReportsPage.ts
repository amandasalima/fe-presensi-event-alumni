"use client";

import { useMemo, useState } from "react";
import { useEventAttendances } from "@/hooks/admin/useAttendances";
import { useEvents } from "@/hooks/admin/useEvents";
import { usePresences } from "@/hooks/admin/usePresences";
import {
	getAttendanceCount,
	getAttendanceRate,
	getReportStats,
	type Presence,
	type ReportEvent,
} from "../_utils/reportFormatters";

export function useReportsPage() {
	const [selectedEventId, setSelectedEventId] = useState<number | null>(null);
	const [selectedId, setSelectedId] = useState<number | null>(null);

	const {
		data: attendanceData,
		isLoading: loadingAttendances,
		isError: isAttendanceError,
		error: attendanceError,
	} = useEventAttendances(selectedEventId, 10);
	const { data: events = [], isLoading: loadingEvents } = useEvents();
	const { data: allPresences = [], isLoading: loadingPresences } =
		usePresences();
	const { data: detailPresences = [], isLoading: loadingDetail } = usePresences(
		selectedId ?? undefined,
	);

	const typedEvents = events as ReportEvent[];
	const typedPresences = allPresences as Presence[];
	const selectedAttendanceEvent = attendanceData?.event ?? null;
	const attendances = attendanceData?.attendances ?? [];
	const totalAttendances = attendanceData?.total ?? 0;
	const selected = typedEvents.find((event) => event.id === selectedId) ?? null;
	const stats = useMemo(
		() => getReportStats(typedEvents, typedPresences),
		[typedEvents, typedPresences],
	);
	const getHadir = (eventId: number) =>
		getAttendanceCount(typedPresences, eventId);
	const getRate = (eventId: number, quota?: number) =>
		getAttendanceRate(typedPresences, eventId, quota);
	const handleDownload = (format: "PDF" | "Excel" | "CSV") => {
		const reportEventId = selectedEventId ?? selectedId;
		if (!reportEventId) return;

		window.open(
			`${process.env.NEXT_PUBLIC_API_URL}/Reports/${reportEventId}/download?format=${format.toLowerCase()}`,
			"_blank",
		);
	};

	return {
		attendanceError,
		attendances,
		avgRate: stats.avgRate,
		detailPresences: detailPresences as Presence[],
		events: typedEvents,
		getHadir,
		getRate,
		handleDownload,
		isAttendanceError,
		loadingAttendances,
		loadingDetail,
		loadingEvents,
		loadingPresences,
		selected,
		selectedAttendanceEvent,
		selectedEventId,
		selectedId,
		setSelectedEventId,
		setSelectedId,
		selesai: stats.selesai,
		totalAttendances,
		totalHadir: stats.totalHadir,
	};
}
