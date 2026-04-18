"use client";

import { useRole } from "@/lib/hooks/use-role";

interface RoleGateProps {
  roles: string[];
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function RoleGate({ roles, children, fallback = null }: RoleGateProps) {
  const { hasAnyRole } = useRole();

  if (!hasAnyRole(roles)) return <>{fallback}</>;

  return <>{children}</>;
}
