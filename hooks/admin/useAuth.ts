import { useMutation } from "@tanstack/react-query";
import { fetchAPI } from "@/lib/api";
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
      localStorage.setItem("token", data.token);
      localStorage.setItem("role", data.user.role);
    },
  });
}

// Logout
export function useLogout() {
  return useMutation({
    mutationFn: () =>
      fetchAPI("/logout", { method: "POST" }),
    onSuccess: () => {
      localStorage.removeItem("token");
      localStorage.removeItem("role");
    },
  });
}