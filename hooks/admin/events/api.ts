import { fetchAPI } from "@/lib/api";
import { normalizeEvent } from "./normalizers";
import { buildQueryParams } from "./params";
import type {
	ApiResponse,
	CategoriesResponse,
	EventPayload,
	EventQrCodeResponse,
	EventsResponse,
	GenerateQrPayload,
	RawEvent,
} from "./types";

export async function getEvents(search = "", perPage = 10) {
	const query = buildQueryParams({
		per_page: perPage,
		search,
	});

	const response = (await fetchAPI(`/admin/events${query}`)) as EventsResponse;

	return (response.data.events ?? []).map(normalizeEvent);
}

export async function getEvent(id: number) {
	const response = (await fetchAPI(`/admin/events/${id}`)) as ApiResponse<RawEvent>;

	return normalizeEvent(response.data);
}

export async function getEventCategories() {
	const response = (await fetchAPI(
		"/admin/event-categories",
	)) as CategoriesResponse;

	return response.data.categories ?? [];
}

export async function createEvent(data: EventPayload) {
	return (await fetchAPI("/admin/events", {
		method: "POST",
		body: JSON.stringify(data),
	})) as ApiResponse<RawEvent>;
}

export async function updateEvent(id: number, data: Partial<EventPayload>) {
	return (await fetchAPI(`/admin/events/${id}`, {
		method: "PUT",
		body: JSON.stringify(data),
	})) as ApiResponse<RawEvent>;
}

export async function deleteEvent(id: number) {
	return (await fetchAPI(`/admin/events/${id}`, {
		method: "DELETE",
	})) as ApiResponse<null>;
}

export async function generateEventQr(
	eventId: number,
	data: GenerateQrPayload,
) {
	return (await fetchAPI(`/admin/events/${eventId}/qr/generate`, {
		method: "POST",
		body: JSON.stringify(data),
	})) as EventQrCodeResponse;
}

export async function getEventQr(eventId: number) {
	const response = (await fetchAPI(
		`/admin/events/${eventId}/qr`,
	)) as EventQrCodeResponse;

	return response.data.qr_code;
}
