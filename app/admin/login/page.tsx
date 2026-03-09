"use client";

import React, { useState } from "react";
import Link from "next/link";

const AdminLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Logic login via API nanti
    console.log({ email, password });
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Panel */}
      <div className="w-1/2 bg-gradient-to-br from-cyan-500 to-teal-500 text-white p-16 flex flex-col justify-center">
        <div className="mb-12">
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <span className="inline-block w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
              {/* icon bisa diganti dengan HeroIcon */}
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none"
                viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M12 11c0-1.657-1.343-3-3-3s-3 1.343-3 3 1.343 3 3 3 3-1.343 3-3zm0 0v6m0 0h6m-6 0H6" />
              </svg>
            </span>
            Admin Panel
          </h1>
          <p className="mt-2 text-cyan-200">QR Event Attendance System</p>
        </div>
        <div>
          <h2 className="text-2xl font-bold mb-6">Fitur Lengkap untuk Admin</h2>
          <ul className="space-y-4">
            <li className="flex items-start gap-4 bg-white/10 p-4 rounded-lg">
              <span className="w-8 h-8 flex items-center justify-center bg-white/20 rounded-full">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none"
                  viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M5.121 17.804A9 9 0 1116.879 6.196 9 9 0 015.121 17.804z" />
                </svg>
              </span>
              <div>
                <p className="font-semibold">Kelola Data User</p>
                <p className="text-sm text-cyan-200">Manajemen lengkap mahasiswa, alumni, dan peserta umum</p>
              </div>
            </li>
            <li className="flex items-start gap-4 bg-white/10 p-4 rounded-lg">
              <span className="w-8 h-8 flex items-center justify-center bg-white/20 rounded-full">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none"
                  viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M8 7V3m8 4V3M3 11h18M5 11v10a2 2 0 002 2h10a2 2 0 002-2V11" />
                </svg>
              </span>
              <div>
                <p className="font-semibold">Kelola Event</p>
                <p className="text-sm text-cyan-200">Buat dan kelola event dengan mudah</p>
              </div>
            </li>
            <li className="flex items-start gap-4 bg-white/10 p-4 rounded-lg">
              <span className="w-8 h-8 flex items-center justify-center bg-white/20 rounded-full">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none"
                  viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </span>
              <div>
                <p className="font-semibold">Generate QR Code</p>
                <p className="text-sm text-cyan-200">QR Code unik untuk setiap event</p>
              </div>
            </li>
            <li className="flex items-start gap-4 bg-white/10 p-4 rounded-lg">
              <span className="w-8 h-8 flex items-center justify-center bg-white/20 rounded-full">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none"
                  viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M11 17l-5-5m0 0l5-5m-5 5h12" />
                </svg>
              </span>
              <div>
                <p className="font-semibold">Laporan Kehadiran</p>
                <p className="text-sm text-cyan-200">Lihat dan download laporan lengkap</p>
              </div>
            </li>
            <li className="flex items-start gap-4 bg-white/10 p-4 rounded-lg">
              <span className="w-8 h-8 flex items-center justify-center bg-white/20 rounded-full">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none"
                  viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M8 10h.01M12 10h.01M16 10h.01M9 16h6" />
                </svg>
              </span>
              <div>
                <p className="font-semibold">Broadcast WhatsApp</p>
                <p className="text-sm text-cyan-200">Kirim notifikasi ke peserta via WA</p>
              </div>
            </li>
          </ul>
          <blockquote className="mt-8 text-cyan-100 italic text-sm">"Barangsiapa yang memudahkan urusan orang lain, maka Allah akan memudahkan urusannya di dunia dan akhirat" - HR. Muslim</blockquote>
        </div>
      </div>

      {/* Right Panel */}
      <div className="w-1/2 flex items-center justify-center bg-white p-16">
        <div className="w-full max-w-md">
          <div className="text-center mb-6">
            <div className="mx-auto w-12 h-12 bg-cyan-500 rounded-lg flex items-center justify-center text-white">
              {/* Icon */}
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none"
                viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M12 11c0-1.657-1.343-3-3-3s-3 1.343-3 3 1.343 3 3 3 3-1.343 3-3zm0 0v6m0 0h6m-6 0H6" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold mt-4">Login Admin</h2>
            <p className="text-gray-500 mt-1">Assalamualaikum, Selamat Datang Kembali</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Email Administrator</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@pesantren.ac.id"
                className="mt-1 block w-full px-4 py-2 border rounded-lg focus:ring-cyan-500 focus:border-cyan-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Masukkan password admin"
                  className="mt-1 block w-full px-4 py-2 border rounded-lg focus:ring-cyan-500 focus:border-cyan-500"
                  required
                />
                <button
                  type="button"
                  className="absolute right-3 top-2 text-gray-400"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? "🙈" : "👁️"}
                </button>
              </div>
            </div>

            <div className="p-3 bg-green-50 rounded border border-green-200 text-green-700 text-sm">
              Peringatan Keamanan: Pastikan Anda memiliki izin akses sebelum login. Setiap aktivitas admin akan tercatat dalam sistem log.
            </div>

            <button
              type="submit"
              className="w-full py-2 px-4 bg-gradient-to-r from-cyan-500 to-teal-500 text-white font-semibold rounded-lg shadow hover:opacity-90"
            >
              Masuk ke Admin Panel
            </button>

            <div className="text-center text-gray-500 text-sm">
              <p>atau</p>
              <Link href="/" className="inline-block mt-1 text-cyan-500 underline">
                ← Kembali ke Login User
              </Link>
            </div>
          </form>

          <p className="mt-6 text-center text-gray-400 text-xs">
            Jika Anda bukan administrator, silakan login sebagai user
          </p>

          <p className="mt-4 text-center text-gray-300 text-xs">Dilindungi dengan enkripsi end-to-end | Admin Panel v1.0.0</p>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;