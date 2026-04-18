import { api } from "./client";
import type { ReferenceSource, ReferenceEntry } from "./types";

export function getReferenceSources() {
  return api.get<ReferenceSource[]>("/api/reference-sources");
}

export function createReferenceSource(data: {
  name: string;
  description?: string;
}) {
  return api.post<ReferenceSource>("/api/reference-sources", data);
}

export function importReferenceEntries(
  sourceId: number,
  file: File
) {
  const formData = new FormData();
  formData.append("source_id", String(sourceId));
  formData.append("file", file);
  return api.upload("/api/reference-entries/import", formData);
}

export function getReferenceEntries(conceptId: number | string) {
  return api.get<ReferenceEntry[]>(
    `/api/concepts/${conceptId}/reference-entries`
  );
}
