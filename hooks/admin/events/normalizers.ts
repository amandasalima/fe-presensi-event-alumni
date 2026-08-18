import type {
	Event,
	EventActiveStatus,
	EventStatus,
	RawEvent,
} from "./types";

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

function getRawEventStatus(event: RawEvent): EventActiveStatus | undefined {
	const status = event.status_event ?? event.status;

	if (status === "active" || status === "inactive") {
		return status;
	}

	return undefined;
}

function toLocalDateString(value?: string | null) {
	if (!value) return "";

	const date = new Date(value);
	if (Number.isNaN(date.getTime())) {
		if (value.includes("T")) {
			return value.split("T")[0];
		}
		return value.slice(0, 10);
	}

	const year = date.getFullYear();
	const month = String(date.getMonth() + 1).padStart(2, "0");
	const day = String(date.getDate()).padStart(2, "0");

	return `${year}-${month}-${day}`;
}

export function normalizeEvent(event: RawEvent): Event {
	const localDate = event.event_date
		? toLocalDateString(event.event_date)
		: undefined;
	const normalizedRaw = { ...event, event_date: localDate };
	const participantCount = event.quota_used ?? event.registered ?? 0;

	return {
		id: event.id,
		event_title: event.event_title,
		description: event.description,
		category: getCategoryName(event.category, event.category_name),
		category_id: getCategoryId(event),
		poster_url: event.poster_url,
		event_datetime: getEventDateTime(normalizedRaw),
		event_date: localDate,
		start_time: event.start_time,
		end_time: event.end_time,
		location: event.location,
		status_event: getEventStatus(normalizedRaw),
		raw_status_event: getRawEventStatus(event),
		quota: event.quota,
		quota_used: participantCount,
		remaining_quota: event.remaining_quota,
		is_quota_full: event.is_quota_full,
		quota_status: event.quota_status,
		quota_message: event.quota_message,
		registered: event.registered ?? participantCount,
		registrations_count: event.registrations_count,
		presensis_count: event.presensis_count,
		created_at: event.created_at,
		updated_at: event.updated_at,
	};
}
