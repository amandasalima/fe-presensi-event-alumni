# Struktur Query Hooks

Dokumen ini menjelaskan refactor struktur query hooks agar query per area halaman lebih mudah dibaca dan dirawat.

## Tujuan

- Memisahkan query, mutation, type, query key, dan normalizer agar file tidak terlalu panjang.
- Menjaga import lama tetap kompatibel melalui file re-export.
- Membuat lokasi perubahan API lebih mudah ditemukan oleh developer lain.

## Struktur Baru

```txt
hooks/
  admin/
    events/
      index.ts
      normalizers.ts
      params.ts
      queryKeys.ts
      types.ts
      useEventQueries.ts
    useEvents.ts
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

- Query alumni diletakkan di `hooks/alumni/queries/*` berdasarkan area fitur:
  - `profile.ts`: profil, update profil, update password.
  - `events.ts`: daftar event, detail event, daftar event, batal daftar.
  - `presences.ts`: riwayat presensi dan scan QR.
  - `recommendations.ts`: rekomendasi event.
  - `notifications.ts`: notifikasi dan unread count.
  - `faq.ts`: FAQ.
- Query admin event diletakkan di `hooks/admin/events/useEventQueries.ts`.
- Type admin event diletakkan di `hooks/admin/events/types.ts`.
- Transform response API admin event diletakkan di `hooks/admin/events/normalizers.ts`.
- Builder query string admin event diletakkan di `hooks/admin/events/params.ts`.
- Query key dikelola lewat `queryKeys.ts` agar invalidasi cache konsisten.

## Kompatibilitas Import Lama

Import lama masih bisa dipakai:

```ts
import { useAlumniEvents } from "@/hooks/alumni/useAlumniHooks";
import { useEvents } from "@/hooks/admin/useEvents";
```

Untuk kode baru, disarankan import dari lokasi yang lebih spesifik:

```ts
import { useAlumniEvents } from "@/hooks/alumni/queries";
import { useEvents } from "@/hooks/admin/events";
```

## Cara Menambah Query Baru

1. Tentukan area fitur atau halaman.
2. Tambahkan hook ke file area yang sesuai di `hooks/alumni/queries` atau buat folder baru bila domainnya besar.
3. Tambahkan query key di `queryKeys.ts`.
4. Pakai query key dari helper saat `useQuery` dan saat `invalidateQueries`.
5. Export hook dari `index.ts` pada folder tersebut.
6. Jika masih ada file kompatibilitas lama, biarkan file tersebut hanya berisi re-export.

## Catatan Refactor

- `hooks/alumni/useAlumniHooks.ts` sekarang hanya menjadi re-export dari `hooks/alumni/queries`.
- `hooks/admin/useEvents.ts` sekarang hanya menjadi re-export dari `hooks/admin/events`.
- Tidak ada perubahan endpoint API atau nama hook publik.
- Fallback dummy data alumni tetap dipertahankan agar perilaku UI tidak berubah ketika backend belum tersedia.
