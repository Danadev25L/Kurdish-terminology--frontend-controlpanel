"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { formatNumber } from "@/lib/utils/format";
import type { Candidate } from "@/lib/api/types";

interface CandidateCardProps {
  candidate: Candidate;
  isWinner?: boolean;
  showActions?: boolean;
  onWithdraw?: (id: number) => void;
}

export function CandidateCard({
  candidate,
  isWinner = false,
  showActions = false,
  onWithdraw,
}: CandidateCardProps) {
  const term = candidate.kurdish_term;

  return (
    <Card
      className={`relative ${isWinner ? "ring-2 ring-success" : ""}`}
    >
      {isWinner && (
        <div className="absolute -top-2 end-3">
          <Badge variant="success">Winner</Badge>
        </div>
      )}

      <div className="space-y-3">
        {/* Term info */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900" dir="rtl">
            {term?.word ?? "—"}
          </h3>
          <div className="mt-1 flex flex-wrap gap-1.5">
            {term?.dialect_tag && <Badge>{term.dialect_tag}</Badge>}
            {term?.part_of_speech && <Badge>{term.part_of_speech}</Badge>}
          </div>
        </div>

        {candidate.usage_example && (
          <p className="text-sm text-muted" dir="rtl">
            {candidate.usage_example}
          </p>
        )}

        {candidate.morphology_notes && (
          <p className="text-sm text-muted">{candidate.morphology_notes}</p>
        )}

        {/* Metrics */}
        {candidate.metrics && (
          <div className="grid grid-cols-4 gap-2 border-t border-border pt-3">
            <Metric label="Cs" value={formatNumber(candidate.metrics.consensus_score)} />
            <Metric label="Mean" value={formatNumber(candidate.metrics.mean)} />
            <Metric label="Std Dev" value={formatNumber(candidate.metrics.std_dev)} />
            <Metric label="Votes" value={String(candidate.metrics.vote_count)} />
          </div>
        )}

        {/* Actions */}
        {showActions && onWithdraw && !candidate.withdrawn_at && (
          <div className="border-t border-border pt-3">
            <Button
              variant="danger"
              size="sm"
              onClick={() => onWithdraw(candidate.id)}
            >
              Withdraw
            </Button>
          </div>
        )}
      </div>
    </Card>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="text-center">
      <p className="text-xs text-muted">{label}</p>
      <p className="text-sm font-semibold text-gray-900">{value}</p>
    </div>
  );
}
