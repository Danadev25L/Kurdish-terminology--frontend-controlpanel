import { api } from "./client";
import type { PaginatedResponse, PublicTerm, HistoricalPublicTerm } from "./types";

export function searchTerms(params: {
  q?: string;
  page?: number;
  per_page?: number;
}) {
  const searchParams = new URLSearchParams();
  if (params.q) searchParams.set("q", params.q);
  if (params.page) searchParams.set("page", String(params.page));
  if (params.per_page) searchParams.set("per_page", String(params.per_page));
  return api.get<PaginatedResponse<PublicTerm>>(`/api/v1/terms?${searchParams}`);
}

export function getTerm(id: string | number) {
  return api.get<PublicTerm>(`/api/v1/terms/${id}`);
}

/**
 * GET /api/v1/terms/history
 * Get historical (deactivated) public terms
 * Requires authentication
 */
export function getHistoricalTerms(params?: {
  domain_id?: number;
  concept_id?: number;
  per_page?: number;
  page?: number;
}) {
  const searchParams = new URLSearchParams();
  if (params?.domain_id) searchParams.set("domain_id", String(params.domain_id));
  if (params?.concept_id) searchParams.set("concept_id", String(params.concept_id));
  if (params?.per_page) searchParams.set("per_page", String(params.per_page));
  if (params?.page) searchParams.set("page", String(params.page));

  const queryString = searchParams.toString();
  return api.get<{
    data: HistoricalPublicTerm[];
    meta: { total: number; per_page: number; current_page: number };
  }>(`/api/v1/terms/history${queryString ? `?${queryString}` : ""}`);
}
