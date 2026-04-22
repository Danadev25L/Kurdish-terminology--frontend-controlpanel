"use client";

import { useApi } from "@/lib/hooks/use-api";
import { useRouter } from "next/navigation";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { RoleGate } from "@/components/auth/role-gate";
import type { Domain } from "@/lib/api/types";
import { useI18n } from "@/i18n/context";

export default function DomainsPage() {
  const router = useRouter();
  const { t } = useI18n();
  const { data: domains, isLoading } = useApi<Domain[]>("/api/v1/domains");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-heading font-extrabold tracking-[-0.02em] text-foreground">{t("domains.title")}</h1>
        <RoleGate roles={["admin"]}>
          <Button onClick={() => router.push("/domains/new")}>{t("domains.add_domain")}</Button>
        </RoleGate>
      </div>

      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="animate-pulse p-6">
              <div className="h-5 w-2/3 rounded bg-border-light mb-3" />
              <div className="h-4 w-full rounded bg-border-light mb-2" />
              <div className="h-4 w-1/2 rounded bg-border-light" />
            </Card>
          ))}
        </div>
      ) : domains && domains.length > 0 ? (
        <ul role="list" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {domains.map((domain) => (
            <li key={domain.id}>
              <button
                onClick={() => router.push(`/domains/${domain.id}`)}
                className="text-start w-full cursor-pointer"
              >
                <Card className="transition-shadow hover:shadow-md cursor-pointer">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold text-foreground">
                        {domain.name}
                      </h3>
                      <p className="mt-1 text-[13px] text-text-muted line-clamp-2">
                        {domain.description}
                      </p>
                    </div>
                    <Badge>{domain.slug}</Badge>
                  </div>
                  <div className="mt-3 flex gap-4 text-xs text-text-muted">
                    <span>{domain.experts_count ?? 0} {t("domains.experts")}</span>
                    <span>{domain.concepts_count ?? 0} {t("domains.concepts")}</span>
                  </div>
                </Card>
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p className="py-8 text-center text-[13px] text-text-muted">
          {t("domains.no_domains")}
        </p>
      )}
    </div>
  );
}
