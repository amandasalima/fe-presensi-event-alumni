"use client";

import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import queryClient from "@/lib/queryClient";

// export default function AlumniLayout({
//   children,
// }: {
//   children: React.ReactNode;
// }) {
//   return (
//     <QueryClientProvider client={queryClient}>
//       {children}
//       {process.env.NODE_ENV === "development" && (
//         <ReactQueryDevtools initialIsOpen={false} />
//       )}
//     </QueryClientProvider>
//   );
// }


export default function AlumniLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-100 flex justify-center">
      <div className="w-full max-w-[430px] bg-gray-50 relative shadow-xl min-h-screen">
        {children}
      </div>
    </div>
  );
}