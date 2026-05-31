import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchAPI } from "@/lib/api";
import { alumniQueryKeys } from "./queryKeys";

type ProfileUpdatePayload = Record<string, unknown> & {
	first_name?: string;
	last_name?: string;
};

export function useMyProfile() {
	return useQuery({
		queryKey: alumniQueryKeys.profile,
		queryFn: async () => {
			if (typeof window !== "undefined") {
				const stored = localStorage.getItem("dummy_profile");
				if (stored) {
					try {
						return JSON.parse(stored);
					} catch (error) {
						console.error("Failed to parse stored dummy_profile", error);
					}
				}
			}

			let userProfile;
			try {
				const res = await fetchAPI("/auth/me");
				if (res?.data?.user) {
					const fullName = res.data.user.name || "";
					const parts = fullName.trim().split(" ");
					const firstName = parts[0] || "Alumni";
					const lastName = parts.slice(1).join(" ") || "";
					userProfile = {
						...res.data.user,
						first_name: firstName,
						last_name: lastName,
					};
				}
			} catch (error) {
				console.warn("Failed to fetch profile, using mock profile:", error);
			}

			if (!userProfile) {
				userProfile = {
					id: 999,
					name: "Ahmad Alumni Dummy",
					first_name: "Ahmad",
					last_name: "Alumni Dummy",
					email: "ahmad@dummy.com",
					phone: "081234567890",
					angkatan: "2020",
					role: "alumni",
					gender: "L",
					status: "alumni",
				};
			}

			if (typeof window !== "undefined") {
				localStorage.setItem("dummy_profile", JSON.stringify(userProfile));
			}

			return userProfile;
		},
	});
}

export function useUpdateMyProfile() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (data: ProfileUpdatePayload) => {
			await new Promise((resolve) => setTimeout(resolve, 1000));

			if (typeof window !== "undefined") {
				const stored = localStorage.getItem("dummy_profile");
				const current = stored ? JSON.parse(stored) : {};
				const updated = {
					...current,
					...data,
					name: `${data.first_name || ""} ${data.last_name || ""}`.trim(),
				};
				localStorage.setItem("dummy_profile", JSON.stringify(updated));
				return { success: true, data: updated };
			}

			return { success: true };
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: alumniQueryKeys.profile });
		},
	});
}

export function useUpdateMyPassword() {
	return useMutation({
		mutationFn: async (data: {
			old_password: string;
			new_password: string;
		}) => {
			void data;
			await new Promise((resolve) => setTimeout(resolve, 1000));

			return {
				success: true,
				message: "Password berhasil diperbarui secara lokal!",
			};
		},
	});
}
