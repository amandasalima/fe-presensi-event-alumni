"use client";

import React, { useState } from "react";
import Link from "next/link";
import { AlertCircle, ArrowLeft, Mail, CheckCircle2 } from "lucide-react";
import { FormInput } from "@/app/components/FormControl";
import { API_BASE_URL, getApiErrorMessage } from "@/lib/api";

export default function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [isPending, setIsPending] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const emailError = !email.trim()
    ? "Email wajib diisi."
    : !emailPattern.test(email)
      ? "Email harus berisi alamat yang benar."
      : undefined;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitted(true);

    if (emailError) return;

    setIsPending(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      const response = await fetch(`${API_BASE_URL}/auth/forgot-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        // Build a synthetic error to leverage existing helper
        const error = new Error(
          data?.message || `Request failed with status code ${response.status}`,
        );
        throw Object.assign(error, {
          response: { status: response.status, data },
        });
      }

      // Show success message from API (or a generic fallback)
      setSuccessMessage(
        data?.message ||
          "Jika email terdaftar, kami telah mengirimkan tautan untuk mereset kata sandi Anda.",
      );
    } catch (error) {
      setErrorMessage(
        getApiErrorMessage(
          error,
          "Permintaan belum berhasil diproses. Silakan coba lagi.",
        ),
      );
    } finally {
      setIsPending(false);
    }
  }

  return (
    <div
      className="min-h-dvh w-full flex items-start justify-center px-3 sm:px-4 md:px-8 pt-8 sm:pt-10 md:pt-12 pb-8"
      style={{
        background:
          "linear-gradient(160deg, #f0fdf4 0%, #dcfce7 40%, #B2DE96 100%)",
      }}
    >
      <div className="w-full max-w-sm md:max-w-md min-w-0">
        {/* App label */}
        <p className="text-xs font-medium text-[#357f65] mb-5 tracking-wide">
          Sistem Presensi Event Alumni Berbasis QR
        </p>

        {/* Heading */}
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 leading-tight mb-1">
          Lupa Kata Sandi
        </h1>
        <p className="text-sm text-slate-500 mb-6">
          Masukkan email Anda untuk menerima tautan reset kata sandi
        </p>

        {/* Card */}
        <div className="rounded-2xl bg-white/80 backdrop-blur-md shadow-xl shadow-[#B2DE96]/30 p-4 sm:p-6">
          {/* Success state */}
          {successMessage ? (
            <div className="flex flex-col items-center text-center gap-4 py-4">
              <div className="w-14 h-14 rounded-full bg-emerald-100 flex items-center justify-center">
                <CheckCircle2 size={28} className="text-emerald-600" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-800 mb-2">
                  Email Terkirim
                </h2>
                <p className="text-sm text-slate-600 leading-relaxed">
                  {successMessage}
                </p>
              </div>
              <Link
                href="/alumni/login"
                className="mt-2 inline-flex items-center gap-2 text-sm font-medium text-[#41A07E] hover:text-[#357f65] transition"
              >
                <ArrowLeft size={16} />
                Kembali ke halaman masuk
              </Link>
            </div>
          ) : (
            <form
              onSubmit={handleSubmit}
              className="flex flex-col gap-4"
              noValidate
            >
              {/* Error banner */}
              {errorMessage && (
                <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600 border border-red-100 flex items-center gap-2">
                  <AlertCircle size={16} className="flex-shrink-0" />
                  {errorMessage}
                </div>
              )}

              {/* Email field */}
              <div className="flex flex-col gap-1">
                <label className="text-xs font-medium text-slate-600">
                  Email
                </label>
                <div className="relative">
                  <FormInput
                    type="email"
                    placeholder="masukkan alamat email Anda"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    aria-invalid={
                      (submitted && Boolean(emailError)) || undefined
                    }
                    className={`w-full rounded-xl border bg-white pl-10 pr-4 py-3 text-sm text-slate-800 placeholder:text-slate-400 outline-none transition focus:ring-2 ${
                      submitted && emailError
                        ? "border-red-300 focus:border-red-400 focus:ring-red-100"
                        : "border-slate-200 focus:border-[#41A07E] focus:ring-[#B2DE96]/30"
                    }`}
                    required
                    id="forgot-password-email"
                  />
                  <Mail
                    size={16}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                  />
                </div>
                {submitted && emailError && (
                  <p className="flex items-center gap-1 text-xs font-medium text-red-500">
                    <AlertCircle size={12} />
                    {emailError}
                  </p>
                )}
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={isPending}
                className="mt-1 w-full rounded-xl bg-[#41A07E] py-3.5 text-sm font-semibold text-white shadow-md shadow-[#B2DE96]/30 transition-colors hover:bg-[#357f65] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-70"
                id="forgot-password-submit"
              >
                {isPending ? "Mengirim..." : "Kirim Tautan Reset"}
              </button>

              {/* Back to login */}
              <Link
                href="/alumni/login"
                className="inline-flex items-center justify-center gap-2 text-sm font-medium text-[#41A07E] hover:text-[#357f65] transition"
              >
                <ArrowLeft size={16} />
                Kembali ke halaman masuk
              </Link>
            </form>
          )}
        </div>

        {/* Footer */}
        <p className="mt-6 text-center text-xs text-slate-500 leading-relaxed px-2">
          Periksa folder spam jika email tidak ditemukan di kotak masuk.
        </p>
      </div>
    </div>
  );
}
