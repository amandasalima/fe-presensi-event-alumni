"use client";

import { QueryClientProvider } from "@tanstack/react-query";
import queryClient from "@/lib/queryClient";

export default function AlumniLayout({
  children,
}: {
  children: React.ReactNode;
}) {
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
