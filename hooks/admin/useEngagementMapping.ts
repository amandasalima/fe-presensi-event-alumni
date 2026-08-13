import { useQuery } from "@tanstack/react-query";
import { fetchAPI } from "@/lib/api";
import type { Domicile } from "@/types/profile";

export interface EngagementMappingUser {
	id: number;
	first_name?: string | null;
	last_name?: string | null;
	name?: string | null;
	email: string;
	phone?: string | null;
	graduation_year?: string | null;
	status?: string | null;
	domicile?: Domicile | null;
}

export interface EngagementAttendanceSummary {
	total_events: number;
	attended_events: number;
	percentage: number;
}

export interface EngagementMappingItem {
	user: EngagementMappingUser;
	attendance: EngagementAttendanceSummary;
	segment: string;
}

export interface EngagementMappingSummary {
	total_alumni: number;
	segment_counts_current_page: Record<string, number>;
	calculation?: {
		basis?: string;
		eligible_events?: number;
	};
}

export interface EngagementMappingData {
	items: EngagementMappingItem[];
	summary: EngagementMappingSummary;
	total: number;
	current_page: number;
	last_page: number;
}

export interface EngagementMappingParams {
	page?: number;
	perPage?: number;
	search?: string;
	graduationYear?: string;
	segment?: string;
}

function buildEngagementMappingQuery(params: EngagementMappingParams) {
	const query = new URLSearchParams();

	query.set("page", String(params.page ?? 1));
	query.set("per_page", String(params.perPage ?? 10));

	if (params.search) query.set("search", params.search);
	if (params.graduationYear) query.set("graduation_year", params.graduationYear);
	if (params.segment) query.set("segment", params.segment);

	return query.toString();
}

export function useEngagementMapping(params: EngagementMappingParams) {
	return useQuery<EngagementMappingData>({
		queryKey: ["admin-engagement-mapping", params],
		queryFn: async () => {
			const response = await fetchAPI(
				`/admin/engagement/attendance-mapping?${buildEngagementMappingQuery(params)}`,
			);

			return response?.data;
		},
		placeholderData: (previousData) => previousData,
	});
}
