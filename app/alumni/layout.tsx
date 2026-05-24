"use client";

import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
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
      <div className="min-h-screen bg-gray-100 flex justify-center">
        <div className="w-full max-w-[430px] bg-gray-50 relative shadow-xl min-h-screen pb-28">
          <AlumniHeader />

          <main className="px-4 pt-5 space-y-5">{children}</main>

          <AlumniFooter />
        </div>
      </div>

      {process.env.NODE_ENV === "development" && (
        <ReactQueryDevtools initialIsOpen={false} />
      )}
    </QueryClientProvider>
  );
}