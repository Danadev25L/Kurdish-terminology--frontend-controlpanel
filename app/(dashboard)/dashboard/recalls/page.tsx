"use client";

import { useState, useCallback } from "react";
import { useApi } from "@/lib/hooks/use-api";
import { useAuth } from "@/lib/hooks/use-auth";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Modal } from "@/components/ui/modal";
import { Spinner } from "@/components/ui/spinner";
import { EmptyState } from "@/components/ui/empty-state";
import { Textarea } from "@/components/ui/textarea";
import { Pagination } from "@/components/ui/pagination";
import {
  getPublicRecalls,
  submitRecall,
  voteOnRecall,
} from "@/lib/api/recalls";
import type { Recall, Concept } from "@/lib/api/types";
import { Breadcrumb } from "@/components/ui/breadcrumb";

const statusVariant: Record<string, "default" | "success" | "warning" | "danger"> = {
  pending: "warning",
  approved: "success",
  rejected: "danger",
  expired: "default",
};

export default function RecallsPage() {
  const { user } = useAuth();
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [submitOpen, setSubmitOpen] = useState(false);
  const [selectedConcept, setSelectedConcept] = useState<number | null>(null);
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [voting, setVoting] = useState<number | null>(null);
  const [votedIds, setVotedIds] = useState<Set<number>>(new Set());

  const { data: conceptsData } = useApi<{ data: Concept[] }>("/api/v1/concepts?status=published");
  const concepts = Array.isArray(conceptsData) ? conceptsData : conceptsData?.data;

  const { data: recalls, isLoading, refetch } = useApi<{
    data: Recall[];
    current_page: number;
    last_page: number;
    total: number;
  }>(`/api/v1/recalls?page=${page}${statusFilter ? `&status=${statusFilter}` : ""}`);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!selectedConcept || !reason.trim()) return;

      setSubmitting(true);
      try {
        await submitRecall({
          concept_id: selectedConcept,
          reason,
        });
        setSubmitOpen(false);
        setSelectedConcept(null);
        setReason("");
        refetch();
      } finally {
        setSubmitting(false);
      }
    },
    [selectedConcept, reason, refetch]
  );

  const handleVote = useCallback(
    async (recallId: number, vote: "support" | "oppose") => {
      setVoting(recallId);
      try {
        await voteOnRecall(recallId, vote);
        setVotedIds((prev) => new Set(prev).add(recallId));
        refetch();
      } catch {
        // Error is silently ignored — UI stays responsive
      } finally {
        setVoting(null);
      }
    },
    [refetch]
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
      <Breadcrumb items={[{ label: "Dashboard", href: "/dashboard" }, { label: "Recalls" }]} />
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Term Recalls</h1>
          <p className="mt-1 text-sm text-muted">
            Vote on recalls of published terms for review
          </p>
        </div>
        <Button onClick={() => setSubmitOpen(true)}>Request Recall</Button>
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

      {recallList.length === 0 ? (
        <EmptyState
          title="No active recalls"
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
              const hasVoted = votedIds.has(recall.id);
              const netVotes = recall.support_count - recall.oppose_count;
              const isExpired = new Date(recall.expires_at) < new Date();
              const canVote = recall.status === "pending" && !isExpired;

              return (
                <Card key={recall.id} padding>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <h3 className="font-medium text-gray-900">
                          {recall.concept?.english_term ?? "Unknown Term"}
                        </h3>
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

                    {canVote && !hasVoted && (
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="primary"
                          onClick={() => handleVote(recall.id, "support")}
                          loading={voting === recall.id}
                        >
                          Support
                        </Button>
                        <Button
                          size="sm"
                          variant="danger"
                          onClick={() => handleVote(recall.id, "oppose")}
                          loading={voting === recall.id}
                        >
                          Oppose
                        </Button>
                      </div>
                    )}
                    {canVote && hasVoted && (
                      <span className="text-sm text-muted">Voted</span>
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

      {/* Submit Recall Modal */}
      <Modal open={submitOpen} onClose={() => setSubmitOpen(false)} title="Request Term Recall">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Select Term to Recall
            </label>
            <select
              className="w-full rounded-lg border border-border bg-surface-raised px-3 py-2 text-sm"
              value={selectedConcept ?? ""}
              onChange={(e) => setSelectedConcept(e.target.value ? Number(e.target.value) : null)}
              required
            >
              <option value="">Choose a term...</option>
              {concepts?.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.english_term?.word ?? "Untitled"} ({c.domain?.name})
                </option>
              ))}
            </select>
          </div>

          <Textarea
            label="Reason for Recall"
            placeholder="Explain why this term should be recalled for review..."
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows={4}
            required
          />

          <p className="text-xs text-muted">
            The recall will be voted on by the community. If approved, the term will be
            returned to the review stage for reconsideration.
          </p>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="secondary" onClick={() => setSubmitOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" loading={submitting}>
              Submit Recall
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
