import { useAuthStore } from "@/stores/auth-store";
import type { LoginResponse } from "./types";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000';

// ============================================
// ERROR CLASSES
// ============================================

export class ApiError extends Error {
  status: number;
  errors: Record<string, string[]>;

  constructor(status: number, message: string, errors: Record<string, string[]> = {}) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.errors = errors;
  }
}

/**
 * MFA Required Error (202)
 * Fortify returns 202 when user has 2FA enabled but hasn't provided code yet
 */
export class MfaRequiredError extends Error {
  requires_mfa = true;

  constructor() {
    super("Two-factor authentication code required");
    this.name = "MfaRequiredError";
  }
}

/**
 * Password Confirmation Required Error (423)
 * Fortify's password.confirm middleware returns 423 when password needs re-confirmation
 */
export class PasswordConfirmationRequiredError extends Error {
  requires_password_confirmation = true;

  constructor() {
    super("Password confirmation required");
    this.name = "PasswordConfirmationRequiredError";
  }
}

// ============================================
// TOKEN REFRESH
// ============================================

let isRefreshing = false;
let refreshSubscribers: Array<(token: string) => void> = [];

function subscribeTokenRefresh(cb: (token: string) => void) {
  refreshSubscribers.push(cb);
}

function onTokenRefreshed(token: string) {
  refreshSubscribers.forEach((cb) => cb(token));
  refreshSubscribers = [];
}

async function refreshAccessToken(): Promise<string | null> {
  const authStore = useAuthStore.getState();
  const refreshToken = authStore.refreshToken;

  if (!refreshToken) return null;

  try {
    const response = await fetch(`${API_URL}/api/v1/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({ refresh_token: refreshToken }),
    });

    if (!response.ok) return null;

    const data: LoginResponse = await response.json();
    authStore.setTokens(data.token, data.refresh_token ?? refreshToken);
    return data.token;
  } catch {
    return null;
  }
}

// ============================================
// PASSWORD CONFIRMATION
// ============================================

// Store pending request details for retry after password confirmation
interface PendingRequest {
  endpoint: string;
  options: RequestInit;
  resolve: (value: any) => void;
  reject: (reason: any) => void;
}

let pendingRequest: PendingRequest | null = null;

/**
 * Retry the pending request after password has been confirmed
 * This is called by the auth store after successful password confirmation
 */
export async function retryPendingRequestAfterPasswordConfirmation(password: string): Promise<void> {
  if (!pendingRequest) return;

  const { endpoint, options, resolve, reject } = pendingRequest;

  try {
    // First, send the password confirmation to the backend
    const confirmResponse = await fetch(`${API_URL}/api/v1/auth/confirm-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Bearer ${useAuthStore.getState().token}`,
      },
      body: JSON.stringify({ password }),
      credentials: 'include',
    });

    if (!confirmResponse.ok) {
      const errorData = await confirmResponse.json().catch(() => ({}));
      throw new Error(errorData.message || 'Password confirmation failed');
    }

    // Now retry the original request
    const result = await apiClient(endpoint, options);
    resolve(result);
  } catch (error) {
    reject(error);
  } finally {
    pendingRequest = null;
  }
}

/**
 * Cancel the pending password confirmation request
 */
export function cancelPendingPasswordConfirmation() {
  if (pendingRequest) {
    pendingRequest.reject(new PasswordConfirmationRequiredError());
    pendingRequest = null;
  }
}

// ============================================
// API CLIENT
// ============================================

async function apiClient<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const authStore = useAuthStore.getState();

  const headers: HeadersInit = {
    "Content-Type": "application/json",
    Accept: "application/json",
    ...((options.headers as Record<string, string>) ?? {}),
  };

  // Add Authorization header if we have a token
  if (authStore.token) {
    (headers as Record<string, string>)["Authorization"] = `Bearer ${authStore.token}`;
  }

  const url = endpoint.startsWith('http') ? endpoint : `${API_URL}${endpoint}`;
  const res = await fetch(url, {
    ...options,
    headers,
    credentials: 'include', // Include cookies for cross-origin requests
  });

  // 204 No Content
  if (res.status === 204) {
    return undefined as T;
  }

  // HTML response = auth error
  const contentType = res.headers.get('content-type') || '';
  if (contentType.includes('text/html')) {
    authStore.logout();
    if (typeof window !== "undefined") {
      window.location.href = "/login";
    }
    throw new ApiError(res.status, "Authentication required");
  }

  let data: unknown;
  try {
    data = await res.json();
  } catch {
    authStore.logout();
    if (typeof window !== "undefined") {
      window.location.href = "/login";
    }
    throw new ApiError(res.status, "Invalid response from server");
  }

  // Handle 202 Accepted = MFA Required (Fortify) - check BEFORE !res.ok
  if (res.status === 202) {
    const response = data as { requires_mfa?: boolean; message?: string };
    if (response.requires_mfa) {
      throw new MfaRequiredError();
    }
  }

  // Handle 423 Locked = Password Confirmation Required (Fortify)
  if (res.status === 423) {
    return new Promise<T>((resolve, reject) => {
      // Store the pending request for retry after password confirmation
      pendingRequest = { endpoint, options, resolve, reject };

      // Trigger the password confirmation modal by updating auth store state
      const store = useAuthStore as unknown as { setState: (partial: any) => void };
      store.setState({
        requiresPasswordConfirmation: true,
        pendingPasswordCallback: null,
      });
    });
  }

  if (!res.ok) {
    const response = data as { message?: string; errors?: Record<string, string[]> };

    // Build detailed error message
    let errorMessage = response.message ?? "An error occurred";

    // Add validation errors if present
    if (response.errors) {
      const errorMessages = Object.entries(response.errors)
        .map(([field, msgs]) => `${field}: ${msgs.join(', ')}`)
        .join('; ');
      errorMessage = errorMessages ? `${errorMessage}. ${errorMessages}` : errorMessage;
    }

    // 401 Unauthorized = try token refresh
    if (res.status === 401) {
      const isAuthEndpoint =
        endpoint.includes('/auth/login') ||
        endpoint.includes('/auth/refresh') ||
        endpoint.includes('/auth/logout') ||
        endpoint.includes('/auth/confirm-password') ||
        endpoint.includes('/auth/me');  // Don't redirect on hydration failure

      if (!isAuthEndpoint && authStore.refreshToken && !isRefreshing) {
        isRefreshing = true;

        try {
          const newToken = await refreshAccessToken();
          if (newToken) {
            isRefreshing = false;
            onTokenRefreshed(newToken);
            return apiClient<T>(endpoint, options);
          }
        } finally {
          isRefreshing = false;
        }
      }

      // Only redirect if not already on login page and not an auth endpoint
      const isAlreadyOnLoginPage = typeof window !== "undefined" && window.location.pathname === "/login";

      if (!isAuthEndpoint && !isAlreadyOnLoginPage) {
        authStore.logout();
        if (typeof window !== "undefined") {
          window.location.href = "/login";
        }
      }

      // For /auth/me endpoint (hydration) or when already on login page, just clear auth state
      if (isAuthEndpoint || isAlreadyOnLoginPage) {
        authStore.logout();
      }
    }

    throw new ApiError(
      res.status,
      errorMessage,
      response.errors ?? {}
    );
  }

  // Unwrap { data, meta } response wrapper
  // Laravel API resources typically return { data: ..., meta?: {...} }
  if (data && typeof data === "object" && "data" in data) {
    const wrapped = data as { data: unknown; meta?: { total?: number; current_page?: number; last_page?: number; per_page?: number } };
    // If it's a paginated response (has meta.total), return the full structure
    if (wrapped.meta?.total !== undefined) {
      return {
        data: wrapped.data,
        current_page: wrapped.meta.current_page,
        last_page: wrapped.meta.last_page,
        per_page: wrapped.meta.per_page,
        total: wrapped.meta.total,
      } as T;
    }
    // If it's a non-paginated response with { data: ... } wrapper, unwrap it
    return wrapped.data as T;
  }

  return data as T;
}

// ============================================
// API EXPORTS
// ============================================

export const api = {
  get: <T>(url: string) => apiClient<T>(url, { method: "GET" }),
  post: <T>(url: string, body?: unknown) =>
    apiClient<T>(url, { method: "POST", body: body ? JSON.stringify(body) : undefined }),
  put: <T>(url: string, body?: unknown) =>
    apiClient<T>(url, { method: "PUT", body: body ? JSON.stringify(body) : undefined }),
  patch: <T>(url: string, body?: unknown) =>
    apiClient<T>(url, { method: "PATCH", body: body ? JSON.stringify(body) : undefined }),
  del: <T>(url: string) => apiClient<T>(url, { method: "DELETE" }),
  upload: <T>(url: string, formData: FormData) =>
    apiClient<T>(url, { method: "POST", headers: {}, body: formData }),
  download: async (url: string): Promise<Blob> => {
    const authStore = useAuthStore.getState();
    const headers: HeadersInit = { Accept: "*/*" };

    // Add Authorization header if we have a token
    if (authStore.token) {
      (headers as Record<string, string>)["Authorization"] = `Bearer ${authStore.token}`;
    }

    const fullUrl = url.startsWith("http") ? url : `${API_URL}${url}`;
    const res = await fetch(fullUrl, {
      method: "GET",
      headers,
      credentials: 'include',
    });

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      const message = (body as { message?: string }).message ?? `Download failed (${res.status})`;
      throw new ApiError(res.status, message);
    }

    return res.blob();
  },
};
