"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Eye, EyeOff, Calendar, Phone } from "lucide-react";
import { useLogin } from "@/hooks/alumni/useLogin";
import { useRegister } from "@/hooks/alumni/useRegister";
import { useGoogleAuth } from "@/hooks/alumni/useGoogleAuth";
import type { LoginPayload, RegisterPayload } from "@/types/auth";

type Tab = "masuk" | "daftar";

interface AuthCardProps {
  defaultTab?: Tab;
}

/* ─── Reusable field ──────────────────────────────────────── */
function Field({
  label,
  children,
  error,
}: {
  label: string;
  children: React.ReactNode;
  error?: string;
}) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-medium text-slate-600">{label}</label>
      {children}
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}

function Input({
  className = "",
  ...props
}: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={`w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 placeholder:text-slate-400 outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 ${className}`}
      {...props}
    />
  );
}

/* ─── Login Form ──────────────────────────────────────────── */
function LoginForm() {
  const [form, setForm] = useState<LoginPayload>({
    email: "",
    password: "",
    remember: false,
  });
  const [showPass, setShowPass] = useState(false);
  const { mutate: login, isPending, error } = useLogin();

  const serverError =
    error?.response?.data?.message ?? (error ? "Terjadi kesalahan" : null);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    login(form);
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      {serverError && (
        <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600 border border-red-100">
          {serverError}
        </div>
      )}

      <Field label="Email">
        <Input
          type="email"
          placeholder="masukkan alamat email Anda"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          required
        />
      </Field>

      <Field label="Kata Sandi">
        <div className="relative">
          <Input
            type={showPass ? "text" : "password"}
            placeholder="masukkan kata sandi Anda"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            required
            className="pr-11"
          />
          <button
            type="button"
            onClick={() => setShowPass(!showPass)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition"
          >
            {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
      </Field>

      <div className="flex items-center justify-between">
        <label className="flex items-center gap-2 cursor-pointer select-none">
          <input
            type="checkbox"
            className="w-4 h-4 rounded border-slate-300 accent-emerald-500"
            checked={form.remember}
            onChange={(e) => setForm({ ...form, remember: e.target.checked })}
          />
          <span className="text-sm text-slate-600">Ingat Saya</span>
        </label>
        <Link
          href="/forgot-password"
          className="text-sm font-medium text-emerald-600 hover:text-emerald-700 transition"
        >
          Lupa kata sandi ?
        </Link>
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="mt-1 w-full rounded-xl py-3.5 text-sm font-semibold text-white shadow-md shadow-emerald-200 transition active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
        style={{
          background: "linear-gradient(135deg, #4ade80 0%, #16a34a 100%)",
        }}
      >
        {isPending ? "Memproses..." : "Masuk"}
      </button>
    </form>
  );
}

/* ─── Register Form ───────────────────────────────────────── */
function RegisterForm() {
  const currentYear = new Date().getFullYear();
  const [form, setForm] = useState<RegisterPayload>({
    name: "",
    gender: "Laki-laki",
    email: "",
    phone: "",
    angkatan: String(currentYear),
    password: "",
  });
  const [showPass, setShowPass] = useState(false);
  const { mutate: register, isPending, error } = useRegister();

  const serverError =
    error?.response?.data?.message ?? (error ? "Terjadi kesalahan" : null);
  const fieldErrors = error?.response?.data?.errors ?? {};

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    register(form);
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      {serverError && (
        <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600 border border-red-100">
          {serverError}
        </div>
      )}

      <Field label="Nama Lengkap" error={fieldErrors.name?.[0]}>
        <Input
          type="text"
          placeholder="masukkan nama lengkap Anda"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          required
        />
      </Field>

      <Field label="Jenis Kelamin" error={fieldErrors.gender?.[0]}>
        <select
          value={form.gender}
          onChange={(e) => setForm({ ...form, gender: e.target.value })}
          className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
          required
        >
          <option value="Laki-laki">Laki-laki</option>
          <option value="Perempuan">Perempuan</option>
        </select>
      </Field>

      <Field label="Email" error={fieldErrors.email?.[0]}>
        <Input
          type="email"
          placeholder="masukkan alamat email Anda"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          required
        />
      </Field>

      <Field label="No Telp" error={fieldErrors.phone?.[0]}>
        <div className="relative">
          <Input
            type="tel"
            placeholder="masukkan no telp Anda"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            required
            className="pl-10"
          />
          <Phone
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
          />
        </div>
      </Field>

      <Field label="Angkatan" error={fieldErrors.angkatan?.[0]}>
        <div className="relative">
          <Input
            type="text"
            placeholder="2015"
            value={form.angkatan}
            onChange={(e) => setForm({ ...form, angkatan: e.target.value })}
            required
            className="pr-11"
          />
          <Calendar
            size={18}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
          />
        </div>
      </Field>

      <Field label="Kata Sandi" error={fieldErrors.password?.[0]}>
        <div className="relative">
          <Input
            type={showPass ? "text" : "password"}
            placeholder="masukkan kata sandi Anda"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            required
            className="pr-11"
          />
          <button
            type="button"
            onClick={() => setShowPass(!showPass)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition"
          >
            {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
      </Field>

      <button
        type="submit"
        disabled={isPending}
        className="mt-1 w-full rounded-xl py-3.5 text-sm font-semibold text-white shadow-md shadow-emerald-200 transition active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
        style={{
          background: "linear-gradient(135deg, #4ade80 0%, #16a34a 100%)",
        }}
      >
        {isPending ? "Memproses..." : "Daftar"}
      </button>
    </form>
  );
}


/* ─── Main AuthCard ───────────────────────────────────────── */
export default function AuthCard({ defaultTab = "masuk" }: AuthCardProps) {
  const [activeTab, setActiveTab] = useState<Tab>(defaultTab);

  return (
    <div className="min-h-screen w-full flex items-start justify-center px-4 pt-10 pb-8"
      style={{
        background:
          "linear-gradient(160deg, #ecfdf5 0%, #d1fae5 40%, #a7f3d0 100%)",
      }}
    >
      <div className="w-full max-w-sm">
        {/* App label */}
        <p className="text-xs font-medium text-emerald-700 mb-5 tracking-wide">
          Sistem Presensi Event Alumni Berbasis QR
        </p>

        {/* Heading */}
        <h1 className="text-3xl font-bold text-slate-800 leading-tight mb-1">
          Get Started now
        </h1>
        <p className="text-sm text-slate-500 mb-6">
          Create an account or log in to explore about our app
        </p>

        {/* Card */}
        <div className="rounded-2xl bg-white/80 backdrop-blur-md shadow-xl shadow-emerald-100/50 p-6">
          {/* Tabs */}
          <div className="flex mb-6 rounded-xl bg-slate-100 p-1">
            {(["masuk", "daftar"] as Tab[]).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 rounded-lg py-2.5 text-sm font-semibold capitalize transition-all duration-200 ${
                  activeTab === tab
                    ? "bg-white text-slate-800 shadow-sm"
                    : "text-slate-500 hover:text-slate-700"
                }`}
              >
                {tab === "masuk" ? "Masuk" : "Daftar"}
              </button>
            ))}
          </div>

          {/* Form */}
          {activeTab === "masuk" ? <LoginForm /> : <RegisterForm />}
        </div>

        {/* Footer */}
        <p className="mt-6 text-center text-xs text-slate-500 leading-relaxed px-2">
          By signing up, you agree to the{" "}
          <Link href="/terms" className="font-semibold text-slate-700 underline underline-offset-2">
            Terms of Service
          </Link>{" "}
          and{" "}
          <Link href="/privacy" className="font-semibold text-slate-700 underline underline-offset-2">
            Data Processing Agreement
          </Link>
        </p>
      </div>
    </div>
  );
}