export interface User {
	id: number;
	name: string;
	email: string;
	phone?: string | null;
	gender?: string | null;
	graduation_year?: string | null;
	birth_date?: string | null;
	role: string;
	status: string;
	created_at: string;
}

export type UsersResponse = User[] | { data?: User[]; users?: User[] };

export type UpdateUserPayload = Pick<
	User,
	| "name"
	| "email"
	| "phone"
	| "gender"
	| "graduation_year"
	| "birth_date"
	| "role"
	| "status"
>;
