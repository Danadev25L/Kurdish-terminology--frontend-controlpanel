import { Card } from "./card";
import { Badge } from "./badge";
import type { DeactivatedCandidate, DeactivatedPublicTerm } from "@/lib/api/types";

interface CandidatesHistoryProps {
  deactivatedCandidates: DeactivatedCandidate[];
  deactivatedPublicTerms: DeactivatedPublicTerm[];
  loading?: boolean;
}

export function CandidatesHistory({
  deactivatedCandidates,
  deactivatedPublicTerms,
  loading = false,
}: CandidatesHistoryProps) {
  if (loading) {
    return (
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Term History</h3>
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="animate-pulse flex items-center gap-3">
              <div className="h-10 w-10 bg-slate-200 rounded" />
              <div className="flex-1">
                <div className="h-4 w-32 bg-slate-200 rounded mb-2" />
                <div className="h-3 w-48 bg-slate-200 rounded" />
              </div>
            </div>
          ))}
        </div>
      </Card>
    );
  }

  const hasHistory =
    deactivatedCandidates.length > 0 || deactivatedPublicTerms.length > 0;

  if (!hasHistory) {
    return (
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Term History</h3>
        <p className="text-sm text-slate-500">
          No previous versions of this term exist.
        </p>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4">Term History</h3>
      <p className="text-sm text-slate-500 mb-4">
        Previous translations that were replaced by newer approved versions.
      </p>

      {/* Deactivated Public Terms */}
      {deactivatedPublicTerms.length > 0 && (
        <div className="mb-6">
          <h4 className="text-sm font-medium text-slate-700 mb-3">
            Previously Published Terms
          </h4>
          <div className="space-y-3">
            {deactivatedPublicTerms.map((term) => (
              <div
                key={term.id}
                className="flex items-start gap-3 p-3 bg-amber-50 border border-amber-200 rounded-lg"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-slate-900">
                      {term.kurdish_word}
                    </span>
                    <Badge variant="warning">Deactivated</Badge>
                  </div>
                  <div className="text-xs text-slate-500 space-y-1">
                    <p>
                      Approved: {new Date(term.approved_at).toLocaleDateString()}
                    </p>
                    <p>
                      Deactivated:{" "}
                      {new Date(term.deactivated_at).toLocaleDateString()}
                    </p>
                    {term.deactivated_by_name && (
                      <p>by {term.deactivated_by_name}</p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Deactivated Candidates */}
      {deactivatedCandidates.length > 0 && (
        <div>
          <h4 className="text-sm font-medium text-slate-700 mb-3">
            Previous Candidates
          </h4>
          <div className="space-y-3">
            {deactivatedCandidates.map((candidate) => (
              <div
                key={candidate.id}
                className="flex items-start gap-3 p-3 bg-slate-50 border border-slate-200 rounded-lg"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-slate-900">
                      {candidate.kurdish_word}
                    </span>
                    {candidate.is_winner && (
                      <Badge variant="success">Was Winner</Badge>
                    )}
                  </div>
                  <div className="text-xs text-slate-500 space-y-1">
                    <p>Proposed by: {candidate.proposer_name || "Unknown"}</p>
                    {candidate.consensus_score > 0 && (
                      <p>
                        Consensus Score: {candidate.consensus_score.toFixed(2)}{" "}
                        | Mean: {candidate.mean_score.toFixed(1)} | Votes:{" "}
                        {candidate.vote_count}
                      </p>
                    )}
                    <p>
                      Updated: {new Date(candidate.updated_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </Card>
  );
}

// Simplified version for public view (no candidates shown)
interface PublicTermHistoryProps {
  deactivatedTerms: DeactivatedPublicTerm[];
  loading?: boolean;
}

export function PublicTermHistory({
  deactivatedTerms,
  loading = false,
}: PublicTermHistoryProps) {
  if (loading) {
    return (
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Previous Versions</h3>
        <div className="space-y-3">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="h-4 w-32 bg-slate-200 rounded mb-2" />
              <div className="h-3 w-48 bg-slate-200 rounded" />
            </div>
          ))}
        </div>
      </Card>
    );
  }

  if (deactivatedTerms.length === 0) {
    return null;
  }

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4">Previous Versions</h3>
      <p className="text-sm text-slate-500 mb-4">
        This term has been updated. Previous versions are shown below.
      </p>
      <div className="space-y-3">
        {deactivatedTerms.map((term) => (
          <div
            key={term.id}
            className="flex items-start gap-3 p-3 bg-amber-50 border border-amber-200 rounded-lg"
          >
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-medium text-slate-900">
                  {term.kurdish_word}
                </span>
                <Badge variant="warning">Previous Version</Badge>
              </div>
              <div className="text-xs text-slate-500 space-y-1">
                <p>
                  Approved: {new Date(term.approved_at).toLocaleDateString()}
                </p>
                <p>
                  Deactivated: {new Date(term.deactivated_at).toLocaleDateString()}
                </p>
                {term.deactivated_by_name && <p>by {term.deactivated_by_name}</p>}
              </div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
