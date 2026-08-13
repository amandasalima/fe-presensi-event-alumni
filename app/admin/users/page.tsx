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
	Clock,
	CalendarPlus,
	Calendar,
	MapPin,
	CheckCircle,
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
import DomicileFormFields from "@/app/components/DomicileFormFields";
import {
	useProvinces,
	useCities,
	useDistricts,
	useVillages,
} from "@/hooks/useRegions";
import type {
	UpdateUserPayload,
	User,
	UserStatus,
} from "@/hooks/admin/users";
import {
	type UserSortKey,
	type UserStatusAction,
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

const BULK_ACTION_BY_STATUS: Partial<
	Record<
		UserStatus,
		{ action: UserStatusAction; label: string; className: string }
	>
> = {
	pending: {
		action: "approve",
		label: "Setujui Semua",
		className: "bg-[#2D7EA0] text-white hover:bg-[#236175]",
	},
	active: {
		action: "deactivate",
		label: "Nonaktifkan Semua",
		className: "border border-gray-200 bg-white text-gray-600 hover:bg-gray-50",
	},
	inactive: {
		action: "activate",
		label: "Aktifkan Semua",
		className: "bg-[#2D7EA0] text-white hover:bg-[#236175]",
	},
	rejected: {
		action: "approve",
		label: "Setujui Ulang Semua",
		className: "bg-[#2D7EA0] text-white hover:bg-[#236175]",
	},
};

const GENDER_OPTIONS = ["Laki-laki", "Perempuan"];
const USER_TABLE_HEADERS: Array<{ label: string; sortKey: UserSortKey }> = [
	{ label: "Nama", sortKey: "name" },
	{ label: "Email", sortKey: "email" },
	{ label: "Nomor Telepon", sortKey: "phone" },
	{ label: "Peran", sortKey: "role" },
	{ label: "Status", sortKey: "status" },
	{ label: "Tanggal Dibuat", sortKey: "created_at" },
];

type EditUserForm = {
	first_name: string;
	last_name: string;
	email: string;
	phone: string;
	gender: string;
	graduation_year: string;
	birth_date: string;
	status: UserStatus;
	domicile_province_code: string;
	domicile_city_code: string;
	domicile_district_code: string;
	domicile_village_code: string;
	domicile_postal_code: string;
	domicile_address: string;
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

type UserWithAvatar = User & {
	avatar_url?: string | null;
};

function getUserAvatarUrl(user: User) {
	return (user as UserWithAvatar).avatar_url?.trim() || null;
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

function TableSkeleton({ showSelection }: { showSelection: boolean }) {
	const columnCount = showSelection ? 8 : 7;

	return (
		<>
			{[1, 2, 3, 4, 5].map((i) => (
				<tr key={i} className="border-b border-gray-200 animate-pulse">
					{Array.from({ length: columnCount }, (_, index) => index + 1).map(
						(j) => (
							<td key={j} className="p-5">
								<div className="h-4 bg-gray-100 rounded w-3/4" />
							</td>
						),
					)}
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

function validateDomicile(values: Partial<EditUserForm>) {
	const errors: Record<string, string> = {};

	if (values.domicile_city_code && !values.domicile_province_code) {
		errors.domicile_province_code = "Provinsi wajib dipilih.";
	}
	if (values.domicile_district_code && !values.domicile_city_code) {
		errors.domicile_city_code = "Kabupaten/kota wajib dipilih.";
	}
	if (values.domicile_village_code && !values.domicile_district_code) {
		errors.domicile_district_code = "Kecamatan wajib dipilih.";
	}
	if (values.domicile_postal_code && values.domicile_postal_code.length > 10) {
		errors.domicile_postal_code = "Kode pos maksimal 10 karakter.";
	}
	if (values.domicile_address && values.domicile_address.length > 1000) {
		errors.domicile_address = "Alamat maksimal 1000 karakter.";
	}

	return errors;
}

function EditUserModal({
	initial,
	onClose,
	onSubmit,
	loading,
}: EditUserModalProps) {
	const [form, setForm] = useState<EditUserForm>({
		first_name: getInputValue(initial.first_name),
		last_name: getInputValue(initial.last_name),
		email: getInputValue(initial.email),
		phone: getInputValue(initial.phone),
		gender: getInputValue(initial.gender),
		graduation_year: getInputValue(initial.graduation_year),
		birth_date: getDateInputValue(initial.birth_date),
		status: getKnownUserStatus(initial.status),
		domicile_province_code: getInputValue(initial.domicile?.province?.code),
		domicile_city_code: getInputValue(initial.domicile?.city?.code),
		domicile_district_code: getInputValue(initial.domicile?.district?.code),
		domicile_village_code: getInputValue(initial.domicile?.village?.code),
		domicile_postal_code: getInputValue(initial.domicile?.postal_code),
		domicile_address: getInputValue(initial.domicile?.address),
	});
	const genderOptions = Array.from(
		new Set([...GENDER_OPTIONS, getInputValue(initial.gender)]),
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
					<div className="grid grid-cols-2 gap-3">
						<div>
							<label className="text-xs font-medium text-gray-600 mb-1 block">
								Nama Depan
							</label>
							<FormInput
								value={form.first_name}
								onChange={(e) => set("first_name", e.target.value)}
								className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#7AB2B2]"
							/>
						</div>
						<div>
							<label className="text-xs font-medium text-gray-600 mb-1 block">
								Nama Belakang
							</label>
							<FormInput
								value={form.last_name}
								onChange={(e) => set("last_name", e.target.value)}
								className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#7AB2B2]"
							/>
						</div>
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
					<div className="border-t border-gray-100 pt-4 mt-2">
						<h4 className="text-sm font-semibold text-gray-700 mb-3">
							Domisili Saat Ini (Opsional)
						</h4>
						<DomicileFormFields
							values={form}
							onChange={(field, value) => set(field, value)}
							errors={validateDomicile(form)}
							theme="admin"
						/>
					</div>
				</div>
				<div className="p-6 border-t border-gray-100 flex gap-3">
					<button
						onClick={onClose}
						className="flex-1 bg-red-500 hover:bg-red-600 text-white py-2.5 rounded-xl text-sm font-medium transition-colors flex items-center justify-center active:scale-[0.98]"
					>
						Batal
					</button>

					<button
						onClick={() => {
							const errors = validateDomicile(form);
							if (Object.keys(errors).length === 0) {
								onSubmit(form);
							}
						}}
						disabled={loading || Object.keys(validateDomicile(form)).length > 0}
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


type DummyPresence = {
	id: number;
	event: {
		event_title: string;
		event_date: string;
		location: string;
	};
	scanned_at: string;
};

const DUMMY_PRESENCES: DummyPresence[] = [
	{
		id: 1,
		event: {
			event_title: "Silaturahmi Alumni",
			event_date: "2026-08-10",
			location: "Aula Pondok Pesantren",
		},
		scanned_at: "2026-08-10T08:15:00",
	},
	{
		id: 2,
		event: {
			event_title: "Reuni Akbar",
			event_date: "2026-07-20",
			location: "Lapangan Utama",
		},
		scanned_at: "2026-07-20T07:45:00",
	},
	{
		id: 3,
		event: {
			event_title: "Kajian dan Temu Alumni",
			event_date: "2026-06-15",
			location: "Masjid Pondok Pesantren",
		},
		scanned_at: "2026-06-15T09:10:00",
	},
];

function formatHistoryDate(date: string) {
	return new Date(date).toLocaleDateString("id-ID", {
		day: "numeric",
		month: "long",
		year: "numeric",
	});
}

function formatHistoryScannedAt(date: string) {
	const value = new Date(date);
	const formattedDate = value.toLocaleDateString("id-ID", {
		day: "numeric",
		month: "long",
		year: "numeric",
	});
	const formattedTime = value.toLocaleTimeString("id-ID", {
		hour: "2-digit",
		minute: "2-digit",
	});

	return `${formattedDate} • ${formattedTime} WIB`;
}

function UserPresenceHistoryModal({
	user,
	onClose,
}: {
	user: User;
	onClose: () => void;
}) {
	return (
		<div
			className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 p-4"
			onClick={onClose}
			role="presentation"
		>
			<div
				className="w-full max-w-2xl overflow-hidden rounded-2xl bg-white shadow-xl"
				onClick={(event) => event.stopPropagation()}
				role="dialog"
				aria-modal="true"
				aria-labelledby="presence-history-title"
			>
				<div className="flex items-center justify-between border-b border-gray-100 p-5">
					<div className="min-w-0">
						<h2
							id="presence-history-title"
							className="text-lg font-bold text-gray-900"
						>
							Riwayat Kehadiran
						</h2>
						<p className="mt-0.5 truncate text-sm font-medium text-gray-600">
							{user.name}
						</p>
						<p className="truncate text-xs text-gray-400">{user.email}</p>
					</div>

					<button
						type="button"
						onClick={onClose}
						className="rounded-lg p-2 text-gray-400 transition hover:bg-gray-100 hover:text-gray-700"
						aria-label="Tutup riwayat kehadiran"
					>
						<X size={18} />
					</button>
				</div>

				{user.domicile && (
					<div className="border-b border-gray-100 bg-[#7AB2B2]/5 px-5 py-3 text-xs text-gray-700">
						<span className="font-semibold text-gray-800">Domisili: </span>
						{user.domicile.address || "—"}, {user.domicile.village?.name || ""}, {user.domicile.district?.name || ""}, {user.domicile.city?.name || ""}, {user.domicile.province?.name || ""} (Kode Pos: {user.domicile.postal_code || "—"})
					</div>
				)}

				<div className="border-b border-gray-100 bg-[#7AB2B2]/10 px-5 py-3">
					<p className="text-xs font-semibold text-[#236175]">
						Total kehadiran sementara: {DUMMY_PRESENCES.length} event
					</p>
					<p className="mt-0.5 text-[11px] text-gray-500">
						Data ini masih dummy dan nanti akan diganti dengan data dari API.
					</p>
				</div>

				<div className="max-h-[65vh] overflow-y-auto p-5">
					<div className="space-y-3">
						{DUMMY_PRESENCES.map((presence) => (
							<div
								key={presence.id}
								className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm"
							>
								<div className="flex items-start justify-between gap-4">
									<div className="min-w-0 space-y-2">
										<h3 className="text-sm font-bold text-gray-800">
											{presence.event.event_title}
										</h3>

										<div className="flex items-center gap-2 text-xs text-gray-500">
											<Calendar size={14} className="shrink-0" />
											<span>
												{formatHistoryDate(presence.event.event_date)}
											</span>
										</div>

										<div className="flex items-center gap-2 text-xs text-gray-500">
											<MapPin size={14} className="shrink-0" />
											<span>{presence.event.location}</span>
										</div>
									</div>

									<span className="flex shrink-0 items-center gap-1 rounded-lg border border-emerald-100 bg-emerald-50 px-2 py-1 text-[10px] font-bold text-emerald-600">
										<CheckCircle size={12} />
										Hadir
									</span>
								</div>

								<div className="mt-4 flex items-start gap-2 border-t border-gray-100 pt-3 text-xs text-gray-500">
									<Clock
										size={14}
										className="mt-0.5 shrink-0 text-teal-600"
									/>
									<span>
										Diverifikasi:{" "}
										<span className="font-medium text-gray-700">
											{formatHistoryScannedAt(presence.scanned_at)}
										</span>
									</span>
								</div>
							</div>
						))}
					</div>
				</div>
			</div>
		</div>
	);
}

export default function UsersPage() {
	const {
		allVisibleSelected,
		bulkActionLoading,
		cancelDelete,
		clearSelectedUsers,
		confirmDelete,
		currentPage,
		deleteUser,
		deleteTarget,
		feedback,
		goToPage,
		handleDelete,
		handleExport,
		handleSort,
		handleSubmit,
		isBulkSelectable,
		isError,
		isLoading,
		pageEnd,
		pageStart,
		paginatedUsers,
		paginationRange,
		perPage,
		runBulkAction,
		search,
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
		someVisibleSelected,
		toggleSelectAll,
		toggleUserSelection,
		totalFilteredUsers,
		totalPages,
		updateUser,
		users,
		closeModal,
		provinceFilter,
		cityFilter,
		districtFilter,
		villageFilter,
		setProvinceFilter,
		setCityFilter,
		setDistrictFilter,
		setVillageFilter,
	} = useUsersPage();
	const [historyUser, setHistoryUser] = useState<User | null>(null);

	const { data: provinces = [] } = useProvinces();
	const { data: cities = [] } = useCities(provinceFilter);
	const { data: districts = [] } = useDistricts(cityFilter);
	const { data: villages = [] } = useVillages(districtFilter);

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
	const bulkAction =
		statusFilter === "all" ? null : BULK_ACTION_BY_STATUS[statusFilter] ?? null;

	const handleStatusTabChange = (
		value: (typeof statusTabs)[number]["value"],
	) => {
		clearSelectedUsers();
		setStatusFilter(value);
	};


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
										disabled={isLoading || totalFilteredUsers === 0}
										className="flex items-center gap-2 rounded-xl bg-[#2D7EA0] px-4 py-2 text-sm font-semibold text-white transition-all duration-200 ease-out hover:-translate-y-0.5 hover:brightness-110 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0 disabled:hover:brightness-100 disabled:hover:shadow-none"
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

							<div className="mb-4 grid grid-cols-1 sm:grid-cols-4 gap-3 border border-gray-200 rounded-2xl p-4 bg-gray-50/50">
								<div>
									<label className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider block mb-1">
										Filter Provinsi
									</label>
									<FormSelect
										value={provinceFilter}
										onChange={(e) => setProvinceFilter(e.target.value)}
										className="w-full border border-gray-200 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none bg-white"
									>
										<option value="">Semua Provinsi</option>
										{provinces.map((p) => (
											<option key={p.code} value={p.code}>
												{p.name}
											</option>
										))}
									</FormSelect>
								</div>
								<div>
									<label className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider block mb-1">
										Filter Kota/Kabupaten
									</label>
									<FormSelect
										value={cityFilter}
										onChange={(e) => setCityFilter(e.target.value)}
										disabled={!provinceFilter}
										className="w-full border border-gray-200 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none bg-white disabled:opacity-50"
									>
										<option value="">Semua Kota/Kabupaten</option>
										{cities.map((c) => (
											<option key={c.code} value={c.code}>
												{c.name}
											</option>
										))}
									</FormSelect>
								</div>
								<div>
									<label className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider block mb-1">
										Filter Kecamatan
									</label>
									<FormSelect
										value={districtFilter}
										onChange={(e) => setDistrictFilter(e.target.value)}
										disabled={!cityFilter}
										className="w-full border border-gray-200 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none bg-white disabled:opacity-50"
									>
										<option value="">Semua Kecamatan</option>
										{districts.map((d) => (
											<option key={d.code} value={d.code}>
												{d.name}
											</option>
										))}
									</FormSelect>
								</div>
								<div>
									<label className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider block mb-1">
										Filter Desa/Kelurahan
									</label>
									<FormSelect
										value={villageFilter}
										onChange={(e) => setVillageFilter(e.target.value)}
										disabled={!districtFilter}
										className="w-full border border-gray-200 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none bg-white disabled:opacity-50"
									>
										<option value="">Semua Desa/Kelurahan</option>
										{villages.map((v) => (
											<option key={v.code} value={v.code}>
												{v.name}
											</option>
										))}
									</FormSelect>
								</div>
							</div>

							<div className="mb-4 flex flex-wrap gap-2 rounded-xl bg-gray-100 p-1">
								{statusTabs.map((tab) => (
									<button
										type="button"
										key={tab.value}
										onClick={() => handleStatusTabChange(tab.value)}
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

							{bulkAction && selectedUsers.length > 0 && (
								<div className="mb-4 flex flex-col gap-3 rounded-xl border border-teal-100 bg-[#7AB2B2]/10 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
									<p className="text-sm font-semibold text-[#236175]">
										{bulkActionLoading
											? "Memproses..."
											: `${selectedUsers.length} pengguna dipilih`}
									</p>
									<div className="flex flex-wrap gap-2">
										<button
											type="button"
											onClick={() => runBulkAction(bulkAction.action)}
											disabled={bulkActionLoading || selectedUsers.length === 0}
											className={`rounded-lg px-3 py-2 text-xs font-semibold transition disabled:cursor-not-allowed disabled:opacity-50 ${bulkAction.className}`}
										>
											{bulkAction.label}
										</button>
										<button
											type="button"
											onClick={clearSelectedUsers}
											disabled={bulkActionLoading}
											className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-semibold text-red-600 transition hover:border-red-300 hover:bg-red-100 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
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
								<div className="overflow-x-auto rounded-xl border border-gray-200">
									<table className="w-full overflow-hidden rounded-xl">
										<thead className="bg-[#7AB2B2]/20">
											<tr>
												{statusFilter !== "all" && (
													<th className="w-10 px-2.5 py-2 text-center">
														<input
															type="checkbox"
															checked={allVisibleSelected}
															onChange={toggleSelectAll}
															disabled={
																bulkActionLoading ||
																!paginatedUsers.some(isBulkSelectable)
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
												)}
												{USER_TABLE_HEADERS.map((header) => (
													<th
														key={header.sortKey}
														className={`px-2.5 py-2 text-[11px] font-semibold text-gray-700 ${
															["name", "email", "phone"].includes(header.sortKey)
																? "text-left"
																: "text-center"
														}`}
													>
														<button
															type="button"
															onClick={() => handleSort(header.sortKey)}
															className="inline-flex cursor-pointer items-center gap-1.5 rounded px-1 py-0.5 transition hover:bg-white/50 hover:text-[#236175]"
														>
															{header.label}
															<span
																className={
																	sortBy === header.sortKey
																		? "text-[#2D7EA0]"
																		: "text-gray-300"
																}
																aria-hidden="true"
															>
																{sortBy === header.sortKey
																	? sortDirection === "asc"
																		? "↑"
																		: "↓"
																	: "↕"}
															</span>
														</button>
													</th>
												))}
												<th className="px-2.5 py-2 text-center text-[11px] font-semibold text-gray-700">
													Aksi
												</th>
											</tr>
										</thead>
										<tbody>
											{isLoading ? (
												<TableSkeleton showSelection={statusFilter !== "all"} />
											) : totalFilteredUsers === 0 ? (
												<tr>
													<td
												colSpan={statusFilter === "all" ? 7 : 8}
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
										paginatedUsers.map((user, index) => {
											const canSelect = statusFilter !== "all" && isBulkSelectable(user);
											const avatarUrl = getUserAvatarUrl(user);
											const selectionTitle =
												statusFilter === "all"
													? "Pilih salah satu tab status untuk aksi massal"
													: isAdminUser(user)
														? "Admin tidak dapat diproses secara massal"
														: canSelect
															? `Pilih ${user.name}`
															: "Akun Anda sendiri tidak dapat diproses secara massal";

											return (
												<tr
													key={user.id}
													onClick={() => setHistoryUser(user)}
													className={`cursor-pointer border-b border-gray-200 transition-colors ${
														selectedUserIds.has(user.id)
															? "bg-blue-100 hover:bg-blue-200"
															: index % 2 === 0
																? "bg-white hover:bg-gray-100"
																: "bg-blue-50 hover:bg-blue-100"
													}`}
												>
													{statusFilter !== "all" && (
														<td className="p-3">
															<input
																type="checkbox"
																onClick={(event) => event.stopPropagation()}
																checked={selectedUserIds.has(user.id)}
																onChange={() => toggleUserSelection(user)}
																disabled={bulkActionLoading || !canSelect}
																aria-label={selectionTitle}
																title={selectionTitle}
																className="h-4 w-4 rounded border-gray-300 accent-[#2D7EA0] disabled:cursor-not-allowed disabled:opacity-40"
															/>
														</td>
													)}
												<td className="p-3">
															<div className="flex items-center gap-2">
																<div
																	className={`flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-cover bg-center text-[11px] font-bold text-white ${
																		avatarUrl
																			? "bg-gray-100 ring-1 ring-gray-200"
																			: "bg-gradient-to-br from-[#7AB2B2] to-[#3EBDAF]"
																	}`}
																	style={
																		avatarUrl
																			? { backgroundImage: `url("${avatarUrl}")` }
																			: undefined
																	}
																	aria-label={
																		avatarUrl ? `Foto profil ${user.name}` : undefined
																	}
																>
																	{!avatarUrl && (user.name?.[0]?.toUpperCase() ?? "U")}
																</div>
																<div className="flex flex-col">
																	<span className="text-xs font-semibold text-gray-800">
																		{user.name}
																	</span>
																	{user.domicile?.city?.name && (
																		<span className="text-[10px] text-gray-400 font-normal mt-0.5 flex items-center gap-0.5">
																			<MapPin size={8} className="text-gray-400 shrink-0" />
																			{user.domicile.city.name}, {user.domicile.province?.name}
																		</span>
																	)}
																</div>
															</div>
														</td>
														<td className="p-3 text-gray-500 text-xs">
															{user.email}
														</td>
														<td className="p-3 text-gray-500 text-xs">
															{getUserPhone(user)}
														</td>
														<td className="p-3 text-center">
															<span className="inline-block px-2.5 py-1 bg-[#7AB2B2]/20 text-cyan-700 rounded-lg text-xs font-medium">
																{formatLabel(user.role)}
															</span>
														</td>
														<td className="p-3 text-center">
															<span
																className={`inline-block px-2.5 py-1 rounded-lg text-xs font-medium ${getStatusClass(user.status)}`}
															>
																{getStatusLabel(user.status)}
															</span>
														</td>
														<td className="p-3 text-center text-gray-500 text-xs">
															{formatDate(user.created_at)}
														</td>
														<td className="p-3">
															<div className="flex flex-wrap justify-end gap-1.5">
																<button
																	onClick={(event) => {
																						event.stopPropagation();
																						setSelected(user);
																					}}
																	className="rounded-lg p-1 text-[#2D7EA0] transition-colors hover:bg-[#7AB2B2]/10"
														title="Ubah"
														aria-label={`Ubah ${user.name}`}
																>
																	<Edit3 size={14} strokeWidth={2.5} />
																</button>
																<button
																	onClick={(event) => {
																						event.stopPropagation();
																						handleDelete(user);
																					}}
																	disabled={deleteUser.isPending}
																	className="rounded-lg p-1 text-red-400 transition-colors hover:bg-red-50 disabled:opacity-50"
																	title="Hapus"
																	aria-label={`Hapus ${user.name}`}
																>
																	<Trash2 size={14} strokeWidth={2.5} />
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

							{!isLoading && !isError && totalFilteredUsers > 0 && (
								<div className="mt-4 flex flex-col gap-3 border-t border-gray-100 pt-3 lg:flex-row lg:items-center lg:justify-between">
									<div className="flex flex-wrap items-center gap-4">
										<p className="text-xs text-gray-500">
											Menampilkan {pageStart}-{pageEnd} dari {totalFilteredUsers}{" "}
											pengguna
										</p>
										<label className="flex items-center gap-2 text-xs text-gray-500">
											Tampilkan
											<FormSelect
												value={perPage}
												onChange={(event) => setPerPage(Number(event.target.value))}
												className="rounded-lg border border-gray-200 bg-white px-2 py-1.5 text-xs font-medium text-gray-700 outline-none focus:border-[#3EBDAF] focus:ring-2 focus:ring-[#7AB2B2]/20"
											>
												{[10, 25, 50, 100].map((value) => (
													<option key={value} value={value}>
														{value}
													</option>
												))}
											</FormSelect>
											data per halaman
										</label>
									</div>

									<nav
										aria-label="Navigasi halaman pengguna"
										className="flex flex-wrap items-center gap-1.5"
									>
										<button
											type="button"
											onClick={() => goToPage(currentPage - 1)}
											disabled={currentPage === 1}
											className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs text-gray-500 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
										>
											Sebelumnya
										</button>

										{paginationRange.map((item) =>
											typeof item === "number" ? (
												<button
													type="button"
													key={item}
													onClick={() => goToPage(item)}
													aria-current={item === currentPage ? "page" : undefined}
													className={`min-w-8 rounded-lg px-2.5 py-1.5 text-xs font-medium transition ${
														item === currentPage
															? "bg-[#2D7EA0] text-white"
															: "border border-gray-200 text-gray-500 hover:bg-gray-50"
													}`}
												>
													{item}
												</button>
											) : (
												<span
													key={item}
													className="px-1 text-xs text-gray-400"
												>
													…
												</span>
											),
										)}

										<button
											type="button"
											onClick={() => goToPage(currentPage + 1)}
											disabled={currentPage === totalPages}
											className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs text-gray-500 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
										>
											Berikutnya
										</button>
									</nav>
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

			{historyUser && (
				<UserPresenceHistoryModal
					user={historyUser}
					onClose={() => setHistoryUser(null)}
				/>
			)}

			{feedback && (
				<FeedbackToast type={feedback.type} message={feedback.message} />
			)}
		</div>
	);
}