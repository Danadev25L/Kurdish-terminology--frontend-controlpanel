"use client";

import { useState, useCallback } from "react";
import { useParams } from "next/navigation";
import { useApi } from "@/lib/hooks/use-api";
import { useRole } from "@/lib/hooks/use-role";
import { useAuth } from "@/lib/hooks/use-auth";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs } from "@/components/ui/tabs";
import { Spinner } from "@/components/ui/spinner";
import { Skeleton, SkeletonCard } from "@/components/ui/skeleton";
import { ConceptStatusBadge } from "@/components/domain/concept-status-badge";
import { CandidateCard } from "@/components/domain/candidate-card";
import { DiscussionThread } from "@/components/domain/discussion-thread";
import { ThresholdVotePanel } from "@/components/domain/threshold-vote-panel";
import { VoteMatrix } from "@/components/domain/vote-matrix";
import { ConsensusChart } from "@/components/domain/consensus-chart";
import { ReferenceSidebar } from "@/components/domain/reference-sidebar";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";
import { EditConceptModal } from "@/components/modals/edit-concept-modal";
import { useToastStore } from "@/stores/toast-store";
import { useI18n } from "@/i18n/context";
import { withdrawCandidate } from "@/lib/api/candidates";
import { motionToVote, reopenConcept, advanceConcept, closeVoting, deleteConcept } from "@/lib/api/concepts";
import type { Concept, Candidate, ConceptHistoryEntry, ConceptActivityEntry } from "@/lib/api/types";

interface BackendConceptMetrics {
  threshold_votes: {
    total: number;
    yes: number;
    no: number;
    turnout: number;
  };
  candidates: Array<{
    id: number;
    word: string;
    consensus_score: number | null;
    vote_count: number;
  }>;
  stage: string;
}
import { formatDate } from "@/lib/utils/format";

export default function ConceptDetailPage() {
  const params = useParams();
  const conceptId = params.id as string;
  const { isDomainHead, isAdmin, isMainBoard, isExpert } = useRole();
  const { user } = useAuth();
  const addToast = useToastStore((s) => s.addToast);
  const { t } = useI18n();
  const [activeTab, setActiveTab] = useState("overview");
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isAdvancing, setIsAdvancing] = useState(false);
  const [isClosingVoting, setIsClosingVoting] = useState(false);

  // Concept endpoint already includes candidates - no need for separate call
  const { data: concept, isLoading, refetch } = useApi<Concept>(
    `/api/v1/concepts/${conceptId}`
  );

  // Candidates are already included in concept response
  const candidates = concept?.candidates ?? [];

  const handleWithdraw = useCallback(
    async (id: number) => {
      try {
        await withdrawCandidate(id);
        refetch();
        addToast({ type: "success", message: t("messages.status_updated") });
      } catch {
        addToast({ type: "error", message: t("messages.status_update_failed") });
      }
    },
    [refetch, addToast, t]
  );

  const handleMotionToVote = useCallback(async () => {
    try {
      await motionToVote(Number(conceptId));
      refetch();
      addToast({ type: "success", message: t("messages.status_updated") });
    } catch {
      addToast({ type: "error", message: t("messages.status_update_failed") });
    }
  }, [conceptId, refetch, addToast, t]);

  const handleReopen = useCallback(async () => {
    try {
      await reopenConcept(Number(conceptId));
      refetch();
      addToast({ type: "success", message: t("messages.status_updated") });
    } catch {
      addToast({ type: "error", message: t("messages.status_update_failed") });
    }
  }, [conceptId, refetch, addToast, t]);

  const handleAdvance = useCallback(async () => {
    setIsAdvancing(true);
    try {
      await advanceConcept(Number(conceptId));
      refetch();
      addToast({ type: "success", message: t("messages.concept_advanced") });
    } catch {
      addToast({ type: "error", message: t("messages.concept_advance_failed") });
    } finally {
      setIsAdvancing(false);
    }
  }, [conceptId, refetch, addToast, t]);

  const handleCloseVoting = useCallback(async () => {
    setIsClosingVoting(true);
    try {
      await closeVoting(Number(conceptId));
      refetch();
      addToast({ type: "success", message: t("messages.voting_closed") });
    } catch {
      addToast({ type: "error", message: t("messages.voting_close_failed") });
    } finally {
      setIsClosingVoting(false);
    }
  }, [conceptId, refetch, addToast, t]);

  const handleDelete = useCallback(async () => {
    setIsDeleting(true);
    try {
      await deleteConcept(Number(conceptId));
      addToast({ type: "success", message: t("messages.concept_deleted") });
      window.location.href = "/concepts";
    } catch {
      addToast({ type: "error", message: t("messages.concept_delete_failed") });
      setIsDeleting(false);
    }
  }, [conceptId, addToast, t]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-start justify-between">
          <Skeleton className="h-7 w-48" />
        </div>
        <SkeletonCard />
        <SkeletonCard />
      </div>
    );
  }

  if (!concept) {
    return <p className="text-center text-text-muted">{t("concepts.not_found")}</p>;
  }

  const isDraft = concept.status === "draft";
  const isThreshold = concept.status === "threshold";
  const isVoting = concept.status === "voting";
  const candidateCount = candidates?.length ?? 0;

  const tabs = [
    { id: "overview", label: t("concepts.detail.definition") },
    { id: "candidates", label: t("concepts.detail.candidates"), count: candidateCount },
    { id: "discussions", label: t("concepts.detail.discussions") },
    { id: "history", label: t("concepts.detail.history") },
    { id: "metrics", label: t("concepts.detail.metrics") },
    { id: "activity", label: t("concepts.detail.recent_activity_label") },
    ...(isThreshold || isVoting
      ? [{ id: "voting", label: t("statuses.voting") }]
      : []),
  ];

  return (
    <div className="space-y-6">
      <Breadcrumb items={[{ label: t("concepts.title"), href: "/concepts" }, { label: concept.english_term?.word ?? t("concepts.title") }]} />
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-heading font-extrabold tracking-[-0.02em] text-foreground">
              {concept.english_term?.word ?? t("concepts.untitled")}
            </h1>
            <ConceptStatusBadge status={concept.status} />
          </div>
          <p className="mt-1 text-[13px] text-text-muted">
            {concept.domain?.name} &middot; {t("common.created")} {formatDate(concept.created_at)}
          </p>
        </div>
        <div className="flex gap-2">
          {(isExpert || isDomainHead || isAdmin) && (
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setEditModalOpen(true)}
            >
              {t("common.edit")}
            </Button>
          )}
          {(isDomainHead || isAdmin) && isDraft && candidateCount > 0 && (
            <Button size="sm" onClick={handleMotionToVote}>{t("concepts.detail.motion_to_vote")}</Button>
          )}
          {(isDomainHead || isAdmin) && (isDraft || isThreshold) && (
            <Button
              size="sm"
              onClick={handleAdvance}
              loading={isAdvancing}
            >
              {t("concepts.detail.advance_stage")}
            </Button>
          )}
          {(isDomainHead || isAdmin) && isVoting && (
            <Button
              variant="secondary"
              size="sm"
              onClick={handleCloseVoting}
              loading={isClosingVoting}
            >
              {t("concepts.detail.close_voting")}
            </Button>
          )}
          {(isMainBoard || isAdmin) && (
            <Button
              variant="secondary"
              size="sm"
              onClick={handleReopen}
            >
              {t("concepts.detail.reopen")}
            </Button>
          )}
          {isAdmin && (
            <Button
              variant="danger"
              size="sm"
              onClick={() => setDeleteConfirmOpen(true)}
            >
              {t("common.delete")}
            </Button>
          )}
        </div>
      </div>

      {/* Edit Concept Modal */}
      <EditConceptModal
        open={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        concept={concept}
        onSuccess={refetch}
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmationDialog
        open={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        onConfirm={handleDelete}
        title={t("concepts.delete_concept")}
        message={t("concepts.delete_confirm", { term: concept.english_term?.word ?? t("concepts.untitled") })}
        confirmLabel={t("common.delete")}
        variant="danger"
        loading={isDeleting}
      />

      {/* Tabs */}
      <Tabs tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Tab content */}
      <div className="mt-6">
        {activeTab === "overview" && (
          <OverviewTab concept={concept} conceptId={conceptId} />
        )}
        {activeTab === "candidates" && (
          <CandidatesTab
            candidates={candidates ?? []}
            conceptStatus={concept.status}
            currentUserId={user?.id}
            onWithdraw={handleWithdraw}
            onRefresh={refetch}
          />
        )}
        {activeTab === "discussions" && (
          <DiscussionThread conceptId={conceptId} />
        )}
        {activeTab === "history" && (
          <HistoryTab conceptId={conceptId} />
        )}
        {activeTab === "metrics" && (
          <MetricsTab conceptId={conceptId} />
        )}
        {activeTab === "activity" && (
          <ActivityTab conceptId={conceptId} />
        )}
        {activeTab === "voting" && (
          <div className="space-y-6">
            {isThreshold && (
              <ThresholdVotePanel conceptId={Number(conceptId)} />
            )}
            {isVoting && (
              <>
                <VoteMatrix
                  conceptId={Number(conceptId)}
                  candidates={candidates ?? []}
                />
                <Card>
                  <h3 className="mb-4 text-[14px] font-bold text-foreground">
                    {t("concepts.consensus_scores")}
                  </h3>
                  <ConsensusChart
                    candidates={candidates ?? []}
                    winnerId={concept.winner_candidate_id}
                  />
                </Card>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function OverviewTab({ concept, conceptId }: { concept: Concept; conceptId: string }) {
  const { t } = useI18n();
  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <div className="lg:col-span-2 space-y-4">
        <Card>
          <h3 className="mb-2 text-sm font-medium text-text-muted">{t("concepts.detail.definition")}</h3>
          <p className="text-foreground">{concept.definition}</p>
        </Card>

        <Card>
          <h3 className="mb-3 text-sm font-medium text-text-muted">{t("common.details")}</h3>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <p className="text-xs text-text-muted">{t("concepts.english_term")}</p>
              <p className="text-sm font-medium">
                {concept.english_term?.word ?? t("common.dash")}
              </p>
            </div>
            <div>
              <p className="text-xs text-text-muted">{t("concepts.domain")}</p>
              <p className="text-sm font-medium">
                {concept.domain?.name ?? t("common.dash")}
              </p>
            </div>
            <div>
              <p className="text-xs text-text-muted">{t("concepts.stage_entered")}</p>
              <p className="text-sm font-medium">
                {formatDate(concept.stage_entered_at)}
              </p>
            </div>
            <div>
              <p className="text-xs text-text-muted">{t("concepts.priority")}</p>
              <p className="text-sm font-medium capitalize">
                {concept.priority}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Reference sidebar */}
      <div>
        <ReferenceSidebar conceptId={conceptId} />
      </div>
    </div>
  );
}

function CandidatesTab({
  candidates,
  conceptStatus,
  currentUserId,
  onWithdraw,
  onRefresh,
}: {
  candidates: Candidate[];
  conceptStatus: string;
  currentUserId?: number;
  onWithdraw: (id: number) => void;
  onRefresh?: () => void;
}) {
  const { t } = useI18n();
  if (candidates.length === 0) {
    return (
      <Card>
        <p className="text-center text-sm text-text-muted">
          {t("concepts.no_candidates")}
        </p>
      </Card>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {candidates.map((candidate) => (
        <CandidateCard
          key={candidate.id}
          candidate={candidate}
          showActions={true}
          onWithdraw={onWithdraw}
          onRefresh={onRefresh}
        />
      ))}
    </div>
  );
}

function HistoryTab({ conceptId }: { conceptId: string }) {
  const { t } = useI18n();
  const { data: history, isLoading } = useApi<ConceptHistoryEntry[]>(
    `/api/v1/concepts/${conceptId}/history`
  );

  // Get icon and color based on event type
  const getEventStyle = (eventType: string) => {
    const styles: Record<string, { icon: string; color: string; bg: string }> = {
      created: {
        icon: `<svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>`,
        color: "text-emerald-500",
        bg: "bg-emerald-50 dark:bg-emerald-950",
      },
      updated: {
        icon: `<svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487zm0 0L19.5 7.125" /></svg>`,
        color: "text-blue-500",
        bg: "bg-blue-50 dark:bg-blue-950",
      },
      status_changed: {
        icon: `<svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M7.5 21L3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5" /></svg>`,
        color: "text-amber-500",
        bg: "bg-amber-50 dark:bg-amber-950",
      },
      candidate_added: {
        icon: `<svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M19 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zM3.75 15h2.25m2.25 0h2.25m-9-2.25h12m0 0V21m0-3a3 3 0 01-3 3h-3a3 3 0 01-3-3v-6a3 3 0 013-3h3a3 3 0 013 3v2.25" /></svg>`,
        color: "text-purple-500",
        bg: "bg-purple-50 dark:bg-purple-950",
      },
      candidate_withdrawn: {
        icon: `<svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M22 10.5h-6m-2.25-4.125a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zM4 19.235v-.11a6.375 6.375 0 0112.75-0v.109A12.318 12.318 0 0110.374 21c-2.331 0-4.512-.645-6.374-1.766z" /></svg>`,
        color: "text-red-500",
        bg: "bg-red-50 dark:bg-red-950",
      },
      voting_started: {
        icon: `<svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M10.5 6a7.5 7.5 0 107.5 7.5h-7.5V6z" /><path stroke-linecap="round" stroke-linejoin="round" d="M13.5 10.5H21A7.5 7.5 0 0013.5 3v7.5z" /></svg>`,
        color: "text-indigo-500",
        bg: "bg-indigo-50 dark:bg-indigo-950",
      },
      voting_closed: {
        icon: `<svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>`,
        color: "text-slate-500",
        bg: "bg-slate-50 dark:bg-slate-950",
      },
      approved: {
        icon: `<svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>`,
        color: "text-green-600",
        bg: "bg-green-50 dark:bg-green-950",
      },
      vetoed: {
        icon: `<svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" /></svg>`,
        color: "text-red-600",
        bg: "bg-red-50 dark:bg-red-950",
      },
      recalled: {
        icon: `<svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" /></svg>`,
        color: "text-orange-500",
        bg: "bg-orange-50 dark:bg-orange-950",
      },
      reopened: {
        icon: `<svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" /></svg>`,
        color: "text-cyan-500",
        bg: "bg-cyan-50 dark:bg-cyan-950",
      },
    };
    return styles[eventType] || {
      icon: `<svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>`,
      color: "text-gray-500",
      bg: "bg-gray-50 dark:bg-gray-950",
    };
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!history || history.length === 0) {
    return (
      <Card>
        <p className="text-center text-sm text-text-muted">{t("concepts.no_history")}</p>
      </Card>
    );
  }

  return (
    <Card>
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-[14px] font-bold text-foreground">{t("concepts.concept_history")}</h3>
        <span className="text-xs text-text-muted">{history.length} {t("concepts.events")}</span>
      </div>
      <div className="relative">
        {/* Timeline line */}
        <div className="absolute left-[15px] top-2 h-[calc(100%-16px)] w-0.5 bg-border-light" />

        <div className="space-y-4">
          {history.map((entry, index) => {
            const style = getEventStyle(entry.event_type);
            return (
              <div key={entry.id} className="relative flex items-start gap-4">
                {/* Timeline dot */}
                <div className={`relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${style.bg} ${style.color}`}>
                  <div dangerouslySetInnerHTML={{ __html: style.icon }} />
                </div>

                {/* Content */}
                <div className={`min-w-0 flex-1 rounded-lg border ${index === 0 ? "border-primary-light bg-primary-light/5" : "border-border-light bg-surface"} p-3`}>
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-foreground">{entry.description}</p>
                      {entry.metadata && Object.keys(entry.metadata).length > 0 && (
                        <details className="mt-2 group">
                          <summary className="cursor-pointer text-xs text-primary-600 hover:text-primary-700">
                            {t("concepts.view_details")}
                          </summary>
                          <div className="mt-2 space-y-1 rounded bg-surface p-2 text-xs">
                            {Object.entries(entry.metadata).map(([key, value]) => (
                              <div key={key} className="flex gap-2">
                                <span className="font-medium text-text-muted">{key}:</span>
                                <span className="text-foreground">{String(value)}</span>
                              </div>
                            ))}
                          </div>
                        </details>
                      )}
                    </div>
                    <div className=" shrink-0 text-right">
                      <p className="text-xs text-text-muted">{entry.user?.name ?? t("common.unknown")}</p>
                      <p className="text-[10px] text-text-muted">{formatDate(entry.created_at)}</p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </Card>
  );
}

function MetricsTab({ conceptId }: { conceptId: string }) {
  const { t } = useI18n();
  const { data: metrics, isLoading } = useApi<BackendConceptMetrics>(
    `/api/v1/concepts/${conceptId}/metrics`
  );

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!metrics) {
    return (
      <Card>
        <p className="text-center text-sm text-text-muted">{t("concepts.detail.no_metrics")}</p>
      </Card>
    );
  }

  const avgConsensus =
    metrics.candidates.length > 0
      ? metrics.candidates.reduce((sum, c) => sum + (c.consensus_score ?? 0), 0) / metrics.candidates.length
      : 0;

  const totalVotes = metrics.candidates.reduce((sum, c) => sum + c.vote_count, 0);

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <Card padding>
        <p className="text-sm text-text-muted">{t("concepts.detail.total_candidates")}</p>
        <p className="text-2xl font-extrabold tracking-[-0.02em] text-foreground">{metrics.candidates.length}</p>
      </Card>
      <Card padding>
        <p className="text-sm text-text-muted">{t("concepts.detail.total_votes")}</p>
        <p className="text-2xl font-extrabold tracking-[-0.02em] text-foreground">{totalVotes}</p>
      </Card>
      <Card padding>
        <p className="text-sm text-text-muted">{t("concepts.detail.avg_consensus")}</p>
        <p className="text-2xl font-extrabold tracking-[-0.02em] text-foreground">
          {avgConsensus.toFixed(2)}
        </p>
      </Card>
      <Card padding>
        <p className="text-sm text-text-muted">{t("concepts.detail.threshold_turnout")}</p>
        <p className="text-2xl font-extrabold tracking-[-0.02em] text-foreground">
          {metrics.threshold_votes.turnout.toFixed(0)}%
        </p>
        <p className="text-xs text-text-muted">
          {metrics.threshold_votes.yes} yes / {metrics.threshold_votes.no} no
        </p>
      </Card>
      <Card padding>
        <p className="text-sm text-text-muted">{t("concepts.stage")}</p>
        <p className="text-2xl font-extrabold tracking-[-0.02em] text-foreground capitalize">
          {metrics.stage}
        </p>
      </Card>
    </div>
  );
}

function ActivityTab({ conceptId }: { conceptId: string }) {
  const { t } = useI18n();
  const { data: activities, isLoading } = useApi<ConceptActivityEntry[]>(
    `/api/v1/concepts/${conceptId}/activity-feed`
  );

  // Ensure activities is always an array
  const activitiesList = Array.isArray(activities) ? activities : [];

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Spinner size="lg" />
      </div>
    );
  }

  if (activitiesList.length === 0) {
    return (
      <Card>
        <p className="text-center text-sm text-text-muted">{t("concepts.no_history")}</p>
      </Card>
    );
  }

  return (
    <Card>
      <h3 className="mb-4 text-[14px] font-bold text-foreground">{t("concepts.detail.recent_activity_label")}</h3>
      <div className="space-y-3">
        {activitiesList.map((activity) => (
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
  );
}
