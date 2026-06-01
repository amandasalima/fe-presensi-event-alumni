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
			const res = await fetchAPI("/auth/me");
			if (res?.data?.user) {
				const user = res.data.user;
				const firstName = user.first_name || user.name?.split(" ")[0] || "Alumni";
				const lastName = user.last_name || user.name?.split(" ").slice(1).join(" ") || "";
				return {
					...user,
					first_name: firstName,
					last_name: lastName,
				};
			}
			throw new Error("Failed to load profile from backend");
		},
	});
}

export function useUpdateMyProfile() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (data: ProfileUpdatePayload) => {
			const res = await fetchAPI("/auth/profile", {
				method: "PUT",
				body: JSON.stringify(data),
			});
			return res;
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
			return fetchAPI("/auth/change-password", {
				method: "PUT",
				body: JSON.stringify({
					current_password: data.old_password,
					new_password: data.new_password,
					new_password_confirmation: data.new_password,
				}),
			});
		},
	});
}
