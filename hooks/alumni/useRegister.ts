import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import type { RegisterPayload, AuthResponse } from "@/types/auth";
import type { AxiosError } from "axios";

async function registerFn(payload: RegisterPayload): Promise<AuthResponse> {
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
  console.log("Sending register data:", dataToSend);
  const { data } = await api.post<AuthResponse>("/auth/register", dataToSend);
  return data;
}

export function useRegister() {
  const router = useRouter();

  return useMutation<
    AuthResponse,
    AxiosError<{ message: string; errors?: Record<string, string[]> }>,
    RegisterPayload
  >({
    mutationFn: registerFn,
    onSuccess: (response) => {
      // Show success message
      alert("Registrasi berhasil! Silakan login dengan akun Anda.");
      
      // Redirect to login page
      router.push("/alumni/login");
    },
    onError: (error) => {
      console.error("Register error:", error.response?.data);
    },
  });
}