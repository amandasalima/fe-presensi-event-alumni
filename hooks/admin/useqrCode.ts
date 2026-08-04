import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchAPI } from "@/lib/api";

type GenerateQrVariables = {
  eventId: number;
  data: {
    duration_days: number;
  };
};

// POST generate QR Code untuk event tertentu
export function useGenerateQR() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ eventId, data }: GenerateQrVariables) =>
      fetchAPI(`/admin/events/${eventId}/qr/generate`, {
        method: "POST",
        body: JSON.stringify(data),
      }),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["events"] });
      queryClient.invalidateQueries({ queryKey: ["qr-code", variables.eventId] });
    },
  });
}

// GET QR Code metadata untuk event tertentu
export function useQRCode(eventId: number) {
  return useQuery({
    queryKey: ["qr-code", eventId],
    queryFn: () => fetchAPI(`/admin/events/${eventId}/qr`),
    enabled: !!eventId,
  });
}

// DELETE / reset QR Code event
export function useResetQR() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (eventId: number) =>
      fetchAPI(`/admin/events/${eventId}/qr`, { method: "DELETE" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["events"] });
      queryClient.invalidateQueries({ queryKey: ["qr-code"] });
    },
  });
}
