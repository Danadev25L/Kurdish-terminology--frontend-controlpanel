"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { Sidebar } from "./sidebar";
import { DashboardHeader } from "./dashboard-header";
import { ToastContainer } from "@/components/ui/toast";
import { useUIStore } from "@/stores/ui-store";

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const sidebarCollapsed = useUIStore((s) => s.sidebarCollapsed);
  const toggleSidebar = useUIStore((s) => s.toggleSidebar);
  const setSidebarCollapsed = useUIStore((s) => s.setSidebarCollapsed);
  const mainRef = useRef<HTMLElement>(null);
  const pathname = usePathname();

  useEffect(() => {
    mainRef.current?.focus();
  }, [pathname]);

  // Auto-collapse sidebar on mobile
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px)");
    if (!mq.matches) setSidebarCollapsed(true);
  }, [setSidebarCollapsed]);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && e.key === "b") {
        e.preventDefault();
        toggleSidebar();
      }
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [toggleSidebar]);

  return (
    <div className="flex h-screen overflow-hidden">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:rounded-lg focus:bg-primary-500 focus:px-4 focus:py-2 focus:text-white"
      >
        Skip to main content
      </a>
      <Sidebar collapsed={sidebarCollapsed} onToggle={toggleSidebar} />
      <div className="flex flex-1 flex-col overflow-hidden">
        <DashboardHeader onToggleSidebar={toggleSidebar} />
        <main
          ref={mainRef}
          id="main-content"
          tabIndex={-1}
          className="flex-1 overflow-y-auto bg-surface p-6 outline-none"
        >
          {children}
        </main>
      </div>
      <ToastContainer />
    </div>
  );
}
