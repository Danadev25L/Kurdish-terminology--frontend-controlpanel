"use client";

import { useState } from "react";
import { useApi } from "@/lib/hooks/use-api";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Pagination } from "@/components/ui/pagination";
import { SkeletonTable } from "@/components/ui/skeleton";
import { formatDateTime } from "@/lib/utils/format";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import type { AuditEvent, PaginatedResponse } from "@/lib/api/types";
import { useI18n } from "@/i18n/context";

export default function AdminAuditPage() {
  const [page, setPage] = useState(1);
  const { t } = useI18n();

  const { data, isLoading } = useApi<PaginatedResponse<AuditEvent>>(
    `/api/v1/admin/audit-events?page=${page}`
  );

  return (
    <div className="space-y-6">
      <Breadcrumb items={[{ label: t("nav.admin"), href: "/admin" }, { label: t("admin.audit.title") }]} />
      <h1 className="text-heading font-extrabold tracking-[-0.02em] text-foreground">{t("admin.audit.title")}</h1>

      {isLoading ? (
        <SkeletonTable rows={10} />
      ) : data?.data && data.data.length > 0 ? (
        <>
          <div className="overflow-x-auto rounded-lg border border-border bg-surface-raised">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border-light bg-surface text-start text-[11px] font-semibold uppercase tracking-[0.05em] text-text-muted">
                  <th className="px-4 py-3">{t("common.timestamp")}</th>
                  <th className="px-4 py-3">{t("common.user")}</th>
                  <th className="px-4 py-3">{t("admin.audit.action")}</th>
                  <th className="px-4 py-3">{t("admin.audit.entity")}</th>
                  <th className="px-4 py-3">{t("admin.audit.details")}</th>
                  <th className="px-4 py-3">IP</th>
                </tr>
              </thead>
              <tbody>
                {data.data.map((event) => {
                  const changes: string[] = [];
                  if (event.new_values && typeof event.new_values === "object") {
                    Object.entries(event.new_values).forEach(([key, val]) => {
                      const oldVal = event.old_values?.[key as keyof typeof event.old_values];
                      if (JSON.stringify(oldVal) !== JSON.stringify(val)) {
                        changes.push(`${key}: ${String(val ?? "")}`);
                      }
                    });
                  }
                  return (
                    <tr key={event.id} className="border-b border-border-light">
                      <td className="px-4 py-3 text-[13px] text-text-muted">
                        {formatDateTime(event.created_at)}
                      </td>
                      <td className="px-4 py-3 text-[13px]">
                        {event.user?.name ?? t("admin.audit.user_fallback", { id: event.user_id })}
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant={
                          event.action.includes("created") ? "success"
                            : event.action.includes("deleted") ? "danger"
                            : event.action.includes("updated") ? "primary"
                            : "default"
                        }>
                          {event.action.split(".").pop()?.replace(/_/g, " ")}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-[13px]">
                        <span className="inline-flex items-center gap-1.5">
                          <span className="rounded bg-surface px-1.5 py-0.5 text-[11px] font-medium text-text-muted">
                            {event.model_type}
                          </span>
                          <span className="text-text-muted">#{event.model_id}</span>
                        </span>
                      </td>
                      <td className="px-4 py-3 text-[13px]">
                        {changes.length > 0 ? (
                          <div className="flex flex-wrap gap-1">
                            {changes.slice(0, 4).map((c, i) => (
                              <span key={i} className="inline-flex items-center gap-1 rounded bg-surface px-1.5 py-0.5 text-[11px]">
                                <span className="text-text-muted">{c.split(": ")[0]}:</span>
                                <span className="text-text-secondary">{c.split(": ").slice(1).join(": ")}</span>
                              </span>
                            ))}
                            {changes.length > 4 && (
                              <span className="inline-flex items-center rounded bg-surface px-1.5 py-0.5 text-[11px] text-text-muted">
                                +{changes.length - 4}
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-text-muted">{t("common.dash")}</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-[13px] text-text-muted font-mono">
                        {event.ip_address ?? t("common.dash")}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <Pagination
            currentPage={data.current_page}
            lastPage={data.last_page}
            onPageChange={setPage}
          />
        </>
      ) : (
        <p className="py-8 text-center text-[13px] text-text-muted">
          {t("admin.audit.no_entries")}
        </p>
      )}
    </div>
  );
}
