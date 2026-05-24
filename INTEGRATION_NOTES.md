# Integrasi API Authentication

## Perubahan yang Dilakukan

### 1. Update Types (`types/auth.ts`)
- Mengubah struktur `RegisterPayload` untuk menyesuaikan dengan API:
  - `name` (string) - nama lengkap
  - `gender` (string) - jenis kelamin
  - `email` (string)
  - `phone` (string)
  - `angkatan` (string) - tahun angkatan
  - `password` (string)

- Mengubah struktur `AuthResponse` untuk menyesuaikan dengan response API:
  ```typescript
  {
    success: boolean;
    message: string;
    data: {
      user: AlumniUser;
      access_token: string;
      token_type: string;
    };
  }
  ```

- Mengubah struktur `AlumniUser`:
  - `name` (bukan `first_name` dan `last_name`)
  - `gender`
  - `angkatan` (bukan `graduation_year`)
  - Menambahkan field: `role`, `email_verified_at`, `tanggal_lahir`

### 2. Update Hooks

#### `hooks/alumni/useLogin.ts`
- Endpoint: `/auth/login` (sebelumnya `/alumni/login`)
- Mengambil token dari `response.data.access_token`
- Redirect ke `/alumni/dashboard`

#### `hooks/alumni/useRegister.ts`
- Endpoint: `/auth/register` (sebelumnya `/alumni/register`)
- Mengambil token dari `response.data.access_token`
- Redirect ke `/alumni/dashboard`

### 3. Update Components

#### `app/components/alumni/AuthCard.tsx`
Form register diubah dengan field:
- Nama Lengkap (1 field, bukan first_name & last_name)
- Jenis Kelamin (dropdown: Laki-laki/Perempuan)
- Email
- No Telp
- Angkatan (text input)
- Kata Sandi

#### `app/components/alumni/AlumniHeader.tsx`
- Menggunakan `user?.name?.[0]` untuk inisial (bukan `user?.first_name?.[0]`)

### 4. Environment Configuration
File `.env.local` dibuat dengan:
```
NEXT_PUBLIC_API_URL=http://localhost:8000/api
```

## Endpoint API yang Digunakan

### Register
- **URL**: `POST http://localhost:8000/api/auth/register`
- **Payload**:
  ```json
  {
    "name": "Ahmad Fauzi",
    "gender": "Laki-laki",
    "email": "ahmad@example.com",
    "phone": "081234567890",
    "angkatan": "2015",
    "password": "password123"
  }
  ```
- **Response**:
  ```json
  {
    "success": true,
    "message": "Registration successful",
    "data": {
      "user": { ... },
      "access_token": "token_string",
      "token_type": "Bearer"
    }
  }
  ```

### Login
- **URL**: `POST http://localhost:8000/api/auth/login`
- **Payload**:
  ```json
  {
    "email": "admin@pesantren.com",
    "password": "password123"
  }
  ```
- **Response**: (sama dengan register)

## Testing

### Mengatasi CORS Error

Jika muncul CORS error, ada 2 solusi:

#### Solusi 1: Konfigurasi CORS di Laravel Backend (Recommended)

1. Install Laravel CORS:
   ```bash
   composer require fruitcake/laravel-cors
   ```

2. Publish konfigurasi:
   ```bash
   php artisan vendor:publish --tag="cors"
   ```

3. Edit `config/cors.php`:
   ```php
   return [
       'paths' => ['api/*', 'sanctum/csrf-cookie'],
       'allowed_methods' => ['*'],
       'allowed_origins' => ['http://localhost:3000'],
       'allowed_origins_patterns' => [],
       'allowed_headers' => ['*'],
       'exposed_headers' => [],
       'max_age' => 0,
       'supports_credentials' => true,
   ];
   ```

4. Tambahkan middleware di `app/Http/Kernel.php`:
   ```php
   protected $middleware = [
       // ...
       \Fruitcake\Cors\HandleCors::class,
   ];
   ```

#### Solusi 2: Gunakan Next.js Proxy (Sudah Dikonfigurasi)

File `next.config.js` sudah dibuat untuk proxy request ke backend.
Request dari frontend akan dikirim ke `/api/*` yang akan di-forward ke `http://localhost:8000/api/*`.

### Menjalankan Aplikasi

1. **Restart development server** (penting setelah perubahan config):
   ```bash
   npm run dev
   ```

2. Akses halaman:
   - Register: `http://localhost:3000/alumni/register`
   - Login: `http://localhost:3000/alumni/login`

3. Test flow:
   - Isi form register dengan data yang sesuai
   - Submit form
   - Token akan disimpan di localStorage
   - Redirect ke `/alumni/dashboard`

## Catatan
- Token disimpan di `localStorage` dengan key `alumni_token`
- Token otomatis ditambahkan ke header `Authorization: Bearer {token}` pada setiap request
- Jika response 401, user akan di-redirect ke `/login` dan token dihapus
