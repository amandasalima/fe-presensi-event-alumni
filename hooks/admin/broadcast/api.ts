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
): Promise<EventBroadcastResponse> {
	void eventId;
	void payload;
	// WhatsApp API is temporarily disabled. Keep the original request here so it
	// can be restored intentionally after the backend integration is re-enabled.
	// return (await fetchAPI(`/admin/events/${eventId}/broadcast`, {
	// 	method: "POST",
	// 	body: JSON.stringify(payload),
	// }));
	throw new Error(
		"Pengiriman otomatis WhatsApp sedang dinonaktifkan. Gunakan kirim manual.",
	);
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
