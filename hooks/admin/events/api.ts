import api, { fetchAPI } from "@/lib/api";
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
	const formData = new FormData();
	Object.keys(data).forEach((key) => {
		if (key === "poster" && data.poster) {
			formData.append("poster", data.poster);
		} else if (key !== "poster" && data[key as keyof EventPayload] !== undefined && data[key as keyof EventPayload] !== null) {
			formData.append(key, String(data[key as keyof EventPayload]));
		}
	});

	const response = await api.post("/admin/events", formData, {
		headers: { "Content-Type": "multipart/form-data" },
	});
	return response.data as ApiResponse<RawEvent>;
}

export async function updateEvent(id: number, data: Partial<EventPayload>) {
	const formData = new FormData();
	formData.append("_method", "PUT");
	
	Object.keys(data).forEach((key) => {
		if (key === "poster" && data.poster) {
			formData.append("poster", data.poster);
		} else if (key !== "poster" && data[key as keyof Partial<EventPayload>] !== undefined && data[key as keyof Partial<EventPayload>] !== null) {
			formData.append(key, String(data[key as keyof Partial<EventPayload>]));
		}
	});

	const response = await api.post(`/admin/events/${id}`, formData, {
		headers: { "Content-Type": "multipart/form-data" },
	});
	return response.data as ApiResponse<RawEvent>;
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

	const qrCode = response.data.qr_code;

	if (!qrCode) return null;
	
	if (!qrCode.is_active || qrCode.is_expired) {
		return null;
	}

	return qrCode;
}
