export const FONNTE_PROVIDER = "fonnte" as const;
export const DEFAULT_FONNTE_API_URL = "https://api.fonnte.com/send";

export function isValidSenderNumber(value: string) {
	return /^62\d+$/.test(value.trim());
}
