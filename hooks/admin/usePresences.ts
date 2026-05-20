import { useQuery } from "@tanstack/react-query";
import { fetchAPI } from "@/lib/api";

// GET semua presensi
export function usePresences(eventId?: number) {
  return useQuery({
    queryKey: ["presences", eventId ?? "all"],
    queryFn: () =>
      fetchAPI(eventId ? `/presences?event_id=${eventId}` : "/presences"),
  });
}

// GET presensi per alumni
export function usePresencesByUser(userId: number) {
  return useQuery({
    queryKey: ["presences", "user", userId],
    queryFn: () => fetchAPI(`/presences?user_id=${userId}`),
    enabled: !!userId,
  });
}