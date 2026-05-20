import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchAPI } from "@/lib/api";

// POST generate QR Code untuk event tertentu
export function useGenerateQR() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (eventId: number) =>
      fetchAPI(`/events/${eventId}/generate-qr`, { method: "POST" }),
    onSuccess: () => {
      // refresh list events supaya qr_token & qr_code_image ikut terupdate
      queryClient.invalidateQueries({ queryKey: ["events"] });
    },
  });
}

// GET QR Code image untuk event tertentu (kalau ada endpoint khusus)
export function useQRCode(eventId: number) {
  return useQuery({
    queryKey: ["qr-code", eventId],
    queryFn: () => fetchAPI(`/events/${eventId}/qr-code`),
    enabled: !!eventId,
  });
}

// DELETE / reset QR Code event
export function useResetQR() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (eventId: number) =>
      fetchAPI(`/events/${eventId}/qr-code`, { method: "DELETE" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["events"] });
      queryClient.invalidateQueries({ queryKey: ["qr-code"] });
    },
  });
}