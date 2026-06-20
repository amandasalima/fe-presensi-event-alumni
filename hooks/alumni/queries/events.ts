import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchAPI } from "@/lib/api";
import { alumniQueryKeys } from "./queryKeys";

export interface AlumniEventQuery {
	id: number;
	event_title: string;
	event_description?: string;
	description?: string;
	event_date: string;
	start_time: string;
	end_time: string;
	event_datetime: string;
	location: string;
	quota: number | null;
	quota_used?: number;
	remaining_quota: number | null;
	is_quota_full?: boolean;
	quota_status?: "unlimited" | "available" | "full";
	quota_message?: string;
	is_registered: boolean;
	attendance_status?: string | null;
	status_event?: string;
	poster_url?: string | null;
	category?: {
		id: number;
		category_name: string;
	};
	[key: string]: unknown;
}

function toNumber(value: unknown, fallback: number | null = 0) {
	const numberValue = Number(value);
	return Number.isFinite(numberValue) ? numberValue : fallback;
}

function toBoolean(value: unknown) {
	if (typeof value === "boolean") return value;
	if (typeof value === "number") return value === 1;
	if (typeof value === "string") {
		return ["1", "true", "registered", "terdaftar"].includes(value.toLowerCase());
	}

	return false;
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

function withEventDateTime(event: AlumniEventQuery) {
	const localDate = event.event_date ? toLocalDateString(event.event_date) : "";
	const datePart = localDate;
	const eventDateTime =
		event.event_datetime ||
		(datePart && event.start_time ? `${datePart}T${event.start_time}` : localDate);
	const quota = event.quota === null || event.quota === undefined ? null : toNumber(event.quota);
	const remainingQuota =
		event.remaining_quota === undefined || event.remaining_quota === null
			? quota
			: toNumber(event.remaining_quota, quota);
	const quotaUsed =
		event.quota_used === undefined || event.quota_used === null
			? undefined
			: Number(event.quota_used);

	return {
		...event,
		event_description: event.event_description || event.description || "",
		description: event.description || event.event_description || "",
		event_datetime: eventDateTime,
		event_date: localDate,
		quota,
		quota_used: Number.isFinite(quotaUsed) ? quotaUsed : undefined,
		remaining_quota:
			remainingQuota === null ? null : Math.max(remainingQuota, 0),
		is_quota_full: toBoolean(event.is_quota_full),
		is_registered: toBoolean(event.is_registered),
	};
}

export function useAlumniEvents() {
	return useQuery({
		queryKey: alumniQueryKeys.events,
		queryFn: async () => {
			let backendEvents: AlumniEventQuery[] = [];

			try {
				const res = await fetchAPI("/events");
				backendEvents = (res?.data?.events || []) as AlumniEventQuery[];
			} catch (error) {
				console.error(
					"Failed to fetch events from backend:",
					error,
				);
			}

			return backendEvents.map(withEventDateTime);
		},
	});
}

export function useAlumniEventDetail(id: number) {
	return useQuery({
		queryKey: alumniQueryKeys.eventDetail(id),
		queryFn: async () => {
			try {
				const res = await fetchAPI(`/events/${id}`);
				const event = res?.data?.event || res?.data;

				if (event?.id) {
					return {
						...res?.data,
						event: withEventDateTime(event),
						attendance_status:
							res?.data?.attendance_status || event.attendance_status || null,
					};
				}

				return null;
			} catch (error) {
				console.warn(`Failed to fetch event detail for ID ${id}, returning null:`, error);
				return null;
			}
		},
		enabled: !!id,
	});
}

export function useRegisterEvent() {
	const queryClient = useQueryClient();
	const setRegistrationState = (id: number, isRegistered: boolean, eventUpdate = {}) => {
		queryClient.setQueryData<AlumniEventQuery[]>(
			alumniQueryKeys.events,
			(events) =>
				events?.map((event) =>
					event.id === id
						? withEventDateTime({
								...event,
								...eventUpdate,
								is_registered: isRegistered,
							} as AlumniEventQuery)
						: event,
				) ?? events,
		);
		queryClient.setQueryData(
			alumniQueryKeys.eventDetail(id),
			(current: unknown) => {
				if (!current || typeof current !== "object") return current;
				const detail = current as { event?: AlumniEventQuery; [key: string]: unknown };
				if (!detail.event) return current;

				return {
					...detail,
					event: withEventDateTime({
						...detail.event,
						...eventUpdate,
						is_registered: isRegistered,
					} as AlumniEventQuery),
				};
			},
		);
	};

	return useMutation({
		mutationFn: async (id: number) => {
			return fetchAPI(`/events/${id}/register`, {
				method: "POST",
			});
		},
		onSuccess: (response, id) => {
			const quotaUpdate = response?.data?.quota;
			const eventUpdate = response?.data?.event;
			const nextEvent = { ...(eventUpdate ?? {}), ...(quotaUpdate ?? {}) };

			setRegistrationState(id, true, nextEvent);

			queryClient.invalidateQueries({ queryKey: alumniQueryKeys.events });
			queryClient.invalidateQueries({
				queryKey: alumniQueryKeys.eventDetail(id),
			});
			queryClient.invalidateQueries({ queryKey: alumniQueryKeys.presences });
		},
	});
}

export function useCancelRegistration() {
	const queryClient = useQueryClient();
	const setRegistrationState = (id: number, isRegistered: boolean) => {
		queryClient.setQueryData<AlumniEventQuery[]>(
			alumniQueryKeys.events,
			(events) =>
				events?.map((event) =>
					event.id === id
						? withEventDateTime({
								...event,
								is_registered: isRegistered,
							} as AlumniEventQuery)
						: event,
				) ?? events,
		);
		queryClient.setQueryData(
			alumniQueryKeys.eventDetail(id),
			(current: unknown) => {
				if (!current || typeof current !== "object") return current;
				const detail = current as { event?: AlumniEventQuery; [key: string]: unknown };
				if (!detail.event) return current;

				return {
					...detail,
					event: withEventDateTime({
						...detail.event,
						is_registered: isRegistered,
					} as AlumniEventQuery),
				};
			},
		);
	};

	return useMutation({
		mutationFn: async (id: number) => {
			return fetchAPI(`/events/${id}/register`, {
				method: "DELETE",
			});
		},
		onSuccess: (_, id) => {
			setRegistrationState(id, false);
			queryClient.invalidateQueries({ queryKey: alumniQueryKeys.events });
			queryClient.invalidateQueries({
				queryKey: alumniQueryKeys.eventDetail(id),
			});
			queryClient.invalidateQueries({ queryKey: alumniQueryKeys.presences });
		},
	});
}
