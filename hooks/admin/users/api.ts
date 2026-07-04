import { fetchAPI } from "@/lib/api";
import type {
	BulkUpdateUserStatusResponse,
	BulkUserTargetStatus,
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

function getLastPage(response: UsersResponse) {
	if (
		!Array.isArray(response) &&
		response.data &&
		!Array.isArray(response.data)
	) {
		return response.data.last_page ?? 1;
	}

	return 1;
}

export async function getUsers() {
	const firstPage = (await fetchAPI(
		"/admin/users?per_page=100&page=1",
	)) as UsersResponse;
	const lastPage = getLastPage(firstPage);

	if (lastPage <= 1) return normalizeUsers(firstPage);

	const remainingPages = await Promise.all(
		Array.from({ length: lastPage - 1 }, (_, index) => index + 2).map(
			async (page) =>
				(await fetchAPI(
					`/admin/users?per_page=100&page=${page}`,
				)) as UsersResponse,
		),
	);

	return [firstPage, ...remainingPages].flatMap(normalizeUsers);
}

export function updateUser(id: number, data: UpdateUserPayload) {
	return fetchAPI(`/users/${id}`, {
		method: "PUT",
		body: JSON.stringify(data),
	});
}

export function deleteUser(id: number) {
	return fetchAPI(`/users/${id}`, { method: "DELETE" });
}

export function updateUserStatus(id: number, status: UserStatus) {
	return fetchAPI(`/admin/users/${id}/status`, {
		method: "PATCH",
		body: JSON.stringify({ status }),
	}) as Promise<UpdateUserStatusResponse>;
}

export function bulkUpdateUserStatus(
	userIds: number[],
	status: BulkUserTargetStatus,
) {
	return fetchAPI("/admin/users/bulk-status", {
		method: "PATCH",
		body: JSON.stringify({ user_ids: userIds, status }),
	}) as Promise<BulkUpdateUserStatusResponse>;
}
