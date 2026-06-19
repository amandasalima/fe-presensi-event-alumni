export type EventStatus = "Mendatang" | "Selesai";
export type EventActiveStatus = "active" | "inactive";
export type EventRegistrationStatus = "registered" | "attended" | "absent";

export type CategoryObject = {
	id: number;
	category_name: string;
	description?: string;
	created_at?: string;
	updated_at?: string;
};

export interface Event {
	id: number;
	event_title: string;
	description?: string;
	category: string;
	category_id?: number;
	poster_url?: string;
	event_datetime: string;
	event_date?: string;
	start_time?: string;
	end_time?: string;
	location: string;
	status_event: EventStatus;
	quota?: number | null;
	quota_used?: number;
	remaining_quota?: number | null;
	is_quota_full?: boolean;
	quota_status?: "unlimited" | "available" | "full";
	quota_message?: string;
	registered?: number;
	created_at?: string;
	updated_at?: string;
}

export interface EventPayload {
	category_id: number;
	event_title: string;
	description?: string;
	location: string;
	event_date: string;
	start_time: string;
	end_time: string;
	quota?: number;
	poster?: File | null;
}

export interface EventCategory {
	id: number;
	category_name: string;
	description: string;
}

export type RawEvent = {
	id: number;
	event_title: string;
	description?: string;
	category?: string | CategoryObject | null;
	category_name?: string;
	category_id?: number;
	poster_url?: string;
	event_datetime?: string;
	event_date?: string;
	start_time?: string;
	end_time?: string;
	location: string;
	status_event?: string;
	status?: string;
	quota?: number | null;
	quota_used?: number;
	remaining_quota?: number | null;
	is_quota_full?: boolean;
	quota_status?: "unlimited" | "available" | "full";
	quota_message?: string;
	registered?: number;
	created_at?: string;
	updated_at?: string;
};

export type ApiResponse<T> = {
	success: boolean;
	message?: string;
	data: T;
};

export type EventMutationResponse = ApiResponse<{
	event: RawEvent;
}>;

export type EventDetailResponse = ApiResponse<
	RawEvent | {
		event: RawEvent;
	}
>;

export type EventsData = {
	events: RawEvent[];
	total: number;
	current_page: number;
	last_page: number;
};

export type EventsResponse = ApiResponse<EventsData>;

export type CategoriesData = {
	categories: EventCategory[];
};

export type CategoriesResponse = ApiResponse<CategoriesData>;

export interface EventQrCode {
	id: number;
	event_id: number;
	qr_payload?: string;
	qr_token: string;
	valid_from: string;
	timeout_minutes: number;
	is_active: boolean;
	created_at: string;
	expired_at: string;
	is_valid_now: boolean;
	is_expired: boolean;
}

export type EventQrCodeResponse = ApiResponse<{
	qr_code: EventQrCode;
}>;

export interface GenerateQrPayload {
	valid_from: string;
	timeout_minutes: number;
}

export interface EventUser {
	id: number;
	name: string;
	email?: string;
	phone?: string;
	angkatan?: string;
	graduation_year?: string | number;
	status?: string;
	role?: string;
}

export interface EventQuotaSummary {
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
}

export interface EventAttendanceInfo {
	status?: string;
	registered_at?: string;
	scanned_at?: string;
}

export interface EventRegistration {
	id: number;
	event_id: number;
	user_id: number;
	status: EventRegistrationStatus;
	registered_at?: string;
	attendance?: EventAttendanceInfo | null;
	created_at?: string;
	updated_at?: string;
	user?: EventUser;
}

export interface EventAttendance {
	id: number;
	event_id: number;
	user_id: number;
	scanned_at?: string;
	status?: string;
	attendance?: EventAttendanceInfo | null;
	created_at?: string;
	updated_at?: string;
	user?: EventUser;
}

export type EventRegistrationsData = {
	event: RawEvent;
	summary?: EventQuotaSummary;
	registrations: EventRegistration[];
	total: number;
	current_page: number;
	last_page: number;
};

export type EventAttendancesData = {
	event: RawEvent;
	summary?: EventQuotaSummary;
	attendances: EventAttendance[];
	total: number;
	current_page: number;
	last_page: number;
};

export type EventRegistrationsResponse = ApiResponse<EventRegistrationsData>;
export type EventAttendancesResponse = ApiResponse<EventAttendancesData>;

export interface EventListParams {
	search?: string;
	status?: EventActiveStatus;
	category_id?: number | string;
	per_page?: number;
}

export interface EventRegistrationParams {
	status?: EventRegistrationStatus;
	per_page?: number;
}
