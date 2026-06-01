export const adminBroadcastQueryKeys = {
	all: ["broadcast"] as const,
	detail: (id: number) => ["broadcast", id] as const,
	eventPreview: (
		eventId: number | null,
		target: string,
		numbers: readonly string[] = [],
		customMessage = "",
	) => ["event-broadcast-preview", eventId, target, numbers, customMessage] as const,
};
