import { api } from "./client";
import type { AuditEvent, PaginatedResponse } from "./types";

interface AuditFilters {
  page?: number;
  user_id?: number;
  action?: string;
}

export function getAuditEvents(filters: AuditFilters = {}) {
  const params = new URLSearchParams();
  if (filters.page) params.set("page", String(filters.page));
  if (filters.user_id) params.set("user_id", String(filters.user_id));
  if (filters.action) params.set("action", filters.action);
  return api.get<PaginatedResponse<AuditEvent>>(`/api/v1/admin/audit-events?${params}`);
}

export function getAuditEvent(id: number) {
  return api.get<AuditEvent>(`/api/v1/admin/audit-events/${id}`);
}
