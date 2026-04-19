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

const statusVariant: Record<string, "default" | "primary" | "success" | "warning" | "danger"> = {
  pending: "warning",
  under_review: "primary",
  resolved: "success",
  rejected: "danger",
};

const issueTypeLabels: Record<string, string> = {
  incorrect_translation: "Incorrect Translation",
  missing_definition: "Missing Definition",
  typo: "Typo",
  offensive_term: "Offensive Term",
  other: "Other",
};

export default function ErrataPage() {
  const addToast = useToastStore((s) => s.addToast);
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
        await resolveErrata(selectedErrata.id, notes);
        setResolveOpen(false);
        setNotes("");
        setSelectedErrata(null);
        refetch();
        addToast({ type: "success", message: "Errata resolved" });
      } catch {
        addToast({ type: "error", message: "Failed to resolve" });
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
        addToast({ type: "success", message: "Errata rejected" });
      } catch {
        addToast({ type: "error", message: "Failed to reject" });
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
        addToast({ type: "success", message: "Status updated" });
      } catch {
        addToast({ type: "error", message: "Failed to update status" });
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
      <Breadcrumb items={[{ label: "Dashboard", href: "/dashboard" }, { label: "Errata" }]} />
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-heading font-extrabold tracking-[-0.02em] text-foreground">Errata Management</h1>
          <p className="mt-1 text-[13px] text-text-muted">
            Review and resolve reported errors in published terms
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
            <option value="">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="under_review">Under Review</option>
            <option value="resolved">Resolved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>

      {errataList.length === 0 ? (
        <EmptyState
          title="No errata reports"
          description={
            statusFilter
              ? `No errata with status "${statusFilter}" found.`
              : "No errata reports have been submitted yet."
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
                        {issueTypeLabels[errata.issue_type] ?? errata.issue_type}
                      </Badge>
                    </div>
                    <p className="mt-2 text-[13px] text-foreground">{errata.description}</p>
                    {errata.suggested_correction && (
                      <div className="mt-2">
                        <p className="text-xs font-semibold text-text-muted">Suggested Correction:</p>
                        <p className="text-[13px] text-text-secondary">{errata.suggested_correction}</p>
                      </div>
                    )}
                    {errata.reporter_name && (
                      <p className="mt-2 text-[11px] text-text-muted">
                        Reported by: {errata.reporter_name}
                        {errata.reporter_email && ` (${errata.reporter_email})`}
                      </p>
                    )}
                    {errata.admin_notes && (
                      <div className="mt-2 rounded-md bg-surface p-2">
                        <p className="text-xs font-semibold text-text-muted">Admin Notes:</p>
                        <p className="text-[13px] text-text-secondary">{errata.admin_notes}</p>
                      </div>
                    )}
                    <p className="mt-2 text-[11px] text-text-muted">
                      Reported {new Date(errata.created_at).toLocaleDateString()}
                    </p>
                  </div>

                  <RoleGate roles={["admin"]} fallback={null}>
                    <div className="flex gap-2">
                      {errata.status === "pending" && (
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => handleUpdateStatus(errata, "under_review")}
                          loading={processingId === errata.id}
                        >
                          Mark Reviewing
                        </Button>
                      )}
                      {errata.status === "under_review" && (
                        <>
                          <Button
                            size="sm"
                            onClick={() => handleResolve(errata)}
                            loading={processingId === errata.id}
                          >
                            Resolve
                          </Button>
                          <Button
                            size="sm"
                            variant="danger"
                            onClick={() => handleReject(errata)}
                            loading={processingId === errata.id}
                          >
                            Reject
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
      <Modal open={resolveOpen} onClose={() => setResolveOpen(false)} title="Resolve Errata">
        <form onSubmit={confirmResolve} className="space-y-4">
          <p className="text-[13px] text-text-muted">
            Are you sure you want to resolve this errata report? This will mark it as resolved.
          </p>
          <Textarea
            label="Resolution Notes (Optional)"
            placeholder="Describe how this errata was resolved..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
          />
          <div className="flex justify-end gap-2">
            <Button type="button" variant="secondary" onClick={() => setResolveOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" loading={processingId !== null}>
              Resolve
            </Button>
          </div>
        </form>
      </Modal>

      {/* Reject Modal */}
      <Modal open={rejectOpen} onClose={() => setRejectOpen(false)} title="Reject Errata">
        <form onSubmit={confirmReject} className="space-y-4">
          <p className="text-[13px] text-text-muted">
            Are you sure you want to reject this errata report? Please provide a reason.
          </p>
          <Textarea
            label="Rejection Reason"
            placeholder="Explain why this errata is being rejected..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            required
          />
          <div className="flex justify-end gap-2">
            <Button type="button" variant="secondary" onClick={() => setRejectOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="danger" loading={processingId !== null}>
              Reject
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
