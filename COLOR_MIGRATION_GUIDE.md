# Panduan Migrasi Warna

## Warna Baru
- **Primary (Utama)**: `#41A07E`
- **Secondary (Pendukung)**: `#B2DE96`
- **Primary Dark**: `#357f65`
- **Primary Light**: `#5ab494`

## Warna Lama yang Diganti
- `emerald-*` → gunakan primary colors
- `teal-*` → gunakan primary colors
- `cyan-*` → gunakan primary colors
- `green-*` → gunakan primary/secondary colors
- `#4ade80`, `#16a34a`, `#3ecf8e`, `#20b070` → gunakan `#41A07E`

## Cara Penggantian

### 1. Background & Borders
```tsx
// Lama
className="bg-emerald-600"
className="border-teal-200"
className="text-green-700"

// Baru
className="bg-[#41A07E]"
className="border-[#B2DE96]"
className="text-[#41A07E]"
```

### 2. Gradients
```tsx
// Lama
style={{ background: "linear-gradient(135deg, #4ade80 0%, #16a34a 100%)" }}
style={{ background: "linear-gradient(135deg, #3ecf8e 0%, #20b070 100%)" }}

// Baru - Import dari lib/colors.ts
import { GRADIENTS } from "@/lib/colors";
style={{ background: GRADIENTS.primary }}
style={{ background: GRADIENTS.secondary }}
```

### 3. Shadow Colors
```tsx
// Lama
className="shadow-emerald-200"
className="shadow-md shadow-teal-200"

// Baru
className="shadow-[#B2DE96]/30"
className="shadow-md shadow-[#B2DE96]/30"
```

### 4. Hover States
```tsx
// Lama
className="hover:bg-emerald-700"
className="hover:text-teal-600"

// Baru
className="hover:bg-[#357f65]"
className="hover:text-[#41A07E]"
```

### 5. Focus States
```tsx
// Lama
className="focus:border-emerald-400 focus:ring-emerald-100"
className="focus:ring-2 focus:ring-teal-500"

// Baru
className="focus:border-[#41A07E] focus:ring-[#B2DE96]/50"
className="focus:ring-2 focus:ring-[#41A07E]/50"
```

## File yang Perlu Diupdate

### Priority 1 (User-facing)
- ✅ `lib/colors.ts` - File helper warna (sudah dibuat)
- ✅ `globals.css` - CSS variables (sudah diupdate)
- [ ] `app/components/alumni/AuthCard.tsx`
- [ ] `app/components/alumni/SuccessModal.tsx`
- [ ] `app/components/alumni/AlumniHeader.tsx`
- [ ] `app/alumni/main/dashboard/page.tsx`
- [ ] `app/alumni/main/profil/page.tsx`

### Priority 2 (Components)
- [ ] `app/components/alumni/AlumniFooter.tsx`
- [ ] `app/components/alumni/ProfilePopup.tsx`
- [ ] `app/components/alumni/dashboard/*.tsx`
- [ ] `app/alumni/main/scan/page.tsx`
- [ ] `app/alumni/main/events/page.tsx`
- [ ] `app/alumni/main/events/[id]/page.tsx`

### Priority 3 (Others)
- [ ] `app/alumni/main/notifikasi/page.tsx`
- [ ] `app/alumni/main/riwayat/page.tsx`
- [ ] `app/alumni/change-password/page.tsx`

## Quick Search & Replace

Gunakan Find & Replace di editor dengan regex:

### Tailwind Classes
```
Find: bg-emerald-([0-9]+)
Replace: bg-[#41A07E]

Find: text-emerald-([0-9]+)
Replace: text-[#41A07E]

Find: border-emerald-([0-9]+)
Replace: border-[#41A07E]

Find: bg-teal-([0-9]+)
Replace: bg-[#41A07E]

Find: text-teal-([0-9]+)
Replace: text-[#41A07E]
```

### Hex Colors
```
Find: #4ade80
Replace: #41A07E

Find: #16a34a
Replace: #41A07E

Find: #3ecf8e
Replace: #41A07E

Find: #20b070
Replace: #357f65

Find: #ecfdf5
Replace: #f0fdf4
```

## Testing Checklist
- [ ] Login page - button dan link colors
- [ ] Register page - button dan form focus
- [ ] Dashboard - stat cards, gradients
- [ ] Profile page - buttons dan borders
- [ ] Scan QR page - scanner overlay colors
- [ ] Success modals dan notifications
