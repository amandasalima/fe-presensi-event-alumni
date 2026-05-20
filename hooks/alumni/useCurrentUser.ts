import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";
import type { AlumniUser } from "@/types/auth";

export const CURRENT_USER_KEY = ["alumni", "me"] as const;

async function fetchCurrentUser(): Promise<AlumniUser> {
  const { data } = await api.get<AlumniUser>("/alumni/me");
  return data;
}

export function useCurrentUser() {
  return useQuery<AlumniUser>({
    queryKey: CURRENT_USER_KEY,
    queryFn: fetchCurrentUser,
    enabled: typeof window !== "undefined" && !!localStorage.getItem("alumni_token"),
    staleTime: 1000 * 60 * 5,
  });
}