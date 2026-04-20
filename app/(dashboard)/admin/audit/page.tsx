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

export default function AdminAuditPage() {
  const [page, setPage] = useState(1);

  const { data, isLoading } = useApi<PaginatedResponse<AuditEvent>>(
    `/api/v1/admin/audit-events?page=${page}`
  );

  return (
    <div className="space-y-6">
      <Breadcrumb items={[{ label: "Admin", href: "/admin" }, { label: "Audit Log" }]} />
      <h1 className="text-heading font-extrabold tracking-[-0.02em] text-foreground">Audit Log</h1>

      {isLoading ? (
        <SkeletonTable rows={10} />
      ) : data?.data && data.data.length > 0 ? (
        <>
          <div className="overflow-x-auto rounded-lg border border-border bg-surface-raised">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border-light bg-surface text-start text-[11px] font-semibold uppercase tracking-[0.05em] text-text-muted">
                  <th className="px-4 py-3">Timestamp</th>
                  <th className="px-4 py-3">User</th>
                  <th className="px-4 py-3">Action</th>
                  <th className="px-4 py-3">Entity</th>
                  <th className="px-4 py-3">Details</th>
                </tr>
              </thead>
              <tbody>
                {data.data.map((event) => (
                  <tr key={event.id} className="border-b border-border-light">
                    <td className="px-4 py-3 text-[13px] text-text-muted">
                      {formatDateTime(event.created_at)}
                    </td>
                    <td className="px-4 py-3 text-[13px]">
                      {event.user?.name ?? `User #${event.user_id}`}
                    </td>
                    <td className="px-4 py-3">
                      <Badge>{event.action}</Badge>
                    </td>
                    <td className="px-4 py-3 text-[13px]">
                      {event.entity_type} #{event.entity_id}
                    </td>
                    <td className="px-4 py-3 text-[13px] text-text-muted">
                      {event.details
                        ? JSON.stringify(event.details).slice(0, 80)
                        : "—"}
                    </td>
                  </tr>
                ))}
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
          No audit events found.
        </p>
      )}
    </div>
  );
}
