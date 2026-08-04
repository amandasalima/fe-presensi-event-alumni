import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import { stopHeartbeat } from "@/lib/heartbeat";
import { CURRENT_USER_KEY } from "./useCurrentUser";

async function logoutFn(): Promise<void> {
  await api.post("/alumni/logout");
}

export function useLogout() {
  const router = useRouter();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: logoutFn,
    onSettled: () => {
      stopHeartbeat();
      localStorage.removeItem("alumni_token");
      sessionStorage.removeItem("alumni_token");
      queryClient.removeQueries({ queryKey: CURRENT_USER_KEY });
      router.push("/login");
    },
  });
}