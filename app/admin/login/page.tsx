"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

type LoginResponse = {
	success: boolean;
	message: string;
	data: {
		user: {
			id: number;
			name: string;
			email: string;
			phone: string | null;
			angkatan: string | null;
			role: string;
			email_verified_at: string | null;
			created_at: string;
			updated_at: string;
		};
		access_token: string;
		token_type: string;
	};
};

const AdminLogin = () => {
	const router = useRouter();

	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");

	const [showPassword, setShowPassword] = useState(false);
	const [isPending, setIsPending] = useState(false);
	const [errorMessage, setErrorMessage] = useState("");

	const handleLogin = async (e: React.FormEvent) => {
		e.preventDefault();

		setIsPending(true);
		setErrorMessage("");

		try {
			const response = await fetch("http://localhost:8000/api/auth/login", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					Accept: "application/json",
				},
				body: JSON.stringify({
					email,
					password,
				}),
			});

			const result: LoginResponse = await response.json();

			if (!response.ok || !result.success) {
				throw new Error(result.message || "Email atau password salah");
			}

			const { user, access_token, token_type } = result.data;

			if (user.role !== "admin") {
				throw new Error("Akun ini bukan admin.");
			}

			localStorage.setItem("access_token", access_token);
			localStorage.setItem("token_type", token_type);
			localStorage.setItem("user", JSON.stringify(user));
			localStorage.setItem("role", user.role);

			router.push("/admin/dashboard");
		} catch (error) {
			if (error instanceof Error) {
				setErrorMessage(error.message);
			} else {
				setErrorMessage("Terjadi kesalahan saat login");
			}
		} finally {
			setIsPending(false);
		}
	};

	return (
		<div className="min-h-screen flex">
			{/* ── Left Panel ── */}
			<div className="w-1/2 bg-gradient-to-br from-cyan-500 to-teal-500 text-white p-16 flex flex-col justify-center">
				<div className="mb-12">
					<h1 className="text-3xl font-bold flex items-center gap-3">
						<span className="inline-block w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
							<svg
								xmlns="http://www.w3.org/2000/svg"
								className="h-6 w-6"
								fill="none"
								viewBox="0 0 24 24"
								stroke="currentColor"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d="M12 11c0-1.657-1.343-3-3-3s-3 1.343-3 3 1.343 3 3 3 3-1.343 3-3zm0 0v6m0 0h6m-6 0H6"
								/>
							</svg>
						</span>
						Admin Panel
					</h1>
					<p className="mt-2 text-cyan-200">QR Event Attendance System</p>
				</div>

				<div>
					<h2 className="text-2xl font-bold mb-6">Fitur Lengkap untuk Admin</h2>
					<ul className="space-y-4">
						{[
							{
								icon: "M5.121 17.804A9 9 0 1116.879 6.196 9 9 0 015.121 17.804z",
								title: "Kelola Data User",
								desc: "Manajemen lengkap mahasiswa, alumni, dan peserta umum",
							},
							{
								icon: "M8 7V3m8 4V3M3 11h18M5 11v10a2 2 0 002 2h10a2 2 0 002-2V11",
								title: "Kelola Event",
								desc: "Buat dan kelola event dengan mudah",
							},
							{
								icon: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z",
								title: "Generate QR Code",
								desc: "QR Code unik untuk setiap event",
							},
							{
								icon: "M11 17l-5-5m0 0l5-5m-5 5h12",
								title: "Laporan Kehadiran",
								desc: "Lihat dan download laporan lengkap",
							},
							{
								icon: "M8 10h.01M12 10h.01M16 10h.01M9 16h6",
								title: "Broadcast WhatsApp",
								desc: "Kirim notifikasi ke peserta via WA",
							},
						].map((item, i) => (
							<li
								key={i}
								className="flex items-start gap-4 bg-white/10 p-4 rounded-lg"
							>
								<span className="w-8 h-8 flex items-center justify-center bg-white/20 rounded-full flex-shrink-0">
									<svg
										xmlns="http://www.w3.org/2000/svg"
										className="h-5 w-5"
										fill="none"
										viewBox="0 0 24 24"
										stroke="currentColor"
									>
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
											strokeWidth={2}
											d={item.icon}
										/>
									</svg>
								</span>
								<div>
									<p className="font-semibold">{item.title}</p>
									<p className="text-sm text-cyan-200">{item.desc}</p>
								</div>
							</li>
						))}
						</ul>
						<blockquote className="mt-8 text-cyan-100 italic text-sm">
							&ldquo;Barangsiapa yang memudahkan urusan orang lain, maka Allah akan
							memudahkan urusannya di dunia dan akhirat&rdquo; - HR. Muslim
						</blockquote>
					</div>
				</div>

				{/* ── Right Panel ── */}
			<div className="w-1/2 flex items-center justify-center bg-white p-16">
				<div className="w-full max-w-md">
					{/* Logo */}
					<div className="text-center mb-8">
						<div className="mx-auto w-14 h-14 bg-gradient-to-br from-cyan-500 to-teal-500 rounded-xl flex items-center justify-center text-white shadow-md">
							<svg
								xmlns="http://www.w3.org/2000/svg"
								className="h-7 w-7"
								fill="none"
								viewBox="0 0 24 24"
								stroke="currentColor"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d="M12 11c0-1.657-1.343-3-3-3s-3 1.343-3 3 1.343 3 3 3 3-1.343 3-3zm0 0v6m0 0h6m-6 0H6"
								/>
							</svg>
						</div>
						<h2 className="text-2xl font-bold mt-4 text-gray-800">
							Login Admin
						</h2>
						<p className="text-gray-500 mt-1 text-sm">
							Assalamualaikum, Selamat Datang Kembali
						</p>
					</div>

					<form onSubmit={handleLogin} className="space-y-4">
						{/* Email */}
						<div>
							<label className="block text-sm font-medium text-gray-700 mb-1">
								Email Administrator
							</label>
							<div className="relative">
								<span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">
									✉️
								</span>
								<input
									type="email"
									value={email}
									onChange={(e) => setEmail(e.target.value)}
									placeholder="admin@pesantren.ac.id"
									className="text-gray-500 w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent bg-gray-50"
									required
								/>
							</div>
						</div>

						{/* Password */}
						<div>
							<label className="block text-sm font-medium text-gray-700 mb-1">
								Password
							</label>
							<div className="relative">
								<span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">
									🔒
								</span>
								<input
									type={showPassword ? "text" : "password"}
									value={password}
									onChange={(e) => setPassword(e.target.value)}
									placeholder="Masukkan password admin"
									className="text-gray-500 w-full pl-9 pr-10 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent bg-gray-50"
									required
								/>
								<button
									type="button"
									onClick={() => setShowPassword(!showPassword)}
									className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
								>
									{showPassword ? "🙈" : "👁️"}
								</button>
							</div>
						</div>

						{/* Error dari API */}
						{errorMessage && (
							<div className="p-3 bg-red-50 border border-red-200 text-red-600 rounded-xl text-sm flex items-center gap-2">
								<span>⚠️</span>
								{errorMessage}
							</div>
						)}

						{/* Security notice */}
						<div className="p-3 bg-green-50 rounded-xl border border-green-200 text-green-700 text-xs flex items-start gap-2">
							<span className="mt-0.5">🔐</span>
							<span>
								<strong>Peringatan Keamanan:</strong> Pastikan Anda memiliki
								izin akses sebelum login. Setiap aktivitas admin akan tercatat
								dalam sistem log.
							</span>
						</div>

						{/* Submit */}
						<button
							type="submit"
							disabled={isPending}
							className="w-full py-3 px-4 bg-gradient-to-r from-cyan-500 to-teal-500 text-white font-semibold rounded-xl shadow hover:opacity-90 transition-opacity disabled:opacity-60 flex items-center justify-center gap-2"
						>
							{isPending ? (
								<>
									<span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
									Memproses...
								</>
							) : (
								"Masuk ke Admin Panel"
							)}
						</button>

						<div className="text-center text-gray-500 text-sm">
							<p>atau</p>
							<Link
								href="/login"
								className="inline-block mt-1 text-cyan-500 hover:underline text-sm"
							>
								← Kembali ke Login User
							</Link>
						</div>
					</form>

					<p className="mt-6 text-center text-gray-400 text-xs">
						Jika Anda bukan administrator, silakan login sebagai user
					</p>
					<p className="mt-2 text-center text-gray-300 text-xs">
						Dilindungi dengan enkripsi end-to-end | Admin Panel v1.0.0
					</p>
				</div>
			</div>
		</div>
	);
};

export default AdminLogin;
