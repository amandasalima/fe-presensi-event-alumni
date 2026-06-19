"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";

const ADMIN_LOGIN_PATH = "/admin/login";
const ADMIN_DASHBOARD_PATH = "/admin/dashboard";

function getAdminCredentials() {
  return {
    token: localStorage.getItem("access_token") || localStorage.getItem("token"),
    role: localStorage.getItem("role"),
  };
}

function clearAdminCredentials() {
  localStorage.removeItem("access_token");
  localStorage.removeItem("token");
  localStorage.removeItem("role");
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [authorized, setAuthorized] = useState(() => pathname === ADMIN_LOGIN_PATH);

  useEffect(() => {
    const verifyAccess = () => {
      const { token, role } = getAdminCredentials();

      if (pathname === ADMIN_LOGIN_PATH) {
        if (token && role === "admin") {
          router.replace(ADMIN_DASHBOARD_PATH);
          return;
        }

        setAuthorized(true);
        return;
      }

      if (!token || role !== "admin") {
        clearAdminCredentials();
        setAuthorized(false);
        router.replace(ADMIN_LOGIN_PATH);
        return;
      }

      setAuthorized(true);
    };

    const frameId = window.requestAnimationFrame(verifyAccess);

    return () => window.cancelAnimationFrame(frameId);
  }, [pathname, router]);

  if (!authorized) {
    if (pathname === ADMIN_LOGIN_PATH) {
      return null;
    }

    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-2">
          <div className="w-10 h-10 border-4 border-[#2D7EA0] border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-500 font-medium">Memverifikasi Akses Admin...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
