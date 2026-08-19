// TypeScript Interfaces for Google OAuth

// API Response Types
export interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
  errors?: Record<string, string[]>;
}

// OAuth Redirect Response
export interface OAuthRedirectResponse {
  authorization_url: string;
}

// Registration Callback Response
export interface RegistrationCallbackResponse {
  temp_token: string;
  user_data: {
    email: string;
    first_name: string;
    last_name: string;
  };
}

// Login Response
export interface LoginResponse {
  user: User;
  access_token: string;
  token_type: string;
}

// User Type
export interface User {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  role: "alumni" | "admin";
  status: "pending" | "active" | "rejected" | "inactive";
  auth_provider: "email" | "google";
  google_linked: boolean;
  has_password: boolean;
  graduation_year: number;
  birth_date: string;
  gender: "Laki-laki" | "Perempuan";
  avatar_url: string | null;
  admin_level: string | null;
  created_at: string;
  updated_at: string;
  domicile: Domicile | null;
}

// Domicile Type
export interface Domicile {
  province: { code: string; name: string };
  city: { code: string; name: string };
  district: { code: string; name: string };
  village: { code: string; name: string };
  postal_code: string;
  address: string;
}

// Registration Complete Request
export interface RegistrationCompleteRequest {
  temp_token: string;
  phone: string;
  graduation_year: number;
  birth_date: string;
  gender: "Laki-laki" | "Perempuan";
  domicile_province_code?: string;
  domicile_city_code?: string;
  domicile_district_code?: string;
  domicile_village_code?: string;
  domicile_postal_code?: string;
  domicile_address?: string;
}

// Error Type
export interface ApiError {
  success: false;
  message: string;
  errors?: Record<string, string[]>;
}
