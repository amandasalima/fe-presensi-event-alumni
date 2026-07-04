"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
	type UpdateUserPayload,
	type User,
	type UserStatus,
	useBulkUpdateUserStatus,
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
export type BulkUserStatusAction = "approve" | "deactivate" | "reject";

export type UserStatusTarget = {
	user: User;
	status: Exclude<UserStatus, "pending">;
	action: UserStatusAction;
};

function getCurrentAdminId() {
	if (typeof window === "undefined") return null;

	try {
		const storedUser = localStorage.getItem("user");
		if (!storedUser) return null;

		const id = Number((JSON.parse(storedUser) as { id?: unknown }).id);
		return Number.isFinite(id) ? id : null;
	} catch {
		return null;
	}
}

export function useUsersPage() {
	const [selected, setSelected] = useState<User | null>(null);
	const [deleteTarget, setDeleteTarget] = useState<User | null>(null);
	const [statusFilter, setStatusFilter] = useState<UserStatusFilter>("all");
	const [statusTarget, setStatusTarget] =
		useState<UserStatusTarget | null>(null);
	const [selectedUserIds, setSelectedUserIds] = useState<Set<number>>(
		() => new Set(),
	);
	const [feedback, setFeedback] = useState<{
		type: "success" | "error";
		message: string;
	} | null>(null);
	const feedbackTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
	const { data: allUsers = [], isLoading, isError } = useUsers();
	const updateUser = useUpdateUser();
	const updateUserStatus = useUpdateUserStatus();
	const bulkUpdateUserStatus = useBulkUpdateUserStatus();
	const deleteUser = useDeleteUser();
	const currentAdminId = getCurrentAdminId();
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
	const isBulkSelectable = (user: User) =>
		!isAdminUser(user) && user.id !== currentAdminId;
	const selectableFilteredUsers = useMemo(
		() =>
			filtered.filter(
				(user) => !isAdminUser(user) && user.id !== currentAdminId,
			),
		[filtered, currentAdminId],
	);
	const selectedUsers = useMemo(
		() => users.filter((user) => selectedUserIds.has(user.id)),
		[users, selectedUserIds],
	);
	const allVisibleSelected =
		selectableFilteredUsers.length > 0 &&
		selectableFilteredUsers.every((user) => selectedUserIds.has(user.id));
	const someVisibleSelected = selectableFilteredUsers.some((user) =>
		selectedUserIds.has(user.id),
	);

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

	const toggleUserSelection = (user: User) => {
		if (bulkUpdateUserStatus.isPending || !isBulkSelectable(user)) return;

		setSelectedUserIds((current) => {
			const next = new Set(current);
			if (next.has(user.id)) next.delete(user.id);
			else next.add(user.id);
			return next;
		});
	};

	const toggleSelectAll = () => {
		if (bulkUpdateUserStatus.isPending || selectableFilteredUsers.length === 0) {
			return;
		}

		setSelectedUserIds((current) => {
			const next = new Set(current);
			if (allVisibleSelected) {
				selectableFilteredUsers.forEach((user) => next.delete(user.id));
			} else {
				selectableFilteredUsers.forEach((user) => next.add(user.id));
			}
			return next;
		});
	};

	const clearSelectedUsers = () => setSelectedUserIds(new Set());

	const runBulkAction = (action: BulkUserStatusAction) => {
		const eligibleUsers = selectedUsers.filter((user) => {
			if (!isBulkSelectable(user)) return false;
			if (action === "approve") {
				return ["pending", "inactive", "rejected"].includes(user.status ?? "");
			}
			if (action === "deactivate") return user.status === "active";
			return user.status === "pending";
		});

		if (eligibleUsers.length === 0) {
			showFeedback({
				type: "error",
				message: "Tidak ada pengguna yang sesuai untuk aksi ini.",
			});
			return;
		}

		const targetStatus: Exclude<UserStatus, "pending"> =
			action === "approve"
				? "active"
				: action === "deactivate"
					? "inactive"
					: "rejected";
		const successMessages: Record<BulkUserStatusAction, string> = {
			approve: "Persetujuan massal selesai.",
			deactivate: "Penonaktifan massal selesai.",
			reject: "Penolakan massal selesai.",
		};

		setFeedback(null);
		bulkUpdateUserStatus.mutate(
			{
				userIds: eligibleUsers.map((user) => user.id),
				status: targetStatus,
			},
			{
				onSuccess: (result) => {
					clearSelectedUsers();
					const { updated_count: updatedCount, skipped_count: skippedCount } =
						result.data;
					const skippedSummary =
						skippedCount > 0 ? `, ${skippedCount} pengguna dilewati` : "";

					showFeedback({
						type: "success",
						message: `${successMessages[action]} ${updatedCount} pengguna diperbarui${skippedSummary}.`,
					});
				},
				onError: (error) => {
					clearSelectedUsers();
					showFeedback({
						type: "error",
						message: getApiErrorMessage(error, "Aksi massal gagal diproses."),
					});
				},
			},
		);
	};

	const handleSubmit = (data: UpdateUserPayload) => {
		if (!selected) return;
		if (isAdminUser(selected)) {
			setSelected(null);
			showFeedback({
				type: "error",
				message: "Pengguna dengan peran admin tidak dapat diubah",
			});
			return;
		}

		setFeedback(null);
		updateUser.mutate(
			{ id: selected.id, data },
			{
				onSuccess: () => {
					setSelected(null);
					showFeedback({ type: "success", message: "Pengguna berhasil diperbarui" });
				},
				onError: (error) => {
					showFeedback({
						type: "error",
						message: getApiErrorMessage(error, "Gagal memperbarui pengguna"),
					});
				},
			},
		);
	};

	const handleDelete = (user: User) => {
		if (isAdminUser(user)) {
			showFeedback({
				type: "error",
				message: "Pengguna dengan peran admin tidak dapat dihapus",
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
						approve: "Pengguna berhasil disetujui",
						reject: "Pengguna berhasil ditolak",
						deactivate: "Pengguna berhasil dinonaktifkan",
						activate: "Pengguna berhasil diaktifkan",
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
						message: getApiErrorMessage(error, "Gagal mengubah status pengguna"),
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
				showFeedback({ type: "success", message: "Pengguna berhasil dihapus" });
			},
			onError: (error) => {
				setDeleteTarget(null);
				showFeedback({
					type: "error",
					message: getApiErrorMessage(error, "Gagal menghapus pengguna"),
				});
			},
		});
	};

	const handleExport = (format: "excel" | "pdf") => {
		if (filtered.length === 0) {
			showFeedback({ type: "error", message: "Tidak ada data pengguna untuk diekspor" });
			return;
		}

		if (format === "pdf") {
			const opened = exportUsersToPdf(filtered);
			showFeedback({
				type: opened ? "success" : "error",
				message: opened
					? "Data pengguna siap dicetak atau disimpan sebagai PDF"
					: "Popup PDF diblokir browser. Izinkan popup lalu coba lagi",
			});
			return;
		}

		exportUsersToExcel(filtered);
	showFeedback({ type: "success", message: "Data pengguna berhasil diekspor ke Excel" });
	};

	return {
		allVisibleSelected,
		bulkActionLoading: bulkUpdateUserStatus.isPending,
		clearSelectedUsers,
		cancelDelete,
		cancelStatusUpdate,
		confirmDelete,
		confirmStatusUpdate,
		deleteUser,
		deleteTarget,
		feedback,
		filtered,
		isBulkSelectable,
		handleDelete,
		handleExport,
		handleSubmit,
		isError,
		isLoading,
		search,
		requestStatusUpdate,
		runBulkAction,
		selected,
		selectedUserIds,
		selectedUsers,
		setSearch,
		setSelected,
		setStatusFilter,
		stats,
		statusFilter,
		statusTarget,
		someVisibleSelected,
		toggleSelectAll,
		toggleUserSelection,
		updateUser,
		updateUserStatus,
		users,
		closeModal,
	};
}
