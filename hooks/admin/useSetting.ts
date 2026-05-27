import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchAPI } from "@/lib/api";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface AdminProfile {
	name: string;
	email: string;
	avatar?: string;
}

export interface SystemStatus {
	database: "Connected" | "Disconnected";
	whatsapp_api: "Connected" | "Disconnected";
	system: "Online" | "Offline";
}

export interface WAConfig {
	api_url: string;
	api_token: string;
	sender_number: string;
}

export interface UpdateProfilePayload {
	name: string;
	email: string;
}

export interface UpdatePasswordPayload {
	old_password: string;
	new_password: string;
}

// ─── Admin Profile ────────────────────────────────────────────────────────────

// GET profil admin
export function useAdminProfile(options?: {
	onSuccess?: (data: AdminProfile) => void;
}) {
	return useQuery<AdminProfile>({
		queryKey: ["admin-profile"],
		queryFn: () => fetchAPI("/admin/profile"),
		...options,
	});
}

// PUT update profil admin (nama, email)
export function useUpdateAdminProfile() {
	const queryClient = useQueryClient();
	return useMutation<AdminProfile, Error, UpdateProfilePayload>({
		mutationFn: (data) =>
			fetchAPI("/admin/profile", {
				method: "PUT",
				body: JSON.stringify(data),
			}),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["admin-profile"] });
		},
	});
}

// ─── Password ─────────────────────────────────────────────────────────────────

// PUT ganti password admin
export function useUpdatePassword() {
	return useMutation({
		mutationFn: (data: {
			current_password: string;
			new_password: string;
			new_password_confirmation: string;
		}) =>
			fetchAPI("/admin/change-password", {
				method: "PUT",
				body: JSON.stringify(data),
			}),
	});
}

// ─── WhatsApp API Config ──────────────────────────────────────────────────────

// GET konfigurasi WA API
export function useWAConfig(options?: {
	onSuccess?: (data: WAConfig) => void;
}) {
	return useQuery<WAConfig>({
		queryKey: ["wa-config"],
		queryFn: () => fetchAPI("/settings/whatsapp"),
		...options,
	});
}

// PUT simpan konfigurasi WA API
export function useUpdateWAConfig(options?: {
	onSuccess?: (data: WAConfig) => void;
}) {
	const queryClient = useQueryClient();
	return useMutation<WAConfig, Error, WAConfig>({
		mutationFn: (data) =>
			fetchAPI("/settings/whatsapp", {
				method: "PUT",
				body: JSON.stringify(data),
			}),
		onSuccess: (data) => {
			queryClient.invalidateQueries({ queryKey: ["wa-config"] });
			options?.onSuccess?.(data);
		},
	});
}

// POST test koneksi WA API
export function useTestWAConnection() {
	return useMutation<void, Error, void>({
		mutationFn: () => fetchAPI("/settings/whatsapp/test", { method: "POST" }),
	});
}

// ─── System Status ────────────────────────────────────────────────────────────

// GET status sistem (database, WA API, server)
export function useSystemStatus() {
	return useQuery<SystemStatus>({
		queryKey: ["system-status"],
		queryFn: () => fetchAPI("/settings/status"),
		refetchInterval: 30000, // auto refresh tiap 30 detik
	});
}
