import { useAuthStore } from "@/stores/auth-store";

// API base URL from environment variable
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

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

async function apiClient<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = useAuthStore.getState().token;

  const headers: HeadersInit = {
    "Content-Type": "application/json",
    Accept: "application/json",
    ...((options.headers as Record<string, string>) ?? {}),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  // Prepend API base URL to relative endpoints
  const url = endpoint.startsWith('http') ? endpoint : `${API_URL}${endpoint}`;

  const res = await fetch(url, {
    ...options,
    headers,
  });

  if (res.status === 204) {
    return undefined as T;
  }

  const data = await res.json();

  if (!res.ok) {
    if (res.status === 401) {
      useAuthStore.getState().logout();
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
};
