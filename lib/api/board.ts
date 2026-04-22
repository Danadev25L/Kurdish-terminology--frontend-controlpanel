import { api } from "./client";
import type {
  ReviewQueueItem,
  PaginatedResponse,
  BatchApproveResult,
  BoardDecision,
} from "./types";

interface ReviewQueueFilters {
  domain_id?: number;
  close_call?: boolean;
  date_from?: string;
  date_to?: string;
  sort?: string;
  page?: number;
}

interface PublishedTermsFilters {
  search?: string;
  domain_id?: number;
  page?: number;
}

export function getReviewQueue(filters: ReviewQueueFilters = {}) {
  const params = new URLSearchParams();
  if (filters.domain_id) params.set("domain_id", String(filters.domain_id));
  if (filters.close_call) params.set("close_call", "true");
  if (filters.date_from) params.set("date_from", filters.date_from);
  if (filters.date_to) params.set("date_to", filters.date_to);
  if (filters.sort) params.set("sort", filters.sort);
  if (filters.page) params.set("page", String(filters.page));
  return api.get<PaginatedResponse<ReviewQueueItem>>(
    `/api/v1/board/review-queue?${params}`
  );
}

/**
 * GET /api/v1/board/review/{id}
 * Examine a concept in detail for board review
 * Includes summary, candidates, metrics, discussions
 */
export function examineConcept(conceptId: number) {
  return api.get(`/api/v1/board/review/${conceptId}`);
}

/**
 * GET /api/v1/board/published
 * Get published terms with optional filters for board oversight
 */
export function getPublishedTerms(filters: PublishedTermsFilters = {}) {
  const params = new URLSearchParams();
  if (filters.search) params.set("search", filters.search);
  if (filters.domain_id) params.set("domain_id", String(filters.domain_id));
  if (filters.page) params.set("page", String(filters.page));
  const queryString = params.toString();
  return api.get(`/api/v1/board/published${queryString ? `?${queryString}` : ""}`);
}

/**
 * GET /api/v1/board/analytics
 * Get platform analytics for board members
 */
export function getBoardAnalytics() {
  return api.get("/api/v1/board/analytics");
}

export function approveConcept(conceptId: number, note?: string) {
  return api.post<BoardDecision>(`/api/v1/concepts/${conceptId}/board/approve`, {
    note,
  });
}

export function vetoConcept(conceptId: number, reason: string) {
  return api.post<BoardDecision>(`/api/v1/concepts/${conceptId}/board/veto`, {
    reason,
  });
}

export function batchApprove(conceptIds: number[]) {
  return api.post<BatchApproveResult>("/api/v1/board/batch-approve", {
    concept_ids: conceptIds,
  });
}
