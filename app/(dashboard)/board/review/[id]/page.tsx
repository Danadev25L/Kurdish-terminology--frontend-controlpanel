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
import { ScoreHistogram } from "@/components/domain/score-histogram";
import { approveConcept, vetoConcept } from "@/lib/api/board";
import { getConceptActivity } from "@/lib/api/concepts";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { useToastStore } from "@/stores/toast-store";
import { formatNumber, formatDate } from "@/lib/utils/format";
import type { Concept, Candidate, ConceptActivityEntry } from "@/lib/api/types";
import { useI18n } from "@/i18n/context";

export default function BoardExaminationPage() {
  const params = useParams();
  const router = useRouter();
  const conceptId = params.id as string;
  const { t } = useI18n();

  const [approveOpen, setApproveOpen] = useState(false);
  const [vetoOpen, setVetoOpen] = useState(false);
  const [vetoReason, setVetoReason] = useState("");
  const [approvalNote, setApprovalNote] = useState("");
  const [loading, setLoading] = useState(false);

  const addToast = useToastStore((s) => s.addToast);

  const { data: concept, isLoading } = useApi<Concept>(
    `/api/v1/concepts/${conceptId}`
  );

  const { data: candidates } = useApi<Candidate[]>(
    `/api/v1/concepts/${conceptId}/candidates`
  );

  const { data: activities } = useApi<ConceptActivityEntry[]>(
    `/api/v1/concepts/${conceptId}/activity-feed`
  );

  const handleApprove = useCallback(async () => {
    setLoading(true);
    try {
      await approveConcept(Number(conceptId), approvalNote || undefined);
      addToast({ type: "success", message: t("messages.term_recalled") });
      router.push("/board/review-queue");
    } catch {
      addToast({ type: "error", message: t("messages.term_recall_failed") });
    } finally {
      setLoading(false);
    }
  }, [conceptId, approvalNote, router, addToast]);

  const handleVeto = useCallback(async () => {
    if (!vetoReason.trim()) return;
    setLoading(true);
    try {
      await vetoConcept(Number(conceptId), vetoReason);
      addToast({ type: "success", message: t("messages.status_updated") });
      router.push("/board/review-queue");
    } catch {
      addToast({ type: "error", message: t("messages.status_update_failed") });
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
    return <p className="text-center text-text-muted">{t("concepts.not_found")}</p>;
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
        <Breadcrumb items={[{ label: t("board.review_queue"), href: "/board/review-queue" }, { label: concept.english_term?.word ?? t("board.review_queue") }]} />
        {/* Back button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push("/board/review-queue")}
        >
          {t("common.back")}
        </Button>

        {/* Close call banner */}
        {isCloseCall && <CloseCallBanner />}

        {/* Summary card */}
        <Card>
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-heading font-extrabold tracking-[-0.02em] text-foreground">
                  {concept.english_term?.word ?? t("concepts.untitled")}
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
              <p className="text-xs font-medium text-success">{t("concepts.leading_candidate")}</p>
              <p className="mt-1 text-lg font-semibold text-foreground" dir="rtl">
                {leading.kurdish_term?.word}
              </p>
              {leading.metrics && (
                <div className="mt-2 flex gap-4 text-[13px]">
                  <span>
                    {t("concepts.cs")}: <strong>{formatNumber(leading.metrics.consensus_score)}</strong>
                  </span>
                  <span>
                    {t("concepts.mean")}: <strong>{formatNumber(leading.metrics.mean)}</strong>
                  </span>
                  <span>
                    {t("concepts.std_dev")}: <strong>{formatNumber(leading.metrics.std_dev)}</strong>
                  </span>
                  <span>
                    {t("concepts.votes")}: <strong>{leading.metrics.vote_count}</strong>
                  </span>
                </div>
              )}
            </div>
          )}
        </Card>

        {/* Consensus chart */}
        <Card>
          <h3 className="mb-4 text-sm font-bold text-foreground">
            {t("concepts.consensus_scores")}
          </h3>
          <ConsensusChart
            candidates={sortedCandidates}
            winnerId={concept.winner_candidate_id}
          />
        </Card>

        {/* Score Histograms */}
        {sortedCandidates.length > 0 && sortedCandidates.some(c => c.metrics?.score_distribution) && (
          <Card>
            <h3 className="mb-4 text-sm font-bold text-foreground">
              Score Distribution Breakdown
            </h3>
            <div className="grid md:grid-cols-2 gap-4">
              {sortedCandidates
                .filter(c => c.metrics?.score_distribution)
                .map(candidate => (
                  <ScoreHistogram key={candidate.id} candidate={candidate} />
                ))}
            </div>
          </Card>
        )}

        {/* Runner-up comparison */}
        {runnerUp && (
          <Card>
            <h3 className="mb-3 text-sm font-bold text-foreground">
              {t("concepts.runner_up")}
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <ComparisonBlock
                label={t("concepts.leader")}
                name={leading?.kurdish_term?.word ?? "—"}
                metrics={leading?.metrics}
              />
              <ComparisonBlock
                label={t("concepts.runner_up_label")}
                name={runnerUp.kurdish_term?.word ?? "—"}
                metrics={runnerUp.metrics}
              />
            </div>
          </Card>
        )}

        {/* Discussions (read-only context) */}
        <Card>
          <h3 className="mb-4 text-sm font-bold text-foreground">
            {t("concepts.discussion_history")}
          </h3>
          <DiscussionThread conceptId={conceptId} />
        </Card>

        {/* Activity feed */}
        {activities && activities.length > 0 && (
          <Card>
            <h3 className="mb-4 text-sm font-bold text-foreground">
              {t("concepts.detail.recent_activity_label")}
            </h3>
            <div className="space-y-3">
              {activities.slice(0, 10).map((activity) => (
                <div key={activity.id} className="flex items-start gap-3 border-b border-border-light pb-3 last:border-0">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-surface">
                    <svg className="h-4 w-4 text-text-muted" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.362 5.214A8.252 8.252 0 0112 21 8.25 8.25 0 016.038 7.048 8.287 8.287 0 009 9.6a8.983 8.983 0 013.361-6.867 8.21 8.21 0 003 2.48z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 18a3.75 3.75 0 00.495-7.467 5.99 5.99 0 00-1.925 3.546 5.974 5.974 0 01-2.133-1A3.75 3.75 0 0012 18z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-foreground">{activity.description}</p>
                    <p className="text-xs text-text-muted">
                      {activity.user?.name ?? t("common.unknown")} · {formatDate(activity.created_at)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Action bar */}
        <div className="sticky bottom-0 flex items-center gap-3 rounded-xl border border-border bg-surface-raised p-4 shadow-lg">
          <Button onClick={() => setApproveOpen(true)} className="flex-1">
            {t("board.approve")}
          </Button>
          <Button
            variant="danger"
            onClick={() => setVetoOpen(true)}
            className="flex-1"
          >
            {t("board.veto")}
          </Button>
          <Button
            variant="secondary"
            onClick={() => router.push(`/concepts/${conceptId}`)}
          >
            {t("concepts.view_hub")}
          </Button>
        </div>

        {/* Approve dialog */}
        <ConfirmationDialog
          open={approveOpen}
          onClose={() => setApproveOpen(false)}
          onConfirm={handleApprove}
          title={t("board.approve_term")}
          message={t("board.approve_term_msg")}
          confirmLabel={t("board.approve")}
          loading={loading}
        >
          <div className="mt-3">
            <Textarea
              value={approvalNote}
              onChange={(e) => setApprovalNote(e.target.value)}
              placeholder={t("board.approve_note_placeholder")}
              rows={2}
            />
          </div>
        </ConfirmationDialog>

        {/* Veto dialog */}
        <ConfirmationDialog
          open={vetoOpen}
          onClose={() => setVetoOpen(false)}
          onConfirm={handleVeto}
          title={t("board.veto_term")}
          message={t("board.veto_term_msg")}
          confirmLabel={t("board.veto")}
          variant="danger"
          loading={loading}
        >
          <div className="mt-3">
            <Textarea
              value={vetoReason}
              onChange={(e) => setVetoReason(e.target.value)}
              placeholder={t("board.veto_reason_placeholder")}
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
  const { t } = useI18n();
  return (
    <div className="rounded-lg border border-border p-3">
      <p className="text-xs font-medium text-text-muted">{label}</p>
      <p className="mt-1 text-sm font-bold" dir="rtl">
        {name}
      </p>
      {metrics && (
        <div className="mt-2 grid grid-cols-2 gap-2 text-[13px]">
          <p>{t("concepts.cs")}: {formatNumber(metrics.consensus_score)}</p>
          <p>{t("concepts.mean")}: {formatNumber(metrics.mean)}</p>
          <p>{t("concepts.std_dev")}: {formatNumber(metrics.std_dev)}</p>
          <p>{t("concepts.votes")}: {metrics.vote_count}</p>
        </div>
      )}
    </div>
  );
}
