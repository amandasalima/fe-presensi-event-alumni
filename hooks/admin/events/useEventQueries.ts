import { useQuery } from "@tanstack/react-query";
import { useDebounce } from "@/hooks/useDebounce";
import {
	getEvent,
	getEventCategories,
	getEventQr,
	getEvents,
} from "./api";
import { adminEventQueryKeys } from "./queryKeys";

export function useEvents(search = "", perPage = 10) {
	const debouncedSearch = useDebounce(search);

	return useQuery({
		queryKey: adminEventQueryKeys.list(debouncedSearch, perPage),
		queryFn: () => getEvents(debouncedSearch, perPage),
	});
}

export function useEvent(id: number) {
	return useQuery({
		queryKey: adminEventQueryKeys.detail(id),
		queryFn: () => getEvent(id),
		enabled: !!id,
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
