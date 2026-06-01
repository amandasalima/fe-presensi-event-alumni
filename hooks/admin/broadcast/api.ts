import { fetchAPI } from "@/lib/api";
import type {
	BroadcastPreviewData,
	BroadcastPreviewParams,
	EventBroadcastPayload,
	EventBroadcastResponse,
} from "./types";

export async function getBroadcastPreview(
	eventId: number,
	params: BroadcastPreviewParams,
) {
	const query = new URLSearchParams({ target: params.target });

	params.numbers?.forEach((number) => {
		query.append("numbers[]", number);
	});

	if (params.custom_message) {
		query.set("custom_message", params.custom_message);
	}

	return (await fetchAPI(
		`/admin/events/${eventId}/broadcast/preview?${query.toString()}`,
	)) as {
		success: boolean;
		data: BroadcastPreviewData;
	};
}

export async function sendBroadcast(
	eventId: number,
	payload: EventBroadcastPayload,
) {
	return (await fetchAPI(`/admin/events/${eventId}/broadcast`, {
		method: "POST",
		body: JSON.stringify(payload),
	})) as EventBroadcastResponse;
}

export function getBroadcasts() {
	return fetchAPI("/broadcast");
}

export function getBroadcastById(id: number) {
	return fetchAPI(`/broadcast/${id}`);
}

export function createBroadcast(data: unknown) {
	return fetchAPI("/broadcast", {
		method: "POST",
		body: JSON.stringify(data),
	});
}

export function deleteBroadcast(id: number) {
	return fetchAPI(`/broadcast/${id}`, { method: "DELETE" });
}
