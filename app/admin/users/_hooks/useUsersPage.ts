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
export type BulkUserStatusAction = "approve" | "deactivate" | "activate" | "reject";
export type UserSortKey =
	| "name"
	| "email"
	| "phone"
	| "role"
	| "status"
	| "created_at";
export type SortDirection = "asc" | "desc";
export type PaginationItem = number | "start-ellipsis" | "end-ellipsis";

export type UserStatusTarget = {
	user: User;
	status: Exclude<UserStatus, "pending">;
	action: UserStatusAction;
};

function getSortableValue(user: User, sortBy: UserSortKey) {
	if (sortBy === "phone") return getUserPhone(user);
	if (sortBy === "created_at") {
		const timestamp = new Date(user.created_at).getTime();
		return Number.isNaN(timestamp) ? 0 : timestamp;
	}

	return user[sortBy] ?? "";
}

function sortUsers(
	users: User[],
	sortBy: UserSortKey | null,
	direction: SortDirection,
) {
	if (!sortBy) return users;

	const multiplier = direction === "asc" ? 1 : -1;
	return users
		.map((user, index) => ({ user, index }))
		.sort((left, right) => {
			const leftValue = getSortableValue(left.user, sortBy);
			const rightValue = getSortableValue(right.user, sortBy);
			const comparison =
				typeof leftValue === "number" && typeof rightValue === "number"
					? leftValue - rightValue
					: String(leftValue).localeCompare(String(rightValue), "id-ID", {
							numeric: true,
							sensitivity: "base",
						});

			return comparison === 0
				? left.index - right.index
				: comparison * multiplier;
		})
		.map(({ user }) => user);
}

function paginateUsers(users: User[], currentPage: number, perPage: number) {
	const start = (currentPage - 1) * perPage;
	return users.slice(start, start + perPage);
}

function getPaginationRange(
	currentPage: number,
	totalPages: number,
): PaginationItem[] {
	if (totalPages <= 7) {
		return Array.from({ length: totalPages }, (_, index) => index + 1);
	}

	if (currentPage <= 4) {
		return [1, 2, 3, 4, 5, "end-ellipsis", totalPages];
	}

	if (currentPage >= totalPages - 3) {
		return [
			1,
			"start-ellipsis",
			totalPages - 4,
			totalPages - 3,
			totalPages - 2,
			totalPages - 1,
			totalPages,
		];
	}

	return [
		1,
		"start-ellipsis",
		currentPage - 1,
		currentPage,
		currentPage + 1,
		"end-ellipsis",
		totalPages,
	];
}

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
	const [statusFilter, setStatusFilterState] = useState<UserStatusFilter>("all");
	const [statusTarget, setStatusTarget] =
		useState<UserStatusTarget | null>(null);
	const [selectedUserIds, setSelectedUserIds] = useState<Set<number>>(
		() => new Set(),
	);
	const [currentPage, setCurrentPage] = useState(1);
	const [perPage, setPerPageState] = useState(10);
	const [sortBy, setSortBy] = useState<UserSortKey | null>(null);
	const [sortDirection, setSortDirection] = useState<SortDirection>("asc");
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
		setSearchQuery,
	} = useSearchFilter(statusFilteredUsers, (user) => [
		user.name,
		user.email,
		getUserPhone(user),
	]);
	const sortedUsers = useMemo(
		() => sortUsers(filtered, sortBy, sortDirection),
		[filtered, sortBy, sortDirection],
	);
	const totalPages = Math.max(1, Math.ceil(sortedUsers.length / perPage));
	const visiblePage = Math.min(currentPage, totalPages);
	const paginatedUsers = useMemo(
		() => paginateUsers(sortedUsers, visiblePage, perPage),
		[sortedUsers, visiblePage, perPage],
	);
	const paginationRange = getPaginationRange(visiblePage, totalPages);
	const pageStart = sortedUsers.length === 0 ? 0 : (visiblePage - 1) * perPage + 1;
	const pageEnd = Math.min(visiblePage * perPage, sortedUsers.length);
	const isBulkSelectable = (user: User) =>
		statusFilter !== "all" &&
		user.status === statusFilter &&
		!isAdminUser(user) &&
		user.id !== currentAdminId;
	const selectableVisibleUsers = useMemo(
		() =>
			statusFilter === "all"
				? []
				: paginatedUsers.filter(
						(user) =>
							user.status === statusFilter &&
							!isAdminUser(user) &&
							user.id !== currentAdminId,
					),
		[paginatedUsers, currentAdminId, statusFilter],
	);
	const selectedUsers = useMemo(
		() => users.filter((user) => selectedUserIds.has(user.id)),
		[users, selectedUserIds],
	);
	const allVisibleSelected =
		selectableVisibleUsers.length > 0 &&
		selectableVisibleUsers.every((user) => selectedUserIds.has(user.id));
	const someVisibleSelected = selectableVisibleUsers.some((user) =>
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

	const setSearch = (value: string) => {
		setSearchQuery(value);
		setCurrentPage(1);
	};

	const setStatusFilter = (value: UserStatusFilter) => {
		setStatusFilterState(value);
		setSelectedUserIds(new Set());
		setCurrentPage(1);
	};

	const setPerPage = (value: number) => {
		setPerPageState(value);
		setCurrentPage(1);
	};

	const handleSort = (column: UserSortKey) => {
		if (sortBy === column) {
			setSortDirection((current) => (current === "asc" ? "desc" : "asc"));
		} else {
			setSortBy(column);
			setSortDirection("asc");
		}
		setCurrentPage(1);
	};

	const goToPage = (page: number) => {
		setCurrentPage(Math.min(Math.max(page, 1), totalPages));
	};

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
		if (bulkUpdateUserStatus.isPending || selectableVisibleUsers.length === 0) {
			return;
		}

		setSelectedUserIds((current) => {
			const next = new Set(current);
			if (allVisibleSelected) {
				selectableVisibleUsers.forEach((user) => next.delete(user.id));
			} else {
				selectableVisibleUsers.forEach((user) => next.add(user.id));
			}
			return next;
		});
	};

	const clearSelectedUsers = () => setSelectedUserIds(new Set());

	const runBulkAction = (action: BulkUserStatusAction) => {
		const eligibleUsers = selectedUsers.filter((user) => {
			if (!isBulkSelectable(user)) return false;

			if (action === "approve") {
				return user.status === "pending" || user.status === "rejected";
			}

			if (action === "activate") {
				return user.status === "inactive";
			}

			if (action === "deactivate") {
				return user.status === "active";
			}

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
			action === "approve" || action === "activate"
				? "active"
				: action === "deactivate"
					? "inactive"
					: "rejected";

		const successMessages: Record<BulkUserStatusAction, string> = {
			approve:
				statusFilter === "rejected"
					? "Persetujuan ulang massal selesai."
					: "Persetujuan massal selesai.",
			activate: "Pengaktifan massal selesai.",
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
		if (sortedUsers.length === 0) {
			showFeedback({ type: "error", message: "Tidak ada data pengguna untuk diekspor" });
			return;
		}

		if (format === "pdf") {
			const opened = exportUsersToPdf(sortedUsers);
			showFeedback({
				type: opened ? "success" : "error",
				message: opened
					? "Data pengguna siap dicetak atau disimpan sebagai PDF"
					: "Popup PDF diblokir browser. Izinkan popup lalu coba lagi",
			});
			return;
		}

		exportUsersToExcel(sortedUsers);
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
		goToPage,
		handleSort,
		isBulkSelectable,
		handleDelete,
		handleExport,
		handleSubmit,
		isError,
		isLoading,
		pageEnd,
		pageStart,
		paginatedUsers,
		paginationRange,
		perPage,
		search,
		requestStatusUpdate,
		runBulkAction,
		selected,
		selectedUserIds,
		selectedUsers,
		setSearch,
		setSelected,
		setPerPage,
		setStatusFilter,
		sortBy,
		sortDirection,
		stats,
		statusFilter,
		statusTarget,
		someVisibleSelected,
		toggleSelectAll,
		toggleUserSelection,
		totalFilteredUsers: sortedUsers.length,
		totalPages,
		currentPage: visiblePage,
		updateUser,
		updateUserStatus,
		users,
		closeModal,
	};
}