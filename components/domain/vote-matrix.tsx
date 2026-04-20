"use client";

import { useState, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils/cn";
import { castConsensusVotes } from "@/lib/api/voting";
import { useRole } from "@/lib/hooks/use-role";
import { useToastStore } from "@/stores/toast-store";
import type { Candidate, ConsensusVote } from "@/lib/api/types";
import { api } from "@/lib/api/client";

interface ExistingVote {
  id: number;
  your_vote: number | null;
}

interface VoteMatrixProps {
  conceptId: number;
  candidates: Candidate[];
  votingClosed?: boolean;
  onVoted?: () => void;
}

export function VoteMatrix({
  conceptId,
  candidates,
  votingClosed = false,
  onVoted,
}: VoteMatrixProps) {
  const { isExpert, isDomainHead, isAdmin, isMainBoard } = useRole();
  const canVote = isExpert;
  const addToast = useToastStore((s) => s.addToast);

  const [votes, setVotes] = useState<Record<number, number | null>>(() => {
    const initial: Record<number, number | null> = {};
    candidates.forEach((c) => {
      initial[c.id] = null;
    });
    return initial;
  });
  const [submitting, setSubmitting] = useState(false);
  const [hasExistingVotes, setHasExistingVotes] = useState(false);

  // Fetch existing votes on mount
  useEffect(() => {
    if (!canVote) return;
    let cancelled = false;
    (async () => {
      try {
        const res = await api.get<{ candidates: ExistingVote[] }>(
          `/api/v1/concepts/${conceptId}/consensus-votes`
        );
        if (cancelled) return;
        const existing: Record<number, number | null> = {};
        let foundAny = false;
        for (const c of res.candidates ?? []) {
          if (c.your_vote != null) {
            existing[c.id] = c.your_vote;
            foundAny = true;
          }
        }
        if (foundAny) {
          setVotes((prev) => ({ ...prev, ...existing }));
          setHasExistingVotes(true);
        }
      } catch {
        // Ignore — will start fresh
      }
    })();
    return () => { cancelled = true; };
  }, [conceptId, canVote]);

  const setScore = (candidateId: number, score: number | null) => {
    setVotes((prev) => ({ ...prev, [candidateId]: score }));
  };

  const handleSubmit = useCallback(async () => {
    const voteList: ConsensusVote[] = Object.entries(votes)
      .filter(([, score]) => score !== null)
      .map(([candidateId, score]) => ({
        candidate_id: Number(candidateId),
        score: score!,
      }));

    if (voteList.length === 0) return;

    setSubmitting(true);
    try {
      await castConsensusVotes(conceptId, { votes: voteList });
      setHasExistingVotes(true);
      onVoted?.();
      addToast({ type: "success", message: "Votes submitted" });
    } catch {
      addToast({ type: "error", message: "Failed to submit votes" });
    } finally {
      setSubmitting(false);
    }
  }, [conceptId, votes, onVoted]);

  const isDisabled = votingClosed;

  return (
    <Card>
      <h3 className="mb-4 text-lg font-semibold text-foreground">
        Consensus Voting
      </h3>
      <p className="mb-4 text-[13px] text-text-muted">
        Rate each candidate 1-10. Leave blank to skip a candidate.
      </p>

      {!canVote && (isMainBoard || isAdmin || isDomainHead) && (
        <p className="mb-4 text-[13px] text-text-muted">
          Consensus voting is restricted to domain experts.
        </p>
      )}

      {canVote && (
        <>
          <div className="space-y-4">
            {candidates
              .filter((c) => !c.withdrawn_at)
              .map((candidate) => (
                <div
                  key={candidate.id}
                  className="flex items-center gap-4 rounded-lg border border-border p-3"
                >
                  <div className="w-32 shrink-0">
                    <p className="font-semibold text-foreground" dir="rtl">
                      {candidate.kurdish_term?.word ?? "—"}
                    </p>
                  </div>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((score) => (
                      <button
                        key={score}
                        disabled={isDisabled}
                        onClick={() => setScore(candidate.id, score)}
                        className={cn(
                          "flex h-8 w-8 items-center justify-center rounded-md text-sm font-medium transition-colors",
                          votes[candidate.id] === score
                            ? "bg-primary-500 text-white"
                            : "bg-gray-100 text-muted hover:bg-surface",
                          isDisabled && "opacity-50 cursor-not-allowed"
                        )}
                      >
                        {score}
                      </button>
                    ))}
                    <button
                      disabled={isDisabled}
                      onClick={() => setScore(candidate.id, null)}
                      className={cn(
                        "ms-2 flex h-8 items-center justify-center rounded-md px-2 text-xs font-medium transition-colors",
                        votes[candidate.id] === null
                          ? "bg-gray-300 text-text-secondary"
                          : "bg-gray-100 text-text-muted hover:bg-surface",
                        isDisabled && "opacity-50 cursor-not-allowed"
                      )}
                    >
                      Skip
                    </button>
                  </div>
                </div>
              ))}
          </div>

          {!isDisabled && (
            <div className="mt-4">
              <Button onClick={handleSubmit} loading={submitting}>
                {hasExistingVotes ? "Update Votes" : "Submit Votes"}
              </Button>
            </div>
          )}

          {hasExistingVotes && !submitting && (
            <p className="mt-3 text-[13px] text-text-muted">
              Your previous votes have been loaded. You can change them at any time.
            </p>
          )}
        </>
      )}

      {!canVote && !isMainBoard && !isAdmin && !isDomainHead && (
        <p className="text-[13px] text-text-muted">
          Only domain experts can vote in consensus stage.
        </p>
      )}
    </Card>
  );
}
