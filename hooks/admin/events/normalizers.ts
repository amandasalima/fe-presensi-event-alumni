import type { Event, EventStatus, RawEvent } from "./types";

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
	if (Number.isNaN(eventDate.getTime())) {
		return "Mendatang";
	}

	return eventDate >= new Date() ? "Mendatang" : "Selesai";
}

export function normalizeEvent(event: RawEvent): Event {
	return {
		id: event.id,
		event_title: event.event_title,
		description: event.description,
		category: getCategoryName(event.category, event.category_name),
		category_id: getCategoryId(event),
		poster_url: event.poster_url,
		event_datetime: getEventDateTime(event),
		event_date: event.event_date,
		start_time: event.start_time,
		end_time: event.end_time,
		location: event.location,
		status_event: getEventStatus(event),
		quota: event.quota,
		quota_used: event.quota_used,
		remaining_quota: event.remaining_quota,
		is_quota_full: event.is_quota_full,
		quota_status: event.quota_status,
		quota_message: event.quota_message,
		registered: event.registered,
		created_at: event.created_at,
		updated_at: event.updated_at,
	};
}
