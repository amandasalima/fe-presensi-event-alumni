import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import type { AuthResponse } from "@/types/auth";
import type { AxiosError } from "axios";

interface GoogleAuthPayload {
  credential: string; // Google ID token from OAuth flow
}

async function googleAuthFn(payload: GoogleAuthPayload): Promise<AuthResponse> {
  const { data } = await api.post<AuthResponse>("/alumni/auth/google", payload);
  return data;
}

export function useGoogleAuth() {
  const router = useRouter();

  return useMutation<AuthResponse, AxiosError<{ message: string }>, GoogleAuthPayload>(
    {
      mutationFn: googleAuthFn,
      onSuccess: (data) => {
        localStorage.setItem("alumni_token", data.token);
        router.push("/dashboard");
      },
    }
  );
}