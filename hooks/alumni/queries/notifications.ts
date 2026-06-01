import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchAPI, getApiErrorMessage } from "@/lib/api";
import { alumniQueryKeys } from "./queryKeys";

export interface AlumniNotification {
	id?: number;
	title?: string;
	message?: string;
	body?: string;
	type?: "password_changed" | "upcoming_event" | "event_starting_soon" | string;
	priority?: "low" | "normal" | "medium" | "high" | string;
	created_at?: string;
	is_read?: boolean;
	read_at?: string | null;
	data?: {
		event_title?: string;
		location?: string;
		starts_at?: string;
		start_time?: string;
		end_time?: string;
		category?: string;
		category_name?: string;
		[key: string]: unknown;
	};
	[key: string]: unknown;
}

export interface AlumniUnreadCount {
	unread_count: number;
}

const NOTIFICATIONS_SETUP_MESSAGE =
	"Fitur notifikasi sedang disiapkan. Silakan coba lagi setelah database diperbarui.";

function getErrorText(error: unknown) {
	if (!error || typeof error !== "object") return "";

	const parts: string[] = [];
	const stack = error as Record<string, unknown>;

	if (typeof stack.message === "string") parts.push(stack.message);

	const data = stack.data as Record<string, unknown> | undefined;
	if (typeof data?.message === "string") parts.push(data.message);
	if (typeof data?.error === "string") parts.push(data.error);

	return parts.join(" ");
}

export function isNotificationsTableMissingError(error: unknown) {
	const message = getErrorText(error);

	return (
		message.includes("Base table or view not found") &&
		message.includes("alumni_notifications")
	);
}

export function getNotificationApiErrorMessage(
	error: unknown,
	fallback = "Silakan coba muat ulang halaman.",
) {
	if (isNotificationsTableMissingError(error)) {
		return NOTIFICATIONS_SETUP_MESSAGE;
	}

	return getApiErrorMessage(error, fallback);
}

export function useMyNotifications() {
	return useQuery<AlumniNotification[]>({
		queryKey: alumniQueryKeys.notifications,
		queryFn: async () => {
			const res = await fetchAPI("/alumni/notifications");
			const notifications = res?.data?.notifications ?? res?.notifications ?? [];

			return Array.isArray(notifications) ? notifications : [];
		},
		refetchInterval: 60000,
	});
}

export function useUnreadCount() {
	return useQuery<AlumniUnreadCount>({
		queryKey: alumniQueryKeys.unreadCount,
		queryFn: async () => {
			try {
				const res = await fetchAPI("/alumni/notifications/unread-count");
				const unreadCount =
					typeof res?.unread_count === "number" ? res.unread_count : 0;

				return { unread_count: unreadCount };
			} catch (error) {
				if (isNotificationsTableMissingError(error)) {
					return { unread_count: 0 };
				}

				throw error;
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
		onSuccess: (_, id) => {
			const currentNotifications =
				queryClient.getQueryData<AlumniNotification[]>(
					alumniQueryKeys.notifications,
				) ?? [];
			const wasUnread = currentNotifications.some(
				(notification) =>
					notification.id === id && notification.is_read !== true,
			);

			queryClient.setQueryData<AlumniNotification[]>(
				alumniQueryKeys.notifications,
				() =>
					currentNotifications.map((notification) =>
						notification.id === id
							? {
									...notification,
									is_read: true,
									read_at: notification.read_at ?? new Date().toISOString(),
								}
							: notification,
					),
			);
			queryClient.setQueryData<AlumniUnreadCount>(
				alumniQueryKeys.unreadCount,
				(current) => ({
					unread_count: wasUnread
						? Math.max(0, (current?.unread_count ?? 0) - 1)
						: (current?.unread_count ?? 0),
				}),
			);
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
			queryClient.setQueryData<AlumniNotification[]>(
				alumniQueryKeys.notifications,
				(current = []) =>
					current.map((notification) => ({
						...notification,
						is_read: true,
						read_at: notification.read_at ?? new Date().toISOString(),
					})),
			);
			queryClient.setQueryData<AlumniUnreadCount>(
				alumniQueryKeys.unreadCount,
				{ unread_count: 0 },
			);
			queryClient.invalidateQueries({
				queryKey: alumniQueryKeys.notifications,
			});
			queryClient.invalidateQueries({ queryKey: alumniQueryKeys.unreadCount });
		},
	});
}
