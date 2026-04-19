import { api } from "./client";
import type { Notification } from "./types";

export function getNotifications() {
  return api.get<Notification[]>("/api/v1/notifications");
}

export function markNotificationRead(id: number) {
  return api.patch(`/api/v1/notifications/${id}/read`);
}

export function markAllRead() {
  return api.patch("/api/v1/notifications/read-all");
}
