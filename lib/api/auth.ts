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

export function getProfile() {
  return api.get<User>("/api/v1/profile");
}

export function updateProfile(data: {
  name?: string;
  preferred_language?: string;
}) {
  return api.patch<User>("/api/v1/profile", data);
}

export function changePassword(data: {
  current_password: string;
  new_password: string;
  new_password_confirmation: string;
}) {
  return api.post("/api/v1/profile/change-password", data);
}

export function refreshToken(refreshToken: string) {
  return api.post<LoginResponse>("/api/v1/auth/refresh", { refresh_token: refreshToken });
}
