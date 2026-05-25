export interface LoginPayload {
  email: string;
  password: string;
  remember?: boolean;
}

export interface RegisterPayload {
  name: string;
  gender: string;
  email: string;
  phone: string;
  angkatan: string;
  password: string;
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
  gender: string;
  email: string;
  phone: string;
  angkatan: string | null;
  role: string;
  email_verified_at?: string | null;
  created_at: string;
  updated_at: string;
  tanggal_lahir?: string | null;
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