import { api } from "./client";
import type { LexiconSynonym } from "./types";

export function createSynonym(data: {
  word_id: number;
  synonym_id: number;
  source_id?: number;
}) {
  return api.post<LexiconSynonym>("/api/v1/lexicons/synonyms", data);
}

export function deleteSynonym(id: number) {
  return api.del(`/api/v1/lexicons/synonyms/${id}`);
}

export function getWordSynonyms(wordId: number | string) {
  return api.get<LexiconSynonym[]>(`/api/v1/lexicons/words/${wordId}/synonyms`);
}

export function addSynonymToWord(wordId: number, synonymId: number, sourceId?: number) {
  return api.post<LexiconSynonym>(`/api/v1/lexicons/words/${wordId}/synonyms`, {
    synonym_id: synonymId,
    source_id: sourceId,
  });
}

export function removeSynonymFromWord(wordId: number, synonymId: number) {
  return api.del(`/api/v1/lexicons/words/${wordId}/synonyms/${synonymId}`);
}
