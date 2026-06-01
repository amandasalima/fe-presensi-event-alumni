import { fetchAPI } from "@/lib/api";
import type { UpdateUserPayload, User, UsersResponse } from "./types";

export function normalizeUsers(response: UsersResponse): User[] {
	if (Array.isArray(response)) return response;
	if (Array.isArray(response.data)) return response.data;
	if (Array.isArray(response.users)) return response.users;
	return [];
}

export async function getUsers() {
	return normalizeUsers(await fetchAPI("/users"));
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
