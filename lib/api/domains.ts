import { api } from "./client";
import type { Domain, DomainMember } from "./types";

export function getDomains() {
  return api.get<Domain[]>("/v1/domains");
}

export function getDomain(id: number | string) {
  return api.get<Domain>(`/v1/domains/${id}`);
}

export function createDomain(data: {
  name: string;
  slug: string;
  description?: string;
  head_user_id?: number;
}) {
  return api.post<Domain>("/v1/domains", data);
}

export function updateDomain(
  id: number,
  data: Partial<{ name: string; slug: string; description: string; head_user_id: number }>
) {
  return api.patch<Domain>(`/v1/domains/${id}`, data);
}

export function getDomainMembers(domainId: number | string) {
  return api.get<DomainMember[]>(`/v1/domains/${domainId}/members`);
}

export function addDomainMember(
  domainId: number,
  data: { user_id: number; role: "expert" | "observer" }
) {
  return api.post(`/v1/domains/${domainId}/members`, data);
}

export function updateDomainMember(
  domainId: number,
  userId: number,
  data: { role: "expert" | "observer" }
) {
  return api.patch(`/v1/domains/${domainId}/members/${userId}`, data);
}
