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
      className={`bg-[#2D7EA0] text-white flex flex-col fixed left-0 top-0 h-screen z-50 transition-all duration-300 shadow-xl ${
        isCollapsed ? "w-20" : "w-56"
      }`}
    >
      {/* Logo */}
      <div className="p-4 border-b border-white/10 h-16 flex items-center justify-between overflow-hidden">
        <div className="flex items-center gap-2.5">
          <span className="inline-flex w-9 h-9 bg-white/20 rounded-lg items-center justify-center flex-shrink-0 shadow-inner">
            <Calendar className="h-5 w-5 text-white" />
          </span>
          <div
            className={`flex flex-col transition-all duration-300 ${
              isCollapsed
                ? "opacity-0 max-w-0 overflow-hidden"
                : "opacity-100 max-w-xs"
            }`}
          >
            <h1 className="font-bold, text-[16px] tracking-wide uppercase whitespace-nowrap">
              Al-Falah
            </h1>
            <p className="text-[12px] text-[#7AB2B2] whitespace-nowrap font-medium">
              Dashboard Admin
            </p>
          </div>
        </div>
      </div>

      {/* Navigation Menus */}
      <nav className="flex-1 p-3 space-y-1.5 overflow-y-auto">
        {menuGroups.map((group, index) => {
          if (group.type === "direct") {
            const active = pathname === group.path;
            const Icon = group.icon;

            return (
              <Link
                key={index}
                href={group.path!}
                className={`flex items-center justify-between px-3 py-2.5 rounded-xl transition-all duration-200 ${
                  active
                    ? "bg-[#3EBDAF] shadow-md text-white font-medium"
                    : "hover:bg-[#236175] text-white/90"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className="h-4.5 w-4.5 flex-shrink-0" />
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
                  <span className="text-[10px]">●</span>
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
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-all duration-200 ${
                    hasActiveSub && !isExpanded
                      ? "bg-[#3EBDAF]/20 text-[#3EBDAF] font-medium border border-[#3EBDAF]/30"
                      : "hover:bg-[#236175] text-white/90"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <GroupIcon className="h-4.5 w-4.5 flex-shrink-0" />
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
                  <div className="ml-5 pl-4 border-l border-white/10 mt-1 mb-2 space-y-1 transition-all duration-300">
                    {visibleSubItems.map((sub, idx) => {
                      const subActive = pathname === sub.path;
                      const SubIcon = sub.icon;

                      return (
                        <Link
                          key={idx}
                          href={sub.path}
                          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all duration-200 ${
                            subActive
                              ? "bg-[#3EBDAF] shadow-sm text-white font-medium"
                              : "text-white/80 hover:bg-[#236175] hover:text-white"
                          }`}
                        >
                          <SubIcon className="h-3.5 w-3.5 flex-shrink-0" />
                          <span className="text-xs whitespace-nowrap">
                            {sub.name}
                          </span>
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
      <div className="p-3 border-t border-white/10 space-y-2">
        {/* Toggle Collapse Button */}
        <button
          onClick={toggleSidebar}
          className="w-full py-2 rounded-xl text-white/60 hover:text-white hover:bg-[#236175]/50 transition duration-200 text-xs flex items-center justify-center gap-2 border border-white/5"
          title={isCollapsed ? "Expand Sidebar" : "Minimize Sidebar"}
        >
          {isCollapsed ? (
            <ChevronRight className="h-4.5 w-4.5 flex-shrink-0" />
          ) : (
            <>
              <ChevronLeft className="h-4.5 w-4.5 flex-shrink-0" />
              <span className="whitespace-nowrap">Sembunyikan Menu</span>
            </>
          )}
        </button>

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className="w-full py-2.5 rounded-xl bg-[#236175] hover:bg-[#3EBDAF] transition duration-200 text-sm flex items-center justify-center gap-2 text-white shadow-md hover:shadow-lg"
          title="Keluar"
        >
          <LogOut className="h-4 w-4 flex-shrink-0" />
          {!isCollapsed && <span className="whitespace-nowrap">Keluar</span>}
        </button>
      </div>
    </aside>
  );
}
