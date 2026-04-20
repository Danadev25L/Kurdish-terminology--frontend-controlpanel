import { api } from "./client";
import type { Errata, PublicErrataSubmission, PaginatedResponse } from "./types";

export function getErrataList(params?: { page?: number; status?: string }) {
  const searchParams = new URLSearchParams();
  if (params?.page) searchParams.set("page", String(params.page));
  if (params?.status) searchParams.set("status", params.status);
  const queryString = searchParams.toString();
  return api.get<PaginatedResponse<Errata>>(
    `/api/v1/errata${queryString ? `?${queryString}` : ""}`
  );
}

export function getErrata(id: number | string) {
  return api.get<Errata>(`/api/v1/errata/${id}`);
}

export function updateErrata(
  id: number,
  data: { status?: string; admin_notes?: string }
) {
  return api.patch<Errata>(`/api/v1/errata/${id}`, data);
}

export function resolveErrata(id: number, status: "resolved" | "rejected", notes?: string) {
  return api.post<Errata>(`/api/v1/errata/${id}/resolve`, {
    status,
    admin_notes: notes,
  });
}

export function submitPublicErrata(data: PublicErrataSubmission) {
  return api.post<Errata>("/api/v1/errata", {
    concept_id: data.concept_id,
    issue_description: data.issue_description,
    suggested_correction: data.suggested_correction,
    submitter_name: data.reporter_name,
    submitter_email: data.reporter_email,
  });
}

export function rejectErrata(id: number, reason: string) {
  return api.post<Errata>(`/api/v1/errata/${id}/resolve`, {
    status: "rejected",
    admin_notes: reason,
  });
}
