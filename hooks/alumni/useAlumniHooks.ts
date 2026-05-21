import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchAPI } from "@/lib/api";

// ─────────────────────────────────────────────────────────────────────────────
// AUTH — dipakai di halaman login/register
// ─────────────────────────────────────────────────────────────────────────────

// Sudah ada di hooks/useAuth.ts:
// useLogin()    → POST /login
// useLogout()   → POST /logout

// ─────────────────────────────────────────────────────────────────────────────
// PROFIL ALUMNI — dipakai di halaman Profil
// ─────────────────────────────────────────────────────────────────────────────

// GET profil alumni yang sedang login
export function useMyProfile() {
  return useQuery({
    queryKey: ["my-profile"],
    queryFn: () => fetchAPI("/alumni/profile"),
  });
}

// PUT update profil alumni
export function useUpdateMyProfile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: unknown) =>
      fetchAPI("/alumni/profile", {
        method: "PUT",
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-profile"] });
    },
  });
}

// PUT ganti password alumni
export function useUpdateMyPassword() {
  return useMutation({
    mutationFn: (data: { old_password: string; new_password: string }) =>
      fetchAPI("/alumni/password", {
        method: "PUT",
        body: JSON.stringify(data),
      }),
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// EVENT — dipakai di halaman Dashboard, Daftar Event, Detail Event
// ─────────────────────────────────────────────────────────────────────────────

// GET semua event yang tersedia (status aktif / mendatang)
export function useAlumniEvents() {
  return useQuery({
    queryKey: ["alumni-events"],
    queryFn: () => fetchAPI("/alumni/events"),
  });
}

// GET detail satu event by ID
export function useAlumniEventDetail(id: number) {
  return useQuery({
    queryKey: ["alumni-events", id],
    queryFn: () => fetchAPI(`/alumni/events/${id}`),
    enabled: !!id,
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// PRESENSI — dipakai di halaman Scan QR dan Riwayat Kehadiran
// ─────────────────────────────────────────────────────────────────────────────

// GET riwayat kehadiran alumni yang sedang login
export function useMyPresences() {
  return useQuery({
    queryKey: ["my-presences"],
    queryFn: () => fetchAPI("/alumni/presences"),
  });
}

// POST scan QR Code untuk presensi
// Kirim qr_token yang didapat dari scan kamera
export function useScanQR() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (qr_token: string) =>
      fetchAPI("/alumni/presences/scan", {
        method: "POST",
        body: JSON.stringify({ qr_token }),
      }),
    onSuccess: () => {
      // Refresh riwayat presensi setelah scan berhasil
      queryClient.invalidateQueries({ queryKey: ["my-presences"] });
      queryClient.invalidateQueries({ queryKey: ["my-recommendations"] });
    },
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// REKOMENDASI — dipakai di halaman Dashboard dan Rekomendasi Event
// ─────────────────────────────────────────────────────────────────────────────

// GET rekomendasi event berdasarkan riwayat kehadiran (rule-based)
export function useMyRecommendations() {
  return useQuery({
    queryKey: ["my-recommendations"],
    queryFn: () => fetchAPI("/alumni/recommendations"),
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// NOTIFIKASI — dipakai di halaman Notifikasi dan badge di header
// ─────────────────────────────────────────────────────────────────────────────

// GET semua notifikasi alumni
export function useMyNotifications() {
  return useQuery({
    queryKey: ["my-notifications"],
    queryFn: () => fetchAPI("/alumni/notifications"),
    refetchInterval: 60000, // auto refresh tiap 1 menit
  });
}

// GET jumlah notifikasi yang belum dibaca (untuk badge)
export function useUnreadCount() {
  return useQuery({
    queryKey: ["unread-count"],
    queryFn: () => fetchAPI("/alumni/notifications/unread-count"),
    refetchInterval: 30000, // auto refresh tiap 30 detik
  });
}

// PUT tandai notifikasi sebagai sudah dibaca
export function useMarkAsRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) =>
      fetchAPI(`/alumni/notifications/${id}/read`, { method: "PUT" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-notifications"] });
      queryClient.invalidateQueries({ queryKey: ["unread-count"] });
    },
  });
}

// PUT tandai semua notifikasi sebagai sudah dibaca
export function useMarkAllAsRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () =>
      fetchAPI("/alumni/notifications/read-all", { method: "PUT" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-notifications"] });
      queryClient.invalidateQueries({ queryKey: ["unread-count"] });
    },
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// FAQ — dipakai di halaman FAQ
// ─────────────────────────────────────────────────────────────────────────────

// GET semua FAQ
export function useFAQ() {
  return useQuery({
    queryKey: ["faq"],
    queryFn: () => fetchAPI("/alumni/faq"),
  });
}

// GET FAQ berdasarkan kategori
export function useFAQByCategory(category: string) {
  return useQuery({
    queryKey: ["faq", category],
    queryFn: () => fetchAPI(`/alumni/faq?category=${category}`),
    enabled: !!category,
  });
}