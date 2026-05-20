"use client";

import { useState } from "react";
import AdminSidebar from "@/app/components/AdminSidebar";
import AdminHeader from "@/app/components/AdminHeader";
import { useAlumni, useCreateAlumni, useUpdateAlumni, useDeleteAlumni } from "@/hooks/admin/useAlumni";

// ─── Types ────────────────────────────────────────────────────────────────────
export interface Alumni {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone_number: string;
  graduation_year: string;
  gender: "Laki-laki" | "Perempuan";
  created_at: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function fullName(a: Alumni) {
  return `${a.first_name} ${a.last_name}`;
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("id-ID", {
    day: "2-digit", month: "short", year: "numeric",
  });
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────
function TableSkeleton() {
  return (
    <>
      {[1, 2, 3, 4, 5].map((i) => (
        <tr key={i} className="border-b animate-pulse">
          {[1, 2, 3, 4, 5, 6, 7].map((j) => (
            <td key={j} className="p-5">
              <div className="h-4 bg-gray-100 rounded w-3/4" />
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}

// ─── Modal Tambah / Edit ──────────────────────────────────────────────────────
interface ModalProps {
  mode: "tambah" | "edit";
  initial?: Alumni | null;
  onClose: () => void;
  onSubmit: (data: Partial<Alumni>) => void;
  loading: boolean;
}

function AlumniModal({ mode, initial, onClose, onSubmit, loading }: ModalProps) {
  const [form, setForm] = useState({
    first_name: initial?.first_name ?? "",
    last_name: initial?.last_name ?? "",
    email: initial?.email ?? "",
    phone_number: initial?.phone_number ?? "",
    graduation_year: initial?.graduation_year ?? "",
    gender: initial?.gender ?? "Laki-laki",
  });

  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
          <h3 className="font-semibold text-gray-800 text-lg">
            {mode === "tambah" ? "Tambah Alumni" : "Edit Alumni"}
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl">✕</button>
        </div>
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-gray-600 mb-1 block">Nama Depan</label>
              <input value={form.first_name} onChange={(e) => set("first_name", e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400" />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600 mb-1 block">Nama Belakang</label>
              <input value={form.last_name} onChange={(e) => set("last_name", e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400" />
            </div>
          </div>
          <div>
            <label className="text-xs font-medium text-gray-600 mb-1 block">Email</label>
            <input type="email" value={form.email} onChange={(e) => set("email", e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400" />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-600 mb-1 block">Nomor Telepon</label>
            <input value={form.phone_number} onChange={(e) => set("phone_number", e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-gray-600 mb-1 block">Tahun Lulus</label>
              <input value={form.graduation_year} onChange={(e) => set("graduation_year", e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400" />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600 mb-1 block">Jenis Kelamin</label>
              <select value={form.gender} onChange={(e) => set("gender", e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400 bg-white">
                <option>Laki-laki</option>
                <option>Perempuan</option>
              </select>
            </div>
          </div>
        </div>
        <div className="p-6 border-t border-gray-100 flex gap-3">
          <button onClick={onClose}
            className="flex-1 border border-gray-200 text-gray-600 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors">
            Batal
          </button>
          <button onClick={() => onSubmit(form)} disabled={loading}
            className="flex-1 bg-teal-600 hover:bg-teal-700 disabled:bg-teal-300 text-white py-2.5 rounded-xl text-sm font-medium transition-colors flex items-center justify-center gap-2">
            {loading && <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
            {mode === "tambah" ? "Simpan" : "Perbarui"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function UsersPage() {
  const [search, setSearch] = useState("");
  const [modal, setModal] = useState<"tambah" | "edit" | null>(null);
  const [selected, setSelected] = useState<Alumni | null>(null);

  // ── TanStack Query ──
  const { data: alumni = [], isLoading, isError } = useAlumni();
  const createAlumni = useCreateAlumni();
  const updateAlumni = useUpdateAlumni();
  const deleteAlumni = useDeleteAlumni();

  // ── Filter & Stats ──
  const filtered = alumni.filter((a: Alumni) =>
    fullName(a).toLowerCase().includes(search.toLowerCase()) ||
    a.email.toLowerCase().includes(search.toLowerCase())
  );

  const totalLaki = alumni.filter((a: Alumni) => a.gender === "Laki-laki").length;
  const totalPerempuan = alumni.filter((a: Alumni) => a.gender === "Perempuan").length;
  const bulanIni = alumni.filter((a: Alumni) => {
    const d = new Date(a.created_at);
    const now = new Date();
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  }).length;

  // ── Handlers ──
  const handleSubmit = (data: Partial<Alumni>) => {
    if (modal === "tambah") {
      createAlumni.mutate(data, { onSuccess: () => setModal(null) });
    } else if (modal === "edit" && selected) {
      updateAlumni.mutate(
        { id: selected.id, data },
        { onSuccess: () => { setModal(null); setSelected(null); } }
      );
    }
  };

  const handleEdit = (a: Alumni) => {
    setSelected(a);
    setModal("edit");
  };

  const handleDelete = (id: number) => {
    if (confirm("Yakin ingin menghapus alumni ini?")) {
      deleteAlumni.mutate(id);
    }
  };

  const isMutating = createAlumni.isPending || updateAlumni.isPending;

  return (
    <div className="h-screen bg-gray-100 flex overflow-hidden">
      <AdminSidebar />

      <div className="flex-1 ml-72 flex flex-col h-screen">
        <AdminHeader title="Kelola User" />

        <main className="flex-1 overflow-y-auto p-8">

          {/* ── Stat Cards ── */}
          <div className="grid grid-cols-4 gap-6 mb-8">
            {[
              { title: "Total Alumni", value: isLoading ? "..." : alumni.length, desc: "Alumni terdaftar" },
              { title: "Laki-laki", value: isLoading ? "..." : totalLaki, desc: "Alumni pria" },
              { title: "Perempuan", value: isLoading ? "..." : totalPerempuan, desc: "Alumni wanita" },
              { title: "Bulan Ini", value: isLoading ? "..." : bulanIni, desc: "Pendaftar baru" },
            ].map((item, i) => (
              <div key={i} className="bg-white rounded-3xl border-2 border-cyan-400 p-7">
                <p className="text-gray-500 text-lg">{item.title}</p>
                <h2 className="text-5xl font-bold mt-3 text-gray-800">{item.value}</h2>
                <p className="text-gray-400 mt-2">{item.desc}</p>
              </div>
            ))}
          </div>

          {/* ── Table Card ── */}
          <div className="bg-white rounded-3xl shadow-sm overflow-hidden">
            {/* Header */}
            <div className="p-8 bg-teal-50 flex items-center justify-between">
              <div>
                <h2 className="text-4xl font-bold">Manajemen Alumni</h2>
                <p className="text-gray-500 mt-2">Kelola data alumni pesantren</p>
              </div>
              <div className="flex gap-4">
                <button className="px-6 py-3 border-2 border-teal-500 rounded-2xl text-teal-600 font-semibold hover:bg-teal-50 transition-colors">
                  Export Data
                </button>
                <button
                  onClick={() => setModal("tambah")}
                  className="px-6 py-3 bg-gradient-to-r from-teal-500 to-cyan-500 text-white rounded-2xl font-semibold shadow hover:opacity-90 transition-opacity"
                >
                  + Tambah Alumni
                </button>
              </div>
            </div>

            <div className="p-8">
              {/* Search */}
              <input
                type="text"
                placeholder="Cari nama atau email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full px-5 py-4 border rounded-2xl outline-none focus:border-cyan-500 mb-8 text-sm"
              />

              {/* ── Error State ── */}
              {isError && (
                <div className="text-center py-12">
                  <p className="text-4xl mb-3">⚠️</p>
                  <p className="text-sm text-red-500 font-medium">Gagal memuat data alumni</p>
                  <p className="text-xs text-gray-400 mt-1">Pastikan server backend sudah berjalan</p>
                </div>
              )}

              {/* ── Table ── */}
              {!isError && (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-teal-100">
                      <tr>
                        {["No", "Nama", "Email", "Telepon", "Tahun Lulus", "Terdaftar", "Aksi"].map((h) => (
                          <th key={h} className="text-left p-5 text-sm font-semibold text-gray-700">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {isLoading ? (
                        <TableSkeleton />
                      ) : filtered.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="text-center py-12 text-gray-400">
                            <p className="text-3xl mb-2">👤</p>
                            <p className="text-sm">
                              {search ? "Alumni tidak ditemukan" : "Belum ada data alumni"}
                            </p>
                          </td>
                        </tr>
                      ) : (
                        filtered.map((user: Alumni, index: number) => (
                          <tr key={user.id} className="border-b hover:bg-gray-50 transition-colors">
                            <td className="p-5 text-gray-500 text-sm">{index + 1}</td>
                            <td className="p-5">
                              <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-teal-400 to-cyan-500 text-white flex items-center justify-center text-sm font-bold flex-shrink-0">
                                  {user.first_name[0]}
                                </div>
                                <span className="font-semibold text-gray-800">{fullName(user)}</span>
                              </div>
                            </td>
                            <td className="p-5 text-gray-500 text-sm">{user.email}</td>
                            <td className="p-5 text-gray-500 text-sm">{user.phone_number}</td>
                            <td className="p-5">
                              <span className="px-3 py-1.5 bg-green-100 text-green-700 rounded-xl text-xs font-medium">
                                {user.graduation_year}
                              </span>
                            </td>
                            <td className="p-5 text-gray-500 text-sm">{formatDate(user.created_at)}</td>
                            <td className="p-5">
                              <div className="flex gap-2">
                                <button
                                  onClick={() => handleEdit(user)}
                                  className="p-2 hover:bg-teal-50 rounded-lg transition-colors text-teal-600"
                                  title="Edit"
                                >
                                  ✏️
                                </button>
                                <button
                                  onClick={() => handleDelete(user.id)}
                                  disabled={deleteAlumni.isPending}
                                  className="p-2 hover:bg-red-50 rounded-lg transition-colors text-red-400 disabled:opacity-50"
                                  title="Hapus"
                                >
                                  🗑️
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Pagination placeholder */}
              {!isLoading && !isError && filtered.length > 0 && (
                <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-100">
                  <p className="text-sm text-gray-400">
                    Menampilkan {filtered.length} dari {alumni.length} alumni
                  </p>
                  <div className="flex gap-2">
                    <button className="px-4 py-2 border border-gray-200 rounded-xl text-sm text-gray-500 hover:bg-gray-50 transition-colors">
                      ← Sebelumnya
                    </button>
                    <button className="px-4 py-2 bg-teal-600 text-white rounded-xl text-sm font-medium">
                      1
                    </button>
                    <button className="px-4 py-2 border border-gray-200 rounded-xl text-sm text-gray-500 hover:bg-gray-50 transition-colors">
                      Berikutnya →
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          <footer className="mt-10 text-center text-gray-400 text-xs">
            © 2026 QR Event Attendance System - Pesantren
          </footer>
        </main>
      </div>

      {/* ── Modal ── */}
      {modal && (
        <AlumniModal
          mode={modal}
          initial={modal === "edit" ? selected : null}
          onClose={() => { setModal(null); setSelected(null); }}
          onSubmit={handleSubmit}
          loading={isMutating}
        />
      )}
    </div>
  );
}