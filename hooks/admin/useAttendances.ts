import { useQuery } from "@tanstack/react-query";
import { fetchAPI } from "@/lib/api";

export interface AttendanceUser {
	id: number;
	name: string;
	gender?: string;
	status?: string;
	email: string;
	phone?: string;
	angkatan?: string;
	role?: string;
	created_at?: string;
}

export interface AttendanceEvent {
	id: number;
	category_id: number;
	created_by: number;
	event_title: string;
	description?: string;
	location: string;
	event_date: string;
	start_time: string;
	end_time: string;
	qr_token?: string;
	status_event: string;
	created_at?: string;
}

export interface Attendance {
	id: number;
	event_id: number;
	user_id: number;
	scanned_at: string;
	event?: AttendanceEvent;
	user?: AttendanceUser;
}

export interface AttendanceResponseData {
	event: AttendanceEvent;
	attendances: Attendance[];
	total: number;
	current_page: number;
	last_page: number;
}

type AttendanceResponse = {
	success: boolean;
	data: AttendanceResponseData;
};

export function useEventAttendances(eventId: number | null, perPage = 10) {
	return useQuery({
		queryKey: ["admin-event-attendances", eventId, perPage],
		queryFn: async () => {
			const response = (await fetchAPI(
				`/admin/events/${eventId}/attendances?per_page=${perPage}`,
			)) as AttendanceResponse;

			return response.data;
		},
		enabled: !!eventId,
	});
}
