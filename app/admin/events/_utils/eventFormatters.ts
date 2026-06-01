import type { Event } from "@/hooks/admin/useEvents";

const EVENT_MONTH_NAMES = [
	"Jan",
	"Feb",
	"Mar",
	"Apr",
	"Mei",
	"Jun",
	"Jul",
	"Agu",
	"Sep",
	"Okt",
	"Nov",
	"Des",
];

function formatEventDate(dateValue: string) {
	const date = new Date(dateValue);

	if (Number.isNaN(date.getTime())) {
		return "-";
	}

	const day = String(date.getDate()).padStart(2, "0");
	const month = EVENT_MONTH_NAMES[date.getMonth()];
	const year = date.getFullYear();

	return `${day} - ${month} - ${year}`;
}

function formatEventTime(timeValue?: string) {
	return timeValue ? timeValue.slice(0, 5) : "-";
}

export function parseEventDate(event: Event) {
	const dateSource = event.event_date || event.event_datetime;

	return {
		date: dateSource ? formatEventDate(dateSource) : "-",
		time: dateSource ? formatEventTime(event.start_time) : "-",
	};
}

export function parseWhatsappNumbers(value: string) {
	const rawNumbers = value
		.split(/[\n,]+/)
		.map((number) => number.trim())
		.filter(Boolean);

	const normalized = rawNumbers.map((number) => {
		const digits = number.replace(/\D/g, "");

		if (digits.startsWith("0")) {
			return `62${digits.slice(1)}`;
		}

		if (digits.startsWith("62")) {
			return digits;
		}

		return `62${digits}`;
	});

	const validNumbers = Array.from(
		new Set(normalized.filter((number) => /^62\d{9,13}$/.test(number))),
	);
	const invalidCount = normalized.length - validNumbers.length;

	return {
		validNumbers,
		invalidCount,
		totalInput: rawNumbers.length,
	};
}

export function sanitizeBroadcastMessage(message?: string | null) {
	if (!message) return message;

	return message
		.replace(
			/\s*pesan\s+ini\s+dikirim\s+otomatis\s+oleh\s+sistem\s+laravel\.?\s*/gi,
			"\n",
		)
		.replace(/\n{3,}/g, "\n\n")
		.trim();
}
