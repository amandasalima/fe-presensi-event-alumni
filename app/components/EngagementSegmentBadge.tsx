import { getEngagementSegmentConfig } from "@/lib/engagement";

const toneClasses = {
	success: "border-emerald-200 bg-emerald-50 text-emerald-700",
	warning: "border-amber-200 bg-amber-50 text-amber-700",
	info: "border-sky-200 bg-sky-50 text-sky-700",
	neutral: "border-gray-200 bg-gray-50 text-gray-600",
};

const rankClasses = {
	"Al-Muqorrobun":
		"border-[#B2DE96] bg-[#B2DE96]/35 text-[#236175] shadow-sm shadow-[#B2DE96]/50 ring-1 ring-[#41A07E]/10",
	"Al-Mutawasithun":
		"border-[#7AB2B2]/60 bg-[#7AB2B2]/18 text-[#236175] shadow-sm shadow-[#7AB2B2]/35 ring-1 ring-[#2D7EA0]/10",
	"Al-Mubtadi'un":
		"border-cyan-200 bg-cyan-50 text-cyan-800 shadow-sm shadow-cyan-100/70 ring-1 ring-cyan-500/10",
	"Ghoiru Muqayyad":
		"border-gray-300 bg-gray-100 text-gray-700 shadow-sm shadow-gray-200/70 ring-1 ring-gray-400/10",
};

export default function EngagementSegmentBadge({
	className = "",
	showCaption = false,
	segment,
	variant = "tone",
}: {
	className?: string;
	showCaption?: boolean;
	segment?: string | null;
	variant?: "tone" | "rank";
}) {
	const config = getEngagementSegmentConfig(segment);
	const colorClass =
		variant === "rank" ? rankClasses[config.label] : toneClasses[config.tone];

	return (
		<span
			className={`inline-flex max-w-full items-center rounded-lg border px-2.5 py-1 text-xs font-semibold ${colorClass} ${className}`}
			title={`${config.label} (${config.range})`}
		>
			<span className="flex items-baseline gap-1.5 truncate">
				{showCaption && (
					<span className="text-[11px] font-medium opacity-90 mr-0.5">
						Peringkat Anda:
					</span>
				)}
				<span className="text-sm font-bold leading-none">{config.arabicLabel}</span>
				<span className="text-[10px] font-medium opacity-75">({config.label})</span>
			</span>
		</span>
	);
}
