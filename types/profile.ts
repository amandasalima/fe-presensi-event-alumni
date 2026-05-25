// types/profile.ts

export interface AlumniProfile {
  id: number;
  first_name: string;
  last_name: string;
  gender: "Laki-laki" | "Perempuan";
  email: string;
  phone: string;
  graduation_year: string | number;
  birth_date: string;        // YYYY-MM-DD
  role: string;
  avatar_url?: string | null;
  email_verified_at?: string | null;
  created_at?: string;
  updated_at?: string;
}

// email & role tidak boleh diubah oleh alumni
export type UpdateProfilePayload = Partial<
  Pick<AlumniProfile, "first_name" | "last_name" | "gender" | "phone" | "graduation_year" | "birth_date">
>;