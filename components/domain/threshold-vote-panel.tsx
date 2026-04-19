"use client";

import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { castThresholdVote, getThresholdResult } from "@/lib/api/voting";
import { useApi } from "@/lib/hooks/use-api";
import { useAuth } from "@/lib/hooks/use-auth";
import { useRole } from "@/lib/hooks/use-role";
import type { ThresholdResult } from "@/lib/api/types";

interface ThresholdVotePanelProps {
  conceptId: number;
}

export function ThresholdVotePanel({ conceptId }: ThresholdVotePanelProps) {
  const { user } = useAuth();
  const { isExpert, isAdmin, isMainBoard } = useRole();
  const [submitting, setSubmitting] = useState(false);
  const [voted, setVoted] = useState(false);

  const { data: result, isLoading, refetch } = useApi<ThresholdResult>(
    `/api/v1/concepts/${conceptId}/threshold-votes`
  );

  const handleVote = useCallback(
    async (vote: boolean) => {
      setSubmitting(true);
      try {
        await castThresholdVote(conceptId, vote);
        setVoted(true);
        refetch();
      } finally {
        setSubmitting(false);
      }
    },
    [conceptId, refetch]
  );

  if (isLoading) return null;

  const hasVoted = result?.user_voted ?? voted;
  // Per SRS 3.2.2: Threshold voting is for experts only (not domain heads)
  const canVote = isExpert || isAdmin;

  return (
    <Card>
      <h3 className="mb-4 text-lg font-semibold text-gray-900">
        Threshold Vote
      </h3>
      <p className="mb-4 text-sm text-muted">
        Should this concept advance to consensus voting?
      </p>

      {result && (
        <div className="space-y-1 text-sm mb-4">
          <p>
            Yes: {result.yes_count} / {result.total_eligible} (
            {(result.yes_ratio * 100).toFixed(1)}%)
          </p>
          <p>No: {result.no_count}</p>
          <p className="font-medium">
            Status: {result.passed ? "PASSED" : "Pending"}
          </p>
        </div>
      )}

      {!canVote && isMainBoard && (
        <p className="text-sm text-muted">
          Threshold voting is for experts only per SRS 3.2.2.
          Main Board can use "escalate to Stage 3" to override.
        </p>
      )}

      {!canVote && !isMainBoard && !isAdmin && (
        <p className="text-sm text-muted">
          Only domain experts can vote in threshold stage.
        </p>
      )}

      {canVote && !hasVoted && (
        <div className="flex gap-3">
          <Button
            onClick={() => handleVote(true)}
            loading={submitting}
            variant="primary"
          >
            Yes
          </Button>
          <Button
            onClick={() => handleVote(false)}
            loading={submitting}
            variant="danger"
          >
            No
          </Button>
        </div>
      )}

      {hasVoted && (
        <p className="text-sm text-success font-medium">
          You have voted: {result?.user_vote ? "Yes" : "No"}
        </p>
      )}
    </Card>
  );
}
