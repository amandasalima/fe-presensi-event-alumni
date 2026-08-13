import { useMutation, useQuery, useQueryClient, useInfiniteQuery } from "@tanstack/react-query";
import { fetchAPI } from "@/lib/api";
import { alumniQueryKeys } from "./queryKeys";

export interface PresenceHistoryItem {
	id: number;
	event_id: number;
	user_id: number;
	status: string;
	scanned_at: string;
	created_at: string;
	updated_at: string;
	event?: {
		id?: number;
		event_title: string;
		location?: string;
		event_date?: string;
		event_datetime?: string;
		start_time?: string;
		end_time?: string;
		status_event?: string;
	};
}

export interface PresenceHistoryResponse {
	history: PresenceHistoryItem[];
	total: number;
	current_page: number;
	last_page: number;
}

export function useMyPresences() {
	return useQuery<PresenceHistoryItem[]>({
		queryKey: alumniQueryKeys.presences,
		queryFn: async () => {
			try {
				const res = await fetchAPI("/presensi/history?per_page=100");
				return res?.data?.history || [];
			} catch (error) {
				console.warn("Failed to fetch presences:", error);
				return [];
			}
		},
	});
}

export function useMyPresencesInfinite(perPage = 10) {
	return useInfiniteQuery<PresenceHistoryResponse>({
		queryKey: [...alumniQueryKeys.presences, "infinite", perPage],
		queryFn: async ({ pageParam = 1 }) => {
			const res = await fetchAPI(`/presensi/history?page=${pageParam}&per_page=${perPage}`);
			return res?.data || { history: [], total: 0, current_page: 1, last_page: 1 };
		},
		initialPageParam: 1,
		getNextPageParam: (lastPage) => {
			if (lastPage && lastPage.current_page < lastPage.last_page) {
				return lastPage.current_page + 1;
			}
			return undefined;
		},
	});
}

export function useScanQR() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (qr_token: string) =>
			fetchAPI("/presensi/scan", {
				method: "POST",
				body: JSON.stringify({ qr_token: qr_token.trim() }),
			}).catch((error) => {
				const isGeneric404 = error?.status === 404 && (!error.message || error.message.includes("404") || error.message.toLowerCase() === "not found");
				if (isGeneric404) {
					throw new Error("QR Code tidak dikenali");
				}
				throw error;
			}),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: alumniQueryKeys.presences });
			queryClient.invalidateQueries({
				queryKey: alumniQueryKeys.recommendations,
			});
			queryClient.invalidateQueries({ queryKey: alumniQueryKeys.events });
		},
	});
}
