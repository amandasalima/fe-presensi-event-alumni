import { useMutation } from "@tanstack/react-query";
import api from "@/lib/api";
import type { RegisterPayload, RegisterAuthResponse } from "@/types/auth";
import type { AxiosError } from "axios";

async function registerFn(payload: RegisterPayload): Promise<RegisterAuthResponse> {
  // Kirim field baru sesuai database yang sudah diupdate
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
