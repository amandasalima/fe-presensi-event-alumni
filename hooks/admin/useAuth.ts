import { useMutation } from "@tanstack/react-query";
import { fetchAPI } from "@/lib/api";
import { startHeartbeat, stopHeartbeat } from "@/lib/heartbeat";
import type { AdminAuthResponse } from "@/types/auth";

// Login admin
export function useLogin() {
  return useMutation<AdminAuthResponse, Error, { email: string; password: string }>({
    mutationFn: (credentials) =>
      fetchAPI("/login", {
        method: "POST",
        body: JSON.stringify(credentials),
      }),
    onSuccess: (data) => {
      sessionStorage.setItem("access_token", data.token);
      sessionStorage.setItem("role", data.user.role);
      // Fallback lama jika dibutuhkan
      localStorage.setItem("access_token", data.token);
      localStorage.setItem("role", data.user.role);
      
      startHeartbeat();
    },
  });
}

// Logout
export function useLogout() {
  return useMutation({
    mutationFn: () =>
      fetchAPI("/logout", { method: "POST" }),
    onSuccess: () => {
      stopHeartbeat();
      sessionStorage.removeItem("access_token");
      sessionStorage.removeItem("role");
      sessionStorage.removeItem("token_type");
      sessionStorage.removeItem("user");
      
      localStorage.removeItem("access_token");
      localStorage.removeItem("token");
      localStorage.removeItem("role");
    },
  });
}