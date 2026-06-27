import api, { fetchAPI } from "@/lib/api";
import { normalizeEvent } from "./normalizers";
import { buildQueryParams } from "./params";
import type {
	ApiResponse,
	CategoriesResponse,
	EventCategoryPayload,
	EventCategoryResponse,
	EventAttendancesResponse,
	EventDetailResponse,
	EventListParams,
	EventPayload,
	EventMutationResponse,
	EventQrCodeResponse,
	EventRegistrationParams,
	EventRegistrationsResponse,
	EventsResponse,
	GenerateQrPayload,
} from "./types";

function appendEventFormData(data: Partial<EventPayload>) {
	const formData = new FormData();

	Object.entries(data).forEach(([key, value]) => {
		if (value === undefined || value === null || value === "") return;

		if (key === "poster" && value instanceof File) {
			formData.append("poster", value);
			return;
		}

		if (key !== "poster") {
			formData.append(key, String(value));
		}
	});

	return formData;
}

function hasPosterFile(data: Partial<EventPayload>) {
	return typeof File !== "undefined" && data.poster instanceof File;
}

function unwrapEventResponse(response: EventDetailResponse) {
	if ("event" in response.data) {
		return response.data.event;
	}

	return response.data;
}

export async function getEvents(
	searchOrParams: string | EventListParams = "",
	perPage = 10,
) {
	const params =
		typeof searchOrParams === "string"
			? { search: searchOrParams, per_page: perPage }
			: searchOrParams;
	const query = buildQueryParams({
		search: params.search,
		status: params.status,
		category_id: params.category_id,
		per_page: params.per_page ?? perPage,
	});

	const response = (await fetchAPI(`/admin/events${query}`)) as EventsResponse;

	return (response.data.events ?? []).map(normalizeEvent);
}

export async function getEvent(id: number) {
	const response = (await fetchAPI(
		`/admin/events/${id}`,
	)) as EventDetailResponse;

	return normalizeEvent(unwrapEventResponse(response));
}

export async function getEventCategories() {
	const response = (await fetchAPI(
		"/admin/event-categories",
	)) as CategoriesResponse;

	return response.data.categories ?? [];
}

export async function getEventCategory(id: number) {
	const response = (await fetchAPI(
		`/admin/event-categories/${id}`,
	)) as EventCategoryResponse;

	return response.data.category;
}

export async function createEventCategory(data: EventCategoryPayload) {
	return (await fetchAPI("/admin/event-categories", {
		method: "POST",
		body: JSON.stringify(data),
	})) as EventCategoryResponse;
}

export async function updateEventCategory(
	id: number,
	data: EventCategoryPayload,
) {
	return (await fetchAPI(`/admin/event-categories/${id}`, {
		method: "PUT",
		body: JSON.stringify(data),
	})) as EventCategoryResponse;
}

export async function deleteEventCategory(id: number) {
	return (await fetchAPI(`/admin/event-categories/${id}`, {
		method: "DELETE",
	})) as ApiResponse<null>;
}

export async function createEvent(data: EventPayload) {
	const formData = appendEventFormData(data);
	const response = await api.post("/admin/events", formData);

	return response.data as EventMutationResponse;
}

export async function updateEvent(id: number, data: Partial<EventPayload>) {
	if (hasPosterFile(data)) {
		const formData = appendEventFormData(data);
		const response = await api.post(`/admin/events/${id}`, formData);

		return response.data as EventMutationResponse;
	}

	return (await fetchAPI(`/admin/events/${id}`, {
		method: "PUT",
		body: JSON.stringify(data),
	})) as EventMutationResponse;
}

export async function deleteEvent(id: number) {
	return (await fetchAPI(`/admin/events/${id}`, {
		method: "DELETE",
	})) as ApiResponse<null>;
}

export async function toggleEvent(id: number) {
	return (await fetchAPI(`/admin/events/${id}/toggle`, {
		method: "PATCH",
	})) as EventMutationResponse;
}

export async function getEventRegistrations(
	id: number,
	params: EventRegistrationParams = {},
) {
	const query = buildQueryParams({
		status: params.status,
		per_page: params.per_page,
	});

	const response = (await fetchAPI(
		`/admin/events/${id}/registrations${query}`,
	)) as EventRegistrationsResponse;

	return response.data;
}

export async function getEventAttendances(id: number, perPage = 10) {
	const query = buildQueryParams({ per_page: perPage });
	const response = (await fetchAPI(
		`/admin/events/${id}/attendances${query}`,
	)) as EventAttendancesResponse;

	return response.data;
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
