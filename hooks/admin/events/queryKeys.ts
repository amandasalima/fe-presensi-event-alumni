import type {
	EventActiveStatus,
	EventRegistrationStatus,
} from "./types";

export const adminEventQueryKeys = {
	lists: ["admin-events"] as const,
	list: (
		search: string,
		perPage: number,
		status?: EventActiveStatus,
		categoryId?: number | string,
	) => ["admin-events", search, status ?? "", categoryId ?? "", perPage] as const,
	detail: (id: number) => ["admin-events", id] as const,
	categories: ["admin-event-categories"] as const,
	registrations: (
		id: number | null,
		status?: EventRegistrationStatus,
		perPage?: number,
	) => ["admin-event-registrations", id, status ?? "", perPage ?? 10] as const,
	attendances: (id: number | null, perPage?: number) =>
		["admin-event-attendances", id, perPage ?? 10] as const,
	qr: (eventId: number | null) => ["admin-event-qr", eventId] as const,
};
