import { fetchAPI } from "@/lib/api";
import type {
	BulkUpdateUserStatusResponse,
	BulkUserTargetStatus,
	GetUsersParams,
	PaginatedUsersResult,
	RawUser,
	UpdateUserPayload,
	UpdateUserStatusResponse,
	User,
	UsersResponse,
	UserStatus,
} from "./types";

const USER_STATUSES: UserStatus[] = [
	"pending",
	"active",
	"inactive",
	"rejected",
];

function normalizeStatus(status?: string | null): UserStatus | null {
	return USER_STATUSES.includes(status as UserStatus)
		? (status as UserStatus)
		: null;
}

function normalizeUser(user: RawUser): User {
	const fullName = [user.first_name, user.last_name]
		.filter(Boolean)
		.join(" ")
		.trim();

	return {
		...user,
		name: user.name?.trim() || fullName || user.email,
		graduation_year: user.graduation_year ?? user.angkatan ?? null,
		status: normalizeStatus(user.status),
	};
}

export function normalizeUsers(response: UsersResponse): User[] {
	let users: RawUser[] = [];

	if (Array.isArray(response)) users = response;
	else if (Array.isArray(response.data)) users = response.data;
	else if (response.data && Array.isArray(response.data.users)) {
		users = response.data.users;
	} else if (Array.isArray(response.users)) users = response.users;

	return users.map(normalizeUser);
}

export async function getUsers(params?: GetUsersParams): Promise<PaginatedUsersResult> {
	const query = new URLSearchParams();
	if (params) {
		Object.entries(params).forEach(([key, val]) => {
			if (val !== undefined && val !== null && val !== "") {
				query.append(key, String(val));
			}
		});
	}

	const queryString = query.toString();
	const endpoint = queryString ? `/admin/users?${queryString}` : "/admin/users";
	const response = (await fetchAPI(endpoint)) as UsersResponse;

	const users = normalizeUsers(response);

	let total = users.length;
	let current_page = 1;
	let last_page = 1;

	if (!Array.isArray(response) && response.data && !Array.isArray(response.data)) {
		total = response.data.total ?? users.length;
		current_page = response.data.current_page ?? 1;
		last_page = response.data.last_page ?? 1;
	}

	return {
		users,
		total,
		current_page,
		last_page,
	};
}

export function updateUser(id: number, data: UpdateUserPayload) {
	return fetchAPI(`/admin/users/${id}`, {
		method: "PUT",
		body: JSON.stringify(data),
	});
}

export function deleteUser(id: number) {
	return fetchAPI(`/admin/users/${id}`, { method: "DELETE" });
}

export function updateUserStatus(id: number, status: UserStatus, reason?: string) {
	return fetchAPI(`/admin/users/${id}/status`, {
		method: "PATCH",
		body: JSON.stringify({ status, reason }),
	}) as Promise<UpdateUserStatusResponse>;
}

export function bulkUpdateUserStatus(
	userIds: number[],
	status: BulkUserTargetStatus,
	reason?: string,
) {
	return fetchAPI("/admin/users/bulk-status", {
		method: "PATCH",
		body: JSON.stringify({ user_ids: userIds, status, reason }),
	}) as Promise<BulkUpdateUserStatusResponse>;
}
