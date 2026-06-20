"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
	type UpdateUserPayload,
	type User,
	useDeleteUser,
	useUpdateUser,
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

export function useUsersPage() {
	const [selected, setSelected] = useState<User | null>(null);
	const [deleteTarget, setDeleteTarget] = useState<User | null>(null);
	const [feedback, setFeedback] = useState<{
		type: "success" | "error";
		message: string;
	} | null>(null);
	const feedbackTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
	const { data: allUsers = [], isLoading, isError } = useUsers();
	const updateUser = useUpdateUser();
	const deleteUser = useDeleteUser();
	const users = useMemo(
		() => allUsers.filter((user) => !isAdminUser(user)),
		[allUsers],
	);
	const {
		filteredItems: filtered,
		searchQuery: search,
		setSearchQuery: setSearch,
	} = useSearchFilter(users, (user) => [
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
		confirmDelete,
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
		selected,
		setSearch,
		setSelected,
		stats,
		updateUser,
		users,
		closeModal,
	};
}
