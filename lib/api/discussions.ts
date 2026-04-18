import { api } from "./client";
import type { Discussion } from "./types";

export function getDiscussions(conceptId: number | string) {
  return api.get<Discussion[]>(`/api/v1/concepts/${conceptId}/discussions`);
}

export function createDiscussion(
  conceptId: number,
  data: { body: string }
) {
  return api.post<Discussion>(`/api/v1/concepts/${conceptId}/discussions`, data);
}

export function replyToDiscussion(
  discussionId: number,
  data: { body: string; parent_id?: number }
) {
  return api.post<Discussion>(`/api/v1/discussions/${discussionId}/reply`, data);
}

export function addReaction(discussionId: number) {
  return api.post(`/api/v1/discussions/${discussionId}/react`);
}

export function deleteDiscussion(discussionId: number) {
  return api.del(`/api/v1/discussions/${discussionId}`);
}
