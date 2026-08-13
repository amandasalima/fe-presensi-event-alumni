import { useQuery } from "@tanstack/react-query";
import { fetchAPI } from "@/lib/api";
import { alumniQueryKeys } from "./queryKeys";

export interface AlumniEngagementAttendance {
	total_events: number;
	attended_events: number;
	percentage: number;
}

export interface AlumniRecentAttendance {
	id: number;
	status: string;
	scanned_at: string;
	event?: {
		id: number;
		event_title: string;
		location?: string | null;
		event_date?: string | null;
		start_time?: string | null;
		end_time?: string | null;
	};
}

export interface AlumniEngagementSummary {
	attendance: AlumniEngagementAttendance;
	segment: string;
	next_segment: string | null;
	remaining_attendances_to_next_segment: number;
	recent_attendances: AlumniRecentAttendance[];
}

export function useAlumniEngagementSummary() {
	return useQuery<AlumniEngagementSummary>({
		queryKey: alumniQueryKeys.engagementSummary,
		queryFn: async () => {
			const response = await fetchAPI("/alumni/engagement/summary");
			return response?.data;
		},
	});
}
