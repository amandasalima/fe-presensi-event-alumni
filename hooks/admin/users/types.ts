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
	role: string;
	status?: UserStatus | null;
	created_at: string;
}

export type RawUser = Omit<User, "name" | "status"> & {
	name?: string | null;
	status?: string | null;
	angkatan?: string | null;
};

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
	name: string;
	email: string;
	phone?: string | null;
	gender?: string | null;
	graduation_year?: string | null;
	birth_date?: string | null;
	role: string;
	status: UserStatus;
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
