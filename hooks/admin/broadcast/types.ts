export type EventBroadcastTarget = "all" | "registered" | "custom";

export interface BroadcastPreviewData {
	message: string;
	target: EventBroadcastTarget;
	total_targets: number;
	breakdown: {
		total_all: number;
		total_registered: number;
		total_custom: number;
	};
}

export interface BroadcastPreviewParams {
	target: EventBroadcastTarget;
	numbers?: string[];
	custom_message?: string | null;
}

export interface EventBroadcastPayload {
	target: EventBroadcastTarget;
	numbers?: string[];
	custom_message?: string | null;
}

export interface EventBroadcastResponse {
	success: boolean;
	message: string;
	fonnte?: unknown;
	sender_status?: string;
	blocked_reason?: string | null;
	data: {
		target: EventBroadcastTarget;
		total_sent: number;
		event: unknown;
		fonnte?: unknown;
		sender_status?: string;
		blocked_reason?: string | null;
	};
}
