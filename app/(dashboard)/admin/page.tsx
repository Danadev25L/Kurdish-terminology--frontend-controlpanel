"use client";

import Link from "next/link";
import { Card, CardTitle } from "@/components/ui/card";

const adminCards = [
  {
    title: "User Management",
    description: "Create and manage users, assign roles",
    href: "/admin/users",
  },
  {
    title: "Reference Library",
    description: "Manage dictionaries and import CSV data",
    href: "/admin/references",
  },
  {
    title: "Settings",
    description: "Configure system thresholds and parameters",
    href: "/admin/settings",
  },
  {
    title: "Audit Log",
    description: "Review system activity and decisions",
    href: "/admin/audit",
  },
];

export default function AdminPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
      <div className="grid gap-4 sm:grid-cols-2">
        {adminCards.map((card) => (
          <Link key={card.href} href={card.href}>
            <Card className="transition-shadow hover:shadow-md">
              <CardTitle>{card.title}</CardTitle>
              <p className="mt-1 text-sm text-muted">{card.description}</p>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
