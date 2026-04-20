import { api } from "./client";

export interface HealthResponse {
  status: string;
  timestamp: string;
}

export function getHealth() {
  return api.get<HealthResponse>("/api/v1/health");
}
