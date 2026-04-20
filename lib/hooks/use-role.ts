"use client";

import { useAuthStore } from "@/stores/auth-store";

export function useRole() {
  const roles = useAuthStore((s) => s.user?.roles ?? []);

  const hasRole = (role: string) => roles.includes(role);
  const hasAnyRole = (checkRoles: string[]) =>
    checkRoles.some((r) => roles.includes(r));

  const isAdmin = hasRole("admin");
  const isMainBoard = hasRole("main_board");
  const isDomainHead = hasRole("domain-head");
  const isExpert = hasRole("expert");
  const isObserver = hasRole("observer");

  return { roles, hasRole, hasAnyRole, isAdmin, isMainBoard, isDomainHead, isExpert, isObserver };
}
