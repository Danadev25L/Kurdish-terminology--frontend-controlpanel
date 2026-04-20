"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { api } from "@/lib/api/client";
import { ApiError } from "@/lib/api/client";

interface UseApiOptions {
  pollingInterval?: number;
  enabled?: boolean;
}

interface UseApiState<T> {
  data: T | null;
  error: string | null;
  isLoading: boolean;
  refetch: () => void;
}

export function useApi<T>(
  url: string | null,
  options: UseApiOptions = {}
): UseApiState<T> {
  const { pollingInterval, enabled = true } = options;
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const mountedRef = useRef(true);

  const fetchData = useCallback(
    async (showLoading = false) => {
      if (!url || !enabled) return;
      if (showLoading) setIsLoading(true);
      try {
        const result = await api.get<T>(url);
        if (mountedRef.current) {
          setData(result);
          setError(null);
        }
      } catch (err) {
        if (mountedRef.current) {
          if (err instanceof ApiError) {
            setError(err.message);
          } else {
            setError("An unexpected error occurred");
          }
        }
      } finally {
        if (mountedRef.current && showLoading) {
          setIsLoading(false);
        }
      }
    },
    [url, enabled]
  );

  const refetch = useCallback(() => {
    fetchData(true);
  }, [fetchData]);

  // Initial fetch + url changes
  useEffect(() => {
    mountedRef.current = true;
    if (!url || !enabled) return;
    setIsLoading(true);
    fetchData(true);
    return () => {
      mountedRef.current = false;
    };
  }, [url, enabled, fetchData]);

  // Polling
  useEffect(() => {
    if (!pollingInterval || !url || !enabled) return;

    intervalRef.current = setInterval(() => {
      if (document.visibilityState === "visible") {
        fetchData(false);
      }
    }, pollingInterval);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [pollingInterval, url, enabled, fetchData]);

  return { data, error, isLoading, refetch };
}
