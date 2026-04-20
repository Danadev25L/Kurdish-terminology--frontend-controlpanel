"use client";

import Link from "next/link";
import { Card, CardTitle } from "@/components/ui/card";
import { useI18n } from "@/i18n/context";

export default function AdminPage() {
  const { t } = useI18n();

  const adminCards = [
    {
      title: t("admin.users.title"),
      description: t("admin.users.title"),
      href: "/admin/users",
    },
    {
      title: t("admin.references.title"),
      description: t("admin.references.title"),
      href: "/admin/references",
    },
    {
      title: t("admin.settings.title"),
      description: t("admin.settings.title"),
      href: "/admin/settings",
    },
    {
      title: t("admin.audit.title"),
      description: t("admin.audit.title"),
      href: "/admin/audit",
    },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">{t("admin.title")}</h1>
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
