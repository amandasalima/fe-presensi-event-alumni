import { useQuery } from "@tanstack/react-query";
import { fetchAPI } from "@/lib/api";
import { alumniQueryKeys } from "./queryKeys";

export type RecommendationItem = {
	id: number;
	event_title: string;
	event_datetime?: string;
	event_date?: string;
	location: string;
	start_time?: string;
	[key: string]: unknown;
};

function withEventDateTime(item: RecommendationItem) {
	const datePart = item.event_date ? item.event_date.split("T")[0] : "";
	return {
		...item,
		event_datetime:
			item.event_datetime || (datePart && item.start_time ? `${datePart}T${item.start_time}` : item.event_date),
	};
}

export function useMyRecommendations() {
	return useQuery({
		queryKey: alumniQueryKeys.recommendations,
		queryFn: async () => {
			try {
				const res = await fetchAPI("/alumni/recommendations");
				if (res?.data && res.data.length > 0) {
					return res.data.map(withEventDateTime);
				}
			} catch (error) {
				console.warn("Failed to fetch recommendations:", error);
			}

			return [];
		},
	});
}
