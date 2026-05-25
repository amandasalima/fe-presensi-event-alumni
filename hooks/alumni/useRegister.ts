import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import type { RegisterPayload, AuthResponse } from "@/types/auth";
import type { AxiosError } from "axios";

async function registerFn(payload: RegisterPayload): Promise<AuthResponse> {
  const { data } = await api.post<AuthResponse>("/auth/register", payload);
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
      // Persist token from response.data.access_token
      const token = response.data.access_token;
      localStorage.setItem("alumni_token", token);
      router.push("/alumni/dashboard");
    },
  });
}