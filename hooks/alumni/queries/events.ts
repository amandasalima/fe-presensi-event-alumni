import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchAPI } from "@/lib/api";
import { alumniQueryKeys } from "./queryKeys";

export interface AlumniEventQuery {
	id: number;
	event_title: string;
	event_description?: string;
	event_date: string;
	start_time: string;
	end_time: string;
	event_datetime: string;
	location: string;
	quota: number;
	remaining_quota: number;
	is_registered: boolean;
	status_event?: string;
	category?: {
		id: number;
		category_name: string;
	};
	[key: string]: unknown;
}

function withEventDateTime(event: AlumniEventQuery) {
	const datePart = event.event_date ? event.event_date.split("T")[0] : "";
	return {
		...event,
		event_datetime: datePart && event.start_time ? `${datePart}T${event.start_time}` : event.event_date,
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
				if (res?.data?.event) {
					res.data.event = withEventDateTime(res.data.event);
				}

				return res?.data;
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
