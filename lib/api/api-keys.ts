import { api } from "./client";
import type {
  ApiKey,
  CreateApiKeyData,
  CreateApiKeyResponse,
} from "./types";

/**
 * GET /api/v1/api-keys
 * Get all API keys for the current user
 * Backend returns: { data: ApiKey[] }
 * Note: The api client automatically unwraps { data: ... } responses
 */
export function getApiKeys() {
  return api.get<ApiKey[]>("/api/v1/api-keys");
}

/**
 * GET /api/v1/api-keys/{id}
 * Get a single API key by ID
 * Backend returns: { data: ApiKey }
 * Note: The api client automatically unwraps { data: ... } responses
 */
export function getApiKey(id: string) {
  return api.get<ApiKey>(`/api/v1/api-keys/${id}`);
}

/**
 * POST /api/v1/api-keys
 * Create a new API key
 * Note: The plain text key is only shown once in the response
 * Backend returns: { data: { id, name, key, last_four, scopes, expires_at, allowed_ips, message } }
 */
export function createApiKey(data: CreateApiKeyData) {
  return api.post<CreateApiKeyResponse>("/api/v1/api-keys", data);
}

/**
 * PATCH /api/v1/api-keys/{id}
 * Update an API key
 * Backend returns: { message: string, data: ApiKey }
 * Note: The api client automatically unwraps { data: ... } responses
 */
export function updateApiKey(
  id: string,
  data: { name?: string; scopes?: string[]; allowed_ips?: string[] }
) {
  return api.patch<ApiKey>(`/api/v1/api-keys/${id}`, data);
}

/**
 * DELETE /api/v1/api-keys/{id}
 * Delete an API key
 * Backend returns: { message: string }
 */
export function deleteApiKey(id: number) {
  return api.del<{ message: string }>(`/api/v1/api-keys/${id}`);
}
