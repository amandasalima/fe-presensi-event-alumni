import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
	createBroadcast,
	deleteBroadcast,
	sendBroadcast,
} from "./api";
import { adminBroadcastQueryKeys } from "./queryKeys";
import type { EventBroadcastPayload } from "./types";

export function useSendEventBroadcast() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({
			eventId,
			payload,
		}: {
			eventId: number;
			payload: EventBroadcastPayload;
		}) => sendBroadcast(eventId, payload),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: adminBroadcastQueryKeys.all });
		},
	});
}

export function useCreateBroadcast() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: createBroadcast,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: adminBroadcastQueryKeys.all });
		},
	});
}

export function useDeleteBroadcast() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: deleteBroadcast,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: adminBroadcastQueryKeys.all });
		},
	});
}
