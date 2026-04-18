"use client";

import { useAuth } from "@/lib/hooks/use-auth";
import { useRole } from "@/lib/hooks/use-role";
import { useNotificationStore } from "@/stores/notification-store";
import { useApi } from "@/lib/hooks/use-api";
import { markNotificationRead } from "@/lib/api/notifications";
import { useRouter } from "next/navigation";
import { useState, useRef, useEffect, useCallback } from "react";
import { timeAgo } from "@/lib/utils/format";
import type { Notification } from "@/lib/api/types";

export function DashboardHeader() {
  const { user, logout } = useAuth();
  const { roles } = useRole();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  const { data: notifications } = useApi<Notification[]>("/api/notifications", {
    pollingInterval: 120000,
  });
  const notifStore = useNotificationStore();

  useEffect(() => {
    if (notifications) notifStore.setNotifications(notifications);
  }, [notifications]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    await logout();
    router.replace("/login");
  };

  const handleNotifClick = useCallback(
    async (notif: Notification) => {
      if (!notif.read) {
        await markNotificationRead(notif.id);
        notifStore.markRead(notif.id);
      }
      if (notif.concept_id) {
        router.push(`/concepts/${notif.concept_id}`);
      }
      setNotifOpen(false);
    },
    [router, notifStore]
  );

  return (
    <header className="flex h-16 items-center justify-between border-b border-border bg-surface-raised px-6">
      <div />

      <div className="flex items-center gap-4">
        {/* Role badges */}
        <div className="hidden items-center gap-1.5 sm:flex">
          {roles.map((role) => (
            <span
              key={role}
              className="rounded-full bg-primary-light px-2.5 py-0.5 text-xs font-medium text-primary"
            >
              {role.replace("_", " ")}
            </span>
          ))}
        </div>

        {/* Notification bell */}
        <div ref={notifRef} className="relative">
          <button
            onClick={() => setNotifOpen(!notifOpen)}
            className="relative rounded-lg p-2 text-muted hover:bg-gray-100 hover:text-gray-700"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
            </svg>
            {notifStore.unreadCount > 0 && (
              <span className="absolute -top-0.5 end-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-danger px-1 text-[10px] font-bold text-white">
                {notifStore.unreadCount > 9 ? "9+" : notifStore.unreadCount}
              </span>
            )}
          </button>

          {notifOpen && (
            <div className="absolute end-0 top-full z-50 mt-1 w-80 rounded-lg border border-border bg-white shadow-lg">
              <div className="flex items-center justify-between border-b border-border px-4 py-2">
                <span className="text-sm font-semibold">Notifications</span>
                {notifStore.unreadCount > 0 && (
                  <button
                    onClick={() => notifStore.markAllRead()}
                    className="text-xs text-primary hover:underline"
                  >
                    Mark all read
                  </button>
                )}
              </div>
              <div className="max-h-64 overflow-y-auto">
                {notifStore.notifications.length === 0 ? (
                  <p className="px-4 py-6 text-center text-sm text-muted">
                    No notifications
                  </p>
                ) : (
                  notifStore.notifications.slice(0, 10).map((notif) => (
                    <button
                      key={notif.id}
                      onClick={() => handleNotifClick(notif)}
                      className={`w-full text-start px-4 py-3 transition-colors hover:bg-gray-50 ${
                        !notif.read ? "bg-primary-light/50" : ""
                      }`}
                    >
                      <div className="flex items-start gap-2">
                        {!notif.read && (
                          <div className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-primary" />
                        )}
                        <div className={notif.read ? "ps-4" : ""}>
                          <p className="text-sm font-medium text-gray-900">
                            {notif.title}
                          </p>
                          <p className="mt-0.5 text-xs text-muted line-clamp-1">
                            {notif.body}
                          </p>
                          <p className="mt-0.5 text-xs text-muted">
                            {timeAgo(notif.created_at)}
                          </p>
                        </div>
                      </div>
                    </button>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* User menu */}
        <div ref={menuRef} className="relative">
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="flex items-center gap-2 rounded-lg p-1.5 hover:bg-gray-100"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-sm font-medium text-white">
              {user?.name?.charAt(0)?.toUpperCase() ?? "U"}
            </div>
            <span className="hidden text-sm font-medium text-gray-700 sm:block">
              {user?.name}
            </span>
          </button>

          {menuOpen && (
            <div className="absolute end-0 top-full z-50 mt-1 w-48 rounded-lg border border-border bg-white py-1 shadow-lg">
              <div className="border-b border-border px-4 py-2">
                <p className="text-sm font-medium text-gray-900">
                  {user?.name}
                </p>
                <p className="text-xs text-muted">{user?.email}</p>
              </div>
              <button
                onClick={() => {
                  router.push("/");
                  setMenuOpen(false);
                }}
                className="w-full text-start px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
              >
                Public Portal
              </button>
              <button
                onClick={handleLogout}
                className="w-full text-start px-4 py-2 text-sm text-danger hover:bg-danger-light"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
