import { useQuery } from "@tanstack/react-query";
import { useDebounce } from "@/hooks/useDebounce";
import {
	getEvent,
	getEventAttendances,
	getEventCategories,
	getEventQr,
	getEvents,
	getEventRegistrations,
} from "./api";
import { adminEventQueryKeys } from "./queryKeys";
import type {
	EventActiveStatus,
	EventRegistrationStatus,
} from "./types";

export function useEvents(
	search = "",
	perPage = 10,
	status?: EventActiveStatus,
	categoryId?: number | string,
	refetchInterval?: number | false,
) {
	const debouncedSearch = useDebounce(search);

	return useQuery({
		queryKey: adminEventQueryKeys.list(
			debouncedSearch,
			perPage,
			status,
			categoryId,
		),
		queryFn: () =>
			getEvents({
				search: debouncedSearch,
				status,
				category_id: categoryId,
				per_page: perPage,
			}),
		refetchInterval,
	});
}

export function useEvent(id: number, refetchInterval?: number | false) {
	return useQuery({
		queryKey: adminEventQueryKeys.detail(id),
		queryFn: () => getEvent(id),
		enabled: !!id,
		refetchInterval,
	});
}

export function useEventCategories() {
	return useQuery({
		queryKey: adminEventQueryKeys.categories,
		queryFn: getEventCategories,
		staleTime: 5 * 60 * 1000,
	});
}

export function useEventQr(eventId: number | null) {
	return useQuery({
		queryKey: adminEventQueryKeys.qr(eventId),
		queryFn: () => getEventQr(eventId as number),
		enabled: !!eventId,
		retry: false,
	});
}

export function useEventRegistrations(
	eventId: number | null,
	status?: EventRegistrationStatus,
	perPage = 10,
) {
	return useQuery({
		queryKey: adminEventQueryKeys.registrations(eventId, status, perPage),
		queryFn: () =>
			getEventRegistrations(eventId as number, { status, per_page: perPage }),
		enabled: !!eventId,
	});
}

export function useAdminEventAttendances(eventId: number | null, perPage = 10) {
	return useQuery({
		queryKey: adminEventQueryKeys.attendances(eventId, perPage),
		queryFn: () => getEventAttendances(eventId as number, perPage),
		enabled: !!eventId,
	});
}
