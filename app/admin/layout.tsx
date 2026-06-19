"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    // 1. If it's the login page, check if already logged in
    if (pathname === "/admin/login") {
      const token = localStorage.getItem("access_token") || localStorage.getItem("token");
      const role = localStorage.getItem("role");
      if (token && role === "admin") {
        router.replace("/admin/dashboard");
      } else {
        setAuthorized(true);
      }
      return;
    }

    // 2. Protected page: check token and role
    const token = localStorage.getItem("access_token") || localStorage.getItem("token");
    const role = localStorage.getItem("role");

    if (!token || role !== "admin") {
      // Clear any invalid data and redirect
      localStorage.removeItem("access_token");
      localStorage.removeItem("token");
      localStorage.removeItem("role");
      router.replace("/admin/login");
    } else {
      setAuthorized(true);
    }
  }, [pathname, router]);

  if (!authorized && pathname !== "/admin/login") {
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
