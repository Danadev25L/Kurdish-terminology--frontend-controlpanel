import { api } from "./client";
import type { Concept, PaginatedResponse } from "./types";

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
  return api.get<PaginatedResponse<Concept>>(`/v1/concepts?${params}`);
}

export function getConcept(id: number | string) {
  return api.get<Concept>(`/v1/concepts/${id}`);
}

export function createConcept(data: {
  domain_id: number;
  english_term: string;
  definition: string;
}) {
  return api.post<Concept>("/v1/concepts", data);
}

export function updateConcept(
  id: number,
  data: { definition?: string; english_term?: string }
) {
  return api.patch<Concept>(`/v1/concepts/${id}`, data);
}

export function motionToVote(id: number) {
  return api.post<Concept>(`/v1/concepts/${id}/motion-to-vote`);
}

export function closeVoting(id: number) {
  return api.post<Concept>(`/v1/concepts/${id}/close-voting`);
}

export function reopenConcept(id: number) {
  return api.post<Concept>(`/v1/concepts/${id}/reopen`);
}
