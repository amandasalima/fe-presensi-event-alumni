import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchAPI } from "@/lib/api";

// GET semua alumni
export function useAlumni() {
  return useQuery({
    queryKey: ["alumni"],
    queryFn: () => fetchAPI("/users"),
  });
}

// GET satu alumni by ID
export function useAlumniById(id: number) {
  return useQuery({
    queryKey: ["alumni", id],
    queryFn: () => fetchAPI(`/users/${id}`),
    enabled: !!id,
  });
}

// POST tambah alumni baru
export function useCreateAlumni() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: unknown) =>
      fetchAPI("/users", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["alumni"] });
    },
  });
}

// PUT update alumni
export function useUpdateAlumni() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: unknown }) =>
      fetchAPI(`/users/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["alumni"] });
    },
  });
}

// DELETE alumni
export function useDeleteAlumni() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) =>
      fetchAPI(`/users/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["alumni"] });
    },
  });
}