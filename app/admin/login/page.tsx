"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormInput } from "@/app/components/FormControl";
import { API_BASE_URL, toFriendlyErrorMessage } from "@/lib/api";

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
			const response = await fetch(`${API_BASE_URL}/auth/login`, {
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
				setErrorMessage(
					toFriendlyErrorMessage(
						error.message,
						"Masuk belum berhasil. Periksa kembali email dan kata sandi Anda.",
					),
				);
			} else {
				setErrorMessage("Masuk belum berhasil. Silakan coba lagi.");
			}
		} finally {
			setIsPending(false);
		}
	};

	return (
		<div className="min-h-screen flex">
			{/* ── Left Panel ── */}
			<div className="w-1/2 bg-[#2D7EA0] text-white p-8 flex flex-col justify-center">
				<div className="mb-6">
					<h1 className="text-xl font-bold flex items-center gap-2">
						<span className="inline-flex w-9 h-9 bg-white/20 rounded-lg items-center justify-center flex-shrink-0">
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
									d="M4 5a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM14 5a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1v-4zM14 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z"
								/>
							</svg>
						</span>
						Dasbor Admin
					</h1>
					<p className="mt-1 text-[#A8D5D5] text-xs">Aplikasi Presensi</p>
				</div>

				<div>
					<h2 className="text-base font-bold mb-3">Fitur Lengkap untuk Admin</h2>
					<ul className="space-y-2">
						{[
							{
								icon: "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z",
								title: "Kelola Data Pengguna",
								desc: "Manajemen lengkap untuk alumni",
							},
							{
								icon: "M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0zM15 11a3 3 0 11-6 0 3 3 0 016 0z",
								title: "Kelola Event",
								desc: "Buat dan kelola event dengan mudah",
							},
							{
								icon: "M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z",
								title: "Buat QR Code",
								desc: "QR Code unik untuk setiap event",
							},
							{
								icon: "M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z",
								title: "Laporan Kehadiran",
								desc: "Lihat dan unduh laporan lengkap",
							},
							{
								icon: "M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z",
								title: "Pesan Massal WhatsApp",
								desc: "Kirim notifikasi kepada peserta melalui WA",
							},
						].map((item, i) => (
							<li
								key={i}
								className="flex items-start gap-3 bg-white/10 p-3 rounded-lg"
							>
								<span className="w-7 h-7 inline-flex items-center justify-center bg-white/20 rounded-full flex-shrink-0">
									<svg
										xmlns="http://www.w3.org/2000/svg"
										className="h-4 w-4"
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
									<p className="font-semibold text-sm">{item.title}</p>
									<p className="text-xs text-[#A8D5D5]">{item.desc}</p>
								</div>
							</li>
						))}
					</ul>
					<blockquote className="mt-4 text-[#A8D5D5] italic text-xs">
						&ldquo;Barangsiapa yang memudahkan urusan orang lain, maka Allah akan
						memudahkan urusannya di dunia dan akhirat&rdquo; - HR. Muslim
					</blockquote>
				</div>
			</div>

			{/* ── Right Panel ── */}
			<div className="w-1/2 flex items-center justify-center bg-white p-8">
				<div className="w-full max-w-md">
					<div className="text-center mb-5">
						<div className="mx-auto w-11 h-11 bg-[#2D7EA0] rounded-xl flex items-center justify-center text-white shadow-md">
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
									d="M4 5a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM14 5a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1v-4zM14 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z"
								/>
							</svg>
						</div>
						<h2 className="text-xl font-bold mt-3 text-gray-800">
							Masuk sebagai Admin
						</h2>
						<p className="text-gray-500 mt-0.5 text-xs">
							Assalamualaikum, Selamat Datang Kembali
						</p>
					</div>

					<form onSubmit={handleLogin} className="space-y-3">
						{/* Email */}
						<div>
							<label className="block text-xs font-medium text-gray-700 mb-1">
								Email Administrator
							</label>
							<div className="relative">
								<span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
									<svg
										xmlns="http://www.w3.org/2000/svg"
										className="h-4 w-4"
										fill="none"
										viewBox="0 0 24 24"
										stroke="currentColor"
									>
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
											strokeWidth={2}
											d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
										/>
									</svg>
								</span>
								<FormInput
									type="email"
									value={email}
									onChange={(e) => setEmail(e.target.value)}
									placeholder="admin@pesantren.com"
									className="text-gray-500 w-full pl-9 pr-4 py-2 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#7AB2B2]/30 focus:border-[#2D7EA0] bg-gray-50"
									required
								/>
							</div>
						</div>

						{/* Password */}
						<div>
							<label className="block text-xs font-medium text-gray-700 mb-1">
								Kata Sandi
							</label>
							<div className="relative">
								<span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
									<svg
										xmlns="http://www.w3.org/2000/svg"
										className="h-4 w-4"
										fill="none"
										viewBox="0 0 24 24"
										stroke="currentColor"
									>
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
											strokeWidth={2}
											d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
										/>
									</svg>
								</span>
								<FormInput
									type={showPassword ? "text" : "password"}
									value={password}
									onChange={(e) => setPassword(e.target.value)}
									placeholder="Masukkan kata sandi admin"
									className="text-gray-500 w-full pl-9 pr-10 py-2 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#7AB2B2]/30 focus:border-[#2D7EA0] bg-gray-50"
									required
								/>
								<button
									type="button"
									onClick={() => setShowPassword(!showPassword)}
									className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
								>
									<svg
										xmlns="http://www.w3.org/2000/svg"
										className="h-4 w-4"
										fill="none"
										viewBox="0 0 24 24"
										stroke="currentColor"
									>
										{showPassword ? (
											<path
												strokeLinecap="round"
												strokeLinejoin="round"
												strokeWidth={2}
												d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
											/>
										) : (
											<path
												strokeLinecap="round"
												strokeLinejoin="round"
												strokeWidth={2}
												d="M15 12a3 3 0 11-6 0 3 3 0 016 0zM2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
											/>
										)}
									</svg>
								</button>
							</div>
						</div>

						{/* Lupa kata sandi */}
					<div className="flex justify-end">
						<Link
							href="/forgot-password"
							className="text-xs font-medium text-[#2D7EA0] hover:text-[#236175] hover:underline transition-colors"
						>
							Lupa kata sandi?
						</Link>
					</div>

					{/* Error dari API */}
						{errorMessage && (
							<div className="p-2.5 bg-red-50 border border-red-200 text-red-600 rounded-xl text-xs flex items-center gap-2">
								<svg
									xmlns="http://www.w3.org/2000/svg"
									className="h-4 w-4 flex-shrink-0"
									fill="none"
									viewBox="0 0 24 24"
									stroke="currentColor"
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={2}
										d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"
									/>
								</svg>
								{errorMessage}
							</div>
						)}

						{/* Security notice */}
						<div className="p-2.5 bg-green-50 rounded-xl border border-green-200 text-green-700 text-xs flex items-start gap-2">
							<svg
								xmlns="http://www.w3.org/2000/svg"
								className="h-4 w-4 flex-shrink-0 mt-0.5"
								fill="none"
								viewBox="0 0 24 24"
								stroke="currentColor"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
								/>
							</svg>
							<span>
								<strong>Peringatan Keamanan:</strong> Pastikan Anda memiliki
								izin akses sebelum masuk. Setiap aktivitas admin akan tercatat
								dalam catatan sistem.
							</span>
						</div>

						{/* Submit */}
						<button
							type="submit"
							disabled={isPending}
							className="w-full py-2.5 px-4 bg-[#2D7EA0] text-white font-semibold rounded-xl shadow hover:bg-[#236175] transition-colors disabled:opacity-60 flex items-center justify-center gap-2 text-sm"
						>
							{isPending ? (
								<>
									<span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
									Memproses...
								</>
							) : (
								"Masuk ke Dasbor Admin"
							)}
						</button>

						<div className="text-center text-gray-500 text-xs">
							<p>atau</p>
							<Link
								href="/alumni/login"
								className="inline-block mt-1 text-[#2D7EA0] hover:text-[#236175] hover:underline text-xs transition-colors"
							>
								← Kembali ke Halaman Masuk Alumni
							</Link>
						</div>
					</form>

					<p className="mt-4 text-center text-gray-400 text-xs">
					Jika Anda bukan administrator, silakan masuk sebagai alumni
					</p>
					<p className="mt-1 text-center text-gray-300 text-xs">
						Dilindungi dengan enkripsi ujung ke ujung | Dasbor Admin v1.0.0
					</p>
				</div>
			</div>
		</div>
	);
};

export default AdminLogin;
