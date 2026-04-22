import { api } from "./client";
import type { ReferenceSource, ReferenceEntry } from "./types";

export function getReferenceSources() {
  return api.get<ReferenceSource[]>("/api/v1/domains/reference-sources");
}

export function createReferenceSource(data: {
  name: string;
  type: "academic" | "dictionary" | "government" | "encyclopedia" | "journal" | "other";
  description?: string;
}) {
  return api.post<ReferenceSource>("/api/v1/domains/reference-sources", data);
}

/**
 * PATCH /api/v1/domains/reference-sources/{id}
 * Update reference source (domain-scoped endpoint)
 */
export function updateReferenceSource(
  id: number,
  data: { name?: string; type?: string; description?: string }
) {
  return api.patch<ReferenceSource>(`/api/v1/domains/reference-sources/${id}`, data);
}

/**
 * DELETE /api/v1/domains/reference-sources/{id}
 * Delete reference source (domain-scoped endpoint, Admin only)
 */
export function deleteReferenceSource(id: number) {
  return api.del(`/api/v1/domains/reference-sources/${id}`);
}

/**
 * PATCH /api/v1/reference-sources/{id}
 * Update reference source (global endpoint)
 */
export function updateReferenceSourceGlobal(
  id: number,
  data: { name?: string; type?: string; description?: string }
) {
  return api.patch<ReferenceSource>(`/api/v1/reference-sources/${id}`, data);
}

/**
 * DELETE /api/v1/reference-sources/{id}
 * Delete reference source (global endpoint, Admin only)
 */
export function deleteReferenceSourceGlobal(id: number) {
  return api.del(`/api/v1/reference-sources/${id}`);
}

export function importReferenceEntries(
  sourceId: number,
  file: File
) {
  const formData = new FormData();
  formData.append("source_id", String(sourceId));
  formData.append("file", file);
  return api.upload("/api/v1/reference-entries/import", formData);
}

export function getReferenceEntries(conceptId: number | string) {
  return api.get<ReferenceEntry[]>(
    `/api/v1/concepts/${conceptId}/reference-entries`
  );
}
