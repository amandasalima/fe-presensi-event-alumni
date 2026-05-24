import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import type { LoginPayload, AuthResponse } from "@/types/auth";
import type { AxiosError } from "axios";

async function loginFn(payload: LoginPayload): Promise<AuthResponse> {
  const { data } = await api.post<AuthResponse>("/auth/login", payload);
  return data;
}

export function useLogin() {
  const router = useRouter();

  return useMutation<AuthResponse, AxiosError<{ message: string }>, LoginPayload>(
    {
      mutationFn: loginFn,
      onSuccess: (response, variables) => {
        // Persist token from response.data.access_token
        const token = response.data.access_token;
        if (variables.remember) {
          localStorage.setItem("alumni_token", token);
        } else {
          sessionStorage.setItem("alumni_token", token);
          localStorage.setItem("alumni_token", token);
        }
        router.push("/alumni/dashboard");
      },
    }
  );
}