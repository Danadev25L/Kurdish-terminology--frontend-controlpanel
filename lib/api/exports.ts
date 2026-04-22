import { api } from "./client";
import type { ExportOptions, ImportResult, ImportTemplate } from "./types";

export function exportConceptsCSV(domainId?: number) {
  const params = domainId ? `?domain_id=${domainId}` : "";
  return api.download(`/api/v1/exports/concepts/csv${params}`);
}

export function exportConceptsJSON(domainId?: number) {
  const params = domainId ? `?domain_id=${domainId}` : "";
  return api.download(`/api/v1/exports/concepts/json${params}`);
}

export function exportDomainCSV(domainId: number) {
  return api.download(`/api/v1/exports/domains/${domainId}/csv`);
}

export function exportPublicTermsCSV() {
  return api.download("/api/v1/exports/public-terms/csv");
}

export function importConceptsCSV(file: File, domainId?: number): Promise<ImportResult> {
  const formData = new FormData();
  formData.append("file", file);
  if (domainId) {
    formData.append("domain_id", String(domainId));
  }
  return api.upload<ImportResult>("/api/v1/import/concepts/csv", formData);
}

export function importConceptsJSON(file: File, domainId?: number): Promise<ImportResult> {
  const formData = new FormData();
  formData.append("file", file);
  if (domainId) {
    formData.append("domain_id", String(domainId));
  }
  return api.upload<ImportResult>("/api/v1/import/concepts/json", formData);
}

export function getImportTemplate(format: "csv" | "json" = "csv"): Promise<ImportTemplate> {
  return api.get<ImportTemplate>(`/api/v1/import/template?format=${format}`);
}

export function downloadImportTemplateURL(format: "csv" | "json" = "csv"): string {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";
  return `${baseUrl}/api/v1/import/template/download?format=${format}`;
}
