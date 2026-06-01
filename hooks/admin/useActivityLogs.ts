import { useQuery } from "@tanstack/react-query";
import { fetchAPI } from "@/lib/api";

export interface ActivityLog {
  id: number;
  user_id: number | null;
  action: string;
  description: string;
  created_at: string;
  user?: {
    id: number;
    first_name: string;
    last_name: string | null;
    email: string;
  } | null;
}

export function useActivityLogs() {
  return useQuery<ActivityLog[]>({
    queryKey: ["admin", "activity-logs"],
    queryFn: async () => {
      const response = await fetchAPI("/admin/activity-logs");
      return response.data || [];
    },
  });
}
