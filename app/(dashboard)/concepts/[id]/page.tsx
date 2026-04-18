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
import { ConceptStatusBadge } from "@/components/domain/concept-status-badge";
import { CandidateCard } from "@/components/domain/candidate-card";
import { DiscussionThread } from "@/components/domain/discussion-thread";
import { ThresholdVotePanel } from "@/components/domain/threshold-vote-panel";
import { VoteMatrix } from "@/components/domain/vote-matrix";
import { ConsensusChart } from "@/components/domain/consensus-chart";
import { withdrawCandidate } from "@/lib/api/candidates";
import { motionToVote } from "@/lib/api/concepts";
import type { Concept, Candidate } from "@/lib/api/types";
import { formatDate } from "@/lib/utils/format";

export default function ConceptDetailPage() {
  const params = useParams();
  const conceptId = params.id as string;
  const { isDomainHead, isAdmin, isMainBoard } = useRole();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");

  const { data: concept, isLoading, refetch } = useApi<Concept>(
    `/api/v1/concepts/${conceptId}`,
    { pollingInterval: 120000 }
  );

  const { data: candidates } = useApi<Candidate[]>(
    `/api/v1/concepts/${conceptId}/candidates`
  );

  const handleWithdraw = useCallback(
    async (id: number) => {
      await withdrawCandidate(id);
      refetch();
    },
    [refetch]
  );

  const handleMotionToVote = useCallback(async () => {
    await motionToVote(Number(conceptId));
    refetch();
  }, [conceptId, refetch]);

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!concept) {
    return <p className="text-center text-muted">Concept not found.</p>;
  }

  const isDraft = concept.status === "draft";
  const isThreshold = concept.status === "threshold";
  const isVoting = concept.status === "voting";
  const candidateCount = candidates?.length ?? 0;

  const tabs = [
    { id: "overview", label: "Overview" },
    { id: "candidates", label: "Candidates", count: candidateCount },
    { id: "discussions", label: "Discussions" },
    ...(isThreshold || isVoting
      ? [{ id: "voting", label: "Voting" }]
      : []),
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-gray-900">
              {concept.english_term?.word ?? "Untitled Concept"}
            </h1>
            <ConceptStatusBadge status={concept.status} />
          </div>
          <p className="mt-1 text-sm text-muted">
            {concept.domain?.name} &middot; Created {formatDate(concept.created_at)}
          </p>
        </div>
        <div className="flex gap-2">
          {(isDomainHead || isAdmin) && isDraft && candidateCount > 0 && (
            <Button onClick={handleMotionToVote}>Motion to Vote</Button>
          )}
          {(isMainBoard || isAdmin) && (
            <Button
              variant="secondary"
              onClick={() =>
                /* reopen - Phase 6 */ undefined
              }
            >
              Reopen
            </Button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <Tabs tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Tab content */}
      <div className="mt-6">
        {activeTab === "overview" && (
          <OverviewTab concept={concept} />
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
                  <h3 className="mb-4 text-lg font-semibold text-gray-900">
                    Consensus Scores
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

function OverviewTab({ concept }: { concept: Concept }) {
  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <div className="lg:col-span-2 space-y-4">
        <Card>
          <h3 className="mb-2 text-sm font-medium text-muted">Definition</h3>
          <p className="text-gray-900">{concept.definition}</p>
        </Card>

        <Card>
          <h3 className="mb-3 text-sm font-medium text-muted">Details</h3>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <p className="text-xs text-muted">English Term</p>
              <p className="text-sm font-medium">
                {concept.english_term?.word ?? "—"}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted">Domain</p>
              <p className="text-sm font-medium">
                {concept.domain?.name ?? "—"}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted">Stage Entered</p>
              <p className="text-sm font-medium">
                {formatDate(concept.stage_entered_at)}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted">Priority</p>
              <p className="text-sm font-medium capitalize">
                {concept.priority}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Reference sidebar placeholder */}
      <div>
        <Card>
          <h3 className="mb-3 text-sm font-medium text-muted">
            Reference Context
          </h3>
          <p className="text-sm text-muted">
            Dictionary definitions will appear here.
          </p>
        </Card>
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
  if (candidates.length === 0) {
    return (
      <Card>
        <p className="text-center text-sm text-muted">
          No candidates proposed yet.
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
