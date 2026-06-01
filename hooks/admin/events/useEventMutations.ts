import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
	createEvent,
	deleteEvent,
	generateEventQr,
	updateEvent,
} from "./api";
import { adminEventQueryKeys } from "./queryKeys";
import type { EventPayload, GenerateQrPayload } from "./types";

export function useCreateEvent() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: createEvent,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: adminEventQueryKeys.lists });
		},
	});
}

export function useUpdateEvent() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({
			id,
			data,
		}: {
			id: number;
			data: Partial<EventPayload>;
		}) => updateEvent(id, data),
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
		mutationFn: deleteEvent,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: adminEventQueryKeys.lists });
		},
	});
}

export function useGenerateQR() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({
			eventId,
			data,
		}: {
			eventId: number;
			data: GenerateQrPayload;
		}) => generateEventQr(eventId, data),
		onSuccess: (_data, variables) => {
			queryClient.invalidateQueries({ queryKey: adminEventQueryKeys.lists });
			queryClient.invalidateQueries({
				queryKey: adminEventQueryKeys.qr(variables.eventId),
			});
		},
	});
}
