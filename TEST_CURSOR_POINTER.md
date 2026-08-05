# 🧪 Test Cursor Pointer - Manual Testing Guide

## 🎯 Tujuan Testing

Memastikan semua elemen interaktif di aplikasi menampilkan cursor tangan (pointer) saat di-hover.

---

## 📋 Test Checklist

### 🏠 Halaman Landing (/) 

#### Header Navigation
- [ ] Link "Fitur" → cursor pointer ✓
- [ ] Link "Alur" → cursor pointer ✓
- [ ] Link "Masuk" → cursor pointer ✓
- [ ] Button "Login" (hijau) → cursor pointer ✓

#### Hero Section
- [ ] Button "Masuk sebagai Alumni" (gradient) → cursor pointer ✓
- [ ] Button "Masuk sebagai Admin" (putih) → cursor pointer ✓
- [ ] Link "Registrasi alumni" → cursor pointer ✓

#### Cards Section
- [ ] Card "Admin" (keseluruhan) → cursor pointer saat hover ✓
- [ ] Button "Masuk sebagai Admin" dalam card → cursor pointer ✓
- [ ] Card "Alumni" (keseluruhan) → cursor pointer saat hover ✓
- [ ] Button "Masuk / Daftar Alumni" dalam card → cursor pointer ✓
- [ ] Link "Daftar langsung" → cursor pointer ✓

#### Fitur Cards
- [ ] Card "QR Code Scanner" → cursor pointer saat hover ✓
- [ ] Card "Notifikasi Real-time" → cursor pointer saat hover ✓
- [ ] Card "Laporan Digital" → cursor pointer saat hover ✓
- [ ] Card "Manajemen User" → cursor pointer saat hover ✓

---

### 👤 Admin Login (/admin/login)

- [ ] Input email → cursor text/default ✓
- [ ] Input password → cursor text/default ✓
- [ ] Checkbox "Ingat saya" → cursor pointer ✓
- [ ] Button "Masuk" → cursor pointer ✓
- [ ] Button "Masuk" (disabled) → cursor not-allowed ✓
- [ ] Icon show/hide password → cursor pointer ✓
- [ ] Link "Lupa password?" → cursor pointer ✓

---

### 🎓 Alumni Login (/alumni/login)

- [ ] Input email → cursor text/default ✓
- [ ] Input password → cursor text/default ✓
- [ ] Checkbox "Ingat saya" → cursor pointer ✓
- [ ] Button "Masuk" → cursor pointer ✓
- [ ] Button "Masuk" (disabled) → cursor not-allowed ✓
- [ ] Icon show/hide password → cursor pointer ✓
- [ ] Link "Lupa password?" → cursor pointer ✓
- [ ] Link "Belum punya akun? Daftar di sini" → cursor pointer ✓

---

### 📝 Alumni Register (/alumni/register)

- [ ] Semua input text → cursor text/default ✓
- [ ] Select "Jenis Kelamin" → cursor pointer ✓
- [ ] Input "Tahun Lulus" → cursor text/default ✓
- [ ] Input "Tanggal Lahir" → cursor pointer (date picker) ✓
- [ ] Input password → cursor text/default ✓
- [ ] Icon show/hide password → cursor pointer ✓
- [ ] Button "Daftar" → cursor pointer ✓
- [ ] Button "Daftar" (disabled) → cursor not-allowed ✓
- [ ] Link "Sudah punya akun? Masuk di sini" → cursor pointer ✓

---

### 🏢 Admin Dashboard (/admin/dashboard)

#### Sidebar
- [ ] Item menu "Dashboard" → cursor pointer ✓
- [ ] Item menu "Kelola Pengguna" → cursor pointer ✓
- [ ] Item menu "Kelola Event" → cursor pointer ✓
- [ ] Item menu "Laporan" → cursor pointer ✓
- [ ] Item menu "Broadcast" → cursor pointer ✓
- [ ] Item menu "Generate QR" → cursor pointer ✓
- [ ] Item menu "Pengaturan" → cursor pointer ✓
- [ ] Button "Logout" → cursor pointer ✓

#### Header
- [ ] Icon notification bell → cursor pointer ✓
- [ ] Profile button (avatar + nama) → cursor pointer ✓
- [ ] Dropdown profile items → cursor pointer ✓

#### Dashboard Content
- [ ] Stat card "Total Alumni" → cursor pointer (jika clickable) ✓
- [ ] Stat card "Event Aktif" → cursor pointer (jika clickable) ✓
- [ ] Stat card "Total Kehadiran" → cursor pointer (jika clickable) ✓
- [ ] Chart area → cursor default ✓
- [ ] Table row actions (edit/delete) → cursor pointer ✓

---

### 👨‍🎓 Alumni Dashboard (/alumni/main/dashboard)

#### Header
- [ ] Logo/Brand → cursor default ✓
- [ ] Icon notification bell → cursor pointer ✓
- [ ] Badge unread count → cursor default ✓
- [ ] Profile avatar → cursor pointer ✓
- [ ] Chevron icon → cursor pointer ✓
- [ ] Notification popup items → cursor pointer ✓
- [ ] Button "Tandai semua" → cursor pointer ✓
- [ ] Button "Lihat semua" → cursor pointer ✓

#### Dashboard Content
- [ ] Button "Scan QR Code" → cursor pointer ✓
- [ ] Recommended event cards → cursor pointer ✓
- [ ] Button "Daftar Sekarang" pada card → cursor pointer ✓
- [ ] Link "Lihat Semua Event" → cursor pointer ✓
- [ ] Attendance history items → cursor pointer ✓

#### Bottom Navigation
- [ ] Nav item "Beranda" → cursor pointer ✓
- [ ] Nav item "Event" → cursor pointer ✓
- [ ] Nav item "QR Scan" → cursor pointer ✓
- [ ] Nav item "Profil" → cursor pointer ✓

---

### 📅 Event List (/alumni/main/events)

#### Filters
- [ ] Tab "Semua" → cursor pointer ✓
- [ ] Tab "Terdaftar" → cursor pointer ✓
- [ ] Tab "Belum Terdaftar" → cursor pointer ✓
- [ ] Search input → cursor text ✓
- [ ] Filter dropdown → cursor pointer ✓

#### Event Cards
- [ ] Event card (keseluruhan) → cursor pointer ✓
- [ ] Badge status → cursor default ✓
- [ ] Button "Daftar" → cursor pointer ✓
- [ ] Button "Batalkan" → cursor pointer ✓
- [ ] Button "Lihat Detail" → cursor pointer ✓

---

### 📄 Event Detail (/alumni/main/events/[id])

- [ ] Button "Kembali" → cursor pointer ✓
- [ ] Poster image → cursor default (atau zoom jika clickable) ✓
- [ ] Button "Daftar Event" → cursor pointer ✓
- [ ] Button "Batalkan Pendaftaran" → cursor pointer ✓
- [ ] Button "Daftar Event" (disabled - quota penuh) → cursor not-allowed ✓
- [ ] Badge quota → cursor default ✓
- [ ] Badge status → cursor default ✓

---

### 👤 Profile Page (/alumni/main/profil)

- [ ] Button "Edit Profil" → cursor pointer ✓
- [ ] Avatar image → cursor pointer (untuk upload) ✓
- [ ] Input fields (saat edit mode) → cursor text ✓
- [ ] Select dropdown → cursor pointer ✓
- [ ] Button "Simpan" → cursor pointer ✓
- [ ] Button "Batal" → cursor pointer ✓
- [ ] Link "Ubah Password" → cursor pointer ✓

---

### 🔐 Change Password (/alumni/change-password)

- [ ] Input "Password Lama" → cursor text ✓
- [ ] Input "Password Baru" → cursor text ✓
- [ ] Input "Konfirmasi Password" → cursor text ✓
- [ ] Icon show/hide password → cursor pointer ✓
- [ ] Button "Ubah Password" → cursor pointer ✓
- [ ] Button "Ubah Password" (disabled) → cursor not-allowed ✓
- [ ] Link "Kembali ke Profil" → cursor pointer ✓

---

### 📱 QR Scanner (/alumni/main/scan)

- [ ] Button "Mulai Scan" → cursor pointer ✓
- [ ] Button "Switch Camera" → cursor pointer ✓
- [ ] Button "Flash On/Off" → cursor pointer ✓
- [ ] Button "Tutup Scanner" → cursor pointer ✓
- [ ] Camera viewport → cursor default ✓

---

### 🔔 Notifications (/alumni/main/notifikasi)

- [ ] Tab "Semua" → cursor pointer ✓
- [ ] Tab "Belum Dibaca" → cursor pointer ✓
- [ ] Notification item → cursor pointer ✓
- [ ] Button "Tandai Sudah Dibaca" → cursor pointer ✓
- [ ] Button "Hapus" → cursor pointer ✓

---

### 📊 Admin Pages

#### Users (/admin/users)
- [ ] Button "Tambah User" → cursor pointer ✓
- [ ] Search input → cursor text ✓
- [ ] Filter dropdown → cursor pointer ✓
- [ ] Table row → cursor pointer (untuk expand/detail) ✓
- [ ] Button "Edit" → cursor pointer ✓
- [ ] Button "Hapus" → cursor pointer ✓
- [ ] Pagination buttons → cursor pointer ✓

#### Events (/admin/events)
- [ ] Button "Tambah Event" → cursor pointer ✓
- [ ] Search input → cursor text ✓
- [ ] Event card → cursor pointer ✓
- [ ] Button "Edit" → cursor pointer ✓
- [ ] Button "Hapus" → cursor pointer ✓
- [ ] Button "Detail" → cursor pointer ✓

#### Reports (/admin/reports)
- [ ] Date picker → cursor pointer ✓
- [ ] Filter dropdown → cursor pointer ✓
- [ ] Button "Export PDF" → cursor pointer ✓
- [ ] Button "Export Excel" → cursor pointer ✓
- [ ] Chart area → cursor default ✓

#### Settings (/admin/settings)
- [ ] Tab menu items → cursor pointer ✓
- [ ] Input fields → cursor text ✓
- [ ] Toggle switches → cursor pointer ✓
- [ ] Button "Simpan" → cursor pointer ✓
- [ ] Button "Reset" → cursor pointer ✓

#### Broadcast (/admin/broadcast)
- [ ] Checkbox "Pilih Semua" → cursor pointer ✓
- [ ] Checkbox individual → cursor pointer ✓
- [ ] Textarea message → cursor text ✓
- [ ] Button "Kirim Broadcast" → cursor pointer ✓
- [ ] Button "Preview" → cursor pointer ✓

---

## 🎨 Visual Indicators

### ✅ Cursor Pointer (tangan)
Harus muncul pada:
- Semua buttons
- Semua links
- Checkboxes & radio buttons
- Select dropdowns
- Clickable cards
- Icon buttons
- Navigation items
- Tab items

### 🚫 Cursor Not-Allowed (dilarang)
Harus muncul pada:
- Disabled buttons
- Disabled inputs
- Quota penuh buttons
- Loading states (opsional)

### ↔️ Cursor Default (panah)
Harus muncul pada:
- Text content
- Images (non-clickable)
- Badges/Labels
- Dividers
- Chart areas

### 📝 Cursor Text (I-beam)
Harus muncul pada:
- Text inputs
- Textareas
- Editable content

---

## 🐛 Cara Report Bug

Jika menemukan elemen yang **seharusnya** cursor pointer tapi **tidak**:

1. Screenshot element tersebut
2. Catat lokasi (URL + section name)
3. Catat ekspektasi vs realita:
   ```
   Location: /alumni/main/dashboard
   Element: Button "Daftar Sekarang"
   Expected: cursor pointer
   Actual: cursor default
   ```

---

## ✨ Expected Results

**SEMUA** checklist di atas harus ✅ (passing).

Jika ada yang ❌ (failing), berarti ada:
1. CSS global yang belum di-load
2. Element yang tidak menggunakan semantic HTML
3. Element yang tidak punya hover effect
4. Element yang perlu explicit `cursor-pointer` class

---

## 🚀 Quick Test (5 menit)

Untuk testing cepat, cek halaman-halaman ini:

1. **Landing page** (/) - test semua buttons & links
2. **Admin login** (/admin/login) - test form elements
3. **Alumni dashboard** (/alumni/main/dashboard) - test interactive cards
4. **Event list** (/alumni/main/events) - test filters & cards

Jika 4 halaman ini ✅, kemungkinan besar seluruh aplikasi sudah benar.

---

*Last Updated: [Current Date]*
*Testing By: QA Team / Developer*
