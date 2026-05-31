"use client";

import { QueryClientProvider } from "@tanstack/react-query";
import queryClient from "@/lib/queryClient";

import AlumniHeader from "@/app/components/alumni/AlumniHeader";
import AlumniFooter from "@/app/components/alumni/AlumniFooter";

export default function AlumniLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <QueryClientProvider client={queryClient}>
      <div className="min-h-dvh bg-gray-100 overflow-x-hidden">
        <div className="w-full min-w-0 bg-gray-50 relative min-h-dvh overflow-x-hidden">
          <AlumniHeader />

          <main className="w-full px-3 sm:px-4 md:px-6 lg:px-8 pt-[calc(4.75rem+env(safe-area-inset-top))] pb-[calc(8.75rem+env(safe-area-inset-bottom))] space-y-5">
            {children}
          </main>

          <AlumniFooter />
        </div>
      </div>
    </QueryClientProvider>
  );
}
