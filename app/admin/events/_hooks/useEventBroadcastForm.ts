import { useMemo, useState } from "react";
import type { FormEvent } from "react";
import { ApiError, getApiErrorMessage } from "@/lib/api";
import {
	type EventBroadcastTarget,
	useEventBroadcastPreview,
	useSendEventBroadcast,
} from "@/hooks/admin/useBroadcast";
import type { Event } from "@/hooks/admin/useEvents";
import {
	parseWhatsappNumbers,
	sanitizeBroadcastMessage,
} from "../_utils/eventFormatters";

type BroadcastDebugDetail = {
	fonnte?: unknown;
	senderStatus?: unknown;
	blockedReason?: unknown;
};

const targetLabels: Record<EventBroadcastTarget, string> = {
	all: "Semua alumni",
	registered: "Terdaftar event",
	custom: "Nomor manual",
};

function getBroadcastDebugDetail(source: unknown): BroadcastDebugDetail | null {
	const payload =
		source instanceof ApiError
			? (source.data as Record<string, unknown> | null)
			: (source as Record<string, unknown> | null);

	if (!payload || typeof payload !== "object") return null;

	const data =
		payload.data && typeof payload.data === "object"
			? (payload.data as Record<string, unknown>)
			: {};
	const detail = {
		fonnte: data.fonnte ?? payload.fonnte,
		senderStatus: data.sender_status ?? payload.sender_status,
		blockedReason: data.blocked_reason ?? payload.blocked_reason,
	};

	if (
		detail.fonnte === undefined &&
		detail.senderStatus === undefined &&
		detail.blockedReason === undefined
	) {
		return null;
	}

	return detail;
}

export function useEventBroadcastForm(event: Event | null) {
	const [target, setTarget] = useState<EventBroadcastTarget>("all");
	const [manualNumbers, setManualNumbers] = useState([""]);
	const [customMessage, setCustomMessage] = useState("");
	const [successMessage, setSuccessMessage] = useState("");
	const [errorMessage, setErrorMessage] = useState("");
	const [isSendConfirmOpen, setIsSendConfirmOpen] = useState(false);
	const [sendDetail, setSendDetail] = useState<{
		totalSent: number;
		fonnte?: unknown;
		senderStatus?: unknown;
		blockedReason?: unknown;
	} | null>(null);

	const sendEventBroadcast = useSendEventBroadcast();
	const numbersInput = useMemo(() => manualNumbers.join("\n"), [manualNumbers]);
	const parsedNumbers = useMemo(
		() => parseWhatsappNumbers(numbersInput),
		[numbersInput],
	);
	const previewParams = useMemo(
		() => ({
			target,
			...(target === "custom"
				? { numbers: parsedNumbers.validNumbers }
				: {}),
			custom_message: customMessage.trim() || null,
		}),
		[target, parsedNumbers.validNumbers, customMessage],
	);
	const preview = useEventBroadcastPreview(event?.id ?? null, previewParams);
	const previewMessage = sanitizeBroadcastMessage(preview.data?.message) || "";

	const previewData = preview.data;
	const estimatedTargets =
		target === "custom"
			? parsedNumbers.validNumbers.length
			: (previewData?.total_targets ?? 0);
	const isMessageTooLong = customMessage.length > 1000;
	const isSubmitDisabled =
		sendEventBroadcast.isPending ||
		preview.isLoading ||
		isMessageTooLong ||
		(target === "custom" && parsedNumbers.validNumbers.length === 0);

	const handleTargetChange = (value: EventBroadcastTarget) => {
		setTarget(value);
		setSuccessMessage("");
		setErrorMessage("");
		setSendDetail(null);
	};

	const updateManualNumber = (index: number, value: string) => {
		setManualNumbers((current) =>
			current.map((number, itemIndex) =>
				itemIndex === index ? value.replace(/[^\d+\s-]/g, "") : number,
			),
		);
		setSuccessMessage("");
		setErrorMessage("");
		setSendDetail(null);
	};

	const addManualNumber = () => {
		setManualNumbers((current) => [...current, ""]);
	};

	const removeManualNumber = (index: number) => {
		setManualNumbers((current) => {
			const next = current.filter((_, itemIndex) => itemIndex !== index);
			return next.length > 0 ? next : [""];
		});
		setSuccessMessage("");
		setErrorMessage("");
		setSendDetail(null);
	};

	const handleSubmit = (e: FormEvent) => {
		e.preventDefault();
		setSuccessMessage("");
		setErrorMessage("");
		setSendDetail(null);

		if (!event || isSubmitDisabled) {
			return;
		}

		setIsSendConfirmOpen(true);
	};

	const confirmSubmit = () => {
		if (!event || isSubmitDisabled) {
			return;
		}

		sendEventBroadcast.mutate(
			{
				eventId: event.id,
				payload: {
					target,
					...(target === "custom"
						? { numbers: parsedNumbers.validNumbers }
						: {}),
					custom_message: customMessage.trim() || previewMessage || null,
				},
			},
			{
				onSuccess: (response) => {
					setIsSendConfirmOpen(false);
					const message = response.message || "Broadcast berhasil dikirim";
					setSuccessMessage(
						`${message} Total terkirim: ${response.data?.total_sent ?? 0}.`,
					);
					setSendDetail({
						totalSent: response.data?.total_sent ?? 0,
						fonnte: response.data?.fonnte ?? response.fonnte,
						senderStatus:
							response.data?.sender_status ?? response.sender_status,
						blockedReason:
							response.data?.blocked_reason ?? response.blocked_reason,
					});
				},
				onError: (error) => {
					setIsSendConfirmOpen(false);
					setErrorMessage(getApiErrorMessage(error, "Gagal mengirim broadcast"));
					const detail = getBroadcastDebugDetail(error);
					if (detail) {
						setSendDetail({
							totalSent: 0,
							...detail,
						});
					}
				},
			},
		);
	};

	return {
		target,
		manualNumbers,
		customMessage,
		successMessage,
		errorMessage,
		isSendConfirmOpen,
		sendDetail,
		preview,
		previewData,
		sendEventBroadcast,
		parsedNumbers,
		estimatedTargets,
		isMessageTooLong,
		isSubmitDisabled,
		updateManualNumber,
		addManualNumber,
		removeManualNumber,
		setCustomMessage,
		handleTargetChange,
		handleSubmit,
		confirmSubmit,
		cancelConfirmSubmit: () => setIsSendConfirmOpen(false),
		targetLabel: targetLabels[target],
	};
}
