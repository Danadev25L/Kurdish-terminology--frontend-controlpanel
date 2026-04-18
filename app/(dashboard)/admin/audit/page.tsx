"use client";

import { useState } from "react";
import { useApi } from "@/lib/hooks/use-api";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Pagination } from "@/components/ui/pagination";
import { Spinner } from "@/components/ui/spinner";
import { formatDateTime } from "@/lib/utils/format";
import type { AuditEvent, PaginatedResponse } from "@/lib/api/types";

export default function AdminAuditPage() {
  const [page, setPage] = useState(1);

  const { data, isLoading } = useApi<PaginatedResponse<AuditEvent>>(
    `/api/audit-events?page=${page}`
  );

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Audit Log</h1>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Spinner size="lg" />
        </div>
      ) : data?.data && data.data.length > 0 ? (
        <>
          <div className="overflow-x-auto rounded-lg border border-border bg-white">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-surface text-start text-xs font-medium uppercase text-muted">
                  <th className="px-4 py-3">Timestamp</th>
                  <th className="px-4 py-3">User</th>
                  <th className="px-4 py-3">Action</th>
                  <th className="px-4 py-3">Entity</th>
                  <th className="px-4 py-3">Details</th>
                </tr>
              </thead>
              <tbody>
                {data.data.map((event) => (
                  <tr key={event.id} className="border-b border-border">
                    <td className="px-4 py-3 text-sm text-muted">
                      {formatDateTime(event.created_at)}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {event.user?.name ?? `User #${event.user_id}`}
                    </td>
                    <td className="px-4 py-3">
                      <Badge>{event.action}</Badge>
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {event.entity_type} #{event.entity_id}
                    </td>
                    <td className="px-4 py-3 text-sm text-muted">
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
        <p className="py-8 text-center text-sm text-muted">
          No audit events found.
        </p>
      )}
    </div>
  );
}
