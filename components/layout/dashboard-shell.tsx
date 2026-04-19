"use client";

import { useEffect } from "react";
import { Sidebar } from "./sidebar";
import { DashboardHeader } from "./dashboard-header";
import { useUIStore } from "@/stores/ui-store";

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const sidebarCollapsed = useUIStore((s) => s.sidebarCollapsed);
  const toggleSidebar = useUIStore((s) => s.toggleSidebar);

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
      <Sidebar collapsed={sidebarCollapsed} onToggle={toggleSidebar} />
      <div className="flex flex-1 flex-col overflow-hidden">
        <DashboardHeader onToggleSidebar={toggleSidebar} />
        <main className="flex-1 overflow-y-auto bg-surface p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
