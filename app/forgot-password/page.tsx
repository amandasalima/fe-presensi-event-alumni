import type { Metadata } from "next";
import ForgotPasswordForm from "./ForgotPasswordForm";

export const metadata: Metadata = {
  title: "Lupa Kata Sandi | Sistem Presensi Event Alumni Berbasis QR",
  description: "Reset kata sandi akun Anda",
};

export default function ForgotPasswordPage() {
  return <ForgotPasswordForm />;
}
