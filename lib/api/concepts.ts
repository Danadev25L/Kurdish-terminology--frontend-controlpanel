import { api } from "./client";
import type {
  Concept,
  PaginatedResponse,
  ConceptHistoryEntry,
  ConceptMetrics,
  ConceptActivityEntry,
  VotesSummary,
  CandidatesHistoryResponse,
} from "./types";

interface ConceptFilters {
  domain_id?: number;
  status?: string;
  page?: number;
  per_page?: number;
}

export function getConcepts(filters: ConceptFilters = {}) {
  const params = new URLSearchParams();
  if (filters.domain_id) params.set("domain_id", String(filters.domain_id));
  if (filters.status) params.set("status", filters.status);
  if (filters.page) params.set("page", String(filters.page));
  if (filters.per_page) params.set("per_page", String(filters.per_page));
  return api.get<PaginatedResponse<Concept>>(`/api/v1/concepts?${params}`);
}

/**
 * GET /api/v1/concepts/inbox
 * Get personalized inbox concepts for the current user
 */
export function getConceptInbox(filters: ConceptFilters = {}) {
  const params = new URLSearchParams();
  if (filters.domain_id) params.set("domain_id", String(filters.domain_id));
  if (filters.status) params.set("status", filters.status);
  if (filters.page) params.set("page", String(filters.page));
  if (filters.per_page) params.set("per_page", String(filters.per_page));
  return api.get<PaginatedResponse<Concept>>(`/api/v1/concepts/inbox?${params}`);
}

export function getConcept(id: number | string) {
  return api.get<Concept>(`/api/v1/concepts/${id}`);
}

export function createConcept(data: {
  domain_id: number;
  english_term: string;
  definition: string;
}) {
  return api.post<Concept>("/api/v1/concepts", data);
}

export function updateConcept(
  id: number,
  data: { definition?: string; english_term?: string }
) {
  return api.patch<Concept>(`/api/v1/concepts/${id}`, data);
}

export function deleteConcept(id: number | string) {
  return api.del(`/api/v1/concepts/${id}`);
}

export function motionToVote(id: number) {
  return api.post<Concept>(`/api/v1/concepts/${id}/motion-to-vote`);
}

/**
 * POST /api/v1/concepts/{id}/advance
 * Advance concept to next stage (Domain Head, Admin only)
 */
export function advanceConcept(id: number) {
  return api.post<Concept>(`/api/v1/concepts/${id}/advance`);
}

export function closeVoting(id: number) {
  return api.post<Concept>(`/api/v1/concepts/${id}/close-voting`);
}

export function reopenConcept(id: number) {
  return api.post<Concept>(`/api/v1/concepts/${id}/reopen`);
}

export function requestInfo(id: number, note: string) {
  // Fixed: Backend uses /api/v1/concepts/{id}/request-info, not /api/v1/board/concepts/{id}/request-info
  return api.post(`/api/v1/concepts/${id}/request-info`, { note });
}

export function getConceptHistory(id: number | string) {
  return api.get<ConceptHistoryEntry[]>(`/api/v1/concepts/${id}/history`);
}

export function getConceptMetrics(id: number | string) {
  return api.get<ConceptMetrics>(`/api/v1/concepts/${id}/metrics`);
}

export function getConceptActivity(id: number | string) {
  return api.get<ConceptActivityEntry[]>(`/api/v1/concepts/${id}/activity-feed`);
}

/**
 * GET /api/v1/concepts/{id}/consensus-votes
 * Get all consensus votes for a concept
 */
export function getConsensusVotes(id: number | string) {
  return api.get(`/api/v1/concepts/${id}/consensus-votes`);
}

/**
 * GET /api/v1/concepts/{id}/reference-context
 * Get reference context (dictionary definitions) for a concept
 */
export function getReferenceContext(id: number | string) {
  return api.get(`/api/v1/concepts/${id}/reference-context`);
}

export function getVotesSummary(id: number | string) {
  return api.get<VotesSummary>(`/api/v1/concepts/${id}/votes/summary`);
}

/**
 * GET /api/v1/concepts/{id}/candidates/history
 * Get historical (deactivated) candidates for a concept
 * Requires authentication
 */
export function getCandidatesHistory(conceptId: number | string) {
  return api.get<CandidatesHistoryResponse>(
    `/api/v1/concepts/${conceptId}/candidates/history`
  );
}
