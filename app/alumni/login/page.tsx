import { Suspense } from "react";
import type { Metadata } from "next";
import AuthCard from "@/app/components/alumni/AuthCard";

export const metadata: Metadata = {
  title: "Masuk | Sistem Presensi Event Alumni Berbasis QR",
  description: "Masuk ke akun alumni Anda",
};

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-dvh w-full flex items-center justify-center bg-gradient-to-br from-[#E8F5E9]/70 via-[#F4F9F6] to-white">
          <div className="flex flex-col items-center gap-2">
            <div className="w-10 h-10 border-4 border-[#0D5C3A] border-t-transparent rounded-full animate-spin"></div>
            <p className="text-[#0D5C3A] font-semibold text-sm">
              Memuat Halaman Masuk...
            </p>
          </div>
        </div>
      }
    >
      <AuthCard defaultTab="masuk" />
    </Suspense>
  );
}