# Prompt Backend: Pengaturan WhatsApp Broadcast Fonnte

Tolong implementasikan backend Laravel untuk konfigurasi WhatsApp Broadcast menggunakan provider Fonnte tanpa merusak endpoint yang sudah dipakai frontend.

Konteks frontend:
- Halaman pengaturan memakai `GET /settings/whatsapp`, `PUT /settings/whatsapp`, dan `POST /settings/whatsapp/test`.
- Broadcast event memakai endpoint yang sudah ada seperti `/admin/events/{eventId}/broadcast/preview` dan `/admin/events/{eventId}/broadcast`.
- Provider yang dipakai wajib `fonnte`.

Kebutuhan endpoint pengaturan:

1. `GET /settings/whatsapp`
   - Return konfigurasi saat ini.
   - Response minimal:
     ```json
     {
       "provider": "fonnte",
       "api_url": "https://api.fonnte.com/send",
       "api_token": "token-atau-masked-token",
       "sender_number": "628123456789"
     }
     ```
   - Jika token disimpan terenkripsi, boleh return token masked, tetapi pastikan FE tetap bisa menyimpan token baru lewat PUT.

2. `PUT /settings/whatsapp`
   - Simpan konfigurasi Fonnte.
   - Payload:
     ```json
     {
       "provider": "fonnte",
       "api_url": "https://api.fonnte.com/send",
       "api_token": "FONNTE_TOKEN",
       "sender_number": "628123456789"
     }
     ```
   - Validasi:
     - `provider` hanya boleh `fonnte`.
     - `api_url` wajib URL valid, default Fonnte boleh `https://api.fonnte.com/send`.
     - `api_token` wajib saat pertama kali konfigurasi.
     - `sender_number` format Indonesia: angka saja, diawali `62`.
   - Simpan token secara terenkripsi.

3. `POST /settings/whatsapp/test`
   - Test koneksi memakai konfigurasi tersimpan, tetapi jika request body mengirim `api_url`, `api_token`, atau `sender_number`, gunakan nilai body itu untuk test sementara tanpa harus menyimpan dulu.
   - Payload opsional sama seperti endpoint PUT.
   - Lakukan request ke Fonnte dengan header `Authorization: <api_token>`.
   - Jangan kirim broadcast massal saat test. Gunakan mekanisme Fonnte yang paling aman untuk cek device/token/sender. Jika harus mengirim pesan test, kirim hanya ke `sender_number` dan isi pesan pendek seperti `Test koneksi WhatsApp Broadcast`.
   - Response sukses:
     ```json
     {
       "success": true,
       "status": "connected",
       "message": "Koneksi Fonnte berhasil",
       "sender_number": "628123456789",
       "sender_status": "active",
       "fonnte": {}
     }
     ```
   - Response jika nomor/token bermasalah atau terblokir:
     ```json
     {
       "success": false,
       "status": "blocked",
       "message": "Nomor WhatsApp terindikasi terblokir atau tidak aktif",
       "sender_number": "628123456789",
       "sender_status": "blocked",
       "blocked_reason": "Detail error dari Fonnte",
       "fonnte": {}
     }
     ```
   - Untuk error validasi/API, gunakan status HTTP yang sesuai dan sertakan `message`.

Kebutuhan broadcast:
- Semua pengiriman broadcast WA harus membaca konfigurasi dari `/settings/whatsapp`.
- Sebelum kirim broadcast, backend wajib memastikan provider `fonnte`, token tersedia, dan sender tidak berstatus blocked.
- Jika Fonnte mengembalikan indikasi nomor diblokir, token invalid, device disconnected, atau sender tidak aktif:
  - Jangan lanjutkan pengiriman ke target berikutnya.
  - Return error yang jelas ke frontend.
  - Simpan log status broadcast sebagai gagal/blocked.
- Return detail teknis Fonnte di field `fonnte` agar frontend bisa menampilkan detail debug.

Catatan keamanan:
- Jangan log token asli.
- Masking token pada response/log.
- Rate limit endpoint test koneksi agar tidak disalahgunakan.
- Pertahankan struktur response broadcast lama sebisa mungkin, hanya tambahkan field baru seperti `fonnte`, `sender_status`, atau `blocked_reason`.
