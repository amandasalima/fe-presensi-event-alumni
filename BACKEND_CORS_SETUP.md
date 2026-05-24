# Setup CORS di Laravel Backend

## Langkah-langkah

### 1. Install Package CORS
```bash
cd path/to/backend
composer require fruitcake/laravel-cors
```

### 2. Publish Konfigurasi CORS
```bash
php artisan vendor:publish --tag="cors"
```

### 3. Edit File `config/cors.php`

Buka file `config/cors.php` dan ubah menjadi:

```php
<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Cross-Origin Resource Sharing (CORS) Configuration
    |--------------------------------------------------------------------------
    */

    'paths' => ['api/*', 'sanctum/csrf-cookie'],

    'allowed_methods' => ['*'],

    'allowed_origins' => [
        'http://localhost:3000',
        'http://127.0.0.1:3000',
    ],

    'allowed_origins_patterns' => [],

    'allowed_headers' => ['*'],

    'exposed_headers' => [],

    'max_age' => 0,

    'supports_credentials' => true,

];
```

### 4. Tambahkan Middleware di `app/Http/Kernel.php`

Buka file `app/Http/Kernel.php` dan tambahkan middleware CORS:

```php
<?php

namespace App\Http;

use Illuminate\Foundation\Http\Kernel as HttpKernel;

class Kernel extends HttpKernel
{
    /**
     * The application's global HTTP middleware stack.
     */
    protected $middleware = [
        // ... middleware lainnya
        \Fruitcake\Cors\HandleCors::class, // Tambahkan ini
    ];

    // ... kode lainnya
}
```

### 5. (Opsional) Tambahkan Header Manual di Controller

Jika masih ada masalah, tambahkan header di controller:

```php
public function login(Request $request)
{
    // Logic login...
    
    return response()->json([
        'success' => true,
        'message' => 'Login successful',
        'data' => [
            'user' => $user,
            'access_token' => $token,
            'token_type' => 'Bearer'
        ]
    ])->header('Access-Control-Allow-Origin', 'http://localhost:3000')
      ->header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
      ->header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
}
```

### 6. Restart Laravel Server

```bash
php artisan serve
```

## Verifikasi

Test dengan curl:

```bash
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -H "Origin: http://localhost:3000" \
  -d '{"email":"admin@pesantren.com","password":"password123"}'
```

Response header harus mengandung:
```
Access-Control-Allow-Origin: http://localhost:3000
Access-Control-Allow-Credentials: true
```

## Troubleshooting

### Error: "No 'Access-Control-Allow-Origin' header"
- Pastikan middleware CORS sudah ditambahkan
- Restart Laravel server
- Clear cache: `php artisan config:clear`

### Error: "Credentials flag is true, but Access-Control-Allow-Credentials is not"
- Set `supports_credentials` ke `true` di `config/cors.php`

### Error: "Method not allowed"
- Pastikan `allowed_methods` di config adalah `['*']`
- Atau spesifik: `['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']`
