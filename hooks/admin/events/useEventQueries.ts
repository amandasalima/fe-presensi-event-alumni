import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchAPI } from "@/lib/api";
import { useDebounce } from "@/hooks/useDebounce";
import { normalizeEvent } from "./normalizers";
import { buildQueryParams } from "./params";
import { adminEventQueryKeys } from "./queryKeys";
import type {
	ApiResponse,
	CategoriesResponse,
	EventPayload,
	EventQrCodeResponse,
	EventsResponse,
	GenerateQrPayload,
	RawEvent,
} from "./types";

export function useEvents(search = "", perPage = 10) {
	const debouncedSearch = useDebounce(search);

	return useQuery({
		queryKey: adminEventQueryKeys.list(debouncedSearch, perPage),
		queryFn: async () => {
			const query = buildQueryParams({
				per_page: perPage,
				search: debouncedSearch,
			});

			const response = (await fetchAPI(
				`/admin/events${query}`,
			)) as EventsResponse;

			return (response.data.events ?? []).map(normalizeEvent);
		},
	});
}

export function useEvent(id: number) {
	return useQuery({
		queryKey: adminEventQueryKeys.detail(id),
		queryFn: async () => {
			const response = (await fetchAPI(
				`/admin/events/${id}`,
			)) as ApiResponse<RawEvent>;

			return normalizeEvent(response.data);
		},
		enabled: !!id,
	});
}

export function useEventCategories() {
	return useQuery({
		queryKey: adminEventQueryKeys.categories,
		queryFn: async () => {
			const response = (await fetchAPI(
				"/admin/event-categories",
			)) as CategoriesResponse;

			return response.data.categories ?? [];
		},
		staleTime: 5 * 60 * 1000,
	});
}

export function useCreateEvent() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (data: EventPayload) => {
			return (await fetchAPI("/admin/events", {
				method: "POST",
				body: JSON.stringify(data),
			})) as ApiResponse<RawEvent>;
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: adminEventQueryKeys.lists });
		},
	});
}

export function useUpdateEvent() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async ({
			id,
			data,
		}: {
			id: number;
			data: Partial<EventPayload>;
		}) => {
			return (await fetchAPI(`/admin/events/${id}`, {
				method: "PUT",
				body: JSON.stringify(data),
			})) as ApiResponse<RawEvent>;
		},
		onSuccess: (_data, variables) => {
			queryClient.invalidateQueries({ queryKey: adminEventQueryKeys.lists });
			queryClient.invalidateQueries({
				queryKey: adminEventQueryKeys.detail(variables.id),
			});
		},
	});
}

export function useDeleteEvent() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (id: number) => {
			return (await fetchAPI(`/admin/events/${id}`, {
				method: "DELETE",
			})) as ApiResponse<null>;
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: adminEventQueryKeys.lists });
		},
	});
}

export function useGenerateQR() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async ({
			eventId,
			data,
		}: {
			eventId: number;
			data: GenerateQrPayload;
		}) => {
			return (await fetchAPI(`/admin/events/${eventId}/qr/generate`, {
				method: "POST",
				body: JSON.stringify(data),
			})) as EventQrCodeResponse;
		},
		onSuccess: (_data, variables) => {
			queryClient.invalidateQueries({ queryKey: adminEventQueryKeys.lists });
			queryClient.invalidateQueries({
				queryKey: adminEventQueryKeys.qr(variables.eventId),
			});
		},
	});
}

export function useEventQr(eventId: number | null) {
	return useQuery({
		queryKey: adminEventQueryKeys.qr(eventId),
		queryFn: async () => {
			const response = (await fetchAPI(
				`/admin/events/${eventId}/qr`,
			)) as EventQrCodeResponse;

			return response.data.qr_code;
		},
		enabled: !!eventId,
		retry: false,
	});
}
