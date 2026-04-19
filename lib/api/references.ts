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
