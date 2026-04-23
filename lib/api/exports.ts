import { api } from "./client";
import type { ImportResult, ImportTemplate } from "./types";

const baseUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

export type ExportFormat = "json" | "csv" | "pdf";

export interface ExportFilters {
  domain_id?: number;
  status?: string;
  date_from?: string;
  date_to?: string;
}

function buildExportUrl(format: ExportFormat, filters?: ExportFilters): string {
  const params = new URLSearchParams({ format });
  if (filters) {
    if (filters.domain_id) params.set("domain_id", String(filters.domain_id));
    if (filters.status) params.set("status", filters.status);
    if (filters.date_from) params.set("date_from", filters.date_from);
    if (filters.date_to) params.set("date_to", filters.date_to);
  }
  return `${baseUrl}/api/v1/concepts/export?${params.toString()}`;
}

export function exportConcepts(format: ExportFormat, filters?: ExportFilters) {
  const url = buildExportUrl(format, filters);
  return api.download(url);
}

export function downloadExportUrl(format: ExportFormat, filters?: ExportFilters): string {
  return buildExportUrl(format, filters);
}

// Legacy helpers — kept for backward compat with existing page code
export function exportConceptsCSV(domainId?: number) {
  return exportConcepts("csv", domainId ? { domain_id: domainId } : undefined);
}

export function exportConceptsJSON(domainId?: number) {
  return exportConcepts("json", domainId ? { domain_id: domainId } : undefined);
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
  return `${baseUrl}/api/v1/import/template?format=${format}`;
}
