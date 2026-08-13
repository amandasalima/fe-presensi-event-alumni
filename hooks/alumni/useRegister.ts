import { useMutation } from "@tanstack/react-query";
import api from "@/lib/api";
import type { RegisterPayload, RegisterAuthResponse } from "@/types/auth";
import type { AxiosError } from "axios";

async function registerFn(payload: RegisterPayload): Promise<RegisterAuthResponse> {
  const dataToSend = {
    first_name: payload.first_name,
    last_name: payload.last_name,
    gender: payload.gender,
    email: payload.email,
    phone: payload.phone,
    graduation_year: payload.graduation_year,
    birth_date: payload.birth_date,
    password: payload.password,
    password_confirmation: payload.password_confirmation,
    role: "alumni",
    domicile_province_code: payload.domicile_province_code,
    domicile_city_code: payload.domicile_city_code,
    domicile_district_code: payload.domicile_district_code,
    domicile_village_code: payload.domicile_village_code,
    domicile_postal_code: payload.domicile_postal_code,
    domicile_address: payload.domicile_address,
  };
  const { data } = await api.post<RegisterAuthResponse>("/auth/register", dataToSend);
  return data;
}

export function useRegister() {
  return useMutation<
    RegisterAuthResponse,
    AxiosError<{ message: string; errors?: Record<string, string[]> }>,
    RegisterPayload
  >({
    mutationFn: registerFn,
  });
}
