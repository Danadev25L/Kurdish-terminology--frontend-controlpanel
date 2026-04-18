import { api } from "./client";
import type { User, LoginResponse } from "./types";

export function login(email: string, password: string) {
  return api.post<LoginResponse>("/api/v1/auth/login", { email, password });
}

export function logout() {
  return api.post("/api/v1/auth/logout");
}

export function getMe() {
  return api.get<User>("/api/v1/auth/me");
}
