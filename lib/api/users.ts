import { api } from "./client";
import type { User, PaginatedResponse } from "./types";

export function getUsers(params?: { page?: number }) {
  const searchParams = new URLSearchParams();
  if (params?.page) searchParams.set("page", String(params.page));
  return api.get<PaginatedResponse<User>>(`/api/users?${searchParams}`);
}

export function getUser(id: number) {
  return api.get<User>(`/api/users/${id}`);
}

export function createUser(data: {
  name: string;
  email: string;
  password: string;
}) {
  return api.post<User>("/api/users", data);
}

export function updateUser(
  id: number,
  data: { name?: string; email?: string; password?: string }
) {
  return api.patch<User>(`/api/users/${id}`, data);
}

export function assignRoles(userId: number, roles: string[]) {
  return api.post(`/api/users/${userId}/roles`, { roles });
}
