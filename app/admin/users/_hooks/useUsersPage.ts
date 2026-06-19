"use client";

import { useMemo, useState } from "react";
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
	getUserStats,
	isAdminUser,
} from "../_utils/userFormatters";

export function useUsersPage() {
	const [selected, setSelected] = useState<User | null>(null);
	const [feedback, setFeedback] = useState<{
		type: "success" | "error";
		message: string;
	} | null>(null);
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
	} = useSearchFilter(users, (user) => [user.name, user.email]);

	const stats = useMemo(() => getUserStats(users), [users]);
	const closeModal = () => setSelected(null);

	const handleSubmit = (data: UpdateUserPayload) => {
		if (!selected) return;
		if (isAdminUser(selected)) {
			setSelected(null);
			setFeedback({
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
					setFeedback({ type: "success", message: "User berhasil diperbarui" });
				},
				onError: (error) => {
					setFeedback({
						type: "error",
						message: getApiErrorMessage(error, "Gagal memperbarui user"),
					});
				},
			},
		);
	};

	const handleDelete = (user: User) => {
		if (isAdminUser(user)) {
			setFeedback({
				type: "error",
				message: "User dengan role admin tidak dapat dihapus",
			});
			return;
		}

		if (!confirm(`Yakin ingin menghapus user ${user.name}?`)) return;

		setFeedback(null);
		deleteUser.mutate(user.id, {
			onSuccess: () => {
				setFeedback({ type: "success", message: "User berhasil dihapus" });
			},
			onError: (error) => {
				setFeedback({
					type: "error",
					message: getApiErrorMessage(error, "Gagal menghapus user"),
				});
			},
		});
	};

	const handleExport = () => {
		if (filtered.length === 0) {
			setFeedback({ type: "error", message: "Tidak ada data user untuk diexport" });
			return;
		}

		exportUsersToExcel(filtered);
		setFeedback({ type: "success", message: "Data user berhasil diexport" });
	};

	return {
		deleteUser,
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
