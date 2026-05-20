import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchAPI } from "@/lib/api";

// GET semua event
export function useEvents() {
  return useQuery({
    queryKey: ["events"],
    queryFn: () => fetchAPI("/events"),
  });
}

// GET satu event by ID
export function useEvent(id: number) {
  return useQuery({
    queryKey: ["events", id],
    queryFn: () => fetchAPI(`/events/${id}`),
    enabled: !!id,
  });
}

// POST buat event baru
export function useCreateEvent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: unknown) =>
      fetchAPI("/events", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["events"] });
    },
  });
}

// PUT update event
export function useUpdateEvent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: unknown }) =>
      fetchAPI(`/events/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["events"] });
    },
  });
}

// DELETE event
export function useDeleteEvent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) =>
      fetchAPI(`/events/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["events"] });
    },
  });
}

// POST generate QR untuk event
export function useGenerateQR() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (eventId: number) =>
      fetchAPI(`/events/${eventId}/generate-qr`, { method: "POST" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["events"] });
    },
  });
}