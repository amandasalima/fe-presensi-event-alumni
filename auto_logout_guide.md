# 🔐 Panduan Auto-Logout: Perbaikan Autentikasi

## Masalah
Akun pengguna (admin & alumni) **tersangkut** ketika menutup browser tanpa logout — token tetap aktif di database sehingga menyebabkan masalah autentikasi.

## Solusi yang Diterapkan (Backend)

### 1. Token Expiration (2 jam)
Token Sanctum sekarang otomatis **expire setelah 2 jam** jika tidak digunakan.

```diff
- 'expiration' => 60 * 24,        // 24 jam — terlalu lama
+ 'expiration' => (int) env('SANCTUM_TOKEN_EXPIRATION_MINUTES', 120),  // 2 jam
```

Bisa di-override via `.env`:
```env
SANCTUM_TOKEN_EXPIRATION_MINUTES=120
```

### 2. Heartbeat Endpoint (Keep-Alive)
Endpoint baru `POST /api/auth/heartbeat` yang harus dipanggil frontend secara berkala (setiap 5 menit) selama tab masih terbuka.

- Ketika tab terbuka → heartbeat berjalan → token tetap hidup
- Ketika browser/tab ditutup → heartbeat berhenti → token expire dalam 2 jam

**Response:**
```json
{
  "success": true,
  "data": {
    "token_expires_in": 115
  }
}
```

### 3. Login Response Update
Login response sekarang menyertakan `token_expires_in` (dalam menit):
```json
{
  "data": {
    "user": { ... },
    "access_token": "2|xyz...",
    "token_type": "Bearer",
    "token_expires_in": 120
  }
}
```

### 4. Scheduled Token Cleanup
Command `sanctum:purge-expired` berjalan **setiap jam** untuk membersihkan token expired dari database.

---

## Yang Perlu Dilakukan di Frontend

> [!IMPORTANT]
> Perubahan backend saja **tidak cukup**. Frontend HARUS mengimplementasikan poin-poin berikut agar auto-logout bekerja dengan sempurna.

### 1. Gunakan `sessionStorage` (BUKAN `localStorage`)
```typescript
// ❌ JANGAN — token tetap ada setelah browser ditutup
localStorage.setItem('token', response.data.access_token);

// ✅ PAKAI — token otomatis hilang saat browser ditutup  
sessionStorage.setItem('token', response.data.access_token);
```

### 2. Implementasi Heartbeat Interval
```typescript
// Mulai heartbeat setelah login
let heartbeatInterval: NodeJS.Timeout;

function startHeartbeat() {
  heartbeatInterval = setInterval(async () => {
    try {
      const res = await api.post('/auth/heartbeat');
      const remaining = res.data.data.token_expires_in;
      
      // Jika token hampir habis (< 5 menit), redirect ke login
      if (remaining <= 5) {
        handleAutoLogout();
      }
    } catch (error) {
      // Token expired / invalid → auto logout
      if (error.response?.status === 401) {
        handleAutoLogout();
      }
    }
  }, 5 * 60 * 1000); // Setiap 5 menit
}

function stopHeartbeat() {
  if (heartbeatInterval) clearInterval(heartbeatInterval);
}

function handleAutoLogout() {
  stopHeartbeat();
  sessionStorage.removeItem('token');
  window.location.href = '/login';
}
```

### 3. Handle `visibilitychange` Event
Kirim heartbeat saat tab kembali aktif setelah lama tidak digunakan:
```typescript
document.addEventListener('visibilitychange', async () => {
  if (document.visibilityState === 'visible') {
    try {
      await api.post('/auth/heartbeat');
    } catch {
      handleAutoLogout();
    }
  }
});
```

### 4. Handle 401 Response secara Global (Axios Interceptor)
```typescript
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      handleAutoLogout();
    }
    return Promise.reject(error);
  }
);
```

---

## Ringkasan Alur Auto-Logout

```
User Login → Token dibuat (expire: 2 jam)
     │
     ├─── Tab Terbuka → Heartbeat setiap 5 menit → Token tetap hidup
     │
     └─── Browser Ditutup → Heartbeat berhenti
                │
                ├─── sessionStorage → Token hilang dari browser
                │
                └─── 2 jam kemudian → Token expire di database
                         │
                         └─── Scheduled purge → Token dihapus dari DB
```
