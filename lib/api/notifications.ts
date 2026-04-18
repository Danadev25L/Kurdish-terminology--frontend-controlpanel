import { api } from "./client";
import type { Notification } from "./types";

export function getNotifications() {
  return api.get<Notification[]>("/api/notifications");
}

export function markNotificationRead(id: number) {
  return api.patch(`/api/notifications/${id}/read`);
}
