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
  // Initialize state from localStorage to avoid hydration mismatch
  const [isCollapsed, setIsCollapsedState] = useState(() => {
    if (typeof window !== "undefined") {
      const savedCollapse = localStorage.getItem("sidebar_collapsed");
      return savedCollapse === "true";
    }
    return false;
  });

  const [expandedMenus, setExpandedMenus] = useState<Record<string, boolean>>(
    () => {
      if (typeof window !== "undefined") {
        const savedMenus = localStorage.getItem("sidebar_expanded_menus");
        if (savedMenus) {
          try {
            return JSON.parse(savedMenus);
          } catch (e) {
            console.error("Failed to parse expanded menus", e);
          }
        }
      }
      return {};
    },
  );

  const setIsCollapsed = (collapsed: boolean) => {
    setIsCollapsedState(collapsed);
    localStorage.setItem("sidebar_collapsed", String(collapsed));
  };

  const toggleSidebar = () => {
    setIsCollapsedState((prev) => {
      const next = !prev;
      localStorage.setItem("sidebar_collapsed", String(next));
      return next;
    });
  };

  const toggleMenu = (menuName: string) => {
    setExpandedMenus((prev) => {
      const next = { ...prev, [menuName]: !prev[menuName] };
      localStorage.setItem("sidebar_expanded_menus", JSON.stringify(next));
      return next;
    });
  };

  const setMenuExpanded = (menuName: string, expanded: boolean) => {
    setExpandedMenus((prev) => {
      const next = { ...prev, [menuName]: expanded };
      localStorage.setItem("sidebar_expanded_menus", JSON.stringify(next));
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
