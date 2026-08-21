import type { Domicile } from "@/types/profile";

export type UserStatus = "pending" | "active" | "inactive" | "rejected";

export interface User {
	id: number;
	name: string;
	first_name?: string | null;
	last_name?: string | null;
	email: string;
	phone?: string | null;
	gender?: string | null;
	graduation_year?: string | null;
	birth_date?: string | null;
	avatar_url?: string | null;
	role: string;
	status?: UserStatus | null;
	status_reason?: string | null;
	created_at: string;
	domicile?: Domicile | null;
}

export type RawUser = Omit<User, "name" | "status" | "status_reason"> & {
	name?: string | null;
	status?: string | null;
	status_reason?: string | null;
	angkatan?: string | null;
};

export interface GetUsersParams {
	search?: string;
	status?: string;
	year?: string | number;
	event_id?: string | number;
	graduation_year?: string;
	angkatan?: string;
	domicile_province_code?: string;
	domicile_city_code?: string;
	domicile_district_code?: string;
	domicile_village_code?: string;
	sort_by?: string;
	sort_dir?: "asc" | "desc";
	per_page?: number;
	page?: number;
}

export interface PaginatedUsersResult {
	users: User[];
	total: number;
	current_page: number;
	last_page: number;
}

export type UsersResponse =
	| RawUser[]
	| {
			data?: RawUser[] | {
				users?: RawUser[];
				total?: number;
				current_page?: number;
				last_page?: number;
			};
			users?: RawUser[];
	  };

export type UpdateUserPayload = {
	first_name: string;
	last_name?: string | null;
	email: string;
	phone?: string | null;
	gender?: string | null;
	graduation_year?: string | null;
	birth_date?: string | null;
	status: UserStatus;
	status_reason?: string | null;
	domicile_province_code?: string | null;
	domicile_city_code?: string | null;
	domicile_district_code?: string | null;
	domicile_village_code?: string | null;
	domicile_postal_code?: string | null;
	domicile_address?: string | null;
};

export type UpdateUserStatusResponse = {
	success: boolean;
	message: string;
	data: {
		user: RawUser;
	};
};

export type BulkUserTargetStatus = Exclude<UserStatus, "pending">;

export type BulkUpdateUserStatusResponse = {
	success: boolean;
	message: string;
	data: {
		updated_count: number;
		skipped_count: number;
		status: BulkUserTargetStatus;
		updated_user_ids: number[];
		skipped_user_ids: number[];
	};
};
