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
import { LanguageToggle } from "@/components/layout/language-toggle";
import { useI18n } from "@/i18n/context";

export function LogoutButton() {
  const { logout } = useAuth();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    await logout();
    router.replace("/login");
  };

  return (
    <div ref={menuRef} className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        aria-label="User menu"
        className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-600 text-sm font-semibold text-white hover:bg-primary-700"
      >
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute end-0 top-full z-50 mt-1 w-48 rounded-lg border border-border bg-surface-raised shadow-lg">
          <div className="border-b border-border px-4 py-2">
            <p className="text-sm font-medium text-foreground">My Account</p>
          </div>
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-2 px-4 py-2 text-sm text-danger hover:bg-surface"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
            </svg>
            Logout
          </button>
        </div>
      )}
    </div>
  );
}

interface DashboardHeaderProps {
  onToggleSidebar?: () => void;
}

export function DashboardHeader({ onToggleSidebar }: DashboardHeaderProps) {
  const { user, logout } = useAuth();
  const { roles } = useRole();
  const router = useRouter();
  const { t } = useI18n();
  const [notifOpen, setNotifOpen] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);

  const { data: notifications } = useApi<Notification[]>("/api/v1/notifications");
  const notifStore = useNotificationStore();

  useEffect(() => {
    if (notifications) notifStore.setNotifications(notifications);
  }, [notifications]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
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
    <header className="flex h-[52px] items-center justify-between border-b border-border bg-surface-raised px-6">
      <div className="flex items-center gap-3">
        {onToggleSidebar && (
          <button
            onClick={onToggleSidebar}
            aria-label="Toggle sidebar"
            className="rounded-lg p-1.5 text-text-muted hover:bg-surface hover:text-text-secondary"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
            </svg>
          </button>
        )}
        <div className="hidden items-center gap-1.5 sm:flex">
          {roles.map((role) => (
            <span
              key={role}
              className="rounded bg-primary-light px-2 py-0.5 text-[11px] font-medium text-primary-500"
            >
              {role.replace("_", " ")}
            </span>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-3">
        <LanguageToggle />

        {/* Notification bell */}
        <div ref={notifRef} className="relative">
          <button
            onClick={() => setNotifOpen(!notifOpen)}
            aria-label={"Notifications" + (notifStore.unreadCount > 0 ? ` (${notifStore.unreadCount} unread)` : "")}
            className="relative rounded-lg p-2 text-text-muted hover:bg-surface hover:text-text-secondary"
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
            <div className="absolute end-0 top-full z-50 mt-1 w-80 rounded-[10px] border border-border bg-surface-raised shadow-lg">
              <div className="flex items-center justify-between border-b border-border-light px-4 py-2">
                <span className="text-sm font-semibold text-foreground">{t("common.notifications")}</span>
                {notifStore.unreadCount > 0 && (
                  <button
                    onClick={() => notifStore.markAllRead()}
                    className="text-xs text-primary-500 hover:underline"
                  >
                    {t("common.mark_all_read")}
                  </button>
                )}
              </div>
              <div className="max-h-64 overflow-y-auto">
                {notifStore.notifications.length === 0 ? (
                  <p className="px-4 py-6 text-center text-sm text-text-muted">
                    {t("common.no_notifications")}
                  </p>
                ) : (
                  notifStore.notifications.slice(0, 10).map((notif) => (
                    <button
                      key={notif.id}
                      onClick={() => handleNotifClick(notif)}
                      className={`w-full text-start px-4 py-3 transition-colors hover:bg-surface ${
                        !notif.read ? "bg-primary-light/50" : ""
                      }`}
                    >
                      <div className="flex items-start gap-2">
                        {!notif.read && (
                          <div className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-primary-500" />
                        )}
                        <div className={notif.read ? "ps-4" : ""}>
                          <p className="text-sm font-medium text-foreground">
                            {notif.title}
                          </p>
                          <p className="mt-0.5 text-xs text-text-muted line-clamp-1">
                            {notif.body}
                          </p>
                          <p className="mt-0.5 text-xs text-text-muted">
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

        {/* Settings button */}
        <button
          onClick={() => router.push("/profile")}
          aria-label="Settings"
          className="rounded-lg p-2 text-text-muted hover:bg-surface hover:text-text-secondary"
          title="Settings"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </button>

        {/* User menu with logout */}
        <LogoutButton />
      </div>
    </header>
  );
}
