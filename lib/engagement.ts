export const ENGAGEMENT_SEGMENTS = [
	"Al-Muqorrobun",
	"Al-Mutawasithun",
	"Al-Mubtadi'un",
	"Ghoir Mukayyad",
] as const;

export type EngagementSegment = (typeof ENGAGEMENT_SEGMENTS)[number];
export type EngagementTone = "success" | "warning" | "info" | "neutral";

export const engagementSegments: Record<
	EngagementSegment,
	{
		label: EngagementSegment;
		range: string;
		tone: EngagementTone;
		description: string;
		motivation: string;
		competitiveCopy: string;
	}
> = {
	"Al-Muqorrobun": {
		label: "Al-Muqorrobun",
		range: ">= 70%",
		tone: "success",
		description: "Kehadiran sangat aktif",
		motivation: "Kehadiranmu sangat aktif. Pertahankan konsistensi ini.",
		competitiveCopy: "Kamu sudah berada di segment tertinggi. Jaga ritme hadir agar progresmu tetap unggul.",
	},
	"Al-Mutawasithun": {
		label: "Al-Mutawasithun",
		range: "40% - < 70%",
		tone: "warning",
		description: "Kehadiran cukup aktif",
		motivation: "Kehadiranmu sudah cukup baik. Sedikit lagi menuju level tertinggi.",
		competitiveCopy: "Kamu sudah masuk jalur progres yang kuat. Tambah kehadiran berikutnya untuk mengejar segment tertinggi.",
	},
	"Al-Mubtadi'un": {
		label: "Al-Mubtadi'un",
		range: "> 0% - < 40%",
		tone: "info",
		description: "Mulai aktif mengikuti kegiatan",
		motivation: "Kamu sudah mulai hadir di kegiatan alumni. Terus tingkatkan partisipasimu.",
		competitiveCopy: "Langkah awalmu sudah tercatat. Naikkan skor hadir dan dorong progresmu ke level berikutnya.",
	},
	"Ghoir Mukayyad": {
		label: "Ghoir Mukayyad",
		range: "0%",
		tone: "neutral",
		description: "Belum tercatat hadir",
		motivation: "Belum ada kehadiran yang tercatat. Ikuti event berikutnya untuk mulai membangun progres.",
		competitiveCopy: "Papan progresmu masih terbuka. Hadiri event berikutnya untuk mulai membangun momentum.",
	},
};

export function isEngagementSegment(value?: string | null): value is EngagementSegment {
	return ENGAGEMENT_SEGMENTS.includes(value as EngagementSegment);
}

export function getEngagementSegmentConfig(segment?: string | null) {
	return isEngagementSegment(segment)
		? engagementSegments[segment]
		: engagementSegments["Ghoir Mukayyad"];
}

export function clampEngagementPercentage(value?: number | null) {
	if (typeof value !== "number" || Number.isNaN(value)) return 0;
	return Math.min(100, Math.max(0, Math.round(value)));
}
