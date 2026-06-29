import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  CalendarDays,
  CheckCircle2,
  ClipboardCheck,
  LogIn,
  QrCode,
  ScanLine,
  ShieldCheck,
  Sparkles,
  UserCheck,
  Users,
} from "lucide-react";

const features = [
  {
    icon: QrCode,
    title: "QR Code Presensi",
    description: "Proses kehadiran lebih cepat dan praktis melalui pemindaian QR Code.",
  },
  {
    icon: CalendarDays,
    title: "Manajemen Event",
    description: "Kelola jadwal, kategori, kuota, dan informasi event dalam satu tempat.",
  },
  {
    icon: UserCheck,
    title: "Approval Alumni",
    description: "Validasi akun alumni sebelum mereka memperoleh akses ke sistem.",
  },
  {
    icon: BarChart3,
    title: "Laporan Kehadiran",
    description: "Pantau data peserta dan rekap presensi event secara terstruktur.",
  },
];

const flow = [
  "Alumni registrasi",
  "Admin menyetujui akun",
  "Alumni mengikuti event",
  "Presensi dengan QR",
  "Admin melihat laporan",
];

export default function Home() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-b from-cyan-50 via-white to-teal-50 text-slate-800">
      <style>{`
        @keyframes landing-float {
          0%, 100% { transform: translate3d(0, 0, 0); }
          50% { transform: translate3d(0, -12px, 0); }
        }
        @keyframes landing-enter {
          from { opacity: 0; transform: translateY(18px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .landing-float { animation: landing-float 5s ease-in-out infinite; }
        .landing-float-delayed { animation: landing-float 6s ease-in-out 1s infinite; }
        .landing-enter { animation: landing-enter .7s ease-out both; }
        .landing-enter-delayed { animation: landing-enter .7s ease-out .15s both; }
        @media (prefers-reduced-motion: reduce) {
          .landing-float, .landing-float-delayed, .landing-enter, .landing-enter-delayed {
            animation: none;
          }
        }
      `}</style>

      <div className="pointer-events-none absolute -left-24 top-28 h-72 w-72 rounded-full bg-cyan-200/35 blur-3xl" />
      <div className="pointer-events-none absolute -right-24 top-72 h-80 w-80 rounded-full bg-teal-200/40 blur-3xl" />

      <header className="relative z-20 border-b border-white/70 bg-white/75 backdrop-blur-xl">
        <nav
          aria-label="Navigasi utama"
          className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 sm:px-8 lg:px-10"
        >
          <Link href="/" className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-teal-500 to-cyan-500 text-white shadow-lg shadow-teal-200/70">
              <ScanLine size={21} aria-hidden="true" />
            </span>
            <span className="font-bold tracking-tight text-slate-900">
              Presensi <span className="text-teal-600">Alumni</span>
            </span>
          </Link>

          <div className="hidden items-center gap-8 text-sm font-medium text-slate-600 sm:flex">
            <a href="#fitur" className="transition hover:text-teal-600">Fitur</a>
            <a href="#alur" className="transition hover:text-teal-600">Alur</a>
            <a href="#masuk" className="transition hover:text-teal-600">Masuk</a>
          </div>

          <Link
            href="/alumni/login"
            className="inline-flex items-center gap-2 rounded-xl bg-teal-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-teal-700 hover:shadow-md"
          >
            <LogIn size={16} aria-hidden="true" />
            <span className="hidden min-[380px]:inline">Masuk</span>
          </Link>
        </nav>
      </header>

      <main>
        <section className="relative mx-auto grid max-w-7xl items-center gap-14 px-5 pb-20 pt-16 sm:px-8 sm:pt-24 lg:grid-cols-[1.05fr_.95fr] lg:px-10 lg:pb-28 lg:pt-28">
          <div className="landing-enter relative z-10">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-teal-200 bg-white/80 px-4 py-2 text-xs font-semibold text-teal-700 shadow-sm">
              <Sparkles size={15} aria-hidden="true" />
              Presensi digital yang praktis dan terintegrasi
            </div>
            <h1 className="max-w-3xl text-4xl font-bold leading-[1.12] tracking-tight text-slate-900 sm:text-5xl lg:text-6xl">
              Sistem Presensi Event Alumni{" "}
              <span className="bg-gradient-to-r from-teal-600 to-cyan-500 bg-clip-text text-transparent">
                Pesantren
              </span>
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-8 text-slate-600 sm:text-lg">
              Alumni dapat menemukan event dan melakukan presensi QR dengan mudah,
              sementara admin mengelola kegiatan, akun alumni, dan laporan kehadiran
              dalam satu sistem.
            </p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/alumni/login"
                className="group inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-teal-600 to-cyan-500 px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-teal-200/70 transition hover:-translate-y-1 hover:shadow-xl"
              >
                Masuk sebagai Alumni
                <ArrowRight size={17} className="transition group-hover:translate-x-1" aria-hidden="true" />
              </Link>
              <Link
                href="/admin/login"
                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-6 py-3.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:-translate-y-1 hover:border-teal-200 hover:text-teal-700 hover:shadow-md"
              >
                <ShieldCheck size={17} aria-hidden="true" />
                Masuk sebagai Admin
              </Link>
            </div>
            <p className="mt-5 text-sm text-slate-500">
              Belum memiliki akun?{" "}
              <Link href="/alumni/register" className="font-semibold text-teal-700 hover:underline">
                Registrasi alumni
              </Link>
            </p>
          </div>

          <div className="landing-enter-delayed relative mx-auto w-full max-w-xl lg:ml-auto">
            <div className="absolute -inset-5 rounded-[2.5rem] bg-gradient-to-br from-cyan-200/55 to-teal-200/45 blur-2xl" />
            <div className="relative rounded-[2rem] border border-white/80 bg-white/85 p-5 shadow-2xl shadow-teal-900/10 backdrop-blur-xl sm:p-7">
              <div className="flex items-center justify-between border-b border-slate-100 pb-5">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-teal-600">Dasbor Alumni</p>
                  <p className="mt-1 font-bold text-slate-900">Selamat datang kembali</p>
                </div>
                <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-teal-50 text-teal-600">
                  <Users size={21} aria-hidden="true" />
                </span>
              </div>

              <div className="mt-5 rounded-2xl bg-gradient-to-br from-teal-600 to-cyan-500 p-5 text-white shadow-lg shadow-teal-200">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs font-medium text-teal-50">Event Mendatang</p>
                    <p className="mt-2 text-lg font-bold">Silaturahmi Alumni 2026</p>
                    <p className="mt-1 text-xs text-cyan-50">Ahad, 12 Juli • Aula Pesantren</p>
                  </div>
                  <CalendarDays size={23} aria-hidden="true" />
                </div>
              </div>

              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <div className="landing-float rounded-2xl border border-slate-100 bg-white p-4 shadow-lg shadow-slate-200/50">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-50 text-cyan-600">
                    <QrCode size={21} aria-hidden="true" />
                  </span>
                  <p className="mt-4 text-sm font-bold text-slate-900">Pindai QR</p>
                  <p className="mt-1 text-xs leading-5 text-slate-500">Presensi cepat dan tervalidasi.</p>
                </div>
                <div className="landing-float-delayed rounded-2xl border border-slate-100 bg-white p-4 shadow-lg shadow-slate-200/50">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                    <ClipboardCheck size={21} aria-hidden="true" />
                  </span>
                  <p className="mt-4 text-sm font-bold text-slate-900">Laporan Kehadiran</p>
                  <p className="mt-1 text-xs leading-5 text-slate-500">Rekap peserta secara ringkas.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="masuk" className="scroll-mt-24 px-5 py-20 sm:px-8 lg:px-10">
          <div className="mx-auto max-w-7xl">
            <div className="mx-auto max-w-2xl text-center">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-teal-600">Pilih akses Anda</p>
              <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">Mulai sesuai peran</h2>
              <p className="mt-4 leading-7 text-slate-600">Akses fitur yang dirancang khusus untuk admin dan alumni.</p>
            </div>

            <div className="mt-10 grid gap-6 lg:grid-cols-2">
              <article className="group rounded-3xl border border-slate-100 bg-white p-7 shadow-sm transition duration-300 hover:-translate-y-1.5 hover:border-cyan-200 hover:shadow-xl hover:shadow-cyan-100/60 sm:p-9">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-cyan-50 text-cyan-600 transition group-hover:scale-110">
                  <ShieldCheck size={28} aria-hidden="true" />
                </div>
                <h3 className="mt-6 text-2xl font-bold text-slate-900">Admin</h3>
                <p className="mt-3 max-w-xl leading-7 text-slate-600">
                  Kelola event, kategori, QR Code, data alumni, persetujuan pengguna, dan laporan kehadiran.
                </p>
                <Link
                  href="/admin/login"
                  className="mt-7 inline-flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-cyan-700"
                >
                  Masuk sebagai Admin <ArrowRight size={16} aria-hidden="true" />
                </Link>
              </article>

              <article className="group rounded-3xl border border-teal-100 bg-gradient-to-br from-white to-teal-50/70 p-7 shadow-sm transition duration-300 hover:-translate-y-1.5 hover:border-teal-200 hover:shadow-xl hover:shadow-teal-100/70 sm:p-9">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-teal-100 text-teal-700 transition group-hover:scale-110">
                  <Users size={28} aria-hidden="true" />
                </div>
                <h3 className="mt-6 text-2xl font-bold text-slate-900">Alumni</h3>
                <p className="mt-3 max-w-xl leading-7 text-slate-600">
                  Masuk atau daftar, lihat event, pindai QR presensi, dan pantau riwayat kehadiran.
                </p>
                <div className="mt-7 flex flex-wrap items-center gap-4">
                  <Link
                    href="/alumni/login"
                    className="inline-flex items-center gap-2 rounded-xl bg-teal-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-teal-700"
                  >
                    Masuk / Daftar Alumni <ArrowRight size={16} aria-hidden="true" />
                  </Link>
                  <Link href="/alumni/register" className="text-sm font-semibold text-teal-700 hover:underline">
                    Daftar langsung
                  </Link>
                </div>
              </article>
            </div>
          </div>
        </section>

        <section id="fitur" className="scroll-mt-24 bg-white/70 px-5 py-20 sm:px-8 lg:px-10">
          <div className="mx-auto max-w-7xl">
            <div className="max-w-2xl">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-teal-600">Fitur utama</p>
              <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">Satu sistem untuk seluruh proses event</h2>
            </div>
            <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {features.map(({ icon: Icon, title, description }) => (
                <article
                  key={title}
                  className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm transition duration-300 hover:-translate-y-1 hover:border-teal-200 hover:shadow-lg"
                >
                  <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-teal-50 to-cyan-100 text-teal-700">
                    <Icon size={23} aria-hidden="true" />
                  </span>
                  <h3 className="mt-5 font-bold text-slate-900">{title}</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-600">{description}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="alur" className="scroll-mt-24 px-5 py-20 sm:px-8 lg:px-10">
          <div className="mx-auto max-w-7xl rounded-[2rem] bg-slate-900 px-6 py-12 text-white shadow-2xl shadow-slate-300/50 sm:px-10 lg:px-14">
            <div className="max-w-2xl">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-cyan-300">Alur penggunaan</p>
              <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">Dari registrasi hingga laporan</h2>
              <p className="mt-4 leading-7 text-slate-300">Proses ringkas dengan kontrol akun dan kehadiran yang jelas.</p>
            </div>
            <ol className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
              {flow.map((item, index) => (
                <li key={item} className="relative rounded-2xl border border-white/10 bg-white/5 p-5">
                  <div className="flex items-center justify-between">
                    <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-cyan-400 font-bold text-slate-900">
                      {index + 1}
                    </span>
                    <CheckCircle2 size={19} className="text-teal-300" aria-hidden="true" />
                  </div>
                  <p className="mt-5 text-sm font-semibold leading-6 text-slate-100">{item}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>
      </main>

      <footer className="border-t border-teal-100/80 bg-white/75 px-5 py-8 text-center text-sm text-slate-500 backdrop-blur sm:px-8">
        © 2026 Sistem Presensi Event Berbasis QR - Pesantren
      </footer>
    </div>
  );
}
