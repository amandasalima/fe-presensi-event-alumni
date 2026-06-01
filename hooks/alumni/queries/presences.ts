import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchAPI } from "@/lib/api";
import { alumniQueryKeys } from "./queryKeys";

export function useMyPresences() {
	return useQuery({
		queryKey: alumniQueryKeys.presences,
		queryFn: async () => {
			try {
				const res = await fetchAPI("/presensi/history");
				return res?.data?.history || [];
			} catch (error) {
				console.warn("Failed to fetch presences:", error);
				return [];
			}
		},
	});
}

export function useScanQR() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (qr_token: string) =>
			fetchAPI("/presensi/scan", {
				method: "POST",
				body: JSON.stringify({ qr_token }),
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
