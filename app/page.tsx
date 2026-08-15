"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  LogIn,
  UserPlus,
  QrCode,
  Calendar,
  MapPin,
  ArrowRight,
  Users,
  Phone,
  Mail,
  ChevronRight,
  BookOpen,
  Sparkles,
  Award,
  Menu,
  X,
} from "lucide-react";

export default function Home() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const features = [
    {
      icon: Calendar,
      title: "Informasi Agenda Terpusat",
      description:
        "Menampilkan seluruh daftar acara, kegiatan sosial, pengajian, dan reuni alumni Al-Falah secara real-time.",
    },
    {
      icon: UserPlus,
      title: "Pendaftaran Event Cepat",
      description:
        "Daftar keikutsertaan kegiatan hanya dengan satu klik setelah masuk ke akun alumni.",
    },
    {
      icon: QrCode,
      title: "Presensi QR Code di Hari-H",
      description:
        "Tanpa antre manual. Cukup tunjukkan QR Code dari smartphone saat hadir di lokasi event.",
    },
  ];

  const events = [
    {
      badge: "Utama",
      date: "12 Syawal 1447 H / 2026",
      location: "Aula Utama Pesantren",
      title: "Reuni Akbar & Halalbihalal 2026",
      description:
        "Temu kangen seluruh angkatan alumni Al-Falah. Mempererat ukhuwah, mengenang masa khidmah, dan koordinasi kontribusi untuk umat.",
    },
    {
      badge: "Bulanan",
      date: "Ahad Pertama Setiap Bulan",
      location: "Masjid Ponpes Al-Falah",
      title: "Pengajian Rutin Alumni & Doa Bersama",
      description:
        "Majelis ilmu rutin bersama Masyayikh Al-Falah guna menjaga ruhul khidmah, memperkuat spiritual, dan silaturahmi berkala.",
    },
    {
      badge: "Edukasi",
      date: "Sabtu, 15 November 2026",
      location: "Gedung Aula Putera",
      title: "Workshop Karir & Mentoring Santri",
      description:
        "Sharing pengalaman dan bimbingan karir praktis dari alumni inspiratif Al-Falah untuk santri kelas akhir menghadapi dunia kerja.",
    },
  ];

  const steps = [
    {
      number: "1",
      title: "Masuk ke Akun Alumni",
      description:
        "Login menggunakan akun terdaftar. Registrasi jika Anda adalah alumni baru dan tunggu verifikasi admin.",
    },
    {
      number: "2",
      title: "Pilih & Daftar Event",
      description:
        "Jelajahi agenda kegiatan yang tersedia, lalu daftarkan diri Anda pada event yang ingin diikuti.",
    },
    {
      number: "3",
      title: "Pindai QR Code di Lokasi",
      description:
        "Tunjukkan QR Code di smartphone Anda ke panitia untuk dipindai saat tiba di lokasi kegiatan.",
    },
  ];

  return (
    <div className="min-h-screen bg-white text-[#1A1A1A] font-sans antialiased">
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        @keyframes pulse-ring {
          0% { transform: scale(0.95); opacity: 0.5; }
          50% { transform: scale(1.05); opacity: 0.8; }
          100% { transform: scale(0.95); opacity: 0.5; }
        }
        .animate-float {
          animation: float 4s ease-in-out infinite;
        }
        .animate-pulse-ring {
          animation: pulse-ring 3s ease-in-out infinite;
        }
        html {
          scroll-behavior: smooth;
        }
      `}</style>

      {/* Islamic Background Pattern Overlay */}
      <div className="absolute inset-0 bg-[#E8F5E9]/15 pointer-events-none z-0 overflow-hidden">
        <svg
          className="absolute top-0 left-0 w-full h-full opacity-[0.03]"
          xmlns="http://www.w3.org/2000/svg"
          width="60"
          height="60"
          viewBox="0 0 60 60"
        >
          <path
            d="M30 0 L60 30 L30 60 L0 30 Z"
            fill="none"
            stroke="#0D5C3A"
            strokeWidth="1.2"
          />
          <path
            d="M0 0 L60 60 M60 0 L0 60"
            fill="none"
            stroke="#0D5C3A"
            strokeWidth="0.6"
          />
          <circle
            cx="30"
            cy="30"
            r="8"
            fill="none"
            stroke="#0D5C3A"
            strokeWidth="0.6"
          />
          <circle
            cx="30"
            cy="30"
            r="16"
            fill="none"
            stroke="#0D5C3A"
            strokeWidth="0.6"
          />
        </svg>
      </div>

      {/* NAVBAR */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-[#0D5C3A]/10 shadow-sm transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#0D5C3A] text-white shadow-md">
                <BookOpen size={22} className="text-[#D4AF37]" />
              </span>
              <div className="flex flex-col">
                <span className="font-bold text-base tracking-wide text-[#0D5C3A] uppercase">
                  Al-Falah
                </span>
                <span className="text-[10px] text-slate-500 font-medium tracking-wider uppercase -mt-0.5">
                  Alumni Events
                </span>
              </div>
            </div>

            {/* Desktop Menu */}
            <nav className="hidden md:flex space-x-8 text-sm font-medium">
              <a
                href="#beranda"
                className="text-[#0D5C3A] hover:text-[#D4AF37] transition"
              >
                Beranda
              </a>
              <a
                href="#fitur"
                className="text-slate-600 hover:text-[#0D5C3A] transition"
              >
                Fitur Utama
              </a>
              <a
                href="#agenda"
                className="text-slate-600 hover:text-[#0D5C3A] transition"
              >
                Agenda Event
              </a>
              <a
                href="#alur"
                className="text-slate-600 hover:text-[#0D5C3A] transition"
              >
                Alur Presensi
              </a>
            </nav>

            {/* Desktop CTA */}
            <div className="hidden md:flex items-center gap-4">
              <Link
                href="/alumni/login"
                className="inline-flex items-center justify-center px-5 py-2.5 rounded-xl border-2 border-[#0D5C3A] text-[#0D5C3A] font-semibold text-xs transition duration-250 hover:bg-[#0D5C3A]/5 hover:border-[#D4AF37] hover:text-[#D4AF37]"
              >
                <LogIn size={14} className="mr-2" />
                Masuk
              </Link>
              <Link
                href="/alumni/register"
                className="inline-flex items-center justify-center px-5 py-2.5 rounded-xl bg-[#0D5C3A] text-white font-semibold text-xs shadow-md transition duration-250 hover:bg-[#084028] hover:shadow-lg"
              >
                <UserPlus size={14} className="mr-2 text-[#D4AF37]" />
                Daftar Akun
              </Link>
            </div>

            {/* Mobile menu toggle */}
            <div className="md:hidden">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 rounded-lg text-[#0D5C3A] hover:bg-[#E8F5E9] focus:outline-none"
                aria-label="Menu Utama"
              >
                {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu Panel */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-b border-[#0D5C3A]/10 p-5 space-y-4 shadow-inner">
            <nav className="flex flex-col space-y-3 font-medium text-sm">
              <a
                href="#beranda"
                onClick={() => setMobileMenuOpen(false)}
                className="text-[#0D5C3A] hover:text-[#D4AF37] transition"
              >
                Beranda
              </a>
              <a
                href="#fitur"
                onClick={() => setMobileMenuOpen(false)}
                className="text-slate-600 hover:text-[#0D5C3A] transition"
              >
                Fitur Utama
              </a>
              <a
                href="#agenda"
                onClick={() => setMobileMenuOpen(false)}
                className="text-slate-600 hover:text-[#0D5C3A] transition"
              >
                Agenda Event
              </a>
              <a
                href="#alur"
                onClick={() => setMobileMenuOpen(false)}
                className="text-slate-600 hover:text-[#0D5C3A] transition"
              >
                Alur Presensi
              </a>
            </nav>
            <div className="pt-4 border-t border-slate-100 flex flex-col gap-3">
              <Link
                href="/alumni/login"
                className="w-full inline-flex items-center justify-center py-2.5 rounded-xl border border-[#0D5C3A] text-[#0D5C3A] text-xs font-semibold"
              >
                <LogIn size={14} className="mr-2" />
                Masuk
              </Link>
              <Link
                href="/alumni/register"
                className="w-full inline-flex items-center justify-center py-2.5 rounded-xl bg-[#0D5C3A] text-white text-xs font-semibold shadow"
              >
                <UserPlus size={14} className="mr-2 text-[#D4AF37]" />
                Daftar Akun
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* HERO SECTION */}
      <section
        id="beranda"
        className="relative pt-12 pb-20 md:py-24 xl:py-32 overflow-hidden bg-gradient-to-b from-[#E8F5E9]/50 via-white to-white"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            {/* Left Texts */}
            <div className="lg:col-span-7 space-y-6 text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#E8F5E9] border border-[#0D5C3A]/20 text-[#0D5C3A] text-xs font-semibold shadow-sm">
                <Sparkles size={14} className="text-[#D4AF37]" />
                Presensi & Silaturahmi Digital Alumni
              </div>
              <h1 className="text-4xl sm:text-5xl xl:text-6xl font-extrabold text-[#1A1A1A] tracking-tight leading-[1.1]">
                Menjaga Silaturahmi, <br />
                <span className="text-[#0D5C3A]">Menjaga Keberkahan.</span>
              </h1>
              <p className="max-w-2xl text-slate-600 text-sm sm:text-base leading-relaxed">
                Portal resmi informasi kegiatan dan manajemen event alumni
                Pondok Pesantren Al-Falah. Tetap terhubung, koordinasi
                kontribusi, dan hadir bersama dalam barakah pesantren.
              </p>
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-2">
                <Link
                  href="/alumni/login"
                  className="inline-flex items-center justify-center px-7 py-3.5 rounded-xl bg-[#0D5C3A] hover:bg-[#084028] text-white font-semibold text-sm shadow-md transition duration-250 hover:-translate-y-0.5 hover:shadow-lg"
                >
                  Masuk Ke Portal Alumni
                  <ArrowRight size={16} className="ml-2 text-[#D4AF37]" />
                </Link>
                <a
                  href="#agenda"
                  className="inline-flex items-center justify-center px-7 py-3.5 rounded-xl border border-slate-200 bg-white hover:border-[#0D5C3A] hover:text-[#0D5C3A] text-slate-700 font-semibold text-sm shadow-sm transition duration-250 hover:-translate-y-0.5"
                >
                  <Calendar size={16} className="mr-2" />
                  Lihat Agenda Event
                </a>
              </div>
              <p className="text-xs text-slate-400">
                Belum terdaftar?{" "}
                <Link
                  href="/alumni/register"
                  className="font-semibold text-[#0D5C3A] hover:underline"
                >
                  Registrasi disini
                </Link>{" "}
                untuk diverifikasi oleh Administrator.
              </p>
            </div>

            {/* Right Visual (Interactive Smartphone Mockup) */}
            <div className="lg:col-span-5 flex justify-center">
              <div className="relative animate-float">
                {/* Decorative golden circle background */}
                <div className="absolute -inset-8 rounded-full bg-gradient-to-tr from-[#D4AF37]/10 to-[#E8F5E9] blur-2xl z-0" />

                {/* Smartphone container */}
                <div className="relative mx-auto w-full max-w-[290px] aspect-[9/18.5] bg-[#1A1A1A] rounded-[2.8rem] p-3 shadow-2xl border-4 border-slate-800 ring-8 ring-slate-900/5 z-10">
                  {/* Speaker & notch */}
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 h-5 w-32 bg-slate-900 rounded-b-2xl z-20 flex items-center justify-center">
                    <div className="w-10 h-1 bg-slate-700 rounded-full mb-1" />
                  </div>

                  {/* Screen Content */}
                  <div className="w-full h-full bg-[#F4F9F6] rounded-[2.2rem] overflow-hidden flex flex-col relative border border-white/5">
                    {/* Screen Header */}
                    <div className="bg-[#0D5C3A] text-white pt-7 pb-4 px-4 text-center shadow-md relative">
                      <p className="text-[9px] uppercase tracking-wider text-[#E8F5E9]/80 font-bold">
                        Ponpes Al-Falah
                      </p>
                      <h4 className="text-xs font-bold mt-0.5 text-[#D4AF37]">
                        Presensi Alumni
                      </h4>
                    </div>

                    {/* Screen Body */}
                    <div className="flex-1 p-4 flex flex-col items-center justify-between text-center">
                      <div className="w-full bg-white rounded-2xl p-4 shadow-sm border border-emerald-50/50 flex flex-col items-center">
                        <p className="text-[9px] font-semibold text-[#D4AF37] uppercase tracking-widest">
                          Tiket Presensi
                        </p>
                        <p className="text-xs font-bold text-slate-800 mt-1 leading-snug">
                          Reuni Akbar 2026
                        </p>
                        <div className="w-32 h-32 bg-[#E8F5E9]/50 rounded-xl my-3 p-3.5 flex items-center justify-center border border-emerald-100/50 relative overflow-hidden">
                          {/* Mock QR Code */}
                          <QrCode
                            className="w-full h-full text-[#0D5C3A]"
                            strokeWidth={1.5}
                          />
                          {/* Animated Scan Line */}
                          <div className="absolute left-0 right-0 h-0.5 bg-[#D4AF37] shadow-md animate-pulse-ring" />
                        </div>
                        <p className="text-[9px] text-slate-400 font-mono">
                          ID: ALUMNI-4109
                        </p>
                      </div>

                      <div className="w-full bg-white rounded-xl p-3 shadow-xs border border-emerald-50/30 text-left flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-[#D4AF37]/10 flex items-center justify-center text-[#D4AF37]">
                          <Users className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="text-[9px] text-slate-400 font-medium">
                            Status Kehadiran
                          </p>
                          <p className="text-xs font-bold text-emerald-700">
                            Telah Dipindai
                          </p>
                        </div>
                      </div>

                      <p className="text-[8px] text-slate-400 leading-normal">
                        Tunjukkan QR Code ini ke petugas pemindai di gerbang
                        utama acara.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FITUR SISTEM ALUMNI */}
      <section
        id="fitur"
        className="py-20 bg-white border-t border-slate-100 relative"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto space-y-3 mb-16">
            <span className="text-xs font-semibold text-[#D4AF37] uppercase tracking-widest bg-[#E8F5E9] px-3 py-1 rounded-full">
              Fitur Utama Portal
            </span>
            <h2 className="text-3xl font-extrabold text-[#1A1A1A] tracking-tight">
              Kemudahan Fitur untuk Alumni
            </h2>
            <p className="text-slate-500 text-sm">
              Sistem presensi event kami didesain khusus guna mempermudah akses
              silaturahmi seluruh alumni Al-Falah.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, idx) => {
              const Icon = feature.icon;
              return (
                <div
                  key={idx}
                  className="group bg-white rounded-3xl border border-slate-100 p-8 shadow-sm transition-all duration-300 hover:-translate-y-1.5 hover:border-[#0D5C3A]/20 hover:shadow-xl hover:shadow-[#0D5C3A]/5 text-left"
                >
                  <div className="w-12 h-12 rounded-2xl bg-[#E8F5E9] flex items-center justify-center text-[#0D5C3A] mb-6 transition-transform duration-300 group-hover:scale-110">
                    <Icon
                      className="w-6 h-6 text-[#0D5C3A]"
                      strokeWidth={1.75}
                    />
                  </div>
                  <h3 className="text-lg font-bold text-[#1A1A1A] mb-3 group-hover:text-[#0D5C3A] transition">
                    {feature.title}
                  </h3>
                  <p className="text-slate-600 text-xs leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* UPCOMING EVENTS PREVIEW */}
      <section id="agenda" className="py-20 bg-[#E8F5E9]/20 relative">
        {/* Subtle decorative motif */}
        <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none">
          <Award size={200} className="text-[#0D5C3A]" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-4">
            <div className="text-left space-y-3">
              <span className="text-xs font-semibold text-[#D4AF37] uppercase tracking-widest bg-white px-3 py-1 rounded-full shadow-xs">
                Jadwal Kegiatan
              </span>
              <h2 className="text-3xl font-extrabold text-[#1A1A1A] tracking-tight">
                Agenda Event Mendatang
              </h2>
              <p className="text-slate-500 text-sm max-w-2xl">
                Pantau terus agenda kegiatan pondok pesantren, reuni, pengajian
                akbar, serta seminar karir mendatang.
              </p>
            </div>
            <Link
              href="/alumni/login"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-[#0D5C3A] hover:text-[#D4AF37] transition self-start md:self-auto"
            >
              Lihat Seluruh Agenda
              <ChevronRight size={16} />
            </Link>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {events.map((event, idx) => (
              <div
                key={idx}
                className="bg-white rounded-3xl border border-slate-100 overflow-hidden shadow-sm flex flex-col justify-between transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl hover:shadow-[#0D5C3A]/5"
              >
                <div className="p-6 sm:p-8 space-y-4">
                  {/* Badge & Date */}
                  <div className="flex items-center justify-between">
                    <span className="inline-block px-2.5 py-1 rounded-md bg-[#E8F5E9] text-[#0D5C3A] text-[10px] font-bold uppercase tracking-wider">
                      {event.badge}
                    </span>
                    <span className="text-[11px] text-slate-400 font-medium flex items-center gap-1">
                      <Calendar size={12} className="text-[#D4AF37]" />
                      {event.date}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-[#1A1A1A] hover:text-[#0D5C3A] transition">
                    {event.title}
                  </h3>

                  <p className="text-slate-500 text-xs leading-relaxed">
                    {event.description}
                  </p>
                </div>

                <div className="px-6 pb-6 sm:px-8 sm:pb-8 pt-0 border-t border-slate-50/50 mt-auto space-y-4">
                  {/* Location info */}
                  <div className="flex items-center gap-1.5 text-slate-400 text-xs mt-4">
                    <MapPin size={14} className="text-[#D4AF37] shrink-0" />
                    <span className="truncate">{event.location}</span>
                  </div>

                  <Link
                    href="/alumni/login"
                    className="w-full inline-flex items-center justify-center py-2.5 rounded-xl bg-slate-50 hover:bg-[#E8F5E9] text-[#0D5C3A] hover:text-[#0D5C3A] font-semibold text-xs border border-[#0D5C3A]/10 transition-colors"
                  >
                    Daftar (Perlu Login)
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="alur" className="py-20 bg-white relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto space-y-3 mb-20">
            <span className="text-xs font-semibold text-[#D4AF37] uppercase tracking-widest bg-[#E8F5E9] px-3 py-1 rounded-full">
              Sistem Kehadiran
            </span>
            <h2 className="text-3xl font-extrabold text-[#1A1A1A] tracking-tight">
              3 Langkah Mudah Mengikuti Kegiatan
            </h2>
            <p className="text-slate-500 text-sm">
              Ikuti alur pendaftaran dan konfirmasi kehadiran digital yang cepat
              tanpa antrean manual.
            </p>
          </div>

          <div className="relative">
            {/* Connecting lines for desktop */}
            <div className="hidden lg:block absolute top-1/2 left-[15%] right-[15%] h-0.5 bg-[#E8F5E9] -translate-y-12 z-0" />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 lg:gap-8 relative z-10">
              {steps.map((step, idx) => (
                <div
                  key={idx}
                  className="flex flex-col items-center text-center px-4"
                >
                  {/* Number bubble */}
                  <div className="w-16 h-16 rounded-full bg-[#0D5C3A] border-4 border-[#E8F5E9] text-[#D4AF37] font-bold text-xl flex items-center justify-center shadow-md mb-6 ring-2 ring-[#0D5C3A]/10">
                    {step.number}
                  </div>
                  <h3 className="text-base font-bold text-[#1A1A1A] mb-3">
                    {step.title}
                  </h3>
                  <p className="text-slate-500 text-xs leading-relaxed max-w-xs">
                    {step.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-[#1A1A1A] text-white pt-16 pb-8 border-t-4 border-[#D4AF37] relative">
        {/* Subtle geometric grid background */}
        <div className="absolute inset-0 opacity-[0.02] pointer-events-none overflow-hidden">
          <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern
                id="grid"
                width="40"
                height="40"
                patternUnits="userSpaceOnUse"
              >
                <rect width="40" height="40" fill="none" />
                <path
                  d="M 40 0 L 0 0 0 40"
                  fill="none"
                  stroke="#D4AF37"
                  strokeWidth="1"
                />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-10 md:gap-8 mb-12">
            {/* Column 1: Info Ponpes */}
            <div className="md:col-span-5 space-y-4 text-left">
              <div className="flex items-center gap-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#0D5C3A] text-white">
                  <BookOpen size={18} className="text-[#D4AF37]" />
                </span>
                <span className="font-extrabold text-sm tracking-widest uppercase">
                  Pondok Pesantren Al-Falah
                </span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed max-w-sm">
                Lembaga pendidikan Islam tafaqquh fid-din yang berkomitmen
                melahirkan generasi santri yang shalih, bertafakur, mandiri, dan
                berbakti kepada nusa, bangsa, serta agama.
              </p>
              <div className="space-y-2 text-xs text-slate-400">
                <p className="flex items-center gap-2">
                  <Phone size={14} className="text-[#D4AF37]" />
                  +62 812-3456-7890
                </p>
                <p className="flex items-center gap-2">
                  <Mail size={14} className="text-[#D4AF37]" />
                  alumni@ponpes-alfalah.or.id
                </p>
              </div>
            </div>

            {/* Column 2: Quick Links */}
            <div className="md:col-span-3 text-left">
              <h4 className="font-bold text-xs uppercase tracking-wider text-[#D4AF37] mb-4">
                Navigasi Cepat
              </h4>
              <ul className="space-y-2.5 text-xs text-slate-400">
                <li>
                  <a
                    href="#beranda"
                    className="hover:text-[#D4AF37] transition"
                  >
                    Halaman Utama
                  </a>
                </li>
                <li>
                  <a href="#fitur" className="hover:text-[#D4AF37] transition">
                    Fitur Sistem
                  </a>
                </li>
                <li>
                  <a href="#agenda" className="hover:text-[#D4AF37] transition">
                    Agenda Event
                  </a>
                </li>
                <li>
                  <a href="#alur" className="hover:text-[#D4AF37] transition">
                    Langkah Presensi
                  </a>
                </li>
              </ul>
            </div>

            {/* Column 3: Portals */}
            <div className="md:col-span-4 text-left">
              <h4 className="font-bold text-xs uppercase tracking-wider text-[#D4AF37] mb-4">
                Akses Portal
              </h4>
              <p className="text-xs text-slate-400 mb-4 leading-normal">
                Gunakan tautan di bawah untuk langsung menuju gerbang masuk
                masing-masing tingkat pengguna.
              </p>
              <div className="flex flex-wrap gap-2.5">
                <Link
                  href="/alumni/login"
                  className="px-4 py-2 rounded-lg bg-[#0D5C3A]/20 hover:bg-[#0D5C3A]/40 text-[#E8F5E9] hover:text-[#D4AF37] font-semibold text-xs border border-[#0D5C3A]/30 transition-colors"
                >
                  Portal Alumni
                </Link>
                <Link
                  href="/admin/login"
                  className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white font-semibold text-xs border border-slate-700 transition-colors"
                >
                  Portal Admin
                </Link>
              </div>
            </div>
          </div>

          {/* Copyright Divider */}
          <div className="pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
            <p>
              Copyright © 2026 Pondok Pesantren Al-Falah. All rights reserved.
            </p>
            <div className="flex items-center gap-4">
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noreferrer"
                className="hover:text-[#D4AF37] transition"
                aria-label="Instagram Resmi Al-Falah"
              >
                <svg
                  className="w-4 h-4 text-slate-500 hover:text-[#D4AF37] transition"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  viewBox="0 0 24 24"
                >
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
