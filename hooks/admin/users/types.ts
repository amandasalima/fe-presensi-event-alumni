export interface User {
	id: number;
	name: string;
	email: string;
	role: string;
	status: string;
	created_at: string;
}

export type UsersResponse = User[] | { data?: User[]; users?: User[] };

export type UpdateUserPayload = Pick<User, "name" | "email" | "role" | "status">;
