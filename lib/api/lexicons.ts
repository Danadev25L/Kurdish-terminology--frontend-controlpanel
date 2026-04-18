import { api } from "./client";
import type { LexiconWord, PaginatedResponse } from "./types";

export function getLexicon(
  type: "english" | "kurdish",
  params?: { page?: number }
) {
  const searchParams = new URLSearchParams();
  if (params?.page) searchParams.set("page", String(params.page));
  return api.get<PaginatedResponse<LexiconWord>>(
    `/api/lexicons/${type}?${searchParams}`
  );
}

export function createLexiconWord(
  type: "english" | "kurdish",
  data: { word: string; part_of_speech: string; etymology?: string; root_word?: string }
) {
  return api.post<LexiconWord>(`/api/lexicons/${type}`, data);
}

export function updateLexiconWord(
  type: "english" | "kurdish",
  id: number,
  data: Partial<{ word: string; part_of_speech: string; etymology: string; root_word: string }>
) {
  return api.patch<LexiconWord>(`/api/lexicons/${type}/${id}`, data);
}

export function deleteLexiconWord(type: "english" | "kurdish", id: number) {
  return api.del(`/api/lexicons/${type}/${id}`);
}
