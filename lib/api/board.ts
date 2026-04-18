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
