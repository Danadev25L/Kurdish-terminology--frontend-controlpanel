import { api } from "./client";
import type { Domain, DomainMember, PaginatedResponse } from "./types";

export function getDomains() {
  return api.get<Domain[]>("/api/domains");
}

export function getDomain(id: number | string) {
  return api.get<Domain>(`/api/domains/${id}`);
}

export function createDomain(data: {
  name: string;
  slug: string;
  description?: string;
  head_user_id?: number;
}) {
  return api.post<Domain>("/api/domains", data);
}

export function updateDomain(
  id: number,
  data: Partial<{ name: string; slug: string; description: string; head_user_id: number }>
) {
  return api.patch<Domain>(`/api/domains/${id}`, data);
}

export function getDomainMembers(domainId: number | string) {
  return api.get<DomainMember[]>(`/api/domains/${domainId}/members`);
}

export function addDomainMember(
  domainId: number,
  data: { user_id: number; role: "expert" | "observer" }
) {
  return api.post(`/api/domains/${domainId}/members`, data);
}

export function updateDomainMember(
  domainId: number,
  userId: number,
  data: { role: "expert" | "observer" }
) {
  return api.patch(`/api/domains/${domainId}/members/${userId}`, data);
}
