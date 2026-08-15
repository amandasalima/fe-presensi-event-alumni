"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { clearAuthStorage } from "@/lib/api";
import { stopHeartbeat } from "@/lib/heartbeat";
import { useAuthUser, isSuperAdmin } from "@/hooks/admin/useAuthUser";
import { useSidebar } from "@/context/SidebarContext";
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  UserCog,
  Calendar,
  CalendarDays,
  QrCode,
  BarChart3,
  ClipboardList,
  TrendingUp,
  MessageSquare,
  Settings,
  LogOut,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

export default function AdminSidebar() {
  const pathname = usePathname();
  const user = useAuthUser();
  const {
    isCollapsed,
    toggleSidebar,
    setIsCollapsed,
    expandedMenus,
    toggleMenu,
    setMenuExpanded,
  } = useSidebar();

  const handleLogout = () => {
    stopHeartbeat();
    clearAuthStorage();
    window.location.href = "/admin/login";
  };

  // Define sidebar menu structure
  interface MenuItemDirect {
    type: "direct";
    id: string;
    name: string;
    path: string;
    icon: React.ComponentType<{ className?: string }>;
  }

  interface MenuItemSub {
    name: string;
    path: string;
    icon: React.ComponentType<{ className?: string }>;
    superAdminOnly?: boolean;
  }

  interface MenuGroupType {
    type: "group";
    id: string;
    name: string;
    icon: React.ComponentType<{ className?: string }>;
    subItems: MenuItemSub[];
  }

  type SidebarMenuItem = MenuItemDirect | MenuGroupType;

  const menuGroups: SidebarMenuItem[] = [
    {
      type: "direct",
      id: "dashboard",
      name: "Dashboard",
      path: "/admin/dashboard",
      icon: LayoutDashboard,
    },
    {
      type: "group",
      id: "users",
      name: "Akun Pengguna",
      icon: Users,
      subItems: [
        {
          name: "Kelola Alumni",
          path: "/admin/users",
          icon: GraduationCap,
        },
        {
          name: "Kelola Admin",
          path: "/admin/admins",
          icon: UserCog,
          superAdminOnly: true,
        },
      ],
    },
    {
      type: "group",
      id: "events",
      name: "Manajemen Event",
      icon: Calendar,
      subItems: [
        {
          name: "Daftar Event",
          path: "/admin/events",
          icon: CalendarDays,
        },
        {
          name: "Buat QR Code",
          path: "/admin/qr-code",
          icon: QrCode,
        },
      ],
    },
    {
      type: "group",
      id: "reports",
      name: "Laporan",
      icon: BarChart3,
      subItems: [
        {
          name: "Riwayat Kehadiran",
          path: "/admin/reports",
          icon: ClipboardList,
        },
        {
          name: "Statistik Kehadiran",
          path: "/admin/engagement-mapping",
          icon: TrendingUp,
        },
      ],
    },
    {
      type: "direct",
      id: "broadcast",
      name: "Kirim WhatsApp",
      path: "/admin/broadcast",
      icon: MessageSquare,
    },
    {
      type: "direct",
      id: "settings",
      name: "Pengaturan",
      path: "/admin/settings",
      icon: Settings,
    },
  ];

  const handleGroupClick = (groupId: string) => {
    if (isCollapsed) {
      setIsCollapsed(false);
      setMenuExpanded(groupId, true);
    } else {
      toggleMenu(groupId);
    }
  };

  return (
    <aside
      className={`bg-gradient-to-b from-[#0D5C3A] via-[#0A4D30] to-[#073D26] text-white flex flex-col fixed left-0 top-0 h-screen z-50 transition-all duration-300 shadow-2xl ${
        isCollapsed ? "w-20" : "w-64"
      }`}
    >
      {/* Islamic Pattern Background */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none">
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern
              id="sidebar-pattern"
              width="40"
              height="40"
              patternUnits="userSpaceOnUse"
            >
              <circle
                cx="20"
                cy="20"
                r="15"
                fill="none"
                stroke="#D4AF37"
                strokeWidth="0.5"
              />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#sidebar-pattern)" />
        </svg>
      </div>

      {/* Logo Section */}
      <div className="relative z-10 p-4 border-b border-[#D4AF37]/20 h-auto">
        <div className="flex items-center gap-3">
          {/* Logo Pesantren */}
          <div className="relative flex-shrink-0">
            <div className="w-12 h-12 bg-white rounded-full p-1 shadow-lg ring-2 ring-[#D4AF37]/30">
              <img
                src="/images/logo-pesantren.png"
                alt="Logo Pesantren Al-Falah"
                className="w-full h-full object-contain"
              />
            </div>
          </div>

          <div
            className={`flex flex-col transition-all duration-300 ${
              isCollapsed
                ? "opacity-0 max-w-0 overflow-hidden"
                : "opacity-100 max-w-xs"
            }`}
          >
            <h1 className="font-bold text-[15px] tracking-wide text-white leading-tight">
              Pondok Pesantren
            </h1>
            <h2 className="font-bold text-[15px] tracking-wide text-[#D4AF37] leading-tight">
              Al-Qur&apos;an Al-Falah
            </h2>
            <p className="text-[10px] text-[#E8F5E9]/70 uppercase tracking-wider mt-0.5">
              Portal Admin
            </p>
          </div>
        </div>
      </div>

      {/* Navigation Menus */}
      <nav className="relative z-10 flex-1 p-3 space-y-1.5 overflow-y-auto custom-scrollbar">
        {menuGroups.map((group, index) => {
          if (group.type === "direct") {
            const active = pathname === group.path;
            const Icon = group.icon;

            return (
              <Link
                key={index}
                href={group.path!}
                className={`flex items-center justify-between px-3 py-2.5 rounded-xl transition-all duration-200 group ${
                  active
                    ? "bg-gradient-to-r from-[#D4AF37] to-[#B8941F] shadow-lg text-white font-semibold"
                    : "hover:bg-white/10 text-white/90 hover:text-white"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon
                    className={`h-5 w-5 flex-shrink-0 ${active ? "drop-shadow-sm" : "group-hover:scale-110 transition-transform"}`}
                  />
                  <span
                    className={`text-sm transition-all duration-300 ${
                      isCollapsed
                        ? "opacity-0 max-w-0 overflow-hidden"
                        : "opacity-100 max-w-xs"
                    }`}
                  >
                    {group.name}
                  </span>
                </div>
                {!isCollapsed && active && (
                  <span className="text-[10px] animate-pulse">●</span>
                )}
              </Link>
            );
          } else {
            // Group type menu (Dropdown)
            const GroupIcon = group.icon;
            // Filter subItems based on super admin privileges
            const visibleSubItems = (group.subItems ?? []).filter(
              (sub) => !sub.superAdminOnly || isSuperAdmin(user),
            );

            // If no subItems are visible, do not render this group
            if (visibleSubItems.length === 0) return null;

            const isExpanded = !!expandedMenus[group.id];
            const hasActiveSub = visibleSubItems.some(
              (sub) => pathname === sub.path,
            );

            return (
              <div key={index} className="space-y-1">
                <button
                  onClick={() => handleGroupClick(group.id)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-all duration-200 group ${
                    hasActiveSub && !isExpanded
                      ? "bg-white/10 text-[#D4AF37] font-semibold border border-[#D4AF37]/30"
                      : "hover:bg-white/10 text-white/90 hover:text-white"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <GroupIcon
                      className={`h-5 w-5 flex-shrink-0 ${hasActiveSub && !isExpanded ? "text-[#D4AF37]" : "group-hover:scale-110 transition-transform"}`}
                    />
                    <span
                      className={`text-sm text-left transition-all duration-300 ${
                        isCollapsed
                          ? "opacity-0 max-w-0 overflow-hidden"
                          : "opacity-100 max-w-xs"
                      }`}
                    >
                      {group.name}
                    </span>
                  </div>
                  {!isCollapsed && (
                    <span className="text-white/60">
                      {isExpanded ? (
                        <ChevronUp className="h-3.5 w-3.5" />
                      ) : (
                        <ChevronDown className="h-3.5 w-3.5" />
                      )}
                    </span>
                  )}
                </button>

                {/* Sub items */}
                {!isCollapsed && isExpanded && (
                  <div className="ml-5 pl-4 border-l border-[#D4AF37]/20 mt-1 mb-2 space-y-1 transition-all duration-300">
                    {visibleSubItems.map((sub, idx) => {
                      const subActive = pathname === sub.path;
                      const SubIcon = sub.icon;

                      return (
                        <Link
                          key={idx}
                          href={sub.path}
                          className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-200 group ${
                            subActive
                              ? "bg-gradient-to-r from-[#D4AF37] to-[#B8941F] shadow-md text-white font-semibold"
                              : "text-white/80 hover:bg-white/5 hover:text-white"
                          }`}
                        >
                          <SubIcon
                            className={`h-4 w-4 flex-shrink-0 ${subActive ? "drop-shadow-sm" : "group-hover:scale-110 transition-transform"}`}
                          />
                          <span className="text-xs">{sub.name}</span>
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          }
        })}
      </nav>

      {/* Minimize Toggle & Logout Footer */}
      <div className="relative z-10 p-3 border-t border-[#D4AF37]/20 space-y-2">
        {/* Toggle Collapse Button */}
        <button
          onClick={toggleSidebar}
          className="w-full py-2.5 rounded-xl text-white/70 hover:text-white hover:bg-white/10 transition duration-200 text-xs flex items-center justify-center gap-2 border border-[#D4AF37]/20 hover:border-[#D4AF37]/40"
          title={isCollapsed ? "Expand Sidebar" : "Minimize Sidebar"}
        >
          {isCollapsed ? (
            <ChevronRight className="h-4.5 w-4.5 flex-shrink-0" />
          ) : (
            <>
              <ChevronLeft className="h-4.5 w-4.5 flex-shrink-0" />
              <span className="whitespace-nowrap font-medium">
                Sembunyikan Menu
              </span>
            </>
          )}
        </button>

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className="w-full py-2.5 rounded-xl  text-white/70 hover:text-white hover:bg-[#DC2626] transition duration-200 text-xs flex items-center justify-center gap-2 border border-[#D4AF37]/20  hover:border-[#DC2626]/40 "
          title="Keluar"
        >
          <LogOut className="h-4 w-4 flex-shrink-0" />
          {!isCollapsed && <span className="whitespace-nowrap">Keluar</span>}
        </button>
      </div>
    </aside>
  );
}
