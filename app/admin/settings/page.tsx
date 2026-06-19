"use client";

import {
	CheckCircle2,
	Edit3,
	Eye,
	EyeOff,
	PlugZap,
	Save,
	ShieldAlert,
} from "lucide-react";
import AdminSidebar from "@/app/components/AdminSidebar";
import AdminHeader from "@/app/components/AdminHeader";
import { FormInput } from "@/app/components/FormControl";
import { getApiErrorMessage } from "@/lib/api";
import { useSettingsPage } from "./_hooks/useSettingsPage";
import { DEFAULT_FONNTE_API_URL } from "./_utils/waConfig";

// ─── Status Badge ─────────────────────────────────────────────────────────────
function StatusBadge({ status }: { status: string }) {
	const isOk = ["Connected", "Online", "Active", "Running"].includes(status);
	return (
		<span
			className={`px-3 py-1.5 rounded-xl text-sm font-semibold flex items-center gap-1.5 ${
				isOk ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"
			}`}
		>
			<span
				className={`w-2 h-2 rounded-full ${isOk ? "bg-green-500 animate-pulse" : "bg-red-400"}`}
			/>
			{status}
		</span>
	);
}

// ─── Section Card ─────────────────────────────────────────────────────────────
function SectionCard({
	title,
	desc,
	children,
}: {
	title: string;
	desc: string;
	children: React.ReactNode;
}) {
	return (
		<div className="bg-white rounded-3xl shadow-sm overflow-hidden">
			<div className="p-8 bg-[#7AB2B2]/10 border-b">
				<h2 className="text-2xl font-bold text-gray-800">{title}</h2>
				<p className="text-gray-500 mt-1 text-sm">{desc}</p>
			</div>
			<div className="p-8">{children}</div>
		</div>
	);
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function SettingsPage() {
	const {
		canEditWA,
		confirmPassword,
		effectiveApiToken,
		effectiveApiUrl,
		effectiveEmail,
		effectiveName,
		effectiveSenderNumber,
		editingWA,
		handleCancelEditWA,
		handleSaveProfile,
		handleSaveWAConfig,
		handleStartEditWA,
		handleTestWA,
		handleUpdatePassword,
		isWABlocked,
		isWAConfigError,
		isWAConfigured,
		isWATestSuccess,
		loadingProfile,
		loadingStatus,
		loadingWA,
		newPassword,
		oldPassword,
		passwordError,
		profile,
		readOnlyConnected,
		saveWAConfig,
		savingWA,
		setApiToken,
		setConfirmPassword,
		setEmail,
		setName,
		setNewPassword,
		setOldPassword,
		setSenderNumber,
		setShowToken,
		setWAFormError,
		showToken,
		status,
		testError,
		testResult,
		testingWA,
		updatePassword,
		updateProfile,
		waConfig,
		waConfigError,
		waError,
		waFormError,
		waSuccess,
	} = useSettingsPage();

	return (
		<div className="h-screen bg-gray-100 flex overflow-hidden">
			<AdminSidebar />

			<div className="flex-1 ml-72 flex flex-col h-screen">
				<AdminHeader title="Pengaturan Sistem" />

				<main className="flex-1 overflow-y-auto p-8">
					{/* ── Stat Cards ── */}
					<div className="grid grid-cols-3 gap-6 mb-8">
						{[
							{
								label: "Status Sistem",
								accent: "border-[#7AB2B2]",
								value: loadingStatus ? "..." : (status?.system ?? "Online"),
								sub: "Sistem berjalan normal",
								color: "text-green-600",
							},
							{
								label: "Database",
								accent: "border-green-400",
								value: loadingStatus
									? "..."
									: (status?.database ?? "Connected"),
								sub: "MySQL aktif",
								color: "text-[#2D7EA0]",
							},
							{
								label: "WhatsApp API",
								accent: "border-purple-400",
								value: loadingStatus
									? "..."
									: (status?.whatsapp_api ?? "Connected"),
								sub: "API terhubung",
								color: "text-green-600",
							},
						].map((s, i) => (
							<div
								key={i}
								className={`bg-white rounded-3xl p-7 border-2 ${s.accent}`}
							>
								<p className="text-gray-500 text-lg">{s.label}</p>
								<h2
									className={`text-3xl font-bold mt-3 ${s.color} flex items-center gap-2`}
								>
									{!loadingStatus && (
										<span className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
									)}
									{s.value}
								</h2>
								<p className="text-gray-400 mt-2 text-sm">{s.sub}</p>
							</div>
						))}
					</div>

					<div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
						{/* ── Left Column ── */}
						<div className="xl:col-span-2 space-y-8">
							{/* Profil Admin */}
							<SectionCard
								title="Profil Administrator"
								desc="Informasi akun dan identitas admin"
							>
								<div className="space-y-5">
									<div>
										<label className="block text-sm font-semibold text-gray-700 mb-2">
											Nama Administrator
										</label>
											<FormInput
												type="text"
												value={effectiveName}
												onChange={(e) => setName(e.target.value)}
											placeholder={
												loadingProfile ? "Memuat..." : "Nama administrator"
											}
											disabled={loadingProfile}
											className="w-full px-5 py-4 border border-gray-200 rounded-2xl outline-none focus:border-[#3EBDAF] focus:ring-2 focus:ring-[#7AB2B2]/20 text-sm disabled:bg-gray-50"
										/>
									</div>
									<div>
										<label className="block text-sm font-semibold text-gray-700 mb-2">
											Email Administrator
										</label>
											<FormInput
												type="email"
												value={effectiveEmail}
												onChange={(e) => setEmail(e.target.value)}
											placeholder={
												loadingProfile ? "Memuat..." : "email@pesantren.ac.id"
											}
											disabled={loadingProfile}
											className="w-full px-5 py-4 border border-gray-200 rounded-2xl outline-none focus:border-[#3EBDAF] focus:ring-2 focus:ring-[#7AB2B2]/20 text-sm disabled:bg-gray-50"
										/>
									</div>

									{updateProfile.isSuccess && (
										<p className="text-sm text-green-600 flex items-center gap-2">
											<span>✅</span> Profil berhasil diperbarui
										</p>
									)}
									{updateProfile.isError && (
										<p className="text-sm text-red-500 flex items-center gap-2">
											<span>⚠️</span>{" "}
											{getApiErrorMessage(
												updateProfile.error,
												"Profil belum berhasil diperbarui. Silakan coba lagi.",
											)}
										</p>
									)}

									<button
										onClick={handleSaveProfile}
										disabled={updateProfile.isPending || loadingProfile}
										className="px-8 py-4 bg-[#2D7EA0] hover:bg-[#236175] text-white rounded-2xl font-semibold shadow hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center gap-2"
									>
										{updateProfile.isPending && (
											<span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
										)}
										Simpan Profil
									</button>
								</div>
							</SectionCard>

							{/* Keamanan */}
							<SectionCard
								title="Keamanan Akun"
								desc="Ubah password administrator"
							>
								<div className="space-y-5">
									{[
										{
											label: "Password Lama",
											value: oldPassword,
											set: setOldPassword,
											placeholder: "Masukkan password lama",
										},
										{
											label: "Password Baru",
											value: newPassword,
											set: setNewPassword,
											placeholder: "Minimal 8 karakter",
										},
										{
											label: "Konfirmasi Password Baru",
											value: confirmPassword,
											set: setConfirmPassword,
											placeholder: "Ulangi password baru",
										},
									].map((field, i) => (
										<div key={i}>
											<label className="block text-sm font-semibold text-gray-700 mb-2">
												{field.label}
											</label>
											<FormInput
												type="password"
												value={field.value}
												onChange={(e) => field.set(e.target.value)}
												placeholder={field.placeholder}
												className="text-gray-500 w-full px-5 py-4 border border-gray-200 rounded-2xl outline-none focus:border-[#3EBDAF] focus:ring-2 focus:ring-[#7AB2B2]/20 text-sm"
											/>
										</div>
									))}

									{passwordError && (
										<p className="text-sm text-red-500 flex items-center gap-2">
											<span>⚠️</span> {passwordError}
										</p>
									)}
									{updatePassword.isSuccess && (
										<p className="text-sm text-green-600 flex items-center gap-2">
											<span>✅</span> Password berhasil diperbarui
										</p>
									)}
									{updatePassword.isError && (
										<p className="text-sm text-red-500 flex items-center gap-2">
											<span>⚠️</span>{" "}
											{getApiErrorMessage(
												updatePassword.error,
												"Kata sandi belum berhasil diperbarui. Periksa kembali kata sandi Anda.",
											)}
										</p>
									)}

									<button
										onClick={handleUpdatePassword}
										disabled={updatePassword.isPending}
										className="px-8 py-4 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-2xl font-semibold shadow hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center gap-2"
									>
										{updatePassword.isPending && (
											<span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
										)}
										Update Password
									</button>
								</div>
							</SectionCard>

							{/* Konfigurasi WhatsApp API */}
							<SectionCard
								title="Konfigurasi WhatsApp Broadcast"
								desc="Atur koneksi Fonnte untuk broadcast WhatsApp"
							>
									<div className="space-y-5">
										<div className="p-4 bg-[#7AB2B2]/10 border border-[#7AB2B2]/20 rounded-2xl flex items-start gap-3">
											<CheckCircle2 className="w-5 h-5 text-[#2D7EA0] mt-0.5" />
											<div>
												<p className="text-sm font-semibold text-gray-800">
													Provider aktif: Fonnte
												</p>
												<p className="text-xs text-gray-500 mt-1">
													Pengaturan ini dipakai untuk broadcast WA dan test koneksi
													sebelum pengiriman massal.
												</p>
											</div>
										</div>

										{loadingWA ? (
											<div className="p-5 border border-gray-100 rounded-2xl bg-gray-50 text-sm text-gray-500">
												Memuat konfigurasi WhatsApp...
											</div>
										) : isWAConfigError ? (
											<div className="p-5 border border-red-100 rounded-2xl bg-red-50 text-sm text-red-500">
												{getApiErrorMessage(
													waConfigError,
													"Gagal memuat konfigurasi WhatsApp",
												)}
											</div>
										) : readOnlyConnected ? (
											<div className="space-y-4">
												<div className="p-5 bg-green-50 border border-green-200 rounded-2xl">
													<div className="flex items-start justify-between gap-4">
														<div>
															<p className="text-sm font-semibold text-green-700">
																Status connected
															</p>
															<p className="text-xs text-green-600 mt-1">
																Konfigurasi tersimpan siap dipakai untuk broadcast.
															</p>
														</div>
														<span className="px-3 py-1 rounded-full bg-white text-green-700 border border-green-200 text-xs font-semibold">
															{waConfig?.sender_status ?? "active"}
														</span>
													</div>
												</div>

												<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
													{[
														{ label: "Provider", value: waConfig?.provider ?? "fonnte" },
														{ label: "URL API", value: DEFAULT_FONNTE_API_URL },
														{ label: "Nomor Pengirim", value: waConfig?.sender_number ?? "-" },
														{ label: "Token", value: waConfig?.api_token || "Token tersimpan" },
														{
															label: "Koneksi",
															value: waConfig?.connected ? "connected" : "disconnected",
														},
														{
															label: "Terakhir dites",
															value: waConfig?.last_tested_at ?? "-",
														},
													].map((item) => (
														<div
															key={item.label}
															className="p-4 border border-gray-100 rounded-2xl bg-gray-50"
														>
															<p className="text-xs font-semibold text-gray-400 uppercase">
																{item.label}
															</p>
															<p className="text-sm font-semibold text-gray-800 mt-1 break-words">
																{item.value}
															</p>
														</div>
													))}
												</div>
											</div>
										) : (
											<div className="space-y-5">
												<div>
													<label className="block text-sm font-semibold text-gray-700 mb-2">
														Provider
													</label>
													<FormInput
														type="text"
														value="fonnte"
														disabled
														className="w-full px-5 py-4 border border-gray-200 rounded-2xl outline-none text-sm bg-gray-50 text-gray-500"
													/>
												</div>

												<div>
													<label className="block text-sm font-semibold text-gray-700 mb-2">
														URL API Fonnte
													</label>
													<FormInput
														type="text"
														value={effectiveApiUrl}
														readOnly
														disabled
														className="w-full px-5 py-4 border border-gray-200 rounded-2xl outline-none text-sm bg-gray-50 text-gray-500"
													/>
												</div>

												<div>
													<label className="block text-sm font-semibold text-gray-700 mb-2">
														API Token
													</label>
													<div className="relative">
														<FormInput
															type={showToken ? "text" : "password"}
															value={effectiveApiToken}
															onChange={(e) => {
																setApiToken(e.target.value);
																setWAFormError("");
															}}
															placeholder={
																isWAConfigured
																	? "Biarkan token masked jika tidak diganti"
																	: "Masukkan API token"
															}
															disabled={loadingWA || savingWA}
															className="w-full px-5 py-4 pr-12 border border-gray-200 rounded-2xl outline-none focus:border-[#3EBDAF] focus:ring-2 focus:ring-[#7AB2B2]/20 text-sm disabled:bg-gray-50"
														/>
														<button
															type="button"
															onClick={() => setShowToken(!showToken)}
															className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
															aria-label={
																showToken
																	? "Sembunyikan token"
																	: "Tampilkan token"
															}
														>
															{showToken ? (
																<EyeOff className="w-5 h-5" />
															) : (
																<Eye className="w-5 h-5" />
															)}
														</button>
													</div>
													<p className="text-xs text-gray-400 mt-1">
														{isWAConfigured
															? "Token tersimpan ditampilkan dalam bentuk masked dari backend."
															: "Token wajib diisi untuk konfigurasi baru."}
													</p>
												</div>

												<div>
													<label className="block text-sm font-semibold text-gray-700 mb-2">
														Nomor Pengirim (Sender)
													</label>
													<FormInput
														type="text"
														value={effectiveSenderNumber}
														onChange={(e) => {
															setSenderNumber(e.target.value.replace(/\D/g, ""));
															setWAFormError("");
														}}
														placeholder="628123456789"
														disabled={loadingWA || savingWA}
														className="w-full px-5 py-4 border border-gray-200 rounded-2xl outline-none focus:border-[#3EBDAF] focus:ring-2 focus:ring-[#7AB2B2]/20 text-sm disabled:bg-gray-50"
													/>
													<p className="text-xs text-gray-400 mt-1">
														Format: angka saja, diawali 62.
													</p>
												</div>
											</div>
										)}

									{/* Test result */}
									{isWATestSuccess && (
										<div className="p-4 bg-green-50 border border-green-200 rounded-xl text-green-700 text-sm flex items-start gap-2">
											<CheckCircle2 className="w-5 h-5 mt-0.5" />
											<div>
												<p className="font-semibold">
													Koneksi Fonnte berhasil
												</p>
												<p className="text-green-600 mt-1">
													{testResult?.message ??
														"Nomor pengirim siap dipakai untuk broadcast WA."}
												</p>
											</div>
										</div>
									)}
									{isWABlocked && (
										<div className="p-4 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm flex items-start gap-2">
											<ShieldAlert className="w-5 h-5 mt-0.5" />
											<div>
												<p className="font-semibold">
													Nomor WhatsApp terindikasi terblokir
												</p>
												<p className="text-red-500 mt-1">
													{testResult?.blocked_reason ??
														testResult?.message ??
														"Jangan lanjutkan broadcast sampai nomor sender aktif kembali di Fonnte."}
												</p>
											</div>
										</div>
									)}
									{testError && (
										<div className="p-4 bg-red-50 border border-red-100 rounded-xl text-red-500 text-sm flex items-start gap-2">
											<ShieldAlert className="w-5 h-5 mt-0.5" />
											<div>
												<p className="font-semibold">Test koneksi gagal</p>
												<p className="mt-1">{testError}</p>
											</div>
										</div>
									)}
									{waFormError && (
										<div className="p-4 bg-red-50 border border-red-100 rounded-xl text-red-500 text-sm flex items-start gap-2">
											<ShieldAlert className="w-5 h-5 mt-0.5" />
											<div>
												<p className="font-semibold">Form belum valid</p>
												<p className="mt-1">{waFormError}</p>
											</div>
										</div>
									)}

									{saveWAConfig.isSuccess && (
										<p className="text-sm text-green-600 flex items-center gap-2">
											<CheckCircle2 className="w-4 h-4" /> Konfigurasi WA API
											berhasil disimpan
										</p>
									)}
									{saveWAConfig.isError && (
										<p className="text-sm text-red-500 flex items-center gap-2">
											<ShieldAlert className="w-4 h-4" />{" "}
											{getApiErrorMessage(
												saveWAConfig.error,
												"Gagal menyimpan konfigurasi WA",
											)}
										</p>
									)}

									<div className="flex flex-wrap gap-3">
										<button
											onClick={handleTestWA}
											disabled={loadingWA || testingWA}
											className="px-6 py-4 border-2 border-[#3EBDAF] text-[#2D7EA0] rounded-2xl font-semibold hover:bg-[#7AB2B2]/10 transition-colors disabled:opacity-50 flex items-center gap-2"
										>
											{testingWA ? (
												<span className="w-4 h-4 border-2 border-[#3EBDAF] border-t-transparent rounded-full animate-spin" />
											) : (
												<PlugZap className="w-5 h-5" />
											)}
											Test Koneksi
										</button>
										{readOnlyConnected ? (
											<button
												onClick={handleStartEditWA}
												disabled={!canEditWA}
												className="flex-1 min-w-48 py-4 bg-[#2D7EA0] hover:bg-[#236175] text-white rounded-2xl font-semibold shadow hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
											>
												<Edit3 className="w-5 h-5" />
												Edit
											</button>
										) : (
											<>
												{isWAConfigured && (
													<button
														onClick={handleCancelEditWA}
														disabled={savingWA}
														className="px-6 py-4 border-2 border-gray-200 text-gray-600 rounded-2xl font-semibold hover:bg-gray-50 transition-colors disabled:opacity-50"
													>
														Batal
													</button>
												)}
												<button
													onClick={handleSaveWAConfig}
													disabled={savingWA || loadingWA}
													className="flex-1 min-w-48 py-4 bg-[#2D7EA0] hover:bg-[#236175] text-white rounded-2xl font-semibold shadow hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
												>
													{savingWA && (
														<span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
													)}
													{!savingWA && <Save className="w-5 h-5" />}
													Simpan Konfigurasi
												</button>
											</>
											)}
									</div>
									<div className="sr-only" aria-live="polite">
										{loadingWA ? "loading" : ""}
										{readOnlyConnected ? "readOnlyConnected" : ""}
										{editingWA ? "editing" : ""}
										{savingWA ? "saving" : ""}
										{testingWA ? "testing" : ""}
										{waError ? "error" : ""}
										{waSuccess ? "success" : ""}
									</div>
								</div>
							</SectionCard>
						</div>

						{/* ── Right Column ── */}
						<div className="space-y-8">
							{/* Avatar Card */}
							<div className="bg-white rounded-3xl p-8 shadow-sm text-center">
								<div className="w-28 h-28 rounded-full bg-[#2D7EA0] hover:bg-[#236175] text-white flex items-center justify-center text-4xl font-bold mb-5 mx-auto">
									{loadingProfile
										? "..."
										: (profile?.name?.[0]?.toUpperCase() ?? "A")}
								</div>
								<h2 className="text-2xl font-bold text-gray-800">
									{loadingProfile
										? "Memuat..."
										: (profile?.name ?? "Administrator")}
								</h2>
								<p className="text-gray-500 mt-1 text-sm">
									{loadingProfile
										? ""
										: (profile?.email ?? "admin@pesantren.ac.id")}
								</p>
								<span className="inline-block mt-3 text-xs bg-[#7AB2B2]/10 text-[#2D7EA0] border border-teal-200 px-3 py-1 rounded-full font-medium">
									Administrator
								</span>
								<button className="mt-5 w-full px-6 py-3 border-2 border-[#3EBDAF] text-[#2D7EA0] rounded-2xl font-semibold hover:bg-[#7AB2B2]/10 transition-colors text-sm">
									Ubah Foto Profil
								</button>
							</div>

							{/* Status Integrasi */}
							<div className="bg-white rounded-3xl p-8 shadow-sm">
								<h2 className="text-xl font-bold text-gray-800 mb-5">
									Status Integrasi
								</h2>
								<div className="space-y-4">
									{[
										{
											label: "WhatsApp API",
											sub: "Gateway koneksi WA",
											bg: "bg-green-50",
											border: "border-green-200",
											status: loadingStatus
												? "..."
												: (status?.whatsapp_api ?? "Connected"),
										},
										{
											label: "Database",
											sub: "MySQL Server",
											bg: "bg-[#7AB2B2]/10",
											border: "border-cyan-200",
											status: loadingStatus
												? "..."
												: (status?.database ?? "Connected"),
										},
									].map((item, i) => (
										<div
											key={i}
											className={`p-5 ${item.bg} rounded-2xl border ${item.border} flex items-center justify-between`}
										>
											<div>
												<p className="font-semibold text-gray-800">
													{item.label}
												</p>
												<p className="text-sm text-gray-500 mt-0.5">
													{item.sub}
												</p>
											</div>
											<StatusBadge status={item.status} />
										</div>
									))}
								</div>
							</div>

							{/* Info Sistem */}
							<div className="bg-gradient-to-br from-[#2D7EA0] to-[#2D7EA0] rounded-3xl p-8 text-white">
								<h2 className="text-xl font-bold mb-5">Informasi Sistem</h2>
								<div className="space-y-3">
									{[
										{ label: "Versi Sistem", value: "1.0.0" },
										{ label: "Frontend", value: "Next.js 16" },
										{ label: "Backend", value: "Laravel API" },
										{ label: "Database", value: "MySQL" },
										{ label: "Auth", value: "Laravel Sanctum" },
									].map((item, i) => (
										<div key={i} className="flex justify-between items-center">
											<span className="text-cyan-200 text-sm">
												{item.label}
											</span>
											<span className="text-white font-medium text-sm">
												{item.value}
											</span>
										</div>
									))}
								</div>
							</div>
						</div>
					</div>

					<footer className="mt-10 text-center text-gray-400 text-xs pb-8">
						© 2026 QR Event Attendance System - Pesantren
					</footer>
				</main>
			</div>
		</div>
	);
}
