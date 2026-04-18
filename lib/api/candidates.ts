import { api } from "./client";
import type { Candidate } from "./types";

export function getCandidates(conceptId: number | string) {
  return api.get<Candidate[]>(`/api/concepts/${conceptId}/candidates`);
}

export function createCandidate(
  conceptId: number,
  data: { kurdish_term: string; morphology_notes?: string }
) {
  return api.post<Candidate>(`/api/concepts/${conceptId}/candidates`, data);
}

export function updateCandidate(
  id: number,
  data: { kurdish_term?: string; morphology_notes?: string }
) {
  return api.patch<Candidate>(`/api/candidates/${id}`, data);
}

export function withdrawCandidate(id: number) {
  return api.post<Candidate>(`/api/candidates/${id}/withdraw`);
}
