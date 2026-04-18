import { api } from "./client";
import type { PaginatedResponse, PublicTerm } from "./types";

export function searchTerms(params: {
  q?: string;
  page?: number;
  per_page?: number;
}) {
  const searchParams = new URLSearchParams();
  if (params.q) searchParams.set("q", params.q);
  if (params.page) searchParams.set("page", String(params.page));
  if (params.per_page) searchParams.set("per_page", String(params.per_page));
  return api.get<PaginatedResponse<PublicTerm>>(`/api/terms?${searchParams}`);
}

export function getTerm(id: string | number) {
  return api.get<PublicTerm>(`/api/terms/${id}`);
}
