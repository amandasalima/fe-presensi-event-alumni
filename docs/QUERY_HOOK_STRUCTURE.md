# Struktur Hooks, Query, dan Helper

Dokumen ini menjelaskan refactor struktur hooks agar query, mutation, helper, dan render page lebih mudah dibaca dan dirawat.

## Tujuan

- Memisahkan query, mutation, type, query key, dan normalizer agar file tidak terlalu panjang.
- Memisahkan logic state/handler halaman dari file render page.
- Memindahkan formatter, validator, exporter, dan kalkulasi reusable ke folder `_utils`.
- Menjaga import lama tetap kompatibel melalui file re-export.
- Membuat lokasi perubahan API lebih mudah ditemukan oleh developer lain.
- Mengurangi risiko perubahan UI tidak sengaja saat memperbaiki logic.

## Struktur Baru

```txt
app/
  admin/
    events/
      _hooks/
        useCreateEventForm.ts
        useEventBroadcastForm.ts
      _utils/
        eventFormatters.ts
    reports/
      _hooks/
        useReportsPage.ts
      _utils/
        reportFormatters.ts
      page.tsx
    settings/
      _hooks/
        useSettingsPage.ts
      _utils/
        waConfig.ts
      page.tsx
    users/
      _hooks/
        useUsersPage.ts
      _utils/
        userFormatters.ts
      page.tsx

hooks/
  admin/
    broadcast/
      api.ts
      index.ts
      queryKeys.ts
      types.ts
      useBroadcastMutations.ts
      useBroadcastQueries.ts
    events/
      api.ts
      index.ts
      normalizers.ts
      params.ts
      queryKeys.ts
      types.ts
      useEventMutations.ts
      useEventQueries.ts
    users/
      api.ts
      index.ts
      queryKeys.ts
      types.ts
      useUserMutations.ts
      useUserQueries.ts
    useBroadcast.ts
    useEvents.ts
    useUsers.ts
  alumni/
    queries/
      dummyEvents.ts
      events.ts
      faq.ts
      index.ts
      notifications.ts
      presences.ts
      profile.ts
      queryKeys.ts
      recommendations.ts
    useAlumniHooks.ts
```

## Aturan Penempatan

### App Page

- File `page.tsx` difokuskan untuk render UI, layout, dan komposisi komponen.
- State halaman, derived state, handler submit, handler delete, handler export, dan orchestration beberapa hooks diletakkan di `_hooks/use*Page.ts`.
- Helper reusable yang tidak bergantung pada React diletakkan di `_utils/*`.
- Folder `_hooks` dan `_utils` dibuat dekat dengan page yang memakainya agar ownership fitur jelas.

Contoh:

```txt
app/admin/users/
  page.tsx
  _hooks/useUsersPage.ts
  _utils/userFormatters.ts
```

### Query dan Mutation

- Query alumni diletakkan di `hooks/alumni/queries/*` berdasarkan area fitur:
  - `profile.ts`: profil, update profil, update password.
  - `events.ts`: daftar event, detail event, daftar event, batal daftar.
  - `presences.ts`: riwayat presensi dan scan QR.
  - `recommendations.ts`: rekomendasi event.
  - `notifications.ts`: notifikasi dan unread count.
  - `faq.ts`: FAQ.
- Query admin event diletakkan di `hooks/admin/events/useEventQueries.ts`.
- Mutation admin event diletakkan di `hooks/admin/events/useEventMutations.ts`.
- API function admin event diletakkan di `hooks/admin/events/api.ts`.
- Type admin event diletakkan di `hooks/admin/events/types.ts`.
- Transform response API admin event diletakkan di `hooks/admin/events/normalizers.ts`.
- Builder query string admin event diletakkan di `hooks/admin/events/params.ts`.
- Query dan mutation admin broadcast diletakkan di `hooks/admin/broadcast/useBroadcastQueries.ts` dan `hooks/admin/broadcast/useBroadcastMutations.ts`.
- Query dan mutation admin users diletakkan di `hooks/admin/users/useUserQueries.ts` dan `hooks/admin/users/useUserMutations.ts`.
- Endpoint/fetcher per domain diletakkan di `api.ts`.
- Type per domain diletakkan di `types.ts`.
- Query key dikelola lewat `queryKeys.ts` agar invalidasi cache konsisten.

## Kompatibilitas Import Lama

Import lama masih bisa dipakai:

```ts
import { useAlumniEvents } from "@/hooks/alumni/useAlumniHooks";
import { useEvents } from "@/hooks/admin/useEvents";
import { useUsers } from "@/hooks/admin/useUsers";
```

Untuk kode baru, disarankan import dari lokasi yang lebih spesifik:

```ts
import { useAlumniEvents } from "@/hooks/alumni/queries";
import { useEvents } from "@/hooks/admin/events";
import { useUsers } from "@/hooks/admin/users";
```

## Cara Menambah Query Baru

1. Tentukan area fitur atau halaman.
2. Tambahkan API function di `api.ts` domain terkait.
3. Tambahkan query key di `queryKeys.ts`.
4. Tambahkan hook query di `use*Queries.ts`.
5. Export hook dari `index.ts` pada folder tersebut.
6. Jika masih ada file kompatibilitas lama, biarkan file tersebut hanya berisi re-export.

Contoh pattern:

```ts
// hooks/admin/users/queryKeys.ts
export const userQueryKeys = {
  all: ["users"] as const,
};
```

```ts
// hooks/admin/users/useUserQueries.ts
export function useUsers() {
  return useQuery({
    queryKey: userQueryKeys.all,
    queryFn: getUsers,
  });
}
```

## Cara Menambah Mutation Baru

1. Tambahkan API function di `api.ts`.
2. Tambahkan mutation hook di `use*Mutations.ts`.
3. Invalidate query menggunakan key dari `queryKeys.ts`.
4. Export mutation dari `index.ts`.

Contoh pattern:

```ts
export function useDeleteUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userQueryKeys.all });
    },
  });
}
```

## Cara Menambah Logic Halaman

1. Biarkan `page.tsx` berisi render dan wiring props.
2. Jika logic mulai panjang, buat `_hooks/useNamaPage.ts`.
3. Jika ada formatter, validator, kalkulasi statistik, atau export file, buat `_utils/namaHelper.ts`.
4. Jangan akses DOM di `_utils` kecuali helper memang khusus client, seperti export Excel memakai `Blob`.
5. Jangan ubah endpoint atau shape data saat refactor, kecuali memang sedang mengerjakan perubahan API.

## Catatan Refactor

- `hooks/alumni/useAlumniHooks.ts` sekarang hanya menjadi re-export dari `hooks/alumni/queries`.
- `hooks/admin/useEvents.ts` sekarang hanya menjadi re-export dari `hooks/admin/events`.
- `hooks/admin/useUsers.ts` sekarang hanya menjadi re-export dari `hooks/admin/users`.
- `app/admin/users/page.tsx` memakai `useUsersPage` untuk state, filter, mutation handler, dan export.
- `app/admin/reports/page.tsx` memakai `useReportsPage` untuk orchestration event, presences, attendance detail, statistik, dan download.
- `app/admin/settings/page.tsx` memakai `useSettingsPage` untuk profile, password, dan konfigurasi WhatsApp.
- Tidak ada perubahan endpoint API atau nama hook publik.
- Fallback dummy data alumni tetap dipertahankan agar perilaku UI tidak berubah ketika backend belum tersedia.

## Checklist Refactor Aman

- Jalankan `npx tsc --noEmit`.
- Jalankan `npm run lint`.
- Jalankan `npm run build` bila perubahan menyentuh page utama atau shared hooks.
- Pastikan file kompatibilitas lama hanya re-export dan tidak berisi logic ganda.
- Pastikan mutation tetap invalidate query key yang sama seperti sebelum refactor.
- Pastikan helper `_utils` tidak mengubah format tampilan yang sudah dipakai user.
