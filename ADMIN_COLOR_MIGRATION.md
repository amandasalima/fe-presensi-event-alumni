# Admin Color Migration Guide

## New Admin Colors
- **Main Color**: `#2D7EA0` (Blue)
- **Support Color**: `#7AB2B2` (Teal Light)
- **Main Dark**: `#236175` (Hover states)
- **Support Light**: `#A8D5D5` (Light backgrounds)

## Color Replacements

### Tailwind Classes to Replace

| Old Class | New Class | Usage |
|-----------|-----------|-------|
| `teal-600` | `[#2D7EA0]` | Primary buttons, active states |
| `teal-700` | `[#236175]` | Hover states |
| `teal-500` | `[#2D7EA0]` | Borders, focus rings |
| `teal-400` | `[#7AB2B2]` | Light accents |
| `teal-300` | `[#A8D5D5]` | Disabled states |
| `teal-100` | `[#7AB2B2]/20` | Table headers, light backgrounds |
| `teal-50` | `[#7AB2B2]/10` | Very light backgrounds |
| `cyan-600` | `[#2D7EA0]` | Secondary elements |
| `cyan-500` | `[#7AB2B2]` | Accents |
| `cyan-400` | `[#7AB2B2]` | Borders |
| `cyan-100` | `[#7AB2B2]/20` | Badges |
| `cyan-50` | `[#7AB2B2]/10` | Light backgrounds |
| `from-teal-` | `from-[#2D7EA0]` | Gradients |
| `to-cyan-` | `to-[#7AB2B2]` | Gradients |

### Text Colors
- `text-teal-600` → `text-[#2D7EA0]`
- `text-teal-700` → `text-[#236175]`
- `text-cyan-600` → `text-[#2D7EA0]`
- `text-cyan-700` → `text-[#236175]`

### Background Colors
- `bg-teal-600` → `bg-[#2D7EA0]`
- `bg-teal-700` → `bg-[#236175]`
- `bg-teal-50` → `bg-[#7AB2B2]/10`
- `bg-teal-100` → `bg-[#7AB2B2]/20`
- `bg-cyan-50` → `bg-[#7AB2B2]/10`
- `bg-cyan-100` → `bg-[#7AB2B2]/20`

### Border Colors
- `border-teal-400` → `border-[#7AB2B2]`
- `border-teal-500` → `border-[#2D7EA0]`
- `border-cyan-400` → `border-[#7AB2B2]`
- `border-cyan-500` → `border-[#2D7EA0]`

### Hover States
- `hover:bg-teal-700` → `hover:bg-[#236175]`
- `hover:bg-teal-50` → `hover:bg-[#7AB2B2]/10`
- `hover:bg-cyan-50` → `hover:bg-[#7AB2B2]/10`

### Focus States
- `focus:border-teal-500` → `focus:border-[#2D7EA0]`
- `focus:ring-teal-400` → `focus:ring-[#7AB2B2]/30`
- `focus:border-cyan-500` → `focus:border-[#2D7EA0]`
- `focus:ring-cyan-100` → `focus:ring-[#7AB2B2]/30`

### Gradients
- `from-teal-400 to-cyan-500` → `from-[#7AB2B2] to-[#2D7EA0]`
- `from-teal-500 to-cyan-500` → `from-[#2D7EA0] to-[#7AB2B2]`

## Files to Update

### Admin Pages
- `app/admin/login/page.tsx`
- `app/admin/dashboard/page.tsx`
- `app/admin/users/page.tsx`
- `app/admin/events/page.tsx`
- `app/admin/reports/page.tsx`
- `app/admin/settings/page.tsx`
- `app/admin/broadcast/page.tsx`
- `app/admin/qr-code/page.tsx`

### Admin Components
- `app/components/AdminHeader.tsx`
- `app/components/AdminSidebar.tsx` (if exists)

### Admin Hooks & Utils
- `app/admin/**/_hooks/*.ts`
- `app/admin/**/_utils/*.ts`

## Notes
- Keep green colors for success states (`green-*`)
- Keep red colors for error/danger states (`red-*`)
- Keep amber/yellow colors for warning states
- Only replace teal/cyan colors with new admin brand colors
