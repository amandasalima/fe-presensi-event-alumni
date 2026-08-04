import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import { startHeartbeat } from "@/lib/heartbeat";
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

        // Selalu simpan di sessionStorage (hilang saat browser ditutup)
        sessionStorage.setItem("alumni_token", token);

        // Jika "ingat saya" dicentang, simpan juga di localStorage
        if (variables.remember) {
          localStorage.setItem("alumni_token", token);
        }

        // Mulai heartbeat untuk menjaga token tetap hidup
        startHeartbeat();

        router.push("/alumni/main/dashboard");
      },
    }
  );
}
