export const adminEventQueryKeys = {
	lists: ["admin-events"] as const,
	list: (search: string, perPage: number) =>
		["admin-events", search, perPage] as const,
	detail: (id: number) => ["admin-events", id] as const,
	categories: ["admin-event-categories"] as const,
	qr: (eventId: number | null) => ["admin-event-qr", eventId] as const,
};
