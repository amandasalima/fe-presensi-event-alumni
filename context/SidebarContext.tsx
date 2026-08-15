"use client";

import React, { createContext, useContext, useState } from "react";

interface SidebarContextType {
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
  toggleSidebar: () => void;
  expandedMenus: Record<string, boolean>;
  toggleMenu: (menuName: string) => void;
  setMenuExpanded: (menuName: string, expanded: boolean) => void;
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

export function SidebarProvider({ children }: { children: React.ReactNode }) {
  // Use lazy initialization to load from localStorage only once
  const [isCollapsed, setIsCollapsedState] = useState(() => {
    if (typeof window === "undefined") return false;
    const saved = localStorage.getItem("sidebar_collapsed");
    return saved === "true";
  });

  const [expandedMenus, setExpandedMenus] = useState<Record<string, boolean>>(
    () => {
      if (typeof window === "undefined") return {};
      const saved = localStorage.getItem("sidebar_expanded_menus");
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch (e) {
          console.error("Failed to parse expanded menus", e);
          return {};
        }
      }
      return {};
    },
  );

  const setIsCollapsed = (collapsed: boolean) => {
    setIsCollapsedState(collapsed);
    if (typeof window !== "undefined") {
      localStorage.setItem("sidebar_collapsed", String(collapsed));
    }
  };

  const toggleSidebar = () => {
    setIsCollapsedState((prev) => {
      const next = !prev;
      if (typeof window !== "undefined") {
        localStorage.setItem("sidebar_collapsed", String(next));
      }
      return next;
    });
  };

  const toggleMenu = (menuName: string) => {
    setExpandedMenus((prev) => {
      const next = { ...prev, [menuName]: !prev[menuName] };
      if (typeof window !== "undefined") {
        localStorage.setItem("sidebar_expanded_menus", JSON.stringify(next));
      }
      return next;
    });
  };

  const setMenuExpanded = (menuName: string, expanded: boolean) => {
    setExpandedMenus((prev) => {
      const next = { ...prev, [menuName]: expanded };
      if (typeof window !== "undefined") {
        localStorage.setItem("sidebar_expanded_menus", JSON.stringify(next));
      }
      return next;
    });
  };

  return (
    <SidebarContext.Provider
      value={{
        isCollapsed,
        setIsCollapsed,
        toggleSidebar,
        expandedMenus,
        toggleMenu,
        setMenuExpanded,
      }}
    >
      {children}
    </SidebarContext.Provider>
  );
}

export function useSidebar() {
  const context = useContext(SidebarContext);
  if (!context) {
    throw new Error("useSidebar must be used within a SidebarProvider");
  }
  return context;
}
