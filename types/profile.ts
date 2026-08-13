export interface RegionInfo {
  code: string;
  name: string;
}

export interface Domicile {
  province?: RegionInfo | null;
  city?: RegionInfo | null;
  district?: RegionInfo | null;
  village?: RegionInfo | null;
  postal_code?: string | null;
  address?: string | null;
}

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
  domicile?: Domicile | null;
}

// email & role tidak boleh diubah oleh alumni
export type UpdateProfilePayload = Partial<
  Pick<AlumniProfile, "first_name" | "last_name" | "gender" | "phone" | "graduation_year" | "birth_date">
> & {
  domicile_province_code?: string | null;
  domicile_city_code?: string | null;
  domicile_district_code?: string | null;
  domicile_village_code?: string | null;
  domicile_postal_code?: string | null;
  domicile_address?: string | null;
};