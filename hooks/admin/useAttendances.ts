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
	scanned_at?: string;
	status?: string;
	attendance?: {
		registered_at?: string;
		scanned_at?: string;
		status?: string;
	} | null;
	event?: AttendanceEvent;
	user?: AttendanceUser;
}

export interface AttendanceResponseData {
	event: AttendanceEvent;
	summary?: {
		total_registered?: number;
		total_attended?: number;
		total_absent?: number;
		total_not_attended?: number;
		quota?: number | null;
		quota_used?: number;
		remaining_quota?: number | null;
		is_quota_full?: boolean;
		quota_status?: "unlimited" | "available" | "full";
		quota_message?: string;
	};
	attendances: Attendance[];
	total: number;
	current_page: number;
	last_page: number;
}

type AttendanceResponse = {
	success: boolean;
	data: AttendanceResponseData;
};

export interface GetEventAttendancesParams {
	search?: string;
	status?: string;
	attendance_status?: string;
	graduation_year?: string;
	angkatan?: string;
	year?: string | number;
	domicile_province_code?: string;
	domicile_city_code?: string;
	domicile_district_code?: string;
	domicile_village_code?: string;
	sort_by?: string;
	sort_dir?: "asc" | "desc";
	page?: number;
	per_page?: number;
}

export function useEventAttendances(eventId: number | null, params?: GetEventAttendancesParams) {
	return useQuery({
		queryKey: ["admin-event-attendances", eventId, params],
		queryFn: async () => {
			const query = new URLSearchParams();
			if (params) {
				Object.entries(params).forEach(([key, val]) => {
					if (val !== undefined && val !== null && val !== "") {
						query.append(key, String(val));
					}
				});
			}

			const queryString = query.toString();
			const endpoint = `/admin/events/${eventId}/attendances${queryString ? `?${queryString}` : ""}`;
			const response = (await fetchAPI(endpoint)) as AttendanceResponse;

			return response.data;
		},
		enabled: !!eventId,
	});
}
