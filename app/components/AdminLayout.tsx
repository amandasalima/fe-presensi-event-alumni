"use client";

import { ReactNode } from "react";
import AdminSidebar from "./AdminSidebar";
import AdminHeader from "./AdminHeader";
import { useSidebar } from "@/context/SidebarContext";

interface AdminLayoutProps {
  children: ReactNode;
  title: string;
}

export default function AdminLayout({ children, title }: AdminLayoutProps) {
  const { isCollapsed } = useSidebar();

  return (
    <div className="h-screen bg-gradient-to-br from-[#E8F5E9] via-[#F1F8F4] to-[#E8F5E9] flex overflow-hidden">
      <AdminSidebar />

      <div
        className={`flex-1 flex flex-col h-screen transition-all duration-300 ${
          isCollapsed ? "ml-20" : "ml-64"
        }`}
      >
        <AdminHeader title={title} />

        <main className="flex-1 overflow-y-auto p-5">{children}</main>
      </div>
    </div>
  );
}
