import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import type { LoginPayload, LoginAuthResponse } from "@/types/auth";

async function loginFn(payload: LoginPayload): Promise<LoginAuthResponse> {
  const { data } = await api.post<LoginAuthResponse>("/auth/login", payload);

  if (!data.data?.access_token) {
    throw new Error("Token login tidak tersedia.");
  }

  return data;
}

export function useLogin() {
  const router = useRouter();

  return useMutation<LoginAuthResponse, Error, LoginPayload>(
    {
      mutationFn: loginFn,
      onSuccess: (response, variables) => {
        const token = response.data.access_token;
        if (variables.remember) {
          localStorage.setItem("alumni_token", token);
        } else {
          sessionStorage.setItem("alumni_token", token);
          localStorage.setItem("alumni_token", token);
        }
        router.push("/alumni/main/dashboard");
      },
    }
  );
}
