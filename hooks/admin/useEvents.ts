import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchAPI } from "@/lib/api";

// ─── Types ───────────────────────────────────────────────────────────────────

export type EventStatus = "Mendatang" | "Selesai";

type CategoryObject = {
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
}

type RawEvent = {
	id: number;
	event_title: string;
	description?: string;
	category?: string | CategoryObject | null;
	category_name?: string;
	category_id?: number;
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

type ApiResponse<T> = {
	success: boolean;
	message?: string;
	data: T;
};

type EventsData = {
	events: RawEvent[];
	total: number;
	current_page: number;
	last_page: number;
};

type EventsResponse = ApiResponse<EventsData>;

// ─── Helpers ─────────────────────────────────────────────────────────────────

function buildQueryParams(
	params: Record<string, string | number | undefined | null>,
) {
	const searchParams = new URLSearchParams();

	Object.entries(params).forEach(([key, value]) => {
		if (value !== undefined && value !== null && String(value).trim() !== "") {
			searchParams.set(key, String(value));
		}
	});

	const queryString = searchParams.toString();

	return queryString ? `?${queryString}` : "";
}

function getCategoryName(category: RawEvent["category"], fallback?: string) {
	if (typeof category === "string") {
		return category;
	}

	if (category && typeof category === "object") {
		return category.category_name;
	}

	return fallback ?? "Alumni";
}

function getCategoryId(event: RawEvent) {
	if (event.category_id) {
		return event.category_id;
	}

	if (event.category && typeof event.category === "object") {
		return event.category.id;
	}

	return undefined;
}

function getEventDateTime(event: RawEvent) {
	if (event.event_datetime) {
		return event.event_datetime;
	}

	if (event.event_date && event.start_time) {
		return `${event.event_date}T${event.start_time}`;
	}

	if (event.event_date) {
		return `${event.event_date}T00:00`;
	}

	return "";
}

function getEventStatus(event: RawEvent): EventStatus {
	if (event.status_event === "Selesai" || event.status === "Selesai") {
		return "Selesai";
	}

	if (event.status_event === "Mendatang" || event.status === "Mendatang") {
		return "Mendatang";
	}

	const eventDateTime = getEventDateTime(event);

	if (!eventDateTime) {
		return "Mendatang";
	}

	const eventDate = new Date(eventDateTime);
	const now = new Date();

	if (Number.isNaN(eventDate.getTime())) {
		return "Mendatang";
	}

	return eventDate >= now ? "Mendatang" : "Selesai";
}

function normalizeEvent(event: RawEvent): Event {
	return {
		id: event.id,
		event_title: event.event_title,
		description: event.description,
		category: getCategoryName(event.category, event.category_name),
		category_id: getCategoryId(event),
		event_datetime: getEventDateTime(event),
		event_date: event.event_date,
		start_time: event.start_time,
		end_time: event.end_time,
		location: event.location,
		status_event: getEventStatus(event),
		quota: event.quota,
		registered: event.registered,
		created_at: event.created_at,
		updated_at: event.updated_at,
	};
}

// ─── GET semua event admin ───────────────────────────────────────────────────

export function useEvents(search = "", perPage = 10) {
	return useQuery({
		queryKey: ["admin-events", search, perPage],
		queryFn: async () => {
			const query = buildQueryParams({
				per_page: perPage,
				search,
			});

			const response = (await fetchAPI(
				`/admin/events${query}`,
			)) as EventsResponse;

			return (response.data.events ?? []).map(normalizeEvent);
		},
	});
}

// ─── GET satu event by ID ────────────────────────────────────────────────────

export function useEvent(id: number) {
	return useQuery({
		queryKey: ["admin-events", id],
		queryFn: async () => {
			const response = (await fetchAPI(
				`/admin/events/${id}`,
			)) as ApiResponse<RawEvent>;

			return normalizeEvent(response.data);
		},
		enabled: !!id,
	});
}

// ─── POST buat event baru ────────────────────────────────────────────────────

export function useCreateEvent() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (data: EventPayload) => {
			return (await fetchAPI("/admin/events", {
				method: "POST",
				body: JSON.stringify(data),
			})) as ApiResponse<RawEvent>;
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["admin-events"] });
		},
	});
}

// ─── PUT update event ────────────────────────────────────────────────────────

export function useUpdateEvent() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async ({
			id,
			data,
		}: {
			id: number;
			data: Partial<EventPayload>;
		}) => {
			return (await fetchAPI(`/admin/events/${id}`, {
				method: "PUT",
				body: JSON.stringify(data),
			})) as ApiResponse<RawEvent>;
		},
		onSuccess: (_data, variables) => {
			queryClient.invalidateQueries({ queryKey: ["admin-events"] });
			queryClient.invalidateQueries({
				queryKey: ["admin-events", variables.id],
			});
		},
	});
}

// ─── DELETE event ────────────────────────────────────────────────────────────

export function useDeleteEvent() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (id: number) => {
			return (await fetchAPI(`/admin/events/${id}`, {
				method: "DELETE",
			})) as ApiResponse<null>;
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["admin-events"] });
		},
	});
}

// ─── POST generate QR untuk event ────────────────────────────────────────────

export function useGenerateQR() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (eventId: number) => {
			return (await fetchAPI(`/admin/events/${eventId}/generate-qr`, {
				method: "POST",
			})) as ApiResponse<unknown>;
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["admin-events"] });
		},
	});
}
