import { api } from "./client";
import type { ExportOptions, ImportResult, ImportTemplate } from "./types";

export function exportConceptsCSV(domainId?: number) {
  const params = domainId ? `?domain_id=${domainId}` : "";
  return api.get<Blob>(`/api/v1/exports/concepts/csv${params}`);
}

export function exportConceptsJSON(domainId?: number) {
  const params = domainId ? `?domain_id=${domainId}` : "";
  return api.get<Blob>(`/api/v1/exports/concepts/json${params}`);
}

export function exportDomainCSV(domainId: number) {
  return api.get<Blob>(`/api/v1/exports/domains/${domainId}/csv`);
}

export function exportPublicTermsCSV() {
  return api.get<Blob>("/api/v1/exports/public-terms/csv");
}

export async function importConceptsCSV(file: File, domainId?: number): Promise<ImportResult> {
  const formData = new FormData();
  formData.append("file", file);
  if (domainId) {
    formData.append("domain_id", String(domainId));
  }

  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000"}/api/v1/imports/concepts/csv`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token") ?? ""}`,
      },
      body: formData,
    }
  );

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: "Import failed" }));
    throw new Error(error.message || "Import failed");
  }

  return response.json();
}

export async function importConceptsJSON(file: File, domainId?: number): Promise<ImportResult> {
  const formData = new FormData();
  formData.append("file", file);
  if (domainId) {
    formData.append("domain_id", String(domainId));
  }

  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000"}/api/v1/imports/concepts/json`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token") ?? ""}`,
      },
      body: formData,
    }
  );

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: "Import failed" }));
    throw new Error(error.message || "Import failed");
  }

  return response.json();
}

export function getImportTemplate(format: "csv" | "json" = "csv"): Promise<ImportTemplate> {
  return api.get<ImportTemplate>(`/api/v1/imports/template?format=${format}`);
}

export function downloadImportTemplateURL(format: "csv" | "json" = "csv"): string {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";
  return `${baseUrl}/api/v1/imports/template/download?format=${format}`;
}
