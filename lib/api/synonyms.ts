import { api } from "./client";
import type { LexiconSynonym } from "./types";

/**
 * Create a new synonym relationship
 * POST /api/v1/lexicons/synonyms
 */
export function createSynonym(data: {
  word_id: number;
  synonym_id: number;
  source_id?: number;
}) {
  return api.post<LexiconSynonym>("/api/v1/lexicons/synonyms", data);
}

/**
 * Delete a synonym relationship
 * DELETE /api/v1/lexicons/synonyms/{id}
 */
export function deleteSynonym(id: number) {
  return api.del(`/api/v1/lexicons/synonyms/${id}`);
}

/**
 * Get synonyms for a specific word
 * NOTE: This endpoint is not yet implemented in the backend.
 * Use the lexicon endpoint to get word details which may include synonyms.
 * @unimplemented
 */
export function getWordSynonyms(wordId: number | string) {
  // Backend does not have this endpoint yet
  return api.get<LexiconSynonym[]>(`/api/v1/lexicons/words/${wordId}/synonyms`);
}

/**
 * Add a synonym to a word
 * NOTE: This uses the same endpoint as createSynonym().
 * The word-specific endpoint is not yet implemented in the backend.
 * @unimplemented
 */
export function addSynonymToWord(wordId: number, synonymId: number, sourceId?: number) {
  // Backend does not have this word-specific endpoint
  // Use createSynonym() instead with word_id parameter
  return api.post<LexiconSynonym>(`/api/v1/lexicons/words/${wordId}/synonyms`, {
    synonym_id: synonymId,
    source_id: sourceId,
  });
}

/**
 * Remove a synonym from a word
 * NOTE: This endpoint is not yet implemented in the backend.
 * Use deleteSynonym() with the synonym relationship ID instead.
 * @unimplemented
 */
export function removeSynonymFromWord(wordId: number, synonymId: number) {
  // Backend does not have this word-specific endpoint
  // Use deleteSynonym() instead with the synonym ID
  return api.del(`/api/v1/lexicons/words/${wordId}/synonyms/${synonymId}`);
}
