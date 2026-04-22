import { api } from "./client";
import type { Domain, DomainMember, DomainExpert, ReferenceSource } from "./types";

export function getDomains() {
  return api.get<Domain[]>("/api/v1/domains");
}

export function getDomain(id: number | string) {
  return api.get<Domain>(`/api/v1/domains/${id}`);
}

export function createDomain(data: {
  name: string;
  slug: string;
  description?: string;
  head_user_id?: number;
}) {
  return api.post<Domain>("/api/v1/domains", data);
}

export function updateDomain(
  id: number,
  data: Partial<{ name: string; slug: string; description: string; head_user_id: number }>
) {
  return api.patch<Domain>(`/api/v1/domains/${id}`, data);
}

export function deleteDomain(id: number | string) {
  return api.del(`/api/v1/domains/${id}`);
}

export function getDomainMembers(domainId: number | string) {
  return api.get<DomainMember[]>(`/api/v1/domains/${domainId}/members`);
}

export function addDomainMember(
  domainId: number,
  data: { user_id: number; role: "expert" | "observer" }
) {
  return api.post(`/api/v1/domains/${domainId}/members`, data);
}

export function updateDomainMember(
  domainId: number,
  userId: number,
  data: { role: "expert" | "observer" }
) {
  return api.patch(`/api/v1/domains/${domainId}/members/${userId}`, data);
}

export function removeDomainMember(domainId: number | string, userId: number) {
  return api.del(`/api/v1/domains/${domainId}/members/${userId}`);
}

export function getDomainExperts(domainId: number | string) {
  return api.get<DomainExpert[]>(`/api/v1/domains/${domainId}/experts`);
}

export function updateReferenceSource(
  id: number,
  data: { name?: string; type?: string; description?: string; url?: string }
) {
  return api.patch<ReferenceSource>(`/api/v1/domains/reference-sources/${id}`, data);
}

export function deleteReferenceSource(id: number) {
  return api.del(`/api/v1/domains/reference-sources/${id}`);
}
