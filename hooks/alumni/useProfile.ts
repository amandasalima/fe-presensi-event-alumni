import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import type { AlumniProfile, UpdateProfilePayload } from "@/types/profile";

/* ─── Query Keys ──────────────────────────────────────────── */
export const profileKeys = {
  all: ["profile"] as const,
  detail: () => [...profileKeys.all, "detail"] as const,
};

/* ─── Fetch profile dari GET /auth/me ─────────────────────── */
async function fetchProfile(): Promise<AlumniProfile> {
  const { data } = await api.get("/auth/me");
  // response: { success: true, data: { user: {...} } }
  return data.data.user;
}

export function useProfile() {
  return useQuery({
    queryKey: profileKeys.detail(),
    queryFn: fetchProfile,
    staleTime: 1000 * 60 * 5, // 5 menit
    retry: 1,
  });
}

/* ─── Update profile via PUT /auth/profile ────────────────── */
async function updateProfile(payload: UpdateProfilePayload): Promise<AlumniProfile> {
  const { data } = await api.put("/auth/profile", payload);
  return data.data.user;
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateProfile,
    onSuccess: (updatedUser) => {
      queryClient.setQueryData(profileKeys.detail(), updatedUser);
    },
  });
}

/* ─── Upload avatar via POST /auth/profile/avatar ────────── */
async function uploadAvatar(file: File): Promise<{ avatar_url: string }> {
  const formData = new FormData();
  formData.append("avatar", file);

  const { data } = await api.post("/auth/profile/avatar", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data.data;
}

export function useUploadAvatar() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: uploadAvatar,
    onSuccess: ({ avatar_url }) => {
      queryClient.setQueryData<AlumniProfile>(profileKeys.detail(), (old) =>
        old ? { ...old, avatar_url } : old
      );
    },
  });
}