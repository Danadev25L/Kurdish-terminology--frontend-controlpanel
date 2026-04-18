import { api } from "./client";
import type { Candidate } from "./types";

export function getCandidates(conceptId: number | string) {
  return api.get<Candidate[]>(`/v1/concepts/${conceptId}/candidates`);
}

export function createCandidate(
  conceptId: number,
  data: { kurdish_term: string; morphology_notes?: string }
) {
  return api.post<Candidate>(`/v1/concepts/${conceptId}/candidates`, data);
}

export function updateCandidate(
  id: number,
  data: { kurdish_term?: string; morphology_notes?: string }
) {
  return api.patch<Candidate>(`/v1/candidates/${id}`, data);
}

export function withdrawCandidate(id: number) {
  return api.post<Candidate>(`/v1/candidates/${id}/withdraw`);
}
