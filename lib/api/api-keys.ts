import { api } from "./client";
import type {
  ApiKey,
  CreateApiKeyData,
  CreateApiKeyResponse,
} from "./types";

/**
 * GET /api/v1/api-keys
 * Get all API keys for the current user
 */
export function getApiKeys() {
  return api.get<ApiKey[]>("/api/v1/api-keys");
}

/**
 * GET /api/v1/api-keys/{id}
 * Get a single API key by ID
 */
export function getApiKey(id: number) {
  return api.get<ApiKey>(`/api/v1/api-keys/${id}`);
}

/**
 * POST /api/v1/api-keys
 * Create a new API key
 * Note: The plain text key is only shown once in the response
 */
export function createApiKey(data: CreateApiKeyData) {
  return api.post<CreateApiKeyResponse>("/api/v1/api-keys", data);
}

/**
 * PATCH /api/v1/api-keys/{id}
 * Update an API key
 */
export function updateApiKey(
  id: number,
  data: { name?: string; abilities?: string[]; is_active?: boolean }
) {
  return api.patch<ApiKey>(`/api/v1/api-keys/${id}`, data);
}

/**
 * DELETE /api/v1/api-keys/{id}
 * Delete an API key
 */
export function deleteApiKey(id: number) {
  return api.del<{ message: string }>(`/api/v1/api-keys/${id}`);
}
