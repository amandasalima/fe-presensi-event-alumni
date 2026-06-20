"use client";

import React, { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  Eye,
  EyeOff,
  Lock,
} from "lucide-react";
import { FormInput } from "@/app/components/FormControl";
import { getApiErrorMessage } from "@/lib/api";

/* ─── Password strength (reused from AuthCard pattern) ─── */
function getPasswordStrength(password: string) {
  const checks = [
    password.length >= 8,
    /[a-z]/.test(password),
    /[A-Z]/.test(password),
    /\d/.test(password),
    /[^A-Za-z0-9]/.test(password),
  ];
  const score = checks.filter(Boolean).length;

  if (!password) {
    return {
      score: 0,
      label: "Belum diisi",
      color: "bg-slate-200",
      textColor: "text-slate-500",
    };
  }
  if (score <= 2) {
    return {
      score,
      label: "Lemah",
      color: "bg-red-400",
      textColor: "text-red-500",
    };
  }
  if (score === 3) {
    return {
      score,
      label: "Cukup",
      color: "bg-amber-400",
      textColor: "text-amber-500",
    };
  }
  if (score === 4) {
    return {
      score,
      label: "Kuat",
      color: "bg-[#41A07E]",
      textColor: "text-[#357f65]",
    };
  }
  return {
    score,
    label: "Sangat kuat",
    color: "bg-emerald-600",
    textColor: "text-emerald-600",
  };
}

function PasswordStrength({ password }: { password: string }) {
  const strength = getPasswordStrength(password);
  const requirements = [
    { met: password.length >= 8, label: "8 karakter" },
    { met: /[A-Z]/.test(password), label: "huruf besar" },
    { met: /\d/.test(password), label: "angka" },
    { met: /[^A-Za-z0-9]/.test(password), label: "simbol" },
  ];

  if (!password) return null;

  return (
    <div className="mt-2 space-y-2">
      <div className="flex items-center gap-2">
        <div className="grid flex-1 grid-cols-5 gap-1">
          {Array.from({ length: 5 }, (_, index) => (
            <span
              key={index}
              className={`h-1.5 rounded-full ${
                index < strength.score ? strength.color : "bg-slate-100"
              }`}
            />
          ))}
        </div>
        <span
          className={`w-20 text-right text-xs font-semibold ${strength.textColor}`}
        >
          {strength.label}
        </span>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {requirements.map((item) => (
          <span
            key={item.label}
            className={`rounded-full px-2 py-1 text-[11px] font-medium ${
              item.met
                ? "bg-emerald-50 text-emerald-600"
                : "bg-slate-100 text-slate-500"
            }`}
          >
            {item.label}
          </span>
        ))}
      </div>
    </div>
  );
}

/* ─── Inner form (needs useSearchParams → Suspense boundary) ─── */
function ResetPasswordInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";
  const email = searchParams.get("email") || "";

  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [success, setSuccess] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // Missing token/email guard
  const isMissingParams = !token || !email;

  const passwordError = !password
    ? "Kata sandi wajib diisi."
    : password.length < 8
      ? `Kata sandi minimal 8 karakter (${8 - password.length} lagi).`
      : undefined;

  const confirmError = !passwordConfirmation
    ? "Konfirmasi kata sandi wajib diisi."
    : password !== passwordConfirmation
      ? "Konfirmasi kata sandi tidak sama."
      : undefined;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitted(true);

    if (passwordError || confirmError) return;

    setIsPending(true);
    setErrorMessage("");

    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          email,
          token,
          password,
          password_confirmation: passwordConfirmation,
        }),
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        const error = new Error(
          data?.message || `Request failed with status code ${response.status}`,
        );
        throw Object.assign(error, {
          response: { status: response.status, data },
        });
      }

      setSuccess(true);

      // Auto-redirect after 3 seconds
      setTimeout(() => {
        router.push("/alumni/login");
      }, 3000);
    } catch (error) {
      setErrorMessage(
        getApiErrorMessage(
          error,
          "Reset kata sandi belum berhasil. Silakan coba lagi.",
        ),
      );
    } finally {
      setIsPending(false);
    }
  }

  // Missing params state
  if (isMissingParams) {
    return (
      <div className="flex flex-col items-center text-center gap-4 py-4">
        <div className="w-14 h-14 rounded-full bg-amber-100 flex items-center justify-center">
          <AlertCircle size={28} className="text-amber-600" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-slate-800 mb-2">
            Tautan Tidak Valid
          </h2>
          <p className="text-sm text-slate-600 leading-relaxed">
            Tautan reset kata sandi tidak lengkap atau sudah kedaluwarsa.
            Silakan minta tautan baru.
          </p>
        </div>
        <Link
          href="/forgot-password"
          className="mt-2 inline-flex items-center gap-2 text-sm font-medium text-[#41A07E] hover:text-[#357f65] transition"
        >
          <ArrowLeft size={16} />
          Minta tautan baru
        </Link>
      </div>
    );
  }

  // Success state
  if (success) {
    return (
      <div className="flex flex-col items-center text-center gap-4 py-4">
        <div className="w-14 h-14 rounded-full bg-emerald-100 flex items-center justify-center">
          <CheckCircle2 size={28} className="text-emerald-600" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-slate-800 mb-2">
            Kata Sandi Berhasil Diubah
          </h2>
          <p className="text-sm text-slate-600 leading-relaxed">
            Kata sandi Anda telah berhasil direset. Anda akan dialihkan ke
            halaman login dalam beberapa detik...
          </p>
        </div>
        <Link
          href="/alumni/login"
          className="mt-2 inline-flex items-center gap-2 text-sm font-medium text-[#41A07E] hover:text-[#357f65] transition"
        >
          <ArrowLeft size={16} />
          Masuk sekarang
        </Link>
      </div>
    );
  }

  // Form state
  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
      {/* Error banner */}
      {errorMessage && (
        <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600 border border-red-100 flex items-center gap-2">
          <AlertCircle size={16} className="flex-shrink-0" />
          {errorMessage}
        </div>
      )}

      {/* Email indicator (read-only) */}
      <div className="rounded-xl bg-slate-50 px-4 py-3 text-sm text-slate-600 border border-slate-200">
        Reset kata sandi untuk:{" "}
        <strong className="text-slate-800">{email}</strong>
      </div>

      {/* Password */}
      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium text-slate-600">
          Kata Sandi Baru
        </label>
        <div className="relative">
          <FormInput
            type={showPass ? "text" : "password"}
            placeholder="masukkan kata sandi baru (min. 8 karakter)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            aria-invalid={
              (submitted && Boolean(passwordError)) || undefined
            }
            className={`w-full rounded-xl border bg-white pl-10 pr-11 py-3 text-sm text-slate-800 placeholder:text-slate-400 outline-none transition focus:ring-2 ${
              submitted && passwordError
                ? "border-red-300 focus:border-red-400 focus:ring-red-100"
                : "border-slate-200 focus:border-[#41A07E] focus:ring-[#B2DE96]/30"
            }`}
            required
            id="reset-password-new"
          />
          <Lock
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
          />
          <button
            type="button"
            onClick={() => setShowPass(!showPass)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition"
          >
            {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
        {submitted && passwordError && (
          <p className="flex items-center gap-1 text-xs font-medium text-red-500">
            <AlertCircle size={12} />
            {passwordError}
          </p>
        )}
        <PasswordStrength password={password} />
      </div>

      {/* Confirm Password */}
      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium text-slate-600">
          Konfirmasi Kata Sandi
        </label>
        <div className="relative">
          <FormInput
            type={showConfirmPass ? "text" : "password"}
            placeholder="ulangi kata sandi baru Anda"
            value={passwordConfirmation}
            onChange={(e) => setPasswordConfirmation(e.target.value)}
            aria-invalid={
              (submitted && Boolean(confirmError)) || undefined
            }
            className={`w-full rounded-xl border bg-white pl-10 pr-11 py-3 text-sm text-slate-800 placeholder:text-slate-400 outline-none transition focus:ring-2 ${
              submitted && confirmError
                ? "border-red-300 focus:border-red-400 focus:ring-red-100"
                : "border-slate-200 focus:border-[#41A07E] focus:ring-[#B2DE96]/30"
            }`}
            required
            id="reset-password-confirm"
          />
          <Lock
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
          />
          <button
            type="button"
            onClick={() => setShowConfirmPass(!showConfirmPass)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition"
          >
            {showConfirmPass ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
        {submitted && confirmError && (
          <p className="flex items-center gap-1 text-xs font-medium text-red-500">
            <AlertCircle size={12} />
            {confirmError}
          </p>
        )}
        {!confirmError && passwordConfirmation && (
          <p className="flex items-center gap-1 text-xs font-medium text-emerald-600">
            <CheckCircle2 size={12} />
            Kata sandi sudah sama.
          </p>
        )}
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={isPending}
        className="mt-1 w-full rounded-xl bg-[#41A07E] py-3.5 text-sm font-semibold text-white shadow-md shadow-[#B2DE96]/30 transition-colors hover:bg-[#357f65] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-70"
        id="reset-password-submit"
      >
        {isPending ? "Memproses..." : "Ubah Kata Sandi"}
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
  );
}

/* ─── Main wrapper ─── */
export default function ResetPasswordForm() {
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
          Reset Kata Sandi
        </h1>
        <p className="text-sm text-slate-500 mb-6">
          Buat kata sandi baru untuk akun Anda
        </p>

        {/* Card */}
        <div className="rounded-2xl bg-white/80 backdrop-blur-md shadow-xl shadow-[#B2DE96]/30 p-4 sm:p-6">
          <Suspense
            fallback={
              <div className="flex items-center justify-center py-8">
                <span className="w-6 h-6 border-2 border-[#41A07E] border-t-transparent rounded-full animate-spin" />
              </div>
            }
          >
            <ResetPasswordInner />
          </Suspense>
        </div>

        {/* Footer */}
        <p className="mt-6 text-center text-xs text-slate-500 leading-relaxed px-2">
          Tautan reset kata sandi hanya berlaku untuk satu kali penggunaan.
        </p>
      </div>
    </div>
  );
}
