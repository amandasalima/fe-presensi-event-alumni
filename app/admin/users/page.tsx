"use client";

import { useState } from "react";
import { Download, Edit3, Trash2, X } from "lucide-react";
import AdminSidebar from "@/app/components/AdminSidebar";
import AdminHeader from "@/app/components/AdminHeader";
import { FormInput, FormSelect } from "@/app/components/FormControl";
import SearchInput from "@/app/components/SearchInput";
import type { UpdateUserPayload, User } from "@/hooks/admin/users";
import { useUsersPage } from "./_hooks/useUsersPage";
import {
	formatDate,
	formatLabel,
	getStatusClass,
} from "./_utils/userFormatters";

const ROLE_OPTIONS = ["admin", "alumni", "user"];
const STATUS_OPTIONS = ["active", "inactive"];

function TableSkeleton() {
	return (
		<>
			{[1, 2, 3, 4, 5].map((i) => (
				<tr key={i} className="border-b animate-pulse">
					{[1, 2, 3, 4, 5, 6].map((j) => (
						<td key={j} className="p-5">
							<div className="h-4 bg-gray-100 rounded w-3/4" />
						</td>
					))}
				</tr>
			))}
		</>
	);
}

interface EditUserModalProps {
	initial: User;
	onClose: () => void;
	onSubmit: (data: UpdateUserPayload) => void;
	loading: boolean;
}

function EditUserModal({
	initial,
	onClose,
	onSubmit,
	loading,
}: EditUserModalProps) {
	const [form, setForm] = useState<UpdateUserPayload>({
		name: initial.name ?? "",
		email: initial.email ?? "",
		role: initial.role ?? "user",
		status: initial.status ?? "active",
	});
	const roleOptions = Array.from(
		new Set([...ROLE_OPTIONS, initial.role]),
	).filter(Boolean);
	const statusOptions = Array.from(
		new Set([...STATUS_OPTIONS, initial.status]),
	).filter(Boolean);
	const set = (key: keyof UpdateUserPayload, value: string) =>
		setForm((current) => ({ ...current, [key]: value }));

	return (
		<div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
			<div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
				<div className="p-6 border-b border-gray-100 flex items-center justify-between">
					<h3 className="font-semibold text-gray-800 text-lg">Edit User</h3>
					<button
						onClick={onClose}
						className="text-gray-400 hover:text-gray-600"
						aria-label="Tutup modal"
					>
						<X size={20} />
					</button>
				</div>
				<div className="p-6 space-y-4">
					<div>
						<label className="text-xs font-medium text-gray-600 mb-1 block">
							Nama
						</label>
						<FormInput
							value={form.name}
							onChange={(e) => set("name", e.target.value)}
							className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400"
						/>
					</div>
					<div>
						<label className="text-xs font-medium text-gray-600 mb-1 block">
							Email
						</label>
						<FormInput
							type="email"
							value={form.email}
							onChange={(e) => set("email", e.target.value)}
							className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400"
						/>
					</div>
					<div className="grid grid-cols-2 gap-3">
						<div>
							<label className="text-xs font-medium text-gray-600 mb-1 block">
								Role
							</label>
							<FormSelect
								value={form.role}
								onChange={(e) => set("role", e.target.value)}
								className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400 bg-white"
							>
								{roleOptions.map((role) => (
									<option key={role} value={role}>
										{formatLabel(role)}
									</option>
								))}
							</FormSelect>
						</div>
						<div>
							<label className="text-xs font-medium text-gray-600 mb-1 block">
								Status
							</label>
							<FormSelect
								value={form.status}
								onChange={(e) => set("status", e.target.value)}
								className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400 bg-white"
							>
								{statusOptions.map((status) => (
									<option key={status} value={status}>
										{formatLabel(status)}
									</option>
								))}
							</FormSelect>
						</div>
					</div>
				</div>
				<div className="p-6 border-t border-gray-100 flex gap-3">
					<button
						onClick={onClose}
						className="flex-1 border border-gray-200 text-gray-600 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors"
					>
						Batal
					</button>
					<button
						onClick={() => onSubmit(form)}
						disabled={loading}
						className="flex-1 bg-teal-600 hover:bg-teal-700 disabled:bg-teal-300 text-white py-2.5 rounded-xl text-sm font-medium transition-colors flex items-center justify-center gap-2"
					>
						{loading && (
							<span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
						)}
						Perbarui
					</button>
				</div>
			</div>
		</div>
	);
}

export default function UsersPage() {
	const {
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
	} = useUsersPage();

	return (
		<div className="h-screen bg-gray-100 flex overflow-hidden">
			<AdminSidebar />

			<div className="flex-1 ml-72 flex flex-col h-screen">
				<AdminHeader title="Kelola User" />

				<main className="flex-1 overflow-y-auto p-8">
					<div className="grid grid-cols-4 gap-6 mb-8">
						{[
							{
								title: "Total User",
								value: isLoading ? "..." : users.length,
								desc: "User terdaftar",
							},
							{
								title: "Aktif",
								value: isLoading ? "..." : stats.activeUsers,
								desc: "User aktif",
							},
							{
								title: "Admin",
								value: isLoading ? "..." : stats.adminUsers,
								desc: "User admin",
							},
							{
								title: "Bulan Ini",
								value: isLoading ? "..." : stats.monthUsers,
								desc: "User baru",
							},
						].map((item) => (
							<div
								key={item.title}
								className="bg-white rounded-3xl border-2 border-cyan-400 p-7"
							>
								<p className="text-gray-500 text-lg">{item.title}</p>
								<h2 className="text-5xl font-bold mt-3 text-gray-800">
									{item.value}
								</h2>
								<p className="text-gray-400 mt-2">{item.desc}</p>
							</div>
						))}
					</div>

					<div className="bg-white rounded-3xl shadow-sm overflow-hidden">
						<div className="p-8 bg-teal-50 flex items-center justify-between">
							<div>
								<h2 className="text-gray-800 text-4xl font-bold">
									Manajemen User
								</h2>
								<p className="text-gray-500 mt-2">
									Kelola data user aplikasi presensi event
								</p>
							</div>
							<button
								onClick={handleExport}
								disabled={isLoading || filtered.length === 0}
								className="px-6 py-3 border-2 border-teal-500 rounded-2xl text-teal-600 font-semibold hover:bg-teal-50 disabled:opacity-50 disabled:hover:bg-transparent transition-colors flex items-center gap-2"
							>
								<Download size={18} />
								Export Data
							</button>
						</div>

						<div className="p-8">
							<SearchInput
								placeholder="Cari nama atau email..."
								value={search}
								onValueChange={setSearch}
								className="w-full px-5 py-4 border rounded-2xl outline-none focus:border-cyan-500 mb-6 text-sm text-gray-800 placeholder-gray-400"
							/>

							{feedback && (
								<div
									className={`mb-6 rounded-2xl px-5 py-4 text-sm font-medium ${
										feedback.type === "success"
											? "bg-green-50 text-green-700 border border-green-100"
											: "bg-red-50 text-red-600 border border-red-100"
									}`}
								>
									{feedback.message}
								</div>
							)}

							{isError && (
								<div className="text-center py-12">
									<p className="text-4xl mb-3">!</p>
									<p className="text-sm text-red-500 font-medium">
										Gagal memuat data user
									</p>
									<p className="text-xs text-gray-400 mt-1">
										Pastikan server backend sudah berjalan
									</p>
								</div>
							)}

							{!isError && (
								<div className="overflow-x-auto">
									<table className="w-full">
										<thead className="bg-teal-100">
											<tr>
												{[
													"Nama",
													"Email",
													"Role",
													"Status",
													"Tanggal Dibuat",
													"Aksi",
												].map((header) => (
													<th
														key={header}
														className="text-left p-5 text-sm font-semibold text-gray-700"
													>
														{header}
													</th>
												))}
											</tr>
										</thead>
										<tbody>
											{isLoading ? (
												<TableSkeleton />
											) : filtered.length === 0 ? (
												<tr>
													<td
														colSpan={6}
														className="text-center py-12 text-gray-400"
													>
														<p className="text-3xl mb-2">User</p>
														<p className="text-sm">
															{search
																? "User tidak ditemukan"
																: "Belum ada data user"}
														</p>
													</td>
												</tr>
											) : (
												filtered.map((user) => (
													<tr
														key={user.id}
														className="border-b hover:bg-gray-50 transition-colors"
													>
														<td className="p-5">
															<div className="flex items-center gap-3">
																<div className="w-9 h-9 rounded-full bg-gradient-to-br from-teal-400 to-cyan-500 text-white flex items-center justify-center text-sm font-bold flex-shrink-0">
																	{user.name?.[0]?.toUpperCase() ?? "U"}
																</div>
																<span className="font-semibold text-gray-800">
																	{user.name}
																</span>
															</div>
														</td>
														<td className="p-5 text-gray-500 text-sm">
															{user.email}
														</td>
														<td className="p-5">
															<span className="px-3 py-1.5 bg-cyan-100 text-cyan-700 rounded-xl text-xs font-medium">
																{formatLabel(user.role)}
															</span>
														</td>
														<td className="p-5">
															<span
																className={`px-3 py-1.5 rounded-xl text-xs font-medium ${getStatusClass(user.status)}`}
															>
																{formatLabel(user.status)}
															</span>
														</td>
														<td className="p-5 text-gray-500 text-sm">
															{formatDate(user.created_at)}
														</td>
														<td className="p-5">
															<div className="flex gap-2">
																<button
																	onClick={() => setSelected(user)}
																	className="p-2 hover:bg-teal-50 rounded-lg transition-colors text-teal-600"
																	title="Edit"
																	aria-label={`Edit ${user.name}`}
																>
																	<Edit3 size={18} />
																</button>
																<button
																	onClick={() => handleDelete(user)}
																	disabled={deleteUser.isPending}
																	className="p-2 hover:bg-red-50 rounded-lg transition-colors text-red-400 disabled:opacity-50"
																	title="Hapus"
																	aria-label={`Hapus ${user.name}`}
																>
																	<Trash2 size={18} />
																</button>
															</div>
														</td>
													</tr>
												))
											)}
										</tbody>
									</table>
								</div>
							)}

							{!isLoading && !isError && filtered.length > 0 && (
								<div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-100">
									<p className="text-sm text-gray-400">
										Menampilkan {filtered.length} dari {users.length} user
									</p>
									<div className="flex gap-2">
										<button className="px-4 py-2 border border-gray-200 rounded-xl text-sm text-gray-500 hover:bg-gray-50 transition-colors">
											Sebelumnya
										</button>
										<button className="px-4 py-2 bg-teal-600 text-white rounded-xl text-sm font-medium">
											1
										</button>
										<button className="px-4 py-2 border border-gray-200 rounded-xl text-sm text-gray-500 hover:bg-gray-50 transition-colors">
											Berikutnya
										</button>
									</div>
								</div>
							)}
						</div>
					</div>

					<footer className="mt-10 text-center text-gray-400 text-xs">
						© 2026 QR Event Attendance System - Pesantren
					</footer>
				</main>
			</div>

			{selected && (
				<EditUserModal
					initial={selected}
					onClose={closeModal}
					onSubmit={handleSubmit}
					loading={updateUser.isPending}
				/>
			)}
		</div>
	);
}
