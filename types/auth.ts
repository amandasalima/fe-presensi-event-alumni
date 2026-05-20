export interface LoginPayload {
  email: string;
  password: string;
  remember?: boolean;
}

export interface RegisterPayload {
  first_name: string;
  last_name: string;
  email: string;
  graduation_year: number;
  phone: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  user: AlumniUser;
}

export interface AlumniUser {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  graduation_year: number;
  phone: string;
  avatar?: string;
  created_at: string;
  updated_at: string;
}

export interface AdminUser {
  id: number;
  name: string;
  email: string;
  role: "admin";
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