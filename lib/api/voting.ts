import { api } from "./client";
import type { ThresholdResult, ConsensusVotePayload } from "./types";

export function castThresholdVote(
  conceptId: number,
  vote: boolean
) {
  return api.post(`/api/concepts/${conceptId}/threshold-votes`, { vote });
}

export function castConsensusVotes(
  conceptId: number,
  payload: ConsensusVotePayload
) {
  return api.post(`/api/concepts/${conceptId}/consensus-votes`, payload);
}

export function getThresholdResult(conceptId: number) {
  return api.get<ThresholdResult>(
    `/api/concepts/${conceptId}/threshold-votes`
  );
}
