"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
	type UpdateUserPayload,
	type User,
	type UserStatus,
	useDeleteUser,
	useUpdateUser,
	useUpdateUserStatus,
	useUsers,
} from "@/hooks/admin/users";
import { useSearchFilter } from "@/hooks/useSearchFilter";
import { getApiErrorMessage } from "@/lib/api";
import {
	exportUsersToExcel,
	exportUsersToPdf,
	getUserStats,
	getUserPhone,
	isAdminUser,
} from "../_utils/userFormatters";

export type UserStatusFilter = "all" | UserStatus;
export type UserStatusAction = "approve" | "reject" | "deactivate" | "activate";

export type UserStatusTarget = {
	user: User;
	status: Exclude<UserStatus, "pending">;
	action: UserStatusAction;
};

export function useUsersPage() {
	const [selected, setSelected] = useState<User | null>(null);
	const [deleteTarget, setDeleteTarget] = useState<User | null>(null);
	const [statusFilter, setStatusFilter] = useState<UserStatusFilter>("all");
	const [statusTarget, setStatusTarget] =
		useState<UserStatusTarget | null>(null);
	const [feedback, setFeedback] = useState<{
		type: "success" | "error";
		message: string;
	} | null>(null);
	const feedbackTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
	const { data: allUsers = [], isLoading, isError } = useUsers();
	const updateUser = useUpdateUser();
	const updateUserStatus = useUpdateUserStatus();
	const deleteUser = useDeleteUser();
	const users = useMemo(
		() => allUsers.filter((user) => !isAdminUser(user)),
		[allUsers],
	);
	const statusFilteredUsers = useMemo(
		() =>
			statusFilter === "all"
				? users
				: users.filter((user) => user.status === statusFilter),
		[statusFilter, users],
	);
	const {
		filteredItems: filtered,
		searchQuery: search,
		setSearchQuery: setSearch,
	} = useSearchFilter(statusFilteredUsers, (user) => [
		user.name,
		user.email,
		getUserPhone(user),
	]);

	const stats = useMemo(() => getUserStats(users), [users]);
	const closeModal = () => setSelected(null);
	const clearFeedbackTimeout = () => {
		if (feedbackTimeoutRef.current) {
			clearTimeout(feedbackTimeoutRef.current);
			feedbackTimeoutRef.current = null;
		}
	};
	const showFeedback = (nextFeedback: {
		type: "success" | "error";
		message: string;
	}) => {
		clearFeedbackTimeout();
		setFeedback(nextFeedback);
		feedbackTimeoutRef.current = setTimeout(() => setFeedback(null), 3000);
	};

	useEffect(() => clearFeedbackTimeout, []);

	const handleSubmit = (data: UpdateUserPayload) => {
		if (!selected) return;
		if (isAdminUser(selected)) {
			setSelected(null);
			showFeedback({
				type: "error",
				message: "User dengan role admin tidak dapat diedit",
			});
			return;
		}

		setFeedback(null);
		updateUser.mutate(
			{ id: selected.id, data },
			{
				onSuccess: () => {
					setSelected(null);
					showFeedback({ type: "success", message: "User berhasil diperbarui" });
				},
				onError: (error) => {
					showFeedback({
						type: "error",
						message: getApiErrorMessage(error, "Gagal memperbarui user"),
					});
				},
			},
		);
	};

	const handleDelete = (user: User) => {
		if (isAdminUser(user)) {
			showFeedback({
				type: "error",
				message: "User dengan role admin tidak dapat dihapus",
			});
			return;
		}

		setDeleteTarget(user);
	};

	const cancelDelete = () => setDeleteTarget(null);
	const cancelStatusUpdate = () => setStatusTarget(null);

	const requestStatusUpdate = (target: UserStatusTarget) => {
		if (isAdminUser(target.user) || !target.user.status) return;
		setStatusTarget(target);
	};

	const confirmStatusUpdate = () => {
		if (!statusTarget) return;

		setFeedback(null);
		updateUserStatus.mutate(
			{ id: statusTarget.user.id, status: statusTarget.status },
			{
				onSuccess: () => {
					const successMessages: Record<UserStatusAction, string> = {
						approve: "User berhasil disetujui",
						reject: "User berhasil ditolak",
						deactivate: "User berhasil dinonaktifkan",
						activate: "User berhasil diaktifkan",
					};

					setStatusTarget(null);
					showFeedback({
						type: "success",
						message: successMessages[statusTarget.action],
					});
				},
				onError: (error) => {
					setStatusTarget(null);
					showFeedback({
						type: "error",
						message: getApiErrorMessage(error, "Gagal mengubah status user"),
					});
				},
			},
		);
	};

	const confirmDelete = () => {
		if (!deleteTarget) return;

		setFeedback(null);
		deleteUser.mutate(deleteTarget.id, {
			onSuccess: () => {
				setDeleteTarget(null);
				showFeedback({ type: "success", message: "User berhasil dihapus" });
			},
			onError: (error) => {
				setDeleteTarget(null);
				showFeedback({
					type: "error",
					message: getApiErrorMessage(error, "Gagal menghapus user"),
				});
			},
		});
	};

	const handleExport = (format: "excel" | "pdf") => {
		if (filtered.length === 0) {
			showFeedback({ type: "error", message: "Tidak ada data user untuk diexport" });
			return;
		}

		if (format === "pdf") {
			const opened = exportUsersToPdf(filtered);
			showFeedback({
				type: opened ? "success" : "error",
				message: opened
					? "Data user siap dicetak atau disimpan sebagai PDF"
					: "Popup PDF diblokir browser. Izinkan popup lalu coba lagi",
			});
			return;
		}

		exportUsersToExcel(filtered);
		showFeedback({ type: "success", message: "Data user berhasil diexport ke Excel" });
	};

	return {
		cancelDelete,
		cancelStatusUpdate,
		confirmDelete,
		confirmStatusUpdate,
		deleteUser,
		deleteTarget,
		feedback,
		filtered,
		handleDelete,
		handleExport,
		handleSubmit,
		isError,
		isLoading,
		search,
		requestStatusUpdate,
		selected,
		setSearch,
		setSelected,
		setStatusFilter,
		stats,
		statusFilter,
		statusTarget,
		updateUser,
		updateUserStatus,
		users,
		closeModal,
	};
}
