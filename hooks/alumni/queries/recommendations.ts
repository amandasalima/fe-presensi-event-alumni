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
	return {
		...item,
		event_datetime:
			item.event_datetime || `${item.event_date}T${item.start_time || "00:00:00"}`,
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
				console.warn(
					"Failed to fetch recommendations, falling back to dummy recommendation:",
					error,
				);
			}

			const futureDate1 = new Date(Date.now() + 5 * 24 * 60 * 60 * 1000)
				.toISOString()
				.split("T")[0];

			return [
				{
					id: 9991,
					event_title: "Reuni Akbar Pondok Pesantren 2026",
					event_datetime: `${futureDate1}T08:00:00`,
					location: "Aula Utama Pondok Pesantren",
				},
			];
		},
	});
}
