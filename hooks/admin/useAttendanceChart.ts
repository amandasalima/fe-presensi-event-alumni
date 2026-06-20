import { useQuery } from "@tanstack/react-query";
import { fetchAPI } from "@/lib/api";

export interface AttendanceChartMonth {
	month: number;
	label: string;
	total: number;
}

export interface AttendanceChartData {
	year: number;
	event_id: number | null;
	total: number;
	monthly: AttendanceChartMonth[];
}

interface AttendanceChartResponse {
	success: boolean;
	data: AttendanceChartData;
}

export function useAttendanceChart(
	year?: number,
	months?: number,
	eventId?: string,
) {
	const params = new URLSearchParams();
	if (year) params.set("year", String(year));
	if (months) params.set("months", String(months));
	if (eventId && eventId !== "all") params.set("event_id", eventId);

	const queryString = params.toString();
	const endpoint = `/admin/dashboard/attendance-chart${queryString ? `?${queryString}` : ""}`;

	return useQuery<AttendanceChartData>({
		queryKey: ["attendance-chart", year, months, eventId],
		queryFn: async () => {
			const response: AttendanceChartResponse = await fetchAPI(endpoint);
			return response.data;
		},
	});
}
