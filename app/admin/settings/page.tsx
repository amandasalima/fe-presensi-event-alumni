"use client";

import { useState } from "react";
import AdminSidebar from "@/app/components/AdminSidebar";
import AdminHeader from "@/app/components/AdminHeader";
import { 
  useAdminProfile, 
  useUpdateAdminProfile, 
  useUpdatePassword, 
  useWAConfig,
  useUpdateWAConfig, 
  useSystemStatus,
  type AdminProfile,
  type SystemStatus,
  type WAConfig
} from "@/hooks/admin/useSetting";

// ─── Status Badge ─────────────────────────────────────────────────────────────
function StatusBadge({ status }: { status: string }) {
  const isOk = ["Connected", "Online", "Active", "Running"].includes(status);
  return (
    <span className={`px-3 py-1.5 rounded-xl text-sm font-semibold flex items-center gap-1.5 ${
      isOk ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"
    }`}>
      <span className={`w-2 h-2 rounded-full ${isOk ? "bg-green-500 animate-pulse" : "bg-red-400"}`} />
      {status}
    </span>
  );
}

// ─── Section Card ─────────────────────────────────────────────────────────────
function SectionCard({ title, desc, children }: {
  title: string; desc: string; children: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-3xl shadow-sm overflow-hidden">
      <div className="p-8 bg-cyan-50 border-b">
        <h2 className="text-2xl font-bold text-gray-800">{title}</h2>
        <p className="text-gray-500 mt-1 text-sm">{desc}</p>
      </div>
      <div className="p-8">{children}</div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function SettingsPage() {
  // ── Profile state ──
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  // ── Password state ──
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");

  // ── WA Config state ──
  const [apiUrl, setApiUrl] = useState("");
  const [apiToken, setApiToken] = useState("");
  const [senderNumber, setSenderNumber] = useState("");
  const [showToken, setShowToken] = useState(false);
  const [testResult, setTestResult] = useState<"success" | "error" | null>(null);

  // ── TanStack Query ──
  const { data: profile, isLoading: loadingProfile } = useAdminProfile({
    onSuccess: (data: AdminProfile) => {
      setName(data.name);
      setEmail(data.email);
    },
  });

  const { data: status, isLoading: loadingStatus } = useSystemStatus();
  const { data: waConfig, isLoading: loadingWA } = useWAConfig({
    onSuccess: (data: WAConfig) => {
      setApiUrl(data.api_url);
      setApiToken(data.api_token);
      setSenderNumber(data.sender_number);
    },
  });

  const updateProfile = useUpdateAdminProfile();
  const updatePassword = useUpdatePassword();
  const saveWAConfig = useUpdateWAConfig();

  // ── Handlers ──
  const handleSaveProfile = () => {
    updateProfile.mutate({ name, email });
  };

  const handleUpdatePassword = () => {
    setPasswordError("");
    if (newPassword !== confirmPassword) {
      setPasswordError("Password baru dan konfirmasi tidak cocok");
      return;
    }
    if (newPassword.length < 8) {
      setPasswordError("Password baru minimal 8 karakter");
      return;
    }
    updatePassword.mutate(
      { old_password: oldPassword, new_password: newPassword },
      {
        onSuccess: () => {
          setOldPassword("");
          setNewPassword("");
          setConfirmPassword("");
        },
      }
    );
  };

  const handleSaveWAConfig = () => {
    saveWAConfig.mutate({ api_url: apiUrl, api_token: apiToken, sender_number: senderNumber });
  };

  const handleTestWA = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/settings/whatsapp/test`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "application/json",
        },
      });
      setTestResult(res.ok ? "success" : "error");
    } catch {
      setTestResult("error");
    }
    setTimeout(() => setTestResult(null), 3000);
  };

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
                label: "Status Sistem", accent: "border-cyan-400",
                value: loadingStatus ? "..." : (status?.system ?? "Online"),
                sub: "Sistem berjalan normal",
                color: "text-green-600",
              },
              {
                label: "Database", accent: "border-green-400",
                value: loadingStatus ? "..." : (status?.database ?? "Connected"),
                sub: "MySQL aktif",
                color: "text-cyan-600",
              },
              {
                label: "WhatsApp API", accent: "border-purple-400",
                value: loadingStatus ? "..." : (status?.whatsapp_api ?? "Connected"),
                sub: "API terhubung",
                color: "text-green-600",
              },
            ].map((s, i) => (
              <div key={i} className={`bg-white rounded-3xl p-7 border-2 ${s.accent}`}>
                <p className="text-gray-500 text-lg">{s.label}</p>
                <h2 className={`text-3xl font-bold mt-3 ${s.color} flex items-center gap-2`}>
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
              <SectionCard title="Profil Administrator" desc="Informasi akun dan identitas admin">
                <div className="space-y-5">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Nama Administrator</label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder={loadingProfile ? "Memuat..." : "Nama administrator"}
                      disabled={loadingProfile}
                      className="w-full px-5 py-4 border border-gray-200 rounded-2xl outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100 text-sm disabled:bg-gray-50"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Email Administrator</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder={loadingProfile ? "Memuat..." : "email@pesantren.ac.id"}
                      disabled={loadingProfile}
                      className="w-full px-5 py-4 border border-gray-200 rounded-2xl outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100 text-sm disabled:bg-gray-50"
                    />
                  </div>

                  {updateProfile.isSuccess && (
                    <p className="text-sm text-green-600 flex items-center gap-2">
                      <span>✅</span> Profil berhasil diperbarui
                    </p>
                  )}
                  {updateProfile.isError && (
                    <p className="text-sm text-red-500 flex items-center gap-2">
                      <span>⚠️</span> {(updateProfile.error as Error)?.message}
                    </p>
                  )}

                  <button
                    onClick={handleSaveProfile}
                    disabled={updateProfile.isPending || loadingProfile}
                    className="px-8 py-4 bg-gradient-to-r from-teal-500 to-cyan-500 text-white rounded-2xl font-semibold shadow hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center gap-2"
                  >
                    {updateProfile.isPending && (
                      <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    )}
                    Simpan Profil
                  </button>
                </div>
              </SectionCard>

              {/* Keamanan */}
              <SectionCard title="Keamanan Akun" desc="Ubah password administrator">
                <div className="space-y-5">
                  {[
                    { label: "Password Lama", value: oldPassword, set: setOldPassword, placeholder: "Masukkan password lama" },
                    { label: "Password Baru", value: newPassword, set: setNewPassword, placeholder: "Minimal 8 karakter" },
                    { label: "Konfirmasi Password Baru", value: confirmPassword, set: setConfirmPassword, placeholder: "Ulangi password baru" },
                  ].map((field, i) => (
                    <div key={i}>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">{field.label}</label>
                      <input
                        type="password"
                        value={field.value}
                        onChange={(e) => field.set(e.target.value)}
                        placeholder={field.placeholder}
                        className="w-full px-5 py-4 border border-gray-200 rounded-2xl outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100 text-sm"
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
                      <span>⚠️</span> {(updatePassword.error as Error)?.message}
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
              <SectionCard title="Konfigurasi WhatsApp API" desc="Atur koneksi ke WhatsApp gateway">
                <div className="space-y-5">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">URL API Gateway</label>
                    <input
                      type="text"
                      value={apiUrl}
                      onChange={(e) => setApiUrl(e.target.value)}
                      placeholder="https://api.fonnte.com/send"
                      disabled={loadingWA}
                      className="w-full px-5 py-4 border border-gray-200 rounded-2xl outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100 text-sm disabled:bg-gray-50"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">API Token</label>
                    <div className="relative">
                      <input
                        type={showToken ? "text" : "password"}
                        value={apiToken}
                        onChange={(e) => setApiToken(e.target.value)}
                        placeholder="Masukkan API token"
                        disabled={loadingWA}
                        className="w-full px-5 py-4 pr-12 border border-gray-200 rounded-2xl outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100 text-sm disabled:bg-gray-50"
                      />
                      <button
                        type="button"
                        onClick={() => setShowToken(!showToken)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showToken ? "🙈" : "👁️"}
                      </button>
                    </div>
                    <p className="text-xs text-gray-400 mt-1">Token tersimpan terenkripsi di server</p>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Nomor Pengirim (Sender)</label>
                    <input
                      type="text"
                      value={senderNumber}
                      onChange={(e) => setSenderNumber(e.target.value)}
                      placeholder="628123456789"
                      disabled={loadingWA}
                      className="w-full px-5 py-4 border border-gray-200 rounded-2xl outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100 text-sm disabled:bg-gray-50"
                    />
                    <p className="text-xs text-gray-400 mt-1">Format: 62 + nomor tanpa tanda hubung</p>
                  </div>

                  {/* Test result */}
                  {testResult === "success" && (
                    <div className="p-3 bg-green-50 border border-green-200 rounded-xl text-green-700 text-sm flex items-center gap-2">
                      <span>✅</span> Koneksi WhatsApp API berhasil
                    </div>
                  )}
                  {testResult === "error" && (
                    <div className="p-3 bg-red-50 border border-red-100 rounded-xl text-red-500 text-sm flex items-center gap-2">
                      <span>⚠️</span> Koneksi gagal, periksa token dan URL API
                    </div>
                  )}

                  {saveWAConfig.isSuccess && (
                    <p className="text-sm text-green-600 flex items-center gap-2">
                      <span>✅</span> Konfigurasi WA API berhasil disimpan
                    </p>
                  )}

                  <div className="flex gap-3">
                    <button
                      onClick={handleTestWA}
                      className="px-6 py-4 border-2 border-teal-500 text-teal-600 rounded-2xl font-semibold hover:bg-teal-50 transition-colors"
                    >
                      🔌 Test Koneksi
                    </button>
                    <button
                      onClick={handleSaveWAConfig}
                      disabled={saveWAConfig.isPending}
                      className="flex-1 py-4 bg-gradient-to-r from-teal-500 to-cyan-500 text-white rounded-2xl font-semibold shadow hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {saveWAConfig.isPending && (
                        <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      )}
                      Simpan Konfigurasi
                    </button>
                  </div>
                </div>
              </SectionCard>
            </div>

            {/* ── Right Column ── */}
            <div className="space-y-8">

              {/* Avatar Card */}
              <div className="bg-white rounded-3xl p-8 shadow-sm text-center">
                <div className="w-28 h-28 rounded-full bg-gradient-to-r from-teal-500 to-cyan-500 text-white flex items-center justify-center text-4xl font-bold mb-5 mx-auto">
                  {loadingProfile ? "..." : (profile?.name?.[0]?.toUpperCase() ?? "A")}
                </div>
                <h2 className="text-2xl font-bold text-gray-800">
                  {loadingProfile ? "Memuat..." : (profile?.name ?? "Administrator")}
                </h2>
                <p className="text-gray-500 mt-1 text-sm">
                  {loadingProfile ? "" : (profile?.email ?? "admin@pesantren.ac.id")}
                </p>
                <span className="inline-block mt-3 text-xs bg-teal-50 text-teal-600 border border-teal-200 px-3 py-1 rounded-full font-medium">
                  Administrator
                </span>
                <button className="mt-5 w-full px-6 py-3 border-2 border-cyan-500 text-cyan-600 rounded-2xl font-semibold hover:bg-cyan-50 transition-colors text-sm">
                  Ubah Foto Profil
                </button>
              </div>

              {/* Status Integrasi */}
              <div className="bg-white rounded-3xl p-8 shadow-sm">
                <h2 className="text-xl font-bold text-gray-800 mb-5">Status Integrasi</h2>
                <div className="space-y-4">
                  {[
                    {
                      label: "WhatsApp API", sub: "Gateway koneksi WA",
                      bg: "bg-green-50", border: "border-green-200",
                      status: loadingStatus ? "..." : (status?.whatsapp_api ?? "Connected"),
                    },
                    {
                      label: "Database", sub: "MySQL Server",
                      bg: "bg-cyan-50", border: "border-cyan-200",
                      status: loadingStatus ? "..." : (status?.database ?? "Connected"),
                    },
                  ].map((item, i) => (
                    <div key={i} className={`p-5 ${item.bg} rounded-2xl border ${item.border} flex items-center justify-between`}>
                      <div>
                        <p className="font-semibold text-gray-800">{item.label}</p>
                        <p className="text-sm text-gray-500 mt-0.5">{item.sub}</p>
                      </div>
                      <StatusBadge status={item.status} />
                    </div>
                  ))}
                </div>
              </div>

              {/* Info Sistem */}
              <div className="bg-gradient-to-br from-teal-600 to-cyan-600 rounded-3xl p-8 text-white">
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
                      <span className="text-cyan-200 text-sm">{item.label}</span>
                      <span className="text-white font-medium text-sm">{item.value}</span>
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