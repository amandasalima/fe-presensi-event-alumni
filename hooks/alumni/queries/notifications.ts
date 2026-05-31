import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchAPI } from "@/lib/api";
import { alumniQueryKeys } from "./queryKeys";

export function useMyNotifications() {
	return useQuery({
		queryKey: alumniQueryKeys.notifications,
		queryFn: async () => {
			try {
				const res = await fetchAPI("/alumni/notifications");
				return res || [];
			} catch (error) {
				console.warn(
					"Failed to fetch notifications, using mock notifications:",
					error,
				);

				return [
					{
						id: 7771,
						title: "Pendaftaran Reuni Akbar Dibuka",
						body: "Segera daftarkan diri Anda pada event Reuni Akbar Pondok Pesantren 2026. Kuota terbatas!",
						is_read: false,
					},
					{
						id: 7772,
						title: "Kehadiran Kajian Terverifikasi",
						body: "Terima kasih, kehadiran Anda pada Kajian Bulanan telah berhasil diverifikasi.",
						is_read: true,
					},
				];
			}
		},
		refetchInterval: 60000,
	});
}

export function useUnreadCount() {
	return useQuery({
		queryKey: alumniQueryKeys.unreadCount,
		queryFn: async () => {
			try {
				const res = await fetchAPI("/alumni/notifications/unread-count");
				return res || { unread_count: 0 };
			} catch (error) {
				console.warn("Failed to fetch unread count, using mock:", error);
				return { unread_count: 1 };
			}
		},
		refetchInterval: 30000,
	});
}

export function useMarkAsRead() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (id: number) =>
			fetchAPI(`/alumni/notifications/${id}/read`, { method: "PUT" }),
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: alumniQueryKeys.notifications,
			});
			queryClient.invalidateQueries({ queryKey: alumniQueryKeys.unreadCount });
		},
	});
}

export function useMarkAllAsRead() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: () =>
			fetchAPI("/alumni/notifications/read-all", { method: "PUT" }),
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: alumniQueryKeys.notifications,
			});
			queryClient.invalidateQueries({ queryKey: alumniQueryKeys.unreadCount });
		},
	});
}
