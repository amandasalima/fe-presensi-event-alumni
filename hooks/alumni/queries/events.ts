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
	quota: number;
	remaining_quota: number;
	is_registered: boolean;
	attendance_status?: string | null;
	status_event?: string;
	category?: {
		id: number;
		category_name: string;
	};
	[key: string]: unknown;
}

function toNumber(value: unknown, fallback = 0) {
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

function withEventDateTime(event: AlumniEventQuery) {
	const datePart = event.event_date ? event.event_date.split("T")[0] : "";
	const eventDateTime =
		event.event_datetime ||
		(datePart && event.start_time ? `${datePart}T${event.start_time}` : event.event_date);
	const quota = toNumber(event.quota);
	const remainingQuota =
		event.remaining_quota === undefined || event.remaining_quota === null
			? quota
			: toNumber(event.remaining_quota, quota);

	return {
		...event,
		event_description: event.event_description || event.description || "",
		description: event.description || event.event_description || "",
		event_datetime: eventDateTime,
		quota,
		remaining_quota: Math.max(remainingQuota, 0),
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

	return useMutation({
		mutationFn: async (id: number) => {
			return fetchAPI(`/events/${id}/register`, {
				method: "POST",
			});
		},
		onSuccess: (_, id) => {
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

	return useMutation({
		mutationFn: async (id: number) => {
			return fetchAPI(`/events/${id}/register`, {
				method: "DELETE",
			});
		},
		onSuccess: (_, id) => {
			queryClient.invalidateQueries({ queryKey: alumniQueryKeys.events });
			queryClient.invalidateQueries({
				queryKey: alumniQueryKeys.eventDetail(id),
			});
			queryClient.invalidateQueries({ queryKey: alumniQueryKeys.presences });
		},
	});
}
