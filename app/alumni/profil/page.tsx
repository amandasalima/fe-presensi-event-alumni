"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  useMyProfile,
  useUpdateMyProfile,
  useUpdateMyPassword,
} from "@/hooks/alumni/useAlumniHooks";
import {
  User,
  Lock,
  LogOut,
  Mail,
  Phone,
  Calendar,
  Layers,
  Users,
  ArrowLeft,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
} from "lucide-react";

export default function AlumniProfilePage() {
  const router = useRouter();
  const { data: profile, isLoading } = useMyProfile();
  const updateProfileMutation = useUpdateMyProfile();
  const updatePasswordMutation = useUpdateMyPassword();

  const [activeTab, setActiveTab] = useState<"info" | "security">("info");

  // Form Profile State
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    phone: "",
    angkatan: "",
    gender: "L",
    status: "alumni",
  });

  // Form Password State
  const [passwordData, setPasswordData] = useState({
    old_password: "",
    new_password: "",
    confirm_password: "",
  });

  const [showPasswords, setShowPasswords] = useState({
    old: false,
    new: false,
    confirm: false,
  });

  const [alert, setAlert] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  // Sync profile data to form once loaded
  useEffect(() => {
    if (profile) {
      setFormData({
        first_name: profile.first_name || "",
        last_name: profile.last_name || "",
        phone: profile.phone || "",
        angkatan: profile.angkatan || "",
        gender: profile.gender || "L",
        status: profile.status || "alumni",
      });
    }
  }, [profile]);

  const handleProfileChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPasswordData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAlert(null);

    if (!formData.first_name.trim()) {
      setAlert({ type: "error", message: "Nama depan wajib diisi" });
      return;
    }

    try {
      await updateProfileMutation.mutateAsync(formData);
      setAlert({
        type: "success",
        message: "Profil Anda berhasil diperbarui secara lokal!",
      });
      // Auto clear alert after 3 seconds
      setTimeout(() => setAlert(null), 3000);
    } catch (err: any) {
      setAlert({
        type: "error",
        message: err.message || "Gagal memperbarui profil",
      });
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAlert(null);

    if (!passwordData.old_password) {
      setAlert({ type: "error", message: "Kata sandi lama wajib diisi" });
      return;
    }

    if (passwordData.new_password.length < 6) {
      setAlert({
        type: "error",
        message: "Kata sandi baru minimal 6 karakter",
      });
      return;
    }

    if (passwordData.new_password !== passwordData.confirm_password) {
      setAlert({
        type: "error",
        message: "Konfirmasi kata sandi baru tidak cocok",
      });
      return;
    }

    try {
      await updatePasswordMutation.mutateAsync({
        old_password: passwordData.old_password,
        new_password: passwordData.new_password,
      });
      setAlert({
        type: "success",
        message: "Kata sandi berhasil diperbarui secara lokal!",
      });
      setPasswordData({ old_password: "", new_password: "", confirm_password: "" });
      setTimeout(() => setAlert(null), 3000);
    } catch (err: any) {
      setAlert({
        type: "error",
        message: err.message || "Gagal memperbarui kata sandi",
      });
    }
  };

  const handleLogout = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("alumni_token");
      localStorage.removeItem("token");
      localStorage.removeItem("role");
      localStorage.removeItem("dummy_profile");
    }
    router.push("/alumni/login");
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-4">
        <Loader2 className="w-10 h-10 text-teal-600 animate-spin" />
        <span className="text-sm text-gray-500 font-medium">Memuat profil...</span>
      </div>
    );
  }

  const userInitials = profile
    ? `${profile.first_name?.[0] || ""}${profile.last_name?.[0] || ""}`.toUpperCase()
    : "A";

  const userFullName = profile
    ? `${profile.first_name || ""} ${profile.last_name || ""}`.trim()
    : "Alumni";

  return (
    <div className="space-y-5 pb-6">
      {/* Header & Back Button */}
      <div className="space-y-3">
        <button
          onClick={() => router.push("/alumni/dashboard")}
          className="flex items-center gap-2 text-gray-500 hover:text-gray-700 text-sm font-semibold transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali ke Dashboard</span>
        </button>

        <div>
          <h1 className="text-xl font-bold text-gray-900">Profil Saya</h1>
          <p className="text-xs text-gray-400 mt-0.5">
            Kelola informasi pribadi dan keamanan akun Anda
          </p>
        </div>
      </div>

      {/* Profile Overview Card */}
      <div className="bg-white rounded-3xl p-5 border border-gray-100 shadow-sm flex items-center gap-4">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-teal-500 to-emerald-600 flex items-center justify-center text-white text-xl font-black shadow-md shadow-teal-100 flex-shrink-0">
          {userInitials}
        </div>
        <div className="space-y-1 min-w-0">
          <h2 className="font-bold text-gray-800 text-base truncate">
            {userFullName}
          </h2>
          <p className="text-xs text-gray-400 truncate">{profile?.email}</p>
          <span className="inline-block text-[10px] uppercase tracking-wider font-extrabold bg-teal-50 text-teal-600 px-2 py-0.5 rounded-md border border-teal-100">
            {profile?.status || "Alumni"}
          </span>
        </div>
      </div>

      {/* Tab Selector */}
      <div className="flex bg-gray-100/80 p-1 rounded-2xl border border-gray-200/20">
        <button
          onClick={() => {
            setActiveTab("info");
            setAlert(null);
          }}
          className={`flex-1 py-2 text-xs font-bold rounded-xl transition flex items-center justify-center gap-1.5 ${
            activeTab === "info"
              ? "bg-white text-teal-700 shadow-sm"
              : "text-gray-400 hover:text-gray-600"
          }`}
        >
          <User className="w-4 h-4" />
          <span>Data Diri</span>
        </button>
        <button
          onClick={() => {
            setActiveTab("security");
            setAlert(null);
          }}
          className={`flex-1 py-2 text-xs font-bold rounded-xl transition flex items-center justify-center gap-1.5 ${
            activeTab === "security"
              ? "bg-white text-teal-700 shadow-sm"
              : "text-gray-400 hover:text-gray-600"
          }`}
        >
          <Lock className="w-4 h-4" />
          <span>Keamanan</span>
        </button>
      </div>

      {/* Alerts */}
      {alert && (
        <div
          className={`p-3.5 rounded-2xl border text-xs flex gap-2.5 items-start ${
            alert.type === "success"
              ? "bg-emerald-50 text-emerald-800 border-emerald-100"
              : "bg-red-50 text-red-800 border-red-100"
          }`}
        >
          {alert.type === "success" ? (
            <CheckCircle2 className="w-4.5 h-4.5 text-emerald-600 flex-shrink-0" />
          ) : (
            <AlertCircle className="w-4.5 h-4.5 text-red-600 flex-shrink-0" />
          )}
          <span className="leading-normal">{alert.message}</span>
        </div>
      )}

      {/* Form Content */}
      <div className="bg-white rounded-3xl p-5 border border-gray-100 shadow-sm">
        {activeTab === "info" ? (
          <form onSubmit={handleProfileSubmit} className="space-y-4">
            {/* First Name & Last Name */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-gray-500">
                  Nama Depan
                </label>
                <input
                  type="text"
                  name="first_name"
                  value={formData.first_name}
                  onChange={handleProfileChange}
                  className="w-full text-xs font-medium text-gray-800 bg-gray-50/50 border border-gray-100 focus:border-teal-500 focus:bg-white rounded-xl px-3 py-2.5 outline-none transition"
                  placeholder="Ahmad"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-gray-500">
                  Nama Belakang
                </label>
                <input
                  type="text"
                  name="last_name"
                  value={formData.last_name}
                  onChange={handleProfileChange}
                  className="w-full text-xs font-medium text-gray-800 bg-gray-50/50 border border-gray-100 focus:border-teal-500 focus:bg-white rounded-xl px-3 py-2.5 outline-none transition"
                  placeholder="Fauzi"
                />
              </div>
            </div>

            {/* Email (Read Only) */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-gray-400 flex items-center gap-1">
                <Mail className="w-3.5 h-3.5" /> Email (Tidak dapat diubah)
              </label>
              <input
                type="email"
                value={profile?.email || ""}
                disabled
                className="w-full text-xs font-medium text-gray-400 bg-gray-100/50 border border-gray-100 rounded-xl px-3 py-2.5 cursor-not-allowed outline-none"
              />
            </div>

            {/* WhatsApp Phone */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-gray-500 flex items-center gap-1">
                <Phone className="w-3.5 h-3.5" /> Nomor WhatsApp
              </label>
              <input
                type="text"
                name="phone"
                value={formData.phone}
                onChange={handleProfileChange}
                className="w-full text-xs font-medium text-gray-800 bg-gray-50/50 border border-gray-100 focus:border-teal-500 focus:bg-white rounded-xl px-3 py-2.5 outline-none transition"
                placeholder="081234567890"
              />
            </div>

            {/* Angkatan */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-gray-500 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" /> Tahun Angkatan
              </label>
              <input
                type="text"
                name="angkatan"
                value={formData.angkatan}
                onChange={handleProfileChange}
                className="w-full text-xs font-medium text-gray-800 bg-gray-50/50 border border-gray-100 focus:border-teal-500 focus:bg-white rounded-xl px-3 py-2.5 outline-none transition"
                placeholder="2015"
              />
            </div>

            {/* Gender & Status */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-gray-500 flex items-center gap-1">
                  <Layers className="w-3.5 h-3.5" /> Gender
                </label>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleProfileChange}
                  className="w-full text-xs font-bold text-gray-700 bg-gray-50/50 border border-gray-100 focus:border-teal-500 focus:bg-white rounded-xl px-3 py-2.5 outline-none transition cursor-pointer"
                >
                  <option value="L">Laki-laki</option>
                  <option value="P">Perempuan</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-gray-500 flex items-center gap-1">
                  <Users className="w-3.5 h-3.5" /> Status
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleProfileChange}
                  className="w-full text-xs font-bold text-gray-700 bg-gray-50/50 border border-gray-100 focus:border-teal-500 focus:bg-white rounded-xl px-3 py-2.5 outline-none transition cursor-pointer"
                >
                  <option value="siswa aktif">Siswa Aktif</option>
                  <option value="alumni">Alumni</option>
                  <option value="umum">Umum</option>
                </select>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={updateProfileMutation.isPending}
              className="w-full bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs py-2.5 rounded-xl transition flex items-center justify-center gap-1.5 mt-2"
            >
              {updateProfileMutation.isPending ? (
                <>
                  <Loader2 className="w-4.5 h-4.5 animate-spin" />
                  <span>Menyimpan...</span>
                </>
              ) : (
                <span>Simpan Perubahan</span>
              )}
            </button>
          </form>
        ) : (
          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            {/* Old Password */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-gray-500">
                Kata Sandi Lama
              </label>
              <div className="relative">
                <input
                  type={showPasswords.old ? "text" : "password"}
                  name="old_password"
                  value={passwordData.old_password}
                  onChange={handlePasswordChange}
                  className="w-full text-xs font-medium text-gray-800 bg-gray-50/50 border border-gray-100 focus:border-teal-500 focus:bg-white rounded-xl pl-3 pr-10 py-2.5 outline-none transition"
                  placeholder="Masukkan kata sandi lama"
                />
                <button
                  type="button"
                  onClick={() =>
                    setShowPasswords((prev) => ({ ...prev, old: !prev.old }))
                  }
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPasswords.old ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {/* New Password */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-gray-500">
                Kata Sandi Baru
              </label>
              <div className="relative">
                <input
                  type={showPasswords.new ? "text" : "password"}
                  name="new_password"
                  value={passwordData.new_password}
                  onChange={handlePasswordChange}
                  className="w-full text-xs font-medium text-gray-800 bg-gray-50/50 border border-gray-100 focus:border-teal-500 focus:bg-white rounded-xl pl-3 pr-10 py-2.5 outline-none transition"
                  placeholder="Minimal 6 karakter"
                />
                <button
                  type="button"
                  onClick={() =>
                    setShowPasswords((prev) => ({ ...prev, new: !prev.new }))
                  }
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPasswords.new ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Confirm New Password */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-gray-500">
                Konfirmasi Kata Sandi Baru
              </label>
              <div className="relative">
                <input
                  type={showPasswords.confirm ? "text" : "password"}
                  name="confirm_password"
                  value={passwordData.confirm_password}
                  onChange={handlePasswordChange}
                  className="w-full text-xs font-medium text-gray-800 bg-gray-50/50 border border-gray-100 focus:border-teal-500 focus:bg-white rounded-xl pl-3 pr-10 py-2.5 outline-none transition"
                  placeholder="Ulangi kata sandi baru"
                />
                <button
                  type="button"
                  onClick={() =>
                    setShowPasswords((prev) => ({
                      ...prev,
                      confirm: !prev.confirm,
                    }))
                  }
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPasswords.confirm ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Submit Password Button */}
            <button
              type="submit"
              disabled={updatePasswordMutation.isPending}
              className="w-full bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs py-2.5 rounded-xl transition flex items-center justify-center gap-1.5 mt-2"
            >
              {updatePasswordMutation.isPending ? (
                <>
                  <Loader2 className="w-4.5 h-4.5 animate-spin" />
                  <span>Mengubah...</span>
                </>
              ) : (
                <span>Perbarui Kata Sandi</span>
              )}
            </button>
          </form>
        )}
      </div>

      {/* Logout Action Card */}
      <div className="bg-red-50/50 border border-red-100 rounded-3xl p-4 flex items-center justify-between">
        <div className="space-y-0.5">
          <h3 className="text-xs font-bold text-red-900">Keluar dari Sesi</h3>
          <p className="text-[10px] text-red-500">
            Hapus sesi login dan kembali ke form login alumni.
          </p>
        </div>
        <button
          onClick={handleLogout}
          className="bg-red-600 hover:bg-red-700 text-white text-xs font-extrabold px-4 py-2 rounded-xl transition flex items-center gap-1.5 shadow-sm shadow-red-100"
        >
          <LogOut className="w-4 h-4" />
          <span>Keluar</span>
        </button>
      </div>
    </div>
  );
}
