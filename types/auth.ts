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
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data: {
    user: AlumniUser;
    access_token: string;
    token_type: string;
  };
}

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
  email_verified_at?: string | null;
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