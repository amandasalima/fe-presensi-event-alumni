import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchAPI } from "@/lib/api";

// GET semua riwayat broadcast
export function useBroadcast() {
  return useQuery({
    queryKey: ["broadcast"],
    queryFn: () => fetchAPI("/broadcast"),
  });
}

// GET satu broadcast by ID
export function useBroadcastById(id: number) {
  return useQuery({
    queryKey: ["broadcast", id],
    queryFn: () => fetchAPI(`/broadcast/${id}`),
    enabled: !!id,
  });
}

// POST kirim broadcast baru
export function useCreateBroadcast() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: unknown) =>
      fetchAPI("/broadcast", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["broadcast"] });
    },
  });
}

// DELETE riwayat broadcast
export function useDeleteBroadcast() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) =>
      fetchAPI(`/broadcast/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["broadcast"] });
    },
  });
}