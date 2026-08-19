import { Suspense } from "react";
import type { Metadata } from "next";
import ResetPasswordForm from "./ResetPasswordForm";

export const metadata: Metadata = {
  title: "Atur Ulang Kata Sandi | Sistem Presensi Event Alumni Berbasis QR",
  description: "Buat kata sandi baru untuk akun Anda",
};

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen w-full flex items-center justify-center bg-gray-50">
          <div className="flex flex-col items-center gap-2">
            <div className="w-10 h-10 border-4 border-[#0D5C3A] border-t-transparent rounded-full animate-spin"></div>
            <p className="text-gray-500 font-medium">Memuat Halaman...</p>
          </div>
        </div>
      }
    >
      <ResetPasswordForm />
    </Suspense>
  );
}
