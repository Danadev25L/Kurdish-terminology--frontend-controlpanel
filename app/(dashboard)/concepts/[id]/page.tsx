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
import { useToastStore } from "@/stores/toast-store";
import { useI18n } from "@/i18n/context";
import { withdrawCandidate } from "@/lib/api/candidates";
import { motionToVote, reopenConcept } from "@/lib/api/concepts";
import {
  getConceptHistory,
  getConceptActivity,
  deleteConcept,
} from "@/lib/api/concepts";
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
  const { isDomainHead, isAdmin, isMainBoard } = useRole();
  const { user } = useAuth();
  const addToast = useToastStore((s) => s.addToast);
  const { t } = useI18n();
  const [activeTab, setActiveTab] = useState("overview");

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
    [refetch, addToast]
  );

  const handleMotionToVote = useCallback(async () => {
    try {
      await motionToVote(Number(conceptId));
      refetch();
      addToast({ type: "success", message: t("messages.status_updated") });
    } catch {
      addToast({ type: "error", message: t("messages.status_update_failed") });
    }
  }, [conceptId, refetch, addToast]);

  const handleReopen = useCallback(async () => {
    try {
      await reopenConcept(Number(conceptId));
      refetch();
      addToast({ type: "success", message: t("messages.status_updated") });
    } catch {
      addToast({ type: "error", message: t("messages.status_update_failed") });
    }
  }, [conceptId, refetch, addToast]);

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
          {(isDomainHead || isAdmin) && isDraft && candidateCount > 0 && (
            <Button onClick={handleMotionToVote}>{t("concepts.detail.motion_to_vote")}</Button>
          )}
          {(isMainBoard || isAdmin) && (
            <Button
              variant="secondary"
              onClick={handleReopen}
            >
              {t("concepts.detail.reopen")}
            </Button>
          )}
        </div>
      </div>

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
}: {
  candidates: Candidate[];
  conceptStatus: string;
  currentUserId?: number;
  onWithdraw: (id: number) => void;
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
          showActions={
            conceptStatus === "draft" &&
            candidate.author_id === currentUserId
          }
          onWithdraw={onWithdraw}
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
      <h3 className="mb-4 text-[14px] font-bold text-foreground">{t("concepts.concept_history")}</h3>
      <div className="space-y-3">
        {history.map((entry) => (
          <div key={entry.id} className="flex items-start gap-3 border-b border-border-light pb-3 last:border-0">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-light">
              <svg className="h-4 w-4 text-primary-500" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-foreground">{entry.description}</p>
              <p className="text-xs text-text-muted">
                {entry.user?.name ?? t("common.unknown")} · {formatDate(entry.created_at)}
              </p>
            </div>
          </div>
        ))}
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
