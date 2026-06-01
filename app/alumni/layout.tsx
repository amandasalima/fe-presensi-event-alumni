"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { QueryClientProvider } from "@tanstack/react-query";
import queryClient from "@/lib/queryClient";

export default function AlumniLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    const isPublicPage = pathname === "/alumni/login" || pathname === "/alumni/register";
    const token = localStorage.getItem("alumni_token") || sessionStorage.getItem("alumni_token");

    if (isPublicPage) {
      if (token) {
        router.replace("/alumni/main/dashboard");
      } else {
        setAuthorized(true);
      }
      return;
    }

    // Protected page
    if (!token) {
      // Clear token/session if invalid and redirect
      localStorage.removeItem("alumni_token");
      sessionStorage.removeItem("alumni_token");
      router.replace("/alumni/login");
    } else {
      setAuthorized(true);
    }
  }, [pathname, router]);

  const isPublicPage = pathname === "/alumni/login" || pathname === "/alumni/register";

  if (!authorized && !isPublicPage) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="flex flex-col items-center gap-2">
          <div className="w-10 h-10 border-4 border-teal-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-500 font-medium">Memverifikasi Akses Alumni...</p>
        </div>
      </div>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <div className="min-h-dvh bg-gray-100 overflow-x-hidden">
        <main className="w-full min-w-0">
          {children}
        </main>
      </div>
    </QueryClientProvider>
  );
}
