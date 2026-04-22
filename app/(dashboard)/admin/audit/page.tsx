"use client";

import { useState, useMemo, useCallback } from "react";
import { useApi } from "@/lib/hooks/use-api";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Pagination } from "@/components/ui/pagination";
import { SkeletonTable } from "@/components/ui/skeleton";
import { formatDateTime } from "@/lib/utils/format";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { EmptyState } from "@/components/ui/empty-state";
import type { AuditEvent, PaginatedResponse } from "@/lib/api/types";
import { useI18n } from "@/i18n/context";

const ACTION_CATEGORIES = [
  { value: "", label: "All Actions" },
  { value: "created", label: "Created" },
  { value: "updated", label: "Updated" },
  { value: "deleted", label: "Deleted" },
  { value: "login", label: "Login" },
  { value: "logout", label: "Logout" },
];

const MODEL_TYPES = [
  { value: "", label: "All Entities" },
  { value: "User", label: "Users" },
  { value: "Concept", label: "Concepts" },
  { value: "Candidate", label: "Candidates" },
  { value: "Domain", label: "Domains" },
  { value: "LexiconWord", label: "Lexicon" },
  { value: "Discussion", label: "Discussions" },
];

function getActionVariant(action: string): "success" | "danger" | "primary" | "warning" | "default" {
  if (action.includes("created")) return "success";
  if (action.includes("deleted")) return "danger";
  if (action.includes("updated")) return "primary";
  if (action.includes("login") || action.includes("logout")) return "warning";
  return "default";
}

function AuditTableRow({ event }: { event: AuditEvent }) {
  const { t } = useI18n();
  const [expanded, setExpanded] = useState(false);

  const changes = useMemo(() => {
    if (!event.new_values || typeof event.new_values !== "object") return [];
    return Object.entries(event.new_values)
      .filter(([key]) => key in (event.old_values ?? {}))
      .map(([key, newVal]) => ({
        key,
        oldVal: event.old_values?.[key as keyof typeof event.old_values],
        newVal,
      }))
      .filter(({ oldVal, newVal }) => JSON.stringify(oldVal) !== JSON.stringify(newVal));
  }, [event]);

  return (
    <>
      <tr className="border-b border-border-light hover:bg-surface/50 cursor-pointer" onClick={() => setExpanded(!expanded)}>
        <td className="px-4 py-3 text-[13px] text-text-muted whitespace-nowrap">
          {formatDateTime(event.created_at)}
        </td>
        <td className="px-4 py-3 text-[13px]">
          {event.user?.name ?? t("admin.audit.user_fallback", { id: event.user_id })}
        </td>
        <td className="px-4 py-3">
          <Badge variant={getActionVariant(event.action)}>
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
              {changes.slice(0, 3).map(({ key, newVal }) => (
                <span key={key} className="inline-flex items-center gap-1 rounded bg-surface px-1.5 py-0.5 text-[11px]">
                  <span className="text-text-muted">{key}:</span>
                  <span className="text-text-secondary max-w-[100px] truncate">{String(newVal ?? "")}</span>
                </span>
              ))}
              {changes.length > 3 && (
                <span className="inline-flex items-center rounded bg-surface px-1.5 py-0.5 text-[11px] text-text-muted">
                  +{changes.length - 3} more
                </span>
              )}
            </div>
          ) : (
            <span className="text-text-muted">{t("common.dash")}</span>
          )}
        </td>
        <td className="px-4 py-3 text-[13px] text-text-muted font-mono text-xs">
          {event.ip_address ?? t("common.dash")}
        </td>
        <td className="px-4 py-3">
          <button
            onClick={(e) => { e.stopPropagation(); setExpanded(!expanded); }}
            className="text-text-muted hover:text-foreground"
          >
            {expanded ? "▲" : "▼"}
          </button>
        </td>
      </tr>
      {expanded && (
        <tr className="border-b border-border-light bg-surface">
          <td colSpan={7} className="px-4 py-3">
            <div className="space-y-2">
              <h4 className="text-xs font-semibold text-text-muted">CHANGES DETAIL</h4>
              {changes.length === 0 ? (
                <p className="text-sm text-text-muted">No value changes recorded</p>
              ) : (
                <div className="grid gap-2 sm:grid-cols-2">
                  {changes.map(({ key, oldVal, newVal }) => (
                    <div key={key} className="rounded border border-border-light bg-surface-raised p-2">
                      <p className="text-xs font-medium text-foreground">{key}</p>
                      <div className="mt-1 flex gap-2 text-xs">
                        <div className="flex-1">
                          <span className="text-danger line-through">{String(oldVal ?? "null")}</span>
                        </div>
                        <span className="text-text-muted">→</span>
                        <div className="flex-1">
                          <span className="text-success">{String(newVal ?? "null")}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              {event.ip_address && (
                <p className="text-xs text-text-muted">
                  IP Address: <span className="font-mono">{event.ip_address}</span>
                </p>
              )}
            </div>
          </td>
        </tr>
      )}
    </>
  );
}

export default function AdminAuditPage() {
  const [page, setPage] = useState(1);
  const [actionFilter, setActionFilter] = useState("");
  const [modelFilter, setModelFilter] = useState("");
  const [userFilter, setUserFilter] = useState("");
  const { t } = useI18n();

  const buildQueryString = useCallback(() => {
    const params = new URLSearchParams();
    params.set("page", String(page));
    if (actionFilter) params.set("action", actionFilter);
    if (modelFilter) params.set("model_type", modelFilter);
    if (userFilter) params.set("user_id", userFilter);
    return params.toString();
  }, [page, actionFilter, modelFilter, userFilter]);

  const queryString = buildQueryString();

  const { data, isLoading, refetch } = useApi<PaginatedResponse<AuditEvent>>(
    `/api/v1/admin/audit-events?${queryString}`
  );

  const handleExport = useCallback(async () => {
    const csv = [
      ["Timestamp", "User", "Action", "Model Type", "Model ID", "Changes", "IP Address"].join(","),
      ...(data?.data.map(event => [
        formatDateTime(event.created_at),
        event.user?.name ?? `User #${event.user_id}`,
        event.action,
        event.model_type,
        event.model_id,
        JSON.stringify(event.new_values ?? {}),
        event.ip_address ?? "",
      ].map(v => `"${v}"`).join(",")) ?? [])
    ].join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `audit-log-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }, [data]);

  return (
    <div className="space-y-6">
      <Breadcrumb items={[{ label: t("nav.admin"), href: "/admin" }, { label: t("admin.audit.title") }]} />

      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-heading font-extrabold tracking-[-0.02em] text-foreground">{t("admin.audit.title")}</h1>
          <p className="mt-1 text-sm text-text-muted">
            Track all system changes and user actions
          </p>
        </div>
        <Button variant="secondary" size="sm" onClick={handleExport} disabled={!data?.data.length}>
          Export CSV
        </Button>
      </div>

      {/* Filters */}
      <Card padding>
        <div className="flex flex-wrap gap-3">
          <select
            className="rounded-lg border border-border bg-surface-raised px-3 py-2 text-sm"
            value={actionFilter}
            onChange={(e) => { setActionFilter(e.target.value); setPage(1); }}
          >
            {ACTION_CATEGORIES.map(cat => (
              <option key={cat.value} value={cat.value}>{cat.label}</option>
            ))}
          </select>

          <select
            className="rounded-lg border border-border bg-surface-raised px-3 py-2 text-sm"
            value={modelFilter}
            onChange={(e) => { setModelFilter(e.target.value); setPage(1); }}
          >
            {MODEL_TYPES.map(type => (
              <option key={type.value} value={type.value}>{type.label}</option>
            ))}
          </select>

          <input
            type="number"
            placeholder="User ID"
            className="rounded-lg border border-border bg-surface-raised px-3 py-2 text-sm"
            value={userFilter}
            onChange={(e) => { setUserFilter(e.target.value); setPage(1); }}
          />

          {(actionFilter || modelFilter || userFilter) && (
            <Button
              variant="secondary"
              size="sm"
              onClick={() => { setActionFilter(""); setModelFilter(""); setUserFilter(""); setPage(1); }}
            >
              Clear Filters
            </Button>
          )}
        </div>
      </Card>

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
                  <th className="px-4 py-3 w-8"></th>
                </tr>
              </thead>
              <tbody>
                {data.data.map((event) => (
                  <AuditTableRow key={event.id} event={event} />
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between">
            <p className="text-sm text-text-muted">
              Showing {data.data.length} of {data.total} events
            </p>
            <Pagination
              currentPage={data.current_page}
              lastPage={data.last_page}
              onPageChange={setPage}
            />
          </div>
        </>
      ) : (
        <EmptyState
          title={actionFilter || modelFilter || userFilter ? "No matching audit events" : t("admin.audit.no_entries")}
          description={actionFilter || modelFilter || userFilter ? "Try adjusting your filters" : "Audit trail will appear here once actions are performed"}
        />
      )}
    </div>
  );
}
