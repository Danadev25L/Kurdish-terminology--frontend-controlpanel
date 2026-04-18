import { api } from "./client";
import type { User, LoginResponse } from "./types";

export function login(email: string, password: string) {
  return api.post<LoginResponse>("/api/auth/login", { email, password });
}

export function logout() {
  return api.post("/api/auth/logout");
}

export function getMe() {
  return api.get<User>("/api/auth/me");
}
