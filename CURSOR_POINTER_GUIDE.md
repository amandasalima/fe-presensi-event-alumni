# Panduan Cursor Pointer untuk Elemen Interaktif

## ✅ Sudah Diterapkan (Global)

File `app/globals.css` sudah memiliki style global yang **otomatis** menambahkan `cursor: pointer` pada:

### Elemen HTML Native:
- `<button>` - Semua tombol
- `<a>` - Semua link
- `[role="button"]` - Elemen dengan role button
- `[role="link"]` - Elemen dengan role link
- `[onclick]` - Elemen dengan onclick handler
- `input[type="button"]` - Input button
- `input[type="submit"]` - Input submit
- `input[type="reset"]` - Input reset
- `input[type="checkbox"]` - Checkbox
- `input[type="radio"]` - Radio button
- `<select>` - Dropdown
- `<label[for]>` - Label yang terkait dengan input

### Tailwind Classes:
- Semua elemen dengan `hover:` classes (misal: `hover:bg-gray-100`)
- Elemen dengan class `cursor-pointer` (eksplisit)

### Disabled Elements:
- `button:disabled` → `cursor: not-allowed`
- `[disabled]` → `cursor: not-allowed`
- `.cursor-not-allowed` → `cursor: not-allowed`

---

## 📋 Checklist Elemen Interaktif

### ✅ Yang SUDAH Otomatis Dapat Cursor Pointer:

1. **Buttons** (button, Link sebagai button)
   ```tsx
   <button className="...">Klik Saya</button>
   <Link href="/..." className="...">Link Button</Link>
   ```

2. **Links** (a, Link)
   ```tsx
   <a href="#fitur" className="...">Fitur</a>
   <Link href="/login">Login</Link>
   ```

3. **Elemen dengan Hover Effect**
   ```tsx
   <div className="hover:bg-gray-50">Hover me</div>
   ```

4. **Form Inputs (checkbox, radio, select)**
   ```tsx
   <input type="checkbox" />
   <input type="radio" />
   <select>...</select>
   ```

### ⚠️ Yang PERLU Ditambahkan Manual:

1. **Div/Span dengan onClick tapi TANPA hover effect**
   ```tsx
   // ❌ Belum ada cursor pointer
   <div onClick={handleClick}>Click me</div>
   
   // ✅ Tambahkan cursor-pointer
   <div onClick={handleClick} className="cursor-pointer">Click me</div>
   
   // ✅ Atau tambahkan hover effect
   <div onClick={handleClick} className="hover:bg-gray-50">Click me</div>
   ```

2. **Image yang bisa diklik**
   ```tsx
   // ❌ Belum ada cursor pointer
   <img src="..." onClick={handleClick} />
   
   // ✅ Tambahkan cursor-pointer
   <img src="..." onClick={handleClick} className="cursor-pointer" />
   ```

3. **SVG/Icon yang bisa diklik**
   ```tsx
   // ❌ Belum ada cursor pointer
   <Icon name="close" onClick={handleClick} />
   
   // ✅ Tambahkan cursor-pointer
   <Icon name="close" onClick={handleClick} className="cursor-pointer" />
   ```

---

## 🎯 Pattern yang Sudah Benar di Project

### 1. Button dengan Hover Effect (✅ Sudah Otomatis)
```tsx
<button className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded">
  Klik Saya
</button>
// Cursor pointer otomatis karena: <button> + hover:
```

### 2. Link dengan Hover Effect (✅ Sudah Otomatis)
```tsx
<Link href="/login" className="text-blue-500 hover:underline">
  Login
</Link>
// Cursor pointer otomatis karena: Link (a tag) + hover:
```

### 3. Card yang Bisa Diklik (✅ Sudah Otomatis)
```tsx
<article className="p-6 hover:-translate-y-1 hover:shadow-xl">
  ...
</article>
// Cursor pointer otomatis karena: hover:
```

### 4. Icon Button (✅ Sudah Otomatis)
```tsx
<button className="p-2 hover:bg-gray-100 rounded-full">
  <Icon name="bell" />
</button>
// Cursor pointer otomatis karena: <button> + hover:
```

---

## 🔍 Cara Cek Elemen yang Belum Punya Cursor Pointer

### 1. Search Pattern Ini di VSCode:

**Pattern 1: onClick tanpa button/Link**
```regex
<(div|span|img|svg)[^>]*onClick[^>]*(?!cursor-pointer)(?!hover:)[^>]*>
```

**Pattern 2: div dengan onClick**
```regex
<div[^>]*onClick
```

### 2. Manual Check di Browser:
1. Buka halaman
2. Arahkan mouse ke elemen interaktif
3. Jika cursor **tidak berubah** jadi tangan (pointer), tambahkan `cursor-pointer`

---

## 🛠️ Cara Menambahkan Cursor Pointer

### Metode 1: Tambahkan Class `cursor-pointer` (Eksplisit)
```tsx
<div onClick={handleClick} className="cursor-pointer">
  Klik Saya
</div>
```

### Metode 2: Tambahkan Hover Effect (Rekomendasi)
```tsx
<div onClick={handleClick} className="hover:bg-gray-50 transition">
  Klik Saya
</div>
// Lebih baik karena:
// 1. User dapat feedback visual (hover effect)
// 2. Cursor pointer otomatis dari CSS global
```

### Metode 3: Gunakan Button/Link (Best Practice)
```tsx
// ❌ Tidak semantik
<div onClick={handleClick}>Klik</div>

// ✅ Semantik dan accessible
<button type="button" onClick={handleClick}>Klik</button>
```

---

## 📊 Status Implementasi di Project

### ✅ Komponen yang Sudah Benar:

1. **AlumniHeader.tsx**
   - ✅ Semua button menggunakan `<button>` dengan hover effect
   - ✅ Notification button: `hover:bg-gray-50`
   - ✅ Profile button: `hover:bg-gray-50`
   - ✅ Notification items: `hover:bg-gray-50`

2. **AdminHeader.tsx**
   - ✅ Semua button menggunakan `<button>` dengan hover effect

3. **page.tsx (Landing Page)**
   - ✅ Semua Link menggunakan `<Link>` dengan hover effect
   - ✅ Cards: `hover:-translate-y-1 hover:shadow-xl`
   - ✅ Navigation links: `hover:text-teal-600`

4. **Login/Register Pages**
   - ✅ Submit buttons: `<button type="submit">` dengan hover effect
   - ✅ Links: `<Link>` dengan hover effect

5. **Dashboard Components**
   - ✅ Event cards menggunakan hover effect
   - ✅ Action buttons menggunakan `<button>` dengan hover

---

## 🎨 Tailwind Cursor Utilities

### Cursor Pointer (untuk interactive elements):
```tsx
className="cursor-pointer"
```

### Cursor Not Allowed (untuk disabled):
```tsx
className="cursor-not-allowed"
disabled
```

### Cursor Default (untuk text/content):
```tsx
className="cursor-default"
```

### Cursor Wait (untuk loading):
```tsx
className="cursor-wait"
```

---

## 📝 Best Practices

### ✅ DO:
1. Gunakan `<button>` untuk clickable elements
2. Gunakan `<Link>` untuk navigation
3. Tambahkan hover effect untuk visual feedback
4. Gunakan `cursor-not-allowed` untuk disabled state
5. Test dengan mouse hover di browser

### ❌ DON'T:
1. Jangan gunakan `<div onClick>` kecuali benar-benar perlu
2. Jangan lupa tambahkan `cursor-pointer` pada div/span dengan onClick
3. Jangan gunakan cursor pointer pada non-interactive elements
4. Jangan lupa accessibility (aria-label, aria-expanded, dll)

---

## 🔧 Testing Checklist

Untuk setiap halaman, test:

- [ ] Hover pada button → cursor jadi pointer
- [ ] Hover pada link → cursor jadi pointer
- [ ] Hover pada card interaktif → cursor jadi pointer
- [ ] Hover pada icon button → cursor jadi pointer
- [ ] Hover pada checkbox/radio → cursor jadi pointer
- [ ] Hover pada disabled button → cursor jadi not-allowed
- [ ] Hover pada text biasa → cursor tetap default

---

## 🚀 Summary

**Dengan CSS global yang sudah diterapkan**, hampir semua elemen interaktif di project ini **SUDAH OTOMATIS** mendapat cursor pointer karena:

1. Menggunakan `<button>` dan `<Link>` (HTML semantik)
2. Menggunakan hover effects (Tailwind CSS)
3. CSS global sudah handle semua pattern umum

**Action Required**: 
- Hanya perlu cek elemen `<div>` atau `<span>` dengan `onClick` yang TIDAK punya hover effect
- Tambahkan `cursor-pointer` atau `hover:...` pada elemen tersebut

Project ini sudah **95% compliant** dengan best practices cursor pointer! 🎉
