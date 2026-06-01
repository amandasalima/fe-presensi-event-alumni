import { useQuery } from "@tanstack/react-query";
import {
	getBroadcastById,
	getBroadcastPreview,
	getBroadcasts,
} from "./api";
import { adminBroadcastQueryKeys } from "./queryKeys";
import type { BroadcastPreviewParams, EventBroadcastTarget } from "./types";

export function useEventBroadcastPreview(
	eventId: number | null,
	params: BroadcastPreviewParams | EventBroadcastTarget,
) {
	const previewParams =
		typeof params === "string" ? { target: params } : params;
	const numbers = previewParams.numbers ?? [];
	const customMessage = previewParams.custom_message ?? "";

	return useQuery({
		queryKey: adminBroadcastQueryKeys.eventPreview(
			eventId,
			previewParams.target,
			numbers,
			customMessage,
		),
		queryFn: async () => {
			const response = await getBroadcastPreview(
				eventId as number,
				previewParams,
			);

			return response.data;
		},
		enabled:
			!!eventId &&
			(previewParams.target !== "custom" || numbers.length > 0),
	});
}

export function useBroadcast() {
	return useQuery({
		queryKey: adminBroadcastQueryKeys.all,
		queryFn: getBroadcasts,
	});
}

export function useBroadcastById(id: number) {
	return useQuery({
		queryKey: adminBroadcastQueryKeys.detail(id),
		queryFn: () => getBroadcastById(id),
		enabled: !!id,
	});
}
