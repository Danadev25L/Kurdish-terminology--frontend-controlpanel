import { useAuthStore } from "@/stores/auth-store";
import type { LoginResponse } from "./types";

// API base URL from environment variable
// In production, use direct URL to backend
// In development with npm run dev, Next.js rewrites /api/* to backend
const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000';

// Track ongoing token refresh to prevent multiple simultaneous refresh attempts
let isRefreshing = false;
// Queue of requests to retry after token refresh
let refreshSubscribers: Array<(token: string) => void> = [];

function subscribeTokenRefresh(cb: (token: string) => void) {
  refreshSubscribers.push(cb);
}

function onTokenRefreshed(token: string) {
  refreshSubscribers.forEach((cb) => cb(token));
  refreshSubscribers = [];
}

export class ApiError extends Error {
  status: number;
  errors: Record<string, string[]>;

  constructor(
    status: number,
    message: string,
    errors: Record<string, string[]> = {}
  ) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.errors = errors;
  }
}

async function refreshAccessToken(): Promise<string | null> {
  const authStore = useAuthStore.getState();
  const refreshToken = authStore.refreshToken;

  if (!refreshToken) {
    return null;
  }

  try {
    const response = await fetch(`${API_URL}/api/v1/auth/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({ refresh_token: refreshToken }),
    });

    if (!response.ok) {
      return null;
    }

    const data: LoginResponse = await response.json();

    // Update auth store with new tokens
    authStore.setTokens(data.token, data.refresh_token ?? refreshToken);

    return data.token;
  } catch {
    return null;
  }
}

async function apiClient<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const authStore = useAuthStore.getState();
  let token = authStore.token;

  const headers: HeadersInit = {
    "Content-Type": "application/json",
    Accept: "application/json",
    ...((options.headers as Record<string, string>) ?? {}),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  // Build full URL - use API_URL + endpoint
  // Endpoint should be like /api/v1/auth/login
  const url = endpoint.startsWith('http') ? endpoint : `${API_URL}${endpoint}`;

  const res = await fetch(url, {
    ...options,
    headers,
  });

  if (res.status === 204) {
    return undefined as T;
  }

  // Check content type first - if HTML, it's an error page
  const contentType = res.headers.get('content-type') || '';
  if (contentType.includes('text/html')) {
    // HTML response means auth error - redirect to login
    authStore.logout();
    if (typeof window !== "undefined") {
      window.location.href = "/login";
    }
    throw new ApiError(res.status, "Authentication required");
  }

  // Try to parse JSON, handle errors
  let data;
  try {
    data = await res.json();
  } catch (e) {
    // Response is not JSON - likely an error page
    authStore.logout();
    if (typeof window !== "undefined") {
      window.location.href = "/login";
    }
    throw new ApiError(res.status, "Invalid response from server");
  }

  if (!res.ok) {
    // Handle 401 Unauthorized - attempt token refresh
    if (res.status === 401) {
      // Skip refresh for auth endpoints (login, refresh, etc)
      const isAuthEndpoint = endpoint.includes('/auth/login') ||
                            endpoint.includes('/auth/refresh') ||
                            endpoint.includes('/auth/logout');

      if (!isAuthEndpoint && authStore.refreshToken && !isRefreshing) {
        isRefreshing = true;

        try {
          const newToken = await refreshAccessToken();

          if (newToken) {
            isRefreshing = false;
            onTokenRefreshed(newToken);

            // Retry the original request with new token
            return apiClient<T>(endpoint, options);
          }
        } finally {
          isRefreshing = false;
        }
      }

      // If refresh failed or not possible, logout and redirect
      authStore.logout();
      if (typeof window !== "undefined") {
        window.location.href = "/login";
      }
    }

    throw new ApiError(
      res.status,
      data.message ?? "An error occurred",
      data.errors ?? {}
    );
  }

  // Unwrap backend's { data, meta?, ... } response wrapper
  if (data && typeof data === "object" && "data" in data) {
    if (data.meta && typeof data.meta.total === "number") {
      return {
        data: data.data,
        current_page: data.meta.current_page,
        last_page: data.meta.last_page,
        per_page: data.meta.per_page,
        total: data.meta.total,
      } as T;
    }
    return data.data as T;
  }

  return data as T;
}

export const api = {
  get: <T>(url: string) => apiClient<T>(url, { method: "GET" }),

  post: <T>(url: string, body?: unknown) =>
    apiClient<T>(url, {
      method: "POST",
      body: body ? JSON.stringify(body) : undefined,
    }),

  patch: <T>(url: string, body?: unknown) =>
    apiClient<T>(url, {
      method: "PATCH",
      body: body ? JSON.stringify(body) : undefined,
    }),

  del: <T>(url: string) => apiClient<T>(url, { method: "DELETE" }),

  upload: <T>(url: string, formData: FormData) =>
    apiClient<T>(url, {
      method: "POST",
      headers: {} as Record<string, string>, // remove Content-Type for FormData
      body: formData,
    }),

  download: async (url: string): Promise<Blob> => {
    const authStore = useAuthStore.getState();
    const token = authStore.token;

    const headers: HeadersInit = {
      Accept: "*/*",
    };
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const fullUrl = url.startsWith("http") ? url : `${API_URL}${url}`;
    const res = await fetch(fullUrl, { method: "GET", headers });

    if (!res.ok) {
      let message = `Download failed (${res.status})`;
      try {
        const body = await res.json();
        message = body.message ?? body.error ?? message;
      } catch { /* non-JSON error body */ }
      throw new ApiError(res.status, message);
    }

    return res.blob();
  },
};
