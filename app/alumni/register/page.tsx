import type { Metadata } from "next";
import AuthCard from "@/app/components/alumni/AuthCard";

export const metadata: Metadata = {
  title: "Daftar | Sistem Presensi Event Alumni Berbasis QR",
  description: "Buat akun alumni baru Anda",
};

export default function RegisterPage() {
  return <AuthCard defaultTab="daftar" />;
}