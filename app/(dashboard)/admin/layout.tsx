"use client";

import { RoleGate } from "@/components/auth/role-gate";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <RoleGate roles={["admin"]}>{children}</RoleGate>;
}
