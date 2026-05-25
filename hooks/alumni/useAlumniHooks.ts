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
    queryFn: async () => {
      if (typeof window !== "undefined") {
        const stored = localStorage.getItem("dummy_profile");
        if (stored) {
          try {
            return JSON.parse(stored);
          } catch (e) {
            console.error("Failed to parse stored dummy_profile", e);
          }
        }
      }

      let userProfile;
      try {
        const res = await fetchAPI("/auth/me");
        if (res?.data?.user) {
          const fullName = res.data.user.name || "";
          const parts = fullName.trim().split(" ");
          const firstName = parts[0] || "Alumni";
          const lastName = parts.slice(1).join(" ") || "";
          userProfile = {
            ...res.data.user,
            first_name: firstName,
            last_name: lastName,
          };
        }
      } catch (err) {
        console.warn("Failed to fetch profile, using mock profile:", err);
      }

      if (!userProfile) {
        userProfile = {
          id: 999,
          name: "Ahmad Alumni Dummy",
          first_name: "Ahmad",
          last_name: "Alumni Dummy",
          email: "ahmad@dummy.com",
          phone: "081234567890",
          angkatan: "2020",
          role: "alumni",
          gender: "L",
          status: "alumni",
        };
      }

      if (typeof window !== "undefined") {
        localStorage.setItem("dummy_profile", JSON.stringify(userProfile));
      }
      return userProfile;
    },
  });
}

// PUT update profil alumni
export function useUpdateMyProfile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: any) => {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      
      if (typeof window !== "undefined") {
        const stored = localStorage.getItem("dummy_profile");
        const current = stored ? JSON.parse(stored) : {};
        const updated = {
          ...current,
          ...data,
          name: `${data.first_name || ""} ${data.last_name || ""}`.trim(),
        };
        localStorage.setItem("dummy_profile", JSON.stringify(updated));
        return { success: true, data: updated };
      }
      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-profile"] });
    },
  });
}

// PUT ganti password alumni
export function useUpdateMyPassword() {
  return useMutation({
    mutationFn: async (data: { old_password: string; new_password: string }) => {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      return { success: true, message: "Password berhasil diperbarui secara lokal!" };
    },
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// EVENT — dipakai di halaman Dashboard, Daftar Event, Detail Event
// ─────────────────────────────────────────────────────────────────────────────

// Helper functions for frontend dummy events
const getDummyRegistered = (id: number, defaultVal: boolean): boolean => {
  if (typeof window === "undefined") return defaultVal;
  const stored = localStorage.getItem(`dummy_reg_${id}`);
  if (stored !== null) return stored === "true";
  return defaultVal;
};

const getDummyEvents = () => {
  const todayDateStr = new Date().toISOString().split("T")[0];
  const futureDate1 = new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];
  const futureDate2 = new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];

  return [
    {
      id: 9991,
      event_title: "Reuni Akbar Pondok Pesantren 2026",
      event_description: "Temu kangen alumni lintas angkatan pondok pesantren. Mari bernostalgia dan menjalin silaturahmi erat.",
      event_date: futureDate1,
      start_time: "08:00:00",
      end_time: "15:00:00",
      event_datetime: `${futureDate1}T08:00:00`,
      location: "Aula Utama Pondok Pesantren",
      quota: 500,
      remaining_quota: 120,
      is_registered: getDummyRegistered(9991, false),
      status_event: "active" as const,
      category: {
        id: 1,
        category_name: "Reuni",
      },
    },
    {
      id: 9992,
      event_title: "Kajian Bulanan & Doa Bersama",
      event_description: "Kajian keislaman rutin bulanan khusus alumni bersama jajaran pimpinan pondok pesantren.",
      event_date: futureDate2,
      start_time: "19:30:00",
      end_time: "21:30:00",
      event_datetime: `${futureDate2}T19:30:00`,
      location: "Masjid Jami' Pesantren",
      quota: 200,
      remaining_quota: 45,
      is_registered: getDummyRegistered(9992, true),
      status_event: "active" as const,
      category: {
        id: 2,
        category_name: "Pengajian",
      },
    },
    {
      id: 9993,
      event_title: "Workshop Karir & Sharing Alumni",
      event_description: "Sharing session dan workshop bimbingan karir oleh para alumni sukses untuk siswa aktif dan alumni muda.",
      event_date: todayDateStr,
      start_time: "09:00:00",
      end_time: "12:00:00",
      event_datetime: `${todayDateStr}T09:00:00`,
      location: "Gedung Serbaguna Lt. 2",
      quota: 100,
      remaining_quota: 15,
      is_registered: getDummyRegistered(9993, false),
      status_event: "active" as const,
      category: {
        id: 3,
        category_name: "Seminar",
      },
    },
  ];
};

// GET semua event yang tersedia (status aktif / mendatang)
export function useAlumniEvents() {
  return useQuery({
    queryKey: ["alumni-events"],
    queryFn: async () => {
      let backendEvents = [];
      try {
        const res = await fetchAPI("/events");
        backendEvents = res?.data?.events || [];
      } catch (err) {
        console.error("Failed to fetch events from backend, showing dummies only:", err);
      }

      // Map backend events to add event_datetime
      const mappedEvents = backendEvents.map((event: any) => ({
        ...event,
        event_datetime: `${event.event_date}T${event.start_time || "00:00:00"}`,
      }));

      return [...mappedEvents, ...getDummyEvents()];
    },
  });
}

// GET detail satu event by ID
export function useAlumniEventDetail(id: number) {
  return useQuery({
    queryKey: ["alumni-events", id],
    queryFn: async () => {
      // Intercept dummy events
      const dummy = getDummyEvents().find((e) => e.id === id);
      if (dummy) {
        const isReg = getDummyRegistered(id, dummy.is_registered);
        return {
          event: {
            ...dummy,
            is_registered: isReg,
          },
          remaining_quota: dummy.remaining_quota,
          is_registered: isReg,
          registration: isReg
            ? {
                status: "registered",
                registered_at: new Date().toISOString(),
              }
            : null,
        };
      }

      try {
        const res = await fetchAPI(`/events/${id}`);
        if (res?.data?.event) {
          // Map backend event datetime fallback
          res.data.event.event_datetime = `${res.data.event.event_date}T${res.data.event.start_time || "00:00:00"}`;
        }
        return res?.data;
      } catch (err) {
        console.warn(`Failed to fetch event detail for ID ${id}, returning null:`, err);
        return null;
      }
    },
    enabled: !!id,
  });
}

// POST daftar event
export function useRegisterEvent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      if (id >= 9990) {
        // Simulate registration delay and persist to localStorage
        await new Promise((resolve) => setTimeout(resolve, 800));
        if (typeof window !== "undefined") {
          localStorage.setItem(`dummy_reg_${id}`, "true");
        }
        return {
          success: true,
          message: "Pendaftaran berhasil! Sampai jumpa di event 🎉",
        };
      }
      return fetchAPI(`/events/${id}/register`, {
        method: "POST",
      });
    },
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ["alumni-events"] });
      queryClient.invalidateQueries({ queryKey: ["alumni-events", id] });
      queryClient.invalidateQueries({ queryKey: ["my-presences"] });
    },
  });
}

// DELETE batalkan pendaftaran event
export function useCancelRegistration() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      if (id >= 9990) {
        // Simulate cancellation delay and persist to localStorage
        await new Promise((resolve) => setTimeout(resolve, 800));
        if (typeof window !== "undefined") {
          localStorage.setItem(`dummy_reg_${id}`, "false");
        }
        return {
          success: true,
          message: "Pendaftaran berhasil dibatalkan",
        };
      }
      return fetchAPI(`/events/${id}/register`, {
        method: "DELETE",
      });
    },
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ["alumni-events"] });
      queryClient.invalidateQueries({ queryKey: ["alumni-events", id] });
      queryClient.invalidateQueries({ queryKey: ["my-presences"] });
    },
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// PRESENSI — dipakai di halaman Scan QR dan Riwayat Kehadiran
// ─────────────────────────────────────────────────────────────────────────────

// GET riwayat kehadiran alumni yang sedang login
export function useMyPresences() {
  return useQuery({
    queryKey: ["my-presences"],
    queryFn: async () => {
      try {
        const res = await fetchAPI("/presensi/history");
        return res?.data?.history || [];
      } catch (err) {
        console.warn("Failed to fetch presences, using mock history:", err);
        return [
          {
            id: 8881,
            event_id: 9992,
            scanned_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
            event: {
              event_title: "Kajian Bulanan & Doa Bersama",
              event_datetime: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
            },
          },
        ];
      }
    },
  });
}

// POST scan QR Code untuk presensi
// Kirim qr_token yang didapat dari scan kamera
export function useScanQR() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (qr_token: string) =>
      fetchAPI("/presensi/scan", {
        method: "POST",
        body: JSON.stringify({ qr_token }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-presences"] });
      queryClient.invalidateQueries({ queryKey: ["my-recommendations"] });
      queryClient.invalidateQueries({ queryKey: ["alumni-events"] });
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
    queryFn: async () => {
      try {
        const res = await fetchAPI("/alumni/recommendations");
        if (res?.data && res.data.length > 0) {
          return res.data.map((item: any) => ({
            ...item,
            event_datetime: item.event_datetime || `${item.event_date}T${item.start_time || "00:00:00"}`,
          }));
        }
      } catch (err) {
        console.warn("Failed to fetch recommendations, falling back to dummy recommendation:", err);
      }

      // Fallback recommendation
      const futureDate1 = new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];
      return [
        {
          id: 9991,
          event_title: "Reuni Akbar Pondok Pesantren 2026",
          event_datetime: `${futureDate1}T08:00:00`,
          location: "Aula Utama Pondok Pesantren",
        },
      ];
    },
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// NOTIFIKASI — dipakai di halaman Notifikasi dan badge di header
// ─────────────────────────────────────────────────────────────────────────────

// GET semua notifikasi alumni
export function useMyNotifications() {
  return useQuery({
    queryKey: ["my-notifications"],
    queryFn: async () => {
      try {
        const res = await fetchAPI("/alumni/notifications");
        return res || [];
      } catch (err) {
        console.warn("Failed to fetch notifications, using mock notifications:", err);
        return [
          {
            id: 7771,
            title: "Pendaftaran Reuni Akbar Dibuka",
            body: "Segera daftarkan diri Anda pada event Reuni Akbar Pondok Pesantren 2026. Kuota terbatas!",
            is_read: false,
          },
          {
            id: 7772,
            title: "Kehadiran Kajian Terverifikasi",
            body: "Terima kasih, kehadiran Anda pada Kajian Bulanan telah berhasil diverifikasi.",
            is_read: true,
          },
        ];
      }
    },
    refetchInterval: 60000, // auto refresh tiap 1 menit
  });
}

// GET jumlah notifikasi yang belum dibaca (untuk badge)
export function useUnreadCount() {
  return useQuery({
    queryKey: ["unread-count"],
    queryFn: async () => {
      try {
        const res = await fetchAPI("/alumni/notifications/unread-count");
        return res || { unread_count: 0 };
      } catch (err) {
        console.warn("Failed to fetch unread count, using mock:", err);
        return { unread_count: 1 };
      }
    },
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
    queryFn: async () => {
      try {
        return await fetchAPI("/alumni/faq");
      } catch (err) {
        console.warn("Failed to fetch FAQ, using mock:", err);
        return [
          {
            id: 1,
            question: "Bagaimana cara melakukan presensi?",
            answer: "Buka menu Scan QR pada aplikasi, lalu arahkan kamera ke QR Code yang disediakan panitia di lokasi acara.",
          },
          {
            id: 2,
            question: "Apakah saya bisa membatalkan pendaftaran event?",
            answer: "Ya, Anda dapat membatalkan pendaftaran melalui halaman detail event sebelum acara dimulai.",
          },
        ];
      }
    },
  });
}

// GET FAQ berdasarkan kategori
export function useFAQByCategory(category: string) {
  return useQuery({
    queryKey: ["faq", category],
    queryFn: async () => {
      try {
        return await fetchAPI(`/alumni/faq?category=${category}`);
      } catch (err) {
        console.warn(`Failed to fetch FAQ for category ${category}, using mock:`, err);
        return [
          {
            id: 1,
            question: "Bagaimana cara melakukan presensi?",
            answer: "Buka menu Scan QR pada aplikasi, lalu arahkan kamera ke QR Code yang disediakan panitia di lokasi acara.",
          },
        ];
      }
    },
    enabled: !!category,
  });
}