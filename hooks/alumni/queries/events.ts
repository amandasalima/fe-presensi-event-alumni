import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchAPI } from "@/lib/api";
import { getDummyEvents, getDummyRegistered } from "./dummyEvents";
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
	return {
		...event,
		event_datetime: `${event.event_date}T${event.start_time || "00:00:00"}`,
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
					"Failed to fetch events from backend, showing dummies only:",
					error,
				);
			}

			return [...backendEvents.map(withEventDateTime), ...getDummyEvents()];
		},
	});
}

export function useAlumniEventDetail(id: number) {
	return useQuery({
		queryKey: alumniQueryKeys.eventDetail(id),
		queryFn: async () => {
			const dummy = getDummyEvents().find((event) => event.id === id);
			if (dummy) {
				const isRegistered = getDummyRegistered(id, dummy.is_registered);

				return {
					event: {
						...dummy,
						is_registered: isRegistered,
					},
					remaining_quota: dummy.remaining_quota,
					is_registered: isRegistered,
					registration: isRegistered
						? {
								status: "registered",
								registered_at: new Date().toISOString(),
							}
						: null,
				};
			}

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
			if (id >= 9990) {
				await new Promise((resolve) => setTimeout(resolve, 800));
				if (typeof window !== "undefined") {
					localStorage.setItem(`dummy_reg_${id}`, "true");
				}

				return {
					success: true,
					message: "Pendaftaran berhasil! Sampai jumpa di event 🎉",
				};
			}

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
			if (id >= 9990) {
				await new Promise((resolve) => setTimeout(resolve, 800));
				if (typeof window !== "undefined") {
					localStorage.setItem(`dummy_reg_${id}`, "false");
				}

				return {
					success: true,
					message: "Pendaftaran berhasil dibatalkan",
				};
			}

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
