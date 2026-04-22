import { api } from "./client";
import type { Candidate } from "./types";

export function getCandidates(conceptId: number | string) {
  return api.get<Candidate[]>(`/api/v1/concepts/${conceptId}/candidates`);
}

/**
 * GET /api/v1/candidates/{id}
 * Get a single candidate by ID
 */
export function getCandidate(id: number) {
  return api.get<Candidate>(`/api/v1/candidates/${id}`);
}

export function createCandidate(
  conceptId: number,
  data: { kurdish_term: string; dialect?: string; morphology_notes?: string }
) {
  return api.post<Candidate>(`/api/v1/concepts/${conceptId}/candidates`, data);
}

export function updateCandidate(
  id: number,
  data: { kurdish_term?: string; morphology_notes?: string }
) {
  return api.patch<Candidate>(`/api/v1/candidates/${id}`, data);
}

export function withdrawCandidate(id: number) {
  return api.post<Candidate>(`/api/v1/candidates/${id}/withdraw`);
}

/**
 * DELETE /api/v1/candidates/{id}
 * Delete a candidate (Admin only)
 */
export function deleteCandidate(id: number) {
  return api.del(`/api/v1/candidates/${id}`);
}

/**
 * GET /api/v1/candidates/{id}/metrics
 * Get candidate metrics (mean, std_dev, consensus_score)
 */
export function getCandidateMetrics(id: number) {
  return api.get<{ mean: number; std_dev: number; consensus_score: number }>(
    `/api/v1/candidates/${id}/metrics`
  );
}
