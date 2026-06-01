export type EventStatus = "Mendatang" | "Selesai";

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
	quota?: number;
	registered?: number;
	created_at?: string;
	updated_at?: string;
}

export interface EventPayload {
	category_id: number;
	event_title: string;
	description: string;
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
	quota?: number;
	registered?: number;
	created_at?: string;
	updated_at?: string;
};

export type ApiResponse<T> = {
	success: boolean;
	message?: string;
	data: T;
};

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
	qr_token: string;
	qr_code_image: string;
	qr_code_url: string;
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
