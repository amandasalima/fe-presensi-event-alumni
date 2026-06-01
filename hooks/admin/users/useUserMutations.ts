import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteUser, updateUser } from "./api";
import { userQueryKeys } from "./queryKeys";
import type { UpdateUserPayload } from "./types";

export function useUpdateUser() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({ id, data }: { id: number; data: UpdateUserPayload }) =>
			updateUser(id, data),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: userQueryKeys.all });
		},
	});
}

export function useDeleteUser() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: deleteUser,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: userQueryKeys.all });
		},
	});
}
