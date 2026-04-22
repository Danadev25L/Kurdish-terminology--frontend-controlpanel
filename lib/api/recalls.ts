import { api } from "./client";
import type { Recall, RecallSubmission, PaginatedResponse } from "./types";

export function getPublicRecalls(params?: { page?: number; status?: string }) {
  const searchParams = new URLSearchParams();
  if (params?.page) searchParams.set("page", String(params.page));
  if (params?.status) searchParams.set("status", params.status);
  const queryString = searchParams.toString();
  return api.get<PaginatedResponse<Recall>>(
    `/api/v1/recalls${queryString ? `?${queryString}` : ""}`
  );
}

export function getBoardRecalls(params?: { page?: number; status?: string }) {
  const searchParams = new URLSearchParams();
  if (params?.page) searchParams.set("page", String(params.page));
  if (params?.status) searchParams.set("status", params.status);
  const queryString = searchParams.toString();
  return api.get<PaginatedResponse<Recall>>(
    `/api/v1/board/recalls${queryString ? `?${queryString}` : ""}`
  );
}

/**
 * Get a single recall by ID
 * NOTE: The backend does not currently have a GET /api/v1/recalls/{id} endpoint.
 * This function attempts to call it, but will return a 404.
 * Workaround: Fetch from getPublicRecalls() or getBoardRecalls() and find by ID.
 * @unimplemented Backend endpoint missing
 */
export function getRecall(id: number | string) {
  // Backend does not have this endpoint
  return api.get<Recall>(`/api/v1/recalls/${id}`);
}

export function submitRecall(data: RecallSubmission) {
  return api.post<Recall>("/api/v1/recalls", data);
}

export function voteOnRecall(recallId: number, vote: "support" | "oppose") {
  return api.post<Recall>(`/api/v1/recalls/${recallId}/vote`, { vote });
}

export function approveRecall(recallId: number, note?: string) {
  return api.post<Recall>(`/api/v1/board/recalls/${recallId}/approve`, { note });
}

export function rejectRecall(recallId: number, reason: string) {
  return api.post<Recall>(`/api/v1/board/recalls/${recallId}/reject`, { reason });
}
