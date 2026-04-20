"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useApi } from "@/lib/hooks/use-api";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Modal } from "@/components/ui/modal";
import { Spinner } from "@/components/ui/spinner";
import { EmptyState } from "@/components/ui/empty-state";
import { Textarea } from "@/components/ui/textarea";
import { Pagination } from "@/components/ui/pagination";
import { RoleGate } from "@/components/auth/role-gate";
import {
  getBoardRecalls,
  approveRecall,
  rejectRecall,
} from "@/lib/api/recalls";
import type { Recall } from "@/lib/api/types";
import { RequireAuth } from "@/components/auth/require-auth";
import { Breadcrumb } from "@/components/ui/breadcrumb";

const statusVariant: Record<string, "default" | "success" | "warning" | "danger"> = {
  pending: "warning",
  approved: "success",
  rejected: "danger",
  expired: "default",
};

function RecallsContent() {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<string>("pending");
  const [selectedRecall, setSelectedRecall] = useState<Recall | null>(null);
  const [approveOpen, setApproveOpen] = useState(false);
  const [rejectOpen, setRejectOpen] = useState(false);
  const [notes, setNotes] = useState("");
  const [processingId, setProcessingId] = useState<number | null>(null);

  const { data: recalls, isLoading, refetch } = useApi<{
    data: Recall[];
    current_page: number;
    last_page: number;
    total: number;
  }>(`/api/v1/board/recalls?page=${page}${statusFilter ? `&status=${statusFilter}` : ""}`);

  const handleViewConcept = useCallback(
    (conceptId: number) => {
      router.push(`/concepts/${conceptId}`);
    },
    [router]
  );

  const handleApprove = useCallback(
    async (recall: Recall) => {
      setSelectedRecall(recall);
      setApproveOpen(true);
    },
    []
  );

  const confirmApprove = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!selectedRecall) return;

      setProcessingId(selectedRecall.id);
      try {
        await approveRecall(selectedRecall.id, notes);
        setApproveOpen(false);
        setNotes("");
        setSelectedRecall(null);
        refetch();
      } finally {
        setProcessingId(null);
      }
    },
    [selectedRecall, notes, refetch]
  );

  const handleReject = useCallback(
    async (recall: Recall) => {
      setSelectedRecall(recall);
      setRejectOpen(true);
    },
    []
  );

  const confirmReject = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!selectedRecall) return;

      setProcessingId(selectedRecall.id);
      try {
        await rejectRecall(selectedRecall.id, notes);
        setRejectOpen(false);
        setNotes("");
        setSelectedRecall(null);
        refetch();
      } finally {
        setProcessingId(null);
      }
    },
    [selectedRecall, notes, refetch]
  );

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Spinner size="lg" />
      </div>
    );
  }

  const recallList = recalls?.data ?? [];

  return (
    <div className="space-y-6">
      <Breadcrumb items={[{ label: "Board", href: "/board/review-queue" }, { label: "Recalls" }]} />
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Board Recall Review</h1>
          <p className="mt-1 text-sm text-muted">
            Review and approve or reject term recall requests
          </p>
        </div>
        <div className="flex items-center gap-2">
          <select
            className="rounded-lg border border-border bg-surface-raised px-3 py-2 text-sm"
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
          >
            <option value="">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
            <option value="expired">Expired</option>
          </select>
        </div>
      </div>

      {recallList.length === 0 ? (
        <EmptyState
          title="No recalls to review"
          description={
            statusFilter
              ? `No recalls with status "${statusFilter}" found.`
              : "No term recalls have been requested yet."
          }
        />
      ) : (
        <>
          <div className="space-y-3">
            {recallList.map((recall) => {
              const netVotes = recall.support_count - recall.oppose_count;
              const isExpired = new Date(recall.expires_at) < new Date();

              return (
                <Card key={recall.id} padding>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => recall.concept_id && handleViewConcept(recall.concept_id)}
                          className="font-medium text-gray-900 hover:text-primary"
                        >
                          {recall.concept?.english_term ?? "Unknown Term"}
                        </button>
                        <Badge variant={statusVariant[recall.status] ?? "default"}>
                          {recall.status}
                        </Badge>
                        {isExpired && recall.status === "pending" && (
                          <Badge variant="default">Expired</Badge>
                        )}
                      </div>
                      <p className="mt-2 text-sm text-gray-900">{recall.reason}</p>
                      <div className="mt-3 flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-success">
                            {recall.support_count} Support
                          </span>
                          <span className="text-sm text-muted">·</span>
                          <span className="text-sm font-medium text-danger">
                            {recall.oppose_count} Oppose
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge
                            variant={netVotes > 0 ? "success" : netVotes < 0 ? "danger" : "default"}
                          >
                            Net: {netVotes > 0 ? "+" : ""}
                            {netVotes}
                          </Badge>
                        </div>
                      </div>
                      <p className="mt-2 text-xs text-muted">
                        Requested by {recall.requester?.name ?? "Unknown"} ·{" "}
                        Expires {new Date(recall.expires_at).toLocaleDateString()}
                      </p>
                    </div>

                    {recall.status === "pending" && !isExpired && (
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="primary"
                          onClick={() => handleApprove(recall)}
                          loading={processingId === recall.id}
                        >
                          Approve Recall
                        </Button>
                        <Button
                          size="sm"
                          variant="danger"
                          onClick={() => handleReject(recall)}
                          loading={processingId === recall.id}
                        >
                          Reject
                        </Button>
                      </div>
                    )}
                  </div>
                </Card>
              );
            })}
          </div>

          {recalls && recalls.last_page > 1 && (
            <Pagination
              currentPage={recalls.current_page}
              lastPage={recalls.last_page}
              onPageChange={setPage}
            />
          )}
        </>
      )}

      {/* Approve Modal */}
      <Modal open={approveOpen} onClose={() => setApproveOpen(false)} title="Approve Recall">
        <form onSubmit={confirmApprove} className="space-y-4">
          <p className="text-sm text-muted">
            Approving this recall will return the term to the review stage for reconsideration.
            Are you sure?
          </p>
          <Textarea
            label="Notes (Optional)"
            placeholder="Add any notes about this approval..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
          />
          <div className="flex justify-end gap-2">
            <Button type="button" variant="secondary" onClick={() => setApproveOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" loading={processingId !== null}>
              Approve Recall
            </Button>
          </div>
        </form>
      </Modal>

      {/* Reject Modal */}
      <Modal open={rejectOpen} onClose={() => setRejectOpen(false)} title="Reject Recall">
        <form onSubmit={confirmReject} className="space-y-4">
          <p className="text-sm text-muted">
            Are you sure you want to reject this recall request? Please provide a reason.
          </p>
          <Textarea
            label="Rejection Reason"
            placeholder="Explain why this recall is being rejected..."
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
              Reject Recall
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

export default function BoardRecallsPage() {
  return (
    <RequireAuth>
      <RoleGate roles={["main_board", "admin"]} fallback={<RecallsLocked />}>
        <RecallsContent />
      </RoleGate>
    </RequireAuth>
  );
}

function RecallsLocked() {
  return (
    <div className="flex items-center justify-center py-12">
      <EmptyState
        title="Access Restricted"
        description="You need Main Board or Admin privileges to review recall requests."
      />
    </div>
  );
}
