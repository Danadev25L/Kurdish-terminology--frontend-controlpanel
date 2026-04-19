"use client";

import { useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { useApi } from "@/lib/hooks/use-api";
import { RoleGate } from "@/components/auth/role-gate";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/spinner";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";
import { CloseCallBanner } from "@/components/board/close-call-banner";
import { ConceptStatusBadge } from "@/components/domain/concept-status-badge";
import { ConsensusChart } from "@/components/domain/consensus-chart";
import { DiscussionThread } from "@/components/domain/discussion-thread";
import { approveConcept, vetoConcept } from "@/lib/api/board";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { useToastStore } from "@/stores/toast-store";
import { formatNumber, formatDate } from "@/lib/utils/format";
import type { Concept, Candidate } from "@/lib/api/types";

export default function BoardExaminationPage() {
  const params = useParams();
  const router = useRouter();
  const conceptId = params.id as string;

  const [approveOpen, setApproveOpen] = useState(false);
  const [vetoOpen, setVetoOpen] = useState(false);
  const [vetoReason, setVetoReason] = useState("");
  const [approvalNote, setApprovalNote] = useState("");
  const [loading, setLoading] = useState(false);

  const addToast = useToastStore((s) => s.addToast);

  const { data: concept, isLoading } = useApi<Concept>(
    `/api/v1/concepts/${conceptId}`,
    { pollingInterval: 120000 }
  );

  const { data: candidates } = useApi<Candidate[]>(
    `/api/v1/concepts/${conceptId}/candidates`
  );

  const handleApprove = useCallback(async () => {
    setLoading(true);
    try {
      await approveConcept(Number(conceptId), approvalNote || undefined);
      addToast({ type: "success", message: "Term approved and published" });
      router.push("/board/review-queue");
    } catch {
      addToast({ type: "error", message: "Failed to approve" });
    } finally {
      setLoading(false);
    }
  }, [conceptId, approvalNote, router, addToast]);

  const handleVeto = useCallback(async () => {
    if (!vetoReason.trim()) return;
    setLoading(true);
    try {
      await vetoConcept(Number(conceptId), vetoReason);
      addToast({ type: "success", message: "Term vetoed" });
      router.push("/board/review-queue");
    } catch {
      addToast({ type: "error", message: "Failed to veto" });
    } finally {
      setLoading(false);
    }
  }, [conceptId, vetoReason, router, addToast]);

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!concept) {
    return <p className="text-center text-text-muted">Concept not found.</p>;
  }

  const activeCandidates = (candidates ?? []).filter((c) => !c.withdrawn_at);
  const sortedCandidates = [...activeCandidates].sort(
    (a, b) =>
      (b.metrics?.consensus_score ?? 0) - (a.metrics?.consensus_score ?? 0)
  );
  const leading = sortedCandidates[0];
  const runnerUp = sortedCandidates[1];
  const isCloseCall =
    leading?.metrics &&
    runnerUp?.metrics &&
    Math.abs(
      leading.metrics.consensus_score - runnerUp.metrics.consensus_score
    ) /
      leading.metrics.consensus_score <
      0.05;

  return (
    <RoleGate roles={["main_board", "admin"]}>
      <div className="space-y-6">
        <Breadcrumb items={[{ label: "Board Review", href: "/board/review-queue" }, { label: concept.english_term?.word ?? "Review" }]} />
        {/* Back button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push("/board/review-queue")}
        >
          Back to Queue
        </Button>

        {/* Close call banner */}
        {isCloseCall && <CloseCallBanner />}

        {/* Summary card */}
        <Card>
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-heading font-extrabold tracking-[-0.02em] text-foreground">
                  {concept.english_term?.word ?? "Untitled"}
                </h1>
                <ConceptStatusBadge status={concept.status} />
              </div>
              <p className="mt-1 text-[13px] text-text-muted">
                {concept.domain?.name} &middot; {formatDate(concept.created_at)}
              </p>
            </div>
          </div>
          <p className="mt-4 text-text-secondary">{concept.definition}</p>

          {/* Leading candidate */}
          {leading && (
            <div className="mt-4 rounded-lg border border-success bg-success-light p-4">
              <p className="text-xs font-medium text-success">Leading Candidate</p>
              <p className="mt-1 text-lg font-semibold text-foreground" dir="rtl">
                {leading.kurdish_term?.word}
              </p>
              {leading.metrics && (
                <div className="mt-2 flex gap-4 text-[13px]">
                  <span>
                    Cs: <strong>{formatNumber(leading.metrics.consensus_score)}</strong>
                  </span>
                  <span>
                    Mean: <strong>{formatNumber(leading.metrics.mean)}</strong>
                  </span>
                  <span>
                    Std Dev: <strong>{formatNumber(leading.metrics.std_dev)}</strong>
                  </span>
                  <span>
                    Votes: <strong>{leading.metrics.vote_count}</strong>
                  </span>
                </div>
              )}
            </div>
          )}
        </Card>

        {/* Consensus chart */}
        <Card>
          <h3 className="mb-4 text-sm font-bold text-foreground">
            Consensus Scores
          </h3>
          <ConsensusChart
            candidates={sortedCandidates}
            winnerId={concept.winner_candidate_id}
          />
        </Card>

        {/* Runner-up comparison */}
        {runnerUp && (
          <Card>
            <h3 className="mb-3 text-sm font-bold text-foreground">
              Runner-up Comparison
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <ComparisonBlock
                label="Leader"
                name={leading?.kurdish_term?.word ?? "—"}
                metrics={leading?.metrics}
              />
              <ComparisonBlock
                label="Runner-up"
                name={runnerUp.kurdish_term?.word ?? "—"}
                metrics={runnerUp.metrics}
              />
            </div>
          </Card>
        )}

        {/* Discussions (read-only context) */}
        <Card>
          <h3 className="mb-4 text-sm font-bold text-foreground">
            Discussion History
          </h3>
          <DiscussionThread conceptId={conceptId} />
        </Card>

        {/* Action bar */}
        <div className="sticky bottom-0 flex items-center gap-3 rounded-xl border border-border bg-surface-raised p-4 shadow-lg">
          <Button onClick={() => setApproveOpen(true)} className="flex-1">
            Approve
          </Button>
          <Button
            variant="danger"
            onClick={() => setVetoOpen(true)}
            className="flex-1"
          >
            Veto
          </Button>
          <Button
            variant="secondary"
            onClick={() => router.push(`/concepts/${conceptId}`)}
          >
            View Concept Hub
          </Button>
        </div>

        {/* Approve dialog */}
        <ConfirmationDialog
          open={approveOpen}
          onClose={() => setApproveOpen(false)}
          onConfirm={handleApprove}
          title="Approve Term"
          message="This will publish the term to the public registry."
          confirmLabel="Approve"
          loading={loading}
        >
          <div className="mt-3">
            <Textarea
              value={approvalNote}
              onChange={(e) => setApprovalNote(e.target.value)}
              placeholder="Optional approval note..."
              rows={2}
            />
          </div>
        </ConfirmationDialog>

        {/* Veto dialog */}
        <ConfirmationDialog
          open={vetoOpen}
          onClose={() => setVetoOpen(false)}
          onConfirm={handleVeto}
          title="Veto Term"
          message="This will send the concept back to Stage 1 with critical priority."
          confirmLabel="Veto"
          variant="danger"
          loading={loading}
        >
          <div className="mt-3">
            <Textarea
              value={vetoReason}
              onChange={(e) => setVetoReason(e.target.value)}
              placeholder="Veto reason (required)..."
              rows={3}
            />
          </div>
        </ConfirmationDialog>
      </div>
    </RoleGate>
  );
}

function ComparisonBlock({
  label,
  name,
  metrics,
}: {
  label: string;
  name: string;
  metrics?: { consensus_score: number; mean: number; std_dev: number; vote_count: number };
}) {
  return (
    <div className="rounded-lg border border-border p-3">
      <p className="text-xs font-medium text-text-muted">{label}</p>
      <p className="mt-1 text-sm font-bold" dir="rtl">
        {name}
      </p>
      {metrics && (
        <div className="mt-2 grid grid-cols-2 gap-2 text-[13px]">
          <p>Cs: {formatNumber(metrics.consensus_score)}</p>
          <p>Mean: {formatNumber(metrics.mean)}</p>
          <p>Std Dev: {formatNumber(metrics.std_dev)}</p>
          <p>Votes: {metrics.vote_count}</p>
        </div>
      )}
    </div>
  );
}
