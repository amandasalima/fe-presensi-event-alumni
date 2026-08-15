# Instruksi Penambahan Logo Pesantren

## Langkah-langkah:

1. **Simpan logo pesantren yang sudah diberikan** dengan nama file: `logo-pesantren.png`

2. **Lokasi penyimpanan**: Simpan di folder ini (`public/images/`)
   - Path lengkap: `public/images/logo-pesantren.png`

3. **Format file**: PNG dengan background transparan (recommended)
   - Ukuran yang disarankan: 512x512 pixels atau lebih tinggi
   - Format lain yang didukung: JPG, WEBP

4. **Setelah menyimpan logo**:
   - Logo akan otomatis muncul di:
     - Halaman Login Admin (section kiri dan header form)
     - Header Admin (jika sudah diimplementasikan)
     - Sidebar Admin (jika sudah diimplementasikan)

## Lokasi Implementasi Logo:

### 1. Halaman Login Admin (`app/admin/login/page.tsx`)
   - Section kiri: Logo besar dengan glow effect (128x128px)
   - Section kanan: Logo di header form (80x80px)

### 2. Tempat lain yang bisa ditambahkan:
   - AdminHeader.tsx
   - AdminSidebar.tsx
   - Halaman Landing page
   - Footer

## Preview Implementasi:
Logo ditampilkan dengan:
- Background putih dan border ring emas
- Shadow dan glow effect untuk kesan premium
- Responsif dan proporsional
- Alt text untuk aksesibilitas

---
**Note**: Jika nama file berbeda atau format berbeda, update path di file tsx yang relevan.
