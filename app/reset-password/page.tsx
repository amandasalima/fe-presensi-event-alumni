import type { Metadata } from "next";
import ResetPasswordForm from "./ResetPasswordForm";

export const metadata: Metadata = {
  title: "Reset Kata Sandi | Sistem Presensi Event Alumni Berbasis QR",
  description: "Buat kata sandi baru untuk akun Anda",
};

export default function ResetPasswordPage() {
  return <ResetPasswordForm />;
}
