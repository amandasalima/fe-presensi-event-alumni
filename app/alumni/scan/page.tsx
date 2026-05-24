"use client";

import { useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { useRouter } from "next/navigation";
import { useMyNotifications, useScanQR } from "@/hooks/alumni/useAlumniHooks";

function Icon({
  name,
  className = "w-5 h-5",
}: {
  name:
    | "home"
    | "calendar"
    | "qr"
    | "history"
    | "user"
    | "bell"
    | "menu"
    | "camera"
    | "info"
    | "check"
    | "x";
  className?: string;
}) {
  const common = {
    fill: "none",
    viewBox: "0 0 24 24",
    stroke: "currentColor",
    strokeWidth: 2,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    className,
  };

  switch (name) {
    case "home":
      return (
        <svg {...common}>
          <path d="M3 10.5 12 3l9 7.5" />
          <path d="M5 10v10h14V10" />
          <path d="M9 20v-6h6v6" />
        </svg>
      );

    case "calendar":
      return (
        <svg {...common}>
          <path d="M8 2v4M16 2v4M3 10h18" />
          <rect x="3" y="4" width="18" height="18" rx="2" />
        </svg>
      );

    case "qr":
      return (
        <svg {...common}>
          <rect x="4" y="4" width="6" height="6" rx="1" />
          <rect x="14" y="4" width="6" height="6" rx="1" />
          <rect x="4" y="14" width="6" height="6" rx="1" />
          <path d="M14 14h2v2h-2zM18 14h2M14 18h2M18 18h2v2" />
        </svg>
      );

    case "history":
      return (
        <svg {...common}>
          <path d="M3 12a9 9 0 1 0 3-6.7" />
          <path d="M3 4v5h5" />
          <path d="M12 7v5l3 2" />
        </svg>
      );

    case "user":
      return (
        <svg {...common}>
          <path d="M20 21a8 8 0 0 0-16 0" />
          <circle cx="12" cy="8" r="4" />
        </svg>
      );

    case "bell":
      return (
        <svg {...common}>
          <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" />
          <path d="M13.73 21a2 2 0 0 1-3.46 0" />
        </svg>
      );

    case "menu":
      return (
        <svg {...common}>
          <path d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      );

    case "camera":
      return (
        <svg {...common}>
          <path d="M14.5 4 16 7h3a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2h3l1.5-3h5z" />
          <circle cx="12" cy="13" r="3" />
        </svg>
      );

    case "info":
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="9" />
          <path d="M12 8h.01M11 12h1v4h1" />
        </svg>
      );

    case "check":
      return (
        <svg {...common}>
          <path d="m5 13 4 4L19 7" />
        </svg>
      );

    case "x":
      return (
        <svg {...common}>
          <path d="M18 6 6 18M6 6l12 12" />
        </svg>
      );
  }
}

type Notification = {
  id: number;
  title: string;
  body: string;
  is_read: boolean;
};

type ScanStatus = "idle" | "scanning" | "success" | "error";

export default function ScanPage() {
  const router = useRouter();

  const scannerRef = useRef<Html5Qrcode | null>(null);
  const isProcessingRef = useRef(false);

  const [status, setStatus] = useState<ScanStatus>("idle");
  const [message, setMessage] = useState(
    "Arahkan kamera ke QR Code event untuk melakukan presensi"
  );
  const [cameraReady, setCameraReady] = useState(false);

  const { data: notifications = [] } = useMyNotifications();
  const scanQR = useScanQR();

  const unreadNotif = (notifications as Notification[]).filter(
    (n) => !n.is_read
  ).length;

  const stopScanner = async () => {
    try {
      if (scannerRef.current?.isScanning) {
        await scannerRef.current.stop();
      }
    } catch {
      // scanner sudah berhenti
    }
  };

  const clearScanner = async () => {
    try {
      await scannerRef.current?.clear();
    } catch {
      // reader sudah kosong
    }
  };

  const startScanner = async () => {
    try {
      setStatus("scanning");
      setCameraReady(false);
      setMessage("Meminta akses kamera...");

      if (!scannerRef.current) {
        scannerRef.current = new Html5Qrcode("qr-reader");
      }

      await scannerRef.current.start(
        {
          facingMode: "environment",
        },
        {
          fps: 10,
          qrbox: {
            width: 240,
            height: 240,
          },
          aspectRatio: 1,
        },
        async (decodedText) => {
          if (isProcessingRef.current) return;

          isProcessingRef.current = true;
          setMessage("QR Code terbaca. Memproses presensi...");

          await stopScanner();

          scanQR.mutate(decodedText, {
            onSuccess: (data: any) => {
              setStatus("success");
              setCameraReady(false);
              setMessage(data?.message || "Presensi berhasil dicatat");
            },
            onError: (error) => {
              setStatus("error");
              setCameraReady(false);
              setMessage(
                error instanceof Error
                  ? error.message
                  : "Presensi gagal diproses"
              );
            },
          });
        },
        () => {
          // Error kecil saat QR belum terbaca tidak perlu ditampilkan
        }
      );

      setCameraReady(true);
      setMessage("Kamera aktif. Arahkan ke QR Code event.");
    } catch (error) {
      setStatus("error");
      setCameraReady(false);
      setMessage(
        error instanceof Error
          ? error.message
          : "Akses kamera ditolak atau kamera tidak tersedia"
      );
    }
  };

  const resetScanner = async () => {
    await stopScanner();
    await clearScanner();

    scannerRef.current = null;
    isProcessingRef.current = false;

    setStatus("idle");
    setCameraReady(false);
    setMessage("Arahkan kamera ke QR Code event untuk melakukan presensi");
  };

  useEffect(() => {
    return () => {
      stopScanner();
    };
  }, []);

  const navItems = [
    {
      icon: "home" as const,
      label: "Dashboard",
      path: "/dashboard",
      active: false,
    },
    {
      icon: "calendar" as const,
      label: "Event",
      path: "/events",
      active: false,
    },
    {
      icon: "history" as const,
      label: "Riwayat",
      path: "/riwayat",
      active: false,
    },
    {
      icon: "user" as const,
      label: "Profil",
      path: "/profil",
      active: false,
    },
  ];

  return (
    <div
      className="min-h-screen pb-28"
      style={{
        background:
          "linear-gradient(180deg, #f8fbff 0%, #eef8ff 36%, #d7f3e6 100%)",
      }}
    >
      <header className="bg-white px-4 py-3 flex items-center justify-between sticky top-0 z-40 shadow-sm">
        <button
          className="p-1 text-gray-600"
          aria-label="Buka menu"
          onClick={() => router.push("/dashboard")}
        >
          <Icon name="menu" className="w-[22px] h-[22px]" />
        </button>

        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-teal-400 to-emerald-600" />
          <span className="text-sm font-semibold text-gray-700">
            nama aplikasi
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => router.push("/notifikasi")}
            className="relative p-1"
            aria-label="Notifikasi"
          >
            <Icon name="bell" className="w-[22px] h-[22px]" />

            {unreadNotif > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white text-[10px] rounded-full flex items-center justify-center font-bold">
                {unreadNotif > 9 ? "9+" : unreadNotif}
              </span>
            )}
          </button>

          <button onClick={() => router.push("/profil")} aria-label="Profil">
            <div className="w-8 h-8 rounded-full bg-emerald-600 flex items-center justify-center text-white">
              <Icon name="user" className="w-4 h-4" />
            </div>
          </button>
        </div>
      </header>

      <main className="px-4 pt-5 max-w-md mx-auto">
        <section className="text-center">
          <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-br from-emerald-400 to-emerald-700 flex items-center justify-center text-white shadow-lg">
            <Icon name="camera" className="w-8 h-8" />
          </div>

          <h1 className="text-xl font-bold text-gray-800 mt-4">
            Scan QR Presensi
          </h1>

          <p className="text-sm text-gray-500 mt-2 leading-relaxed px-6">
            {message}
          </p>
        </section>

        <section className="mt-6">
          <div className="relative bg-slate-900 rounded-xl overflow-hidden shadow-xl h-[342px] flex items-center justify-center">
            <div id="qr-reader" className="w-full h-full" />

            {!cameraReady && (
              <div className="absolute inset-0 flex items-center justify-center text-slate-600">
                {status === "success" ? (
                  <div className="w-16 h-16 rounded-full bg-emerald-500 text-white flex items-center justify-center">
                    <Icon name="check" className="w-9 h-9" />
                  </div>
                ) : status === "error" ? (
                  <div className="w-16 h-16 rounded-full bg-red-500 text-white flex items-center justify-center">
                    <Icon name="x" className="w-9 h-9" />
                  </div>
                ) : (
                  <Icon name="camera" className="w-14 h-14" />
                )}
              </div>
            )}

            <div className="absolute top-8 left-8 w-12 h-12 border-t-4 border-l-4 border-emerald-400 rounded-tl-xl" />
            <div className="absolute top-8 right-8 w-12 h-12 border-t-4 border-r-4 border-emerald-400 rounded-tr-xl" />
            <div className="absolute bottom-8 left-8 w-12 h-12 border-b-4 border-l-4 border-emerald-400 rounded-bl-xl" />
            <div className="absolute bottom-8 right-8 w-12 h-12 border-b-4 border-r-4 border-emerald-400 rounded-br-xl" />
          </div>

          {(status === "idle" || status === "error") && (
            <button
              onClick={startScanner}
              disabled={scanQR.isPending}
              className="mt-5 w-full rounded-2xl py-3.5 font-semibold text-white flex items-center justify-center gap-2 disabled:opacity-60"
              style={{
                background:
                  "linear-gradient(135deg, #b8e8a0 0%, #37ad82 100%)",
                boxShadow: "0 10px 24px rgba(32, 176, 112, 0.25)",
              }}
            >
              <Icon name="camera" className="w-4 h-4" />
              Aktifkan Kamera
            </button>
          )}

          {status === "scanning" && (
            <button
              onClick={resetScanner}
              className="mt-5 w-full rounded-2xl py-3.5 font-semibold text-emerald-700 bg-white border border-emerald-200"
            >
              Matikan Kamera
            </button>
          )}

          {status === "success" && (
            <button
              onClick={() => router.push("/riwayat")}
              className="mt-5 w-full rounded-2xl py-3.5 font-semibold text-white bg-emerald-600"
            >
              Lihat Riwayat Kehadiran
            </button>
          )}
        </section>

        <section className="mt-5 rounded-2xl border border-emerald-500 bg-white/45 p-4">
          <div className="flex items-start gap-3">
            <Icon
              name="info"
              className="w-5 h-5 text-teal-700 mt-0.5 flex-shrink-0"
            />

            <div>
              <h2 className="font-bold text-teal-800 text-sm">
                Tips Scan QR Code
              </h2>

              <ul className="text-xs text-emerald-700 mt-1 space-y-1 leading-relaxed">
                <li>• Pastikan QR Code berada di dalam bingkai</li>
                <li>• Hindari pantulan cahaya pada QR Code</li>
                <li>• Pegang kamera dengan stabil</li>
                <li>• Gunakan pencahayaan yang cukup</li>
              </ul>
            </div>
          </div>
        </section>
      </main>

      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-3 pt-2 pb-3 z-50 shadow-[0_-8px_24px_rgba(15,23,42,0.06)]">
        <div className="grid grid-cols-5 items-end max-w-md mx-auto">
          {navItems.slice(0, 2).map((item) => (
            <button
              key={item.path}
              onClick={() => router.push(item.path)}
              className={`flex flex-col items-center gap-1 py-1.5 rounded-xl transition-colors ${
                item.active
                  ? "text-teal-600"
                  : "text-gray-400 hover:text-gray-600"
              }`}
            >
              <Icon name={item.icon} className="w-5 h-5" />
              <span className="text-[11px] font-medium leading-none">
                {item.label}
              </span>
            </button>
          ))}

          <button
            onClick={() => router.push("/scan")}
            className="-mt-9 flex flex-col items-center gap-1 text-teal-700 active:scale-95 transition-transform"
            aria-label="Scan QR Presensi"
          >
            <span
              className="w-16 h-16 rounded-full text-white flex items-center justify-center shadow-lg border-4 border-white"
              style={{
                background:
                  "linear-gradient(135deg, #3ecf8e 0%, #20b070 100%)",
                boxShadow: "0 8px 24px rgba(32, 176, 112, 0.35)",
              }}
            >
              <Icon name="qr" className="w-7 h-7" />
            </span>

            <span className="text-[11px] font-semibold leading-none">
              Scan
            </span>
          </button>

          {navItems.slice(2).map((item) => (
            <button
              key={item.path}
              onClick={() => router.push(item.path)}
              className={`flex flex-col items-center gap-1 py-1.5 rounded-xl transition-colors ${
                item.active
                  ? "text-teal-600"
                  : "text-gray-400 hover:text-gray-600"
              }`}
            >
              <Icon name={item.icon} className="w-5 h-5" />
              <span className="text-[11px] font-medium leading-none">
                {item.label}
              </span>
            </button>
          ))}
        </div>
      </nav>
    </div>
  );
}