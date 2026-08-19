import { AxiosError } from 'axios';
import { ApiError } from './types/oauth';

export interface ErrorHandlerOptions {
  onUnauthorized?: () => void;
  onForbidden?: () => void;
  onNotFound?: () => void;
  onConflict?: () => void;
  onRateLimit?: () => void;
}

/**
 * Handle OAuth-specific errors with user-friendly messages in Bahasa Indonesia
 */
export function handleOAuthError(
  error: AxiosError<ApiError>,
  options?: ErrorHandlerOptions
): string {
  const status = error.response?.status;
  const message = error.response?.data?.message;

  switch (status) {
    case 400:
      // Invalid state or expired token - restart flow
      return message || 'Sesi telah kedaluwarsa. Silakan mulai ulang.';

    case 401:
      // Unauthorized
      options?.onUnauthorized?.();
      return message || 'Autentikasi gagal.';

    case 403:
      // Forbidden - status or role issue
      options?.onForbidden?.();
      return message || 'Akses ditolak.';

    case 404:
      // Not found - suggest registration
      options?.onNotFound?.();
      return message || 'Akun tidak ditemukan.';

    case 409:
      // Conflict - duplicate account
      options?.onConflict?.();
      return message || 'Konflik data.';

    case 422:
      // Validation error - handle separately
      return 'Validasi gagal. Periksa kembali data Anda.';

    case 429:
      // Rate limit
      options?.onRateLimit?.();
      return 'Terlalu banyak percobaan. Tunggu 1 menit dan coba lagi.';

    case 500:
      return 'Terjadi kesalahan server. Silakan coba lagi nanti.';

    default:
      return message || 'Terjadi kesalahan yang tidak diketahui.';
  }
}

/**
 * Common error messages untuk Google OAuth
 */
export const OAuthErrorMessages = {
  // Registration Errors
  duplicateGoogle: "Akun Google ini sudah terdaftar. Silakan login menggunakan Google.",
  duplicateEmail: "Email sudah terdaftar. Silakan login atau hubungkan akun Google Anda di halaman profil.",
  expiredToken: "Token registrasi tidak valid atau sudah kedaluwarsa. Silakan mulai ulang proses registrasi.",
  invalidState: "Invalid state parameter. Possible CSRF attack or expired session.",
  emailNotVerified: "Email Google Anda belum diverifikasi. Silakan verifikasi email di akun Google Anda terlebih dahulu.",

  // Login Errors
  notFound: "Akun Google ini belum terdaftar. Silakan registrasi terlebih dahulu.",
  pending: "Akun Anda masih menunggu persetujuan admin. Silakan coba lagi nanti.",
  rejected: "Akun Anda ditolak oleh admin. Silakan hubungi administrator untuk informasi lebih lanjut.",
  inactive: "Akun Anda tidak aktif. Silakan hubungi administrator.",
  adminRole: "Login dengan Google hanya tersedia untuk alumni. Admin harus login dengan email dan password.",

  // Link/Unlink Errors
  notActive: "Hanya alumni dengan status aktif yang dapat menghubungkan akun Google.",
  alreadyLinked: "Akun Google sudah terhubung. Silakan lepas hubungan terlebih dahulu jika ingin menghubungkan akun Google lain.",
  googleIdInUse: "Akun Google ini sudah terhubung dengan akun lain. Silakan gunakan akun Google yang berbeda.",
  noPassword: "Anda harus mengatur password terlebih dahulu sebelum melepas akun Google. Silakan ke halaman Ubah Password untuk mengatur password Anda.",
  notLinked: "Tidak ada akun Google yang terhubung dengan akun Anda.",
};
