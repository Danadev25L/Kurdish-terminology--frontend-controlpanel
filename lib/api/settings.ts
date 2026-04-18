import { api } from "./client";
import type { Setting } from "./types";

export function getSettings() {
  return api.get<Setting[]>("/api/settings");
}

export function updateSetting(data: { key: string; value: string }) {
  return api.patch<Setting>("/api/settings", data);
}
