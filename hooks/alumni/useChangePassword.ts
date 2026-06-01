import { useMutation } from "@tanstack/react-query";
import { fetchAPI } from "@/lib/api";

export interface ChangePasswordPayload {
	current_password: string;
	new_password: string;
	new_password_confirmation: string;
}

export function useChangePassword() {
	return useMutation({
		mutationFn: (data: ChangePasswordPayload) =>
			fetchAPI("/auth/change-password", {
				method: "PUT",
				body: JSON.stringify(data),
			}),
	});
}
