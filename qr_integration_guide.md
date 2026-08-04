# 🎫 Panduan Integrasi Frontend: QR Code Durasi Hari & Waktu WIB

Panduan ini berisi langkah-langkah khusus untuk mengintegrasikan fitur **QR Code berbasis durasi hari** dan format waktu **WIB** pada repositori frontend Anda (`fe-presensi-event-alumni`).

---

## 1. Pembaruan Tipe Data (TypeScript Interface)

Sesuaikan tipe data `QrCode` di frontend Anda agar mengenali properti durasi hari dan format string WIB siap pakai dari backend.

```typescript
export interface QrCode {
  id: number;
  event_id: number;
  qr_token: string;
  qr_payload: string;
  qr_code_image: string | null;
  qr_code_url: string | null;
  
  // ── Modifikasi Baru ──
  duration_days: number;   // Durasi aktif dalam satuan hari (1-30)
  
  // ── Atribut Format Waktu WIB Siap Pakai ──
  valid_from_wib: string;  // Contoh: "04 Agustus 2026, 13:24 WIB"
  expired_at_wib: string;  // Contoh: "07 Agustus 2026, 13:24 WIB"
  created_at_wib: string;  // Contoh: "04 Agustus 2026, 13:24 WIB"
  
  is_active: boolean;
  is_valid_now: boolean;
  is_expired: boolean;
  created_at: string;
  expired_at: string;
}
```

---

## 2. Pembaruan Fungsi API (`lib/api.ts`)

Sesuaikan fungsi generate QR Code agar hanya mengirimkan parameter `duration_days` ke backend. Parameter lama `valid_from` dan `timeout_minutes` sudah tidak digunakan lagi karena backend otomatis menentukan waktu mulai saat ini.

```typescript
// ── Di lib/api.ts ──

interface GenerateQrRequest {
  duration_days: number; // Nilai integer antara 1 sampai 30
}

/**
 * Membuat QR Code baru untuk event tertentu
 */
export async function generateEventQr(eventId: number, data: GenerateQrRequest) {
  // Hanya mengirimkan durasi hari ke backend
  const response = await api.post(`/admin/events/${eventId}/qr/generate`, {
    duration_days: data.duration_days
  });
  return response.data; // Mengembalikan { success: true, data: { qr_code: ... } }
}
```

---

## 3. Implementasi Komponen Formulir (Admin View)

Anda bisa mengimplementasikan input durasi hari menggunakan dropdown sederhana di halaman manajemen event admin:

```tsx
import React, { useState } from 'react';
import { generateEventQr } from '@/lib/api';

interface QrGeneratorProps {
  eventId: number;
  onQrGenerated: (qrData: any) => void;
}

export function QrGenerator({ eventId, onQrGenerated }: QrGeneratorProps) {
  const [durationDays, setDurationDays] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(false);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await generateEventQr(eventId, { duration_days: durationDays });
      if (response.success) {
        onQrGenerated(response.data.qr_code);
        alert(response.message); // Menampilkan pesan sukses dari backend
      }
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || "Gagal membuat QR Code";
      alert(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow border">
      <h3 className="text-lg font-bold text-gray-900 mb-4">Generate QR Code Absensi</h3>
      <form onSubmit={handleGenerate} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Masa Berlaku QR Code
          </label>
          <select
            value={durationDays}
            onChange={(e) => setDurationDays(Number(e.target.value))}
            className="w-full border rounded-md px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value={1}>1 Hari</option>
            <option value={3}>3 Hari</option>
            <option value={7}>7 Hari</option>
            <option value={14}>14 Hari (2 Minggu)</option>
            <option value={30}>30 Hari (1 Bulan)</option>
          </select>
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 rounded-md transition disabled:bg-gray-400"
        >
          {loading ? "Sedang memproses..." : "Generate QR Code"}
        </button>
      </form>
    </div>
  );
}
```

---

## 4. Menampilkan Detail Waktu di UI

Karena format string WIB sudah di-translate dan diformat di backend, Anda hanya perlu merender nilai dari backend secara langsung tanpa repot memikirkan timezone client atau konversi tanggal di JavaScript.

```tsx
import { QrCode } from '@/types'; // Sesuaikan lokasi tipe data Anda

interface QrDetailProps {
  qrCode: QrCode;
}

export function QrCodeDetails({ qrCode }: QrDetailProps) {
  return (
    <div className="bg-gray-50 p-5 rounded-lg border space-y-3">
      <h4 className="font-semibold text-gray-800 border-b pb-2">Informasi Validitas QR</h4>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
        <div>
          <span className="text-gray-500 block">Dibuat pada</span>
          <span className="text-gray-900 font-medium">{qrCode.created_at_wib}</span>
        </div>
        <div>
          <span className="text-gray-500 block">Masa Berlaku</span>
          <span className="text-gray-900 font-medium">{qrCode.duration_days} Hari</span>
        </div>
        <div>
          <span className="text-gray-500 block">Mulai Aktif</span>
          <span className="text-gray-900 font-medium">{qrCode.valid_from_wib}</span>
        </div>
        <div>
          <span className="text-gray-500 block">Kedaluwarsa Pada</span>
          <span className="text-red-600 font-semibold">{qrCode.expired_at_wib}</span>
        </div>
      </div>

      <div className="pt-2 flex items-center gap-2">
        <span className="text-sm text-gray-500">Status Absensi:</span>
        {qrCode.is_expired ? (
          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-800">
            Kedaluwarsa (Expired)
          </span>
        ) : (
          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-800">
            Aktif (Dapat Discan)
          </span>
        )}
      </div>
    </div>
  );
}
```
