"use client";

import { useState, useCallback } from "react";
import { useApi } from "@/lib/hooks/use-api";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Modal } from "@/components/ui/modal";
import { Spinner } from "@/components/ui/spinner";
import { EmptyState } from "@/components/ui/empty-state";
import { Textarea } from "@/components/ui/textarea";
import { Pagination } from "@/components/ui/pagination";
import { resolveErrata, rejectErrata, updateErrata } from "@/lib/api/errata";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { useToastStore } from "@/stores/toast-store";
import type { Errata } from "@/lib/api/types";
import { RoleGate } from "@/components/auth/role-gate";
import { useI18n } from "@/i18n/context";

const statusVariant: Record<string, "default" | "primary" | "success" | "warning" | "danger"> = {
  pending: "warning",
  in_progress: "primary",
  resolved: "success",
  rejected: "danger",
};

const issueTypeKeys: Record<string, string> = {
  typo: "errata.typo",
  definition: "errata.missing_definition",
  usage: "errata.incorrect_translation",
  other: "errata.issue_other",
};

export default function ErrataPage() {
  const addToast = useToastStore((s) => s.addToast);
  const { t } = useI18n();
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [selectedErrata, setSelectedErrata] = useState<Errata | null>(null);
  const [resolveOpen, setResolveOpen] = useState(false);
  const [rejectOpen, setRejectOpen] = useState(false);
  const [notes, setNotes] = useState("");
  const [processingId, setProcessingId] = useState<number | null>(null);

  const { data, isLoading, refetch } = useApi<{ data: Errata[]; current_page: number; last_page: number; total: number }>(
    `/api/v1/errata?page=${page}${statusFilter ? `&status=${statusFilter}` : ""}`
  );

  const handleResolve = useCallback(
    async (errata: Errata) => {
      setSelectedErrata(errata);
      setResolveOpen(true);
    },
    []
  );

  const confirmResolve = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!selectedErrata) return;

      setProcessingId(selectedErrata.id);
      try {
        await resolveErrata(selectedErrata.id, "resolved", notes);
        setResolveOpen(false);
        setNotes("");
        setSelectedErrata(null);
        refetch();
        addToast({ type: "success", message: t("messages.errata_resolved") });
      } catch {
        addToast({ type: "error", message: t("messages.errata_resolve_failed") });
      } finally {
        setProcessingId(null);
      }
    },
    [selectedErrata, notes, refetch, addToast]
  );

  const handleReject = useCallback(
    async (errata: Errata) => {
      setSelectedErrata(errata);
      setRejectOpen(true);
    },
    []
  );

  const confirmReject = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!selectedErrata) return;

      setProcessingId(selectedErrata.id);
      try {
        await rejectErrata(selectedErrata.id, notes);
        setRejectOpen(false);
        setNotes("");
        setSelectedErrata(null);
        refetch();
        addToast({ type: "success", message: t("messages.errata_rejected") });
      } catch {
        addToast({ type: "error", message: t("messages.errata_reject_failed") });
      } finally {
        setProcessingId(null);
      }
    },
    [selectedErrata, notes, refetch, addToast]
  );

  const handleUpdateStatus = useCallback(
    async (errata: Errata, status: string) => {
      setProcessingId(errata.id);
      try {
        await updateErrata(errata.id, { status });
        refetch();
        addToast({ type: "success", message: t("messages.status_updated") });
      } catch {
        addToast({ type: "error", message: t("messages.status_update_failed") });
      } finally {
        setProcessingId(null);
      }
    },
    [refetch, addToast]
  );

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Spinner size="lg" />
      </div>
    );
  }

  const errataList = data?.data ?? [];

  return (
    <div className="space-y-6">
      <Breadcrumb items={[{ label: t("nav.dashboard"), href: "/dashboard" }, { label: t("errata.title") }]} />
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-heading font-extrabold tracking-[-0.02em] text-foreground">{t("errata.title")}</h1>
          <p className="mt-1 text-[13px] text-text-muted">
            {t("errata.no_errata")}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <select
            className="rounded-lg border border-border bg-surface-raised px-3 py-2 text-[13px]"
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
          >
            <option value="">{t("concepts.all_statuses")}</option>
            <option value="pending">{t("statuses.pending")}</option>
            <option value="in_progress">{t("statuses.in_progress")}</option>
            <option value="resolved">{t("statuses.resolved")}</option>
            <option value="rejected">{t("statuses.rejected")}</option>
          </select>
        </div>
      </div>

      {errataList.length === 0 ? (
        <EmptyState
          title={t("errata.no_errata")}
          description={
            statusFilter
              ? t("common.no_results")
              : t("errata.no_errata")
          }
        />
      ) : (
        <>
          <div className="space-y-3">
            {errataList.map((errata) => (
              <Card key={errata.id} padding>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <h3 className="font-semibold text-foreground">
                        Report #{errata.id}
                      </h3>
                      <Badge variant={statusVariant[errata.status] ?? "default"}>
                        {errata.status.replace("_", " ")}
                      </Badge>
                      <Badge variant="default">
                        {t(issueTypeKeys[errata.report_type ?? "other"] ?? "errata.issue_other")}
                      </Badge>
                    </div>
                    <p className="mt-2 text-[13px] text-foreground">{errata.issue_description}</p>
                    {errata.suggested_correction && (
                      <div className="mt-2">
                        <p className="text-xs font-semibold text-text-muted">{t("errata.suggested_correction")}</p>
                        <p className="text-[13px] text-text-secondary">{errata.suggested_correction}</p>
                      </div>
                    )}
                    {errata.submitter_name && (
                      <p className="mt-2 text-[11px] text-text-muted">
                        {t("errata.reported_by_label")} {errata.submitter_name}
                        {errata.submitter_email && ` (${errata.submitter_email})`}
                      </p>
                    )}
                    {errata.admin_notes && (
                      <div className="mt-2 rounded-md bg-surface p-2">
                        <p className="text-xs font-semibold text-text-muted">{t("errata.admin_notes")}</p>
                        <p className="text-[13px] text-text-secondary">{errata.admin_notes}</p>
                      </div>
                    )}
                    <p className="mt-2 text-[11px] text-text-muted">
                      {t("errata.reported_by_label")} {new Date(errata.created_at).toLocaleDateString()}
                    </p>
                  </div>

                  <RoleGate roles={["admin"]} fallback={null}>
                    <div className="flex gap-2">
                      {errata.status === "pending" && (
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => handleUpdateStatus(errata, "in_progress")}
                          loading={processingId === errata.id}
                        >
                          {t("errata.mark_reviewing")}
                        </Button>
                      )}
                      {errata.status === "in_progress" && (
                        <>
                          <Button
                            size="sm"
                            onClick={() => handleResolve(errata)}
                            loading={processingId === errata.id}
                          >
                            {t("errata.resolve")}
                          </Button>
                          <Button
                            size="sm"
                            variant="danger"
                            onClick={() => handleReject(errata)}
                            loading={processingId === errata.id}
                          >
                            {t("errata.reject")}
                          </Button>
                        </>
                      )}
                    </div>
                  </RoleGate>
                </div>
              </Card>
            ))}
          </div>

          {data && data.last_page > 1 && (
            <Pagination
              currentPage={data.current_page}
              lastPage={data.last_page}
              onPageChange={setPage}
            />
          )}
        </>
      )}

      {/* Resolve Modal */}
      <Modal open={resolveOpen} onClose={() => setResolveOpen(false)} title={t("errata.resolve")}>
        <form onSubmit={confirmResolve} className="space-y-4">
          <p className="text-[13px] text-text-muted">
            {t("errata.resolve_msg")}
          </p>
          <Textarea
            label={t("errata.resolution_notes")}
            placeholder={t("errata.resolution_placeholder")}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
          />
          <div className="flex justify-end gap-2">
            <Button type="button" variant="secondary" onClick={() => setResolveOpen(false)}>
              {t("common.cancel")}
            </Button>
            <Button type="submit" loading={processingId !== null}>
              {t("errata.resolve")}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Reject Modal */}
      <Modal open={rejectOpen} onClose={() => setRejectOpen(false)} title={t("errata.reject")}>
        <form onSubmit={confirmReject} className="space-y-4">
          <p className="text-[13px] text-text-muted">
            {t("errata.reject_msg")}
          </p>
          <Textarea
            label={t("errata.rejection_reason")}
            placeholder={t("errata.reject_placeholder")}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            required
          />
          <div className="flex justify-end gap-2">
            <Button type="button" variant="secondary" onClick={() => setRejectOpen(false)}>
              {t("common.cancel")}
            </Button>
            <Button type="submit" variant="danger" loading={processingId !== null}>
              {t("errata.reject")}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
