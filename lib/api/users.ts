import { api } from "./client";
import type { User, PaginatedResponse } from "./types";

export function getUsers(params?: { page?: number }) {
  const searchParams = new URLSearchParams();
  if (params?.page) searchParams.set("page", String(params.page));
  return api.get<PaginatedResponse<User>>(`/api/v1/admin/users?${searchParams}`);
}

export function getUser(id: number) {
  return api.get<User>(`/api/v1/admin/users/${id}`);
}

export function createUser(data: {
  name: string;
  email: string;
  password: string;
}) {
  return api.post<User>("/api/v1/admin/users", data);
}

export function updateUser(
  id: number,
  data: { name?: string; email?: string; password?: string }
) {
  return api.patch<User>(`/api/v1/admin/users/${id}`, data);
}

export function deleteUser(id: number) {
  return api.del(`/api/v1/admin/users/${id}`);
}

export function assignRoles(userId: number, roles: string[]) {
  return api.post(`/api/v1/admin/users/${userId}/roles`, { roles });
}
