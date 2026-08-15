"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

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
  const [isCollapsed, setIsCollapsedState] = useState(false);
  const [expandedMenus, setExpandedMenus] = useState<Record<string, boolean>>({});

  // Load initial collapse state from localStorage on client side
  useEffect(() => {
    const savedCollapse = localStorage.getItem("sidebar_collapsed");
    if (savedCollapse === "true") {
      setIsCollapsedState(true);
    }

    const savedMenus = localStorage.getItem("sidebar_expanded_menus");
    if (savedMenus) {
      try {
        setExpandedMenus(JSON.parse(savedMenus));
      } catch (e) {
        console.error("Failed to parse expanded menus", e);
      }
    }
  }, []);

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
