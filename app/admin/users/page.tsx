"use client";

import { useState, type ReactNode } from "react";
import {
	Download,
	Edit3,
	Trash2,
	X,
	Users,
	UserCheck,
	CalendarPlus,
	UserCog,
	Search,
	AlertCircle,
} from "lucide-react";
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

const ROLE_OPTIONS = ["alumni", "user"];
const STATUS_OPTIONS = ["active", "inactive"];

function Icon3D({
	children,
	variant = "teal",
	size = "md",
}: {
	children: ReactNode;
	variant?: "teal" | "blue" | "green" | "red" | "gray" | "yellow";
	size?: "sm" | "md" | "lg";
}) {
	const variants = {
		teal: "from-[#D8F3F0] via-[#7AB2B2] to-[#2D7EA0] text-white",
		blue: "from-blue-100 via-blue-400 to-blue-600 text-white",
		green: "from-emerald-100 via-emerald-400 to-emerald-600 text-white",
		red: "from-red-100 via-red-400 to-red-600 text-white",
		gray: "from-gray-100 via-gray-300 to-gray-500 text-white",
		yellow: "from-yellow-100 via-yellow-400 to-yellow-600 text-white",
	};

	const sizes = {
		sm: "w-8 h-8 rounded-xl",
		md: "w-10 h-10 rounded-2xl",
		lg: "w-14 h-14 rounded-2xl",
	};

	return (
		<span
			className={`${sizes[size]} shrink-0 overflow-visible inline-flex items-center justify-center bg-gradient-to-br ${variants[variant]} shadow-lg shadow-gray-300/70 border border-white/60 ring-1 ring-black/5`}
		>
			<span className="inline-flex items-center justify-center leading-none drop-shadow-sm">
				{children}
			</span>
		</span>
	);
}


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
							className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#7AB2B2]"
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
							className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#7AB2B2]"
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
								className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#7AB2B2] bg-white"
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
								className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#7AB2B2] bg-white"
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
						className="flex-1 bg-[#2D7EA0] hover:bg-[#236175] disabled:bg-[#A8D5D5] text-white py-2.5 rounded-xl text-sm font-medium transition-colors flex items-center justify-center gap-2"
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

			<div className="flex-1 ml-56 flex flex-col h-screen">
				<AdminHeader title="Kelola User" />

				<main className="flex-1 overflow-y-auto p-5">
					<div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mb-5">
						{[
							{
								title: "Total User",
								value: isLoading ? "..." : users.length,
								desc: "User terdaftar",
								icon: <Users size={20} strokeWidth={2.5} />,
								variant: "teal" as const,
							},
							{
								title: "Aktif",
								value: isLoading ? "..." : stats.activeUsers,
								desc: "User aktif",
								icon: <UserCheck size={20} strokeWidth={2.5} />,
								variant: "green" as const,
							},
							{
								title: "Bulan Ini",
								value: isLoading ? "..." : stats.monthUsers,
								desc: "User baru",
								icon: <CalendarPlus size={20} strokeWidth={2.5} />,
								variant: "blue" as const,
							},
						].map((item) => (
							<div
								key={item.title}
								className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex items-center justify-between gap-4"
							>
								<div>
									<p className="text-gray-500 text-sm">{item.title}</p>
									<h2 className="text-3xl font-bold mt-1 text-gray-800">
										{item.value}
									</h2>
									<p className="text-gray-400 text-xs mt-1">{item.desc}</p>
								</div>

								<Icon3D variant={item.variant} size="md">
									{item.icon}
								</Icon3D>
							</div>
						))}
					</div>

					<div className="bg-white rounded-2xl shadow-sm overflow-hidden">
						<div className="p-5 bg-[#7AB2B2]/10 flex items-center justify-between">
							<div className="flex items-center gap-3">
								<Icon3D variant="teal" size="md">
									<UserCog size={20} strokeWidth={2.5} />
								</Icon3D>

								<div>
									<h2 className="text-gray-800 text-xl font-bold">
										Manajemen User
									</h2>
									<p className="text-gray-500 text-xs mt-1">
										Kelola data user aplikasi presensi event
									</p>
								</div>
							</div>
							<button
								onClick={handleExport}
								disabled={isLoading || filtered.length === 0}
								className="px-4 py-2 border-2 border-[#3EBDAF] rounded-xl text-[#2D7EA0] text-sm font-semibold hover:bg-[#7AB2B2]/10 disabled:opacity-50 disabled:hover:bg-transparent transition-colors flex items-center gap-2"
							>
								<Download size={15} strokeWidth={2.5} />
								Export Data
							</button>
						</div>

						<div className="p-5">
							<SearchInput
								leadingIcon={<Search size={16} className="text-gray-400" />}
								wrapperClassName="flex items-center gap-2 w-full px-4 py-2.5 border border-gray-200 rounded-xl mb-4 focus-within:border-[#3EBDAF] bg-white"
								placeholder="Cari nama atau email..."
								value={search}
								onValueChange={setSearch}
								className="w-full bg-transparent outline-none text-sm text-gray-800 placeholder-gray-400"
							/>

							{feedback && (
								<div
									className={`mb-4 rounded-xl px-4 py-3 text-xs font-medium ${
										feedback.type === "success"
											? "bg-green-50 text-green-700 border border-green-100"
											: "bg-red-50 text-red-600 border border-red-100"
									}`}
								>
									{feedback.message}
								</div>
							)}

							{isError && (
								<div className="text-center py-8">
									<div className="flex justify-center mb-3">
										<Icon3D variant="red" size="md">
											<AlertCircle size={20} strokeWidth={2.5} />
										</Icon3D>
									</div>
									<p className="text-sm text-red-500 font-medium">
										Gagal memuat data user
									</p>
									<p className="text-xs text-gray-400 mt-1">
										Data belum bisa dimuat. Periksa koneksi, lalu coba lagi.
									</p>
								</div>
							)}

							{!isError && (
								<div className="overflow-x-auto">
									<table className="w-full">
										<thead className="bg-[#7AB2B2]/20">
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
														className="text-left p-3 text-xs font-semibold text-gray-700"
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
														className="text-center py-8 text-gray-400"
													>
														<div className="flex justify-center mb-3">
															<Icon3D variant="gray" size="md">
																<Users size={20} strokeWidth={2.5} />
															</Icon3D>
														</div>
														<p className="text-xs">
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
														<td className="p-3">
															<div className="flex items-center gap-2">
																<div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#7AB2B2] to-[#3EBDAF] text-white flex items-center justify-center text-xs font-bold flex-shrink-0">
																	{user.name?.[0]?.toUpperCase() ?? "U"}
																</div>
																<span className="font-semibold text-gray-800 text-sm">
																	{user.name}
																</span>
															</div>
														</td>
														<td className="p-3 text-gray-500 text-xs">
															{user.email}
														</td>
														<td className="p-3">
															<span className="px-2.5 py-1 bg-[#7AB2B2]/20 text-cyan-700 rounded-lg text-xs font-medium">
																{formatLabel(user.role)}
															</span>
														</td>
														<td className="p-3">
															<span
																className={`px-2.5 py-1 rounded-lg text-xs font-medium ${getStatusClass(user.status)}`}
															>
																{formatLabel(user.status)}
															</span>
														</td>
														<td className="p-3 text-gray-500 text-xs">
															{formatDate(user.created_at)}
														</td>
														<td className="p-3">
															<div className="flex gap-1.5">
																<button
																	onClick={() => setSelected(user)}
																	className="p-1.5 hover:bg-[#7AB2B2]/10 rounded-lg transition-colors text-[#2D7EA0]"
																	title="Edit"
																	aria-label={`Edit ${user.name}`}
																>
																	<Edit3 size={15} strokeWidth={2.5} />
																</button>
																<button
																	onClick={() => handleDelete(user)}
																	disabled={deleteUser.isPending}
																	className="p-1.5 hover:bg-red-50 rounded-lg transition-colors text-red-400 disabled:opacity-50"
																	title="Hapus"
																	aria-label={`Hapus ${user.name}`}
																>
																	<Trash2 size={15} strokeWidth={2.5} />
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
								<div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100">
									<p className="text-xs text-gray-400">
										Menampilkan {filtered.length} dari {users.length} user
									</p>
									<div className="flex gap-1.5">
										<button className="px-3 py-1.5 border border-gray-200 rounded-lg text-xs text-gray-500 hover:bg-gray-50 transition-colors">
											Sebelumnya
										</button>
										<button className="px-3 py-1.5 bg-[#2D7EA0] text-white rounded-lg text-xs font-medium">
											1
										</button>
										<button className="px-3 py-1.5 border border-gray-200 rounded-lg text-xs text-gray-500 hover:bg-gray-50 transition-colors">
											Berikutnya
										</button>
									</div>
								</div>
							)}
						</div>
					</div>

					<footer className="mt-6 text-center text-gray-400 text-xs">
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
