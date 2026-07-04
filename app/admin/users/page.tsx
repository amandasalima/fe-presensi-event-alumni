"use client";

import { useState, type ReactNode } from "react";
import {
	Download,
	Edit3,
	Trash2,
	X,
	Users,
	UserCheck,
	Clock3,
	CalendarPlus,
	UserCog,
	Search,
	AlertCircle,
} from "lucide-react";
import AdminSidebar from "@/app/components/AdminSidebar";
import AdminHeader from "@/app/components/AdminHeader";
import ConfirmDialog from "@/app/components/ConfirmDialog";
import FeedbackToast from "@/app/components/FeedbackToast";
import { FormInput, FormSelect } from "@/app/components/FormControl";
import SearchInput from "@/app/components/SearchInput";
import type {
	UpdateUserPayload,
	User,
	UserStatus,
} from "@/hooks/admin/users";
import {
	type UserStatusAction,
	type UserStatusTarget,
	useUsersPage,
} from "./_hooks/useUsersPage";
import {
	formatDate,
	formatLabel,
	getUserPhone,
	getStatusClass,
	getStatusLabel,
	isAdminUser,
} from "./_utils/userFormatters";

const ROLE_OPTIONS = ["alumni", "user"];
const STATUS_OPTIONS: Array<{ value: UserStatus; label: string }> = [
	{ value: "pending", label: "Menunggu Persetujuan" },
	{ value: "active", label: "Aktif" },
	{ value: "inactive", label: "Nonaktif" },
	{ value: "rejected", label: "Ditolak" },
];

const STATUS_CONFIRMATIONS: Record<
	UserStatusAction,
	{ title: string; message: string; confirmLabel: string; tone: "danger" | "default" }
> = {
	approve: {
		title: "Setujui pengguna?",
		message: "Yakin ingin menyetujui pengguna ini?",
		confirmLabel: "Setujui",
		tone: "default",
	},
	reject: {
		title: "Tolak pengguna?",
		message: "Yakin ingin menolak pengguna ini?",
		confirmLabel: "Tolak",
		tone: "danger",
	},
	deactivate: {
		title: "Nonaktifkan pengguna?",
		message: "Yakin ingin menonaktifkan pengguna ini?",
		confirmLabel: "Nonaktifkan",
		tone: "danger",
	},
	activate: {
		title: "Aktifkan pengguna?",
		message: "Yakin ingin mengaktifkan pengguna ini?",
		confirmLabel: "Aktifkan",
		tone: "default",
	},
};
const GENDER_OPTIONS = ["Laki-laki", "Perempuan"];

type EditUserForm = {
	name: string;
	email: string;
	phone: string;
	gender: string;
	graduation_year: string;
	birth_date: string;
	role: string;
	status: UserStatus;
};

function getKnownUserStatus(status?: UserStatus | null): UserStatus {
	return status ?? "pending";
}

function getInputValue(value?: string | null) {
	return value ?? "";
}

function getDateInputValue(value?: string | null) {
	if (!value) return "";
	if (/^\d{4}-\d{2}-\d{2}/.test(value)) return value.slice(0, 10);

	const date = new Date(value);
	if (Number.isNaN(date.getTime())) return "";

	return date.toISOString().slice(0, 10);
}

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
					{[1, 2, 3, 4, 5, 6, 7, 8].map((j) => (
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
	const [form, setForm] = useState<EditUserForm>({
		name: getInputValue(initial.name),
		email: getInputValue(initial.email),
		phone: getInputValue(initial.phone),
		gender: getInputValue(initial.gender),
		graduation_year: getInputValue(initial.graduation_year),
		birth_date: getDateInputValue(initial.birth_date),
		role: getInputValue(initial.role) || "user",
		status: getKnownUserStatus(initial.status),
	});
	const genderOptions = Array.from(
		new Set([...GENDER_OPTIONS, getInputValue(initial.gender)]),
	).filter(Boolean);
	const roleOptions = Array.from(
		new Set([...ROLE_OPTIONS, initial.role]),
	).filter(Boolean);
	const set = <K extends keyof EditUserForm>(key: K, value: EditUserForm[K]) =>
		setForm((current) => ({ ...current, [key]: value }));

	return (
		<div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
			<div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
				<div className="p-6 border-b border-gray-100 flex items-center justify-between">
					<h3 className="font-semibold text-gray-800 text-lg">Ubah Pengguna</h3>
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
					<div>
						<label className="text-xs font-medium text-gray-600 mb-1 block">
							Nomor Telepon
						</label>
						<FormInput
							value={form.phone}
							onChange={(e) => set("phone", e.target.value)}
							className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#7AB2B2]"
						/>
					</div>
					<div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
						<div>
							<label className="text-xs font-medium text-gray-600 mb-1 block">
								Jenis Kelamin
							</label>
							<FormSelect
								value={form.gender}
								onChange={(e) => set("gender", e.target.value)}
								className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#7AB2B2] bg-white"
							>
								<option value="">Pilih jenis kelamin</option>
								{genderOptions.map((gender) => (
									<option key={gender} value={gender}>
										{gender}
									</option>
								))}
							</FormSelect>
						</div>
						<div>
							<label className="text-xs font-medium text-gray-600 mb-1 block">
								Tahun Lulus / Angkatan
							</label>
							<FormInput
								value={form.graduation_year}
								onChange={(e) => set("graduation_year", e.target.value)}
								inputMode="numeric"
								className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#7AB2B2]"
							/>
						</div>
					</div>
					<div>
						<label className="text-xs font-medium text-gray-600 mb-1 block">
							Tanggal Lahir
						</label>
						<FormInput
							type="date"
							value={form.birth_date}
							onChange={(e) => set("birth_date", e.target.value)}
							className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#7AB2B2]"
						/>
					</div>
					<div className="grid grid-cols-2 gap-3">
						<div>
							<label className="text-xs font-medium text-gray-600 mb-1 block">
								Peran
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
								onChange={(e) =>
									set("status", e.target.value as UserStatus)
								}
								className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#7AB2B2] bg-white"
							>
								{STATUS_OPTIONS.map((status) => (
									<option key={status.value} value={status.value}>
										{status.label}
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

function UserStatusActions({
	user,
	onRequest,
	isLoading,
}: {
	user: User;
	onRequest: (target: UserStatusTarget) => void;
	isLoading: boolean;
}) {
	if (isAdminUser(user) || !user.status) return null;

	const buttonClass =
		"rounded-lg border px-2.5 py-1.5 text-[11px] font-semibold transition disabled:cursor-not-allowed disabled:opacity-50";

	if (user.status === "pending") {
		return (
			<>
				<button
					type="button"
					onClick={() =>
						onRequest({ user, status: "active", action: "approve" })
					}
					disabled={isLoading}
					className={`${buttonClass} border-green-200 text-green-700 hover:bg-green-50`}
				>
					Setujui
				</button>
				<button
					type="button"
					onClick={() =>
						onRequest({ user, status: "rejected", action: "reject" })
					}
					disabled={isLoading}
					className={`${buttonClass} border-red-200 text-red-600 hover:bg-red-50`}
				>
					Tolak
				</button>
			</>
		);
	}

	if (user.status === "active") {
		return (
			<button
				type="button"
				onClick={() =>
					onRequest({ user, status: "inactive", action: "deactivate" })
				}
				disabled={isLoading}
				className={`${buttonClass} border-gray-200 text-gray-600 hover:bg-gray-50`}
			>
				Nonaktifkan
			</button>
		);
	}

	if (user.status === "inactive") {
		return (
			<button
				type="button"
				onClick={() =>
					onRequest({ user, status: "active", action: "activate" })
				}
				disabled={isLoading}
				className={`${buttonClass} border-teal-200 text-[#2D7EA0] hover:bg-[#7AB2B2]/10`}
			>
				Aktifkan
			</button>
		);
	}

	if (user.status === "rejected") {
		return (
			<button
				type="button"
				onClick={() =>
					onRequest({ user, status: "active", action: "approve" })
				}
				disabled={isLoading}
				className={`${buttonClass} border-green-200 text-green-700 hover:bg-green-50`}
			>
				Setujui Ulang
			</button>
		);
	}

	return null;
}

export default function UsersPage() {
	const {
		allVisibleSelected,
		bulkActionLoading,
		cancelDelete,
		cancelStatusUpdate,
		clearSelectedUsers,
		confirmDelete,
		confirmStatusUpdate,
		deleteUser,
		deleteTarget,
		feedback,
		filtered,
		handleDelete,
		handleExport,
		handleSubmit,
		isBulkSelectable,
		isError,
		isLoading,
		requestStatusUpdate,
		runBulkAction,
		search,
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
	} = useUsersPage();
	const statusTabs = [
		{ value: "all" as const, label: "Semua", count: users.length },
		{
			value: "pending" as const,
			label: "Menunggu Persetujuan",
			count: stats.pendingUsers,
		},
		{ value: "active" as const, label: "Aktif", count: stats.activeUsers },
		{
			value: "inactive" as const,
			label: "Nonaktif",
			count: stats.inactiveUsers,
		},
		{
			value: "rejected" as const,
			label: "Ditolak",
			count: stats.rejectedUsers,
		},
	];
	const statusConfirmation = statusTarget
		? STATUS_CONFIRMATIONS[statusTarget.action]
		: STATUS_CONFIRMATIONS.approve;

	return (
		<div className="h-screen bg-gray-100 flex overflow-hidden">
			<AdminSidebar />

			<div className="flex-1 ml-56 flex flex-col h-screen">
				<AdminHeader title="Kelola Pengguna" />

				<main className="flex-1 overflow-y-auto p-5">
					<div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mb-5">
						{[
							{
								title: "Total Pengguna",
								value: isLoading ? "..." : users.length,
								desc: "Pengguna terdaftar",
								icon: <Users size={20} strokeWidth={2.5} />,
								variant: "teal" as const,
							},
							{
								title: "Aktif",
								value: isLoading ? "..." : stats.activeUsers,
								desc: "Pengguna aktif",
								icon: <UserCheck size={20} strokeWidth={2.5} />,
								variant: "green" as const,
							},
							{
								title: "Menunggu Persetujuan",
								value: isLoading ? "..." : stats.pendingUsers,
								desc: "Perlu ditinjau admin",
								icon: <Clock3 size={20} strokeWidth={2.5} />,
								variant: "yellow" as const,
							},
							{
								title: "Bulan Ini",
								value: isLoading ? "..." : stats.monthUsers,
								desc: "Pengguna baru",
								icon: <CalendarPlus size={20} strokeWidth={2.5} />,
								variant: "blue" as const,
							},
						].map((item) => (
							<div
								key={item.title}
								className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4"
							>
								<p className="text-gray-500 text-xs">{item.title}</p>
								<div className="flex items-center gap-3 mt-1">
									<Icon3D variant={item.variant} size="md">
										{item.icon}
									</Icon3D>
									<h2 className="text-3xl font-bold text-gray-800">
										{item.value}
									</h2>
								</div>
								<p className="text-gray-400 text-xs mt-1">{item.desc}</p>
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
										Manajemen Pengguna
									</h2>
									<p className="text-gray-500 text-xs mt-1">
										Kelola data pengguna aplikasi presensi event
									</p>
								</div>
							</div>
							<div className="flex items-center gap-2">
								{(["excel", "pdf"] as const).map((format) => (
									<button
										key={format}
										onClick={() => handleExport(format)}
										disabled={isLoading || filtered.length === 0}
										className="px-4 py-2 border-2 border-[#3EBDAF] rounded-xl text-[#2D7EA0] text-sm font-semibold hover:bg-[#7AB2B2]/10 disabled:opacity-50 disabled:hover:bg-transparent transition-colors flex items-center gap-2"
									>
										<Download size={15} strokeWidth={2.5} />
										{format === "excel" ? "Excel" : "PDF"}
									</button>
								))}
							</div>
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

							<div className="mb-4 flex flex-wrap gap-2 rounded-xl bg-gray-100 p-1">
								{statusTabs.map((tab) => (
									<button
										type="button"
										key={tab.value}
										onClick={() => setStatusFilter(tab.value)}
										className={`rounded-lg px-3 py-2 text-xs font-semibold transition ${
											statusFilter === tab.value
												? "bg-white text-[#2D7EA0] shadow-sm"
												: "text-gray-500 hover:text-gray-700"
										}`}
									>
										{tab.label} ({tab.count})
									</button>
								))}
							</div>

							{selectedUsers.length > 0 && (
								<div className="mb-4 flex flex-col gap-3 rounded-xl border border-teal-100 bg-[#7AB2B2]/10 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
									<p className="text-sm font-semibold text-[#236175]">
										{bulkActionLoading
											? "Memproses..."
											: `${selectedUsers.length} pengguna dipilih`}
									</p>
									<div className="flex flex-wrap gap-2">
										<button
											type="button"
											onClick={() => runBulkAction("approve")}
											disabled={bulkActionLoading || selectedUsers.length === 0}
											className="rounded-lg bg-[#2D7EA0] px-3 py-2 text-xs font-semibold text-white transition hover:bg-[#236175] disabled:cursor-not-allowed disabled:opacity-50"
										>
											Setujui
										</button>
										<button
											type="button"
											onClick={() => runBulkAction("deactivate")}
											disabled={bulkActionLoading || selectedUsers.length === 0}
											className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-semibold text-gray-600 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
										>
											Nonaktifkan
										</button>
										<button
											type="button"
											onClick={() => runBulkAction("reject")}
											disabled={bulkActionLoading || selectedUsers.length === 0}
											className="rounded-lg border border-red-200 bg-white px-3 py-2 text-xs font-semibold text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
										>
											Tolak
										</button>
										<button
											type="button"
											onClick={clearSelectedUsers}
											disabled={bulkActionLoading}
											className="rounded-lg px-3 py-2 text-xs font-semibold text-gray-500 transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-50"
										>
											Batal Pilih
										</button>
									</div>
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
										Gagal memuat data pengguna
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
												<th className="w-10 p-3 text-left">
													<input
														type="checkbox"
														checked={allVisibleSelected}
														onChange={toggleSelectAll}
														disabled={
															bulkActionLoading ||
															!filtered.some(isBulkSelectable)
														}
														aria-label="Pilih semua pengguna yang tampil"
														aria-checked={
															allVisibleSelected
																? true
																: someVisibleSelected
																	? "mixed"
																	: false
														}
														title="Pilih semua pengguna yang tampil"
														className="h-4 w-4 rounded border-gray-300 accent-[#2D7EA0] disabled:cursor-not-allowed disabled:opacity-50"
													/>
												</th>
												{[
													"Nama",
													"Email",
													"Nomor Telepon",
													"Peran",
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
												colSpan={8}
														className="text-center py-8 text-gray-400"
													>
														<div className="flex justify-center mb-3">
															<Icon3D variant="gray" size="md">
																<Users size={20} strokeWidth={2.5} />
															</Icon3D>
														</div>
														<p className="text-xs">
															{search
														? "Pengguna tidak ditemukan"
														: "Belum ada data pengguna"}
														</p>
													</td>
												</tr>
											) : (
										filtered.map((user) => {
											const canSelect = isBulkSelectable(user);
											const selectionTitle = isAdminUser(user)
												? "Admin tidak dapat diproses secara massal"
												: canSelect
													? `Pilih ${user.name}`
													: "Akun Anda sendiri tidak dapat diproses secara massal";

											return (
												<tr
													key={user.id}
													className={`border-b transition-colors hover:bg-gray-50 ${
														selectedUserIds.has(user.id) ? "bg-teal-50/60" : ""
													}`}
												>
													<td className="p-3">
														<input
															type="checkbox"
															checked={selectedUserIds.has(user.id)}
															onChange={() => toggleUserSelection(user)}
															disabled={bulkActionLoading || !canSelect}
															aria-label={selectionTitle}
															title={selectionTitle}
															className="h-4 w-4 rounded border-gray-300 accent-[#2D7EA0] disabled:cursor-not-allowed disabled:opacity-40"
														/>
													</td>
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
														<td className="p-3 text-gray-500 text-xs">
															{getUserPhone(user)}
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
																{getStatusLabel(user.status)}
															</span>
														</td>
														<td className="p-3 text-gray-500 text-xs">
															{formatDate(user.created_at)}
														</td>
														<td className="p-3">
															<div className="flex flex-wrap gap-1.5">
																<UserStatusActions
																	user={user}
																	onRequest={requestStatusUpdate}
																	isLoading={
																		updateUserStatus.isPending &&
																		statusTarget?.user.id === user.id
																	}
																/>
																<button
																	onClick={() => setSelected(user)}
																	className="p-1.5 hover:bg-[#7AB2B2]/10 rounded-lg transition-colors text-[#2D7EA0]"
														title="Ubah"
														aria-label={`Ubah ${user.name}`}
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
											);
										})
											)}
										</tbody>
									</table>
								</div>
							)}

							{!isLoading && !isError && filtered.length > 0 && (
								<div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100">
									<p className="text-xs text-gray-400">
										Menampilkan {filtered.length} dari {users.length} pengguna
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
						© 2026 Sistem Presensi Event Berbasis QR - Pesantren
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

			<ConfirmDialog
				isOpen={!!statusTarget}
				title={statusConfirmation.title}
				message={statusConfirmation.message}
				confirmLabel={statusConfirmation.confirmLabel}
				tone={statusConfirmation.tone}
				loading={updateUserStatus.isPending}
				onCancel={cancelStatusUpdate}
				onConfirm={confirmStatusUpdate}
			/>

			<ConfirmDialog
				isOpen={!!deleteTarget}
				title="Hapus pengguna?"
				message={
					deleteTarget
						? `Pengguna "${deleteTarget.name}" akan dihapus permanen dari daftar.`
						: "Pengguna ini akan dihapus permanen dari daftar."
				}
				confirmLabel="Hapus"
				loading={deleteUser.isPending}
				onCancel={cancelDelete}
				onConfirm={confirmDelete}
			/>

			{feedback && (
				<FeedbackToast type={feedback.type} message={feedback.message} />
			)}
		</div>
	);
}
