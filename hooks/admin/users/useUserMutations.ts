import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
	bulkUpdateUserStatus,
	deleteUser,
	updateUser,
	updateUserStatus,
} from "./api";
import { userQueryKeys } from "./queryKeys";
import type { BulkUserTargetStatus, UpdateUserPayload, UserStatus } from "./types";

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

export function useUpdateUserStatus() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({ id, status, reason }: { id: number; status: UserStatus; reason?: string }) =>
			updateUserStatus(id, status, reason),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: userQueryKeys.all });
		},
	});
}

export function useBulkUpdateUserStatus() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({
			userIds,
			status,
			reason,
		}: {
			userIds: number[];
			status: BulkUserTargetStatus;
			reason?: string;
		}) => bulkUpdateUserStatus(userIds, status, reason),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: userQueryKeys.all });
		},
	});
}
