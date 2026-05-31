"use client";

import { useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { useRouter } from "next/navigation";
import { useScanQR } from "@/hooks/alumni/useAlumniHooks";

function Icon({
  name,
  className = "w-5 h-5",
}: {
  name: "camera" | "info" | "check" | "x";
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

type ScanStatus = "idle" | "scanning" | "success" | "error";

function getMessage(value: unknown) {
  if (
    value &&
    typeof value === "object" &&
    "message" in value &&
    typeof value.message === "string"
  ) {
    return value.message;
  }

  return null;
}

export default function ScanPage() {
  const router = useRouter();

  const scannerRef = useRef<Html5Qrcode | null>(null);
  const isProcessingRef = useRef(false);

  const [status, setStatus] = useState<ScanStatus>("idle");
  const [message, setMessage] = useState(
    "Arahkan kamera ke QR Code event untuk melakukan presensi"
  );
  const [cameraReady, setCameraReady] = useState(false);

  const scanQR = useScanQR();

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
            onSuccess: (data: unknown) => {
              setStatus("success");
              setCameraReady(false);
              setMessage(getMessage(data) || "Presensi berhasil dicatat");
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

  return (
    <div
      className="-mx-3 sm:-mx-4 px-3 sm:px-4 pt-5 pb-6"
      style={{
        background:
          "linear-gradient(180deg, #f8fbff 0%, #eef8ff 36%, #d7f3e6 100%)",
      }}
    >
      <section className="text-center">
        <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-br from-emerald-400 to-emerald-700 flex items-center justify-center text-white shadow-lg">
          <Icon name="camera" className="w-8 h-8" />
        </div>

        <h1 className="text-xl font-bold text-gray-800 mt-4">
          Scan QR Presensi
        </h1>

        <p className="text-sm text-gray-500 mt-2 leading-relaxed px-2 sm:px-6">
          {message}
        </p>
      </section>

      <section className="mt-6">
        <div className="qr-scanner-shell relative bg-slate-950 rounded-[24px] overflow-hidden shadow-2xl aspect-square w-full flex items-center justify-center border border-white/70">
          <div id="qr-reader" className="qr-scanner-reader w-full h-full" />

          {!cameraReady && (
            <div className="absolute inset-0 z-20 flex items-center justify-center text-slate-500 bg-slate-950">
              {status === "success" ? (
                <div className="w-16 h-16 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-lg shadow-emerald-500/30">
                  <Icon name="check" className="w-9 h-9" />
                </div>
              ) : status === "error" ? (
                <div className="w-16 h-16 rounded-full bg-red-500 text-white flex items-center justify-center shadow-lg shadow-red-500/30">
                  <Icon name="x" className="w-9 h-9" />
                </div>
              ) : (
                <Icon name="camera" className="w-14 h-14" />
              )}
            </div>
          )}

          <div className="pointer-events-none absolute inset-0 z-10 bg-slate-950/20" />

          <div className="pointer-events-none absolute inset-x-[12%] inset-y-[12%] z-20 rounded-[28px]">
            {cameraReady && (
              <div className="qr-scanner-sweep absolute left-3 right-3 h-12 rounded-full" />
            )}

            <div className="absolute top-0 left-0 w-12 h-12 sm:w-14 sm:h-14 border-t-[5px] border-l-[5px] border-emerald-400 rounded-tl-[18px] shadow-[0_0_18px_rgba(52,211,153,0.55)]" />
            <div className="absolute top-0 right-0 w-12 h-12 sm:w-14 sm:h-14 border-t-[5px] border-r-[5px] border-emerald-400 rounded-tr-[18px] shadow-[0_0_18px_rgba(52,211,153,0.55)]" />
            <div className="absolute bottom-0 left-0 w-12 h-12 sm:w-14 sm:h-14 border-b-[5px] border-l-[5px] border-emerald-400 rounded-bl-[18px] shadow-[0_0_18px_rgba(52,211,153,0.55)]" />
            <div className="absolute bottom-0 right-0 w-12 h-12 sm:w-14 sm:h-14 border-b-[5px] border-r-[5px] border-emerald-400 rounded-br-[18px] shadow-[0_0_18px_rgba(52,211,153,0.55)]" />
          </div>
        </div>

        {(status === "idle" || status === "error") && (
          <button
            onClick={startScanner}
            disabled={scanQR.isPending}
            className="mt-5 w-full rounded-2xl py-3.5 font-semibold text-white flex items-center justify-center gap-2 disabled:opacity-60"
            style={{
              background: "linear-gradient(135deg, #b8e8a0 0%, #37ad82 100%)",
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
            onClick={() => router.push("/alumni/main/riwayat")}
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
    </div>
  );
}
