"use client";

import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { castThresholdVote, getThresholdResult } from "@/lib/api/voting";
import { useApi } from "@/lib/hooks/use-api";
import { useAuth } from "@/lib/hooks/use-auth";
import { useRole } from "@/lib/hooks/use-role";
import { useToastStore } from "@/stores/toast-store";
import type { ThresholdResult } from "@/lib/api/types";

interface ThresholdVotePanelProps {
  conceptId: number;
}

export function ThresholdVotePanel({ conceptId }: ThresholdVotePanelProps) {
  const { user } = useAuth();
  const { isExpert, isDomainHead, isAdmin, isMainBoard } = useRole();
  const [submitting, setSubmitting] = useState(false);
  const [voted, setVoted] = useState(false);
  const addToast = useToastStore((s) => s.addToast);

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
        addToast({ type: "success", message: "Vote recorded" });
      } catch {
        addToast({ type: "error", message: "Failed to submit vote" });
      } finally {
        setSubmitting(false);
      }
    },
    [conceptId, refetch, addToast]
  );

  if (isLoading) return null;

  const hasVoted = result?.user_voted ?? voted;
  // Backend only checks "expert" role (single-role middleware)
  const canVote = isExpert;

  return (
    <Card>
      <h3 className="mb-4 text-lg font-semibold text-foreground">
        Threshold Vote
      </h3>
      <p className="mb-4 text-[13px] text-text-muted">
        Should this concept advance to consensus voting?
      </p>

      {result && (
        <div className="space-y-1 text-[13px] mb-4">
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

      {!canVote && (isMainBoard || isAdmin || isDomainHead) && (
        <p className="text-[13px] text-text-muted">
          Threshold voting is restricted to domain experts.
        </p>
      )}

      {!canVote && !isMainBoard && !isAdmin && !isDomainHead && (
        <p className="text-[13px] text-text-muted">
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
        <p className="text-[13px] text-success font-semibold">
          You have voted: {result?.user_vote ? "Yes" : "No"}
        </p>
      )}
    </Card>
  );
}
