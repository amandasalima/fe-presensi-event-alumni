# Script untuk mengganti warna emerald/teal/green ke #41A07E dan #B2DE96
# Jalankan dari root project: pwsh update-colors.ps1

Write-Host "🎨 Memulai penggantian warna..." -ForegroundColor Cyan

$files = Get-ChildItem -Path "app","hooks","types" -Include *.tsx,*.ts -Recurse

$replacements = @{
    # Hex colors
    '#4ade80' = '#41A07E'
    '#16a34a' = '#41A07E'
    '#15803d' = '#357f65'
    '#3ecf8e' = '#41A07E'
    '#20b070' = '#357f65'
    '#ecfdf5' = '#f0fdf4'
    '#d1fae5' = '#dcfce7'
    '#a7f3d0' = '#B2DE96'
    
    # Tailwind emerald (perlu disesuaikan manual)
    'emerald-700' = '[#41A07E]'
    'emerald-600' = '[#41A07E]'
    'emerald-500' = '[#5ab494]'
    'emerald-400' = '[#5ab494]'
    'emerald-200' = '[#B2DE96]'
    'emerald-100' = '[#B2DE96]/30'
    'emerald-50' = '[#B2DE96]/10'
    
    # Tailwind teal
    'teal-700' = '[#41A07E]'
    'teal-600' = '[#41A07E]'
    'teal-500' = '[#5ab494]'
    'teal-400' = '[#5ab494]'
    'teal-200' = '[#B2DE96]'
    'teal-100' = '[#B2DE96]/30'
    'teal-50' = '[#B2DE96]/10'
    
    # Tailwind green (selective)
    'green-700' = '[#41A07E]'
    'green-600' = '[#41A07E]'
    'green-500' = '[#5ab494]'
    'green-100' = '[#B2DE96]/30'
    'green-50' = '[#B2DE96]/10'
}

foreach ($file in $files) {
    $content = Get-Content $file.FullName -Raw
    $modified = $false
    
    foreach ($old in $replacements.Keys) {
        if ($content -match [regex]::Escape($old)) {
            $content = $content -replace [regex]::Escape($old), $replacements[$old]
            $modified = $true
        }
    }
    
    if ($modified) {
        Set-Content -Path $file.FullName -Value $content -NoNewline
        Write-Host "✅ Updated: $($file.FullName)" -ForegroundColor Green
    }
}

Write-Host "`n🎉 Selesai! Silakan restart dev server." -ForegroundColor Cyan
Write-Host "⚠️  Perhatian: Beberapa warna mungkin perlu disesuaikan manual." -ForegroundColor Yellow
