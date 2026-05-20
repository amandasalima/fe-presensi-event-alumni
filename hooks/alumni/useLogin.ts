import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import type { LoginPayload, AuthResponse } from "@/types/auth";
import type { AxiosError } from "axios";

async function loginFn(payload: LoginPayload): Promise<AuthResponse> {
  const { data } = await api.post<AuthResponse>("/alumni/login", payload);
  return data;
}

export function useLogin() {
  const router = useRouter();

  return useMutation<AuthResponse, AxiosError<{ message: string }>, LoginPayload>(
    {
      mutationFn: loginFn,
      onSuccess: (data, variables) => {
        // Persist token
        if (variables.remember) {
          localStorage.setItem("alumni_token", data.token);
        } else {
          sessionStorage.setItem("alumni_token", data.token);
          localStorage.setItem("alumni_token", data.token);
        }
        router.push("/dashboard");
      },
    }
  );
}