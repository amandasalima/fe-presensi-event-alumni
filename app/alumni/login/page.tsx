import type { Metadata } from "next";
import AuthCard from "@/app/components/alumni/AuthCard";

export const metadata: Metadata = {
  title: "Masuk | Sistem Presensi Event Berbasis QR",
  description: "Masuk ke akun alumni Anda",
};

export default function LoginPage() {
  return <AuthCard defaultTab="masuk" />;
}