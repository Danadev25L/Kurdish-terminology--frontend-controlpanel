import { ApiError, api } from "./client";
import type { LexiconWord, PaginatedResponse } from "./types";

export function getLexicon(
  type: "english" | "kurdish",
  params?: { page?: number }
) {
  const searchParams = new URLSearchParams();
  if (params?.page) searchParams.set("page", String(params.page));
  return api.get<PaginatedResponse<LexiconWord>>(
    `/api/v1/lexicons/${type}?${searchParams}`
  );
}

export function createLexiconWord(
  type: "english" | "kurdish",
  data: { word: string; part_of_speech: string; etymology?: string; root_word?: string }
) {
  return api.post<LexiconWord>(`/api/v1/lexicons/${type}`, data);
}

export function updateLexiconWord(
  type: "english" | "kurdish",
  id: number,
  data: Partial<{ word: string; part_of_speech: string; etymology: string; root_word: string; dialect_tag: string }>
) {
  return api.patch<LexiconWord>(`/api/v1/lexicons/${type}/${id}`, data);
}

export function deleteLexiconWord(type: "english" | "kurdish", id: number) {
  return api.del(`/api/v1/lexicons/${type}/${id}`);
}
