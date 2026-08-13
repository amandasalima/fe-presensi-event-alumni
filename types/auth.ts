import type { Domicile } from "./profile";

export interface LoginPayload {
  email: string;
  password: string;
  remember?: boolean;
}

export interface RegisterPayload {
  first_name: string;
  last_name: string;
  gender: string;
  email: string;
  phone: string;
  graduation_year: string;
  birth_date: string;
  password: string;
  password_confirmation: string;
  domicile_province_code?: string;
  domicile_city_code?: string;
  domicile_district_code?: string;
  domicile_village_code?: string;
  domicile_postal_code?: string;
  domicile_address?: string;
}

export interface LoginAuthResponse {
  success: boolean;
  message: string;
  data: {
    user: AlumniUser;
    access_token: string;
    token_type: string;
  };
}

export interface RegisterAuthResponse {
  success: boolean;
  message: string;
  data: {
    user: AlumniUser;
    access_token?: string | null;
    token_type?: string | null;
  };
}

export type AuthResponse = LoginAuthResponse | RegisterAuthResponse;

export type UserStatus = "pending" | "active" | "inactive" | "rejected";

export interface AlumniUser {
  id: number;
  name: string;
  first_name?: string;
  last_name?: string;
  gender: string;
  email: string;
  phone: string;
  angkatan: string | null;
  graduation_year?: string | null;
  tanggal_lahir?: string | null;
  birth_date?: string | null;
  role: string;
  status?: UserStatus;
  email_verified_at?: string | null;
  created_at: string;
  updated_at: string;
  domicile?: Domicile | null;
}

export interface AdminUser {
  id: number;
  name: string;
  first_name?: string | null;
  last_name?: string | null;
  email: string;
  role: "admin";
  admin_level?: "super_admin" | "admin" | null;
  status?: "active" | "inactive" | null;
  created_at: string;
  updated_at: string;
}

export interface AdminAuthResponse {
  token: string;
  user: AdminUser;
}

export interface ApiError {
  message: string;
  errors?: Record<string, string[]>;
}
